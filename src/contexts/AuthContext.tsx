"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { newRequest } from "@/lib/utils"; // Interceptor configured here
import { message } from "antd";
// LoadingScreen removed as it's no longer used for initial load

interface AuthContextType {
  user: User | null;
  // setUser is no longer exposed
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store context instance outside to potentially access setUser from interceptor
let authContextSetUser: React.Dispatch<React.SetStateAction<User | null>> | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // hasInitialized state removed
  const router = useRouter();
  const pathname = usePathname();

  // Login API call
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await newRequest.post(API_ENDPOINTS.LOGIN, { email, password });
      const userData = response.data.user;
      if (!userData) throw new Error("Login response missing user data.");

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push("/dashboard");
      return userData;
    } catch (error: any) {
      console.error("Login failed:", error);
      localStorage.removeItem('user');
      setUser(null);
      throw new Error(error.response?.data?.message || "Invalid email or password");
    }
  };

  // Logout API call
  const logout = async () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    router.push("/login"); // Redirect immediately
    try {
      if (currentUser) {
           await newRequest.post(API_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  };

  // Initialize auth state on mount from localStorage ONLY
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let userFromStorage: User | null = null;

    if (storedUser) {
      try {
        userFromStorage = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('user'); // Clear invalid data
        console.error("Failed to parse stored user:", e);
      }
    }

    setUser(userFromStorage);

    // Redirect immediately if no user found and not on login page
    // This runs after the first render but before the browser paints (usually)
    if (!userFromStorage && pathname !== "/login") {
        router.push("/login");
    }
    // No need to track initialization separately anymore

  }, []); // Run only once on mount

   // Store the setUser function for the interceptor
   useEffect(() => {
    authContextSetUser = setUser;
    return () => { authContextSetUser = null; }; // Cleanup on unmount
  }, []); // Only needs to run once to capture setUser


  // --- Rendering Logic ---
  // Render children if user exists OR if on the login page. Otherwise render null.
  // Note: May render null briefly on initial load before useEffect redirects.
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {(user || pathname === "/login") ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Function to be called by the API interceptor on 401
export const handleUnauthorized = () => {
  message.error("Unauthorized access. Please log in.");
  localStorage.removeItem('user');
  if (authContextSetUser) {
      authContextSetUser(null); // Attempt to update state via stored setter
  }
  // Force reload redirect to login
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
  }
};

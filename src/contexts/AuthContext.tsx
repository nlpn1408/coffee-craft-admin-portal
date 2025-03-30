"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types/auth";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { newRequest } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Function to check authentication status (API call)
  const checkAuth = async () => {
    setIsLoading(true);
    console.log("Checking authentication status...");
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("User found in localStorage:", userData); 
        setUser(userData);
      } else {
        console.log("No user found. Checking API...");
        const response = await newRequest.get(API_ENDPOINTS.CHECK_AUTH);
        if (response.data) {
          const userData = response.data;
          console.log("User found:", userData);
          setUser(userData);
        } else {
          console.log("No user found.");
          setUser(null);
          if (pathname !== "/login") {
            console.log("Redirecting to /login");
            router.push("/login");
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem('user');
      if (pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
      console.log("Auth check finished. Loading:", false);
    }
  };

  // Login function (API call)
  const login = async (email: string, password: string): Promise<User> => {
    console.log("Attempting login with email:", email);
    try {
      const response = await newRequest.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      const userData = response.data.user;
      console.log("Login successful:", userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(
        error.response?.data?.message || "Invalid email or password"
      ); // Propagate error message
    }
  };

  // Logout function (API call)
  const logout = async () => {
    console.log("Logging out...");
    try {
      await newRequest.post(API_ENDPOINTS.LOGOUT);
      setUser(null);
      localStorage.removeItem('user');
      console.log("User logged out. Redirecting to /login");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle logout failure (e.g., show error message)
    }
  };

  // Check authentication status when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []); // Run only once on mount

  // Redirect logic based on auth state and current path
  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        console.log(
          "Effect redirect: Not logged in, not on login page. Redirecting."
        );
        router.push("/login");
      } else if (user && pathname === "/login") {
        console.log(
          "Effect redirect: Logged in, but on login page. Redirecting to dashboard."
        );
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {isLoading ? <LoadingScreen /> : children}
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

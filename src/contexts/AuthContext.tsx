"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, UserRole } from "@/types"; // Import UserRole enum
import { API_ENDPOINTS } from "@/lib/constants/api";
import { newRequest } from "@/lib/utils"; // Interceptor configured here
import { message } from "antd";
// LoadingScreen removed as it's no longer used for initial load

interface AuthContextType {
  user: User | null;
  // setUser is no longer exposed
  login: (email: string, password: string) => Promise<User | null>; // Return type might be null if login rejected
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
  const login = async (email: string, password: string): Promise<User | null> => { // Updated return type
    try {
      const response = await newRequest.post(API_ENDPOINTS.LOGIN, { email, password });
      const userData = response.data.user as User; // Assume response structure
      if (!userData) throw new Error("Login response missing user data.");

      // --- Role Check ---
      if (userData.role === UserRole.CUSTOMER) {
        message.error("Customers do not have permission to access the admin portal.");
        // Perform immediate logout actions without calling the async logout function
        setUser(null);
        localStorage.removeItem('user');
        router.push("/login"); // Redirect back to login
        // Optionally, you could throw a specific error here if needed elsewhere
        // throw new Error("Customer role not permitted.");
        return null; // Indicate login was rejected due to role
      }
      // --- End Role Check ---

      // Proceed for STAFF or ADMIN
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push("/dashboard"); // Or appropriate landing page
      return userData; // Return user data on successful login
    } catch (error: any) {
      console.error("Login failed:", error);
      // Ensure state is cleared on any login failure
      localStorage.removeItem('user');
      setUser(null);
      // Re-throw or handle specific errors
      if (error.message === "Customer role not permitted.") {
          // Already handled above, just prevent further processing
          return null;
      }
      throw new Error(error.response?.data?.message || "Invalid email or password");
    }
  };

  // Logout API call
  const logout = async () => {
    const currentUser = user; // Capture user before clearing state
    setUser(null);
    localStorage.removeItem('user');
    router.push("/login"); // Redirect immediately
    try {
      // Attempt to call backend logout only if a user was actually logged in
      if (currentUser) {
           await newRequest.post(API_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      // Log error but don't block UI logout/redirect
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
        // --- Role Check on Initial Load ---
        // Also check role when loading from storage
        if (userFromStorage?.role === UserRole.CUSTOMER) {
            message.error("Customers do not have permission to access the admin portal.");
            localStorage.removeItem('user'); // Clear invalid storage
            userFromStorage = null; // Don't set customer user
            // Redirect happens below if user is null and not on login
        }
        // --- End Role Check ---
      } catch (e) {
        localStorage.removeItem('user'); // Clear invalid data
        console.error("Failed to parse stored user:", e);
      }
    }

    setUser(userFromStorage);

    // Redirect immediately if no valid user found and not on login page
    if (!userFromStorage && pathname !== "/login") {
        router.push("/login");
    }

  }, []); // Run only once on mount

   // Store the setUser function for the interceptor
   useEffect(() => {
    authContextSetUser = setUser;
    return () => { authContextSetUser = null; }; // Cleanup on unmount
  }, []);


  // --- Rendering Logic ---
  // Render children if user exists (and is not CUSTOMER) OR if on the login page. Otherwise render null.
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
  message.error("Unauthorized access or session expired. Please log in again."); // Updated message
  localStorage.removeItem('user');
  if (authContextSetUser) {
      authContextSetUser(null); // Attempt to update state via stored setter
  }
  // Force reload redirect to login
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
  }
};

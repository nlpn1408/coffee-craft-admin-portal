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
  const [isLoading, setIsLoading] = useState(true); // Start loading until first checkAuth completes
  const router = useRouter();
  const pathname = usePathname();

  // Function to check authentication status (API call)
  const checkAuth = async () => {
    // Don't set isLoading true here if already checking on mount
    console.log("Checking authentication status...");
    try {
      const response = await newRequest.get(API_ENDPOINTS.CHECK_AUTH);
      if (response.data) {
        const userData = response.data;
        console.log("User found via checkAuth:", userData);
        setUser(userData);
      } else {
        console.log("No user found via checkAuth.");
        setUser(null);
        // Redirect only if not already on login page
        if (pathname !== "/login") {
          console.log("Redirecting to /login from checkAuth failure");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      // Redirect only if not already on login page
      if (pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      // Set loading false only after the *initial* check completes
      if (isLoading) {
        setIsLoading(false);
        console.log("Initial auth check finished. Loading:", false);
      }
    }
  };

  // Login function (API call)
  const login = async (email: string, password: string): Promise<User> => {
    console.log("Attempting login with email:", email);
    // Consider setting loading state during login attempt if needed
    // setIsLoading(true);
    try {
      const response = await newRequest.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      const userData = response.data.user; // Adjust if API response structure differs
      console.log("Login successful:", userData);
      setUser(userData);
      // Removed localStorage.setItem("user", JSON.stringify(userData));
      // Redirect to dashboard after successful login
      router.push("/dashboard");
      return userData;
    } catch (error: any) {
      console.error("Login failed:", error);
      // Optionally display error message to user
      // message.error(error.response?.data?.message || "Invalid email or password");
      throw new Error(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function (API call)
  const logout = async () => {
    console.log("Logging out...");
    try {
      await newRequest.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Still proceed with client-side logout even if API fails
    } finally {
      setUser(null);
      // Removed localStorage.removeItem("user");
      console.log("User logged out. Redirecting to /login");
      router.push("/login");
    }
  };

  // Check authentication status when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  // This effect might become redundant or need adjustment
  // as checkAuth handles redirection on initial load/failure.
  // Keep it for now to handle cases where state changes post-initial load.
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

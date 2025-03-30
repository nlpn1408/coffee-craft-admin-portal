"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StoreProvider from "@/lib/providers/StoreProvider";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth(); // Get auth state
  const pathname = usePathname(); // Get current path

  // Show loading indicator during initial auth check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading application...</div> {/* Replace with a proper spinner/skeleton if available */}
      </div>
    );
  }

  // Determine if the current page is the login page
  const isLoginPage = pathname === '/login';

  // If it's the login page, render children directly without the DashboardLayout
  // AuthProvider handles redirection if a logged-in user tries to access /login
  if (isLoginPage) {
    return <StoreProvider>{children}</StoreProvider>; // Keep StoreProvider if needed on login page, otherwise remove
  }

  // If authenticated and not on the login page, render the full dashboard layout
  // AuthProvider handles redirection if an unauthenticated user tries to access other pages
  if (user && !isLoginPage) {
    return (
      <StoreProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </StoreProvider>
    );
  }

  // Fallback case (e.g., user is null, not loading, and not on login page)
  // AuthContext should redirect, but render null or minimal content as a safeguard
  return null; // Or a minimal loading/error state
};

export default DashboardWrapper;

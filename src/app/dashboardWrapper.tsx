"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StoreProvider from "@/lib/providers/StoreProvider";
import { useAuth } from "@/contexts/AuthContext"; 
import LoadingScreen from "@/components/LoadingScreen"; // Keep for fallback

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  // isLoading is no longer provided by useAuth in the simplified version
  const { user } = useAuth();
  const pathname = usePathname(); // Get current path

  // AuthProvider handles the initial loading screen.
  // This component now only decides based on user and path.

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <StoreProvider>{children}</StoreProvider>;
  }

  if (user) {
    return (
      <StoreProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </StoreProvider>
    );
  }

  return null;
};

export default DashboardWrapper;

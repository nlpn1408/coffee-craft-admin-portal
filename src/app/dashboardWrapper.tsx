"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StoreProvider from "@/lib/providers/StoreProvider";

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;

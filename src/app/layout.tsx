import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css"; // Import Ant Design CSS reset
import DashboardWrapper from "./dashboardWrapper";
import { Toaster } from "@/components/ui/toaster"; // Keep toaster for now, might replace later
import { AuthProvider } from "@/contexts/AuthContext";
// import LoginPage from "./login/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardWrapper>
            {children}
            <Toaster />
          </DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";

import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default function DashboardProviders({
  children,
  defaultOpen,
  users,
  isAdmin,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
  users: any[];
  isAdmin: boolean;
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar users={users} isAdmin={isAdmin} />

          <main className="w-full">
            <Navbar />
            <div className="px-4">{children}</div>
          </main>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
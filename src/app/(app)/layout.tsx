"use client";

import React from "react";
import { LayoutProvider, useLayout } from "@/lib/layout-context";
import { Sidebar } from "@/components/app/sidebar";
import { cn } from "@/lib/utils";

function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <Sidebar />

      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          "lg:ml-60",
          sidebarCollapsed && "lg:ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <AppShell>{children}</AppShell>
    </LayoutProvider>
  );
}

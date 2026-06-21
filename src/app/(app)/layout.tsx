"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        sidebarCollapsed ? "ml-16" : "ml-60"
      )}>
        {children}
      </main>
    </div>
  );
}

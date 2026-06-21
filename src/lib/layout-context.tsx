"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => {},
  toggleMobileSidebar: () => {},
  closeMobileSidebar: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapsed,
        mobileSidebarOpen,
        toggleSidebar: () => setSidebarCollapsed((v) => !v),
        toggleMobileSidebar: () => setMobileSidebarOpen((v) => !v),
        closeMobileSidebar: () => setMobileSidebarOpen(false),
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);

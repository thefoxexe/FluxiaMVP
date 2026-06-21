"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, Users, FileText, CreditCard,
  CheckSquare, Calendar, Workflow, BarChart3, Settings,
  Sparkles, ChevronLeft, ChevronRight, X, Zap, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inbox", icon: Inbox, label: "Inbox IA", badge: 4 },
  { href: "/crm", icon: Users, label: "CRM" },
  { href: "/devis", icon: FileText, label: "Devis" },
  { href: "/factures", icon: CreditCard, label: "Factures" },
  { href: "/taches", icon: CheckSquare, label: "Tâches", badge: 3 },
  { href: "/calendrier", icon: Calendar, label: "Calendrier" },
  { href: "/automatisations", icon: Workflow, label: "Automatisations" },
  { href: "/rapports", icon: BarChart3, label: "Rapports" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, mobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useLayout();
  const collapsed = sidebarCollapsed;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-all duration-200",
        "hidden lg:flex",
        collapsed ? "lg:w-[56px]" : "lg:w-56",
        mobileSidebarOpen && "!flex w-64 lg:hidden shadow-2xl"
      )}
      style={{ display: mobileSidebarOpen ? "flex" : undefined }}
    >
      {/* Mobile close */}
      <button
        onClick={closeMobileSidebar}
        className="absolute top-3 right-3 lg:hidden text-muted-foreground hover:text-foreground p-1 rounded"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-3 border-b border-border shrink-0",
        collapsed ? "justify-center" : "gap-2.5"
      )}>
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-semibold tracking-tight">Fluxia</span>
            <div className="text-[10px] text-muted-foreground leading-none">AI Business OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-px overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors relative",
                isActive
                  ? "bg-violet-600/10 text-violet-300"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("shrink-0 w-4 h-4", isActive ? "text-violet-400" : "")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="min-w-[18px] h-4 rounded bg-violet-600 text-white text-[10px] font-medium flex items-center justify-center px-1">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-violet-600 text-white text-[8px] font-medium flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Assistant */}
      <div className="px-2 py-1.5 border-t border-border">
        <Link
          href="/assistant"
          onClick={closeMobileSidebar}
          title={collapsed ? "Assistant IA" : undefined}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors w-full",
            pathname === "/assistant"
              ? "bg-violet-600/10 text-violet-300"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Assistant IA</span>}
        </Link>
      </div>

      {/* Bottom */}
      <div className="px-2 py-2 space-y-px border-t border-border">
        <Link
          href="/parametres"
          onClick={closeMobileSidebar}
          title={collapsed ? "Paramètres" : undefined}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
            pathname === "/parametres"
              ? "bg-violet-600/10 text-violet-300"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </Link>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Déconnexion" : undefined}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 rounded-full bg-card border border-border items-center justify-center shadow hover:bg-secondary transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

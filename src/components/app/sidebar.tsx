"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, Inbox, Users, FileText, CreditCard,
  CheckSquare, Calendar, Workflow, BarChart3, Settings, Sparkles,
  ChevronLeft, ChevronRight, LogOut, User, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLayout } from "@/lib/layout-context";

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
  const { sidebarCollapsed, mobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useLayout();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-all duration-300",
        /* Desktop */
        "hidden lg:flex",
        collapsed ? "lg:w-[68px]" : "lg:w-60",
        /* Mobile: slides from left as overlay */
        mobileSidebarOpen && "!flex w-72 lg:hidden shadow-2xl"
      )}
      style={{ display: mobileSidebarOpen ? "flex" : undefined }}
    >
      {/* Mobile close button */}
      <button
        onClick={closeMobileSidebar}
        className="absolute top-4 right-4 lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border shrink-0 transition-all",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-base font-bold text-gradient">Fluxia</span>
            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">AI Business OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-violet-500/15 text-violet-300 shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-r-full" />
              )}
              <item.icon
                className={cn("shrink-0 transition-colors", isActive ? "text-violet-400" : "")}
                style={{ width: "1rem", height: "1rem" }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="min-w-[20px] h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant */}
      <div className="px-2 py-2 border-t border-border">
        <Link
          href="/assistant"
          onClick={closeMobileSidebar}
          title={collapsed ? "Assistant IA" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full",
            "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20",
            "text-violet-300 hover:from-violet-500/20 hover:to-indigo-500/20 hover:border-violet-400/40",
            pathname === "/assistant" && "from-violet-500/20 to-indigo-500/20 border-violet-400/40"
          )}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-violet-400" />
          {!collapsed && <span>Assistant IA</span>}
        </Link>
      </div>

      {/* Bottom */}
      <div className="px-2 py-2 space-y-0.5 border-t border-border">
        <Link
          href="/parametres"
          onClick={closeMobileSidebar}
          title={collapsed ? "Paramètres" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all",
            pathname === "/parametres" && "bg-violet-500/15 text-violet-300"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && "Paramètres"}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all",
              collapsed && "justify-center"
            )}>
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-indigo-600 text-white">JD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-xs font-semibold text-foreground truncate">Jean Dupont</div>
                  <div className="text-[10px] text-muted-foreground truncate">jean@entreprise.ch</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-card border border-border items-center justify-center shadow-md hover:bg-secondary transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

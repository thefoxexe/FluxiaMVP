"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, Inbox, Users, FileText, CreditCard,
  CheckSquare, Calendar, Workflow, BarChart3, Settings, Bot,
  ChevronLeft, ChevronRight, Bell, Search, LogOut, User,
  Sparkles, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-border shrink-0", collapsed ? "justify-center" : "gap-2")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-gradient">Fluxia</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-violet-400" : "")} style={{ width: "1.125rem", height: "1.125rem" }} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
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
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-400 rounded-r" />}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant Shortcut */}
      <div className="px-2 py-2 border-t border-border">
        <Link
          href="/assistant"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
            "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-300 hover:from-violet-500/20 hover:to-indigo-500/20"
          )}
          title={collapsed ? "Assistant IA" : undefined}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-violet-400" />
          {!collapsed && <span>Assistant IA</span>}
        </Link>
      </div>

      {/* Bottom */}
      <div className="px-2 py-2 space-y-1 border-t border-border">
        <Link
          href="/parametres"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          )}
          title={collapsed ? "Paramètres" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && "Paramètres"}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
              collapsed && "justify-center"
            )}>
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-[10px]">JD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-xs font-medium text-foreground truncate">Jean Dupont</div>
                  <div className="text-[10px] text-muted-foreground truncate">jean@entreprise.ch</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-48">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
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
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-secondary transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

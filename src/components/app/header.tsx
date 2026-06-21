"use client";

import React, { useState } from "react";
import { Search, Bell, Plus, Zap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const NOTIFICATIONS = [
  { id: 1, type: "email", message: "Nouveau prospect : Marc Dupont (toiture 120m²)", time: "Il y a 5 min", unread: true },
  { id: 2, type: "invoice", message: "Facture FAC-2024-004 en retard – Marc Dupont", time: "Il y a 2h", unread: true },
  { id: 3, type: "quote", message: "Devis DEV-2024-002 consulté par Sophie Martin", time: "Il y a 3h", unread: true },
  { id: 4, type: "payment", message: "Paiement reçu – Antoine Leroy (CHF 19'458)", time: "Il y a 4h", unread: false },
];

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { toggleMobileSidebar } = useLayout();
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={toggleMobileSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-base lg:text-lg font-semibold leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 lg:gap-2">
        {/* Search */}
        <div className={cn("relative transition-all duration-300", searchOpen ? "w-64" : "w-auto")}>
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Rechercher..."
                className="pl-9 h-9 w-64"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="purple" className="text-[10px]">{unreadCount} nouvelles</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex items-start gap-3 py-3">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  n.unread ? "bg-violet-400" : "bg-transparent"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-violet-400">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Action */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="gradient" size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Créer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Zap className="w-4 h-4 text-violet-400" />
              Devis avec IA
            </DropdownMenuItem>
            <DropdownMenuItem>Devis manuel</DropdownMenuItem>
            <DropdownMenuItem>Facture</DropdownMenuItem>
            <DropdownMenuItem>Contact</DropdownMenuItem>
            <DropdownMenuItem>Tâche</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

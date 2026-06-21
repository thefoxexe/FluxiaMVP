"use client";

import React, { useState } from "react";
import { Search, Bell, Plus, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLayout } from "@/lib/layout-context";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const NOTIFICATIONS = [
  { id: 1, message: "Nouveau prospect : Marc Dupont (toiture 120m²)", time: "5 min", unread: true },
  { id: 2, message: "Facture FAC-2024-004 en retard de 14 jours", time: "2h", unread: true },
  { id: 3, message: "Devis DEV-2024-002 consulté par Sophie Martin", time: "3h", unread: true },
  { id: 4, message: "Paiement reçu – Antoine Leroy (CHF 19'458)", time: "4h", unread: false },
];

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { toggleMobileSidebar } = useLayout();
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-5 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileSidebar}>
          <Menu className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Search */}
        {searchOpen ? (
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Rechercher..."
              className="pl-8 h-8 w-52 text-xs"
              onBlur={() => setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)} className="absolute right-2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="w-4 h-4" />
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between text-xs">
              Notifications
              <span className="text-[10px] text-muted-foreground font-normal">{unreadCount} nouvelles</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex items-start gap-2.5 py-2.5">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", n.unread ? "bg-violet-500" : "bg-transparent border border-border")} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Il y a {n.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-violet-400">
              Toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Nouveau</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Créer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              Devis avec IA
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Devis manuel</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Facture</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Contact</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Tâche</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

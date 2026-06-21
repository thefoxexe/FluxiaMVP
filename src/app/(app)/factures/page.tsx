"use client";

import React, { useState } from "react";
import {
  Plus, Search, Download, Send, CheckCircle, Clock, AlertTriangle,
  XCircle, MoreHorizontal, CreditCard, TrendingUp, ArrowUpRight,
  Eye, Trash2, RefreshCw, QrCode, FileText
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { mockInvoices } from "@/lib/mock-data";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  brouillon: <FileText className="w-3.5 h-3.5" />,
  envoyé: <Send className="w-3.5 h-3.5" />,
  payée: <CheckCircle className="w-3.5 h-3.5" />,
  "en attente": <Clock className="w-3.5 h-3.5" />,
  en_retard: <AlertTriangle className="w-3.5 h-3.5" />,
  annulée: <XCircle className="w-3.5 h-3.5" />,
};

export default function FacturesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  const totalPaid = mockInvoices.filter((i) => i.status === "payée").reduce((s, i) => s + i.total, 0);
  const totalPending = mockInvoices.filter((i) => ["envoyé", "en attente"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const totalOverdue = mockInvoices.filter((i) => i.status === "en_retard").reduce((s, i) => s + i.total, 0);

  const filtered = mockInvoices.filter((inv) => {
    const matchesSearch = !search ||
      inv.contactName.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "tous" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["tous", "brouillon", "envoyé", "payée", "en attente", "en_retard", "annulée"];

  return (
    <div>
      <Header title="Factures" subtitle="Émettez des factures professionnelles et suivez vos paiements" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4.5 h-4.5 text-green-400" style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div className="text-xs text-muted-foreground">Payées</div>
              </div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(totalPaid)}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockInvoices.filter((i) => i.status === "payée").length} factures</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-yellow-400" style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div className="text-xs text-muted-foreground">En attente</div>
              </div>
              <div className="text-xl font-bold text-yellow-400">{formatCurrency(totalPending)}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockInvoices.filter((i) => ["envoyé", "en attente"].includes(i.status)).length} factures</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-400" style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div className="text-xs text-muted-foreground">En retard</div>
              </div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(totalOverdue)}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockInvoices.filter((i) => i.status === "en_retard").length} factures</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-violet-400" style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div className="text-xs text-muted-foreground">Total émises</div>
              </div>
              <div className="text-xl font-bold">{formatCurrency(mockInvoices.reduce((s, i) => s + i.total, 0))}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockInvoices.length} factures au total</div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for overdue */}
        {totalOverdue > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-300">
                {mockInvoices.filter((i) => i.status === "en_retard").length} facture(s) en retard
              </div>
              <div className="text-xs text-red-400/70">
                Montant total : {formatCurrency(totalOverdue)} — Relances automatiques IA activées
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Relancer tout
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="gradient" size="sm" className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle</span>
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize whitespace-nowrap shrink-0",
                  statusFilter === s
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "tous" ? "Toutes" : s === "en_retard" ? "En retard" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-secondary/30 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Numéro</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Client</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Montant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Échéance</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Émise le</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group">
                  <td className="py-3.5 px-4">
                    <div className="text-sm font-medium text-violet-400">{invoice.number}</div>
                    {invoice.quoteId && (
                      <div className="text-[10px] text-muted-foreground">Depuis devis</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-[10px]">{getInitials(invoice.contactName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{invoice.contactName}</div>
                        <div className="text-xs text-muted-foreground">{invoice.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 font-medium w-fit",
                      getStatusColor(invoice.status)
                    )}>
                      {STATUS_ICONS[invoice.status]}
                      {invoice.status === "en_retard" ? "en retard" : invoice.status}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-sm font-semibold">{formatCurrency(invoice.total)}</div>
                    {invoice.taxRate > 0 && (
                      <div className="text-[10px] text-muted-foreground">TVA {invoice.taxRate}%</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "text-xs",
                      invoice.status === "en_retard" ? "text-red-400 font-medium" : "text-muted-foreground"
                    )}>
                      {formatDate(invoice.dueDate)}
                      {invoice.status === "en_retard" && (
                        <span className="block text-[10px] text-red-400">
                          {Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / 86400000)}j de retard
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</span>
                    {invoice.paidAt && (
                      <div className="text-[10px] text-green-400">Payée le {formatDate(invoice.paidAt)}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4" />Voir la facture</DropdownMenuItem>
                        <DropdownMenuItem><Send className="w-4 h-4" />Envoyer par email</DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-4 h-4" />Télécharger PDF</DropdownMenuItem>
                        <DropdownMenuItem><QrCode className="w-4 h-4" />QR-Facture</DropdownMenuItem>
                        {invoice.status !== "payée" && (
                          <DropdownMenuItem><CheckCircle className="w-4 h-4" />Marquer payée</DropdownMenuItem>
                        )}
                        {invoice.status === "en_retard" && (
                          <DropdownMenuItem><RefreshCw className="w-4 h-4" />Envoyer relance</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

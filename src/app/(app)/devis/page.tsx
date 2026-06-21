"use client";

import React, { useState } from "react";
import {
  Plus, Search, Filter, MoreHorizontal, Eye, Send, Download,
  Copy, Trash2, FileText, CheckCircle, XCircle, Clock, Zap,
  TrendingUp, ChevronRight, Edit
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { mockQuotes } from "@/lib/mock-data";
import type { Quote } from "@/lib/types";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  brouillon: <Edit className="w-3.5 h-3.5" />,
  envoyé: <Send className="w-3.5 h-3.5" />,
  consulté: <Eye className="w-3.5 h-3.5" />,
  accepté: <CheckCircle className="w-3.5 h-3.5" />,
  refusé: <XCircle className="w-3.5 h-3.5" />,
  expiré: <Clock className="w-3.5 h-3.5" />,
};

const STATS = [
  {
    label: "Total devis",
    value: mockQuotes.length,
    sub: "ce mois",
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Montant total",
    value: formatCurrency(mockQuotes.reduce((s, q) => s + q.total, 0)),
    sub: "en cours",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    label: "En attente",
    value: mockQuotes.filter((q) => ["envoyé", "consulté"].includes(q.status)).length,
    sub: `${formatCurrency(mockQuotes.filter((q) => ["envoyé", "consulté"].includes(q.status)).reduce((s, q) => s + q.total, 0))}`,
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    label: "Taux d'acceptation",
    value: `${Math.round((mockQuotes.filter((q) => q.status === "accepté").length / mockQuotes.length) * 100)}%`,
    sub: `${mockQuotes.filter((q) => q.status === "accepté").length} acceptés`,
    icon: CheckCircle,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

export default function DevisPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const filtered = mockQuotes.filter((q) => {
    const matchesSearch = !search ||
      q.contactName.toLowerCase().includes(search.toLowerCase()) ||
      q.number.toLowerCase().includes(search.toLowerCase()) ||
      q.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "tous" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["tous", "brouillon", "envoyé", "consulté", "accepté", "refusé", "expiré"];

  return (
    <div>
      <Header title="Devis" subtitle="Créez, envoyez et suivez vos propositions commerciales" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                  <stat.icon className={cn("w-4.5 h-4.5", stat.color)} style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground/60">{stat.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un devis..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                    statusFilter === s
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === "tous" ? "Tous" : s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              Devis IA
            </Button>
            <Button variant="gradient" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/30 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Numéro</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Client</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Montant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Valide jusqu'au</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Créé le</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedQuote(quote)}
                >
                  <td className="py-3.5 px-4">
                    <div className="text-sm font-medium text-violet-400">{quote.number}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-[10px]">{getInitials(quote.contactName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{quote.contactName}</div>
                        <div className="text-xs text-muted-foreground">{quote.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className={cn("flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 font-medium w-fit", getStatusColor(quote.status))}>
                      {STATUS_ICONS[quote.status]}
                      {quote.status}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-sm font-semibold">{formatCurrency(quote.total)}</div>
                    <div className="text-[10px] text-muted-foreground">TVA {quote.taxRate}% incl.</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn("text-xs", new Date(quote.validUntil) < new Date() ? "text-red-400" : "text-muted-foreground")}>
                      {formatDate(quote.validUntil)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-muted-foreground">{formatDate(quote.createdAt)}</span>
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4" />Voir le devis</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4" />Modifier</DropdownMenuItem>
                        <DropdownMenuItem><Send className="w-4 h-4" />Envoyer par email</DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-4 h-4" />Télécharger PDF</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="w-4 h-4" />Dupliquer</DropdownMenuItem>
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

      {/* Quote Detail */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{selectedQuote.number}</div>
                  <h2 className="text-xl font-bold">{selectedQuote.contactName}</h2>
                  <div className="text-sm text-muted-foreground">{selectedQuote.company}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 font-medium", getStatusColor(selectedQuote.status))}>
                    {STATUS_ICONS[selectedQuote.status]}
                    {selectedQuote.status}
                  </div>
                  <button onClick={() => setSelectedQuote(null)} className="text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <div className="text-sm font-medium mb-3">Prestations</div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-muted-foreground">Description</th>
                        <th className="text-center py-2 px-3 text-xs text-muted-foreground">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">P.U.</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedQuote.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 text-sm">{item.description}</td>
                          <td className="py-3 px-3 text-center text-sm text-muted-foreground">{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-sm text-muted-foreground">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 px-3 text-right text-sm font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-secondary/20">
                      <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">Sous-total</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedQuote.subtotal)}</td></tr>
                      <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">TVA {selectedQuote.taxRate}%</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedQuote.tax)}</td></tr>
                      <tr><td colSpan={3} className="py-2.5 px-3 text-sm font-bold">Total TTC</td><td className="py-2.5 px-3 text-right text-base font-bold text-violet-400">{formatCurrency(selectedQuote.total)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <div className="text-sm font-medium mb-2">Notes</div>
                  <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">{selectedQuote.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Créé le : </span>{formatDate(selectedQuote.createdAt)}</div>
                {selectedQuote.sentAt && <div><span className="text-muted-foreground">Envoyé le : </span>{formatDate(selectedQuote.sentAt)}</div>}
                {selectedQuote.viewedAt && <div><span className="text-muted-foreground">Consulté le : </span>{formatDate(selectedQuote.viewedAt)}</div>}
                <div><span className="text-muted-foreground">Valide jusqu'au : </span><span className={new Date(selectedQuote.validUntil) < new Date() ? "text-red-400" : ""}>{formatDate(selectedQuote.validUntil)}</span></div>
              </div>

              <div className="flex gap-3">
                <Button variant="gradient" className="flex-1 gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer par email
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

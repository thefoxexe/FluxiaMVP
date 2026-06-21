"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Plus, Search, Eye, Send, Download, Trash2, FileText,
  CheckCircle, XCircle, Clock, Zap, TrendingUp, Edit, X
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { deleteQuote, updateQuoteStatus } from "@/actions/quotes";
import type { Quote } from "@/lib/supabase/types";

type QuoteWithItems = Quote & { quote_items: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }> };

const STATUS_COLORS: Record<string, string> = {
  brouillon: "text-muted-foreground bg-secondary border-border",
  envoyé: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  consulté: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  accepté: "text-green-400 bg-green-500/10 border-green-500/20",
  refusé: "text-red-400 bg-red-500/10 border-red-500/20",
  expiré: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("fr-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-CH", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DevisPage() {
  const [quotes, setQuotes] = useState<QuoteWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithItems | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("quotes").select("*, quote_items(*)").order("created_at", { ascending: false }).then(({ data }) => {
      setQuotes((data ?? []) as QuoteWithItems[]);
      setLoading(false);
    });
  }, []);

  const filtered = quotes.filter((q) => {
    const matchSearch = !search || q.number.toLowerCase().includes(search.toLowerCase()) || (q.title ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "tous" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuote(null);
    startTransition(async () => { await deleteQuote(id); });
  };

  const handleStatus = (id: string, status: Quote["status"]) => {
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    startTransition(async () => { await updateQuoteStatus(id, status); });
  };

  const pending = quotes.filter((q) => ["envoyé", "consulté"].includes(q.status));
  const accepted = quotes.filter((q) => q.status === "accepté");
  const rate = quotes.length > 0 ? Math.round((accepted.length / quotes.length) * 100) : 0;

  return (
    <div>
      <Header title="Devis" subtitle="Créez, envoyez et suivez vos propositions commerciales" />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total devis", value: quotes.length, icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Montant total", value: formatCurrency(quotes.reduce((s, q) => s + q.total, 0)), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "En attente", value: pending.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Taux d'acceptation", value: `${rate}%`, icon: CheckCircle, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border border-border bg-card flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher un devis..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline text-xs">Devis IA</span>
            </Button>
            <Button size="sm" className="gap-1.5 h-9 shrink-0">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Nouveau</span>
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {["tous", "brouillon", "envoyé", "consulté", "accepté", "refusé", "expiré"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap shrink-0", statusFilter === s ? "bg-violet-600/15 text-violet-400 border border-violet-600/20" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                {s === "tous" ? "Tous" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg border border-border bg-secondary/20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? "Aucun devis trouvé" : "Aucun devis pour l'instant"}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Numéro</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Titre</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Montant</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Valide jusqu'au</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Créé le</th>
                    <th className="py-2.5 px-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((quote) => (
                    <tr key={quote.id} className="hover:bg-secondary/20 transition-colors cursor-pointer group" onClick={() => setSelectedQuote(quote)}>
                      <td className="py-3 px-4 text-sm font-medium text-violet-400">{quote.number}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{quote.title ?? "—"}</td>
                      <td className="py-3 px-4">
                        <span className={cn("text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_COLORS[quote.status])}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold">{formatCurrency(quote.total)}</div>
                        <div className="text-[10px] text-muted-foreground">TVA {quote.tax_rate}%</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("text-xs", quote.valid_until && new Date(quote.valid_until) < new Date() ? "text-red-400" : "text-muted-foreground")}>
                          {formatDate(quote.valid_until)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(quote.created_at)}</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                              <span className="w-3.5 h-3.5 flex flex-col gap-0.5 items-center justify-center">
                                <span className="w-0.5 h-0.5 rounded-full bg-current" />
                                <span className="w-0.5 h-0.5 rounded-full bg-current" />
                                <span className="w-0.5 h-0.5 rounded-full bg-current" />
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem className="text-xs" onClick={() => setSelectedQuote(quote)}><Eye className="w-3.5 h-3.5" />Voir</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onClick={() => handleStatus(quote.id, "envoyé")}><Send className="w-3.5 h-3.5" />Marquer envoyé</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onClick={() => handleStatus(quote.id, "accepté")}><CheckCircle className="w-3.5 h-3.5" />Marquer accepté</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-red-400 focus:text-red-400" onClick={() => handleDelete(quote.id)}><Trash2 className="w-3.5 h-3.5" />Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQuote(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{selectedQuote.number}</div>
                <h2 className="font-semibold">{selectedQuote.title ?? "Devis sans titre"}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_COLORS[selectedQuote.status])}>
                  {selectedQuote.status}
                </span>
                <button onClick={() => setSelectedQuote(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {selectedQuote.quote_items.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2.5">Prestations</div>
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
                        {selectedQuote.quote_items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3 text-sm">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-sm text-muted-foreground">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-sm text-muted-foreground">{formatCurrency(item.unit_price)}</td>
                            <td className="py-2.5 px-3 text-right text-sm font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-secondary/20">
                        <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">Sous-total</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedQuote.subtotal)}</td></tr>
                        <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">TVA {selectedQuote.tax_rate}%</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedQuote.tax_amount)}</td></tr>
                        <tr><td colSpan={3} className="py-2.5 px-3 text-sm font-bold">Total TTC</td><td className="py-2.5 px-3 text-right text-base font-bold text-violet-400">{formatCurrency(selectedQuote.total)}</td></tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {selectedQuote.notes && (
                <div>
                  <div className="text-xs font-medium mb-2">Notes</div>
                  <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">{selectedQuote.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Créé le : <span className="text-foreground">{formatDate(selectedQuote.created_at)}</span></div>
                {selectedQuote.sent_at && <div>Envoyé le : <span className="text-foreground">{formatDate(selectedQuote.sent_at)}</span></div>}
                {selectedQuote.valid_until && <div>Valide jusqu'au : <span className={new Date(selectedQuote.valid_until) < new Date() ? "text-red-400" : "text-foreground"}>{formatDate(selectedQuote.valid_until)}</span></div>}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1 h-9 gap-2 text-sm">
                  <Send className="w-3.5 h-3.5" /> Envoyer
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <Download className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(selectedQuote.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

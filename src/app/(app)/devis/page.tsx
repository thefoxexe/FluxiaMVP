"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Plus, Search, Eye, Send, Download, Trash2, FileText,
  CheckCircle, Clock, Zap, TrendingUp, X, Sparkles, Loader2
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
import { createQuote, deleteQuote, updateQuoteStatus } from "@/actions/quotes";
import type { Quote, Contact } from "@/lib/supabase/types";

type QuoteWithItems = Quote & { quote_items: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }> };

const STATUS_COLORS: Record<string, string> = {
  brouillon: "text-muted-foreground bg-secondary border-border",
  envoyé: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
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

type LineItem = { description: string; quantity: number; unit_price: number };
const EMPTY_ITEM: LineItem = { description: "", quantity: 1, unit_price: 0 };

export default function DevisPage() {
  const [quotes, setQuotes] = useState<QuoteWithItems[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithItems | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ contact_id: "", title: "", valid_until: "", tax_rate: 8.1, notes: "" });
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("quotes").select("*, quote_items(*)").order("created_at", { ascending: false }),
      supabase.from("contacts").select("id, name, company").order("name"),
    ]).then(([qRes, cRes]) => {
      setQuotes((qRes.data ?? []) as QuoteWithItems[]);
      setContacts((cRes.data ?? []) as Contact[]);
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = (subtotal * form.tax_rate) / 100;
  const total = subtotal + taxAmount;

  const handleCreate = async () => {
    if (items.every(i => !i.description)) return;
    setCreating(true);
    const res = await createQuote({
      contact_id: form.contact_id || undefined,
      title: form.title || undefined,
      valid_until: form.valid_until || undefined,
      tax_rate: form.tax_rate,
      notes: form.notes || undefined,
      items: items.filter(i => i.description),
    });
    if (res.data) {
      const newQ = { ...res.data, quote_items: items.filter(i => i.description).map((it, idx) => ({
        id: `tmp-${idx}`, description: it.description, quantity: it.quantity,
        unit_price: it.unit_price, total: it.quantity * it.unit_price,
      })) } as QuoteWithItems;
      setQuotes(prev => [newQ, ...prev]);
      setShowCreate(false);
      setForm({ contact_id: "", title: "", valid_until: "", tax_rate: 8.1, notes: "" });
      setItems([{ ...EMPTY_ITEM }]);
    }
    setCreating(false);
  };

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const contact = contacts.find(c => c.id === form.contact_id);
    const res = await fetch("/api/ai/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: aiPrompt, contact_name: contact?.name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) setForm(f => ({ ...f, title: data.title }));
      if (data.items?.length) setItems(data.items.map((it: LineItem) => ({ description: it.description, quantity: it.quantity, unit_price: it.unit_price })));
      if (data.notes) setForm(f => ({ ...f, notes: data.notes }));
      setShowAI(false);
      setShowCreate(true);
    }
    setAiLoading(false);
  };

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
            { label: "Total devis", value: quotes.length, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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
            <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => setShowAI(true)}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Devis IA</span>
            </Button>
            <Button size="sm" className="gap-1.5 h-9 shrink-0" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Nouveau</span>
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {["tous", "brouillon", "envoyé", "consulté", "accepté", "refusé", "expiré"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap shrink-0", statusFilter === s ? "bg-emerald-600/15 text-emerald-400 border border-emerald-600/20" : "bg-secondary text-muted-foreground hover:text-foreground")}>
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
                      <td className="py-3 px-4 text-sm font-medium text-emerald-400">{quote.number}</td>
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

      {/* AI Quote Modal */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAI(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h2 className="font-semibold">Générer un devis avec l'IA</h2>
              </div>
              <button onClick={() => setShowAI(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1.5">Client (optionnel)</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}>
                  <option value="">— Sélectionner un client —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Décris le travail à réaliser *</label>
                <textarea
                  className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  placeholder="ex: Refonte complète du site web de l'entreprise, avec une page d'accueil, une page services, un formulaire de contact et l'optimisation SEO..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">L'IA va analyser ta description et générer automatiquement les lignes de prestation avec des prix réalistes.</p>
              <div className="flex gap-2 pt-1 border-t border-border">
                <Button className="flex-1 h-9 text-sm gap-2" onClick={handleAIGenerate} disabled={aiLoading || !aiPrompt.trim()}>
                  {aiLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Génération en cours...</> : <><Sparkles className="w-3.5 h-3.5" /> Générer le devis</>}
                </Button>
                <Button variant="outline" className="h-9 text-sm" onClick={() => setShowAI(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Nouveau devis</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium block mb-1.5">Titre du devis</label>
                  <Input className="h-9 text-sm" placeholder="ex: Refonte site web..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Client</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}>
                    <option value="">— Aucun client —</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Valide jusqu'au</label>
                  <Input type="date" className="h-9 text-sm" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">TVA (%)</label>
                  <Input type="number" className="h-9 text-sm" value={form.tax_rate} step="0.1" onChange={e => setForm(f => ({ ...f, tax_rate: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium">Prestations</label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addItem}><Plus className="w-3 h-3" /> Ajouter</Button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-muted-foreground">Description</th>
                        <th className="text-center py-2 px-3 text-xs text-muted-foreground w-16">Qté</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground w-24">P.U. CHF</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground w-24">Total</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2"><Input className="h-7 text-xs border-0 bg-transparent p-1 focus-visible:ring-0" placeholder="Description..." value={item.description} onChange={e => updateItem(i, "description", e.target.value)} /></td>
                          <td className="py-1.5 px-2"><Input type="number" className="h-7 text-xs border-0 bg-transparent p-1 text-center focus-visible:ring-0" value={item.quantity} min={1} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)} /></td>
                          <td className="py-1.5 px-2"><Input type="number" className="h-7 text-xs border-0 bg-transparent p-1 text-right focus-visible:ring-0" value={item.unit_price} step="0.01" onChange={e => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} /></td>
                          <td className="py-1.5 px-3 text-right text-xs font-medium whitespace-nowrap">{formatCurrency(item.quantity * item.unit_price)}</td>
                          <td className="py-1.5 px-1">{items.length > 1 && <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-400 p-1"><X className="w-3 h-3" /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-secondary/20 text-xs">
                      <tr><td colSpan={3} className="py-2 px-3 text-muted-foreground">Sous-total</td><td className="py-2 px-3 text-right">{formatCurrency(subtotal)}</td><td /></tr>
                      <tr><td colSpan={3} className="py-2 px-3 text-muted-foreground">TVA {form.tax_rate}%</td><td className="py-2 px-3 text-right">{formatCurrency(taxAmount)}</td><td /></tr>
                      <tr><td colSpan={3} className="py-2.5 px-3 font-bold text-sm">Total TTC</td><td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-sm">{formatCurrency(total)}</td><td /></tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5">Notes (optionnel)</label>
                <textarea className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Notes ou conditions particulières..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1 h-9 text-sm" onClick={handleCreate} disabled={creating || items.every(i => !i.description)}>
                  {creating ? "Création..." : "Créer le devis"}
                </Button>
                <Button variant="outline" className="h-9 text-sm" onClick={() => setShowCreate(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <tr><td colSpan={3} className="py-2.5 px-3 text-sm font-bold">Total TTC</td><td className="py-2.5 px-3 text-right text-base font-bold text-emerald-400">{formatCurrency(selectedQuote.total)}</td></tr>
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

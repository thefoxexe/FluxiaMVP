"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Plus, Search, Send, CheckCircle, Clock, AlertTriangle,
  XCircle, Trash2, CreditCard, TrendingUp, ArrowUpRight, FileText, X
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
import { createInvoice, markInvoicePaid, sendInvoice, deleteInvoice } from "@/actions/invoices";
import type { Invoice, Contact } from "@/lib/supabase/types";

type InvoiceWithItems = Invoice & { invoice_items: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }> };

const STATUS_COLORS: Record<string, string> = {
  brouillon: "text-muted-foreground bg-secondary border-border",
  envoyé: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  payée: "text-green-400 bg-green-500/10 border-green-500/20",
  "en attente": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  en_retard: "text-red-400 bg-red-500/10 border-red-500/20",
  annulée: "text-muted-foreground bg-secondary border-border",
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

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    contact_id: "",
    due_date: "",
    tax_rate: 8.1,
    notes: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("invoices").select("*, invoice_items(*)").order("created_at", { ascending: false }),
      supabase.from("contacts").select("id, name, company").order("name"),
    ]).then(([invRes, contRes]) => {
      setInvoices((invRes.data ?? []) as InvoiceWithItems[]);
      setContacts((contRes.data ?? []) as Contact[]);
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = (subtotal * form.tax_rate) / 100;
  const total = subtotal + taxAmount;

  const handleCreate = async () => {
    if (items.every(i => !i.description)) return;
    setCreating(true);
    const res = await createInvoice({
      contact_id: form.contact_id || undefined,
      due_date: form.due_date || undefined,
      tax_rate: form.tax_rate,
      notes: form.notes || undefined,
      items: items.filter(i => i.description),
    });
    if (res.data) {
      const newInv = { ...res.data, invoice_items: items.filter(i => i.description).map((it, idx) => ({
        id: `tmp-${idx}`, description: it.description, quantity: it.quantity,
        unit_price: it.unit_price, total: it.quantity * it.unit_price,
      })) } as InvoiceWithItems;
      setInvoices(prev => [newInv, ...prev]);
      setShowCreate(false);
      setForm({ contact_id: "", due_date: "", tax_rate: 8.1, notes: "" });
      setItems([{ ...EMPTY_ITEM }]);
    }
    setCreating(false);
  };

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const filtered = invoices.filter((inv) => {
    const matchSearch = !search || inv.number.toLowerCase().includes(search.toLowerCase()) || (inv.notes ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "tous" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = invoices.filter((i) => i.status === "payée").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => ["envoyé", "en attente"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === "en_retard").reduce((s, i) => s + i.total, 0);

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "payée" as const } : i));
    if (selectedInvoice?.id === id) setSelectedInvoice((prev) => prev ? { ...prev, status: "payée" } : null);
    startTransition(async () => { await markInvoicePaid(id); });
  };

  const handleSend = (id: string) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "envoyé" as const } : i));
    startTransition(async () => { await sendInvoice(id); });
  };

  const handleDelete = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setSelectedInvoice(null);
    startTransition(async () => { await deleteInvoice(id); });
  };

  return (
    <div>
      <Header title="Factures" subtitle="Gérez vos factures et suivez vos paiements" />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total factures", value: invoices.length, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Encaissé", value: formatCurrency(totalPaid), icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "En attente", value: formatCurrency(totalPending), icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "En retard", value: formatCurrency(totalOverdue), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
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
              <Input placeholder="Rechercher une facture..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" className="gap-1.5 h-9 shrink-0" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Nouvelle facture</span>
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {["tous", "brouillon", "envoyé", "payée", "en attente", "en_retard", "annulée"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap shrink-0", statusFilter === s ? "bg-emerald-600/15 text-emerald-400 border border-emerald-600/20" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                {s === "tous" ? "Toutes" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg border border-border bg-secondary/20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? "Aucune facture trouvée" : "Aucune facture pour l'instant"}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px]">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Numéro</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Montant</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Échéance</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Créé le</th>
                    <th className="py-2.5 px-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/20 transition-colors cursor-pointer group" onClick={() => setSelectedInvoice(inv)}>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-400">{inv.number}</td>
                      <td className="py-3 px-4">
                        <span className={cn("text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_COLORS[inv.status])}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(inv.total)}</td>
                      <td className="py-3 px-4">
                        <span className={cn("text-xs", inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== "payée" ? "text-red-400" : "text-muted-foreground")}>
                          {formatDate(inv.due_date)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(inv.created_at)}</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                              <span className="w-3.5 h-3.5 flex flex-col gap-0.5 items-center justify-center">
                                <span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" /><span className="w-0.5 h-0.5 rounded-full bg-current" />
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem className="text-xs" onClick={() => handleMarkPaid(inv.id)}><CheckCircle className="w-3.5 h-3.5" />Marquer payée</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" onClick={() => handleSend(inv.id)}><Send className="w-3.5 h-3.5" />Envoyer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-red-400 focus:text-red-400" onClick={() => handleDelete(inv.id)}><Trash2 className="w-3.5 h-3.5" />Supprimer</DropdownMenuItem>
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

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Nouvelle facture</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5">Client</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}>
                    <option value="">— Aucun client —</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5">Date d'échéance</label>
                  <Input type="date" className="h-9 text-sm" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
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
                          <td className="py-1.5 px-2">
                            <Input className="h-7 text-xs border-0 bg-transparent p-1 focus-visible:ring-0" placeholder="Description..." value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />
                          </td>
                          <td className="py-1.5 px-2">
                            <Input type="number" className="h-7 text-xs border-0 bg-transparent p-1 text-center focus-visible:ring-0" value={item.quantity} min={1} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                          </td>
                          <td className="py-1.5 px-2">
                            <Input type="number" className="h-7 text-xs border-0 bg-transparent p-1 text-right focus-visible:ring-0" value={item.unit_price} step="0.01" onChange={e => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-1.5 px-3 text-right text-xs font-medium whitespace-nowrap">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </td>
                          <td className="py-1.5 px-1">
                            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-400 p-1"><X className="w-3 h-3" /></button>}
                          </td>
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
                <textarea className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Notes internes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1 h-9 text-sm" onClick={handleCreate} disabled={creating || items.every(i => !i.description)}>
                  {creating ? "Création..." : "Créer la facture"}
                </Button>
                <Button variant="outline" className="h-9 text-sm" onClick={() => setShowCreate(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{selectedInvoice.number}</div>
                <span className={cn("text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_COLORS[selectedInvoice.status])}>
                  {selectedInvoice.status}
                </span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {selectedInvoice.invoice_items.length > 0 && (
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
                      {selectedInvoice.invoice_items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-sm">{item.description}</td>
                          <td className="py-2.5 px-3 text-center text-sm text-muted-foreground">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-sm text-muted-foreground">{formatCurrency(item.unit_price)}</td>
                          <td className="py-2.5 px-3 text-right text-sm font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-secondary/20">
                      <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">Sous-total</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedInvoice.subtotal)}</td></tr>
                      <tr><td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground">TVA {selectedInvoice.tax_rate}%</td><td className="py-2 px-3 text-right text-sm">{formatCurrency(selectedInvoice.tax_amount)}</td></tr>
                      <tr><td colSpan={3} className="py-2.5 px-3 text-sm font-bold">Total TTC</td><td className="py-2.5 px-3 text-right text-base font-bold text-emerald-400">{formatCurrency(selectedInvoice.total)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Créé le : <span className="text-foreground">{formatDate(selectedInvoice.created_at)}</span></div>
                {selectedInvoice.due_date && <div>Échéance : <span className={new Date(selectedInvoice.due_date) < new Date() && selectedInvoice.status !== "payée" ? "text-red-400" : "text-foreground"}>{formatDate(selectedInvoice.due_date)}</span></div>}
                {selectedInvoice.paid_at && <div>Payée le : <span className="text-green-400">{formatDate(selectedInvoice.paid_at)}</span></div>}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedInvoice.status !== "payée" && (
                  <Button className="flex-1 h-9 gap-2 text-sm" onClick={() => handleMarkPaid(selectedInvoice.id)}>
                    <CheckCircle className="w-3.5 h-3.5" /> Marquer payée
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => handleSend(selectedInvoice.id)}>
                  <Send className="w-3.5 h-3.5" /> Envoyer
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(selectedInvoice.id)}>
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

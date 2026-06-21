"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, Zap, Users, FileText, CreditCard } from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, Quote, Contact } from "@/lib/supabase/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const PERIOD_OPTIONS = ["3 mois", "6 mois", "1 an"];

function getMonthlyRevenue(invoices: Invoice[], months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const revenue = invoices
      .filter(inv => inv.status === "payée" && inv.paid_at && new Date(inv.paid_at) >= start && new Date(inv.paid_at) <= end)
      .reduce((sum, inv) => sum + inv.total, 0);
    return { month: MONTH_LABELS[d.getMonth()], revenue, expenses: Math.round(revenue * 0.28) };
  });
}

function getMonthlyQuotes(quotes: Quote[], months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const mq = quotes.filter(q => { const c = new Date(q.created_at); return c >= start && c <= end; });
    return {
      month: MONTH_LABELS[d.getMonth()],
      sent: mq.filter(q => q.status !== "brouillon").length,
      accepted: mq.filter(q => q.status === "accepté").length,
      refused: mq.filter(q => q.status === "refusé").length,
    };
  });
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5 text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {typeof entry.value === "number" && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RapportsPage() {
  const [period, setPeriod] = useState("6 mois");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("invoices").select("*"),
      supabase.from("quotes").select("*"),
      supabase.from("contacts").select("*"),
    ]).then(([invRes, quoteRes, contRes]) => {
      setInvoices(invRes.data ?? []);
      setQuotes(quoteRes.data ?? []);
      setContacts(contRes.data ?? []);
      setLoading(false);
    });
  }, []);

  const months = period === "3 mois" ? 3 : period === "1 an" ? 12 : 6;
  const revenueData = getMonthlyRevenue(invoices, months);
  const quoteData = getMonthlyQuotes(quotes, months);

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const avgMonthly = Math.round(totalRevenue / months);
  const nonDraft = quotes.filter(q => q.status !== "brouillon").length;
  const conversionRate = nonDraft > 0 ? Math.round((quotes.filter(q => q.status === "accepté").length / nonDraft) * 100) : 0;
  const activeClients = contacts.filter(c => c.status === "gagné").length;

  const invoiceStatusData = [
    { name: "Payées", value: invoices.filter(i => i.status === "payée").length, color: "#34d399" },
    { name: "En attente", value: invoices.filter(i => i.status === "en attente" || i.status === "envoyé").length, color: "#f59e0b" },
    { name: "En retard", value: invoices.filter(i => i.status === "en_retard").length, color: "#ef4444" },
    { name: "Annulées", value: invoices.filter(i => i.status === "annulée").length, color: "#64748b" },
  ].filter(d => d.value > 0);

  const contactStatusData = [
    { name: "Gagné", value: contacts.filter(c => c.status === "gagné").length, color: "#34d399" },
    { name: "Négociation", value: contacts.filter(c => c.status === "négociation").length, color: "#fb923c" },
    { name: "Devis envoyé", value: contacts.filter(c => c.status === "devis envoyé").length, color: "#f59e0b" },
    { name: "Contacté", value: contacts.filter(c => c.status === "contacté").length, color: "#06b6d4" },
    { name: "Prospect", value: contacts.filter(c => c.status === "prospect").length, color: "#60a5fa" },
  ].filter(d => d.value > 0);

  const overdueInvoices = invoices.filter(i => i.status === "en_retard");
  const pendingQuotes = quotes.filter(q => ["envoyé", "consulté"].includes(q.status));

  return (
    <div>
      <Header title="Rapports" subtitle="Analysez vos performances et prenez de meilleures décisions" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-1 flex-wrap">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  period === p ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Rapport IA</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl border border-border bg-secondary/20 animate-pulse" />)
          ) : [
            { label: `CA ${period}`, value: formatCurrency(totalRevenue), icon: TrendingUp },
            { label: "CA mensuel moyen", value: formatCurrency(avgMonthly), icon: BarChart3 },
            { label: "Taux de conversion", value: `${conversionRate}%`, icon: FileText },
            { label: "Clients actifs", value: String(activeClients), icon: Users },
          ].map((kpi) => (
            <Card key={kpi.label} className="card-hover">
              <CardContent className="p-4">
                <kpi.icon className="w-4 h-4 text-muted-foreground mb-3" />
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Revenus vs Dépenses estimées</CardTitle>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Revenus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/60 inline-block" />Dépenses</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="Revenus" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Statut des factures</CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && invoiceStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">Aucune facture</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {invoiceStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {invoiceStatusData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Devis : Envoyés vs Acceptés</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quoteData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sent" name="Envoyés" fill="#7c3aed" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="accepted" name="Acceptés" fill="#34d399" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="refused" name="Refusés" fill="#ef4444" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Répartition CRM</CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && contactStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">Aucun contact</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={contactStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                        {contactStatusData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {contactStatusData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold text-violet-300">Insights IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: totalRevenue > 0 ? "Revenus sur la période" : "Premiers pas",
                  body: totalRevenue > 0
                    ? `Vous avez encaissé ${formatCurrency(totalRevenue)} sur ${period}, soit ${formatCurrency(avgMonthly)}/mois en moyenne.`
                    : "Créez votre première facture pour commencer à suivre vos revenus ici.",
                  badge: totalRevenue > 0 ? "Positif" : "Info",
                  badgeColor: (totalRevenue > 0 ? "success" : "secondary") as "success" | "secondary",
                },
                {
                  title: "Devis en attente",
                  body: pendingQuotes.length > 0
                    ? `${pendingQuotes.length} devis en attente de réponse pour ${formatCurrency(pendingQuotes.reduce((s, q) => s + q.total, 0))}. Relancez vos prospects.`
                    : "Aucun devis en attente. Envoyez de nouveaux devis pour développer votre pipeline.",
                  badge: pendingQuotes.length > 0 ? "Action requise" : "OK",
                  badgeColor: (pendingQuotes.length > 0 ? "warning" : "success") as "warning" | "success",
                },
                {
                  title: "Factures en retard",
                  body: overdueInvoices.length > 0
                    ? `${overdueInvoices.length} facture${overdueInvoices.length > 1 ? "s" : ""} en retard pour ${formatCurrency(overdueInvoices.reduce((s, i) => s + i.total, 0))}. Relancez vos clients.`
                    : "Aucune facture en retard. Excellent suivi de vos encaissements !",
                  badge: overdueInvoices.length > 0 ? "Attention" : "OK",
                  badgeColor: (overdueInvoices.length > 0 ? "destructive" : "success") as "destructive" | "success",
                },
              ].map((insight) => (
                <div key={insight.title} className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <Badge variant={insight.badgeColor} className="text-[10px] mb-2">{insight.badge}</Badge>
                  <h3 className="text-sm font-medium mb-1.5">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

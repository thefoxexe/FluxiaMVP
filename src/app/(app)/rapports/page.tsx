"use client";

import React, { useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Download, Calendar,
  Filter, ChevronDown, Zap, Users, FileText, CreditCard
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, cn } from "@/lib/utils";
import { mockRevenueData, mockPipelineData, mockContacts, mockInvoices, mockQuotes } from "@/lib/mock-data";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const PERIOD_OPTIONS = ["7 jours", "30 jours", "3 mois", "6 mois", "1 an"];

const INVOICE_STATUS_DATA = [
  { name: "Payées", value: 2, color: "#34d399" },
  { name: "En attente", value: 2, color: "#f59e0b" },
  { name: "En retard", value: 1, color: "#ef4444" },
  { name: "Annulées", value: 0, color: "#64748b" },
];

const CONTACT_STATUS_DATA = [
  { name: "Gagné", value: 4, color: "#34d399" },
  { name: "Négociation", value: 1, color: "#fb923c" },
  { name: "Devis envoyé", value: 1, color: "#f59e0b" },
  { name: "Contacté", value: 1, color: "#06b6d4" },
  { name: "Prospect", value: 1, color: "#60a5fa" },
];

const MONTHLY_QUOTES_DATA = [
  { month: "Oct", sent: 3, accepted: 2, refused: 1 },
  { month: "Nov", sent: 4, accepted: 3, refused: 0 },
  { month: "Déc", sent: 2, accepted: 2, refused: 0 },
  { month: "Jan", sent: 5, accepted: 4, refused: 1 },
  { month: "Fév", sent: 4, accepted: 3, refused: 0 },
  { month: "Mar", sent: 5, accepted: 2, refused: 0 },
];

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-medium mb-2 text-muted-foreground">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-foreground font-semibold">
              {typeof entry.value === "number" && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
            </span>
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RapportsPage() {
  const [period, setPeriod] = useState("6 mois");

  const totalRevenue = mockRevenueData.reduce((s, d) => s + d.revenue, 0);
  const avgMonthly = Math.round(totalRevenue / mockRevenueData.length);
  const conversionRate = Math.round((mockQuotes.filter((q) => q.status === "accepté").length / mockQuotes.length) * 100);

  return (
    <div>
      <Header title="Rapports" subtitle="Analysez vos performances et prenez de meilleures décisions" />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
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
              Rapport IA
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "CA 6 mois", value: formatCurrency(totalRevenue), trend: "+28%", up: true, icon: TrendingUp },
            { label: "CA mensuel moyen", value: formatCurrency(avgMonthly), trend: "+12%", up: true, icon: BarChart3 },
            { label: "Taux de conversion", value: `${conversionRate}%`, trend: "+8%", up: true, icon: FileText },
            { label: "Clients actifs", value: mockContacts.filter((c) => c.status === "gagné").length, trend: "+2", up: true, icon: Users },
          ].map((kpi) => (
            <Card key={kpi.label} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  <div className={cn("text-xs font-medium flex items-center gap-0.5", kpi.up ? "text-green-400" : "text-red-400")}>
                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.trend}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Revenus vs Dépenses</CardTitle>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />Revenus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/60" />Dépenses</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockRevenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
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
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={INVOICE_STATUS_DATA}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {INVOICE_STATUS_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {INVOICE_STATUS_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Devis : Envoyés vs Acceptés</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MONTHLY_QUOTES_DATA} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="sent" name="Envoyés" fill="#7c3aed" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="accepted" name="Acceptés" fill="#34d399" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="refused" name="Refusés" fill="#ef4444" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Cashflow mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Area type="monotone" dataKey="cashflow" name="Cashflow" stroke="#06b6d4" strokeWidth={2} fill="url(#cashflowGrad)" dot={{ fill: "#06b6d4", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
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
                  title: "Croissance forte",
                  body: "Votre CA a augmenté de 28% sur les 6 derniers mois. Si cette tendance continue, vous atteindrez CHF 400k annuels en août 2024.",
                  badge: "Positif",
                  badgeColor: "success" as const,
                },
                {
                  title: "Opportunité manquée",
                  body: "2 devis sont en attente depuis plus de 7 jours sans relance. Valeur totale : CHF 21'641. Une relance IA pourrait récupérer ~65% de ces deals.",
                  badge: "Action requise",
                  badgeColor: "warning" as const,
                },
                {
                  title: "Client à risque",
                  body: "Marc Dupont n'a pas payé sa facture depuis 14 jours et son score IA a baissé à 45. Contactez-le rapidement pour éviter un impayé.",
                  badge: "Attention",
                  badgeColor: "destructive" as const,
                },
              ].map((insight) => (
                <div key={insight.title} className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={insight.badgeColor} className="text-[10px]">{insight.badge}</Badge>
                  </div>
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

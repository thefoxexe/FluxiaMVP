"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, CreditCard, FileText, Clock,
  ArrowUpRight, CheckCircle, Zap, Users, ChevronRight, Target,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, Task, Contact, Quote } from "@/lib/supabase/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function getMonthlyRevenue(invoices: Invoice[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const revenue = invoices
      .filter(inv => inv.status === "payée" && inv.paid_at && new Date(inv.paid_at) >= start && new Date(inv.paid_at) <= end)
      .reduce((sum, inv) => sum + inv.total, 0);
    return { month: MONTH_LABELS[d.getMonth()], revenue, cashflow: Math.round(revenue * 0.72) };
  });
}

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5 text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const STAGE_COLORS: Record<string, string> = {
  prospect: "#60a5fa",
  "contacté": "#93c5fd",
  "devis envoyé": "#f59e0b",
  "négociation": "#fb923c",
  gagné: "#34d399",
};
const STAGE_LABELS: Record<string, string> = {
  prospect: "Prospect",
  "contacté": "Contacté",
  "devis envoyé": "Devis envoyé",
  "négociation": "Négociation",
  gagné: "Gagné",
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [firstName, setFirstName] = useState("là");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]).then(async ([invRes, quoteRes, taskRes, contRes, userRes]) => {
      setInvoices(invRes.data ?? []);
      setQuotes(quoteRes.data ?? []);
      setTasks(taskRes.data ?? []);
      setContacts(contRes.data ?? []);
      if (userRes.data.user) {
        const { data } = await supabase.from("profiles").select("full_name").eq("id", userRes.data.user.id).single();
        if (data?.full_name) setFirstName(data.full_name.split(" ")[0]);
      }
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const paidInvoices = invoices.filter(inv => inv.status === "payée");
  const monthRevenue = paidInvoices
    .filter(inv => inv.paid_at && new Date(inv.paid_at) >= monthStart)
    .reduce((sum, inv) => sum + inv.total, 0);
  const yearRevenue = paidInvoices
    .filter(inv => inv.paid_at && new Date(inv.paid_at) >= yearStart)
    .reduce((sum, inv) => sum + inv.total, 0);

  const unpaidInvoices = invoices.filter(inv => ["envoyé", "en attente", "en_retard"].includes(inv.status));
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueCount = invoices.filter(inv => inv.status === "en_retard").length;

  const pendingQuotes = quotes.filter(q => ["envoyé", "consulté"].includes(q.status));
  const pendingTotal = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

  const nonDraftQuotes = quotes.filter(q => q.status !== "brouillon").length;
  const conversionRate = nonDraftQuotes > 0
    ? Math.round((quotes.filter(q => q.status === "accepté").length / nonDraftQuotes) * 100)
    : 0;

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c.name]));
  const recentInvoices = invoices.slice(0, 4);
  const urgentTasks = tasks.filter(t => t.priority === "haute" && t.status !== "terminée").slice(0, 4);
  const chartData = getMonthlyRevenue(invoices);

  const pipelineStages = ["prospect", "contacté", "devis envoyé", "négociation", "gagné"];
  const pipelineData = pipelineStages.map(stage => ({
    stage: STAGE_LABELS[stage],
    count: contacts.filter(c => c.status === stage).length,
    value: contacts.filter(c => c.status === stage).reduce((sum, c) => sum + c.revenue, 0),
    color: STAGE_COLORS[stage],
  }));
  const maxValue = Math.max(...pipelineData.map(p => p.value), 1);

  const aiMessages = [
    unpaidInvoices.length > 0 && `${unpaidInvoices.length} facture${unpaidInvoices.length > 1 ? "s" : ""} impayée${unpaidInvoices.length > 1 ? "s" : ""} (${formatCurrency(unpaidTotal)})${overdueCount > 0 ? `, dont ${overdueCount} en retard` : ""}`,
    pendingQuotes.length > 0 && `${pendingQuotes.length} devis en attente de réponse`,
    urgentTasks.length > 0 && `${urgentTasks.length} tâche${urgentTasks.length > 1 ? "s" : ""} urgente${urgentTasks.length > 1 ? "s" : ""} à traiter`,
  ].filter(Boolean) as string[];

  const STATS = [
    { title: "CA du mois", value: formatCurrency(monthRevenue), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", sub: "factures payées ce mois" },
    { title: "CA annuel", value: formatCurrency(yearRevenue), icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", sub: "cumulé depuis janvier" },
    { title: "Impayées", value: formatCurrency(unpaidTotal), badge: `${unpaidInvoices.length}`, icon: CreditCard, color: "text-yellow-400", bg: "bg-yellow-500/10", sub: overdueCount > 0 ? `dont ${overdueCount} en retard` : "en cours" },
    { title: "Devis en cours", value: formatCurrency(pendingTotal), badge: `${pendingQuotes.length}`, icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10", sub: "en attente de réponse" },
    { title: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", sub: "devis → acceptés" },
    { title: "Contacts", value: String(contacts.length), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", sub: `dont ${contacts.filter(c => c.status === "gagné").length} clients` },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Bonjour ${firstName} · ${new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* AI Summary */}
        <div className="p-3 lg:p-4 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-blue-500/5 flex items-start gap-3 lg:gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">Résumé IA du jour</div>
            {loading ? (
              <div className="h-4 w-3/4 bg-secondary/50 rounded animate-pulse" />
            ) : aiMessages.length > 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{aiMessages.join(" · ")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Tout est à jour. Aucune action urgente requise.</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl border border-border bg-secondary/20 animate-pulse" />)
          ) : STATS.map((stat) => (
            <Card key={stat.title} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  {"badge" in stat && stat.badge && (
                    <span className="text-[10px] text-muted-foreground">{stat.badge} items</span>
                  )}
                </div>
                <div className="text-xl font-bold mb-0.5 leading-none">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Revenus (6 derniers mois)</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Revenus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />Cashflow</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  <Area type="monotone" dataKey="cashflow" name="Cashflow" stroke="#06b6d4" strokeWidth={2} fill="url(#cashGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Pipeline CRM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="h-8 rounded bg-secondary/20 animate-pulse" />)
              ) : (
                <>
                  {pipelineData.map((s) => (
                    <div key={s.stage}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-xs font-medium">{s.stage}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{s.count}</span>
                          {s.value > 0 && <><span>·</span><span>{formatCurrency(s.value)}</span></>}
                        </div>
                      </div>
                      <Progress value={(s.value / maxValue) * 100} className="h-1.5" />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border flex justify-between text-xs">
                    <span className="text-muted-foreground">Total contacts</span>
                    <span className="font-semibold">{contacts.length}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Factures récentes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-blue-400">
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-secondary/20 animate-pulse" />)}</div>
              ) : recentInvoices.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Aucune facture</div>
              ) : (
                <div className="space-y-3">
                  {recentInvoices.map((inv) => {
                    const name = contactMap[inv.contact_id ?? ""] ?? "—";
                    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div key={inv.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-[10px] font-semibold">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{name}</div>
                          <div className="text-[10px] text-muted-foreground">{inv.number}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-semibold">{formatCurrency(inv.total)}</div>
                          <div className={cn(
                            "text-[10px] font-medium",
                            inv.status === "payée" ? "text-green-400" :
                            inv.status === "en_retard" ? "text-red-400" : "text-yellow-400"
                          )}>
                            {inv.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Tâches urgentes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-blue-400">
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-secondary/20 animate-pulse" />)}</div>
              ) : urgentTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune tâche urgente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium leading-snug">{task.title}</div>
                        {task.deadline && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{task.deadline}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

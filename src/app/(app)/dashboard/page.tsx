"use client";

import React from "react";
import {
  TrendingUp, TrendingDown, CreditCard, FileText, Users, Clock,
  ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle, Zap,
  ChevronRight, Mail, MoreHorizontal, Target
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatRelativeDate, cn, getInitials } from "@/lib/utils";
import {
  mockDashboardStats, mockInvoices, mockContacts, mockRevenueData,
  mockEmails, mockTasks
} from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const STATS_CARDS = [
  {
    title: "CA du mois",
    value: formatCurrency(47850),
    change: "+12.4%",
    positive: true,
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
    sub: "vs mois dernier",
  },
  {
    title: "CA annuel",
    value: formatCurrency(312400),
    change: "+28.1%",
    positive: true,
    icon: Target,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    sub: "vs année précédente",
  },
  {
    title: "Factures impayées",
    value: formatCurrency(34734),
    change: "4 factures",
    positive: false,
    icon: CreditCard,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    sub: "dont 1 en retard",
  },
  {
    title: "Devis en attente",
    value: formatCurrency(25208),
    change: "2 devis",
    positive: null,
    icon: FileText,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    sub: "en cours de négociation",
  },
  {
    title: "Taux de conversion",
    value: "68.5%",
    change: "+8.2%",
    positive: true,
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
    sub: "devis → contrats signés",
  },
  {
    title: "Cash disponible",
    value: formatCurrency(89200),
    change: "+CHF 12'400",
    positive: true,
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    sub: "solde actuel",
  },
];

const PIPELINE_DATA = [
  { stage: "Prospect", count: 12, value: 89000, color: "#60a5fa" },
  { stage: "Contacté", count: 8, value: 62000, color: "#a78bfa" },
  { stage: "Devis", count: 5, value: 45000, color: "#f59e0b" },
  { stage: "Négociation", count: 3, value: 38000, color: "#fb923c" },
  { stage: "Gagné", count: 24, value: 312000, color: "#34d399" },
];

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-medium mb-2 text-muted-foreground">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-foreground">{entry.name}: </span>
            <span className="font-semibold">
              {entry.name === "revenue" || entry.name === "cashflow" || entry.name === "expenses"
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const recentInvoices = mockInvoices.slice(0, 4);
  const urgentTasks = mockTasks.filter((t) => t.priority === "haute" && t.status !== "terminée").slice(0, 4);
  const unreadEmails = mockEmails.filter((e) => !e.isRead).slice(0, 3);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Bonjour Jean · ${new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="p-6 space-y-6">
        {/* AI Summary Banner */}
        <div className="p-4 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">Résumé IA du jour</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vous avez <strong className="text-foreground">4 emails non lus</strong> dont 1 urgent (site web hors ligne).
              La facture <strong className="text-foreground">FAC-2024-004</strong> de Marc Dupont est en retard de 14 jours — relance recommandée.
              Le devis <strong className="text-foreground">DEV-2024-002</strong> de Sophie Martin a été consulté hier, c'est le moment idéal pour un suivi.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-violet-400 border-violet-500/30 hover:bg-violet-500/10">
            Agir
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS_CARDS.map((stat) => (
            <Card key={stat.title} className="card-hover col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.positive === true ? "text-green-400" :
                    stat.positive === false ? "text-yellow-400" :
                    "text-muted-foreground"
                  )}>
                    {stat.positive === true && <ArrowUpRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-xl font-bold mb-0.5 leading-none">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Revenus & Cashflow</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />Revenus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" />Cashflow</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/60" />Dépenses</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  <Area type="monotone" dataKey="cashflow" name="cashflow" stroke="#06b6d4" strokeWidth={2} fill="url(#cashGrad)" dot={false} />
                  <Area type="monotone" dataKey="expenses" name="expenses" stroke="#ef4444" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Pipeline de vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PIPELINE_DATA.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-xs font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{stage.count}</span>
                      <span>·</span>
                      <span>{formatCurrency(stage.value)}</span>
                    </div>
                  </div>
                  <Progress
                    value={(stage.value / 312000) * 100}
                    className="h-1.5"
                    style={{ "--progress-color": stage.color } as any}
                  />
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Valeur totale pipeline</span>
                  <span className="font-semibold">{formatCurrency(546000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Factures récentes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-violet-400">
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-[10px]">{getInitials(inv.contactName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{inv.contactName}</div>
                    <div className="text-[10px] text-muted-foreground">{inv.number}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold">{formatCurrency(inv.total)}</div>
                    <div className={cn(
                      "text-[10px] font-medium",
                      inv.status === "payée" ? "text-green-400" :
                      inv.status === "en_retard" ? "text-red-400" :
                      "text-yellow-400"
                    )}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Tâches urgentes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-violet-400">
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-snug">{task.title}</div>
                    {task.deadline && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.deadline}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inbox Preview */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Inbox IA</CardTitle>
                <Badge variant="purple" className="text-[10px] px-2">
                  {unreadEmails.length} non lus
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {unreadEmails.map((email) => (
                <div key={email.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="text-[10px]">{getInitials(email.fromName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">{email.fromName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatRelativeDate(email.receivedAt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{email.subject}</div>
                    {email.category === "urgent" && (
                      <Badge className="mt-1 text-[9px] px-1.5 py-0 bg-red-500/10 text-red-400 border border-red-500/20">URGENT</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs text-violet-400 h-8">
                <Mail className="w-3.5 h-3.5" />
                Ouvrir l'Inbox IA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

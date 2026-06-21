"use client";

import React, { useState } from "react";
import {
  Plus, Play, Pause, Workflow, Zap, Mail, FileText, CreditCard,
  Bell, Users, BarChart3, ChevronRight, Settings2, Activity,
  CheckCircle, Clock
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatRelativeDate } from "@/lib/utils";
import { mockAutomations } from "@/lib/mock-data";
import type { Automation } from "@/lib/types";

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  email_categorized: <Mail className="w-4 h-4" />,
  quote_status_changed: <FileText className="w-4 h-4" />,
  quote_no_response: <Clock className="w-4 h-4" />,
  invoice_overdue: <CreditCard className="w-4 h-4" />,
  invoice_paid: <CheckCircle className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
};

const TEMPLATES = [
  {
    icon: Mail,
    title: "Réponse automatique aux prospects",
    description: "Envoie une réponse personnalisée IA à chaque nouveau prospect qui vous écrit.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    complexity: "Simple",
  },
  {
    icon: FileText,
    title: "Devis → Facture automatique",
    description: "Crée la facture dès qu'un devis est accepté. Zero action manuelle.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    complexity: "Simple",
  },
  {
    icon: Users,
    title: "Scoring prospect hebdomadaire",
    description: "Recalcule le score IA de tous vos prospects chaque lundi matin.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    complexity: "Avancé",
  },
  {
    icon: Bell,
    title: "Alerte impayé > 30 jours",
    description: "Notification Slack/email si une facture dépasse 30 jours de retard.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    complexity: "Simple",
  },
];

export default function AutomatisationsPage() {
  const [automations, setAutomations] = useState(mockAutomations);

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const activeCount = automations.filter((a) => a.isActive).length;
  const totalRuns = automations.reduce((s, a) => s + a.runsCount, 0);

  return (
    <div>
      <Header title="Automatisations" subtitle="Créez des workflows qui font tourner votre business tout seul" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Actives", value: activeCount, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "En pause", value: automations.length - activeCount, icon: Pause, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Exécutions totales", value: totalRuns, icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Heures économisées", value: `~${Math.round(totalRuns * 0.3)}h`, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-4.5 h-4.5", stat.color)} style={{ width: "1.125rem", height: "1.125rem" }} />
                </div>
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Automations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Mes automatisations</h2>
              <Button variant="gradient" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Créer un workflow
              </Button>
            </div>

            <div className="space-y-3">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    auto.isActive
                      ? "border-border bg-card hover:border-violet-500/20"
                      : "border-border/50 bg-card/50 opacity-70"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      auto.isActive ? "bg-violet-500/10 text-violet-400" : "bg-secondary text-muted-foreground"
                    )}>
                      {TRIGGER_ICONS[auto.trigger.type] || <Workflow className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{auto.name}</span>
                        {auto.isActive && (
                          <Badge variant="success" className="text-[10px] px-1.5">Actif</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{auto.description}</p>

                      {/* Workflow Steps */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] bg-secondary rounded-full px-2.5 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          Déclencheur
                        </div>
                        {auto.actions.map((action, i) => (
                          <React.Fragment key={i}>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <div className="flex items-center gap-1.5 text-[10px] bg-secondary rounded-full px-2.5 py-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {action.type.replace(/_/g, " ")}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {auto.runsCount} exécutions
                        </span>
                        {auto.lastRun && (
                          <span>Dernière exécution : {formatRelativeDate(auto.lastRun)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Switch
                        checked={auto.isActive}
                        onCheckedChange={() => toggleAutomation(auto.id)}
                      />
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Templates prêts à l'emploi</h2>
            <div className="space-y-3">
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.title}
                  className="p-4 rounded-xl border border-border hover:border-violet-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", tpl.bg)}>
                      <tpl.icon className={cn("w-4 h-4", tpl.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{tpl.title}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{tpl.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-[10px]">{tpl.complexity}</Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-violet-400">
                          Utiliser <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Suggestion */}
            <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium text-violet-300">Suggestion IA</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Basé sur votre activité, l'IA recommande d'activer la relance automatique pour les devis sans réponse après 5 jours. Vous avez 2 devis concernés actuellement.
              </p>
              <Button variant="outline-gradient" size="sm" className="w-full text-xs h-8">
                Activer cette automatisation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

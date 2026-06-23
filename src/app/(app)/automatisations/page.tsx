"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Plus, Pause, Workflow, Zap, Mail, FileText, CreditCard,
  Bell, Users, ChevronRight, Settings2, Activity,
  CheckCircle, Clock, Trash2, X,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatRelativeDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createAutomation, deleteAutomation } from "@/actions/automations";
import type { Automation } from "@/lib/supabase/types";

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  email_categorized: <Mail className="w-4 h-4" />,
  quote_status_changed: <FileText className="w-4 h-4" />,
  quote_no_response: <Clock className="w-4 h-4" />,
  invoice_overdue: <CreditCard className="w-4 h-4" />,
  invoice_paid: <CheckCircle className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
  contact_created: <Users className="w-4 h-4" />,
};

const TEMPLATES = [
  {
    icon: Mail,
    title: "Réponse automatique aux prospects",
    description: "Envoie une réponse personnalisée IA à chaque nouveau prospect qui vous écrit.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    complexity: "Simple",
  },
  {
    icon: FileText,
    title: "Devis → Facture automatique",
    description: "Crée la facture dès qu'un devis est accepté. Zéro action manuelle.",
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
    description: "Notification email si une facture dépasse 30 jours de retard.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    complexity: "Simple",
  },
];

const TRIGGER_OPTIONS = [
  { value: "email_categorized", label: "Email catégorisé" },
  { value: "quote_status_changed", label: "Statut devis changé" },
  { value: "quote_no_response", label: "Devis sans réponse" },
  { value: "invoice_overdue", label: "Facture en retard" },
  { value: "invoice_paid", label: "Facture payée" },
  { value: "contact_created", label: "Nouveau contact" },
  { value: "schedule", label: "Planifié (cron)" },
];

const ACTION_OPTIONS = [
  { value: "send_email", label: "Envoyer un email" },
  { value: "create_task", label: "Créer une tâche" },
  { value: "create_invoice", label: "Créer une facture" },
  { value: "notify", label: "Notification push" },
  { value: "update_contact_score", label: "Mettre à jour le score" },
];

export default function AutomatisationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", trigger_type: "email_categorized", action_type: "send_email" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("automations").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setAutomations(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    setCreating(true);
    const res = await createAutomation({
      name: form.name,
      description: form.description || undefined,
      trigger_type: form.trigger_type,
      actions: [{ type: form.action_type }],
    });
    if (res.data) {
      setAutomations(prev => [res.data as Automation, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", trigger_type: "email_categorized", action_type: "send_email" });
    }
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    startTransition(async () => { await deleteAutomation(id); });
  };

  const installTemplate = async (tpl: typeof TEMPLATES[number]) => {
    const triggerMap: Record<string, string> = {
      "Réponse automatique aux prospects": "email_categorized",
      "Devis → Facture automatique": "quote_status_changed",
      "Scoring prospect hebdomadaire": "schedule",
      "Alerte impayé > 30 jours": "invoice_overdue",
    };
    const actionMap: Record<string, string> = {
      "Réponse automatique aux prospects": "send_email",
      "Devis → Facture automatique": "create_invoice",
      "Scoring prospect hebdomadaire": "update_contact_score",
      "Alerte impayé > 30 jours": "notify",
    };
    const res = await createAutomation({
      name: tpl.title,
      description: tpl.description,
      trigger_type: triggerMap[tpl.title] ?? "schedule",
      actions: [{ type: actionMap[tpl.title] ?? "notify" }],
    });
    if (res.data) setAutomations(prev => [res.data as Automation, ...prev]);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
    startTransition(async () => {
      const auto = automations.find(a => a.id === id);
      if (!auto) return;
      const supabase = createClient();
      await supabase.from("automations").update({ is_active: !auto.is_active }).eq("id", id);
    });
  };

  const activeCount = automations.filter(a => a.is_active).length;
  const totalRuns = automations.reduce((s, a) => s + a.runs_count, 0);

  const getActions = (auto: Automation): Array<{ type: string }> => {
    if (Array.isArray(auto.actions)) return auto.actions as Array<{ type: string }>;
    return [];
  };

  return (
    <div>
      <Header title="Automatisations" subtitle="Créez des workflows qui font tourner votre business tout seul" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Actives", value: activeCount, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "En pause", value: automations.length - activeCount, icon: Pause, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Exécutions totales", value: totalRuns, icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Heures économisées", value: `~${Math.round(totalRuns * 0.3)}h`, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div>
                  <div className="text-xl font-bold">{loading ? "—" : stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Automations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Mes automatisations</h2>
              <Button variant="gradient" size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Créer un workflow</span>
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl border border-border bg-secondary/20 animate-pulse" />)}</div>
            ) : automations.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-xl">
                <Workflow className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Aucune automatisation configurée</p>
                <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
                  <Plus className="w-3.5 h-3.5" /> Créer ma première automatisation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {automations.map((auto) => {
                  const actions = getActions(auto);
                  return (
                    <div
                      key={auto.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        auto.is_active
                          ? "border-border bg-card hover:border-blue-500/20"
                          : "border-border/50 bg-card/50 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          auto.is_active ? "bg-blue-500/10 text-blue-400" : "bg-secondary text-muted-foreground"
                        )}>
                          {TRIGGER_ICONS[auto.trigger_type] ?? <Workflow className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{auto.name}</span>
                            {auto.is_active && <Badge variant="success" className="text-[10px] px-1.5">Actif</Badge>}
                          </div>
                          {auto.description && (
                            <p className="text-xs text-muted-foreground mb-3">{auto.description}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[10px] bg-secondary rounded-full px-2.5 py-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {auto.trigger_type.replace(/_/g, " ")}
                            </div>
                            {actions.map((action, i) => (
                              <React.Fragment key={i}>
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                <div className="flex items-center gap-1.5 text-[10px] bg-secondary rounded-full px-2.5 py-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                  {action.type?.replace(/_/g, " ") ?? "action"}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {auto.runs_count} exécution{auto.runs_count !== 1 ? "s" : ""}
                            </span>
                            {auto.last_run_at && (
                              <span>Dernière : {formatRelativeDate(auto.last_run_at)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={auto.is_active}
                            onCheckedChange={() => toggleAutomation(auto.id)}
                            disabled={isPending}
                          />
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(auto.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Templates prêts à l'emploi</h2>
            <div className="space-y-3">
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.title}
                  className="p-4 rounded-xl border border-border hover:border-blue-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", tpl.bg)}>
                      <tpl.icon className={cn("w-4 h-4", tpl.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium block mb-1">{tpl.title}</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{tpl.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-[10px]">{tpl.complexity}</Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-400" onClick={() => installTemplate(tpl)}>
                          Utiliser <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Suggestion IA</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Activez la relance automatique pour les devis sans réponse après 5 jours et augmentez votre taux de conversion.
              </p>
              <Button variant="outline-gradient" size="sm" className="w-full text-xs h-8">
                Activer cette automatisation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Automation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Créer un workflow</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1.5">Nom *</label>
                <Input className="h-9 text-sm" placeholder="Relance devis sans réponse..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Description</label>
                <Input className="h-9 text-sm" placeholder="Description optionnelle..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Déclencheur</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.trigger_type} onChange={e => setForm(f => ({ ...f, trigger_type: e.target.value }))}>
                  {TRIGGER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Action</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))}>
                  {ACTION_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-muted-foreground">
                <span className="text-blue-400 font-medium">Logique :</span>{" "}
                Quand <span className="text-foreground font-medium">{TRIGGER_OPTIONS.find(t => t.value === form.trigger_type)?.label}</span>,
                alors <span className="text-foreground font-medium">{ACTION_OPTIONS.find(a => a.value === form.action_type)?.label}</span>.
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1 h-9 text-sm" onClick={handleCreate} disabled={creating || !form.name}>
                  {creating ? "Création..." : "Créer le workflow"}
                </Button>
                <Button variant="outline" className="h-9 text-sm" onClick={() => setShowCreate(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

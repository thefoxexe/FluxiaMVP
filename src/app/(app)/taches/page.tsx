"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Plus, Clock, Check, MoreHorizontal, X, AlertCircle } from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createTask, updateTaskStatus, deleteTask } from "@/actions/tasks";
import type { Task } from "@/lib/supabase/types";

const PRIORITY_STYLES: Record<string, string> = {
  haute: "text-red-400 bg-red-500/10 border-red-500/20",
  moyenne: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  basse: "text-green-400 bg-green-500/10 border-green-500/20",
};

const STATUS_COLUMNS = [
  { id: "todo" as const, label: "À faire" },
  { id: "en_cours" as const, label: "En cours" },
  { id: "terminée" as const, label: "Terminée" },
];

export default function TachesPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "moyenne" as "haute" | "moyenne" | "basse", deadline: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("tasks").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setTasks(data ?? []);
      setLoading(false);
    });
  }, []);

  const toggleTask = (task: Task) => {
    const newStatus = task.status === "terminée" ? "todo" as const : "terminée" as const;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    startTransition(async () => {
      await updateTaskStatus(task.id, newStatus);
    });
  };

  const handleCreate = () => {
    if (!newTask.title) return;
    startTransition(async () => {
      const { data, error } = await createTask({
        title: newTask.title,
        priority: newTask.priority,
        ...(newTask.deadline ? { deadline: newTask.deadline } : {}),
      });
      if (!error && data) {
        setTasks((prev) => [data as Task, ...prev]);
        setNewTask({ title: "", priority: "moyenne", deadline: "" });
        setShowForm(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => { await deleteTask(id); });
  };

  const byStatus = (s: Task["status"]) => tasks.filter((t) => t.status === s);
  const urgentCount = tasks.filter((t) => t.priority === "haute" && t.status !== "terminée").length;

  return (
    <div>
      <Header title="Tâches" subtitle="Gérez vos tâches et suivez vos priorités" />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "À faire", value: byStatus("todo").length, color: "text-foreground", bg: "bg-secondary" },
            { label: "En cours", value: byStatus("en_cours").length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Urgent", value: urgentCount, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Terminées", value: byStatus("terminée").length, color: "text-green-400", bg: "bg-green-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={cn("p-4 rounded-lg border border-border", stat.bg)}>
              <div className={cn("text-2xl font-bold mb-0.5", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-md">
            {["list", "kanban"].map((v) => (
              <button key={v} onClick={() => setView(v as "list" | "kanban")} className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {v === "list" ? "Liste" : "Kanban"}
              </button>
            ))}
          </div>
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Nouvelle tâche
          </Button>
        </div>

        {/* New Task Form */}
        {showForm && (
          <div className="p-4 rounded-lg border border-emerald-600/30 bg-emerald-600/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nouvelle tâche</span>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <Input placeholder="Titre de la tâche *" className="h-8 text-sm" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <div className="flex gap-2">
              <select className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "haute" | "moyenne" | "basse" })}>
                <option value="haute">Haute priorité</option>
                <option value="moyenne">Priorité moyenne</option>
                <option value="basse">Basse priorité</option>
              </select>
              <Input type="date" className="h-8 text-xs w-36" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleCreate} disabled={!newTask.title || isPending}>
                {isPending ? "Création..." : "Créer"}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg border border-border bg-secondary/20 animate-pulse" />)}</div>
        ) : view === "list" ? (
          <div className="space-y-4">
            {(["haute", "moyenne", "basse"] as const).map((priority) => {
              const pts = tasks.filter((t) => t.priority === priority && t.status !== "terminée");
              if (pts.length === 0) return null;
              const labels = { haute: "Haute priorité", moyenne: "Priorité moyenne", basse: "Basse priorité" };
              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-semibold uppercase tracking-wide", priority === "haute" ? "text-red-400" : priority === "moyenne" ? "text-yellow-400" : "text-green-400")}>
                      {labels[priority]}
                    </span>
                    <span className="text-xs text-muted-foreground">({pts.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {pts.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-card hover:border-white/10 transition-all group">
                        <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                          <div className="w-4.5 h-4.5 rounded-full border border-border hover:border-emerald-500/50 transition-colors flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border border-border" />
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{task.title}</div>
                          {task.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</div>}
                          {task.deadline && (
                            <div className={cn("flex items-center gap-1 text-[11px] mt-1.5", new Date(task.deadline) < new Date() ? "text-red-400" : "text-muted-foreground")}>
                              <Clock className="w-3 h-3" />{task.deadline}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={cn("text-[10px] border rounded px-1.5 py-0.5 font-medium", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
                          <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {byStatus("terminée").length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Terminées</span>
                  <span className="text-xs text-muted-foreground">({byStatus("terminée").length})</span>
                </div>
                <div className="space-y-1.5">
                  {byStatus("terminée").map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/50 opacity-50 hover:opacity-70 transition-opacity group">
                      <button onClick={() => toggleTask(task)} className="shrink-0">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-green-400" />
                        </div>
                      </button>
                      <span className="text-sm line-through text-muted-foreground flex-1">{task.title}</span>
                      <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune tâche pour l'instant</p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowForm(true)}>
                  <Plus className="w-3.5 h-3.5" /> Créer une tâche
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = byStatus(col.id);
              return (
                <div key={col.id}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <span className="text-sm font-medium">{col.label}</span>
                    <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border border-border bg-card hover:border-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-2">
                          <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                            {task.status === "terminée"
                              ? <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-green-400" /></div>
                              : <div className="w-4 h-4 rounded-full border border-border" />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium leading-snug">{task.title}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={cn("text-[10px] border rounded px-1.5 py-0.5 font-medium", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
                              {task.deadline && <span className="text-[10px] text-muted-foreground">{task.deadline}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground hover:border-emerald-500/30 hover:text-foreground transition-colors" onClick={() => setShowForm(true)}>
                      + Ajouter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

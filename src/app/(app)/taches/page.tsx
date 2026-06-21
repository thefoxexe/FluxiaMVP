"use client";

import React, { useState } from "react";
import {
  Plus, CheckSquare, Clock, AlertCircle, Filter,
  User, Tag, ChevronRight, Check, Circle, MoreHorizontal
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { mockTasks } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

const PRIORITY_COLORS = {
  haute: "text-red-400 bg-red-500/10 border-red-500/20",
  moyenne: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  basse: "text-green-400 bg-green-500/10 border-green-500/20",
};

const STATUS_COLUMNS = [
  { id: "todo", label: "À faire", color: "border-t-muted-foreground/30" },
  { id: "en_cours", label: "En cours", color: "border-t-blue-500" },
  { id: "terminée", label: "Terminée", color: "border-t-green-500" },
];

export default function TachesPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [view, setView] = useState<"kanban" | "list">("list");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "terminée" ? "todo" : "terminée" }
          : t
      )
    );
  };

  const byStatus = (status: string) => tasks.filter((t) => t.status === status);
  const urgentCount = tasks.filter((t) => t.priority === "haute" && t.status !== "terminée").length;
  const todayTasks = tasks.filter((t) => t.deadline === new Date().toISOString().split("T")[0] && t.status !== "terminée");

  return (
    <div>
      <Header title="Tâches" subtitle="Gérez vos tâches et suivez vos priorités" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "À faire", value: byStatus("todo").length, color: "text-foreground", bg: "bg-secondary" },
            { label: "En cours", value: byStatus("en_cours").length, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Urgent", value: urgentCount, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Terminées", value: byStatus("terminée").length, color: "text-green-400", bg: "bg-green-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={cn("p-4 rounded-xl border border-border", stat.bg)}>
              <div className={cn("text-3xl font-bold mb-1", stat.color)}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {["list", "kanban"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                  view === v ? "bg-violet-500/20 text-violet-300" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "list" ? "Liste" : "Kanban"}
              </button>
            ))}
          </div>
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle tâche
          </Button>
        </div>

        {view === "list" ? (
          <div className="space-y-2">
            {["haute", "moyenne", "basse"].map((priority) => {
              const priorityTasks = tasks.filter((t) => t.priority === priority && t.status !== "terminée");
              if (priorityTasks.length === 0) return null;
              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-2 py-1">
                    <div className={cn("text-xs font-semibold uppercase tracking-wider", PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS].split(" ")[0])}>
                      {priority === "haute" ? "🔴 Haute priorité" : priority === "moyenne" ? "🟡 Priorité moyenne" : "🟢 Basse priorité"}
                    </div>
                    <div className="text-xs text-muted-foreground">({priorityTasks.length})</div>
                  </div>
                  <div className="space-y-1.5">
                    {priorityTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border transition-all hover:border-violet-500/20",
                          task.status === "terminée" ? "border-border/50 opacity-60" : "border-border bg-card"
                        )}
                      >
                        <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                          {task.status === "terminée" ? (
                            <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-border hover:border-violet-500/50 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-medium", task.status === "terminée" && "line-through text-muted-foreground")}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {task.deadline && (
                              <div className={cn(
                                "flex items-center gap-1 text-[10px]",
                                new Date(task.deadline) < new Date() ? "text-red-400" : "text-muted-foreground"
                              )}>
                                <Clock className="w-3 h-3" />
                                {task.deadline}
                              </div>
                            )}
                            {task.contactName && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <User className="w-3 h-3" />
                                {task.contactName}
                              </div>
                            )}
                            <div className="flex gap-1">
                              {task.tags.map((tag) => (
                                <span key={tag} className="text-[9px] bg-secondary rounded px-1.5 py-0.5 text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </div>
                          <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Completed */}
            {byStatus("terminée").length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 py-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ✅ Terminées
                  </div>
                  <div className="text-xs text-muted-foreground">({byStatus("terminée").length})</div>
                </div>
                <div className="space-y-1.5">
                  {byStatus("terminée").map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 opacity-50">
                      <button onClick={() => toggleTask(task.id)}>
                        <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      </button>
                      <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Kanban */
          <div className="grid grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = byStatus(col.id);
              return (
                <div key={col.id}>
                  <div className={cn("flex items-center justify-between mb-3 pb-2 border-b-2", col.color)}>
                    <div className="text-sm font-medium">{col.label}</div>
                    <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border border-border bg-card hover:border-violet-500/20 transition-colors cursor-pointer">
                        <div className="text-xs font-medium mb-2 leading-snug">{task.title}</div>
                        <div className="flex items-center justify-between">
                          <div className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </div>
                          {task.deadline && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.deadline}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-violet-500/30 transition-colors">
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

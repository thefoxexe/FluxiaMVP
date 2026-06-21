"use client";

import React, { useState } from "react";
import {
  Search, Plus, Filter, MoreHorizontal, Phone, Mail, Building2,
  ChevronRight, Star, TrendingUp, Users, ArrowUpRight, MapPin,
  Tag, SlidersHorizontal, Grid3X3, List, Zap
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials, formatCurrency, getStatusColor } from "@/lib/utils";
import { mockContacts } from "@/lib/mock-data";
import type { Contact } from "@/lib/types";

const PIPELINE_STAGES = ["prospect", "contacté", "devis envoyé", "négociation", "gagné", "perdu"] as const;

const STAGE_COLORS: Record<string, string> = {
  prospect: "bg-blue-500/10 border-blue-500/20",
  contacté: "bg-cyan-500/10 border-cyan-500/20",
  "devis envoyé": "bg-yellow-500/10 border-yellow-500/20",
  négociation: "bg-orange-500/10 border-orange-500/20",
  gagné: "bg-green-500/10 border-green-500/20",
  perdu: "bg-red-500/10 border-red-500/20",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke={score >= 80 ? "#34d399" : score >= 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth="3"
            strokeDasharray={`${(score / 100) * 62.8} 62.8`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">{score}</span>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filtered = mockContacts.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="CRM" subtitle="Gérez vos contacts et votre pipeline de vente" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Total contacts", value: mockContacts.length, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Clients actifs", value: mockContacts.filter((c) => c.status === "gagné").length, icon: Star, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Prospects chauds", value: mockContacts.filter((c) => c.score >= 70 && c.status !== "gagné").length, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "CA clients", value: formatCurrency(mockContacts.reduce((s, c) => s + c.revenue, 0)), icon: ArrowUpRight, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un contact..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView("list")}
                className={cn("p-2 transition-colors", view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("pipeline")}
                className={cn("p-2 transition-colors", view === "pipeline" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <Button variant="gradient" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau contact</span>
            </Button>
          </div>
        </div>

        {view === "list" ? (
          /* List View */
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Entreprise</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Statut</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Score IA</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">CA</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Tags</th>
                    <th className="py-3 px-4 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{contact.company}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={cn("text-xs border rounded-full px-2.5 py-1 font-medium w-fit", getStatusColor(contact.status))}>
                          {contact.status}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={contact.score} className="w-16 h-1.5" />
                          <span className="text-xs text-muted-foreground">{contact.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">{contact.revenue > 0 ? formatCurrency(contact.revenue) : "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">{tag}</span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((contact) => (
                <button
                  key={contact.id}
                  className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="text-sm">{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{contact.revenue > 0 ? formatCurrency(contact.revenue) : "—"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{contact.company}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", getStatusColor(contact.status))}>
                          {contact.status}
                        </div>
                        <div className="flex items-center gap-1">
                          <Progress value={contact.score} className="w-12 h-1" />
                          <span className="text-[10px] text-muted-foreground">{contact.score}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Pipeline View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage) => {
              const contacts = filtered.filter((c) => c.status === stage);
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium capitalize">{stage}</div>
                    <div className="text-xs text-muted-foreground">
                      {contacts.length} · {formatCurrency(contacts.reduce((s, c) => s + c.revenue, 0))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer hover:border-violet-500/30 transition-colors",
                          STAGE_COLORS[stage]
                        )}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarFallback className="text-[10px]">{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{contact.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{contact.company}</div>
                          </div>
                          <div className="text-[10px] font-semibold text-muted-foreground">{contact.score}</div>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] bg-background/50 rounded px-1.5 py-0.5">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-colors">
                      + Ajouter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Detail Panel */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelectedContact(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-96 bg-card border-l border-border h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="text-lg">{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{selectedContact.name}</h2>
                  <div className="text-sm text-muted-foreground">{selectedContact.company}</div>
                  <div className={cn("mt-2 text-xs border rounded-full px-2.5 py-0.5 w-fit font-medium", getStatusColor(selectedContact.status))}>
                    {selectedContact.status}
                  </div>
                </div>
                <button onClick={() => setSelectedContact(null)} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                {[
                  { icon: Mail, label: selectedContact.email },
                  { icon: Phone, label: selectedContact.phone },
                  { icon: MapPin, label: selectedContact.address },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Score IA</div>
                  <div className="text-sm font-bold text-violet-400">{selectedContact.score}/100</div>
                </div>
                <Progress value={selectedContact.score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedContact.score >= 80 ? "Prospect chaud – Relancer rapidement" :
                   selectedContact.score >= 60 ? "Intérêt modéré – À suivre" :
                   "Prospect froid – Nurturing recommandé"}
                </p>
              </div>

              {/* Revenue */}
              {selectedContact.revenue > 0 && (
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                  <div className="text-xs text-green-400 font-medium mb-1">CA total généré</div>
                  <div className="text-2xl font-bold">{formatCurrency(selectedContact.revenue)}</div>
                </div>
              )}

              {/* Tags */}
              <div>
                <div className="text-sm font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedContact.notes && (
                <div>
                  <div className="text-sm font-medium mb-2">Notes</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedContact.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Button variant="gradient" className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  Créer un devis IA
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Appeler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search, Plus, Filter, MoreHorizontal, Phone, Mail,
  ChevronRight, Star, TrendingUp, Users, ArrowUpRight, MapPin,
  Grid3X3, List, Zap, X
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createContact, updateContact, deleteContact } from "@/actions/contacts";
import type { Contact } from "@/lib/supabase/types";

const PIPELINE_STAGES = ["prospect", "contacté", "devis envoyé", "négociation", "gagné", "perdu"] as const;

const STAGE_COLORS: Record<string, string> = {
  prospect: "bg-blue-500/10 border-blue-500/20",
  contacté: "bg-cyan-500/10 border-cyan-500/20",
  "devis envoyé": "bg-yellow-500/10 border-yellow-500/20",
  négociation: "bg-orange-500/10 border-orange-500/20",
  gagné: "bg-green-500/10 border-green-500/20",
  perdu: "bg-red-500/10 border-red-500/20",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  prospect: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  contacté: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "devis envoyé": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  négociation: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  gagné: "text-green-400 bg-green-500/10 border-green-500/20",
  perdu: "text-red-400 bg-red-500/10 border-red-500/20",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("fr-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(v);
}

function ContactAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
  return (
    <div className={cn("rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center font-semibold text-violet-400 shrink-0", sz)}>
      {initials(name)}
    </div>
  );
}

export default function CRMPage() {
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", company: "", phone: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("contacts").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setContacts(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = contacts.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateContact = () => {
    if (!newContact.name) return;
    startTransition(async () => {
      const { data, error } = await createContact({
        name: newContact.name,
        email: newContact.email || null,
        company: newContact.company || null,
        phone: newContact.phone || null,
        country: "CH",
      });
      if (!error && data) {
        setContacts((prev) => [data as Contact, ...prev]);
        setNewContact({ name: "", email: "", company: "", phone: "" });
        setShowNewForm(false);
      }
    });
  };

  const handleDeleteContact = (id: string) => {
    startTransition(async () => {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSelectedContact(null);
    });
  };

  return (
    <div>
      <Header title="CRM" subtitle="Gérez vos contacts et votre pipeline de vente" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total contacts", value: contacts.length, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Clients actifs", value: contacts.filter((c) => c.status === "gagné").length, icon: Star, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Prospects chauds", value: contacts.filter((c) => c.score >= 70 && c.status !== "gagné").length, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "CA clients", value: formatCurrency(contacts.reduce((s, c) => s + (c.revenue ?? 0), 0)), icon: ArrowUpRight, color: "text-cyan-400", bg: "bg-cyan-500/10" },
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Rechercher un contact..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                <List className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setView("pipeline")} className={cn("p-2 transition-colors", view === "pipeline" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowNewForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Nouveau contact</span>
            </Button>
          </div>
        </div>

        {/* New Contact Form */}
        {showNewForm && (
          <div className="p-4 rounded-lg border border-violet-600/30 bg-violet-600/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nouveau contact</span>
              <button onClick={() => setShowNewForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nom *" className="h-8 text-xs" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
              <Input placeholder="Entreprise" className="h-8 text-xs" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
              <Input placeholder="Email" className="h-8 text-xs" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
              <Input placeholder="Téléphone" className="h-8 text-xs" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs gap-1" onClick={handleCreateContact} disabled={!newContact.name || isPending}>
                {isPending ? "Création..." : "Créer le contact"}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowNewForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg border border-border bg-secondary/20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "Aucun contact trouvé" : "Aucun contact pour l'instant"}
            </p>
            {!search && (
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowNewForm(true)}>
                <Plus className="w-3.5 h-3.5" /> Ajouter votre premier contact
              </Button>
            )}
          </div>
        ) : view === "list" ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Entreprise</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">CA</th>
                    <th className="py-2.5 px-4 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((contact) => (
                    <tr key={contact.id} className="hover:bg-secondary/20 transition-colors cursor-pointer group" onClick={() => setSelectedContact(contact)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ContactAvatar name={contact.name} />
                          <div>
                            <div className="text-sm font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground">{contact.email ?? "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{contact.company ?? "—"}</td>
                      <td className="py-3 px-4">
                        <span className={cn("text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_TEXT_COLORS[contact.status])}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={contact.score} className="w-16 h-1" />
                          <span className="text-xs text-muted-foreground">{contact.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{contact.revenue > 0 ? formatCurrency(contact.revenue) : "—"}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-border">
              {filtered.map((contact) => (
                <button key={contact.id} className="w-full text-left p-4 hover:bg-secondary/20 transition-colors" onClick={() => setSelectedContact(contact)}>
                  <div className="flex items-center gap-3">
                    <ContactAvatar name={contact.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{contact.revenue > 0 ? formatCurrency(contact.revenue) : "—"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{contact.company ?? contact.email ?? "—"}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", STATUS_TEXT_COLORS[contact.status])}>{contact.status}</span>
                        <div className="flex items-center gap-1">
                          <Progress value={contact.score} className="w-10 h-1" />
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
          <div className="flex gap-3 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage) => {
              const stageContacts = filtered.filter((c) => c.status === stage);
              return (
                <div key={stage} className="flex-shrink-0 w-56">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium capitalize">{stage}</div>
                    <div className="text-[10px] text-muted-foreground">{stageContacts.length}</div>
                  </div>
                  <div className="space-y-2">
                    {stageContacts.map((contact) => (
                      <div key={contact.id} className={cn("p-3 rounded-lg border cursor-pointer hover:border-violet-500/30 transition-colors", STAGE_COLORS[stage])} onClick={() => setSelectedContact(contact)}>
                        <div className="flex items-center gap-2">
                          <ContactAvatar name={contact.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{contact.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{contact.company ?? "—"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-colors" onClick={() => setShowNewForm(true)}>
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
          <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
          <div className="w-80 sm:w-96 bg-card border-l border-border h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <div className="flex items-start gap-3">
                <ContactAvatar name={selectedContact.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{selectedContact.name}</h2>
                  <div className="text-sm text-muted-foreground">{selectedContact.company ?? "—"}</div>
                  <span className={cn("mt-1.5 inline-block text-[11px] border rounded-full px-2 py-0.5 font-medium", STATUS_TEXT_COLORS[selectedContact.status])}>
                    {selectedContact.status}
                  </span>
                </div>
                <button onClick={() => setSelectedContact(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                {[
                  { icon: Mail, value: selectedContact.email },
                  { icon: Phone, value: selectedContact.phone },
                  { icon: MapPin, value: selectedContact.city },
                ].filter((i) => i.value).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-xs">{item.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">Score IA</span>
                  <span className="text-xs font-bold text-violet-400">{selectedContact.score}/100</span>
                </div>
                <Progress value={selectedContact.score} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {selectedContact.score >= 80 ? "Prospect chaud – Relancer rapidement" :
                   selectedContact.score >= 60 ? "Intérêt modéré – À suivre" :
                   "Prospect froid – Nurturing recommandé"}
                </p>
              </div>

              {selectedContact.revenue > 0 && (
                <div className="p-3.5 rounded-lg bg-green-500/5 border border-green-500/10">
                  <div className="text-[11px] text-green-400 font-medium mb-1">CA total généré</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedContact.revenue)}</div>
                </div>
              )}

              {selectedContact.tags?.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedContact.notes && (
                <div>
                  <div className="text-xs font-medium mb-2">Notes</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedContact.notes}</p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-border">
                <Button className="w-full h-9 gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5" />
                  Créer un devis IA
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <Phone className="w-3.5 h-3.5" /> Appeler
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs" onClick={() => handleDeleteContact(selectedContact.id)}>
                  Supprimer le contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

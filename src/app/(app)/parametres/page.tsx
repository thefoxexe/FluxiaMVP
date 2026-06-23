"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  User, Building2, Mail, Bell, Shield, CreditCard, Zap,
  Globe, Key, Webhook, Users, ChevronRight, Check, Upload, Plus, Settings2, ExternalLink
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  { id: "profile", label: "Profil", icon: User },
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "email", label: "Emails connectés", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Équipe", icon: Users },
  { id: "ai", label: "Configuration IA", icon: Zap },
  { id: "billing", label: "Facturation", icon: CreditCard },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "api", label: "API & Webhooks", icon: Webhook },
];

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState({
    email_new_prospect: true,
    email_invoice_paid: true,
    email_quote_accepted: true,
    push_urgent: true,
    push_reminders: false,
    weekly_report: true,
  });
  const [aiMode, setAiMode] = useState<"manuel" | "semi_autonome" | "autonome">("semi_autonome");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "", company_name: "", company_phone: "", company_address: "", company_vat: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setAiMode(data.ai_mode ?? "semi_autonome");
        setProfileForm({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          company_name: data.company_name ?? "",
          company_phone: data.company_phone ?? "",
          company_address: data.company_address ?? "",
          company_vat: data.company_vat ?? "",
        });
      }
    });
  }, []);

  const saveProfile = () => {
    setSaving(true);
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          full_name: profileForm.full_name,
          company_name: profileForm.company_name,
          company_phone: profileForm.company_phone,
          company_address: profileForm.company_address,
          company_vat: profileForm.company_vat,
        }).eq("id", user.id);
      }
      setSaving(false);
    });
  };

  const saveAiMode = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ ai_mode: aiMode }).eq("id", user.id);
      }
    });
  };

  const openStripePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div>
      <Header title="Paramètres" subtitle="Configurez votre espace Fluxia" />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="lg:w-56 border-b lg:border-b-0 lg:border-r border-border p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-none shrink-0">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex items-center gap-2 lg:gap-3 w-full px-3 py-2 rounded-lg text-xs lg:text-sm transition-colors text-left whitespace-nowrap shrink-0 lg:shrink",
                activeSection === item.id
                  ? "bg-blue-500/15 text-blue-300"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl space-y-8">

            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Mon profil</h2>
                  <p className="text-sm text-muted-foreground">Gérez vos informations personnelles.</p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-lg font-bold text-blue-400">
                    {profileForm.full_name ? profileForm.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5 mb-1.5">
                      <Upload className="w-3.5 h-3.5" /> Changer la photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Nom complet</Label>
                  <Input className="h-9 text-sm" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Email</Label>
                  <Input type="email" className="h-9 text-sm" value={profileForm.email} readOnly disabled />
                  <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié ici.</p>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Langue de l'interface</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option>Français</option>
                    <option>English</option>
                    <option>Deutsch</option>
                  </select>
                </div>

                <Button className="h-9 text-sm" onClick={saveProfile} disabled={saving || isPending}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            )}

            {activeSection === "company" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Mon entreprise</h2>
                  <p className="text-sm text-muted-foreground">Ces informations apparaissent sur vos devis et factures.</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl border border-border bg-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Ajouter le logo
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Nom de l'entreprise", value: "Entreprise SA" },
                    { label: "Email de contact", value: "contact@entreprise.ch" },
                    { label: "Téléphone", value: "+41 79 000 00 00" },
                    { label: "Adresse", value: "Rue de la Paix 1" },
                    { label: "Code postal & Ville", value: "1204 Genève" },
                    { label: "Pays", value: "Suisse" },
                    { label: "Numéro TVA", value: "CHE-123.456.789 TVA" },
                    { label: "IBAN", value: "CH93 0076 2011 6238 5295 7" },
                  ].map((f) => (
                    <div key={f.label}>
                      <Label className="text-sm mb-1.5 block">{f.label}</Label>
                      <Input defaultValue={f.value} className="h-10" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-1.5 block">Devise</Label>
                    <select className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
                      <option>CHF – Franc suisse</option>
                      <option>EUR – Euro</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Taux TVA par défaut</Label>
                    <Input defaultValue="8.1" type="number" className="h-10" />
                  </div>
                </div>

                <Button variant="gradient">Enregistrer</Button>
              </div>
            )}

            {activeSection === "email" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Emails connectés</h2>
                  <p className="text-sm text-muted-foreground">Connectez vos boîtes email pour les gérer depuis Fluxia.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Gmail", email: "jean@gmail.com", connected: true, icon: "G", color: "bg-red-500/10 text-red-400" },
                    { name: "Outlook", email: "—", connected: false, icon: "O", color: "bg-blue-500/10 text-blue-400" },
                    { name: "IMAP personnalisé", email: "—", connected: false, icon: "@", color: "bg-gray-500/10 text-gray-400" },
                  ].map((acc) => (
                    <div key={acc.name} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold", acc.color)}>
                          {acc.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{acc.name}</div>
                          <div className="text-xs text-muted-foreground">{acc.email}</div>
                        </div>
                      </div>
                      {acc.connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-xs">Connecté</Badge>
                          <Button variant="outline" size="sm">Déconnecter</Button>
                        </div>
                      ) : (
                        <Button variant="gradient" size="sm">Connecter</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Configuration IA</h2>
                  <p className="text-sm text-muted-foreground">Personnalisez le comportement de votre assistant IA.</p>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">Mode d'autonomie</div>
                  <div className="space-y-3">
                    {([
                      { id: "manuel" as const, label: "Assistant", desc: "L'IA propose des suggestions et brouillons. Vous validez tout." },
                      { id: "semi_autonome" as const, label: "Semi-autonome", desc: "L'IA gère les relances et le classement. Validation requise pour les emails clients." },
                      { id: "autonome" as const, label: "Autonome", desc: "L'IA gère tout le workflow. Supervision minimale. Pour utilisateurs avancés." },
                    ] as const).map((mode) => (
                      <label key={mode.id} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-blue-500/20 cursor-pointer has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 transition-all">
                        <input
                          type="radio"
                          name="ai_mode"
                          value={mode.id}
                          checked={aiMode === mode.id}
                          onChange={() => setAiMode(mode.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <div>
                          <div className="text-sm font-medium mb-0.5">{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium mb-3">Capacités IA</div>
                  <div className="space-y-3">
                    {[
                      { label: "Classification automatique des emails", key: "classify" },
                      { label: "Résumé automatique des threads", key: "summarize" },
                      { label: "Génération de brouillons de réponse", key: "draft" },
                      { label: "Scoring automatique des prospects", key: "score" },
                      { label: "Génération de devis depuis un email", key: "quote" },
                      { label: "Relances automatiques IA", key: "reminders" },
                      { label: "Rapport journalier IA", key: "daily" },
                    ].map((cap) => (
                      <div key={cap.key} className="flex items-center justify-between">
                        <span className="text-sm">{cap.label}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="h-9 text-sm" onClick={saveAiMode} disabled={isPending}>
                  {isPending ? "Enregistrement..." : "Enregistrer la configuration"}
                </Button>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Choisissez comment vous voulez être notifié.</p>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-3">Email</div>
                  <div className="space-y-3">
                    {[
                      { label: "Nouveau prospect détecté", key: "email_new_prospect" },
                      { label: "Facture payée", key: "email_invoice_paid" },
                      { label: "Devis accepté", key: "email_quote_accepted" },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between">
                        <span className="text-sm">{n.label}</span>
                        <Switch
                          checked={notifications[n.key as keyof typeof notifications]}
                          onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-semibold mb-3">Application</div>
                  <div className="space-y-3">
                    {[
                      { label: "Alertes urgentes", key: "push_urgent" },
                      { label: "Rappels de tâches", key: "push_reminders" },
                      { label: "Rapport hebdomadaire IA", key: "weekly_report" },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between">
                        <span className="text-sm">{n.label}</span>
                        <Switch
                          checked={notifications[n.key as keyof typeof notifications]}
                          onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="gradient">Enregistrer</Button>
              </div>
            )}

            {activeSection === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Facturation</h2>
                  <p className="text-sm text-muted-foreground">Gérez votre abonnement Fluxia.</p>
                </div>

                <div className="p-5 rounded-lg border border-blue-600/30 bg-blue-600/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-blue-400 font-medium mb-1">Plan actuel</div>
                      <div className="text-xl font-bold capitalize">{profile?.subscription_plan ?? "Free"}</div>
                    </div>
                    <Badge variant={profile?.subscription_status === "active" ? "success" : "secondary"} className="capitalize">
                      {profile?.subscription_status === "active" ? "Actif" : profile?.subscription_status ?? "Gratuit"}
                    </Badge>
                  </div>
                  {profile?.subscription_period_end && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Renouvellement le {new Date(profile.subscription_period_end).toLocaleDateString("fr-CH")}
                    </p>
                  )}
                  <Button className="h-9 gap-2 text-sm" onClick={openStripePortal}>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Gérer l'abonnement
                  </Button>
                </div>

                {profile?.subscription_plan === "free" && (
                  <div className="p-5 rounded-lg border border-border">
                    <div className="text-sm font-medium mb-3">Passer à un plan payant</div>
                    <p className="text-xs text-muted-foreground mb-4">Débloquez toutes les fonctionnalités IA et l'accès multi-utilisateurs.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Solo", price: "49", desc: "1 utilisateur" },
                        { name: "Team", price: "99", desc: "5 utilisateurs", highlight: true },
                        { name: "Business", price: "199", desc: "Illimité" },
                      ].map((plan) => (
                        <div key={plan.name} className={cn("p-3 rounded-lg border text-center", plan.highlight ? "border-blue-600/50 bg-blue-600/5" : "border-border")}>
                          <div className="text-xs font-semibold mb-1">{plan.name}</div>
                          <div className="text-lg font-bold">CHF {plan.price}</div>
                          <div className="text-[10px] text-muted-foreground mb-2">/mois · {plan.desc}</div>
                          <Button size="sm" className="w-full h-7 text-xs" variant={plan.highlight ? "default" : "outline"}>
                            Choisir
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "api" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">API & Webhooks</h2>
                  <p className="text-sm text-muted-foreground">Intégrez Fluxia dans vos outils via notre API REST.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <div className="text-sm font-medium mb-3">Clé API</div>
                  <div className="flex items-center gap-2">
                    <Input value="flx_live_sk_••••••••••••••••••••••••••••••••" readOnly className="font-mono text-xs h-9" />
                    <Button variant="outline" size="sm">Copier</Button>
                    <Button variant="outline" size="sm">Régénérer</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Ne partagez jamais votre clé API.</p>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-3">Webhooks</div>
                  <Button variant="outline" className="gap-2 w-full justify-start">
                    <Plus className="w-4 h-4" />
                    Ajouter un endpoint webhook
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="text-sm font-medium mb-2">Documentation API</div>
                  <p className="text-xs text-muted-foreground mb-3">Consultez notre documentation complète pour intégrer Fluxia dans vos outils.</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Ouvrir la documentation
                  </Button>
                </div>
              </div>
            )}

            {/* Default for unimplemented sections */}
            {!["profile", "company", "email", "ai", "notifications", "billing", "api"].includes(activeSection) && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2 capitalize">{activeSection}</h2>
                <p className="text-muted-foreground text-sm">Cette section sera disponible prochainement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


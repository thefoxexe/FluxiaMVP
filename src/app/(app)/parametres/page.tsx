"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  User, Building2, Mail, Bell, Shield, CreditCard, Zap,
  Globe, Webhook, Users, ExternalLink, Upload, Plus,
  Copy, RefreshCw, Check, Eye, EyeOff, Send, Lock
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { updateCompanyProfile, changePassword, generateApiKey, inviteTeamMember } from "@/actions/profile";
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

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-card border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
      <Check className="w-4 h-4 shrink-0" /> {msg}
    </div>
  );
}

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState({
    email_new_prospect: true,
    email_invoice_paid: true,
    email_quote_accepted: true,
    push_urgent: true,
    push_reminders: false,
    weekly_report: true,
  });
  const [aiMode, setAiMode] = useState<"manuel" | "semi_autonome" | "autonome">("semi_autonome");
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "" });
  const [companyForm, setCompanyForm] = useState({
    company_name: "", company_phone: "", company_address: "",
    company_city: "", company_zip: "", company_country: "CH",
    company_vat: "", company_website: "",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [apiKey, setApiKey] = useState("flx_live_••••••••••••••••••••••••••••••");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setAiMode(data.ai_mode ?? "semi_autonome");
        setProfileForm({ full_name: data.full_name ?? "", email: data.email ?? "" });
        setCompanyForm({
          company_name: data.company_name ?? "",
          company_phone: data.company_phone ?? "",
          company_address: data.company_address ?? "",
          company_city: data.company_city ?? "",
          company_zip: data.company_zip ?? "",
          company_country: data.company_country ?? "CH",
          company_vat: data.company_vat ?? "",
          company_website: data.company_website ?? "",
        });
      }
    });
  }, []);

  const showToast = (msg: string) => setToast(msg);

  const saveProfile = () => {
    setSaving(true);
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ full_name: profileForm.full_name }).eq("id", user.id);
        showToast("Profil enregistré");
      }
      setSaving(false);
    });
  };

  const saveCompany = () => {
    setSaving(true);
    startTransition(async () => {
      await updateCompanyProfile(companyForm);
      showToast("Entreprise enregistrée");
      setSaving(false);
    });
  };

  const saveAiMode = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ ai_mode: aiMode }).eq("id", user.id);
        showToast("Configuration IA enregistrée");
      }
    });
  };

  const saveNotifications = () => {
    localStorage.setItem("fluxia_notif_prefs", JSON.stringify(notifications));
    showToast("Préférences de notification enregistrées");
  };

  const handlePasswordChange = () => {
    if (passwordForm.next !== passwordForm.confirm) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.next.length < 8) {
      alert("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    startTransition(async () => {
      const res = await changePassword(passwordForm.next);
      if (res.error) alert(res.error);
      else {
        setPasswordForm({ current: "", next: "", confirm: "" });
        showToast("Mot de passe modifié");
      }
    });
  };

  const handleGenerateApiKey = () => {
    startTransition(async () => {
      const res = await generateApiKey();
      if (res.data) {
        setApiKey(res.data);
        setApiKeyVisible(true);
        showToast("Nouvelle clé API générée");
      }
    });
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    startTransition(async () => {
      const res = await inviteTeamMember(inviteEmail);
      if (res.error) alert(res.error);
      else {
        setInviteEmail("");
        showToast(`Invitation envoyée à ${inviteEmail}`);
      }
    });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    showToast("Clé API copiée");
  };

  const openStripePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div>
      <Header title="Paramètres" subtitle="Configurez votre espace Fluxia" />

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Sidebar Nav */}
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

            {/* ── PROFIL ── */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Mon profil</h2>
                  <p className="text-sm text-muted-foreground">Gérez vos informations personnelles.</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-lg font-bold text-blue-400">
                    {profileForm.full_name ? profileForm.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5 mb-1.5"><Upload className="w-3.5 h-3.5" /> Changer la photo</Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Nom complet</Label>
                  <Input className="h-9 text-sm" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
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

            {/* ── ENTREPRISE ── */}
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
                  <Button variant="outline" size="sm" className="gap-2"><Upload className="w-4 h-4" />Ajouter le logo</Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Nom de l'entreprise</Label>
                    <Input className="h-9 text-sm" value={companyForm.company_name} onChange={e => setCompanyForm(f => ({ ...f, company_name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Téléphone</Label>
                      <Input className="h-9 text-sm" value={companyForm.company_phone} onChange={e => setCompanyForm(f => ({ ...f, company_phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Site web</Label>
                      <Input className="h-9 text-sm" placeholder="https://..." value={companyForm.company_website} onChange={e => setCompanyForm(f => ({ ...f, company_website: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Adresse</Label>
                    <Input className="h-9 text-sm" value={companyForm.company_address} onChange={e => setCompanyForm(f => ({ ...f, company_address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Code postal</Label>
                      <Input className="h-9 text-sm" value={companyForm.company_zip} onChange={e => setCompanyForm(f => ({ ...f, company_zip: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Ville</Label>
                      <Input className="h-9 text-sm" value={companyForm.company_city} onChange={e => setCompanyForm(f => ({ ...f, company_city: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Pays</Label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={companyForm.company_country} onChange={e => setCompanyForm(f => ({ ...f, company_country: e.target.value }))}>
                        <option value="CH">Suisse</option>
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="DE">Allemagne</option>
                        <option value="LU">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Numéro TVA</Label>
                      <Input className="h-9 text-sm" placeholder="CHE-123.456.789 TVA" value={companyForm.company_vat} onChange={e => setCompanyForm(f => ({ ...f, company_vat: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <Button className="h-9 text-sm" onClick={saveCompany} disabled={saving || isPending}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            )}

            {/* ── EMAILS CONNECTÉS ── */}
            {activeSection === "email" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Emails connectés</h2>
                  <p className="text-sm text-muted-foreground">Connectez vos boîtes email pour les gérer depuis Fluxia.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Gmail", desc: "Connecter via Google OAuth", icon: "G", color: "bg-red-500/10 text-red-400 border-red-500/20", connected: false },
                    { name: "Outlook / Microsoft 365", desc: "Connecter via Microsoft OAuth", icon: "O", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", connected: false },
                    { name: "IMAP personnalisé", desc: "Configurer manuellement", icon: "@", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", connected: false },
                  ].map(acc => (
                    <div key={acc.name} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border", acc.color)}>{acc.icon}</div>
                        <div>
                          <div className="text-sm font-medium">{acc.name}</div>
                          <div className="text-xs text-muted-foreground">{acc.desc}</div>
                        </div>
                      </div>
                      {acc.connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-xs">Connecté</Badge>
                          <Button variant="outline" size="sm">Déconnecter</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> Connecter
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary/20">
                  <p className="text-xs text-muted-foreground">
                    La connexion Gmail/Outlook nécessite de configurer les clés OAuth dans vos variables d'environnement (<code className="text-blue-400">GOOGLE_CLIENT_ID</code>, <code className="text-blue-400">GOOGLE_CLIENT_SECRET</code>).
                    Une fois configurées, les boutons "Connecter" lanceront le flux OAuth standard.
                  </p>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
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
                    ].map(n => (
                      <div key={n.key} className="flex items-center justify-between">
                        <span className="text-sm">{n.label}</span>
                        <Switch checked={notifications[n.key as keyof typeof notifications]} onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))} />
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
                    ].map(n => (
                      <div key={n.key} className="flex items-center justify-between">
                        <span className="text-sm">{n.label}</span>
                        <Switch checked={notifications[n.key as keyof typeof notifications]} onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="h-9 text-sm" onClick={saveNotifications}>Enregistrer</Button>
              </div>
            )}

            {/* ── ÉQUIPE ── */}
            {activeSection === "team" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Équipe</h2>
                  <p className="text-sm text-muted-foreground">Invitez des collaborateurs dans votre espace Fluxia.</p>
                </div>
                {(profile?.subscription_plan === "free" || profile?.subscription_plan === "solo") && (
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                    <p className="text-xs text-yellow-400 font-medium mb-1">Fonctionnalité Team et Business</p>
                    <p className="text-xs text-muted-foreground mb-3">Le multi-utilisateurs est disponible à partir du plan Team (CHF 99/mois).</p>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={openStripePortal}>Passer au plan Team</Button>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Inviter un membre</Label>
                  <div className="flex gap-2">
                    <Input type="email" className="h-9 text-sm flex-1" placeholder="prenom@entreprise.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} disabled={profile?.subscription_plan === "free" || profile?.subscription_plan === "solo"} />
                    <Button size="sm" className="h-9 gap-1.5" onClick={handleInvite} disabled={!inviteEmail || isPending || profile?.subscription_plan === "free" || profile?.subscription_plan === "solo"}>
                      <Send className="w-3.5 h-3.5" /> Inviter
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">L'invité recevra un email pour créer son compte.</p>
                </div>
              </div>
            )}

            {/* ── CONFIGURATION IA ── */}
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
                    ] as const).map(mode => (
                      <label key={mode.id} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-blue-500/20 cursor-pointer has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 transition-all">
                        <input type="radio" name="ai_mode" value={mode.id} checked={aiMode === mode.id} onChange={() => setAiMode(mode.id)} className="mt-1 accent-blue-600" />
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
                    ].map(cap => (
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

            {/* ── FACTURATION ── */}
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
                    <ExternalLink className="w-3.5 h-3.5" /> Gérer l'abonnement
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
                      ].map(plan => (
                        <div key={plan.name} className={cn("p-3 rounded-lg border text-center", plan.highlight ? "border-blue-600/50 bg-blue-600/5" : "border-border")}>
                          <div className="text-xs font-semibold mb-1">{plan.name}</div>
                          <div className="text-lg font-bold">CHF {plan.price}</div>
                          <div className="text-[10px] text-muted-foreground mb-2">/mois · {plan.desc}</div>
                          <Button size="sm" className="w-full h-7 text-xs" variant={plan.highlight ? "default" : "outline"} onClick={openStripePortal}>Choisir</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SÉCURITÉ ── */}
            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Sécurité</h2>
                  <p className="text-sm text-muted-foreground">Protégez votre compte Fluxia.</p>
                </div>
                <div className="p-5 rounded-xl border border-border space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Changer le mot de passe</div>
                      <div className="text-xs text-muted-foreground">Minimum 8 caractères</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-9 text-sm pr-10"
                          placeholder="••••••••"
                          value={passwordForm.next}
                          onChange={e => setPasswordForm(f => ({ ...f, next: e.target.value }))}
                        />
                        <button onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Confirmer le mot de passe</Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="h-9 text-sm"
                        placeholder="••••••••"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button className="h-9 text-sm w-full" onClick={handlePasswordChange} disabled={!passwordForm.next || !passwordForm.confirm || isPending}>
                    Changer le mot de passe
                  </Button>
                </div>
                <div className="p-4 rounded-xl border border-border">
                  <div className="text-sm font-medium mb-2">Sessions actives</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Session actuelle</span>
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* ── API & WEBHOOKS ── */}
            {activeSection === "api" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">API & Webhooks</h2>
                  <p className="text-sm text-muted-foreground">Intégrez Fluxia dans vos outils via notre API REST.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <div className="text-sm font-medium mb-3">Clé API</div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={apiKeyVisible ? apiKey : apiKey.replace(/[^_]/g, (c, i) => i > 8 ? "•" : c)}
                      readOnly
                      className="font-mono text-xs h-9 flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setApiKeyVisible(v => !v)}>
                      {apiKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={copyApiKey}>
                      <Copy className="w-3.5 h-3.5" /> Copier
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={handleGenerateApiKey} disabled={isPending}>
                      <RefreshCw className="w-3.5 h-3.5" /> Régénérer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Ne partagez jamais votre clé API. Elle donne accès complet à vos données.</p>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-3">Webhook entrant</div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium block">URL de votre endpoint</Label>
                    <div className="flex gap-2">
                      <Input className="h-9 text-sm flex-1" placeholder="https://votre-app.com/webhook" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                      <Button size="sm" className="h-9 shrink-0" onClick={() => { if (webhookUrl) showToast("Webhook enregistré"); }}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Fluxia enverra les événements (nouveau contact, facture payée…) à cette URL en POST.</p>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-3">Intégrations</div>
                  <div className="space-y-3">
                    {[
                      { name: "Slack", desc: "Notifications dans un channel Slack", placeholder: "https://hooks.slack.com/services/..." },
                      { name: "Zapier", desc: "Connectez Fluxia à 5000+ apps", placeholder: "https://hooks.zapier.com/..." },
                      { name: "Make (Integromat)", desc: "Workflows avancés avec Make", placeholder: "https://hook.eu1.make.com/..." },
                    ].map(int => (
                      <div key={int.name} className="p-4 rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{int.name}</div>
                            <div className="text-xs text-muted-foreground">{int.desc}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input className="h-8 text-xs flex-1" placeholder={int.placeholder} />
                          <Button size="sm" className="h-8 text-xs shrink-0" onClick={() => showToast(`${int.name} configuré`)}>Sauver</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="text-sm font-medium mb-2">Documentation API</div>
                  <p className="text-xs text-muted-foreground mb-3">Consultez notre documentation pour intégrer Fluxia dans vos outils.</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" /> Ouvrir la documentation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

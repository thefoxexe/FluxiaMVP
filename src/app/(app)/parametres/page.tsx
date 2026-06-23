"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  User, Building2, Mail, Bell, Shield, CreditCard, Zap,
  Globe, Webhook, Users, ExternalLink, Upload, Plus, Copy,
  RefreshCw, Check, Eye, EyeOff, Send, Lock, ChevronRight,
  Sparkles, Star, Rocket, Crown
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
import { updateCompanyProfile, updateLogoUrl, updateInvoiceTemplate, changePassword, generateApiKey, inviteTeamMember } from "@/actions/profile";
import type { Profile } from "@/lib/supabase/types";

const NAV = [
  { id: "profile",       label: "Profil",           icon: User,       desc: "Vos infos personnelles" },
  { id: "company",       label: "Entreprise",        icon: Building2,  desc: "Devis & factures" },
  { id: "billing",       label: "Abonnement",        icon: CreditCard, desc: "Plan & paiement" },
  { id: "team",          label: "Équipe",            icon: Users,      desc: "Membres & invitations" },
  { id: "ai",            label: "Configuration IA",  icon: Zap,        desc: "Mode & capacités" },
  { id: "notifications", label: "Notifications",     icon: Bell,       desc: "Alertes & rapports" },
  { id: "email",         label: "Emails connectés",  icon: Mail,       desc: "Gmail, Outlook…" },
  { id: "security",      label: "Sécurité",          icon: Shield,     desc: "Mot de passe" },
  { id: "api",           label: "API & Webhooks",    icon: Webhook,    desc: "Intégrations" },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    desc: "Pour démarrer",
    icon: Star,
    color: "border-border",
    features: ["5 devis/mois", "10 factures/mois", "50 contacts", "Assistant IA limité"],
  },
  {
    id: "solo",
    name: "Solo",
    price: 49,
    desc: "Indépendants",
    icon: Rocket,
    color: "border-emerald-500/40",
    features: ["Devis & factures illimités", "500 contacts", "Assistant IA complet", "Automatisations x5"],
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    desc: "Équipes jusqu'à 5",
    icon: Users,
    color: "border-emerald-500/40",
    popular: true,
    features: ["Tout Solo", "5 utilisateurs", "Automatisations illimitées", "Rapports avancés", "Priorité support"],
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    desc: "Grandes équipes",
    icon: Crown,
    color: "border-border",
    features: ["Tout Team", "Utilisateurs illimités", "API accès complet", "SSO & audit logs", "SLA 99.9%"],
  },
];

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
      <Check className="w-4 h-4 shrink-0" /> {msg}
    </div>
  );
}

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState({
    email_new_prospect: true, email_invoice_paid: true, email_quote_accepted: true,
    push_urgent: true, push_reminders: false, weekly_report: true,
  });
  const [aiMode, setAiMode] = useState<"manuel" | "semi_autonome" | "autonome">("semi_autonome");
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "" });
  const [companyForm, setCompanyForm] = useState({
    company_name: "", company_phone: "", company_address: "",
    company_city: "", company_zip: "", company_country: "CH",
    company_vat: "", company_website: "", company_email: "",
    company_iban: "", company_currency: "CHF",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState("moderne");
  const [passwordForm, setPasswordForm] = useState({ next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [integrations, setIntegrations] = useState({ slack: "", zapier: "", make: "" });
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
          company_email: (data as Record<string, unknown>).company_email as string ?? "",
          company_iban: (data as Record<string, unknown>).company_iban as string ?? "",
          company_currency: (data as Record<string, unknown>).company_currency as string ?? "CHF",
        });
        if ((data as Record<string, unknown>).api_key) {
          setApiKey((data as Record<string, unknown>).api_key as string);
        }
        if ((data as Record<string, unknown>).invoice_template) {
          setInvoiceTemplate((data as Record<string, unknown>).invoice_template as string);
        }
      }
      const saved = localStorage.getItem("fluxia_notif_prefs");
      if (saved) setNotifications(JSON.parse(saved));
    });
  }, []);

  const show = (msg: string) => setToast(msg);

  const saveProfile = () => {
    setSaving(true);
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").update({ full_name: profileForm.full_name }).eq("id", user.id);
        if (error) alert("Erreur: " + error.message);
        else show("Profil enregistré");
      }
      setSaving(false);
    });
  };

  const saveCompany = () => {
    setSaving(true);
    startTransition(async () => {
      const res = await updateCompanyProfile(companyForm);
      if (res.error) alert("Erreur sauvegarde entreprise: " + res.error);
      else show("Entreprise enregistrée");
      setSaving(false);
    });
  };

  const saveAiMode = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").update({ ai_mode: aiMode }).eq("id", user.id);
        if (error) alert("Erreur: " + error.message);
        else show("Configuration IA enregistrée");
      }
    });
  };

  const saveNotifications = () => {
    localStorage.setItem("fluxia_notif_prefs", JSON.stringify(notifications));
    show("Préférences enregistrées");
  };

  const handlePasswordChange = () => {
    if (passwordForm.next !== passwordForm.confirm) return alert("Les mots de passe ne correspondent pas.");
    if (passwordForm.next.length < 8) return alert("Minimum 8 caractères.");
    startTransition(async () => {
      const res = await changePassword(passwordForm.next);
      if (res.error) alert(res.error);
      else { setPasswordForm({ next: "", confirm: "" }); show("Mot de passe modifié"); }
    });
  };

  const handleGenerateApiKey = () => {
    startTransition(async () => {
      const res = await generateApiKey();
      if (res.data) { setApiKey(res.data); setApiKeyVisible(true); show("Nouvelle clé API générée"); }
    });
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    startTransition(async () => {
      const res = await inviteTeamMember(inviteEmail);
      if (res.error) alert(res.error);
      else { setInviteEmail(""); show(`Invitation envoyée à ${inviteEmail}`); }
    });
  };

  const copyApiKey = () => { navigator.clipboard.writeText(apiKey); show("Clé API copiée"); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Fichier trop grand (max 2 Mo)"); return; }
    setLogoUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLogoUploading(false); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const url = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateLogoUrl(url);
      setProfile(p => p ? { ...p, company_logo_url: url } : p);
      show("Logo mis à jour");
    } else { alert("Erreur upload: " + error.message); }
    setLogoUploading(false);
  };

  const handleSaveTemplate = async (tpl: string) => {
    setInvoiceTemplate(tpl);
    await updateInvoiceTemplate(tpl);
    localStorage.setItem("fluxia_invoice_template", tpl);
    show("Modèle de document enregistré");
  };

  const openStripePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Erreur: portail Stripe indisponible. Vérifiez votre abonnement.");
  };

  const openStripeCheckout = async (plan: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; }
      else { alert(data.error ?? "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_* dans les variables d'environnement Vercel."); }
    } catch { alert("Erreur de connexion à Stripe."); }
  };

  const currentPlan = profile?.subscription_plan ?? "free";
  const isActive = profile?.subscription_status === "active";
  const isFree = currentPlan === "free";
  const isPaidPlan = !isFree && isActive;
  const canInvite = ["team", "business"].includes(currentPlan) && isActive;

  return (
    <div>
      <Header title="Paramètres" subtitle="Gérez votre compte et vos intégrations" />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="flex h-[calc(100vh-64px)]">
        {/* ── Sidebar ── */}
        <div className="w-16 sm:w-52 lg:w-56 border-r border-border flex flex-col py-2 shrink-0 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-colors text-left group",
                activeSection === item.id
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", activeSection === item.id ? "text-emerald-400" : "")} />
              <div className="hidden sm:block min-w-0">
                <div className="text-xs font-medium leading-tight">{item.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-xl">

            {/* ─────────── PROFIL ─────────── */}
            {activeSection === "profile" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Mon profil</h2><p className="text-sm text-muted-foreground mt-0.5">Informations personnelles de votre compte.</p></div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-14 h-14 rounded-full bg-emerald-600/20 border-2 border-emerald-600/30 flex items-center justify-center text-base font-bold text-emerald-400 shrink-0">
                    {profileForm.full_name ? profileForm.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{profileForm.full_name || "Sans nom"}</div>
                    <div className="text-xs text-muted-foreground">{profileForm.email}</div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 mt-1 px-2"><Upload className="w-3 h-3" />Changer la photo</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Nom complet</Label>
                    <Input className="h-9 text-sm" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Email</Label>
                    <Input className="h-9 text-sm opacity-60" value={profileForm.email} readOnly disabled />
                    <p className="text-[11px] text-muted-foreground mt-1">L'email ne peut pas être modifié ici.</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Langue</Label>
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option>Français</option><option>English</option><option>Deutsch</option>
                    </select>
                  </div>
                </div>
                <Button className="h-9 text-sm" onClick={saveProfile} disabled={saving || isPending}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            )}

            {/* ─────────── ENTREPRISE ─────────── */}
            {activeSection === "company" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Mon entreprise</h2><p className="text-sm text-muted-foreground mt-0.5">Ces informations apparaissent sur vos devis et factures.</p></div>

                {/* Logo upload */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <Label className="text-xs font-medium mb-3 block">Logo de l'entreprise</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {profile?.company_logo_url ? (
                        <img src={profile.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted-foreground/30" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">PNG, JPG ou SVG · Max 2 Mo · Fond transparent recommandé</p>
                      <label className="cursor-pointer">
                        <input type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium transition-colors", logoUploading ? "opacity-50" : "hover:bg-secondary")}>
                          <Upload className="w-3.5 h-3.5" />
                          {logoUploading ? "Upload en cours..." : profile?.company_logo_url ? "Remplacer" : "Choisir un fichier"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Template selector */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <Label className="text-xs font-medium mb-3 block">Modèle de documents (devis & factures)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "moderne", label: "Moderne", desc: "En-tête vert, épuré" },
                      { id: "classique", label: "Classique", desc: "Style formel suisse" },
                      { id: "minimaliste", label: "Minimaliste", desc: "Ultra-simple" },
                    ].map(tpl => (
                      <button key={tpl.id} onClick={() => handleSaveTemplate(tpl.id)}
                        className={cn("p-3 rounded-lg border text-left transition-all", invoiceTemplate === tpl.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-emerald-500/20")}>
                        <div className="text-xs font-semibold mb-0.5">{tpl.label}</div>
                        <div className="text-[10px] text-muted-foreground">{tpl.desc}</div>
                        {invoiceTemplate === tpl.id && <div className="text-[10px] text-emerald-400 mt-1 font-medium">✓ Actif</div>}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Aperçu disponible dans chaque devis/facture → "Voir / Imprimer PDF"</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Nom de l'entreprise</Label>
                    <Input className="h-9 text-sm" placeholder="Acme SA" value={companyForm.company_name} onChange={e => setCompanyForm(f => ({ ...f, company_name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Email entreprise</Label>
                      <Input type="email" className="h-9 text-sm" placeholder="contact@entreprise.ch" value={companyForm.company_email} onChange={e => setCompanyForm(f => ({ ...f, company_email: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Téléphone</Label>
                      <Input className="h-9 text-sm" placeholder="+41 79 000 00 00" value={companyForm.company_phone} onChange={e => setCompanyForm(f => ({ ...f, company_phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Site web</Label>
                      <Input className="h-9 text-sm" placeholder="https://..." value={companyForm.company_website} onChange={e => setCompanyForm(f => ({ ...f, company_website: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Devise</Label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={companyForm.company_currency} onChange={e => setCompanyForm(f => ({ ...f, company_currency: e.target.value }))}>
                        <option value="CHF">CHF – Franc suisse</option>
                        <option value="EUR">EUR – Euro</option>
                        <option value="USD">USD – Dollar US</option>
                        <option value="GBP">GBP – Livre sterling</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Adresse</Label>
                    <Input className="h-9 text-sm" placeholder="Rue de la Paix 1" value={companyForm.company_address} onChange={e => setCompanyForm(f => ({ ...f, company_address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">CP</Label>
                      <Input className="h-9 text-sm" placeholder="1204" value={companyForm.company_zip} onChange={e => setCompanyForm(f => ({ ...f, company_zip: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Ville</Label>
                      <Input className="h-9 text-sm" placeholder="Genève" value={companyForm.company_city} onChange={e => setCompanyForm(f => ({ ...f, company_city: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Pays</Label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={companyForm.company_country} onChange={e => setCompanyForm(f => ({ ...f, company_country: e.target.value }))}>
                        <option value="CH">Suisse</option><option value="FR">France</option>
                        <option value="BE">Belgique</option><option value="DE">Allemagne</option><option value="LU">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Numéro TVA</Label>
                      <Input className="h-9 text-sm" placeholder="CHE-123.456.789 TVA" value={companyForm.company_vat} onChange={e => setCompanyForm(f => ({ ...f, company_vat: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">IBAN</Label>
                      <Input className="h-9 text-sm" placeholder="CH56 0483 5012 3456 7800 9" value={companyForm.company_iban} onChange={e => setCompanyForm(f => ({ ...f, company_iban: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <Button className="h-9 text-sm" onClick={saveCompany} disabled={saving || isPending}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            )}

            {/* ─────────── ABONNEMENT ─────────── */}
            {activeSection === "billing" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Abonnement</h2><p className="text-sm text-muted-foreground mt-0.5">Gérez votre plan Fluxia.</p></div>

                {/* Current plan banner */}
                <div className={cn("p-4 rounded-xl border flex items-center justify-between gap-4", isPaidPlan ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card")}>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Plan actuel</div>
                    <div className="text-base font-bold capitalize">{currentPlan}</div>
                    {profile?.subscription_period_end && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Renouvellement le {new Date(profile.subscription_period_end).toLocaleDateString("fr-CH")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isPaidPlan ? "success" : "secondary"} className="capitalize">
                      {isPaidPlan ? "Actif" : "Gratuit"}
                    </Badge>
                    {isPaidPlan && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={openStripePortal}>
                        <ExternalLink className="w-3 h-3" /> Gérer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map(plan => {
                    const isCurrent = currentPlan === plan.id;
                    const Icon = plan.icon;
                    return (
                      <div key={plan.id} className={cn("p-4 rounded-xl border transition-all relative", plan.popular ? "border-emerald-500/50 bg-emerald-500/5" : "border-border", isCurrent && "ring-1 ring-emerald-500/50")}>
                        {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">Populaire</div>}
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={cn("w-4 h-4", plan.popular ? "text-emerald-400" : "text-muted-foreground")} />
                          <span className="text-sm font-semibold">{plan.name}</span>
                          {isCurrent && <Badge variant="success" className="text-[9px] px-1.5 ml-auto">Actuel</Badge>}
                        </div>
                        <div className="mb-3">
                          <span className="text-xl font-bold">{plan.price === 0 ? "Gratuit" : `CHF ${plan.price}`}</span>
                          {plan.price > 0 && <span className="text-xs text-muted-foreground">/mois</span>}
                        </div>
                        <ul className="space-y-1 mb-4">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                        {isCurrent ? (
                          <Button size="sm" className="w-full h-8 text-xs" disabled variant="secondary">Plan actuel</Button>
                        ) : plan.price === 0 ? (
                          <Button size="sm" className="w-full h-8 text-xs" variant="ghost" disabled>Rétrograder</Button>
                        ) : (
                          <Button size="sm" className={cn("w-full h-8 text-xs", plan.popular ? "" : "variant-outline")} variant={plan.popular ? "default" : "outline"} onClick={() => openStripeCheckout(plan.id)}>
                            {currentPlan === "free" ? "Choisir" : "Changer de plan"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isPaidPlan && (
                  <div className="p-4 rounded-xl border border-border text-sm text-muted-foreground flex items-center justify-between">
                    <span>Annuler l'abonnement ou changer de moyen de paiement</span>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 shrink-0" onClick={openStripePortal}>
                      <ExternalLink className="w-3 h-3" /> Portail Stripe
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ─────────── ÉQUIPE ─────────── */}
            {activeSection === "team" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Équipe</h2><p className="text-sm text-muted-foreground mt-0.5">Invitez des collaborateurs dans votre espace.</p></div>

                {!canInvite && (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                      <Crown className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-300 mb-1">Fonctionnalité Team & Business</p>
                        <p className="text-xs text-muted-foreground mb-3">Le multi-utilisateurs est disponible à partir du plan Team (CHF 99/mois). Invitez jusqu'à 5 collaborateurs.</p>
                        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setActiveSection("billing")}>
                          Voir les plans <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className={cn("space-y-3", !canInvite && "opacity-40 pointer-events-none")}>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Inviter un membre</Label>
                    <div className="flex gap-2">
                      <Input type="email" className="h-9 text-sm flex-1" placeholder="prenom@entreprise.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                      <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={handleInvite} disabled={!inviteEmail || isPending}>
                        <Send className="w-3.5 h-3.5" /> Inviter
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">L'invité recevra un email pour créer son compte.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="text-xs font-medium mb-3">Membres actifs</div>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center text-xs font-semibold text-emerald-400">
                      {profileForm.full_name ? profileForm.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{profileForm.full_name || "Vous"}</div>
                      <div className="text-xs text-muted-foreground">{profileForm.email}</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-[10px]">Admin</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────── CONFIG IA ─────────── */}
            {activeSection === "ai" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Configuration IA</h2><p className="text-sm text-muted-foreground mt-0.5">Personnalisez le comportement de votre assistant.</p></div>
                <div className="space-y-2">
                  {([
                    { id: "manuel" as const, label: "Assistant", emoji: "🤝", desc: "L'IA propose des suggestions. Vous validez tout." },
                    { id: "semi_autonome" as const, label: "Semi-autonome", emoji: "⚡", desc: "L'IA gère relances et classement. Vous validez les emails clients." },
                    { id: "autonome" as const, label: "Autonome", emoji: "🤖", desc: "L'IA gère tout le workflow. Supervision minimale." },
                  ] as const).map(mode => (
                    <label key={mode.id} className={cn("flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all", aiMode === mode.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-emerald-500/20")}>
                      <input type="radio" name="ai_mode" value={mode.id} checked={aiMode === mode.id} onChange={() => setAiMode(mode.id)} className="mt-1 accent-emerald-600" />
                      <div>
                        <div className="text-sm font-medium mb-0.5">{mode.emoji} {mode.label}</div>
                        <div className="text-xs text-muted-foreground">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <Separator />
                <div>
                  <div className="text-xs font-semibold mb-3">Capacités IA activées</div>
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
                <Button className="h-9 text-sm" onClick={saveAiMode} disabled={isPending}>{isPending ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            )}

            {/* ─────────── NOTIFICATIONS ─────────── */}
            {activeSection === "notifications" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Notifications</h2><p className="text-sm text-muted-foreground mt-0.5">Choisissez comment vous êtes notifié.</p></div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Email</div>
                  {[
                    { label: "Nouveau prospect détecté", key: "email_new_prospect" },
                    { label: "Facture payée", key: "email_invoice_paid" },
                    { label: "Devis accepté", key: "email_quote_accepted" },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{n.label}</span>
                      <Switch checked={notifications[n.key as keyof typeof notifications]} onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))} />
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Application</div>
                  {[
                    { label: "Alertes urgentes", key: "push_urgent" },
                    { label: "Rappels de tâches", key: "push_reminders" },
                    { label: "Rapport hebdomadaire IA", key: "weekly_report" },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{n.label}</span>
                      <Switch checked={notifications[n.key as keyof typeof notifications]} onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))} />
                    </div>
                  ))}
                </div>
                <Button className="h-9 text-sm" onClick={saveNotifications}>Enregistrer</Button>
              </div>
            )}

            {/* ─────────── EMAILS CONNECTÉS ─────────── */}
            {activeSection === "email" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Emails connectés</h2><p className="text-sm text-muted-foreground mt-0.5">Gérez vos boîtes email depuis Fluxia.</p></div>
                <div className="space-y-2">
                  {[
                    { name: "Gmail", desc: "Google OAuth 2.0", icon: "G", color: "bg-red-500/10 text-red-400 border-red-500/20" },
                    { name: "Outlook / Microsoft 365", desc: "Microsoft OAuth", icon: "M", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                    { name: "IMAP personnalisé", desc: "Configuration manuelle", icon: "@", color: "bg-secondary text-muted-foreground border-border" },
                  ].map(acc => (
                    <div key={acc.name} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border", acc.color)}>{acc.icon}</div>
                        <div>
                          <div className="text-sm font-medium">{acc.name}</div>
                          <div className="text-xs text-muted-foreground">{acc.desc}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><ExternalLink className="w-3 h-3" />Connecter</Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30 border border-border">
                  La connexion OAuth requiert la configuration de <code className="text-emerald-400">GOOGLE_CLIENT_ID</code> et <code className="text-emerald-400">GOOGLE_CLIENT_SECRET</code> dans les variables d'environnement Vercel.
                </p>
              </div>
            )}

            {/* ─────────── SÉCURITÉ ─────────── */}
            {activeSection === "security" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">Sécurité</h2><p className="text-sm text-muted-foreground mt-0.5">Protégez votre compte Fluxia.</p></div>
                <div className="p-5 rounded-xl border border-border space-y-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Lock className="w-4 h-4 text-emerald-400" /></div>
                    <div><div className="text-sm font-medium">Changer le mot de passe</div><div className="text-xs text-muted-foreground">Minimum 8 caractères</div></div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} className="h-9 text-sm pr-10" placeholder="••••••••" value={passwordForm.next} onChange={e => setPasswordForm(f => ({ ...f, next: e.target.value }))} />
                        <button onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Confirmer</Label>
                      <Input type={showPassword ? "text" : "password"} className="h-9 text-sm" placeholder="••••••••" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} />
                    </div>
                  </div>
                  <Button className="w-full h-9 text-sm" onClick={handlePasswordChange} disabled={!passwordForm.next || !passwordForm.confirm || isPending}>Changer le mot de passe</Button>
                </div>
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div><div className="text-sm font-medium">Session actuelle</div><div className="text-xs text-muted-foreground">Connecté maintenant</div></div>
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                </div>
              </div>
            )}

            {/* ─────────── API & WEBHOOKS ─────────── */}
            {activeSection === "api" && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold">API & Webhooks</h2><p className="text-sm text-muted-foreground mt-0.5">Intégrez Fluxia dans vos outils.</p></div>

                <div className="p-4 rounded-xl border border-border space-y-3">
                  <div className="text-xs font-semibold">Clé API</div>
                  <div className="flex items-center gap-2">
                    <Input value={apiKey ? (apiKeyVisible ? apiKey : apiKey.slice(0, 12) + "••••••••••••••••••••") : "Aucune clé générée"} readOnly className="font-mono text-xs h-9 flex-1" />
                    {apiKey && <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setApiKeyVisible(v => !v)}>{apiKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</Button>}
                    {apiKey && <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" onClick={copyApiKey}><Copy className="w-3.5 h-3.5" />Copier</Button>}
                    <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" onClick={handleGenerateApiKey} disabled={isPending}><RefreshCw className="w-3.5 h-3.5" />{apiKey ? "Régénérer" : "Générer"}</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Ne partagez jamais votre clé API. Elle donne un accès complet à vos données.</p>
                </div>

                <div className="p-4 rounded-xl border border-border space-y-3">
                  <div className="text-xs font-semibold">Webhook entrant</div>
                  <div className="flex gap-2">
                    <Input className="h-9 text-sm flex-1" placeholder="https://votre-app.com/webhook" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                    <Button size="sm" className="h-9 shrink-0" onClick={() => webhookUrl && show("Webhook enregistré")}>Sauver</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Fluxia envoie les événements (contact créé, facture payée…) à cette URL en POST JSON.</p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold mb-3">Intégrations tierces</div>
                  {[
                    { key: "slack", name: "Slack", desc: "Notifications dans un channel", placeholder: "https://hooks.slack.com/services/..." },
                    { key: "zapier", name: "Zapier", desc: "Connectez Fluxia à 5000+ apps", placeholder: "https://hooks.zapier.com/..." },
                    { key: "make", name: "Make (Integromat)", desc: "Workflows avancés", placeholder: "https://hook.eu1.make.com/..." },
                  ].map(int => (
                    <div key={int.key} className="p-4 rounded-xl border border-border space-y-2">
                      <div>
                        <div className="text-sm font-medium">{int.name}</div>
                        <div className="text-xs text-muted-foreground">{int.desc}</div>
                      </div>
                      <div className="flex gap-2">
                        <Input className="h-8 text-xs flex-1" placeholder={int.placeholder} value={integrations[int.key as keyof typeof integrations]} onChange={e => setIntegrations(prev => ({ ...prev, [int.key]: e.target.value }))} />
                        <Button size="sm" className="h-8 text-xs shrink-0" onClick={() => integrations[int.key as keyof typeof integrations] && show(`${int.name} configuré`)}>Sauver</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

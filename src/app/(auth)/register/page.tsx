"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, Building2, ArrowRight, Check, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const STEPS = ["Compte", "Entreprise", "Connexions", "IA"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    company: "", contactEmail: "", phone: "", address: "", vat: "", currency: "CHF",
    aiMode: "semi_autonome" as "manuel" | "semi_autonome" | "autonome",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleStep0 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: `${form.firstName} ${form.lastName}`.trim() },
        },
      });
      if (error) { setError(error.message); return; }
      setStep(1);
    });
  };

  const handleGoogle = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    });
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          company_name: form.company,
          company_phone: form.phone,
          company_address: form.address,
          company_vat: form.vat,
        }).eq("id", user.id);
      }
      setStep(2);
    });
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          ai_mode: form.aiMode,
          onboarding_completed: true,
        }).eq("id", user.id);
      }
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Fluxia</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < step ? "bg-blue-600 text-white" :
                  i === step ? "bg-blue-600 text-white ring-2 ring-blue-600/20 ring-offset-2 ring-offset-background" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-blue-600" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={handleStep0}>
              <h2 className="text-xl font-bold mb-1">Créez votre compte</h2>
              <p className="text-sm text-muted-foreground mb-6">14 jours gratuits · Aucune carte requise</p>

              <Button type="button" variant="outline" className="w-full h-9 gap-2 text-sm mb-4" onClick={handleGoogle} disabled={isPending}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou avec votre email</span></div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Jean" className="pl-9 h-9 text-sm" value={form.firstName} onChange={set("firstName")} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom</Label>
                    <Input placeholder="Dupont" className="h-9 text-sm" value={form.lastName} onChange={set("lastName")} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input type="email" placeholder="jean@entreprise.ch" className="pl-9 h-9 text-sm" value={form.email} onChange={set("email")} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      className="pl-9 pr-9 h-9 text-sm"
                      value={form.password}
                      onChange={set("password")}
                      minLength={8}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-9 gap-2" disabled={isPending}>
                  {isPending ? "Création..." : "Créer mon compte"}
                  {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1}>
              <h2 className="text-xl font-bold mb-1">Votre entreprise</h2>
              <p className="text-sm text-muted-foreground mb-6">Ces informations apparaîtront sur vos devis et factures.</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nom de l'entreprise</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Dupont & Associés SA" className="pl-9 h-9 text-sm" value={form.company} onChange={set("company")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Téléphone</Label>
                  <Input placeholder="+41 79 000 00 00" className="h-9 text-sm" value={form.phone} onChange={set("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Adresse</Label>
                  <Input placeholder="Rue de la Paix 1, 1204 Genève" className="h-9 text-sm" value={form.address} onChange={set("address")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Numéro TVA (optionnel)</Label>
                  <Input placeholder="CHE-123.456.789 TVA" className="h-9 text-sm" value={form.vat} onChange={set("vat")} />
                </div>
                <Button type="submit" className="w-full h-9 gap-2" disabled={isPending}>
                  {isPending ? "Sauvegarde..." : "Continuer"}
                  {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <h2 className="text-xl font-bold mb-1">Connectez vos outils</h2>
              <p className="text-sm text-muted-foreground mb-6">Vous pouvez configurer cela plus tard dans les paramètres.</p>
              <div className="space-y-2 mb-6">
                {[
                  { name: "Gmail", desc: "Synchroniser vos emails Google", letter: "G" },
                  { name: "Outlook / Exchange", desc: "Synchroniser vos emails Microsoft", letter: "O" },
                  { name: "Google Calendar", desc: "Synchroniser votre agenda Google", letter: "C" },
                  { name: "Outlook Calendar", desc: "Synchroniser votre agenda Microsoft", letter: "C" },
                ].map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between p-3.5 rounded-lg border border-border hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-bold">{tool.letter}</div>
                      <div>
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.desc}</div>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-7">Connecter</Button>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full h-9 gap-2">
                Continuer <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <button type="button" onClick={() => setStep(3)} className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                Passer cette étape
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinish}>
              <h2 className="text-xl font-bold mb-1">Configuration IA</h2>
              <p className="text-sm text-muted-foreground mb-6">Choisissez le niveau d'autonomie de votre assistant.</p>
              <div className="space-y-2 mb-6">
                {[
                  { value: "manuel" as const, label: "Assistant", desc: "L'IA propose, vous décidez. Suggestions et brouillons, validation manuelle systématique." },
                  { value: "semi_autonome" as const, label: "Semi-autonome", desc: "L'IA gère les tâches répétitives et vous notifie pour les décisions importantes.", recommended: true },
                  { value: "autonome" as const, label: "Autonome", desc: "L'IA gère l'ensemble du workflow. Réponses emails, devis, relances. Supervision minimale." },
                ].map((m) => (
                  <label key={m.value} className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    form.aiMode === m.value ? "border-blue-600/50 bg-blue-600/5" : "border-border hover:border-white/10"
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value={m.value}
                      checked={form.aiMode === m.value}
                      onChange={() => setForm((f) => ({ ...f, aiMode: m.value }))}
                      className="mt-1 accent-blue-600 sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                      form.aiMode === m.value ? "border-blue-600 bg-blue-600" : "border-border"
                    }`}>
                      {form.aiMode === m.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{m.label}</span>
                        {m.recommended && <span className="text-[10px] bg-blue-600/15 text-blue-400 border border-blue-600/20 rounded px-1.5 py-0.5">Recommandé</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button type="submit" className="w-full h-9 gap-2" disabled={isPending}>
                {isPending ? "Configuration..." : "Accéder à mon espace Fluxia"}
                {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </form>
          )}
        </div>

        {step === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">Se connecter</Link>
          </p>
        )}
      </div>
    </div>
  );
}

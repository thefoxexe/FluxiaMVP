"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, User, Building2, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = ["Compte", "Entreprise", "Connexions", "IA"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const goNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Fluxia</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  i < step ? "bg-violet-600 text-white" :
                  i === step ? "bg-violet-600 text-white ring-2 ring-violet-500/30 ring-offset-2 ring-offset-background" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 max-w-8 ${i < step ? "bg-violet-600" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {step === 0 && (
            <form onSubmit={goNext}>
              <h2 className="text-2xl font-bold mb-1">Créez votre compte</h2>
              <p className="text-muted-foreground text-sm mb-8">14 jours gratuits · Aucune carte requise</p>

              <div className="space-y-3 mb-6">
                <Button type="button" variant="outline" className="w-full h-11 gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">ou avec votre email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1.5 block">Prénom</Label>
                    <Input placeholder="Jean" className="h-10" required />
                  </div>
                  <div>
                    <Label className="text-sm mb-1.5 block">Nom</Label>
                    <Input placeholder="Dupont" className="h-10" required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="jean@entreprise.ch" className="pl-9 h-10" required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      className="pl-9 pr-9 h-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="gradient" className="w-full h-11">
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={goNext}>
              <h2 className="text-2xl font-bold mb-1">Votre entreprise</h2>
              <p className="text-muted-foreground text-sm mb-8">Ces informations apparaîtront sur vos devis et factures.</p>
              <div className="space-y-4">
                {[
                  { label: "Nom de l'entreprise", placeholder: "Dupont & Associés SA", icon: Building2 },
                  { label: "Email de contact", placeholder: "contact@entreprise.ch", icon: Mail },
                  { label: "Téléphone", placeholder: "+41 79 000 00 00" },
                  { label: "Adresse", placeholder: "Rue de la Paix 1, 1204 Genève" },
                  { label: "Numéro TVA (optionnel)", placeholder: "CHE-123.456.789 TVA" },
                ].map((f, i) => (
                  <div key={i}>
                    <Label className="text-sm mb-1.5 block">{f.label}</Label>
                    <div className="relative">
                      {f.icon && <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                      <Input placeholder={f.placeholder} className={`h-10 ${f.icon ? "pl-9" : ""}`} />
                    </div>
                  </div>
                ))}
                <div>
                  <Label className="text-sm mb-1.5 block">Devise principale</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
                    <option>CHF – Franc suisse</option>
                    <option>EUR – Euro</option>
                    <option>USD – Dollar américain</option>
                  </select>
                </div>
                <Button type="submit" variant="gradient" className="w-full h-11">
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={goNext}>
              <h2 className="text-2xl font-bold mb-1">Connectez vos outils</h2>
              <p className="text-muted-foreground text-sm mb-8">Vous pouvez configurer cela plus tard dans les paramètres.</p>
              <div className="space-y-3 mb-8">
                {[
                  { name: "Gmail", desc: "Synchroniser vos emails Google", icon: "G" },
                  { name: "Outlook / Exchange", desc: "Synchroniser vos emails Microsoft", icon: "O" },
                  { name: "Google Calendar", desc: "Synchroniser votre agenda", icon: "C" },
                  { name: "Outlook Calendar", desc: "Synchroniser votre agenda Microsoft", icon: "C" },
                ].map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold">
                        {tool.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.desc}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connecter</Button>
                  </div>
                ))}
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11">
                Continuer
                <ArrowRight className="w-4 h-4" />
              </Button>
              <button type="button" onClick={() => setStep(3)} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                Passer cette étape
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={goNext}>
              <h2 className="text-2xl font-bold mb-1">Configuration IA</h2>
              <p className="text-muted-foreground text-sm mb-8">Choisissez le niveau d'autonomie de votre assistant IA.</p>
              <div className="space-y-3 mb-8">
                {[
                  {
                    mode: "Assistant",
                    desc: "L'IA propose, vous décidez. Suggestions et brouillons, mais validation manuelle systématique.",
                    recommended: false,
                  },
                  {
                    mode: "Semi-autonome",
                    desc: "L'IA gère les tâches répétitives (relances, classement) et vous notifie pour les décisions importantes.",
                    recommended: true,
                  },
                  {
                    mode: "Autonome",
                    desc: "L'IA gère l'ensemble du workflow. Réponses emails, devis, relances. Supervision minimale.",
                    recommended: false,
                  },
                ].map((m) => (
                  <label key={m.mode} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-violet-500/30 cursor-pointer transition-colors has-[:checked]:border-violet-500/50 has-[:checked]:bg-violet-500/5">
                    <input type="radio" name="mode" defaultChecked={m.recommended} className="mt-1 accent-violet-600" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{m.mode}</span>
                        {m.recommended && <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5">Recommandé</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11 text-base">
                Accéder à mon espace Fluxia
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          )}
        </div>

        {step === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

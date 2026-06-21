"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      router.push("/dashboard");
      router.refresh();
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-col border-r border-border p-8 bg-card">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Fluxia</span>
        </div>

        <div className="space-y-6 my-auto">
          <div>
            <h1 className="text-2xl font-bold mb-2">Pilotez votre business avec l'IA</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CRM, devis, factures, tâches et automatisations — tout en un, propulsé par l'intelligence artificielle.
            </p>
          </div>
          {[
            "Devis générés par IA en 30 secondes",
            "Relances automatiques et scoring des prospects",
            "Rapports financiers en temps réel",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-violet-400">JD</span>
            </div>
            <div>
              <div className="text-xs font-medium">Jean Dupont, Dupont Bâtiment SA</div>
              <div className="text-[11px] text-muted-foreground">
                "Fluxia m'a fait gagner 8h par semaine."
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold">Fluxia</span>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1">Connexion</h2>
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-violet-400 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@entreprise.ch"
                  className="pl-9 h-9 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-9 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-9 gap-2" disabled={isPending}>
              {isPending ? "Connexion..." : "Se connecter"}
              {!isPending && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">ou continuer avec</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-9 gap-2 text-sm" onClick={handleGoogle} disabled={isPending}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}

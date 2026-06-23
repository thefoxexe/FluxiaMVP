"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, ArrowRight, Check, ChevronDown, BarChart3, FileText,
  CreditCard, Users, CheckSquare, Workflow, Sparkles, Mail,
  Shield, Globe, Star, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Inbox IA",
    description: "Vos emails classifiés, résumés et traités automatiquement. L'IA rédige les réponses, vous n'avez qu'à valider.",
  },
  {
    icon: Users,
    title: "CRM intelligent",
    description: "Scoring des prospects, suivi du pipeline, historique complet. L'IA identifie les opportunités à ne pas manquer.",
  },
  {
    icon: FileText,
    title: "Devis en 30 secondes",
    description: "Générez des devis professionnels depuis un email ou une description. Envoyez et signez directement depuis Fluxia.",
  },
  {
    icon: CreditCard,
    title: "Facturation automatisée",
    description: "QR-Factures conformes, relances automatiques, suivi des paiements en temps réel.",
  },
  {
    icon: CheckSquare,
    title: "Tâches & Calendrier",
    description: "Synchronisé avec Google Calendar et Outlook. L'IA crée des tâches depuis vos emails automatiquement.",
  },
  {
    icon: Workflow,
    title: "Automatisations no-code",
    description: "Créez des workflows sans code : réponse auto aux prospects, suivi des devis, alertes impayés.",
  },
  {
    icon: BarChart3,
    title: "Rapports IA",
    description: "CA, cashflow, pipeline, taux de conversion. Rapport hebdomadaire généré automatiquement.",
  },
  {
    icon: Mail,
    title: "Relances intelligentes",
    description: "L'IA détecte les impayés et envoie des relances personnalisées au bon moment.",
  },
];

const PLANS = [
  {
    name: "Solo",
    price: 49,
    description: "Pour les indépendants",
    features: ["1 utilisateur", "500 contacts", "Devis & Factures illimités", "Inbox IA", "Automatisations (5 actives)", "Support email"],
    highlighted: false,
    cta: "Commencer",
  },
  {
    name: "Team",
    price: 99,
    description: "Pour les petites équipes",
    features: ["3 utilisateurs", "2 000 contacts", "Tout Solo inclus", "CRM avancé + scoring", "Automatisations illimitées", "Rapports IA", "Support prioritaire"],
    highlighted: true,
    cta: "Commencer — le plus populaire",
  },
  {
    name: "Business",
    price: 199,
    description: "Pour les agences & PME",
    features: ["10 utilisateurs", "Contacts illimités", "Tout Team inclus", "API & Webhooks", "Intégrations Slack/Teams", "Manager de compte dédié", "SLA 99.9%"],
    highlighted: false,
    cta: "Contacter les ventes",
  },
];

const COMPARISON = [
  { feature: "Inbox IA", fluxia: true, bexio: false, hubspot: false, note: "Exclusif Fluxia" },
  { feature: "Devis IA en 30s", fluxia: true, bexio: false, hubspot: false, note: "Exclusif Fluxia" },
  { feature: "Automatisations no-code", fluxia: true, bexio: false, hubspot: true, note: "" },
  { feature: "QR-Factures suisses", fluxia: true, bexio: true, hubspot: false, note: "" },
  { feature: "CRM + pipeline", fluxia: true, bexio: false, hubspot: true, note: "" },
  { feature: "Rapport IA hebdo", fluxia: true, bexio: false, hubspot: false, note: "Exclusif Fluxia" },
  { feature: "Prix pour PME suisse", fluxia: true, bexio: false, hubspot: false, note: "Bexio dès CHF 199/mois" },
];

const FAQS = [
  { q: "Fluxia est-il conforme aux lois suisses ?", a: "Oui. Fluxia est hébergé en Suisse, conforme à la LPD, et génère des QR-Factures conformes aux standards SwissQR. TVA suisse (7.7%) automatiquement gérée." },
  { q: "Puis-je importer mes données existantes ?", a: "Oui, importez vos contacts depuis Excel, CSV, ou directement depuis Bexio. Notre équipe vous accompagne lors de l'onboarding." },
  { q: "Y a-t-il une période d'essai ?", a: "14 jours gratuits, sans carte bancaire. Toutes les fonctionnalités incluses." },
  { q: "Comment fonctionne l'IA ?", a: "Fluxia utilise des modèles d'IA de pointe (Claude, GPT-4) pour analyser vos emails, générer des devis et automatiser les relances. Vos données ne sont jamais utilisées pour entraîner les modèles." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans frais ni engagement. Votre abonnement reste actif jusqu'à la fin de la période payée." },
];

function CheckIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
      <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={2.5} />
    </div>
  );
}

function CrossIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center shrink-0">
      <X className="w-2.5 h-2.5 text-muted-foreground/40" strokeWidth={2.5} />
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAV ── */}
      <header className={cn(
        "fixed top-0 inset-x-0 z-50 border-b transition-colors duration-200",
        scrolled ? "bg-background/95 backdrop-blur border-border" : "bg-transparent border-transparent"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">Fluxia</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {["Fonctionnalités", "Tarifs", "Comparaison", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Connexion
            </Link>
            <Link href="/register">
              <Button size="sm" className="h-8 text-xs">Essai gratuit</Button>
            </Link>
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {["Fonctionnalités", "Tarifs", "Comparaison", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileNavOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link href="/login" className="block py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
              Connexion
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
          <Sparkles className="w-3 h-3" />
          Nouveau — Inbox IA disponible
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
          Le système d'exploitation{" "}
          <span className="text-gradient">IA</span>{" "}
          pour votre business
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
          CRM, devis, factures, relances et automatisations — tout en un. L'IA fait le travail répétitif,
          vous vous concentrez sur vos clients.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="xl" className="gap-2 w-full sm:w-auto">
              Démarrer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#fonctionnalités">
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              Voir les fonctionnalités
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          14 jours gratuits · Sans carte bancaire · Annulable à tout moment
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 pt-8 border-t border-border max-w-lg mx-auto">
          {[
            { value: "30s", label: "pour créer un devis" },
            { value: "8h", label: "économisées / semaine" },
            { value: "68%", label: "taux de conversion" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── APP PREVIEW ── */}
      <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/40">
          {/* Fake toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <div className="flex-1 mx-4 h-6 rounded-md bg-background/60 border border-border flex items-center px-3">
              <span className="text-[11px] text-muted-foreground">app.fluxia.ch/dashboard</span>
            </div>
          </div>
          {/* Dashboard preview */}
          <div className="flex h-[380px] sm:h-[480px]">
            {/* Sidebar preview */}
            <div className="hidden sm:flex w-48 border-r border-border flex-col p-3 gap-1 bg-card">
              {["Dashboard", "Inbox IA", "CRM", "Devis", "Factures", "Tâches"].map((item, i) => (
                <div key={item} className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
                  i === 0 ? "bg-emerald-600/10 text-emerald-400" : "text-muted-foreground"
                )}>
                  <div className={cn("w-3.5 h-3.5 rounded-sm", i === 0 ? "bg-emerald-600/30" : "bg-secondary")} />
                  {item}
                  {i === 1 && <span className="ml-auto text-[9px] bg-emerald-600 text-white px-1 rounded">4</span>}
                </div>
              ))}
            </div>
            {/* Main content preview */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="text-xs font-medium mb-3 text-foreground">Dashboard</div>
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: "CA du mois", value: "CHF 47'850", color: "text-emerald-400" },
                  { label: "Impayées", value: "CHF 34'734", color: "text-amber-400" },
                  { label: "Conversion", value: "68.5%", color: "text-emerald-400" },
                  { label: "Cash", value: "CHF 89'200", color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary/50 border border-border rounded-lg p-2.5">
                    <div className={cn("text-sm font-semibold", s.color)}>{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="rounded-lg border border-border bg-secondary/30 p-3 h-40 flex items-end gap-1">
                {[45, 62, 55, 78, 82, 70, 88, 92, 85, 95, 89, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 11 ? "rgb(124 58 237 / 0.8)" : "rgb(124 58 237 / 0.25)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Fonctionnalités</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Tout ce dont vous avez besoin, rien de superflu</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Fluxia remplace 4 à 6 outils distincts par une plateforme unifiée, intelligente et pensée pour les PME suisses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-4 rounded-lg border border-border bg-card hover:border-white/10 transition-colors">
              <div className="w-8 h-8 rounded-md bg-emerald-600/15 border border-emerald-600/20 flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 sm:px-6 py-20 border-y border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Comment ça marche</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Opérationnel en 5 minutes</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Connectez vos outils", desc: "Gmail, Outlook, Google Calendar. Import de vos contacts existants en un clic." },
              { step: "02", title: "L'IA prend en charge", desc: "Vos emails sont analysés, vos devis générés, vos relances automatisées." },
              { step: "03", title: "Vous validez", desc: "Fluxia vous soumet les actions importantes. Vous restez aux commandes, l'IA exécute." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-4xl font-bold text-white/5 mb-3">{s.step}</div>
                <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="comparaison" className="px-4 sm:px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Comparaison</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pourquoi choisir Fluxia ?</h2>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-secondary/40 border-b border-border">
            <div className="p-3 text-xs font-medium text-muted-foreground">Fonctionnalité</div>
            <div className="p-3 text-xs font-semibold text-center text-emerald-400">Fluxia</div>
            <div className="p-3 text-xs font-medium text-center text-muted-foreground">Bexio</div>
            <div className="p-3 text-xs font-medium text-center text-muted-foreground">HubSpot</div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.feature} className={cn("grid grid-cols-4 border-b border-border last:border-0", i % 2 === 0 ? "" : "bg-secondary/20")}>
              <div className="p-3 text-xs flex items-center gap-2">
                {row.feature}
                {row.note && <span className="text-[10px] text-emerald-400 hidden sm:inline">— {row.note}</span>}
              </div>
              <div className="p-3 flex justify-center items-center">
                {row.fluxia ? <CheckIcon /> : <CrossIcon />}
              </div>
              <div className="p-3 flex justify-center items-center">
                {row.bexio ? <CheckIcon /> : <CrossIcon />}
              </div>
              <div className="p-3 flex justify-center items-center">
                {row.hubspot ? <CheckIcon /> : <CrossIcon />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-4 sm:px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Témoignages</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ils utilisent Fluxia chaque jour</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                name: "Jean Dupont",
                role: "Dupont Bâtiment SA, Lausanne",
                quote: "J'ai réduit mon temps administratif de 8 heures par semaine. Les devis IA sont bluffants — mes clients reçoivent une réponse en moins d'une heure.",
                stars: 5,
              },
              {
                name: "Sophie Martin",
                role: "Martin Design Studio, Genève",
                quote: "La gestion des relances était une corvée. Maintenant c'est automatique. Mon taux de recouvrement a augmenté de 40% en 3 mois.",
                stars: 5,
              },
              {
                name: "Marc Favre",
                role: "TechSolutions SA, Zurich",
                quote: "On a remplacé Bexio, HubSpot et Notion par Fluxia. Moins d'outils, moins de saisie, plus de temps pour les clients.",
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="p-5 rounded-lg border border-border bg-card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="text-xs font-medium">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="px-4 sm:px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Tarifs</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent, sans surprises</h2>
            <p className="text-sm text-muted-foreground">14 jours d'essai gratuit · Sans carte bancaire · Annulable à tout moment</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.name} className={cn(
                "p-6 rounded-lg border flex flex-col",
                plan.highlighted
                  ? "border-emerald-500/50 bg-emerald-600/5"
                  : "border-border bg-card"
              )}>
                {plan.highlighted && (
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-3">Le plus populaire</div>
                )}
                <div className="mb-4">
                  <div className="text-base font-semibold mb-1">{plan.name}</div>
                  <div className="text-xs text-muted-foreground">{plan.description}</div>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-bold">CHF {plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckIcon />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className={cn("w-full text-sm", plan.highlighted ? "" : "variant-outline")}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-4 p-5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold mb-1">Enterprise</div>
              <p className="text-xs text-muted-foreground">Utilisateurs illimités, déploiement on-premise, contrat personnalisé, SLA garanti.</p>
            </div>
            <Button variant="outline" className="shrink-0">Contacter les ventes</Button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-4 sm:px-6 py-20 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Questions fréquentes</h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 py-20 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Prêt à automatiser votre business ?
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Rejoignez les centaines de PME suisses qui font confiance à Fluxia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="xl" className="gap-2 w-full sm:w-auto">
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            14 jours gratuits · Aucune carte requise
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">Fluxia</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["Confidentialité", "CGU", "Sécurité", "Contact"].map((l) => (
                <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground">
                  {l}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Hébergé en Suisse · LPD conforme
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Fluxia SA · Genève, Suisse
          </div>
        </div>
      </footer>
    </div>
  );
}

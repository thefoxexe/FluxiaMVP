"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, Mail, Users, FileText, CreditCard, BarChart3, Bot, ArrowRight,
  Check, ChevronDown, Star, Globe, Shield, Clock, TrendingUp, Sparkles,
  Building2, Send, Eye, Pencil, BellRing, X, Menu, Play,
  ChevronRight, MessageSquare, Calendar, Workflow, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEMO_STEPS = [
  {
    delay: 0,
    type: "email",
    content: '"Bonjour, j\'aimerais un devis pour la rénovation d\'une toiture de 120m²."',
    sender: "Marc Dupont <marc@dupont-batiment.ch>",
  },
  {
    delay: 1200,
    type: "ai",
    content: "Analyse de l'email en cours...",
    icon: "scan",
  },
  {
    delay: 2400,
    type: "action",
    content: "Prospect créé : Marc Dupont – Dupont Bâtiment SA",
    icon: "user",
    status: "done",
  },
  {
    delay: 3400,
    type: "action",
    content: "Besoin identifié : Toiture 120m² – Urgent",
    icon: "search",
    status: "done",
  },
  {
    delay: 4400,
    type: "action",
    content: "Devis DEV-2024-001 généré : CHF 8'400",
    icon: "file",
    status: "done",
  },
  {
    delay: 5400,
    type: "action",
    content: "Email de réponse préparé avec devis en PJ",
    icon: "send",
    status: "done",
  },
  {
    delay: 6400,
    type: "action",
    content: "Relances programmées : J+3, J+7, J+14",
    icon: "bell",
    status: "done",
  },
  {
    delay: 7200,
    type: "result",
    content: "Tout ça en moins de 60 secondes.",
  },
];

const FEATURES = [
  {
    icon: Mail,
    title: "Inbox IA",
    description: "Tous vos emails classifiés, résumés et traités par l'IA. Répondez en un clic.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Users,
    title: "CRM Intelligent",
    description: "Pipeline de vente avec scoring IA, déplacement automatique des prospects et détection d'opportunités.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: FileText,
    title: "Devis & Contrats",
    description: "Générez des devis professionnels depuis un email en 30 secondes. Signature électronique intégrée.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: CreditCard,
    title: "Facturation Suisse",
    description: "QR-Facture, TVA, multi-devises. Transformation automatique devis → facture à l'acceptation.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord financier",
    description: "CA, cashflow, prévisions. Toutes vos métriques en temps réel sur un seul écran.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Workflow,
    title: "Automatisations",
    description: "Workflows no-code : relances, notifications, création de tâches. Votre business tourne seul.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Bot,
    title: "Agent IA Autonome",
    description: "L'IA répond aux emails, crée les devis, relance les prospects. Vous supervisez, l'IA exécute.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Calendar,
    title: "Calendrier & Tâches",
    description: "Synchronisation Google / Outlook. Tâches créées automatiquement depuis vos emails et devis.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
];

const COMPARISON = [
  { feature: "IA native intégrée", fluxia: true, bexio: false, hubspot: false, zoho: false, odoo: false },
  { feature: "Agent IA autonome", fluxia: true, bexio: false, hubspot: false, zoho: false, odoo: false },
  { feature: "Inbox IA", fluxia: true, bexio: false, hubspot: false, zoho: false, odoo: false },
  { feature: "Génération devis IA", fluxia: true, bexio: false, hubspot: false, zoho: false, odoo: false },
  { feature: "Relances automatiques IA", fluxia: true, bexio: false, hubspot: false, zoho: false, odoo: false },
  { feature: "CRM + Facturation", fluxia: true, bexio: true, hubspot: false, zoho: true, odoo: true },
  { feature: "QR-Facture Suisse", fluxia: true, bexio: true, hubspot: false, zoho: false, odoo: false },
  { feature: "Prix accessible", fluxia: true, bexio: false, hubspot: false, zoho: true, odoo: false },
];

const TESTIMONIALS = [
  {
    name: "Marc Tissot",
    company: "Tissot Architecture SA",
    comment: "Fluxia a transformé ma façon de travailler. Je passais 3h par jour sur les emails et les devis. Maintenant c'est 30 minutes maximum. L'IA gère tout.",
    rating: 5,
    avatar: "MT",
    color: "from-violet-500 to-indigo-600",
  },
  {
    name: "Laure Bonnet",
    company: "Studio LB Design",
    comment: "En 2 mois, mon taux de conversion est passé de 35% à 62%. Les relances automatiques font une vraie différence. Je ne laisse plus passer une opportunité.",
    rating: 5,
    avatar: "LB",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "David Müller",
    company: "Müller Consulting GmbH",
    comment: "J'ai remplacé Bexio, HubSpot et Notion avec Fluxia. Un seul outil, tout centralisé, et l'IA en bonus. Je recommande à tous les indépendants.",
    rating: 5,
    avatar: "DM",
    color: "from-green-500 to-teal-600",
  },
];

const FAQS = [
  {
    question: "Puis-je importer mes données existantes ?",
    answer: "Oui, Fluxia permet d'importer vos clients, factures et devis depuis Excel, CSV, ou directement depuis Bexio, HubSpot et Zoho via nos connecteurs natifs.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer: "Vos données sont hébergées en Suisse (Zurich), chiffrées en transit et au repos. Nous sommes conformes RGPD et LPD suisse. Chaque organisation est complètement isolée.",
  },
  {
    question: "L'IA peut-elle vraiment envoyer des emails à ma place ?",
    answer: "Oui, en mode Agent Autonome. L'IA rédige et envoie les emails, crée les devis et relance les prospects. Vous configurez le niveau de supervision : validation systématique, validation occasionnelle, ou autonome complet.",
  },
  {
    question: "Que se passe-t-il après les 14 jours d'essai ?",
    answer: "Vous choisissez votre plan ou votre compte passe en mode lecture seule (vos données sont préservées). Aucune carte bancaire requise pour l'essai.",
  },
  {
    question: "Y a-t-il une application mobile ?",
    answer: "L'application web est entièrement responsive. Des applications iOS et Android natives sont prévues pour Q3 2024.",
  },
  {
    question: "Puis-je connecter Gmail et Outlook simultanément ?",
    answer: "Oui, Fluxia supporte plusieurs boîtes email simultanément : Gmail, Outlook/Exchange, et tout serveur IMAP. Tous vos emails dans une seule Inbox IA.",
  },
];

const PRICING = [
  {
    name: "Solo",
    price: "29",
    description: "Pour les indépendants et freelances",
    features: [
      "1 utilisateur",
      "CRM illimité",
      "Inbox IA (1 boîte)",
      "Devis & Factures",
      "QR-Facture Suisse",
      "Assistant IA",
      "Support email",
    ],
    cta: "Démarrer l'essai gratuit",
    popular: false,
    color: "border-border",
  },
  {
    name: "Team",
    price: "79",
    description: "Pour les petites équipes en croissance",
    features: [
      "10 utilisateurs",
      "Tout du plan Solo",
      "Inbox IA (5 boîtes)",
      "Automatisations avancées",
      "Pipeline de vente IA",
      "Rapports & Analytics",
      "Relances automatiques IA",
      "Support prioritaire",
    ],
    cta: "Démarrer l'essai gratuit",
    popular: true,
    color: "border-violet-500/50",
  },
  {
    name: "Business",
    price: "199",
    description: "Pour les PME et agences établies",
    features: [
      "50 utilisateurs",
      "Tout du plan Team",
      "Inbox IA illimitée",
      "Agent IA autonome",
      "API & Webhooks",
      "Reporting avancé",
      "Workflows personnalisés",
      "Gestionnaire de compte dédié",
    ],
    cta: "Démarrer l'essai gratuit",
    popular: false,
    color: "border-border",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const runDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoStep(0);
    DEMO_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setDemoStep(i);
        if (i === DEMO_STEPS.length - 1) {
          setTimeout(() => setDemoRunning(false), 2000);
        }
      }, step.delay);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">Fluxia</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Fonctionnalités", "Tarifs", "Comparaison", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm">
                  Essai gratuit 14 jours
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-b border-border px-4 pb-4 space-y-3">
            {["Fonctionnalités", "Tarifs", "Comparaison", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-sm text-muted-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Connexion</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="gradient" size="sm" className="w-full">Essai gratuit</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 mesh-bg overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="purple" className="mb-6 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Nouveau : Agent IA v3 disponible en bêta
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Votre entreprise
            <br />
            <span className="text-gradient">pilotée par l'IA.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Centralisez emails, devis, clients, factures, trésorerie et automatisations
            dans une seule plateforme. Sans jongler entre 7 outils différents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button variant="gradient" size="xl" className="group">
                Essai gratuit 14 jours
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" onClick={runDemo} disabled={demoRunning} className="gap-2">
              <Play className="w-4 h-4" />
              Voir la démonstration
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-12">
            Aucune carte bancaire requise · Annulation à tout moment · Support en français
          </p>

          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-border bg-card/50 p-1 shadow-2xl shadow-violet-500/10">
              <div className="rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-background/50 border border-border flex items-center px-3">
                    <span className="text-xs text-muted-foreground">app.fluxia.ch/dashboard</span>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-4 gap-4">
                  {[
                    { label: "CA du mois", value: "CHF 47'850", trend: "+12.4%", color: "text-green-400" },
                    { label: "Factures en attente", value: "CHF 34'734", trend: "4 factures", color: "text-yellow-400" },
                    { label: "Devis en cours", value: "CHF 25'208", trend: "2 devis", color: "text-violet-400" },
                    { label: "Taux conversion", value: "68.5%", trend: "+8.2%", color: "text-cyan-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-background/60 rounded-lg p-4 border border-border">
                      <div className="text-xs text-muted-foreground mb-2">{stat.label}</div>
                      <div className="text-lg font-semibold mb-1">{stat.value}</div>
                      <div className={cn("text-xs font-medium", stat.color)}>{stat.trend}</div>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-background/60 rounded-lg p-4 border border-border h-32 flex flex-col justify-between">
                    <div className="text-xs text-muted-foreground font-medium">Revenus 6 derniers mois</div>
                    <div className="flex items-end gap-1 h-16">
                      {[45, 55, 40, 65, 75, 90].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-600 to-violet-400" style={{ height: `${h}%`, opacity: 0.7 + i * 0.05 }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-background/60 rounded-lg p-4 border border-border h-32">
                    <div className="text-xs text-muted-foreground font-medium mb-3">Inbox IA</div>
                    <div className="space-y-2">
                      {["Marc Dupont – Devis toiture", "Sophie Martin – Questions", "URGENT – Site hors ligne"].map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", i === 2 ? "bg-red-400" : "bg-violet-400")} />
                          <span className="text-xs text-muted-foreground truncate">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-2xl blur -z-10" />
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y border-border bg-secondary/30 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "3h → 30min", label: "Gain quotidien moyen" },
              { value: "+35%", label: "Taux de conversion" },
              { value: "< 60s", label: "Devis généré par IA" },
              { value: "98%", label: "Satisfaction client" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-gradient mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="fonctionnalités" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">Le problème</Badge>
            <h2 className="text-4xl font-bold mb-4">Votre quotidien ressemble à ça.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              7 outils. Des données dispersées. Des opportunités perdues. Un temps précieux gaspillé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {[
                { tool: "Gmail / Outlook", pain: "Emails non classifiés, relances oubliées" },
                { tool: "Excel", pain: "Suivi manuel des devis et factures" },
                { tool: "HubSpot", pain: "CRM complexe et hors de prix" },
                { tool: "Bexio", pain: "Facturation sans CRM ni IA" },
                { tool: "Notion / Trello", pain: "Tâches et notes dispersées" },
                { tool: "WhatsApp", pain: "Conversations clients non structurées" },
                { tool: "Calendly", pain: "Un outil de plus à synchroniser" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-red-500/10 bg-red-500/5">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.tool}</div>
                    <div className="text-sm text-muted-foreground">{item.pain}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 glow-purple">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Avec Fluxia</h3>
                  <p className="text-muted-foreground">Un seul outil. Tout centralisé. L'IA s'occupe du reste.</p>
                </div>
                <div className="space-y-3">
                  {[
                    "Email → Prospect → Devis → Facture → Paiement",
                    "Automatiquement. En moins de 60 secondes.",
                    "Sans effort de votre part.",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className={cn("text-sm", i === 0 ? "font-medium" : "text-muted-foreground")}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 px-4 bg-secondary/20 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="purple" className="mb-4">Démonstration interactive</Badge>
          <h2 className="text-4xl font-bold mb-4">Regardez Fluxia en action.</h2>
          <p className="text-muted-foreground text-lg mb-12">
            Un email entrant. Fluxia fait tout le reste.
          </p>

          <div className="bg-card border border-border rounded-2xl p-6 text-left mb-8">
            <div className="space-y-4">
              {DEMO_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-500",
                    demoStep >= i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  {step.type === "email" && (
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Email entrant</span>
                        <span className="text-xs text-muted-foreground ml-auto">{step.sender}</span>
                      </div>
                      <p className="text-sm italic text-muted-foreground">{step.content}</p>
                    </div>
                  )}
                  {step.type === "ai" && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-violet-400 animate-pulse" />
                      </div>
                      <span className="text-sm text-violet-400">{step.content}</span>
                      <div className="flex gap-1 ml-2">
                        {[0, 1, 2].map((j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${j * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {step.type === "action" && (
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">{step.content}</span>
                    </div>
                  )}
                  {step.type === "result" && (
                    <div className="text-center py-4 border-t border-border mt-4">
                      <div className="text-2xl font-bold text-gradient mb-1">Terminé ✓</div>
                      <div className="text-muted-foreground">{step.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {demoStep === -1 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Cliquez sur le bouton pour voir la magie opérer.</p>
              </div>
            )}
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={runDemo}
            disabled={demoRunning}
          >
            {demoRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Démonstration en cours...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {demoStep >= 0 ? "Rejouer la démo" : "Lancer la démonstration"}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">Fonctionnalités</Badge>
            <h2 className="text-4xl font-bold mb-4">Tout ce dont votre entreprise a besoin.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un système complet. Conçu pour les PME et indépendants suisses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-border bg-card card-hover group">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", f.bg)}>
                  <f.icon className={cn("w-5 h-5", f.color)} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparaison" className="py-24 px-4 bg-secondary/20 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">Comparaison</Badge>
            <h2 className="text-4xl font-bold mb-4">Fluxia vs la concurrence.</h2>
            <p className="text-muted-foreground text-lg">
              Pourquoi payer pour 4 outils quand un seul fait tout mieux ?
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-8 text-sm font-medium text-muted-foreground w-48">Fonctionnalité</th>
                  {["Fluxia", "Bexio", "HubSpot", "Zoho", "Odoo"].map((tool) => (
                    <th key={tool} className={cn("py-4 px-4 text-center text-sm font-semibold", tool === "Fluxia" ? "text-violet-400" : "text-muted-foreground")}>
                      {tool}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-8 text-sm">{row.feature}</td>
                    {[row.fluxia, row.bexio, row.hubspot, row.zoho, row.odoo].map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center">
                        {val ? (
                          <div className="flex justify-center">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", j === 0 ? "bg-violet-500/20" : "bg-green-500/10")}>
                              <Check className={cn("w-3.5 h-3.5", j === 0 ? "text-violet-400" : "text-green-400")} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/10">
                              <X className="w-3.5 h-3.5 text-red-400/70" />
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">Témoignages</Badge>
            <h2 className="text-4xl font-bold mb-4">Ils ont transformé leur entreprise.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-border bg-card card-hover">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold", t.color)}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-24 px-4 bg-secondary/20 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">Tarifs</Badge>
            <h2 className="text-4xl font-bold mb-4">Un prix honnête. Pas de surprises.</h2>
            <p className="text-muted-foreground text-lg">
              14 jours gratuits. Aucune carte bancaire requise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative p-8 rounded-xl border bg-card flex flex-col",
                  plan.popular ? "border-violet-500/50 glow-purple" : "border-border"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="purple" className="px-3 py-1 text-xs font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">CHF {plan.price}</span>
                    <span className="text-muted-foreground mb-1">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-violet-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button
                    variant={plan.popular ? "gradient" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-xl border border-border bg-gradient-to-br from-violet-500/5 to-indigo-500/5 text-center">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <p className="text-muted-foreground mb-4">
              Utilisateurs illimités · Support dédié · Hébergement sur site · SLA garanti · Formation incluse
            </p>
            <Button variant="outline-gradient">Contacter l'équipe commerciale</Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-muted-foreground">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Questions fréquentes.</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-medium text-sm pr-4">{faq.question}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-violet-950/50 via-background to-indigo-950/50 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 glow-purple">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Prêt à piloter votre
            <br />
            <span className="text-gradient">entreprise par l'IA ?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Rejoignez des centaines de PME suisses qui ont centralisé leur activité sur Fluxia.
            14 jours gratuits, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="gradient" size="xl" className="group">
                Créer mon compte gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gradient">Fluxia</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Le système d'exploitation IA pour PME européennes. Basé en Suisse.
              </p>
            </div>
            {[
              { title: "Produit", links: ["Fonctionnalités", "Tarifs", "API", "Changelog"] },
              { title: "Entreprise", links: ["À propos", "Blog", "Carrières", "Contact"] },
              { title: "Légal", links: ["CGU", "Confidentialité", "RGPD", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Fluxia SA · Tous droits réservés · Genève, Suisse
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span>RGPD conforme</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Données en Suisse</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

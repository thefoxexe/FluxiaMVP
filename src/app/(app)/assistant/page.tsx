"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send, Sparkles, Zap, FileText, Users, CreditCard,
  TrendingUp, Mail, RefreshCw, Bot, User, Paperclip,
  BarChart3, MessageSquare, ChevronRight
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { aiChatMessages } from "@/lib/mock-data";

const SUGGESTIONS = [
  { icon: FileText, text: "Montre-moi les devis non signés" },
  { icon: Users, text: "Quels clients dois-je relancer ?" },
  { icon: Zap, text: "Prépare un devis pour Dupont SA" },
  { icon: TrendingUp, text: "Quel est mon CA ce mois ?" },
  { icon: CreditCard, text: "Combien de factures sont impayées ?" },
  { icon: BarChart3, text: "Génère un rapport de la semaine" },
  { icon: Mail, text: "Rédige une relance pour Marc Dupont" },
  { icon: RefreshCw, text: "Montre-moi les automatisations actives" },
];

const AI_RESPONSES: Record<string, string> = {
  "Quels clients dois-je relancer ?": `Voici vos **3 priorités de relance** pour aujourd'hui :

**🔴 URGENT – Marc Dupont (Dupont Bâtiment SA)**
- Facture FAC-2024-004 en retard de **14 jours**
- Montant : CHF 4'324
- Action : 3ème relance recommandée, ton ferme

**🟡 Devis consulté – Sophie Martin (Martin Design Studio)**
- Devis DEV-2024-002 consulté hier
- Montant : CHF 17'620
- Action : Appel téléphonique pour lever les objections

**🟡 Devis sans réponse – Céline Favre (Atelier Favre)**
- Devis DEV-2024-001 envoyé il y a 4 jours
- Montant : CHF 4'021
- Action : Email de relance J+7

Souhaitez-vous que je rédige les emails de relance ?`,

  "Quel est mon CA ce mois ?": `Voici votre **bilan du mois de mars 2024** :

**Chiffre d'affaires : CHF 47'850** ↑ +12.4% vs février

Détail des entrées :
- Factures payées : CHF 29'187 (Antoine Leroy) + CHF 2'594 (Pierre Renaud)
- Acomptes reçus : CHF 16'069
- Total : CHF 47'850

**Comparaison :**
- Février 2024 : CHF 42'300
- Mars 2023 : CHF 31'200
- Croissance annuelle : +53.5% 🎉

**Prévisions avril :** CHF 52'000 – CHF 58'000 (si Sophie Martin signe)`,

  "Combien de factures sont impayées ?": `Vous avez **4 factures impayées** pour un total de **CHF 34'734** :

| Facture | Client | Montant | Statut |
|---------|--------|---------|--------|
| FAC-2024-003 | Thomas Müller | CHF 7'027 | Envoyée |
| FAC-2024-004 | Marc Dupont | CHF 4'324 | **En retard** |
| FAC-2024-005 | Pierre Renaud | CHF 3'675 | Envoyée |
| FAC-2024-006 | Antoine Leroy | CHF 19'458 | En attente |

⚠️ La facture FAC-2024-004 est en retard de 14 jours.

Voulez-vous que j'envoie des relances automatiques ?`,
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant Fluxia. Je connais parfaitement votre business : vos clients, devis, factures, emails et tâches.\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = AI_RESPONSES[text.trim()] ||
        `Je comprends votre demande concernant **"${text.trim()}"**.\n\nJe suis en train d'analyser vos données et de préparer une réponse personnalisée. Cette fonctionnalité sera disponible dans la version complète de Fluxia avec l'agent IA connecté.\n\nEn attendant, voici ce que je peux faire pour vous :\n- Consulter vos **devis et factures**\n- Analyser votre **pipeline CRM**\n- Préparer des **emails de relance**\n- Générer des **rapports financiers**`;

      const assistantMsg: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br />')
      .replace(/^(.+)$/, '<p class="mb-2">$1</p>');
  };

  return (
    <div>
      <Header title="Assistant IA" subtitle="Votre copilote intelligent pour piloter votre business" />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  )}>
                    <div
                      className={cn("text-sm leading-relaxed", msg.role === "user" ? "text-white" : "text-foreground")}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <div className={cn("text-[10px] mt-1.5", msg.role === "user" ? "text-violet-200" : "text-muted-foreground")}>
                      {msg.timestamp}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-xs text-muted-foreground mb-3 font-medium">Suggestions</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text)}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border text-left hover:border-violet-500/30 hover:bg-violet-500/5 transition-colors text-xs text-muted-foreground hover:text-foreground"
                    >
                      <s.icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez une question ou donnez une instruction..."
                    className="resize-none min-h-[44px] max-h-32 pr-10 text-sm leading-relaxed"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant="gradient"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-3">
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                      className="text-[11px] text-muted-foreground hover:text-violet-400 transition-colors"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Entrée pour envoyer · Maj+Entrée pour saut de ligne
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar – Capabilities */}
        <div className="w-72 border-l border-border p-4 space-y-4 hidden xl:block">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacités</div>

          {[
            {
              icon: FileText,
              title: "Devis & Factures",
              items: ["Créer un devis depuis un email", "Générer une facture", "Suivre les impayés"],
              color: "text-violet-400",
            },
            {
              icon: Users,
              title: "CRM & Prospects",
              items: ["Qualifier les prospects", "Analyser le pipeline", "Scorer les contacts"],
              color: "text-cyan-400",
            },
            {
              icon: Mail,
              title: "Emails & Relances",
              items: ["Rédiger des réponses", "Envoyer des relances", "Classifier les emails"],
              color: "text-green-400",
            },
            {
              icon: BarChart3,
              title: "Rapports & Analyses",
              items: ["Rapport journalier IA", "Prévisions de CA", "Détection d'anomalies"],
              color: "text-yellow-400",
            },
          ].map((cap) => (
            <div key={cap.title} className="p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <cap.icon className={cn("w-3.5 h-3.5", cap.color)} />
                <span className="text-xs font-medium">{cap.title}</span>
              </div>
              <ul className="space-y-1">
                {cap.items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => sendMessage(item)}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground w-full text-left"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">Mode Agent IA</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Activez le mode autonome pour que l'IA exécute les actions automatiquement.
            </p>
            <Badge variant="purple" className="text-[10px]">Bêta – Plan Business</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

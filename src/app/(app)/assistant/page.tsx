"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send, Sparkles, Zap, FileText, Users, CreditCard,
  TrendingUp, Mail, RefreshCw, Bot, User, BarChart3, ChevronRight, AlertCircle,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { icon: FileText, text: "Montre-moi les devis non signés" },
  { icon: Users, text: "Quels clients dois-je relancer ?" },
  { icon: TrendingUp, text: "Quel est mon CA ce mois ?" },
  { icon: CreditCard, text: "Combien de factures sont impayées ?" },
  { icon: BarChart3, text: "Génère un rapport de la semaine" },
  { icon: Mail, text: "Rédige une relance pour facture en retard" },
  { icon: Zap, text: "Quelles tâches urgentes dois-je traiter ?" },
  { icon: RefreshCw, text: "Quel est l'état de mon pipeline ?" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatMessage(content: string) {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-secondary px-1 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold mt-3 mb-1">$2</h2>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split("|").filter(c => c.trim());
      return `<div class="flex gap-2 text-xs">${cells.map(c => `<span class="flex-1">${c.trim()}</span>`).join("")}</div>`;
    })
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 text-sm"><span class="text-muted-foreground mt-0.5">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, "<br />");
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant Fluxia. J'ai accès à toutes vos données en temps réel : clients, devis, factures et tâches.\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error?.includes("ANTHROPIC_API_KEY")) {
          setHasApiKey(false);
        }
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: "⚠️ Erreur lors de la connexion à l'IA. Vérifiez que `ANTHROPIC_API_KEY` est configurée." }
            : m
        ));
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: accumulated } : m
        ));
      }
    } catch {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, content: "⚠️ Une erreur est survenue. Vérifiez votre connexion et réessayez." }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div>
      <Header title="Assistant IA" subtitle="Votre copilote intelligent connecté à vos données en temps réel" />

      {!hasApiKey && (
        <div className="mx-4 mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-yellow-300">ANTHROPIC_API_KEY manquante</strong>
            <span className="text-muted-foreground"> — Ajoutez-la dans Vercel → Settings → Environment Variables</span>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 lg:p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  )}>
                    {msg.role === "assistant" && !msg.content && isStreaming ? (
                      <div className="flex gap-1.5 items-center h-5">
                        {[0, 1, 2].map((j) => (
                          <div
                            key={j}
                            className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                            style={{ animationDelay: `${j * 150}ms` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={cn("text-sm leading-relaxed", msg.role === "user" ? "text-white" : "text-foreground")}
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                    )}
                    <div className={cn("text-[10px] mt-1.5", msg.role === "user" ? "text-emerald-200" : "text-muted-foreground")}>
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
            </div>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 lg:px-6 pb-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-xs text-muted-foreground mb-3 font-medium">Suggestions</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text)}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors text-xs text-muted-foreground hover:text-foreground"
                    >
                      <s.icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-2">{s.text}</span>
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
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez une question ou donnez une instruction..."
                    className="resize-none min-h-[44px] max-h-32 text-sm leading-relaxed"
                    rows={1}
                  />
                </div>
                <Button
                  variant="gradient"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-3 overflow-hidden">
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                      className="text-[11px] text-muted-foreground hover:text-emerald-400 transition-colors whitespace-nowrap"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground shrink-0">
                  ↵ Envoyer · ⇧↵ Saut de ligne
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 border-l border-border p-4 space-y-4 hidden xl:block overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacités</div>

          {[
            {
              icon: FileText,
              title: "Devis & Factures",
              items: ["Voir les devis non signés", "Factures impayées", "Générer une relance"],
              color: "text-emerald-400",
            },
            {
              icon: Users,
              title: "CRM & Prospects",
              items: ["Clients à relancer", "État du pipeline", "Scorer les contacts"],
              color: "text-cyan-400",
            },
            {
              icon: TrendingUp,
              title: "Rapports & Analyses",
              items: ["CA du mois", "Rapport de la semaine", "Prévisions de CA"],
              color: "text-green-400",
            },
            {
              icon: Bot,
              title: "Actions IA",
              items: ["Rédiger un email", "Préparer un devis", "Analyser un contact"],
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
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground w-full text-left transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">IA connectée</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              L'assistant a accès à vos données en temps réel et répond avec les vraies informations de votre business.
            </p>
            <Badge variant="success" className="text-[10px]">Claude Haiku 4.5</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

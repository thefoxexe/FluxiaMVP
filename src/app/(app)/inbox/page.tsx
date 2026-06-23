"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Mail, Search, Star, Archive, Reply, Forward,
  Sparkles, Send, Zap, ArrowLeft, InboxIcon,
  MoreHorizontal, Check, Link2,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Email } from "@/lib/supabase/types";

const CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "prospect", label: "Prospects" },
  { id: "client", label: "Clients" },
  { id: "facture", label: "Factures" },
  { id: "urgent", label: "Urgents" },
  { id: "partenaire", label: "Partenaires" },
];

const CATEGORY_COLORS: Record<string, string> = {
  prospect: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  client: "bg-green-500/10 text-green-400 border-green-500/20",
  facture: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  partenaire: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  support: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emails")
      .select("*")
      .order("received_at", { ascending: false })
      .then(({ data }) => {
        setEmails(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredEmails = emails.filter((e) => {
    const matchesCategory = activeCategory === "all" || e.category === activeCategory;
    const matchesSearch = !searchQuery ||
      e.from_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = emails.filter(e => !e.is_read).length;

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setReplyOpen(false);
    setReplyText("");
    setMobileShowDetail(true);
    if (!email.is_read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
      startTransition(async () => {
        const supabase = createClient();
        await supabase.from("emails").update({ is_read: true }).eq("id", email.id);
      });
    }
  };

  const toggleStar = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = emails.find(em => em.id === emailId);
    if (!target) return;
    setEmails(prev => prev.map(em => em.id === emailId ? { ...em, is_starred: !em.is_starred } : em));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("emails").update({ is_starred: !target.is_starred }).eq("id", emailId);
    });
  };

  const handleUseDraft = () => {
    if (selectedEmail?.ai_draft) setReplyText(selectedEmail.ai_draft);
    setReplyOpen(true);
  };

  const aiActions = (email: Email): string[] => {
    if (Array.isArray(email.ai_actions)) return email.ai_actions as string[];
    return [];
  };

  return (
    <div>
      <Header title="Inbox IA" subtitle="Emails classifiés et analysés par l'IA" />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left: Email List */}
        <div className={cn(
          "border-r border-border flex flex-col shrink-0",
          "w-full lg:w-80",
          mobileShowDetail && "hidden lg:flex"
        )}>
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-3 py-2 border-b border-border flex gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  activeCategory === cat.id
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 m-3 rounded-lg bg-secondary/20 animate-pulse" />)}
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
                <Mail className="w-10 h-10 text-muted-foreground/30 mb-3" />
                {emails.length === 0 ? (
                  <>
                    <p className="text-sm font-medium mb-1">Aucun email</p>
                    <p className="text-xs text-muted-foreground mb-4">Connectez votre boîte email pour synchroniser vos messages</p>
                    <Button size="sm" variant="outline" className="gap-2 text-xs">
                      <Link2 className="w-3.5 h-3.5" /> Connecter Gmail
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun email dans cette catégorie</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={cn(
                      "w-full text-left p-3 hover:bg-secondary/50 transition-colors",
                      selectedEmail?.id === email.id && "bg-secondary/70",
                      !email.is_read && "border-l-2 border-l-violet-500"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                        {getInitials(email.from_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn("text-xs truncate flex-1", !email.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                            {email.from_name}
                          </span>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            {email.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                            {!email.is_read && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mb-1">{email.subject}</div>
                        <div className="flex items-center gap-2">
                          {email.category && (
                            <div className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", CATEGORY_COLORS[email.category] || "bg-gray-500/10 text-gray-400")}>
                              {email.category}
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatRelativeDate(email.received_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Connect Email Banner */}
          {!loading && emails.length === 0 && (
            <div className="p-3 border-t border-border bg-violet-500/5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Connectez Gmail ou Outlook pour que l'IA classe et analyse vos emails automatiquement.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Email Detail */}
        {selectedEmail ? (
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden",
            !mobileShowDetail && "hidden lg:flex"
          )}>
            {/* Email Header */}
            <div className="px-4 lg:px-6 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden shrink-0 mt-0.5"
                    onClick={() => setMobileShowDetail(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm lg:text-base font-semibold mb-1 truncate">{selectedEmail.subject}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span><strong className="text-foreground">{selectedEmail.from_name}</strong> &lt;{selectedEmail.from_email}&gt;</span>
                      <span className="hidden sm:inline">{formatRelativeDate(selectedEmail.received_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedEmail.category && (
                    <div className={cn("text-xs border rounded-full px-2.5 py-1 font-medium", CATEGORY_COLORS[selectedEmail.category] || "")}>
                      {selectedEmail.category}
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => toggleStar(selectedEmail.id, e)}>
                    <Star className={cn("w-4 h-4", selectedEmail.is_starred ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setReplyOpen(!replyOpen)}>
                  <Reply className="w-3.5 h-3.5" />Répondre
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Forward className="w-3.5 h-3.5" />Transférer
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Archive className="w-3.5 h-3.5" />Archiver
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Email Body */}
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>

                {/* AI Panel */}
                {(selectedEmail.ai_summary || aiActions(selectedEmail).length > 0 || selectedEmail.ai_draft) && (
                  <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/10">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-violet-300">Analyse IA</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {selectedEmail.ai_summary && (
                        <div>
                          <div className="text-xs font-medium text-violet-400 mb-1.5">Résumé</div>
                          <p className="text-sm text-muted-foreground">{selectedEmail.ai_summary}</p>
                        </div>
                      )}
                      {aiActions(selectedEmail).length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-violet-400 mb-2">Actions recommandées</div>
                          <div className="space-y-1.5">
                            {aiActions(selectedEmail).map((action, i) => (
                              <button key={i} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full text-left py-1.5 px-2 rounded-md hover:bg-violet-500/10 transition-colors">
                                <div className="w-4 h-4 rounded-full border border-violet-500/30 flex items-center justify-center shrink-0">
                                  <span className="text-[9px] text-violet-400">{i + 1}</span>
                                </div>
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEmail.ai_draft && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-violet-400">Réponse suggérée</div>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] text-violet-400 border-violet-500/30 hover:bg-violet-500/10" onClick={handleUseDraft}>
                              <Zap className="w-3 h-3" /> Utiliser
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed bg-background/50 rounded-lg p-3 border border-border/50 whitespace-pre-wrap">
                            {selectedEmail.ai_draft}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Reply Box */}
            {replyOpen && (
              <div className="border-t border-border p-4">
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-secondary/30 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      À : <strong className="text-foreground">{selectedEmail.from_name}</strong>
                    </span>
                    {replyText === selectedEmail.ai_draft && selectedEmail.ai_draft && (
                      <Badge variant="purple" className="text-[10px]">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />Brouillon IA
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Rédigez votre réponse..."
                    className="border-0 rounded-none resize-none text-sm min-h-[100px] focus-visible:ring-0"
                  />
                  <div className="px-3 py-2 border-t border-border flex items-center justify-between bg-secondary/20">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-violet-400" onClick={handleUseDraft}>
                      <Sparkles className="w-3.5 h-3.5" />Brouillon IA
                    </Button>
                    <Button variant="gradient" size="sm" className="h-7 text-xs gap-1.5">
                      <Send className="w-3.5 h-3.5" />Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">Sélectionnez un email</p>
              {emails.length === 0 && !loading && (
                <div className="mt-6 max-w-xs mx-auto p-4 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    Connectez votre boîte email pour commencer à recevoir et analyser vos messages avec l'IA.
                  </p>
                  <Button size="sm" className="gap-2 w-full">
                    <Link2 className="w-3.5 h-3.5" />Connecter Gmail
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 w-full mt-2">
                    <Link2 className="w-3.5 h-3.5" />Connecter Outlook
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

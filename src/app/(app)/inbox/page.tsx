"use client";

import React, { useState } from "react";
import {
  Mail, Search, Star, Archive, Tag, Clock, Reply, Forward,
  Sparkles, ChevronDown, Filter, MoreHorizontal, Send,
  Bot, Check, AlertCircle, Inbox as InboxIcon, RefreshCw, Zap, ArrowLeft
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials, formatRelativeDate, getStatusColor } from "@/lib/utils";
import { mockEmails } from "@/lib/mock-data";
import type { Email } from "@/lib/types";

const CATEGORIES = [
  { id: "all", label: "Tous", count: 6 },
  { id: "prospect", label: "Prospects", count: 1 },
  { id: "client", label: "Clients", count: 2 },
  { id: "facture", label: "Factures", count: 1 },
  { id: "urgent", label: "Urgents", count: 1 },
  { id: "partenaire", label: "Partenaires", count: 1 },
];

const CATEGORY_COLORS: Record<string, string> = {
  prospect: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  client: "bg-green-500/10 text-green-400 border-green-500/20",
  facture: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  partenaire: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  fournisseur: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  support: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [useAiDraft, setUseAiDraft] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const filteredEmails = mockEmails.filter((e) => {
    const matchesCategory = activeCategory === "all" || e.category === activeCategory;
    const matchesSearch = !searchQuery ||
      e.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setReplyOpen(false);
    setReplyText("");
    setUseAiDraft(false);
    setMobileShowDetail(true);
  };

  const handleUseDraft = () => {
    if (selectedEmail?.aiDraft) {
      setReplyText(selectedEmail.aiDraft);
      setUseAiDraft(true);
    }
    setReplyOpen(true);
  };

  return (
    <div>
      <Header title="Inbox IA" subtitle="Emails classifiés par l'IA" />

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
                <span className="text-[10px] opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {filteredEmails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-secondary/50 transition-colors",
                    selectedEmail?.id === email.id && "bg-secondary/70",
                    !email.isRead && "bg-violet-500/3"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px]">{getInitials(email.fromName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-xs font-medium truncate flex-1", !email.isRead && "text-foreground font-semibold")}>
                          {email.fromName}
                        </span>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {email.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          {!email.isRead && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mb-1">{email.subject}</div>
                      <div className="flex items-center gap-2">
                        <div className={cn("text-[10px] border rounded-full px-2 py-0.5 font-medium", CATEGORY_COLORS[email.category] || "bg-gray-500/10 text-gray-400")}>
                          {email.category}
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatRelativeDate(email.receivedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
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
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[8px]">{getInitials(selectedEmail.fromName)}</AvatarFallback>
                      </Avatar>
                      <span><strong className="text-foreground">{selectedEmail.fromName}</strong></span>
                    </div>
                    <span className="hidden sm:inline">{formatRelativeDate(selectedEmail.receivedAt)}</span>
                  </div>
                </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={cn("text-xs border rounded-full px-2.5 py-1 font-medium", CATEGORY_COLORS[selectedEmail.category] || "")}>
                    {selectedEmail.category}
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Star className={cn("w-4 h-4", selectedEmail.isStarred ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setReplyOpen(!replyOpen)}>
                  <Reply className="w-3.5 h-3.5" />
                  Répondre
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Forward className="w-3.5 h-3.5" />
                  Transférer
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Archive className="w-3.5 h-3.5" />
                  Archiver
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Email Body */}
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                </div>

                {/* AI Panel */}
                {selectedEmail.aiSummary && (
                  <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/10">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-violet-300">Analyse IA</span>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Summary */}
                      <div>
                        <div className="text-xs font-medium text-violet-400 mb-1.5">Résumé automatique</div>
                        <p className="text-sm text-muted-foreground">{selectedEmail.aiSummary}</p>
                      </div>

                      {/* Actions */}
                      {selectedEmail.aiActions && (
                        <div>
                          <div className="text-xs font-medium text-violet-400 mb-2">Actions recommandées</div>
                          <div className="space-y-1.5">
                            {selectedEmail.aiActions.map((action, i) => (
                              <button
                                key={i}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full text-left py-1.5 px-2 rounded-md hover:bg-violet-500/10 transition-colors"
                              >
                                <div className="w-4 h-4 rounded-full border border-violet-500/30 flex items-center justify-center shrink-0">
                                  <span className="text-[9px] text-violet-400">{i + 1}</span>
                                </div>
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Draft */}
                      {selectedEmail.aiDraft && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-violet-400">Réponse suggérée par l'IA</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                              onClick={handleUseDraft}
                            >
                              <Zap className="w-3 h-3" />
                              Utiliser ce brouillon
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed bg-background/50 rounded-lg p-3 border border-border/50 whitespace-pre-wrap">
                            {selectedEmail.aiDraft}
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
                      À : <strong className="text-foreground">{selectedEmail.fromName}</strong>
                    </span>
                    {useAiDraft && (
                      <Badge variant="purple" className="text-[10px]">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        Brouillon IA
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-violet-400" onClick={handleUseDraft}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Reformuler avec IA
                      </Button>
                    </div>
                    <Button variant="gradient" size="sm" className="h-7 text-xs gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <InboxIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Sélectionnez un email</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

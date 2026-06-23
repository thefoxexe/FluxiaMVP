"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Video, Phone, Clock, AlertCircle } from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent, Contact } from "@/lib/supabase/types";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; defaultColor: string }> = {
  meeting: { icon: <Video className="w-3.5 h-3.5" />, defaultColor: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  call: { icon: <Phone className="w-3.5 h-3.5" />, defaultColor: "text-green-400 bg-green-500/10 border-green-500/20" },
  deadline: { icon: <AlertCircle className="w-3.5 h-3.5" />, defaultColor: "text-red-400 bg-red-500/10 border-red-500/20" },
  reminder: { icon: <Clock className="w-3.5 h-3.5" />, defaultColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
};

export default function CalendrierPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("calendar_events").select("*").order("start_at", { ascending: true }),
      supabase.from("contacts").select("id, name"),
    ]).then(([evRes, contRes]) => {
      setEvents(evRes.data ?? []);
      setContacts((contRes.data ?? []) as Contact[]);
      setLoading(false);
    });
  }, []);

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c.name]));

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.start_at.startsWith(dateStr));
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const upcomingEvents = events
    .filter(e => new Date(e.start_at) >= today)
    .slice(0, 5);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  return (
    <div>
      <Header title="Calendrier" subtitle="Gérez vos rendez-vous et synchronisez vos agendas" />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Main Calendar */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base lg:text-xl font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDay(today.getDate()); }}
                className="text-xs text-blue-400"
              >
                Auj.
              </Button>
            </div>
            <Button variant="gradient" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Événement</span>
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
              {DAYS.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 lg:h-28 border-b border-r border-border bg-secondary/10" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "h-24 lg:h-28 border-b border-r border-border p-1.5 cursor-pointer transition-colors overflow-hidden",
                      isSelected ? "bg-blue-500/10" : "hover:bg-secondary/30",
                      (day + firstDay) % 7 === 0 && "border-r-0"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1",
                      isToday ? "bg-blue-500 text-white" : "text-foreground"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => {
                        const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.reminder;
                        return (
                          <div key={event.id} className={cn("text-[10px] font-medium rounded px-1.5 py-0.5 truncate border", event.color || cfg.defaultColor)}>
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border p-4 overflow-y-auto space-y-4">
          {selectedDay && (
            <div>
              <div className="text-sm font-semibold mb-3">{selectedDay} {MONTHS[currentMonth]}</div>
              {loading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-secondary/20 animate-pulse" />)}</div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center">Aucun événement ce jour</div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((event) => {
                    const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.reminder;
                    return (
                      <div key={event.id} className={cn("p-3 rounded-lg border text-xs", event.color || cfg.defaultColor)}>
                        <div className="flex items-center gap-2 mb-1">
                          {cfg.icon}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="text-[10px] opacity-80">
                          {new Date(event.start_at).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {new Date(event.end_at).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {event.contact_id && contactMap[event.contact_id] && (
                          <div className="text-[10px] opacity-70 mt-0.5">{contactMap[event.contact_id]}</div>
                        )}
                        {event.location && (
                          <div className="text-[10px] opacity-70 mt-0.5">{event.location}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="text-sm font-semibold mb-3">Prochains événements</div>
            {loading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-secondary/20 animate-pulse" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">Aucun événement à venir</div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => {
                  const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.reminder;
                  return (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-blue-500/20 transition-colors">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs", event.color || cfg.defaultColor)}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{event.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(event.start_at).toLocaleDateString("fr-CH", { day: "numeric", month: "short" })}
                          {" à "}
                          {new Date(event.start_at).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {event.contact_id && contactMap[event.contact_id] && (
                          <div className="text-[10px] text-muted-foreground truncate">{contactMap[event.contact_id]}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/30">
            <div className="text-xs font-medium mb-2">Synchronisation</div>
            <div className="space-y-1.5">
              {[
                { name: "Google Calendar", status: "Non connecté", color: "text-muted-foreground" },
                { name: "Outlook Calendar", status: "Non connecté", color: "text-muted-foreground" },
              ].map((cal) => (
                <div key={cal.name} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{cal.name}</span>
                  <span className={cn("text-[10px] font-medium", cal.color)}>{cal.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

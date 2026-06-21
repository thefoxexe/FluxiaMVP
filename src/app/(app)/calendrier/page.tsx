"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Video, Phone, Clock, MapPin } from "lucide-react";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockCalendarEvents } from "@/lib/mock-data";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendrierPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [view, setView] = useState<"month" | "week">("month");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

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
    return mockCalendarEvents.filter((e) => e.start.startsWith(dateStr));
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const upcomingEvents = mockCalendarEvents
    .filter((e) => new Date(e.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const EVENT_TYPE_ICONS = {
    meeting: <Video className="w-3.5 h-3.5" />,
    call: <Phone className="w-3.5 h-3.5" />,
    deadline: <Clock className="w-3.5 h-3.5" />,
    reminder: <Clock className="w-3.5 h-3.5" />,
  };

  return (
    <div>
      <Header title="Calendrier" subtitle="Gérez vos rendez-vous et synchronisez vos agendas" />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Main Calendar */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Header */}
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
                className="text-xs text-violet-400"
              >
                Auj.
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-lg overflow-hidden">
                {["month", "week"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v as any)}
                    className={cn("px-3 py-1.5 text-xs font-medium transition-colors capitalize", view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}
                  >
                    {v === "month" ? "Mois" : "Semaine"}
                  </button>
                ))}
              </div>
              <Button variant="gradient" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Événement</span>
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
              {DAYS.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-28 border-b border-r border-border bg-secondary/10" />
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
                      "h-28 border-b border-r border-border p-2 cursor-pointer transition-colors overflow-hidden",
                      isSelected ? "bg-violet-500/10" : "hover:bg-secondary/30",
                      (day + firstDay) % 7 === 0 && "border-r-0"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1",
                      isToday ? "bg-violet-500 text-white" : "text-foreground"
                    )}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn("text-[10px] font-medium rounded px-1.5 py-0.5 truncate border", event.color)}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 2} autres</div>
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
          {/* Selected Day Events */}
          {selectedDay && (
            <div>
              <div className="text-sm font-semibold mb-3">
                {selectedDay} {MONTHS[currentMonth]}
              </div>
              {selectedDayEvents.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  Aucun événement ce jour
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((event) => (
                    <div key={event.id} className={cn("p-3 rounded-lg border text-xs", event.color)}>
                      <div className="flex items-center gap-2 mb-1">
                        {EVENT_TYPE_ICONS[event.type]}
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <div className="text-[10px] opacity-80">
                        {new Date(event.start).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(event.end).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {event.contactName && (
                        <div className="text-[10px] opacity-70 mt-0.5">{event.contactName}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <div className="text-sm font-semibold mb-3">Prochains événements</div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-violet-500/20 transition-colors">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs", event.color)}>
                    {EVENT_TYPE_ICONS[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{event.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(event.start).toLocaleDateString("fr-CH", { day: "numeric", month: "short" })}
                      {" à "}
                      {new Date(event.start).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {event.contactName && (
                      <div className="text-[10px] text-muted-foreground truncate">{event.contactName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar integrations */}
          <div className="p-3 rounded-lg border border-border bg-secondary/30">
            <div className="text-xs font-medium mb-2">Synchronisation</div>
            <div className="space-y-1.5">
              {[
                { name: "Google Calendar", status: "Connecté", color: "text-green-400" },
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

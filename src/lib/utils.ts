import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return formatDate(date);
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    prospect: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    contacté: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "devis envoyé": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    négociation: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    gagné: "bg-green-500/10 text-green-400 border-green-500/20",
    perdu: "bg-red-500/10 text-red-400 border-red-500/20",
    brouillon: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    envoyé: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    consulté: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    accepté: "bg-green-500/10 text-green-400 border-green-500/20",
    refusé: "bg-red-500/10 text-red-400 border-red-500/20",
    expiré: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    payée: "bg-green-500/10 text-green-400 border-green-500/20",
    "en attente": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    en_retard: "bg-red-500/10 text-red-400 border-red-500/20",
    annulée: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    urgent: "bg-red-500/10 text-red-400 border-red-500/20",
    client: "bg-green-500/10 text-green-400 border-green-500/20",
    facture: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    support: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    partenaire: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    fournisseur: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return colors[status.toLowerCase()] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

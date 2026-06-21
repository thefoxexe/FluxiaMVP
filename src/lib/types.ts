export type ContactStatus = "prospect" | "contacté" | "devis envoyé" | "négociation" | "gagné" | "perdu";
export type QuoteStatus = "brouillon" | "envoyé" | "consulté" | "accepté" | "refusé" | "expiré";
export type InvoiceStatus = "brouillon" | "envoyé" | "payée" | "en attente" | "en_retard" | "annulée";
export type EmailCategory = "prospect" | "client" | "facture" | "support" | "partenaire" | "fournisseur" | "urgent";
export type TaskPriority = "haute" | "moyenne" | "basse";

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  notes: string;
  status: ContactStatus;
  score: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  contactId: string;
  contactName: string;
  company: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  contactId: string;
  contactName: string;
  company: string;
  status: InvoiceStatus;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  quoteId?: string;
  notes?: string;
}

export interface Email {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  category: EmailCategory;
  isRead: boolean;
  isStarred: boolean;
  receivedAt: string;
  aiSummary?: string;
  aiActions?: string[];
  aiDraft?: string;
  threadId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: "todo" | "en_cours" | "terminée";
  assignee?: string;
  contactId?: string;
  contactName?: string;
  deadline?: string;
  createdAt: string;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "meeting" | "call" | "deadline" | "reminder";
  contactId?: string;
  contactName?: string;
  description?: string;
  color: string;
}

export interface DashboardStats {
  monthRevenue: number;
  monthRevenueGrowth: number;
  yearRevenue: number;
  unpaidInvoices: number;
  unpaidInvoicesCount: number;
  pendingQuotes: number;
  pendingQuotesCount: number;
  conversionRate: number;
  availableCash: number;
  newContacts: number;
}

export interface AutomationTrigger {
  type: string;
  condition?: string;
}

export interface AutomationAction {
  type: string;
  target?: string;
  template?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive: boolean;
  runsCount: number;
  lastRun?: string;
  createdAt: string;
}

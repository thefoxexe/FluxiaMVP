import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getBusinessContext(supabase: ReturnType<typeof createClient>) {
  const [invoicesRes, quotesRes, contactsRes, tasksRes] = await Promise.all([
    supabase.from("invoices").select("number, status, total, due_date, paid_at, contact_id").order("created_at", { ascending: false }).limit(20),
    supabase.from("quotes").select("number, status, total, valid_until, contact_id, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("contacts").select("name, company, status, revenue, score, email, phone").order("created_at", { ascending: false }).limit(20),
    supabase.from("tasks").select("title, status, priority, deadline").eq("status", "todo").order("created_at", { ascending: false }).limit(10),
  ]);

  const invoices = invoicesRes.data ?? [];
  const quotes = quotesRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const tasks = tasksRes.data ?? [];

  const totalRevenue = invoices.filter(i => i.status === "payée").reduce((s, i) => s + i.total, 0);
  const unpaidTotal = invoices.filter(i => ["envoyé", "en attente", "en_retard"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdueInvoices = invoices.filter(i => i.status === "en_retard");
  const pendingQuotes = quotes.filter(q => ["envoyé", "consulté"].includes(q.status));

  return `Tu es l'assistant IA intégré à Fluxia, un logiciel de gestion de business. Tu as accès aux données en temps réel de l'utilisateur.

=== DONNÉES ACTUELLES ===

FINANCES :
- Chiffre d'affaires total (factures payées) : CHF ${totalRevenue.toFixed(2)}
- Montant impayé total : CHF ${unpaidTotal.toFixed(2)}
- Factures en retard : ${overdueInvoices.length} (${overdueInvoices.map(i => `${i.number} CHF ${i.total}`).join(", ") || "aucune"})

FACTURES (${invoices.length} au total) :
${invoices.map(i => `- ${i.number} | ${i.status} | CHF ${i.total}${i.due_date ? ` | échéance: ${i.due_date}` : ""}`).join("\n") || "Aucune facture"}

DEVIS (${quotes.length} au total) :
${quotes.map(q => `- ${q.number} | ${q.status} | CHF ${q.total}${q.valid_until ? ` | valide jusqu'au: ${q.valid_until}` : ""}`).join("\n") || "Aucun devis"}
Devis en attente de réponse : ${pendingQuotes.length}

CONTACTS/CLIENTS (${contacts.length} au total) :
${contacts.map(c => `- ${c.name}${c.company ? ` (${c.company})` : ""} | ${c.status} | CA: CHF ${c.revenue}${c.email ? ` | ${c.email}` : ""}`).join("\n") || "Aucun contact"}

TÂCHES EN ATTENTE (${tasks.length}) :
${tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title}${t.deadline ? ` | deadline: ${t.deadline}` : ""}`).join("\n") || "Aucune tâche"}

=== FIN DES DONNÉES ===

Réponds en français, de manière précise et actionnable. Utilise les vraies données ci-dessus. Tu peux faire des tableaux markdown, des listes, du gras. Sois concis mais complet. Si l'utilisateur demande une action (créer un devis, envoyer une facture), explique les étapes ou propose un texte prêt à l'emploi.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY non configurée" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = await req.json();

  const supabase = createClient();
  let systemPrompt: string;
  try {
    systemPrompt = await getBusinessContext(supabase);
  } catch {
    systemPrompt = "Tu es l'assistant IA de Fluxia, un logiciel de gestion de business. Réponds en français de manière utile et concise.";
  }

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

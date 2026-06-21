"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getQuotes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("quotes")
    .select("*, contacts(name, company), quote_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message };
}

export async function createQuote(input: {
  contact_id?: string;
  title?: string;
  valid_until?: string;
  tax_rate?: number;
  notes?: string;
  items: { description: string; quantity: number; unit_price: number }[];
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const subtotal = input.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxRate = input.tax_rate ?? 7.7;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const count = await supabase.from("quotes").select("id", { count: "exact" }).eq("user_id", user.id);
  const number = `DEV-${new Date().getFullYear()}-${String((count.count ?? 0) + 1).padStart(3, "0")}`;

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      contact_id: input.contact_id,
      number,
      title: input.title,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      valid_until: input.valid_until,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.items.length > 0) {
    await supabase.from("quote_items").insert(
      input.items.map((item, i) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sort_order: i,
      }))
    );
  }

  revalidatePath("/devis");
  return { data: quote };
}

export async function updateQuoteStatus(
  id: string,
  status: "brouillon" | "envoyé" | "consulté" | "accepté" | "refusé" | "expiré"
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates: { status: typeof status; sent_at?: string; accepted_at?: string } = { status };
  if (status === "envoyé") updates.sent_at = new Date().toISOString();
  if (status === "accepté") updates.accepted_at = new Date().toISOString();

  const { error } = await supabase
    .from("quotes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/devis");
  return { error: error?.message };
}

export async function deleteQuote(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("quotes").delete().eq("id", id).eq("user_id", user.id);
  if (!error) revalidatePath("/devis");
  return { error: error?.message };
}

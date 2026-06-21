"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("invoices")
    .select("*, contacts(name, company), invoice_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message };
}

export async function createInvoice(input: {
  contact_id?: string;
  quote_id?: string;
  due_date?: string;
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

  const count = await supabase.from("invoices").select("id", { count: "exact" }).eq("user_id", user.id);
  const number = `FAC-${new Date().getFullYear()}-${String((count.count ?? 0) + 1).padStart(3, "0")}`;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      contact_id: input.contact_id,
      quote_id: input.quote_id,
      number,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      due_date: input.due_date,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.items.length > 0) {
    await supabase.from("invoice_items").insert(
      input.items.map((item, i) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sort_order: i,
      }))
    );
  }

  revalidatePath("/factures");
  return { data: invoice };
}

export async function markInvoicePaid(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("invoices")
    .update({ status: "payée", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/factures");
  return { error: error?.message };
}

export async function sendInvoice(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("invoices")
    .update({ status: "envoyé", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/factures");
  return { error: error?.message };
}

export async function deleteInvoice(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", user.id);
  if (!error) revalidatePath("/factures");
  return { error: error?.message };
}

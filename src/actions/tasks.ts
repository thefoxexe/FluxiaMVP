"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("tasks")
    .select("*, contacts(name)")
    .eq("user_id", user.id)
    .order("priority", { ascending: true })
    .order("deadline", { ascending: true, nullsFirst: false });

  return { data: data ?? [], error: error?.message };
}

export async function createTask(input: {
  title: string;
  description?: string;
  priority?: "haute" | "moyenne" | "basse";
  deadline?: string;
  contact_id?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (!error) revalidatePath("/taches");
  return { data, error: error?.message };
}

export async function updateTaskStatus(id: string, status: "todo" | "en_cours" | "terminée") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "terminée" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) revalidatePath("/taches");
  return { error: error?.message };
}

export async function deleteTask(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
  if (!error) revalidatePath("/taches");
  return { error: error?.message };
}

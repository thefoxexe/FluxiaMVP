"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAutomation(input: {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: Record<string, string | number | boolean | null>;
  actions?: Array<{ type: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("automations")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description ?? null,
      trigger_type: input.trigger_type,
      trigger_config: input.trigger_config ?? {},
      actions: input.actions ?? [],
      is_active: true,
      runs_count: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/automatisations");
  return { data };
}

export async function deleteAutomation(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("automations").delete().eq("id", id).eq("user_id", user.id);
  if (!error) revalidatePath("/automatisations");
  return { error: error?.message };
}

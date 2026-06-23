"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCalendarEvent(input: {
  title: string;
  type: "meeting" | "call" | "deadline" | "reminder";
  start_at: string;
  end_at: string;
  description?: string;
  location?: string;
  contact_id?: string;
  color?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: user.id,
      title: input.title,
      type: input.type,
      start_at: input.start_at,
      end_at: input.end_at,
      description: input.description,
      location: input.location,
      contact_id: input.contact_id || null,
      color: input.color ?? "",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/calendrier");
  return { data };
}

export async function deleteCalendarEvent(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("calendar_events").delete().eq("id", id).eq("user_id", user.id);
  if (!error) revalidatePath("/calendrier");
  return { error: error?.message };
}

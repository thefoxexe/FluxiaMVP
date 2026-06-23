"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(input: { full_name?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { error } = await supabase.from("profiles").update(input).eq("id", user.id);
  if (!error) revalidatePath("/parametres");
  return { error: error?.message };
}

export async function updateCompanyProfile(input: {
  company_name?: string;
  company_phone?: string;
  company_address?: string;
  company_city?: string;
  company_zip?: string;
  company_country?: string;
  company_vat?: string;
  company_website?: string;
  company_email?: string;
  company_iban?: string;
  company_currency?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("profiles").update(input).eq("id", user.id);
  if (!error) revalidatePath("/parametres");
  return { error: error?.message };
}

export async function updateLogoUrl(url: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { error } = await supabase.from("profiles").update({ company_logo_url: url }).eq("id", user.id);
  if (!error) revalidatePath("/parametres");
  return { error: error?.message };
}

export async function updateInvoiceTemplate(template: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { error } = await supabase.from("profiles").update({ invoice_template: template }).eq("id", user.id);
  if (!error) revalidatePath("/parametres");
  return { error: error?.message };
}

export async function changePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message };
}

export async function generateApiKey() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  const key = "flx_live_" + Buffer.from(array).toString("base64url");

  const { error } = await supabase.from("profiles").update({ api_key: key }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/parametres");
  return { data: key };
}

export async function inviteTeamMember(email: string) {
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  const adminSupabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { error } = await adminSupabase.auth.admin.inviteUserByEmail(email);
  return { error: error?.message };
}

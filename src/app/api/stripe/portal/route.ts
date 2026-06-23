import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY non configuré dans les variables d'environnement Vercel." }, { status: 500 });
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "Aucun abonnement actif trouvé pour ce compte." }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/parametres`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne Stripe";
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

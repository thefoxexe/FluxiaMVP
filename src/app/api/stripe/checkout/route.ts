import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY non configuré dans les variables d'environnement Vercel." }, { status: 500 });
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { plan } = await request.json() as { plan: keyof typeof STRIPE_PLANS };
    const planConfig = STRIPE_PLANS[plan];
    if (!planConfig) return NextResponse.json({ error: "Plan invalide" }, { status: 400 });

    if (!planConfig.priceId) {
      return NextResponse.json({
        error: `STRIPE_PRICE_${plan.toUpperCase()} non configuré dans les variables d'environnement Vercel.`,
      }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email!,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/parametres?success=true`,
      cancel_url: `${origin}/parametres?canceled=true`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne Stripe";
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

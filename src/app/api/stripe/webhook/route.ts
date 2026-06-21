import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

function getSubId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (!details) return null;
  const sub = details.subscription;
  return typeof sub === "string" ? sub : sub?.id ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.supabase_user_id;
        const plan = sub.metadata.plan as string;
        if (!userId) break;

        const periodEnd = sub.items.data[0]?.current_period_end;
        await supabase.from("profiles").update({
          stripe_subscription_id: sub.id,
          subscription_plan: (plan as "free" | "solo" | "team" | "business") || "solo",
          subscription_status: sub.status,
          subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        }).eq("id", userId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.supabase_user_id;
        if (!userId) break;
        await supabase.from("profiles").update({
          subscription_plan: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
        }).eq("id", userId);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubId(invoice);
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          const userId = subscription.metadata.supabase_user_id;
          const periodEnd = subscription.items.data[0]?.current_period_end;
          if (userId) {
            await supabase.from("profiles").update({
              subscription_status: "active",
              subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            }).eq("id", userId);
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getSubId(invoice);
        if (subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          const userId = subscription.metadata.supabase_user_id;
          if (userId) {
            await supabase.from("profiles").update({ subscription_status: "past_due" }).eq("id", userId);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

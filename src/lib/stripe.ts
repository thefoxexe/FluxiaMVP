import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export const STRIPE_PLANS = {
  solo: {
    priceId: process.env.STRIPE_PRICE_SOLO,
    name: "Solo",
    price: 49,
    currency: "CHF",
  },
  team: {
    priceId: process.env.STRIPE_PRICE_TEAM,
    name: "Team",
    price: 99,
    currency: "CHF",
  },
  business: {
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    name: "Business",
    price: 199,
    currency: "CHF",
  },
} as const;

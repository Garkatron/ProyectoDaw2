import Stripe from "stripe";

export const stripeClient = new Stripe(Bun.env.STRIPE_KEY!);

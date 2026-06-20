import Stripe from "stripe";
import type { Config, Context } from "@netlify/functions";

// Creates a Stripe Checkout Session for a given price ID.
// Front-end calls this only when CONFIG.useServerless is true.
// Requires the STRIPE_SECRET_KEY env var (set in Netlify dashboard).
export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in Netlify env vars." },
      { status: 500 },
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { priceId, quantity, productKey, metadata } = payload || {};
  if (!priceId || typeof priceId !== "string" || priceId.includes("REPLACE")) {
    return Response.json({ error: "Missing or placeholder priceId" }, { status: 400 });
  }
  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));

  const stripe = new Stripe(secret);
  const origin = req.headers.get("origin") || new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: qty }],
      metadata: {
        app: "ActionLadder Pool Market Ladder",
        productKey: String(productKey || ""),
        ...(metadata && typeof metadata === "object" ? metadata : {}),
      },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });
    return Response.json({ url: session.url, id: session.id });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/create-checkout",
};

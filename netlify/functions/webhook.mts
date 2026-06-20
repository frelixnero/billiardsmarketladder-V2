import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { Config } from "@netlify/functions";

// Handles Stripe Webhooks. Route is exposed at /api/webhook.
// Receives payments and refunds, and records them in Supabase database tables.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Stripe or Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return Response.json({ error: err?.message || "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const meta = s.metadata || {};
      const { type, playerId, playerName, shareTier, buyerName, buyerEmail, playerRank, season } = meta;
      
      const amount = (s.amount_total || 0) / 100;
      
      // Build transaction description
      let description = "Other Payment";
      if (type === "share") {
        description = `Share (${shareTier}) on ${playerName}`;
      } else if (type === "registration") {
        description = `Registration — ${playerName}`;
      } else if (type === "weekly_dues") {
        description = `Weekly Dues — ${playerName}`;
      } else if (type === "teamReg") {
        description = `Team Entry — ${playerName}`;
      }

      // 1. Record payment in the payments table
      const { error: payErr } = await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        description,
        amount,
        type: type || "other",
        date: new Date().toISOString().split("T")[0],
        source: "stripe",
        stripe_session_id: s.id,
        stripe_payment_intent: s.payment_intent as string,
        metadata: meta,
      });
      if (payErr) console.error("payments table insert error:", payErr);

      // 2. Log purchase in the shares table for supporter shares
      if (type === "share" && playerId && shareTier) {
        const { error: shareErr } = await supabase.from("shares").insert({
          id: crypto.randomUUID(),
          buyer_name: buyerName || s.customer_email || "Unknown",
          buyer_email: buyerEmail || s.customer_email || "",
          player_id: playerId,
          tier: shareTier,
          season: Number(season) || 1,
          price: amount,
          status: "active",
          manual_entry: false,
          stripe_session_id: s.id,
          stripe_payment_intent: s.payment_intent as string,
        });
        if (shareErr) console.error("shares table insert error:", shareErr);
      }

      // 3. Mark player registration as paid in the players table
      if (type === "registration" && playerId) {
        const { error: regErr } = await supabase
          .from("players")
          .update({ registration_paid: true })
          .eq("id", playerId);
        if (regErr) console.error("players table registration update error:", regErr);
      }

      // 4. Update weekly dues paid array in the players table
      if (type === "weekly_dues" && playerId) {
        const { data: p, error: selectErr } = await supabase
          .from("players")
          .select("weekly_dues_paid")
          .eq("id", playerId)
          .single();
        
        if (!selectErr && p) {
          const paidWeeks = p.weekly_dues_paid || [];
          const nextWeek = paidWeeks.length + 1;
          const { error: duesErr } = await supabase
            .from("players")
            .update({ weekly_dues_paid: [...paidWeeks, nextWeek] })
            .eq("id", playerId);
          if (duesErr) console.error("players table dues update error:", duesErr);
        }
      }
    }

    if (event.type === "refund.created") {
      const r = event.data.object as any;
      const { error: refErr } = await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        description: `Refund — ${r.id}`,
        amount: r.amount / 100,
        type: "refund",
        date: new Date().toISOString().split("T")[0],
        source: "stripe",
        stripe_payment_intent: r.payment_intent,
        metadata: { refundId: r.id },
      });
      if (refErr) console.error("refund payments insert error:", refErr);

      const { error: shareRefErr } = await supabase
        .from("shares")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent", r.payment_intent);
      if (shareRefErr) console.error("shares refund update error:", shareRefErr);
    }
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return Response.json({ error: "Internal processing error" }, { status: 500 });
  }

  return Response.json({ received: true });
};

export const config: Config = {
  path: "/api/webhook",
};

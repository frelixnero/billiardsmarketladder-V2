import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { Config, Context } from "@netlify/functions";

// Creates a Stripe Checkout Session with server-side calculated pricing.
// Front-end calls this with { productKey, quantity, metadata }.
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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase environment variables are missing on the server." },
      { status: 500 }
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productKey, quantity, metadata } = payload || {};
  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));

  if (!productKey) {
    return Response.json({ error: "Missing productKey parameter" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch app settings and meta
  const { data: stateData, error: stateErr } = await supabase
    .from("app_state")
    .select("settings")
    .eq("id", 1)
    .single();

  if (stateErr) {
    console.error("Error fetching app state settings:", stateErr);
    return Response.json({ error: "Failed to load settings from database" }, { status: 500 });
  }

  const settings = stateData?.settings || {};
  let calculatedPrice = 0;
  let stripePriceId = "";
  let secureMetadata = { ...metadata };

  if (productKey === "registration") {
    calculatedPrice = Number(settings.registrationFee) || 150;
    stripePriceId = process.env.STRIPE_PRICE_REGISTRATION || "price_1TkOhoAoSKKzN4A3zdmQlYWE";
    secureMetadata.type = "registration";
  } else if (productKey === "weeklyDues") {
    calculatedPrice = Number(settings.weeklyDues) || 25;
    stripePriceId = process.env.STRIPE_PRICE_WEEKLY_DUES || "price_1TkOi7AoSKKzN4A3z8hWbyja";
    secureMetadata.type = "weekly_dues";
  } else if (productKey === "teamReg") {
    calculatedPrice = Number(settings.teamPerPerson) || 225;
    stripePriceId = process.env.STRIPE_PRICE_TEAM_REGISTRATION || "price_1TkOiYAoSKKzN4A34AEcEldN";
    secureMetadata.type = "teamReg";
  } else if (productKey === "individual-share") {
    const playerName = metadata?.playerName;
    if (!playerName) {
      return Response.json({ error: "Missing playerName in metadata" }, { status: 400 });
    }

    // Fetch player rank and active status from Supabase
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("rank, name, active")
      .eq("name", playerName)
      .maybeSingle();

    if (playerErr || !player) {
      return Response.json({ error: `Player "${playerName}" not found in database` }, { status: 400 });
    }

    if (!player.active) {
      return Response.json({ error: `Player "${playerName}" is inactive` }, { status: 400 });
    }

    // Check manual lock
    const playerMetadata = settings.player_metadata || {};
    const playerMeta = playerMetadata[playerName] || {};
    if (playerMeta.locked) {
      return Response.json({ error: `Player "${playerName}" is currently locked from share buys` }, { status: 400 });
    }

    const rank = Number(player.rank) || 16;
    const buyInCap = Number(settings.buyInCap) || 150;

    let tierPrice = 25;
    if (rank <= 2) tierPrice = 150;
    else if (rank <= 4) tierPrice = 75;
    else if (rank <= 8) tierPrice = 35;

    calculatedPrice = Math.min(tierPrice, buyInCap);

    // Map to price ID
    if (calculatedPrice === 150) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP2 || "price_1TkOhHAoSKKzN4A3HFKV358Y";
    } else if (calculatedPrice === 75) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP34 || "price_1TkOfsAoSKKzN4A3E57CdQ9W";
    } else if (calculatedPrice === 35) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP58 || "price_1TkOfSAoSKKzN4A3jJw6IjHo";
    } else {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_UNRANKED || "price_1TkOfEAoSKKzN4A3ksE3fpdD";
    }

    secureMetadata.type = "share";
    secureMetadata.shareTier = `$${calculatedPrice}`;
    secureMetadata.playerRank = String(rank);
  } else if (productKey === "teams-share") {
    const teamName = metadata?.playerName;
    if (!teamName) {
      return Response.json({ error: "Missing teamName (playerName) in metadata" }, { status: 400 });
    }

    // Static teams list from index.html (the official team standings/w-l)
    const teams = [
      { name: "Cue Kings",        w: 6, l: 1, t: 0, legs: 14 },
      { name: "Rail Riders",      w: 5, l: 2, t: 0, legs: 12 },
      { name: "Bank Shot Bandits",w: 5, l: 2, t: 0, legs: 11 },
      { name: "Felt Felons",      w: 4, l: 3, t: 0, legs: 10 },
      { name: "Chalk Outlaws",    w: 3, l: 3, t: 1, legs: 9  },
      { name: "Break Brothers",   w: 3, l: 4, t: 0, legs: 8  },
      { name: "Side Pocket Crew", w: 2, l: 5, t: 0, legs: 6  },
      { name: "Eight Ball Exiles",w: 1, l: 6, t: 0, legs: 4  },
    ];

    const sortedTeams = [...teams]
      .map(t => ({ ...t, pts: t.w * 2 + t.t }))
      .sort((a, b) => b.pts - a.pts || b.legs - a.legs);

    const teamIndex = sortedTeams.findIndex(t => t.name === teamName);
    if (teamIndex === -1) {
      return Response.json({ error: `Team "${teamName}" not found` }, { status: 400 });
    }

    const teamRank = teamIndex + 1;
    let tierPrice = 25;
    if (teamRank === 1) tierPrice = 150;
    else if (teamRank <= 3) tierPrice = 75;
    else if (teamRank <= 5) tierPrice = 35;

    calculatedPrice = tierPrice;

    // Map to price ID
    if (calculatedPrice === 150) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP2 || "price_1TkOhHAoSKKzN4A3HFKV358Y";
    } else if (calculatedPrice === 75) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP34 || "price_1TkOfsAoSKKzN4A3E57CdQ9W";
    } else if (calculatedPrice === 35) {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_TOP58 || "price_1TkOfSAoSKKzN4A3jJw6IjHo";
    } else {
      stripePriceId = process.env.STRIPE_PRICE_SHARE_UNRANKED || "price_1TkOfEAoSKKzN4A3ksE3fpdD";
    }

    secureMetadata.type = "share";
    secureMetadata.shareTier = `$${calculatedPrice}`;
    secureMetadata.playerRank = String(teamRank);
  } else {
    return Response.json({ error: `Unknown productKey "${productKey}"` }, { status: 400 });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: stripePriceId,
          quantity: qty,
        },
      ],
      metadata: {
        app: "ActionLadder Pool Market Ladder",
        productKey: String(productKey),
        ...secureMetadata,
      },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });
    return Response.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return Response.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/create-checkout",
};

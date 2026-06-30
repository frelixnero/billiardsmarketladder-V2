import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: 'edge',
};

type Mode = "individual" | "teams";

type PortfolioEntry = {
  name: string;
  price: number;
  shares: number;
};

function sanitizePortfolio(input: unknown): PortfolioEntry[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((row: any) => {
      const name = String(row?.name || "").trim().slice(0, 120);
      const price = Number(row?.price);
      const shares = Number(row?.shares);
      const safePrice = Number.isFinite(price) ? Math.max(0, Math.round(price * 100) / 100) : 0;
      const safeShares = Number.isFinite(shares) ? Math.max(0, Math.floor(shares)) : 0;
      return { name, price: safePrice, shares: safeShares };
    })
    .filter((row) => row.name && row.price > 0 && row.shares > 0)
    .slice(0, 500);
}

function normalizeMode(value: unknown): Mode | null {
  return value === "individual" || value === "teams" ? value : null;
}

export default async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized: Missing Bearer token" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return Response.json({ error: "Unauthorized: Empty token" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase environment variables are missing on the server." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: authData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authData?.user) {
    return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
  }

  const userId = authData.user.id;

  const { data: stateData, error: fetchErr } = await supabase
    .from("app_state")
    .select("settings")
    .eq("id", 1)
    .single();

  if (fetchErr || !stateData) {
    return Response.json({ error: "App state settings not found" }, { status: 500 });
  }

  const settings = stateData.settings || {};
  const userPortfolios =
    settings.user_portfolios && typeof settings.user_portfolios === "object"
      ? settings.user_portfolios
      : {};

  const currentUserPortfolio =
    userPortfolios[userId] && typeof userPortfolios[userId] === "object"
      ? userPortfolios[userId]
      : {};

  const responsePayload = {
    individual: sanitizePortfolio(currentUserPortfolio.individual),
    teams: sanitizePortfolio(currentUserPortfolio.teams),
    updatedAt: String(currentUserPortfolio.updatedAt || ""),
  };

  if (req.method === "GET") {
    return Response.json(responsePayload);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = normalizeMode(body?.mode);

  if (mode) {
    currentUserPortfolio[mode] = sanitizePortfolio(body?.portfolio);
  } else {
    if (body?.individual !== undefined) {
      currentUserPortfolio.individual = sanitizePortfolio(body.individual);
    }
    if (body?.teams !== undefined) {
      currentUserPortfolio.teams = sanitizePortfolio(body.teams);
    }
  }

  currentUserPortfolio.updatedAt = new Date().toISOString();

  userPortfolios[userId] = currentUserPortfolio;
  settings.user_portfolios = userPortfolios;

  const { error: updateErr } = await supabase
    .from("app_state")
    .update({ settings })
    .eq("id", 1);

  if (updateErr) {
    return Response.json({ error: updateErr.message || "Failed to save portfolio" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    individual: sanitizePortfolio(currentUserPortfolio.individual),
    teams: sanitizePortfolio(currentUserPortfolio.teams),
    updatedAt: currentUserPortfolio.updatedAt,
  });
};

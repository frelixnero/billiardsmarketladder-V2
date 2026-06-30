import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: 'edge',
};

// Aggregates statistics for the Bar Owners Profit Dashboard.
// Restricts bar owner role to their own bar. Enforces token auth.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Get auth token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized: Missing Bearer token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase environment variables are missing on the server." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify token
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return Response.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }

  // Check roles
  const userRole = user.user_metadata?.role || user.app_metadata?.role;
  const userBar = user.user_metadata?.bar_name;

  const operatorEmails = (process.env.OPERATOR_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());
  const isOperator = userRole === "owner" || (user.email && operatorEmails.includes(user.email.toLowerCase()));
  const isHelper = userRole === "helper";
  const isBarOwner = userRole === "bar";

  if (!isOperator && !isHelper && !isBarOwner) {
    return Response.json({ error: "Forbidden: Access denied." }, { status: 403 });
  }

  // Determine target bar
  let targetBar = "";
  if (isBarOwner) {
    targetBar = userBar;
    if (!targetBar) {
      return Response.json({ error: "Bar Owner has no assigned bar in account profile." }, { status: 400 });
    }
  } else {
    // Owner or Helper can select any bar, or "All"
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    targetBar = body.barName || "All";
  }

  try {
    // 1. Fetch app settings
    const { data: stateData, error: stateErr } = await supabase
      .from("app_state")
      .select("settings")
      .eq("id", 1)
      .single();

    if (stateErr) throw stateErr;
    const settings = stateData?.settings || {};

    // 2. Fetch all players
    const { data: dbPlayers, error: playersErr } = await supabase
      .from("players")
      .select("*");
    if (playersErr) throw playersErr;

    // Helper: Map static fallback player bars
    const playerMetadata = settings.player_metadata || {};
    const getPlayerBar = (name: string) => {
      const meta = playerMetadata[name] || {};
      if (meta.bar) return meta.bar;
      const staticBars: { [key: string]: string } = {
        "Marcus P.": "Bar One", "Mike H.": "Bar One", "Omar J.": "Bar One", "Caleb R.": "Bar One",
        "Jake T.": "Bar Two", "Tony B.": "Bar Two", "Sam K.": "Bar Two", "Paul D.": "Bar Two",
        "Darius M.": "Bar Three", "Ray W.": "Bar Three", "Leo G.": "Bar Three", "Quan A.": "Bar Three",
        "Derek S.": "Bar Four", "Chris L.": "Bar Four", "Nate F.": "Bar Four", "Ron V.": "Bar Four"
      };
      return staticBars[name] || "Bar One";
    };

    const playersWithBar = dbPlayers.map(p => ({
      ...p,
      bar: getPlayerBar(p.name)
    }));

    const barPlayers = targetBar === "All"
      ? playersWithBar
      : playersWithBar.filter(p => p.bar === targetBar);

    const barPlayerIds = barPlayers.map(p => p.id);
    const barPlayerNames = barPlayers.map(p => p.name);

    // 3. Fetch all payments and shares
    const { data: dbPayments, error: paymentsErr } = await supabase
      .from("payments")
      .select("*");
    if (paymentsErr) throw paymentsErr;

    const { data: dbShares, error: sharesErr } = await supabase
      .from("shares")
      .select("*")
      .eq("status", "active");
    if (sharesErr) throw sharesErr;

    // Filter payments and shares for this bar's players
    const filteredPayments = dbPayments.filter(p => {
      const pId = p.metadata?.playerId;
      const pName = p.metadata?.playerName;
      return barPlayerIds.includes(pId) || barPlayerNames.includes(pName);
    });

    const filteredShares = dbShares.filter(s => {
      return barPlayerIds.includes(s.player_id);
    });

    // 4. Calculate stats
    let totalBaseRevenue = 0;
    let totalShareVolume = 0;

    filteredPayments.forEach(p => {
      if (["registration", "weekly_dues", "teamReg"].includes(p.type)) {
        totalBaseRevenue += p.amount;
      }
    });

    filteredShares.forEach(s => {
      totalShareVolume += s.price;
    });

    // Read split coefficients
    const shareCutPct = (Number(settings.splitBarPct) || 1.5) / 100;
    const baseCutPct = 0.03; // Static 3% base revenue split

    const shareCutAmt = totalShareVolume * shareCutPct;
    const baseCutAmt = totalBaseRevenue * baseCutPct;
    const totalProfits = shareCutAmt + baseCutAmt;

    // 5. Generate investment trend data grouped by date (cumulative)
    const txs: { date: string; base: number; share: number }[] = [];

    filteredPayments.forEach(p => {
      if (["registration", "weekly_dues", "teamReg"].includes(p.type)) {
        txs.push({ date: p.date || new Date(p.created_at).toISOString().split("T")[0], base: p.amount, share: 0 });
      }
    });

    filteredShares.forEach(s => {
      txs.push({ date: new Date(s.created_at).toISOString().split("T")[0], base: 0, share: s.price });
    });

    // Sort transactions by date
    txs.sort((a, b) => a.date.localeCompare(b.date));

    // Compute cumulative totals
    const trendsMap: { [date: string]: { base: number; share: number; profit: number } } = {};
    let cumBase = 0;
    let cumShare = 0;

    txs.forEach(t => {
      cumBase += t.base;
      cumShare += t.share;
      const cumProfit = (cumBase * baseCutPct) + (cumShare * shareCutPct);
      trendsMap[t.date] = {
        base: cumBase,
        share: cumShare,
        profit: Number(cumProfit.toFixed(2))
      };
    });

    const trends = Object.entries(trendsMap).map(([date, val]) => ({
      date,
      baseRevenue: val.base,
      shareVolume: val.share,
      barProfit: val.profit
    }));

    return Response.json({
      barName: targetBar,
      activePlayersCount: barPlayers.length,
      shareVolume: totalShareVolume,
      shareCutPct: shareCutPct * 100,
      shareCut: Number(shareCutAmt.toFixed(2)),
      baseRevenue: totalBaseRevenue,
      baseCutPct: baseCutPct * 100,
      baseCut: Number(baseCutAmt.toFixed(2)),
      totalProfits: Number(totalProfits.toFixed(2)),
      trends
    });
  } catch (err: any) {
    console.error("Error generating bar dashboard data:", err);
    return Response.json({ error: err?.message || "Aggregation failed" }, { status: 500 });
  }
};

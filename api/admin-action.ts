import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: 'edge',
};

// Consolidated backend admin actions handler.
// Verifies user's JWT access token via Supabase Auth and checks for "owner" role.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Get authorization header
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

  // Verify the JWT token
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
  }

  // Verify "owner" role
  const userRole = user.user_metadata?.role || user.app_metadata?.role;
  const operatorEmails = (process.env.OPERATOR_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

  const isOwner = userRole === "owner" || (user.email && operatorEmails.includes(user.email.toLowerCase()));

  if (!isOwner) {
    return Response.json({ error: "Forbidden: Operator (owner) role required." }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, params } = body || {};
  if (!action) {
    return Response.json({ error: "Missing action parameter" }, { status: 400 });
  }

  try {
    switch (action) {
      case "toggle_registration": {
        const { playerId } = params || {};
        if (!playerId) return Response.json({ error: "Missing playerId" }, { status: 400 });

        const { data: player, error: fetchErr } = await supabase
          .from("players")
          .select("registration_paid")
          .eq("id", playerId)
          .single();

        if (fetchErr || !player) {
          return Response.json({ error: "Player not found" }, { status: 404 });
        }

        const { error: updateErr } = await supabase
          .from("players")
          .update({ registration_paid: !player.registration_paid })
          .eq("id", playerId);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, registration_paid: !player.registration_paid });
      }

      case "adjust_dues": {
        const { playerId, delta } = params || {};
        if (!playerId || delta === undefined) {
          return Response.json({ error: "Missing playerId or delta" }, { status: 400 });
        }

        const { data: player, error: fetchErr } = await supabase
          .from("players")
          .select("weekly_dues_paid")
          .eq("id", playerId)
          .single();

        if (fetchErr || !player) {
          return Response.json({ error: "Player not found" }, { status: 404 });
        }

        let paidWeeks = [...(player.weekly_dues_paid || [])];
        if (delta > 0) {
          paidWeeks.push(paidWeeks.length + 1);
        } else if (delta < 0 && paidWeeks.length > 0) {
          paidWeeks.pop();
        }

        const { error: updateErr } = await supabase
          .from("players")
          .update({ weekly_dues_paid: paidWeeks })
          .eq("id", playerId);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, weekly_dues_paid: paidWeeks });
      }

      case "toggle_lock": {
        const { playerName } = params || {};
        if (!playerName) return Response.json({ error: "Missing playerName" }, { status: 400 });

        const { data: stateData, error: fetchErr } = await supabase
          .from("app_state")
          .select("settings")
          .eq("id", 1)
          .single();

        if (fetchErr || !stateData) {
          return Response.json({ error: "App state settings not found" }, { status: 500 });
        }

        const currentSettings = stateData.settings || {};
        const metadata = currentSettings.player_metadata || {};
        if (!metadata[playerName]) {
          metadata[playerName] = {};
        }

        const nextStatus = !metadata[playerName].locked;
        metadata[playerName].locked = nextStatus;
        currentSettings.player_metadata = metadata;

        const { error: updateErr } = await supabase
          .from("app_state")
          .update({ settings: currentSettings })
          .eq("id", 1);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, locked: nextStatus });
      }

      case "save_settings": {
        const { settings: newSettings } = params || {};
        if (!newSettings) return Response.json({ error: "Missing settings parameter" }, { status: 400 });

        const { data: stateData, error: fetchErr } = await supabase
          .from("app_state")
          .select("settings")
          .eq("id", 1)
          .single();

        if (fetchErr || !stateData) {
          return Response.json({ error: "App state settings not found" }, { status: 500 });
        }

        const currentSettings = stateData.settings || {};
        const mergedSettings = {
          ...newSettings,
          player_metadata: currentSettings.player_metadata || {},
          bars: newSettings.bars || currentSettings.bars || ["Bar One", "Bar Two", "Bar Three", "Bar Four"]
        };

        const { error: updateErr } = await supabase
          .from("app_state")
          .update({ settings: mergedSettings })
          .eq("id", 1);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, settings: mergedSettings });
      }

      case "update_player_bar": {
        const { playerName, newBar } = params || {};
        if (!playerName || !newBar) {
          return Response.json({ error: "Missing playerName or newBar" }, { status: 400 });
        }

        const { data: stateData, error: fetchErr } = await supabase
          .from("app_state")
          .select("settings")
          .eq("id", 1)
          .single();

        if (fetchErr || !stateData) {
          return Response.json({ error: "App state settings not found" }, { status: 500 });
        }

        const currentSettings = stateData.settings || {};
        const metadata = currentSettings.player_metadata || {};
        if (!metadata[playerName]) {
          metadata[playerName] = {};
        }

        metadata[playerName].bar = newBar;
        currentSettings.player_metadata = metadata;

        const { error: updateErr } = await supabase
          .from("app_state")
          .update({ settings: currentSettings })
          .eq("id", 1);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, bar: newBar });
      }

      case "save_bars": {
        const { bars } = params || {};
        if (!bars) return Response.json({ error: "Missing bars parameter" }, { status: 400 });

        const { data: stateData, error: fetchErr } = await supabase
          .from("app_state")
          .select("settings")
          .eq("id", 1)
          .single();

        if (fetchErr || !stateData) {
          return Response.json({ error: "App state settings not found" }, { status: 500 });
        }

        const currentSettings = stateData.settings || {};
        currentSettings.bars = bars;

        const { error: updateErr } = await supabase
          .from("app_state")
          .update({ settings: currentSettings })
          .eq("id", 1);

        if (updateErr) throw updateErr;
        return Response.json({ ok: true, bars });
      }

      default:
        return Response.json({ error: `Unsupported action "${action}"` }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`Admin API error running action "${action}":`, err);
    return Response.json({ error: err?.message || "Database execution failed" }, { status: 500 });
  }
};

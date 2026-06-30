import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: 'edge',
};

// Stores and lists player/supporter feedback: complaints, suggestions, match
// disputes, refund requests, player concerns and rule questions.
//
//  POST  /api/feedback                -> anyone can submit
//  GET   /api/feedback (x-admin-token) -> owner/helper inbox (token-gated)
//
// Persistence now uses Supabase database (feedback table).
const TYPES = [
  "Complaint", "Suggestion", "Match dispute",
  "Refund request", "Player concern", "Rule question",
];

export default async (req: Request) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase environment variables are missing on the server." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const type = TYPES.includes(body?.type) ? body.type : "Complaint";
    const name = String(body?.name || "").slice(0, 120);
    const player = String(body?.player || "").slice(0, 120);
    const message = String(body?.message || "").trim().slice(0, 4000);
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({ type, name, player, message })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase feedback insert error:", error);
      return Response.json({ error: "Failed to store feedback in database" }, { status: 500 });
    }

    return Response.json({ ok: true, id: data.id }, { status: 201 });
  }

  if (req.method === "GET") {
    const required = process.env.FEEDBACK_ADMIN_TOKEN;
    if (!required) {
      return Response.json(
        { error: "Inbox locked: set FEEDBACK_ADMIN_TOKEN in Vercel env vars." },
        { status: 503 },
      );
    }
    if (req.headers.get("x-admin-token") !== required) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from("feedback")
      .select("id, type, name, player, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Supabase feedback select error:", error);
      return Response.json({ error: "Failed to load feedback from database" }, { status: 500 });
    }

    // Format created_at to 'YYYY-MM-DD HH:MM' in UTC for consistency
    const formattedRows = rows.map((r: any) => {
      const d = new Date(r.created_at);
      const pad = (n: number) => String(n).padStart(2, "0");
      const formattedDate = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
      return {
        ...r,
        created_at: formattedDate
      };
    });

    return Response.json(formattedRows);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

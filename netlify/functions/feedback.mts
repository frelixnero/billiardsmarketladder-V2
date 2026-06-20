import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

// Stores and lists player/supporter feedback: complaints, suggestions, match
// disputes, refund requests, player concerns and rule questions.
//
//  POST  /api/feedback                -> anyone can submit
//  GET   /api/feedback (x-admin-token) -> owner/helper inbox (token-gated)
//
// Persistence uses Netlify Database (Postgres). The `feedback` table is
// created by the migration in netlify/database/migrations/.
const TYPES = [
  "Complaint", "Suggestion", "Match dispute",
  "Refund request", "Player concern", "Rule question",
];

export default async (req: Request) => {
  const db = getDatabase();

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
    const [row] = await db.sql`
      INSERT INTO feedback (type, name, player, message)
      VALUES (${type}, ${name}, ${player}, ${message})
      RETURNING id
    `;
    return Response.json({ ok: true, id: row.id }, { status: 201 });
  }

  if (req.method === "GET") {
    const required = process.env.FEEDBACK_ADMIN_TOKEN;
    if (!required) {
      return Response.json(
        { error: "Inbox locked: set FEEDBACK_ADMIN_TOKEN in Netlify env vars." },
        { status: 503 },
      );
    }
    if (req.headers.get("x-admin-token") !== required) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await db.sql`
      SELECT id, type, name, player, message, status,
             to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM feedback
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return Response.json(rows);
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/feedback",
};

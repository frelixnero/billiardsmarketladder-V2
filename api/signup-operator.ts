import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: 'edge',
};

// Handles Operator registration/signup by verifying the 10-character secret key.
// Route is exposed at /api/signup-operator.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, operatorKey, displayName } = payload || {};
  if (!email || !password || !operatorKey) {
    return Response.json({ error: "Email, password, and secret key are required." }, { status: 400 });
  }

  const expectedKey = process.env.OPERATOR_SIGNUP_KEY;
  if (!expectedKey) {
    return Response.json(
      { error: "Operator signup key is not configured on the server. Set OPERATOR_SIGNUP_KEY in environment variables." },
      { status: 500 }
    );
  }

  if (operatorKey.trim() !== expectedKey?.trim()) {
    return Response.json({ error: "Invalid operator secret key." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase environment variables are missing on the server." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Register the operator using the Supabase admin client
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Confirm email automatically
      user_metadata: {
        role: "owner",
        requested_role: "owner",
        display_name: (displayName || "").trim() || email.split("@")[0]
      }
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ ok: true, user: data.user }, { status: 201 });
  } catch (err: any) {
    console.error("Operator signup error:", err);
    return Response.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
};

# Supabase Row-Level Security (RLS) Setup Guide

This guide outlines how to secure your Supabase database by enabling Row-Level Security (RLS). By enabling RLS, you prevent client-side users (even those with the Anon API key) from executing unauthorized writes (Insert, Update, Delete) to your database, while still allowing them to read public standings and data. All writes will be performed securely through Netlify Serverless Functions using the Service Role Key.

---

## Step 1: Enable RLS on All Tables

In the Supabase Dashboard:
1. Navigate to the **Database** -> **Tables** section.
2. For each of the following tables, toggle **Row-Level Security (RLS)** to **Enabled**:
   - `players`
   - `app_state`
   - `shares`
   - `payments`

Alternatively, you can run the following SQL commands in the **SQL Editor** tab of your Supabase Dashboard:

```sql
alter table "public"."players" enable row level security;
alter table "public"."app_state" enable row level security;
alter table "public"."shares" enable row level security;
alter table "public"."payments" enable row level security;
```

---

## Step 2: Configure Read-Only Policies for Public/Anon Access

We must allow read access (`SELECT`) to public users so the dashboard displays live prices, matchups, and standings.

Run the following SQL commands in your Supabase **SQL Editor** to create the read-only policies:

### 1. Players Table Read Access
Allows anyone (including unauthenticated visitors) to read player profiles, standings, and dues counts:
```sql
create policy "Allow public read access to players"
on "public"."players"
for select
using (true);
```

### 2. App State Table Read Access
Allows anyone to read league settings, custom bars, and active seasons:
```sql
create policy "Allow public read access to app_state"
on "public"."app_state"
for select
using (true);
```

### 3. Shares Table Authenticated Read Access
Allows logged-in players or operators to see active shares. (Regular users can only view their own purchases if mapped by email, but for simplicity, we allow authenticated users to read shares):
```sql
create policy "Allow authenticated read access to shares"
on "public"."shares"
for select
to authenticated
using (true);
```

### 4. Payments Table Operator Read Access
Allows only the Operator (owner) to view transactions in the system:
```sql
create policy "Allow owners to read payments"
on "public"."payments"
for select
to authenticated
using (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'owner'
);
```

---

## Step 3: Denying Write Access to Anon/Public Users

By enabling RLS and **not** creating any `INSERT`, `UPDATE`, or `DELETE` policies for the `public` or `anon` roles, Supabase automatically rejects all write attempts from client-side browsers. 

All database changes are instead performed securely in the serverless functions (`/api/admin-action` and `/api/webhook`) using the `SUPABASE_SERVICE_ROLE_KEY`. The Service Role client bypasses RLS policies automatically, ensuring that only authenticated operator requests can execute updates.

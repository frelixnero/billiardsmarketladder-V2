# ActionLadder · Pool Market Ladder — Setup & Deploy

Single-page app (`index.html`) plus two Netlify Functions. Three access levels,
Stripe Checkout, a live P&L engine, a prediction engine, an auto-seeded matchup
bracket, and a persisted complaint / refund inbox.

---

## Access levels

| Role | How they get in | What they see |
|------|-----------------|---------------|
| **Public (Lite)** | default | Standings, share prices, predictions, payout potential, matchups, Stripe buy buttons, submit complaints / refund requests. **No revenue, no profit, no settings.** |
| **Helper** | Staff Login → password | Everything public sees **plus** the read-only Dashboard and the submissions inbox. Cannot change fees, prices, prizes or the profit formula. |
| **Owner (Elliot)** | Staff Login → password | Full control: edit settings, live P&L, per-owner 4-way split, prize structure, and the inbox. |

Passwords live in the `CONFIG.roles` block in `index.html`
(`ownerPassword`, `helperPassword`). Change them before going live.

> The role gate hides UI only — it is not hard security, and the P&L shown is a
> projection model, not live money. For true account security, layer in
> [Netlify Identity](https://docs.netlify.com/security/secure-access-to-sites/identity/).
> The actual data endpoint (the feedback inbox) **is** protected server-side by
> `FEEDBACK_ADMIN_TOKEN`.

---

## Pricing locked in

**Supporter shares** (start $25, cap raised $75 → **$150**):

| Tier | Price |
|------|-------|
| 🥇 Top 2 | **$150** |
| 🥈 Top 3–4 | $75 |
| 🥉 Top 5–8 | $35 |
| Everyone else | $25 |

**League fees:** individual registration **$150**, weekly dues **$25**,
team entry **$225 / person**.

**Season prizes** (teams pay more than individuals; both stay juicy):

| | Individual | Team |
|--|-----------|------|
| Season 1 | $1,500 / $700 / $350 | $2,000 / $900 / $450 |
| Season 2 | $2,000 / $900 / $450 | $2,500 / $1,000 / $650 |

*First serve to continue:* Season-1 players and supporters get the first window
to re-up for Season 2 before it opens to new buyers. No 6-ball runout.

---

## Stripe — two modes

### Mode A — Payment Links (works today, no backend)
`CONFIG.useServerless = false`. Each Buy button opens the static Stripe Payment
Link for that price tier (`CONFIG.stripe`). Top 2 is now $150, so create a new
$150 payment link and paste it in (`CONFIG.stripe[150]`). Team top share ($150)
and team registration ($225) links are placeholders until you create them.

### Mode B — Serverless Checkout (recommended once set up)
`CONFIG.useServerless = true`. Buttons POST to `/api/create-checkout`, which
creates a Stripe Checkout Session from the price IDs in `CONFIG.priceIds`.

1. Create these prices in Stripe and paste their IDs into `CONFIG.priceIds`:
   - $150 Top-2 share (`share150`) — **new, the old Top-2 was $75**
   - $225 team registration (`teamReg`) — **new**
   - (the $25 / $35 / $75 / registration / weekly-dues IDs are already filled in)
2. In **Netlify → Site settings → Environment variables**, add:
   - `STRIPE_SECRET_KEY` = `sk_test_…` (use `sk_live_…` to go live)
3. Flip `CONFIG.useServerless` to `true` and redeploy.

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

---

## Feedback / refund inbox (persisted)

- Public submits via the **Feedback** tab → `POST /api/feedback`.
- Submissions are stored in **Netlify Database** (Postgres, auto-provisioned;
  schema in `netlify/database/migrations/`).
- Owner/helper read them in the Dashboard inbox → `GET /api/feedback`, which
  requires the `FEEDBACK_ADMIN_TOKEN` env var. Paste that same token into the
  inbox field to load submissions.
- Refunds are **request-only** — the owner approves each one manually in Stripe.

Set in Netlify env vars:
- `FEEDBACK_ADMIN_TOKEN` = any long random string

---

## Deploy

The repo is already wired for Netlify (`netlify.toml`).

```bash
npm install            # installs stripe + @netlify/database
netlify dev --port 8889   # local preview with functions + DB emulation
```

Push to the connected Git branch (or `netlify deploy --prod`) and Netlify will
install dependencies, apply the database migration, and publish.

## Weekly updates

Edit `CONFIG.players` in `index.html` each week (rank, `hot`, `streak`,
`duesPaid`). The ticker, standings, predictions and bracket all recompute from
that list automatically.

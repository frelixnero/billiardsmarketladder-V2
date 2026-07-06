# ActionLadder — Complete Platform Reference Guide
**Billiards Market Ladder · Screen Recording Companion**

> This document walks through every tab and feature in the ActionLadder platform, step by step. Use it as your script while doing a silent screen recording — just follow the sections in order, demonstrating each item on screen.

---

## 🔐 User Roles & Login Credentials

| Role | Email | Password | Role Pill | Notes |
|:---|:---|:---|:---|:---|
| **Public / Supporter** | *(no login)* | — | `PUBLIC` | Default state. Can browse, buy shares. |
| **Player** | `player@demo.com` | `player2026` | `PLAYER` | Can pay league dues, register for seasons. |
| **Bar Owner** | `bar` | `bar2026` | `BAR` | Sees Bar Profits tab (locked to own bar). |
| **Operator (Owner)** | `elliot` | `owner2026` | `OWNER` | Full admin. Sees Dashboard + Bar Profits (all locations). |

---

## 🔒 Feature Access by Role

| Feature | Public | Player | Bar Owner | Operator |
|:---|:---:|:---:|:---:|:---:|
| Home, Rules, Market, Teams, Matches, Scouting, Feedback | ✅ | ✅ | ✅ | ✅ |
| Buy Supporter Shares (Stripe) | ✅ | ✅ | ✅ | ✅ |
| League Fees (Registration, Weekly, Team Entry) | ❌ | ✅ | ❌ | ✅ |
| Bar Profits Tab | ❌ | ❌ | ✅ *(own bar only)* | ✅ *(all locations)* |
| Operator Dashboard Tab | ❌ | ❌ | ❌ | ✅ |
| Feedback Submissions Inbox | ❌ | ❌ | ❌ | ✅ |

---

## 📋 Tab-by-Tab Walkthrough

---

### 1. 🏠 HOME TAB
**What it is**: The landing page and dashboard overview for the entire platform.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Hero Section** | The big tagline "OWN THE ACTION. PLAY THE GAME. BUILD THE MARKET." with the animated 8-ball sphere in the center. Two CTA buttons: **Back Players** (goes to Market) and **Open Scouting** (goes to Scouting tab). |
| 2 | **Live Market Card** | On the right side of the hero — shows "Action Dashboard" with "24/7 always on" indicator. |
| 3 | **Feature Banner Strip** | Four promotional items below the hero: OWN TEAMS, LIVE PRICES, EARN PAYOUTS, BUILT FOR FANS. |
| 4 | **🔥 Billiards Market Heatmap** | A grid of player tiles showing 24-hour price swings. Color coded: Green = Rising, Red = Falling, Gold = Stable. Each tile shows player name, price, and percentage change. ⚠️ *Uses demo data.* |
| 5 | **🔴 Live Match Center** | Shows the current live match (e.g., Cue Kings vs Rail Riders) with a live score (4:3, Race to 9). ⚠️ *Uses demo data.* |
| 6 | **💬 Public Reactions Feed** | Scrolling reaction bubbles from users like @CueShark22, @BilliardsBoss, @BarFlyMike with timestamps. ⚠️ *Uses demo data.* |
| 7 | **👑 Top Backer Leaderboard** | Shows top 3 supporters by total investment (e.g., Dave R. $1,850). ⚠️ *Uses demo data.* |
| 8 | **Player & Team Detail Cards** | Bottom grid cards with featured player/team highlights. |
| 9 | **Next Match Countdown** | Shows the next scheduled match with a live countdown timer (HRS / MIN / SEC) and a "View Matchups" button. ⚠️ *Uses demo data.* |
| 10 | **⚡ How It Works** | Three-step explainer: (1) Buy Shares → (2) Track Form → (3) Collect Payouts. |

**Recording tip**: Start at the top and slowly scroll down to the bottom, pausing briefly on each section.

---

### 2. 📖 RULES TAB
**What it is**: The complete rule book and ecosystem guide for supporters and players.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **🎯 Ecosystem Goal** | Introductory card explaining that ActionLadder is structured as "skill-based crowd-funding" — supporters analyze stats before buying shares. |
| 2 | **🏷️ Pricing Tiers by Rank** | Four-tier pricing table: Tier 1 (Ranks 1–2) = $150, Tier 2 (Ranks 3–4) = $75, Tier 3 (Ranks 5–8) = $35, Tier 4 (Ranks 9+) = $25. Each tier is color coded (Gold, Purple, Blue, Gray). |
| 3 | **💸 Playoff Payouts / Share** | Four-level payout structure: Champion = $150, Finalist = $80, Semi-Finalist = $40, Quarter-Finalist = $15. |
| 4 | **📝 Concrete Examples** | Four real scenarios showing risk vs return math: (1) Backing an underdog Caleb R. → +$375 profit. (2) Backing Tier 3 Derek S. → +$450 profit. (3) Backing top-tier Marcus P. who loses early → −$540 loss. (4) Backing team Chalk Outlaws → +$125 profit. |

**Recording tip**: Scroll through slowly, lingering on the pricing tiers and examples since these are the core rules supporters need to understand.

---

### 3. 🎯 MARKET TAB (Individual Players)
**What it is**: The main marketplace for browsing and buying individual player shares.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Section Header** | "🎯 Individual Market" with subtitle "Browse active players, compare tier pricing, and back shares." |
| 2 | **Bar Filter Tabs** | Row of buttons to filter players by bar location (e.g., "All", "Bar One", "Bar Two"). Click different tabs to show filtering. |
| 3 | **Player Cards Grid** | Grid of player cards. Each card shows: Player name, rank (#1, #2, etc.), tier badge (Gold/Purple/Blue/Standard), bar location, win streak (e.g., 🔥 W4), Fargo rating (e.g., 🎯 755), shares sold count, current price, and a **Buy Shares** button. |
| 4 | **Buy Share Modal** | Click **Buy Shares** on any player card. A modal opens showing: Player stats summary, quantity selector, dynamic price calculation, the **Scouting & Analysis Verification Shield** (a checkbox the buyer MUST check before proceeding), and the **Pay with Stripe** button (locked until the checkbox is checked). |
| 5 | **🧮 Pricing & Payout Math** | Below the player grid — a math reference grid showing buy price vs potential payout at each placement. |
| 6 | **💳 League Fees** | Cards for Registration ($150), Weekly Dues ($25), and Team Entry ($200). Each has a Stripe checkout button. *(Only visible to logged-in players/operators.)* |
| 7 | **🎯 My Portfolio** | Local portfolio tracker showing shares you've purchased during this session. Has a "Clear All" button. Portfolio is tracked in browser localStorage — not a substitute for Stripe receipts. |
| 8 | **"Ready to Own the Action?" CTA** | Bottom banner prompting visitors to create an account or log in. |

**Recording tip**: Click a player's Buy Shares button and walk through the full modal flow. Check the analysis checkbox to show how the Pay button unlocks.

---

### 4. 🏆 TEAMS TAB (Team Market)
**What it is**: Same as Market but for team shares instead of individual players.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Team Hero Section** | "BACK A TEAM. SQUAD PLAY. DOMINATE LEAGUE." with animated T-ball sphere. CTA buttons: View Standings and Enter Team. |
| 2 | **Team Featured Card** | Right-side card showing featured hot team with stats. |
| 3 | **Team Cards Grid** | Grid of team cards. Each card shows: Team name, mascot emoji, win/loss record, roster list, team tier badge, price, and **Buy Shares** button. |
| 4 | **Team Buy Modal** | Same flow as individual — click Buy Shares, review stats, check the analysis box, proceed to Stripe. |
| 5 | **💰 Team Prize Board** | Separate payout structure for teams (paid separately from individual prizes). |
| 6 | **🎯 My Team Portfolio** | Local team portfolio tracker. |

**Recording tip**: Click the "Teams" link in the navbar to switch from Individual to Teams view.

---

### 5. 🗓️ MATCHES TAB
**What it is**: The complete season schedule with matchups, results, and bracket views.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Hero Section** | "THE SCHEDULE." with subtitle about round robins, brackets, and Bar vs Bar showdown. |
| 2 | **Season Tabs** | Four sub-tabs: Season 1 (Round Robin), Season 2 (Round Robin), Season 3 (Bracket), Bar vs Bar. Click each to show different formats. |
| 3 | **Season 1 & 2: Round Robin** | Shows all match pairings in a round-robin format with results (wins, losses, scores). ⚠️ *Uses demo data.* |
| 4 | **Season 3: Bracket** | Single-elimination bracket view showing seeded matchups and advancement. ⚠️ *Uses demo data.* |
| 5 | **Bar vs Bar** | Inter-bar tournament format where bars compete against each other. ⚠️ *Uses demo data.* |

**Recording tip**: Click through all four season tabs to show the different formats.

---

### 6. 📈 SCOUTING TAB
**What it is**: Advanced analytics and scouting tools for supporters doing research before buying shares.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Scouting & Analysis Verification Shield** | Top banner explaining the platform is built around skill-based analysis. Lists three key points: Fargo-style rating on every card, win probability model, and narrated form thesis. |
| 2 | **🌐 BLX Global Market Index** | A composite market index showing overall share momentum. Displays current index value (e.g., $1,000.00), percentage change, and an interactive SVG trend line chart. Has time range buttons: 1H, 24H, 7D. Hover over the chart to see timestamp tooltips. ⚠️ *Uses demo data.* |
| 3 | **Sort & Filter Controls** | Two dropdown selectors: Sort (Rank best/worst, Price high/low, Name A-Z) and Filter (All Players, Hot Streak, Top 8, Value Picks). Change these to show the grid re-sorting/filtering. |
| 4 | **📈 Player Forecast Desk** | Grid of detailed scouting cards. Each card shows: Player name, rank, Fargo rating, win probability percentage, form streak, recent match narrative, tier badge, and current share price. More detailed than the Market tab cards. |

**Recording tip**: Change the sort and filter dropdowns to show the grid updating in real time. Hover over the BLX chart to demonstrate the interactive tooltip.

---

### 7. 💬 FEEDBACK TAB
**What it is**: A submission form for complaints, suggestions, match disputes, refund requests, player concerns, and rule questions.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Hero Section** | "SAY YOUR PIECE." with explanation that the owner reviews every submission. |
| 2 | **Submission Form** | Fields: Type (dropdown: Complaint, Suggestion, Match dispute, Refund request, Player concern, Rule question), Your Name, Player/Team (optional), Message (textarea). Submit button labeled "Submit to the Owner". |
| 3 | **Refund Disclaimer** | Small text at the bottom: "Refunds are request-only — the owner reviews and approves each one in Stripe. Nothing is auto-refunded." |
| 4 | **📥 Submissions Inbox** *(Operator only)* | When logged in as the Operator, an additional section appears below the form showing all submitted feedback. Has an admin token input field and a Refresh button. |

**Recording tip**: Fill in a sample submission and click Submit. Then log in as Operator to show the inbox view.

---

### 8. 📊 BAR PROFITS TAB *(Bar Owner & Operator only)*
**What it is**: Revenue analytics dashboard showing how much money each bar location earns from trading volume and league fees.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Header & Location Selector** | Title: "📊 Bar Profits & Revenue Cuts". For **Bar Owners**: the location dropdown is hidden/locked to their specific bar. For **Operators**: the dropdown is visible with "All Locations" and each individual bar as options. |
| 2 | **Metrics Grid** | Six metric cards: (a) Total Share Volume — supporter trades at this bar. (b) Bar Share Cut (@ 1.5%) — the bar's cut of trading volume. (c) Total League Base Revenue — registration, weekly dues & team entries. (d) Bar Base Cut (@ 3%) — the bar's cut of player fees. (e) Total Accumulated Profits — sum of both cuts (highlighted in gold, larger font). (f) Active Players — players calling this bar home. ⚠️ *Uses demo data.* |
| 3 | **📈 Profit Accumulation Trend** | An SVG line chart showing cumulative earnings growth over the season. ⚠️ *Uses demo data.* |

**Recording tip**: Log in as Bar Owner first to show the locked view, then log in as Operator to show the "All Locations" dropdown and the ability to filter by any bar.

---

### 9. 🛠️ OPERATOR DASHBOARD TAB *(Operator only)*
**What it is**: Full admin control panel for managing the platform.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Live P&L Cards** *(Owner only)* | Top-level financial overview cards showing real-time profit & loss figures. |
| 2 | **Settings — Revenue & Pricing** | Editable form fields for all platform settings. Key settings include: Base share price, Volatility multiplier, Max shares per user per player, Revenue cut percentages, Global Market Lock toggle (freezes all trading instantly). Has **Recalculate & Save** button and **Reset to defaults** button. |
| 3 | **Bars & Locations Management** | List of all registered bar locations displayed as pills/tags. **Add Bar**: Type a name in the input field and click "Add Bar" — it appears instantly. **Remove Bar**: Click the ✕ button next to any bar and confirm the deletion prompt. |
| 4 | **Dues & Payments Manager** *(Owner only)* | Table listing every player with columns: Player name, Registration status, Weekly Dues Paid count, Manual Lock toggle. The owner can lock/unlock individual players. |
| 5 | **Season Prize Structure** | Read-only display of the locked prize payout numbers for the current season. |

**Recording tip**: Toggle the Global Market Lock on and then switch to the Market tab to show that all Buy buttons become disabled with "Market Locked" text. Toggle it back off afterwards.

---

### 10. 🔑 SIGN UP & LOGIN FLOW
**What it is**: The authentication overlay for creating accounts and logging in.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Opening the Overlay** | Click "Sign In" button in the top-right header. The login overlay slides in with the 🎱 logo and "BilliardsMarketLadder" branding. |
| 2 | **Login vs Create Account Tabs** | Two tabs at the top of the form. Toggle between them to show the form changing. |
| 3 | **Login Fields** | Email and Password inputs. |
| 4 | **Create Account Fields** | Additional fields appear: Display name/nickname, Dashboard role selector (Player, Bar Owner, Operator), Bar selector dropdown (for Bar Owner role), Operator Secret Key (for Operator role), Confirm Password field. |
| 5 | **Role Selection** | Three role buttons: Player, Bar Owner, Operator. Clicking each shows/hides relevant fields (e.g., Bar Owner shows bar selector, Operator shows secret key field). |
| 6 | **Password Strength Indicator** | A colored progress bar appears during signup showing password strength (Weak → Strong). |
| 7 | **Role Pill** | After logging in, the role pill in the header changes from `PUBLIC` to the user's role (e.g., `OWNER`, `BAR`). |

**Recording tip**: Show creating an account as each role type, then demonstrate logging in and out.

---

### 11. 💳 STRIPE CHECKOUT & SHARE CERTIFICATE
**What it is**: The payment flow and post-purchase certificate experience.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Buy Modal → Stripe** | Open a player's Buy Shares modal, check the analysis box, click Pay. This redirects to a Stripe-hosted checkout page with the dynamic price. |
| 2 | **Checkout Success Return** | After successful payment, the app redirects back with `?checkout=success` in the URL. This triggers the Share Certificate popup. |
| 3 | **Share Certificate Card** | A dark-themed certificate overlay showing: 🎱 logo, "Billiards Market Ladder" branding, "Official Share Certificate" title, player/team name with tier badge, shares owned, price per share, total investment, rank, form streak, purchase date, and a centered QR code in a white box with a green/gold border. |
| 4 | **Download Certificate** | Click the "Download Certificate" button. This renders the entire certificate (not just the QR code) onto a canvas and downloads it as a high-resolution PNG image file named like `BML-Certificate-MARCUS-P-17831...png`. The downloaded image includes the full background gradient, borders, logo, all text details, and the QR code. |
| 5 | **QR Code** | The QR code links back to the player's live profile page. It sits in a white container box with rounded corners and a green/gold border, clearly separated from the dark card background. |

**Recording tip**: To demonstrate the certificate without making a real payment, navigate to `http://localhost:8888/?checkout=success` in the address bar. This triggers the fallback certificate popup with mock data.

---

### 12. 📢 LIVE TICKER
**What it is**: A scrolling ticker bar at the top of every page showing real-time market activity.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **Live Badge** | Red "LIVE" label with pulsing white dot on the left side. |
| 2 | **Scrolling Prices** | Player names, current prices, and badges (🔥 HOT, 🔒 LOCKED) scrolling continuously right to left. |
| 3 | **Hover to Pause** | Hover your cursor over the ticker to pause the animation. Move the cursor away to resume. |

⚠️ *Uses demo data.*

---

### 13. 🔗 PURCHASE QR CODE OVERLAY *(Operator feature)*
**What it is**: Generates a QR code and shareable link for any player/team's purchase page.

#### Features to demonstrate:

| # | Feature | What to show on screen |
|:--|:---|:---|
| 1 | **QR Code Display** | Large QR code on a white background inside a dark modal card. |
| 2 | **URL Display** | The full purchase URL shown in a monospaced text box below the QR code. |
| 3 | **Download QR** | Button to download just the QR code as an image. |
| 4 | **Copy Link** | Button to copy the purchase URL to clipboard. |

---

## 📝 Recording Order Recommendation

For the best flow in your screen recording, follow this order:

1. **Start logged out (PUBLIC)** — Show Home → Rules → Market → Teams → Matches → Scouting → Feedback
2. **Show the Sign Up flow** — Create accounts for each role type
3. **Log in as Bar Owner** — Show Bar Profits (locked to one bar)
4. **Log out, log in as Operator** — Show Dashboard settings, bar management, dues manager, then Bar Profits (all locations unlocked)
5. **Demonstrate a purchase** — Buy Shares modal → analysis checkbox → Stripe checkout → Certificate → Download

---

## ⚠️ Demo Data Notice

The following features currently use hardcoded demo data and will be connected to live match/transaction data in future updates:

- Market Heatmap (24H swings)
- Live Match Center scores
- Public Reactions feed
- Top Backer Leaderboard
- Next Match Countdown
- BLX Global Market Index chart
- Matchup schedules & brackets
- Bar Profits metrics & trend chart
- Player scouting forecast probabilities

# kykie.net — Commercialisation & Incentive Strategy
**Date: 3 April 2026 | Version: 1.0**

---

## 1. Commentator Qualification & Credit System

### Registration Roles

During registration, users select one of three roles. Each higher role includes all access from the roles below it.

| Role | Includes | Extra Fields | Access |
|---|---|---|---|
| **Supporter** | — | None | View matches, predictions, emoji reactions, follow teams |
| **Commentator** | Supporter access | Sport (mandatory) | + Schedule matches, enter scores, record live/video, claim matches, earn credits |
| **Coach** | Commentator access | Sport (mandatory) + Team (mandatory, filtered by selected sport) | + Coach dashboard, team analytics, Free Plus/Premium features |

### Sign-Up Flow

**Step 1 — Account details** (same for all):
- Email, password, name, alias

**Step 2 — Role selection:**
1. User picks: Supporter / Commentator / Coach
2. **Commentator**: must select a Sport (Hockey active, others greyed for now)
3. **Coach**: must select a Sport, then a Team (team list filtered by selected sport). Uses institution search → team picker from the admin flow.
4. Supporter: no extra fields, proceeds directly

**Step 3 — Confirmation:**
- Supporter: active immediately
- Commentator: gets `commentator_trainee` status, access to training material
- Coach: linked to selected team via `coach_teams`, gets coach dashboard immediately

### Commentator Qualification (Benchmark Test)
- A pre-scored YouTube match serves as the gold standard
- Hennie scores it once as the reference benchmark
- Trainee watches the same video and records it using the Live Pro field recorder
- System auto-grades against the benchmark:
  - 80% accuracy required across all metrics (goals, D entries, shots, turnovers, short corners, zone transitions)
  - Shows deviations so trainee can learn
- Can retake unlimited times
- Passing promotes to full `commentator` status

### Qualified Commentator Rights
- Schedule matches
- Enter scores (quick score)
- Record live matches (Live Pro / Live Basic)
- Record matches from video (video review)
- Claim unassigned matches

### Credit System (Personal)

| Action | Credits |
|---|---|
| Live match (Pro) | 50 |
| Same-day recorded match | 30 |
| Older match (video review) | 20 |
| Live match (Basic) | 10 |
| Enter score | 1 |
| Schedule match | 1 |
| Spot a confirmed mistake | 5 |
| **Penalty (wrong score, failed review)** | **-1.5× earned** |

**Voucher threshold**: 100 credits = R100 Takealot voucher. Credits reset after voucher issued.

**Economics**:
- Commentator doing 2 live matches/week = 100 credits/week = R100/week = R400/month
- Commentator doing 1 live + 2 video reviews/week = 110 credits/week
- Cost per live match: R50 in voucher value (50 credits at R1/credit)

### Match Assignment
- Match creator/scheduler can assign a commentator
- **Deadline**: midnight before match day to assign
- After deadline: match is "up for grabs" for any qualified commentator
- Assigned commentator must **check in** (tap "I'm here" button) by T-30 minutes
- No check-in by T-30 → auto-release to pool + audit log entry
- If released, any commentator can claim it

### Community Score Policing
- Any registered commentator can flag a score as incorrect
- Flagger must provide the correct data (not just "it's wrong")
- Admin confirms before credits move
- Confirmed: flagger gets 5 credits, original submitter gets -1.5× penalty
- Limit: 3 flags per person per week (prevent abuse)
- Gaming prevention: can't flag your own matches, admin reviews all

### AI Quality Review
- Post-match quality score (0–100) based on: EPM, event count, gap detection, zone coverage, team balance, zone transition validity
- Matches scoring below 60/100 flagged for admin review
- Admin can reverse credits with 1.5× penalty if quality is unacceptable

---

## 2. Freemium Tiers (Team Credits)

### Concept
Every match has a "maintenance cost" of 100 credits. Credits flow in from commentator activity and viewer engagement. The net result determines whether the team gains or loses credits.

### Per-Match Credit Sources

| Action | Credits |
|---|---|
| Scheduled | +1 |
| Score entered | +1 |
| Live Basic recorded | +10 |
| Live Pro recorded | +50 |
| Same-day video review | +30 |
| Older video review | +20 |
| Each unique viewer | +1 |
| **Match maintenance cost** | **-100** |

Net result = credits earned − 100.

### Examples
- Schedule + quick score only (2 earned): team **loses 98** credits
- Live Pro + 30 viewers (82 earned): team loses 18
- Live Pro + 50 viewers (102 earned): team **gains 2**
- Live Pro + 100 viewers (152 earned): team gains 52
- Schedule + score + older video review + 20 viewers (42 earned): team loses 58

**Break-even**: a Live Pro match with ~50 viewers. That's exactly the behaviour we want.

### Tier Unlocks

| Team Credits | Tier | Unlocks |
|---|---|---|
| 0–99 | **Free** | Own team stats (conversion rates, per-match data) |
| 100+ | **Free Plus** | + Match insights, visual play analysis, TOP10 benchmark, opposition scouting |

Must maintain 100+ credits to keep Free Plus. Drops back to Free if balance falls below 100.

### Premium (Paid)
Bypasses credit requirements entirely. Always has full access regardless of team credit balance.

**Pricing:**
- R5,000 per team per year
- R10,000 per institution per year (includes up to 4 teams)

Includes everything in Free Plus, plus:
- Training suggestions (future)
- PDF match reports (future)
- Season planning tools (future)

### Coach Credit Purchase
Coaches can buy credits at any time to make up for shortfalls:
- R1 per credit (e.g. R100 buys 100 credits to unlock Free Plus)
- Credits purchased are permanent — not subject to match maintenance cost
- Creates a smooth transition from free to premium

### Penalty Pass-Through
When a commentator receives a penalty (wrong score, failed AI review), the -1.5× penalty also applies to the team credits. The team community has incentive to police accuracy.

### Self-Regulating Dynamics
- A team with 20 quick-score-only matches bleeds 98 × 20 = 1,960 credits
- A team with 10 Live Pro matches at 60 viewers each gains ~12 × 10 = 120 credits net
- Teams must have consistent coverage AND audience to maintain Free Plus
- New teams start at 0 — one well-covered match gets them to 100 quickly

### Coach Dashboard UX
- Progress bar: "Your team: 67/100 credits — 33 more to unlock Free Plus"
- Credit breakdown per match: "+50 (Live Pro) +67 (viewers) −100 (match cost) = +17 net"
- Breakdown by source: recording credits vs viewer credits
- Warning when trending down: "4 quick-score-only matches have cost your team 392 credits"

### Feature Access Matrix

| Feature | Free | Free Plus | Premium |
|---|---|---|---|
| Own team stats | ✓ | ✓ | ✓ |
| Match insights | — | ✓ | ✓ |
| Visual play analysis | — | ✓ | ✓ |
| TOP10 benchmark | — | ✓ | ✓ |
| Opposition scouting | — | ✓ | ✓ |
| Training suggestions | — | — | ✓ |
| PDF reports | — | — | ✓ |
| Season planning tools | — | — | ✓ |

---

## 3. Viewer Engagement & Growth

### Share-to-Earn (Commentator)
- Unique referral link per match: `kykie.net/#/live/{slug}?ref={commentatorId}`
- Each unique viewer via referral = +1 credit for commentator AND +1 for team
- Tracked in `match_viewers` with `referred_by` column

### WhatsApp Share Button
- One-tap on live match screen
- Generates: "🏑 LIVE NOW: Oranje vs Paarl Gim — follow the action on kykie.net/#/team/oranje-1st"
- Uses `wa.me` deep link — works on mobile and desktop
- Pre-populated with team names, score if in progress, and match link

### School Leaderboard
- "Most Watched Schools This Week" section on landing page
- Ranked by unique viewers across all matches
- Taps into school competitive nature — no cost, just pride

### Parent Follow / Notifications
- Parents follow a team → notified when match goes live
- School tells parents once: "Follow us on Kykie"
- Each followed team is a free distribution channel

### Commentator of the Week
- Highest viewer count wins a badge and featured spot on landing page
- Commentators will naturally promote their matches harder to win
- Bonus: 20 credits

### Coach Incentive
- If a coach's team page gets 100+ unique viewers in a month, they get one month free on the Premium tier
- Coaches will tell parents "watch on Kykie" because it directly benefits them

---

## 4. The Unified Flywheel

```
Commentator records match → earns personal credits (vouchers)
                          → earns team credits (unlocks coach features)
                          → shares match link (earns referral credits)
Viewers watch             → earn team credits (unlocks coach features)
                          → attract sponsors (revenue)
Coach promotes Kykie      → drives viewers (team credits + sponsor value)
                          → unlocks own analytics (free or faster)
Sponsors pay              → fund vouchers → more commentators → more coverage
```

Every participant's selfish incentive drives the collective flywheel.

---

## 5. Sponsorship Revenue

### Tiers

| Tier | Placement | Price Range |
|---|---|---|
| Match Sponsor | Logo on live scoreboard, commentary feed, embed widgets | R500–2K/match |
| Team Sponsor | Logo on team page header, "Sponsored by" under team name | R5–15K/team/season |
| Platform Sponsor | "Powered by" on landing page, all embed footers, push notifications | R50–150K/season |

### Revenue Potential (Conservative)
- 10 match sponsors/week × R500 × 30 weeks = R150K/season
- 20 team sponsors × R10K = R200K/season
- 1 platform sponsor = R75K/season
- **Total: ~R425K/season from sponsorship alone**

### Combined Revenue Model

**Premium subscription projections (3 sports × 3 age groups):**

| Scenario | Teams | Per-team | Institutions | Per-institution | Subscription Revenue |
|---|---|---|---|---|---|
| Conservative | 50 teams | R5,000 | 10 institutions | R10,000 | R350K |
| Moderate | 100 teams | R5,000 | 30 institutions | R10,000 | R800K |
| Optimistic | 200 teams | R5,000 | 60 institutions | R10,000 | R1.6M |

- Sponsorship: R100–425K/year
- Premium subscriptions: R350K–1.6M/year
- Credit purchases: variable
- **Combined: R450K–2M/year at 85%+ margins**

---

## 6. Commercialisation Phases

### Phase 1: Build Coverage (Months 1–4)
- Recruit 10 commentators via self-service qualification model
- Onboard 20 pilot schools with free coach analytics
- Deploy embed widgets for school websites
- Target: 80% match coverage, 500+ monthly visitors
- Budget: ~R1,200/month (vouchers + hosting)

### Phase 2: Monetise Coaches (Months 4–8)
- Launch Free / Free Plus / Premium tiers
- Premium: R5,000/team or R10,000/institution (4 teams)
- Expand to U14/U16 age groups
- Target: 20–50 premium teams, R100K+ ARR

### Phase 3: Attract Sponsors (Months 8–12)
- Match / Team / Platform sponsorship tiers
- Target school-sport-adjacent brands
- Revenue: R100–425K/year from sponsorship
- Combined with subscriptions: R450K–2M/year at 85%+ margins

---

## 7. Database Changes Required

```sql
-- Commentator qualification (new columns on profiles)
ALTER TABLE profiles ADD COLUMN commentator_status TEXT;  -- 'trainee' | 'qualified'
ALTER TABLE profiles ADD COLUMN benchmark_score NUMERIC;
ALTER TABLE profiles ADD COLUMN benchmark_passed_at TIMESTAMPTZ;

-- NOTE: No new registration columns needed.
-- role/roles already handle Supporter (crowd) / Commentator / Coach.
-- sport_interest[] already captures sport selection.
-- coach_teams table already handles coach-to-team linking.

-- Match viewer referrals
ALTER TABLE match_viewers ADD COLUMN referred_by UUID;
ALTER TABLE match_viewers ADD COLUMN view_duration INT;  -- seconds

-- Team credits ledger (per-match granularity)
CREATE TABLE team_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) NOT NULL,
  match_id UUID REFERENCES matches(id),
  action TEXT NOT NULL,
  credits NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  source_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team tier status (cached for fast lookup)
CREATE TABLE team_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) NOT NULL UNIQUE,
  credits_total NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'free',   -- 'free' | 'free_plus' | 'premium'
  paid_until DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Implementation Priority

1. Registration revamp — Supporter / Commentator / Coach role selection with sport + team picker
2. Commentator training material + benchmark test (qualification gate)
3. Personal credit system + voucher management
4. Team credit system + tier unlocks
5. Coach dashboard progress bar + credit breakdown
6. Feature gating (Free / Free Plus / Premium)
7. Share-to-earn + WhatsApp share
8. Sponsor integration with viewer metrics

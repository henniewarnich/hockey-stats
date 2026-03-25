# Sponsorship Platform — Full Vision
**Date: 25 March 2026 | Status: Planning**

## Current State (v7.9.12)
Admin-managed sponsors with three tiers (platform/team/match), logo upload to Supabase Storage, rendered via SponsorBanner component in 5 placements. Impression and click tracking built in. No self-service, no payments.

## Phase 1 — Manual Management + Tracking (v7.9.12) ✅
- Admin CRUD for sponsors (name, logo, tier, target, dates, active toggle)
- Logo upload to Supabase Storage (`sponsor-logos` bucket)
- SponsorBanner component renders in: Landing page, Team page, Scoreboard (Live + Live Pro)
- Impression logging: every SponsorBanner render → `sponsor_impressions` row
- Click logging: every banner click → `sponsor_clicks` row
- Anonymous viewer tracking via existing `kykie-viewer-id` sessionStorage pattern
- Basic stats visible to admin on sponsor list (total impressions, clicks, CTR)

### What this enables
- Onboard first sponsors manually (you know them, flat fee, you upload their logo)
- Collect real impression/click data to prove value to future sponsors
- Learn which placements perform best before building self-service
- Zero cost — no payment integration needed yet

---

## Phase 2 — Sponsor Portal (Future)

### New Role: Sponsor
- New `sponsor` role in ROLES constant
- `sponsor_users` table linking profiles to sponsor accounts
- Sponsor registers or is invited by admin → gets `sponsor` role
- Sponsor dashboard at `#/sponsor`

### Sponsor Dashboard
- **My Sponsorships**: list of active/past sponsorships with stats
- **Create Sponsorship**: choose tier → select teams/matches → upload artwork → submit for approval
- **Artwork Management**: swap/update artwork on active sponsorships (triggers re-approval)
- **Stats Dashboard**: impressions, clicks, CTR, unique viewers, demographics (age, gender, location from profiles)
- **Billing**: invoices, payment history, auto-renewal options

### Approval Workflow
- Sponsor submits artwork → status: `pending_review`
- Admin sees in Pending Approvals (alongside crowd submissions)
- Admin: Approve / Reject with feedback message
- Rejected → sponsor gets notification, can re-submit
- Approved → goes live immediately or on start_date
- Artwork change on live sponsorship → pauses display, re-enters approval queue

### Database Changes
```sql
CREATE TABLE sponsor_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT DEFAULT 'viewer',  -- 'owner' | 'manager' | 'viewer'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sponsors ADD COLUMN approval_status TEXT DEFAULT 'approved';
  -- 'draft' | 'pending_review' | 'approved' | 'rejected'
ALTER TABLE sponsors ADD COLUMN rejection_reason TEXT;
ALTER TABLE sponsors ADD COLUMN submitted_at TIMESTAMPTZ;
ALTER TABLE sponsors ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE sponsors ADD COLUMN reviewed_at TIMESTAMPTZ;
```

---

## Phase 3 — Self-Service Payments (Future)

### Payment Integration
- **PayFast** (SA preferred) or **Stripe** for international
- Tiered pricing packages:
  | Package | Duration | Price |
  |---------|----------|-------|
  | Match Sponsor | Per match | R500–2,000 |
  | Team Sponsor | Per season | R5,000–15,000 |
  | Platform Sponsor | Per season | R50,000–150,000 |
- Payment creates sponsorship in `pending_review` status
- Refund if artwork rejected after X attempts

### Database Changes
```sql
CREATE TABLE sponsor_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  payment_provider TEXT,        -- 'payfast' | 'stripe'
  payment_reference TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'refunded'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sponsor_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  duration_days INT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Billing Flow
1. Sponsor selects package → pays via PayFast/Stripe
2. Webhook confirms payment → creates sponsorship row
3. Sponsor uploads artwork → enters approval queue
4. Approved → goes live
5. Expiry: end_date reached → auto-deactivates, sends renewal reminder email

---

## Phase 4 — Advanced Analytics & Optimisation (Future)

### Sponsor Stats Dashboard (detailed)
- **Impressions**: total, unique viewers, by day/week/month
- **Clicks**: total, unique, CTR by placement
- **Demographics**: viewer age, gender, location, sport interest (from profile data)
- **Comparison**: your sponsorship vs platform averages
- **Heatmap**: which matches/teams drive most impressions
- **Export**: CSV/PDF reports for sponsor's own reporting

### Admin Analytics
- Fill rate per placement (how many available slots are sponsored)
- Revenue per placement type
- Top performing sponsors (by impressions)
- Revenue forecasting based on upcoming matches
- Churn: sponsors who don't renew

### A/B Testing (later)
- Multiple artworks per sponsor, system rotates and measures CTR
- Auto-optimise: show better-performing artwork more often

### Programmatic (much later)
- Real-time bidding for match placements
- Auction model for high-profile matches (finals, derbies)
- API for media buyers

---

## Impression & Click Tracking Design

### Tables
```sql
-- High volume — one row per impression
CREATE TABLE sponsor_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  viewer_id TEXT,               -- anonymous sessionStorage ID
  user_id UUID,                 -- logged-in user (nullable)
  placement TEXT NOT NULL,      -- 'landing' | 'team_page' | 'scoreboard'
  context_id UUID,              -- team_id or match_id depending on placement
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lower volume — one row per click
CREATE TABLE sponsor_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  viewer_id TEXT,
  user_id UUID,
  placement TEXT NOT NULL,
  context_id UUID,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexing
```sql
CREATE INDEX idx_sponsor_impressions_sponsor ON sponsor_impressions(sponsor_id);
CREATE INDEX idx_sponsor_impressions_date ON sponsor_impressions(created_at);
CREATE INDEX idx_sponsor_clicks_sponsor ON sponsor_clicks(sponsor_id);
```

### Volume Estimate
- 100 page views/day × 3 placements = ~300 impressions/day = ~9,000/month
- At 500 matches/season with live viewers: could reach 50K–100K impressions/month
- Clicks: ~1–3% CTR = 500–3,000 clicks/month

### Lifecycle (same as match_events)
1. Log detail rows as they happen
2. Later: roll up into daily/weekly summaries per sponsor per placement
3. Prune detail rows older than 90 days
4. Summary table preserves aggregate stats indefinitely

### Summary Table (future, when volume warrants it)
```sql
CREATE TABLE sponsor_stats_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id) NOT NULL,
  date DATE NOT NULL,
  placement TEXT NOT NULL,
  impressions INT DEFAULT 0,
  unique_viewers INT DEFAULT 0,
  clicks INT DEFAULT 0,
  unique_clickers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sponsor_id, date, placement)
);
```

---

## Pricing Psychology (for Phase 3)

### Value Proposition for Sponsors
- **School sport parents** = premium demographic (household decision makers, 30–50 age range, disposable income)
- **Not interruption** — sponsors are associated with supporting the sport, not annoying viewers
- **Measurable** — real impression/click data, not guesswork
- **Hyper-local** — target specific schools, regions, age groups

### Suggested Starting Prices
- Match: R500/match (or R2,000 for tournament of 8+ matches)
- Team: R10,000/season (showing on every match for that team)
- Platform: R75,000/season (showing everywhere, exclusivity)

### Negotiation Leverage
- "Your logo was seen by X unique viewers across Y matches"
- "Z% of our viewers are in your target demographic"
- "Average CTR of N% — X times higher than standard display ads"

---

## Revenue Projections (combined with Coach Subscriptions)

### Year 1 (Manual, Phase 1)
| Source | Revenue |
|--------|---------|
| 5 match sponsors × R500 × 30 matches | R75,000 |
| 10 team sponsors × R10,000 | R100,000 |
| 1 platform sponsor × R75,000 | R75,000 |
| **Total sponsorship** | **R250,000** |
| Coach subscriptions (100 × R2,000) | R200,000 |
| **Combined** | **R450,000** |

### Year 2 (Self-service, Phase 2-3)
| Source | Revenue |
|--------|---------|
| Sponsorship (self-service, 3x growth) | R750,000 |
| Coach subscriptions (300 × R2,000) | R600,000 |
| **Combined** | **R1,350,000** |

---

## Implementation Order
1. ✅ Phase 1: Admin-managed + impression/click tracking (v7.9.12)
2. Phase 2: Sponsor portal + approval workflow (~2 sessions)
3. Phase 3: Payment integration (~2 sessions)
4. Phase 4: Advanced analytics (~1–2 sessions)

Each phase builds on the previous. Data collected in Phase 1 directly feeds Phase 2–4.

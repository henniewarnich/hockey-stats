# kykie.net — Next Session Planning
**Date: 7 April 2026 | Current Version: 7.17.30**

## Immediate Actions (Before Next Session)

### 1. Deploy v7.17.30
- Push to GitHub, verify on kykie.net

### 2. Run Pending Migrations
```sql
-- Run in order:
-- 1. Fix tier calculation RPC (uses ALL ended matches)
upgrade-scripts/v7.17.20/fix-tier-calculation.sql

-- 2. Rebuild team credits from matches (catches Outeniqua etc.)
upgrade-scripts/v7.17.20/backfill-team-credits-v2.sql

-- 3. Coach approval flow
upgrade-scripts/v7.17.24/migration-coach-approval.sql
```

### 3. Verify After Migrations
- Oranje should show ~17 avg (not 44) → Free tier
- Paarl Girls should show ~30 avg → Free Plus
- PMB should show ~23 avg → Free Plus
- Outeniqua should now have credits (was 0, has 1 Live Pro match)
- Existing coaches should have `coach_status = 'approved'`

---

## Session Summary: v7.17.0 → v7.17.30

### Coach Experience Overhaul
- CoachDashboard rewritten as thin redirector (354 → 47 lines)
- Single-team coaches land directly on stats (zero clicks)
- Multi-team coaches get dropdown at top of TeamPage
- Stats strip (P/W/D/L/GF/GA/GD) inside Overall tab
- Contribute grid (Submit result, Add fixture, Suggest team, Report issue)
- Practical unlock message with credit shortfall + suggestion

### Feature Gating
- Free tier: blurred VS OPP + Benchmark columns (blur(6px))
- Free Plus: all columns clear with green/yellow/grey ranking
- Trends/Visuals tab locked behind Free Plus
- Lock teaser cards with upgrade messaging
- Tier computed client-side from credits / ALL ended matches

### D-Entry Stat Rewrite
- New `computeAtkChances()` — sequential event stream analysis
- Counts zone crossings, set pieces, turnovers as distinct chances
- New "Atk chances" row (raw number) + "Attack → D" row (%)
- PAA: 48% → 51%, VS OPP: 79% → 52% (major correction)

### Coach Approval Flow
- `coach_status` column (pending/approved)
- Register as coach → pending → admin approves
- Pending coach sees awaiting screen
- Admin sees status pills + email domain for vetting

### Commentator Dashboard
- Training + Demo at top of menu
- Cancel Demo button on LiveMatchScreen
- My Credits for qualified commentators
- No "Institutions & Teams" for plain commentators
- Apprentice unlocked for Match Schedule + New Match
- JSON Import hidden for non-admin

### Tier Calculation Fix
- `recalc_team_tier` RPC now uses ALL ended matches (not just credited)
- Frontend computes tier client-side as belt-and-suspenders
- Comprehensive backfill from matches table (not audit_log)

### Other Fixes
- Multi-word search hardened (try-catch, inline computation)
- Black screen fix (missing NavLogo import)
- Delete Recording Only + Delete Match buttons
- Premature end: Discard Recording (no abandoned match created)
- Match Abandoned: renamed from "Abandon Match"
- Recording date/time in admin credit statement
- TeamPage header uses PageHeader for coaches

---

## Planned Features (Next Sessions)

### Priority 1: Training Screen + Benchmark Test
- Training materials for commentators
- Online benchmark test to graduate from trainee → apprentice
- Already have migration (v7.13.0) but screen needs building

### Priority 2: Personal Credits + Vouchers
- Commentator credit statement (partially done — CreditsScreen exists)
- Voucher claim flow (20 credits = R100 Takealot)
- Admin voucher management screen

### Priority 3: Email Notifications
- Coach approval notification (Resend API)
- Admin alerts via ntfy.sh (new user, match live, voucher due)
- Coach outreach letters (rich HTML via Resend API)

### Priority 4: Stats Normalisation
- Parked until more 60-min matches recorded
- Volume stats (D entries/match) × (60 / actual_duration)
- Ratios unchanged (conversion %, accuracy)
- Match duration badge on cards

### Parked Items
- Prediction auto-scoring
- Video playback speed
- Coach TOP10 bug (filter by sport/gender/age_group)
- Staging environment
- Organisation → Team hierarchy for multi-sport
- LocalStorage full phase-out
- WhatsApp Business API (R750-2000/mo — too early)
- Embeddable widgets for school websites
- Sponsorship & advertising system

---

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats

# kykie.net — Next Session Planning
**Date: 25 March 2026 | Current Version: 7.9.10**

## Immediate Bug Fixes (Do First)

### 1. Score Flip on Team Page
**Bug**: When viewing a team's page, match scores show in home-away order. If the viewed team is away, their score appears second — makes wins look like losses.
**Fix**: In TeamPage.jsx, swap score display when viewed team is the away team.
**File**: `src/screens/TeamPage.jsx`
**Effort**: Tiny — just swap `home_score`/`away_score` based on which team matches the slug.

### 2. Training Demo Mode
**Goal**: Permanent "Demo Eagles vs Demo Lions" match on Commentator/Admin screens. Goes straight into Live or Live Pro. No DB save. Hide demo teams from public.
**Implementation**:
- Add two demo team objects in constants (not in DB)
- Add "🎓 Training Demo" button on CommentatorDashboard and MatchScheduleScreen
- Tapping it opens LiveModeChooser → then opens LiveLiteScreen or LiveMatchScreen with `isDemo: true`
- Demo mode: all event pushes are no-ops, match not created in DB
- Demo teams hidden from LandingPage team list
**Effort**: Small (~1 session)

---

## Planned Features (Priority Order)

### Feature 1: Staging Environment
**Goal**: Stop testing on production.
**Approach**: Second Supabase project + `test.kykie.net` subdomain
- Create `kykie-staging` Supabase project (free tier)
- Run all migrations against it
- Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars to Vite config
- Build staging with `npm run build:staging`
- Deploy to test.kykie.net via GitHub Pages or separate branch
**Effort**: Small (~1 hour setup)

### Feature 2: Organisation → Team Hierarchy
**Goal**: Separate schools/clubs from teams. An Organisation (school, university, club) has many Teams (sport + age group + gender).
**Why**: Enables multi-sport, multi-age, and org-level subscriptions.
**Database**:
```sql
CREATE TABLE organisations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'school',  -- school | university | club
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE teams ADD COLUMN org_id UUID REFERENCES organisations(id);
ALTER TABLE teams ADD COLUMN sport TEXT DEFAULT 'hockey';
ALTER TABLE teams ADD COLUMN age_group TEXT DEFAULT '1st';
ALTER TABLE teams ADD COLUMN gender TEXT DEFAULT 'girls';
```
**Effort**: Medium — migration + refactor team references throughout app

### Feature 3: Multi-Age & Multi-Sport (Phase 1)
**Goal**: U14, U16, 2nd Team Girls Hockey
- Same events, field recorder, stats — just filtered
- Landing page sport dropdown + age group filter
- Rankings per age group
**Depends on**: Organisation → Team hierarchy
**Effort**: Small-Medium

### Feature 4: Match Stats Archival & Event Pruning
**Goal**: Pre-compute match stats so raw events can be pruned after 90 days.
**New table**: `match_stats` (match_id, team, quarter, goals, shots, d_entries, etc.)
**Lifecycle**: Match ends → compute stats → write to match_stats → after 90 days prune events
**When**: Before match_events exceeds ~50K rows
**Effort**: Medium

### Feature 5: Contributor Reward System (Takealot Vouchers)
**Goal**: Gamified tiers (Apprentice → Graduate → Veteran) with credit system.
- Quick score: 1 credit, Live: 5 credits, rejected: negative credits
- 20 credits = R100 Takealot voucher
- Veterans can approve others' submissions
**Depends on**: Crowd submissions working well in production
**Effort**: Large (~1-2 sessions)

### Feature 6: Embeddable Widgets
**Goal**: Iframes for school websites — team results, upcoming, live matches
- `#/embed/team/{slug}`, `#/embed/upcoming`, `#/embed/live`
- Stripped-down, no header, "Powered by kykie" footer
- Click-through to kykie.net
**Effort**: Small

### Feature 7: Sponsorship & Advertising
**Tiers**: Match Sponsor, Team Sponsor, Platform Sponsor
- Admin CRUD for sponsors (name, logo, tier, assignment)
- Render in designated placements
**Effort**: Small-Medium (sponsorship), Large (advertising)

---

## Technical Debt

### High Priority
- **localStorage phase-out**: Move remaining local-only game data to Supabase-first
- **UTC → SAST display**: All dates use parseSAST/parseSASTDate helpers — some edge cases in sync.js still use raw `new Date()`

### Medium Priority
- **Code splitting**: Bundle is ~715KB — consider dynamic imports for screens
- **RLS audit**: Multiple overlapping policies on profiles — clean up
- **Commentator timer resume**: Timer resets to 0 on refresh — need to query max seq + stored match_time

### Low Priority
- **Voice recorder**: Audio commentary
- **Push notifications**: Notify when matches go live
- **PDF export**: Match reports for coaches

---

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Email**: Resend (kykie.net verified, eu-west-1)

## Files to Provide to Next Session
1. **`hockey-stats-v7.9.10.zip`** — Full source + built docs/
2. **`HANDOFF.md`** — Complete project state
3. **This file** (`next-session-planning.md`) — Context and plans

## SQL Fixes Applied Manually
```sql
-- Dropped stale trigger and duplicate function
DROP TRIGGER IF EXISTS audit_matches ON matches;
DROP FUNCTION IF EXISTS log_audit() CASCADE;

-- Public read on match_commentators
DROP POLICY IF EXISTS "Public read match_commentators" ON match_commentators;
CREATE POLICY "Public read match_commentators" ON match_commentators FOR SELECT USING (true);
```

## Concurrency Note
Tested safe by design: match isolation via UUID, per-match realtime channels, DB-level lock. One known issue: commentator refresh resets eventSeqRef to 0 → duplicate seq. Fix: query MAX(seq) on resume.

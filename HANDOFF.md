# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.13.0 | Date: 4 April 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Stack**: React 18 + Vite, Supabase (belveuygzinoipiwanwb.supabase.co), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder
- **Email**: Resend (transactional) via `no-reply@kykie.net`, DMARC configured

## Critical Build Rules
- **BBZ** = Build, Bump version, and Zip
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json` before building
- **Run `npm run build`** so `docs/` folder is updated
- Deliver as zip excluding `.git/` and `node_modules/`

## Architecture

### Institutions & Teams (v7.10.0+)
**Data model:** Teams belong to Institutions (schools, clubs, universities).

- **`institutions` table**: id, name, short_name, other_names, color, domain
- **`teams` table**: institution_id FK, team_description, gender, age_group, sport, variant
- **Display helpers** (`src/utils/teams.js`): teamDisplayName, teamDerivedName, teamShortName, teamSlug, teamColor, teamInitial, teamMatchesSearch
- **Query constants**: TEAM_SELECT, MATCH_HOME_TEAM, MATCH_AWAY_TEAM

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Supporter | `#/submit` | Submit results, upcoming matches, suggest teams (all pending approval) |
| Commentator | `#/record` | Dashboard with assigned matches, Live + Live Pro recording |
| Comm Admin | `#/admin` | Everything commentator + schedule, manage, approve pending |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, history, health |

**Role rename (v7.12.5):** `crowd` → `supporter` everywhere (profiles, matches.submitted_type, all code refs).

### Registration (v7.12.5+)
- **Three roles at signup**: Supporter / Commentator / Coach
- **Supporter**: basic access, follow institutions, can upgrade later
- **Commentator**: gets supporter access immediately + `commentator_status: 'trainee'`, must graduate via training + benchmark test
- **Coach**: gets supporter access + team link via `coach_teams`, needs admin approval
- **Institution picker** (max 4) replaces old team picker — `supporting_institution_ids[]` on profiles
- **Coach team selection**: checkboxes grouped by institution, filtered by sport, multi-select
- **Sport**: single-select for commentator/coach (Hockey only for now, others greyed)
- **Notifications**: notify_live, notify_rewards, notify_general (all default true)
- **T&C**: mandatory acceptance with inline popup, `accepted_terms_at` stored
- **Email check**: checks on blur if email exists, offers "Forgot password?" if so
- **Alias**: defaults to firstname
- **DOB**: three dropdowns (DD/Mon/Year) instead of native date picker
- **RPC**: `register_crowd_profile` accepts p_role, p_supporting_institution_ids, p_notify_*, p_accepted_terms_at

### Commentator Training (v7.13.0+)
- **Trainee gating**: Commentators with `commentator_status: 'trainee'` see TrainingScreen instead of CommentatorDashboard
- **Three steps**: Learn (read 5 topic cards) → Practice (complete 1+ demo match) → Benchmark Test (score a YouTube match, 80% to pass)
- **Learn topics**: Field zones, Event types, D-circle popup, Recording flow, Quality tips — tracked via localStorage
- **Practice**: Reuses existing demo match flow (Live or Live Pro mode chooser)
- **Benchmark test**: Trainee records a YouTube match, system compares events against gold-standard reference using weighted scoring (Goals 25%, D Entries 20%, SCs 15%, Shots 15%, Zones 15%, Turnovers 10%)
- **Promotion**: ≥80% → `commentator_status: 'qualified'`, `benchmark_passed_at` set, `benchmark_score` saved
- **Admin-created commentators**: automatically get `commentator_status: 'qualified'` (skip training)
- **Benchmark config**: stored in `site_settings` key `benchmark_config` as JSON (videoUrl, refMatchId, team names, match length)
- **Route**: `#/training` — trainee commentators auto-redirected here from `#/admin`
- **Files**: `src/screens/TrainingScreen.jsx`, `src/utils/benchmark.js`

### Merged Institutions & Teams Screen (v7.12.0+)
- Single screen replaces old separate Teams + Institutions screens
- Institution list with expandable teams nested inside
- Institution CRUD: name, short_name, aliases, domain, colour
- Team CRUD within institution: sport/gender/age pills, variant
- Coach assignment: admin picks from dropdown, coach enters email to self-link
- Domain field on institutions (for future coach vetting)

### Prediction System (v7.9.81+)
- User predictions: Home / Draw / Away buttons below upcoming matches
- Kykie AI: auto-predicts all matches (V2 model + ranking fallback)
- Leaderboard: PredictionLeaderboard screen
- Fictitious users: Pistol Pete (GD-based), Suzi Snow (ranking-based)

### Stats Engine (v7.9.77+)
- Recompute All Stats button — idempotent delete+insert
- `archiveMatchStats()` returns `{ ok, reason }`
- D Popup: 8 options, persistent after shots, smart Goal

### Critical Zone Perspective Rule
Zone labels are ALWAYS from home perspective. Away must be inverted for display.

### Key Patterns
- **Multi-role**: `role` = active, `roles[]` = all assigned
- **Teams query**: Always use `TEAM_SELECT` from teams.js
- **Team display**: Always use helpers from teams.js
- **RLS**: Never use `FOR ALL` — split into separate policies
- **Supabase SQL**: Use `$fn$` delimiter instead of `$$`
- **Event fetch**: Per match with `.limit(5000)`
- **Analysis integrity**: Run analysis once, lock numbers, then render

### Supabase Tables
Core: `institutions`, `teams`, `matches`, `match_events`, `profiles`, `match_stats`, `predictions`
Supporting: `coach_teams`, `match_commentators`, `event_reactions`, `match_viewers`, `ranking_sets`, `rankings`, `audit_log`, `contributor_stats`, `credit_ledger`, `sponsors`, `issues`, `site_settings`

## All Migrations in Order
```
upgrade-scripts/baseline/        — Original schema
upgrade-scripts/v7.1.0/          — prev_rank columns + snapshot fn
upgrade-scripts/v7.2.0/          — ranking_date column
upgrade-scripts/v7.4.5/          — last_seen_at column
upgrade-scripts/v7.6.0/          — roles[] column + create_profile update
upgrade-scripts/v7.7.0/          — Crowd registration fields + register_crowd_profile RPC
upgrade-scripts/v7.9.0/          — Crowd submissions columns + approval RPCs + RLS
upgrade-scripts/v7.9.77/         — Canonical match_stats
upgrade-scripts/v7.9.81/         — Predictions table + RLS
upgrade-scripts/v7.10.0/         — Institutions table + teams columns + data population
upgrade-scripts/v7.12.0/         — Institution domain column
upgrade-scripts/v7.12.5/         — Supporter rename + registration roles + notifications + T&C + supporting_institution_ids
upgrade-scripts/v7.13.0/         — Training benchmark columns (benchmark_score, benchmark_passed_at, training_progress)
```

## Known Issues
- Score flip: Team page shows home-away order, not viewed-team-first
- Commentator timer resume: After refresh, timer starts from 0
- `suggestTeam()` in CrowdSubmitScreen creates pending institution — needs admin approval flow in PendingApprovalsScreen

## Dormant Code (kept for future use)
- `src/utils/credits.js` — credit rules, promotion thresholds (tier system removed from UI in v7.12.3)
- `src/screens/ContributorScreen.jsx` — admin contributor view (route removed)
- `src/screens/InstitutionScreen.jsx` — old standalone institution screen (route removed)
- DB tables `contributor_stats`, `credit_ledger` — still exist, will be reused

## Session Summary (v7.11.2 → v7.12.11) — 4 April 2026

### Registration Overhaul
- Three registration roles: Supporter / Commentator / Coach with nested access
- Institution picker (max 4) replaces team picker — supporting_institution_ids[]
- Coach: checkbox team selection grouped by institution + sport
- Sport single-select for commentator/coach
- Notification preferences (live, rewards, general)
- T&C acceptance with inline popup + full terms at public/terms.md
- Email existence check on blur with forgot password link
- Alias defaults to firstname
- DOB: three dropdowns (day/month/year)
- Role descriptions below buttons explaining each option

### Merged Institutions & Teams Screen
- Combined old separate Teams + Institutions screens into one
- Expandable institution cards with nested teams
- Institution CRUD with domain field
- Team CRUD with sport/gender/age pills, variant
- Coach assignment (admin dropdown / coach email lookup)
- Delete team fixed (direct Supabase call)
- Share link fixed (uses teamSlug instead of manual string slugging)

### Role Rename
- `crowd` → `supporter` across all code (12+ refs) + DB migration
- Old crowdTier graduate/veteran logic removed — supporters can't go live

### Tier System Removed
- CrowdDashboardPanel stripped to just contribution actions + issues
- ContributorScreen route removed
- credits.js and DB tables kept dormant for future credit system

### Field Recorder Fixes
- Safari single-tap possession: direct onTouchEnd on ball elements
- tapHandledRef debounce prevents double-fire
- Ghost trail suppressed for SC origins

### Commercialisation Strategy
- Full planning doc: commercialisation-strategy.md
- Three tiers: Free / Free Plus (100+ team credits) / Premium (R5,000/team or R10,000/institution)
- Commentator qualification: trainee → training + benchmark test → qualified
- Credit system: live 50, video 30/20, score/schedule 1, mistakes -1.5x
- Team credits: 100 per match maintenance cost, viewer credits
- Implementation priority: 8 steps documented

### Bug Fixes
- getTeamShareLink uses teamSlug(team) instead of manual slugging
- FieldRecorder stale setCoachTeamId reference fixed
- SystemHealthScreen role colour key updated

## Session Summary (v7.12.11 → v7.13.0) — 4 April 2026

### Commentator Training Screen (Commercialisation Step 2)
- New `TrainingScreen.jsx` — three-step flow: Learn → Practice → Benchmark Test
- Learn section: 5 expandable topic cards (zones, events, D-circle, recording flow, quality tips) with read/unread tracking, zone diagram, D-option reference
- Practice section: launches existing demo match via LiveModeChooser, tracks completion count
- Benchmark test: records YouTube match via Live Pro, compares against gold-standard reference events
- Benchmark comparison engine (`src/utils/benchmark.js`): weighted scoring across 6 metrics, configurable tolerances
- Results screen: score circle + per-metric breakdown bars with pass/fail at 80%

### Trainee Gating
- `#/admin` redirects trainee commentators to `#/training`
- `#/record` blocked for trainees (redirects to training)
- Login redirect: trainees → `#/training`, qualified → `#/admin`
- Role switch respects trainee status
- Admin-created commentators auto-set to `commentator_status: 'qualified'`

### Migration (v7.13.0)
- `profiles.benchmark_score NUMERIC` — best benchmark result
- `profiles.benchmark_passed_at TIMESTAMPTZ` — qualification timestamp
- `profiles.training_progress JSONB` — learn/practice tracking
- Existing commentators with NULL status set to 'qualified'
- Benchmark config via `site_settings.benchmark_config` JSON

### Next: Commercialisation Step 3
- Personal credit system + voucher management
- Wire credits to match completion events (live/video/score)
- Reactivate dormant `credits.js` with new credit values from strategy doc

### OTP Registration (v7.13.2+)
- Replaced email confirmation link with 6/8-digit OTP code input
- `verifyOtp()` + `resend()` on RegisterPage success screen
- Supabase email template needs `{{ .Token }}` to show the code

### Kykie AI Scout (Research — not yet built)
**Data-validated metrics** from 17 Live Pro matches (12 decisive):
- **Accuracy** (D entries / possession): 92% match prediction rate — strongest single predictor
- **Speed** (seconds between events): 64% prediction rate — measures decision-making tempo
- **Patience** (own-half passes / attack entries): playing style indicator, not outcome predictor
  - Builder (4.0+), Structured (3.0-3.9), Balanced (2.0-2.9), Direct (1.5-1.9), Counter (<1.5)

**Key findings:**
- Winners average 35% D entry rate vs losers 14% — the gap is massive
- Winners average 4.5s between events vs losers 5.0s
- Territory (83% predictive) already exists in stats; AI Scout adds accuracy + speed + patience
- Auto-generated scouting reports tested for Paarl Girls, Oranje, Paarl Gim, Bloemhof, Rhenish — highly accurate tactical narratives

**Implementation:** Premium feature — Claude API call with structured match data → tactical briefing. See `commercialisation-strategy.md` Section 8 for full spec.


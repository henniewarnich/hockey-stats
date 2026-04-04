# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.12.11 | Date: 4 April 2026**

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

# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.14.1 | Date: 5 April 2026**

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

### Commentator Progression (v7.13.0 → v7.14.0)
Three-tier system: **trainee** → **apprentice** → **qualified** (commentator)

| Status | How to reach | Dashboard access | Can schedule | Can start live | Top 10 matches | Credits |
|--------|-------------|-----------------|-------------|---------------|----------------|---------|
| trainee | Register as commentator | TrainingScreen only | No | No | No | N/A |
| apprentice | Pass benchmark test | CommDashboardPanel (limited) | No | Yes (non-Top 10) | Blocked | Show 0, "would be" |
| qualified | 1 live + 1 recorded match | Full CommentatorDashboard | Yes | Yes (all) | Yes | Earning after 5 matches |

- `saveBenchmarkResult()` sets `commentator_status: 'apprentice'` (not 'qualified')
- Auto-promote apprentice → qualified: `CommDashboardPanel` checks `audit_log` on load
- Admin-created commentators auto-set to `'qualified'` (skip training)

### Training System (v7.13.0+)
- **TrainingScreen**: 3-step flow: Learn (14-step animated wizard) → Practice (demo match) → Benchmark Test (37-step match narrative)
- **TrainingWizard** (14 steps): Animated field with pass, turnover, overhead, out, dead ball, LC, D entry, SC, actions, pause/resume, undo, field rotation, end match
- **BenchmarkTest** (37 steps): Full match narrative with team selection popup, drag overhead, SC sequence, LC positioning, field rotation — tests all recorder interactions
- **Backdoor**: Double-click "Benchmark test" header → enter day of month → skips to pass screen
- **Trainee gating**: 5 redirect points in App.jsx (login, role switch, #/admin, #/record, default landing)

### Device Security (v7.14.0+)
- **`user_devices` table**: user_id, device_id (localStorage UUID), device_name (parsed UA), last_active_at
- **Max 2 devices** per user — 3rd device triggers OTP verification via email
- **Flow**: On login/session restore → `checkDevice()` → known (proceed) / registered (silent) / blocked (OTP screen)
- **DeviceVerification** component: shows existing devices, sends OTP, replaces oldest on verify
- **SecurityScreen** (`#/security`): Password change tab + Device management tab (view/remove devices)
- **Access**: 🔒 button in LandingPage header
- **Files**: `src/utils/devices.js`, `src/components/DeviceVerification.jsx`, `src/screens/SecurityScreen.jsx`

### Registration (v7.12.5+)
- **Three roles at signup**: Supporter / Commentator / Coach
- **OTP registration** (v7.13.2+): 8-digit code input instead of email confirmation link
- **Institution picker** (max 4) with `supporting_institution_ids[]`
- **Coach team selection**: checkboxes grouped by institution
- **RPC**: `register_crowd_profile` accepts p_role, p_supporting_institution_ids, p_notify_*, p_accepted_terms_at

### Credits System (v7.13.22+)
- **CreditsScreen** (`credits` case in AppContent): Shows balance, progression, match history with credit values
- **Three display states**: Apprentice (0, "would be"), Qualifying (0, counting to 5), Earning (real credits)
- **Credit values**: Live Pro 50, Video review 20, Live Basic 10, Quick score 1, Schedule 1
- **Voucher**: 100 credits = R100 Takealot voucher
- **Data sources**: `audit_log` for match history (always), `credit_ledger` when credit system activated
- **Dormant**: `credits.js` functions + `contributor_stats`/`credit_ledger` tables exist, not yet wired to match events

### Key Patterns
- **Multi-role**: `role` = active, `roles[]` = all assigned
- **Teams query**: Always use `TEAM_SELECT` from teams.js
- **RLS**: Never use `FOR ALL` — split into separate policies
- **Supabase SQL**: Use `$fn$` delimiter instead of `$$`
- **Analysis integrity**: Run analysis once, lock numbers, then render
- **HomeScreen is dead code**: `case "home"` in AppContent renders LandingPage, not HomeScreen

### Supabase Tables
Core: `institutions`, `teams`, `matches`, `match_events`, `profiles`, `match_stats`, `predictions`
Supporting: `coach_teams`, `match_commentators`, `event_reactions`, `match_viewers`, `ranking_sets`, `rankings`, `audit_log`, `contributor_stats`, `credit_ledger`, `sponsors`, `issues`, `site_settings`, `user_devices`

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
upgrade-scripts/v7.12.5/         — Supporter rename + registration roles + notifications + T&C
upgrade-scripts/v7.13.0/         — Training benchmark columns (benchmark_score, benchmark_passed_at, commentator_status)
upgrade-scripts/v7.14.0/         — user_devices table + RLS
```

## Known Issues
- Score flip: Team page shows home-away order, not viewed-team-first
- Commentator timer resume: After refresh, timer starts from 0
- `suggestTeam()` in CrowdSubmitScreen creates pending institution — needs admin approval flow

## Dormant Code (kept for future use)
- `src/utils/credits.js` — credit rules, promotion thresholds (will be reactivated for credit system)
- `src/screens/ContributorScreen.jsx` — admin contributor view (route removed)
- `src/screens/InstitutionScreen.jsx` — old standalone institution screen (route removed)
- `src/screens/HomeScreen.jsx` — imported but never rendered (LandingPage used instead)
- DB tables `contributor_stats`, `credit_ledger` — still exist, will be reused

## Kykie AI Scout (Research — not yet built)
**Data-validated metrics** from 17 Live Pro matches (12 decisive):
- **Accuracy** (D entries / possession): 92% match prediction rate
- **Speed** (seconds between events): decision-making tempo indicator
- **Patience** (own-half passes / attack entries): playing style classifier (Builder/Structured/Balanced/Direct/Counter)

**Key findings:** Winners average 35% D entry rate vs losers 14%. Auto-generated scouting reports tested for 5 teams — highly accurate tactical narratives. Premium feature — Claude API call with structured match data → tactical briefing.

## Session Summary (v7.13.0 → v7.14.1) — 5 April 2026

### Interactive Benchmark Test (v7.13.12 → v7.13.18)
- Replaced old YouTube benchmark with 37-step match narrative
- Team selection popup at kick-off (must pick correct team)
- Overhead requires real drag mechanic (blue dashed line follows pointer)
- SC sequence: SC popup → position on backline → push outside D → back into D → goal
- LC position: quarter/midfield dividing line, SAME side as LC button (verified against FieldRecorder.jsx)
- Field rotation with paused overlay, resume, undo
- Second half with flipped field (arrows reverse correctly)
- Backdoor: double-click header → enter day of month → bypass test

### Commentator Progression (v7.13.19 → v7.14.1)
- Three tiers: trainee → apprentice → qualified
- `saveBenchmarkResult` sets `'apprentice'` (not `'qualified'`)
- CommDashboardPanel rewritten: status banner (apprentice/qualifying/earning), auto-promote, My Credits card
- HomeScreen: dead code (apprentice banner added there but never renders — fixed in CommDashboardPanel)
- MatchScheduleScreen: "+ Schedule Match" disabled for apprentice, Top 10 matches locked with message, edit button hidden
- HistoryScreen: Top 10 team matches filtered out for apprentice with banner
- Penalty button hidden for apprentice in HistoryScreen
- App.jsx: match_setup blocked for apprentice

### Credits Statement (v7.13.22)
- New `CreditsScreen.jsx` with balance circle, stats cards, progress bar, match history
- Three states: Apprentice (0 credits, "would be" values), Qualifying (0, X/5 progress), Earning (real credits)
- Wired from CommDashboardPanel "My Credits" card

### Password Change + Device Security (v7.14.0)
- `SecurityScreen.jsx`: Password tab (change password) + Devices tab (view/remove registered devices)
- `DeviceVerification.jsx`: Full-screen OTP blocker for 3rd device detection
- `devices.js`: Device ID in localStorage, checkDevice(), replaceOldestDevice()
- Integrated into App.jsx login + session restore flow
- 🔒 button in LandingPage header for all logged-in users
- Migration: `user_devices` table with RLS

### Bug Fixes
- 406 error: removed dead `getBenchmarkConfig()` call to non-existent `site_settings`
- LiveModeChooser prop fix: `show/onSelect/onClose` for TrainingScreen
- Demo completion counting fixed (onNavigate calls handleDemoEnd)
- Arrow direction fix for flipped field (setPoss accepts flip parameter)

### Pending Migrations (not yet run on Supabase)
- `upgrade-scripts/v7.13.0/migration-training-benchmark.sql`
- `upgrade-scripts/v7.14.0/migration-user-devices.sql`
- Supabase Auth email template: add `{{ .Token }}` for OTP codes

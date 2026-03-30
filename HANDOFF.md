# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.10.22 | Date: 30 March 2026**

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

### Institutions & Teams (v7.10.0)
**New data model:** Teams belong to Institutions (schools, clubs, universities).

- **`institutions` table**: id, name, short_name, other_names, color
- **`teams` table**: now includes institution_id FK, team_description, gender, age_group, sport
- **Post-migration**: All existing teams renamed to "Girls Hockey 1st"; original names stored in team_description; one institution created per existing team with original name, short_name, and color

**Display helper** (`src/utils/teams.js`):
- `teamDisplayName(team)` → "PG Girls Hockey 1st" (institution short_name + team name)
- `teamShortName(team)` → "PG" or "Paarl Girls" (institution short_name or name)
- `teamInitial(team)` → "P" (first char of institution)
- `teamColor(team)` → institution color, fallback to team color
- `teamSlug(team)` → URL slug from institution name
- `teamMatchesSearch(team, query)` → searches institution name, short_name, other_names, team name
- `TEAM_SELECT`, `MATCH_HOME_TEAM`, `MATCH_AWAY_TEAM` — query constants with institution joins

**All screens updated** to use these helpers instead of raw `team.name` / `team.color`.

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Crowd | `#/submit` | Submit results, upcoming matches, suggest teams (all pending approval) |
| Commentator | `#/record` | Dashboard with assigned matches, Live + Live Pro recording |
| Comm Admin | `#/admin` | Everything commentator + schedule, manage, approve pending |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, history, health |

### Prediction System (v7.9.81+)
- User predictions: Home / Draw / Away buttons below each upcoming match
- Kykie AI: auto-predicts all matches (V2 model + ranking fallback)
- Leaderboard: PredictionLeaderboard screen via summary card tap
- Fictitious users: Pistol Pete (GD-based), Suzi Snow (ranking-based)
- predictions table: user_id (null=Kykie), match_id, prediction, points, correct, scored_at

### Stats Engine (v7.9.77+)
- Recompute All Stats button — idempotent delete+insert, no flags
- `archiveMatchStats()` returns `{ ok, reason }` with specific failure info
- Canonical migration: `upgrade-scripts/v7.9.77/migration-canonical-match-stats.sql`

### D Popup (Live Pro) — 8 Options
Goal, Short Corner, Shot on Goal, Shot Off Target, Penalty, Long Corner, Lost Possession, Dead Ball.
Persistent after shots. Smart Goal: no auto-shot if already recorded.

### Critical Zone Perspective Rule
Zone labels are ALWAYS from home perspective. Away must be inverted for display.

### Key Patterns
- **Multi-role**: `role` = active, `roles[]` = all assigned
- **Teams query**: Always use `TEAM_SELECT` from teams.js (includes institution join)
- **Match query**: Always use `MATCH_HOME_TEAM`, `MATCH_AWAY_TEAM` from teams.js
- **Team display**: Always use helpers from teams.js — never raw `team.name` or `team.color`
- **Team search**: Always use `teamMatchesSearch()` — searches institution name, short_name, other_names
- **RLS**: Never use `FOR ALL` — split into separate INSERT/UPDATE/DELETE policies
- **Supabase SQL**: Use `$fn$` delimiter instead of `$$`
- **Event fetch**: Per match with `.limit(5000)`, never batch
- **Analysis integrity**: Run analysis once, lock numbers, then render

### Supabase Tables
Core: `institutions`, `teams`, `matches`, `match_events`, `profiles`, `match_stats`, `predictions`
Supporting: `coach_teams`, `match_commentators`, `event_reactions`, `match_viewers`, `ranking_sets`, `rankings`, `audit_log`, `contributor_stats`, `credit_ledger`, `sponsors`, `issues`

## All Migrations in Order
```
upgrade-scripts/baseline/        — Original schema
upgrade-scripts/v7.1.0/          — prev_rank columns + snapshot fn
upgrade-scripts/v7.2.0/          — ranking_date column
upgrade-scripts/v7.4.5/          — last_seen_at column
upgrade-scripts/v7.6.0/          — roles[] column + create_profile update
upgrade-scripts/v7.7.0/          — Crowd registration fields + register_crowd_profile RPC
upgrade-scripts/v7.9.0/          — Crowd submissions columns + approval RPCs + RLS
upgrade-scripts/v7.9.77/         — Canonical match_stats (replaces all earlier match_stats migrations)
upgrade-scripts/v7.9.81/         — Predictions table + RLS
upgrade-scripts/v7.10.0/         — Institutions table + teams columns + data population
```

## Manual SQL Fixes Applied
```sql
ALTER TABLE predictions DROP CONSTRAINT predictions_match_id_fkey;
ALTER TABLE predictions ADD CONSTRAINT predictions_match_id_fkey 
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
```

## Known Issues
- Score flip: Team page shows home-away order, not viewed-team-first
- Commentator timer resume: After refresh, timer starts from 0
- TeamsScreen edit form still uses raw team.name — needs redesign for institution CRUD
- `suggestTeam()` creates team without institution link — needs institution creation flow
- App.jsx `getTeamShareLink` receives name string — should receive team object

## Session Summary (v7.9.86 → v7.10.0) — 30 March 2026

### Institutions Architecture (Major Refactor)
- New `institutions` table: name, short_name, other_names, color
- Teams linked via institution_id FK; added team_description, gender, age_group, sport
- Migration creates institutions from existing teams, renames teams to "Girls Hockey 1st"
- Display helper (`src/utils/teams.js`): 10 functions + 6 query constants
- All 35+ files updated: queries, display refs, search, slugs, colors
- Team objects in live flows pass institution through for downstream display

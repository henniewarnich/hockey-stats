# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.20.0 | Date: 1 May 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/kykie (renamed from hockey-stats)
- **Stack**: React 18 + Vite, Supabase (env-switched), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder
- **Dev**: `npm run dev` → localhost:5173 against staging DB
- **Email**: Resend (transactional) via `no-reply@kykie.net`, Afrihost for `info@kykie.net`
- **Local folder**: `C:\@@Data\@@VibeProjects\Kykie`

## Supabase Projects
- **Production**: belveuygzinoipiwanwb.supabase.co (renamed to "kykie")
- **Staging**: gswvccchwrkcwepufvdq.supabase.co (kykie-staging, eu-central-2)
- Switching via `.env.production` / `.env.development` (Vite auto-selects)
- `.env.development` is gitignored

## Critical Build Rules
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json`
- **Run `npm run build`** so `docs/` folder is updated
- Deploy: `git add -A && git commit -m "v7.x.x — description" && git push`
- Logo PNGs in `public/` — Vite auto-copies to `docs/` on build
- CNAME file in `public/` must be preserved

## Architecture

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Supporter | `#/submit` | Submit results, upcoming matches, suggest teams |
| Commentator | `#/record` | Dashboard with assigned matches, Live + Live Pro recording |
| Comm Admin | `#/admin` | Everything commentator + schedule, manage, approve |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats |
| Admin | `#/admin` | Full access: all admin screens |

### Key Features
- **Live Pro recording**: Full field recorder with 90-degree rotation (0→90→180→270) and team colour picker
- **Match Reports**: `match_reports` table, auth-gated viewer at `#/report/{id}`, teaser/full split (supporters see stats + verdict + DNA, coaches see tactical analysis), share button, admin "Notify Coaches" button
- **Feature gating**: Free = own stats, VS OPP + Benchmark blurred. Free Plus = avg ≥ 20 credits/match. Premium = R5,000/yr
- **Email notifications**: pg_net + Resend from database triggers. Registration auto-notifies admin. Report notification via RPC.
- **Coach-only CSS**: `<div class="coach-only">` gates tactical content in reports

### Admin Navigation
- `AdminBackBar` component on all 12 admin sub-screens

### Key Patterns
- **Multi-role**: `role` = active, `roles[]` = all assigned. RoleSwitcher uses sessionStorage
- **Teams query**: Always `.or('status.eq.active,status.is.null')`
- **Supabase SQL editor**: Use `$fn$` not `$$`
- **Ball movement**: D Entry + Ball in play = implicit forward movement (not just "Ball forward")
- **Zone perspective**: Labels stored from home team perspective; invert for away
- **Opponent season avg**: `oppSeasonAvg` computed from `matchDetailRecords`, not H2H only
- **seasonAvgForTeam**: Skips matches team didn't play in, correct divisor

## Email Setup
- **Transactional**: Resend via `no-reply@kykie.net`. API key in `site_settings` table. `send_email()` Postgres fn uses pg_net.
- **Personal**: `info@kykie.net` via Afrihost mailbox, forwarded to Gmail. Gmail "Send mail as" configured.
- **Registration trigger**: `on_profile_created_notify` → emails hennie.warnich@gmail.com
- **Report notification**: `notify_coaches_of_report(p_report_id)` RPC → emails coaches of both teams
- **Gmail signature**: kykie-icon-dark.png + name + kykie.net

## Session Summary (1 May 2026)

### Code Changes (v7.18.20 → v7.20.0, merged build)
- Rename hockey-stats → kykie (package.json, IndexedDB, localStorage keys)
- Environment switching (supabase.js reads env vars, .env.production + .env.development)
- Per-match averages bug fix (seasonAvgForTeam skips irrelevant matches)
- Opponent full-season averages (oppSeasonAvg state)
- Role pill fix on TeamPage (sessionStorage role override)
- Event deletion in GameReviewScreen (admin, with score recalculation for goals)
- Match Reports feature (ReportScreen, route, badges, teaser/full, share, notify)
- Email notifications (send_email fn, registration trigger, coach notify RPC)
- CLAUDE.md + .gitignore

### Reports Generated
1. PG vs Oranje (18 Apr) — 1-2, corrected ball movement
2. PG vs Affies (29 Apr) — 1-1, Affies 5-4 pens
3. PG vs Affies two-match comparison (28-29 Apr) — tactical swap
4. PG vs Bloemhof (30 Apr) — 1-3
5. Kykie for Coaches PowerPoint (9 slides)
6. PG vs Oranje PDF export
7. 29 batch reports regenerated with corrected ball movement

### Infrastructure
- GitHub repo renamed to kykie
- Staging Supabase created + full schema migrated
- Local dev environment working (Node.js, npm run dev against staging)
- Gmail send/receive as info@kykie.net
- Email signature configured

### TOP 10 Benchmarks (18 Apr, 31 appearances)
DE: 15.5 | SoG: 3.4 | TW: 28.3 | PL: 34.9 | OppDE: 10.7

## Known Issues
- Score flip: Team page shows home-away order, not viewed-team-first
- Commentator timer resume: After refresh, timer starts from 0
- FK cascade: team_credits needs CASCADE fix for match deletion

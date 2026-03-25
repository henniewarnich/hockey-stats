# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.9.11 | Date: 25 March 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Stack**: React 18 + Vite, Supabase (belveuygzinoipiwanwb.supabase.co), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder
- **Email**: Resend (transactional) via `no-reply@kykie.net`, DMARC configured

## Critical Build Rules
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json` before building
- **Run `npm run build`** so `docs/` folder is updated
- Deliver as zip excluding `.git/` and `node_modules/`

## Architecture

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Crowd | `#/submit` | Submit results, upcoming matches, suggest teams (all pending approval) |
| Commentator | `#/record` | Dashboard with assigned matches, Live + Live Pro recording |
| Comm Admin | `#/admin` | Everything commentator + schedule, manage, approve pending |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, history, pending, health |

### Landing Page (`kykie.net`)
- 4 tabs: Live / Upcoming / Results / Teams
- Auth-aware header: user name + sign out (logged in) or "Sign in" (not)
- Live match gating: must be logged in to view live
- Per-tab action buttons: register prompts (anon) or + buttons (logged in)
- Email confirmed banner after clicking confirmation link
- Sport dropdown (Girls Hockey active, others "Coming soon")
- Sticky tabs + search on scroll

### Registration & Auth
- `#/register` — 2-step form (account details → profile info) → crowd role
- Extra fields: alias/nickname, DOB, gender, hometown, sport interests, supporting teams
- Email confirmation via Resend → Supabase SMTP
- `#/login` — Forgot password → email reset → ResetPasswordScreen
- Spam folder hint on reset confirmation

### Crowd Submissions (`#/submit`)
- Mode selection: Submit Result, Add Upcoming, Suggest Team
- Deep-link: `#/submit?mode=result` / `?mode=upcoming` / `?mode=team`
- All submissions → `status: 'pending'`, `submitted_type: 'crowd'`
- Fuzzy team matching on suggest (warns about similar existing teams)
- Duplicate match detection (same teams on same date, either order)
- Crowd users CANNOT go live

### Live Match Recording
- **Live Mode Chooser** popup on every "Start Live" action
- **Live** (LiveLiteScreen): 5 tap events per team (Goal, Attacking, Defending, Short Corner, Shot Saved), timer, pause, undo, end
- **Live Pro** (LiveMatchScreen): Full field recorder with zones, positions, detailed events
- Switch between modes within first 5 minutes
- Both write to same `match_events` table, same viewer experience
- Available on: CommentatorDashboard + MatchScheduleScreen

### Pending Approvals (`#/pending`)
- Admin/Comm Admin approve or reject crowd submissions
- Tabs: Matches | Teams with count badges
- Approve match as Result or Upcoming, reject deletes
- Pending count shown on admin HomeScreen

### System Health (`#/health`)
- DB size estimate vs 500MB, total rows
- Per-table row counts with green/amber/red thresholds
- Live matches, pending queue, visitors online
- User activity (24h/7d/30d), users by role

### Supabase Tables
- `teams` — name, color, status ('active'|'pending'), suggested_by
- `matches` — home/away IDs, scores, status, date, venue, match_type, created_by, submitted_by, submitted_type, approved_by, approved_at, home_rank, away_rank
- `match_events` — event stream (team, event, zone, detail, match_time, seq)
- `profiles` — firstname, lastname, username, email, role, roles[], blocked, last_seen_at, alias_nickname, date_of_birth, biological_gender, home_town, sport_interest[], supporting_team_ids[]
- `coach_teams` — Coach-to-team assignments
- `match_commentators` — Commentator-to-match assignments
- `event_reactions` — Emoji reactions
- `match_viewers` — Persistent viewer tracking
- `ranking_sets` / `rankings` — Team rankings
- `audit_log` — All actions logged

### Supabase RPC Functions
- `create_profile(...)` — Admin user creation (bypasses RLS)
- `register_crowd_profile(...)` — Self-registration with extra fields
- `delete_user(p_id)` — Clears all FK refs then deletes profile + auth
- `delete_match(...)` — Permission-based delete with audit
- `approve_match(...)` / `reject_match(...)` — Pending match handling
- `approve_team(...)` / `reject_team(...)` — Pending team handling
- `snapshot_match_rankings(...)` — Rankings snapshot
- `log_audit(...)` — Generic audit logger

### Email Infrastructure
- Resend: kykie.net verified (eu-west-1)
- DNS: DKIM (resend._domainkey), SPF+MX (send subdomain), DMARC (_dmarc)
- Supabase SMTP: smtp.resend.com:465, sender: Kykie.Net <no-reply@kykie.net>
- Site URL + Redirect URL: https://kykie.net

### Key Patterns
- **Multi-role**: `role` = active, `roles[]` = all assigned. RoleSwitcher changes React state + sessionStorage only
- **Teams query safety**: Always `.or('status.eq.active,status.is.null')`
- **Live mode**: LiveModeChooser → liveMode state ('lite'|'pro') → conditional render
- **Audit logging**: Central logAudit(), fire-and-forget, 16+ actions
- **Performance**: 20-item render caps, memory search, 10s live polling
- **Supabase SQL editor**: Use `$fn$` delimiter instead of `$$` to avoid comment injection

## All Migrations in Order
```
upgrade-scripts/baseline/        — Original schema
upgrade-scripts/v7.1.0/          — prev_rank columns + snapshot fn
upgrade-scripts/v7.2.0/          — ranking_date column
upgrade-scripts/v7.4.5/          — last_seen_at column
upgrade-scripts/v7.6.0/          — roles[] column + create_profile update
upgrade-scripts/v7.7.0/          — Crowd registration fields + register_crowd_profile RPC
upgrade-scripts/v7.9.0/          — Crowd submissions columns + approval RPCs + RLS
upgrade-scripts/v7.9.0/          — Updated delete_user RPC
```
All applied as of v7.9.10.

## Known Issues
- **Score flip**: Team page shows home-away order, not viewed-team-first (TODO)
- **Commentator timer resume**: After refresh, timer starts from 0 (eventSeqRef also resets)
- **RLS complexity**: Multiple overlapping policies — new features may need policy updates
- **Spam folder**: Resend emails may land in spam initially; DMARC helps over time

## Session Summary (v7.6.0 → v7.9.10) — 25 March 2026

### Email & Auth
- Resend domain verification + Afrihost DNS (DKIM, SPF, MX, DMARC)
- Supabase SMTP configuration
- Forgot password flow (request → email → reset screen)
- Public registration (2-step, crowd role, extra profile fields)
- Email confirmation detection + banner on landing page

### Crowd Features
- Crowd submissions: results, upcoming matches, team suggestions (all pending)
- Admin pending approvals screen with approve/reject
- Fuzzy team name matching on suggest
- Duplicate match detection (same teams, same day)
- Per-tab contextual buttons (register prompts or + action buttons)
- Live match gating (login required)

### Live Recording
- Live Lite mode (LiveLiteScreen) — simple tap scoring
- Live Mode Chooser popup on ALL live entry points (New Match, Match Schedule, Commentator Dashboard)
- Switch between Live ↔ Live Pro within first 5 minutes
- Crowd users cannot go live — admin/commentator only

### Admin
- System Health Dashboard (DB size, row counts, activity, users by role)
- Pending Approvals with count badge on HomeScreen
- Updated delete_user RPC for new FK columns
- Block/unblock UI feedback fix
- Viewer role removed from user management

### Bug Fixes
- Login flash loop for unknown roles
- Team search input losing focus (component-inside-render)
- Teams blank on landing (NULL status filter)
- React infinite re-render (live-lite useEffect removed)
- lockMatch false positive — same user can now re-lock own match
- New Match (Admin) now shows Live/Live Pro chooser

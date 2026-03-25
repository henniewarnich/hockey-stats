# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.6.0 | Date: 25 March 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Stack**: React 18 + Vite, Supabase (belveuygzinoipiwanwb.supabase.co), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder

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
| Commentator | `#/record` | Dashboard with assigned matches, quick score + live, viewer count |
| Comm Admin | `#/admin` | Everything commentator + schedule matches, manage assigned matches |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, rankings, history |

### Landing Page (`kykie.net`)
- 4 tabs: Live / Upcoming / Results / Teams
- Sport dropdown (Girls Hockey active, others "Coming soon")
- Shared search bar with sport pill
- Sticky tabs + search on scroll (logo scrolls away)
- Team color on date badges (solid fill, white text)
- Countdown to kickoff on Upcoming tab

### Team Page (`#/team/{slug}`)
- **Public view**: Results tab with match cards, tap for commentary detail
- **Coach view**: Overall (default) / Matches / Trends / Live Stats tabs
- Sticky kykie header with refresh icon + login
- Tabs hidden when viewing match detail
- Emoji reactions on commentary events
- Persistent viewer tracking

### Key Screens
- `LandingPage.jsx` — Public landing with all 4 tabs
- `TeamPage.jsx` — Public + Coach team view (biggest file ~910 lines)
- `LiveMatchScreen.jsx` — Live match recorder (field, scoreboard, events)
- `CoachLiveScreen.jsx` — Coach stats view (quarters, totals, insights)
- `MatchScheduleScreen.jsx` — Admin match scheduling + Start Live + Quick Score
- `CommentatorDashboard.jsx` — Commentator's assigned matches
- `CoachDashboard.jsx` — Coach's assigned teams + upcoming
- `UserManagementScreen.jsx` — Admin user CRUD with Active/Blocked tabs
- `RankingsScreen.jsx` — Admin ranking set management + per-team position editing
- `LoginPage.jsx` — Remembers last username

### Supabase Tables
- `teams` — Team name, color
- `matches` — home/away team IDs, scores, status, date, venue, match_type, created_by, home_rank, away_rank, home_prev_rank, away_prev_rank
- `match_events` — Full event stream (team, event, zone, detail, match_time, seq)
- `profiles` — User data (firstname, lastname, username, email, role, roles[], blocked, last_seen_at)
- `coach_teams` — Coach-to-team assignments
- `match_commentators` — Commentator-to-match assignments
- `event_reactions` — Emoji reactions (match_event_id, emoji, viewer_id)
- `match_viewers` — Persistent viewer tracking per match
- `ranking_sets` — Ranking snapshots (scraped_at, ranking_date, source_url, notes)
- `rankings` — Team positions within a ranking set (position, points)
- `audit_log` — Comprehensive action logging (login, logout, CRUD, match lifecycle, rankings)

### Supabase RPC Functions (SECURITY DEFINER)
- `create_profile(p_id, p_email, p_firstname, p_lastname, p_username, p_role)` — Bypasses RLS for user creation, also sets roles[] array
- `delete_user(p_id)` — Deletes profile + auth user, logs to audit
- `delete_match(p_match_id, p_user_id)` — Permission-based delete with audit (admin=any, comm admin=own)
- `snapshot_match_rankings(p_match_id)` — Snapshots latest rankings onto match
- `log_audit(p_user_id, p_action, p_target_type, p_target_id, p_details)` — Generic audit logger

### Key Utilities
- `src/utils/sync.js` — Supabase CRUD (scheduleMatch, createLiveMatch, pushLiveEvent, snapshotRankings, fetchLatestRankings, etc.) — all mutations audit-logged
- `src/utils/auth.js` — Auth (signIn, createUser, listUsers, coach assignments) — all mutations audit-logged
- `src/utils/audit.js` — Central audit logger (logAudit, logAuditAs) via log_audit RPC
- `src/utils/stats.js` — Shared stat computation (computeStats, computeMatchStats, aggregateStats, getQuarters)
- `src/utils/helpers.js` — ensureContrastingColors, otherTeam, uid
- `src/utils/constants.js` — APP_VERSION, TEAM_COLORS, BREAK_FORMATS, MATCH_TYPES
- `src/components/NavLogo.jsx` — Shared kykie logo for admin nav bars

### New Components (v7.0.0+)
- `src/components/CoachOverall.jsx` — Season aggregated stats (conversion rates, stat bars, per-match averages)
- `src/components/CoachTrends.jsx` — Weekly trend charts (ranking, GD, territory, possession, D-entries, short corners)
- `src/components/RankBadge.jsx` — Inline rank badge with trend indicator (▲improved / ▼dropped / #unchanged)
- `src/components/MiniChart.jsx` — Shared SVG trend chart with value labels, supports compact mode (CoachTrends + CoachDashboard)
- `src/components/ReactionBar.jsx` — Emoji reactions: `+` button flyout picker (live), counts-only (historical/readOnly)
- `src/components/RoleSwitcher.jsx` — Role dropdown for multi-role users (single-role shows static badge)

### Important Notes
- **Trigger disabled**: `on_auth_user_created` trigger was dropped. Profile creation is handled app-side via `create_profile` RPC.
- **Duplicate functions dropped**: Zero-param `log_audit()` trigger function and `audit_matches` trigger both dropped. Only the 5-param `log_audit` RPC should exist.
- **Match type**: "festival" renamed to "tournament" everywhere
- **Chrome translate popup**: Blocked via `translate="no"` + `notranslate` meta tag
- **Team color contrast**: `ensureContrastingColors()` auto-picks contrasting away color when teams share colors
- **Ball flip**: When field flips, ball position (left/right, top/bottom) mirrors in state
- **Sideline out**: Ball moves to zone where OUT was tapped
- **SAST timezone**: All `match_date`/`scheduled_time` display uses `parseSAST()`/`parseSASTDate()` with explicit `+02:00` offset. Never use bare `new Date(match_date)` for display.
- **Ranking badges**: Past matches use snapshotted `home_rank`/`home_prev_rank` columns. Upcoming/live use `fetchLatestRankings()` which returns a `teamId → {rank, prevRank}` map.
- **Multi-role**: `profiles.role` = active role (what app checks), `profiles.roles` = all assigned roles. RoleSwitcher changes `role` in React state only (not in DB). Persisted in sessionStorage across page refreshes.
- **Shot conversion**: Goals ÷ total shots (on + off target), not goals ÷ shots on target.
- **Audit logging**: All mutations in sync.js and auth.js are audit-logged via `logAudit()`. Fire-and-forget with error logging to console. Uses `log_audit` RPC (SECURITY DEFINER).

## TODO / Backlog

### High Priority — In Progress
- **Email setup (Resend + Afrihost)** — Configure `no-reply@kykie.net` via Resend (free, transactional) + `info@kykie.net` via Afrihost (mailbox). Resend SMTP plugs into Supabase Custom SMTP for auth emails (OTP, password reset, confirmation). Step-by-step guide in `kykie-email-setup-guide.md`. DNS records needed: SPF, DKIM, DMARC on Afrihost. No code changes — purely config.
- **Audit logging verification** — v7.4.0–7.4.2 added 16 audit actions. `match_schedule` was not confirmed working. Duplicate `log_audit()` trigger function was dropped. Needs re-test.

### Medium Priority
- **Public crowd-sourced results** — Allow public users (no login) to submit match scores via Quick Score. Matches created with `status: 'pending'`, `submitted_type: 'public'`. Admin/CommAdmin/Commentator see "Pending (N)" tab to review, edit, approve or reject. Approved matches get `status: 'ended'`, `approved_by` set to approver. Pending matches excluded from stats. New columns on `matches`: `submitted_by`, `submitted_type`, `approved_by`, `approved_at`. Same pattern for public team suggestions (`teams.status: 'pending'|'active'`). Estimated effort: ~1 full session (migration, public form, approval workflow, stats filtering, RLS for anonymous inserts). Requires email setup for public registration with OTP.
- **PDF export** — Match reports for coaches
- **Dashboard/analytics** — Aggregate stats across all teams (admin view)
- **Rankings UI** — Display SA school rankings as standalone page (ranking badges on match cards done in v7.1.0)
- **Push notifications** — Notify when matches go live
- **System health dashboard** — Admin screen showing table row counts, live match count, audit log growth, user activity distribution, estimated DB size vs 500MB free tier. Colour-coded thresholds (green/amber/red). Biggest growth risks: `match_events` (~50–200 rows per live match) and `audit_log` (16 actions logged). Consider 90-day audit prune. Small effort.
- **Match stats archival** — Pre-compute aggregated stats into `match_stats` table when match ends, allowing raw `match_events` to be pruned after 90 days. Currently all stats derived on-the-fly from events. Lifecycle: match ends → compute → store; coach screens read from `match_stats` with fallback to events. Medium effort. Implement before match_events exceeds ~50K rows.
- **Contributor reward system** — Gamified 3-tier system (Apprentice/Graduate/Veteran) with Takealot R100 vouchers. Credits: quick=1, live=5, approve=0.5 (Veteran only). Penalties: double credits for rejected submissions. Promotion: 20 approved quicks → Graduate; 4 live + 4 quick → Veteran. Demotion: negative credits or 12mo inactivity or <80% accuracy. Veterans can approve others' submissions (0.5cr each), but Admin can override with penalty to both submitter and approver. Depends on crowd-sourced results + public registration. Large effort (~1-2 sessions).
- **Live Score Lite mode** — Simplified live scoring: 5 event buttons per team (Goal, Attacking, Defending, Short Corner, Shot Saved) in rows. Single Pause button with popup. No field/zones. Events push to same `match_events` table. Viewers see live feed with emoji reactions. Can promote to Full Live within first 5 minutes (after that, too many events without zone data would skew stats). 3 contributor credits. Small-medium effort.
- **Embeddable widgets** — Iframe-based widgets for third-party sites (school websites, sports blogs). Routes: `#/embed/team/{slug}`, `#/embed/upcoming`, `#/embed/live`, `#/embed/results`. Stripped-down match cards with kykie branding + "Powered by kykie" footer. Click-through links to full kykie pages. No backend changes. Future: JSON API with rate limiting for developers. Small effort.
- **Sponsorship & advertising** — Brand partnerships as primary revenue. Three tiers: Match Sponsor (logo on scoreboard/feed, R500–2K/match), Team Sponsor (logo on team page, R5–15K/season), Platform Sponsor (landing page + all embeds, R50–150K/season). Admin CRUD for sponsors + logo rendering. ~R425K/season potential. Flat-fee model, no impression tracking needed. Future phase: CPM-based advertising with ad server. Small-medium effort for sponsorship; large for ads.

### Low Priority / Future
- **Voice recorder** — Audio commentary
- **Multi-sport** — Boys Hockey, Rugby, Netball, Cricket (sport dropdown ready, just needs data model extension)
- **localStorage phase-out** — Deprioritised: local-first pattern provides offline resilience for dodgy venue WiFi

### Strategic Vision: Multi-Age & Multi-Sport
Currently kykie covers **1st Team Girls Hockey only**. The roadmap:

**Phase 1 — Age groups (same sport, same events/UI):**
- U14, U16, 2nd Team Girls Hockey
- Data model: add `age_group` column to matches + teams (or a `division` table)
- Sport dropdown already exists on landing page — extend to age group filter
- Same events, same field recorder, same stats — just filtered views

**Phase 2 — Boys Hockey (same sport, same events/UI):**
- Identical to Girls but separate teams/matches
- Data model: add `gender` or extend `sport` to `girls_hockey` / `boys_hockey`
- Shared rankings? Or separate ranking sets per gender

**Phase 3 — Other sports (different events, different UI):**
- **Rugby**: Try, Conversion, Penalty, Drop Goal, Scrum, Lineout, Yellow/Red Card, Substitution. Field layout = rugby pitch with 22m lines. Stats = tackles, carries, territory, possession, lineout %, scrum %
- **Netball**: Goal, Centre Pass, Intercept, Penalty. Court layout = thirds. Stats = shooting %, interceptions, turnovers
- **Cricket**: Runs, Wicket, Over, Boundary (4/6), Wide, No Ball, Maiden. Scorecard layout. Stats = run rate, strike rate, economy, partnerships

**Architecture implications:**
- `sport_config` table or JSON: defines event types, field layout component, stat computation logic per sport
- FieldRecorder becomes sport-specific (HockeyField, RugbyField, NetballCourt, CricketScorecard)
- Stats engine (`stats.js`) needs sport-aware computation
- Live Score Lite works across all sports (just different button labels)
- Contributor rewards work across all sports (same credit system)
- Rankings may be sport + gender + age group specific

### Known Issues to Watch
- **Emoji reactions**: Were double-counting (fixed via ignoring own viewer in realtime handler). Watch for regressions.
- **Commentator live resume**: After refresh, commentator sees "Continue Recording" button. Timer state doesn't persist (starts from 0). Event seq also resets to 0 → duplicate seq numbers → sort order can break on public view. Fix: query `MAX(seq) FROM match_events WHERE match_id = ?` on resume and continue from there. Same for timer: could store `match_time` on the match row and restore on mount.
- **RLS complexity**: Multiple overlapping policies on profiles table. New features may need policy updates.
- **Stale triggers**: The `audit_matches` trigger and zero-param `log_audit()` function were both dropped. If either reappears, drop them: `DROP TRIGGER IF EXISTS audit_matches ON matches; DROP FUNCTION IF EXISTS log_audit() CASCADE;`
- **match_commentators RLS**: Needed `"Public read match_commentators"` SELECT policy for commentators to see all assignments. Run if missing: `DROP POLICY IF EXISTS "Public read match_commentators" ON match_commentators; CREATE POLICY "Public read match_commentators" ON match_commentators FOR SELECT USING (true);`

## File Structure
```
hockey-stats/
├── index.html                    # Source HTML (translate=no)
├── package.json                  # v7.6.0
├── vite.config.js
├── docs/                         # Built output (GitHub Pages)
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Router, auth, role switching, state management
│   ├── components/
│   │   ├── CoachOverall.jsx      # Season aggregated stats
│   │   ├── CoachTrends.jsx       # Weekly trend charts
│   │   ├── DPopup.jsx            # D-circle action popup
│   │   ├── EventLog.jsx          # Match event log
│   │   ├── FieldRecorder.jsx     # Hockey field recorder
│   │   ├── NavLogo.jsx           # Shared admin nav logo
│   │   ├── PausePopup.jsx        # Pause reason selector
│   │   ├── ReactionBar.jsx       # Emoji reaction (+flyout picker / readOnly)
│   │   ├── RankBadge.jsx         # Inline rank + trend badge
│   │   ├── MiniChart.jsx         # Shared SVG trend chart (compact + full)
│   │   ├── RoleSwitcher.jsx      # Multi-role dropdown switcher
│   │   ├── Scoreboard.jsx        # Match scoreboard
│   │   └── TeamPicker.jsx        # Team selection
│   ├── hooks/
│   │   ├── useAutoSave.js        # Auto-save to localStorage
│   │   ├── useMatchStore.js      # Local game storage
│   │   ├── useMatchTimer.js      # Match clock
│   │   └── useReactions.js       # Emoji reaction hook
│   ├── screens/                  # All screen components
│   └── utils/                    # Auth, sync, audit, stats, helpers
├── upgrade-scripts/
│   ├── baseline/                 # Original schema + pre-v7 migrations + README
│   ├── v7.1.0/                   # migration-prev-ranks.sql + README
│   ├── v7.2.0/                   # migration-ranking-date.sql + README
│   ├── v7.4.5/                   # migration-last-seen.sql + README
│   └── v7.6.0/                   # migration-multi-roles.sql + README
```

## Session Summary (v6.3.0 → v7.6.0)

### Phase 3 Features
- Coach-team assignment, coach dashboard, upcoming matches
- Cloud match review, emoji reactions, persistent viewer tracking
- PIN system removed, Supabase Auth for all roles

### UI/UX
- "kykie" branding (dropped ".net"), NavLogo on all admin screens
- Merged search + sport pill, sticky headers on landing + team pages
- Team color date badges (solid fill), commentary latest-first
- Sign in/out moved to top bar on all screens
- Refresh icon (SVG, spins) in team page header
- Active/Blocked user tabs

### Admin
- Start Live + Quick Score from Match Schedule screen
- Countdown to kickoff, search bar on matches
- Permission-based delete with audit logging
- SECURITY DEFINER functions for user CRUD

### Commentator
- Continue Recording button for live matches
- N+1 query fix (129 queries → 1)

### Field Recorder
- Sideline out moves ball to correct zone
- Ball position mirrors on field flip
- Team color contrast for same-color teams

### Data
- Rankings snapshot on match create/start/quick score
- Festival → Tournament rename with migration
- Audit log for all deletes

### v7.0.2 — SAST Timezone Fix
- Added `parseSAST(matchDate, scheduledTime)` and `parseSASTDate(matchDate)` helpers in `helpers.js`
- All `match_date` / `scheduled_time` display now parsed with explicit `+02:00` SAST offset
- Fixes: countdown timers, date badges, sort order for viewers outside SAST timezone
- Uses noon anchor (`T12:00:00+02:00`) for date-only parsing to prevent day rollover in any timezone
- Files changed: helpers.js, LandingPage, MatchScheduleScreen, TeamPage, CommentatorDashboard, CommentatorPage, CoachDashboard, CoachTrends
- localStorage phase-out deprioritised (offline resilience needed for dodgy venue WiFi)

### v7.1.0 — Ranking Badges on Match Cards
- New `RankBadge` component: inline rank with trend indicator (▲green improved, ▼red dropped, #amber unchanged)
- Format: `prevRank ▲ rank` (e.g. `6▲4`), unchanged shows `#7`
- Past matches use snapshotted `home_rank`/`away_rank` + new `home_prev_rank`/`away_prev_rank` columns
- Upcoming/live matches use latest rankings fetched via `fetchLatestRankings()` (2 ranking sets, one query, cached in state)
- Migration `migration-prev-ranks.sql`: adds `home_prev_rank`/`away_prev_rank` columns, updates `snapshot_match_rankings` to capture both current and previous positions
- Wired into all match card locations: LandingPage (Live/Upcoming/Results), TeamPage (upcoming/results/detail header), CommentatorDashboard (MatchCard/completed/quick score), MatchScheduleScreen (list/quick score), CommentatorPage (results)
- Team page shows opponent rank only; landing page shows both teams
- Zero performance impact on past matches (data already in `select *`), one extra query for upcoming

### v7.1.1 — Trends Chart Fix
- MiniChart value labels on all data points
- Ranking data sorted client-side (ascending by scraped_at) — fixes newest-left bug
- Chart height increased to accommodate value labels above dots

### v7.2.0 — Rankings Admin + Teams Tab Badges
- New `RankingsScreen` (admin only): list ranking sets, edit positions per team, add missing teams
- Migration `migration-ranking-date.sql`: adds `ranking_date` column to `ranking_sets`
- Rankings nav item on admin HomeScreen (🏆)
- Rank badges on Teams tab (LandingPage)
- Search + filter (All/Ranked/Unranked) on ranking editor
- Visual tags: green NEW for additions, amber CHANGED for edits

### v7.2.2 — Coach Insights Colour Restyle
- Fixed green/grey palette for CoachLiveScreen (HC=#22C55E, AC=#64748B)
- No team colours in coach insights — always green=home, grey=away
- Team names white, team abbreviations green/grey
- Insight icons: `+` (strength), `!` (weakness), `■` (info) — no emoji
- Left border accent on match insight cards
- Stat bars, territory/possession bars all green vs grey

### v7.3.0 — Coach Dashboard Tabs + Opposition Scouting
- CoachDashboard rewritten: Upcoming/Results tabs replace "View Stats →" link
- Results tab with W/D/L badges, opponent rank, scores, tap to view detail
- Opposition scouting panel on upcoming matches: form dots (last 5 W/D/L), GF:GA ratio
- Default tab auto-selects based on data availability
- Team name/icon still navigates to full team stats page

### v7.3.1 — Opposition Trend Charts
- Extracted `MiniChart` into shared component (`src/components/MiniChart.jsx`)
- `compact` prop for embedded use (smaller height, no card wrapper)
- CoachDashboard scouting panel now shows Ranking + GD MiniCharts per opponent
- Ranking history fetched in one batched query for all opponents
- Weekly GD computed client-side from existing match data
- Fallback: "No match history available" when no data exists
- Stale `audit_matches` trigger discovered and documented (must be dropped manually — see Known Issues)

### Known Issues to Watch (updated)
- **Stale `audit_matches` trigger**: A broken trigger on the `matches` table fires `log_audit()` which references columns that don't exist in `audit_log`. Must be manually dropped: `DROP TRIGGER audit_matches ON matches;`. App audit logging uses RPC functions, not this trigger.

### v7.3.2 — MiniChart Fixes + Upgrade Scripts
- Fixed value labels clipping at chart edges (first point left-aligned, last right-aligned)
- Flat data (all values identical) or single data point now shows header only, no chart
- Trend indicator hidden when unchanged (no more "— 0" display)
- Increased padding in compact mode
- Upgrade scripts organized into `upgrade-scripts/v7.1.0/` and `upgrade-scripts/v7.2.0/` with READMEs

### v7.3.3 — Shot Conversion Fix
- Shot → Goal conversion now uses goals ÷ total shots (on + off target) everywhere
- Fixed in CoachLiveScreen (match totals + quarter totals) and CoachOverall (season team + opponent)

### v7.3.4 — Emoji Reactions Redesign
- ReactionBar rewritten: only `+` button + emojis with existing counts visible
- Tap `+` → flyout picker with all 4 emojis, closes on outside tap
- `readOnly` prop for historical matches (counts only, no picker)
- Historical match detail in TeamPage passes `readOnly`

### v7.3.5 — Demo Match Dialog
- "End Demo?" title, "will not be saved" note, "End & Discard" button
- Demo matches were already fully ephemeral (no Supabase writes), UI now reflects this

### v7.4.0–7.4.2 — Comprehensive Audit Logging
- Rewrote `audit.js`: central `logAudit()` and `logAuditAs()` using `log_audit` RPC
- 16 actions logged: login, logout, login_failed, login_blocked, pin_login, pin_login_failed, user_create, user_update, user_block/unblock, password_reset, coach_assign/unassign, match_schedule, match_start_live, match_end, match_update, match_lock/unlock, commentator_assign, ranking_update
- All calls `await`ed in async functions for error visibility
- Dropped duplicate zero-param `log_audit()` trigger function and stale `audit_matches` trigger
- Details JSON sanitized via `JSON.parse(JSON.stringify(details))`

### v7.4.3 — Commentator Permissions
- Commentators see all scheduled matches (not just assigned)
- Can only act on: assigned-to-me OR unassigned (OPEN badge)
- Assigned-to-others shown at 60% opacity with "Assigned to another commentator" text
- Uses Supabase join on `match_commentators(commentator_id)` to avoid RLS issues

### v7.4.4 — Upcoming Performance (Public)
- Render cap: 20 upcoming cards, "Show more (N remaining)" button loads next 20
- Search filters full array in memory (still instant), only renders capped results
- Stopped polling upcoming every 10s — only poll live matches
- Reset showCount on search change/clear

### v7.4.5 — Last Seen Status
- Migration `migration-last-seen.sql`: adds `last_seen_at` column to profiles
- Stamped on successful login via fire-and-forget update
- Shown on user cards: green if <24h (minutes/hours), grey if older (days/months)

### v7.4.6–7.4.8 — Expandable Upcoming Cards
- Tap upcoming match → expands showing both teams with stats bar (P/W/D/L/GF/GA/GD)
- Each team button: avatar, name, rank badge, colour-coded stats, "View stats →"
- Teams with no matches show "No matches yet"
- teamRecords now tracks GF/GA alongside P/W/D/L
- TeamPage header shows "← kykie" as back button for public users

### v7.4.9–v7.5.0 — Commentator Dashboard Fixes
- **Black screen fixed**: `useState` for `tab` was after conditional `if (activeMatch) return` — React error #300 (hooks ordering). Moved all hooks to top.
- **ASSIGNED badge** (blue): matches assigned to other commentators
- **Greyed buttons**: Start Live + Quick Score always visible but disabled (dark bg, muted text) for non-actionable matches
- **Search bar** added to CommentatorDashboard
- **Show more** (20 limit) on MatchScheduleScreen and CommentatorDashboard
- Load rewritten: uses Supabase join `match_commentators(commentator_id, commentator:profiles!commentator_id(firstname, lastname))` — avoids separate query + RLS issue

### v7.5.1 — Assignee Names on Match Cards
- Assigned-to-me matches show green badge with full name (e.g. "Hennie Warnich")
- Assigned-to-others show blue badge with assignee name
- Unassigned still shows amber "OPEN"
- Multiple assignees comma-separated

### v7.6.0 — Multi-Role Users
- Migration `migration-multi-roles.sql`: adds `roles` text[] column to profiles, backfills from `role`, updates `create_profile` RPC
- New `RoleSwitcher` component: static badge for single-role, dropdown with `▾` for multi-role
- Dropdown shows all roles with colour dots, active role has ✓ checkmark
- Switching role: updates `currentUser.role` in React state, saves to sessionStorage, navigates to correct route
- Session restore checks sessionStorage for saved role, logout clears it
- Wired into HomeScreen, CommentatorDashboard, CoachDashboard headers
- UserManagementScreen: multi-select role buttons on create + edit (tap to toggle), ★ on primary
- User cards show multiple role badges
- Coach team assignments show when any role includes "coach"
- `createUser` and `updateProfile` save `roles` array alongside `role`

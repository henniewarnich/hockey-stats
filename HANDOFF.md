# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.9.66 | Date: 29 March 2026**

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
- **Never reuse a deployed version number** — always increment
- **Run `npm run build`** so `docs/` folder is updated
- Deliver as zip excluding `.git/` and `node_modules/`

---

## Architecture

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Crowd | `#/submit` | Submit results, upcoming matches, suggest teams (all pending approval) |
| Commentator | `#/record` | Dashboard with assigned matches, Live + Live Pro recording |
| Comm Admin | `#/admin` | Everything commentator + schedule, manage, approve pending |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, history, pending, health, what-if |

### Landing Page (`kykie.net`)
- 5 tabs for logged-in users: Dashboard / Live / Upcoming / Results / Teams
- Dashboard shows role-specific content (Admin cards, Coach teams, Crowd stats)
- Live tab includes: active live matches, in-progress upcoming, pending crowd scores
- Quick score entry: logged-in users can tap "Awaiting score" cards to enter scores
- Crowd submissions go to pending; Admin/Commentator saves directly as ended
- Prediction on Upcoming: "Team to win" or "Draw" with probability bar (no score prediction)
- RankBadge on Landing Page shows `#rank` only (no prev_rank arrows)

### Live Match Recording
- **Live Mode Chooser** popup on every "Start Live" action
- **Live** (LiveLiteScreen): 5 tap events per team (Goal, Attacking, Defending, Short Corner, Shot Saved)
- **Live Pro** (LiveMatchScreen): Full field recorder with zones, positions, detailed events including Dead Ball
- Switch between modes within first 5 minutes
- Both write to same `match_events` table

### Admin Features
- **What-If Match** (`WhatIfScreen`): Pick any two teams, see prediction + scouting cards. Read-only, no DB writes.
- **System Health**: DB size, row counts, user activity, backfill archives
- **Pending Approvals**: Approve/reject crowd-submitted scores and teams
- **Maintenance mode**: `site_settings` table, fallback SQL: `UPDATE site_settings SET value = 'false' WHERE key = 'maintenance_mode'`

### Coach Features
- **Overall tab**: Conversion funnel + per-match averages across all recorded matches
- **Matches tab**: Individual match stats with conversion rates, zone control, insights
- **Trends tab**: Per-match trend charts with 5-game moving average, tap for opponent tooltip
- **Single-team skip**: Coaches with 1 team auto-navigate to team page (once per session via sessionStorage flag `kykie-coach-visited`)

---

## Stats Reference — How Everything is Calculated

### Event Types (Live Pro — Field Recorder)
Events are logged to `match_events` with: `team` (home/away/commentary/meta), `event`, `zone`, `detail`, `match_time` (seconds), `seq`.

| Event | Logged when | Zone recorded |
|-------|------------|---------------|
| `Start` | Match/quarter starts | Centre |
| `Ball in play` | Ball enters a zone | Yes |
| `Ball forward` | Ball moves toward opponent goal | Yes |
| `Ball back` | Ball moves toward own goal | Yes |
| `D Entry` | Ball enters the D (shooting circle) | Yes (always Opp Quarter variant) |
| `Shot on Goal` | Shot that would score without keeper | Yes |
| `Shot Off Target` | Shot that misses the goal frame | Yes |
| `Goal!` | Goal scored (open play) | Yes |
| `Goal! (SC)` | Goal scored from a short corner sequence | Yes |
| `Short Corner` | Short corner awarded | Yes |
| `Long Corner` | Long corner awarded | Yes |
| `Turnover Won` | Team wins possession | Yes |
| `Poss Conceded` | Team loses possession | Yes |
| `Sideline Out (...)` | Ball goes out on the side | Yes |
| `Dead Ball` | Play stops in the D (e.g. ball trapped, foul) | Yes |
| `Pause` | Match paused (meta event with reason) | — |

### Zone Labels — CRITICAL: Home Team Perspective
**All zone labels are stored from the home team's perspective. This never changes regardless of which team has the ball.**

| Zone label | Physical location |
|------------|------------------|
| `Opp Quarter (left/centre/right)` | Near the **away** team's goal |
| `Opp Midfield (left/centre/right)` | Between centre and away goal |
| `Own Midfield (left/centre/right)` | Between centre and home goal |
| `Own Quarter (left/centre/right)` | Near the **home** team's goal |
| `Centre` | Centre of the field |
| `{Team Name} D` | Inside the D (shooting circle) |

**Mapping zones to Attack/Midfield/Defense per team:**

| Zone label | Home team | Away team |
|------------|-----------|-----------|
| Opp Quarter | **Attack** (near opponent goal) | **Defense** (near own goal) |
| Opp Midfield | Attack half | Defense half |
| Own Midfield | Defense half | Attack half |
| Own Quarter | **Defense** (near own goal) | **Attack** (near opponent goal) |

**This inversion is critical.** When away team has ball in "Opp Quarter", they are defending (it's near their own goal). Code must flip the mapping for away team.

### Goal! (SC) — Short Corner Goal Detection
The field recorder automatically detects goals from short corners:
1. Finds the last `Short Corner` event for the attacking team
2. Checks events between the SC and the goal
3. If no `Start`, `Goal!`, or `Turnover Won` (by defending team) interrupts the sequence → logs as `Goal! (SC)`
4. The ball may leave the D briefly during the SC routine (back to defence zone then into D) — this is normal and does NOT break the sequence

### Conversion Funnel
The coach view shows a conversion funnel with these metrics:

| Metric | Formula | What it means |
|--------|---------|---------------|
| **Attack → D** | `dEntries / atkZoneEntries × 100` | Of attacks entering opp quarter, how many reached the D |
| **D → Short Crnr** | `shortCorners / dEntries × 100` | Of D entries, how many resulted in a short corner |
| **SC → Goal** | `scGoals / shortCorners × 100` | Short corner conversion rate (uses `Goal! (SC)` events) |
| **Shots taken** | `(shotsOn + shotsOff) / dEntries × 100` | Of D entries, how many resulted in shots |
| **On target** | `shotsOn / (shotsOn + shotsOff) × 100` | Shot accuracy |
| **Goals** | `goals / shotsOn × 100` | Finishing rate (goals per shot on target) |

**Notes:**
- Attack → D may exceed 100% if D entries come from set pieces (free hits) that don't transit through the attack zone.
- Attack → D row is hidden when `atkZoneEntries = 0` (no zone data available for that match/period).
- SC → Goal is shown in purple to visually separate the set-piece branch from open play.
- Off target was removed (always inverse of On target — redundant).
- Stats Comparison was removed (duplicated conversion funnel data).

### Time-Based Possession
**Answers: "What percentage of total playing time did this team have the ball?"**

Method:
1. Filter events with `team` in (home, away) AND has a `zone`
2. Sort by `match_time`
3. For each consecutive pair of events, compute `duration = next.time - current.time`
4. **Skip if `duration <= 0` or `duration > 300`** (5 minutes — eliminates quarter breaks, half time, long pauses)
5. Attribute `duration` to the current event's team
6. `possession_time_pct = team_ball_time / (home_ball_time + away_ball_time) × 100`

### Time-Based Territory
**Answers: "Of the time this team had the ball, what % was in the opposition half?"**

Using the same time gaps from possession calculation:
- For **home** team: time in `Opp Quarter` + `Opp Midfield` zones / home's total ball time × 100
- For **away** team: time in `Own Quarter` + `Own Midfield` zones / away's total ball time × 100

The inversion for away is because zones are always from home perspective:
- Home's "Opp Quarter" = near away goal = home attacking = home's opposition half ✓
- Away's "Own Quarter" = near home goal = away attacking = away's opposition half ✓

### Zone Control Display (Coach Match Totals)
Shows two side-by-side bars per zone (Attack/Midfield/Defense). Each bar represents that team's time distribution — each team's bars sum to 100%.

| Zone | Home time in | Away time in |
|------|-------------|-------------|
| Attack | Opp Quarter zones | Own Quarter zones |
| Midfield | Opp Midfield + Own Midfield | Opp Midfield + Own Midfield |
| Defense | Own Quarter zones | Opp Quarter zones |

This tells the coach "where did my team spend their time?" — e.g. 26% Attack, 68% Midfield, 6% Defense.

### Stats Computation — `computeStats(events, team, startTime, endTime)`
Located in `src/utils/stats.js`. Returns:
```javascript
{
  goals,           // events starting with "Goal!"
  scGoals,         // events matching "Goal! (SC)"
  dEntries,        // "D Entry" events
  atkZoneEntries,  // events where zone includes "Opp Quarter"
  shotsOn,         // "Shot on Goal"
  shotsOff,        // "Shot Off Target"
  shortCorners,    // "Short Corner"
  longCorners,     // "Long Corner"
  turnoversWon,    // "Turnover Won"
  possLost,        // "Poss Conceded" or starts with "Sideline Out"
  territory        // event-count based: team events / total events × 100 (legacy fallback)
}
```

### Coach Trends — 5 Per-Match Charts
Each chart shows individual match dots (semi-transparent) + 5-match moving average trend line.

| Chart | Colour | Data source |
|-------|--------|-------------|
| Attack → D Entry | Green | `dEntries / atkZoneEntries` per match |
| D Entry → Short Corner | Purple | `shortCorners / dEntries` per match |
| Short Corner → Goal | Amber | `scGoals / shortCorners` per match |
| Possession % | Blue | `possession_time_pct` from archive (fallback: event-count territory) |
| Territory % | Green | `territory_time_pct` from archive (fallback: event-count territory) |

Features:
- Tap/click any dot → tooltip shows opponent name + value + date
- Y-axis: adaptive grid step sizes (5/10/25 depending on range)
- X-axis: adaptive label intervals based on match count
- Summary bar: overall avg + last 5 avg with ↑↓→ trend arrow

### Prediction — `predictMatch()` in predict.js
Requires both teams to have ≥5 matches. Returns win/draw/loss probabilities + reasons.
- Win/draw/loss: blends home win rate with away loss rate (and vice versa), normalised to 100%
- Reasons: compares attack rates, defence rates, draw tendencies, GD, win rates
- Display: "Team to win" or "Draw" (amber), probability bar, up to 3 insight lines
- Score prediction computed internally but NOT displayed (removed for honesty)

---

## Match Stats Archive Pipeline

### `match_stats` Table Schema
```sql
match_id UUID, team TEXT ('home'|'away'), quarter INT (0=totals, 1-4=per quarter),
goals INT, sc_goals INT, shots_on INT, shots_off INT,
d_entries INT, atk_zone_entries INT, short_corners INT, long_corners INT,
turnovers_won INT, poss_lost INT,
territory_pct INT,           -- event-count based (legacy)
possession_time_pct INT,     -- time-based possession %
territory_time_pct INT       -- time-based territory %
```
Unique constraint: `match_stats_unique (match_id, team, quarter)`

### Archive Process (`archiveMatchStats` in sync.js)
1. Fetches match metadata (break_format, match_length, duration)
2. Fetches all `match_events` for the match (team, event, match_time, detail, zone)
3. Computes event-count stats via `computeStats()` for totals + per-quarter
4. Computes time-based possession and territory from zone event gaps
5. Upserts rows to `match_stats` (on conflict: match_id, team, quarter)
6. Sets `matches.stats_archived = true`

### Backfill
- System Health → "Backfill Archives" button
- Re-archives all matches where `stats_archived = false`
- Safe to run multiple times (upserts on unique constraint)
- Requires raw `match_events` to still exist
- To force full recompute: `UPDATE matches SET stats_archived = false WHERE stats_archived = true;`

### Reading Archive — `statsFromArchive(rows, teamId, homeTeamId)`
Converts `match_stats` rows to same format as `computeMatchStats()`:
```javascript
{
  team: { goals, scGoals, dEntries, atkZoneEntries, shotsOn, shotsOff,
          shortCorners, longCorners, turnoversWon, possLost,
          territory, possessionTimePct, territoryTimePct },
  opp: { ... },
  teamSide, oppSide
}
```

### `aggregateStats(matchStatsList)`
Sums all counting stats across matches. Averages territory/possession time percentages only from matches that have time-based data (graceful null handling for older archives).

---

## Supabase Tables
- `teams` — name, color, status ('active'|'pending'), suggested_by
- `matches` — home/away IDs, scores, status, date, venue, match_type, created_by, submitted_by, submitted_type, approved_by, approved_at, home_rank, away_rank, locked_by, stats_archived
- `match_events` — team, event, zone, detail, match_time, seq, match_id
- `match_stats` — pre-computed archive (see schema above)
- `profiles` — user data, role, roles[], blocked, extra fields
- `coach_teams` — Coach-to-team assignments
- `match_commentators` — Commentator-to-match assignments
- `event_reactions` — Emoji reactions
- `match_viewers` — Persistent viewer tracking
- `ranking_sets` / `rankings` — Team rankings with snapshots
- `sponsors` — Sponsor placements (match/team/platform tiers)
- `sponsor_impressions` / `sponsor_clicks` — Tracking
- `issues` — User-reported issues
- `contributor_stats` — Tier, credits, submission counts
- `credit_ledger` — Credit transaction history
- `site_settings` — Key-value config (maintenance_mode, etc.)
- `audit_log` — All actions logged

## Key Patterns & Learnings
- **Zone perspective rule**: Zone labels are ALWAYS from home team's perspective. Away team zone mappings must be inverted.
- **Supabase `$$` delimiter**: Use `$fn$` instead — Supabase SQL editor appends comments that break `$$`.
- **Supabase Auth `signUp` side effect**: Calling `signUp` logs in as the new user. Save and restore admin session around user creation.
- **RLS `FOR ALL` conflict**: Must split into separate INSERT/UPDATE/DELETE policies.
- **React hooks ordering**: Never `useState` after conditional return — causes error #300.
- **Component inside render**: Causes input focus loss. Always define components outside.
- **N+1 queries**: Watch for list screens loading per-item. Use joins.
- **Orphan match bug**: `createLiveMatch` creates DB row; `saveMatchToSupabase` must UPDATE (not INSERT) if `supabase_id` exists.
- **Rankings snapshots**: Each match stores both teams' ranks at creation time.
- **Coach single-team loop**: Fixed with `sessionStorage.getItem('kykie-coach-visited')` flag.
- **Stale locks**: `endLiveMatch` clears `locked_by`. One-time cleanup: `UPDATE matches SET locked_by = NULL WHERE status = 'ended' AND locked_by IS NOT NULL;`

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
upgrade-scripts/v7.9.12/         — match_stats table + stats_archived column
upgrade-scripts/v7.9.13/         — sponsors table + storage bucket + impression/click tracking
upgrade-scripts/v7.9.28/         — issues table
upgrade-scripts/v7.9.34/         — contributor_stats + credit_ledger tables
upgrade-scripts/v7.9.35/         — site_settings table
upgrade-scripts/v7.9.55/         — atk_zone_entries column on match_stats
upgrade-scripts/v7.9.62/         — sc_goals column on match_stats
upgrade-scripts/v7.9.64/         — possession_time_pct + territory_time_pct on match_stats
```

After running migrations: System Health → Backfill Archives to recompute all matches.
Unique constraint required: `match_stats_unique UNIQUE (match_id, team, quarter)`

## Known Issues
- **Commentator timer resume**: After refresh, timer starts from 0 (eventSeqRef also resets)
- **RLS complexity**: Multiple overlapping policies — new features may need policy updates
- **Attack → D > 100%**: D entries from set pieces (free hits) may not transit attack zone
- **Spam folder**: Resend emails may land in spam initially; DMARC helps over time

## Interpreting a Match JSON
When given a match JSON export, the key fields are:
- `events[]`: Array of `{ team, event, zone, time (seconds), detail, seq }`
- `teams.home/away`: `{ name, color }`
- `homeScore`, `awayScore`, `duration`
- `breakFormat`: 'quarters' or 'halves'
- `matchLength`: nominal match length in minutes

To analyse a match from its JSON:
1. Filter events where `team` is 'home' or 'away' (skip 'commentary' and 'meta')
2. Count event types per team for the conversion funnel
3. For time-based stats, sort by `time` and measure gaps between consecutive events (skip gaps > 300s)
4. **Remember: zone labels are from home perspective — invert for away team**
5. `Goal! (SC)` events = goals from short corners (already detected by the recorder)
6. For zone control: Attack = Opp Quarter (home) / Own Quarter (away), Midfield = both Mid zones, Defense = Own Quarter (home) / Opp Quarter (away)

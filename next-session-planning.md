# kykie.net — Next Session Planning
**Date: 30 March 2026 | Current Version: 7.10.14**

## Immediate TODO

### 1. Pending Migration
```sql
-- If not already run:
ALTER TABLE teams ADD COLUMN IF NOT EXISTS variant TEXT;
```

### 2. Remaining Institution Tasks
- `suggestTeam()` — crowd team suggestion needs institution creation flow
- `App.jsx getTeamShareLink` — receives name string, should receive team object

---

## Planned Features

### Public View
- Screen viewer (similar to commentary feed — CT-style)
- Add outcome predictor (fake users Pistol Pete + Suzi Snow + Kykie AI already exist, wire up to public view)

### Match Setup
- Add **Season** field (derive from match date year, e.g. "2026")
- Add **Tournament** selection (create/pick tournament, link matches)

### Coach
- Stats screen: filter by **Season** and **Tournament**
- **Compare to team** — side-by-side stats vs selected opponent
- **Compare to benchmark** — compare stats vs top 10 ranked teams' averages
- **Replay match** — graphical play-by-play replay from events (animated field)
- **Analyse team** — Exit strategy, Attack strategy, Midfield play (heatmaps + flow analysis)

### Commentator
- Add **cards** (Green card + Yellow card events)
- Revisit D-Zone stats collector (improve flow/UX)
- Add **penalties** (penalty stroke events)
- Clarify **goalie saves** — must be clear which shots the goalie saved vs missed
- **Overheads** — how to record (hard press on zone? reclassify toast?)
- **Match abandoned** (lightning/weather stoppage)
- **Penalty shootout** score recording

### Admin
- **Stats interpretation skill (MD)** — export match data for further analysis by Claude AI

### Prediction Scoring on Match End
Auto-score predictions when match ends (currently only via Retrofit).

### Reclassify Toast (Mockup Ready)
After zone tap: "↑ Overhead" toast for 3 seconds. After turnover: "🏑 Free Hit" toast.

### Possession Heatmap (Coach View)
4×3 grid showing time in possession per zone. Verified with real match data.

### Exit Strategy Analysis (Coach View)
Tracks ball from defense → opposition half. 4×3 heatmap of transit zones.

### D Entry Direction (Coach View)
Which side teams approach the D from (left/centre/right).

### Staging Environment
Second Supabase project + test.kykie.net subdomain.

### Embeddable Widgets
Iframe embeds for school websites.

### Organisation → Team Hierarchy
Now partially done via institutions. Full org hierarchy enables multi-sport, multi-age, org-level subscriptions.

---

## Architecture Notes

### Institution Display Rules
- `teamDerivedName(team)` = gender + sport + age_group (or variant if set, replacing age_group)
- `teamDisplayName(team)` = institution short_name/name + derived (auto-dedupes gender)
- `teamShortName(team)` = institution.short_name || institution.name
- `teamColor(team)` = institution.color || team.color
- `teamSlug(team)` = slug of institution.name (used for URLs)
- `teamMatchesSearch(team, query)` = searches institution.name + short_name + other_names + derived name + team_description
- All query constants in `src/utils/teams.js`: `TEAM_SELECT`, `MATCH_HOME_TEAM`, `MATCH_AWAY_TEAM`, etc.
- `MatchCardTeams` component: two-line display (institution names + rank on line 1, derived + meta on line 2)
- `FilterBar` component: cycling pills for Sport/Gender/Age across all landing page tabs

### Stats Engine
- ONE button (Recompute All Stats) rebuilds everything from raw events
- `archiveMatchStats` is idempotent: delete + insert, returns `{ ok, reason }`
- Events fetched per match with `.limit(5000)` (never batch)

### Prediction Engine
- `predictMatch()` in predict.js: V2 model with draw boost (0.5 multiplier)
- Fallback to ranking-based when <5 games
- `retrofitPredictions()` in sync.js: builds progressive records chronologically
- Kykie (user_id=null), Pete, Suzi all predict every match

### RLS Rules
- NEVER use `FOR ALL` policies alongside public SELECT
- Always split into separate INSERT/UPDATE/DELETE policies
- `institutions`: public SELECT + auth INSERT/UPDATE/DELETE

---

## Files to Provide to Next Session
1. **`hockey-stats-v7.10.14.zip`** — Full source + built docs/
2. **`HANDOFF.md`** (inside zip) — Complete project state
3. **This file** (`next-session-planning.md`) — Context and plans

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats

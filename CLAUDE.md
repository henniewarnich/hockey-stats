# Kykie — Live School Sport Stats & Analytics

## Communication style
Hennie is a product owner with strong product intuition and limited coding experience. Tailor responses accordingly:
- Lead with **what this means for him** in plain English. Save the technical detail for when he asks.
- Skip filenames and line numbers in conversational answers — he can't usefully click them. They belong in PRs and code reviews, not chat.
- When investigating something, **summarise the finding in 1–2 sentences he can act on**, then offer "want the technical detail?" as a follow-up.
- Match the tone of the Claude.ai project: brief, direct, no walls of code unless he asks.
- If a decision is non-obvious, give him the choice in product terms (impact, tradeoff) — not implementation terms.

## Stack
- React 18 + Vite, hash routing, builds to `docs/` folder
- Supabase backend (env-switched: `.env.production` for live, `.env.development` for staging)
- GitHub Pages hosting at kykie.net, Afrihost DNS
- Email: Resend transactional via `no-reply@kykie.net`

## Critical Rules
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json` before building
- **Build command:** `npm run build` (outputs to `docs/`)
- **Dev server:** `npm run dev` (uses `.env.development` = staging DB)
- **Production build:** `npm run build` (uses `.env.production` = live DB)
- Supabase SQL editor: use `$fn$` delimiter instead of `$$`
- Never reuse a deployed version number

## Key Files
- `src/utils/constants.js` — APP_VERSION
- `src/utils/supabase.js` — Supabase client (reads from env vars)
- `src/utils/teams.js` — team display helpers (teamShortName, teamDisplayName)
- `src/utils/credits.js` — tier logic, FREE_PLUS_THRESHOLD
- `src/utils/styles.js` — S and theme objects
- `src/utils/auth.js` — authentication, profile management, coach_teams
- `src/App.jsx` — routing, auth state, role switching
- `.env.production` — live Supabase credentials
- `.env.development` — staging Supabase credentials (gitignored)

## Conventions
- Team names: always use `teamShortName()` or `teamDisplayName()` from teams.js
- Teams query: always `.or('status.eq.active,status.is.null')`
- Admin screens: use `AdminBackBar` component for back navigation
- Role switching: `sessionStorage.setItem('kykie-active-role', role)` + `window.location.reload()`
- Logo PNGs in `public/` folder (Vite copies to `docs/` on build)
- CNAME file in `public/` (survives builds for GitHub Pages)
- Audit logging: `logAudit()` from `src/utils/audit.js`

## Build & Deploy (BBZ)
1. Bump version in `constants.js` + `package.json`
2. `npm run build`
3. `git add -A && git commit -m "v7.x.x — description" && git push`

## Supabase
- Production: belveuygzinoipiwanwb.supabase.co
- Staging: (see .env.development)
- Migrations in `upgrade-scripts/` with version-specific subfolders
- RLS policies: split INSERT/UPDATE/DELETE — never use FOR ALL with public SELECT

## Reports
- `match_reports` table stores HTML reports linked to matches
- `coach-only` CSS class gates tactical content (supporters see teaser, coaches see full)
- Reports rendered in sandboxed iframe in ReportScreen.jsx

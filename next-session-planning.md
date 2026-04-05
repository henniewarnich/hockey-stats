# kykie.net — Next Session Planning
**Date: 5 April 2026 | Current Version: 7.14.1**

## Immediate Actions (Before Next Coding Session)

### 1. Deploy v7.14.1
- Push to GitHub, verify on kykie.net

### 2. Run Pending Migrations
```sql
-- 1. Training/benchmark columns (v7.13.0)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS benchmark_score NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS benchmark_passed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_progress JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commentator_status TEXT;

-- Set existing commentators to qualified
UPDATE profiles SET commentator_status = 'qualified'
WHERE role IN ('commentator', 'commentator_admin') AND commentator_status IS NULL;

-- 2. User devices table (v7.14.0)
-- Run full script: upgrade-scripts/v7.14.0/migration-user-devices.sql
```

### 3. Configure Supabase Email Template for OTP
- Supabase Dashboard → Auth → Email Templates → Confirm signup
- Add `{{ .Token }}` to show OTP code in email body

### 4. Test Password Change
- Log in → tap 🔒 → Password tab → change password

### 5. Test Device Security
- Log in on 2 devices (phone + desktop) — should register silently
- Try a 3rd device — should trigger OTP verification screen

### 6. Test Apprentice Flow
```sql
-- Reset a test user to trainee:
UPDATE profiles SET commentator_status = 'trainee',
  benchmark_score = NULL, benchmark_passed_at = NULL
WHERE email = 'chris.comey@gmail.com';
```
- Clear localStorage `kykie-training-steps` and `kykie-training-practices`
- Walk through: training → benchmark (use backdoor: double-click header, enter day of month)
- Verify apprentice dashboard: status banner, no schedule button, Top 10 filtered, penalty hidden
- Do 1 live + 1 recorded → should auto-promote to qualified

---

## Completed (This Session — 5 April 2026)

### Commercialisation Step 2: Training + Benchmark ✅
- 14-step animated training wizard
- 37-step interactive benchmark test (match narrative with drag, SC sequence, team popup)
- Trainee gating (5 redirect points)
- OTP registration replacing email links

### Commentator Progression System ✅
- Three tiers: trainee → apprentice → qualified
- CommDashboardPanel with status banners and auto-promote
- Apprentice restrictions: no scheduling, no Top 10 matches, no penalties, credits at zero
- MatchScheduleScreen: disabled scheduling + Top 10 lock + no edit
- HistoryScreen: Top 10 filtered + no penalty button

### Credits Statement Screen ✅
- Balance, progression, match history with credit values
- Three display states (apprentice/qualifying/earning)

### Password Change + Device Security ✅
- SecurityScreen with password change + device management
- DeviceVerification OTP flow for 3rd device
- Device tracking in user_devices table

### AI Scout Research ✅
- 3 metrics validated (accuracy, speed, patience)
- Team profiles and scouting reports tested
- Positional analysis methodology proven
- Added to commercialisation-strategy.md

---

## Planned Features (Next Sessions)

### Priority 1: Credit System Activation
**Goal**: Wire `credit_ledger` to actual match events so credits accrue.

**Changes needed:**
- After match ends (Live Pro/Lite/Video Review), call `adjustCredits()` from `credits.js`
- Determine credit amount based on match type (Live Pro=50, Video=20, Lite=10, Quick=1)
- Only accrue for qualified commentators with 5+ total matches
- CreditsScreen reads from `credit_ledger` instead of calculating from audit_log
- Admin: voucher management screen (mark vouchers as sent)

**Depends on:** All v7.14.1 migrations applied and tested.

### Priority 2: Device Security Hardening
Additional anti-gaming measures:
- Same-IP detection: flag when 2 accounts earn credits from same IP
- Credit velocity caps: max 5 live / 10 quick per day per user
- Voucher claim cooldown: 14 days between claims
- Phone number required before first voucher claim
- Admin dashboard flags: device swaps, IP overlap, velocity anomalies

### Priority 3: AI Scout Dashboard
**Goal**: Premium feature — Claude API generates tactical briefing from match data.

**Implementation:**
- Coach taps "Scout Report" on opponent team page
- Frontend sends structured match data (events, stats, zone patterns) to Claude API
- Claude returns tactical narrative: strengths, weaknesses, how to beat them
- Rendered as formatted report card
- Premium tier only (R5,000/team/year)

### Priority 4: Staging Environment
- Second Supabase project for test.kykie.net
- Separate GitHub Pages deployment
- Isolated data for testing without affecting production

---

## Commercialisation Roadmap Status

| Step | Status | Version |
|------|--------|---------|
| 1. Registration revamp | ✅ Done | v7.12.5-v7.12.11 |
| 2. Training + benchmark test | ✅ Done | v7.13.0-v7.13.18 |
| 2b. Apprentice progression | ✅ Done | v7.13.19-v7.14.1 |
| 2c. Credits statement screen | ✅ Done | v7.13.22 |
| 2d. Password + device security | ✅ Done | v7.14.0-v7.14.1 |
| 3. Credit system activation | 🔲 Next | — |
| 4. Team credits + tiers | 🔲 Planned | — |
| 5. Coach dashboard progress | 🔲 Planned | — |
| 6. Feature gating (Free/Plus/Premium) | 🔲 Planned | — |
| 7. Share-to-earn | 🔲 Planned | — |
| 8. Sponsor integration | 🔲 Planned | — |
| 9. AI Scout (Premium) | 🔲 Research done | — |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/screens/TrainingScreen.jsx` | Trainee training flow (learn + practice + benchmark) |
| `src/components/TrainingWizard.jsx` | 14-step animated field tutorial |
| `src/components/BenchmarkTest.jsx` | 37-step match narrative test |
| `src/components/CommDashboardPanel.jsx` | Commentator dashboard with progression |
| `src/screens/CreditsScreen.jsx` | Credit statement screen |
| `src/screens/SecurityScreen.jsx` | Password change + device management |
| `src/components/DeviceVerification.jsx` | OTP verification for 3rd device |
| `src/utils/devices.js` | Device ID, check, replace, list |
| `src/utils/benchmark.js` | saveBenchmarkResult (sets apprentice) |
| `src/utils/credits.js` | Credit rules (dormant, ready to activate) |
| `commercialisation-strategy.md` | Full business strategy doc |

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats

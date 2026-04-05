# kykie.net — Next Session Planning
**Date: 4 April 2026 | Current Version: 7.13.4**

## Pending Migration
```sql
-- Run for v7.13.0+:
-- upgrade-scripts/v7.13.0/migration-training-benchmark.sql
-- Also fix duplicate RPC (see session notes): drop all register_crowd_profile, recreate single version
-- Also ensure profile columns exist: supporting_institution_ids, notify_*, commentator_status, accepted_terms_at
```

## Completed This Session
- ✅ Registration OTP (replaces email link) — needs Supabase email template update with `{{ .Token }}`
- ✅ 13-step animated training wizard (TrainingWizard.jsx) — Live Pro field layout with animations
- ✅ TrainingScreen with Learn → Practice → Benchmark flow
- ✅ Trainee gating (commentator trainees redirected to #/training)
- ✅ Benchmark comparison engine (src/utils/benchmark.js)
- ✅ Kykie AI Scout research — 3 metrics validated, scouting reports tested

## Immediate Next: Commercialisation Step 3

### Personal Credit System + Voucher Management
Reactivate dormant `credits.js` with new credit values from commercialisation strategy:
- Live Pro: 50 credits, Same-day video: 30, Older video: 20, Live Basic: 10, Score: 1, Schedule: 1
- Penalty: -1.5x earned for rejected submissions
- Voucher threshold: 100 credits = R100 Takealot voucher
- Wire into match completion flows (endLiveMatch, quick score approval, video review save)
- Contributor dashboard showing credits, history, voucher status

### Team Credit System + Tier Unlocks
- Per-match maintenance cost: 100 credits
- Credit sources: commentator activity + viewer count
- Free / Free Plus (100+ credits) / Premium (R5,000)
- Coach dashboard progress bar

## Commercialisation Implementation Priority
(from commercialisation-strategy.md)

1. ~~Registration revamp~~ Done (v7.12.5-v7.12.11)
2. ~~Commentator training + benchmark test~~ Done (v7.13.0-v7.13.4)
3. **Personal credit system + voucher management** <- NEXT
4. Team credit system + tier unlocks
5. Coach dashboard progress bar + credit breakdown
6. Feature gating (Free / Free Plus / Premium)
7. Share-to-earn + WhatsApp share
8. Sponsor integration with viewer metrics
9. Kykie AI Scout (Premium) — research done, ready to build
10. Device security + anti-gaming — device tracking, OTP on new device, velocity caps

## Other TODO (Parked)

High:
1. Prediction auto-scoring on match end
2. Video review playback speed (1x / 1.5x / 2x)
3. Wire outcome predictor to public view

Medium:
1. Coach benchmark TOP10 bug — filter by sport/gender/age_group
2. Stats interpretation skill (MD) for Claude analysis
3. Staging environment (test.kykie.net)
4. Kykie AI Scout build: `computeTeamIntelligence()` → coach dashboard card → Claude API scouting report
5. Device security: `user_devices` table, 2-device limit, OTP on 3rd device, concurrent session flags

Low:
1. Screen viewer (CT-style commentary feed)
2. Season + Tournament fields on matches
3. Filter stats by Season and Tournament
4. Replay match (animated field play-by-play)
5. Goalie saves — clarify saved vs missed
6. Embeddable widgets for school websites

## Key Architecture Notes

### Registration Flow (v7.12.11)
- Email checked first (on blur) → blocks if exists, offers forgot password
- Step 1: Email → Name → Username (auto) → Password
- Step 2: Alias (defaults to firstname) → Role picker (Supporter/Commentator/Coach) → Sport (commentator/coach) → Institutions (max 4) → Teams (coach, checkboxes) → DOB/Gender → Sports I Follow (supporter) → Notifications → T&C → Create

### Data Model Changes
- `profiles.role`: 'supporter' | 'commentator' | 'coach' | 'admin' | 'commentator_admin'
- `profiles.supporting_institution_ids[]`: replaces old supporting_team_ids
- `profiles.commentator_status`: NULL | 'trainee' | 'qualified'
- `profiles.notify_live`, `notify_rewards`, `notify_general`: boolean
- `profiles.accepted_terms_at`: timestamptz
- `institutions.domain`: for future coach email vetting

### Crowd Suggest Team (v7.12.2)
- CrowdSubmitScreen suggest flow now picks institution or suggests new one
- Selects sport/gender/age with pills
- Checks for duplicate (same institution + sport + gender + age_group)
- suggestTeam() in sync.js creates institution if needed, then pending team

## Files to Provide
1. **hockey-stats-v7.13.4.zip** — Full source + built docs/
2. **HANDOFF.md** — Complete project state
3. **This file** (next-session-planning.md)
4. **commercialisation-strategy.md** — Full commercialisation plan incl. AI Scout (Section 8)

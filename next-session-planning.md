# kykie.net — Next Session Planning
**Date: 4 April 2026 | Current Version: 7.12.11**

## Pending Migration
```sql
-- Run before deploying v7.12.5+:
-- upgrade-scripts/v7.12.0/migration-institution-domain.sql
-- upgrade-scripts/v7.12.5/migration-supporter-rename.sql
```

## Immediate Next: Commercialisation Step 2

### Commentator Training Screen (`#/training`)
Build a full-screen interactive training wizard that replicates the Live Pro field recorder exactly.

**13 steps with animations:**
1. Start match — show demo teams, select one, ball changes colour
2. Passing — ball moves to centre of zones as in Live Pro
3. Turnover — tap ball with halo effect, possession flips
4. Overhead — show hand icon + "Overhead" label, drag animation
5. Out — ball moves to OUT strip, colour changes, directional arrows shown
6. Dead Ball & Long Corner — ball moves from field to DEAD/LC, repositions correctly
7. D-Entries — ball moves into D, popup appears ON entry (not exit)
8. Short Corners — animate SC start position → outside D → into D with popup
9. Pause & Resume — show actual pause/resume controls as in Live Pro
10. Actions — lightning button animation with options popup
11. Undo — show undo functionality
12. Field Rotation — show flip animation
13. End Match — show end match flow

**Key requirement:** Field must look IDENTICAL to actual Live Pro (FieldRecorder.jsx — 632 lines). Import styles/constants, don't approximate.

**Track completion:** `training_completed_at` on profiles. Dashboard shows progress card.

**After training:** Benchmark test (Step 2b) — trainee records a pre-scored YouTube match, auto-graded at 80% accuracy.

## Commercialisation Implementation Priority
(from commercialisation-strategy.md)

1. ~~Registration revamp~~ ✅ Done (v7.12.5–v7.12.11)
2. **Commentator training + benchmark test** ← NEXT
3. Personal credit system + voucher management
4. Team credit system + tier unlocks
5. Coach dashboard progress bar + credit breakdown
6. Feature gating (Free / Free Plus / Premium)
7. Share-to-earn + WhatsApp share
8. Sponsor integration with viewer metrics

## Other TODO (Parked)

High:
1. Prediction auto-scoring on match end
2. Video review playback speed (1x / 1.5x / 2x)
3. Wire outcome predictor to public view

Medium:
1. Coach benchmark TOP10 bug — filter by sport/gender/age_group
2. Stats interpretation skill (MD) for Claude analysis
3. Staging environment (test.kykie.net)

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
1. **hockey-stats-v7.12.11.zip** — Full source + built docs/
2. **HANDOFF.md** — Complete project state
3. **This file** (next-session-planning.md)
4. **commercialisation-strategy.md** — Full commercialisation plan

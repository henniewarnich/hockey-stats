# Baseline Schema & Migrations (pre-v7.0)

These scripts set up the original database. Run in order on a fresh Supabase project:

1. `supabase-schema.sql` — Core tables: teams, matches, match_events, ranking_sets, rankings
2. `migration-users.sql` — Profiles, coach_teams, match_commentators, scheduled_time column
3. `migration-phase2-rls.sql` — Row Level Security policies
4. `migration-reactions.sql` — Event reactions table
5. `migration-viewers.sql` — Match viewers table
6. `migration-audit.sql` — Audit log table + delete_match/delete_user RPC functions
7. `migration-rank-snapshot.sql` — snapshot_match_rankings function (superseded by v7.1.0)
8. `migration-fix-trigger.sql` — Improved auth trigger (later dropped)
9. `migration-festival-to-tournament.sql` — Rename "festival" to "tournament"

Note: The `audit_matches` trigger created by some of these scripts is broken and should be dropped:
```sql
DROP TRIGGER IF EXISTS audit_matches ON matches;
```

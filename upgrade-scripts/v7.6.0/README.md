# v7.6.0 Upgrade Scripts

1. `migration-multi-roles.sql` — Adds `roles` text[] column to profiles, backfills from existing `role`, updates `create_profile` RPC to set both.

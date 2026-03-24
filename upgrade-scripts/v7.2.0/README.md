# v7.2.0 Upgrade Scripts

Run in order:

1. `migration-ranking-date.sql` — Adds `ranking_date` column to `ranking_sets` table, backfills from `scraped_at`, sets default to CURRENT_DATE.

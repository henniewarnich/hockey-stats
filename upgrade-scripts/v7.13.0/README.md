# v7.13.0 — Commentator Training & Benchmark Test

## Migration
Run `migration-training-benchmark.sql` in the Supabase SQL editor.

This adds:
- `profiles.benchmark_score` — stores the trainee's best benchmark score
- `profiles.benchmark_passed_at` — timestamp when they passed
- `profiles.training_progress` — JSON for tracking learn/practice progress
- Sets existing admin-created commentators to `commentator_status = 'qualified'`

## Configure Benchmark Test

Once you have a reference match recorded (by scoring a YouTube video using Live Pro), configure the benchmark:

```sql
-- Insert or update the benchmark config in site_settings
INSERT INTO site_settings (key, value) VALUES (
  'benchmark_config',
  '{"enabled": true, "refMatchId": "YOUR-MATCH-UUID-HERE", "videoUrl": "https://www.youtube.com/watch?v=XXXXX", "homeTeam": "Team A", "awayTeam": "Team B", "matchLength": 60, "breakFormat": "quarters"}'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

Replace:
- `YOUR-MATCH-UUID-HERE` — the UUID of the reference match you recorded
- `videoUrl` — the YouTube link trainees will watch
- `homeTeam` / `awayTeam` — team names shown to trainees

## How It Works

1. Commentators who register get `commentator_status = 'trainee'`
2. Trainees see the Training Screen instead of the Commentator Dashboard
3. Three steps: Learn → Practice (demo match) → Benchmark Test
4. Benchmark: trainee records the same YouTube match, system compares against reference
5. 80% overall accuracy → promoted to `commentator_status = 'qualified'`
6. Qualified commentators get full CommentatorDashboard access

## Scoring Weights
- Goals: 25%
- D Entries: 20%
- Short Corners: 15%
- Shots on Goal: 15%
- Zone Accuracy: 15%
- Turnovers: 10%

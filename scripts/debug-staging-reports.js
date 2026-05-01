// One-off diagnostic: confirm match_reports + matches in staging.
// Run: node --env-file=.env.staging-import scripts/debug-staging-reports.js

import { createClient } from '@supabase/supabase-js';

const { STAGING_SUPABASE_URL, STAGING_SERVICE_ROLE_KEY } = process.env;
const sb = createClient(STAGING_SUPABASE_URL, STAGING_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

(async () => {
  const dateFrom = '2026-04-24';

  const [{ count: reportCount }, { count: matchCount }] = await Promise.all([
    sb.from('match_reports').select('id', { count: 'exact', head: true }),
    sb.from('matches').select('id', { count: 'exact', head: true }),
  ]);
  console.log(`Total match_reports in staging: ${reportCount}`);
  console.log(`Total matches in staging: ${matchCount}`);

  const { data: dateMatches } = await sb
    .from('matches')
    .select('id, match_date')
    .gte('match_date', dateFrom)
    .order('match_date', { ascending: false })
    .limit(5);
  console.log(`\nMatches with match_date >= ${dateFrom}: ${dateMatches?.length || 0}`);
  console.log(dateMatches);

  const { data: latestReports } = await sb
    .from('match_reports')
    .select('id, match_id, report_type, generated_at')
    .order('generated_at', { ascending: false })
    .limit(5);
  console.log(`\nLatest 5 reports (any date):`);
  console.log(latestReports);

  if (latestReports && latestReports.length > 0) {
    const matchIds = latestReports.map(r => r.match_id);
    const { data: theirMatches } = await sb
      .from('matches')
      .select('id, match_date, home_team_id, away_team_id')
      .in('id', matchIds);
    console.log(`\nMatches that those reports point to:`);
    console.log(theirMatches);
  }

  console.log(`\nTesting RLS-respecting read as anon (no auth):`);
  const sbAnon = createClient(
    STAGING_SUPABASE_URL,
    'sb_publishable_DTWAsmmvuB8mXBEjDX3RqA_-5o3wjCY',
    { auth: { persistSession: false } }
  );
  const { data: anonReports, error: anonErr } = await sbAnon
    .from('match_reports')
    .select('id', { count: 'exact', head: true });
  console.log(`Anon can read match_reports? error: ${anonErr?.message || 'none'}, rows: ${anonReports?.length || 0}`);
})();

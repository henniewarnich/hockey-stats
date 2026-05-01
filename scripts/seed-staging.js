// scripts/seed-staging.js
// Seed staging Supabase from production. Idempotent (upsert on PK).
// Run:         node --env-file=.env.staging-import scripts/seed-staging.js
// Dry run:     node --env-file=.env.staging-import scripts/seed-staging.js --dry-run

import { createClient } from '@supabase/supabase-js';

const DRY_RUN = process.argv.includes('--dry-run');

const {
  PROD_SUPABASE_URL,
  PROD_SERVICE_ROLE_KEY,
  STAGING_SUPABASE_URL,
  STAGING_SERVICE_ROLE_KEY,
} = process.env;

for (const [name, val] of Object.entries({
  PROD_SUPABASE_URL,
  PROD_SERVICE_ROLE_KEY,
  STAGING_SUPABASE_URL,
  STAGING_SERVICE_ROLE_KEY,
})) {
  if (!val) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
}

if (PROD_SUPABASE_URL === STAGING_SUPABASE_URL) {
  console.error('Refusing to run: PROD and STAGING URLs are identical.');
  process.exit(1);
}

const clientOpts = { auth: { persistSession: false, autoRefreshToken: false } };
const prod = createClient(PROD_SUPABASE_URL, PROD_SERVICE_ROLE_KEY, clientOpts);
const staging = createClient(STAGING_SUPABASE_URL, STAGING_SERVICE_ROLE_KEY, clientOpts);

const READ_PAGE = 1000;
const WRITE_BATCH = 500;

const TABLES = [
  { name: 'institutions',    pk: 'id' },
  { name: 'teams',           pk: 'id' },
  { name: 'ranking_sets',    pk: 'id' },
  { name: 'matches',         pk: 'id',
    transform: (r) => ({ ...r, created_by: null, locked_by: null, submitted_by: null, approved_by: null }) },
  { name: 'rankings',        pk: 'id' },
  { name: 'match_events',    pk: 'id' },
  { name: 'match_stats',     pk: 'id' },
  { name: 'match_viewers',   pk: 'id' },
  { name: 'match_reports',   pk: 'id',
    transform: (r) => ({ ...r, generated_by: null }) },
  { name: 'team_credits',    pk: 'id',
    transform: (r) => ({ ...r, source_user_id: null }) },
  { name: 'event_reactions', pk: 'id' },
  { name: 'site_settings',   pk: 'key',
    filter: (r) => r.key !== 'resend_api_key' },
];

async function fetchAll(client, table) {
  const rows = [];
  for (let start = 0; ; start += READ_PAGE) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(start, start + READ_PAGE - 1);
    if (error) throw new Error(`read ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < READ_PAGE) break;
  }
  return rows;
}

async function upsertAll(client, table, pk, rows) {
  for (let i = 0; i < rows.length; i += WRITE_BATCH) {
    const batch = rows.slice(i, i + WRITE_BATCH);
    const { error } = await client.from(table).upsert(batch, { onConflict: pk });
    if (error) throw new Error(`upsert ${table} [${i}..${i + batch.length}]: ${error.message}`);
    process.stdout.write(`    ${Math.min(i + WRITE_BATCH, rows.length)}/${rows.length}\r`);
  }
  if (rows.length) process.stdout.write('\n');
}

async function copyTable({ name, pk, transform, filter }) {
  console.log(`\n[${name}] reading...`);
  const t0 = Date.now();
  let rows = await fetchAll(prod, name);
  const readMs = Date.now() - t0;
  console.log(`  read ${rows.length} rows in ${readMs}ms`);

  if (filter) rows = rows.filter(filter);
  if (transform) rows = rows.map(transform);
  if (filter || transform) console.log(`  ${rows.length} rows after transform/filter`);

  if (rows.length === 0) return;

  console.log(`  upserting to staging...`);
  await upsertAll(staging, name, pk, rows);
}

async function dryRun() {
  console.log(`Source: ${PROD_SUPABASE_URL}`);
  console.log(`Target: ${STAGING_SUPABASE_URL}`);
  console.log(`URLs differ: ${PROD_SUPABASE_URL !== STAGING_SUPABASE_URL ? 'yes' : 'NO — would abort'}`);
  console.log(`\nProduction row counts:`);
  console.log(`${'table'.padEnd(20)} ${'count'.padStart(10)}`);
  console.log(`${'-'.repeat(20)} ${'-'.repeat(10)}`);
  for (const { name, pk } of TABLES) {
    const { count, error } = await prod
      .from(name)
      .select(pk, { count: 'exact', head: true });
    if (error) {
      console.log(`${name.padEnd(20)} ${'ERROR'.padStart(10)}  ${error.message}`);
    } else {
      console.log(`${name.padEnd(20)} ${String(count).padStart(10)}`);
    }
  }
  console.log(`\nDry run complete. No writes performed.`);
}

(async () => {
  if (DRY_RUN) {
    await dryRun();
    return;
  }
  const t0 = Date.now();
  console.log(`Source: ${PROD_SUPABASE_URL}`);
  console.log(`Target: ${STAGING_SUPABASE_URL}`);
  for (const t of TABLES) {
    try {
      await copyTable(t);
    } catch (err) {
      console.error(`\nFAILED on ${t.name}: ${err.message}`);
      process.exit(1);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
})();

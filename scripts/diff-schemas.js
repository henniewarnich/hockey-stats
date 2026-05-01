// scripts/diff-schemas.js
// Diff prod vs staging schemas for tables in the seed list.
// Reads PostgREST OpenAPI spec from each project via the service role key.
// Prints per-table column comparison and a consolidated set of ALTER statements.
// Does not apply anything.
//
// Run: node --env-file=.env.staging-import scripts/diff-schemas.js

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

const TABLES = [
  'institutions',
  'teams',
  'ranking_sets',
  'matches',
  'rankings',
  'match_events',
  'match_stats',
  'match_viewers',
  'match_reports',
  'team_credits',
  'event_reactions',
  'site_settings',
];

async function fetchSchema(url, key) {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`schema fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function tableColumns(spec, table) {
  const def = spec?.definitions?.[table];
  if (!def) return null;
  const required = new Set(def.required || []);
  const cols = {};
  for (const [name, prop] of Object.entries(def.properties || {})) {
    cols[name] = {
      type: prop.format || prop.type || 'unknown',
      nullable: !required.has(name),
      description: prop.description || '',
    };
  }
  return cols;
}

function formatCol(col) {
  if (!col) return '— missing —';
  return col.type;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

(async () => {
  console.log(`Fetching schemas...`);
  const [prodSpec, stagingSpec] = await Promise.all([
    fetchSchema(PROD_SUPABASE_URL, PROD_SERVICE_ROLE_KEY),
    fetchSchema(STAGING_SUPABASE_URL, STAGING_SERVICE_ROLE_KEY),
  ]);

  const alters = [];
  const warnings = [];

  for (const table of TABLES) {
    const prodCols = tableColumns(prodSpec, table);
    const stagingCols = tableColumns(stagingSpec, table);

    console.log(`\n=== ${table} ===`);
    if (!prodCols) {
      console.log(`  (not found in prod)`);
      continue;
    }
    if (!stagingCols) {
      console.log(`  (not found in staging) — table missing entirely`);
      warnings.push(`${table}: table missing in staging — needs full CREATE TABLE`);
      continue;
    }

    const allCols = new Set([...Object.keys(prodCols), ...Object.keys(stagingCols)]);
    console.log(`  ${pad('column', 30)} ${pad('prod', 30)} staging`);
    console.log(`  ${'-'.repeat(30)} ${'-'.repeat(30)} ${'-'.repeat(30)}`);

    for (const c of [...allCols].sort()) {
      const p = prodCols[c];
      const s = stagingCols[c];
      const prodStr = formatCol(p);
      const stagingStr = formatCol(s);
      const marker = !s ? ' <- MISSING in staging'
                   : !p ? ' <- staging-only'
                   : p.type !== s.type ? ' <- TYPE MISMATCH'
                   : '';
      console.log(`  ${pad(c, 30)} ${pad(prodStr, 30)} ${stagingStr}${marker}`);

      if (p && !s) {
        const nullClause = p.nullable ? '' : ' /* prod is NOT NULL — review before applying */';
        alters.push(`ALTER TABLE ${table} ADD COLUMN ${c} ${p.type};${nullClause}`);
      }
      if (p && s && p.type !== s.type) {
        warnings.push(`${table}.${c}: prod=${p.type} staging=${s.type} — manual reconciliation needed`);
      }
    }
  }

  console.log(`\n\n=== ALTER statements (review, then paste into staging SQL editor) ===\n`);
  if (alters.length === 0) {
    console.log(`-- No missing columns. Schemas match for the tables in scope.`);
  } else {
    for (const a of alters) console.log(a);
  }

  if (warnings.length > 0) {
    console.log(`\n=== Warnings (manual handling) ===\n`);
    for (const w of warnings) console.log(`-- ${w}`);
  }
})();

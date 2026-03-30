// ─── TEAM DISPLAY HELPERS ─────────────────────────────
// Centralises all team name display logic post-institution migration.
// Every screen should use these helpers instead of raw team.name.

// ── SUPABASE SELECT PATTERNS ──────────────────────────
// Use these in all queries to ensure institution data is loaded.

// For direct team queries: from('teams').select(TEAM_SELECT)
export const TEAM_SELECT = '*, institution:institutions(*)';

// For brief team queries (dropdowns, badges):
export const TEAM_SELECT_BRIEF = 'id, name, color, short_name, gender, age_group, sport, institution_id, institution:institutions(id, name, short_name, other_names, color)';

// For match joins — use inside .select() template literals:
//   .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
export const MATCH_HOME_TEAM = 'home_team:teams!home_team_id(*, institution:institutions(*))';
export const MATCH_AWAY_TEAM = 'away_team:teams!away_team_id(*, institution:institutions(*))';

// Short match joins (for issues, sponsors, etc):
export const MATCH_HOME_TEAM_NAME = 'home_team:teams!home_team_id(id, name, gender, age_group, sport, institution:institutions(id, name, short_name))';
export const MATCH_AWAY_TEAM_NAME = 'away_team:teams!away_team_id(id, name, gender, age_group, sport, institution:institutions(id, name, short_name))';

// ── DERIVED NAME ──────────────────────────────────────

/**
 * Derive team name from gender + sport + age_group
 * e.g. "Girls Hockey U18", "Boys Rugby U16"
 */
export function teamDerivedName(team) {
  if (!team) return 'Unknown';
  const g = team.gender || 'Girls';
  const s = team.sport || 'Hockey';
  const a = team.age_group || '1st';
  return `${g} ${s} ${a}`;
}

// ── DISPLAY FUNCTIONS ─────────────────────────────────

/**
 * Full display name: "Paarl Girls Girls Hockey U18"
 * Used in: team page headers, full listings, match cards
 */
export function teamDisplayName(team) {
  if (!team) return 'Unknown';
  const inst = team.institution;
  const derived = teamDerivedName(team);
  if (inst) {
    return `${inst.short_name || inst.name} ${derived}`;
  }
  // Fallback for pre-migration data
  return team.team_description || derived;
}

/**
 * Short display name: "PG" or "Paarl Girls"
 * Used in: scoreboards, prediction buttons, compact views
 */
export function teamShortName(team) {
  if (!team) return '?';
  const inst = team.institution;
  if (inst?.short_name) return inst.short_name;
  if (inst?.name) return inst.name;
  return team.short_name || team.name;
}

/**
 * Initial letter(s) for avatar badges
 */
export function teamInitial(team) {
  if (!team) return '?';
  const inst = team.institution;
  if (inst?.short_name) return inst.short_name.charAt(0).toUpperCase();
  if (inst?.name) return inst.name.charAt(0).toUpperCase();
  return (team.name || '?').charAt(0).toUpperCase();
}

/**
 * Team color — always from institution
 */
export function teamColor(team) {
  if (!team) return '#1D4ED8';
  return team.institution?.color || team.color || '#1D4ED8';
}

/**
 * Generate URL slug from institution name
 */
export function teamSlug(team) {
  if (!team) return '';
  const inst = team.institution;
  const base = inst?.name || team.team_description || team.name || '';
  return base.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

/**
 * Search-friendly string — matches against institution + team fields
 */
export function teamSearchString(team) {
  if (!team) return '';
  const inst = team.institution;
  const parts = [
    inst?.name,
    inst?.short_name,
    inst?.other_names,
    teamDerivedName(team),
    team.team_description,
  ].filter(Boolean);
  return parts.join(' ').toLowerCase();
}

/**
 * Check if a team matches a search query
 */
export function teamMatchesSearch(team, query) {
  if (!query?.trim()) return true;
  const haystack = teamSearchString(team);
  const terms = query.toLowerCase().trim().split(/\s+/);
  return terms.every(term => haystack.includes(term));
}

/**
 * Full team object for display — convenience wrapper
 */
export function getTeamDisplay(team) {
  return {
    displayName: teamDisplayName(team),
    shortName: teamShortName(team),
    initial: teamInitial(team),
    color: teamColor(team),
    slug: teamSlug(team),
  };
}

/**
 * Format a match's team names for display
 */
export function matchDisplayNames(match, short = false) {
  const home = short ? teamShortName(match.home_team) : teamDisplayName(match.home_team);
  const away = short ? teamShortName(match.away_team) : teamDisplayName(match.away_team);
  return { home, away };
}

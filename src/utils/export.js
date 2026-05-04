import { supabase } from './supabase.js';
import { teamShortName, teamDerivedName, teamDisplayName, MATCH_HOME_TEAM, MATCH_AWAY_TEAM } from './teams.js';
import { matchOutcome, matchWinner } from './helpers.js';

/**
 * Fetch all rows from a table, paginating if needed
 */
async function fetchAll(table, select = '*', filters = null) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select(select).range(from, from + PAGE - 1);
    if (filters) q = filters(q);
    const { data, error } = await q;
    if (error) { console.error(`Export error on ${table}:`, error); break; }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

/**
 * Download a JSON object as a file
 */
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all database tables as a single JSON download
 * Returns { tableName: rows[] } for every table
 */
export async function exportAllData(onProgress) {
  const tables = [
    ['institutions', '*'],
    ['teams', '*, institution:institutions(*)'],
    ['matches', `*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`],
    ['match_events', 'id, match_id, team, event, detail, zone, match_time, seq, created_at'],
    ['match_stats', '*'],
    ['match_reports', '*'],
    ['match_commentators', '*'],
    ['match_viewers', '*'],
    ['profiles', 'id, firstname, lastname, username, email, role, roles, blocked, last_seen_at, alias_nickname, biological_gender, home_town, sport_interest, supporting_institution_ids, created_at'],
    ['coach_teams', '*, teams(id, name, institution:institutions(id, name, short_name))'],
    ['rankings', '*'],
    ['ranking_sets', '*'],
    ['event_reactions', '*'],
    ['audit_log', '*'],
    ['communication_log', '*'],
    ['login_attempts', '*'],
    ['sponsors', '*'],
    ['sponsor_impressions', '*'],
    ['sponsor_clicks', '*'],
    ['issues', '*'],
    ['contributor_stats', '*'],
    ['credit_ledger', '*'],
    ['team_credits', '*'],
    ['team_tiers', '*'],
    ['vouchers', '*'],
    ['user_devices', '*'],
    ['site_settings', '*'],
    ['app_settings', '*'],
    ['predictions', '*'],
  ];

  const result = {};
  const counts = {};
  for (let i = 0; i < tables.length; i++) {
    const [name, select] = tables[i];
    if (onProgress) onProgress(`Exporting ${name}... (${i + 1}/${tables.length})`);
    result[name] = await fetchAll(name, select);
    counts[name] = result[name].length;
  }

  result._meta = {
    exported_at: new Date().toISOString(),
    source: 'kykie.net',
    row_counts: counts,
    total_rows: Object.values(counts).reduce((a, b) => a + b, 0),
  };

  const date = new Date().toISOString().slice(0, 10);
  downloadJSON(result, `kykie-full-export-${date}.json`);
  return counts;
}

/**
 * Export all data for a specific team — optimized for Claude analysis
 */
export async function exportTeamData(team, onProgress) {
  if (!team?.id) return;
  const teamId = team.id;
  const name = teamDisplayName(team);
  const short = teamShortName(team);

  if (onProgress) onProgress('Loading matches...');

  // Fetch all matches involving this team
  const matches = await fetchAll('matches',
    `*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`,
    q => q.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`).order('match_date', { ascending: false })
  );

  // Separate by status
  const ended = matches.filter(m => m.status === 'ended');
  const abandoned = matches.filter(m => m.status === 'abandoned');
  const upcoming = matches.filter(m => m.status === 'upcoming');

  // Fetch events for all matches with duration (live-recorded)
  if (onProgress) onProgress('Loading match events...');
  const liveMatchIds = matches.filter(m => m.duration > 0).map(m => m.id);
  const allEvents = {};
  for (const mid of liveMatchIds) {
    allEvents[mid] = await fetchAll('match_events',
      'id, team, event, detail, zone, match_time, seq',
      q => q.eq('match_id', mid).order('seq', { ascending: true })
    );
  }

  // Fetch archived stats
  if (onProgress) onProgress('Loading match stats...');
  const matchIds = matches.map(m => m.id);
  const allStats = {};
  for (let i = 0; i < matchIds.length; i += 20) {
    const batch = matchIds.slice(i, i + 20);
    const { data } = await supabase.from('match_stats').select('*').in('match_id', batch);
    (data || []).forEach(s => {
      if (!allStats[s.match_id]) allStats[s.match_id] = [];
      allStats[s.match_id].push(s);
    });
  }

  // Fetch predictions
  if (onProgress) onProgress('Loading predictions...');
  const allPreds = {};
  for (let i = 0; i < matchIds.length; i += 20) {
    const batch = matchIds.slice(i, i + 20);
    const { data } = await supabase.from('predictions').select('*').in('match_id', batch);
    (data || []).forEach(p => {
      if (!allPreds[p.match_id]) allPreds[p.match_id] = [];
      allPreds[p.match_id].push(p);
    });
  }

  // Fetch rankings
  if (onProgress) onProgress('Loading rankings...');
  const { data: rankings } = await supabase.from('rankings')
    .select('*, ranking_sets(name, ranking_date)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  // Compute season record
  const record = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  ended.forEach(m => {
    record.p++;
    const isHome = m.home_team_id === teamId;
    record.gf += isHome ? m.home_score : m.away_score;
    record.ga += isHome ? m.away_score : m.home_score;
    const o = matchOutcome(m, teamId);
    if (o === 'W') record.w++; else if (o === 'D') record.d++; else record.l++;
  });

  // Build enriched match list
  const enrichedMatches = matches.map(m => {
    const isHome = m.home_team_id === teamId;
    const opponent = isHome ? m.away_team : m.home_team;
    return {
      id: m.id,
      date: m.match_date,
      status: m.status,
      venue: m.venue,
      match_type: m.match_type,
      is_home: isHome,
      opponent: teamDisplayName(opponent),
      opponent_short: teamShortName(opponent),
      team_score: isHome ? m.home_score : m.away_score,
      opponent_score: isHome ? m.away_score : m.home_score,
      result: m.status === 'ended' ? matchOutcome(m, teamId) : null,
      penalty_score: m.home_penalty_score != null ? {
        team: isHome ? m.home_penalty_score : m.away_penalty_score,
        opponent: isHome ? m.away_penalty_score : m.home_penalty_score,
      } : null,
      duration: m.duration || 0,
      has_live_events: !!allEvents[m.id],
      event_count: allEvents[m.id]?.length || 0,
      events: allEvents[m.id] || null,
      stats: allStats[m.id] || null,
      predictions: allPreds[m.id] || null,
      team_rank_at_match: isHome ? m.home_rank : m.away_rank,
      opponent_rank_at_match: isHome ? m.away_rank : m.home_rank,
    };
  });

  const result = {
    _meta: {
      exported_at: new Date().toISOString(),
      source: 'kykie.net',
      description: `Complete match and stats data for ${name}`,
      usage: 'Import this JSON into a Claude chat for AI-powered analysis of team performance, trends, and insights.',
    },
    team: {
      id: teamId,
      name,
      short_name: short,
      derived_name: teamDerivedName(team),
      institution: team.institution?.name || null,
      color: team.color || team.institution?.color || null,
      gender: team.gender,
      sport: team.sport,
      age_group: team.age_group,
      variant: team.variant,
    },
    season_record: {
      ...record,
      gd: record.gf - record.ga,
      win_rate: record.p > 0 ? Math.round(record.w / record.p * 100) : 0,
    },
    summary: {
      total_matches: matches.length,
      ended: ended.length,
      abandoned: abandoned.length,
      upcoming: upcoming.length,
      live_recorded: liveMatchIds.length,
      with_archived_stats: Object.keys(allStats).length,
    },
    matches: enrichedMatches,
    rankings: (rankings || []).map(r => ({
      rank: r.rank,
      prev_rank: r.prev_rank,
      points: r.points,
      ranking_set: r.ranking_sets?.name,
      ranking_date: r.ranking_sets?.ranking_date,
    })),
  };

  const slug = short.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);
  downloadJSON(result, `kykie-${slug}-${date}.json`);
  return result;
}

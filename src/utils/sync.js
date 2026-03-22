import { supabase } from './supabase.js';

// ─── TEAMS ───────────────────────────────────────────

export async function fetchTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name');
  if (error) { console.error('Fetch teams error:', error); return null; }
  return data;
}

export async function upsertTeam(team) {
  // Map local team format to Supabase format
  const row = {
    name: team.name.trim(),
    color: team.color,
    short_name: team.short_name || null,
    school: team.school || false,
    coach_pin: team.coach_pin || null,
    commentator_pin: team.commentator_pin || null,
  };

  if (team.supabase_id) {
    // Update existing
    const { data, error } = await supabase
      .from('teams')
      .update(row)
      .eq('id', team.supabase_id)
      .select()
      .single();
    if (error) { console.error('Update team error:', error); return null; }
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('teams')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('Insert team error:', error); return null; }
    return data;
  }
}

export async function deleteTeamRemote(supabaseId) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', supabaseId);
  if (error) console.error('Delete team error:', error);
  return !error;
}

// ─── MATCHES ─────────────────────────────────────────

export async function saveMatchToSupabase(game) {
  // 1. Resolve team IDs — find or create teams in Supabase
  const homeTeam = await findOrCreateTeam(game.teams.home);
  const awayTeam = await findOrCreateTeam(game.teams.away);
  if (!homeTeam || !awayTeam) return null;

  // 2. Insert match
  const matchRow = {
    home_team_id: homeTeam.id,
    away_team_id: awayTeam.id,
    home_score: game.homeScore || 0,
    away_score: game.awayScore || 0,
    match_date: game.date ? new Date(game.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    match_length: game.matchLength || 60,
    break_format: game.breakFormat || 'quarters',
    venue: game.venue || null,
    duration: game.duration || 0,
    status: 'ended',
  };

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert(matchRow)
    .select()
    .single();

  if (matchError) { console.error('Insert match error:', matchError); return null; }

  // 3. Insert events in batches (Supabase handles up to 1000 per insert)
  if (game.events && game.events.length > 0) {
    const eventRows = game.events.map((e, i) => ({
      match_id: match.id,
      team: e.team,
      event: e.event,
      zone: e.zone || null,
      detail: e.detail || null,
      match_time: e.time || 0,
      seq: game.events.length - i, // oldest = 1, newest = highest
    }));

    // Batch insert in chunks of 500
    for (let i = 0; i < eventRows.length; i += 500) {
      const batch = eventRows.slice(i, i + 500);
      const { error: evError } = await supabase
        .from('match_events')
        .insert(batch);
      if (evError) console.error('Insert events error (batch):', evError);
    }
  }

  return match;
}

export async function fetchMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(id, name, color, short_name),
      away_team:teams!away_team_id(id, name, color, short_name)
    `)
    .order('match_date', { ascending: false });

  if (error) { console.error('Fetch matches error:', error); return null; }
  return data;
}

// Fetch all matches with events, converted to local app format
export async function fetchMatchesForLocal() {
  const matches = await fetchMatches();
  if (!matches) return null;

  const results = [];
  for (const m of matches) {
    // Fetch events for this match
    const { data: events } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', m.id)
      .order('seq', { ascending: false });

    results.push({
      id: m.id, // use Supabase UUID as local id
      supabase_id: m.id,
      date: m.match_date ? new Date(m.match_date).toISOString() : new Date(m.created_at).toISOString(),
      teams: {
        home: { name: m.home_team?.name || "Home", color: m.home_team?.color || "#1D4ED8", id: m.home_team?.id },
        away: { name: m.away_team?.name || "Away", color: m.away_team?.color || "#DC2626", id: m.away_team?.id },
      },
      events: (events || []).map(e => ({
        id: e.id,
        team: e.team,
        event: e.event,
        zone: e.zone,
        detail: e.detail,
        time: e.match_time,
      })),
      duration: m.duration || 0,
      homeScore: m.home_score || 0,
      awayScore: m.away_score || 0,
      matchLength: m.match_length,
      breakFormat: m.break_format,
      venue: m.venue,
      status: m.status,
    });
  }
  return results;
}

export async function fetchMatchEvents(matchId) {
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('seq', { ascending: false });

  if (error) { console.error('Fetch events error:', error); return null; }
  return data;
}

export async function deleteMatchRemote(matchId) {
  // Events cascade-delete due to FK constraint
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);
  if (error) console.error('Delete match error:', error);
  return !error;
}

// ─── HELPERS ─────────────────────────────────────────

async function findOrCreateTeam(team) {
  // Try to find by name first
  const { data: existing } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', team.name.trim())
    .limit(1)
    .single();

  if (existing) return existing;

  // Create new
  const { data: created, error } = await supabase
    .from('teams')
    .insert({ name: team.name.trim(), color: team.color })
    .select()
    .single();

  if (error) { console.error('Create team error:', error); return null; }
  return created;
}

// ─── LIVE MATCH (for future real-time) ───────────────

export async function createLiveMatch(config) {
  const homeTeam = await findOrCreateTeam(config.home);
  const awayTeam = await findOrCreateTeam(config.away);
  if (!homeTeam || !awayTeam) return null;

  const pin = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit PIN

  const { data, error } = await supabase
    .from('matches')
    .insert({
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      match_date: config.date ? new Date(config.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      match_length: config.matchLength || 60,
      break_format: config.breakFormat || 'quarters',
      venue: config.venue || null,
      status: 'live',
      share_pin: pin,
    })
    .select()
    .single();

  if (error) { console.error('Create live match error:', error); return null; }
  return { ...data, pin };
}

export async function updateLiveScore(matchId, homeScore, awayScore) {
  const { error } = await supabase
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status: 'live' })
    .eq('id', matchId);
  if (error) console.error('Update score error:', error);
  return !error;
}

export async function endLiveMatch(matchId, homeScore, awayScore, duration) {
  const { error } = await supabase
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status: 'ended', duration })
    .eq('id', matchId);
  if (error) console.error('End live match error:', error);
  return !error;
}

export async function pushLiveEvent(matchId, event, seq) {
  const { error } = await supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      team: event.team,
      event: event.event,
      zone: event.zone || null,
      detail: event.detail || null,
      match_time: event.time || 0,
      seq,
    });
  if (error) console.error('Push event error:', error);
  return !error;
}

// Subscribe to live match updates (for spectator view)
export function subscribeLiveMatch(matchId, onMatchUpdate, onNewEvent) {
  const channel = supabase.channel(`match-${matchId}`);

  channel
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
      (payload) => onMatchUpdate(payload.new)
    )
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${matchId}` },
      (payload) => onNewEvent(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

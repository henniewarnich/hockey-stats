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
  // 1. Resolve team IDs
  const homeTeam = await findOrCreateTeam(game.teams.home);
  const awayTeam = await findOrCreateTeam(game.teams.away);
  if (!homeTeam || !awayTeam) return null;

  const matchRow = {
    home_team_id: homeTeam.id,
    away_team_id: awayTeam.id,
    home_score: game.homeScore || 0,
    away_score: game.awayScore || 0,
    match_date: game.date ? new Date(game.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    match_length: game.matchLength || 60,
    break_format: game.breakFormat || 'quarters',
    venue: game.venue || null,
    match_type: game.matchType || 'league',
    duration: game.duration || 0,
    status: 'ended',
  };

  let match;

  // 2. If game already has a Supabase ID (from createLiveMatch), UPDATE instead of INSERT
  const existingId = game.supabase_id || game.id;
  if (existingId) {
    // Try to update first
    const { data: updated, error: updateError } = await supabase
      .from('matches')
      .update(matchRow)
      .eq('id', existingId)
      .select()
      .single();
    
    if (!updateError && updated) {
      match = updated;
    } else {
      // Row doesn't exist — fall through to insert
      console.warn('Update failed, inserting new:', updateError?.message);
      const { data: inserted, error: insertError } = await supabase
        .from('matches')
        .insert(matchRow)
        .select()
        .single();
      if (insertError) { console.error('Insert match error:', insertError); return null; }
      match = inserted;
    }
  } else {
    // No existing ID — insert new
    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert(matchRow)
      .select()
      .single();
    if (insertError) { console.error('Insert match error:', insertError); return null; }
    match = inserted;
  }

  // 3. Insert events (only if not already pushed via live events)
  // Check if events already exist for this match
  const { data: existingEvents } = await supabase
    .from('match_events')
    .select('id')
    .eq('match_id', match.id)
    .limit(1);

  if ((!existingEvents || existingEvents.length === 0) && game.events && game.events.length > 0) {
    const eventRows = game.events.map((e, i) => ({
      match_id: match.id,
      team: e.team,
      event: e.event,
      zone: e.zone || null,
      detail: e.detail || null,
      match_time: e.time || 0,
      seq: game.events.length - i,
    }));

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
      matchType: m.match_type,
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
      match_type: config.matchType || 'league',
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

// ─── MATCH SCHEDULING ────────────────────────────────

export async function scheduleMatch({ homeTeamId, awayTeamId, matchDate, scheduledTime, matchLength, breakFormat, matchType, venue, commentatorIds }) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: matchDate,
      scheduled_time: scheduledTime || null,
      match_length: matchLength || 60,
      break_format: breakFormat || 'quarters',
      match_type: matchType || 'league',
      venue: venue || null,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) { console.error('Schedule match error:', error); return null; }

  // Assign commentators
  if (commentatorIds?.length > 0) {
    const rows = commentatorIds.map(cid => ({ match_id: data.id, commentator_id: cid }));
    await supabase.from('match_commentators').insert(rows);
  }

  return data;
}

export async function updateScheduledMatch(matchId, updates) {
  const { error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId);
  if (error) console.error('Update scheduled match error:', error);
  return !error;
}

export async function assignCommentators(matchId, commentatorIds) {
  // Remove existing assignments
  await supabase.from('match_commentators').delete().eq('match_id', matchId);
  // Insert new
  if (commentatorIds?.length > 0) {
    const rows = commentatorIds.map(cid => ({ match_id: matchId, commentator_id: cid }));
    await supabase.from('match_commentators').insert(rows);
  }
}

export async function fetchUpcomingMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });
  if (error) { console.error('Fetch upcoming error:', error); return []; }
  return data;
}

export async function fetchMatchCommentators(matchId) {
  const { data, error } = await supabase
    .from('match_commentators')
    .select('*, commentator:profiles!commentator_id(*)')
    .eq('match_id', matchId);
  if (error) return [];
  return data;
}

export async function fetchCommentatorMatches(commentatorId) {
  const { data: assignments, error } = await supabase
    .from('match_commentators')
    .select('match_id')
    .eq('commentator_id', commentatorId);
  if (error || !assignments?.length) return [];

  const matchIds = assignments.map(a => a.match_id);
  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .in('id', matchIds)
    .order('match_date', { ascending: false });
  return matches || [];
}

export async function lockMatch(matchId, userId) {
  // First-to-start locks — only if not already locked
  const { data, error } = await supabase
    .from('matches')
    .update({ locked_by: userId })
    .eq('id', matchId)
    .is('locked_by', null)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function unlockMatch(matchId, userId) {
  // Only the user who locked it can unlock
  const { error } = await supabase
    .from('matches')
    .update({ locked_by: null, status: 'upcoming' })
    .eq('id', matchId)
    .eq('locked_by', userId);
  return !error;
}

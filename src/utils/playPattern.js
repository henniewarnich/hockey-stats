/**
 * Play Pattern Analysis — extracts dominant exit, attack, and D-entry routes
 * from raw match_events across multiple Live Pro matches for a given team.
 */

const ZONE_MAP = {
  'opp quarter (left)': 'OQ L', 'opp quarter (centre)': 'OQ C', 'opp quarter (right)': 'OQ R',
  'opp midfield (left)': 'OM L', 'opp midfield (centre)': 'OM C', 'opp midfield (right)': 'OM R',
  'own midfield (left)': 'DM L', 'own midfield (centre)': 'DM C', 'own midfield (right)': 'DM R',
  'own quarter (left)': 'DQ L', 'own quarter (centre)': 'DQ C', 'own quarter (right)': 'DQ R',
  'centre': 'Centre',
};

function toGrid(zone, isHome) {
  if (!zone) return null;
  const z = zone.toLowerCase().trim();
  
  // Skip backlines and unrecognised
  if (z.includes('backline')) return null;
  
  // Team-named D zones (absolute)
  if (z.includes(' d') && !z.startsWith('opp') && !z.startsWith('own')) {
    // Named team D — could be opp or own depending on context
    // For now skip these, they're handled by the generic patterns
    return null;
  }
  
  // Try direct mapping
  let grid = ZONE_MAP[z] || null;
  
  // Try partial matching
  if (!grid) {
    if (z.includes('opp') && z.includes('mid'))
      grid = z.includes('left') ? 'OM L' : z.includes('right') ? 'OM R' : 'OM C';
    else if (z.includes('opp') && (z.includes('quarter') || z.includes('qtr')))
      grid = z.includes('left') ? 'OQ L' : z.includes('right') ? 'OQ R' : 'OQ C';
    else if (z.includes('own') && z.includes('mid'))
      grid = z.includes('left') ? 'DM L' : z.includes('right') ? 'DM R' : 'DM C';
    else if (z.includes('own') && (z.includes('quarter') || z.includes('qtr')))
      grid = z.includes('left') ? 'DQ L' : z.includes('right') ? 'DQ R' : 'DQ C';
    else if (z === 'centre') grid = 'Centre';
    else if (z.includes(' d')) {
      // Named D zones
      return z.includes('opp') ? 'Opp D' : z.includes('own') ? 'Own D' : null;
    }
  }
  
  // Invert for away team
  if (grid && !isHome) {
    const INVERT = {
      'OQ L': 'DQ R', 'OQ C': 'DQ C', 'OQ R': 'DQ L',
      'OM L': 'DM R', 'OM C': 'DM C', 'OM R': 'DM L',
      'DM L': 'OM R', 'DM C': 'OM C', 'DM R': 'OM L',
      'DQ L': 'OQ R', 'DQ C': 'OQ C', 'DQ R': 'OQ L',
      'Centre': 'Centre',
    };
    grid = INVERT[grid] || grid;
  }
  
  return grid;
}

function band(z) {
  if (z === 'Own D') return 0;
  if (['DQ L', 'DQ C', 'DQ R'].includes(z)) return 1;
  if (['DM L', 'DM C', 'DM R'].includes(z)) return 2;
  if (z === 'Centre') return 3;
  if (['OM L', 'OM C', 'OM R'].includes(z)) return 4;
  if (['OQ L', 'OQ C', 'OQ R'].includes(z)) return 5;
  if (z === 'Opp D') return 6;
  return -1;
}

function lane(z) {
  if (z.endsWith('L')) return 'L';
  if (z.endsWith('R')) return 'R';
  return 'C';
}

/**
 * Analyse play patterns for a team across multiple matches.
 * @param {Array} matches - Live Pro matches with home_team_id, away_team_id
 * @param {Object} eventsByMatch - { matchId: [events] }
 * @param {string} teamId - the team to analyse
 * @returns {Object} { exit, attack, dEntry, matchCount }
 */
export function analysePlayPatterns(matches, eventsByMatch, teamId) {
  const allSeqs = [];
  
  for (const m of matches) {
    const isHome = m.home_team_id === teamId;
    const events = (eventsByMatch[m.id] || [])
      .filter(e => e.team && e.match_time != null && e.zone)
      .sort((a, b) => (a.match_time - b.match_time) || ((a.seq || 0) - (b.seq || 0)));
    
    let seq = [];
    for (const e of events) {
      const isMine = (e.team === 'home' && isHome) || (e.team === 'away' && !isHome);
      const g = toGrid(e.zone, isHome);
      if (!g) continue;
      const b = band(g);
      if (b < 0) continue;
      
      if (isMine) {
        seq.push({ zone: g, lane: lane(g), band: b });
      } else {
        if (seq.length >= 2) allSeqs.push([...seq]);
        seq = [];
      }
    }
    if (seq.length >= 2) allSeqs.push([...seq]);
  }
  
  // === EXIT: own half (band ≤2) → opp half (band ≥4) ===
  const exitPaths = [];
  for (const seq of allSeqs) {
    const startIdx = seq.findIndex(s => s.band <= 2);
    if (startIdx < 0) continue;
    const sub = seq.slice(startIdx);
    const path = [];
    let reached = false;
    for (const s of sub) {
      path.push(s);
      if (s.band >= 4) { reached = true; break; }
    }
    if (reached) exitPaths.push(path);
  }
  
  // === ATTACK: centre/own mid (band 2-3) → opp quarter (band ≥5) ===
  const attackPaths = [];
  for (const seq of allSeqs) {
    const startIdx = seq.findIndex(s => s.band >= 2 && s.band <= 3);
    if (startIdx < 0) continue;
    const sub = seq.slice(startIdx);
    const path = [];
    let reached = false;
    for (const s of sub) {
      path.push(s);
      if (s.band >= 5) { reached = true; break; }
    }
    if (reached) attackPaths.push(path);
  }
  
  // === D ENTRY: opp quarter (band 5) → opp D (band 6) ===
  const dEntryPaths = [];
  for (const seq of allSeqs) {
    const startIdx = seq.findIndex(s => s.band === 5);
    if (startIdx < 0) continue;
    const sub = seq.slice(startIdx);
    const path = [];
    let reached = false;
    for (const s of sub) {
      path.push(s);
      if (s.band === 6) { reached = true; break; }
    }
    if (reached) dEntryPaths.push(path);
  }
  
  return {
    exit: findDominant(exitPaths, 'exit'),
    attack: findDominant(attackPaths, 'attack'),
    dEntry: findDominant(dEntryPaths, 'dEntry'),
    matchCount: matches.length,
    exitCount: exitPaths.length,
    attackCount: attackPaths.length,
    dEntryCount: dEntryPaths.length,
  };
}

function findDominant(paths, type) {
  if (paths.length === 0) return null;
  
  // For exits: track start lane, transit lane (first band 2 or 3), entry lane (first band ≥4)
  // For attacks: track start lane, transit lane (first band 4), entry lane (first band ≥5)
  // For D entries: track approach lane (last band 5)
  
  const laneCounts = { start: {}, transit: {}, entry: {} };
  
  for (const path of paths) {
    laneCounts.start[path[0].lane] = (laneCounts.start[path[0].lane] || 0) + 1;
    
    if (type === 'exit') {
      const transit = path.find(s => s.band === 2) || path.find(s => s.band === 3);
      if (transit) laneCounts.transit[transit.lane] = (laneCounts.transit[transit.lane] || 0) + 1;
      const entry = path.find(s => s.band >= 4);
      if (entry) laneCounts.entry[entry.lane] = (laneCounts.entry[entry.lane] || 0) + 1;
    } else if (type === 'attack') {
      const transit = path.find(s => s.band === 4);
      if (transit) laneCounts.transit[transit.lane] = (laneCounts.transit[transit.lane] || 0) + 1;
      const entry = path.find(s => s.band >= 5);
      if (entry) laneCounts.entry[entry.lane] = (laneCounts.entry[entry.lane] || 0) + 1;
    } else if (type === 'dEntry') {
      let lastOQ = null;
      for (const s of path) {
        if (s.band === 5) lastOQ = s.lane;
        if (s.band === 6) break;
      }
      if (lastOQ) laneCounts.entry[lastOQ] = (laneCounts.entry[lastOQ] || 0) + 1;
    }
  }
  
  const n = paths.length;
  const topLane = (obj) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    // Check if balanced (top 3 within 5% of each other)
    if (entries.length >= 3) {
      const pcts = entries.map(([, c]) => c / n * 100);
      if (Math.abs(pcts[0] - pcts[2]) < 8) return 'balanced';
    }
    return entries[0][0];
  };
  
  return {
    count: n,
    startLane: topLane(laneCounts.start),
    transitLane: topLane(laneCounts.transit),
    entryLane: topLane(laneCounts.entry),
    lanes: laneCounts,
  };
}

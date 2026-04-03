/**
 * Play Pattern Analysis — extracts dominant exit, attack, and D-entry routes
 * from raw match_events. Works for aggregate (multiple matches) or single match.
 */

function teamNames(teamObj) {
  const names = [];
  if (!teamObj) return names;
  const inst = teamObj.institution || {};
  if (inst.name) names.push(inst.name.toLowerCase());
  if (inst.short_name) names.push(inst.short_name.toLowerCase());
  if (teamObj.name && teamObj.name !== 'Girls Hockey 1st') names.push(teamObj.name.toLowerCase());
  return names;
}

function toGrid(zone, isHome, ownNames, oppNames) {
  if (!zone) return null;
  const z = zone.toLowerCase().trim();
  if (z.includes('backline')) return null;

  // Team-named D zones (absolute — no inversion)
  for (const n of oppNames) {
    if (n && z.includes(n)) {
      if (z.includes(' d')) return 'Opp D';
      if (z.includes('qtr') || z.includes('quarter'))
        return z.includes('left') ? 'OQ L' : z.includes('right') ? 'OQ R' : 'OQ C';
      return null;
    }
  }
  for (const n of ownNames) {
    if (n && z.includes(n)) {
      if (z.includes(' d')) return 'Own D';
      if (z.includes('qtr') || z.includes('quarter'))
        return z.includes('left') ? 'DQ L' : z.includes('right') ? 'DQ R' : 'DQ C';
      return null;
    }
  }

  // Generic zones (need inversion for away)
  let grid = null;
  if (z.includes('opp') && z.includes('mid'))
    grid = z.includes('left') ? 'OM L' : z.includes('right') ? 'OM R' : 'OM C';
  else if (z.includes('opp') && (z.includes('quarter') || z.includes('qtr')))
    grid = z.includes('left') ? 'OQ L' : z.includes('right') ? 'OQ R' : 'OQ C';
  else if (z.includes('own') && z.includes('mid'))
    grid = z.includes('left') ? 'DM L' : z.includes('right') ? 'DM R' : 'DM C';
  else if (z.includes('own') && (z.includes('quarter') || z.includes('qtr')))
    grid = z.includes('left') ? 'DQ L' : z.includes('right') ? 'DQ R' : 'DQ C';
  else if (z === 'centre') grid = 'Centre';
  else if (z.includes('opp') && z.includes(' d')) grid = 'Opp D';
  else if (z.includes('own') && z.includes(' d')) grid = 'Own D';

  // Invert for away team
  if (grid && !isHome) {
    const INV = {
      'Opp D': 'Own D', 'Own D': 'Opp D',
      'OQ L': 'DQ R', 'OQ C': 'DQ C', 'OQ R': 'DQ L',
      'OM L': 'DM R', 'OM C': 'DM C', 'OM R': 'DM L',
      'DM L': 'OM R', 'DM C': 'OM C', 'DM R': 'OM L',
      'DQ L': 'OQ R', 'DQ C': 'OQ C', 'DQ R': 'OQ L',
      'Centre': 'Centre',
    };
    grid = INV[grid] || grid;
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
  if (!z) return 'C';
  if (z.endsWith('L')) return 'L';
  if (z.endsWith('R')) return 'R';
  return 'C';
}

/**
 * Analyse play patterns for a team.
 * @param {Array} matches - matches with home_team, away_team objects
 * @param {Object} eventsByMatch - { matchId: [raw events] }
 * @param {string} teamId
 */
export function analysePlayPatterns(matches, eventsByMatch, teamId) {
  const allSeqs = [];

  for (const m of matches) {
    const isHome = m.home_team_id === teamId;
    const ownTeam = isHome ? m.home_team : m.away_team;
    const oppTeam = isHome ? m.away_team : m.home_team;
    const ownNames = teamNames(ownTeam);
    const oppNames = teamNames(oppTeam);

    const events = (eventsByMatch[m.id] || [])
      .filter(e => e.team && e.match_time != null && e.zone)
      .sort((a, b) => (a.match_time - b.match_time) || ((a.seq || 0) - (b.seq || 0)));

    let seq = [];
    for (const e of events) {
      const isMine = (e.team === 'home' && isHome) || (e.team === 'away' && !isHome);
      const g = toGrid(e.zone, isHome, ownNames, oppNames);
      if (!g) continue;
      const b = band(g);
      if (b < 0) continue;

      if (isMine) {
        seq.push({ zone: g, lane: lane(g), band: b, event: e.event || '' });
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
    const si = seq.findIndex(s => s.band <= 2);
    if (si < 0) continue;
    const sub = seq.slice(si);
    const path = [];
    let ok = false;
    for (const s of sub) {
      path.push(s);
      if (s.band >= 4) { ok = true; break; }
    }
    if (ok) exitPaths.push(path);
  }

  // === ATTACK: centre/own mid (band 2-3) → opp quarter (band ≥5) ===
  const attackPaths = [];
  for (const seq of allSeqs) {
    const si = seq.findIndex(s => s.band >= 2 && s.band <= 3);
    if (si < 0) continue;
    const sub = seq.slice(si);
    const path = [];
    let ok = false;
    for (const s of sub) {
      path.push(s);
      if (s.band >= 5) { ok = true; break; }
    }
    if (ok) attackPaths.push(path);
  }

  // === D ENTRY: opp quarter (band 5) → opp D (band 6), excluding set pieces ===
  const SET_PIECES = ['Short Corner', 'Long Corner', 'Penalty Corner', 'Penalty Stroke'];
  const dEntryPaths = [];
  for (const seq of allSeqs) {
    const si = seq.findIndex(s => s.band === 5);
    if (si < 0) continue;
    const sub = seq.slice(si);
    const path = [];
    let ok = false;
    for (const s of sub) {
      path.push(s);
      if (s.band === 6) {
        // Check if this D entry came from a set piece
        const prevEvent = path.length >= 2 ? path[path.length - 2].event : '';
        const thisEvent = s.event || '';
        const isSetPiece = SET_PIECES.some(sp => thisEvent.includes(sp) || prevEvent.includes(sp));
        if (!isSetPiece) ok = true;
        break;
      }
    }
    if (ok) dEntryPaths.push(path);
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
  const n = paths.length;
  const laneCounts = { start: {}, transit: {}, entry: {} };

  for (const path of paths) {
    laneCounts.start[path[0].lane] = (laneCounts.start[path[0].lane] || 0) + 1;

    if (type === 'exit') {
      const t = path.find(s => s.band === 2) || path.find(s => s.band === 3);
      if (t) laneCounts.transit[t.lane] = (laneCounts.transit[t.lane] || 0) + 1;
      const e = path.find(s => s.band >= 4);
      if (e) laneCounts.entry[e.lane] = (laneCounts.entry[e.lane] || 0) + 1;
    } else if (type === 'attack') {
      const t = path.find(s => s.band === 4);
      if (t) laneCounts.transit[t.lane] = (laneCounts.transit[t.lane] || 0) + 1;
      const e = path.find(s => s.band >= 5);
      if (e) laneCounts.entry[e.lane] = (laneCounts.entry[e.lane] || 0) + 1;
    } else if (type === 'dEntry') {
      let lastOQ = null;
      for (const s of path) {
        if (s.band === 5) lastOQ = s.lane;
        if (s.band === 6) break;
      }
      if (lastOQ) laneCounts.entry[lastOQ] = (laneCounts.entry[lastOQ] || 0) + 1;
    }
  }

  const topLane = (obj) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
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

/**
 * Get top 3 prominent player zones — zones with most passing/possession events.
 * Returns array of grid zone names e.g. ['DM C', 'OM C', 'DM L']
 */
export function getProminentZones(matches, eventsByMatch, teamId, topN = 3) {
  const zoneCounts = {};

  for (const m of matches) {
    const isHome = m.home_team_id === teamId;
    const ownTeam = isHome ? m.home_team : m.away_team;
    const oppTeam = isHome ? m.away_team : m.home_team;
    const ownNames = teamNames(ownTeam);
    const oppNames = teamNames(oppTeam);

    const events = (eventsByMatch[m.id] || [])
      .filter(e => e.team && e.zone);

    for (const e of events) {
      const isMine = (e.team === 'home' && isHome) || (e.team === 'away' && !isHome);
      if (!isMine) continue;
      const g = toGrid(e.zone, isHome, ownNames, oppNames);
      if (!g || g === 'Own D' || g === 'Opp D') continue;
      zoneCounts[g] = (zoneCounts[g] || 0) + 1;
    }
  }

  return Object.entries(zoneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([zone]) => zone);
}


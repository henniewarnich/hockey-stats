// Shared stat computation for coach views

export const STATS = [
  { key: "dEntries", label: "D Entries" },
  { key: "shotsOn", label: "Shots On" },
  { key: "shotsOff", label: "Shots Off" },
  { key: "shortCorners", label: "Short Crnrs" },
  { key: "longCorners", label: "Long Crnrs" },
  { key: "turnoversWon", label: "TOs Won" },
  { key: "possLost", label: "Poss Lost" },
];

export const DISPLAY_STATS = [
  { label: "Shots On %", calc: (s) => { const t = s.shotsOn + s.shotsOff; return t > 0 ? Math.round(s.shotsOn / t * 100) : 0; }, suffix: "%" },
  { label: "Shots Off %", calc: (s) => { const t = s.shotsOn + s.shotsOff; return t > 0 ? Math.round(s.shotsOff / t * 100) : 0; }, suffix: "%" },
  { label: "Short Crnr %", calc: (s) => s.dEntries > 0 ? Math.round(s.shortCorners / s.dEntries * 100) : 0, suffix: "%" },
  { label: "Territory", calc: (s) => s.territory || 0, suffix: "%" },
];

export const INVERTED = ["possLost", "shotsOff"];

export function computeStats(events, team, startTime, endTime) {
  const real = events.filter(e =>
    e.team === team && e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const all = events.filter(e =>
    e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const teamCount = real.length;
  const totalCount = all.length || 1;

  return {
    goals: real.filter(e => e.event?.startsWith("Goal!")).length,
    dEntries: real.filter(e => e.event === "D Entry").length,
    atkZoneEntries: real.filter(e => e.zone?.includes("Opp Quarter")).length,
    shotsOn: real.filter(e => e.event === "Shot on Goal").length,
    shotsOff: real.filter(e => e.event === "Shot Off Target").length,
    shortCorners: real.filter(e => e.event === "Short Corner").length,
    longCorners: real.filter(e => e.event === "Long Corner").length,
    turnoversWon: real.filter(e => e.event === "Turnover Won").length,
    possLost: real.filter(e => e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out")).length,
    territory: Math.round(teamCount / totalCount * 100),
  };
}

// Compute stats for a team across a match, normalizing home/away
export function computeMatchStats(events, teamId, homeTeamId) {
  const teamSide = teamId === homeTeamId ? "home" : "away";
  const oppSide = teamSide === "home" ? "away" : "home";
  const team = computeStats(events, teamSide, 0, 999999);
  const opp = computeStats(events, oppSide, 0, 999999);
  return { team, opp, teamSide, oppSide };
}

export function getQuarters(events, breakFormat, matchLength, matchTime) {
  if (breakFormat === "quarters") {
    const pauses = events.filter(e => e.team === "meta" && e.detail).sort((a, b) => a.time - b.time);
    const boundaries = [0];
    pauses.forEach(p => {
      if (p.detail === "Quarter Break" || p.detail === "Half Time") boundaries.push(p.time);
    });
    boundaries.push(999999);
    return [
      { label: "Q1", start: boundaries[0], end: boundaries[1] || 999999, status: boundaries.length > 2 ? "complete" : "live" },
      { label: "Q2", start: boundaries[1] || 999999, end: boundaries[2] || 999999, status: boundaries.length > 3 ? "complete" : boundaries.length > 2 ? "live" : "upcoming" },
      { label: "Q3", start: boundaries[2] || 999999, end: boundaries[3] || 999999, status: boundaries.length > 4 ? "complete" : boundaries.length > 3 ? "live" : "upcoming" },
      { label: "Q4", start: boundaries[3] || 999999, end: boundaries[4] || 999999, status: boundaries.length > 5 ? "complete" : boundaries.length > 4 ? "live" : "upcoming" },
    ];
  }
  const totalSec = (matchLength || 60) * 60;
  const qLen = totalSec / 4;
  const labels = ["1st", "2nd", "3rd", "4th"];
  const elapsed = matchTime || 0;
  return labels.map((label, i) => {
    const start = Math.round(qLen * i);
    const end = i === 3 ? 999999 : Math.round(qLen * (i + 1));
    const status = elapsed >= end ? "complete" : elapsed >= start ? "live" : "upcoming";
    return { label, start, end, status };
  });
}

// Aggregate stats across multiple matches (each with {team, opp})
export function aggregateStats(matchStatsList) {
  const n = matchStatsList.length || 1;
  const sum = (key) => matchStatsList.reduce((s, m) => s + m.team[key], 0);
  const sumOpp = (key) => matchStatsList.reduce((s, m) => s + m.opp[key], 0);
  const avgTerritory = Math.round(matchStatsList.reduce((s, m) => s + m.team.territory, 0) / n);
  const avgOppTerritory = Math.round(matchStatsList.reduce((s, m) => s + m.opp.territory, 0) / n);

  return {
    team: {
      goals: sum("goals"), dEntries: sum("dEntries"), atkZoneEntries: sum("atkZoneEntries"),
      shotsOn: sum("shotsOn"), shotsOff: sum("shotsOff"), shortCorners: sum("shortCorners"),
      longCorners: sum("longCorners"), turnoversWon: sum("turnoversWon"), possLost: sum("possLost"),
      territory: avgTerritory,
    },
    opp: {
      goals: sumOpp("goals"), dEntries: sumOpp("dEntries"), atkZoneEntries: sumOpp("atkZoneEntries"),
      shotsOn: sumOpp("shotsOn"), shotsOff: sumOpp("shotsOff"), shortCorners: sumOpp("shortCorners"),
      longCorners: sumOpp("longCorners"), turnoversWon: sumOpp("turnoversWon"), possLost: sumOpp("possLost"),
      territory: avgOppTerritory,
    },
    matchCount: n,
  };
}

// Get Monday of a given date's week
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

// Convert match_stats rows (from archive) into the same format as computeMatchStats
// rows: array of { team, quarter, goals, shots_on, ... } for a single match
// teamId + homeTeamId: to determine which side is "team" vs "opp"
export function statsFromArchive(rows, teamId, homeTeamId) {
  const teamSide = teamId === homeTeamId ? 'home' : 'away';
  const oppSide = teamSide === 'home' ? 'away' : 'home';

  const toStats = (row) => ({
    goals: row?.goals || 0,
    dEntries: row?.d_entries || 0,
    atkZoneEntries: row?.atk_zone_entries || 0,
    shotsOn: row?.shots_on || 0,
    shotsOff: row?.shots_off || 0,
    shortCorners: row?.short_corners || 0,
    longCorners: row?.long_corners || 0,
    turnoversWon: row?.turnovers_won || 0,
    possLost: row?.poss_lost || 0,
    territory: row?.territory_pct || 0,
  });

  const teamTotals = rows.find(r => r.team === teamSide && (r.quarter === 0 || r.quarter === null));
  const oppTotals = rows.find(r => r.team === oppSide && (r.quarter === 0 || r.quarter === null));

  return {
    team: toStats(teamTotals),
    opp: toStats(oppTotals),
    teamSide,
    oppSide,
  };
}

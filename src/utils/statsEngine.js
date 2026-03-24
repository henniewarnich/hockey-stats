// Stats computation shared between CoachLiveScreen and CoachTeamStats

export const STATS = [
  { key: "dEntries", label: "D Entries" },
  { key: "shotsOn", label: "Shots on Goal" },
  { key: "shotsOff", label: "Shots off Target" },
  { key: "shortCorners", label: "Short Corners" },
  { key: "longCorners", label: "Long Corners" },
  { key: "turnoversWon", label: "Turnovers Won" },
  { key: "possLost", label: "Poss Lost" },
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
    shotsOn: real.filter(e => e.event === "Shot on Goal").length,
    shotsOff: real.filter(e => e.event === "Shot Off Target").length,
    shortCorners: real.filter(e => e.event === "Short Corner").length,
    longCorners: real.filter(e => e.event === "Long Corner").length,
    turnoversWon: real.filter(e => e.event === "Turnover Won").length,
    possLost: real.filter(e => e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out")).length,
    territory: Math.round(teamCount / totalCount * 100),
  };
}

export function getQuarters(events, breakFormat, matchLength, matchTime) {
  if (breakFormat === "quarters") {
    const pauses = events.filter(e => e.team === "meta" && e.detail).sort((a, b) => a.time - b.time);
    const boundaries = [0];
    pauses.forEach(p => {
      if (p.detail === "Quarter Break" || p.detail === "Half Time") {
        boundaries.push(p.time);
      }
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

// Aggregate stats across multiple matches for one side
export function aggregateStats(matchStats) {
  const agg = { goals: 0, dEntries: 0, shotsOn: 0, shotsOff: 0, shortCorners: 0, longCorners: 0, turnoversWon: 0, possLost: 0, territory: 0 };
  if (matchStats.length === 0) return agg;
  matchStats.forEach(s => {
    Object.keys(agg).forEach(k => { agg[k] += s[k]; });
  });
  agg.territory = Math.round(agg.territory / matchStats.length);
  return agg;
}

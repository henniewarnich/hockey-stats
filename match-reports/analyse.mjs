// Compute match stats using the EXACT same formulas as src/utils/stats.js
// (after the v7.24.5 fixes: Territory uses event.team as attacker proxy
// in D zones; Possession Lost = own Poss Conceded* + own Sideline Out* +
// opponent's Turnover Won.)
//
// Usage: node analyse.mjs path/to/match.json

import { readFileSync } from 'fs';

const path = process.argv[2];
if (!path) { console.error('Usage: node analyse.mjs <match.json>'); process.exit(1); }
const data = JSON.parse(readFileSync(path, 'utf8'));
const events = data.events;

function computeStats(events, team, startTime, endTime) {
  const real = events.filter(e =>
    e.team === team && e.time >= startTime && e.time <= endTime &&
    e.team !== 'commentary' && e.team !== 'meta'
  );
  const oppTeam = team === 'home' ? 'away' : 'home';
  const oppEvents = events.filter(e =>
    e.team === oppTeam && e.time >= startTime && e.time <= endTime
  );

  // Time-based possession + territory
  const allReal = events.filter(e =>
    (e.team === 'home' || e.team === 'away') &&
    e.time >= startTime && e.time <= endTime
  ).sort((a, b) => (a.time || 0) - (b.time || 0));

  let possTime = 0, terrTime = 0, totalTime = 0;
  for (let i = 0; i < allReal.length; i++) {
    const cur = allReal[i];
    const nextTime = i < allReal.length - 1 ? allReal[i + 1].time : endTime;
    const dur = Math.max(0, Math.min(nextTime, endTime) - cur.time);
    if (dur > 300) continue;
    totalTime += dur;
    if (cur.team === team) possTime += dur;
    const z = cur.zone || '';
    const isD = z.includes(' D');
    const ballInTeamAttackHalf = team === 'home'
      ? (z.startsWith('Opp ') || (isD && cur.team === 'home'))
      : (z.startsWith('Own ') || (isD && cur.team === 'away'));
    if (ballInTeamAttackHalf && !z.includes('Centre')) terrTime += dur;
  }

  const possession = totalTime > 0 ? Math.round(possTime / totalTime * 100) : 0;
  const territory = totalTime > 0 ? Math.round(terrTime / totalTime * 100) : 0;

  const ownConceded = real.filter(e =>
    (e.event && e.event.startsWith('Poss Conceded')) ||
    (e.event && e.event.startsWith('Sideline Out'))
  ).length;
  const oppTurnovers = oppEvents.filter(e => e.event === 'Turnover Won').length;

  // Attack chances — sequential 6-rule analyser
  const sorted = events
    .filter(e => e.time >= startTime && e.time <= endTime && e.team !== 'commentary' && e.team !== 'meta')
    .sort((a, b) => (a.time || 0) - (b.time || 0) || (a.seq || 0) - (b.seq || 0));
  const isAtk = (zone) => zone && (team === 'home' ? zone.includes('Opp Quarter') : zone.includes('Own Quarter'));
  const isAtkD = (zone) => zone && zone.includes(' D');
  let chances = 0;
  let prevZone = null;
  for (const e of sorted) {
    const isUs = e.team === team;
    const zone = e.zone || '';
    const ev = e.event || '';
    const inAtk = isAtk(zone);
    const prevInAtk = isAtk(prevZone);
    const prevInD = isAtkD(prevZone);
    if (isUs && ev === 'D Entry' && !prevInAtk && !prevInD) chances++;
    else if (isUs && inAtk && !prevInAtk && !prevInD && prevZone) chances++;
    else if (ev === 'Ball Dead' && inAtk) chances++;
    else if (isUs && ev === 'Long Corner') chances++;
    else if (isUs && ev === 'Short Corner') chances++;
    else if (isUs && ev === 'Turnover Won' && inAtk) chances++;
    if (zone) prevZone = zone;
  }

  return {
    possession,
    territory,
    goals: real.filter(e => e.event?.startsWith('Goal!')).length,
    scGoals: real.filter(e => e.event === 'Goal! (SC)').length,
    dEntries: real.filter(e => e.event === 'D Entry').length,
    atkChances: chances,
    shotsOn: real.filter(e => e.event === 'Shot on Goal').length,
    shotsOff: real.filter(e => e.event === 'Shot Off Target').length,
    shortCorners: real.filter(e => e.event === 'Short Corner').length,
    longCorners: real.filter(e => e.event === 'Long Corner').length,
    turnoversWon: real.filter(e => e.event === 'Turnover Won').length,
    possLost: ownConceded + oppTurnovers,
    overheads: real.filter(e => e.event === 'Overhead throw').length,
  };
}

// Ball Movement DNA — direction labels swap for away
function computeDNA(events, team) {
  const real = events.filter(e => e.team === team);
  let fwd = 0, back = 0, across = 0;
  for (const e of real) {
    const ev = e.event;
    if (team === 'home') {
      if (ev === 'Ball forward' || ev === 'D Entry' || ev === 'Ball in play') fwd++;
      else if (ev === 'Ball back') back++;
      else if (ev === 'Ball across') across++;
    } else {
      if (ev === 'Ball back' || ev === 'D Entry' || ev === 'Ball in play') fwd++;
      else if (ev === 'Ball forward') back++;
      else if (ev === 'Ball across') across++;
    }
  }
  const total = fwd + back + across || 1;
  return {
    fwd: Math.round(fwd / total * 100),
    back: Math.round(back / total * 100),
    across: Math.round(across / total * 100),
    rawFwd: fwd, rawBack: back, rawAcross: across,
  };
}

const home = computeStats(events, 'home', 0, 999999);
const away = computeStats(events, 'away', 0, 999999);
const homeDNA = computeDNA(events, 'home');
const awayDNA = computeDNA(events, 'away');

const result = {
  match: {
    id: data.matchId,
    date: data.date,
    duration: data.duration,
    matchLength: data.matchLength,
    venue: data.venue,
    matchType: data.matchType,
    home: data.teams.home,
    away: data.teams.away,
    score: data.score,
  },
  home, away, homeDNA, awayDNA,
};
console.log(JSON.stringify(result, null, 2));

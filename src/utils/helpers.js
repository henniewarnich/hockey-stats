import { teamShortName } from './teams.js';

// Time formatting
export const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export const fmtTs = (s) =>
  `${Math.floor(s / 60)}'${String(s % 60).padStart(2, "0")}`;

// LocalStorage helpers
export function loadData(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

// Position label
export const posLabel = (p) =>
  p === "left" ? "Left" : p === "right" ? "Right" : "Centre";

// Other team
export const otherTeam = (t) => (t === "home" ? "away" : "home");

// Export match as JSON file
export function exportMatchJSON(game) {
  const data = {
    matchId: game.id,
    version: "3.0",
    date: game.date,
    duration: game.duration,
    matchLength: game.matchLength || null,
    breakFormat: game.breakFormat || null,
    venue: game.venue || null,
    matchType: game.matchType || null,
    teams: { home: game.teams.home, away: game.teams.away },
    score: { home: game.homeScore, away: game.awayScore },
    events: [...(game.events || [])].reverse(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dn = new Date(game.date);
  const fn = `match-${dn.toISOString().slice(0, 10)}-${teamShortName(game.teams.home).replace(/\s+/g, "-")}-vs-${teamShortName(game.teams.away).replace(/\s+/g, "-")}.json`;
  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    window.open(url);
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = fn;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// SAST timezone helpers — all match dates/times are stored as SAST (UTC+2)
/** Parse a match_date + optional scheduled_time as SAST → correct Date object */
export function parseSAST(matchDate, scheduledTime) {
  const time = scheduledTime ? scheduledTime.slice(0, 5) : '12:00';
  return new Date(`${matchDate}T${time}:00+02:00`);
}

/** Parse a date-only string as SAST (uses noon to avoid day-rollover in any timezone) */
export function parseSASTDate(matchDate) {
  return new Date(`${matchDate}T12:00:00+02:00`);
}

// Generate unique ID
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Color contrast — pick a different color for away team if too similar to home
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const colorDist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

const CONTRAST_POOL = ["#DC2626", "#1D4ED8", "#16A34A", "#7C3AED", "#EA580C", "#0D9488", "#DB2777", "#CA8A04", "#475569", "#4338CA"];

export function ensureContrastingColors(homeColor, awayColor) {
  if (!homeColor || !awayColor) return { homeColor, awayColor };
  const dist = colorDist(hexToRgb(homeColor), hexToRgb(awayColor));
  if (dist > 120) return { homeColor, awayColor }; // different enough
  // Colors clash — give away team yellow or blue, whichever contrasts better with home
  const homeRgb = hexToRgb(homeColor);
  const yellowDist = colorDist(homeRgb, hexToRgb("#F59E0B"));
  const blueDist = colorDist(homeRgb, hexToRgb("#1D4ED8"));
  return { homeColor, awayColor: yellowDist > blueDist ? "#F59E0B" : "#1D4ED8" };
}

// Calculate period durations from match length and break format
export function calcPeriods(matchLength, breakFormat) {
  if (!matchLength) return null;
  const periods = breakFormat === "quarters" ? 4 : breakFormat === "halves" ? 2 : 1;
  const perPeriod = Math.floor(matchLength / periods);
  return { periods, perPeriod, total: matchLength };
}

/**
 * Match outcome for a team: 'W', 'D', or 'L'.
 * Considers penalty shootout when regulation is a draw.
 */
export function matchOutcome(m, teamId) {
  const isHome = (m.home_team_id || m.home_team?.id) === teamId;
  const my = isHome ? m.home_score : m.away_score;
  const their = isHome ? m.away_score : m.home_score;
  if (my > their) return 'W';
  if (my < their) return 'L';
  // Draw in regulation — check penalties
  if (m.home_penalty_score != null && m.away_penalty_score != null) {
    const myPen = isHome ? m.home_penalty_score : m.away_penalty_score;
    const theirPen = isHome ? m.away_penalty_score : m.home_penalty_score;
    if (myPen > theirPen) return 'W';
    if (myPen < theirPen) return 'L';
  }
  return 'D';
}

/**
 * Overall match winner: 'home', 'away', or 'draw'.
 * Considers penalty shootout when regulation is tied.
 */
export function matchWinner(m) {
  if (m.home_score > m.away_score) return 'home';
  if (m.away_score > m.home_score) return 'away';
  if (m.home_penalty_score != null && m.away_penalty_score != null) {
    if (m.home_penalty_score > m.away_penalty_score) return 'home';
    if (m.away_penalty_score > m.home_penalty_score) return 'away';
  }
  return 'draw';
}

/**
 * Format score string: "2–1" or "1–1 (3-2 pen)"
 */
export function formatScore(m, isHome = true) {
  const hs = isHome ? m.home_score : m.away_score;
  const as_ = isHome ? m.away_score : m.home_score;
  let s = `${hs}–${as_}`;
  if (m.home_penalty_score != null && m.away_penalty_score != null) {
    const hp = isHome ? m.home_penalty_score : m.away_penalty_score;
    const ap = isHome ? m.away_penalty_score : m.home_penalty_score;
    s += ` (${hp}-${ap} pen)`;
  }
  return s;
}

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
    events: [...game.events].reverse(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dn = new Date(game.date);
  const fn = `match-${dn.toISOString().slice(0, 10)}-${game.teams.home.name.replace(/\s+/g, "-")}-vs-${game.teams.away.name.replace(/\s+/g, "-")}.json`;
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

// Generate unique ID
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Calculate period durations from match length and break format
export function calcPeriods(matchLength, breakFormat) {
  if (!matchLength) return null;
  const periods = breakFormat === "quarters" ? 4 : breakFormat === "halves" ? 2 : 1;
  const perPeriod = Math.floor(matchLength / periods);
  return { periods, perPeriod, total: matchLength };
}

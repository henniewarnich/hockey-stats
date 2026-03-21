import { otherTeam } from './helpers.js';

export function generateInsight(team, event, allEvents, teams) {
  const real = allEvents.filter(e => e.team !== "commentary" && e.team !== "meta");
  if (real.length < 3) return null;

  const T = teams[team];
  const opp = teams[otherTeam(team)];
  if (!T || !opp) return null;

  const hE = real.filter(e => e.team === "home").length;
  const aE = real.filter(e => e.team === "away").length;
  const dEn = (t) => real.filter(e => e.team === t && e.event === "D Entry").length;
  const shots = (t) => real.filter(e => e.team === t && (e.event === "Shot on Goal" || e.event === "Shot Off Target")).length;
  const goals = (t) => real.filter(e => e.team === t && e.event.startsWith("Goal!")).length;
  const to = (t) => real.filter(e => e.team === t && e.event === "Turnover Won").length;
  const oqE = (t) => real.filter(e => e.team === t && e.zone?.includes("Opp Quarter")).length;

  const rec = real.slice(0, 8);
  const lE = rec.filter(e => e.zone?.includes("Left")).length;
  const rE = rec.filter(e => e.zone?.includes("Right")).length;
  const side = lE > rE + 1 ? "down the left" : rE > lE + 1 ? "down the right" : "through the middle";

  const pool = [];

  if (event === "D Entry") {
    const my = dEn(team), oq = oqE(team);
    if (oq > 0) pool.push(`${T.name} converting ${Math.round(my / oq * 100)}% of attacking quarter entries into D penetrations.`);
    if (my >= 3) pool.push(`${T.name} piling on pressure with ${my} D entries.`);
    if (my === 1) pool.push(`${T.name} penetrate the D for the first time.`);
    else if (my >= 2) pool.push(`${T.name} enter the D again ${side}. That's ${my} entries.`);
    if (shots(team) > 0 && goals(team) === 0) pool.push(`${T.name} have ${shots(team)} shots but nothing to show for it.`);
  }

  if (event.startsWith("Goal!")) {
    const g = goals(team), og = goals(otherTeam(team));
    const sc = real.filter(e => e.team === team && e.event === "Short Corner").length;
    const scg = real.filter(e => e.team === team && e.event === "Goal! (SC)").length;
    if (event === "Goal! (SC)") pool.push(`${T.name} convert from short corner! ${scg} from ${sc} (${sc > 0 ? Math.round(scg / sc * 100) : 0}%).`);
    if (g === 1 && og === 0) pool.push(`${T.name} break the deadlock!`);
    else if (g === og) pool.push(`${T.name} equalise!`);
    else if (g > og) pool.push(`${T.name} lead ${g}-${og}.`);
    if (dEn(team) > 0) pool.push(`Clinical — converting ${Math.round(g / dEn(team) * 100)}% of D entries.`);
  }

  if (event === "Turnover Won") {
    if (to(team) >= 3) pool.push(`${T.name} win it back again — ${to(team)} turnovers. Relentless.`);
  }

  if (event === "Short Corner") {
    const sc = real.filter(e => e.team === team && e.event === "Short Corner").length;
    const de = dEn(team);
    if (de > 0) pool.push(`${T.name} earning SCs from ${Math.round(sc / de * 100)}% of D entries.`);
    if (sc === 1) pool.push(`${T.name} earn a short corner.`);
    else pool.push(`Short corner #${sc} for ${T.name}.`);
  }

  if (event === "Penalty") {
    pool.push(`Penalty! ${T.name} have a golden opportunity.`);
  }

  return pool.length === 0 ? null : pool[Math.floor(Math.random() * pool.length)];
}

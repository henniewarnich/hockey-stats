import { otherTeam } from './helpers.js';

export function generateInsight(team, event, allEvents, teams) {
  const real = allEvents.filter(e => e.team !== "commentary" && e.team !== "meta");
  if (real.length < 3) return null;

  const T = teams[team];
  const opp = teams[otherTeam(team)];
  if (!T || !opp) return null;

  const hE = real.filter(e => e.team === "home").length;
  const aE = real.filter(e => e.team === "away").length;
  const hPct = Math.round(hE / (hE + aE) * 100);
  const dEn = (t) => real.filter(e => e.team === t && e.event === "D Entry").length;
  const shots = (t) => real.filter(e => e.team === t && (e.event === "Shot on Goal" || e.event === "Shot Off Target")).length;
  const goals = (t) => real.filter(e => e.team === t && e.event.startsWith("Goal!")).length;
  const to = (t) => real.filter(e => e.team === t && e.event === "Turnover Won").length;
  const pl = (t) => real.filter(e => e.team === t && (e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out"))).length;
  const oqE = (t) => real.filter(e => e.team === t && e.zone?.includes("Opp Quarter")).length;
  const defE = (t) => real.filter(e => e.team === t && e.zone?.includes("Own Quarter")).length;

  // Recent momentum — last 10 events
  const rec = real.slice(0, 10);
  const recTeam = rec.filter(e => e.team === team).length;
  const recOpp = rec.filter(e => e.team === otherTeam(team)).length;
  const lE = rec.filter(e => e.zone?.includes("Left")).length;
  const rE = rec.filter(e => e.zone?.includes("Right")).length;
  const side = lE > rE + 1 ? "down the left" : rE > lE + 1 ? "down the right" : "through the middle";

  // Possession dominance
  const teamPoss = team === "home" ? hPct : 100 - hPct;
  const oppPoss = 100 - teamPoss;

  const pool = [];

  // ── D ENTRY ──
  if (event === "D Entry") {
    const my = dEn(team), oq = oqE(team), oppD = dEn(otherTeam(team));
    if (my === 1) pool.push(`${T.name} penetrate the D for the first time.`);
    if (my >= 2) pool.push(`${T.name} enter the D again ${side}. That's ${my} entries now.`);
    if (my >= 3) pool.push(`${T.name} piling on pressure — ${my} D entries.`);
    if (my >= 4 && goals(team) === 0) pool.push(`${T.name} knocking on the door with ${my} D entries but can't find the breakthrough.`);
    if (oq > 0) pool.push(`${T.name} converting ${Math.round(my / oq * 100)}% of Opp Quarter entries into D penetrations.`);
    if (shots(team) > 0 && goals(team) === 0) pool.push(`${T.name} have ${shots(team)} shots but nothing to show for it yet.`);
    if (my > oppD + 2) pool.push(`${T.name} dominating the attacking play — ${my} D entries to ${opp.name}'s ${oppD}.`);

    // Momentum narratives
    if (recTeam >= 7) pool.push(`${T.name} are on the front foot — dominating recent play.`);
    if (oppD === 0 && my >= 2) pool.push(`All one-way traffic. ${opp.name} yet to threaten the D.`);
  }

  // ── GOAL ──
  if (event.startsWith("Goal!")) {
    const g = goals(team), og = goals(otherTeam(team));
    const sc = real.filter(e => e.team === team && e.event === "Short Corner").length;
    const scg = real.filter(e => e.team === team && e.event === "Goal! (SC)").length;

    if (event === "Goal! (SC)") pool.push(`${T.name} convert from short corner! ${scg} from ${sc} (${sc > 0 ? Math.round(scg / sc * 100) : 0}%).`);
    if (g === 1 && og === 0) pool.push(`${T.name} break the deadlock!`);
    else if (g === og) pool.push(`${T.name} level it up! Game on.`);
    else if (g === og + 1) pool.push(`${T.name} edge ahead ${g}-${og}!`);
    else if (g > og + 1) pool.push(`${T.name} pulling away now — ${g}-${og}.`);
    if (dEn(team) > 0) pool.push(`Clinical from ${T.name} — converting ${Math.round(g / dEn(team) * 100)}% of D entries into goals.`);

    // Match state narratives
    if (g >= 3 && og === 0) pool.push(`Dominant display from ${T.name}. ${opp.name} have no answer.`);
    if (g === og && g >= 2) pool.push(`What a contest! ${g}-${og} — everything to play for.`);
  }

  // ── TURNOVER WON ──
  if (event === "Turnover Won") {
    const myTO = to(team), oppTO = to(otherTeam(team));
    if (myTO === 1) pool.push(`${T.name} win it back — good pressing.`);
    if (myTO >= 2) pool.push(`${T.name} win possession again — ${myTO} turnovers won. The press is working.`);
    if (myTO >= 3) pool.push(`Relentless from ${T.name} — ${myTO} turnovers. ${opp.name} can't hold on to the ball.`);
    if (myTO > oppTO + 2) pool.push(`${T.name} winning the battle for possession — ${myTO} turnovers to ${opp.name}'s ${oppTO}.`);

    // Defensive narratives
    const oppDentries = dEn(otherTeam(team));
    if (oppDentries <= 1 && real.length > 15) pool.push(`${T.name}'s defence is rock solid — ${opp.name} barely getting into the D.`);
  }

  // ── SHORT CORNER ──
  if (event === "Short Corner") {
    const sc = real.filter(e => e.team === team && e.event === "Short Corner").length;
    const de = dEn(team);
    if (sc === 1) pool.push(`${T.name} earn their first short corner.`);
    else pool.push(`Short corner #${sc} for ${T.name}. The pressure builds.`);
    if (de > 0) pool.push(`${T.name} earning SCs from ${Math.round(sc / de * 100)}% of D entries.`);
    if (sc >= 3 && goals(team) === 0) pool.push(`${T.name} with ${sc} short corners but haven't converted yet — set piece conversion needs work.`);
  }

  // ── PENALTY ──
  if (event === "Penalty") {
    pool.push(`Penalty! ${T.name} have a golden opportunity.`);
  }

  // ── POSSESSION CONCEDED — add flow narratives ──
  if (event === "Poss Conceded" || event?.startsWith("Sideline Out")) {
    const myPL = pl(team);
    const recentLosses = rec.filter(e => e.team === team && (e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out"))).length;

    if (recentLosses >= 3) pool.push(`${T.name} losing the ball too often — ${recentLosses} turnovers in the last few minutes.`);
    if (teamPoss < 40 && real.length > 15) pool.push(`${opp.name} controlling possession — ${T.name} under pressure.`);
    if (teamPoss > 55 && real.length > 15 && goals(team) === 0) pool.push(`${T.name} have the ball but can't turn possession into goals.`);

    // Evenly matched narrative
    const possDiff = Math.abs(hPct - 50);
    if (possDiff < 6 && real.length > 20) pool.push(`Evenly poised contest — both teams sharing possession equally.`);
  }

  // ── GENERAL MOMENTUM (triggered by D Entry or Turnover) ──
  if (event === "D Entry" || event === "Turnover Won") {
    const oppDefEvents = defE(otherTeam(team));
    const myAttackEvents = oqE(team);
    if (myAttackEvents > oppDefEvents + 3 && real.length > 15) {
      pool.push(`${T.name} spending most of their time in ${opp.name}'s half. The attacking intent is clear.`);
    }
    if (recOpp >= 7 && recTeam <= 3) {
      pool.push(`${opp.name} building momentum — ${T.name} need to weather this spell.`);
    }
    if (recTeam >= 7 && recOpp <= 3) {
      pool.push(`${T.name} in the ascendancy — controlling the recent play.`);
    }
  }

  if (pool.length === 0) return null;

  // Pick a random insight
  return pool[Math.floor(Math.random() * pool.length)];
}

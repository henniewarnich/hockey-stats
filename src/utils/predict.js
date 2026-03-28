/**
 * Predict match outcome from team records
 * @param {Object} homeRec - { p, w, d, l, gf, ga }
 * @param {Object} awayRec - { p, w, d, l, gf, ga }
 * @param {string} homeName
 * @param {string} awayName
 * @returns {{ homeScore, awayScore, homeWin, draw, awayWin, reasons[] }} or null
 */
export function predictMatch(homeRec, awayRec, homeName, awayName) {
  if (!homeRec || !awayRec || homeRec.p < 5 || awayRec.p < 5) return null;

  const hGpg = homeRec.gf / homeRec.p; // home goals per game
  const hCapg = homeRec.ga / homeRec.p; // home conceded per game
  const aGpg = awayRec.gf / awayRec.p;
  const aCapg = awayRec.ga / awayRec.p;

  // Expected goals: average of team's scoring rate and opponent's conceding rate
  const hExpected = (hGpg + aCapg) / 2;
  const aExpected = (aGpg + hCapg) / 2;

  // Round to nearest integer for predicted score
  const homeScore = Math.round(hExpected);
  const awayScore = Math.round(aExpected);

  // Win/Draw/Loss probability from W/D/L rates + goal difference
  const hWinRate = homeRec.w / homeRec.p;
  const hDrawRate = homeRec.d / homeRec.p;
  const hLossRate = homeRec.l / homeRec.p;
  const aWinRate = awayRec.w / awayRec.p;
  const aDrawRate = awayRec.d / awayRec.p;
  const aLossRate = awayRec.l / awayRec.p;

  // Blend: home's win rate vs away's loss rate, etc.
  let homeWin = Math.round(((hWinRate + aLossRate) / 2) * 100);
  let draw = Math.round(((hDrawRate + aDrawRate) / 2) * 100);
  let awayWin = Math.round(((aWinRate + hLossRate) / 2) * 100);

  // Normalize to 100%
  const total = homeWin + draw + awayWin || 1;
  homeWin = Math.round(homeWin / total * 100);
  awayWin = Math.round(awayWin / total * 100);
  draw = 100 - homeWin - awayWin;

  // Generate reasoning (top 3 signals)
  const reasons = [];
  const hDef = hCapg;
  const aDef = aCapg;

  // Defence comparison
  if (hDef < aDef - 0.3) {
    reasons.push({ type: 'home', text: `${homeName} concede just ${hDef.toFixed(1)}/game — ${awayName} leak ${aDef.toFixed(1)}/game` });
  } else if (aDef < hDef - 0.3) {
    reasons.push({ type: 'away', text: `${awayName} concede just ${aDef.toFixed(1)}/game — ${homeName} leak ${hDef.toFixed(1)}/game` });
  }

  // Attack comparison
  if (hGpg > aGpg + 0.3) {
    reasons.push({ type: 'home', text: `${homeName} outscoring ${awayName} at ${hGpg.toFixed(1)} vs ${aGpg.toFixed(1)} per game` });
  } else if (aGpg > hGpg + 0.3) {
    reasons.push({ type: 'away', text: `${awayName} outscoring ${homeName} at ${aGpg.toFixed(1)} vs ${hGpg.toFixed(1)} per game` });
  }

  // Draw tendency
  if (hDrawRate > 0.3 || aDrawRate > 0.3) {
    const who = hDrawRate > aDrawRate ? homeName : awayName;
    const rate = Math.round(Math.max(hDrawRate, aDrawRate) * 100);
    reasons.push({ type: 'neutral', text: `${who} draw ${rate}% of games — tight margins likely` });
  }

  // Form / GD
  const hGD = (homeRec.gf - homeRec.ga) / homeRec.p;
  const aGD = (awayRec.gf - awayRec.ga) / awayRec.p;
  if (Math.abs(hGD - aGD) > 0.5) {
    const better = hGD > aGD ? homeName : awayName;
    const bgd = hGD > aGD ? hGD : aGD;
    reasons.push({ type: hGD > aGD ? 'home' : 'away', text: `${better} averaging ${bgd > 0 ? '+' : ''}${bgd.toFixed(1)} GD per game` });
  }

  // Win rate dominance
  if (hWinRate > aWinRate + 0.15) {
    reasons.push({ type: 'home', text: `${homeName} win ${Math.round(hWinRate * 100)}% — ${awayName} only ${Math.round(aWinRate * 100)}%` });
  } else if (aWinRate > hWinRate + 0.15) {
    reasons.push({ type: 'away', text: `${awayName} win ${Math.round(aWinRate * 100)}% — ${homeName} only ${Math.round(hWinRate * 100)}%` });
  }

  return {
    homeScore, awayScore,
    homeWin, draw, awayWin,
    reasons: reasons.slice(0, 3),
  };
}

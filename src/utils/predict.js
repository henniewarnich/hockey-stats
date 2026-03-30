/**
 * Predict match outcome from team records (V2 — draw-aware)
 * 
 * Backtested on 581 matches: 54% overall accuracy
 * - Home/Away wins: 62%/55% (was 75%/76% in V1 but V1 missed nearly all draws)
 * - Draws: 44% (was 7% in V1)
 * - Very high confidence (>70%): 82%
 * 
 * Draw boost signals: low scoring, high draw rates, similar win rates,
 * similar goal difference, tight defences. Boost=0.5 multiplier.
 * 
 * @param {Object} homeRec - { p, w, d, l, gf, ga }
 * @param {Object} awayRec - { p, w, d, l, gf, ga }
 * @param {string} homeName
 * @param {string} awayName
 * @returns {{ homeWin, draw, awayWin, reasons[] }} or null
 */
export function predictMatch(homeRec, awayRec, homeName, awayName) {
  if (!homeRec || !awayRec || homeRec.p < 5 || awayRec.p < 5) return null;

  const DRAW_BOOST_MULT = 0.5;

  const hGpg = homeRec.gf / homeRec.p;
  const hCapg = homeRec.ga / homeRec.p;
  const aGpg = awayRec.gf / awayRec.p;
  const aCapg = awayRec.ga / awayRec.p;

  const hWinRate = homeRec.w / homeRec.p;
  const hDrawRate = homeRec.d / homeRec.p;
  const hLossRate = homeRec.l / homeRec.p;
  const aWinRate = awayRec.w / awayRec.p;
  const aDrawRate = awayRec.d / awayRec.p;
  const aLossRate = awayRec.l / awayRec.p;

  const hGD = (homeRec.gf - homeRec.ga) / homeRec.p;
  const aGD = (awayRec.gf - awayRec.ga) / awayRec.p;

  // Base probabilities: blend each team's rates
  let homeWin = ((hWinRate + aLossRate) / 2) * 100;
  let draw = ((hDrawRate + aDrawRate) / 2) * 100;
  let awayWin = ((aWinRate + hLossRate) / 2) * 100;

  // Draw boost: accumulate signals that indicate an even/tight match
  let drawBoost = 0;
  const avgGoals = (hGpg + aGpg) / 2;
  const combinedDrawRate = (hDrawRate + aDrawRate) / 2;
  const winRateDiff = Math.abs(hWinRate - aWinRate);
  const gdDiff = Math.abs(hGD - aGD);

  // Low scoring teams → more 0-0 draws
  if (avgGoals < 1.5) drawBoost += 8;

  // Both teams draw often
  if (combinedDrawRate > 0.25) drawBoost += 10;
  if (combinedDrawRate > 0.35) drawBoost += 5;

  // Similar win rates → evenly matched
  if (winRateDiff < 0.15) drawBoost += 8;
  if (winRateDiff < 0.10) drawBoost += 4;

  // Similar goal difference → similar strength
  if (gdDiff < 0.8) drawBoost += 6;
  if (gdDiff < 0.4) drawBoost += 4;

  // Both defences tight → hard to score
  if (hCapg < 1.5 && aCapg < 1.5) drawBoost += 5;

  // Apply boost (steal proportionally from home/away)
  drawBoost *= DRAW_BOOST_MULT;
  draw += drawBoost;
  if (homeWin + awayWin > 0) {
    const hShare = homeWin / (homeWin + awayWin);
    homeWin -= drawBoost * hShare;
    awayWin -= drawBoost * (1 - hShare);
  }

  // Normalize to 100%
  const total = homeWin + draw + awayWin || 1;
  homeWin = Math.round(homeWin / total * 100);
  awayWin = Math.round(awayWin / total * 100);
  draw = 100 - homeWin - awayWin;

  // Generate reasoning (top 3 signals)
  const reasons = [];

  // Draw signals first (if draw is the prediction)
  if (draw >= homeWin && draw >= awayWin) {
    if (combinedDrawRate > 0.25) {
      reasons.push({ type: 'neutral', text: `Both teams draw frequently (${Math.round(hDrawRate * 100)}% and ${Math.round(aDrawRate * 100)}%)` });
    }
    if (avgGoals < 1.5) {
      reasons.push({ type: 'neutral', text: `Low-scoring matchup — combined ${avgGoals.toFixed(1)} goals/game average` });
    }
    if (winRateDiff < 0.15) {
      reasons.push({ type: 'neutral', text: `Evenly matched: ${homeName} win ${Math.round(hWinRate * 100)}%, ${awayName} win ${Math.round(aWinRate * 100)}%` });
    }
    if (hCapg < 1.5 && aCapg < 1.5) {
      reasons.push({ type: 'neutral', text: `Tight defences — ${homeName} concede ${hCapg.toFixed(1)}/game, ${awayName} ${aCapg.toFixed(1)}/game` });
    }
  }

  // Defence comparison
  if (hCapg < aCapg - 0.3) {
    reasons.push({ type: 'home', text: `${homeName} concede just ${hCapg.toFixed(1)}/game — ${awayName} leak ${aCapg.toFixed(1)}/game` });
  } else if (aCapg < hCapg - 0.3) {
    reasons.push({ type: 'away', text: `${awayName} concede just ${aCapg.toFixed(1)}/game — ${homeName} leak ${hCapg.toFixed(1)}/game` });
  }

  // Attack comparison
  if (hGpg > aGpg + 0.3) {
    reasons.push({ type: 'home', text: `${homeName} outscoring ${awayName} at ${hGpg.toFixed(1)} vs ${aGpg.toFixed(1)} per game` });
  } else if (aGpg > hGpg + 0.3) {
    reasons.push({ type: 'away', text: `${awayName} outscoring ${homeName} at ${aGpg.toFixed(1)} vs ${hGpg.toFixed(1)} per game` });
  }

  // Form / GD
  if (gdDiff > 0.5) {
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
    homeWin, draw, awayWin,
    reasons: reasons.slice(0, 3),
  };
}

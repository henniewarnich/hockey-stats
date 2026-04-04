import { supabase } from './supabase.js';

/**
 * Benchmark comparison engine.
 * Compares a trainee's recorded events against a gold-standard reference.
 * Returns a score breakdown per metric and an overall percentage.
 *
 * Metrics scored:
 * - Goals (exact count per team)
 * - D Entries (count per team, ±2 tolerance)
 * - Short Corners (count per team, ±2 tolerance)
 * - Shots on Goal (count per team, ±2 tolerance)
 * - Turnovers Won (count per team, ±3 tolerance)
 * - Zone accuracy (% of trainee events in correct zone)
 */

// Count events by type and team
function countEvents(events, eventType) {
  const home = events.filter(e => e.team === 'home' && e.event === eventType).length;
  const away = events.filter(e => e.team === 'away' && e.event === eventType).length;
  return { home, away, total: home + away };
}

// Count events matching multiple types
function countEventTypes(events, types) {
  const home = events.filter(e => e.team === 'home' && types.includes(e.event)).length;
  const away = events.filter(e => e.team === 'away' && types.includes(e.event)).length;
  return { home, away, total: home + away };
}

// Score a count metric: how close trainee is to reference (0-100)
function scoreCount(traineeCount, refCount, tolerance = 0) {
  if (refCount === 0 && traineeCount === 0) return 100;
  if (refCount === 0) return Math.max(0, 100 - traineeCount * 20); // penalty for false positives
  const diff = Math.abs(traineeCount - refCount);
  if (diff <= tolerance) return 100;
  const overTolerance = diff - tolerance;
  return Math.max(0, Math.round(100 - (overTolerance / refCount) * 100));
}

// Score zone accuracy: what % of trainee events landed in the same zone as the nearest reference event
function scoreZoneAccuracy(traineeEvents, refEvents) {
  if (refEvents.length === 0) return 100;

  // Match each trainee event to nearest ref event by time, check zone
  let correct = 0;
  let total = 0;

  // Only score events that have zone data
  const traineeZoned = traineeEvents.filter(e => e.zone && e.team);
  const refZoned = refEvents.filter(e => e.zone && e.team);

  if (refZoned.length === 0) return 100;

  for (const te of traineeZoned) {
    // Find nearest ref event of same team within ±30 seconds
    const candidates = refZoned.filter(re =>
      re.team === te.team &&
      Math.abs((re.match_time || 0) - (te.match_time || 0)) <= 30
    );
    if (candidates.length === 0) continue;

    // Pick closest by time
    const nearest = candidates.reduce((best, c) =>
      Math.abs((c.match_time || 0) - (te.match_time || 0)) <
      Math.abs((best.match_time || 0) - (te.match_time || 0)) ? c : best
    );

    total++;
    if (nearest.zone === te.zone) correct++;
  }

  return total === 0 ? 100 : Math.round((correct / total) * 100);
}

/**
 * Compare trainee events against reference events.
 * @param {Array} traineeEvents - Events from the trainee's attempt
 * @param {Array} refEvents - Gold-standard reference events
 * @returns {Object} { metrics: [...], overall: number, passed: boolean }
 */
export function compareBenchmark(traineeEvents, refEvents) {
  const metrics = [];

  // 1. Goals
  const tGoals = countEventTypes(traineeEvents, ['Goal!', 'Goal! (SC)']);
  const rGoals = countEventTypes(refEvents, ['Goal!', 'Goal! (SC)']);
  const goalScore = scoreCount(tGoals.total, rGoals.total, 0);
  metrics.push({
    key: 'goals', label: 'Goals', score: goalScore,
    trainee: tGoals.total, reference: rGoals.total,
    detail: `${tGoals.total}/${rGoals.total} detected`,
  });

  // 2. D Entries
  const tDEntry = countEvents(traineeEvents, 'D Entry');
  const rDEntry = countEvents(refEvents, 'D Entry');
  const dScore = scoreCount(tDEntry.total, rDEntry.total, 2);
  metrics.push({
    key: 'd_entries', label: 'D entries', score: dScore,
    trainee: tDEntry.total, reference: rDEntry.total,
    detail: `${tDEntry.total}/${rDEntry.total} detected${Math.abs(tDEntry.total - rDEntry.total) > 2 ? ` (${Math.abs(tDEntry.total - rDEntry.total) - 2} outside tolerance)` : ''}`,
  });

  // 3. Short Corners
  const tSC = countEvents(traineeEvents, 'Short Corner');
  const rSC = countEvents(refEvents, 'Short Corner');
  const scScore = scoreCount(tSC.total, rSC.total, 1);
  metrics.push({
    key: 'short_corners', label: 'Short corners', score: scScore,
    trainee: tSC.total, reference: rSC.total,
    detail: `${tSC.total}/${rSC.total} detected`,
  });

  // 4. Shots on Goal
  const tShots = countEvents(traineeEvents, 'Shot on Goal');
  const rShots = countEvents(refEvents, 'Shot on Goal');
  const shotScore = scoreCount(tShots.total, rShots.total, 2);
  metrics.push({
    key: 'shots', label: 'Shots on goal', score: shotScore,
    trainee: tShots.total, reference: rShots.total,
    detail: `${tShots.total}/${rShots.total} detected`,
  });

  // 5. Turnovers
  const tTO = countEvents(traineeEvents, 'Turnover Won');
  const rTO = countEvents(refEvents, 'Turnover Won');
  const toScore = scoreCount(tTO.total, rTO.total, 3);
  metrics.push({
    key: 'turnovers', label: 'Turnovers', score: toScore,
    trainee: tTO.total, reference: rTO.total,
    detail: `${tTO.total}/${rTO.total} detected`,
  });

  // 6. Zone accuracy
  const zoneScore = scoreZoneAccuracy(traineeEvents, refEvents);
  metrics.push({
    key: 'zone_accuracy', label: 'Zone accuracy', score: zoneScore,
    detail: `Correct zone for ${zoneScore}% of events`,
  });

  // Overall = weighted average
  const weights = { goals: 25, d_entries: 20, short_corners: 15, shots: 15, turnovers: 10, zone_accuracy: 15 };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedSum = metrics.reduce((sum, m) => sum + m.score * (weights[m.key] || 10), 0);
  const overall = Math.round(weightedSum / totalWeight);
  const passed = overall >= 80;

  return { metrics, overall, passed };
}

/**
 * Fetch benchmark config from site_settings
 * Returns { videoUrl, refMatchId, enabled } or null
 */
export async function getBenchmarkConfig() {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'benchmark_config')
    .single();
  if (!data?.value) return null;
  try {
    return JSON.parse(data.value);
  } catch {
    return null;
  }
}

/**
 * Fetch reference events for the benchmark match
 */
export async function getBenchmarkReferenceEvents(refMatchId) {
  const { data } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', refMatchId)
    .order('seq', { ascending: true });
  return data || [];
}

/**
 * Save benchmark result and potentially promote trainee
 * @param {string} userId
 * @param {number} score - overall percentage
 * @param {boolean} passed
 */
export async function saveBenchmarkResult(userId, score, passed) {
  const updates = {
    benchmark_score: score,
  };
  if (passed) {
    updates.commentator_status = 'qualified';
    updates.benchmark_passed_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) console.error('Save benchmark result error:', error);
  return { success: !error, passed };
}

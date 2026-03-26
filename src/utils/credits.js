import { supabase } from './supabase.js';

// Credit rules per tier
const CREDIT_RULES = {
  apprentice: { quick_approved: 1, quick_rejected: -2, live_approved: 5, live_rejected: -10 },
  graduate:   { quick_approved: 1, quick_rejected: -2, live_approved: 5, live_rejected: -10 },
  veteran:    { quick_approved: 0.5, quick_rejected: -1, live_approved: 5, live_rejected: -10 },
};

// Promotion thresholds
const PROMOTION = {
  apprentice_to_graduate: (stats) => stats.total_quicks_approved >= 20,
  graduate_to_veteran: (stats) => stats.total_live_approved >= 4 && stats.total_quicks_approved >= 4,
};

// Ensure contributor_stats row exists for user
async function ensureStats(userId) {
  const { data } = await supabase
    .from('contributor_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (data) return data;
  // Create new row
  const { data: created, error } = await supabase
    .from('contributor_stats')
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) console.error('Create contributor stats error:', error);
  return created;
}

// Award or deduct credits and log to ledger
async function adjustCredits(userId, matchId, action, creditAmount, stats) {
  const newBalance = (stats.credits || 0) + creditAmount;
  const tierBefore = stats.tier;

  // Update stats
  const updates = { credits: newBalance, last_submission_at: new Date().toISOString() };

  // Update counters based on action
  if (action === 'quick_approved') updates.total_quicks_approved = (stats.total_quicks_approved || 0) + 1;
  if (action === 'quick_rejected') updates.total_quicks_rejected = (stats.total_quicks_rejected || 0) + 1;
  if (action === 'live_approved') updates.total_live_approved = (stats.total_live_approved || 0) + 1;
  if (action === 'live_rejected') updates.total_live_rejected = (stats.total_live_rejected || 0) + 1;

  // Check promotion
  const mergedStats = { ...stats, ...updates };
  let tierAfter = tierBefore;

  if (tierBefore === 'apprentice' && PROMOTION.apprentice_to_graduate(mergedStats)) {
    tierAfter = 'graduate';
    updates.tier = 'graduate';
  } else if (tierBefore === 'graduate' && PROMOTION.graduate_to_veteran(mergedStats)) {
    tierAfter = 'veteran';
    updates.tier = 'veteran';
  }

  // Check demotion (credits below 0)
  if (newBalance < 0 && tierBefore !== 'apprentice') {
    if (tierBefore === 'veteran') {
      tierAfter = 'graduate';
      updates.tier = 'graduate';
    } else if (tierBefore === 'graduate') {
      tierAfter = 'apprentice';
      updates.tier = 'apprentice';
    }
  }

  // Save stats
  await supabase
    .from('contributor_stats')
    .update(updates)
    .eq('user_id', userId);

  // Log to ledger
  await supabase.from('credit_ledger').insert({
    user_id: userId,
    match_id: matchId,
    action,
    credits: creditAmount,
    balance_after: newBalance,
    tier_before: tierBefore,
    tier_after: tierAfter,
  });

  // Log tier change separately if promoted/demoted
  if (tierAfter !== tierBefore) {
    const changeAction = tierAfter > tierBefore ? 'tier_promotion' : 'tier_demotion';
    await supabase.from('credit_ledger').insert({
      user_id: userId,
      match_id: matchId,
      action: changeAction,
      credits: 0,
      balance_after: newBalance,
      tier_before: tierBefore,
      tier_after: tierAfter,
    });
  }

  return { newBalance, tierBefore, tierAfter, promoted: tierAfter !== tierBefore };
}

// Called when admin approves a crowd-submitted quick score
export async function onQuickScoreApproved(submitterId, matchId) {
  if (!submitterId) return null;
  const stats = await ensureStats(submitterId);
  if (!stats) return null;
  const credits = CREDIT_RULES[stats.tier]?.quick_approved || 1;
  return adjustCredits(submitterId, matchId, 'quick_approved', credits, stats);
}

// Called when admin rejects a crowd-submitted quick score
export async function onQuickScoreRejected(submitterId, matchId) {
  if (!submitterId) return null;
  const stats = await ensureStats(submitterId);
  if (!stats) return null;
  const credits = CREDIT_RULES[stats.tier]?.quick_rejected || -2;
  return adjustCredits(submitterId, matchId, 'quick_rejected', credits, stats);
}

// Called when admin approves a crowd-submitted live match
export async function onLiveMatchApproved(submitterId, matchId) {
  if (!submitterId) return null;
  const stats = await ensureStats(submitterId);
  if (!stats) return null;
  const credits = CREDIT_RULES[stats.tier]?.live_approved || 5;
  return adjustCredits(submitterId, matchId, 'live_approved', credits, stats);
}

// Called when admin rejects a crowd-submitted live match
export async function onLiveMatchRejected(submitterId, matchId) {
  if (!submitterId) return null;
  const stats = await ensureStats(submitterId);
  if (!stats) return null;
  const credits = CREDIT_RULES[stats.tier]?.live_rejected || -10;
  return adjustCredits(submitterId, matchId, 'live_rejected', credits, stats);
}

// Fetch contributor stats for a user (for dashboard display)
export async function getContributorStats(userId) {
  return ensureStats(userId);
}

// Fetch credit ledger for a user
export async function getCreditLedger(userId, limit = 50) {
  const { data } = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

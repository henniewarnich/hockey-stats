import { supabase } from './supabase.js';

// Credit values per match type
export const CREDIT_VALUES = {
  live_pro:      50,
  live_lite:     10,
  video_same_day: 30,
  video_older:   20,
  quick_score:   5,
  schedule:      5,
  submission:    1,  // approved result, upcoming, or team suggestion
  issue:         5,  // confirmed mistake report
};

// Penalty multiplier (admin-applied)
export const PENALTY_MULTIPLIER = -1.5;

// Voucher threshold
export const VOUCHER_THRESHOLD = 100;

// Check if user is eligible to earn credits (qualified + 5 total matches)
export async function isEligibleForCredits(userId) {
  // Check profile status
  const { data: profile } = await supabase.from('profiles')
    .select('commentator_status')
    .eq('id', userId)
    .single();
  if (!profile || profile.commentator_status !== 'qualified') return false;

  // Count total matches from audit_log
  const { count: liveCount } = await supabase.from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('action', 'match_start_live');
  const { count: videoCount } = await supabase.from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('action', 'video_review_start');
  return ((liveCount || 0) + (videoCount || 0)) >= 5;
}

// Ensure contributor_stats row exists for user
async function ensureStats(userId) {
  const { data } = await supabase.from('contributor_stats')
    .select('*').eq('user_id', userId).single();
  if (data) return data;
  const { data: created, error } = await supabase.from('contributor_stats')
    .insert({ user_id: userId, tier: 'commentator', credits: 0 })
    .select().single();
  if (error) console.error('Create contributor stats error:', error);
  return created;
}

// Core: award credits and log to ledger
async function adjustCredits(userId, matchId, action, creditAmount) {
  const stats = await ensureStats(userId);
  if (!stats) return null;

  const newBalance = (stats.credits || 0) + creditAmount;

  // Update balance
  await supabase.from('contributor_stats')
    .update({ credits: newBalance, last_submission_at: new Date().toISOString() })
    .eq('user_id', userId);

  // Log to ledger
  const { error } = await supabase.from('credit_ledger').insert({
    user_id: userId,
    match_id: matchId || null,
    action,
    credits: creditAmount,
    balance_after: newBalance,
  });
  if (error) console.error('Credit ledger insert error:', error);

  console.log(`Credits: ${action} → ${creditAmount > 0 ? '+' : ''}${creditAmount} (balance: ${newBalance})`);
  return { newBalance, credits: creditAmount };
}

// ─── PUBLIC API: called from match end points ───

// Award credits for completing a live match (Pro or Lite)
export async function awardLiveMatchCredits(userId, matchId, mode) {
  const eligible = await isEligibleForCredits(userId);
  if (!eligible) { console.log('Credits: not eligible yet'); }
  const action = mode === 'lite' ? 'live_lite' : 'live_pro';
  const amount = mode === 'lite' ? CREDIT_VALUES.live_lite : CREDIT_VALUES.live_pro;
  // Team credits (always, regardless of personal eligibility)
  awardBothTeamsCredits(matchId, action, amount, userId).catch(() => {});
  if (!eligible) return null;
  return adjustCredits(userId, matchId, action, amount);
}

// Award credits for completing a video review
export async function awardVideoReviewCredits(userId, matchId) {
  const eligible = await isEligibleForCredits(userId);
  // Check if match was today (same-day = 30, older = 20)
  const { data: match } = await supabase.from('matches')
    .select('match_date').eq('id', matchId).single();
  const isToday = match?.match_date === new Date().toISOString().slice(0, 10);
  const action = isToday ? 'video_same_day' : 'video_older';
  const amount = isToday ? CREDIT_VALUES.video_same_day : CREDIT_VALUES.video_older;
  // Team credits (always)
  awardBothTeamsCredits(matchId, action, amount, userId).catch(() => {});
  if (!eligible) return null;
  return adjustCredits(userId, matchId, action, amount);
}

// Award credits for quick score
export async function awardQuickScoreCredits(userId, matchId) {
  // Team credits (always)
  awardBothTeamsCredits(matchId, 'score', TEAM_CREDIT_VALUES.score, userId).catch(() => {});
  const eligible = await isEligibleForCredits(userId);
  if (!eligible) return null;
  return adjustCredits(userId, matchId, 'quick_score', CREDIT_VALUES.quick_score);
}

// Award credits for scheduling a match
export async function awardScheduleCredits(userId, matchId) {
  // Team credits (always)
  awardBothTeamsCredits(matchId, 'schedule', TEAM_CREDIT_VALUES.schedule, userId).catch(() => {});
  const eligible = await isEligibleForCredits(userId);
  if (!eligible) return null;
  return adjustCredits(userId, matchId, 'schedule', CREDIT_VALUES.schedule);
}

// Admin: apply penalty (1.5x the earned amount)
export async function applyPenalty(userId, matchId, originalCredits, reason) {
  const penalty = Math.round(originalCredits * PENALTY_MULTIPLIER);
  return adjustCredits(userId, matchId, 'penalty', penalty);
}

// Award credits for an approved submission (result, upcoming match, or team suggestion)
export async function awardSubmissionCredits(userId, matchId, type) {
  const eligible = await isEligibleForCredits(userId);
  if (!eligible) return null;
  return adjustCredits(userId, matchId, type || 'submission', CREDIT_VALUES.submission);
}

// Award credits for a confirmed issue/mistake report
export async function awardIssueCredits(userId, matchId) {
  const eligible = await isEligibleForCredits(userId);
  if (!eligible) return null;
  return adjustCredits(userId, matchId, 'issue_confirmed', CREDIT_VALUES.issue);
}

// Admin: mark voucher as claimed (deduct 100 credits)
export async function claimVoucher(userId) {
  const stats = await ensureStats(userId);
  if (!stats || stats.credits < VOUCHER_THRESHOLD) return null;
  const result = await adjustCredits(userId, null, 'voucher_claim', -VOUCHER_THRESHOLD);
  // Update voucher counts
  await supabase.from('contributor_stats')
    .update({
      vouchers_earned: (stats.vouchers_earned || 0) + 1,
      vouchers_sent: (stats.vouchers_sent || 0) + 1,
    })
    .eq('user_id', userId);
  return result;
}

// Fetch contributor stats for a user
export async function getContributorStats(userId) {
  return ensureStats(userId);
}

// Fetch credit ledger for a user
export async function getCreditLedger(userId, limit = 50) {
  const { data } = await supabase.from('credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── ADMIN: Approval/Rejection (called from PendingApprovalsScreen) ───

export async function onQuickScoreApproved(submitterId, matchId) {
  if (!submitterId) return null;
  const eligible = await isEligibleForCredits(submitterId);
  if (!eligible) return null;
  return adjustCredits(submitterId, matchId, 'quick_score', CREDIT_VALUES.quick_score);
}

export async function onQuickScoreRejected(submitterId, matchId) {
  if (!submitterId) return null;
  return adjustCredits(submitterId, matchId, 'penalty', Math.round(CREDIT_VALUES.quick_score * PENALTY_MULTIPLIER));
}

export async function onLiveMatchApproved(submitterId, matchId) {
  if (!submitterId) return null;
  const eligible = await isEligibleForCredits(submitterId);
  if (!eligible) return null;
  return adjustCredits(submitterId, matchId, 'live_pro', CREDIT_VALUES.live_pro);
}

export async function onLiveMatchRejected(submitterId, matchId) {
  if (!submitterId) return null;
  return adjustCredits(submitterId, matchId, 'penalty', Math.round(CREDIT_VALUES.live_pro * PENALTY_MULTIPLIER));
}

// ── TEAM CREDITS ──

export const FREE_PLUS_THRESHOLD = 20; // avg credits per match needed for Free Plus

export const TEAM_CREDIT_VALUES = {
  schedule:      5,
  score:         5,
  live_pro:      50,
  live_lite:     10,
  video_same_day: 30,
  video_older:   20,
  viewer:        1,  // per unique viewer
};

// Award credits to a team for a match action
export async function awardTeamCredits(teamId, matchId, action, credits, sourceUserId = null) {
  if (!teamId || !matchId || !credits) return null;
  try {
    await supabase.from('team_credits').insert({
      team_id: teamId,
      match_id: matchId,
      action,
      credits,
      source_user_id: sourceUserId,
    });
    // Recalculate tier
    await supabase.rpc('recalc_team_tier', { p_team_id: teamId });
  } catch (e) {
    console.error('Team credit error:', e);
  }
}

// Award team credits for BOTH teams in a match
export async function awardBothTeamsCredits(matchId, action, credits, sourceUserId = null) {
  if (!matchId) return;
  try {
    const { data: match } = await supabase.from('matches')
      .select('home_team_id, away_team_id')
      .eq('id', matchId)
      .single();
    if (!match) return;
    await awardTeamCredits(match.home_team_id, matchId, action, credits, sourceUserId);
    await awardTeamCredits(match.away_team_id, matchId, action, credits, sourceUserId);
  } catch (e) {
    console.error('Both teams credit error:', e);
  }
}

// Get effective tier for a team (override if set and not expired, else calculated)
export async function getTeamTier(teamId) {
  if (!teamId) return 'free';
  try {
    const { data } = await supabase.from('team_tiers')
      .select('*')
      .eq('team_id', teamId)
      .single();
    if (!data) return 'free';

    // Check override
    if (data.tier_override) {
      if (!data.override_expires || new Date(data.override_expires) > new Date()) {
        return data.tier_override; // 'free_plus' or 'premium'
      }
      // Override expired — fall through to calculated
    }
    return data.tier || 'free';
  } catch {
    return 'free';
  }
}

// Get full tier info for a team (for UI display)
export async function getTeamTierInfo(teamId) {
  if (!teamId) return { tier: 'free', credits: 0, matches: 0, avg: 0, override: null };
  try {
    const { data } = await supabase.from('team_tiers')
      .select('*')
      .eq('team_id', teamId)
      .single();
    if (!data) return { tier: 'free', credits: 0, matches: 0, avg: 0, override: null };

    const effectiveTier = data.tier_override &&
      (!data.override_expires || new Date(data.override_expires) > new Date())
      ? data.tier_override : (data.tier || 'free');

    return {
      tier: effectiveTier,
      credits: data.credits_total || 0,
      matches: data.matches_count || 0,
      avg: data.avg_per_match || 0,
      override: data.tier_override || null,
      overrideExpires: data.override_expires,
      overrideNote: data.override_note,
      isOverridden: !!data.tier_override && (!data.override_expires || new Date(data.override_expires) > new Date()),
    };
  } catch {
    return { tier: 'free', credits: 0, matches: 0, avg: 0, override: null };
  }
}

// Admin: set tier override for a team
export async function setTeamTierOverride(teamId, tierOverride, expiresDate, note, adminId) {
  try {
    const { error } = await supabase.from('team_tiers')
      .upsert({
        team_id: teamId,
        tier_override: tierOverride || null,
        override_expires: expiresDate || null,
        override_note: note || null,
        override_set_by: adminId,
        override_set_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'team_id' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Set tier override error:', e);
    return false;
  }
}

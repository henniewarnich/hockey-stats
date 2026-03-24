import { supabase } from './supabase.js';

/**
 * Central audit logger — fire-and-forget, never blocks the caller.
 * Uses the log_audit RPC (SECURITY DEFINER) so it works for all roles.
 */
export async function logAudit(action, targetType, targetId = null, details = null) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    const { error } = await supabase.rpc('log_audit', {
      p_user_id: userId,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details ? JSON.parse(JSON.stringify(details)) : null,
    });
    if (error) console.warn('Audit log error:', error.message, { action, targetType, targetId });
  } catch (err) {
    console.warn('Audit log failed:', err);
  }
}

/**
 * Log with an explicit user ID (for cases where we know the user but may not have a session yet)
 */
export async function logAuditAs(userId, action, targetType, targetId = null, details = null) {
  try {
    const { error } = await supabase.rpc('log_audit', {
      p_user_id: userId || null,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details ? JSON.parse(JSON.stringify(details)) : null,
    });
    if (error) console.warn('Audit log error:', error.message, { action, targetType, targetId });
  } catch (err) {
    console.warn('Audit log failed:', err);
  }
}

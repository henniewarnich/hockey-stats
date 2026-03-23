import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase.js';

// Sign in with username or email
export async function signIn(usernameOrEmail, password) {
  let email = usernameOrEmail.trim();
  
  // If no @, treat as username — look up email from profiles
  if (!email.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', email.toLowerCase())
      .single();
    if (!profile) return { error: 'User not found' };
    
    // Get the auth user's email via the profile id
    // We need to query auth.users but can't directly — so we store email in profiles
    const { data: p2 } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', email.toLowerCase())
      .single();
    if (!p2?.email) return { error: 'User not found' };
    email = p2.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut();
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get current user's profile
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getProfileById(user.id);
}

// Get profile by user ID
export async function getProfileById(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return profile;
}

// Get profile by email
export async function getProfileByEmail(email) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  return profile;
}

// Get profile by username
export async function getProfileByUsername(username) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return profile;
}

// Create a new user (admin/commentator_admin function)
export async function createUser({ firstname, lastname, username, email, password, role }) {
  // Pre-check: username uniqueness
  const { data: existing } = await supabase.from('profiles').select('id').eq('username', username.toLowerCase().trim()).maybeSingle();
  if (existing) return { error: `Username "${username}" is already taken.` };

  // Save current session before creating new user (signUp logs in as new user)
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstname, lastname, username: username.toLowerCase().trim(), role },
    },
  });
  
  if (error) {
    // If trigger failed, the auth user may have been created but profile wasn't
    // Try to find the auth user and create the profile manually
    if (error.message.includes('Database error')) {
      // Restore admin session first
      if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
      return { error: `${error.message}. Try re-running the handle_new_user trigger in Supabase SQL Editor: SELECT handle_new_user();` };
    }
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    return { error: error.message };
  }

  // Check if user was actually created (Supabase returns fake success for existing emails)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    return { error: `Email "${email}" is already registered.` };
  }

  // Check if profile was created by trigger, if not create it manually
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
    if (!profile) {
      // Restore admin session so we have insert permissions
      if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: data.user.id, email, firstname, lastname,
        username: username.toLowerCase().trim(), role,
      });
      if (profileErr) return { error: `User created but profile failed: ${profileErr.message}` };
      return { user: data.user };
    }
  }

  // Restore admin session
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  return { user: data.user };
}

// Update a user's profile (admin function)
export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) return { error: error.message };
  return { success: true };
}

// Reset a user's password (admin function via Edge Function)
export async function resetPassword(userId, newPassword) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not authenticated' };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ userId, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) return { error: data.error || 'Failed to reset password' };
  return { success: true };
}

// Block/unblock a user
export async function toggleBlockUser(userId, blocked) {
  return updateProfile(userId, { blocked });
}

// List all users (admin function)
export async function listUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

// List users by role
export async function listUsersByRole(role) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('firstname');
  if (error) return [];
  return data;
}

// ── COACH TEAM ASSIGNMENTS ──────────────────────────

// Get teams assigned to a coach
export async function getCoachTeams(coachId) {
  const { data, error } = await supabase
    .from('coach_teams')
    .select('team_id, teams(id, name, color, short_name)')
    .eq('coach_id', coachId);
  if (error) return [];
  return data.map(d => d.teams);
}

// Get all coach_teams records (for admin user list)
export async function getAllCoachTeams() {
  const { data, error } = await supabase
    .from('coach_teams')
    .select('coach_id, team_id, teams(id, name, color, short_name)');
  if (error) return [];
  return data;
}

// Assign a coach to a team
export async function assignCoachTeam(coachId, teamId) {
  const { error } = await supabase
    .from('coach_teams')
    .upsert({ coach_id: coachId, team_id: teamId }, { onConflict: 'coach_id,team_id' });
  if (error) return { error: error.message };
  return { success: true };
}

// Remove a coach from a team
export async function removeCoachTeam(coachId, teamId) {
  const { error } = await supabase
    .from('coach_teams')
    .delete()
    .eq('coach_id', coachId)
    .eq('team_id', teamId);
  if (error) return { error: error.message };
  return { success: true };
}

// Check if a user is an assigned coach for a specific team (by slug)
export async function isCoachForTeam(userId, teamSlug) {
  const { data } = await supabase
    .from('coach_teams')
    .select('team_id, teams!inner(name)')
    .eq('coach_id', userId);
  if (!data || data.length === 0) return false;
  const slugify = (n) => n.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  return data.some(d => slugify(d.teams.name) === teamSlug);
}

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

  // Save current session
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  
  // Step 1: Create auth user with minimal metadata (avoids trigger issues)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstname, lastname, username: username.toLowerCase().trim(), role },
    },
  });
  
  if (error) {
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    
    // If trigger failed, try without metadata so trigger inserts defaults, then update profile
    if (error.message.includes('Database error')) {
      const { data: data2, error: error2 } = await supabase.auth.signUp({ email, password });
      if (error2) {
        return { error: `${error2.message}` };
      }
      if (data2.user) {
        // Restore admin session to update profile
        if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
        // Wait a moment for trigger to create default profile
        await new Promise(r => setTimeout(r, 1000));
        // Update the profile with correct data
        const { error: updateErr } = await supabase.from('profiles').update({
          firstname, lastname, username: username.toLowerCase().trim(), role,
        }).eq('id', data2.user.id);
        if (updateErr) {
          // Profile might not exist yet, try insert
          const { error: insertErr } = await supabase.from('profiles').insert({
            id: data2.user.id, email, firstname, lastname,
            username: username.toLowerCase().trim(), role,
          });
          if (insertErr) return { error: `Auth user created but profile failed: ${insertErr.message}` };
        }
        return { user: data2.user };
      }
    }
    return { error: error.message };
  }

  // Check for fake success (existing email)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    return { error: `Email "${email}" is already registered.` };
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

import { supabase } from './supabase.js';

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

// Create a new user (admin/commentator_admin function)
export async function createUser({ firstname, lastname, username, email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstname, lastname, username: username.toLowerCase().trim(), role },
    },
  });
  
  if (error) return { error: error.message };
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

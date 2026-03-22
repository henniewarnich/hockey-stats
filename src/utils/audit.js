import { supabase } from './supabase.js';

let cachedIp = null;

async function getIp() {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    cachedIp = data.ip;
    return cachedIp;
  } catch { return null; }
}

export async function logLoginAttempt({ pinType, teamName, success }) {
  try {
    const ip = await getIp();
    await supabase.from('login_attempts').insert({
      pin_type: pinType,
      team_name: teamName || null,
      success,
      ip_address: ip,
      user_agent: navigator.userAgent || null,
      screen_res: `${screen.width}x${screen.height}`,
      language: navigator.language || null,
    });
  } catch (err) {
    console.warn('Login audit log failed:', err);
  }
}

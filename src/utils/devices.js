import { supabase } from './supabase.js';

const DEVICE_KEY = 'kykie-device-id';
const MAX_DEVICES = 2;

// Generate or retrieve device ID from localStorage
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// Parse user-agent into a friendly device name
export function getDeviceName() {
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Unknown';
  if (ua.includes('iPhone') || ua.includes('iPad')) os = ua.includes('iPad') ? 'iPad' : 'iPhone';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

// Check device status for a user. Returns:
// { status: 'known' } — this device is already registered
// { status: 'registered' } — new device, silently registered (had room)
// { status: 'blocked', devices: [...] } — 3rd device, needs OTP
export async function checkDevice(userId) {
  const deviceId = getDeviceId();
  const deviceName = getDeviceName();

  // Fetch existing devices for this user
  const { data: devices, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: true });

  if (error) {
    console.error('Device check error:', error);
    return { status: 'known' }; // Fail open — don't block on errors
  }

  const existing = (devices || []).find(d => d.device_id === deviceId);

  if (existing) {
    // Known device — update last_active_at
    await supabase.from('user_devices')
      .update({ last_active_at: new Date().toISOString(), device_name: deviceName })
      .eq('id', existing.id);
    return { status: 'known' };
  }

  // New device
  if ((devices || []).length < MAX_DEVICES) {
    // Room available — register silently
    await supabase.from('user_devices').insert({
      user_id: userId,
      device_id: deviceId,
      device_name: deviceName,
    });
    return { status: 'registered' };
  }

  // Already at max — need OTP verification
  return {
    status: 'blocked',
    devices: devices || [],
    newDeviceName: deviceName,
  };
}

// After OTP verification: remove oldest device, register new one
export async function replaceOldestDevice(userId) {
  const deviceId = getDeviceId();
  const deviceName = getDeviceName();

  // Find oldest device
  const { data: devices, error: fetchErr } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: true })
    .limit(1);

  console.log('replaceOldestDevice: found', devices?.length, 'devices, fetchErr:', fetchErr?.message);

  if (devices?.[0]) {
    console.log('Removing oldest device:', devices[0].device_name, devices[0].device_id);
    const { error: delErr } = await supabase.from('user_devices').delete().eq('id', devices[0].id);
    if (delErr) console.error('Delete device error:', delErr.message);
    else console.log('Device deleted successfully');
  }

  // Register new device
  const { error: insErr } = await supabase.from('user_devices').insert({
    user_id: userId,
    device_id: deviceId,
    device_name: deviceName,
  });
  if (insErr) console.error('Insert device error:', insErr.message);
  else console.log('New device registered:', deviceName);
}

// Fetch all devices for a user (for settings display)
export async function getUserDevices(userId) {
  const { data } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });
  return data || [];
}

// Remove a specific device
export async function removeDevice(deviceRowId) {
  await supabase.from('user_devices').delete().eq('id', deviceRowId);
}

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { getUserDevices, removeDevice, getDeviceId } from '../utils/devices.js';

export default function SecurityScreen({ currentUser, onBack }) {
  const [tab, setTab] = useState('password'); // password | devices
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  const myDeviceId = getDeviceId();

  useEffect(() => { loadDevices(); }, []);

  const loadDevices = async () => {
    setLoadingDevices(true);
    const d = await getUserDevices(currentUser.id);
    setDevices(d);
    setLoadingDevices(false);
  };

  const handleChangePassword = async () => {
    setMsg(null);
    if (!newPw || newPw.length < 6) { setMsg({ type: 'err', text: 'Password must be at least 6 characters' }); return; }
    if (newPw !== confirmPw) { setMsg({ type: 'err', text: 'Passwords do not match' }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) {
      setMsg({ type: 'err', text: error.message });
    } else {
      setMsg({ type: 'ok', text: 'Password changed successfully' });
      setNewPw(''); setConfirmPw('');
    }
  };

  const handleRemoveDevice = async (d) => {
    if (d.device_id === myDeviceId) { setMsg({ type: 'err', text: "Can't remove your current device" }); return; }
    if (!confirm(`Log out ${d.device_name || 'this device'}?`)) return;
    await removeDevice(d.id);
    loadDevices();
    setMsg({ type: 'ok', text: `${d.device_name || 'Device'} removed` });
  };

  const S = {
    page: { fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px' },
    input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 10 },
    btn: (bg) => ({ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: bg, color: bg === '#F59E0B' ? '#0B0F1A' : '#F8FAFC', fontSize: 13, fontWeight: 700, cursor: 'pointer' }),
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: 0 }}>← Back</button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Security</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
        {[['password', '🔑 Password'], ['devices', '📱 Devices']].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setMsg(null); }} style={{
            flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: tab === k ? '#F59E0B22' : '#1E293B', color: tab === k ? '#F59E0B' : '#64748B',
          }}>{l}</button>
        ))}
      </div>

      {msg && (
        <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, background: msg.type === 'ok' ? '#10B98118' : '#EF444418', border: `1px solid ${msg.type === 'ok' ? '#10B98144' : '#EF444444'}` }}>
          <div style={{ fontSize: 11, color: msg.type === 'ok' ? '#10B981' : '#EF4444', fontWeight: 600 }}>{msg.text}</div>
        </div>
      )}

      {tab === 'password' && (
        <div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, lineHeight: 1.6 }}>
            Choose a strong password that you don't use on other sites. Minimum 6 characters.
          </div>

          <label style={{ fontSize: 11, color: '#64748B', marginBottom: 4, display: 'block' }}>New password</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={S.input} placeholder="Enter new password" />

          <label style={{ fontSize: 11, color: '#64748B', marginBottom: 4, display: 'block' }}>Confirm password</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={S.input} placeholder="Confirm new password"
            onKeyDown={e => { if (e.key === 'Enter') handleChangePassword(); }} />

          <button onClick={handleChangePassword} disabled={saving} style={S.btn('#10B981')}>
            {saving ? 'Saving...' : 'Change password'}
          </button>
        </div>
      )}

      {tab === 'devices' && (
        <div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, lineHeight: 1.6 }}>
            You can be logged in on up to 2 devices. Adding a third requires verification via email OTP.
          </div>

          {loadingDevices ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#64748B' }}>Loading...</div>
          ) : devices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#64748B', fontSize: 12 }}>No devices registered yet</div>
          ) : (
            devices.map(d => {
              const isCurrent = d.device_id === myDeviceId;
              const lastSeen = new Date(d.last_active_at);
              const ago = Math.round((Date.now() - lastSeen.getTime()) / 60000);
              const agoText = ago < 1 ? 'Just now' : ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago / 60)}h ago` : `${Math.round(ago / 1440)}d ago`;
              return (
                <div key={d.id} style={{
                  background: '#1E293B', borderRadius: 10, padding: '12px 14px', marginBottom: 8,
                  border: isCurrent ? '1px solid #10B98144' : '1px solid #33415566',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {d.device_name || 'Unknown device'}
                        {isCurrent && <span style={{ fontSize: 9, color: '#10B981', marginLeft: 8, fontWeight: 600 }}>THIS DEVICE</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                        Last active: {agoText} · Added {new Date(d.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    {!isCurrent && (
                      <button onClick={() => handleRemoveDevice(d)} style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #EF444444',
                        background: 'transparent', color: '#EF4444', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}>Remove</button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div style={{ fontSize: 10, color: '#475569', marginTop: 12, lineHeight: 1.5 }}>
            Removing a device will require that device to verify via OTP next time it logs in.
          </div>
        </div>
      )}
    </div>
  );
}

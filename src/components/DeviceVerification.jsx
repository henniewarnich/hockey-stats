import { useState } from 'react';
import { supabase } from '../utils/supabase.js';
import { replaceOldestDevice } from '../utils/devices.js';

export default function DeviceVerification({ currentUser, deviceInfo, onVerified, onCancel }) {
  const [step, setStep] = useState('confirm'); // confirm | otp
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const oldest = deviceInfo.devices?.[0];
  const otherDevice = deviceInfo.devices?.[1];

  const handleSendOtp = async () => {
    setSending(true);
    setError('');
    // Use Supabase's built-in OTP (sends a code to their email)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: currentUser.email,
      options: { shouldCreateUser: false },
    });
    setSending(false);
    if (err) {
      setError(err.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({
      email: currentUser.email,
      token: otp.trim(),
      type: 'email',
    });
    if (err) {
      setVerifying(false);
      setError('Incorrect code. Please try again.');
      return;
    }
    // OTP verified — replace oldest device with this one
    await replaceOldestDevice(currentUser.id);
    setVerifying(false);
    onVerified();
  };

  const S = {
    page: { fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    card: { background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 8, width: '100%' },
    input: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#0B0F1A', color: '#F8FAFC', fontSize: 20, textAlign: 'center', outline: 'none', boxSizing: 'border-box', letterSpacing: 6 },
    btn: (bg, dis) => ({ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: dis ? '#334155' : bg, color: dis ? '#64748B' : bg === '#F59E0B' ? '#0B0F1A' : '#F8FAFC', fontSize: 13, fontWeight: 700, cursor: dis ? 'not-allowed' : 'pointer' }),
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>New device detected</div>
      <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6, marginBottom: 20, maxWidth: 300 }}>
        You're already logged in on {deviceInfo.devices?.length} device{deviceInfo.devices?.length !== 1 ? 's' : ''}. To continue on this device, verify your identity.
      </div>

      {/* Current devices */}
      <div style={{ width: '100%', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600 }}>Your current devices</div>
        {deviceInfo.devices?.map((d, i) => (
          <div key={d.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10, border: i === 0 ? '1px solid #EF444433' : '1px solid #33415566' }}>
            <div style={{ fontSize: 20 }}>{d.device_name?.includes('iPhone') || d.device_name?.includes('Android') ? '📱' : '💻'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{d.device_name || 'Unknown'}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>
                Last active: {new Date(d.last_active_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {i === 0 && <span style={{ fontSize: 9, color: '#EF4444', fontWeight: 600 }}>Will be logged out</span>}
          </div>
        ))}

        <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #10B98133' }}>
          <div style={{ fontSize: 20 }}>✨</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{deviceInfo.newDeviceName}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>This device (new)</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, background: '#EF444418', border: '1px solid #EF444444', width: '100%' }}>
          <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, textAlign: 'center' }}>{error}</div>
        </div>
      )}

      {step === 'confirm' && (
        <div style={{ width: '100%' }}>
          <button onClick={handleSendOtp} disabled={sending} style={S.btn('#F59E0B', sending)}>
            {sending ? 'Sending code...' : 'Send verification code to my email'}
          </button>
          <div style={{ fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 6 }}>
            Code will be sent to {currentUser.email}
          </div>
          <button onClick={onCancel} style={{ ...S.btn('transparent'), border: '1px solid #334155', color: '#64748B', marginTop: 8 }}>
            Cancel — stay on previous device
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
            Enter the code sent to {currentUser.email}
          </div>
          <input type="text" inputMode="numeric" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
            style={S.input} placeholder="00000000" autoFocus />
          <button onClick={handleVerifyOtp} disabled={verifying || otp.length < 6} style={{ ...S.btn('#10B981', verifying || otp.length < 6), marginTop: 10 }}>
            {verifying ? 'Verifying...' : 'Verify and continue'}
          </button>
          <button onClick={handleSendOtp} disabled={sending} style={{ ...S.btn('transparent'), border: '1px solid #334155', color: '#64748B', marginTop: 8 }}>
            {sending ? 'Resending...' : 'Resend code'}
          </button>
        </div>
      )}
    </div>
  );
}

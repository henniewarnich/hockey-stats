import { useState } from 'react';
import { updateOwnPassword } from '../utils/auth.js';
import { APP_VERSION } from '../utils/constants.js';

export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const result = await updateOwnPassword(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => onDone(), 2000);
  };

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto",
      background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ marginBottom: 12 }}>
        <svg width="44" height="44" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
          <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
          <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#F59E0B", marginBottom: 2 }}>kykie</div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 28 }}>Set your new password</div>

      {success ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 14, color: "#10B981", fontWeight: 600 }}>Password updated!</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Redirecting to sign in...</div>
        </div>
      ) : (
        <>
          <div style={{ width: "100%", maxWidth: 280, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>New Password</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                autoFocus
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: error ? "2px solid #EF4444" : "1px solid #334155",
                  background: "#1E293B", color: "#F8FAFC", fontSize: 14, outline: "none",
                }}
                onKeyDown={e => e.key === 'Enter' && document.getElementById('confirm-pw')?.focus()}
              />
              <button onClick={() => setShowPassword(p => !p)} style={{
                background: "none", border: "1px solid #334155", borderRadius: 10, padding: "0 12px",
                cursor: "pointer", color: "#64748B", fontSize: 14,
              }}>{showPassword ? "🙈" : "👁"}</button>
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: 280, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Confirm Password</div>
            <input
              id="confirm-pw"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              style={{
                width: "100%", padding: 12, borderRadius: 10,
                border: error ? "2px solid #EF4444" : "1px solid #334155",
                background: "#1E293B", color: "#F8FAFC", fontSize: 14, outline: "none",
                boxSizing: "border-box",
              }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, textAlign: "center" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", maxWidth: 280, padding: 14, borderRadius: 10, border: "none",
            background: loading ? "#334155" : "#F59E0B", color: loading ? "#64748B" : "#0B0F1A",
            fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
          }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </>
      )}

      <div style={{ marginTop: 20, fontSize: 9, color: "#334155" }}>v{APP_VERSION}</div>
    </div>
  );
}

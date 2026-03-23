import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';

export default function HomeScreen({ teamCount, gameCount, onNavigate, syncing, lastSyncError, currentUser, onLogout }) {
  const handleClearCache = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
    }
    caches?.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      navigator.serviceWorker?.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      window.location.reload(true);
    }).catch(() => window.location.reload(true));
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ padding: "30px 20px 16px", textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
            <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
            <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>kykie<span style={{ color: "#64748B", fontWeight: 500, fontSize: 14 }}>.net</span></div>
        {currentUser && (
          <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>
            {currentUser.firstname} {currentUser.lastname}
            <span style={{ fontSize: 9, marginLeft: 6, padding: "2px 8px", borderRadius: 99, background: "#F59E0B22", color: "#F59E0B", fontWeight: 700 }}>
              {currentUser.role === 'commentator_admin' ? 'Comm Admin' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: "0 16px 20px" }}>
        {[
          ["match_schedule", "📅", "Match Schedule", "Schedule & assign matches"],
          ["match_setup", "⚡", "New Match", "Live match or quick score"],
          ["teams", "👥", "Teams", `${teamCount} team${teamCount !== 1 ? "s" : ""}`],
          ["history", "📊", "Game History", `${gameCount} game${gameCount !== 1 ? "s" : ""}`],
          ...(currentUser?.role === 'admin' || currentUser?.role === 'commentator_admin' ? [["users", "🔑", "Users", "Manage user accounts"]] : []),
        ].map(([screen, icon, title, sub]) => (
          <div key={screen} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14 }} onClick={() => onNavigate(screen)}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
              <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 10, color: theme.textDimmer }}>v{APP_VERSION}</div>
            <div style={{ fontSize: 9, color: syncing ? theme.accent : theme.success, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 6 }}>{syncing ? "⏳" : "☁️"}</span>
              {syncing ? "Syncing..." : "Cloud connected"}
            </div>
            <button onClick={handleClearCache} style={{
              padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.border}`,
              background: theme.surface, color: theme.textDim, fontSize: 10, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>
              🔄 Update
            </button>
          </div>
          {lastSyncError && (
            <div style={{ fontSize: 9, color: theme.accent, textAlign: "center", padding: "0 20px" }}>
              {lastSyncError}
            </div>
          )}
          <button onClick={() => { window.location.hash = ''; }} style={{
            marginTop: 8, background: "none", border: "none", color: theme.textDim, fontSize: 10, cursor: "pointer", textDecoration: "underline",
          }}>← Back to kykie.net</button>
          {onLogout && (
            <button onClick={onLogout} style={{
              marginTop: 4, background: "none", border: "none", color: "#EF4444", fontSize: 10, cursor: "pointer", textDecoration: "underline",
            }}>Sign out</button>
          )}
        </div>
      </div>
    </div>
  );
}

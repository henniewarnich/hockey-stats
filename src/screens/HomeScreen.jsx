import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';

export default function HomeScreen({ teamCount, gameCount, onNavigate, syncing, lastSyncError }) {
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
      <div style={{ padding: "40px 20px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>🏑</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Hockey Stats</div>
        <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>Field recorder & analysis</div>
      </div>
      <div style={{ padding: "0 16px 20px" }}>
        {[
          ["match_setup", "⚡", "New Match", "Start recording a game"],
          ["teams", "👥", "Teams", `${teamCount} team${teamCount !== 1 ? "s" : ""}`],
          ["history", "📊", "Game History", `${gameCount} game${gameCount !== 1 ? "s" : ""}`],
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
        </div>
      </div>
    </div>
  );
}

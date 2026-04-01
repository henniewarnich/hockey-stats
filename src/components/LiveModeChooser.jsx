import { theme } from '../utils/styles.js';

export default function LiveModeChooser({ show, onSelect, onClose, allowedModes }) {
  if (!show) return null;
  const modes = allowedModes || ['lite', 'pro'];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1E293B", borderRadius: 16, padding: "20px 16px", width: 300,
      }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>Choose recording mode</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
            {modes.length === 1 ? `You'll be using ${modes[0] === 'lite' ? 'Live Basic' : 'Live Pro'} mode` : 'You can switch within the first 5 minutes'}
          </div>
        </div>

        {modes.includes('pro') && (
        <button onClick={() => onSelect('pro')} style={{
          width: "100%", padding: 14, borderRadius: 10,
          border: "1px solid #8B5CF644", background: "#8B5CF611",
          color: "#F8FAFC", fontSize: 13, fontWeight: 600,
          cursor: "pointer", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
        }}>
          <span style={{ fontSize: 24 }}>🏑</span>
          <div>
            <div style={{ fontWeight: 700, color: "#8B5CF6" }}>Live Pro</div>
            <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>Detailed commentary and stats</div>
          </div>
        </button>
        )}

        {modes.includes('lite') && (
        <button onClick={() => onSelect('lite')} style={{
          width: "100%", padding: 14, borderRadius: 10,
          border: "1px solid #10B98144", background: "#10B98111",
          color: "#F8FAFC", fontSize: 13, fontWeight: 600,
          cursor: "pointer", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
        }}>
          <span style={{ fontSize: 24 }}>📡</span>
          <div>
            <div style={{ fontWeight: 700, color: "#10B981" }}>Live Basic</div>
            <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>Score only</div>
          </div>
        </button>
        )}

        <button onClick={onClose} style={{
          width: "100%", marginTop: 4, padding: 8, borderRadius: 8,
          border: "1px solid #334155", background: "transparent",
          color: "#64748B", fontSize: 12, cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

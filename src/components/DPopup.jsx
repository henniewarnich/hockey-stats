import { D_OPTIONS } from '../utils/constants.js';
import { theme } from '../utils/styles.js';

export default function DPopup({ show, teams, topTeam, onSelect, onClose }) {
  if (!show) return null;
  const { end } = show;
  const def = end === "top" ? topTeam : (topTeam === "home" ? "away" : "home");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.surface, borderRadius: 14, padding: "16px 14px",
        width: 280, boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        border: `1px solid ${teams[def].color}44`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: teams[def].color, textTransform: "uppercase" }}>
            {teams[def].name}'s D
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>What happened?</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {D_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt)} style={{
              padding: "10px 6px", borderRadius: 8,
              border: opt.id === "goal" ? `2px solid ${theme.accent}` : `1px solid ${theme.border}66`,
              background: opt.id === "goal" ? theme.accent + "18" : theme.bg,
              color: theme.text, fontSize: 11, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 15, color: opt.color }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", marginTop: 8, padding: 7, borderRadius: 6,
          border: `1px solid ${theme.border}`, background: "transparent",
          color: theme.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

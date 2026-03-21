import { PAUSE_REASONS } from '../utils/constants.js';
import { theme } from '../utils/styles.js';

export default function PausePopup({ show, onSelect, onClose }) {
  if (!show) return null;

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
        background: theme.surface, borderRadius: 16, padding: "20px 16px", width: 280,
      }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>⏸ Pause Reason</div>
        </div>
        {PAUSE_REASONS.map(r => (
          <button key={r.id} onClick={() => onSelect(r.label)} style={{
            width: "100%", padding: 12, borderRadius: 8,
            border: `1px solid ${theme.border}`, background: theme.bg,
            color: theme.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", marginBottom: 6,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>{r.icon}</span>{r.label}
          </button>
        ))}
        <button onClick={onClose} style={{
          width: "100%", marginTop: 6, padding: 8, borderRadius: 8,
          border: `1px solid ${theme.border}`, background: "transparent",
          color: theme.textDim, fontSize: 12, cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

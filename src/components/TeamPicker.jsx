import { theme } from '../utils/styles.js';
import { teamColor, teamShortName, teamDerivedName } from '../utils/teams.js';

export default function TeamPicker({ show, teams, topTeam, bottomTeam, onSelect, onClose }) {
  if (!show) return null;
  // Use .color from teams object (contrast-adjusted), not teamColor() which reads institution directly
  const topColor = teams[topTeam]?.color || teamColor(teams[topTeam]);
  const botColor = teams[bottomTeam]?.color || teamColor(teams[bottomTeam]);

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
        background: theme.surface, borderRadius: 14, padding: 16, width: 280,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: theme.textDim, marginBottom: 12 }}>
          Who takes the centre pass?
        </div>
        <button onClick={() => onSelect(topTeam)} style={{
          width: "100%", padding: "10px 14px", borderRadius: "10px 10px 2px 2px",
          border: `2px solid ${topColor}`,
          background: topColor + "22",
          color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 3,
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: topColor, flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div>{teamShortName(teams[topTeam])}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: theme.textMuted, marginTop: 1 }}>{teamDerivedName(teams[topTeam])}</div>
          </div>
          <span style={{ fontSize: 9, color: theme.textMuted }}>🧤 top</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <div style={{ padding: "0 8px", fontSize: 14 }}>⚪</div>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>
        <button onClick={() => onSelect(bottomTeam)} style={{
          width: "100%", padding: "10px 14px", borderRadius: "2px 2px 10px 10px",
          border: `2px solid ${botColor}`,
          background: botColor + "22",
          color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: botColor, flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div>{teamShortName(teams[bottomTeam])}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: theme.textMuted, marginTop: 1 }}>{teamDerivedName(teams[bottomTeam])}</div>
          </div>
          <span style={{ fontSize: 9, color: theme.textMuted }}>🧤 bottom</span>
        </button>
      </div>
    </div>
  );
}

import { theme } from '../utils/styles.js';
import { teamColor, teamShortName } from '../utils/teams.js';

export default function TeamPicker({ show, teams, topTeam, bottomTeam, onSelect, onClose }) {
  if (!show) return null;

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
          width: "100%", padding: 14, borderRadius: "10px 10px 2px 2px",
          border: `2px solid ${teamColor(teams[topTeam])}`,
          background: teamColor(teams[topTeam]) + "22",
          color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
          marginBottom: 3,
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: teamColor(teams[topTeam]) }} />
          {teamShortName(teams[topTeam])}
          <span style={{ fontSize: 9, color: theme.textMuted, marginLeft: "auto" }}>🧤 top</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <div style={{ padding: "0 8px", fontSize: 14 }}>⚪</div>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>
        <button onClick={() => onSelect(bottomTeam)} style={{
          width: "100%", padding: 14, borderRadius: "2px 2px 10px 10px",
          border: `2px solid ${teamColor(teams[bottomTeam])}`,
          background: teamColor(teams[bottomTeam]) + "22",
          color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: teamColor(teams[bottomTeam]) }} />
          {teamShortName(teams[bottomTeam])}
          <span style={{ fontSize: 9, color: theme.textMuted, marginLeft: "auto" }}>🧤 bottom</span>
        </button>
      </div>
    </div>
  );
}

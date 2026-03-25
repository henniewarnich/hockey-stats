import { S, theme } from '../utils/styles.js';

export default function CrowdDashboardPanel() {
  const actions = [
    { icon: "📊", title: "Submit a result", desc: "Add a final score for a completed match", hash: "#/submit?mode=result" },
    { icon: "📅", title: "Add upcoming match", desc: "Schedule a match that hasn't happened yet", hash: "#/submit?mode=upcoming" },
    { icon: "👥", title: "Suggest a team", desc: "Add a team not yet in the system", hash: "#/submit?mode=team" },
  ];

  return (
    <div style={{ padding: "0 16px 8px" }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: theme.textDimmer, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Contribute</div>
      {actions.map(a => (
        <div key={a.hash} onClick={() => { window.location.hash = a.hash; }} style={{
          ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
        }}>
          <div style={{ fontSize: 24 }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

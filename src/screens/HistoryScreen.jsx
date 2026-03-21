import { fmt } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';

export default function HistoryScreen({ games, onSelect, onBack }) {
  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Game History</div>
      </div>
      <div style={S.page}>
        {games.length === 0 ? (
          <div style={S.empty}>No games recorded yet.</div>
        ) : (
          games.map(g => {
            const d = new Date(g.date);
            return (
              <div key={g.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}
                onClick={() => onSelect(g)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ color: g.teams.home.color, fontWeight: 700, fontSize: 13 }}>{g.teams.home.name}</span>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{g.homeScore} - {g.awayScore}</span>
                    <span style={{ color: g.teams.away.color, fontWeight: 700, fontSize: 13 }}>{g.teams.away.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim }}>
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })} · {fmt(g.duration)}
                    {g.venue && <span> · {g.venue}</span>}
                  </div>
                </div>
                <div style={{ color: theme.textDimmer, fontSize: 16 }}>›</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

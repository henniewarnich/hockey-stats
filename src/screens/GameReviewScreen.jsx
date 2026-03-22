import { fmt, fmtTs, exportMatchJSON } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';

export default function GameReviewScreen({ game, onDelete, onBack, onNavigate }) {
  const G = game;
  const T = G.teams;
  const d = new Date(G.date);

  const renderLogEntry = (entry) => {
    if (entry.team === "commentary") return (
      <div key={entry.id} style={{
        padding: "6px 10px", borderRadius: 8, marginBottom: 3,
        background: "linear-gradient(135deg, #F59E0B12, #F59E0B08)",
        borderLeft: "3px solid #F59E0B55",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
          <span style={{ fontSize: 11 }}>💬</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: theme.accent, textTransform: "uppercase" }}>Insight</span>
          <span style={{ fontSize: 8, fontFamily: "monospace", color: theme.textDim, marginLeft: "auto" }}>{fmtTs(entry.time)}</span>
        </div>
        <div style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.3, fontStyle: "italic", paddingLeft: 18 }}>{entry.detail}</div>
      </div>
    );
    const isMeta = entry.team === "meta";
    const tc = isMeta ? theme.accent : T[entry.team]?.color || theme.textDimmer;
    return (
      <div key={entry.id} style={{
        padding: "5px 8px", borderRadius: 6, background: tc + "08",
        borderLeft: `3px solid ${tc}`, marginBottom: 3,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ fontSize: 8, fontFamily: "monospace", color: theme.textDim, minWidth: 28 }}>{fmtTs(entry.time)}</div>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: tc, flexShrink: 0 }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: entry.event?.startsWith("Goal!") ? theme.accent : isMeta ? theme.accent : theme.text }}>{entry.event}</div>
          <div style={{ fontSize: 7, color: theme.textMuted, marginLeft: "auto", fontWeight: 600 }}>{entry.zone}</div>
        </div>
        {entry.detail && !isMeta && <div style={{ fontSize: 9, color: theme.textDim, paddingLeft: 40, lineHeight: 1.2 }}>{entry.detail}</div>}
      </div>
    );
  };

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={S.navTitle}>{T.home.name} vs {T.away.name}</div>
          <div style={{ fontSize: 10, color: theme.textDim }}>
            {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
            {G.venue && ` · ${G.venue}`}
          </div>
        </div>
      </div>

      {/* Score header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: 16 }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.home.color }}>{T.home.name}</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{G.homeScore}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: theme.accent }}>{fmt(G.duration)}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: "uppercase" }}>Full Time</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.away.color }}>{T.away.name}</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{G.awayScore}</div>
        </div>
      </div>

      {/* Sync status */}
      <div style={{ textAlign: "center", padding: "0 16px 6px", fontSize: 10, color: G.supabase_id ? "#10B981" : "#F59E0B" }}>
        {G.supabase_id ? "☁️ Synced to cloud" : "📱 Local only — not synced"}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => exportMatchJSON(G)} style={S.btnSm(theme.info, "#FFF")}>📦 JSON</button>
        {onNavigate && (
          <>
            {G.events?.length > 0 && <button onClick={() => onNavigate("public_view", G)} style={S.btnSm("#10B981", "#FFF")}>📺 Public</button>}
            {G.events?.length > 0 && <button onClick={() => onNavigate("coach_view", G)} style={S.btnSm("#8B5CF6", "#FFF")}>🔒 Coach</button>}
            <button onClick={() => onNavigate("match_edit", G)} style={S.btnSm(theme.surface, theme.textMuted)}>✏️ Edit</button>
          </>
        )}
        <button onClick={() => { if (confirm("Delete this match?")) onDelete(G.id); }}
          style={{ ...S.btnSm("transparent", theme.danger), border: `1px solid ${theme.danger}44` }}>
          🗑 Delete
        </button>
      </div>

      {/* Match Log */}
      <div style={{ padding: "0 12px 20px" }}>
        {G.events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 16px", color: theme.textDim }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>Detailed analytics not available for this match</div>
            <div style={{ fontSize: 10, color: theme.textDim }}>This match was not recorded — only the final score was captured.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, color: theme.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Match Log</div>
            {G.events.map(e => renderLogEntry(e))}
          </>
        )}
      </div>
    </div>
  );
}

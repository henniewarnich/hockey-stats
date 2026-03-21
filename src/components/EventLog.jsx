import { useState } from 'react';
import { fmtTs } from '../utils/helpers.js';
import { KEY_EVENTS } from '../utils/constants.js';
import { theme } from '../utils/styles.js';

function LogEntry({ entry, teams }) {
  if (entry.team === "commentary") {
    return (
      <div style={{
        padding: "6px 10px", borderRadius: 8, marginBottom: 3,
        background: "linear-gradient(135deg, #F59E0B12, #F59E0B08)",
        borderLeft: "3px solid #F59E0B55",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
          <span style={{ fontSize: 11 }}>💬</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: theme.accent, textTransform: "uppercase" }}>Insight</span>
          <span style={{ fontSize: 8, fontFamily: "monospace", color: theme.textDim, marginLeft: "auto" }}>
            {fmtTs(entry.time)}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.3, fontStyle: "italic", paddingLeft: 18 }}>
          {entry.detail}
        </div>
      </div>
    );
  }

  const isMeta = entry.team === "meta";
  const tc = isMeta ? theme.accent : teams[entry.team]?.color || theme.textDimmer;

  return (
    <div style={{
      padding: "5px 8px", borderRadius: 6,
      background: tc + "08", borderLeft: `3px solid ${tc}`, marginBottom: 3,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ fontSize: 8, fontFamily: "monospace", color: theme.textDim, minWidth: 28 }}>
          {fmtTs(entry.time)}
        </div>
        <div style={{ width: 7, height: 7, borderRadius: 2, background: tc, flexShrink: 0 }} />
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: entry.event?.startsWith("Goal!") ? theme.accent : isMeta ? theme.accent : theme.text,
        }}>
          {entry.event}
        </div>
        <div style={{ fontSize: 7, color: theme.textMuted, marginLeft: "auto", fontWeight: 600 }}>
          {entry.zone}
        </div>
      </div>
      {entry.detail && !isMeta && (
        <div style={{ fontSize: 9, color: theme.textDim, paddingLeft: 40, lineHeight: 1.2 }}>
          {entry.detail}
        </div>
      )}
    </div>
  );
}

export default function EventLog({ events, teams, maxItems = 12 }) {
  const [logView, setLogView] = useState("all");

  const filtered = logView === "all"
    ? events
    : logView === "insights"
    ? events.filter(e => e.team === "commentary")
    : events.filter(e => e.team !== "commentary" && KEY_EVENTS.some(k => e.event?.startsWith(k)));

  const display = filtered.slice(0, maxItems);

  return (
    <div style={{ padding: "2px 10px 20px" }}>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${theme.border}`, marginBottom: 4 }}>
        {[["all", "All"], ["insights", "💬"], ["key", "⚡ Key"]].map(([k, l]) => (
          <button key={k} onClick={() => setLogView(k)} style={{
            flex: 1, padding: "4px 0", textAlign: "center", fontSize: 9, fontWeight: 700,
            background: logView === k ? theme.border : theme.surface,
            color: logView === k ? theme.text : theme.textDim,
            border: "none", cursor: "pointer",
          }}>
            {l}
          </button>
        ))}
      </div>
      {display.length === 0 ? (
        <div style={{ fontSize: 10, color: theme.border, fontStyle: "italic", textAlign: "center", padding: 8 }}>
          {events.length === 0 ? "Waiting for kickoff..." : "No entries"}
        </div>
      ) : (
        display.map(e => <LogEntry key={e.id} entry={e} teams={teams} />)
      )}
    </div>
  );
}

import { useState } from 'react';
import { fmt, fmtTs, exportMatchJSON } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';

export default function GameReviewScreen({ game, onDelete, onBack }) {
  const [tab, setTab] = useState("stats");
  const G = game;
  const T = G.teams;
  const d = new Date(G.date);
  const real = G.events.filter(e => e.team !== "commentary" && e.team !== "meta");

  const cnt = (t, ev) => real.filter(e => e.team === t && e.event === ev).length;
  const cntS = (t, ev) => real.filter(e => e.team === t && e.event?.startsWith(ev)).length;
  const goals = (t) => cntS(t, "Goal!");
  const dE = (t) => cnt(t, "D Entry");
  const sOn = (t) => cnt(t, "Shot on Goal");
  const sOff = (t) => cnt(t, "Shot Off Target");
  const tS = (t) => sOn(t) + sOff(t) + goals(t);
  const sAcc = (t) => { const tot = tS(t), on = sOn(t) + goals(t); return tot === 0 ? "—" : `${Math.round(on / tot * 100)}%`; };
  const conv = (t) => { const dd = dE(t), g = goals(t); return dd === 0 ? "—" : `${Math.round(g / dd * 100)}%`; };
  const hE = real.filter(e => e.team === "home").length;
  const aE = real.filter(e => e.team === "away").length;
  const hP = Math.round(hE / (hE + aE || 1) * 100);

  const bar = (label, hv, av) => {
    const t = hv + av || 1;
    const hp = hv / t * 100;
    return (
      <div style={{ display: "flex", alignItems: "center", padding: "4px 0", gap: 5 }}>
        <div style={{ width: 28, fontSize: 12, fontWeight: 800, textAlign: "center", color: T.home.color }}>{hv}</div>
        <div style={{ flex: 1, display: "flex", height: 5, background: theme.bg, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${hp}%`, background: T.home.color, borderRadius: "3px 0 0 3px" }} />
          <div style={{ width: `${100 - hp}%`, background: T.away.color, borderRadius: "0 3px 3px 0" }} />
        </div>
        <div style={{ width: 28, fontSize: 12, fontWeight: 800, textAlign: "center", color: T.away.color }}>{av}</div>
      </div>
    );
  };

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

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => exportMatchJSON(G)} style={S.btnSm(theme.info, "#FFF")}>📦 JSON</button>
        <button onClick={() => { if (confirm("Delete this match?")) onDelete(G.id); }}
          style={{ ...S.btnSm("transparent", theme.danger), border: `1px solid ${theme.danger}44` }}>
          🗑 Delete
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", margin: "0 12px 8px", borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.border}` }}>
        {[["stats", "📊 Stats"], ["log", "☰ Log"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700,
            background: tab === k ? theme.accent : theme.surface,
            color: tab === k ? theme.bg : theme.textDim,
            border: "none", cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: "0 12px 20px" }}>
        {tab === "stats" && (
          <>
            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
              {[
                [sAcc("home"), "Shot Acc", sAcc("away")],
                [conv("home"), "D→Goal", conv("away")],
                [`${hP}%`, "Possession", `${100 - hP}%`],
              ].map(([hv, l, av], i) => (
                <div key={i} style={{ background: theme.surface, borderRadius: 10, padding: 8, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.home.color }}>{hv}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.away.color }}>{av}</span>
                  </div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: "uppercase" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Detailed stats */}
            <div style={{ background: theme.surface, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.home.color }}>{T.home.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.away.color }}>{T.away.name}</span>
              </div>
              {[
                ["Goals", cntS("home", "Goal!"), cntS("away", "Goal!")],
                ["D Entries", dE("home"), dE("away")],
                ["Shots on Goal", sOn("home"), sOn("away")],
                ["Shots Off Target", sOff("home"), sOff("away")],
                ["Short Corners", cnt("home", "Short Corner"), cnt("away", "Short Corner")],
                ["Long Corners", cnt("home", "Long Corner"), cnt("away", "Long Corner")],
                ["Turnovers", cnt("home", "Turnover Won"), cnt("away", "Turnover Won")],
                ["Poss Conceded", cnt("home", "Poss Conceded"), cnt("away", "Poss Conceded")],
                ["Sideline Outs", cnt("home", "Sideline Out"), cnt("away", "Sideline Out")],
              ].map(([l, h, a]) => (
                <div key={l}>
                  <div style={{ textAlign: "center", fontSize: 8, color: theme.textDim, fontWeight: 600 }}>{l}</div>
                  {bar(l, h, a)}
                </div>
              ))}
            </div>

            {/* Short corner conversion */}
            <div style={{ background: theme.surface, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: theme.textDim, textTransform: "uppercase", marginBottom: 8 }}>
                Short Corner Conversion
              </div>
              {["home", "away"].map(t => {
                const sc = cnt(t, "Short Corner"), scG = cnt(t, "Goal! (SC)"), de = dE(t);
                return (
                  <div key={t} style={{
                    marginBottom: 8, padding: "6px 8px", borderRadius: 6,
                    background: T[t].color + "08", borderLeft: `3px solid ${T[t].color}`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T[t].color, marginBottom: 4 }}>{T[t].name}</div>
                    <div style={{ fontSize: 9, color: theme.textMuted, lineHeight: 1.5 }}>
                      {sc} short corners · {scG} converted ({sc > 0 ? Math.round(scG / sc * 100) : 0}%)
                      {de > 0 && <span> · D→SC: {sc}/{de} ({Math.round(sc / de * 100)}%)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "log" && (
          <div>
            {G.events.length === 0 ? (
              <div style={S.empty}>No events.</div>
            ) : (
              G.events.map(e => renderLogEntry(e))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

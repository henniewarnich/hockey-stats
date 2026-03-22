import { useState } from 'react';
import { theme } from '../utils/styles.js';

const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

const STATS = [
  { key: "dEntries", label: "D Entries" },
  { key: "shotsOn", label: "Shots on Goal" },
  { key: "shotsOff", label: "Shots off Target" },
  { key: "shortCorners", label: "Short Corners" },
  { key: "longCorners", label: "Long Corners" },
  { key: "turnoversWon", label: "Turnovers Won" },
  { key: "possLost", label: "Poss Lost" },
];

const INVERTED = ["possLost", "shotsOff"];

// Compute stats from events for a given time range
function computeStats(events, team, startTime, endTime) {
  const real = events.filter(e =>
    e.team === team && e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const all = events.filter(e =>
    e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const teamCount = real.length;
  const totalCount = all.length || 1;

  return {
    goals: real.filter(e => e.event?.startsWith("Goal!")).length,
    dEntries: real.filter(e => e.event === "D Entry").length,
    shotsOn: real.filter(e => e.event === "Shot on Goal").length,
    shotsOff: real.filter(e => e.event === "Shot Off Target").length,
    shortCorners: real.filter(e => e.event === "Short Corner").length,
    longCorners: real.filter(e => e.event === "Long Corner").length,
    turnoversWon: real.filter(e => e.event === "Turnover Won").length,
    possLost: real.filter(e => e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out")).length,
    territory: Math.round(teamCount / totalCount * 100),
  };
}

// Find quarter boundaries from pause events
function getQuarters(events, breakFormat) {
  const pauses = events.filter(e => e.team === "meta" && e.detail).sort((a, b) => a.time - b.time);
  const boundaries = [0];
  pauses.forEach(p => {
    if (p.detail === "Quarter Break" || p.detail === "Half Time") {
      boundaries.push(p.time);
    }
  });
  // Add a large end time
  boundaries.push(999999);

  if (breakFormat === "quarters") {
    return [
      { label: "Q1", start: boundaries[0], end: boundaries[1] || 999999, status: boundaries.length > 2 ? "complete" : "live" },
      { label: "Q2", start: boundaries[1] || 999999, end: boundaries[2] || 999999, status: boundaries.length > 3 ? "complete" : boundaries.length > 2 ? "live" : "upcoming" },
      { label: "Q3", start: boundaries[2] || 999999, end: boundaries[3] || 999999, status: boundaries.length > 4 ? "complete" : boundaries.length > 3 ? "live" : "upcoming" },
      { label: "Q4", start: boundaries[3] || 999999, end: boundaries[4] || 999999, status: boundaries.length > 5 ? "complete" : boundaries.length > 4 ? "live" : "upcoming" },
    ];
  } else if (breakFormat === "halves") {
    return [
      { label: "H1", start: boundaries[0], end: boundaries[1] || 999999, status: boundaries.length > 2 ? "complete" : "live" },
      { label: "H2", start: boundaries[1] || 999999, end: boundaries[2] || 999999, status: boundaries.length > 3 ? "complete" : boundaries.length > 2 ? "live" : "upcoming" },
    ];
  }
  return [{ label: "Match", start: 0, end: 999999, status: "live" }];
}

export default function CoachLiveScreen({ match, events, matchTime, running, onBack, embedded }) {
  const teams = match?.teams || { home: { name: "Home", color: "#3B82F6" }, away: { name: "Away", color: "#EF4444" } };
  const breakFormat = match?.breakFormat || "quarters";
  const isEnded = match?.status === "ended";

  const quarters = getQuarters(events, breakFormat);
  // Mark last active quarter as live if match not ended
  if (!isEnded) {
    const lastActive = [...quarters].reverse().find(q => q.status !== "upcoming");
    if (lastActive) lastActive.status = "live";
  }

  const [expandedQ, setExpandedQ] = useState(quarters.find(q => q.status === "live")?.label || quarters[0]?.label);
  const [viewTab, setViewTab] = useState("quarters");

  const homeScore = match?.homeScore ?? events.filter(e => e.team === "home" && e.event?.startsWith("Goal!")).length;
  const awayScore = match?.awayScore ?? events.filter(e => e.team === "away" && e.event?.startsWith("Goal!")).length;

  // Compute stats per quarter
  const quarterData = quarters.map(q => ({
    ...q,
    home: computeStats(events, "home", q.start, q.end),
    away: computeStats(events, "away", q.start, q.end),
  }));

  const activeQs = quarterData.filter(q => q.status !== "upcoming");
  const totalStat = (team, key) => activeQs.reduce((sum, q) => sum + q[team][key], 0);
  const avgTerritory = (team) => activeQs.length ? Math.round(activeQs.reduce((s, q) => s + q[team].territory, 0) / activeQs.length) : 0;
  const convRate = (team) => { const s = totalStat(team, "shotsOn"), g = team === "home" ? homeScore : awayScore; return s > 0 ? Math.round(g / s * 100) : 0; };
  const dConv = (team) => { const d = totalStat(team, "dEntries"), s = totalStat(team, "shotsOn") + totalStat(team, "shotsOff"); return d > 0 ? Math.round(s / d * 100) : 0; };

  const StatBar = ({ hVal, aVal, label, suffix = "" }) => {
    const max = Math.max(hVal, aVal, 1);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
        <div style={{ width: 24, fontSize: 11, fontWeight: 800, textAlign: "right", color: hVal >= aVal ? teams.home.color : "#64748B" }}>{hVal}{suffix}</div>
        <div style={{ flex: 1, display: "flex", height: 5, borderRadius: 3, overflow: "hidden", background: "#0B0F1A", gap: 1 }}>
          <div style={{ width: `${(hVal / max) * 50}%`, background: teams.home.color, borderRadius: 3, marginLeft: "auto", transition: "width 0.5s" }} />
          <div style={{ width: `${(aVal / max) * 50}%`, background: teams.away.color, borderRadius: 3, transition: "width 0.5s" }} />
        </div>
        <div style={{ width: 24, fontSize: 11, fontWeight: 800, color: aVal >= hVal ? teams.away.color : "#64748B" }}>{aVal}{suffix}</div>
        <div style={{ width: 80, fontSize: 8, color: "#64748B", fontWeight: 600 }}>{label}</div>
      </div>
    );
  };

  const Wrapper = embedded ? ({ children }) => <div style={{ padding: "0" }}>{children}</div> : ({ children }) => (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: embedded ? "auto" : "100vh", color: "#E2E8F0", userSelect: "none" }}>{children}</div>
  );

  return (
    <Wrapper>
      {!embedded && <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />}

      {!embedded && <>
      {/* Header */}
      <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer" }}>←</button>}
          <div style={{ fontSize: 9, fontWeight: 700, color: isEnded ? theme.textDim : "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
            {!isEnded && <span style={{ animation: "pulse-dot 2s infinite" }}>●</span>}
            {isEnded ? "FULL TIME — COACH VIEW" : "LIVE — COACH VIEW"}
          </div>
        </div>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#8B5CF6", background: "#8B5CF622", padding: "2px 8px", borderRadius: 99 }}>🔒 Coach</div>
      </div>

      {/* Compact scoreboard */}
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: teams.home.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {teams.home.short || teams.home.name.slice(0, 3).toUpperCase()}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{homeScore}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: isEnded ? theme.danger : "#F59E0B" }}>
            {isEnded ? "FT" : fmt(matchTime)}
          </div>
          {!isEnded && <div style={{ fontSize: 7, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#10B98122", color: "#10B981" }}>
            {quarters.find(q => q.status === "live")?.label || "—"}
          </div>}
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: teams.away.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {teams.away.short || teams.away.name.slice(0, 3).toUpperCase()}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{awayScore}</div>
        </div>
      </div>
      </>}

      {/* View toggle */}
      <div style={{ padding: "0 14px 8px" }}>
        <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: "1px solid #334155" }}>
          {[["quarters", "By Quarter"], ["totals", "Match Totals"]].map(([k, l]) => (
            <button key={k} onClick={() => setViewTab(k)} style={{
              flex: 1, padding: "6px 0", textAlign: "center", fontSize: 9, fontWeight: 700,
              background: viewTab === k ? "#334155" : "#1E293B", color: viewTab === k ? "#F8FAFC" : "#64748B",
              border: "none", cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Match Totals */}
      {viewTab === "totals" && (
        <div style={{ padding: "0 14px 20px" }}>
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Stats Comparison</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {STATS.map(({ key, label }) => (
                <StatBar key={key} hVal={totalStat("home", key)} aVal={totalStat("away", key)} label={label} />
              ))}
              <StatBar hVal={avgTerritory("home")} aVal={avgTerritory("away")} label="Territory" suffix="%" />
            </div>
          </div>

          {/* Conversion rates */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Conversion Rates</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["home", "away"].map(t => (
                <div key={t} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: teams[t].color, marginBottom: 6 }}>
                    {teams[t].short || teams[t].name.slice(0, 3).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{convRate(t)}%</div>
                      <div style={{ fontSize: 7, color: "#64748B" }}>Shot → Goal</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{dConv(t)}%</div>
                      <div style={{ fontSize: 7, color: "#64748B" }}>D Entry → Shot</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Territory by quarter */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Territory by Period</div>
            <div style={{ display: "flex", gap: 4 }}>
              {quarterData.map(q => {
                const isLive = q.status === "live";
                const isUpcoming = q.status === "upcoming";
                return (
                  <div key={q.label} style={{ flex: 1, textAlign: "center", opacity: isUpcoming ? 0.25 : 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: isLive ? "#10B981" : "#64748B", marginBottom: 4 }}>{q.label}</div>
                    <div style={{ height: 60, borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", border: isLive ? "1px solid #10B98133" : "1px solid #334155" }}>
                      <div style={{ height: `${q.home.territory}%`, background: teams.home.color, transition: "height 0.5s" }} />
                      <div style={{ height: `${q.away.territory}%`, background: teams.away.color, transition: "height 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#F8FAFC", marginTop: 3 }}>{isUpcoming ? "–" : `${q.home.territory}%`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quarters Tab */}
      {viewTab === "quarters" && (
        <div style={{ padding: "0 14px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {quarterData.map(q => {
              const isExp = expandedQ === q.label;
              const isLive = q.status === "live";
              const isUpcoming = q.status === "upcoming";

              return (
                <div key={q.label} style={{ borderRadius: 8, overflow: "hidden", border: isLive ? "1px solid #10B98133" : "1px solid #1E293B", opacity: isUpcoming ? 0.3 : 1 }}>
                  {/* Header */}
                  <div onClick={() => !isUpcoming && setExpandedQ(isExp ? null : q.label)} style={{
                    display: "flex", alignItems: "center", padding: "8px 12px",
                    background: isLive ? "#10B98108" : "#1E293B", cursor: isUpcoming ? "default" : "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: isLive ? "#10B981" : "#F8FAFC", width: 22 }}>{q.label}</div>
                      {isLive && !isEnded && <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#10B98122", color: "#10B981" }}>LIVE</span>}
                      {isUpcoming && <span style={{ fontSize: 7, color: "#334155" }}>Upcoming</span>}
                    </div>
                    {!isUpcoming && (
                      <div style={{ fontSize: 12, fontWeight: 800 }}>
                        <span style={{ color: teams.home.color }}>{q.home.goals}</span>
                        <span style={{ color: "#475569", margin: "0 4px" }}>–</span>
                        <span style={{ color: teams.away.color }}>{q.away.goals}</span>
                      </div>
                    )}
                    {!isUpcoming && <span style={{ fontSize: 10, color: "#334155", marginLeft: 8, transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>}
                  </div>

                  {/* Expanded stats */}
                  {isExp && !isUpcoming && (
                    <div style={{ padding: "6px 12px 10px", background: "#0B0F1A" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {STATS.map(({ key, label }) => {
                          const hVal = q.home[key], aVal = q.away[key];
                          const inv = INVERTED.includes(key);
                          const hWins = inv ? hVal < aVal : hVal > aVal;
                          const aWins = inv ? aVal < hVal : aVal > hVal;
                          return (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                              <div style={{ width: 20, fontSize: 11, fontWeight: 800, textAlign: "right", color: hWins ? teams.home.color : "#64748B" }}>{hVal}</div>
                              <div style={{ flex: 1, textAlign: "center", fontSize: 8, color: "#64748B", fontWeight: 600 }}>{label}</div>
                              <div style={{ width: 20, fontSize: 11, fontWeight: 800, color: aWins ? teams.away.color : "#64748B" }}>{aVal}</div>
                            </div>
                          );
                        })}
                        {/* Territory bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0 2px" }}>
                          <div style={{ width: 20, fontSize: 11, fontWeight: 800, textAlign: "right", color: q.home.territory > q.away.territory ? teams.home.color : "#64748B" }}>{q.home.territory}%</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", background: "#1E293B" }}>
                              <div style={{ width: `${q.home.territory}%`, background: teams.home.color }} />
                              <div style={{ width: `${q.away.territory}%`, background: teams.away.color }} />
                            </div>
                            <div style={{ textAlign: "center", fontSize: 8, color: "#64748B", fontWeight: 600, marginTop: 2 }}>Territory</div>
                          </div>
                          <div style={{ width: 20, fontSize: 11, fontWeight: 800, color: q.away.territory > q.home.territory ? teams.away.color : "#64748B" }}>{q.away.territory}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!embedded && <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>}
    </Wrapper>
  );
}

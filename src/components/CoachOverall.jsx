import { STATS, INVERTED, aggregateStats } from '../utils/stats.js';

function StatBar({ teamVal, oppVal, label, suffix = "", teamColor, oppColor }) {
  const max = Math.max(teamVal, oppVal, 1);
  const inv = INVERTED.includes(label?.toLowerCase?.() || "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 18 }}>
      <div style={{ width: 24, fontSize: 10, fontWeight: 700, color: teamColor, textAlign: "right" }}>{teamVal}{suffix}</div>
      <div style={{ flex: 1, display: "flex", gap: 2 }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ height: 8, borderRadius: 4, background: teamColor, width: `${teamVal / max * 100}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, borderRadius: 4, background: oppColor, width: `${oppVal / max * 100}%`, transition: "width 0.5s" }} />
        </div>
      </div>
      <div style={{ width: 24, fontSize: 10, fontWeight: 700, color: oppColor }}>{oppVal}{suffix}</div>
      <div style={{ width: 80, fontSize: 10, color: "#94A3B8" }}>{label}</div>
    </div>
  );
}

export default function CoachOverall({ matchStatsList, teamName, teamColor, matchCount }) {
  if (!matchStatsList || matchStatsList.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No match data available yet</div>;
  }

  const agg = aggregateStats(matchStatsList);
  const n = agg.matchCount;
  const oppColor = "#94A3B8";

  const shotConv = (agg.team.shotsOn + agg.team.shotsOff) > 0 ? Math.round(agg.team.goals / (agg.team.shotsOn + agg.team.shotsOff) * 100) : 0;
  const dConv = agg.team.dEntries > 0 ? Math.round((agg.team.shotsOn + agg.team.shotsOff) / agg.team.dEntries * 100) : 0;
  const oppShotConv = (agg.opp.shotsOn + agg.opp.shotsOff) > 0 ? Math.round(agg.opp.goals / (agg.opp.shotsOn + agg.opp.shotsOff) * 100) : 0;
  const oppDConv = agg.opp.dEntries > 0 ? Math.round((agg.opp.shotsOn + agg.opp.shotsOff) / agg.opp.dEntries * 100) : 0;

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Aggregated across {n} match{n !== 1 ? "es" : ""}
      </div>

      {/* Conversion rates */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Conversion Rates</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: teamName?.slice(0, 3).toUpperCase() || "TEAM", color: teamColor, sc: shotConv, dc: dConv },
            { label: "OPP", color: oppColor, sc: oppShotConv, dc: oppDConv },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{s.sc}%</div>
                  <div style={{ fontSize: 11, color: "#CBD5E1" }}>Shot → Goal</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{s.dc}%</div>
                  <div style={{ fontSize: 11, color: "#CBD5E1" }}>D Entry → Shot</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats comparison - totals */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Season Totals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {STATS.map(({ key, label }) => (
            <StatBar key={key} teamVal={agg.team[key]} oppVal={agg.opp[key]} label={label} teamColor={teamColor} oppColor={oppColor} />
          ))}
          <StatBar teamVal={agg.team.territory} oppVal={agg.opp.territory} label="Territory" suffix="%" teamColor={teamColor} oppColor={oppColor} />
        </div>
      </div>

      {/* Per-match averages */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Per-Match Averages</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          {[
            { label: "Goals", val: (agg.team.goals / n).toFixed(1) },
            { label: "D Entries", val: (agg.team.dEntries / n).toFixed(1) },
            { label: "Shots", val: ((agg.team.shotsOn + agg.team.shotsOff) / n).toFixed(1) },
            { label: "SCs", val: (agg.team.shortCorners / n).toFixed(1) },
            { label: "TOs Won", val: (agg.team.turnoversWon / n).toFixed(1) },
            { label: "Poss Lost", val: (agg.team.possLost / n).toFixed(1) },
            { label: "Territory", val: agg.team.territory + "%" },
            { label: "GD/Match", val: ((agg.team.goals - agg.opp.goals) / n) > 0 ? "+" + ((agg.team.goals - agg.opp.goals) / n).toFixed(1) : ((agg.team.goals - agg.opp.goals) / n).toFixed(1) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#F8FAFC", fontFamily: "monospace" }}>{s.val}</div>
              <div style={{ fontSize: 8, color: "#94A3B8", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

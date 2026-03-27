import { STATS, DISPLAY_STATS, INVERTED, aggregateStats } from '../utils/stats.js';

function StatBar({ teamVal, oppVal, label, suffix = "", teamColor, oppColor }) {
  const max = Math.max(teamVal, oppVal, 1);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 18 }}>
      <div style={{ width: 28, fontSize: 10, fontWeight: 700, color: teamVal >= oppVal ? teamColor : "#64748B", textAlign: "right" }}>{teamVal}{suffix}</div>
      <div style={{ flex: 1, display: "flex", gap: 2 }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ height: 8, borderRadius: 4, background: teamColor, width: `${teamVal / max * 100}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, borderRadius: 4, background: oppColor, width: `${oppVal / max * 100}%`, transition: "width 0.5s" }} />
        </div>
      </div>
      <div style={{ width: 28, fontSize: 10, fontWeight: 700, color: oppVal >= teamVal ? oppColor : "#64748B" }}>{oppVal}{suffix}</div>
      <div style={{ width: 74, fontSize: 10, color: "#94A3B8" }}>{label}</div>
    </div>
  );
}

export default function CoachOverall({ matchStatsList, teamName, teamColor, teamId, allMatches, matchCount }) {
  if (!matchStatsList || matchStatsList.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No match data available yet</div>;
  }

  const agg = aggregateStats(matchStatsList);
  const n = agg.matchCount;
  const oppColor = "#94A3B8";

  // Compute from archived stats
  const tShots = agg.team.shotsOn + agg.team.shotsOff;
  const oShots = agg.opp.shotsOn + agg.opp.shotsOff;

  const convRows = [
    {
      label: "Shots taken", sub: "D Entry → Shot",
      tPct: agg.team.dEntries > 0 ? Math.round(tShots / agg.team.dEntries * 100) : 0,
      tDetail: `${tShots} of ${agg.team.dEntries}`,
      oPct: agg.opp.dEntries > 0 ? Math.round(oShots / agg.opp.dEntries * 100) : 0,
      oDetail: `${oShots} of ${agg.opp.dEntries}`,
    },
    {
      label: "On target", sub: "% of shots",
      tPct: tShots > 0 ? Math.round(agg.team.shotsOn / tShots * 100) : 0,
      tDetail: `${agg.team.shotsOn} of ${tShots}`,
      oPct: oShots > 0 ? Math.round(agg.opp.shotsOn / oShots * 100) : 0,
      oDetail: `${agg.opp.shotsOn} of ${oShots}`,
    },
    {
      label: "Off target", sub: "% of shots",
      tPct: tShots > 0 ? Math.round(agg.team.shotsOff / tShots * 100) : 0,
      tDetail: `${agg.team.shotsOff} of ${tShots}`,
      oPct: oShots > 0 ? Math.round(agg.opp.shotsOff / oShots * 100) : 0,
      oDetail: `${agg.opp.shotsOff} of ${oShots}`,
    },
    {
      label: "Goals", sub: "% of shots on target", isGoals: true,
      tPct: agg.team.shotsOn > 0 ? Math.round(agg.team.goals / agg.team.shotsOn * 100) : 0,
      tDetail: `${agg.team.goals} of ${agg.team.shotsOn}`,
      oPct: agg.opp.shotsOn > 0 ? Math.round(agg.opp.goals / agg.opp.shotsOn * 100) : 0,
      oDetail: `${agg.opp.goals} of ${agg.opp.shotsOn}`,
    },
  ];

  // All-match stats (goals and GD from every ended match, not just recorded)
  const allEnded = (allMatches || []).filter(m => m.status === 'ended');
  const totalMatches = allEnded.length;
  let allGoalsFor = 0, allGoalsAgainst = 0;
  allEnded.forEach(m => {
    const isHome = m.home_team_id === teamId || m.home_team?.id === teamId;
    allGoalsFor += isHome ? (m.home_score || 0) : (m.away_score || 0);
    allGoalsAgainst += isHome ? (m.away_score || 0) : (m.home_score || 0);
  });
  const allGD = allGoalsFor - allGoalsAgainst;

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Aggregated across {n} recorded match{n !== 1 ? "es" : ""}{totalMatches > n ? ` · ${totalMatches} total` : ""}
      </div>

      {/* Conversion rates */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Conversion Rates</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 700, color: teamColor }}>
            {teamName?.slice(0, 3).toUpperCase() || "TEAM"}
          </div>
          <div style={{ width: 80 }} />
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 700, color: oppColor }}>OPP</div>
        </div>
        {convRows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < convRows.length - 1 ? 8 : 0 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: r.isGoals ? "#F59E0B" : "#F8FAFC" }}>{r.tPct}%</div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>{r.tDetail}</div>
            </div>
            <div style={{ width: 80, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 8, color: "#475569" }}>{r.sub}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: r.isGoals ? "#F59E0B" : "#F8FAFC" }}>{r.oPct}%</div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>{r.oDetail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats comparison */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Season Totals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {DISPLAY_STATS.map(({ label, calc, suffix }) => (
            <StatBar key={label} teamVal={calc(agg.team)} oppVal={calc(agg.opp)} label={label} suffix={suffix || ""} teamColor={teamColor} oppColor={oppColor} />
          ))}
        </div>
      </div>

      {/* Per-match averages */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Per-Match Averages</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          {[
            { label: "Goals", val: totalMatches > 0 ? (allGoalsFor / totalMatches).toFixed(1) : "0" },
            { label: "D Entries", val: (agg.team.dEntries / n).toFixed(1) },
            { label: "Shots", val: (tShots / n).toFixed(1) },
            { label: "SCs", val: (agg.team.shortCorners / n).toFixed(1) },
            { label: "Possession", val: agg.team.territory + "%" },
            { label: "GD/Match", val: totalMatches > 0 ? ((allGD / totalMatches) > 0 ? "+" : "") + (allGD / totalMatches).toFixed(1) : "0" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#F8FAFC", fontFamily: "monospace" }}>{s.val}</div>
              <div style={{ fontSize: 8, color: "#94A3B8", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {totalMatches > n && (
          <div style={{ fontSize: 8, color: "#475569", textAlign: "center", marginTop: 6 }}>
            Goals & GD from all {totalMatches} matches · other stats from {n} recorded
          </div>
        )}
      </div>
    </div>
  );
}

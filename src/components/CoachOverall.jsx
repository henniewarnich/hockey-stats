import { aggregateStats } from '../utils/stats.js';

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

  const hasAtkData = agg.team.atkZoneEntries > 0 || agg.opp.atkZoneEntries > 0;
  const convRows = [
    ...(hasAtkData ? [{
      label: "Attack → D", sub: "attack zone to D entry", divider: true,
      tPct: agg.team.atkZoneEntries > 0 ? Math.round(agg.team.dEntries / agg.team.atkZoneEntries * 100) : 0,
      tDetail: `${agg.team.dEntries} of ${agg.team.atkZoneEntries}`,
      oPct: agg.opp.atkZoneEntries > 0 ? Math.round(agg.opp.dEntries / agg.opp.atkZoneEntries * 100) : 0,
      oDetail: `${agg.opp.dEntries} of ${agg.opp.atkZoneEntries}`,
    }] : []),
    {
      label: "D → Short Crnr", sub: "% of D entries",
      tPct: agg.team.dEntries > 0 ? Math.round(agg.team.shortCorners / agg.team.dEntries * 100) : 0,
      tDetail: `${agg.team.shortCorners} of ${agg.team.dEntries}`,
      oPct: agg.opp.dEntries > 0 ? Math.round(agg.opp.shortCorners / agg.opp.dEntries * 100) : 0,
      oDetail: `${agg.opp.shortCorners} of ${agg.opp.dEntries}`,
    },
    {
      label: "SC → Goal", sub: "% of short corners", divider: true, color: "#8B5CF6",
      tPct: agg.team.shortCorners > 0 ? Math.round((agg.team.scGoals || 0) / agg.team.shortCorners * 100) : 0,
      tDetail: `${agg.team.scGoals || 0} of ${agg.team.shortCorners}`,
      oPct: agg.opp.shortCorners > 0 ? Math.round((agg.opp.scGoals || 0) / agg.opp.shortCorners * 100) : 0,
      oDetail: `${agg.opp.scGoals || 0} of ${agg.opp.shortCorners}`,
    },
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
      label: "Goals", sub: "% of shots on target", color: "#F59E0B",
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
          <div key={r.label}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: r.divider ? 0 : 8 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: r.color || "#F8FAFC" }}>{r.tPct}%</div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>{r.tDetail}</div>
            </div>
            <div style={{ width: 80, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: r.color || "#94A3B8", fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 8, color: "#475569" }}>{r.sub}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: r.color || "#F8FAFC" }}>{r.oPct}%</div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>{r.oDetail}</div>
            </div>
          </div>
          {r.divider && <div style={{ borderBottom: "1px solid #33415544", margin: "8px 0" }} />}
          </div>
        ))}
      </div>

      {/* Short Corner Outcomes */}
      {agg.team.scOutcomes && (agg.team.shortCorners > 0 || agg.opp.shortCorners > 0) && (() => {
        const tSCO = agg.team.scOutcomes;
        const oSCO = agg.opp.scOutcomes;
        const tTotal = agg.team.shortCorners;
        const oTotal = agg.opp.shortCorners;
        const rows = [
          { label: "⚽ Goal", key: "goal", color: "#F59E0B" },
          { label: "◉ Shot on", key: "shotOn", color: "#10B981" },
          { label: "○ Shot off", key: "shotOff", color: "#6B7280" },
          { label: "🔲 Won SC", key: "wonSC", color: "#8B5CF6" },
          { label: "✕ Lost poss", key: "lostPoss", color: "#EF4444" },
          { label: "⊘ Dead ball", key: "deadBall", color: "#94A3B8" },
        ];
        return (
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Short Corner Outcomes</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: teamColor }}>
                {teamName?.slice(0, 3).toUpperCase()} <span style={{ color: "#475569", fontWeight: 400 }}>({tTotal})</span>
              </div>
              <div style={{ width: 80 }} />
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: oppColor }}>
                OPP <span style={{ color: "#475569", fontWeight: 400 }}>({oTotal})</span>
              </div>
            </div>
            {rows.filter(r => (tSCO[r.key] || 0) + (oSCO[r.key] || 0) > 0).map(r => (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: tSCO[r.key] ? r.color : "#333" }}>{tSCO[r.key] || 0}</span>
                  {tTotal > 0 && tSCO[r.key] > 0 && <span style={{ fontSize: 8, color: "#475569", marginLeft: 3 }}>{Math.round(tSCO[r.key] / tTotal * 100)}%</span>}
                </div>
                <div style={{ width: 80, textAlign: "center", fontSize: 9, color: r.color, fontWeight: 600 }}>{r.label}</div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: oSCO[r.key] ? r.color : "#333" }}>{oSCO[r.key] || 0}</span>
                  {oTotal > 0 && oSCO[r.key] > 0 && <span style={{ fontSize: 8, color: "#475569", marginLeft: 3 }}>{Math.round(oSCO[r.key] / oTotal * 100)}%</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Per-match averages */}
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Per-Match Averages</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          {[
            { label: "Goals", val: totalMatches > 0 ? (allGoalsFor / totalMatches).toFixed(1) : "0" },
            { label: "D Entries", val: (agg.team.dEntries / n).toFixed(1) },
            { label: "Shots", val: (tShots / n).toFixed(1) },
            { label: "SCs", val: (agg.team.shortCorners / n).toFixed(1) },
            { label: "Possession", val: (agg.team.possessionTimePct != null ? agg.team.possessionTimePct : agg.team.territory) + "%" },
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

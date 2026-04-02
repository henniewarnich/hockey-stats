import { aggregateStats } from '../utils/stats.js';

export default function CoachOverall({ matchStatsList, teamName, teamColor, teamId, allMatches, matchCount, top10Agg }) {
  if (!matchStatsList || matchStatsList.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No match data available yet</div>;
  }

  const agg = aggregateStats(matchStatsList);
  const n = agg.matchCount;
  const abbr = (teamName || "TEAM").slice(0, 3).toUpperCase();
  const oppColor = "#94A3B8";
  const top10Color = "#8B5CF6";

  const tShots = agg.team.shotsOn + agg.team.shotsOff;
  const oShots = agg.opp.shotsOn + agg.opp.shotsOff;
  const t10 = top10Agg;
  const t10Shots = t10 ? t10.team.shotsOn + t10.team.shotsOff : 0;

  const pct = (num, den) => den > 0 ? Math.round(num / den * 100) : 0;

  const fmtDiff = (teamVal, otherVal, suffix = "%") => {
    const diff = otherVal - teamVal;
    if (diff === 0) return `0${suffix}`;
    return `${diff > 0 ? "+" : ""}${diff}${suffix}`;
  };

  const trafficColor = (teamVal, oppVal, top10Val) => {
    if (top10Val == null) {
      if (teamVal > oppVal) return "#10B981";
      if (teamVal < oppVal) return "#EF4444";
      return "#F59E0B";
    }
    const behindOpp = oppVal > teamVal;
    const behindTop = top10Val > teamVal;
    if (behindOpp && behindTop) return "#EF4444";
    if (!behindOpp && !behindTop) return "#10B981";
    return "#F59E0B";
  };

  // Possession & territory
  const tPoss = agg.team.possessionTimePct != null ? agg.team.possessionTimePct : agg.team.territory;
  const oPoss = agg.opp.possessionTimePct != null ? agg.opp.possessionTimePct : agg.opp.territory;
  const t10Poss = t10 ? (t10.team.possessionTimePct != null ? t10.team.possessionTimePct : t10.team.territory) : null;
  const tTerr = agg.team.territoryTimePct != null ? agg.team.territoryTimePct : agg.team.territory;
  const oTerr = agg.opp.territoryTimePct != null ? agg.opp.territoryTimePct : agg.opp.territory;
  const t10Terr = t10 ? (t10.team.territoryTimePct != null ? t10.team.territoryTimePct : t10.team.territory) : null;

  const hasAtkData = agg.team.atkZoneEntries > 0 || agg.opp.atkZoneEntries > 0;

  const rows = [
    { label: "Possession", sub: "% of play", tVal: tPoss, oVal: oPoss, t10Val: t10Poss, suffix: "%" },
    { label: "Territory", sub: "% in opp half", tVal: tTerr, oVal: oTerr, t10Val: t10Terr, suffix: "%" },
    ...(hasAtkData ? [{
      label: "Attack \u2192 D", sub: "attack zone to D entry",
      tVal: pct(agg.team.dEntries, agg.team.atkZoneEntries),
      oVal: pct(agg.opp.dEntries, agg.opp.atkZoneEntries),
      t10Val: t10 ? pct(t10.team.dEntries, t10.team.atkZoneEntries) : null,
      tDetail: `${agg.team.dEntries} of ${agg.team.atkZoneEntries}`, suffix: "%",
    }] : []),
    {
      label: "D \u2192 Short Crnr", sub: "% of D entries",
      tVal: pct(agg.team.shortCorners, agg.team.dEntries),
      oVal: pct(agg.opp.shortCorners, agg.opp.dEntries),
      t10Val: t10 ? pct(t10.team.shortCorners, t10.team.dEntries) : null,
      tDetail: `${agg.team.shortCorners} of ${agg.team.dEntries}`, suffix: "%",
    },
    {
      label: "SC \u2192 Goal", sub: "% of short corners",
      tVal: pct(agg.team.scGoals || 0, agg.team.shortCorners),
      oVal: pct(agg.opp.scGoals || 0, agg.opp.shortCorners),
      t10Val: t10 ? pct(t10.team.scGoals || 0, t10.team.shortCorners) : null,
      tDetail: `${agg.team.scGoals || 0} of ${agg.team.shortCorners}`, suffix: "%",
    },
    {
      label: "Shots taken", sub: "D Entry \u2192 Shot",
      tVal: pct(tShots, agg.team.dEntries),
      oVal: pct(oShots, agg.opp.dEntries),
      t10Val: t10 ? pct(t10Shots, t10.team.dEntries) : null,
      tDetail: `${tShots} of ${agg.team.dEntries}`, suffix: "%",
    },
    {
      label: "On target", sub: "% of shots",
      tVal: pct(agg.team.shotsOn, tShots),
      oVal: pct(agg.opp.shotsOn, oShots),
      t10Val: t10 ? pct(t10.team.shotsOn, t10Shots) : null,
      tDetail: `${agg.team.shotsOn} of ${tShots}`, suffix: "%",
    },
    {
      label: "Goals", sub: "% of shots on target", color: "#F59E0B",
      tVal: pct(agg.team.goals, agg.team.shotsOn),
      oVal: pct(agg.opp.goals, agg.opp.shotsOn),
      t10Val: t10 ? pct(t10.team.goals, t10.team.shotsOn) : null,
      tDetail: `${agg.team.goals} of ${agg.team.shotsOn}`, suffix: "%",
    },
  ];

  // Per-match goals
  const allEnded = (allMatches || []).filter(m => m.status === 'ended');
  const totalMatches = allEnded.length;
  let allGoalsFor = 0, allGoalsAgainst = 0;
  allEnded.forEach(m => {
    const isHome = m.home_team_id === teamId || m.home_team?.id === teamId;
    allGoalsFor += isHome ? (m.home_score || 0) : (m.away_score || 0);
    allGoalsAgainst += isHome ? (m.away_score || 0) : (m.home_score || 0);
  });
  const allGD = allGoalsFor - allGoalsAgainst;
  const gfPM = totalMatches > 0 ? +(allGoalsFor / totalMatches).toFixed(1) : 0;
  const gaPM = totalMatches > 0 ? +(allGoalsAgainst / totalMatches).toFixed(1) : 0;
  const gdPM = totalMatches > 0 ? +(allGD / totalMatches).toFixed(1) : 0;
  const oppGF = n > 0 ? +(agg.opp.goals / n).toFixed(1) : 0;
  const oppGA = n > 0 ? +(agg.team.goals / n).toFixed(1) : 0;
  const oppGD = +(oppGF - oppGA).toFixed(1);
  const t10GF = t10 ? +(t10.team.goals / (t10.matchCount || 1)).toFixed(1) : null;
  const t10GA = t10 ? +(t10.opp.goals / (t10.matchCount || 1)).toFixed(1) : null;
  const t10GD = t10GF != null && t10GA != null ? +((t10GF - t10GA).toFixed(1)) : null;

  // GF: higher is better. GA: lower is better (invert). GD: higher is better.
  const gfColor = trafficColor(gfPM, oppGF, t10GF);
  const gaColor = trafficColor(-gaPM, -oppGA, t10GA != null ? -t10GA : null);
  const gdColor = trafficColor(gdPM, oppGD, t10GD);

  const fmtDiffDec = (tVal, oVal) => {
    if (oVal == null) return "\u2013";
    const diff = +(oVal - tVal).toFixed(1);
    if (diff === 0) return "0";
    return `${diff > 0 ? "+" : ""}${diff}`;
  };

  const S = {
    card: { background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "1px solid #334155" },
    title: { fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 },
    colH: { display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid #33415544" },
    hdr: { fontSize: 9, fontWeight: 800, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 },
    row: (last) => ({ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, alignItems: "center", padding: "8px 0", ...(last ? {} : { borderBottom: "1px solid #1a2536" }) }),
  };

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Aggregated across {n} recorded match{n !== 1 ? "es" : ""}{totalMatches > n ? ` \u00b7 ${totalMatches} total` : ""}
      </div>

      {/* Detailed Live Pro Stats */}
      <div style={S.card}>
        <div style={S.title}>Detailed Live Pro Stats</div>
        <div style={S.colH}>
          <div />
          <div style={{ ...S.hdr, color: teamColor }}>{abbr}</div>
          <div style={{ ...S.hdr, color: oppColor }}>vs OPP</div>
          <div style={{ ...S.hdr, color: top10Color }}>vs TOP10</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.label} style={S.row(i === rows.length - 1)}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.color || "#CBD5E1" }}>{r.label}</div>
              <div style={{ fontSize: 8, color: "#475569", marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: trafficColor(r.tVal, r.oVal, r.t10Val) }}>{r.tVal}{r.suffix}</div>
              {r.tDetail && <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{r.tDetail}</div>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiff(r.tVal, r.oVal, r.suffix)}</div>
            <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{r.t10Val != null ? fmtDiff(r.tVal, r.t10Val, r.suffix) : "\u2013"}</div>
          </div>
        ))}
      </div>

      {/* Per-match averages */}
      <div style={S.card}>
        <div style={S.title}>Per-Match Averages</div>
        <div style={S.colH}>
          <div />
          <div style={{ ...S.hdr, color: teamColor }}>{abbr}</div>
          <div style={{ ...S.hdr, color: oppColor }}>vs OPP</div>
          <div style={{ ...S.hdr, color: top10Color }}>vs TOP10</div>
        </div>
        <div style={S.row(false)}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>Goals For</div></div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, textAlign: "center", color: gfColor }}>{gfPM}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiffDec(gfPM, oppGF)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{fmtDiffDec(gfPM, t10GF)}</div>
        </div>
        <div style={S.row(false)}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>Goals Against</div></div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, textAlign: "center", color: gaColor }}>{gaPM}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiffDec(gaPM, oppGA)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{fmtDiffDec(gaPM, t10GA)}</div>
        </div>
        <div style={S.row(true)}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>Goal Difference</div></div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, textAlign: "center", color: gdColor }}>{gdPM > 0 ? "+" : ""}{gdPM}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiffDec(gdPM, oppGD)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{fmtDiffDec(gdPM, t10GD)}</div>
        </div>
        {totalMatches > n && (
          <div style={{ fontSize: 8, color: "#475569", textAlign: "center", marginTop: 6 }}>
            Goals from all {totalMatches} matches · other stats from {n} recorded
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "6px 0" }}>
        {[["#10B981", "Better than both"], ["#F59E0B", "Mixed"], ["#EF4444", "Behind both"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#64748B" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            {l}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 9, color: "#334155" }}>
        + means they're ahead · − means you're ahead
      </div>
    </div>
  );
}

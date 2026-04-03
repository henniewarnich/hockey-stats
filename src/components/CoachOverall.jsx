import { useState } from 'react';
import { aggregateStats } from '../utils/stats.js';

function MiniTrend({ points, oppAvg, top10Avg, teamColor: tc }) {
  if (!points || points.length === 0) return null;
  const W = 320, H = 70, PL = 8, PR = 8, PT = 4, PB = 18;
  const plotW = W - PL - PR, plotH = H - PT - PB;

  // Auto-scale Y axis
  const allVals = [...points.map(p => p.val), oppAvg, top10Avg].filter(v => v != null && !isNaN(v));
  const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
  const range = rawMax - rawMin || 10;
  const yMin = Math.max(0, rawMin - range * 0.15);
  const yMax = rawMax + range * 0.15;
  const toY = (v) => PT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const toX = (i) => PL + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.val).toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${toX(points.length - 1).toFixed(1)},${toY(yMin).toFixed(1)} L${toX(0).toFixed(1)},${toY(yMin).toFixed(1)} Z`;

  // Grid lines (3)
  const gridVals = [yMin + (yMax - yMin) * 0.25, yMin + (yMax - yMin) * 0.5, yMin + (yMax - yMin) * 0.75];

  // Date labels
  const first = points[0]?.label || '';
  const last = points[points.length - 1]?.label || '';
  const mid = points.length > 2 ? points[Math.floor(points.length / 2)]?.label || '' : '';

  // Last 5 avg
  const last5 = points.slice(-5);
  const last5Avg = last5.reduce((s, p) => s + p.val, 0) / last5.length;
  const overallAvg = points.reduce((s, p) => s + p.val, 0) / points.length;
  const trending = last5Avg > overallAvg + 0.5 ? 'up' : last5Avg < overallAvg - 0.5 ? 'down' : 'flat';

  return (
    <div style={{ padding: '6px 0 10px' }}>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#64748B' }}>
          <span style={{ width: 12, height: 2, background: '#10B981', borderRadius: 1, display: 'inline-block' }} /> Team
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#64748B' }}>
          <span style={{ width: 12, height: 2, background: '#94A3B8', borderRadius: 1, display: 'inline-block' }} /> OPP
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#64748B' }}>
          <span style={{ width: 12, height: 0, borderTop: '2px dashed #8B5CF6', borderRadius: 1, display: 'inline-block' }} /> Top 10
        </span>
      </div>
      <div style={{ background: '#0B0F1A', borderRadius: 6, padding: '2px 0' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x={PL + 2} y={toY(v) - 2} fill="#475569" fontSize="7">{Math.round(v)}%</text>
            </g>
          ))}
          {/* OPP avg flat line */}
          {oppAvg != null && <line x1={PL} y1={toY(oppAvg)} x2={W - PR} y2={toY(oppAvg)} stroke="#94A3B8" strokeWidth="1.5" opacity="0.45" />}
          {/* TOP10 benchmark dashed */}
          {top10Avg != null && <line x1={PL} y1={toY(top10Avg)} x2={W - PR} y2={toY(top10Avg)} stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.65" />}
          {/* Area fill */}
          <path d={areaPath} fill="#10B981" opacity="0.08" />
          {/* Team line */}
          <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={toX(i)} cy={toY(p.val)} r={i === points.length - 1 ? 3.5 : 2.5}
              fill={i === points.length - 1 ? '#F59E0B' : '#10B981'} />
          ))}
          {/* X-axis */}
          <line x1={PL} y1={H - PB + 4} x2={W - PR} y2={H - PB + 4} stroke="#334155" strokeWidth="0.5" />
          <text x={toX(0)} y={H - 4} textAnchor="start" fill="#475569" fontSize="7">{first}</text>
          {points.length > 2 && <text x={toX(Math.floor(points.length / 2))} y={H - 4} textAnchor="middle" fill="#475569" fontSize="7">{mid}</text>}
          <text x={toX(points.length - 1)} y={H - 4} textAnchor="end" fill="#475569" fontSize="7">{last}</text>
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#475569', marginTop: 3, padding: '0 4px' }}>
        <span>{points.length} matches</span>
        <span>
          Avg: <span style={{ color: '#10B981', fontWeight: 700 }}>{Math.round(overallAvg)}%</span>
          {' '}Last 5: <span style={{ color: '#10B981', fontWeight: 700 }}>{Math.round(last5Avg)}%</span>
          {' '}<span style={{ color: trending === 'up' ? '#10B981' : trending === 'down' ? '#EF4444' : '#64748B' }}>
            {trending === 'up' ? '\u2191' : trending === 'down' ? '\u2193' : '\u2192'}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function CoachOverall({ matchStatsList, matchStatsMap, teamName, teamColor, teamId, allMatches, matchCount, top10Agg, top10PM }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

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

  // Build per-match trend data (sorted by date)
  const matchesMap = {};
  (allMatches || []).forEach(m => { matchesMap[m.id] = m; });
  const trendData = [];
  if (matchStatsMap) {
    Object.entries(matchStatsMap).forEach(([matchId, stats]) => {
      const m = matchesMap[matchId];
      if (!m) return;
      const d = new Date(m.match_date || m.created_at);
      const label = d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
      const ts = stats.team.shotsOn + stats.team.shotsOff;
      trendData.push({
        matchId, date: d, label,
        poss: stats.team.possessionTimePct != null ? stats.team.possessionTimePct : stats.team.territory,
        terr: stats.team.territoryTimePct != null ? stats.team.territoryTimePct : stats.team.territory,
        atkConv: stats.team.atkZoneEntries > 0 ? Math.round(stats.team.dEntries / stats.team.atkZoneEntries * 100) : null,
        dToSC: stats.team.dEntries > 0 ? Math.round(stats.team.shortCorners / stats.team.dEntries * 100) : null,
        scToGoal: stats.team.shortCorners > 0 ? Math.round((stats.team.scGoals || 0) / stats.team.shortCorners * 100) : null,
        shotsTaken: stats.team.dEntries > 0 ? Math.round(ts / stats.team.dEntries * 100) : null,
        onTarget: ts > 0 ? Math.round(stats.team.shotsOn / ts * 100) : null,
        goals: stats.team.shotsOn > 0 ? Math.round(stats.team.goals / stats.team.shotsOn * 100) : null,
      });
    });
  }
  trendData.sort((a, b) => a.date - b.date);

  const getTrend = (key) => trendData.filter(d => d[key] != null).map(d => ({ val: d[key], label: d.label }));

  // Possession & territory
  const tPoss = agg.team.possessionTimePct != null ? agg.team.possessionTimePct : agg.team.territory;
  const oPoss = agg.opp.possessionTimePct != null ? agg.opp.possessionTimePct : agg.opp.territory;
  const t10Poss = t10 ? (t10.team.possessionTimePct != null ? t10.team.possessionTimePct : t10.team.territory) : null;
  const tTerr = agg.team.territoryTimePct != null ? agg.team.territoryTimePct : agg.team.territory;
  const oTerr = agg.opp.territoryTimePct != null ? agg.opp.territoryTimePct : agg.opp.territory;
  const t10Terr = t10 ? (t10.team.territoryTimePct != null ? t10.team.territoryTimePct : t10.team.territory) : null;

  const hasAtkData = agg.team.atkZoneEntries > 0 || agg.opp.atkZoneEntries > 0;

  const rows = [
    { key: 'poss', label: "Possession", sub: "% of play", tVal: tPoss, oVal: oPoss, t10Val: t10Poss, suffix: "%", trendKey: 'poss' },
    { key: 'terr', label: "Territory", sub: "% in opp half", tVal: tTerr, oVal: oTerr, t10Val: t10Terr, suffix: "%", trendKey: 'terr' },
    ...(hasAtkData ? [{
      key: 'atk', label: "Attack \u2192 D", sub: "attack zone to D entry",
      tVal: pct(agg.team.dEntries, agg.team.atkZoneEntries),
      oVal: pct(agg.opp.dEntries, agg.opp.atkZoneEntries),
      t10Val: t10 ? pct(t10.team.dEntries, t10.team.atkZoneEntries) : null,
      tDetail: `${agg.team.dEntries} of ${agg.team.atkZoneEntries}`, suffix: "%", trendKey: 'atkConv',
    }] : []),
    { key: 'dsc', label: "D \u2192 Short Crnr", sub: "% of D entries",
      tVal: pct(agg.team.shortCorners, agg.team.dEntries),
      oVal: pct(agg.opp.shortCorners, agg.opp.dEntries),
      t10Val: t10 ? pct(t10.team.shortCorners, t10.team.dEntries) : null,
      tDetail: `${agg.team.shortCorners} of ${agg.team.dEntries}`, suffix: "%", trendKey: 'dToSC',
    },
    { key: 'scg', label: "SC \u2192 Goal", sub: "% of short corners",
      tVal: pct(agg.team.scGoals || 0, agg.team.shortCorners),
      oVal: pct(agg.opp.scGoals || 0, agg.opp.shortCorners),
      t10Val: t10 ? pct(t10.team.scGoals || 0, t10.team.shortCorners) : null,
      tDetail: `${agg.team.scGoals || 0} of ${agg.team.shortCorners}`, suffix: "%", trendKey: 'scToGoal',
    },
    { key: 'shots', label: "Shots taken", sub: "D Entry \u2192 Shot",
      tVal: pct(tShots, agg.team.dEntries),
      oVal: pct(oShots, agg.opp.dEntries),
      t10Val: t10 ? pct(t10Shots, t10.team.dEntries) : null,
      tDetail: `${tShots} of ${agg.team.dEntries}`, suffix: "%", trendKey: 'shotsTaken',
    },
    { key: 'onTarget', label: "On target", sub: "% of shots",
      tVal: pct(agg.team.shotsOn, tShots),
      oVal: pct(agg.opp.shotsOn, oShots),
      t10Val: t10 ? pct(t10.team.shotsOn, t10Shots) : null,
      tDetail: `${agg.team.shotsOn} of ${tShots}`, suffix: "%", trendKey: 'onTarget',
    },
    { key: 'goals', label: "Goals", sub: "% of shots on target", color: "#F59E0B",
      tVal: pct(agg.team.goals, agg.team.shotsOn),
      oVal: pct(agg.opp.goals, agg.opp.shotsOn),
      t10Val: t10 ? pct(t10.team.goals, t10.team.shotsOn) : null,
      tDetail: `${agg.team.goals} of ${agg.team.shotsOn}`, suffix: "%", trendKey: 'goals',
    },
  ];

  // Per-match averages
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
  const t10GF = top10PM ? +top10PM.gf.toFixed(1) : null;
  const t10GA = top10PM ? +top10PM.ga.toFixed(1) : null;
  const t10GD = top10PM ? +top10PM.gd.toFixed(1) : null;
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
          <div style={{ ...S.hdr, color: top10Color, lineHeight: 1.3 }}>Benchmark<br/><span style={{ fontSize: 7 }}>TOP 10</span></div>
        </div>
        {rows.map((r, i) => {
          const isExp = expanded[r.key];
          const trend = getTrend(r.trendKey);
          const hasTrend = trend.length >= 2;
          return (
            <div key={r.key}>
              <div
                onClick={() => hasTrend && toggle(r.key)}
                style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, alignItems: "center", padding: "8px 0", borderBottom: (i < rows.length - 1 && !isExp) ? "1px solid #1a2536" : "none", cursor: hasTrend ? "pointer" : "default" }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: r.color || "#CBD5E1", display: "flex", alignItems: "center", gap: 4 }}>
                    {hasTrend && <span style={{ fontSize: 8, color: "#475569", transition: "transform 0.2s", transform: isExp ? "rotate(90deg)" : "none", display: "inline-block" }}>{"\u203A"}</span>}
                    {r.label}
                  </div>
                  <div style={{ fontSize: 8, color: "#475569", marginTop: 1, paddingLeft: hasTrend ? 12 : 0 }}>{r.sub}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: trafficColor(r.tVal, r.oVal, r.t10Val) }}>{r.tVal}{r.suffix}</div>
                  {r.tDetail && <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{r.tDetail}</div>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiff(r.tVal, r.oVal, r.suffix)}</div>
                <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{r.t10Val != null ? fmtDiff(r.tVal, r.t10Val, r.suffix) : "\u2013"}</div>
              </div>
              {isExp && hasTrend && (
                <div style={{ borderBottom: i < rows.length - 1 ? "1px solid #1a2536" : "none", paddingBottom: 4 }}>
                  <MiniTrend points={trend} oppAvg={r.oVal} top10Avg={r.t10Val} teamColor={teamColor} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-match averages */}
      <div style={S.card}>
        <div style={S.title}>Per-Match Averages</div>
        <div style={S.colH}>
          <div />
          <div style={{ ...S.hdr, color: teamColor }}>{abbr}</div>
          <div style={{ ...S.hdr, color: oppColor }}>vs OPP</div>
          <div style={{ ...S.hdr, color: top10Color, lineHeight: 1.3 }}>Benchmark<br/><span style={{ fontSize: 7 }}>TOP 10</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a2536" }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>Goals For</div></div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, textAlign: "center", color: gfColor }}>{gfPM}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiffDec(gfPM, oppGF)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{fmtDiffDec(gfPM, t10GF)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a2536" }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>Goals Against</div></div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, textAlign: "center", color: gaColor }}>{gaPM}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: oppColor }}>{fmtDiffDec(gaPM, oppGA)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: top10Color }}>{fmtDiffDec(gaPM, t10GA)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", gap: 4, alignItems: "center", padding: "8px 0" }}>
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
        + means they're ahead · − means you're ahead · tap metrics for trends
      </div>
    </div>
  );
}

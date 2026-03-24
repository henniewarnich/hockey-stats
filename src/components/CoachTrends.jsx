import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { getWeekStart } from '../utils/stats.js';
import { parseSASTDate } from '../utils/helpers.js';

function MiniChart({ data, label, color, suffix = "", showZeroLine = false, invert = false }) {
  if (data.length === 0) return null;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 1);
  const range = max - min || 1;
  const W = 300, H = 80, PAD = 24;
  const plotW = W - PAD * 2, plotH = H - 12;

  const points = data.map((d, i) => {
    const x = PAD + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
    const y = 6 + plotH - ((d.value - min) / range) * plotH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const zeroY = range > 0 ? 6 + plotH - ((0 - min) / range) * plotH : H / 2;
  const latest = points[points.length - 1];
  const prev = points.length >= 2 ? points[points.length - 2] : null;
  const trend = prev ? (latest.value - prev.value) : 0;
  const trendColor = invert
    ? (trend < 0 ? "#10B981" : trend > 0 ? "#EF4444" : "#64748B")
    : (trend > 0 ? "#10B981" : trend < 0 ? "#EF4444" : "#64748B");

  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#F8FAFC", fontFamily: "monospace" }}>{latest?.value}{suffix}</span>
          {prev && (
            <span style={{ fontSize: 10, fontWeight: 700, color: trendColor }}>
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend)}{suffix}
            </span>
          )}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {showZeroLine && <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill={color} />
            <text x={p.x} y={H - 1} textAnchor="middle" fill="#475569" fontSize="7" fontWeight="600">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function CoachTrends({ matches, matchStatsMap, teamId, teamColor }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      const { data } = await supabase
        .from('rankings')
        .select('position, ranking_set:ranking_sets!ranking_set_id(scraped_at, created_at)')
        .eq('team_id', teamId)
        .order('created_at', { foreignTable: 'ranking_sets', ascending: true });
      setRankings(data || []);
    })();
  }, [teamId]);

  if (!matches || matches.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No match data for trends</div>;
  }

  // Group matches by week (Monday start)
  const weekMap = {};
  matches.filter(m => m.status === 'ended' && matchStatsMap[m.id]).forEach(m => {
    const week = getWeekStart(m.match_date);
    if (!weekMap[week]) weekMap[week] = [];
    weekMap[week].push(m);
  });

  const weeks = Object.keys(weekMap).sort();
  const fmtWeek = (w) => {
    const d = parseSASTDate(w);
    return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  };

  // Compute weekly stats
  const weeklyData = weeks.map(w => {
    const ms = weekMap[w];
    const stats = ms.map(m => matchStatsMap[m.id]).filter(Boolean);
    const n = stats.length || 1;
    const teamGoals = stats.reduce((s, st) => s + st.team.goals, 0);
    const oppGoals = stats.reduce((s, st) => s + st.opp.goals, 0);
    return {
      week: w,
      label: fmtWeek(w),
      gd: teamGoals - oppGoals,
      territory: Math.round(stats.reduce((s, st) => s + st.team.territory, 0) / n),
      possession: Math.round(stats.reduce((s, st) => s + st.team.territory, 0) / n), // territory ≈ possession in our model
      dEntries: Math.round(stats.reduce((s, st) => s + st.team.dEntries, 0) / n * 10) / 10,
      shortCorners: Math.round(stats.reduce((s, st) => s + st.team.shortCorners, 0) / n * 10) / 10,
      matches: ms.length,
    };
  });

  // Rankings by week
  const rankingData = rankings
    .filter(r => r.ranking_set?.scraped_at)
    .map(r => ({
      label: parseSASTDate(r.ranking_set.scraped_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
      value: r.position,
    }));

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Weekly trends across {matches.filter(m => m.status === 'ended').length} matches
      </div>

      {rankingData.length > 0 && (
        <MiniChart data={rankingData} label="Ranking" color="#F59E0B" suffix="" invert={true} />
      )}

      {weeklyData.length > 0 && (
        <>
          <MiniChart
            data={weeklyData.map(w => ({ label: w.label, value: w.gd }))}
            label="Goal Difference" color={teamColor} showZeroLine suffix="" />
          <MiniChart
            data={weeklyData.map(w => ({ label: w.label, value: w.territory }))}
            label="Territory" color={teamColor} suffix="%" />
          <MiniChart
            data={weeklyData.map(w => ({ label: w.label, value: w.possession }))}
            label="Possession" color={teamColor} suffix="%" />
          <MiniChart
            data={weeklyData.map(w => ({ label: w.label, value: w.dEntries }))}
            label="D-Entries (avg/match)" color={teamColor} />
          <MiniChart
            data={weeklyData.map(w => ({ label: w.label, value: w.shortCorners }))}
            label="Short Corners (avg/match)" color={teamColor} />
        </>
      )}
    </div>
  );
}

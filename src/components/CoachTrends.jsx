import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { parseSASTDate } from '../utils/helpers.js';

function TrendChart({ data, label, color, suffix = "%" }) {
  if (!data || data.length === 0) return null;

  const vals = data.map(d => d.value);
  const n = data.length;
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / n);
  const last5 = vals.slice(-5);
  const last5Avg = Math.round(last5.reduce((a, b) => a + b, 0) / last5.length);
  const trend = last5Avg > avg ? "↑" : last5Avg < avg ? "↓" : "→";
  const trendColor = last5Avg > avg ? "#10B981" : last5Avg < avg ? "#EF4444" : "#F59E0B";

  // Moving average (5-match window)
  const ma = vals.map((_, i) => {
    const start = Math.max(0, i - 4);
    const slice = vals.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  const allVals = [...vals, ...ma];
  const min = Math.min(...allVals) - 5;
  const max = Math.max(...allVals) + 5;
  const range = max - min || 1;
  const W = 340, H = 80;
  const xStep = n > 1 ? W / (n - 1) : W;

  const toX = (i) => i * xStep;
  const toY = (v) => H - ((v - min) / range) * (H - 10) - 5;

  // Dots
  const dots = data.map((d, i) => (
    <circle key={i} cx={toX(i)} cy={toY(d.value)} r={2.5} fill={color} opacity={0.35} />
  ));

  // Trend line
  const trendPath = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

  // Grid lines
  const gridVals = [25, 50, 75].filter(v => v > min && v < max);
  const grid = gridVals.map(v => (
    <g key={v}>
      <line x1={0} y1={toY(v)} x2={W} y2={toY(v)} stroke="#33415544" strokeWidth={0.5} />
      <text x={W + 3} y={toY(v) + 3} fontSize={7} fill="#475569">{v}{suffix}</text>
    </g>
  ));

  // X-axis labels (every 10th match)
  const xLabels = data.map((d, i) => {
    if (n <= 10) return <text key={i} x={toX(i)} y={H + 7} textAnchor="middle" fontSize={6} fill="#475569">{d.label}</text>;
    if (i % 10 === 0 || i === n - 1) return <text key={i} x={toX(i)} y={H + 7} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize={6} fill="#475569">{d.label}</text>;
    return null;
  });

  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569" }}>
            <svg width={8} height={8}><circle cx={4} cy={4} r={2.5} fill={color} opacity={0.35} /></svg> per match
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569" }}>
            <svg width={14} height={8}><line x1={0} y1={4} x2={14} y2={4} stroke={color} strokeWidth={2} /></svg> 5-avg
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W + 22} ${H + 10}`} style={{ width: "100%", height: H + 10 }}>
        {grid}
        {dots}
        <path d={trendPath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {xLabels}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", marginTop: 2 }}>
        <span>{n} match{n !== 1 ? "es" : ""}</span>
        <span>
          Avg: <span style={{ color, fontWeight: 700 }}>{avg}{suffix}</span>
          {" · Last 5: "}
          <span style={{ color: trendColor, fontWeight: 700 }}>{last5Avg}{suffix} {trend}</span>
        </span>
      </div>
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

  // Per-match data sorted chronologically
  const matchData = matches
    .filter(m => m.status === 'ended' && matchStatsMap[m.id])
    .sort((a, b) => (a.match_date || '').localeCompare(b.match_date || ''))
    .map((m, i) => {
      const s = matchStatsMap[m.id];
      const t = s.team;
      const o = s.opp;
      const d = parseSASTDate(m.match_date);
      const label = d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
      const tShots = t.shotsOn + t.shotsOff;
      return {
        label,
        atkToD: t.atkZoneEntries > 0 ? Math.round(t.dEntries / t.atkZoneEntries * 100) : null,
        dToSC: t.dEntries > 0 ? Math.round(t.shortCorners / t.dEntries * 100) : 0,
        scToGoal: t.shortCorners > 0 ? Math.round((t.scGoals || 0) / t.shortCorners * 100) : 0,
        possession: t.possessionTimePct != null ? t.possessionTimePct : t.territory || 0,
        territory: t.territoryTimePct != null ? t.territoryTimePct : t.territory || 0,
        hasTimeBased: t.possessionTimePct != null,
      };
    });

  if (matchData.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No recorded match data for trends</div>;
  }

  const hasAtkData = matchData.some(m => m.atkToD !== null);

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Per-match trends · {matchData.length} recorded match{matchData.length !== 1 ? "es" : ""} · 5-game moving average
      </div>

      {hasAtkData && (
        <TrendChart
          data={matchData.filter(m => m.atkToD !== null).map(m => ({ label: m.label, value: m.atkToD }))}
          label="Attack → D Entry" color="#10B981" />
      )}

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.dToSC }))}
        label="D Entry → Short Corner" color="#8B5CF6" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.scToGoal }))}
        label="Short Corner → Goal" color="#F59E0B" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.possession }))}
        label="Possession %" color="#3B82F6" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.territory }))}
        label="Territory %" color="#22C55E" />
    </div>
  );
}

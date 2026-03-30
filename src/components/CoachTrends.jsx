import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { parseSASTDate } from '../utils/helpers.js';
import { teamColor, teamShortName } from '../utils/teams.js';

function TrendChart({ data, label, color, suffix = "%" }) {
  const [selected, setSelected] = useState(null);

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
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const min = Math.max(0, minVal - 8);
  const max = maxVal + 8;
  const range = max - min || 1;
  const W = 320, H = 90, PAD_L = 28, PAD_R = 8, PAD_T = 8, PAD_B = 20;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const toX = (i) => PAD_L + (n > 1 ? i / (n - 1) * plotW : plotW / 2);
  const toY = (v) => PAD_T + plotH - ((v - min) / range) * plotH;

  // Dots
  const dots = data.map((d, i) => (
    <circle key={i} cx={toX(i)} cy={toY(d.value)} r={selected === i ? 5 : 3}
      fill={selected === i ? "#F8FAFC" : color} opacity={selected === i ? 1 : 0.35}
      stroke={selected === i ? color : "none"} strokeWidth={2}
      style={{ cursor: "pointer" }}
      onClick={(e) => { e.stopPropagation(); setSelected(selected === i ? null : i); }}
    />
  ));

  // Trend line
  const trendPath = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

  // Y-axis grid lines
  const step = range > 60 ? 25 : range > 30 ? 10 : 5;
  const gridVals = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    if (v >= min && v <= max) gridVals.push(v);
  }
  const grid = gridVals.map(v => (
    <g key={v}>
      <line x1={PAD_L} y1={toY(v)} x2={W - PAD_R} y2={toY(v)} stroke="#334155" strokeWidth={0.5} strokeDasharray="2,3" />
      <text x={PAD_L - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#64748B" fontWeight={600}>{v}</text>
    </g>
  ));

  // X-axis labels
  const xInterval = n <= 8 ? 1 : n <= 20 ? 2 : n <= 40 ? 5 : 10;
  const xLabels = data.map((d, i) => {
    if (i === 0 || i === n - 1 || i % xInterval === 0) {
      return <text key={i} x={toX(i)} y={H - 2} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize={8} fill="#64748B" fontWeight={600}>{d.label}</text>;
    }
    return null;
  });

  // Tooltip
  const sel = selected !== null ? data[selected] : null;

  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}
      onClick={() => setSelected(null)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569" }}>
            <svg width={8} height={8}><circle cx={4} cy={4} r={2.5} fill={color} opacity={0.35} /></svg> match
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569" }}>
            <svg width={14} height={8}><line x1={0} y1={4} x2={14} y2={4} stroke={color} strokeWidth={2} /></svg> 5-avg
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {sel && (
        <div style={{ background: "#0F172A", border: `1px solid ${color}44`, borderRadius: 6, padding: "4px 8px", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "#F8FAFC", fontWeight: 700 }}>
            {sel.value}{suffix}
            {sel.detail && <span style={{ color: "#94A3B8", fontWeight: 400, marginLeft: 4, fontSize: 9 }}>({sel.detail})</span>}
            <span style={{ color: "#64748B", fontWeight: 400, marginLeft: 6, fontSize: 9 }}>
              vs {sel.opponent}
            </span>
          </div>
          <div style={{ fontSize: 8, color: "#64748B" }}>{sel.label}</div>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
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
      // Determine opponent name
      const isHome = m.home_team_id === teamId || m.home_team?.id === teamId;
      const opponent = isHome ? (teamShortName(m.away_team) || 'Opponent') : (teamShortName(m.home_team) || 'Opponent');
      return {
        label,
        opponent,
        atkToD: t.atkZoneEntries > 0 ? Math.round(t.dEntries / t.atkZoneEntries * 100) : 0,
        atkToDDetail: t.atkZoneEntries > 0 ? `${t.dEntries}/${t.atkZoneEntries}` : null,
        hasAtkData: t.atkZoneEntries > 0,
        dToSC: t.dEntries > 0 ? Math.round(t.shortCorners / t.dEntries * 100) : 0,
        dToSCDetail: t.dEntries > 0 ? `${t.shortCorners}/${t.dEntries}` : null,
        scToGoal: t.shortCorners > 0 ? Math.round((t.scGoals || 0) / t.shortCorners * 100) : 0,
        scToGoalDetail: t.shortCorners > 0 ? `${t.scGoals || 0}/${t.shortCorners}` : null,
        possession: t.possessionTimePct != null ? t.possessionTimePct : t.territory || 0,
        territory: t.territoryTimePct != null ? t.territoryTimePct : t.territory || 0,
      };
    });

  if (matchData.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No recorded match data for trends</div>;
  }

  const hasAtkData = matchData.some(m => m.hasAtkData);

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>
        Per-match trends · {matchData.length} recorded match{matchData.length !== 1 ? "es" : ""} · 5-game moving average
      </div>

      {hasAtkData && (
        <TrendChart
          data={matchData.map(m => ({ label: m.label, value: m.atkToD, opponent: m.opponent, detail: m.atkToDDetail }))}
          label="Attack → D Entry" color="#10B981" />
      )}

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.dToSC, opponent: m.opponent, detail: m.dToSCDetail }))}
        label="D Entry → Short Corner" color="#8B5CF6" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.scToGoal, opponent: m.opponent, detail: m.scToGoalDetail }))}
        label="Short Corner → Goal" color="#F59E0B" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.possession, opponent: m.opponent }))}
        label="Possession %" color="#3B82F6" />

      <TrendChart
        data={matchData.map(m => ({ label: m.label, value: m.territory, opponent: m.opponent }))}
        label="Territory %" color="#22C55E" />
    </div>
  );
}

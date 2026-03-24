import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { getWeekStart } from '../utils/stats.js';
import { parseSASTDate } from '../utils/helpers.js';
import MiniChart from './MiniChart.jsx';

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
    .sort((a, b) => a.ranking_set.scraped_at.localeCompare(b.ranking_set.scraped_at))
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

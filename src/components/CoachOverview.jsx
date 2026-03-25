import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { computeMatchStats, aggregateStats, statsFromArchive, STATS, INVERTED } from '../utils/stats.js';

export default function CoachOverview({ team, matches }) {
  const [allEvents, setAllEvents] = useState({});
  const [archivedStats, setArchivedStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matches.length) { setLoading(false); return; }
    const loadEvents = async () => {
      const matchIds = matches.filter(m => m.duration > 0).map(m => m.id);
      if (matchIds.length === 0) { setLoading(false); return; }
      const { data } = await supabase.from('match_events').select('*').in('match_id', matchIds).order('match_time');
      const grouped = {};
      (data || []).forEach(e => {
        if (!grouped[e.match_id]) grouped[e.match_id] = [];
        grouped[e.match_id].push({ ...e, time: e.match_time });
      });
      setAllEvents(grouped);

      // Fallback: fetch archived stats for matches without events
      const missingIds = matchIds.filter(id => !grouped[id] || grouped[id].length === 0);
      if (missingIds.length > 0) {
        const { data: archData } = await supabase.from('match_stats').select('*').in('match_id', missingIds);
        const archGrouped = {};
        (archData || []).forEach(r => {
          if (!archGrouped[r.match_id]) archGrouped[r.match_id] = [];
          archGrouped[r.match_id].push(r);
        });
        setArchivedStats(archGrouped);
      }
      setLoading(false);
    };
    loadEvents();
  }, [matches]);

  if (loading) return <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Loading stats...</div>;

  const matchesWithData = matches.filter(m => m.duration > 0 && (allEvents[m.id]?.length > 0 || archivedStats[m.id]?.length > 0));
  if (matchesWithData.length === 0) return <div style={{ textAlign: "center", padding: 30, color: "#94A3B8" }}>No match data with events yet</div>;

  // Compute per-match stats — events first, fallback to archive
  const perMatch = matchesWithData.map(m => {
    const events = allEvents[m.id];
    if (events?.length > 0) {
      return computeMatchStats(events, team.id, m.home_team_id || m.home_team?.id);
    }
    return statsFromArchive(archivedStats[m.id], team.id, m.home_team_id || m.home_team?.id);
  });

  const agg = aggregateStats(perMatch);
  const n = agg.matchCount;
  const t = agg.team;
  const o = agg.opp;
  const totalShots = t.shotsOn + t.shotsOff;
  const oppTotalShots = o.shotsOn + o.shotsOff;
  const shotConv = t.shotsOn > 0 ? Math.round(t.goals / t.shotsOn * 100) : 0;
  const oppShotConv = o.shotsOn > 0 ? Math.round(o.goals / o.shotsOn * 100) : 0;
  const dConv = t.dEntries > 0 ? Math.round(totalShots / t.dEntries * 100) : 0;
  const oppDConv = o.dEntries > 0 ? Math.round(oppTotalShots / o.dEntries * 100) : 0;

  const card = { background: "#1E293B", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #334155" };
  const heading = { fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 };

  return (
    <div style={{ padding: "8px 14px 20px" }}>
      <div style={{ textAlign: "center", fontSize: 10, color: "#64748B", marginBottom: 8 }}>
        Aggregated from {n} match{n !== 1 ? "es" : ""} with live data
      </div>

      {/* Conversion Rates */}
      <div style={card}>
        <div style={heading}>Conversion Rates</div>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: team.color }}>{team.name.split(" ")[0]}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#F8FAFC" }}>{shotConv}%</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>Shot → Goal</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#F8FAFC", marginTop: 4 }}>{dConv}%</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>D Entry → Shot</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>OPP</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#F8FAFC" }}>{oppShotConv}%</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>Shot → Goal</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#F8FAFC", marginTop: 4 }}>{oppDConv}%</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>D Entry → Shot</div>
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div style={card}>
        <div style={heading}>Stats Comparison (Totals)</div>
        {STATS.map(s => {
          const tv = t[s.key];
          const ov = o[s.key];
          const max = Math.max(tv, ov, 1);
          const inv = INVERTED.includes(s.key);
          const tBetter = inv ? tv < ov : tv > ov;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", marginBottom: 4, fontSize: 10 }}>
              <div style={{ width: 24, textAlign: "right", fontWeight: 700, color: tBetter ? "#10B981" : "#F8FAFC", marginRight: 4 }}>{tv}</div>
              <div style={{ flex: 1, display: "flex", gap: 2 }}>
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: `${(tv / max) * 100}%`, height: 6, borderRadius: 3, background: tBetter ? "#10B981" : team.color, minWidth: tv > 0 ? 4 : 0 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: `${(ov / max) * 100}%`, height: 6, borderRadius: 3, background: !tBetter && tv !== ov ? "#10B981" : "#475569", minWidth: ov > 0 ? 4 : 0 }} />
                </div>
              </div>
              <div style={{ width: 24, textAlign: "left", fontWeight: 700, color: !tBetter && tv !== ov ? "#10B981" : "#F8FAFC", marginLeft: 4 }}>{ov}</div>
              <div style={{ width: 85, textAlign: "left", color: "#94A3B8", fontSize: 9, marginLeft: 4 }}>{s.label}</div>
            </div>
          );
        })}
        {/* Territory & Possession averages */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 4, fontSize: 10 }}>
          <div style={{ width: 24, textAlign: "right", fontWeight: 700, color: t.territory >= 50 ? "#10B981" : "#F8FAFC", marginRight: 4 }}>{t.territory}%</div>
          <div style={{ flex: 1, display: "flex", gap: 2 }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: `${t.territory}%`, height: 6, borderRadius: 3, background: t.territory >= 50 ? "#10B981" : team.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ width: `${o.territory}%`, height: 6, borderRadius: 3, background: o.territory > 50 ? "#10B981" : "#475569" }} />
            </div>
          </div>
          <div style={{ width: 24, textAlign: "left", fontWeight: 700, color: o.territory > 50 ? "#10B981" : "#F8FAFC", marginLeft: 4 }}>{o.territory}%</div>
          <div style={{ width: 85, textAlign: "left", color: "#94A3B8", fontSize: 9, marginLeft: 4 }}>Avg Territory</div>
        </div>
      </div>

      {/* Per-match averages */}
      <div style={card}>
        <div style={heading}>Per Match Averages</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          {[
            [Math.round(t.goals / n * 10) / 10, "GF", "#10B981"],
            [Math.round(o.goals / n * 10) / 10, "GA", "#EF4444"],
            [Math.round(t.dEntries / n * 10) / 10, "D Entries", "#F59E0B"],
            [Math.round(t.shortCorners / n * 10) / 10, "Short C", "#8B5CF6"],
            [Math.round(t.turnoversWon / n * 10) / 10, "T/O Won", "#10B981"],
            [Math.round(t.possLost / n * 10) / 10, "Poss Lost", "#EF4444"],
            [`${t.territory}%`, "Territory", "#3B82F6"],
            [`${dConv}%`, "D Conv", "#F59E0B"],
          ].map(([val, label, color]) => (
            <div key={label}>
              <div style={{ fontSize: 18, fontWeight: 900, color, fontFamily: "monospace" }}>{val}</div>
              <div style={{ fontSize: 8, color: "#64748B", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Season summary insights */}
      <div style={card}>
        <div style={heading}>Season Insights</div>
        {generateSeasonInsights(t, o, n, team.name, matchesWithEvents).map((ins, i) => (
          <div key={i} style={{
            padding: "6px 10px", borderRadius: 6, marginBottom: 3,
            background: ins.type === "strength" ? "#10B98111" : ins.type === "weakness" ? "#EF444411" : "#F59E0B11",
            borderLeft: `3px solid ${ins.type === "strength" ? "#10B981" : ins.type === "weakness" ? "#EF4444" : "#F59E0B"}`,
          }}>
            <div style={{ fontSize: 11, color: "#E2E8F0", fontStyle: "italic" }}>{ins.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSeasonInsights(t, o, n, teamName, matches) {
  const ins = [];
  const totalShots = t.shotsOn + t.shotsOff;
  const dConv = t.dEntries > 0 ? Math.round(totalShots / t.dEntries * 100) : 0;
  const shotConv = t.shotsOn > 0 ? Math.round(t.goals / t.shotsOn * 100) : 0;

  // Scoring
  if (t.goals > o.goals) ins.push({ type: "strength", text: `Outscoring opponents ${t.goals}–${o.goals} across ${n} matches` });
  else if (t.goals < o.goals) ins.push({ type: "weakness", text: `Being outscored ${t.goals}–${o.goals} across ${n} matches` });

  // Territory
  if (t.territory >= 55) ins.push({ type: "strength", text: `Controlling territory with ${t.territory}% average` });
  else if (t.territory <= 45) ins.push({ type: "weakness", text: `Struggling for territory — only ${t.territory}% average` });

  // D conversion
  if (dConv >= 50 && t.dEntries >= n * 3) ins.push({ type: "strength", text: `Strong D conversion at ${dConv}% (${totalShots} shots from ${t.dEntries} entries)` });
  else if (dConv < 30 && t.dEntries >= n * 2) ins.push({ type: "weakness", text: `Low D conversion at ${dConv}% — getting in but not creating shots` });

  // Turnovers
  if (t.turnoversWon > t.possLost) ins.push({ type: "strength", text: `Winning the turnover battle: +${t.turnoversWon - t.possLost} net (${t.turnoversWon} won, ${t.possLost} lost)` });
  else if (t.possLost > t.turnoversWon + n) ins.push({ type: "weakness", text: `Possession leaking: -${t.possLost - t.turnoversWon} net (${t.possLost} lost, ${t.turnoversWon} won)` });

  // Set pieces
  if (t.shortCorners > o.shortCorners * 1.5 && t.shortCorners >= n * 2) ins.push({ type: "strength", text: `Dominant set-piece threat — ${t.shortCorners} short corners vs ${o.shortCorners} conceded` });
  if (o.shortCorners > t.shortCorners * 1.5 && o.shortCorners >= n * 2) ins.push({ type: "weakness", text: `Conceding too many set pieces — ${o.shortCorners} short corners against` });

  // Clinical finishing
  if (shotConv >= 40 && t.shotsOn >= n * 2) ins.push({ type: "strength", text: `Clinical finishing — ${shotConv}% shot conversion (${t.goals} from ${t.shotsOn})` });
  else if (shotConv <= 15 && t.shotsOn >= n * 2) ins.push({ type: "weakness", text: `Struggling to convert — only ${shotConv}% shot conversion` });

  return ins.slice(0, 6);
}

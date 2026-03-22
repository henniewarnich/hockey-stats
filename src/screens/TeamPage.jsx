import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';

const fmtClock = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const fmtMin = (s) => `${Math.floor(s / 60)}'${String(s % 60).padStart(2, "0")}`;

// Public-visible event types
const PUBLIC_EVENTS = ["Goal!", "Goal! (SC)", "Short Corner", "Long Corner", "Penalty", "Start", "Ball Dead"];
const COMMENTARY_TYPES = ["commentary", "meta"];

function classifyEvent(e) {
  if (e.event?.startsWith("Goal")) return "goal";
  if (["Short Corner", "Long Corner", "Penalty"].includes(e.event)) return "set_piece";
  if (e.event?.includes("Card")) return "card";
  if (e.team === "meta" && e.event?.includes("Pause")) return "pause";
  if (e.team === "meta") return "info";
  if (e.team === "commentary") return "narrative";
  if (e.event === "Start") return "start";
  return "other";
}

function eventIcon(type) {
  switch (type) {
    case "goal": return "⚽";
    case "set_piece": return "🏑";
    case "card": return "🟨";
    case "pause": return "⏸";
    case "start": return "▶";
    case "info": return "ℹ";
    case "narrative": return "💬";
    default: return "·";
  }
}

function eventColor(type) {
  switch (type) {
    case "goal": return "#F59E0B";
    case "set_piece": return "#8B5CF6";
    case "card": return "#EF4444";
    case "pause": return "#F59E0B";
    case "start": return "#10B981";
    case "info": return "#F59E0B";
    case "narrative": return "#94A3B8";
    default: return "#64748B";
  }
}

// Compute stats from events
function computeStats(events, team) {
  const real = events.filter(e => e.team === team);
  const all = events.filter(e => !COMMENTARY_TYPES.includes(e.team));
  const cnt = (ev) => real.filter(e => e.event === ev).length;
  const cntS = (ev) => real.filter(e => e.event?.startsWith(ev)).length;
  const total = all.length || 1;
  return {
    goals: cntS("Goal!"), dEntries: cnt("D Entry"), shotsOn: cnt("Shot on Goal"),
    shotsOff: cnt("Shot Off Target"), shortCorners: cnt("Short Corner"),
    longCorners: cnt("Long Corner"), turnoversWon: cnt("Turnover Won"),
    possLost: cnt("Poss Conceded") + real.filter(e => e.event?.startsWith("Sideline Out")).length,
    territory: Math.round(real.filter(e => !COMMENTARY_TYPES.includes(e.team)).length / total * 100),
  };
}

const STATS_DEF = [
  { key: "dEntries", label: "D Entries" }, { key: "shotsOn", label: "Shots On" },
  { key: "shotsOff", label: "Shots Off" }, { key: "shortCorners", label: "Short Corners" },
  { key: "turnoversWon", label: "Turnovers Won" }, { key: "possLost", label: "Poss Lost" },
];
const INVERTED = ["possLost", "shotsOff"];

const StatRow = ({ hVal, label, aVal, hColor, aColor, inverted }) => {
  const hWins = inverted ? hVal < aVal : hVal > aVal;
  const aWins = inverted ? aVal < hVal : aVal > hVal;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #0F172A" }}>
      <div style={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: hWins ? hColor : hVal === aVal ? "#94A3B8" : "#4B5563" }}>{hVal}</div>
      <div style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: "#94A3B8", padding: "0 6px" }}>{label}</div>
      <div style={{ width: 40, textAlign: "left", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: aWins ? aColor : aVal === hVal ? "#94A3B8" : "#4B5563" }}>{aVal}</div>
    </div>
  );
};

export default function TeamPage({ teamSlug, onBack }) {
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [tab, setTab] = useState("results");
  const [liveView, setLiveView] = useState("totals");

  // Load team data
  useEffect(() => {
    let channel = null;
    const load = async () => {
      setLoading(true);
      try {
        const { data: teams } = await supabase.from('teams').select('*');
        const found = teams?.find(t => t.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') === teamSlug);
        if (!found) { setLoading(false); return; }
        setTeam(found);

        const storedPin = localStorage.getItem(`coach-pin-${found.id}`);
        if (storedPin && found.coach_pin && storedPin === found.coach_pin) setIsCoach(true);

        // Load matches
        const { data: allMatches } = await supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .or(`home_team_id.eq.${found.id},away_team_id.eq.${found.id}`)
          .order('match_date', { ascending: false });

        if (allMatches) {
          const live = allMatches.find(m => m.status === 'live');
          const ended = allMatches.filter(m => m.status === 'ended');
          setMatches(ended);

          if (live) {
            setLiveMatch(live);
            setTab("live");
            const { data: events } = await supabase.from('match_events').select('*').eq('match_id', live.id).order('seq', { ascending: false });
            if (events) setLiveEvents(events);

            // Real-time subscription (no column filters)
            const liveId = live.id;
            channel = supabase.channel(`team-live-${liveId}`);
            channel
              .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
                if (payload.new?.id === liveId) {
                  setLiveMatch(prev => ({ ...prev, ...payload.new }));
                  if (payload.new.status === 'ended') { setTab("results"); setLiveMatch(null); load(); }
                }
              })
              .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events' }, (payload) => {
                if (payload.new?.match_id === liveId) setLiveEvents(prev => [payload.new, ...prev]);
              })
              .subscribe();
          }
        }
      } catch (err) { console.error('Load error:', err); }
      setLoading(false);
    };
    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [teamSlug]);

  // Poll every 5s for live data + refresh results
  useEffect(() => {
    if (!team) return;
    const poll = async () => {
      try {
        const { data } = await supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order('match_date', { ascending: false });

        if (!data) return;
        const live = data.find(m => m.status === 'live');
        const ended = data.filter(m => m.status === 'ended');
        setMatches(ended);

        if (live) {
          setLiveMatch(live);
          if (tab !== "live" && tab !== "results") setTab("live");
          const { data: events } = await supabase.from('match_events').select('*').eq('match_id', live.id).order('seq', { ascending: false });
          if (events) setLiveEvents(events);
        } else if (liveMatch) {
          setLiveMatch(null);
          setTab("results");
        }
      } catch {}
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [team, liveMatch, tab]);

  const handlePinSubmit = () => {
    if (!team) return;
    if (team.coach_pin && pinInput === team.coach_pin) {
      setIsCoach(true);
      localStorage.setItem(`coach-pin-${team.id}`, pinInput);
      setShowPinModal(false); setPinError(false);
    } else if (!team.coach_pin && pinInput.length >= 4) {
      setIsCoach(true);
      localStorage.setItem(`coach-pin-${team.id}`, pinInput);
      setShowPinModal(false); setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsCoach(false);
    if (team) localStorage.removeItem(`coach-pin-${team.id}`);
  };

  if (loading) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ color: "#64748B", fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (!team) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🏑</div>
        <div style={{ fontSize: 16, color: "#94A3B8" }}>Team not found</div>
        {onBack && <button onClick={onBack} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Go Home</button>}
      </div>
    </div>
  );

  // Season stats
  const seasonStats = matches.reduce((s, m) => {
    const isHome = m.home_team?.id === team.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    return { played: s.played + 1, won: s.won + (my > their ? 1 : 0), drawn: s.drawn + (my === their ? 1 : 0), lost: s.lost + (my < their ? 1 : 0), gf: s.gf + my, ga: s.ga + their };
  }, { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 });
  const gd = seasonStats.gf - seasonStats.ga;
  const winRate = seasonStats.played > 0 ? Math.round(seasonStats.won / seasonStats.played * 100) : 0;

  const resultColor = (m) => {
    const isHome = m.home_team?.id === team.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    return my > their ? "#10B981" : my < their ? "#EF4444" : "#F59E0B";
  };
  const resultLabel = (m) => {
    const isHome = m.home_team?.id === team.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    return my > their ? "W" : my < their ? "L" : "D";
  };
  const opponent = (m) => m.home_team?.id === team.id ? m.away_team : m.home_team;

  // Live match clock — derive from latest event's match_time
  const liveTime = liveEvents.length > 0 ? Math.max(...liveEvents.map(e => e.match_time || 0)) : 0;

  // Filter events for public view
  const publicEvents = liveEvents.filter(e => {
    if (e.team === "meta") return true;
    if (e.team === "commentary") return true;
    return PUBLIC_EVENTS.some(k => e.event?.startsWith(k));
  });

  // Coach stats
  const homeStats = computeStats(liveEvents, "home");
  const awayStats = computeStats(liveEvents, "away");

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Team Header */}
      <div style={{ padding: "12px 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>}
          <div style={{ width: 40, height: 40, borderRadius: 10, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{team.name.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
              {team.name}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "#CBD5E1", fontWeight: 600 }}>{seasonStats.played}P {seasonStats.won}W {seasonStats.drawn}D {seasonStats.lost}L</span>
              {winRate > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: "#10B981", background: "#10B98122", padding: "1px 6px", borderRadius: 99 }}>{winRate}%</span>}
            </div>
          </div>
          {/* Coach/Public toggle */}
          {isCoach ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#8B5CF6", background: "#8B5CF622", padding: "2px 8px", borderRadius: 99 }}>🔒 Coach</span>
              <button onClick={handleLogout} style={{ fontSize: 7, color: "#64748B", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Switch to Public</button>
            </div>
          ) : (
            <button onClick={() => setShowPinModal(true)} style={{ fontSize: 9, color: "#8B5CF6", background: "#8B5CF622", border: "1px solid #8B5CF644", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>🔒 Coach</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {liveMatch && (
        <div style={{ padding: "0 14px 6px" }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
            <button onClick={() => setTab("live")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "live" ? "#10B98122" : "#1E293B", color: tab === "live" ? "#10B981" : "#64748B",
            }}>
              <span style={{ animation: "pulse-dot 2s infinite", marginRight: 4 }}>●</span> {isCoach ? "Live Stats" : "Live Match"}
            </button>
            <button onClick={() => setTab("results")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "results" ? "#334155" : "#1E293B", color: tab === "results" ? "#F8FAFC" : "#64748B",
            }}>Results ({matches.length})</button>
          </div>
        </div>
      )}

      {/* ═══ LIVE TAB ═══ */}
      {(tab === "live" && liveMatch) && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Scoreboard */}
          <div style={{ padding: "8px 14px 14px" }}>
            <div style={{ background: "#1E293B", borderRadius: 14, padding: "16px 12px", border: "1px solid #10B98122" }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#10B98122", padding: "3px 12px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ animation: "pulse-dot 2s infinite" }}>●</span> LIVE
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveMatch.home_team?.color || "#3B82F6", marginBottom: 4 }}>{liveMatch.home_team?.name}</div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{liveMatch.home_score}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: "#F59E0B" }}>{fmtClock(liveTime)}</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveMatch.away_team?.color || "#EF4444", marginBottom: 4 }}>{liveMatch.away_team?.name}</div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{liveMatch.away_score}</div>
                </div>
              </div>
              {liveMatch.venue && <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#64748B" }}>{liveMatch.venue}</div>}
            </div>
          </div>

          {/* Coach: Stats */}
          {isCoach ? (
            <div style={{ flex: 1, padding: "0 14px 20px", overflowY: "auto" }}>
              <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid #334155", marginBottom: 8 }}>
                {[["totals", "Match Totals"], ["events", "Key Events"]].map(([k, l]) => (
                  <button key={k} onClick={() => setLiveView(k)} style={{
                    flex: 1, padding: "7px 0", textAlign: "center", fontSize: 10, fontWeight: 700,
                    background: liveView === k ? "#334155" : "#1E293B", color: liveView === k ? "#F8FAFC" : "#64748B", border: "none", cursor: "pointer",
                  }}>{l}</button>
                ))}
              </div>

              {liveView === "totals" && (
                <div style={{ background: "#1E293B", borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "0 0 6px", borderBottom: "1px solid #334155" }}>
                    <div style={{ width: 40, textAlign: "right", fontSize: 10, fontWeight: 800, color: liveMatch.home_team?.color }}>{liveMatch.home_team?.name?.slice(0, 3).toUpperCase()}</div>
                    <div style={{ flex: 1 }} />
                    <div style={{ width: 40, textAlign: "left", fontSize: 10, fontWeight: 800, color: liveMatch.away_team?.color }}>{liveMatch.away_team?.name?.slice(0, 3).toUpperCase()}</div>
                  </div>
                  {STATS_DEF.map(({ key, label }) => (
                    <StatRow key={key} hVal={homeStats[key]} label={label} aVal={awayStats[key]}
                      hColor={liveMatch.home_team?.color || "#3B82F6"} aColor={liveMatch.away_team?.color || "#EF4444"}
                      inverted={INVERTED.includes(key)} />
                  ))}
                  <StatRow hVal={homeStats.territory} label="Territory %" aVal={awayStats.territory}
                    hColor={liveMatch.home_team?.color || "#3B82F6"} aColor={liveMatch.away_team?.color || "#EF4444"} inverted={false} />
                </div>
              )}

              {liveView === "events" && (
                <div>
                  {liveEvents.filter(e => !COMMENTARY_TYPES.includes(e.team) && ["D Entry", "Goal!", "Goal! (SC)", "Shot on Goal", "Shot Off Target", "Short Corner", "Long Corner", "Turnover Won", "Poss Conceded", "Start"].some(k => e.event?.startsWith(k))).slice(0, 25).map(e => (
                    <div key={e.id} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #1E293B" }}>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#94A3B8", minWidth: 34, fontWeight: 700 }}>{fmtMin(e.match_time)}</span>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: e.team === "home" ? liveMatch.home_team?.color : liveMatch.away_team?.color, marginTop: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: e.event?.startsWith("Goal") ? "#F59E0B" : "#E2E8F0" }}>{e.event}</span>
                      <span style={{ fontSize: 10, color: "#64748B", marginLeft: "auto" }}>{e.zone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Public: Commentary */
            <div style={{ flex: 1, padding: "0 14px 20px", overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Live Commentary</div>
              {publicEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: "#475569", fontStyle: "italic", textAlign: "center", padding: 20 }}>Waiting for kickoff...</div>
              ) : publicEvents.slice(0, 30).map((entry, i) => {
                const type = classifyEvent(entry);
                const color = eventColor(type);
                const icon = eventIcon(type);
                const isGoal = type === "goal";
                const teamName = entry.team === "home" ? liveMatch.home_team?.name : entry.team === "away" ? liveMatch.away_team?.name : null;

                // Build display text
                let text = entry.detail || entry.event;
                if (isGoal && teamName) text = `GOAL! ${teamName}`;
                if (type === "start") text = entry.detail || "Match underway";
                if (type === "pause") text = entry.detail || entry.event;

                return (
                  <div key={entry.id} style={{
                    display: "flex", gap: 10, padding: isGoal ? "10px 0" : "7px 0",
                    borderBottom: "1px solid #1E293B",
                    animation: i === 0 ? "slide-in 0.3s ease-out" : "none",
                  }}>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: "#CBD5E1", minWidth: 36, fontWeight: 700, paddingTop: 1 }}>
                      {fmtMin(entry.match_time)}
                    </div>
                    <div style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1, fontSize: isGoal ? 15 : 13, color, fontWeight: isGoal ? 800 : type === "narrative" ? 400 : 600, lineHeight: 1.5, fontStyle: type === "narrative" ? "italic" : "normal" }}>
                      {text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ RESULTS TAB ═══ */}
      {(tab === "results" || !liveMatch) && (
        <div style={{ padding: "8px 14px 20px", flex: 1, overflowY: "auto" }}>
          {/* Season stats */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              {[[seasonStats.played, "P"], [seasonStats.won, "W"], [seasonStats.drawn, "D"], [seasonStats.lost, "L"], [seasonStats.gf, "GF"], [seasonStats.ga, "GA"], [gd > 0 ? `+${gd}` : gd, "GD"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: label === "W" ? "#10B981" : label === "L" ? "#EF4444" : "#F8FAFC" }}>{val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#475569", fontSize: 14 }}>No matches yet</div>
          ) : matches.map(m => {
            const opp = opponent(m);
            const isHome = m.home_team?.id === team.id;
            const rc = resultColor(m);
            const rl = resultLabel(m);
            const d = new Date(m.match_date);
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "12px 12px", gap: 10, background: "#1E293B", borderRadius: 10, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: rc + "22", border: `1.5px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: rc, flexShrink: 0 }}>{rl}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{isHome ? "vs" : "@"} {opp?.name}</div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    {m.venue && ` · ${m.venue}`}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC" }}>{m.home_score}–{m.away_score}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPinModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1E293B", borderRadius: 12, padding: 20, width: 280, border: "1px solid #334155" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>🔒 Coach Login</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12, textAlign: "center" }}>Enter the team PIN</div>
            <input value={pinInput} onChange={e => { setPinInput(e.target.value); setPinError(false); }} type="password" placeholder="PIN"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: pinError ? "2px solid #EF4444" : "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 18, textAlign: "center", letterSpacing: "0.3em", boxSizing: "border-box", outline: "none" }} autoFocus />
            {pinError && <div style={{ fontSize: 12, color: "#EF4444", textAlign: "center", marginTop: 6 }}>Incorrect PIN</div>}
            <button onClick={handlePinSubmit} style={{ width: "100%", marginTop: 12, padding: 12, borderRadius: 8, background: "#8B5CF6", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Unlock</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

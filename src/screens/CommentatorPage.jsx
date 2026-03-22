import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { saveMatchToSupabase } from '../utils/sync.js';
import { BREAK_FORMATS, MATCH_TYPES, APP_VERSION } from '../utils/constants.js';
import { logLoginAttempt } from '../utils/audit.js';
import LiveMatchScreen from './LiveMatchScreen.jsx';

const fmtClock = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const fmtMin = (s) => `${Math.floor(s / 60)}'${String(s % 60).padStart(2, "0")}`;
const PUBLIC_EVENTS = ["Goal!", "Goal! (SC)", "Short Corner", "Long Corner", "Penalty", "Start"];

function classifyEvent(e) {
  if (e.event?.startsWith("Goal")) return "goal";
  if (["Short Corner", "Long Corner", "Penalty"].includes(e.event)) return "set_piece";
  if (e.team === "meta" && e.event?.includes("Pause")) return "pause";
  if (e.team === "meta" && e.event === "Resume") return "resume";
  if (e.team === "meta") return "info";
  if (e.team === "commentary") return "narrative";
  if (e.event === "Start") return "start";
  return "other";
}
function eventIcon(type) {
  switch (type) {
    case "goal": return "⚽"; case "set_piece": return "🏑"; case "pause": return "⏸";
    case "resume": return "▶"; case "start": return "▶"; case "info": return "ℹ";
    case "narrative": return "💬"; default: return "·";
  }
}
function eventColor(type) {
  switch (type) {
    case "goal": return "#F59E0B"; case "set_piece": return "#8B5CF6"; case "pause": return "#F59E0B";
    case "resume": return "#10B981"; case "start": return "#10B981"; case "info": return "#F59E0B";
    case "narrative": return "#94A3B8"; default: return "#64748B";
  }
}

export default function CommentatorPage({ teamSlug, onBack }) {
  const [team, setTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState("record");
  const [recordMode, setRecordMode] = useState("live"); // "live" or "quick"

  // Match setup
  const [awayTeam, setAwayTeam] = useState(null);
  const [awaySearch, setAwaySearch] = useState("");
  const [matchLength, setMatchLength] = useState("60");
  const [breakFormat, setBreakFormat] = useState("quarters");
  const [matchType, setMatchType] = useState("league");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [matchConfig, setMatchConfig] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [quickSaved, setQuickSaved] = useState(false);

  // Live/Results data
  const [liveMatch, setLiveMatch] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [globalCommPin, setGlobalCommPin] = useState(null);
  const [isGlobalMode] = useState(!teamSlug);
  const [teamSearch, setTeamSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: teams }, { data: settings }] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('app_settings').select('value').eq('key', 'commentator_pin').single(),
      ]);
      if (settings?.value) setGlobalCommPin(settings.value);
      if (teams) {
        setAllTeams(teams);
        if (teamSlug) {
          const found = teams.find(t => t.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') === teamSlug);
          if (found) {
            setTeam(found);
            setVenue("");
            const stored = sessionStorage.getItem(`commentator-${found.id}`);
            if (stored === 'true') setVerified(true);
          }
        } else {
          // Global mode — check if already verified this session
          const stored = sessionStorage.getItem('commentator-global');
          if (stored === 'true') setVerified(true);
        }
      }
      setLoading(false);
    };
    load();
  }, [teamSlug]);

  // Poll for live match + results
  useEffect(() => {
    if (!team || !verified) return;
    const poll = async () => {
      try {
        const { data } = await supabase.from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order('match_date', { ascending: false });
        if (data) {
          const live = data.find(m => m.status === 'live');
          setPastMatches(data.filter(m => m.status === 'ended'));
          if (live) {
            setLiveMatch(live);
            const { data: events } = await supabase.from('match_events').select('*').eq('match_id', live.id).order('seq', { ascending: false });
            if (events) setLiveEvents(events);
          } else {
            setLiveMatch(null);
            setLiveEvents([]);
          }
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [team, verified]);

  const handlePinSubmit = () => {
    if (isGlobalMode) {
      if (globalCommPin && pin === globalCommPin) {
        setVerified(true); sessionStorage.setItem('commentator-global', 'true'); setPinError(false);
        logLoginAttempt({ pinType: 'global_commentator', success: true });
      } else {
        setPinError(true);
        logLoginAttempt({ pinType: 'global_commentator', success: false });
      }
    } else {
      if (!team) return;
      if (team.commentator_pin && pin === team.commentator_pin) {
        setVerified(true); sessionStorage.setItem(`commentator-${team.id}`, 'true'); setPinError(false);
        logLoginAttempt({ pinType: 'commentator', teamName: team.name, success: true });
      } else if (globalCommPin && pin === globalCommPin) {
        setVerified(true); sessionStorage.setItem(`commentator-${team.id}`, 'true'); setPinError(false);
        logLoginAttempt({ pinType: 'commentator', teamName: team.name, success: true });
      } else {
        setPinError(true);
        logLoginAttempt({ pinType: 'commentator', teamName: team.name, success: false });
      }
    }
  };

  const handleSaveGame = (game) => { setMatchConfig(null); setAwayTeam(null); setTab("live"); return game; };
  const handleNavigate = (target) => { if (target === "home") { setMatchConfig(null); setAwayTeam(null); } };

  const ml = parseInt(matchLength) || 60;
  const canStart = awayTeam && awayTeam.id !== team?.id;
  const filteredTeams = awaySearch.trim()
    ? allTeams.filter(t => t.name.toLowerCase().includes(awaySearch.toLowerCase()) && t.id !== team?.id)
    : allTeams.filter(t => t.id !== team?.id);

  const liveTime = liveEvents.length > 0 ? Math.max(...liveEvents.map(e => e.match_time || 0)) : 0;
  const publicEvents = liveEvents.filter(e => e.team === "meta" || e.team === "commentary" || PUBLIC_EVENTS.some(k => e.event?.startsWith(k)));

  const resultColor = (m) => {
    const isHome = m.home_team?.id === team?.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    return my > their ? "#10B981" : my < their ? "#EF4444" : "#F59E0B";
  };
  const resultLabel = (m) => {
    const isHome = m.home_team?.id === team?.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    return my > their ? "W" : my < their ? "L" : "D";
  };

  // ── LOADING ──
  if (loading) return (
    <div style={wrap}><link href={font} rel="stylesheet" /><div style={{ color: "#64748B", fontSize: 14 }}>Loading...</div></div>
  );

  // ── NOT FOUND (only for team-specific mode) ──
  if (!isGlobalMode && !team) return (
    <div style={wrap}><link href={font} rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🏑</div>
        <div style={{ fontSize: 16, color: "#94A3B8" }}>Team not found</div>
        {onBack && <button onClick={onBack} style={goBackBtn}>Go Back</button>}
      </div>
    </div>
  );

  // ── PIN GATE ──
  if (!verified) return (
    <div style={{ ...wrap, flexDirection: "column", padding: 20 }}><link href={font} rel="stylesheet" />
      {isGlobalMode ? (
        <>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🎙</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Commentator</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>Enter global commentator PIN</div>
        </>
      ) : (
        <>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{team.name.charAt(0)}</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{team.name}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>🎙 Commentator Login</div>
        </>
      )}
      <input value={pin} onChange={e => { setPin(e.target.value.slice(0, 20)); setPinError(false); }}
        type="password" placeholder="Commentator PIN"
        style={{ width: 260, padding: 14, borderRadius: 10, border: pinError ? "2px solid #EF4444" : "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 16, textAlign: "center", letterSpacing: "0.1em", outline: "none" }}
        autoFocus onKeyDown={e => e.key === "Enter" && handlePinSubmit()} />
      {pinError && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>Incorrect PIN</div>}
      <button onClick={handlePinSubmit} style={{ marginTop: 16, padding: "12px 40px", borderRadius: 10, border: "none", background: "#F59E0B", color: "#0B0F1A", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Unlock</button>
      {onBack && <button onClick={onBack} style={{ marginTop: 12, background: "none", border: "none", color: "#64748B", fontSize: 11, cursor: "pointer" }}>← Back</button>}
    </div>
  );

  // ── GLOBAL MODE: TEAM PICKER ──
  if (isGlobalMode && !team) {
    const filtered = teamSearch.trim()
      ? allTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
      : allTeams;
    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none" }}>
        <link href={font} rel="stylesheet" />
        <div style={{ padding: "16px 14px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>}
          <div style={{ fontSize: 15, fontWeight: 900 }}>🎙 Select a team to commentate</div>
        </div>
        <div style={{ padding: "0 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
            <span style={{ color: "#475569", fontSize: 13 }}>🔍</span>
            <input style={{ flex: 1, background: "none", border: "none", color: "#E2E8F0", fontSize: 14, outline: "none", fontFamily: "'Outfit',sans-serif" }}
              value={teamSearch} onChange={e => setTeamSearch(e.target.value)} placeholder="Search teams..." autoFocus />
            {teamSearch && <button onClick={() => setTeamSearch("")} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14 }}>✕</button>}
          </div>
          {filtered.map(t => (
            <div key={t.id} onClick={() => { setTeam(t); setVenue(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 4, border: "1px solid #1E293B", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{t.name.charAt(0)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{t.name}</div>
              <span style={{ color: "#334155", fontSize: 14, marginLeft: "auto" }}>›</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LIVE MATCH RECORDING ──
  if (matchConfig) return <LiveMatchScreen matchConfig={matchConfig} onSaveGame={handleSaveGame} onNavigate={handleNavigate} />;

  // ── MAIN TABBED VIEW ──
  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none", display: "flex", flexDirection: "column" }}>
      <link href={font} rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>}
        <div style={{ width: 36, height: 36, borderRadius: 10, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{team.name.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>{team.name}</div>
          <div style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>🎙 Commentator</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 14px 8px" }}>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
          {[
            ["record", "🎙 Record"],
            ["live", liveMatch ? "● Live" : "📺 Live"],
            ["results", `📋 Results (${pastMatches.length})`],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === k ? (k === "live" && liveMatch ? "#10B98122" : "#334155") : "#1E293B",
              color: tab === k ? (k === "live" && liveMatch ? "#10B981" : "#F8FAFC") : "#64748B",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ═══ RECORD TAB ═══ */}
      {tab === "record" && (
        <div style={{ padding: "0 14px 20px", flex: 1, overflowY: "auto" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #334155", marginBottom: 12 }}>
            {[["live", "🏑 Live Match"], ["quick", "💾 Quick Score"]].map(([k, l]) => (
              <button key={k} onClick={() => setRecordMode(k)} style={{
                flex: 1, padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                background: recordMode === k ? "#F59E0B22" : "#1E293B", color: recordMode === k ? "#F59E0B" : "#64748B",
              }}>{l}</button>
            ))}
          </div>

          {/* Home — locked */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 4 }}>Home Team</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: team.color + "22", border: `2px solid ${team.color}` }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{team.name.charAt(0)}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#F8FAFC" }}>{team.name}</div>
              <div style={{ marginLeft: "auto", fontSize: 10, color: "#64748B" }}>🔒</div>
            </div>
          </div>

          {/* Away — searchable */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 4 }}>Away Team</div>
            <input style={inputStyle} value={awaySearch} onChange={e => setAwaySearch(e.target.value)} placeholder="🔍 Search away team..." />
            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
              {filteredTeams.slice(0, 30).map(t => {
                const isSel = awayTeam?.id === t.id;
                return (
                  <button key={t.id} onClick={() => setAwayTeam(t)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8,
                    border: isSel ? `2px solid ${t.color}` : "1px solid #33415544", background: isSel ? t.color + "22" : "#1E293B", cursor: "pointer",
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: t.color, flexShrink: 0 }} />
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#F8FAFC" }}>{t.name}</div>
                    {isSel && <div style={{ marginLeft: "auto", fontSize: 11 }}>✓</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Score: score input */}
          {recordMode === "quick" && canStart && (
            <div style={{ background: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                {[[team, homeScore, setHomeScore], [awayTeam, awayScore, setAwayScore]].map(([t, sc, setSc], i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: t?.color, marginBottom: 6 }}>{t?.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setSc(Math.max(0, sc - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>−</button>
                      <div style={{ fontSize: 28, fontWeight: 800, color: t?.color, minWidth: 36, textAlign: "center" }}>{sc}</div>
                      <button onClick={() => setSc(sc + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings (Live Match only shows length/break, Quick Score skips them) */}
          <div style={{ background: "#1E293B", borderRadius: 12, padding: 14, marginBottom: 16, border: "1px solid #334155" }}>
            {recordMode === "live" && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Match Length (minutes)</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="number" style={{ width: 70, padding: 8, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" }}
                      value={matchLength} onChange={e => setMatchLength(e.target.value)} />
                    {[20, 25, 30, 40, 60].map(m => (
                      <button key={m} onClick={() => setMatchLength(String(m))} style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: ml === m ? "2px solid #F59E0B" : "1px solid #334155",
                        background: ml === m ? "#F59E0B22" : "#0B0F1A", color: ml === m ? "#F59E0B" : "#94A3B8", cursor: "pointer",
                      }}>{m}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Break Format</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {BREAK_FORMATS.map(bf => (
                      <button key={bf.id} onClick={() => setBreakFormat(bf.id)} style={{
                        flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: breakFormat === bf.id ? "2px solid #F59E0B" : "1px solid #334155",
                        background: breakFormat === bf.id ? "#F59E0B22" : "#0B0F1A", color: breakFormat === bf.id ? "#F59E0B" : "#94A3B8", cursor: "pointer",
                      }}>{bf.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Match Type</div>
              <div style={{ display: "flex", gap: 6 }}>
                {MATCH_TYPES.map(mt => (
                  <button key={mt.id} onClick={() => setMatchType(mt.id)} style={{
                    flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: matchType === mt.id ? "2px solid #F59E0B" : "1px solid #334155",
                    background: matchType === mt.id ? "#F59E0B22" : "#0B0F1A", color: matchType === mt.id ? "#F59E0B" : "#94A3B8", cursor: "pointer",
                  }}>{mt.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Venue</div>
              <input style={inputStyle} value={venue} onChange={e => setVenue(e.target.value)} placeholder="Enter venue" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Date</div>
              <input type="date" style={inputStyle} value={matchDate} onChange={e => setMatchDate(e.target.value)} />
            </div>
          </div>

          {recordMode === "live" ? (
            <button disabled={!canStart} onClick={() => setMatchConfig({
              home: { name: team.name, color: team.color, id: team.id },
              away: { name: awayTeam.name, color: awayTeam.color, id: awayTeam.id },
              matchLength: ml, breakFormat, matchType, venue: venue.trim(), date: matchDate,
            })} style={{
              width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700,
              cursor: canStart ? "pointer" : "not-allowed",
              background: canStart ? "#F59E0B" : "#334155", color: canStart ? "#0B0F1A" : "#64748B",
            }}>🏑 Start Live Match</button>
          ) : (
            <>
              {quickSaved && <div style={{ textAlign: "center", padding: 8, color: "#10B981", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>✓ Match saved!</div>}
              <button disabled={!canStart} onClick={async () => {
                const game = {
                  id: Date.now().toString(),
                  date: new Date(matchDate).toISOString(),
                  teams: { home: { name: team.name, color: team.color, id: team.id }, away: { name: awayTeam.name, color: awayTeam.color, id: awayTeam.id } },
                  events: [], duration: 0, homeScore, awayScore, venue: venue.trim(), matchType, quickScore: true,
                };
                try { await saveMatchToSupabase(game); } catch {}
                setQuickSaved(true);
                setHomeScore(0); setAwayScore(0); setAwayTeam(null); setAwaySearch("");
                setTimeout(() => setQuickSaved(false), 3000);
              }} style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700,
                cursor: canStart ? "pointer" : "not-allowed",
                background: canStart ? "#F59E0B" : "#334155", color: canStart ? "#0B0F1A" : "#64748B",
              }}>💾 Save Quick Score</button>
            </>
          )}
        </div>
      )}

      {/* ═══ LIVE TAB ═══ */}
      {tab === "live" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {liveMatch ? (
            <>
              {/* Scoreboard */}
              <div style={{ padding: "8px 14px 12px" }}>
                <div style={{ background: "#1E293B", borderRadius: 14, padding: "16px 12px", border: "1px solid #10B98122" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#10B98122", padding: "3px 12px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span style={{ animation: "pulse-dot 2s infinite" }}>●</span> LIVE
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: liveMatch.home_team?.color || "#3B82F6", marginBottom: 4 }}>{liveMatch.home_team?.name}</div>
                      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{liveMatch.home_score}</div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: "#F59E0B" }}>{fmtClock(liveTime)}</div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: liveMatch.away_team?.color || "#EF4444", marginBottom: 4 }}>{liveMatch.away_team?.name}</div>
                      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{liveMatch.away_score}</div>
                    </div>
                  </div>
                  {liveMatch.venue && <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#64748B" }}>{liveMatch.match_type ? (liveMatch.match_type.charAt(0).toUpperCase() + liveMatch.match_type.slice(1)) + ' @ ' : ''}{liveMatch.venue}</div>}
                </div>
              </div>

              {/* Commentary */}
              <div style={{ padding: "0 14px 20px", flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>Live Commentary</div>
                {publicEvents.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", textAlign: "center", padding: 20 }}>Waiting for kickoff...</div>
                ) : publicEvents.slice(0, 30).map((entry, i) => {
                  const type = classifyEvent(entry);
                  const color = eventColor(type);
                  const icon = eventIcon(type);
                  const isGoal = type === "goal";
                  const teamName = entry.team === "home" ? liveMatch.home_team?.name : entry.team === "away" ? liveMatch.away_team?.name : null;
                  let text = entry.detail || entry.event;
                  if (isGoal && teamName) text = `GOAL! ${teamName}`;
                  if (type === "start") text = entry.detail || "Match underway";
                  if (type === "pause" || type === "resume") text = entry.detail || entry.event;

                  return (
                    <div key={entry.id} style={{ display: "flex", gap: 10, padding: isGoal ? "10px 0" : "7px 0", borderBottom: "1px solid #1E293B" }}>
                      <div style={{ fontSize: 13, fontFamily: "monospace", color: "#CBD5E1", minWidth: 36, fontWeight: 700 }}>{fmtMin(entry.match_time)}</div>
                      <div style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1, fontSize: isGoal ? 15 : 13, color, fontWeight: isGoal ? 800 : type === "narrative" ? 400 : 600, lineHeight: 1.5 }}>{text}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ textAlign: "center", color: "#64748B" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📺</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No live match</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Start recording on the 🎙 Record tab</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ RESULTS TAB ═══ */}
      {tab === "results" && (
        <div style={{ flex: 1, padding: "0 14px 20px", overflowY: "auto" }}>
          {pastMatches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#94A3B8", fontSize: 14 }}>No matches yet</div>
          ) : pastMatches.map(m => {
            const opp = m.home_team?.id === team.id ? m.away_team : m.home_team;
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
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}{m.venue && ` · ${m.match_type ? (m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1)) + ' @ ' : ''}${m.venue}`}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC" }}>{m.home_score}–{m.away_score}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Version footer */}
      <div style={{ padding: "12px 14px", textAlign: "center", fontSize: 9, color: "#334155" }}>
        v{APP_VERSION}
      </div>

      <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

const font = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap";
const wrap = { fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" };
const goBackBtn = { marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 12, outline: "none", boxSizing: "border-box" };

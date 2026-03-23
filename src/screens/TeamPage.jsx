import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { ensureContrastingColors } from '../utils/helpers.js';
import { getSession, getProfile, isCoachForTeam, signOut } from '../utils/auth.js';
import { useReactions } from '../hooks/useReactions.js';
import ReactionBar from '../components/ReactionBar.jsx';
import CoachLiveScreen from './CoachLiveScreen.jsx';

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
  if (e.team === "meta" && e.event === "Resume") return "resume";
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
    case "resume": return "▶";
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

// Compute stats from events — with zone breakdowns
function computeStats(events, team) {
  const real = events.filter(e => e.team === team);
  const all = events.filter(e => !COMMENTARY_TYPES.includes(e.team));
  const cnt = (ev) => real.filter(e => e.event === ev).length;
  const cntS = (ev) => real.filter(e => e.event?.startsWith(ev)).length;
  const total = all.length || 1;

  // Zone helpers — zones contain "Own Quarter", "Opp Quarter", "Midfield", etc.
  const zoneOf = (e) => {
    const z = (e.zone || "").toLowerCase();
    if (z.includes("opp") || z.includes("d") && !z.includes("mid")) return "attack";
    if (z.includes("own")) return "defence";
    return "midfield";
  };
  const cntZone = (ev, zone) => real.filter(e => e.event === ev && zoneOf(e) === zone).length;

  const terrReal = real.filter(e => !COMMENTARY_TYPES.includes(e.team)).length;
  const terrAll = all.length || 1;

  // Zone-based territory — count events per zone
  const atkEvents = real.filter(e => zoneOf(e) === "attack").length;
  const midEvents = real.filter(e => zoneOf(e) === "midfield").length;
  const defEvents = real.filter(e => zoneOf(e) === "defence").length;
  const zoneTotal = atkEvents + midEvents + defEvents || 1;

  return {
    goals: cntS("Goal!"), dEntries: cnt("D Entry"), shotsOn: cnt("Shot on Goal"),
    shotsOff: cnt("Shot Off Target"), shortCorners: cnt("Short Corner"),
    longCorners: cnt("Long Corner"),
    turnoversWon: cnt("Turnover Won"),
    turnoversWonAtk: cntZone("Turnover Won", "attack"),
    turnoversWonMid: cntZone("Turnover Won", "midfield"),
    turnoversWonDef: cntZone("Turnover Won", "defence"),
    possLost: cnt("Poss Conceded") + real.filter(e => e.event?.startsWith("Sideline Out")).length,
    possLostAtk: cntZone("Poss Conceded", "attack") + real.filter(e => e.event?.startsWith("Sideline Out") && zoneOf(e) === "attack").length,
    possLostMid: cntZone("Poss Conceded", "midfield") + real.filter(e => e.event?.startsWith("Sideline Out") && zoneOf(e) === "midfield").length,
    possLostDef: cntZone("Poss Conceded", "defence") + real.filter(e => e.event?.startsWith("Sideline Out") && zoneOf(e) === "defence").length,
    territory: Math.round(terrReal / terrAll * 100),
    terrAtk: Math.round(atkEvents / zoneTotal * 100),
    terrMid: Math.round(midEvents / zoneTotal * 100),
    terrDef: Math.round(defEvents / zoneTotal * 100),
  };
}

const STATS_DEF = [
  { key: "dEntries", label: "D Entries" }, { key: "shotsOn", label: "Shots On" },
  { key: "shotsOff", label: "Shots Off" }, { key: "shortCorners", label: "Short Corners" },
];
const INVERTED = ["possLost", "shotsOff"];

// Zone breakdown row
const ZoneRow = ({ hAtk, hMid, hDef, hTotal, label, aAtk, aMid, aDef, aTotal, hColor, aColor, inverted }) => {
  const hWins = inverted ? hTotal < aTotal : hTotal > aTotal;
  const aWins = inverted ? aTotal < hTotal : aTotal > hTotal;
  return (
    <div style={{ padding: "6px 0", borderBottom: "1px solid #0F172A" }}>
      {/* Total row */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: hWins ? hColor : hTotal === aTotal ? "#94A3B8" : "#64748B" }}>{hTotal}</div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: "#94A3B8", padding: "0 6px" }}>{label}</div>
        <div style={{ width: 40, textAlign: "left", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: aWins ? aColor : aTotal === hTotal ? "#94A3B8" : "#64748B" }}>{aTotal}</div>
      </div>
      {/* Zone breakdown row */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 4, padding: "4px 0", background: "#0F172A", borderRadius: 4 }}>
        <div style={{ width: 40, textAlign: "right", fontSize: 11, fontFamily: "monospace", color: "#CBD5E1", fontWeight: 600, paddingRight: 4 }}>{hAtk}</div>
        <div style={{ width: 40, textAlign: "right", fontSize: 11, fontFamily: "monospace", color: "#94A3B8", fontWeight: 600, paddingRight: 4 }}>{hMid}</div>
        <div style={{ width: 40, textAlign: "right", fontSize: 11, fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>{hDef}</div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#64748B", fontWeight: 600 }}>atk · mid · def</div>
        <div style={{ width: 40, textAlign: "left", fontSize: 11, fontFamily: "monospace", color: "#CBD5E1", fontWeight: 600, paddingLeft: 4 }}>{aAtk}</div>
        <div style={{ width: 40, textAlign: "left", fontSize: 11, fontFamily: "monospace", color: "#94A3B8", fontWeight: 600, paddingLeft: 4 }}>{aMid}</div>
        <div style={{ width: 40, textAlign: "left", fontSize: 11, fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>{aDef}</div>
      </div>
    </div>
  );
};

const StatRow = ({ hVal, label, aVal, hColor, aColor, inverted }) => {
  const hWins = inverted ? hVal < aVal : hVal > aVal;
  const aWins = inverted ? aVal < hVal : aVal > hVal;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #0F172A" }}>
      <div style={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: hWins ? hColor : hVal === aVal ? "#94A3B8" : "#64748B" }}>{hVal}</div>
      <div style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: "#94A3B8", padding: "0 6px" }}>{label}</div>
      <div style={{ width: 40, textAlign: "left", fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: aWins ? aColor : aVal === hVal ? "#94A3B8" : "#64748B" }}>{aVal}</div>
    </div>
  );
};

export default function TeamPage({ teamSlug, initialMatchId, onBack }) {
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [coachProfile, setCoachProfile] = useState(null);
  const [tab, setTab] = useState("results");
  const [liveView, setLiveView] = useState("totals");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [matchViewers, setMatchViewers] = useState(0);
  const [totalViewers, setTotalViewers] = useState(null); // for historical match detail
  const { counts, myReactions, toggleReaction, loadReactions } = useReactions(liveMatch?.id || selectedMatch?.id);

  // Ensure contrasting team colors for live and selected matches
  const liveColors = useMemo(() => {
    if (!liveMatch) return { homeColor: null, awayColor: null };
    return ensureContrastingColors(liveMatch.home_team?.color, liveMatch.away_team?.color);
  }, [liveMatch?.home_team?.color, liveMatch?.away_team?.color]);

  const selectedColors = useMemo(() => {
    if (!selectedMatch) return { homeColor: null, awayColor: null };
    return ensureContrastingColors(selectedMatch.home_team?.color, selectedMatch.away_team?.color);
  }, [selectedMatch?.home_team?.color, selectedMatch?.away_team?.color]);

  // Get or create anonymous viewer ID
  const getViewerId = () => {
    let id = sessionStorage.getItem('kykie-viewer-id');
    if (!id) {
      id = 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('kykie-viewer-id', id);
    }
    return id;
  };

  // Track presence on live match
  useEffect(() => {
    if (!liveMatch) { setMatchViewers(0); return; }
    // Persist this viewer
    supabase.from('match_viewers')
      .upsert({ match_id: liveMatch.id, viewer_id: getViewerId() }, { onConflict: 'match_id,viewer_id' })
      .then(() => {});
    const channel = supabase.channel(`match-viewers-${liveMatch.id}`, { config: { presence: { key: Math.random().toString(36).slice(2) } } });
    channel.on('presence', { event: 'sync' }, () => {
      setMatchViewers(Object.keys(channel.presenceState()).length);
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ page: 'team', ts: Date.now() });
    });
    return () => { supabase.removeChannel(channel); };
  }, [liveMatch?.id]);

  // Load reactions when events change
  useEffect(() => {
    const ids = liveEvents.filter(e => e.id).map(e => e.id);
    if (ids.length > 0) loadReactions(ids);
  }, [liveEvents.length]);

  useEffect(() => {
    const ids = selectedEvents.filter(e => e.id).map(e => e.id);
    if (ids.length > 0) loadReactions(ids);
  }, [selectedEvents.length]);

  const refreshMatches = useCallback(async () => {
    if (!team) return;
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
        .order('match_date', { ascending: false });
      if (data) {
        const live = data.find(m => m.status === 'live');
        const ended = data.filter(m => m.status === 'ended');
        const upcoming = data.filter(m => m.status === 'upcoming').sort((a, b) => {
          const da = new Date(a.match_date + 'T' + (a.scheduled_time || '00:00'));
          const db = new Date(b.match_date + 'T' + (b.scheduled_time || '00:00'));
          return da - db;
        });
        setMatches(ended);
        setUpcomingMatches(upcoming);
        if (live) { setLiveMatch(live); setTab("live"); }
        else { setLiveMatch(null); }
      }
    } catch {}
    setRefreshing(false);
  }, [team]);

  const handleMatchTap = async (m) => {
    setSelectedMatch(m);
    setLoadingEvents(true);
    setTotalViewers(null);
    try {
      const [{ data: events }, { count }] = await Promise.all([
        supabase.from('match_events').select('*').eq('match_id', m.id).order('seq', { ascending: false }),
        supabase.from('match_viewers').select('*', { count: 'exact', head: true }).eq('match_id', m.id),
      ]);
      setSelectedEvents(events || []);
      setTotalViewers(count || 0);
    } catch { setSelectedEvents([]); setTotalViewers(0); }
    setLoadingEvents(false);
  };

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

        // Check if logged-in user is an assigned coach for this team
        const session = await getSession();
        if (session) {
          const profile = await getProfile();
          if (profile && profile.role === 'coach' && !profile.blocked) {
            const assigned = await isCoachForTeam(profile.id, teamSlug);
            if (assigned) {
              setIsCoach(true);
              setCoachProfile(profile);
            }
          }
        }

        // Load matches
        const { data: allMatches } = await supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .or(`home_team_id.eq.${found.id},away_team_id.eq.${found.id}`)
          .order('match_date', { ascending: false });

        if (allMatches) {
          const live = allMatches.find(m => m.status === 'live');
          const ended = allMatches.filter(m => m.status === 'ended');
          const upcoming = allMatches.filter(m => m.status === 'upcoming').sort((a, b) => {
            const da = new Date(a.match_date + 'T' + (a.scheduled_time || '00:00'));
            const db = new Date(b.match_date + 'T' + (b.scheduled_time || '00:00'));
            return da - db;
          });
          setMatches(ended);
          setUpcomingMatches(upcoming);

          // Auto-open a specific match if navigated from landing page
          if (initialMatchId) {
            const target = ended.find(m => m.id === initialMatchId);
            if (target) {
              setSelectedMatch(target);
              setLoadingEvents(true);
              try {
                const { data: evts } = await supabase.from('match_events').select('*').eq('match_id', target.id).order('seq', { ascending: false });
                setSelectedEvents(evts || []);
              } catch { setSelectedEvents([]); }
              setLoadingEvents(false);
            }
          }

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

  const handleCoachLogout = async () => {
    await signOut();
    setIsCoach(false);
    setCoachProfile(null);
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
      </div>
    </div>
  );

  // Season stats (exclude friendlies)
  const statsMatches = matches.filter(m => m.match_type !== 'friendly');
  const seasonStats = statsMatches.reduce((s, m) => {
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

  // Coach stats computed by CoachLiveScreen directly

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Home link + Login */}
      <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => { window.location.hash = isCoach ? '#/coach' : ''; }} style={{
          background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 5, fontWeight: 700,
        }}>
          <svg width="16" height="16" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="3"/>
            <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="3"/>
            <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          {isCoach ? '← Dashboard' : 'kykie'}
        </button>
        {/* Refresh + Login / Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={refreshMatches} disabled={refreshing} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center",
            animation: refreshing ? "spin 1s linear infinite" : "none",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={refreshing ? "#475569" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
          {isCoach && coachProfile ? (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6" }}>{coachProfile.firstname}</span>
              <button onClick={handleCoachLogout} style={{ fontSize: 10, color: "#EF4444", background: "none", border: "1px solid #EF444444", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>Logout</button>
            </>
          ) : (
            <button onClick={() => { window.location.hash = '#/login'; }} style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>Login</button>
          )}
        </div>
      </div>

      {/* Team Header */}
      <div style={{ padding: "12px 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
        </div>
      </div>

      {/* Tabs */}
      {!selectedMatch && (
      <div style={{ padding: "0 14px 6px" }}>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
          {liveMatch && (
            <button onClick={() => setTab("live")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "live" ? "#10B98122" : "#1E293B", color: tab === "live" ? "#10B981" : "#64748B",
            }}>
              <span style={{ animation: "pulse-dot 2s infinite", marginRight: 4 }}>●</span> {isCoach ? "Live Stats" : "Live"}
            </button>
          )}
          {upcomingMatches.length > 0 && (
            <button onClick={() => setTab("upcoming")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "upcoming" ? "#F59E0B22" : "#1E293B", color: tab === "upcoming" ? "#F59E0B" : "#64748B",
            }}>Upcoming ({upcomingMatches.length})</button>
          )}
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
              <div style={{ textAlign: "center", marginBottom: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "#10B98122", padding: "3px 12px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ animation: "pulse-dot 2s infinite" }}>●</span> LIVE
                </span>
                {matchViewers > 0 && (
                  <span style={{ fontSize: 10, color: "#64748B", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    👁 {matchViewers} watching
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveColors.homeColor || "#3B82F6", marginBottom: 4 }}>{liveMatch.home_team?.name}</div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{liveMatch.home_score}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: "#F59E0B" }}>{fmtClock(liveTime)}</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveColors.awayColor || "#EF4444", marginBottom: 4 }}>{liveMatch.away_team?.name}</div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{liveMatch.away_score}</div>
                </div>
              </div>
              {liveMatch.venue && <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#64748B" }}>{liveMatch.match_type ? (liveMatch.match_type.charAt(0).toUpperCase() + liveMatch.match_type.slice(1)) + ' @ ' : ''}{liveMatch.venue}</div>}
            </div>
          </div>

          {/* Coach: Full CoachLiveScreen */}
          {isCoach ? (
            <CoachLiveScreen
              embedded
              match={{
                teams: {
                  home: { name: liveMatch.home_team?.name, color: liveColors.homeColor, short: liveMatch.home_team?.name?.slice(0, 3).toUpperCase() },
                  away: { name: liveMatch.away_team?.name, color: liveColors.awayColor, short: liveMatch.away_team?.name?.slice(0, 3).toUpperCase() },
                },
                breakFormat: liveMatch.break_format || "quarters",
                matchLength: liveMatch.match_length || 60,
                homeScore: liveMatch.home_score,
                awayScore: liveMatch.away_score,
                status: "live",
              }}
              events={liveEvents.map(e => ({ ...e, time: e.match_time }))}
              matchTime={liveTime}
              running={true}
            />
          ) : (
            /* Public: Commentary */
            <div style={{ flex: 1, padding: "0 14px 20px", overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Live Commentary</div>
              {publicEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", textAlign: "center", padding: 20 }}>Waiting for kickoff...</div>
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

                const showReactions = ["goal", "narrative", "set_piece"].includes(type);

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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: isGoal ? 15 : 13, color, fontWeight: isGoal ? 800 : type === "narrative" ? 400 : 600, lineHeight: 1.5, fontStyle: type === "narrative" ? "italic" : "normal" }}>
                        {text}
                      </div>
                      {showReactions && entry.id && (
                        <ReactionBar eventId={entry.id} counts={counts} myReactions={myReactions} onToggle={toggleReaction} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ UPCOMING TAB ═══ */}
      {tab === "upcoming" && !selectedMatch && (
        <div style={{ padding: "8px 14px 20px", flex: 1, overflowY: "auto" }}>
          {upcomingMatches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>No upcoming matches</div>
          ) : (
            upcomingMatches.map(m => {
              const isHome = m.home_team?.id === team.id;
              const opp = isHome ? m.away_team : m.home_team;
              const d = new Date(m.match_date + 'T00:00:00');
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4,
                  background: "#1E293B", borderRadius: 10, border: "1px solid #334155",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: "#F59E0B11", border: "1.5px solid #F59E0B33",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#F59E0B", lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 7, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>{d.toLocaleDateString("en-ZA", { month: "short" })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>
                      {isHome ? 'vs' : '@'} {opp?.name || 'TBD'}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                      {d.toLocaleDateString("en-ZA", { weekday: "short" })}
                      {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                      {m.venue && ` · ${m.venue}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: "#64748B", fontWeight: 600 }}>
                    {m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ RESULTS TAB ═══ */}
      {tab === "results" && !selectedMatch && (
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
            {matches.some(m => m.match_type === 'friendly') && (
              <div style={{ fontSize: 9, color: "#64748B", fontStyle: "italic", marginTop: 6, textAlign: "center" }}>* These stats exclude Friendly matches</div>
            )}
          </div>

          {matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#94A3B8", fontSize: 14 }}>No matches yet</div>
          ) : matches.map(m => {
            const opp = opponent(m);
            const isHome = m.home_team?.id === team.id;
            const rc = resultColor(m);
            const rl = resultLabel(m);
            const d = new Date(m.match_date);
            const hasStats = m.duration > 0;
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", padding: "12px 12px", gap: 10,
                background: "#1E293B", borderRadius: 10, marginBottom: 4,
              }}>
                <div onClick={() => handleMatchTap(m)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: rc + "22", border: `1.5px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: rc, flexShrink: 0 }}>{rl}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: 5 }}>{isHome ? "vs" : "@"} {opp?.name}
                      {hasStats && <span title="Full stats + commentary" style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                      {m.venue && ` · ${m.match_type ? (m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1)) + ' @ ' : ''}${m.venue}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC" }}>{m.home_score}–{m.away_score}</div>
                  <span style={{ fontSize: 12, color: "#334155" }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ MATCH DETAIL (Coach) ═══ */}
      {selectedMatch && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "6px 14px 0" }}>
            <button onClick={() => { setSelectedMatch(null); setSelectedEvents([]); setTotalViewers(null); }} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", padding: 0 }}>← Back to results</button>
          </div>
          {/* Match scoreboard */}
          <div style={{ padding: "8px 14px 10px" }}>
            <div style={{ background: "#1E293B", borderRadius: 12, padding: "14px 12px", border: "1px solid #334155" }}>
              <div style={{ textAlign: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>FULL TIME</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: selectedColors.homeColor }}>{selectedMatch.home_team?.name}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{selectedMatch.home_score}</div>
                </div>
                <div style={{ fontSize: 14, color: "#94A3B8", padding: "0 8px" }}>–</div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: selectedColors.awayColor }}>{selectedMatch.away_team?.name}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{selectedMatch.away_score}</div>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#94A3B8" }}>
                {new Date(selectedMatch.match_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                {selectedMatch.venue && ` · ${selectedMatch.match_type ? (selectedMatch.match_type.charAt(0).toUpperCase() + selectedMatch.match_type.slice(1)) + ' @ ' : ''}${selectedMatch.venue}`}
              </div>
              {totalViewers > 0 && (
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  👁 {totalViewers} {totalViewers === 1 ? 'viewer' : 'viewers'} watched
                </div>
              )}
            </div>
          </div>
          {loadingEvents ? (
            <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Loading...</div>
          ) : selectedEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#94A3B8" }}>No event data for this match</div>
          ) : isCoach ? (
            <CoachLiveScreen
              embedded
              match={{
                teams: {
                  home: { name: selectedMatch.home_team?.name, color: selectedColors.homeColor, short: selectedMatch.home_team?.name?.slice(0, 3).toUpperCase() },
                  away: { name: selectedMatch.away_team?.name, color: selectedColors.awayColor, short: selectedMatch.away_team?.name?.slice(0, 3).toUpperCase() },
                },
                breakFormat: selectedMatch.break_format || "quarters",
                matchLength: selectedMatch.match_length || 60,
                homeScore: selectedMatch.home_score,
                awayScore: selectedMatch.away_score,
                status: "ended",
              }}
              events={selectedEvents.map(e => ({ ...e, time: e.match_time }))}
              matchTime={selectedMatch.duration || 0}
              running={false}
            />
          ) : (
            <div style={{ padding: "0 14px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Match commentary</div>
              {selectedEvents
                .filter(e => e.team === "commentary" || e.team === "meta" || PUBLIC_EVENTS.some(k => e.event?.startsWith(k)))
                .sort((a, b) => (b.match_time || 0) - (a.match_time || 0) || (b.seq || 0) - (a.seq || 0))
                .map((entry, i) => {
                  const isMeta = entry.team === "meta";
                  const isComm = entry.team === "commentary";
                  const tc = isMeta ? "#F59E0B" : isComm ? "#F59E0B" : entry.team === "home" ? (selectedColors.homeColor || "#3B82F6") : (selectedColors.awayColor || "#EF4444");
                  const mins = Math.floor((entry.match_time || 0) / 60);
                  const isGoal = entry.event?.startsWith("Goal");
                  const showReactions = isComm || isGoal || ["Short Corner", "Long Corner", "Penalty"].includes(entry.event);
                  return (
                    <div key={entry.id || i} style={{
                      padding: "7px 10px", borderRadius: 8, marginBottom: 3,
                      background: isComm ? "linear-gradient(135deg, #F59E0B12, #F59E0B08)" : tc + "08",
                      borderLeft: isComm ? "3px solid #F59E0B55" : `3px solid ${tc}`,
                    }}>
                      {isComm ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                            <span style={{ fontSize: 12 }}>💬</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>Insight</span>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94A3B8", marginLeft: "auto" }}>{mins}'</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#E2E8F0", lineHeight: 1.4, fontStyle: "italic", paddingLeft: 18 }}>{entry.detail || entry.event}</div>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#94A3B8", minWidth: 22 }}>{mins}'</div>
                          <div style={{ width: 7, height: 7, borderRadius: 2, background: tc, flexShrink: 0 }} />
                          <div style={{ fontSize: 12, fontWeight: 700, color: isGoal ? "#F59E0B" : isMeta ? "#F59E0B" : "#E2E8F0" }}>{entry.event}</div>
                          {entry.detail && !isMeta && <div style={{ fontSize: 10, color: "#94A3B8", marginLeft: "auto", textAlign: "right", maxWidth: "50%" }}>{entry.detail}</div>}
                        </div>
                      )}
                      {showReactions && entry.id && (
                        <ReactionBar eventId={entry.id} counts={counts} myReactions={myReactions} onToggle={toggleReaction} />
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Version footer */}
      <div style={{ padding: "12px 14px", textAlign: "center", fontSize: 9, color: "#334155" }}>
        v{APP_VERSION}
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reaction-float { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-40px) scale(1.4); } }
      `}</style>
    </div>
  );
}

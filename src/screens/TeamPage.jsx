import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { ensureContrastingColors, parseSAST, parseSASTDate, matchOutcome, matchWinner } from '../utils/helpers.js';
import { computeMatchStats, statsFromArchive } from '../utils/stats.js';
import { getSession, getProfile, isCoachForTeam, signOut } from '../utils/auth.js';
import { fetchLatestRankings } from '../utils/sync.js';
import { useReactions } from '../hooks/useReactions.js';
import ReactionBar from '../components/ReactionBar.jsx';
import MatchCardTeams from '../components/MatchCardTeams.jsx';
import RankBadge from '../components/RankBadge.jsx';
import CoachLiveScreen from './CoachLiveScreen.jsx';
import CoachOverall from '../components/CoachOverall.jsx';
import CoachTrends from '../components/CoachTrends.jsx';
import SponsorBanner from '../components/SponsorBanner.jsx';
import { predictMatch } from '../utils/predict.js';
import { MATCH_AWAY_TEAM, MATCH_HOME_TEAM, TEAM_SELECT, teamColor, teamDerivedName, teamDisplayName, teamInitial, teamShortName, teamSlug as makeTeamSlug } from '../utils/teams.js';

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
  const [matchStatsMap, setMatchStatsMap] = useState({}); // matchId -> {team, opp}
  const [loadingStats, setLoadingStats] = useState(false);
  const [latestRankings, setLatestRankings] = useState({});
  const [oppRecords, setOppRecords] = useState({}); // teamId -> {p,w,d,l,gf,ga}
  const [matchPredictions, setMatchPredictions] = useState(null); // { kykie, publicPreds } for selected match

  // Fetch opposition records for upcoming matches + own team
  useEffect(() => {
    if (!team) return;
    const oppIds = [...new Set(upcomingMatches.map(m =>
      m.home_team_id === team.id ? m.away_team_id : m.home_team_id
    ).filter(Boolean))];
    // Always include own team
    const allIds = [...new Set([team.id, ...oppIds])];
    if (allIds.length === 0) return;
    supabase.from('matches')
      .select('home_team_id, away_team_id, home_score, away_score, match_type, home_penalty_score, away_penalty_score')
      .eq('status', 'ended')
      .or(allIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
      .then(({ data }) => {
        const recs = {};
        (data || []).forEach(m => {
          allIds.forEach(id => {
            if (m.home_team_id !== id && m.away_team_id !== id) return;
            if (!recs[id]) recs[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
            const isHome = m.home_team_id === id;
            const my = isHome ? m.home_score : m.away_score;
            const their = isHome ? m.away_score : m.home_score;
            recs[id].p++;
            recs[id].gf += my;
            recs[id].ga += their;
            const o = matchOutcome(m, id);
            if (o === 'W') recs[id].w++;
            else if (o === 'D') recs[id].d++;
            else recs[id].l++;
          });
        });
        setOppRecords(recs);
      });
  }, [team, upcomingMatches]);
  const { counts, myReactions, toggleReaction, loadReactions } = useReactions(liveMatch?.id || selectedMatch?.id);

  // Ensure contrasting team colors for live and selected matches
  const liveColors = useMemo(() => {
    if (!liveMatch) return { homeColor: null, awayColor: null };
    return ensureContrastingColors(teamColor(liveMatch.home_team), teamColor(liveMatch.away_team));
  }, [liveMatch?.home_team?.color, liveMatch?.away_team?.color]);

  const selectedColors = useMemo(() => {
    if (!selectedMatch) return { homeColor: null, awayColor: null };
    return ensureContrastingColors(teamColor(selectedMatch.home_team), teamColor(selectedMatch.away_team));
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
        .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
        .order('match_date', { ascending: false });
      if (data) {
        const live = data.find(m => m.status === 'live');
        const ended = data.filter(m => m.status === 'ended');
        const upcoming = data.filter(m => m.status === 'upcoming').sort((a, b) => {
          const da = parseSAST(a.match_date, a.scheduled_time || '00:00');
          const db = parseSAST(b.match_date, b.scheduled_time || '00:00');
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
    setMatchPredictions(null);
    try {
      const [{ data: events }, { count }, { data: preds }, { data: archived }] = await Promise.all([
        supabase.from('match_events').select('*').eq('match_id', m.id).order('seq', { ascending: false }),
        supabase.from('match_viewers').select('*', { count: 'exact', head: true }).eq('match_id', m.id),
        supabase.from('predictions').select('user_id, prediction, correct, home_win_pct, draw_pct, away_win_pct').eq('match_id', m.id),
        supabase.from('match_stats').select('*').eq('match_id', m.id),
      ]);
      setSelectedEvents(events || []);
      setTotalViewers(count || 0);
      // Compute stats for this match if not already in map (public users)
      if (!matchStatsMap[m.id] && team) {
        const evts = (events || []).filter(e => e.zone); // only zone events = Live Pro
        if (evts.length > 0) {
          const mapped = events.map(e => ({ team: e.team, event: e.event, time: e.match_time, zone: e.zone }));
          setMatchStatsMap(prev => ({ ...prev, [m.id]: computeMatchStats(mapped, team.id, m.home_team_id) }));
        } else if (archived && archived.length > 0) {
          setMatchStatsMap(prev => ({ ...prev, [m.id]: statsFromArchive(archived, team.id, m.home_team_id) }));
        }
      }
      // Parse predictions
      const kykie = (preds || []).find(p => !p.user_id);
      const userPreds = (preds || []).filter(p => p.user_id);
      const publicVotes = { home: 0, away: 0, draw: 0 };
      userPreds.forEach(p => { if (publicVotes[p.prediction] != null) publicVotes[p.prediction]++; });
      const totalVotes = userPreds.length;
      const topVote = totalVotes > 0 ? Object.entries(publicVotes).sort((a, b) => b[1] - a[1])[0] : null;
      setMatchPredictions({ kykie, publicVotes, totalVotes, topVote });
      // Ensure oppRecords has both teams for season form display
      const neededIds = [m.home_team_id, m.away_team_id].filter(id => id && !oppRecords[id]);
      if (neededIds.length > 0) {
        const { data: recData } = await supabase.from('matches')
          .select('home_team_id, away_team_id, home_score, away_score, home_penalty_score, away_penalty_score')
          .eq('status', 'ended')
          .or(neededIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','));
        const recs = { ...oppRecords };
        (recData || []).forEach(rm => {
          neededIds.forEach(id => {
            if (rm.home_team_id !== id && rm.away_team_id !== id) return;
            if (!recs[id]) recs[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
            const ih = rm.home_team_id === id;
            recs[id].p++;
            recs[id].gf += ih ? rm.home_score : rm.away_score;
            recs[id].ga += ih ? rm.away_score : rm.home_score;
            const o = matchOutcome(rm, id);
            if (o === 'W') recs[id].w++; else if (o === 'D') recs[id].d++; else recs[id].l++;
          });
        });
        setOppRecords(recs);
      }
    } catch { setSelectedEvents([]); setTotalViewers(0); }
    setLoadingEvents(false);
  };

  // Load team data
  useEffect(() => {
    let channel = null;
    const load = async () => {
      setLoading(true);
      try {
        // Find team by institution slug — load teams + auth in parallel
        const [{ data: teams }, session] = await Promise.all([
          supabase.from('teams').select(TEAM_SELECT),
          getSession(),
        ]);
        const found = teams?.find(t => makeTeamSlug(t) === teamSlug);
        if (!found) { setLoading(false); return; }
        setTeam(found);

        // Load matches + rankings + coach check in parallel
        const matchPromise = supabase
          .from('matches')
          .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
          .or(`home_team_id.eq.${found.id},away_team_id.eq.${found.id}`)
          .order('match_date', { ascending: false });
        const rankPromise = fetchLatestRankings();
        
        let coachPromise = Promise.resolve(false);
        if (session) {
          coachPromise = getProfile().then(async (profile) => {
            if (!profile || profile.blocked) return false;
            const activeRole = sessionStorage.getItem('kykie-active-role') || profile.role;
            const hasCoachRole = activeRole === 'coach' || profile.roles?.includes('coach');
            if (!hasCoachRole) return false;
            const assigned = await isCoachForTeam(profile.id, teamSlug);
            if (assigned) { setCoachProfile(profile); return true; }
            return false;
          }).catch(() => false);
        }

        const [{ data: allMatches }, rankings, isAssignedCoach] = await Promise.all([matchPromise, rankPromise, coachPromise]);
        setLatestRankings(rankings);
        if (isAssignedCoach) { setIsCoach(true); setTab("overall"); }

        if (allMatches) {
          const live = allMatches.find(m => m.status === 'live');
          const ended = allMatches.filter(m => m.status === 'ended' || m.status === 'abandoned');
          const upcoming = allMatches.filter(m => m.status === 'upcoming').sort((a, b) => {
            const da = parseSAST(a.match_date, a.scheduled_time || '00:00');
            const db = parseSAST(b.match_date, b.scheduled_time || '00:00');
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
          .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order('match_date', { ascending: false });

        if (!data) return;
        const live = data.find(m => m.status === 'live');
        const ended = data.filter(m => m.status === 'ended' || m.status === 'abandoned');
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

  // Load all match events for coach stats (Overall + Trends)
  useEffect(() => {
    if (!isCoach || !team || matches.length === 0) return;
    const endedWithDuration = matches.filter(m => m.status === 'ended' && m.duration > 0);
    if (endedWithDuration.length === 0) return;
    
    setLoadingStats(true);
    const matchIds = endedWithDuration.map(m => m.id);
    
    (async () => {
      // Fetch events per match (Supabase default limit is 1000 — batching risks truncation)
      const allEvents = {};
      for (const id of matchIds) {
        const { data } = await supabase
          .from('match_events')
          .select('match_id, team, event, match_time, zone')
          .eq('match_id', id)
          .limit(5000);
        if (data && data.length > 0) {
          allEvents[id] = data.map(e => ({ team: e.team, event: e.event, time: e.match_time, zone: e.zone }));
        }
      }
      
      // Find matches missing events (pruned) — try archived stats
      const missingIds = matchIds.filter(id => !allEvents[id] || allEvents[id].length === 0);
      const archivedStats = {};
      if (missingIds.length > 0) {
        for (let i = 0; i < missingIds.length; i += 20) {
          const batch = missingIds.slice(i, i + 20);
          const { data } = await supabase
            .from('match_stats')
            .select('*')
            .in('match_id', batch);
          if (data) {
            data.forEach(r => {
              if (!archivedStats[r.match_id]) archivedStats[r.match_id] = [];
              archivedStats[r.match_id].push(r);
            });
          }
        }
      }

      // Compute stats per match — events first, fallback to archive
      const statsMap = {};
      endedWithDuration.forEach(m => {
        const events = allEvents[m.id] || [];
        if (events.length > 0) {
          statsMap[m.id] = computeMatchStats(events, team.id, m.home_team_id);
        } else if (archivedStats[m.id]) {
          statsMap[m.id] = statsFromArchive(archivedStats[m.id], team.id, m.home_team_id);
        }
      });
      setMatchStatsMap(statsMap);
      setLoadingStats(false);
    })();
  }, [isCoach, team, matches.length]);

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

  // Season stats (ended matches only — exclude abandoned)
  const seasonStats = matches.filter(m => m.status !== 'abandoned').reduce((s, m) => {
    const isHome = m.home_team?.id === team.id;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    const o = matchOutcome(m, team.id);
    return { played: s.played + 1, won: s.won + (o === 'W' ? 1 : 0), drawn: s.drawn + (o === 'D' ? 1 : 0), lost: s.lost + (o === 'L' ? 1 : 0), gf: s.gf + my, ga: s.ga + their };
  }, { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 });
  const gd = seasonStats.gf - seasonStats.ga;
  const winRate = seasonStats.played > 0 ? Math.round(seasonStats.won / seasonStats.played * 100) : 0;

  const resultColor = (m) => {
    if (m.status === 'abandoned') return "#64748B";
    const o = matchOutcome(m, team.id);
    return o === 'W' ? "#10B981" : o === 'L' ? "#EF4444" : "#F59E0B";
  };
  const resultLabel = (m) => {
    if (m.status === 'abandoned') return "ABN";
    return matchOutcome(m, team.id);
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

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0B0F1A" }}>
      {/* Home link + Login */}
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => { window.location.hash = ''; }} style={{
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
          ← kykie
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
      </div>

      {/* Team Header */}
      <div style={{ padding: "12px 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: teamColor(team), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{teamInitial(team)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
              {teamDisplayName(team)}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: "#CBD5E1", fontWeight: 600 }}>{seasonStats.played}P {seasonStats.won}W {seasonStats.drawn}D {seasonStats.lost}L</span>
              {winRate > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: "#10B981", background: "#10B98122", padding: "1px 6px", borderRadius: 99 }}>{winRate}%</span>}
            </div>
          </div>
        </div>
      </div>
      {team?.id && <SponsorBanner tier="team" targetId={team.id} size="md" />}

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
          {isCoach && (
            <button onClick={() => setTab("overall")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "overall" ? "#334155" : "#1E293B", color: tab === "overall" ? "#F8FAFC" : "#64748B",
            }}>Overall</button>
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
          }}>{isCoach ? "Matches" : `Results (${matches.length})`}</button>
          {isCoach && (
            <button onClick={() => setTab("trends")} style={{
              flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === "trends" ? "#334155" : "#1E293B", color: tab === "trends" ? "#F8FAFC" : "#64748B",
            }}>Trends</button>
          )}
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
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveColors.homeColor || "#3B82F6", marginBottom: 4 }}>{teamDisplayName(liveMatch.home_team)}</div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{liveMatch.home_score}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: "#F59E0B" }}>{fmtClock(liveTime)}</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: liveColors.awayColor || "#EF4444", marginBottom: 4 }}>{teamDisplayName(liveMatch.away_team)}</div>
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
                  home: { name: teamShortName(liveMatch.home_team), color: liveColors.homeColor, institution: liveMatch.home_team?.institution },
                  away: { name: teamShortName(liveMatch.away_team), color: liveColors.awayColor, institution: liveMatch.away_team?.institution },
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
                const teamName = entry.team === "home" ? teamShortName(liveMatch.home_team) : entry.team === "away" ? teamShortName(liveMatch.away_team) : null;

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

      {/* ═══ OVERALL TAB (Coach) ═══ */}
      {tab === "overall" && isCoach && !selectedMatch && (
        loadingStats ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 12 }}>Loading stats...</div>
        ) : (
          <CoachOverall
            matchStatsList={Object.values(matchStatsMap)}
            teamName={teamDisplayName(team)}
            teamColor={teamColor(team)}
            teamId={team.id}
            allMatches={matches}
            matchCount={matches.filter(m => m.duration > 0).length}
          />
        )
      )}

      {/* ═══ TRENDS TAB (Coach) ═══ */}
      {tab === "trends" && isCoach && !selectedMatch && (
        loadingStats ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 12 }}>Loading trends...</div>
        ) : (
          <CoachTrends
            matches={matches}
            matchStatsMap={matchStatsMap}
            teamId={team.id}
            teamColor={teamColor(team)}
          />
        )
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
              const d = parseSASTDate(m.match_date);
              // Countdown
              const countdown = (() => {
                if (!m.scheduled_time) return null;
                const kickoff = parseSAST(m.match_date, m.scheduled_time);
                const diff = kickoff - new Date();
                if (diff <= 0) return { text: "Now", color: "#10B981" };
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(mins / 60);
                const days = Math.floor(hours / 24);
                if (days > 0) return { text: `${days}d ${hours % 24}h`, color: "#64748B" };
                if (hours > 0) return { text: `${hours}h ${mins % 60}m`, color: "#F59E0B" };
                return { text: `${mins}m`, color: "#EF4444" };
              })();
              const homeTeam = m.home_team;
              const awayTeam = m.away_team;
              return (
                <div key={m.id} style={{ background: "#1E293B", borderRadius: 10, padding: 12, marginBottom: 6, border: "1px solid #33415544" }}>
                  {/* Match header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isCoach ? 8 : 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, background: "#0B0F1A",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#F59E0B" }}>{d.getDate()}</div>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#64748B", marginTop: -1, textTransform: "uppercase" }}>{d.toLocaleDateString("en-ZA", { month: "short" })}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <MatchCardTeams home={homeTeam} away={awayTeam} homeRank={latestRankings[homeTeam?.id]?.rank} awayRank={latestRankings[awayTeam?.id]?.rank} homePrevRank={latestRankings[homeTeam?.id]?.prevRank} awayPrevRank={latestRankings[awayTeam?.id]?.prevRank} />
                      <div style={{ fontSize: 9, color: "#64748B", marginTop: 1 }}>
                        {d.toLocaleDateString("en-ZA", { weekday: "short" })}
                        {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                        {m.match_type && ` · ${m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1)}`}
                        {m.venue && ` @ ${m.venue}`}
                      </div>
                    </div>
                    {countdown && <div style={{ fontSize: 9, fontWeight: 700, color: countdown.color, fontFamily: "monospace" }}>{countdown.text}</div>}
                  </div>
                  {/* Coach scouting: prediction + side-by-side team stats */}
                  {isCoach && (() => {
                    const hRec = oppRecords[homeTeam?.id] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
                    const aRec = oppRecords[awayTeam?.id] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
                    const pred = predictMatch(hRec, aRec, teamShortName(homeTeam), teamShortName(awayTeam));
                    return (<>
                    {pred && (
                      <div style={{ background: "linear-gradient(135deg,#1E293B,#0F172A)", borderRadius: 8, padding: "10px 12px", marginBottom: 6, border: "1px solid #F59E0B33" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: 12 }}>🔮</span>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: 1 }}>kykie predicts</span>
                        </div>
                        <div style={{ textAlign: "center", marginBottom: 10 }}>
                          {pred.draw >= pred.homeWin && pred.draw >= pred.awayWin ? (
                            <div style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B" }}>Draw</div>
                          ) : pred.homeWin >= pred.awayWin ? (
                            <div style={{ fontSize: 16, fontWeight: 900, color: teamColor(homeTeam) || "#10B981" }}>{teamShortName(homeTeam)} to win</div>
                          ) : (
                            <div style={{ fontSize: 16, fontWeight: 900, color: teamColor(awayTeam) || "#3B82F6" }}>{teamShortName(awayTeam)} to win</div>
                          )}
                          <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>
                            Based on {hRec?.p || 0} and {aRec?.p || 0} matches played
                          </div>
                        </div>
                        <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                          <div style={{ width: `${pred.homeWin}%`, background: "#10B981" }} />
                          <div style={{ width: `${pred.draw}%`, background: "#F59E0B" }} />
                          <div style={{ width: `${pred.awayWin}%`, background: "#3B82F6" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 700 }}>
                          <span style={{ color: "#10B981" }}>{teamShortName(homeTeam)} {pred.homeWin}%</span>
                          <span style={{ color: "#F59E0B" }}>Draw {pred.draw}%</span>
                          <span style={{ color: "#3B82F6" }}>{teamShortName(awayTeam)} {pred.awayWin}%</span>
                        </div>
                        {pred.reasons.length > 0 && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #33415544" }}>
                            {pred.reasons.map((r, i) => (
                              <div key={i} style={{ fontSize: 9, color: r.type === 'home' ? '#10B981' : r.type === 'away' ? '#3B82F6' : '#F59E0B', lineHeight: 1.6 }}>
                                {r.type === 'home' ? '+' : r.type === 'away' ? '–' : '~'} {r.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      {[homeTeam, awayTeam].map(t => {
                        const r = oppRecords[t?.id] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
                        const gd = r.gf - r.ga;
                        const isMine = t?.id === team.id;
                        const rk = latestRankings[t?.id];
                        return (
                          <div key={t?.id || Math.random()} style={{
                            flex: 1, background: "#0B0F1A", borderRadius: 8, padding: "8px 8px",
                            border: isMine ? `1px solid ${teamColor(team)}44` : "1px solid #33415533",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                              <div style={{
                                width: 14, height: 14, borderRadius: 3, background: teamColor(t) || "#334155",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 7, fontWeight: 900, color: "#fff",
                              }}>{teamInitial(t)}</div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#F8FAFC" }}>{teamDisplayName(t) || 'TBD'}</span>
                              {rk && <span style={{ fontSize: 8, color: "#10B981" }}>#{rk.rank}</span>}
                            </div>
                            {r.p > 0 ? (
                              <div style={{ display: "flex", gap: 3, textAlign: "center" }}>
                                {[[r.p, "P", "#F8FAFC"], [r.w, "W", "#10B981"], [r.d, "D", "#F8FAFC"], [r.l, "L", "#EF4444"], [r.gf, "GF", "#F8FAFC"], [r.ga, "GA", "#F8FAFC"], [gd > 0 ? `+${gd}` : gd, "GD", gd > 0 ? "#10B981" : gd < 0 ? "#EF4444" : "#F8FAFC"]].map(([val, label, color]) => (
                                  <div key={label} style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 900, color }}>{val}</div>
                                    <div style={{ fontSize: 7, color: "#64748B" }}>{label}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 9, color: "#475569", textAlign: "center", marginBottom: 4 }}>No matches yet</div>
                            )}
                            {!isMine && t && (
                              <div onClick={() => { window.location.hash = `#/team/${makeTeamSlug(t)}`; }} style={{ fontSize: 8, color: "#8B5CF6", fontWeight: 700, textAlign: "center", marginTop: 6, cursor: "pointer" }}>View stats →</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    </>);
                  })()}
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
          </div>

          {matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#94A3B8", fontSize: 14 }}>No matches yet</div>
          ) : matches.map(m => {
            const opp = opponent(m);
            const isHome = m.home_team?.id === team.id;
            const rc = resultColor(m);
            const rl = resultLabel(m);
            const d = parseSASTDate(m.match_date);
            const hasStats = m.duration > 0;
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", padding: "12px 12px", gap: 10,
                background: "#1E293B", borderRadius: 10, marginBottom: 4,
                opacity: m.status === 'abandoned' ? 0.5 : 1,
              }}>
                <div onClick={() => handleMatchTap(m)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: rc + "22", border: `1.5px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: rl === 'ABN' ? 8 : 12, fontWeight: 900, color: rc, flexShrink: 0 }}>{rl}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>vs</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC" }}>{teamShortName(opp)}</span>
                      <RankBadge rank={isHome ? m.away_rank : m.home_rank} prevRank={isHome ? m.away_prev_rank : m.home_prev_rank} />
                      {hasStats && <span title="Full stats + commentary" style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>}
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{teamDerivedName(opp)}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                      {m.venue && ` · ${m.match_type ? (m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1)) + ' @ ' : ''}${m.venue}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 50 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC" }}>{isHome ? m.home_score : m.away_score}–{isHome ? m.away_score : m.home_score}</div>
                    {m.home_penalty_score != null && m.away_penalty_score != null && (
                      <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 800, background: '#F59E0B15', borderRadius: 4, padding: '1px 6px', marginTop: 2 }}>{isHome ? m.home_penalty_score : m.away_penalty_score}-{isHome ? m.away_penalty_score : m.home_penalty_score} pen</div>
                    )}
                    {m.status === 'abandoned' && (
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, marginTop: 2 }}>Abandoned</div>
                    )}
                  </div>
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
            <button onClick={() => { setSelectedMatch(null); setSelectedEvents([]); setTotalViewers(null); setMatchPredictions(null); }} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", padding: 0 }}>← Back to results</button>
          </div>
          {/* Match scoreboard */}
          <div style={{ padding: "8px 14px 10px" }}>
            <div style={{ background: "#1E293B", borderRadius: 12, padding: "14px 12px", border: "1px solid #334155" }}>
              <div style={{ textAlign: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: selectedMatch.status === 'abandoned' ? '#64748B' : '#94A3B8' }}>
                  {selectedMatch.status === 'abandoned' ? 'MATCH ABANDONED' : 'FULL TIME'}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: selectedColors.homeColor }}>{teamDisplayName(selectedMatch.home_team)} <RankBadge rank={selectedMatch.home_rank} prevRank={selectedMatch.home_prev_rank} /></div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{selectedMatch.home_score}</div>
                </div>
                <div style={{ fontSize: 14, color: "#94A3B8", padding: "0 8px" }}>–</div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: selectedColors.awayColor }}>{teamDisplayName(selectedMatch.away_team)} <RankBadge rank={selectedMatch.away_rank} prevRank={selectedMatch.away_prev_rank} /></div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{selectedMatch.away_score}</div>
                </div>
              </div>
              {selectedMatch.home_penalty_score != null && selectedMatch.away_penalty_score != null && (
                <div style={{ textAlign: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B', background: '#F59E0B15', borderRadius: 6, padding: '3px 12px' }}>
                    Penalties: {selectedMatch.home_penalty_score} – {selectedMatch.away_penalty_score}
                  </span>
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#94A3B8" }}>
                {parseSASTDate(selectedMatch.match_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
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
          ) : isCoach ? (
            <CoachLiveScreen
              embedded
              match={{
                teams: {
                  home: { name: teamShortName(selectedMatch.home_team), color: selectedColors.homeColor, institution: selectedMatch.home_team?.institution },
                  away: { name: teamShortName(selectedMatch.away_team), color: selectedColors.awayColor, institution: selectedMatch.away_team?.institution },
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
              {/* ── PUBLIC MATCH STATS ── */}
              {(() => {
                const stats = matchStatsMap[selectedMatch.id];
                const hc = selectedColors.homeColor || '#3B82F6';
                const ac = selectedColors.awayColor || '#10B981';
                const isHome = selectedMatch.home_team?.id === team.id;
                if (stats) {
                  const home = isHome ? stats.team : stats.opp;
                  const away = isHome ? stats.opp : stats.team;
                  const rows = [
                    { label: 'Territory', h: `${home.territoryTimePct ?? home.territory}%`, a: `${away.territoryTimePct ?? away.territory}%`, hv: home.territoryTimePct ?? home.territory, av: away.territoryTimePct ?? away.territory },
                    { label: 'Possession', h: `${home.possessionTimePct ?? home.territory}%`, a: `${away.possessionTimePct ?? away.territory}%`, hv: home.possessionTimePct ?? home.territory, av: away.possessionTimePct ?? away.territory },
                    { label: 'D Entries', h: home.dEntries, a: away.dEntries, hv: home.dEntries, av: away.dEntries },
                    { label: 'Short Corners', h: home.shortCorners, a: away.shortCorners, hv: home.shortCorners, av: away.shortCorners },
                    { label: 'Shots on Goal', h: home.shotsOn, a: away.shotsOn, hv: home.shotsOn, av: away.shotsOn },
                    { label: 'Shots off Target', h: home.shotsOff, a: away.shotsOff, hv: home.shotsOff, av: away.shotsOff },
                  ];
                  return (<>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Match stats</div>
                    <div style={{ background: '#1E293B', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      {rows.map((r, i) => {
                        const total = (r.hv || 0) + (r.av || 0) || 1;
                        const hPct = Math.round(r.hv / total * 100);
                        return (
                          <div key={r.label} style={{ marginBottom: i < rows.length - 1 ? 12 : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 18, fontWeight: 900, color: hc, minWidth: 40 }}>{r.h}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>{r.label}</span>
                              <span style={{ fontSize: 18, fontWeight: 900, color: ac, minWidth: 40, textAlign: 'right' }}>{r.a}</span>
                            </div>
                            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 2 }}>
                              <div style={{ width: `${hPct}%`, background: hc, borderRadius: 2 }} />
                              <div style={{ width: `${100 - hPct}%`, background: ac, borderRadius: 2 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>);
                } else {
                  const homeId = selectedMatch.home_team?.id;
                  const awayId = selectedMatch.away_team?.id;
                  const hr = oppRecords[homeId] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
                  const ar = oppRecords[awayId] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
                  const ScoutCard = ({ t, r, color }) => {
                    const gd = (r.gf || 0) - (r.ga || 0);
                    const rk = latestRankings[t?.id];
                    return (
                      <div style={{
                        flex: 1, background: '#0B0F1A', borderRadius: 8, padding: '8px 8px',
                        border: `1px solid ${color}33`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: 3, background: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 7, fontWeight: 900, color: '#fff',
                          }}>{teamInitial(t)}</div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>{teamShortName(t)}</span>
                          {rk && <span style={{ fontSize: 8, color: '#10B981' }}>#{rk.rank}</span>}
                        </div>
                        {r.p > 0 ? (
                          <div style={{ display: 'flex', gap: 3, textAlign: 'center' }}>
                            {[[r.p, 'P', '#F8FAFC'], [r.w, 'W', '#10B981'], [r.d, 'D', '#F8FAFC'], [r.l, 'L', '#EF4444'], [r.gf, 'GF', '#F8FAFC'], [r.ga, 'GA', '#F8FAFC'], [gd > 0 ? `+${gd}` : gd, 'GD', gd > 0 ? '#10B981' : gd < 0 ? '#EF4444' : '#F8FAFC']].map(([val, label, c]) => (
                              <div key={label} style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 900, color: c }}>{val}</div>
                                <div style={{ fontSize: 7, color: '#64748B' }}>{label}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: '#475569', textAlign: 'center' }}>No matches yet</div>
                        )}
                      </div>
                    );
                  };
                  return (<>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Season form</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      <ScoutCard t={selectedMatch.home_team} r={hr} color={hc} />
                      <ScoutCard t={selectedMatch.away_team} r={ar} color={ac} />
                    </div>
                  </>);
                }
              })()}
              {/* ── PREDICTIONS ── */}
              {matchPredictions && (matchPredictions.kykie || matchPredictions.totalVotes > 0) && (<>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Predictions</div>
                {matchPredictions.kykie && (() => {
                  const k = matchPredictions.kykie;
                  const predLabel = k.prediction === 'home' ? teamShortName(selectedMatch.home_team) : k.prediction === 'away' ? teamShortName(selectedMatch.away_team) : 'Draw';
                  const conf = k.home_win_pct != null ? Math.round(Math.max(k.home_win_pct, k.draw_pct || 0, k.away_win_pct || 0)) : null;
                  return (
                    <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F59E0B22', border: '1.5px solid #F59E0B44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🤖</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#F8FAFC' }}>Kykie: {predLabel}</div>
                        {conf != null && <div style={{ fontSize: 9, color: '#64748B' }}>{conf}% confidence</div>}
                      </div>
                      {k.correct != null && <span style={{ fontSize: 11, fontWeight: 800, color: k.correct ? '#10B981' : '#EF4444' }}>{k.correct ? '✓' : '✗'}</span>}
                    </div>
                  );
                })()}
                {matchPredictions.totalVotes > 0 && (() => {
                  const { topVote, totalVotes } = matchPredictions;
                  const predLabel = topVote[0] === 'home' ? teamShortName(selectedMatch.home_team) : topVote[0] === 'away' ? teamShortName(selectedMatch.away_team) : 'Draw';
                  const pct = Math.round(topVote[1] / totalVotes * 100);
                  const winner = matchWinner(selectedMatch);
                  const correct = topVote[0] === winner;
                  return (
                    <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8B5CF622', border: '1.5px solid #8B5CF644', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>👥</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#F8FAFC' }}>Public: {predLabel}</div>
                        <div style={{ fontSize: 9, color: '#64748B' }}>{pct}% voted · {totalVotes} prediction{totalVotes !== 1 ? 's' : ''}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: correct ? '#10B981' : '#EF4444' }}>{correct ? '✓' : '✗'}</span>
                    </div>
                  );
                })()}
              </>)}
              {/* ── COMMENTARY ── */}
              {selectedEvents.length > 0 && (<>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Match commentary</div>
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
                        {isComm ? (<>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                            <span style={{ fontSize: 12 }}>💬</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>Insight</span>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94A3B8", marginLeft: "auto" }}>{mins}'</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#E2E8F0", lineHeight: 1.4, fontStyle: "italic", paddingLeft: 18 }}>{entry.detail || entry.event}</div>
                        </>) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#94A3B8", minWidth: 22 }}>{mins}'</div>
                            <div style={{ width: 7, height: 7, borderRadius: 2, background: tc, flexShrink: 0 }} />
                            <div style={{ fontSize: 12, fontWeight: 700, color: isGoal ? "#F59E0B" : isMeta ? "#F59E0B" : "#E2E8F0" }}>{entry.event}</div>
                            {entry.detail && !isMeta && <div style={{ fontSize: 10, color: "#94A3B8", marginLeft: "auto", textAlign: "right", maxWidth: "50%" }}>{entry.detail}</div>}
                          </div>
                        )}
                        {showReactions && entry.id && (
                          <ReactionBar eventId={entry.id} counts={counts} myReactions={myReactions} onToggle={toggleReaction} readOnly />
                        )}
                      </div>
                    );
                  })}
              </>)}
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

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { parseSAST, parseSASTDate } from '../utils/helpers.js';
import { fetchLatestRankings } from '../utils/sync.js';
import RankBadge from '../components/RankBadge.jsx';
import SponsorBanner from '../components/SponsorBanner.jsx';
import AdminDashboardPanel from '../components/AdminDashboardPanel.jsx';
import CommDashboardPanel from '../components/CommDashboardPanel.jsx';
import CoachDashboardPanel from '../components/CoachDashboardPanel.jsx';
import CrowdDashboardPanel from '../components/CrowdDashboardPanel.jsx';
import RoleSwitcher from '../components/RoleSwitcher.jsx';

export default function LandingPage({ currentUser, onLogout, emailConfirmed, initialTab, onNavigate, onRoleSwitch }) {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(0);
  const [liveMatchViewers, setLiveMatchViewers] = useState({});
  const [activeTab, setActiveTab] = useState(initialTab || "live"); // dashboard | live | upcoming | results | teams
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [latestRankings, setLatestRankings] = useState({});
  const [showUpcoming, setShowUpcoming] = useState(20);
  const [showResults, setShowResults] = useState(20);
  const [expandedUpcoming, setExpandedUpcoming] = useState(null);
  const [searchResults, setSearchResults] = useState(null); // null = use default matches, array = search results
  const [allRecords, setAllRecords] = useState([]); // lightweight: all ended matches for record computation
  const [resultsCount, setResultsCount] = useState(0);
  const [tick, setTick] = useState(0); // forces re-render for countdown timers

  // Tick every 30s for in-progress countdowns
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Global presence tracking
  useEffect(() => {
    const channel = supabase.channel('site-presence', { config: { presence: { key: Math.random().toString(36).slice(2) } } });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setVisitorCount(Object.keys(state).length);
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ page: 'landing', ts: Date.now() });
    });
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Per-match viewer counts for live matches
  useEffect(() => {
    if (liveMatches.length === 0) return;
    const channels = liveMatches.map(m => {
      const ch = supabase.channel(`match-viewers-${m.id}`, { config: { presence: { key: Math.random().toString(36).slice(2) } } });
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        setLiveMatchViewers(prev => ({ ...prev, [m.id]: Object.keys(state).length }));
      });
      ch.subscribe();
      return ch;
    });
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [liveMatches.map(m => m.id).join()]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: allTeams }, { data: allMatches }, { data: live }, { data: upcoming }, { data: allRecords }, { count: totalResults }] = await Promise.all([
          supabase.from('teams').select('*').or('status.eq.active,status.is.null').order('name'),
          supabase.from('matches')
            .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
            .eq('status', 'ended')
            .order('match_date', { ascending: false })
            .limit(20),
          supabase.from('matches')
            .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
            .eq('status', 'live'),
          supabase.from('matches')
            .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
            .eq('status', 'upcoming')
            .order('match_date', { ascending: true })
            .order('scheduled_time', { ascending: true }),
          supabase.from('matches')
            .select('home_team_id, away_team_id, home_score, away_score, match_type')
            .eq('status', 'ended'),
          supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'ended'),
        ]);

        if (allTeams) setTeams(allTeams);
        if (allMatches) setMatches(allMatches);
        if (live) setLiveMatches(live);
        if (upcoming) setUpcomingMatches(upcoming);
        if (allRecords) setAllRecords(allRecords);
        setResultsCount(totalResults || 0);

        // Fetch latest rankings for upcoming/live badges
        fetchLatestRankings().then(r => setLatestRankings(r)).catch(() => {});

        // Auto-select best tab (only if not directed to a specific tab)
        if (!initialTab) {
          if (live && live.length > 0) setActiveTab("live");
          else if (upcoming && upcoming.length > 0) setActiveTab("upcoming");
          else setActiveTab("results");
        }
      } catch (err) { console.error('Landing load error:', err); }
      setLoading(false);
    };
    load();

    // Poll live matches every 10s; refresh results if a match ended
    const prevLiveIdsRef = { current: new Set((liveMatches || []).map(m => m.id)) };
    const poll = setInterval(async () => {
      try {
        const { data: live } = await supabase.from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .eq('status', 'live');
        if (live) {
          const newIds = new Set(live.map(m => m.id));
          const prevIds = prevLiveIdsRef.current;
          setLiveMatches(live);
          // If a match disappeared from live (i.e. ended), refresh results
          if (prevIds && [...prevIds].some(id => !newIds.has(id))) {
            const [{ data: freshResults }, { count: freshCount }] = await Promise.all([
              supabase.from('matches')
                .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
                .eq('status', 'ended').order('match_date', { ascending: false }).limit(20),
              supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'ended'),
            ]);
            if (freshResults) setMatches(freshResults);
            setResultsCount(freshCount || 0);
            // Refresh allRecords for team stats
            const { data: freshRecords } = await supabase.from('matches')
              .select('home_team_id, away_team_id, home_score, away_score, match_type')
              .eq('status', 'ended');
            if (freshRecords) setAllRecords(freshRecords);
          }
          prevLiveIdsRef.current = newIds;
        }
      } catch {}
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  // Search results from Supabase when filtering on results tab
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q || activeTab !== 'results') {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      // Find teams matching search
      const { data: matchingTeams } = await supabase
        .from('teams').select('id').or('status.eq.active,status.is.null')
        .ilike('name', `%${q}%`);
      if (!matchingTeams?.length) { setSearchResults([]); return; }
      const ids = matchingTeams.map(t => t.id);
      // Fetch results for those teams
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('status', 'ended')
        .or(ids.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
        .order('match_date', { ascending: false })
        .limit(50);
      setSearchResults(data || []);
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  // Compute team records from ALL ended matches (exclude friendlies)
  const teamRecords = {};
  allRecords.forEach(m => {
    [m.home_team_id, m.away_team_id].forEach((tid, i) => {
      if (!tid) return;
      if (!teamRecords[tid]) teamRecords[tid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
      const my = i === 0 ? m.home_score : m.away_score;
      const their = i === 0 ? m.away_score : m.home_score;
      teamRecords[tid].p++;
      teamRecords[tid].gf += my;
      teamRecords[tid].ga += their;
      if (my > their) teamRecords[tid].w++;
      else if (my === their) teamRecords[tid].d++;
      else teamRecords[tid].l++;
    });
  });

  // Derive recently active team IDs from matches (ordered by most recent)
  const recentTeamIds = [];
  matches.forEach(m => {
    [m.home_team?.id, m.away_team?.id].forEach(id => {
      if (id && !recentTeamIds.includes(id)) recentTeamIds.push(id);
    });
  });

  const filteredTeams = search.trim()
    ? teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : recentTeamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);

  const teamSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

  // "In Progress" = upcoming matches whose kickoff has passed (up to 2h after estimated end for "Awaiting score")
  const now = Date.now();
  const inProgressUpcoming = upcomingMatches.filter(m => {
    if (!m.scheduled_time) return false;
    const kickoff = parseSAST(m.match_date, m.scheduled_time).getTime();
    const awaitingBuffer = ((m.match_length || 60) + 120) * 60000; // match + 2h buffer
    return now >= kickoff && now <= kickoff + awaitingBuffer;
  });
  // Combined: live matches + in-progress upcoming (deduplicated by id)
  const liveIds = new Set(liveMatches.map(m => m.id));
  const allInProgress = [...liveMatches, ...inProgressUpcoming.filter(m => !liveIds.has(m.id))];

  const resultBadge = (m, teamId) => {
    const isHome = m.home_team?.id === teamId;
    const my = isHome ? m.home_score : m.away_score;
    const their = isHome ? m.away_score : m.home_score;
    if (my > their) return { label: "W", cls: "rb-w" };
    if (my < their) return { label: "L", cls: "rb-l" };
    return { label: "D", cls: "rb-d" };
  };

  const CommentaryIcon = ({ title }) => (
    <span title={title || "Full stats + commentary"} style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </span>
  );

  const venueDisplay = (m) => {
    if (!m.venue) return "";
    const prefix = m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) + " @ " : "";
    return prefix + m.venue;
  };

  const getCountdown = (matchDate, scheduledTime) => {
    if (!scheduledTime) return null;
    const kickoff = parseSAST(matchDate, scheduledTime);
    const now = new Date();
    const diff = kickoff - now;
    if (diff <= 0) return { text: "Now", color: "#10B981" };
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return { text: `${days}d ${hours % 24}h`, color: "#64748B" };
    if (hours > 0) return { text: `${hours}h ${mins % 60}m`, color: "#F59E0B" };
    return { text: `${mins}m`, color: "#EF4444" };
  };

  return (
    <div style={styles.page}>
      <style>{`
        .rb-w { background: #10B98122; color: #10B981; border: 1.5px solid #10B98144; }
        .rb-l { background: #EF444422; color: #EF4444; border: 1.5px solid #EF444444; }
        .rb-d { background: #F59E0B22; color: #F59E0B; border: 1.5px solid #F59E0B44; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Hero - scrolls away */}
      <div style={styles.hero}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="44" height="44" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
              <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
              <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div style={styles.logo}>kykie</div>
          </div>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 10, color: "#94A3B8" }}>{currentUser.alias_nickname || currentUser.firstname}</div>
              {onRoleSwitch && <RoleSwitcher currentUser={currentUser} onSwitch={onRoleSwitch} />}
              <button onClick={onLogout} style={{ fontSize: 10, color: "#EF4444", background: "#EF444411", border: "1px solid #EF444444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => { window.location.hash = "#/login"; }} style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>Sign in</button>
          )}
        </div>
        <div style={{ ...styles.tagline, textAlign: "center" }}>Live stats & analysis for <span style={{ color: "#F59E0B", fontWeight: 700 }}>school sports</span></div>
        <SponsorBanner tier="platform" size="lg" />
      </div>

      {/* Email confirmation banner */}
      {emailConfirmed && (
        <div style={{
          margin: "0 16px 8px", padding: "12px 16px", borderRadius: 10,
          background: "#10B98122", border: "1px solid #10B98144",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Email verified!</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Your account is active. Welcome to kykie!</div>
          </div>
        </div>
      )}

      {/* Sticky tabs + search */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0B0F1A" }}>
        {/* Tabs */}
        <div style={{ padding: "0 16px 6px" }}>
          <div style={{ display: "flex", gap: 0, justifyContent: "center", borderRadius: 8, overflow: "hidden", border: "1px solid #334155", maxWidth: 360, margin: "0 auto" }}>
            {[
              ...(currentUser ? [{ id: "dashboard", label: "Home" }] : []),
              { id: "live", label: "Live", count: allInProgress.length, dot: liveMatches.length > 0 },
              { id: "upcoming", label: "Upcoming", count: upcomingMatches.length - inProgressUpcoming.length },
              { id: "results", label: "Results", count: resultsCount },
              { id: "teams", label: "Teams", count: teams.length },
            ].map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setSportDropdownOpen(false); }} style={{
                flex: 1, padding: "6px 0", textAlign: "center", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
                background: activeTab === t.id ? "#10B98122" : "#1E293B",
                color: activeTab === t.id ? "#10B981" : "#64748B",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {t.dot && t.count > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 2s infinite" }} />}
                  {t.label}
                </div>
                {t.count > 0 && <div style={{ fontSize: 9, opacity: 0.7 }}>({t.count})</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Search + sport picker (hidden on dashboard tab) */}
        {activeTab !== "dashboard" && (
        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", position: "relative" }}>
            <span style={{ color: "#475569", fontSize: 13 }}>🔍</span>
            <input
              style={styles.searchInput}
              value={search}
              onChange={e => { setSearch(e.target.value); setShowUpcoming(20); setShowResults(20); }}
              placeholder="Search..."
            />
            {search && (
              <button onClick={() => { setSearch(""); setShowUpcoming(20); setShowResults(20); }} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14 }}>✕</button>
            )}
            <div onClick={(e) => { e.stopPropagation(); setSportDropdownOpen(p => !p); }} style={{
              display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 6,
              border: "1px solid #334155", background: "#0B0F1A", cursor: "pointer", flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>🏑</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>Hockey</span>
              <span style={{ fontSize: 9, color: "#64748B" }}>▼</span>
            </div>
            {sportDropdownOpen && (
              <div style={{
                position: "absolute", top: 48, right: 0, width: 200, borderRadius: 8,
                border: "1px solid #334155", background: "#1E293B", overflow: "hidden", zIndex: 10,
              }}>
                <div onClick={() => setSportDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #334155", background: "#F59E0B11", cursor: "pointer" }}>
                  <span style={{ fontSize: 13 }}>🏑</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>Girls Hockey</span>
                  <span style={{ fontSize: 10, color: "#10B981", marginLeft: "auto" }}>✓</span>
                </div>
                {[
                  { icon: "🏑", label: "Boys Hockey" },
                  { icon: "🏉", label: "Rugby" },
                  { icon: "🏐", label: "Netball" },
                  { icon: "🏏", label: "Cricket" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #334155", opacity: 0.45 }}>
                    <span style={{ fontSize: 13 }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>{s.label}</span>
                    <span style={{ fontSize: 9, color: "#64748B", marginLeft: "auto", fontWeight: 600, background: "#334155", padding: "2px 7px", borderRadius: 99 }}>Soon</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 13 }}>Loading...</div>
      ) : (
        <>

          {/* ═══ DASHBOARD TAB ═══ */}
          {activeTab === "dashboard" && currentUser && (() => {
            const role = currentUser.role;
            return (
              <div>
                {(role === 'admin' || role === 'commentator_admin') && (
                  <AdminDashboardPanel currentUser={currentUser} onNavigate={onNavigate} />
                )}
                {(role === 'commentator') && (
                  <CommDashboardPanel />
                )}
                {(role === 'coach') && (
                  <CoachDashboardPanel currentUser={currentUser} />
                )}
                {(role === 'crowd') && (
                  <CrowdDashboardPanel currentUser={currentUser} />
                )}
              </div>
            );
          })()}

          {/* ═══ IN PROGRESS TAB ═══ */}
          {activeTab === "live" && (() => {
            const q = search.trim().toLowerCase();
            const filtered = q ? allInProgress.filter(m =>
              (m.home_team?.name || "").toLowerCase().includes(q) ||
              (m.away_team?.name || "").toLowerCase().includes(q) ||
              (m.venue || "").toLowerCase().includes(q)
            ) : allInProgress;

            // Gate: must be logged in to view live matches
            const liveFiltered = filtered.filter(m => m.status === 'live');
            if (!currentUser && liveFiltered.length > 0) {
              return (
                <div style={styles.section}>
                  <div style={{ textAlign: "center", padding: 30 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>{liveFiltered.length} live {liveFiltered.length === 1 ? 'match' : 'matches'} right now</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>Register to view live matches</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => { window.location.hash = "#/login"; }} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#F59E0B", color: "#0B0F1A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Sign In</button>
                      <button onClick={() => { window.location.hash = "#/register"; }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #334155", background: "none", color: "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Register</button>
                    </div>
                  </div>
                  {/* Still show non-live in-progress below the gate */}
                  {filtered.filter(m => m.status !== 'live').map(m => {
                    const d = parseSASTDate(m.match_date);
                    return (
                      <div key={m.id} style={{ ...styles.scoreCard, border: "1px solid #F59E0B33", background: "#F59E0B08", opacity: 0.7 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F59E0B22", border: "1.5px solid #F59E0B33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 12 }}>🏑</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.matchTeams}>{m.home_team?.name} {(() => { const r = latestRankings[m.home_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()} vs {m.away_team?.name} {(() => { const r = latestRankings[m.away_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}</div>
                          <div style={styles.matchMeta}>
                            {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                            {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                            {m.venue && ` · ${m.venue}`}
                          </div>
                        </div>
                        {(() => {
                          const kickoff = m.scheduled_time ? parseSAST(m.match_date, m.scheduled_time).getTime() : 0;
                          const duration = (m.match_length || 60) * 60000;
                          const remaining = Math.max(0, kickoff + duration - Date.now());
                          const mins = Math.ceil(remaining / 60000);
                          const expired = remaining <= 0;
                          void tick;
                          return (
                            <div style={{ textAlign: 'right' }}>
                              {!expired && <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: mins <= 5 ? '#EF4444' : mins <= 15 ? '#F59E0B' : '#10B981' }}>{mins}m</div>}
                              <div style={{ fontSize: 8, fontWeight: 700, color: expired ? '#EF4444' : '#F59E0B' }}>
                                {expired ? 'Awaiting score' : 'In progress'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>
                  {q ? "No matches found" : "No matches in progress"}
                  {!currentUser && !q && <div style={{ marginTop: 12 }}><button onClick={() => { window.location.hash = "#/register"; }} style={{ fontSize: 11, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>Register to view live matches</button></div>}
                </div>
              ) : (
                filtered.map(m => {
                  const isLive = m.status === 'live';
                  const homeSlug = m.home_team?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                  const d = parseSASTDate(m.match_date);
                  return (
                    <div key={m.id}
                      onClick={isLive ? () => { window.location.hash = `#/team/${homeSlug}`; } : undefined}
                      style={{
                        ...styles.scoreCard,
                        border: isLive ? "1px solid #10B98133" : "1px solid #F59E0B33",
                        background: isLive ? "#10B98108" : "#F59E0B08",
                        cursor: isLive ? "pointer" : "default",
                      }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: isLive ? "#10B98122" : "#F59E0B22",
                        border: isLive ? "1.5px solid #10B98144" : "1.5px solid #F59E0B33",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isLive ? (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite", display: "inline-block" }} />
                        ) : (
                          <span style={{ fontSize: 12 }}>🏑</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.matchTeams}>{m.home_team?.name} {(() => { const r = latestRankings[m.home_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()} vs {m.away_team?.name} {(() => { const r = latestRankings[m.away_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}</div>
                        <div style={styles.matchMeta}>
                          {isLive ? (
                            <>
                              {m.venue && `${m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) + ' @ ' : ''}${m.venue}`}
                              {liveMatchViewers[m.id] > 0 && (
                                <span style={{ marginLeft: 6, color: "#10B981", fontWeight: 700 }}>👁 {liveMatchViewers[m.id]}</span>
                              )}
                            </>
                          ) : (
                            <>
                              {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                              {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                              {m.venue && ` · ${m.venue}`}
                            </>
                          )}
                        </div>
                      </div>
                      {isLive ? (
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>{m.home_score}–{m.away_score}</div>
                      ) : (() => {
                        const kickoff = m.scheduled_time ? parseSAST(m.match_date, m.scheduled_time).getTime() : 0;
                        const duration = (m.match_length || 60) * 60000;
                        const endTime = kickoff + duration;
                        const remaining = Math.max(0, endTime - Date.now());
                        const mins = Math.ceil(remaining / 60000);
                        const expired = remaining <= 0;
                        void tick; // use tick to ensure re-render
                        return (
                          <div style={{ textAlign: 'right' }}>
                            {!expired && <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: mins <= 5 ? '#EF4444' : mins <= 15 ? '#F59E0B' : '#10B981' }}>{mins}m</div>}
                            <div style={{ fontSize: 8, fontWeight: 700, color: expired ? '#EF4444' : '#F59E0B' }}>
                              {expired ? 'Awaiting score' : 'In progress'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
              <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            </div>
            );
          })()}

          {/* ═══ UPCOMING TAB ═══ */}
          {activeTab === "upcoming" && (() => {
            const inProgressIds = new Set(inProgressUpcoming.map(m => m.id));
            const notStarted = upcomingMatches.filter(m => !inProgressIds.has(m.id));
            const q = search.trim().toLowerCase();
            const filtered = q ? notStarted.filter(m =>
              (m.home_team?.name || "").toLowerCase().includes(q) ||
              (m.away_team?.name || "").toLowerCase().includes(q) ||
              (m.venue || "").toLowerCase().includes(q)
            ) : notStarted;
            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>
                  {q ? "No matches found" : "No upcoming matches scheduled"}
                  {!currentUser && !q && <div style={{ marginTop: 12 }}><button onClick={() => { window.location.hash = "#/register"; }} style={{ fontSize: 11, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>Register to add upcoming matches</button></div>}
                </div>
              ) : (
                <>
                {filtered.slice(0, showUpcoming).map(m => {
                  const d = parseSASTDate(m.match_date);
                  const homeSlug = m.home_team?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                  const awaySlug = m.away_team?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                  const hc = m.home_team?.color || "#3B82F6";
                  const ac = m.away_team?.color || "#EF4444";
                  const isExp = expandedUpcoming === m.id;
                  return (
                    <div key={m.id} style={{ marginBottom: 4 }}>
                      <div onClick={() => setExpandedUpcoming(isExp ? null : m.id)}
                        style={{ ...styles.scoreCard, cursor: "pointer", borderRadius: isExp ? "10px 10px 0 0" : 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 7, background: hc, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{d.getDate()}</div>
                          <div style={{ fontSize: 7, fontWeight: 700, color: "#ffffffcc", textTransform: "uppercase" }}>{d.toLocaleDateString("en-ZA", { month: "short" })}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.matchTeams}>{m.home_team?.name} {(() => { const r = latestRankings[m.home_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()} vs {m.away_team?.name} {(() => { const r = latestRankings[m.away_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}</div>
                          <div style={styles.matchMeta}>
                            {d.toLocaleDateString("en-ZA", { weekday: "short" })}
                            {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                            {m.match_type && ` · ${m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1)}`}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {(() => { const cd = getCountdown(m.match_date, m.scheduled_time); return cd ? <div style={{ fontSize: 10, fontWeight: 700, color: cd.color, fontFamily: "monospace" }}>{cd.text}</div> : null; })()}
                          {m.venue && <div style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>{m.venue}</div>}
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ background: "#1E293B", borderRadius: "0 0 10px 10px", padding: "6px 8px 8px", display: "flex", gap: 6, borderTop: "1px solid #33415544" }}>
                          {[[m.home_team, homeSlug, hc], [m.away_team, awaySlug, ac]].map(([t, slug, c]) => {
                            const rec = teamRecords[t?.id];
                            return (
                            <div key={slug} onClick={(e) => { e.stopPropagation(); window.location.hash = `#/team/${slug}`; }}
                              style={{
                                flex: 1, padding: "8px 10px",
                                background: "#0B0F1A", borderRadius: 8, cursor: "pointer",
                                border: `1px solid ${c}33`,
                              }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 7, background: c + "22", border: `1.5px solid ${c}44`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 11, fontWeight: 800, color: c, flexShrink: 0,
                                }}>{t?.name?.charAt(0)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name} {(() => { const r = latestRankings[t?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}</div>
                                </div>
                              </div>
                              {rec ? (
                                <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", marginBottom: 4 }}>
                                  {[["P", rec.p, "#F8FAFC"], ["W", rec.w, "#10B981"], ["D", rec.d, "#64748B"], ["L", rec.l, "#EF4444"]].map(([lbl, val, clr]) => (
                                    <div key={lbl}>
                                      <div style={{ fontSize: 13, fontWeight: 900, color: clr }}>{val}</div>
                                      <div style={{ fontSize: 7, fontWeight: 700, color: "#475569" }}>{lbl}</div>
                                    </div>
                                  ))}
                                  {[["GF", rec.gf], ["GA", rec.ga], ["GD", rec.gf - rec.ga]].map(([lbl, val]) => (
                                    <div key={lbl}>
                                      <div style={{ fontSize: 13, fontWeight: 900, color: "#F8FAFC" }}>{val}</div>
                                      <div style={{ fontSize: 7, fontWeight: 700, color: "#475569" }}>{lbl}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: 9, color: "#475569", textAlign: "center", marginBottom: 4 }}>No matches yet</div>
                              )}
                              <div style={{ fontSize: 9, color: c, fontWeight: 700, textAlign: "center" }}>View stats →</div>
                            </div>
                          );})}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filtered.length > showUpcoming && (
                  <div onClick={() => setShowUpcoming(prev => prev + 20)}
                    style={{ textAlign: "center", padding: "10px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>
                    Show more ({filtered.length - showUpcoming} remaining)
                  </div>
                )}
                </>
              )}
              {currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px", display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => { window.location.hash = '#/submit?mode=upcoming'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>+ Add upcoming match</button>
                  <button onClick={() => { window.location.hash = '#/issues'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "transparent", color: "#EF4444", fontSize: 11, fontWeight: 700, border: "1px solid #EF444444", cursor: "pointer" }}>Report issue</button>
                </div>
              )}
              {!currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                  <button onClick={() => { window.location.hash = '#/register'; }} style={{ display: "inline-block", padding: "6px 14px", borderRadius: 6, border: "1px solid #F59E0B44", background: "#F59E0B11", color: "#F59E0B", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Register to add upcoming matches</button>
                </div>
              )}
            </div>
            );
          })()}

          {/* ═══ RESULTS TAB ═══ */}
          {activeTab === "results" && (() => {
            const q = search.trim().toLowerCase();
            const filtered = q ? (searchResults || []) : matches;
            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>
                  {q ? "No matches found" : "No results yet"}
                  {!currentUser && !q && <div style={{ marginTop: 12 }}><button onClick={() => { window.location.hash = "#/register"; }} style={{ fontSize: 11, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>Register to add past results</button></div>}
                </div>
              ) : (
                filtered.slice(0, showResults).map(m => {
                  const homeR = resultBadge(m, m.home_team?.id);
                  const d = parseSASTDate(m.match_date);
                  const homeSlug = teamSlug(m.home_team?.name || "");
                  return (
                    <div key={m.id} onClick={() => { window.location.hash = `#/team/${homeSlug}?match=${m.id}`; }}
                      style={{ ...styles.scoreCard, cursor: "pointer" }}>
                      <div className={homeR.cls} style={styles.resultBadge}>{homeR.label}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...styles.matchTeams, display: "flex", alignItems: "center", gap: 5 }}>
                          {m.home_team?.name} <RankBadge rank={m.home_rank} prevRank={m.home_prev_rank} /> vs {m.away_team?.name} <RankBadge rank={m.away_rank} prevRank={m.away_prev_rank} />
                          {m.duration > 0 && <CommentaryIcon />}
                        </div>
                        <div style={styles.matchMeta}>
                          {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                          {m.venue && ` · ${venueDisplay(m)}`}
                        </div>
                      </div>
                      <div style={styles.matchScore}>{m.home_score}–{m.away_score}</div>
                    </div>
                  );
                })
              )}
              {filtered.length > showResults && (
                <div onClick={() => setShowResults(prev => prev + 20)} style={{ textAlign: "center", padding: "10px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>
                  Show more ({filtered.length - showResults} remaining)
                </div>
              )}
              {currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px", display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => { window.location.hash = '#/submit?mode=result'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>+ Add a result</button>
                  <button onClick={() => { window.location.hash = '#/issues'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "transparent", color: "#EF4444", fontSize: 11, fontWeight: 700, border: "1px solid #EF444444", cursor: "pointer" }}>Report issue</button>
                </div>
              )}
              {!currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                  <button onClick={() => { window.location.hash = '#/register'; }} style={{ display: "inline-block", padding: "6px 14px", borderRadius: 6, border: "1px solid #F59E0B44", background: "#F59E0B11", color: "#F59E0B", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Register to add past results</button>
                </div>
              )}
            </div>
            );
          })()}

          {/* ═══ TEAMS TAB ═══ */}
          {activeTab === "teams" && (
            <div style={styles.section}>
              {filteredTeams.length === 0 ? (
                <div style={{ textAlign: "center", padding: 16, color: "#475569", fontSize: 12 }}>
                  {search.trim() ? "No teams found" : "No teams yet"}
                  {!currentUser && !search.trim() && <div style={{ marginTop: 12 }}><button onClick={() => { window.location.hash = "#/register"; }} style={{ fontSize: 11, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>Register to add your team</button></div>}
                </div>
              ) : (
                filteredTeams.map(t => {
                  const r = teamRecords[t.id];
                  const winRate = r && r.p > 0 ? Math.round(r.w / r.p * 100) : 0;
                  return (
                    <div key={t.id} onClick={() => { window.location.hash = `#/team/${teamSlug(t.name)}`; }} style={styles.teamRow}>
                      <div style={{ ...styles.teamDot, background: t.color }}>{t.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.teamName}>{t.name} {(() => { const lr = latestRankings[t.id]; return lr ? <RankBadge rank={lr.rank} prevRank={lr.prevRank} /> : null; })()}</div>
                        {r ? (
                          <div style={styles.teamRecord}>{r.p}P {r.w}W {r.d}D {r.l}L{winRate > 0 ? ` · ${winRate}%` : ""}</div>
                        ) : (
                          <div style={styles.teamRecord}>No matches yet</div>
                        )}
                      </div>
                      <span style={{ color: "#334155", fontSize: 14 }}>›</span>
                    </div>
                  );
                })
              )}
              {currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px", display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => { window.location.hash = '#/submit?mode=team'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>+ Suggest a team</button>
                  <button onClick={() => { window.location.hash = '#/issues'; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "transparent", color: "#EF4444", fontSize: 11, fontWeight: 700, border: "1px solid #EF444444", cursor: "pointer" }}>Report issue</button>
                </div>
              )}
              {!currentUser && (
                <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                  <button onClick={() => { window.location.hash = '#/register'; }} style={{ display: "inline-block", padding: "6px 14px", borderRadius: 6, border: "1px solid #F59E0B44", background: "#F59E0B11", color: "#F59E0B", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Register to add missing teams</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {visitorCount > 0 && (
          <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            {visitorCount} {visitorCount === 1 ? "visitor" : "visitors"} online
          </div>
        )}
        <div style={{ fontSize: 10, color: "#334155" }}>kykie · v{APP_VERSION}</div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none" },
  hero: { padding: "18px 20px 16px", textAlign: "center" },
  logo: { fontSize: 38, fontWeight: 900, letterSpacing: -1, color: "#F59E0B" },
  tagline: { fontSize: 13, color: "#94A3B8", fontWeight: 500, marginTop: 5 },
  section: { padding: "0 16px 16px" },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, padding: "0 2px" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", marginBottom: 10 },
  searchInput: { flex: 1, minWidth: 0, background: "none", border: "none", color: "#E2E8F0", fontSize: 14, outline: "none", fontFamily: "'Outfit',sans-serif" },
  teamRow: { display: "flex", alignItems: "center", gap: 10, background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 4, border: "1px solid #1E293B", cursor: "pointer" },
  teamDot: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0 },
  teamName: { fontSize: 13, fontWeight: 700, color: "#F8FAFC" },
  teamRecord: { fontSize: 10, color: "#94A3B8", marginTop: 1 },
  scoreCard: { display: "flex", alignItems: "center", background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 4, gap: 10, border: "1px solid #1E293B" },
  resultBadge: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 },
  matchTeams: { fontSize: 12, fontWeight: 700, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  matchMeta: { fontSize: 10, color: "#64748B", marginTop: 2 },
  matchScore: { fontSize: 18, fontWeight: 900, color: "#F8FAFC" },
  footer: { textAlign: "center", padding: "20px 16px 24px" },
  adminBtn: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#475569", background: "#1E293B", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", marginBottom: 8, cursor: "pointer" },
};

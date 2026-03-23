import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';

export default function LandingPage() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(0);
  const [liveMatchViewers, setLiveMatchViewers] = useState({});
  const [activeTab, setActiveTab] = useState("live"); // live | upcoming | results | teams
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);

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
        const [{ data: allTeams }, { data: allMatches }, { data: live }, { data: upcoming }] = await Promise.all([
          supabase.from('teams').select('*').order('name'),
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
        ]);

        if (allTeams) setTeams(allTeams);
        if (allMatches) setMatches(allMatches);
        if (live) setLiveMatches(live);
        if (upcoming) setUpcomingMatches(upcoming);

        // Auto-select best tab
        if (live && live.length > 0) setActiveTab("live");
        else if (upcoming && upcoming.length > 0) setActiveTab("upcoming");
        else setActiveTab("results");
      } catch (err) { console.error('Landing load error:', err); }
      setLoading(false);
    };
    load();

    // Poll live + upcoming every 10s
    const poll = setInterval(async () => {
      try {
        const [{ data: live }, { data: upcoming }] = await Promise.all([
          supabase.from('matches')
            .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
            .eq('status', 'live'),
          supabase.from('matches')
            .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
            .eq('status', 'upcoming')
            .order('match_date', { ascending: true })
            .order('scheduled_time', { ascending: true }),
        ]);
        if (live) setLiveMatches(live);
        if (upcoming) setUpcomingMatches(upcoming);
      } catch {}
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  // Compute team records (exclude friendlies)
  const teamRecords = {};
  matches.filter(m => m.match_type !== 'friendly').forEach(m => {
    [m.home_team, m.away_team].forEach((t, i) => {
      if (!t) return;
      if (!teamRecords[t.id]) teamRecords[t.id] = { p: 0, w: 0, d: 0, l: 0 };
      const my = i === 0 ? m.home_score : m.away_score;
      const their = i === 0 ? m.away_score : m.home_score;
      teamRecords[t.id].p++;
      if (my > their) teamRecords[t.id].w++;
      else if (my === their) teamRecords[t.id].d++;
      else teamRecords[t.id].l++;
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
          <button onClick={() => { window.location.hash = "#/login"; }} style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>Sign in</button>
        </div>
        <div style={{ ...styles.tagline, textAlign: "center" }}>Live stats & analysis for <span style={{ color: "#F59E0B", fontWeight: 700 }}>school sports</span></div>
      </div>

      {/* Sticky tabs + search */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0B0F1A" }}>
        {/* Tabs */}
        <div style={{ padding: "0 16px 6px" }}>
          <div style={{ display: "flex", gap: 0, justifyContent: "center", borderRadius: 8, overflow: "hidden", border: "1px solid #334155", maxWidth: 360, margin: "0 auto" }}>
            {[
              { id: "live", label: "Live", count: liveMatches.length, color: "#10B981", dot: true },
              { id: "upcoming", label: "Upcoming", count: upcomingMatches.length },
              { id: "results", label: "Results", count: matches.length },
              { id: "teams", label: "Teams", count: teams.length },
            ].map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setSportDropdownOpen(false); }} style={{
                flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                background: activeTab === t.id ? (t.color ? t.color + "22" : "#33415577") : "#1E293B",
                color: activeTab === t.id ? (t.color || "#F8FAFC") : "#64748B",
              }}>
                {t.dot && t.count > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.color, display: "inline-block", marginRight: 4, animation: "pulse 2s infinite" }} />}
                {t.label}{t.count > 0 ? ` (${t.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Search + sport picker */}
        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", position: "relative" }}>
            <span style={{ color: "#475569", fontSize: 13 }}>🔍</span>
            <input
              style={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14 }}>✕</button>
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
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 13 }}>Loading...</div>
      ) : (
        <>

          {/* ═══ LIVE TAB ═══ */}
          {activeTab === "live" && (() => {
            const q = search.trim().toLowerCase();
            const filtered = q ? liveMatches.filter(m =>
              (m.home_team?.name || "").toLowerCase().includes(q) ||
              (m.away_team?.name || "").toLowerCase().includes(q) ||
              (m.venue || "").toLowerCase().includes(q)
            ) : liveMatches;
            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>{q ? "No matches found" : "No live matches right now"}</div>
              ) : (
                filtered.map(m => {
                  const homeSlug = m.home_team?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                  return (
                    <div key={m.id} onClick={() => { window.location.hash = `#/team/${homeSlug}`; }}
                      style={{ ...styles.scoreCard, border: "1px solid #10B98133", background: "#10B98108", cursor: "pointer" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "#10B98122", border: "1.5px solid #10B98144", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite", display: "inline-block" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.matchTeams}>{m.home_team?.name} vs {m.away_team?.name}</div>
                        <div style={styles.matchMeta}>
                          {m.venue && `${m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) + ' @ ' : ''}${m.venue}`}
                          {liveMatchViewers[m.id] > 0 && (
                            <span style={{ marginLeft: 6, color: "#10B981", fontWeight: 700 }}>👁 {liveMatchViewers[m.id]}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>{m.home_score}–{m.away_score}</div>
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
            const q = search.trim().toLowerCase();
            const filtered = q ? upcomingMatches.filter(m =>
              (m.home_team?.name || "").toLowerCase().includes(q) ||
              (m.away_team?.name || "").toLowerCase().includes(q) ||
              (m.venue || "").toLowerCase().includes(q)
            ) : upcomingMatches;
            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>{q ? "No matches found" : "No upcoming matches scheduled"}</div>
              ) : (
                filtered.map(m => {
                  const d = new Date(m.match_date + 'T00:00:00');
                  const homeSlug = m.home_team?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                  const hc = m.home_team?.color || "#3B82F6";
                  return (
                    <div key={m.id} onClick={() => { window.location.hash = `#/team/${homeSlug}`; }}
                      style={{ ...styles.scoreCard, cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 7, background: hc + "22", border: `1.5px solid ${hc}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: hc, lineHeight: 1 }}>{d.getDate()}</div>
                        <div style={{ fontSize: 7, fontWeight: 700, color: hc, textTransform: "uppercase" }}>{d.toLocaleDateString("en-ZA", { month: "short" })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.matchTeams}>{m.home_team?.name} vs {m.away_team?.name}</div>
                        <div style={styles.matchMeta}>
                          {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                          {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                          {m.venue && ` · ${m.venue}`}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                        {m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) : ''}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            );
          })()}

          {/* ═══ RESULTS TAB ═══ */}
          {activeTab === "results" && (() => {
            const q = search.trim().toLowerCase();
            const filtered = q ? matches.filter(m =>
              (m.home_team?.name || "").toLowerCase().includes(q) ||
              (m.away_team?.name || "").toLowerCase().includes(q) ||
              (m.venue || "").toLowerCase().includes(q)
            ) : matches;
            return (
            <div style={styles.section}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>{q ? "No matches found" : "No results yet"}</div>
              ) : (
                filtered.slice(0, 20).map(m => {
                  const homeR = resultBadge(m, m.home_team?.id);
                  const d = new Date(m.match_date);
                  const homeSlug = teamSlug(m.home_team?.name || "");
                  return (
                    <div key={m.id} onClick={() => { window.location.hash = `#/team/${homeSlug}?match=${m.id}`; }}
                      style={{ ...styles.scoreCard, cursor: "pointer" }}>
                      <div className={homeR.cls} style={styles.resultBadge}>{homeR.label}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...styles.matchTeams, display: "flex", alignItems: "center", gap: 5 }}>
                          {m.home_team?.name} vs {m.away_team?.name}
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
            </div>
            );
          })()}

          {/* ═══ TEAMS TAB ═══ */}
          {activeTab === "teams" && (
            <div style={styles.section}>
              {filteredTeams.length === 0 ? (
                <div style={{ textAlign: "center", padding: 16, color: "#475569", fontSize: 12 }}>No teams found</div>
              ) : (
                filteredTeams.map(t => {
                  const r = teamRecords[t.id];
                  const winRate = r && r.p > 0 ? Math.round(r.w / r.p * 100) : 0;
                  return (
                    <div key={t.id} onClick={() => { window.location.hash = `#/team/${teamSlug(t.name)}`; }} style={styles.teamRow}>
                      <div style={{ ...styles.teamDot, background: t.color }}>{t.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.teamName}>{t.name}</div>
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

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { scheduleMatch, assignCommentators, updateScheduledMatch, lockMatch, unlockMatch, snapshotRankings, fetchLatestRankings } from '../utils/sync.js';
import { listUsersByRole } from '../utils/auth.js';
import { BREAK_FORMATS, MATCH_TYPES } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import { parseSAST, parseSASTDate } from '../utils/helpers.js';
import RankBadge from '../components/RankBadge.jsx';
import NavLogo from '../components/NavLogo.jsx';
import LiveMatchScreen from './LiveMatchScreen.jsx';

export default function MatchScheduleScreen({ onBack, currentUser }) {
  const [view, setView] = useState("list"); // list | create | edit
  const [upcoming, setUpcoming] = useState([]);
  const [commentators, setCommentators] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(20);

  // Live match
  const [activeMatch, setActiveMatch] = useState(null);
  // Quick score
  const [quickScoreMatch, setQuickScoreMatch] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [quickSaving, setQuickSaving] = useState(false);

  // Create/Edit form
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [homeSearch, setHomeSearch] = useState("");
  const [awaySearch, setAwaySearch] = useState("");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState("");
  const [matchLength, setMatchLength] = useState("60");
  const [breakFormat, setBreakFormat] = useState("quarters");
  const [matchType, setMatchType] = useState("league");
  const [venue, setVenue] = useState("");
  const [selectedComms, setSelectedComms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [matchComms, setMatchComms] = useState({}); // matchId -> [commentator profiles]
  const [latestRankings, setLatestRankings] = useState({});

  const ml = parseInt(matchLength) || 60;
  const inputStyle = { width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [matches, comms, commAdmins, { data: teams }] = await Promise.all([
      supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').in('status', ['upcoming', 'live']).order('match_date', { ascending: true }).then(r => r.data || []),
      listUsersByRole('commentator'),
      listUsersByRole('commentator_admin'),
      supabase.from('teams').select('*').order('name'),
    ]);
    setUpcoming(matches);
    setCommentators([...commAdmins, ...comms]);
    setAllTeams(teams || []);

    // Load commentator assignments in one query
    const matchIds = matches.map(m => m.id);
    const commsMap = {};
    if (matchIds.length > 0) {
      const { data } = await supabase
        .from('match_commentators')
        .select('*, commentator:profiles!commentator_id(firstname, lastname)')
        .in('match_id', matchIds);
      (data || []).forEach(c => {
        if (!commsMap[c.match_id]) commsMap[c.match_id] = [];
        commsMap[c.match_id].push(c);
      });
    }
    setMatchComms(commsMap);
    fetchLatestRankings().then(r => setLatestRankings(r)).catch(() => {});
    setLoading(false);
  };

  const resetForm = () => {
    setHomeTeam(null); setAwayTeam(null); setHomeSearch(""); setAwaySearch("");
    setMatchDate(new Date().toISOString().slice(0, 10)); setScheduledTime("");
    setMatchLength("60"); setBreakFormat("quarters"); setMatchType("league");
    setVenue(""); setSelectedComms([]); setEditMatch(null);
  };

  const filteredHome = homeSearch.trim()
    ? allTeams.filter(t => t.name.toLowerCase().includes(homeSearch.toLowerCase()))
    : allTeams;
  const filteredAway = awaySearch.trim()
    ? allTeams.filter(t => t.name.toLowerCase().includes(awaySearch.toLowerCase()) && t.id !== homeTeam?.id)
    : allTeams.filter(t => t.id !== homeTeam?.id);

  const canSave = homeTeam && awayTeam && homeTeam.id !== awayTeam.id && matchDate;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    if (editMatch) {
      await updateScheduledMatch(editMatch.id, {
        home_team_id: homeTeam.id, away_team_id: awayTeam.id,
        match_date: matchDate, scheduled_time: scheduledTime || null,
        match_length: ml, break_format: breakFormat, match_type: matchType,
        venue: venue.trim() || null,
      });
      await assignCommentators(editMatch.id, selectedComms);
    } else {
      await scheduleMatch({
        homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
        matchDate, scheduledTime: scheduledTime || null,
        matchLength: ml, breakFormat, matchType,
        venue: venue.trim() || null, commentatorIds: selectedComms,
        createdBy: currentUser?.id,
      });
    }
    setSaving(false);
    resetForm();
    setView("list");
    load();
  };

  const handleEdit = async (m) => {
    setEditMatch(m);
    setHomeTeam(m.home_team); setHomeSearch(m.home_team?.name || "");
    setAwayTeam(m.away_team); setAwaySearch(m.away_team?.name || "");
    setMatchDate(m.match_date);
    setScheduledTime(m.scheduled_time || "");
    setMatchLength(String(m.match_length || 60));
    setBreakFormat(m.break_format || "quarters");
    setMatchType(m.match_type || "league");
    setVenue(m.venue || "");
    const comms = matchComms[m.id] || [];
    setSelectedComms(comms.map(c => c.commentator_id));
    setView("create");
  };

  const handleDelete = async (matchId) => {
    const { data, error } = await supabase.rpc('delete_match', { p_match_id: matchId, p_user_id: currentUser?.id });
    if (error) { alert(`Delete failed: ${error.message}`); return; }
    if (data && data !== 'ok') { alert(data); return; }
    load();
  };

  const toggleComm = (id) => {
    setSelectedComms(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Live match handlers
  const handleStartLive = async (m) => {
    const locked = await lockMatch(m.id, currentUser.id);
    if (!locked) { alert("Another user has already started this match."); load(); return; }
    await updateScheduledMatch(m.id, { status: 'live' });
    await snapshotRankings(m.id);
    setActiveMatch({
      supabaseId: m.id,
      home: { name: m.home_team?.name || 'Home', color: m.home_team?.color || '#3B82F6', id: m.home_team?.id, short: (m.home_team?.name || 'HOM').slice(0, 3).toUpperCase() },
      away: { name: m.away_team?.name || 'Away', color: m.away_team?.color || '#EF4444', id: m.away_team?.id, short: (m.away_team?.name || 'AWY').slice(0, 3).toUpperCase() },
      matchLength: m.match_length || 60, breakFormat: m.break_format || 'quarters',
      matchType: m.match_type || 'league', venue: m.venue || '', date: m.match_date,
    });
  };

  const handleResumeLive = (m) => {
    setActiveMatch({
      supabaseId: m.id,
      home: { name: m.home_team?.name || 'Home', color: m.home_team?.color || '#3B82F6', id: m.home_team?.id, short: (m.home_team?.name || 'HOM').slice(0, 3).toUpperCase() },
      away: { name: m.away_team?.name || 'Away', color: m.away_team?.color || '#EF4444', id: m.away_team?.id, short: (m.away_team?.name || 'AWY').slice(0, 3).toUpperCase() },
      matchLength: m.match_length || 60, breakFormat: m.break_format || 'quarters',
      matchType: m.match_type || 'league', venue: m.venue || '', date: m.match_date,
    });
  };

  const handleCancelLive = async (m) => {
    await unlockMatch(m.id, currentUser.id);
    await updateScheduledMatch(m.id, { status: 'upcoming' });
    setActiveMatch(null);
    load();
  };

  const handleSaveLiveGame = async (gameData) => {
    setActiveMatch(null);
    load();
  };

  const handleQuickScore = (m) => { setQuickScoreMatch(m); setHomeScore(m.home_score || 0); setAwayScore(m.away_score || 0); };

  const handleSaveQuickScore = async () => {
    if (!quickScoreMatch) return;
    setQuickSaving(true);
    const locked = await lockMatch(quickScoreMatch.id, currentUser.id);
    if (!locked && quickScoreMatch.locked_by !== currentUser.id) {
      alert("Another user has already scored this match."); setQuickSaving(false); load(); return;
    }
    await updateScheduledMatch(quickScoreMatch.id, { home_score: homeScore, away_score: awayScore, status: 'ended', duration: 0, locked_by: currentUser.id });
    await snapshotRankings(quickScoreMatch.id);
    setQuickSaving(false); setQuickScoreMatch(null); load();
  };

  // Countdown helper
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

  const filtered = search.trim()
    ? upcoming.filter(m => (m.home_team?.name || "").toLowerCase().includes(search.toLowerCase()) || (m.away_team?.name || "").toLowerCase().includes(search.toLowerCase()) || (m.venue || "").toLowerCase().includes(search.toLowerCase()))
    : upcoming;

  // ── LIVE MATCH VIEW ──
  if (activeMatch) {
    return (
      <div>
        <div style={{ padding: "4px 10px", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => {
            if (confirm("Cancel this match? It will revert to upcoming.")) handleCancelLive({ id: activeMatch.supabaseId, locked_by: currentUser.id });
          }} style={{ background: "none", border: "none", color: "#EF4444", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
            ✕ Cancel & Revert
          </button>
        </div>
        <LiveMatchScreen matchConfig={activeMatch} existingMatchId={activeMatch.supabaseId} onSaveGame={handleSaveLiveGame} onNavigate={() => { setActiveMatch(null); load(); }} />
      </div>
    );
  }

  // ── QUICK SCORE VIEW ──
  if (quickScoreMatch) {
    const m = quickScoreMatch;
    return (
      <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC", padding: 20 }}>
        <button onClick={() => setQuickScoreMatch(null)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{m.home_team?.name} {(() => { const r = latestRankings[m.home_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()} vs {m.away_team?.name} {(() => { const r = latestRankings[m.away_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
            {parseSASTDate(m.match_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
            {m.venue && ` · ${m.venue}`}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 24 }}>
          {[["home", m.home_team, homeScore, setHomeScore], ["away", m.away_team, awayScore, setAwayScore]].map(([side, t, score, setScore]) => (
            <div key={side} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t?.color || "#F8FAFC", marginBottom: 8 }}>{t?.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setScore(Math.max(0, score - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 18, cursor: "pointer" }}>−</button>
                <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "monospace", minWidth: 40, textAlign: "center" }}>{score}</div>
                <button onClick={() => setScore(score + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "#F59E0B", color: "#0B0F1A", fontSize: 18, fontWeight: 800, cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSaveQuickScore} disabled={quickSaving} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#10B981", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: quickSaving ? 0.5 : 1 }}>
          {quickSaving ? "Saving..." : "Save Final Score"}
        </button>
      </div>
    );
  }

  // ── CREATE/EDIT VIEW ──
  if (view === "create") return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { resetForm(); setView("list"); }}>←</button>
        <div style={S.navTitle}>{editMatch ? "Edit Match" : "Schedule Match"}</div>
        <NavLogo />
      </div>
      <div style={{ ...S.page, paddingBottom: 30 }}>
        {/* Home Team */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Home Team</div>
          <input style={inputStyle} value={homeSearch} onChange={e => { setHomeSearch(e.target.value); setHomeTeam(null); }} placeholder="🔍 Search..." />
          {!homeTeam && <div style={{ maxHeight: 120, overflowY: "auto", marginTop: 4 }}>
            {filteredHome.slice(0, 20).map(t => (
              <button key={t.id} onClick={() => { setHomeTeam(t); setHomeSearch(t.name); }} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, width: "100%",
                border: "1px solid #33415533", background: theme.surface, cursor: "pointer", marginBottom: 2,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                <div style={{ fontSize: 11, color: theme.text, fontWeight: 600 }}>{t.name}</div>
              </button>
            ))}
          </div>}
        </div>

        {/* Away Team */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Away Team</div>
          <input style={inputStyle} value={awaySearch} onChange={e => { setAwaySearch(e.target.value); setAwayTeam(null); }} placeholder="🔍 Search..." />
          {!awayTeam && <div style={{ maxHeight: 120, overflowY: "auto", marginTop: 4 }}>
            {filteredAway.slice(0, 20).map(t => (
              <button key={t.id} onClick={() => { setAwayTeam(t); setAwaySearch(t.name); }} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, width: "100%",
                border: "1px solid #33415533", background: theme.surface, cursor: "pointer", marginBottom: 2,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                <div style={{ fontSize: 11, color: theme.text, fontWeight: 600 }}>{t.name}</div>
              </button>
            ))}
          </div>}
        </div>

        {/* Date & Time */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Date</div>
            <input type="date" style={inputStyle} value={matchDate} onChange={e => setMatchDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Time</div>
            <input type="time" style={inputStyle} value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: theme.surface, borderRadius: 10, padding: 12, marginBottom: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Match Length</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input type="number" style={{ width: 54, padding: 6, borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }}
                value={matchLength} onChange={e => setMatchLength(e.target.value)} />
              {[20, 25, 30, 40, 60].map(m => (
                <button key={m} onClick={() => setMatchLength(String(m))} style={{
                  flex: 1, padding: "6px 0", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  border: ml === m ? "2px solid #F59E0B" : `1px solid ${theme.border}`,
                  background: ml === m ? "#F59E0B22" : theme.bg, color: ml === m ? "#F59E0B" : theme.textMuted, cursor: "pointer",
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Break Format</div>
            <div style={{ display: "flex", gap: 4 }}>
              {BREAK_FORMATS.map(bf => (
                <button key={bf.id} onClick={() => setBreakFormat(bf.id)} style={{
                  flex: 1, padding: "6px 2px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  border: breakFormat === bf.id ? "2px solid #F59E0B" : `1px solid ${theme.border}`,
                  background: breakFormat === bf.id ? "#F59E0B22" : theme.bg, color: breakFormat === bf.id ? "#F59E0B" : theme.textMuted, cursor: "pointer",
                }}>{bf.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Match Type</div>
            <div style={{ display: "flex", gap: 4 }}>
              {MATCH_TYPES.map(mt => (
                <button key={mt.id} onClick={() => setMatchType(mt.id)} style={{
                  flex: 1, padding: "6px 2px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  border: matchType === mt.id ? "2px solid #F59E0B" : `1px solid ${theme.border}`,
                  background: matchType === mt.id ? "#F59E0B22" : theme.bg, color: matchType === mt.id ? "#F59E0B" : theme.textMuted, cursor: "pointer",
                }}>{mt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Venue</div>
            <input style={inputStyle} value={venue} onChange={e => setVenue(e.target.value)} placeholder="Enter venue" />
          </div>
        </div>

        {/* Assign Commentators */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Assign Commentators</div>
          {commentators.length === 0 ? (
            <div style={{ fontSize: 10, color: theme.textDim, fontStyle: "italic" }}>No commentators created yet</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {commentators.map(c => {
                const sel = selectedComms.includes(c.id);
                const isCA = c.role === 'commentator_admin';
                const color = isCA ? "#F59E0B" : "#10B981";
                return (
                  <button key={c.id} onClick={() => toggleComm(c.id)} style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                    border: sel ? `2px solid ${color}` : `1px solid ${theme.border}`,
                    background: sel ? color + "22" : theme.bg,
                    color: sel ? color : theme.textMuted, cursor: "pointer",
                  }}>
                    {sel ? "✓ " : ""}{c.firstname} {c.lastname}{isCA ? " ★" : ""}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={!canSave || saving} style={{
          ...S.btn(theme.accent, theme.bg), opacity: (!canSave || saving) ? 0.5 : 1,
        }}>{saving ? "Saving..." : editMatch ? "Update Match" : "Schedule Match"}</button>
      </div>
    </div>
  );

  // ── LIST VIEW ──
  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Match Schedule</div>
        <NavLogo />
      </div>
      <div style={S.page}>
        <button style={S.btn(theme.accent, theme.bg)} onClick={() => { resetForm(); setView("create"); }}>+ Schedule Match</button>

        {/* Search */}
        <div style={{ marginTop: 10 }}>
          <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 12, outline: "none", boxSizing: "border-box" }}
            value={search} onChange={e => { setSearch(e.target.value); setShowCount(20); }} placeholder="🔍 Search matches..." />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>{search.trim() ? "No matches found" : "No upcoming matches"}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
            {filtered.slice(0, showCount).map(m => {
              const comms = matchComms[m.id] || [];
              const d = parseSASTDate(m.match_date);
              const isLive = m.status === 'live';
              const isMyLock = m.locked_by === currentUser?.id;
              const countdown = getCountdown(m.match_date, m.scheduled_time);
              return (
                <div key={m.id} style={{
                  background: theme.surface, borderRadius: 10, padding: "10px 12px",
                  border: isLive ? "1px solid #EF444444" : `1px solid ${theme.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: m.home_team?.color }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, flex: 1 }}>
                      {m.home_team?.name} {(() => { const r = latestRankings[m.home_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()} vs {m.away_team?.name} {(() => { const r = latestRankings[m.away_team?.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}
                    </div>
                    {isLive && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "#EF444422", color: "#EF4444", fontWeight: 800 }}>LIVE</span>}
                    {countdown && !isLive && <span style={{ fontSize: 9, fontWeight: 700, color: countdown.color, fontFamily: "monospace" }}>{countdown.text}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 4 }}>
                    {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                    {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
                    {m.venue && ` · ${m.venue}`}
                    {" · "}{m.match_length}min {m.match_type}
                  </div>
                  {comms.length > 0 && (
                    <div style={{ fontSize: 9, color: "#10B981", marginBottom: 6 }}>
                      🎙 {comms.map(c => `${c.commentator?.firstname} ${c.commentator?.lastname}`).join(", ")}
                    </div>
                  )}
                  {/* Action buttons */}
                  {isLive && isMyLock ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleResumeLive(m)} style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 700, border: "none", background: "#10B981", color: "#fff", cursor: "pointer" }}>🏑 Continue Recording</button>
                      <button onClick={() => { if (confirm("Cancel? Reverts to upcoming.")) handleCancelLive(m); }} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, border: "1px solid #EF444444", background: "transparent", color: "#EF4444", cursor: "pointer" }}>✕</button>
                    </div>
                  ) : isLive ? (
                    <div style={{ fontSize: 9, color: "#EF4444" }}>🔒 Started by another user</div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleStartLive(m)} style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 700, border: "none", background: "#F59E0B", color: "#0B0F1A", cursor: "pointer" }}>🏑 Start Live</button>
                      <button onClick={() => handleQuickScore(m)} style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textMuted, cursor: "pointer" }}>💾 Quick Score</button>
                      <button onClick={() => handleEdit(m)} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textMuted, cursor: "pointer" }}>✏️</button>
                      {(currentUser?.role === 'admin' || m.created_by === currentUser?.id) && (
                        <button onClick={() => { if (confirm("Delete this match?")) handleDelete(m.id); }} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, border: "1px solid #EF444444", background: "transparent", color: "#EF4444", cursor: "pointer" }}>🗑</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length > showCount && (
              <div onClick={() => setShowCount(prev => prev + 20)}
                style={{ textAlign: "center", padding: "10px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#F59E0B" }}>
                Show more ({filtered.length - showCount} remaining)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

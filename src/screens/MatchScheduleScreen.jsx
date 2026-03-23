import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { scheduleMatch, fetchUpcomingMatches, assignCommentators, updateScheduledMatch } from '../utils/sync.js';
import { listUsersByRole } from '../utils/auth.js';
import { BREAK_FORMATS, MATCH_TYPES } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';

export default function MatchScheduleScreen({ onBack }) {
  const [view, setView] = useState("list"); // list | create | edit
  const [upcoming, setUpcoming] = useState([]);
  const [commentators, setCommentators] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const ml = parseInt(matchLength) || 60;
  const inputStyle = { width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [matches, comms, { data: teams }] = await Promise.all([
      fetchUpcomingMatches(),
      listUsersByRole('commentator'),
      supabase.from('teams').select('*').order('name'),
    ]);
    setUpcoming(matches);
    setCommentators(comms);
    setAllTeams(teams || []);

    // Load commentator assignments for each match
    const commsMap = {};
    for (const m of matches) {
      const { data } = await supabase
        .from('match_commentators')
        .select('*, commentator:profiles!commentator_id(firstname, lastname)')
        .eq('match_id', m.id);
      commsMap[m.id] = data || [];
    }
    setMatchComms(commsMap);
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
    await supabase.from('match_commentators').delete().eq('match_id', matchId);
    await supabase.from('matches').delete().eq('id', matchId).eq('status', 'upcoming');
    load();
  };

  const toggleComm = (id) => {
    setSelectedComms(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // ── CREATE/EDIT VIEW ──
  if (view === "create") return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { resetForm(); setView("list"); }}>←</button>
        <div style={S.navTitle}>{editMatch ? "Edit Match" : "Schedule Match"}</div>
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
                return (
                  <button key={c.id} onClick={() => toggleComm(c.id)} style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                    border: sel ? "2px solid #10B981" : `1px solid ${theme.border}`,
                    background: sel ? "#10B98122" : theme.bg,
                    color: sel ? "#10B981" : theme.textMuted, cursor: "pointer",
                  }}>
                    {sel ? "✓ " : ""}{c.firstname} {c.lastname}
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
      </div>
      <div style={S.page}>
        <button style={S.btn(theme.accent, theme.bg)} onClick={() => { resetForm(); setView("create"); }}>+ Schedule Match</button>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>Loading...</div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>No upcoming matches</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
            {upcoming.map(m => {
              const comms = matchComms[m.id] || [];
              const d = new Date(m.match_date);
              return (
                <div key={m.id} style={{
                  background: theme.surface, borderRadius: 10, padding: "10px 12px",
                  border: `1px solid ${theme.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: m.home_team?.color }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, flex: 1 }}>
                      {m.home_team?.name} vs {m.away_team?.name}
                    </div>
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
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(m)} style={{
                      flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 700,
                      border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textMuted, cursor: "pointer",
                    }}>✏️ Edit</button>
                    <button onClick={() => { if (confirm("Delete this match?")) handleDelete(m.id); }} style={{
                      padding: "6px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      border: "1px solid #EF444444", background: "transparent", color: "#EF4444", cursor: "pointer",
                    }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

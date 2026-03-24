import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { fetchCommentatorMatches, lockMatch, unlockMatch, createLiveMatch, updateScheduledMatch, snapshotRankings } from '../utils/sync.js';
import { saveMatchToSupabase } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import LiveMatchScreen from './LiveMatchScreen.jsx';

export default function CommentatorDashboard({ currentUser, onLogout }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState(null); // match being recorded
  const [quickScoreMatch, setQuickScoreMatch] = useState(null); // match being quick-scored
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickSaved, setQuickSaved] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetchCommentatorMatches(currentUser.id);
    setMatches(data);
    setLoading(false);
  };

  const handleStartLive = async (m) => {
    try {
      // Try to lock
      const locked = await lockMatch(m.id, currentUser.id);
      if (!locked) {
        alert("Another commentator has already started this match.");
        load();
        return;
      }
      // Update status to live
      await updateScheduledMatch(m.id, { status: 'live' });
      await snapshotRankings(m.id);
      // Open the live recorder
      setActiveMatch({
        supabaseId: m.id,
        home: { name: m.home_team?.name || 'Home', color: m.home_team?.color || '#3B82F6', id: m.home_team?.id, short: (m.home_team?.name || 'HOM').slice(0, 3).toUpperCase() },
        away: { name: m.away_team?.name || 'Away', color: m.away_team?.color || '#EF4444', id: m.away_team?.id, short: (m.away_team?.name || 'AWY').slice(0, 3).toUpperCase() },
        matchLength: m.match_length || 60,
        breakFormat: m.break_format || 'quarters',
        matchType: m.match_type || 'league',
        venue: m.venue || '',
        date: m.match_date,
        isDemo: false,
      });
    } catch (err) {
      console.error('Start live error:', err);
      alert('Failed to start match. Please try again.');
      load();
    }
  };

  const handleResumeLive = (m) => {
    // Resume recording — match is already live and locked
    setActiveMatch({
      supabaseId: m.id,
      home: { name: m.home_team?.name || 'Home', color: m.home_team?.color || '#3B82F6', id: m.home_team?.id, short: (m.home_team?.name || 'HOM').slice(0, 3).toUpperCase() },
      away: { name: m.away_team?.name || 'Away', color: m.away_team?.color || '#EF4444', id: m.away_team?.id, short: (m.away_team?.name || 'AWY').slice(0, 3).toUpperCase() },
      matchLength: m.match_length || 60,
      breakFormat: m.break_format || 'quarters',
      matchType: m.match_type || 'league',
      venue: m.venue || '',
      date: m.match_date,
      isDemo: false,
    });
  };

  const handleCancelLive = async (m) => {
    // Only the user who locked it can cancel
    const success = await unlockMatch(m.id, currentUser.id);
    if (success) {
      setActiveMatch(null);
      load();
    }
  };

  const handleQuickScore = (m) => {
    setQuickScoreMatch(m);
    setHomeScore(m.home_score || 0);
    setAwayScore(m.away_score || 0);
  };

  const handleSaveQuickScore = async () => {
    if (!quickScoreMatch) return;
    setQuickSaving(true);

    // Lock it
    const locked = await lockMatch(quickScoreMatch.id, currentUser.id);
    if (!locked && quickScoreMatch.locked_by !== currentUser.id) {
      alert("Another commentator has already scored this match.");
      setQuickSaving(false);
      load();
      return;
    }

    await updateScheduledMatch(quickScoreMatch.id, {
      home_score: homeScore,
      away_score: awayScore,
      status: 'ended',
      duration: 0,
      locked_by: currentUser.id,
    });

    await snapshotRankings(quickScoreMatch.id);

    setQuickSaving(false);
    setQuickSaved(true);
    setTimeout(() => {
      setQuickSaved(false);
      setQuickScoreMatch(null);
      load();
    }, 1500);
  };

  const handleEditQuickScore = async (m) => {
    // Can only edit if I locked it
    if (m.locked_by !== currentUser.id) {
      alert("Only the commentator who scored this match can edit it.");
      return;
    }
    // Revert to upcoming
    await updateScheduledMatch(m.id, { status: 'upcoming', home_score: 0, away_score: 0, duration: null, locked_by: null });
    load();
  };

  const handleSaveLiveGame = (game) => {
    setActiveMatch(null);
    load();
    return game;
  };

  // If recording a live match, show the LiveMatchScreen
  if (activeMatch) {
    return (
      <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh" }}>
        <div style={{ padding: "4px 10px", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => {
            if (confirm("Cancel this match? It will revert to upcoming.")) {
              handleCancelLive({ id: activeMatch.supabaseId, locked_by: currentUser.id });
            }
          }} style={{ background: "none", border: "none", color: "#EF4444", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
            ✕ Cancel & Revert
          </button>
        </div>
        <LiveMatchScreen
          matchConfig={activeMatch}
          existingMatchId={activeMatch.supabaseId}
          onSaveGame={handleSaveLiveGame}
          onNavigate={() => { setActiveMatch(null); load(); }}
        />
      </div>
    );
  }

  // Quick score overlay
  if (quickScoreMatch) {
    const m = quickScoreMatch;
    return (
      <div style={{
        fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto",
        background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC", padding: 20,
      }}>
        <button onClick={() => setQuickScoreMatch(null)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{m.home_team?.name} vs {m.away_team?.name}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
            {new Date(m.match_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
            {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
            {m.venue && ` · ${m.venue}`}
          </div>
        </div>

        <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            {[[m.home_team, homeScore, setHomeScore], [m.away_team, awayScore, setAwayScore]].map(([t, sc, setSc], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t?.color, marginBottom: 8 }}>{t?.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setSc(Math.max(0, sc - 1))} style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 20, fontWeight: 700, cursor: "pointer" }}>−</button>
                  <div style={{ fontSize: 32, fontWeight: 800, color: t?.color, minWidth: 40, textAlign: "center" }}>{sc}</div>
                  <button onClick={() => setSc(sc + 1)} style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 20, fontWeight: 700, cursor: "pointer" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {quickSaved && <div style={{ textAlign: "center", padding: 10, color: "#10B981", fontSize: 13, fontWeight: 700, marginTop: 12 }}>✓ Score saved!</div>}

        <button onClick={handleSaveQuickScore} disabled={quickSaving} style={{
          width: "100%", padding: 14, borderRadius: 10, border: "none", marginTop: 16,
          background: quickSaving ? "#334155" : "#F59E0B", color: quickSaving ? "#64748B" : "#0B0F1A",
          fontSize: 14, fontWeight: 700, cursor: quickSaving ? "wait" : "pointer",
        }}>{quickSaving ? "Saving..." : "💾 Save Score"}</button>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const liveMatches = matches.filter(m => m.status === 'live');
  const completedMatches = matches.filter(m => m.status === 'ended');
  const [tab, setTab] = useState("upcoming");

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto",
      background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="28" height="28" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
              <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
              <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B" }}>My Matches</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: "#64748B", textAlign: "right" }}>
              {currentUser.firstname}
              <span style={{ fontSize: 9, marginLeft: 4, padding: "2px 6px", borderRadius: 99, background: "#10B98122", color: "#10B981", fontWeight: 700 }}>
                {currentUser.role === 'commentator_admin' ? 'Comm Admin' : 'Commentator'}
              </span>
            </div>
            <button onClick={onLogout} style={{ fontSize: 10, color: "#EF4444", background: "none", border: "1px solid #EF444444", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "0 16px 12px", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
        {[["upcoming", `📅 Upcoming (${upcomingMatches.length + liveMatches.length})`], ["completed", `✓ Completed (${completedMatches.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
            background: tab === k ? "#F59E0B22" : "#1E293B", color: tab === k ? "#F59E0B" : "#64748B",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading...</div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>No matches assigned to you yet</div>
        ) : tab === "upcoming" ? (
          <>
            {liveMatches.length === 0 && upcomingMatches.length === 0 && (
              <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>No upcoming matches</div>
            )}
            {/* Live matches */}
            {liveMatches.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#EF4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🔴 Live now</div>
                {liveMatches.map(m => (
                  <MatchCard key={m.id} match={m} currentUser={currentUser}
                    onStartLive={() => handleStartLive(m)}
                    onResumeLive={() => handleResumeLive(m)}
                    onCancel={() => handleCancelLive(m)}
                  />
                ))}
              </div>
            )}

            {/* Upcoming matches */}
            {upcomingMatches.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>📅 Upcoming</div>
                {upcomingMatches.map(m => (
                  <MatchCard key={m.id} match={m} currentUser={currentUser}
                    onStartLive={() => handleStartLive(m)}
                    onQuickScore={() => handleQuickScore(m)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {completedMatches.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>No completed matches yet</div>
            ) : (
              <div>
                {completedMatches.map(m => {
                  const d = new Date(m.match_date);
                  const isMyLock = m.locked_by === currentUser.id;
                  return (
                    <div key={m.id} style={{
                      background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 4,
                      border: "1px solid #334155",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: m.home_team?.color }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", flex: 1 }}>
                          {m.home_team?.name} vs {m.away_team?.name}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#F8FAFC" }}>{m.home_score}–{m.away_score}</div>
                      </div>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>
                        {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                        {m.venue && ` · ${m.venue}`}
                        {m.duration > 0 ? " · Live" : " · Quick"}
                      </div>
                      {isMyLock && m.duration === 0 && (
                        <button onClick={() => handleEditQuickScore(m)} style={{
                          width: "100%", padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 700,
                          border: "1px solid #F59E0B44", background: "transparent", color: "#F59E0B", cursor: "pointer",
                        }}>✏️ Edit Score</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={load} style={{ background: "none", border: "1px solid #334155", borderRadius: 8, padding: "6px 16px", color: "#64748B", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>🔄 Refresh</button>
          <div style={{ marginTop: 8, fontSize: 9, color: "#334155" }}>v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match: m, currentUser, onStartLive, onQuickScore, onCancel, onResumeLive }) {
  const d = new Date(m.match_date);
  const isLocked = m.locked_by && m.locked_by !== currentUser.id;
  const isMyLock = m.locked_by === currentUser.id;

  return (
    <div style={{
      background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 4,
      border: m.status === 'live' ? "1px solid #EF444444" : "1px solid #334155",
      opacity: isLocked ? 0.5 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: m.home_team?.color }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", flex: 1 }}>
          {m.home_team?.name} vs {m.away_team?.name}
        </div>
        {m.status === 'live' && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "#EF444422", color: "#EF4444", fontWeight: 800 }}>LIVE</span>}
      </div>
      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 6 }}>
        {d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
        {m.scheduled_time && ` · ${m.scheduled_time.slice(0, 5)}`}
        {m.venue && ` · ${m.venue}`}
        {" · "}{m.match_length}min
      </div>
      {isLocked && <div style={{ fontSize: 9, color: "#EF4444", marginBottom: 4 }}>🔒 Started by another commentator</div>}
      {!isLocked && m.status === 'upcoming' && (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onStartLive} style={{
            flex: 1, padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, border: "none",
            background: "#F59E0B", color: "#0B0F1A", cursor: "pointer",
          }}>🏑 Start Live</button>
          <button onClick={onQuickScore} style={{
            flex: 1, padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700,
            border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", cursor: "pointer",
          }}>💾 Quick Score</button>
        </div>
      )}
      {isMyLock && m.status === 'live' && (
        <div style={{ display: "flex", gap: 6 }}>
          {onResumeLive && (
            <button onClick={onResumeLive} style={{
              flex: 1, padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, border: "none",
              background: "#10B981", color: "#fff", cursor: "pointer",
            }}>🏑 Continue Recording</button>
          )}
          {onCancel && (
            <button onClick={onCancel} style={{
              padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: "1px solid #EF444444", background: "transparent", color: "#EF4444", cursor: "pointer",
            }}>✕ Cancel</button>
          )}
        </div>
      )}
    </div>
  );
}

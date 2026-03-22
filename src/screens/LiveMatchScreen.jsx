import { useState, useCallback, useEffect, useRef } from 'react';
import { otherTeam, exportMatchJSON } from '../utils/helpers.js';
import { generateInsight } from '../utils/commentary.js';
import { S, theme } from '../utils/styles.js';
import { useMatchTimer } from '../hooks/useMatchTimer.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import { createLiveMatch, pushLiveEvent, updateLiveScore, endLiveMatch } from '../utils/sync.js';
import Scoreboard from '../components/Scoreboard.jsx';
import FieldRecorder from '../components/FieldRecorder.jsx';
import EventLog from '../components/EventLog.jsx';
import CoachLiveScreen from './CoachLiveScreen.jsx';
import DPopup from '../components/DPopup.jsx';
import PausePopup from '../components/PausePopup.jsx';
import TeamPicker from '../components/TeamPicker.jsx';

export default function LiveMatchScreen({ matchConfig, onSaveGame, onNavigate }) {
  const { home, away, matchLength, breakFormat, venue, date, isDemo } = matchConfig;
  const teams = { home, away };
  const timer = useMatchTimer();
  const { matchTime, running, matchState } = timer;

  const [events, setEvents] = useState([]);
  const [possession, setPossession] = useState(null);
  const [ballPos, setBallPos] = useState(null);
  const [prevBallPos, setPrevBallPos] = useState(null);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [showDPopup, setShowDPopup] = useState(null);
  const [showRestart, setShowRestart] = useState(true);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showPauseReason, setShowPauseReason] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [sidelineOut, setSidelineOut] = useState(null);
  const [lastSavedGame, setLastSavedGame] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pauseReason, setPauseReason] = useState(null);
  const [liveMatchId, setLiveMatchId] = useState(null); // Supabase match ID for live push
  const eventSeqRef = useRef(0);

  const topTeam = flipped ? "home" : "away";
  const bottomTeam = flipped ? "away" : "home";

  // Create live match in Supabase on mount (unless demo)
  useEffect(() => {
    if (isDemo) return;
    createLiveMatch(matchConfig).then(result => {
      if (result) {
        setLiveMatchId(result.id);
        console.log('Live match created:', result.id);
      }
    }).catch(err => console.warn('Could not create live match:', err));
  }, []);

  // Auto-save
  const getState = useCallback(() => ({
    teams, events, matchTime: timer.matchTime, matchState: timer.matchState,
    possession, ballPos, prevBallPos, score, flipped, sidelineOut,
    matchLength, breakFormat, venue, date,
  }), [teams, events, timer.matchTime, timer.matchState, possession, ballPos, prevBallPos, score, flipped, sidelineOut]);
  const { clearAutoSave } = useAutoSave(getState, matchState !== "idle" && matchState !== "ended");

  // Add log with optional commentary + push to Supabase
  const addLog = useCallback((team, event, zone, detail) => {
    const entry = { id: Date.now(), team, event, zone, detail, time: timer.matchTime };

    setEvents(prev => {
      const upd = [entry, ...prev];
      const triggers = ["D Entry", "Goal!", "Goal! (SC)", "Turnover Won", "Short Corner", "Penalty"];
      if (triggers.includes(event)) {
        const ins = generateInsight(team, event, upd, teams);
        if (ins) return [{ id: Date.now() + 1, team: "commentary", event: "💬", zone: "", detail: ins, time: timer.matchTime }, entry, ...prev];
      }
      return upd;
    });

    // Push to Supabase (fire-and-forget)
    if (liveMatchId && !isDemo) {
      eventSeqRef.current += 1;
      pushLiveEvent(liveMatchId, entry, eventSeqRef.current).catch(() => {});
    }
  }, [timer.matchTime, teams, liveMatchId, isDemo]);

  // Ball tap = swap possession (except in D → show popup)
  const handleBallTap = () => {
    if (!running || showRestart || !possession) return;
    if (ballPos?.type === "d") { setShowDPopup({ end: ballPos.end }); return; }
    const other = otherTeam(possession);
    addLog(other, "Turnover Won", ballPos?.zoneId ? "Centre" : "Centre", `${teams[other].name} won possession`);
    setPossession(other);
  };

  // D option
  const handleDOption = (opt) => {
    if (!showDPopup) return;
    const { end } = showDPopup;
    const attackingTeam = end === "top" ? (flipped ? "away" : "home") : (flipped ? "home" : "away");
    const defendingTeam = otherTeam(attackingTeam);
    const dLabel = `${teams[defendingTeam].name} D`;

    if (opt.id === "goal") {
      // Check if from short corner
      const real = events.filter(e => e.team !== "commentary" && e.team !== "meta");
      const lastSC = real.find(e => e.event === "Short Corner" && e.team === attackingTeam);
      const btw = lastSC ? real.slice(0, real.indexOf(lastSC)) : [];
      const fromSC = lastSC && !btw.some(e => e.event === "Start" || e.event.startsWith("Goal!") || (e.event === "Turnover Won" && e.team === defendingTeam));
      addLog(attackingTeam, fromSC ? "Goal! (SC)" : "Goal!", dLabel, fromSC ? `${teams[attackingTeam].name} scored from short corner!` : `${teams[attackingTeam].name} scored!`);
      setScore(prev => {
        const newScore = { ...prev, [attackingTeam]: prev[attackingTeam] + 1 };
        // Push score to Supabase
        if (liveMatchId && !isDemo) updateLiveScore(liveMatchId, newScore.home, newScore.away).catch(() => {});
        return newScore;
      });
      setPossession(null); setBallPos(null); setPrevBallPos(null); setShowRestart(true);
    } else if (opt.id === "lost_poss") {
      addLog(attackingTeam, "Poss Conceded", dLabel, `${teams[attackingTeam].name} lost possession in ${dLabel}`);
      setPossession(defendingTeam);
    } else if (opt.id === "short_corner") {
      addLog(attackingTeam, "Short Corner", dLabel, `${teams[attackingTeam].name}: Short Corner in ${dLabel}`);
      setPrevBallPos(ballPos); setBallPos({ type: "sc", end });
    } else {
      addLog(attackingTeam, opt.label, dLabel, `${teams[attackingTeam].name}: ${opt.label} in ${dLabel}`);
    }
    setShowDPopup(null);
  };

  // Restart from centre
  const handleRestart = (team) => {
    setSidelineOut(null);
    addLog(team, "Start", "Centre", `${teams[team].name} takes centre pass`);
    setPossession(team); setPrevBallPos(null);
    setBallPos({ type: "centre", team }); setShowRestart(false); setShowTeamPicker(false);
    if (!running) timer.start();
  };

  // Pause
  const handlePause = (reason) => {
    timer.pause();
    setShowPauseReason(false);
    setPauseReason(reason);
    setEvents(prev => [{ id: Date.now(), team: "meta", event: `Pause: ${reason}`, zone: null, detail: reason, time: timer.matchTime }, ...prev]);
    // Quarter Break / Half Time → ball to centre for restart
    if (reason === "Quarter Break" || reason === "Half Time") {
      setBallPos(null); setPrevBallPos(null); setShowRestart(true); setPossession(null);
    }
  };

  // Resume
  const handleResume = () => {
    if (pauseReason === "Quarter Break" || pauseReason === "Half Time") {
      // Ball already at centre with restart showing — timer resumes when team is picked
      setPauseReason(null);
    } else {
      timer.resume();
      setPauseReason(null);
    }
  };

  const [showDemoEnd, setShowDemoEnd] = useState(false);

  // End match
  const handleEndMatch = () => {
    setShowEndConfirm(false);
    timer.end();
    clearAutoSave();

    // Demo: show discard option instead of auto-saving
    if (isDemo) {
      setShowDemoEnd(true);
      return;
    }

    const game = {
      id: liveMatchId || Date.now().toString(),
      supabase_id: liveMatchId || null,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      teams, events, duration: timer.matchTime,
      matchLength, breakFormat, venue,
      homeScore: score.home, awayScore: score.away,
    };
    if (liveMatchId) {
      endLiveMatch(liveMatchId, score.home, score.away, timer.matchTime).catch(() => {});
    }
    const saved = onSaveGame(game);
    setLastSavedGame(saved || game);
  };

  // Undo
  const undoLast = () => {
    if (events.length === 0) return;
    let rc = 1;
    if (events[0].team === "commentary" && events.length > 1) rc = 2;
    const removed = events.slice(0, rc);
    const rest = events.slice(rc);
    setEvents(rest); setPrevBallPos(null);
    const hadGoal = removed.some(e => e.event?.startsWith("Goal!"));
    if (hadGoal) {
      const goalEntry = removed.find(e => e.event?.startsWith("Goal!"));
      if (goalEntry) setScore(prev => ({ ...prev, [goalEntry.team]: Math.max(0, prev[goalEntry.team] - 1) }));
      setShowRestart(false);
    }
    if (removed.some(e => e.event?.startsWith("Sideline"))) setSidelineOut(null);
    const prev = rest.find(e => e.team !== "commentary" && e.team !== "meta");
    if (prev) {
      setPossession(prev.team);
      if (prev.zone === "Centre") setBallPos({ type: "centre", team: prev.team });
      else if (prev.zone?.includes(" D")) setBallPos({ type: "d", end: "top" });
      else {
        const ZONES = [{ id: "z1", label: "Opp Quarter" }, { id: "z2", label: "Opp Midfield" }, { id: "z3", label: "Own Midfield" }, { id: "z4", label: "Own Quarter" }];
        const z = ZONES.find(zn => prev.zone?.startsWith(zn.label));
        const pm = prev.zone?.match(/\((left|right|centre)\)/);
        setBallPos(z ? { zoneId: z.id, pos: pm ? pm[1] : "centre" } : null);
      }
    } else { setPossession(null); setBallPos(null); setShowRestart(true); }
  };

  const [liveTab, setLiveTab] = useState("field"); // field | log | coach | share

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <Scoreboard teams={teams} homeGoals={score.home} awayGoals={score.away}
        matchTime={matchTime} matchState={matchState} running={running} />

      {/* Possession + Flip */}
      <div style={{ padding: "0 14px 4px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        {possession ? (
          <div style={{ fontSize: 9, fontWeight: 700, color: teams[possession].color, background: teams[possession].color + "22", padding: "2px 10px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: teams[possession].color }} />
            {teams[possession].name}
          </div>
        ) : (
          <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDimmer, padding: "2px 10px" }}>
            {matchState === "ended" ? "MATCH ENDED" : "TAP BALL TO START"}
          </div>
        )}
        {matchState !== "ended" && (
          <button onClick={() => setFlipped(f => !f)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textMuted, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>🔄</button>
        )}
      </div>

      {/* Field — visible on field tab */}
      {(liveTab === "field" || liveTab === "share") && (
        <FieldRecorder
          teams={teams} possession={possession} setPossession={setPossession}
          ballPos={ballPos} setBallPos={setBallPos}
          prevBallPos={prevBallPos} setPrevBallPos={setPrevBallPos}
          running={running} matchState={matchState}
          showRestart={showRestart} setShowRestart={setShowRestart}
          flipped={flipped}
          sidelineOut={sidelineOut} setSidelineOut={setSidelineOut}
          score={score} setScore={setScore}
          onAddLog={addLog}
          onShowDPopup={setShowDPopup} showDPopup={showDPopup}
          onShowTeamPicker={setShowTeamPicker}
          onBallTap={handleBallTap}
        />
      )}

      {/* D Popup */}
      {showDPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowDPopup(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 12, padding: 16, width: 280, border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: theme.text, marginBottom: 10, textAlign: "center" }}>In the D — What happened?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { id: "goal", label: "Goal!", icon: "⚽", color: "#F59E0B" },
                { id: "short_corner", label: "Short Corner", icon: "🔲", color: "#8B5CF6" },
                { id: "shot_on", label: "Shot on Goal", icon: "◉", color: "#10B981" },
                { id: "shot_off", label: "Shot Off Target", icon: "○", color: "#6B7280" },
                { id: "lost_poss", label: "Lost Possession", icon: "✕", color: "#EF4444" },
              ].map(opt => (
                <button key={opt.id} onClick={() => handleDOption(opt)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8, border: `1px solid ${opt.color}33`, background: `${opt.color}11`,
                  color: theme.text, cursor: "pointer", fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ fontSize: 16 }}>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Picker */}
      <TeamPicker show={showTeamPicker} teams={teams} topTeam={topTeam} bottomTeam={bottomTeam}
        onSelect={handleRestart} onClose={() => setShowTeamPicker(false)} />

      {/* Pause Picker */}
      <PausePopup show={showPauseReason} onSelect={handlePause} onClose={() => setShowPauseReason(false)} />

      {/* End Confirm */}
      {showEndConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={() => setShowEndConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 16, padding: "20px 16px", width: 280, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>End Match?</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 4 }}>{teams.home.name} {score.home} – {score.away} {teams.away.name}</div>
            <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 14 }}>{events.filter(e => e.team !== "commentary" && e.team !== "meta").length} events</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowEndConfirm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleEndMatch} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #EF444466", background: "#EF444422", color: theme.danger, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>End & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "6px 14px 4px", flexWrap: "wrap" }}>
        {matchState !== "ended" ? (
          <>
            {running && <button onClick={() => setShowPauseReason(true)} style={S.btnSm(theme.accent, theme.bg)}>⏸ Pause</button>}
            {matchState === "paused" && <button onClick={handleResume} style={S.btnSm(theme.success, theme.bg)}>▶ Resume</button>}
            {(running || matchState === "paused") && <button onClick={() => setShowEndConfirm(true)} style={S.btnSm(theme.danger, "#FFF")}>⏹ End</button>}
            {events.length > 0 && <button onClick={undoLast} style={{ ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}` }}>↩ Undo</button>}
          </>
        ) : showDemoEnd ? (
          <>
            <button onClick={() => onNavigate("home")} style={S.btnSm(theme.success, "#FFF")}>✓ Discard & Home</button>
          </>
        ) : (
          <>
            <button onClick={() => lastSavedGame && exportMatchJSON(lastSavedGame)} style={S.btnSm(theme.info, "#FFF")}>📦 JSON</button>
            <button onClick={() => onNavigate("game_review", lastSavedGame)} style={S.btnSm(theme.success, "#FFF")}>📊 Review</button>
            <button onClick={() => onNavigate("home")} style={S.btnSm(theme.accent, theme.bg)}>🏠 Home</button>
          </>
        )}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", margin: "4px 10px 0", borderRadius: 6, overflow: "hidden", border: `1px solid ${theme.border}` }}>
        {[["field", "🏑 Field"], ["log", "☰ Log"], ["coach", "🔒 Coach"], ["share", "📺 Share"]].map(([k, l]) => (
          <button key={k} onClick={() => setLiveTab(k)} style={{
            flex: 1, padding: "5px 0", textAlign: "center", fontSize: 8, fontWeight: 700,
            background: liveTab === k ? theme.border : theme.surface,
            color: liveTab === k ? theme.text : theme.textDim,
            border: "none", cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      {/* Tab content */}
      {liveTab === "field" && null /* field is always visible above */}
      {liveTab === "log" && <EventLog events={events} teams={teams} />}
      {liveTab === "coach" && (
        <CoachLiveScreen
          match={{ teams, breakFormat, homeScore: score.home, awayScore: score.away, status: matchState === "ended" ? "ended" : "live" }}
          events={events}
          matchTime={matchTime}
          running={running}
        />
      )}
      {liveTab === "share" && (
        <div style={{ padding: "16px 14px" }}>
          <div style={{ background: theme.surface, borderRadius: 12, padding: 16, border: `1px solid ${theme.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📺</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Share Live Match</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12 }}>
              Share this link with spectators for a live score + commentary feed. They won't see tactical stats.
            </div>
            <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12 }}>
              Coming soon — requires Supabase real-time to be fully wired. For now, use the 📺 Public button on the Game Review screen after the match ends.
            </div>
          </div>
        </div>
      )}

      {/* Fixed possession indicator */}
      {possession && (
        <div style={{ position: "fixed", bottom: 10, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", alignItems: "center", gap: 8, background: "#0F172Aee", padding: "6px 16px", borderRadius: 99, border: `1px solid ${teams[possession].color}44` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: teams[possession].color }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{teams[possession].name}</span>
        </div>
      )}
    </div>
  );
}

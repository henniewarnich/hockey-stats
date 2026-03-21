import { useState, useCallback } from 'react';
import { ZONES } from '../utils/constants.js';
import { otherTeam, exportMatchJSON } from '../utils/helpers.js';
import { generateInsight } from '../utils/commentary.js';
import { S, theme } from '../utils/styles.js';
import { useMatchTimer } from '../hooks/useMatchTimer.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import Scoreboard from '../components/Scoreboard.jsx';
import FieldRecorder from '../components/FieldRecorder.jsx';
import EventLog from '../components/EventLog.jsx';
import DPopup from '../components/DPopup.jsx';
import PausePopup from '../components/PausePopup.jsx';
import TeamPicker from '../components/TeamPicker.jsx';

export default function LiveMatchScreen({ matchConfig, onSaveGame, onNavigate }) {
  const { home, away, matchLength, breakFormat, venue, date } = matchConfig;
  const teams = { home, away };

  const timer = useMatchTimer();
  const { matchTime, running, matchState } = timer;

  const [events, setEvents] = useState([]);
  const [possession, setPossession] = useState(null);
  const [ballPos, setBallPos] = useState(null);
  const [prevBallPos, setPrevBallPos] = useState(null);
  const [tapCount, setTapCount] = useState(1);
  const [showDPopup, setShowDPopup] = useState(null);
  const [showRestart, setShowRestart] = useState(true);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showPauseReason, setShowPauseReason] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [sidelineOut, setSidelineOut] = useState(null);
  const [lastSavedGame, setLastSavedGame] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const topTeam = flipped ? "home" : "away";
  const bottomTeam = flipped ? "away" : "home";

  const homeGoals = events.filter(e => e.team === "home" && e.event?.startsWith("Goal!")).length;
  const awayGoals = events.filter(e => e.team === "away" && e.event?.startsWith("Goal!")).length;

  // Auto-save every 30s
  const getAutoSaveState = useCallback(() => ({
    teams, events, matchTime: timer.matchTime, matchState: timer.matchState,
    possession, ballPos, prevBallPos, tapCount, flipped, sidelineOut,
    matchLength, breakFormat, venue, date,
    homeGoals, awayGoals,
  }), [teams, events, timer.matchTime, timer.matchState, possession, ballPos, prevBallPos, tapCount, flipped, sidelineOut]);

  const { saveNow, clearAutoSave } = useAutoSave(
    getAutoSaveState,
    matchState !== "idle" && matchState !== "ended"
  );

  // Add log entry with optional commentary
  const addLog = useCallback((team, event, zone, detail) => {
    setEvents(prev => {
      const entry = { id: Date.now(), team, event, zone, detail, time: timer.matchTime };
      const upd = [entry, ...prev];
      const triggers = ["D Entry", "Goal!", "Goal! (SC)", "Turnover Won", "Short Corner", "Penalty"];
      if (triggers.includes(event)) {
        const ins = generateInsight(team, event, upd, teams);
        if (ins) {
          return [{ id: Date.now() + 1, team: "commentary", event: "💬", zone: "", detail: ins, time: timer.matchTime }, entry, ...prev];
        }
      }
      return upd;
    });
  }, [timer.matchTime, teams]);

  // Handle D popup selection
  const handleDOption = (opt) => {
    if (!showDPopup) return;
    const { end } = showDPopup;
    const def = end === "top" ? topTeam : bottomTeam;
    const atk = otherTeam(def);
    const dLbl = `${teams[def].name} D`;
    const adjQ = end === "top" ? "opp_quarter" : "own_quarter";
    setTapCount(1);

    if (opt.id === "goal") {
      const real = events.filter(e => e.team !== "commentary" && e.team !== "meta");
      const lastSC = real.find(e => e.event === "Short Corner" && e.team === atk);
      const btw = lastSC ? real.slice(0, real.indexOf(lastSC)) : [];
      const fromSC = lastSC && !btw.some(e => e.event === "Start" || e.event.startsWith("Goal!") || (e.event === "Turnover Won" && e.team === def));
      addLog(atk, fromSC ? "Goal! (SC)" : "Goal!", dLbl,
        fromSC ? `${teams[atk].name} scored from short corner! 🎯` : `${teams[atk].name} scored in ${dLbl}`);
      setPossession(null); setBallPos(null); setPrevBallPos(null); setShowRestart(true);
    } else if (opt.id === "shot_on" || opt.id === "shot_off" || opt.id === "penalty") {
      addLog(atk, opt.label, dLbl, `${teams[atk].name}: ${opt.label} in ${dLbl}`);
      setPossession(atk);
      setPrevBallPos(ballPos); setBallPos({ zoneId: adjQ, pos: "centre" });
    } else if (opt.id === "lost_poss") {
      addLog(def, "Turnover Won", dLbl, `${teams[atk].name} lost possession. ${teams[def].name} ball.`);
      setPossession(def);
      setPrevBallPos(ballPos); setBallPos({ zoneId: adjQ, pos: "centre" });
    } else if (opt.id === "long_corner") {
      addLog(atk, opt.label, dLbl, `${teams[atk].name}: ${opt.label}`);
      setPossession(atk);
      setPrevBallPos(ballPos); setBallPos({ zoneId: end === "top" ? "opp_mid" : "own_mid", pos: "centre" });
    } else if (opt.id === "dead_ball") {
      addLog(def, "Ball Dead", dLbl, `Dead in ${dLbl}. ${teams[def].name} restart.`);
      setPossession(def);
      setPrevBallPos(ballPos); setBallPos({ zoneId: adjQ, pos: "centre" });
    } else {
      addLog(atk, opt.label, dLbl, `${teams[atk].name}: ${opt.label} in ${dLbl}`);
      setPrevBallPos(ballPos); setBallPos({ type: "d", end });
    }
    setShowDPopup(null);
  };

  // Restart from centre
  const handleRestart = (team) => {
    setSidelineOut(null);
    addLog(team, "Start", "Centre", `${teams[team].name} takes centre pass`);
    setPossession(team); setTapCount(1); setPrevBallPos(null);
    setBallPos({ type: "centre", team }); setShowRestart(false); setShowTeamPicker(false);
    if (!running) { timer.start(); }
  };

  // Resume after pause — ball goes to centre, pick team
  const handleResume = () => {
    setShowRestart(true);
    setBallPos(null); setPrevBallPos(null); setPossession(null);
    // Timer stays paused until team is picked and handleRestart fires
  };

  // Pause
  const handlePause = (reason) => {
    timer.pause();
    setShowPauseReason(false);
    setEvents(prev => [{
      id: Date.now(), team: "meta", event: `Pause: ${reason}`,
      zone: null, detail: reason, time: timer.matchTime,
    }, ...prev]);
  };

  // End match
  const handleEndMatch = () => {
    setShowEndConfirm(false);
    timer.end();
    clearAutoSave();
    const game = {
      id: Date.now().toString(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      teams,
      events,
      duration: timer.matchTime,
      matchLength,
      breakFormat,
      venue,
      homeScore: homeGoals,
      awayScore: awayGoals,
    };
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
    setEvents(rest); setTapCount(1); setPrevBallPos(null);

    const goalE = removed.find(e => e.event?.startsWith("Goal!"));
    if (goalE) {
      setShowRestart(false);
      setPossession(goalE.team);
      setBallPos({ type: "d", end: "top" }); // Return ball to D
      return;
    }

    const prev = rest.find(e => e.team !== "commentary" && e.team !== "meta");
    if (prev) {
      setPossession(prev.team);
      if (prev.zone === "Centre") setBallPos({ type: "centre", team: prev.team });
      else if (prev.zone?.includes("D") || prev.zone?.includes("Backline")) {
        setBallPos({ type: "d", end: prev.zone.includes(teams[topTeam]?.name) ? "top" : "bottom" });
      } else {
        const z = ZONES.find(zn => prev.zone?.startsWith(zn.label));
        const pm = prev.zone?.match(/(Left|Centre|Right)/);
        setBallPos(z ? { zoneId: z.id, pos: pm ? pm[1].toLowerCase() : "centre" } : null);
      }
    } else {
      setPossession(null); setBallPos(null); setShowRestart(true);
    }
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Scoreboard teams={teams} homeGoals={homeGoals} awayGoals={awayGoals}
        matchTime={matchTime} matchState={matchState} running={running} />

      {/* Possession + Flip */}
      <div style={{ padding: "0 14px 4px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        {possession ? (
          <div style={{
            fontSize: 9, fontWeight: 700, color: teams[possession].color,
            background: teams[possession].color + "22", padding: "2px 10px", borderRadius: 99,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: teams[possession].color }} />
            {teams[possession].name}
          </div>
        ) : (
          <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDimmer, padding: "2px 10px" }}>
            {matchState === "ended" ? "MATCH ENDED" : "TAP BALL TO START"}
          </div>
        )}
        {matchState !== "ended" && (
          <button onClick={() => setFlipped(f => !f)} style={{
            padding: "3px 8px", borderRadius: 6, border: `1px solid ${theme.border}`,
            background: theme.surface, color: theme.textMuted, fontSize: 10, fontWeight: 700, cursor: "pointer",
          }}>
            🔄
          </button>
        )}
      </div>

      {/* Field */}
      <FieldRecorder
        teams={teams} possession={possession} setPossession={setPossession}
        ballPos={ballPos} setBallPos={setBallPos}
        prevBallPos={prevBallPos} setPrevBallPos={setPrevBallPos}
        tapCount={tapCount} setTapCount={setTapCount}
        running={running} showRestart={showRestart} setShowRestart={setShowRestart}
        flipped={flipped} matchState={matchState}
        onAddLog={addLog} onShowDPopup={setShowDPopup}
        onShowTeamPicker={setShowTeamPicker}
        sidelineOut={sidelineOut} setSidelineOut={setSidelineOut}
      />

      {/* Popups */}
      <DPopup show={showDPopup} teams={teams} topTeam={topTeam}
        onSelect={handleDOption} onClose={() => setShowDPopup(null)} />
      <PausePopup show={showPauseReason}
        onSelect={handlePause} onClose={() => setShowPauseReason(false)} />
      <TeamPicker show={showTeamPicker} teams={teams}
        topTeam={topTeam} bottomTeam={bottomTeam}
        onSelect={handleRestart} onClose={() => setShowTeamPicker(false)} />

      {/* End match confirmation */}
      {showEndConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        }} onClick={() => setShowEndConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: theme.surface, borderRadius: 16, padding: "20px 16px", width: 280,
          }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>⏹ End Match?</div>
              <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
                {teams.home.name} {homeGoals} - {awayGoals} {teams.away.name}
              </div>
              <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>
                {events.filter(e => e.team !== "commentary" && e.team !== "meta").length} events recorded
              </div>
            </div>
            <button onClick={handleEndMatch} style={{
              ...S.btn(theme.danger, "#fff"), marginBottom: 6,
            }}>
              End Match & Save
            </button>
            <button onClick={() => setShowEndConfirm(false)} style={{
              ...S.btn("transparent", theme.textDim),
              border: `1px solid ${theme.border}`,
            }}>
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "6px 14px 4px", flexWrap: "wrap" }}>
        {matchState !== "ended" ? (
          <>
            {running && (
              <button onClick={() => setShowPauseReason(true)} style={S.btnSm(theme.accent, theme.bg)}>
                ⏸ Pause
              </button>
            )}
            {matchState === "paused" && (
              <button onClick={handleResume} style={S.btnSm(theme.success, theme.bg)}>
                ▶ Resume
              </button>
            )}
            {(running || matchState === "paused") && (
              <button onClick={() => setShowEndConfirm(true)} style={S.btnSm(theme.danger, "#FFF")}>
                ⏹ End
              </button>
            )}
            {events.length > 0 && (
              <button onClick={undoLast} style={{
                ...S.btnSm(theme.surface, theme.textMuted),
                border: `1px solid ${theme.border}`,
              }}>
                ↩ Undo
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => lastSavedGame && exportMatchJSON(lastSavedGame)}
              style={S.btnSm(theme.info, "#FFF")}>📦 JSON</button>
            <button onClick={() => onNavigate("game_review", lastSavedGame)}
              style={S.btnSm(theme.success, "#FFF")}>📊 Dashboard</button>
            <button onClick={() => onNavigate("home")}
              style={S.btnSm(theme.accent, theme.bg)}>🏠 Home</button>
          </>
        )}
      </div>

      <EventLog events={events} teams={teams} />
    </div>
  );
}

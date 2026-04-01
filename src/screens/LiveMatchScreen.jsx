import { useState, useCallback, useEffect, useRef } from 'react';
import { otherTeam, exportMatchJSON, ensureContrastingColors } from '../utils/helpers.js';
import { generateInsight } from '../utils/commentary.js';
import { S, theme } from '../utils/styles.js';
import { useMatchTimer } from '../hooks/useMatchTimer.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import { createLiveMatch, pushLiveEvent, updateLiveScore, endLiveMatch, endVideoReview } from '../utils/sync.js';
import { supabase } from '../utils/supabase.js';
import Scoreboard from '../components/Scoreboard.jsx';
import FieldRecorder from '../components/FieldRecorder.jsx';
import EventLog from '../components/EventLog.jsx';
import CoachLiveScreen from './CoachLiveScreen.jsx';
import DPopup from '../components/DPopup.jsx';
import PausePopup from '../components/PausePopup.jsx';
import TeamPicker from '../components/TeamPicker.jsx';
import { teamColor, teamDisplayName, teamShortName, teamSlug } from '../utils/teams.js';

const ZONES = [
  { id: "z1", label: "Opp Quarter" },
  { id: "z2", label: "Opp Midfield" },
  { id: "z3", label: "Own Midfield" },
  { id: "z4", label: "Own Quarter" },
];

export default function LiveMatchScreen({ matchConfig, existingMatchId, onSaveGame, onNavigate, currentUser, onMatchCreated }) {
  const { home, away, matchLength, breakFormat, matchType, venue, date, isDemo, isVideoReview, videoReviewMatchId, savedScore } = matchConfig;
  const { homeColor: hc, awayColor: ac } = ensureContrastingColors(home.color, away.color);
  const teams = { home: { ...home, color: hc }, away: { ...away, color: ac } };
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
  const [endPenHome, setEndPenHome] = useState(null);
  const [endPenAway, setEndPenAway] = useState(null);
  const [pauseReason, setPauseReason] = useState(null);
  const [liveMatchId, setLiveMatchId] = useState(null); // Supabase match ID for live push
  const [matchViewers, setMatchViewers] = useState(0);
  const [showScoreMismatch, setShowScoreMismatch] = useState(null); // { recorded, saved }
  const [showVideoReviewEnd, setShowVideoReviewEnd] = useState(false);
  const [reclassifyToast, setReclassifyToast] = useState(null); // { type, options }
  const toastTimerRef = useRef(null);
  const lastEventSeqRef = useRef(0); // seq of last event for Supabase updates

  // Track viewers via presence
  useEffect(() => {
    if (!liveMatchId || isDemo || isVideoReview) { setMatchViewers(0); return; }
    const channel = supabase.channel(`match-viewers-${liveMatchId}`, { config: { presence: { key: 'commentator-' + Math.random().toString(36).slice(2) } } });
    channel.on('presence', { event: 'sync' }, () => {
      const count = Object.keys(channel.presenceState()).length;
      setMatchViewers(Math.max(0, count - 1)); // exclude self
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ role: 'commentator', ts: Date.now() });
    });
    return () => { supabase.removeChannel(channel); };
  }, [liveMatchId, isDemo]);
  const eventSeqRef = useRef(0);

  const topTeam = flipped ? "home" : "away";
  const bottomTeam = flipped ? "away" : "home";

  // Create live match in Supabase on mount (unless demo, video review, or existing match)
  useEffect(() => {
    if (isDemo) return;
    if (isVideoReview && videoReviewMatchId) {
      setLiveMatchId(videoReviewMatchId);
      return;
    }
    if (existingMatchId) {
      setLiveMatchId(existingMatchId);
      return;
    }
    createLiveMatch(matchConfig, currentUser?.id).then(result => {
      if (result) {
        setLiveMatchId(result.id);
        if (onMatchCreated) onMatchCreated(result.id);
        console.log('Live match created:', result.id);
      }
    }).catch(err => console.warn('Could not create live match:', err));
  }, []);

  // Auto-save
  const getState = useCallback(() => ({
    teams, events, matchTime: timer.matchTime, matchState: timer.matchState,
    possession, ballPos, prevBallPos, score, flipped, sidelineOut,
    matchLength, breakFormat, matchType, venue, date,
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
        if (ins) {
          const commentaryEntry = { id: Date.now() + 1, team: "commentary", event: "💬", zone: "", detail: ins, time: timer.matchTime };
          // Push commentary to Supabase too
          if (liveMatchId && !isDemo) {
            eventSeqRef.current += 1;
            pushLiveEvent(liveMatchId, commentaryEntry, eventSeqRef.current).catch(() => {});
          }
          return [commentaryEntry, entry, ...prev];
        }
      }
      return upd;
    });

    // Push event to Supabase
    if (liveMatchId && !isDemo) {
      eventSeqRef.current += 1;
      lastEventSeqRef.current = eventSeqRef.current;
      pushLiveEvent(liveMatchId, entry, eventSeqRef.current).catch(() => {});
    }
  }, [timer.matchTime, teams, liveMatchId, isDemo]);

  // Show reclassify toast (auto-dismiss after 3s)
  const showToast = (options) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setReclassifyToast(options);
    toastTimerRef.current = setTimeout(() => setReclassifyToast(null), 3000);
  };

  const dismissToast = () => {
    setReclassifyToast(null);
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
  };

  // Reclassify last event
  const reclassify = (newEvent) => {
    setEvents(prev => {
      // Find first non-commentary event
      const idx = prev.findIndex(e => e.team !== 'commentary' && e.team !== 'meta');
      if (idx < 0) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], event: newEvent };
      return updated;
    });
    // Update in Supabase
    if (liveMatchId && !isDemo && lastEventSeqRef.current > 0) {
      supabase.from('match_events')
        .update({ event: newEvent })
        .eq('match_id', liveMatchId)
        .eq('seq', lastEventSeqRef.current)
        .then(() => {})
        .catch(() => {});
    }
    dismissToast();
  };

  // Callback from FieldRecorder after ball movement
  const handleBallMoved = (eventType) => {
    // Overhead reclassify now handled by FieldRecorder's inline button
  };

  // Ball tap = swap possession (except in D → show popup)
  const handleBallTap = () => {
    if (!running || showRestart || !possession) return;
    if (ballPos?.type === "d") { setShowDPopup({ end: ballPos.end }); return; }
    const other = otherTeam(possession);
    addLog(other, "Turnover Won", ballPos?.zoneId ? "Centre" : "Centre", `${teamShortName(teams[other])} won possession`);
    setPossession(other);
  };

  // Backline action button (Green Card, Yellow Card, Short Corner, Penalty)
  const handleAction = (actionId, end) => {
    if (!running || !possession) return;
    const attackingTeam = end === "top" ? (flipped ? "away" : "home") : (flipped ? "home" : "away");
    const defendingTeam = otherTeam(attackingTeam);
    const zone = ballPos?.zoneId ? ZONES.find(z => z.id === ballPos.zoneId) : null;
    const zoneLbl = zone ? `${zone.label} (${ballPos.pos || "centre"})` : "Centre";

    if (actionId === "green_card") {
      addLog(defendingTeam, "Green Card", zoneLbl, `Green Card to ${teamShortName(teams[defendingTeam])} in ${zoneLbl}`);
    } else if (actionId === "yellow_card") {
      addLog(defendingTeam, "Yellow Card", zoneLbl, `Yellow Card to ${teamShortName(teams[defendingTeam])} in ${zoneLbl}`);
    } else if (actionId === "short_corner") {
      addLog(attackingTeam, "Short Corner", `${teamShortName(teams[defendingTeam])} D`, `${teamShortName(teams[attackingTeam])} awarded Short Corner in ${zoneLbl}`);
    } else if (actionId === "penalty") {
      // Move ball to centre in front of D, give to attacking team
      const penZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
      addLog(attackingTeam, "Penalty", `${teamShortName(teams[defendingTeam])} D`, `${teamShortName(teams[attackingTeam])} awarded Penalty at ${teamShortName(teams[defendingTeam])}'s D`);
      setPossession(attackingTeam);
      setPrevBallPos(ballPos);
      setBallPos({ zoneId: penZone, pos: "centre" });
    }
  };

  // D option
  const handleDOption = (opt) => {
    if (!showDPopup) return;
    const { end, lastShot } = showDPopup;
    const attackingTeam = end === "top" ? (flipped ? "away" : "home") : (flipped ? "home" : "away");
    const defendingTeam = otherTeam(attackingTeam);
    const dLabel = `${teamShortName(teams[defendingTeam])} D`;

    // Shot on/off: log event but keep popup open for follow-up
    if (opt.id === "shot_on" || opt.id === "shot_off") {
      addLog(attackingTeam, opt.label, dLabel, `${teamShortName(teams[attackingTeam])}: ${opt.label} in ${dLabel}`);
      setShowDPopup({ end, lastShot: opt });
      return;
    }

    if (opt.id === "goal") {
      const real = events.filter(e => e.team !== "commentary" && e.team !== "meta");
      const lastSC = real.find(e => e.event === "Short Corner" && e.team === attackingTeam);
      const btw = lastSC ? real.slice(0, real.indexOf(lastSC)) : [];
      const fromSC = lastSC && !btw.some(e => e.event === "Start" || e.event.startsWith("Goal!") || (e.event === "Turnover Won" && e.team === defendingTeam));
      // Only auto-log shot if no shot was already recorded in this D sequence
      if (!lastShot) {
        addLog(attackingTeam, "Shot on Goal", dLabel, `${teamShortName(teams[attackingTeam])} shot on goal`);
      }
      addLog(attackingTeam, fromSC ? "Goal! (SC)" : "Goal!", dLabel, fromSC ? `${teamShortName(teams[attackingTeam])} scored from short corner!` : `${teamShortName(teams[attackingTeam])} scored!`);
      setScore(prev => {
        const newScore = { ...prev, [attackingTeam]: prev[attackingTeam] + 1 };
        if (liveMatchId && !isDemo && !isVideoReview) updateLiveScore(liveMatchId, newScore.home, newScore.away).catch(() => {});
        return newScore;
      });
      setPossession(null); setBallPos(null); setPrevBallPos(null); setShowRestart(true);
    } else if (opt.id === "lost_poss") {
      addLog(attackingTeam, "Poss Conceded", dLabel, `${teamShortName(teams[attackingTeam])} lost possession in ${dLabel}`);
      setPossession(defendingTeam);
    } else if (opt.id === "short_corner") {
      addLog(attackingTeam, "Short Corner", dLabel, `${teamShortName(teams[attackingTeam])}: Short Corner in ${dLabel}`);
      setPrevBallPos(ballPos); setBallPos({ type: "sc", end });
    } else if (opt.id === "dead_ball") {
      addLog(defendingTeam, "Dead Ball", dLabel, `Dead ball in ${dLabel} — ${teamShortName(teams[defendingTeam])} ball`);
      setPossession(defendingTeam);
      const outsideZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
      setPrevBallPos(ballPos);
      setBallPos({ zoneId: outsideZone, pos: "centre" });
    } else if (opt.id === "penalty") {
      addLog(attackingTeam, "Penalty", dLabel, `${teamShortName(teams[attackingTeam])}: Penalty in ${dLabel}`);
      setPossession(attackingTeam);
      const outsideZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
      setPrevBallPos(ballPos);
      setBallPos({ zoneId: outsideZone, pos: "centre" });
    } else if (opt.id === "long_corner") {
      addLog(attackingTeam, "Long Corner", dLabel, `${teamShortName(teams[attackingTeam])}: Long Corner at ${dLabel}`);
      setPossession(attackingTeam);
      const outsideZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
      setPrevBallPos(ballPos);
      setBallPos({ zoneId: outsideZone, pos: "centre" });
    } else {
      addLog(attackingTeam, opt.label, dLabel, `${teamShortName(teams[attackingTeam])}: ${opt.label} in ${dLabel}`);
    }
    setShowDPopup(null);
  };

  // Restart from centre
  const handleRestart = (team) => {
    setSidelineOut(null);
    addLog(team, "Start", "Centre", `${teamShortName(teams[team])} takes centre pass`);
    setPossession(team); setPrevBallPos(null);
    setBallPos({ type: "centre", team }); setShowRestart(false); setShowTeamPicker(false);
    if (!running) timer.start();
  };

  // Pause
  const handlePause = (reason) => {
    timer.pause();
    setShowPauseReason(false);
    setPauseReason(reason);
    const entry = { id: Date.now(), team: "meta", event: `Pause: ${reason}`, zone: null, detail: reason, time: timer.matchTime };
    setEvents(prev => [entry, ...prev]);
    // Push to Supabase
    if (liveMatchId && !isDemo) {
      eventSeqRef.current += 1;
      pushLiveEvent(liveMatchId, entry, eventSeqRef.current).catch(() => {});
    }
    if (reason === "Quarter Break" || reason === "Half Time") {
      setBallPos(null); setPrevBallPos(null); setShowRestart(true); setPossession(null);
    }
  };

  // Resume
  const handleResume = () => {
    const entry = { id: Date.now(), team: "meta", event: "Resume", zone: null, detail: `Play resumes${pauseReason ? ` after ${pauseReason}` : ""}`, time: timer.matchTime };
    setEvents(prev => [entry, ...prev]);
    if (liveMatchId && !isDemo) {
      eventSeqRef.current += 1;
      pushLiveEvent(liveMatchId, entry, eventSeqRef.current).catch(() => {});
    }
    if (pauseReason === "Quarter Break" || pauseReason === "Half Time") {
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

    // Video review: check score mismatch, then finalize
    if (isVideoReview && videoReviewMatchId) {
      if (savedScore && (score.home !== savedScore.home || score.away !== savedScore.away)) {
        setShowScoreMismatch({ recorded: { ...score }, saved: { ...savedScore } });
        return;
      }
      finalizeVideoReview();
      return;
    }

    const game = {
      id: liveMatchId || Date.now().toString(),
      supabase_id: liveMatchId || null,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      teams, events, duration: timer.matchTime,
      matchLength, breakFormat, matchType, venue,
      homeScore: score.home, awayScore: score.away,
    };
    if (liveMatchId) {
      const penOpts = (score.home === score.away && endPenHome != null && endPenAway != null)
        ? { homePenalty: endPenHome, awayPenalty: endPenAway } : {};
      endLiveMatch(liveMatchId, score.home, score.away, timer.matchTime, penOpts).catch(() => {});
    }
    const saved = onSaveGame(game);
    setLastSavedGame(saved || game);
  };

  const handleAbandon = () => {
    setShowEndConfirm(false);
    timer.end();
    clearAutoSave();
    if (liveMatchId) {
      endLiveMatch(liveMatchId, score.home, score.away, timer.matchTime, { abandoned: true }).catch(() => {});
    }
    const game = {
      id: liveMatchId || Date.now().toString(),
      supabase_id: liveMatchId || null,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      teams, events, duration: timer.matchTime,
      matchLength, breakFormat, matchType, venue,
      homeScore: score.home, awayScore: score.away,
    };
    const saved = onSaveGame(game);
    setLastSavedGame(saved || game);
  };

  const finalizeVideoReview = async (updateScore = false) => {
    setShowScoreMismatch(null);
    if (updateScore && videoReviewMatchId) {
      await supabase.from('matches').update({ home_score: score.home, away_score: score.away }).eq('id', videoReviewMatchId);
    }
    await endVideoReview(videoReviewMatchId, score.home, score.away, timer.matchTime);
    setShowVideoReviewEnd(true);
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
        matchTime={matchTime} matchState={matchState} running={running} matchId={isDemo ? null : liveMatchId} />

      {/* Viewer count */}
      {matchViewers > 0 && (
        <div style={{ textAlign: "center", padding: "2px 0 4px" }}>
          <span style={{ fontSize: 10, color: "#10B981", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            👁 {matchViewers} watching
          </span>
        </div>
      )}

      {/* Possession + Flip */}
      <div style={{ padding: "0 14px 4px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        {pauseReason ? (
          <div style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B", background: "#F59E0B22", padding: "4px 16px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6 }}>
            ⏸ {pauseReason}
          </div>
        ) : possession ? (
          <div style={{ fontSize: 9, fontWeight: 700, color: teamColor(teams[possession]), background: teamColor(teams[possession]) + "22", padding: "2px 10px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: teamColor(teams[possession]) }} />
            {teamShortName(teams[possession])}
          </div>
        ) : (
          <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDimmer, padding: "2px 10px" }}>
            {matchState === "ended" ? "MATCH ENDED" : "TAP BALL TO START"}
          </div>
        )}
        {matchState !== "ended" && (
          <button onClick={() => {
            setFlipped(f => !f);
            const mirrorPos = (p) => p === "left" ? "right" : p === "right" ? "left" : p;
            const mirrorEnd = (e) => e === "top" ? "bottom" : e === "bottom" ? "top" : e;
            setBallPos(bp => {
              if (!bp) return bp;
              const updated = { ...bp };
              if (updated.pos) updated.pos = mirrorPos(updated.pos);
              if (updated.end) updated.end = mirrorEnd(updated.end);
              return updated;
            });
            setPrevBallPos(bp => {
              if (!bp) return bp;
              const updated = { ...bp };
              if (updated.pos) updated.pos = mirrorPos(updated.pos);
              if (updated.end) updated.end = mirrorEnd(updated.end);
              return updated;
            });
          }} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textMuted, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>🔄</button>
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
          onBallMoved={handleBallMoved}
          onShowDPopup={setShowDPopup} showDPopup={showDPopup}
          onShowTeamPicker={setShowTeamPicker}
          onBallTap={handleBallTap}
          onOverhead={() => reclassify('Overhead throw')}
          onAction={handleAction}
        />
      )}

      {/* D Popup */}
      {showDPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowDPopup(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 12, padding: 16, width: 280, border: `1px solid ${showDPopup.lastShot ? showDPopup.lastShot.color + '66' : theme.border}` }}>
            {showDPopup.lastShot ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, color: showDPopup.lastShot.color, marginBottom: 2, textAlign: "center" }}>
                  After {showDPopup.lastShot.label} — what next?
                </div>
                <div style={{ fontSize: 9, color: "#475569", marginBottom: 10, textAlign: "center" }}>
                  {showDPopup.lastShot.icon} {showDPopup.lastShot.label} logged · tap what happened next
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 800, color: theme.text, marginBottom: 10, textAlign: "center" }}>In the D — What happened?</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { id: "goal", label: "Goal!", icon: "⚽", color: "#F59E0B" },
                { id: "short_corner", label: "Short Corner", icon: "🔲", color: "#8B5CF6" },
                { id: "shot_on", label: "Shot on Goal", icon: "◉", color: "#10B981" },
                { id: "shot_off", label: "Shot Off Target", icon: "○", color: "#6B7280" },
                { id: "penalty", label: "Penalty", icon: "🟡", color: "#F59E0B" },
                { id: "long_corner", label: "Long Corner", icon: "📐", color: "#3B82F6" },
                { id: "lost_poss", label: "Lost Possession", icon: "✕", color: "#EF4444" },
                { id: "dead_ball", label: "Dead Ball", icon: "⊘", color: "#94A3B8" },
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
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{isDemo ? "End Demo?" : isVideoReview ? "End Video Review?" : "End Match?"}</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 4 }}>{teamShortName(teams.home)} {score.home} – {score.away} {teamShortName(teams.away)}</div>
            <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 12 }}>{events.filter(e => e.team !== "commentary" && e.team !== "meta").length} events{isDemo ? " (will not be saved)" : ""}</div>
            {/* Penalty option when tied */}
            {!isDemo && !isVideoReview && score.home === score.away && (
              <div style={{ marginBottom: 12 }}>
                <div onClick={() => { if (endPenHome == null) { setEndPenHome(0); setEndPenAway(0); } else { setEndPenHome(null); setEndPenAway(null); } }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', padding: '4px 0' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid #F59E0B44', background: endPenHome != null ? '#F59E0B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {endPenHome != null && <span style={{ color: '#0B0F1A', fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600 }}>Decided by penalties</span>
                </div>
                {endPenHome != null && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => setEndPenHome(Math.max(0, (endPenHome || 0) - 1))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bg, color: '#F8FAFC', fontSize: 14, cursor: 'pointer' }}>–</button>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B', width: 20, textAlign: 'center' }}>{endPenHome}</div>
                      <button onClick={() => setEndPenHome((endPenHome || 0) + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #F59E0B44', background: '#F59E0B22', color: '#F59E0B', fontSize: 14, cursor: 'pointer' }}>+</button>
                    </div>
                    <span style={{ fontSize: 9, color: '#475569' }}>pen</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => setEndPenAway(Math.max(0, (endPenAway || 0) - 1))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bg, color: '#F8FAFC', fontSize: 14, cursor: 'pointer' }}>–</button>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B', width: 20, textAlign: 'center' }}>{endPenAway}</div>
                      <button onClick={() => setEndPenAway((endPenAway || 0) + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #F59E0B44', background: '#F59E0B22', color: '#F59E0B', fontSize: 14, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowEndConfirm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleEndMatch} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #EF444466", background: "#EF444422", color: theme.danger, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{isDemo ? "End & Discard" : isVideoReview ? "End & Save Stats" : "End & Save"}</button>
            </div>
            {!isDemo && !isVideoReview && (
              <button onClick={handleAbandon} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #64748B44', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>Abandon Match</button>
            )}
          </div>
        </div>
      )}

      {/* Score Mismatch Warning (Video Review) */}
      {showScoreMismatch && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 16, padding: "20px 16px", width: 300, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B", marginBottom: 8 }}>Score mismatch</div>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 12 }}>
              Your recorded score differs from the saved score.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 14 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>RECORDED</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{showScoreMismatch.recorded.home}–{showScoreMismatch.recorded.away}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>SAVED</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#F8FAFC" }}>{showScoreMismatch.saved.home}–{showScoreMismatch.saved.away}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => finalizeVideoReview(false)} style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Keep saved score ({showScoreMismatch.saved.home}–{showScoreMismatch.saved.away})</button>
              <button onClick={() => finalizeVideoReview(true)} style={{ padding: 10, borderRadius: 8, border: "1px solid #F59E0B44", background: "#F59E0B22", color: "#F59E0B", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Update to recorded score ({showScoreMismatch.recorded.home}–{showScoreMismatch.recorded.away})</button>
              <button onClick={() => { setShowScoreMismatch(null); timer.resume(); }} style={{ padding: 8, borderRadius: 8, background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>Cancel — continue recording</button>
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
            {isVideoReview && <button onClick={async () => {
              if (!confirm('Cancel video review? All recorded events will be discarded.')) return;
              timer.end();
              clearAutoSave();
              if (videoReviewMatchId) {
                await supabase.from('match_events').delete().eq('match_id', videoReviewMatchId);
                await supabase.from('matches').update({ locked_by: null, stats_archived: false }).eq('id', videoReviewMatchId);
                await supabase.from('match_stats').delete().eq('match_id', videoReviewMatchId);
              }
              onNavigate("home");
            }} style={{ ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}` }}>✕ Cancel</button>}
          </>
        ) : showDemoEnd ? (
          <>
            <button onClick={() => onNavigate("home")} style={S.btnSm(theme.success, "#FFF")}>✓ Discard & Home</button>
          </>
        ) : showVideoReviewEnd ? (
          <>
            <button onClick={() => onNavigate("home")} style={S.btnSm(theme.success, "#FFF")}>✓ Stats saved — Home</button>
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
          match={{ teams, breakFormat, matchLength, homeScore: score.home, awayScore: score.away, status: matchState === "ended" ? "ended" : "live" }}
          events={events}
          matchTime={matchTime}
          running={running}
        />
      )}
      {liveTab === "share" && (
        <div style={{ padding: "16px 14px" }}>
          <div style={{ background: theme.surface, borderRadius: 12, padding: 16, border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>📺 Share Live Match</div>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 14, textAlign: "center" }}>
              Share these links with spectators. They'll see the live score and commentary.
            </div>

            {[teams.home, teams.away].map(t => {
              const slug = teamSlug(t);
              const url = `${window.location.origin}${window.location.pathname}#/team/${slug}`;
              return (
                <div key={teamDisplayName(t)} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: teamColor(t), marginBottom: 4 }}>📺 {teamDisplayName(t)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{
                      flex: 1, padding: "8px 10px", borderRadius: 8, background: "#0F172A",
                      border: `1px solid ${theme.border}`, fontSize: 10, color: theme.textMuted,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{url}</div>
                    <button onClick={() => {
                      navigator.clipboard?.writeText(url).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", url));
                    }} style={{
                      padding: "8px 14px", borderRadius: 8, background: t.color + "22",
                      border: `1px solid ${t.color}44`, color: teamColor(t),
                      fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}>📋 Copy</button>
                    <button onClick={() => window.open(url, '_blank')} style={{
                      padding: "8px 10px", borderRadius: 8, background: "#10B98122",
                      border: "1px solid #10B98144", color: "#10B981",
                      fontSize: 11, fontWeight: 700, cursor: "pointer",
                    }}>↗</button>
                  </div>
                </div>
              );
            })}

            {/* Commentator link — home team */}
            <div style={{ marginTop: 6, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>🎙 Commentator Link</div>
              {(() => {
                const slug = teamSlug(teams.home);
                const url = `${window.location.origin}${window.location.pathname}#/record/${slug}`;
                return (
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{
                      flex: 1, padding: "8px 10px", borderRadius: 8, background: "#0F172A",
                      border: `1px solid ${theme.border}`, fontSize: 10, color: theme.textMuted,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{url}</div>
                    <button onClick={() => {
                      navigator.clipboard?.writeText(url).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", url));
                    }} style={{
                      padding: "8px 14px", borderRadius: 8, background: "#F59E0B22",
                      border: "1px solid #F59E0B44", color: "#F59E0B",
                      fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}>📋 Copy</button>
                  </div>
                );
              })()}
            </div>

            <div style={{ fontSize: 9, color: theme.textDim, textAlign: "center", marginTop: 8 }}>
              Spectators see score + commentary only. Coaches can enter their team PIN for full stats.
            </div>
          </div>
        </div>
      )}

      {/* Reclassify toast */}
      {reclassifyToast && (
        <div style={{
          position: "fixed", bottom: possession ? 48 : 10, left: "50%", transform: "translateX(-50%)",
          zIndex: 35, display: "flex", alignItems: "center", gap: 6,
          background: "#0F172Aee", padding: "6px 10px", borderRadius: 10,
          border: "1px solid #33415566", backdropFilter: "blur(8px)",
          animation: "toast-in 0.2s ease-out",
        }}>
          {reclassifyToast.buttons.map(b => (
            <button key={b.event} onClick={() => reclassify(b.event)} style={{
              padding: "5px 12px", borderRadius: 6, border: `1px solid ${b.color}44`,
              background: `${b.color}22`, color: b.color, fontSize: 10, fontWeight: 700,
              cursor: "pointer",
            }}>{b.label}</button>
          ))}
          <button onClick={dismissToast} style={{
            background: "none", border: "none", color: "#475569", fontSize: 10, cursor: "pointer", padding: "4px",
          }}>✕</button>
          <div style={{
            position: "absolute", bottom: 0, left: 0, height: 2, borderRadius: "0 0 10px 10px",
            background: reclassifyToast.buttons[0]?.color || "#F59E0B",
            animation: "toast-timer 3s linear forwards",
          }} />
        </div>
      )}
      <style>{`
        @keyframes toast-in { from { transform: translateX(-50%) translateY(10px); opacity: 0; } to { transform: translateX(-50%); opacity: 1; } }
        @keyframes toast-timer { from { width: 100%; } to { width: 0%; } }
      `}</style>

      {/* Fixed possession indicator */}
      {possession && (
        <div style={{ position: "fixed", bottom: 10, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", alignItems: "center", gap: 8, background: "#0F172Aee", padding: "6px 16px", borderRadius: 99, border: `1px solid ${teamColor(teams[possession])}44` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: teamColor(teams[possession]) }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{teamShortName(teams[possession])}</span>
        </div>
      )}
    </div>
  );
}

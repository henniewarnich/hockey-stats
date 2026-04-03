import { useState, useRef, useCallback, useEffect } from 'react';
import { teamShortName, teamDerivedName, teamColor } from '../utils/teams.js';

// Zones: top=opp attack, bottom=own defense (when flipped=false)
const ZONES = [
  { id: "z1", label: "Opp Quarter", side: "attack" },
  { id: "z2", label: "Opp Midfield", side: "opp_mid" },
  { id: "z3", label: "Own Midfield", side: "own_mid" },
  { id: "z4", label: "Own Quarter", side: "defense" },
];

const D_OPTIONS = [
  { id: "goal", label: "Goal!", icon: "⚽", color: "#F59E0B" },
  { id: "short_corner", label: "Short Corner", icon: "🔲", color: "#8B5CF6" },
  { id: "shot_on", label: "Shot on Goal", icon: "◉", color: "#10B981" },
  { id: "shot_off", label: "Shot Off Target", icon: "○", color: "#6B7280" },
  { id: "penalty", label: "Penalty", icon: "🟡", color: "#F59E0B" },
  { id: "long_corner", label: "Long Corner", icon: "📐", color: "#3B82F6" },
  { id: "lost_poss", label: "Lost Possession", icon: "✕", color: "#EF4444" },
  { id: "dead_ball", label: "Dead Ball", icon: "⊘", color: "#94A3B8" },
];

const grassA = "#2D8B4E", grassB = "#258043";

const ACTION_OPTIONS = [
  { id: "green_card", label: "Green Card", icon: "🟢", color: "#22C55E" },
  { id: "yellow_card", label: "Yellow Card", icon: "🟡", color: "#F59E0B" },
  { id: "short_corner", label: "Short Corner", icon: "🔲", color: "#8B5CF6" },
  { id: "penalty", label: "Penalty", icon: "⚠️", color: "#EF4444" },
];

export default function FieldRecorder({
  teams,         // { home: { name, color, short }, away: { ... } }
  possession, setPossession,
  ballPos, setBallPos,
  prevBallPos, setPrevBallPos,
  running, matchState,
  showRestart, setShowRestart,
  flipped,
  sidelineOut, setSidelineOut,
  score, setScore,
  onAddLog,
  onBallMoved, // callback after ball movement (zone tap)
  onShowDPopup, showDPopup, onDOptionSelect, onCloseDPopup,
  onShowTeamPicker,
  onBallTap,
  onOverheadDrag, // callback: (fromZoneId, fromPos, toZoneId, toPos) => void
  onAction, // callback: (actionType, end) => void
}) {
  const [flash, setFlash] = useState(null);
  const [actionPopup, setActionPopup] = useState(null); // 'top' | 'bottom' | null
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState(null); // { x, y } relative to field
  const [dragTarget, setDragTarget] = useState(null); // { zoneId, pos } zone under finger
  const fieldRef = useRef(null);
  const dragStartRef = useRef(null); // { clientX, clientY }
  const dragMovedRef = useRef(false);
  const DRAG_THRESHOLD = 12;

  // Drag handlers for overhead throw
  const onBallDragStart = (clientX, clientY, e) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartRef.current = { clientX, clientY };
    dragMovedRef.current = false;
    setDragging(true);
    setDragPos(null);
    setDragTarget(null);
  };

  const getZoneAtPoint = (clientX, clientY) => {
    const els = document.elementsFromPoint(clientX, clientY);
    for (const el of els) {
      if (el.dataset?.zone && el.dataset?.pos) return { zoneId: el.dataset.zone, pos: el.dataset.pos };
    }
    return null;
  };

  const onBallDragMove = useCallback((clientX, clientY) => {
    if (!dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.clientX;
    const dy = clientY - dragStartRef.current.clientY;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      dragMovedRef.current = true;
      const fr = fieldRef.current?.getBoundingClientRect();
      if (fr) {
        setDragPos({ x: clientX - fr.left, y: clientY - fr.top });
        const target = getZoneAtPoint(clientX, clientY);
        setDragTarget(target && !(target.zoneId === ballPos?.zoneId && target.pos === ballPos?.pos) ? target : null);
      }
    }
  }, [ballPos]);

  const onBallDragEnd = useCallback((clientX, clientY) => {
    if (!dragStartRef.current) return;
    const wasDrag = dragMovedRef.current;
    dragStartRef.current = null;
    setDragging(false);
    setDragPos(null);
    setDragTarget(null);

    if (!wasDrag) {
      // No drag — treat as ball tap (swap possession)
      onBallTap?.();
      return;
    }
    // Drag ended — find target zone
    const target = getZoneAtPoint(clientX, clientY);
    if (target && !(target.zoneId === ballPos?.zoneId && target.pos === ballPos?.pos)) {
      onOverheadDrag?.(ballPos?.zoneId, ballPos?.pos, target.zoneId, target.pos);
    }
  }, [ballPos, onBallTap, onOverheadDrag]);

  // Global move/end listeners for drag
  useEffect(() => {
    const handleTouchMove = (e) => { if (dragStartRef.current) { const t = e.touches[0]; onBallDragMove(t.clientX, t.clientY); e.preventDefault(); } };
    const handleTouchEnd = (e) => { if (dragStartRef.current) { const t = e.changedTouches[0]; onBallDragEnd(t.clientX, t.clientY); } };
    const handleMouseMove = (e) => { if (dragStartRef.current) onBallDragMove(e.clientX, e.clientY); };
    const handleMouseUp = (e) => { if (dragStartRef.current) onBallDragEnd(e.clientX, e.clientY); };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onBallDragMove, onBallDragEnd]);

  const dismissActionPopup = () => setActionPopup(null);
  const handleActionSelect = (actionType, end) => {
    dismissActionPopup();
    onAction?.(actionType, end);
  };

  const doFlash = (id) => { setFlash(id); setTimeout(() => setFlash(null), 200); };
  const moveBall = (np) => { setPrevBallPos(ballPos); setBallPos(np); };

  const zones = flipped ? [...ZONES].reverse() : ZONES;
  const topTeam = flipped ? "away" : "home";
  const botTeam = flipped ? "home" : "away";
  const otherTeam = (t) => t === "home" ? "away" : "home";
  // Direction of play: home attacks toward z1 (top when !flipped)
  const dirArrowUp = possession ? (possession === "home" ? !flipped : flipped) : true;

  // Ghost ball check
  const isGhostAt = (type, zoneId, pos) => {
    if (!prevBallPos) return false;
    if (type === "centre") return prevBallPos.type === "centre";
    if (type === "zone") return prevBallPos.zoneId === zoneId && prevBallPos.pos === pos;
    if (type === "d") return prevBallPos.type === "d" && prevBallPos.end === pos;
    if (type === "sc") return prevBallPos.type === "sc" && prevBallPos.end === pos;
    return false;
  };

  // Ball with halo
  const makeBall = (isGhost) => {
    const possColor = possession ? teams[possession].color : "#94A3B8";
    if (isGhost) {
      return <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#94A3B8", border: "2px solid #64748B", opacity: 0.4 }} />;
    }
    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "absolute", width: 60, height: 60, borderRadius: "50%",
          background: `${possColor}55`, boxShadow: `0 0 20px ${possColor}99, 0 0 40px ${possColor}66`,
          animation: "halo-pulse 1.8s ease-in-out infinite",
        }} />
        <div style={{
          width: 24, height: 24, borderRadius: "50%", background: "#F8FAFC",
          border: `3px solid ${possColor}`, boxShadow: `0 0 8px ${possColor}88`, zIndex: 2,
        }} />
      </div>
    );
  };

  // Zone tap — if ball already here, swap possession (turnover). Otherwise move ball.
  const handleZoneTap = (zoneId, pos) => {
    if (!running || showRestart || !possession) return;
    dismissActionPopup();
    if (sidelineOut) setSidelineOut(null);

    // Tap where ball already is → turnover
    if (ballPos?.zoneId === zoneId && ballPos?.pos === pos) {
      const other = otherTeam(possession);
      const zone = ZONES.find(z => z.id === zoneId);
      onAddLog(possession, "Poss Conceded", `${zone.label} (${pos})`, `${teamShortName(teams[possession])} lost to ${teamShortName(teams[other])} in ${zone.label}`);
      setPossession(other);
      return;
    }

    const zone = ZONES.find(z => z.id === zoneId);
    const fromZone = ballPos?.zoneId ? ZONES.find(z => z.id === ballPos.zoneId) : null;
    const fromIdx = fromZone ? ZONES.indexOf(fromZone) : -1;
    const toIdx = ZONES.indexOf(zone);
    let event = "Ball in play";
    if (fromIdx >= 0) {
      if (toIdx < fromIdx) event = "Ball forward";
      else if (toIdx > fromIdx) event = "Ball back";
      else event = "Ball across";
    }
    doFlash(`${zoneId}-${pos}`);
    onAddLog(possession, event, `${zone.label} (${pos})`, `${teamShortName(teams[possession])}: ${event} → ${zone.label} (${pos})`);
    if (onBallMoved) onBallMoved(event);
    moveBall({ zoneId, pos });
  };

  // D tap
  const handleDTap = (end) => {
    if (!running || showRestart || !possession) return;
    dismissActionPopup();
    if (sidelineOut) setSidelineOut(null);
    const attackingTeam = end === "top" ? (flipped ? "away" : "home") : (flipped ? "home" : "away");
    const defendingTeam = otherTeam(attackingTeam);
    if (ballPos?.type === "d" && ballPos?.end === end) {
      onShowDPopup({ end }); return;
    }
    onAddLog(attackingTeam, "D Entry", `${teamShortName(teams[defendingTeam])} D`, `${teamShortName(teams[attackingTeam])} entered ${teamShortName(teams[defendingTeam])}'s D`);
    moveBall({ type: "d", end });
    onShowDPopup({ end });
  };

  // Dead ball on backline
  const handleDead = (end, side) => {
    if (!running || showRestart || !possession) return;
    dismissActionPopup();
    if (sidelineOut) setSidelineOut(null);
    const defendingTeam = end === "top" ? (flipped ? "home" : "away") : (flipped ? "away" : "home");
    onAddLog(possession, "Ball Dead", `Backline ${side}`, `Ball over ${teamShortName(teams[defendingTeam])}'s backline (${side}). ${teamShortName(teams[defendingTeam])} restart.`);
    setPossession(defendingTeam);
    const defZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
    moveBall({ zoneId: defZone, pos: side, nearLine: true });
  };

  // Long corner
  const handleLongCorner = (end, side) => {
    if (!running || showRestart || !possession) return;
    dismissActionPopup();
    if (sidelineOut) setSidelineOut(null);
    const attackingTeam = end === "top" ? (flipped ? "away" : "home") : (flipped ? "home" : "away");
    const defendingTeam = otherTeam(attackingTeam);
    onAddLog(possession, "Ball Dead (backline)", `${teamShortName(teams[defendingTeam])} Backline (${side})`, `${teamShortName(teams[possession])} put ball over ${teamShortName(teams[defendingTeam])}'s backline (${side})`);
    onAddLog(defendingTeam, "Poss Conceded (LC)", `${teamShortName(teams[defendingTeam])} Qtr (${side})`, `${teamShortName(teams[defendingTeam])} concedes long corner on ${side}`);
    onAddLog(attackingTeam, "Long Corner", `${teamShortName(teams[defendingTeam])} Qtr (${side})`, `${teamShortName(teams[attackingTeam])} wins long corner on ${side}`);
    const atkZone = end === "top" ? (flipped ? "z4" : "z1") : (flipped ? "z1" : "z4");
    setPossession(attackingTeam);
    moveBall({ zoneId: atkZone, pos: side, nearLine: true });
  };

  // Sideline out with reversal
  const handleSidelineOut = (side, zoneId) => {
    if (!running || showRestart || !possession) return;
    dismissActionPopup();
    const zone = ZONES.find(z => z.id === zoneId);
    if (sidelineOut && sidelineOut.side === side && sidelineOut.zoneId === zoneId && sidelineOut.canReverse) {
      const newTeamOut = otherTeam(sidelineOut.team);
      const newTeamGets = sidelineOut.team;
      onAddLog(newTeamOut, `Sideline Out (Reversed)`, zone.label, `Reversed — ${teamShortName(teams[newTeamOut])} put ball out. ${teamShortName(teams[newTeamGets])} free hit.`);
      setPossession(newTeamGets);
      moveBall({ zoneId, pos: side === "left" ? "left" : "right" });
      setSidelineOut({ side, zoneId, team: newTeamOut, canReverse: false });
      return;
    }
    const teamOut = possession;
    const teamGets = otherTeam(possession);
    onAddLog(teamOut, `Sideline Out (${side})`, zone.label, `${teamShortName(teams[teamOut])} out on ${side} in ${zone.label}. ${teamShortName(teams[teamGets])} free hit.`);
    setPossession(teamGets);
    moveBall({ zoneId, pos: side === "left" ? "left" : "right" });
    setSidelineOut({ side, zoneId, team: teamOut, canReverse: true });
  };

  const getOutStripBg = (side, zoneId) => {
    if (sidelineOut && sidelineOut.side === side && sidelineOut.zoneId === zoneId) return teams[sidelineOut.team].color;
    return "#334155";
  };

  // Ghost line coords
  const getBallCoords = (bp) => {
    if (!bp || !fieldRef.current) return null;
    const fw = fieldRef.current.offsetWidth;
    const greenW = fw - 56;
    const xMap = { left: 28 + greenW / 6, centre: 28 + greenW / 2, right: 28 + 5 * greenW / 6 };
    if (bp.type === "centre") return { x: fw / 2, y: 174 };
    if (bp.type === "d") return { x: fw / 2, y: bp.end === "top" ? 42 : 318 };
    if (bp.type === "sc") return { x: bp.end === "top" ? fw / 2 - 70 : fw / 2 + 70, y: bp.end === "top" ? 30 : 330 };
    if (bp.zoneId) {
      const ri = zones.findIndex(z => z.id === bp.zoneId);
      if (ri < 0) return null;
      let y = ri < 2 ? 30 + ri * 72 + 36 : 30 + ri * 72 + 1 + 36;
      // nearLine: shift ball toward zone boundary closest to midfield
      if (bp.nearLine) {
        if (ri === 0) y = 30 + 72 - 6;       // top quarter → near z1/z2 line
        else if (ri === 3) y = 30 + 3*72 + 7; // bottom quarter → near z3/z4 line
        else if (ri === 1) y = 30 + 72 - 6;   // opp mid → near z1/z2 line
        else if (ri === 2) y = 30 + 3*72 + 7;  // own mid → near z3/z4 line
      }
      return { x: xMap[bp.pos] || xMap.centre, y };
    }
    return null;
  };

  const ghostCoords = getBallCoords(prevBallPos);
  const ballCoords = getBallCoords(ballPos);

  if (matchState === "ended") return null;

  // Render backline (top or bottom)
  const renderBackline = (end) => {
    const defendingTeam = end === "top" ? (flipped ? "home" : "away") : (flipped ? "away" : "home");
    const dColor = teams[defendingTeam].color;
    return (
      <div style={{ display: "flex", height: 30, background: "#1a3a2a" }}>
        <div onClick={() => handleDead(end, "left")} style={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#162D22", borderRight: "1px solid #0f1f18" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Dead</span>
        </div>
        <div onClick={() => handleLongCorner(end, "left")} style={{ width: 50, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#1E3A2F", borderRight: "1px solid #0f1f18" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>◁ LC</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#1a3a2a", position: "relative" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: dColor, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1 }}>{teamShortName(teams[defendingTeam])}</span>
          <span style={{ fontSize: 6, fontWeight: 600, color: "#64748B", textTransform: "uppercase", lineHeight: 1, marginTop: 1 }}>{teamDerivedName(teams[defendingTeam])}</span>
          {running && !showRestart && (
            <div onClick={(e) => { e.stopPropagation(); setActionPopup(actionPopup === end ? null : end); }}
              style={{
                position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${dColor}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 10, fontWeight: 800, color: dColor, zIndex: 18,
              }}>⚡</div>
          )}
          {ballPos?.type === "sc" && ballPos?.end === end && !showRestart && (
            <div style={{
              position: "absolute",
              left: end === "top" ? "calc(50% - 70px)" : "calc(50% + 70px)",
              [end === "top" ? "bottom" : "top"]: -11,
              transform: "translateX(-50%)", zIndex: 16,
            }}>{makeBall(false)}</div>
          )}
          {isGhostAt("sc", null, end) && (
            <div style={{
              position: "absolute",
              left: end === "top" ? "calc(50% - 70px)" : "calc(50% + 70px)",
              [end === "top" ? "bottom" : "top"]: -11,
              transform: "translateX(-50%)", zIndex: 7,
            }}>{makeBall(true)}</div>
          )}
        </div>
        <div onClick={() => handleLongCorner(end, "right")} style={{ width: 50, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#1E3A2F", borderLeft: "1px solid #0f1f18" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>LC ▷</span>
        </div>
        <div onClick={() => handleDead(end, "right")} style={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#162D22", borderLeft: "1px solid #0f1f18" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Dead</span>
        </div>
      </div>
    );
  };

  // Render D arc overlay
  const renderDArc = (end) => {
    const defendingTeam = end === "top" ? (flipped ? "home" : "away") : (flipped ? "away" : "home");
    const dColor = teams[defendingTeam].color;
    const isTop = end === "top";
    const hasBall = ballPos?.type === "d" && ballPos?.end === end;
    const hasGhost = isGhostAt("d", null, end);

    return (
      <div onClick={() => handleDTap(end)} style={{
        position: "absolute", [isTop ? "top" : "bottom"]: 30, left: "50%", transform: "translateX(-50%)",
        width: 80, height: 24, zIndex: 15, cursor: running && !showRestart ? "pointer" : "default",
      }}>
        <div style={{
          width: 80, height: 24,
          [isTop ? "borderBottomLeftRadius" : "borderTopLeftRadius"]: 40,
          [isTop ? "borderBottomRightRadius" : "borderTopRightRadius"]: 40,
          border: `3px solid ${dColor}`,
          [isTop ? "borderTop" : "borderBottom"]: "none",
          background: hasBall ? `${dColor}88` : `${dColor}55`,
        }} />
        {hasBall && !showRestart && (
          <div onClick={(e) => { e.stopPropagation(); onBallTap?.(); }} style={{
            position: "absolute", left: "50%", [isTop ? "bottom" : "top"]: 2, transform: "translateX(-50%)", zIndex: 16, cursor: "pointer",
          }}>{makeBall(false)}</div>
        )}
        {hasGhost && (
          <div style={{ position: "absolute", left: "50%", [isTop ? "bottom" : "top"]: 2, transform: "translateX(-50%)", zIndex: 7 }}>{makeBall(true)}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "0 6px" }}>
      <div ref={fieldRef} style={{ borderRadius: 10, overflow: "hidden", border: "2px solid #1a5c32", position: "relative", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}>

        {/* Pause overlay */}
        {matchState === "paused" && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)",
          }}>
            <div style={{
              fontSize: 16, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em",
              background: "rgba(15,23,42,0.85)", padding: "8px 24px", borderRadius: 10, border: "1px solid #F59E0B44",
            }}>⏸ Paused</div>
          </div>
        )}

        {/* Ghost trail line */}
        {ghostCoords && ballCoords && prevBallPos && ballPos && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 6, pointerEvents: "none" }}>
            <line x1={ghostCoords.x} y1={ghostCoords.y} x2={ballCoords.x} y2={ballCoords.y}
              stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          </svg>
        )}

        {/* Drag overhead trail */}
        {dragging && dragPos && ballCoords && (
          <>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 15, pointerEvents: "none" }}>
              <line x1={ballCoords.x} y1={ballCoords.y} x2={dragPos.x} y2={dragPos.y}
                stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            </svg>
            <div style={{
              position: "absolute", left: dragPos.x, top: dragPos.y, zIndex: 16, pointerEvents: "none",
              width: 20, height: 20, borderRadius: "50%", background: "#F8FAFC",
              border: "3px solid #3B82F6", boxShadow: "0 0 16px #3B82F688",
              transform: "translate(-50%,-50%)",
            }} />
            <div style={{
              position: "absolute", left: dragPos.x, top: dragPos.y - 20, zIndex: 17, pointerEvents: "none",
              transform: "translateX(-50%)", background: "#3B82F6", color: "#fff",
              padding: "3px 10px", borderRadius: 6, fontSize: 9, fontWeight: 700, whiteSpace: "nowrap",
            }}>↑ Overhead</div>
          </>
        )}

        {/* D arc overlays */}
        {renderDArc("top")}
        {renderDArc("bottom")}

        {/* Top backline */}
        {renderBackline("top")}

        {/* Zone rows */}
        {zones.map((zone, zi) => (
          <div key={zone.id}>
            {/* Centre line between z2 and z3 */}
            {zi === 2 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)" }} />
                {showRestart && (
                  <div onClick={() => onShowTeamPicker?.(true)} style={{
                    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    zIndex: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: "#F8FAFC",
                      border: "3px solid #94A3B8", boxShadow: "0 0 16px rgba(255,255,255,0.6), 0 0 32px rgba(255,255,255,0.3)",
                      animation: "pulse-ball 2s infinite",
                    }} />
                    <div style={{
                      fontSize: 8, fontWeight: 700, color: "#F8FAFC", textTransform: "uppercase",
                      letterSpacing: "0.08em", whiteSpace: "nowrap", background: "rgba(15,23,42,0.85)",
                      padding: "3px 10px", borderRadius: 6,
                    }}>Tap ball to start</div>
                  </div>
                )}
                {!showRestart && ballPos?.type === "centre" && (
                  <div
                    onTouchStart={(e) => onBallDragStart(e.touches[0].clientX, e.touches[0].clientY, e)}
                    onMouseDown={(e) => onBallDragStart(e.clientX, e.clientY, e)}
                    style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 15, cursor: "grab", touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
                    {makeBall(false)}
                  </div>
                )}
                {isGhostAt("centre") && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 8 }}>{makeBall(true)}</div>
                )}
              </div>
            )}

            {/* Zone row */}
            <div style={{ display: "flex", height: 72 }}>
              {/* Left OUT */}
              <div onClick={() => handleSidelineOut("left", zone.id)} style={{
                width: 28, background: getOutStripBg("left", zone.id),
                cursor: running && !showRestart ? "pointer" : "default",
                opacity: running && !showRestart ? (sidelineOut?.side === "left" && sidelineOut?.zoneId === zone.id ? 1 : 0.6) : 0.25,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.3s, opacity 0.3s", borderRight: "1px solid rgba(0,0,0,0.3)",
                position: "relative",
              }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: "#CBD5E1", writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>OUT</span>
                {running && possession && !(sidelineOut?.side === "left" && sidelineOut?.zoneId === zone.id) && (
                  <svg width="16" height="24" viewBox="0 0 16 24" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: dirArrowUp ? 2 : undefined, bottom: dirArrowUp ? undefined : 2, pointerEvents: "none", opacity: 0.8 }}>
                    <polygon points={dirArrowUp ? "8,2 15,20 1,20" : "8,22 15,4 1,4"} fill={teams[possession].color} />
                  </svg>
                )}
              </div>

              {/* 3 green blocks */}
              {["left", "centre", "right"].map((pos, pi) => {
                const hasBall = ballPos?.zoneId === zone.id && ballPos?.pos === pos;
                const hasGhost = isGhostAt("zone", zone.id, pos);
                return (
                  <div key={pos}
                    data-zone={zone.id} data-pos={pos}
                    onClick={() => handleZoneTap(zone.id, pos)}
                    style={{
                      flex: 1, background: zi % 2 === 0 ? grassA : grassB, position: "relative",
                      cursor: running && !showRestart ? "pointer" : "default",
                      borderRight: pi < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                      WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
                    }}>
                    {flash === `${zone.id}-${pos}` && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.15)" }} />}
                    {hasBall && !showRestart && (() => {
                      const nl = ballPos?.nearLine;
                      // nearLine: position at zone edge closest to midfield
                      const nearStyle = nl ? {
                        position: "absolute",
                        [zi < 2 ? "bottom" : "top"]: -2,
                        left: "50%", transform: "translateX(-50%)",
                      } : {};
                      return (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => onBallDragStart(e.touches[0].clientX, e.touches[0].clientY, e)}
                          onMouseDown={(e) => onBallDragStart(e.clientX, e.clientY, e)}
                          style={{ zIndex: 10, cursor: "grab", touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", ...nearStyle }}
                        >{makeBall(false)}</div>
                      );
                    })()}
                    {/* Drag target highlight */}
                    {dragging && dragTarget?.zoneId === zone.id && dragTarget?.pos === pos && (
                      <div style={{ position: "absolute", inset: 0, background: "#3B82F622", border: "2px solid #3B82F666", zIndex: 12, pointerEvents: "none" }} />
                    )}
                    {hasGhost && <div style={{ position: "absolute", zIndex: 5 }}>{makeBall(true)}</div>}
                  </div>
                );
              })}

              {/* Right OUT */}
              <div onClick={() => handleSidelineOut("right", zone.id)} style={{
                width: 28, background: getOutStripBg("right", zone.id),
                cursor: running && !showRestart ? "pointer" : "default",
                opacity: running && !showRestart ? (sidelineOut?.side === "right" && sidelineOut?.zoneId === zone.id ? 1 : 0.6) : 0.25,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.3s, opacity 0.3s", borderLeft: "1px solid rgba(0,0,0,0.3)",
                position: "relative",
              }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: "#CBD5E1", writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>OUT</span>
                {running && possession && !(sidelineOut?.side === "right" && sidelineOut?.zoneId === zone.id) && (
                  <svg width="16" height="24" viewBox="0 0 16 24" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: dirArrowUp ? 2 : undefined, bottom: dirArrowUp ? undefined : 2, pointerEvents: "none", opacity: 0.8 }}>
                    <polygon points={dirArrowUp ? "8,2 15,20 1,20" : "8,22 15,4 1,4"} fill={teams[possession].color} />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Bottom backline */}
        {renderBackline("bottom")}
      </div>

      {/* Action popup */}
      {actionPopup && (
        <div onClick={dismissActionPopup} style={{
          position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: "absolute",
            left: "50%", transform: "translateX(-50%)",
            ...(actionPopup === "top"
              ? { top: (fieldRef.current?.getBoundingClientRect().top || 0) + 20 }
              : { bottom: window.innerHeight - (fieldRef.current?.getBoundingClientRect().bottom || 0) + 20 }),
            zIndex: 41, background: "#0F172Aee", borderRadius: 12, padding: 8,
            border: "1px solid #33415566", backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", gap: 4, minWidth: 180,
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 2px 2px" }}>
              <div onClick={dismissActionPopup} style={{
                width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#64748B", fontSize: 14, cursor: "pointer",
              }}>✕</div>
            </div>
            {ACTION_OPTIONS.map(opt => (
              <div key={opt.id} onClick={() => handleActionSelect(opt.id, actionPopup)} style={{
                padding: "8px 12px", borderRadius: 6, border: `1px solid ${opt.color}44`,
                background: `${opt.color}18`, color: "#F8FAFC", fontSize: 11, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>{opt.icon}</span><span>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-ball { 0%,100% { box-shadow: 0 0 16px rgba(255,255,255,0.6), 0 0 32px rgba(255,255,255,0.3); transform: scale(1); } 50% { box-shadow: 0 0 24px rgba(255,255,255,0.8), 0 0 48px rgba(255,255,255,0.4); transform: scale(1.1); } }
        @keyframes halo-pulse { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
      `}</style>
    </div>
  );
}

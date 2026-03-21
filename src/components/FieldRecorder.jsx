import { useState, useRef, useEffect, useCallback } from 'react';
import { ZONES, POSITIONS, GRASS_A, GRASS_B } from '../utils/constants.js';
import { posLabel, otherTeam } from '../utils/helpers.js';
import { theme } from '../utils/styles.js';

const ZONE_H = 68;
const D_BAR_H = 48;

export default function FieldRecorder({
  teams, // { home: { name, color }, away: { name, color } }
  possession,
  setPossession,
  ballPos,
  setBallPos,
  prevBallPos,
  setPrevBallPos,
  tapCount,
  setTapCount,
  running,
  showRestart,
  setShowRestart,
  flipped,
  matchState,
  onAddLog,
  onShowDPopup,
  onShowTeamPicker,
  sidelineOut,
  setSidelineOut,
}) {
  const [flash, setFlash] = useState(null);
  const [lineCoords, setLineCoords] = useState(null);
  const fieldRef = useRef(null);
  const longPressRef = useRef(null);
  const longPressTriggered = useRef(false);

  const topTeam = flipped ? "home" : "away";
  const bottomTeam = flipped ? "away" : "home";

  const doFlash = (k) => { setFlash(k); setTimeout(() => setFlash(null), 250); };
  const moveBall = (np) => { setPrevBallPos(ballPos); setBallPos(np); };
  const clearSO = () => { if (sidelineOut) setSidelineOut(null); };

  // Ghost ball detection
  const isGhostAt = (type, zoneId, pos, end) => {
    if (!prevBallPos || !ballPos) return false;
    const same = !ballPos.type && !prevBallPos.type && ballPos.zoneId === prevBallPos.zoneId && ballPos.pos === prevBallPos.pos;
    const sameD = ballPos.type && prevBallPos.type && ballPos.type === prevBallPos.type && ballPos.end === prevBallPos.end;
    if (same || sameD) return false;
    if (type === "zone") return !prevBallPos.type && prevBallPos.zoneId === zoneId && prevBallPos.pos === pos;
    if (type === "centre") return prevBallPos.type === "centre";
    if (type === "d") return prevBallPos.type === "d" && prevBallPos.end === end;
    return false;
  };

  // Ghost trail line
  useEffect(() => {
    if (!fieldRef.current || !ballPos || !prevBallPos) { setLineCoords(null); return; }
    const same = !ballPos.type && !prevBallPos.type && ballPos.zoneId === prevBallPos.zoneId && ballPos.pos === prevBallPos.pos;
    const sameD = ballPos.type && prevBallPos.type && ballPos.type === prevBallPos.type && ballPos.end === prevBallPos.end;
    if (same || sameD) { setLineCoords(null); return; }
    requestAnimationFrame(() => {
      const f = fieldRef.current; if (!f) return;
      const c = f.querySelector('[data-ball="current"]');
      const g = f.querySelector('[data-ball="ghost"]');
      if (!c || !g) { setLineCoords(null); return; }
      const fr = f.getBoundingClientRect(), cr = c.getBoundingClientRect(), gr = g.getBoundingClientRect();
      setLineCoords({
        x1: gr.left + gr.width / 2 - fr.left,
        y1: gr.top + gr.height / 2 - fr.top,
        x2: cr.left + cr.width / 2 - fr.left,
        y2: cr.top + cr.height / 2 - fr.top,
        fw: fr.width, fh: fr.height,
      });
    });
  }, [ballPos, prevBallPos]);

  // Long press = swap possession
  const startLP = useCallback((zoneId, pos) => {
    longPressTriggered.current = false;
    longPressRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (possession && running) {
        const nt = otherTeam(possession);
        const z = ZONES.find(z => z.id === zoneId);
        onAddLog(nt, "Poss Conceded", `${z?.label || ""} ${posLabel(pos)}`,
          `${teams[possession].name} lost to ${teams[nt].name} in ${z?.label} (${posLabel(pos)})`);
        setPossession(nt);
        setSidelineOut(null);
        doFlash(`${zoneId}-${pos}`);
      }
    }, 500);
  }, [possession, running, teams]);

  const endLP = useCallback(() => { clearTimeout(longPressRef.current); }, []);

  // Zone tap
  const handleBlockTap = (zoneId, pos) => {
    if (longPressTriggered.current) return;
    if (!running || showRestart || !possession) return;
    clearSO(); doFlash(`${zoneId}-${pos}`);

    const z = ZONES.find(z => z.id === zoneId);
    const prev = ballPos;

    // Same block = retained possession
    if (prev && prev.zoneId === zoneId && prev.pos === pos && !prev.type) {
      const nc = tapCount + 1;
      setTapCount(nc);
      onAddLog(possession, "Pass in zone", `${z.label} ${posLabel(pos)}`,
        `${teams[possession].name} retained (${nc} touches)`);
      setBallPos({ zoneId, pos });
      return;
    }
    setTapCount(1);

    let ev = "", det = "";
    if (!prev || prev.type === "centre") {
      ev = "Ball in play"; det = `${teams[possession].name} → ${z.label} (${posLabel(pos)})`;
    } else if (prev.type === "d") {
      ev = "Ball out of D"; det = `${teams[possession].name} cleared to ${z.label}`;
    } else if (prev.zoneId === zoneId) {
      ev = "Ball across"; det = `${teams[possession].name} ${posLabel(prev.pos)} → ${posLabel(pos)} in ${z.label}`;
    } else {
      const pz = ZONES.find(z => z.id === prev.zoneId);
      const pi = ZONES.findIndex(z => z.id === prev.zoneId);
      const ni = ZONES.findIndex(z => z.id === zoneId);
      if (zoneId === "own_mid" && prev.zoneId === "own_quarter") {
        ev = "Defensive Exit"; det = `${teams[possession].name} ${pz.label} → ${z.label}`;
      } else if (ni < pi) {
        ev = "Ball forward"; det = `${teams[possession].name} ${pz.label} → ${z.label} (${posLabel(pos)})`;
      } else {
        ev = "Ball back"; det = `${teams[possession].name} back ${pz.label} → ${z.label}`;
      }
    }
    onAddLog(possession, ev, `${z.label} ${posLabel(pos)}`, det);
    moveBall({ zoneId, pos });
  };

  // D tap
  const handleDCentreTap = (end) => {
    if (!running || showRestart || !possession) return;
    clearSO(); doFlash(`d-${end}-centre`);
    const def = end === "top" ? topTeam : bottomTeam;
    const dLbl = `${teams[def].name} D`;
    onAddLog(possession, "D Entry", dLbl, `${teams[possession].name} entered ${dLbl}`);
    moveBall({ type: "d", end });
    onShowDPopup({ end });
  };

  // Dead ball
  const handleDeadBall = (end, side) => {
    if (!running || showRestart) return;
    clearSO(); doFlash(`d-${end}-${side}`);
    const def = end === "top" ? topTeam : bottomTeam;
    onAddLog(possession || def, "Ball Dead", `Backline ${side}`,
      `Ball over ${teams[def].name} backline (${side}). ${teams[def].name} restart.`);
    setPossession(def); setTapCount(1);
    moveBall({ zoneId: end === "top" ? "opp_quarter" : "own_quarter", pos: side });
  };

  // Sideline out
  const handleSidelineOut = (side, zoneId) => {
    if (!running || showRestart) return;
    if (sidelineOut?.side === side && sidelineOut?.zoneId === zoneId) {
      const old = sidelineOut.blamedTeam, nb = otherTeam(old);
      const z = ZONES.find(z => z.id === zoneId);
      setSidelineOut({ side, zoneId, blamedTeam: nb });
      onAddLog(nb, "Sideline Out (Reversed)", `${z?.label || ""} (${side})`,
        `Reversed — ${teams[nb].name} put it out. ${teams[old].name} free hit.`);
      setPossession(old); setTapCount(1); moveBall({ zoneId, pos: side });
      return;
    }
    if (!possession) return;
    const z = ZONES.find(z => z.id === zoneId);
    const losing = possession, gaining = otherTeam(possession);
    setSidelineOut({ side, zoneId, blamedTeam: losing });
    onAddLog(losing, "Sideline Out", `${z?.label || ""} (${side})`,
      `${teams[losing].name} out on ${side}. ${teams[gaining].name} free hit.`);
    setPossession(gaining); setTapCount(1); moveBall({ zoneId, pos: side });
  };

  // Ball rendering
  const makeBall = (ghost, db) => (
    <div data-ball={db} style={{
      width: 22, height: 22, borderRadius: "50%",
      background: ghost ? "#94A3B8" : "#F8FAFC",
      boxShadow: ghost ? "none" : `0 0 10px #fff8, 0 0 16px ${possession ? teams[possession].color + "66" : "#fff4"}`,
      border: `3px solid ${ghost ? "#64748B" : (possession ? teams[possession].color : "#94A3B8")}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: ghost ? 8 : 10, opacity: ghost ? 0.4 : 1, position: "relative",
    }}>
      {!ghost && tapCount > 1 && (
        <span style={{ fontSize: 9, fontWeight: 900, color: possession ? teams[possession].color : theme.bg }}>
          {tapCount}
        </span>
      )}
    </div>
  );

  // D-bar render
  const renderDBar = (end) => {
    const def = end === "top" ? topTeam : bottomTeam;
    const tc = teams[def].color;
    const active = running && !showRestart;
    const hasBall = ballPos?.type === "d" && ballPos.end === end;
    const hasGhost = isGhostAt("d", null, null, end);

    return (
      <div style={{ display: "flex", height: D_BAR_H }}>
        {/* Dead ball left */}
        <div onClick={() => handleDeadBall(end, "left")} style={{
          width: 48, background: tc + "88",
          cursor: active ? "pointer" : "default", opacity: active ? 0.8 : 0.4,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          {flash === `d-${end}-left` && <div style={{ position: "absolute", inset: 0, background: "#fff3" }} />}
          <div style={{ fontSize: 7, fontWeight: 700, color: "#fffa", textTransform: "uppercase" }}>DEAD</div>
        </div>

        {/* D centre */}
        <div onClick={() => handleDCentreTap(end)} style={{
          flex: 1, background: tc,
          cursor: active ? "pointer" : "default", opacity: active ? 1 : 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          {/* D arc */}
          {end === "top" && <div style={{
            position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
            width: 90, height: 24, borderRadius: "0 0 45px 45px",
            border: "1.5px solid #fff3", borderTop: "none", pointerEvents: "none",
          }} />}
          {end === "bottom" && <div style={{
            position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
            width: 90, height: 24, borderRadius: "45px 45px 0 0",
            border: "1.5px solid #fff3", borderBottom: "none", pointerEvents: "none",
          }} />}
          {flash === `d-${end}-centre` && <div style={{ position: "absolute", inset: 0, background: "#fff2" }} />}
          {hasBall && <div style={{ zIndex: 11 }}>{makeBall(false, "current")}</div>}
          {hasGhost && <div style={{ position: "absolute", zIndex: 8 }}>{makeBall(true, "ghost")}</div>}
          <div style={{
            fontSize: 10, fontWeight: 800, color: "#fffd", textTransform: "uppercase",
            letterSpacing: "0.1em", zIndex: 2, pointerEvents: "none",
          }}>
            🧤 {teams[def].name}
          </div>
        </div>

        {/* Dead ball right */}
        <div onClick={() => handleDeadBall(end, "right")} style={{
          width: 48, background: tc + "88",
          cursor: active ? "pointer" : "default", opacity: active ? 0.8 : 0.4,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          {flash === `d-${end}-right` && <div style={{ position: "absolute", inset: 0, background: "#fff3" }} />}
          <div style={{ fontSize: 7, fontWeight: 700, color: "#fffa", textTransform: "uppercase" }}>DEAD</div>
        </div>
      </div>
    );
  };

  if (matchState === "ended") return null;

  return (
    <div style={{ padding: "0 8px" }}>
      <div ref={fieldRef} style={{ borderRadius: 10, overflow: "hidden", border: "2px solid #1a5c30", position: "relative" }}>
        {/* Ghost trail line */}
        {lineCoords && (
          <svg width={lineCoords.fw} height={lineCoords.fh} style={{ position: "absolute", top: 0, left: 0, zIndex: 9, pointerEvents: "none" }}>
            <line x1={lineCoords.x1} y1={lineCoords.y1} x2={lineCoords.x2} y2={lineCoords.y2}
              stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.55" />
          </svg>
        )}

        {renderDBar("top")}

        {ZONES.map((zone, zi) => {
          const isCentreLine = zi === 1;
          const grass = zi % 2 === 0 ? GRASS_A : GRASS_B;

          return (
            <div key={zone.id}>
              <div style={{ display: "flex" }}>
                {/* Left OUT strip */}
                {(() => {
                  const isActive = sidelineOut?.side === "left" && sidelineOut?.zoneId === zone.id;
                  return (
                    <div onClick={() => handleSidelineOut("left", zone.id)} style={{
                      width: 30, background: isActive ? teams[sidelineOut.blamedTeam].color + "99" : "#334155",
                      cursor: running && !showRestart ? "pointer" : "default",
                      opacity: running && !showRestart ? (isActive ? 1 : 0.7) : 0.25,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", borderRight: "1.5px solid #1a5c30", transition: "background 0.3s",
                    }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: isActive ? "#fff" : "#94A3B8", writingMode: "vertical-rl", textOrientation: "mixed" }}>OUT</div>
                    </div>
                  );
                })()}

                {/* Zone blocks */}
                {POSITIONS.map((pos, pi) => {
                  const key = `${zone.id}-${pos}`;
                  const isFlash = flash === key;
                  const isBall = ballPos?.zoneId === zone.id && ballPos?.pos === pos && !ballPos?.type;
                  const isGhost = isGhostAt("zone", zone.id, pos, null);

                  return (
                    <div key={pos}
                      onClick={() => handleBlockTap(zone.id, pos)}
                      onTouchStart={() => startLP(zone.id, pos)}
                      onTouchEnd={endLP}
                      onMouseDown={() => startLP(zone.id, pos)}
                      onMouseUp={endLP}
                      onMouseLeave={endLP}
                      style={{
                        flex: 1, height: ZONE_H, background: grass,
                        cursor: running && !showRestart ? "pointer" : "default",
                        opacity: running && !showRestart ? 1 : 0.5,
                        borderRight: pi < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        userSelect: "none",
                      }}
                    >
                      {isFlash && <div style={{ position: "absolute", inset: 0, background: "#fff2", pointerEvents: "none" }} />}
                      {isGhost && makeBall(true, "ghost")}
                      {isBall && makeBall(false, "current")}
                    </div>
                  );
                })}

                {/* Right OUT strip */}
                {(() => {
                  const isActive = sidelineOut?.side === "right" && sidelineOut?.zoneId === zone.id;
                  return (
                    <div onClick={() => handleSidelineOut("right", zone.id)} style={{
                      width: 30, background: isActive ? teams[sidelineOut.blamedTeam].color + "99" : "#334155",
                      cursor: running && !showRestart ? "pointer" : "default",
                      opacity: running && !showRestart ? (isActive ? 1 : 0.7) : 0.25,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", borderLeft: "1.5px solid #1a5c30", transition: "background 0.3s",
                    }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: isActive ? "#fff" : "#94A3B8", writingMode: "vertical-rl", textOrientation: "mixed" }}>OUT</div>
                    </div>
                  );
                })()}
              </div>

              {/* Centre line */}
              {isCentreLine && (
                <div style={{ height: 2, background: "rgba(255,255,255,0.25)", position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                    width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)",
                  }} />
                  {showRestart && (
                    <div onClick={() => onShowTeamPicker(true)} style={{
                      position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                      zIndex: 20, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "#F8FAFC", border: "3px solid #94A3B8",
                        boxShadow: "0 0 16px rgba(255,255,255,0.6)",
                        animation: "pulse-ball 2s infinite",
                      }} />
                      <div style={{
                        fontSize: 8, fontWeight: 700, color: "#F8FAFC", textTransform: "uppercase",
                        whiteSpace: "nowrap", background: "rgba(15,23,42,0.8)", padding: "2px 8px", borderRadius: 5,
                      }}>
                        Tap to start
                      </div>
                    </div>
                  )}
                  {!showRestart && ballPos?.type === "centre" && (
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 15 }}>
                      {makeBall(false, "current")}
                    </div>
                  )}
                  {isGhostAt("centre", null, null, null) && (
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 8 }}>
                      {makeBall(true, "ghost")}
                    </div>
                  )}
                </div>
              )}

              {zi !== 1 && zi < 3 && <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />}
            </div>
          );
        })}

        {renderDBar("bottom")}
      </div>

      {/* Pause overlay */}
      {matchState === "paused" && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(15,23,42,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 10, zIndex: 30, pointerEvents: "none",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: theme.accent }}>⏸ Paused</div>
        </div>
      )}

      <style>{`@keyframes pulse-ball{0%,100%{box-shadow:0 0 16px rgba(255,255,255,0.6),0 0 32px rgba(255,255,255,0.3);transform:scale(1)}50%{box-shadow:0 0 24px rgba(255,255,255,0.8),0 0 48px rgba(255,255,255,0.4);transform:scale(1.1)}}`}</style>
    </div>
  );
}

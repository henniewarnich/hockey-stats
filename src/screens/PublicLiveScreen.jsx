import { useState, useEffect } from 'react';
import { theme } from '../utils/styles.js';
import { PUBLIC_EVENTS } from '../utils/constants.js';
import { teamColor, teamShortName } from '../utils/teams.js';

const fmt = (s) => `${Math.floor(s / 60)}'${String(s % 60).padStart(2, "0")}`;
const fmtClock = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

// Filter events to only show public-safe ones
function filterPublicEvents(events) {
  return events.filter(e => {
    if (e.team === "meta") return e.event?.includes("Pause") || e.event?.includes("Half") || e.event?.includes("Quarter");
    if (e.team === "commentary") return true; // narratives are public
    return PUBLIC_EVENTS.some(k => e.event?.startsWith(k));
  });
}

function classifyEvent(entry) {
  if (entry.event?.startsWith("Goal")) return "goal";
  if (entry.event === "Short Corner" || entry.event === "Long Corner" || entry.event === "Penalty") return "set_piece";
  if (entry.event?.includes("Card")) return "card";
  if (entry.team === "commentary") return "narrative";
  if (entry.team === "meta") return "info";
  return "other";
}

function getEventStyle(type, teamColor) {
  switch (type) {
    case "goal": return { bg: "#F59E0B12", border: "#F59E0B", icon: "⚽", iconBg: "#F59E0B22" };
    case "set_piece": return { bg: "#8B5CF608", border: teamColor || "#64748B", icon: "🔲", iconBg: "#8B5CF622" };
    case "card": return { bg: "#F59E0B08", border: "#F59E0B", icon: "🟨", iconBg: "#F59E0B18" };
    case "narrative": return { bg: "#1E293B", border: "#475569", icon: "📝", iconBg: "#334155" };
    case "info": return { bg: "#0B0F1A", border: "#F59E0B", icon: "⏱", iconBg: "#F59E0B11" };
    default: return { bg: "transparent", border: "#334155", icon: "·", iconBg: "#1E293B" };
  }
}

export default function PublicLiveScreen({ match, events, matchTime, running, onBack }) {
  const teams = match?.teams || { home: { name: "Home", color: "#3B82F6" }, away: { name: "Away", color: "#EF4444" } };
  const homeGoals = match?.homeScore ?? events.filter(e => e.team === "home" && e.event?.startsWith("Goal!")).length;
  const awayGoals = match?.awayScore ?? events.filter(e => e.team === "away" && e.event?.startsWith("Goal!")).length;

  const publicEvents = filterPublicEvents(events);
  const isEnded = match?.status === "ended";

  // Determine current quarter from pause events
  const pauseEvents = events.filter(e => e.team === "meta" && e.detail);
  const qbCount = pauseEvents.filter(e => e.detail === "Quarter Break").length;
  const htCount = pauseEvents.filter(e => e.detail === "Half Time").length;
  const period = qbCount + htCount + 1;
  const periodLabel = period <= 4 ? `Q${period}` : "FT";

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer" }}>←</button>}
          <div style={{ fontSize: 9, fontWeight: 700, color: isEnded ? theme.textDim : "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
            {!isEnded && <span style={{ animation: "pulse-dot 2s infinite" }}>●</span>}
            {isEnded ? "FULL TIME" : "LIVE"}
          </div>
        </div>
        <div style={{ fontSize: 8, color: "#475569" }}>Girls 1st XI Hockey</div>
      </div>

      {/* Scoreboard */}
      <div style={{ padding: "12px 14px 16px" }}>
        <div style={{ background: "#1E293B", borderRadius: 14, padding: "16px 12px", border: isEnded ? "1px solid #33415544" : "1px solid #10B98122" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: teamColor(teams.home), marginBottom: 2 }}>{teamShortName(teams.home)}</div>
              {teams.home.rank && <div style={{ fontSize: 8, color: "#64748B", marginBottom: 6 }}>Ranked #{teams.home.rank}</div>}
              {!teams.home.rank && <div style={{ fontSize: 8, color: "#475569", marginBottom: 6 }}>&nbsp;</div>}
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{homeGoals}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 10px" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: isEnded ? theme.danger : "#F59E0B" }}>
                {isEnded ? "FT" : fmtClock(matchTime)}
              </div>
              {!isEnded && (
                <div style={{ fontSize: 8, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: running ? "#10B98122" : "#F59E0B22", color: running ? "#10B981" : "#F59E0B" }}>
                  {running ? periodLabel : "⏸"}
                </div>
              )}
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: teamColor(teams.away), marginBottom: 2 }}>{teamShortName(teams.away)}</div>
              {teams.away.rank && <div style={{ fontSize: 8, color: "#64748B", marginBottom: 6 }}>Ranked #{teams.away.rank}</div>}
              {!teams.away.rank && <div style={{ fontSize: 8, color: "#475569", marginBottom: 6 }}>Unranked</div>}
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{awayGoals}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commentary feed */}
      <div style={{ padding: "0 14px 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          {isEnded ? "Match Commentary" : "Live Commentary"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {publicEvents.length === 0 ? (
            <div style={{ fontSize: 10, color: "#334155", fontStyle: "italic", textAlign: "center", padding: 20 }}>
              Waiting for kickoff...
            </div>
          ) : publicEvents.slice(0, 30).map((entry, i) => {
            const type = classifyEvent(entry);
            const style = getEventStyle(type, teamColor(teams[entry.team]));
            const teamColor = teamColor(teams[entry.team]);
            const isLatest = i === 0;

            return (
              <div key={entry.id} style={{
                padding: (type === "goal" || type === "narrative") ? "10px 10px" : "7px 10px",
                borderRadius: 8, background: style.bg, borderLeft: `3px solid ${style.border}`,
                animation: isLatest && !isEnded ? "slide-in 0.3s ease-out" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#94A3B8", minWidth: 34, paddingTop: 1, fontWeight: 600 }}>
                    {fmt(entry.time)}
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                    background: style.iconBg, fontSize: type === "goal" || type === "card" || type === "narrative" ? 12 : 8,
                    color: teamColor || "#F59E0B", flexShrink: 0,
                  }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    {type === "goal" ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#F59E0B", marginBottom: 2 }}>GOAL! {teamShortName(teams[entry.team])}</div>
                        <div style={{ fontSize: 10, color: "#CBD5E1", lineHeight: 1.4 }}>{entry.detail}</div>
                      </>
                    ) : type === "card" ? (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", marginBottom: 1 }}>{entry.event}</div>
                        <div style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1.4 }}>{entry.detail}</div>
                      </>
                    ) : type === "narrative" ? (
                      <div style={{ fontSize: 10, color: "#CBD5E1", lineHeight: 1.5, fontStyle: "italic" }}>{entry.detail}</div>
                    ) : type === "info" ? (
                      <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 600 }}>{entry.detail || entry.event}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 9, fontWeight: 700, color: teamColor || "#94A3B8", marginBottom: 1 }}>{entry.event}</div>
                        <div style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1.4 }}>{entry.detail}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

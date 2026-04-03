import { useState } from 'react';
import { theme } from '../utils/styles.js';
import { teamColor, teamInitial, teamShortName } from '../utils/teams.js';

import PlayPatternField from '../components/PlayPatternField.jsx';

const HC = "#22C55E"; // home colour — always green
const AC = "#64748B"; // away colour — always grey

const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

const STATS = [
  { key: "dEntries", label: "D Entries" },
  { key: "shotsOn", label: "Shots On" },
  { key: "shotsOff", label: "Shots Off" },
  { key: "shortCorners", label: "Short Crnrs" },
  { key: "longCorners", label: "Long Crnrs" },
  { key: "turnoversWon", label: "TOs Won" },
  { key: "possLost", label: "Poss Lost" },
];

const DISPLAY_STATS = [
  { label: "Shots On %", calc: (s) => { const t = s.shotsOn + s.shotsOff; return t > 0 ? Math.round(s.shotsOn / t * 100) : 0; }, suffix: "%" },
  { label: "Shots Off %", calc: (s) => { const t = s.shotsOn + s.shotsOff; return t > 0 ? Math.round(s.shotsOff / t * 100) : 0; }, suffix: "%" },
  { label: "Short Crnr %", calc: (s) => s.dEntries > 0 ? Math.round(s.shortCorners / s.dEntries * 100) : 0, suffix: "%" },
  { label: "Territory", calc: (s) => s.territory || 0, suffix: "%" },
];

const INVERTED = ["possLost", "shotsOff"];

// Generate coach insights for a team in a period
function generatePeriodInsights(stats, oppStats, teamName, oppName) {
  const insights = [];
  const { goals, dEntries, shotsOn, shotsOff, shortCorners, longCorners, turnoversWon, possLost, territory } = stats;
  const totalShots = shotsOn + shotsOff;
  const dConv = dEntries > 0 ? Math.round(totalShots / dEntries * 100) : 0;
  const shotConv = shotsOn > 0 ? Math.round(goals / shotsOn * 100) : 0;

  // Strengths
  if (territory >= 65) insights.push({ type: "strength", text: `Dominant territory (${territory}%) — controlling the game` });
  else if (territory >= 55) insights.push({ type: "strength", text: `Good territorial advantage (${territory}%)` });

  if (dEntries >= 4 && dConv >= 60) insights.push({ type: "strength", text: `Efficient in the D — converting ${dConv}% of entries into shots` });
  if (turnoversWon >= 3 && turnoversWon > possLost) insights.push({ type: "strength", text: `Winning the turnover battle (${turnoversWon} won vs ${possLost} lost)` });
  if (goals >= 2) insights.push({ type: "strength", text: `Clinical finishing — ${goals} goals from ${shotsOn} shots on target` });
  if (shortCorners >= 2 && goals > 0) insights.push({ type: "strength", text: `Set-piece threat — ${shortCorners} short corners earned` });
  if (possLost <= 1 && dEntries >= 2) insights.push({ type: "strength", text: `Tidy possession — only ${possLost} ball lost` });

  // Weaknesses
  if (dEntries >= 3 && totalShots === 0) insights.push({ type: "weakness", text: `Getting into the D (${dEntries}×) but creating no shots` });
  else if (dEntries >= 3 && dConv < 30) insights.push({ type: "weakness", text: `Poor D conversion — only ${dConv}% of entries producing shots` });

  if (shotsOn >= 3 && goals === 0) insights.push({ type: "weakness", text: `${shotsOn} shots on target but can't find the net` });
  if (shotsOff >= 2 && shotsOff > shotsOn) insights.push({ type: "weakness", text: `Accuracy issue — more shots off target (${shotsOff}) than on (${shotsOn})` });
  if (possLost >= 3 && possLost > turnoversWon) insights.push({ type: "weakness", text: `Giving the ball away too often (${possLost} lost vs ${turnoversWon} won)` });
  if (territory <= 35) insights.push({ type: "weakness", text: `Under pressure — only ${territory}% territory` });
  else if (territory <= 45 && dEntries === 0) insights.push({ type: "weakness", text: `Can't get into the opposition half — 0 D entries` });

  if (territory >= 55 && dEntries === 0) insights.push({ type: "weakness", text: `Territory without penetration — 0 D entries despite ${territory}% territory` });
  if (oppStats.shortCorners >= 2) insights.push({ type: "weakness", text: `Conceding set pieces — ${oppStats.shortCorners} short corners against` });

  // Limit to top 3 per type
  const strengths = insights.filter(i => i.type === "strength").slice(0, 3);
  const weaknesses = insights.filter(i => i.type === "weakness").slice(0, 3);
  return [...strengths, ...weaknesses];
}

// Generate match-level insights by aggregating all periods
function generateMatchInsights(quarterData, teams, homeScore, awayScore) {
  const activeQs = quarterData.filter(q => q.status !== "upcoming");
  if (activeQs.length === 0) return { home: [], away: [] };

  const agg = (team, key) => activeQs.reduce((s, q) => s + q[team][key], 0);
  const avgTerr = (team) => Math.round(activeQs.reduce((s, q) => s + q[team].territory, 0) / activeQs.length);

  const buildInsights = (t, opp, tScore, oScore) => {
    const ins = [];
    const terr = avgTerr(t);
    const de = agg(t, "dEntries");
    const son = agg(t, "shotsOn");
    const soff = agg(t, "shotsOff");
    const sc = agg(t, "shortCorners");
    const tw = agg(t, "turnoversWon");
    const pl = agg(t, "possLost");
    const totalShots = son + soff;
    const dConv = de > 0 ? Math.round(totalShots / de * 100) : 0;

    // Momentum — which periods were strongest?
    const bestQ = activeQs.reduce((best, q) => q[t].dEntries + q[t].goals * 3 > best[t].dEntries + best[t].goals * 3 ? q : best, activeQs[0]);
    const worstQ = activeQs.reduce((worst, q) => q[t].territory < worst[t].territory ? q : worst, activeQs[0]);

    if (activeQs.length >= 2) {
      ins.push({ type: "info", text: `Strongest period: ${bestQ.label} — Weakest: ${worstQ.label}` });
    }

    // Overall strengths
    if (terr >= 60) ins.push({ type: "strength", text: `Commanding ${terr}% avg territory across the match` });
    if (dConv >= 50 && de >= 4) ins.push({ type: "strength", text: `Strong D conversion at ${dConv}% (${totalShots} shots from ${de} entries)` });
    if (tw > pl + 2) ins.push({ type: "strength", text: `Dominant in turnovers — net +${tw - pl} (${tw} won, ${pl} lost)` });
    if (tScore >= 2 && son <= tScore + 1) ins.push({ type: "strength", text: `Clinical — ${tScore} goals from ${son} shots on target` });
    if (sc >= 4) ins.push({ type: "strength", text: `Set-piece machine — ${sc} short corners earned` });

    // Overall weaknesses
    if (de >= 6 && tScore === 0) ins.push({ type: "weakness", text: `${de} D entries but scoreless — final ball letting them down` });
    if (soff > son && totalShots >= 4) ins.push({ type: "weakness", text: `Shot accuracy a concern — ${soff} off target vs ${son} on` });
    if (pl > tw + 2) ins.push({ type: "weakness", text: `Possession leaking — net -${pl - tw} (${pl} lost, ${tw} won)` });
    if (terr <= 40) ins.push({ type: "weakness", text: `Spending too much time in own half (${terr}% avg territory)` });
    if (agg(opp, "shortCorners") >= 4) ins.push({ type: "weakness", text: `Defensive discipline — conceded ${agg(opp, "shortCorners")} short corners` });

    // Score context
    if (tScore > oScore && terr < 45) ins.push({ type: "info", text: `Winning despite less territory — counter-attacking effectively` });
    if (tScore < oScore && terr >= 55) ins.push({ type: "info", text: `Losing despite territorial dominance — need to be more clinical` });

    return ins.slice(0, 6);
  };

  return {
    home: buildInsights("home", "away", homeScore, awayScore),
    away: buildInsights("away", "home", awayScore, homeScore),
  };
}

// Compute stats from events for a given time range
function computeStats(events, team, startTime, endTime) {
  const real = events.filter(e =>
    e.team === team && e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const all = events.filter(e =>
    e.time >= startTime && e.time <= endTime &&
    e.team !== "commentary" && e.team !== "meta"
  );
  const teamCount = real.length;
  const totalCount = all.length || 1;

  return {
    goals: real.filter(e => e.event?.startsWith("Goal!")).length,
    scGoals: real.filter(e => e.event === "Goal! (SC)").length,
    dEntries: real.filter(e => e.event === "D Entry").length,
    atkZoneEntries: real.filter(e => e.zone?.includes("Opp Quarter")).length,
    shotsOn: real.filter(e => e.event === "Shot on Goal").length,
    shotsOff: real.filter(e => e.event === "Shot Off Target").length,
    shortCorners: real.filter(e => e.event === "Short Corner").length,
    longCorners: real.filter(e => e.event === "Long Corner").length,
    turnoversWon: real.filter(e => e.event === "Turnover Won").length,
    possLost: real.filter(e => e.event === "Poss Conceded" || e.event?.startsWith("Sideline Out")).length,
    territory: Math.round(teamCount / totalCount * 100),
  };
}

// Find quarter boundaries from pause events (real quarters) or time-based (halves/none)
function getQuarters(events, breakFormat, matchLength, matchTime) {
  // Real quarters: use actual pause events
  if (breakFormat === "quarters") {
    const pauses = events.filter(e => e.team === "meta" && e.detail).sort((a, b) => a.time - b.time);
    const boundaries = [0];
    pauses.forEach(p => {
      if (p.detail === "Quarter Break" || p.detail === "Half Time") {
        boundaries.push(p.time);
      }
    });
    boundaries.push(999999);
    return [
      { label: "Q1", start: boundaries[0], end: boundaries[1] || 999999, status: boundaries.length > 2 ? "complete" : "live" },
      { label: "Q2", start: boundaries[1] || 999999, end: boundaries[2] || 999999, status: boundaries.length > 3 ? "complete" : boundaries.length > 2 ? "live" : "upcoming" },
      { label: "Q3", start: boundaries[2] || 999999, end: boundaries[3] || 999999, status: boundaries.length > 4 ? "complete" : boundaries.length > 3 ? "live" : "upcoming" },
      { label: "Q4", start: boundaries[3] || 999999, end: boundaries[4] || 999999, status: boundaries.length > 5 ? "complete" : boundaries.length > 4 ? "live" : "upcoming" },
    ];
  }

  // Halves / No breaks: derive virtual quarters from matchLength
  const totalSec = (matchLength || 60) * 60;
  const qLen = totalSec / 4;
  const labels = ["1st", "2nd", "3rd", "4th"];
  const elapsed = matchTime || 0;

  return labels.map((label, i) => {
    const start = Math.round(qLen * i);
    const end = i === 3 ? 999999 : Math.round(qLen * (i + 1));
    const status = elapsed >= end ? "complete" : elapsed >= start ? "live" : "upcoming";
    return { label, start, end, status };
  });
}

export default function CoachLiveScreen({ match, events, matchTime, running, onBack, embedded, seasonAvg, playPatterns, matchPlayPatterns, prominentZones, matchProminentZones, ballLossZones, matchBallLossZones }) {
  const teams = match?.teams || { home: { name: "Home", color: "#3B82F6" }, away: { name: "Away", color: "#EF4444" } };
  const breakFormat = match?.breakFormat || "quarters";
  const isEnded = match?.status === "ended";

  const matchLength = match?.matchLength || 60;

  const quarters = getQuarters(events, breakFormat, matchLength, matchTime);
  // Mark last active quarter as live if match not ended
  if (!isEnded) {
    const lastActive = [...quarters].reverse().find(q => q.status !== "upcoming");
    if (lastActive) lastActive.status = "live";
  }

  const [expandedQ, setExpandedQ] = useState(quarters.find(q => q.status === "live")?.label || quarters[0]?.label);
  const [viewTab, setViewTab] = useState("totals");

  const homeScore = match?.homeScore ?? events.filter(e => e.team === "home" && e.event?.startsWith("Goal!")).length;
  const awayScore = match?.awayScore ?? events.filter(e => e.team === "away" && e.event?.startsWith("Goal!")).length;

  // Compute stats per quarter
  const quarterData = quarters.map(q => ({
    ...q,
    home: computeStats(events, "home", q.start, q.end),
    away: computeStats(events, "away", q.start, q.end),
  }));

  const activeQs = quarterData.filter(q => q.status !== "upcoming");
  const totalStat = (team, key) => activeQs.reduce((sum, q) => sum + q[team][key], 0);
  const avgTerritory = (team) => activeQs.length ? Math.round(activeQs.reduce((s, q) => s + q[team].territory, 0) / activeQs.length) : 0;
  const convRate = (team) => { const s = totalStat(team, "shotsOn") + totalStat(team, "shotsOff"), g = team === "home" ? homeScore : awayScore; return s > 0 ? Math.round(g / s * 100) : 0; };
  const dConv = (team) => { const d = totalStat(team, "dEntries"), s = totalStat(team, "shotsOn") + totalStat(team, "shotsOff"); return d > 0 ? Math.round(s / d * 100) : 0; };
  const atkConv = (team) => { const a = totalStat(team, "atkZoneEntries"), d = totalStat(team, "dEntries"); return a > 0 ? Math.round(d / a * 100) : 0; };
  const shotsTaken = (team) => totalStat(team, "shotsOn") + totalStat(team, "shotsOff");
  const onTargetPct = (team) => { const s = shotsTaken(team); return s > 0 ? Math.round(totalStat(team, "shotsOn") / s * 100) : 0; };
  const goalPct = (team) => { const on = totalStat(team, "shotsOn"); const g = team === "home" ? homeScore : awayScore; return on > 0 ? Math.round(g / on * 100) : 0; };
  const dToSC = (team) => { const d = totalStat(team, "dEntries"), sc = totalStat(team, "shortCorners"); return d > 0 ? Math.round(sc / d * 100) : 0; };
  const scToGoal = (team) => { const sc = totalStat(team, "shortCorners"), g = totalStat(team, "scGoals"); return sc > 0 ? Math.round(g / sc * 100) : 0; };
  const matchInsights = generateMatchInsights(quarterData, teams, homeScore, awayScore);

  const StatBar = ({ hVal, aVal, label, suffix = "" }) => {
    const total = hVal + aVal;
    const hPct = total > 0 ? (hVal / total) * 100 : 50;
    const aPct = total > 0 ? (aVal / total) * 100 : 50;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
        <div style={{ width: 28, fontSize: 12, fontWeight: 800, textAlign: "right", fontFamily: "monospace", color: hVal >= aVal ? HC : "#64748B" }}>{hVal}{suffix}</div>
        <div style={{ flex: 1, display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${hPct}%`, background: HC, transition: "width 0.5s" }} />
          <div style={{ width: `${aPct}%`, background: AC, transition: "width 0.5s" }} />
        </div>
        <div style={{ width: 28, fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: aVal >= hVal ? AC : "#64748B" }}>{aVal}{suffix}</div>
        <div style={{ width: 90, fontSize: 9, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
      </div>
    );
  };

  const Wrapper = embedded ? ({ children }) => <div style={{ flex: 1 }}>{children}</div> : ({ children }) => (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none" }}>{children}</div>
  );

  return (
    <Wrapper>
      {!embedded && <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />}

      {!embedded && <>
      {/* Header */}
      <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer" }}>←</button>}
          <div style={{ fontSize: 9, fontWeight: 700, color: isEnded ? theme.textDim : "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
            {!isEnded && <span style={{ animation: "pulse-dot 2s infinite" }}>●</span>}
            {isEnded ? "FULL TIME — COACH VIEW" : "LIVE — COACH VIEW"}
          </div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", background: "#8B5CF622", padding: "2px 8px", borderRadius: 99 }}>🔒 Coach</div>
      </div>

      {/* Compact scoreboard */}
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: HC, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {teamShortName(teams.home)}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{homeScore}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: isEnded ? theme.danger : "#F59E0B" }}>
            {isEnded ? "FT" : fmt(matchTime)}
          </div>
          {!isEnded && <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#10B98122", color: "#10B981" }}>
            {quarters.find(q => q.status === "live")?.label || "—"}
          </div>}
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: AC, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {teamShortName(teams.away)}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{awayScore}</div>
        </div>
      </div>
      </>}

      {/* View toggle */}
      <div style={{ padding: "0 14px 8px" }}>
        <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: "1px solid #334155" }}>
          {[["totals", "Match Totals"], ["insights", "Match Insights"], ...(matchPlayPatterns ? [["visuals", "Visuals"]] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setViewTab(k)} style={{
              flex: 1, padding: "6px 0", textAlign: "center", fontSize: 9, fontWeight: 700,
              background: viewTab === k ? "#10B98122" : "#1E293B", color: viewTab === k ? "#10B981" : "#64748B",
              border: "none", cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Match Stats */}
      {viewTab === "totals" && (
        <div style={{ padding: "0 14px 20px" }}>
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Match Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #33415544" }}>
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: HC }}>{teamShortName(teams.home)}</div>
              <div style={{ width: 90 }} />
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: AC }}>{teamShortName(teams.away)}</div>
            </div>
            {[
              { label: "Possession", sub: "% of play", hVal: avgTerritory("home"), aVal: avgTerritory("away"), suffix: "%" },
              { label: "Territory", sub: "% in opp half", hVal: avgTerritory("home"), aVal: avgTerritory("away"), suffix: "%" },
              ...(totalStat("home", "atkZoneEntries") > 0 || totalStat("away", "atkZoneEntries") > 0
                ? [{ label: "Attack → D", sub: "attack zone to D entry", hVal: atkConv("home"), aVal: atkConv("away"), hDetail: `${totalStat("home", "dEntries")} of ${totalStat("home", "atkZoneEntries")}`, aDetail: `${totalStat("away", "dEntries")} of ${totalStat("away", "atkZoneEntries")}`, suffix: "%" }]
                : []),
              { label: "D → Short Crnr", sub: "% of D entries", hVal: dToSC("home"), aVal: dToSC("away"), hDetail: `${totalStat("home", "shortCorners")} of ${totalStat("home", "dEntries")}`, aDetail: `${totalStat("away", "shortCorners")} of ${totalStat("away", "dEntries")}`, suffix: "%" },
              { label: "SC → Goal", sub: "% of short corners", hVal: scToGoal("home"), aVal: scToGoal("away"), hDetail: `${totalStat("home", "scGoals")} of ${totalStat("home", "shortCorners")}`, aDetail: `${totalStat("away", "scGoals")} of ${totalStat("away", "shortCorners")}`, suffix: "%" },
              { label: "Shots taken", sub: "D Entry → Shot", hVal: dConv("home"), aVal: dConv("away"), hDetail: `${shotsTaken("home")} of ${totalStat("home", "dEntries")}`, aDetail: `${shotsTaken("away")} of ${totalStat("away", "dEntries")}`, suffix: "%" },
              { label: "On target", sub: "% of shots", hVal: onTargetPct("home"), aVal: onTargetPct("away"), hDetail: `${totalStat("home", "shotsOn")} of ${shotsTaken("home")}`, aDetail: `${totalStat("away", "shotsOn")} of ${shotsTaken("away")}`, suffix: "%" },
              { label: "Goals", sub: "% of shots on target", hVal: goalPct("home"), aVal: goalPct("away"), hDetail: `${homeScore} of ${totalStat("home", "shotsOn")}`, aDetail: `${awayScore} of ${totalStat("away", "shotsOn")}`, suffix: "%", color: "#F59E0B" },
            ].map((r, i, arr) => {
              const hColor = r.hVal > r.aVal ? "#10B981" : r.hVal < r.aVal ? "#EF4444" : "#F59E0B";
              const aColor = r.aVal > r.hVal ? "#10B981" : r.aVal < r.hVal ? "#EF4444" : "#F59E0B";
              return (
                <div key={r.label} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a2536" : "none" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: hColor }}>{r.hVal}{r.suffix}</div>
                    {r.hDetail && <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{r.hDetail}</div>}
                  </div>
                  <div style={{ textAlign: "center", width: 90 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: r.color || "#94A3B8" }}>{r.label}</div>
                    <div style={{ fontSize: 7, color: "#475569" }}>{r.sub}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: aColor }}>{r.aVal}{r.suffix}</div>
                    {r.aDetail && <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{r.aDetail}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-Match Averages */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Per-Match Averages</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #33415544" }}>
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: HC }}>{teamShortName(teams.home)}</div>
              <div style={{ width: 90 }} />
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: AC }}>{teamShortName(teams.away)}</div>
            </div>
            {(() => {
              const hAvg = seasonAvg?.home;
              const aAvg = seasonAvg?.away;
              const hGF = hAvg ? +hAvg.gf.toFixed(1) : homeScore;
              const aGF = aAvg ? +aAvg.gf.toFixed(1) : awayScore;
              const hGA = hAvg ? +hAvg.ga.toFixed(1) : awayScore;
              const aGA = aAvg ? +aAvg.ga.toFixed(1) : homeScore;
              const hGD = hAvg ? +hAvg.gd.toFixed(1) : hGF - hGA;
              const aGD = aAvg ? +aAvg.gd.toFixed(1) : aGF - aGA;
              const avgRows = [
                { label: "Goals For", hVal: hGF, aVal: aGF, higherBetter: true, color: "#F59E0B" },
                { label: "Goals Against", hVal: hGA, aVal: aGA, higherBetter: false },
                { label: "Goal Difference", hVal: hGD, aVal: aGD, higherBetter: true },
              ];
              return avgRows.map((r, i) => {
                const hBetter = r.higherBetter ? r.hVal > r.aVal : r.hVal < r.aVal;
                const aBetter = r.higherBetter ? r.aVal > r.hVal : r.aVal < r.hVal;
                const equal = r.hVal === r.aVal;
                const hColor = equal ? "#F59E0B" : hBetter ? "#10B981" : "#EF4444";
                const aColor = equal ? "#F59E0B" : aBetter ? "#10B981" : "#EF4444";
                const fmtVal = (v) => r.label === "Goal Difference" && v > 0 ? `+${v}` : `${v}`;
                return (
                  <div key={r.label} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: i < avgRows.length - 1 ? "1px solid #1a2536" : "none" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: hColor }}>{fmtVal(r.hVal)}</div>
                    </div>
                    <div style={{ textAlign: "center", width: 90 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: r.color || "#94A3B8" }}>{r.label}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: aColor }}>{fmtVal(r.aVal)}</div>
                    </div>
                  </div>
                );
              });
            })()}
            {seasonAvg && (seasonAvg.home || seasonAvg.away) && (
              <div style={{ fontSize: 8, color: "#475569", textAlign: "center", marginTop: 6 }}>
                {seasonAvg.home ? `${teamShortName(teams.home)}: ${seasonAvg.home.n} matches` : ""}{seasonAvg.home && seasonAvg.away ? " · " : ""}{seasonAvg.away ? `${teamShortName(teams.away)}: ${seasonAvg.away.n} matches` : ""}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "8px 0" }}>
            {[["#10B981", "Better"], ["#F59E0B", "Equal"], ["#EF4444", "Worse"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#64748B" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Match Insights Tab */}
      {viewTab === "insights" && (
        <div style={{ padding: "0 14px 14px" }}>
          {activeQs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 11 }}>No data yet — insights will appear as the match progresses</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Overall match insights */}
              {["home", "away"].map(t => {
                const ins = matchInsights[t];
                if (!ins || ins.length === 0) return null;
                const teamColor = t === "home" ? HC : AC;
                const strengths = ins.filter(i => i.type === "strength");
                const concerns = ins.filter(i => i.type !== "strength");
                // Find strongest/weakest periods
                const periodScores = activeQs.map(q => ({ label: q.label, score: q[t].dEntries + q[t].shotsOn + q[t].turnoversWon - q[t].possLost }));
                const strongest = periodScores.length > 0 ? periodScores.reduce((a, b) => b.score > a.score ? b : a).label : null;
                const weakest = periodScores.length > 1 ? periodScores.reduce((a, b) => b.score < a.score ? b : a).label : null;
                return (
                  <div key={t} style={{ background: "#1E293B", borderRadius: 10, borderLeft: `3px solid ${teamColor}`, border: "1px solid #33415544", borderLeftWidth: 3, borderLeftColor: teamColor, overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px 8px", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: teamColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#0B0F1A", flexShrink: 0 }}>
                        {teamInitial(teams[t])}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC" }}>{teamShortName(teams[t])}</div>
                      {strongest && <div style={{ fontSize: 9, color: "#475569", marginLeft: "auto" }}>Best: {strongest}{weakest && weakest !== strongest ? ` · Weakest: ${weakest}` : ""}</div>}
                    </div>
                    <div style={{ padding: "0 12px 10px" }}>
                      {strengths.map((i, idx) => (
                        <div key={`s${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
                          <span style={{ color: "#10B981", fontWeight: 700, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>+</span>
                          <span style={{ fontSize: 12, color: "#10B981", lineHeight: 1.5 }}>{i.text}</span>
                        </div>
                      ))}
                      {concerns.map((i, idx) => (
                        <div key={`c${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
                          <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>!</span>
                          <span style={{ fontSize: 12, color: "#F59E0B", lineHeight: 1.5 }}>{i.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visuals Tab */}
      {viewTab === "visuals" && matchPlayPatterns && playPatterns && (
        <div style={{ padding: "0 14px 20px" }}>
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", border: "1px solid #334155" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Play Pattern & Prominent Players</div>
            <PlayPatternField
              patterns={playPatterns}
              matchPatterns={matchPlayPatterns}
              prominentZones={prominentZones}
              matchProminentZones={matchProminentZones}
              ballLossZones={ballLossZones}
              matchBallLossZones={matchBallLossZones}
            />
          </div>
        </div>
      )}

      {!embedded && <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>}
    </Wrapper>
  );
}

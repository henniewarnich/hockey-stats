import { useState } from 'react';
import { theme } from '../utils/styles.js';
import { teamColor, teamInitial, teamShortName } from '../utils/teams.js';

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

export default function CoachLiveScreen({ match, events, matchTime, running, onBack, embedded }) {
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
          {[["totals", "Match Totals"], ["quarters", breakFormat === "quarters" ? "By Quarter" : "By Period"], ["insights", "Match Insights"]].map(([k, l]) => (
            <button key={k} onClick={() => setViewTab(k)} style={{
              flex: 1, padding: "6px 0", textAlign: "center", fontSize: 9, fontWeight: 700,
              background: viewTab === k ? "#10B98122" : "#1E293B", color: viewTab === k ? "#10B981" : "#64748B",
              border: "none", cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Match Totals */}
      {viewTab === "totals" && (
        <div style={{ padding: "0 14px 20px" }}>
          {/* Conversion rates */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Conversion Rates</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {["home", "away"].map(t => (
                <div key={t} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t === "home" ? HC : AC }}>
                    {teamShortName(teams[t])}
                  </div>
                </div>
              ))}
            </div>
            {[
              totalStat("home", "atkZoneEntries") > 0 || totalStat("away", "atkZoneEntries") > 0
                ? ["Attack → D", "attack zone to D entry", t => atkConv(t), t => `${totalStat(t, "dEntries")} of ${totalStat(t, "atkZoneEntries")}`, true]
                : null,
              ["D → Short Crnr", "% of D entries", t => dToSC(t), t => `${totalStat(t, "shortCorners")} of ${totalStat(t, "dEntries")}`],
              ["SC → Goal", "% of short corners", t => scToGoal(t), t => `${totalStat(t, "scGoals")} of ${totalStat(t, "shortCorners")}`, true, "#8B5CF6"],
              ["Shots taken", "D Entry → Shot", t => dConv(t), t => `${shotsTaken(t)} of ${totalStat(t, "dEntries")}`],
              ["On target", "% of shots", t => onTargetPct(t), t => `${totalStat(t, "shotsOn")} of ${shotsTaken(t)}`],
              ["Goals", "% of shots on target", t => goalPct(t), t => `${t === "home" ? homeScore : awayScore} of ${totalStat(t, "shotsOn")}`, false, "#F59E0B"],
            ].filter(Boolean).map(([label, sub, pctFn, detailFn, divider, color], i) => (
              <div key={label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: divider ? 0 : 8 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: color || "#F8FAFC" }}>{pctFn("home")}%</div>
                  <div style={{ fontSize: 9, color: "#94A3B8" }}>{detailFn("home")}</div>
                </div>
                <div style={{ width: 80, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: color || "#94A3B8", fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 8, color: "#475569" }}>{sub}</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: color || "#F8FAFC" }}>{pctFn("away")}%</div>
                  <div style={{ fontSize: 9, color: "#94A3B8" }}>{detailFn("away")}</div>
                </div>
              </div>
              {divider && <div style={{ borderBottom: "1px solid #33415544", margin: "8px 0" }} />}
              </div>
            ))}
          </div>

          {/* Short Corner Outcomes */}
          {(() => {
            const SKIP = new Set(['Ball forward', 'Ball back', 'Ball across', 'Ball in play', 'D Entry']);
            const computeSCO = (team) => {
              const out = { goal: 0, shotOn: 0, shotOff: 0, wonSC: 0, lostPoss: 0, deadBall: 0, other: 0 };
              const sorted = events.filter(e => e.team !== 'commentary' && e.team !== 'meta').sort((a, b) => (a.time || 0) - (b.time || 0));
              for (let i = 0; i < sorted.length; i++) {
                if (sorted[i].event !== 'Short Corner' || sorted[i].team !== team) continue;
                let found = false;
                for (let j = i + 1; j < sorted.length; j++) {
                  const n = sorted[j], ne = n.event || '';
                  if (SKIP.has(ne)) continue;
                  if (ne.startsWith('Goal') && n.team === team) { out.goal++; found = true; break; }
                  if (ne === 'Shot on Goal' && n.team === team) { out.shotOn++; found = true; break; }
                  if (ne === 'Shot Off Target' && n.team === team) { out.shotOff++; found = true; break; }
                  if (ne === 'Short Corner' && n.team === team) { out.wonSC++; found = true; break; }
                  if (ne === 'Dead Ball') { out.deadBall++; found = true; break; }
                  if (ne === 'Start' || (n.team !== team && !SKIP.has(ne))) { out.lostPoss++; found = true; break; }
                  if ((ne === 'Poss Conceded' || ne.startsWith('Sideline Out')) && n.team === team) { out.lostPoss++; found = true; break; }
                }
                if (!found) out.other++;
              }
              return out;
            };
            const hSCO = computeSCO('home');
            const aSCO = computeSCO('away');
            const hTotal = totalStat('home', 'shortCorners');
            const aTotal = totalStat('away', 'shortCorners');
            if (hTotal === 0 && aTotal === 0) return null;
            const rows = [
              { label: "⚽ Goal", key: "goal", color: "#F59E0B" },
              { label: "◉ Shot on", key: "shotOn", color: "#10B981" },
              { label: "○ Shot off", key: "shotOff", color: "#6B7280" },
              { label: "🔲 Won SC", key: "wonSC", color: "#8B5CF6" },
              { label: "✕ Lost poss", key: "lostPoss", color: "#EF4444" },
              { label: "⊘ Dead ball", key: "deadBall", color: "#94A3B8" },
            ];
            return (
              <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Short Corner Outcomes</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: HC }}>
                    {teamShortName(teams.home)} <span style={{ color: "#475569", fontWeight: 400 }}>({hTotal})</span>
                  </div>
                  <div style={{ width: 80 }} />
                  <div style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: AC }}>
                    {teamShortName(teams.away)} <span style={{ color: "#475569", fontWeight: 400 }}>({aTotal})</span>
                  </div>
                </div>
                {rows.filter(r => (hSCO[r.key] || 0) + (aSCO[r.key] || 0) > 0).map(r => (
                  <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: hSCO[r.key] ? r.color : "#333" }}>{hSCO[r.key] || 0}</span>
                      {hTotal > 0 && hSCO[r.key] > 0 && <span style={{ fontSize: 8, color: "#475569", marginLeft: 3 }}>{Math.round(hSCO[r.key] / hTotal * 100)}%</span>}
                    </div>
                    <div style={{ width: 80, textAlign: "center", fontSize: 9, color: r.color, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: aSCO[r.key] ? r.color : "#333" }}>{aSCO[r.key] || 0}</span>
                      {aTotal > 0 && aSCO[r.key] > 0 && <span style={{ fontSize: 8, color: "#475569", marginLeft: 3 }}>{Math.round(aSCO[r.key] / aTotal * 100)}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Zone Control — time-based */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Zone Control</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: HC }} />
                <span style={{ color: HC }}>{teamShortName(teams.home)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}>
                <span style={{ color: AC }}>{teamShortName(teams.away)}</span>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: AC }} />
              </div>
            </div>
            {(() => {
              const zoned = events
                .filter(e => e.team !== "commentary" && e.team !== "meta" && e.zone)
                .sort((a, b) => (a.time || 0) - (b.time || 0));
              const time = { attack: { home: 0, away: 0 }, midfield: { home: 0, away: 0 }, defense: { home: 0, away: 0 } };
              for (let i = 0; i < zoned.length - 1; i++) {
                const ev = zoned[i];
                const dur = (zoned[i + 1].time || 0) - (ev.time || 0);
                if (dur <= 0 || dur > 300) continue;
                const z = ev.zone || "";
                const isOppQ = z.includes("Opp Quarter");
                const isOwnQ = z.includes("Own Quarter");
                let area = "midfield";
                if (ev.team === "home") {
                  area = isOppQ ? "attack" : isOwnQ ? "defense" : "midfield";
                } else {
                  area = isOwnQ ? "attack" : isOppQ ? "defense" : "midfield";
                }
                if (ev.team === "home" || ev.team === "away") time[area][ev.team] += dur;
              }
              const totalH = time.attack.home + time.midfield.home + time.defense.home || 1;
              const totalA = time.attack.away + time.midfield.away + time.defense.away || 1;
              const zones = [
                { label: "Attack", home: time.attack.home, away: time.attack.away },
                { label: "Midfield", home: time.midfield.home, away: time.midfield.away },
                { label: "Defense", home: time.defense.home, away: time.defense.away },
              ];
              return (
                <>
                {zones.map(z => {
                  const hPct = Math.round(z.home / totalH * 100);
                  const aPct = Math.round(z.away / totalA * 100);
                  return (
                    <div key={z.label} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>{z.label}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* Home bar */}
                        <div style={{ width: 28, fontSize: 11, fontWeight: 900, color: HC, textAlign: "right" }}>{hPct}%</div>
                        <div style={{ flex: 1, height: 14, borderRadius: 4, background: "#0B0F1A", overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
                          <div style={{ width: `${Math.max(hPct, 3)}%`, background: `rgba(34,197,94,${0.25 + hPct * 0.005})`, borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        {/* Away bar */}
                        <div style={{ flex: 1, height: 14, borderRadius: 4, background: "#0B0F1A", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(aPct, 3)}%`, background: `rgba(148,163,184,${0.15 + aPct * 0.004})`, borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        <div style={{ width: 28, fontSize: 11, fontWeight: 900, color: AC }}>{aPct}%</div>
                      </div>
                    </div>
                  );
                })}
                </>
              );
            })()}
            <div style={{ textAlign: "center", fontSize: 9, color: "#475569", marginTop: 4 }}>
              Overall: <span style={{ color: HC, fontWeight: 700 }}>{avgTerritory("home")}%</span> – <span style={{ color: AC, fontWeight: 700 }}>{avgTerritory("away")}%</span> · Time-based
            </div>
          </div>
        </div>
      )}

      {/* Quarters Tab */}
      {viewTab === "quarters" && (
        <div style={{ padding: "0 14px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {quarterData.map(q => {
              const isExp = expandedQ === q.label;
              const isLive = q.status === "live";
              const isUpcoming = q.status === "upcoming";

              return (
                <div key={q.label} style={{ borderRadius: 8, overflow: "hidden", border: isLive ? "1px solid #10B98133" : "1px solid #1E293B", opacity: isUpcoming ? 0.3 : 1 }}>
                  {/* Header */}
                  <div onClick={() => !isUpcoming && setExpandedQ(isExp ? null : q.label)} style={{
                    display: "flex", alignItems: "center", padding: "8px 12px",
                    background: isLive ? "#10B98108" : "#1E293B", cursor: isUpcoming ? "default" : "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: isLive ? "#10B981" : "#F8FAFC", width: 22 }}>{q.label}</div>
                      {isLive && !isEnded && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#10B98122", color: "#10B981" }}>LIVE</span>}
                      {isUpcoming && <span style={{ fontSize: 9, color: "#475569" }}>Upcoming</span>}
                    </div>
                    {!isUpcoming && (
                      <div style={{ fontSize: 12, fontWeight: 800 }}>
                        <span style={{ color: HC }}>{q.home.goals}</span>
                        <span style={{ color: "#475569", margin: "0 4px" }}>–</span>
                        <span style={{ color: AC }}>{q.away.goals}</span>
                      </div>
                    )}
                    {!isUpcoming && <span style={{ fontSize: 10, color: "#334155", marginLeft: 8, transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>}
                  </div>

                  {/* Expanded stats */}
                  {isExp && !isUpcoming && (() => {
                    const qConvRate = (t) => { const s = q[t].shotsOn + q[t].shotsOff; const g = q[t].goals; return s > 0 ? Math.round(g / s * 100) : 0; };
                    const qDConv = (t) => { const d = q[t].dEntries; const s = q[t].shotsOn + q[t].shotsOff; return d > 0 ? Math.round(s / d * 100) : 0; };
                    const qAtkConv = (t) => { const a = q[t].atkZoneEntries; const d = q[t].dEntries; return a > 0 ? Math.round(d / a * 100) : 0; };
                    const qShots = (t) => q[t].shotsOn + q[t].shotsOff;
                    const qOnPct = (t) => { const s = qShots(t); return s > 0 ? Math.round(q[t].shotsOn / s * 100) : 0; };
                    const qGoalPct = (t) => { const on = q[t].shotsOn; return on > 0 ? Math.round(q[t].goals / on * 100) : 0; };
                    const qDToSC = (t) => { const d = q[t].dEntries; return d > 0 ? Math.round(q[t].shortCorners / d * 100) : 0; };
                    const qSCGoal = (t) => { const sc = q[t].shortCorners; return sc > 0 ? Math.round(q[t].scGoals / sc * 100) : 0; };
                    const hEvents = events.filter(e => e.team === "home" && e.time >= q.start && e.time <= q.end && e.team !== "commentary" && e.team !== "meta").length;
                    const aEvents = events.filter(e => e.team === "away" && e.time >= q.start && e.time <= q.end && e.team !== "commentary" && e.team !== "meta").length;
                    const possTotal = hEvents + aEvents || 1;
                    const hPoss = Math.round(hEvents / possTotal * 100);
                    const aPoss = 100 - hPoss;

                    const QStatBar = ({ hVal, aVal, label, suffix = "" }) => {
                      const total = hVal + aVal;
                      const hPct = total > 0 ? (hVal / total) * 100 : 50;
                      const aPct = total > 0 ? (aVal / total) * 100 : 50;
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                          <div style={{ width: 26, fontSize: 11, fontWeight: 800, textAlign: "right", fontFamily: "monospace", color: hVal >= aVal ? HC : "#64748B" }}>{hVal}{suffix}</div>
                          <div style={{ flex: 1, display: "flex", height: 6, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${hPct}%`, background: HC }} />
                            <div style={{ width: `${aPct}%`, background: AC }} />
                          </div>
                          <div style={{ width: 26, fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: aVal >= hVal ? AC : "#64748B" }}>{aVal}{suffix}</div>
                          <div style={{ width: 74, fontSize: 9, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
                        </div>
                      );
                    };

                    return (
                      <div style={{ padding: "6px 12px 10px", background: "#0B0F1A" }}>
                        {/* Conversion rates */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #1E293B" }}>
                          {["home", "away"].map(t => (
                            <div key={t} style={{ flex: 1, textAlign: "center" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: t === "home" ? HC : AC, marginBottom: 4 }}>
                                {teamShortName(teams[t])}
                              </div>
                              {(q.home.atkZoneEntries > 0 || q.away.atkZoneEntries > 0) && <>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#F8FAFC" }}>{qAtkConv(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>Attack → D</div>
                              </>}
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#F8FAFC", marginTop: 4 }}>{qDToSC(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>D → Short Crnr</div>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#8B5CF6", marginTop: 4 }}>{qSCGoal(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>SC → Goal</div>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#F8FAFC", marginTop: 4 }}>{qDConv(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>Shots taken</div>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#F8FAFC", marginTop: 4 }}>{qOnPct(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>On target</div>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#F59E0B", marginTop: 4 }}>{qGoalPct(t)}%</div>
                              <div style={{ fontSize: 9, color: "#CBD5E1" }}>Goals</div>
                            </div>
                          ))}
                        </div>

                        {/* Stat bars */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {DISPLAY_STATS.map(({ label, calc, suffix }) => (
                            <QStatBar key={label} hVal={calc(q.home)} aVal={calc(q.away)} label={label} suffix={suffix || ""} />
                          ))}
                        </div>

                        {/* Period Insights */}
                        {(() => {
                          const hIns = generatePeriodInsights(q.home, q.away, teamShortName(teams.home), teamShortName(teams.away));
                          const aIns = generatePeriodInsights(q.away, q.home, teamShortName(teams.away), teamShortName(teams.home));
                          if (hIns.length === 0 && aIns.length === 0) return null;
                          const InsightIcon = ({ type }) => (
                            <span style={{ fontSize: 10, marginRight: 3, fontWeight: 700 }}>{type === "strength" ? "+" : type === "weakness" ? "!" : "■"}</span>
                          );
                          return (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1E293B" }}>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Coach Insights</div>
                              <div style={{ display: "flex", gap: 8 }}>
                                {[["home", hIns], ["away", aIns]].map(([t, ins]) => ins.length > 0 && (
                                  <div key={t} style={{ flex: 1 }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: t === "home" ? HC : AC, marginBottom: 4 }}>
                                      {teamShortName(teams[t])}
                                    </div>
                                    {ins.map((i, idx) => (
                                      <div key={idx} style={{ fontSize: 9, color: i.type === "strength" ? "#22C55E" : "#94A3B8", lineHeight: 1.4, marginBottom: 2 }}>
                                        <InsightIcon type={i.type} />{i.text}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
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

              {/* Per-period breakdown */}
              <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 }}>Period Breakdown</div>
              {activeQs.map(q => {
                const hIns = generatePeriodInsights(q.home, q.away, teamShortName(teams.home), teamShortName(teams.away));
                const aIns = generatePeriodInsights(q.away, q.home, teamShortName(teams.away), teamShortName(teams.home));
                if (hIns.length === 0 && aIns.length === 0) return null;
                return (
                  <div key={q.label} style={{ background: "#1E293B", borderRadius: 10, border: "1px solid #33415544", overflow: "hidden" }}>
                    <div style={{ padding: "8px 12px", background: "#0B0F1A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#F8FAFC" }}>{q.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>
                        <span style={{ color: HC }}>{q.home.goals}</span>
                        <span style={{ color: "#475569", margin: "0 4px" }}>–</span>
                        <span style={{ color: AC }}>{q.away.goals}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 0, borderTop: "1px solid #33415544" }}>
                      {[["home", hIns], ["away", aIns]].map(([t, ins]) => (
                        <div key={t} style={{ flex: 1, padding: "8px 10px", borderRight: t === "home" ? "1px solid #33415533" : "none" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t === "home" ? HC : AC, marginBottom: 4 }}>
                            {teamShortName(teams[t])}
                          </div>
                          {ins.length === 0 ? (
                            <div style={{ fontSize: 9, color: "#33415588" }}>—</div>
                          ) : ins.map((i, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 4, padding: "2px 0" }}>
                              <span style={{ color: i.type === "strength" ? "#10B981" : "#F59E0B", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{i.type === "strength" ? "+" : "!"}</span>
                              <span style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.4 }}>{i.text}</span>
                            </div>
                          ))}
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

      {!embedded && <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>}
    </Wrapper>
  );
}

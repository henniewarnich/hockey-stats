-- ============================================
-- Match Report: Bloemhof Girls Hockey 1st vs Paarl Girls Hockey 1st
-- 15 May 2026 · League @ Bloemhof · BLO 2-0 PAA
-- Match ID: 232a42a5-2f84-4bdd-9168-f6761d3d5d85
-- ============================================
-- Run in Supabase SQL editor (production). Idempotent — re-running
-- via ON CONFLICT (match_id, report_type) DO UPDATE refreshes the
-- HTML and bumps generated_at.

INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '232a42a5-2f84-4bdd-9168-f6761d3d5d85',
  'analysis',
  'Bloemhof vs Paarl Girls — 15 May 2026',
  $html$<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Bloemhof vs Paarl Girls — 15 May 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#0B0F1A; color:#CBD5E1; font-family:'Outfit',sans-serif; min-height:100vh; }
.wrap { max-width:480px; margin:0 auto; padding:20px 16px 40px; }
.logo-bar { text-align:center; margin-bottom:24px; opacity:0.85; }
.logo-bar svg { vertical-align:middle; }
.logo-bar span { font-size:20px; font-weight:900; color:#F59E0B; margin-left:8px; vertical-align:middle; }
.logo-bar .sub { font-size:10px; font-weight:600; color:#64748B; letter-spacing:2px; text-transform:uppercase; margin-left:6px; vertical-align:middle; }
.match-header { text-align:center; margin-bottom:28px; }
.match-type { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#64748B; margin-bottom:14px; }
.teams-row { display:flex; align-items:center; justify-content:center; gap:16px; margin-bottom:10px; }
.team-badge { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; color:#fff; }
.score-box { font-size:36px; font-weight:900; color:#F8FAFC; letter-spacing:4px; }
.score-box .dash { color:#334155; margin:0 2px; }
.team-names { display:flex; justify-content:center; gap:40px; font-size:13px; font-weight:700; color:#94A3B8; }
.match-meta { font-size:10px; color:#475569; margin-top:8px; }
.section-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:#94A3B8; margin:28px 0 14px; }
.verdict { background:linear-gradient(135deg,#1E293B 0%,#0F172A 100%); border:1px solid #334155; border-radius:14px; padding:22px; text-align:center; margin-bottom:8px; position:relative; overflow:hidden; }
.verdict::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#F59E0B,#10B981); }
.verdict .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#64748B; margin-bottom:6px; }
.verdict .team { font-size:22px; font-weight:900; color:#F59E0B; }
.verdict .desc { font-size:12px; color:#94A3B8; margin-top:8px; line-height:1.6; }
.stat-compare { background:#1E293B; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:8px; }
.stat-row { display:flex; align-items:center; padding:10px 0; border-bottom:1px solid #1a2332; }
.stat-row:last-child { border-bottom:none; }
.stat-val { width:36px; font-size:16px; font-weight:800; text-align:center; }
.stat-val.win { color:#10B981; } .stat-val.lose { color:#64748B; } .stat-val.draw { color:#F59E0B; }
.stat-label { flex:1; text-align:center; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; padding:0 8px; }
.stat-bar-wrap { flex:1; display:flex; align-items:center; gap:6px; }
.stat-bar-wrap.left { justify-content:flex-end; } .stat-bar-wrap.right { justify-content:flex-start; }
.stat-bar { height:6px; border-radius:3px; min-width:4px; }
.stat-bar.green { background:linear-gradient(90deg,#10B98155,#10B981); }
.stat-bar.dim { background:linear-gradient(90deg,#33415555,#475569); }
.dna-row { display:flex; gap:10px; margin-bottom:8px; }
.dna-card { flex:1; background:#1E293B; border:1px solid #334155; border-radius:12px; padding:14px 12px; text-align:center; }
.dna-card .team-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#94A3B8; margin-bottom:12px; }
.dna-bar-group { display:flex; flex-direction:column; gap:8px; }
.dna-bar-row { display:flex; align-items:center; gap:6px; }
.dna-bar-label { font-size:9px; font-weight:600; color:#64748B; width:48px; text-align:right; }
.dna-bar-track { flex:1; height:8px; background:#0B0F1A; border-radius:4px; overflow:hidden; }
.dna-bar-fill { height:100%; border-radius:4px; }
.dna-bar-pct { font-size:10px; font-weight:800; width:32px; text-align:left; }
.fwd { color:#10B981; } .fwd .dna-bar-fill { background:#10B981; }
.acr { color:#F59E0B; } .acr .dna-bar-fill { background:#F59E0B; }
.bck { color:#F87171; } .bck .dna-bar-fill { background:#F87171; }
.insight-grid { display:flex; flex-direction:column; gap:8px; margin-bottom:8px; }
.insight-box { background:#1E293B; border-radius:12px; padding:14px 16px; border-left:4px solid; }
.insight-box.green { border-left-color:#10B981; }
.insight-box.red { border-left-color:#F87171; }
.insight-box .insight-title { font-size:12px; font-weight:800; color:#F8FAFC; margin-bottom:4px; }
.insight-box .insight-text { font-size:11px; color:#94A3B8; line-height:1.5; }
.narrative { background:linear-gradient(135deg,#1E293B 0%,#0F172A 100%); border:1px solid #334155; border-left:3px solid #F59E0B; border-radius:14px; padding:22px; margin-bottom:8px; }
.narrative p { font-size:12px; line-height:1.7; color:#94A3B8; margin-bottom:10px; }
.narrative p:last-child { margin-bottom:0; }
.narrative strong { color:#CBD5E1; }
.footer { text-align:center; margin-top:32px; padding-top:16px; border-top:1px solid #1E293B; font-size:9px; color:#334155; letter-spacing:1px; }
.footer a { color:#F59E0B; text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/>
      <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/>
      <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <span>kykie</span><span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Girls 1st XI Hockey · League</div>
    <div class="teams-row">
      <div class="team-badge" style="background:linear-gradient(135deg,#8B0000,#2F0000);">BL</div>
      <div class="score-box">2<span class="dash">–</span>0</div>
      <div class="team-badge" style="background:linear-gradient(135deg,#1B4D3E,#091A15);">PG</div>
    </div>
    <div class="team-names"><span>Bloemhof</span><span>Paarl Girls</span></div>
    <div class="match-meta">15 May 2026 · @ Bloemhof · BLO 56% vs PAA 44% possession</div>
  </div>
  <div class="section-title">Full-time verdict</div>
  <div class="verdict">
    <div class="label">Match won by</div>
    <div class="team">Bloemhof</div>
    <div class="desc">Controlled the match from start to finish. 56% possession, 6 short corners to 2, and two goals inside the opening minutes of Q3 to break a goalless first half.</div>
  </div>
  <div class="section-title">Head to head</div>
  <div class="stat-compare"><div id="stats"></div></div>
  <div class="section-title">Ball movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Bloemhof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><span class="dna-bar-label">Forward</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:54%"></div></div><span class="dna-bar-pct">54%</span></div>
        <div class="dna-bar-row acr"><span class="dna-bar-label">Across</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:32%"></div></div><span class="dna-bar-pct">32%</span></div>
        <div class="dna-bar-row bck"><span class="dna-bar-label">Back</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:14%"></div></div><span class="dna-bar-pct">14%</span></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><span class="dna-bar-label">Forward</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:67%"></div></div><span class="dna-bar-pct">67%</span></div>
        <div class="dna-bar-row acr"><span class="dna-bar-label">Across</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:20%"></div></div><span class="dna-bar-pct">20%</span></div>
        <div class="dna-bar-row bck"><span class="dna-bar-label">Back</span><div class="dna-bar-track"><div class="dna-bar-fill" style="width:13%"></div></div><span class="dna-bar-pct">13%</span></div>
      </div>
    </div>
  </div>
  <div class="section-title">Bloemhof — What Worked</div>
  <div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clinical When It Mattered</div><div class="insight-text">2 goals from 6 shots on target (33% conversion). Paarl Girls also hit the target 5 times but couldn't break through. Bloemhof took their chances; Paarl Girls didn't.</div></div>
    <div class="insight-box green"><div class="insight-title">Set-Piece Pressure</div><div class="insight-text">6 short corners to Paarl Girls's 2. The pressure forced Paarl Girls into defending second-phase plays and conceded the territorial battle.</div></div>
    <div class="insight-box green"><div class="insight-title">Ruled the D</div><div class="insight-text">30 D entries to 24 and 66 attack chances to 51. Bloemhof spent more time in the danger zone and won the structural battle that decides matches.</div></div>
    <div class="insight-box green"><div class="insight-title">Q3 Strike</div><div class="insight-text">Both goals scored within the first 4½ minutes of Q3 (18:21 and 19:38). A textbook second-half-restart hammer-blow that put the result beyond reach.</div></div>
  </div>
  <div class="section-title">Bloemhof — What Fell Short</div>
  <div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Wasteful Shooting</div><div class="insight-text">9 shots off target — 60% of total shots missed entirely. Against a more clinical opponent that's a result-changing inefficiency.</div></div>
    <div class="insight-box red"><div class="insight-title">Sloppy in Transition</div><div class="insight-text">118 possessions lost across the match. Bloemhof kept winning the ball back (80 turnovers) but kept giving it away just as fast.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corners Unconverted</div><div class="insight-text">6 short corners earned, 0 SC goals. The chances were there — converting one would've turned a tight 2–0 into a comfortable 3–0.</div></div>
  </div>
  <div class="section-title">Paarl Girls — What Worked</div>
  <div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Perfect Shot Accuracy</div><div class="insight-text">5 shots, 5 on target. 100% accuracy — every shot tested the keeper. Against Bloemhof's 40% on-target rate, this is a striking dataset.</div></div>
    <div class="insight-box green"><div class="insight-title">Forward-Direct Intent</div><div class="insight-text">67% of ball movement was forward — 13 points above Bloemhof's 54%. Paarl Girls played with purpose; they didn't pass sideways.</div></div>
    <div class="insight-box green"><div class="insight-title">Press Was On</div><div class="insight-text">86 turnovers won — slightly more than Bloemhof's 80. The midfield press worked. The problem was what followed.</div></div>
    <div class="insight-box green"><div class="insight-title">Overhead Outlet</div><div class="insight-text">6 overheads thrown to Bloemhof's 3. When pressed, Paarl Girls used the long ball to escape — and it usually found a teammate.</div></div>
  </div>
  <div class="section-title">Paarl Girls — What Fell Short</div>
  <div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">No Final Ball</div><div class="insight-text">5 shots on target, 0 goals. The keeper saved everything. A team that creates this much pressure needs to convert at least one — and didn't.</div></div>
    <div class="insight-box red"><div class="insight-title">Set-Piece Drought</div><div class="insight-text">Only 2 short corners earned, against 6 conceded. The penalty-area chaos Paarl Girls needed simply wasn't there.</div></div>
    <div class="insight-box red"><div class="insight-title">Couldn't Hold the Ball</div><div class="insight-text">129 possessions lost — 9 more than Bloemhof. The 67% forward play came at the cost of constant turnovers in dangerous areas.</div></div>
  </div>
  <div class="section-title">The story of the match</div>
  <div class="narrative">
    <p><strong>Bloemhof</strong> controlled this from the first whistle. 56% possession, 30 D entries, and 6 short corners earned — every structural marker pointed home. <strong>Paarl Girls</strong> matched them in midfield combat (86 turnovers won to 80) but couldn't translate that into the same volume of attacking moments.</p>
    <p>The first half ended goalless despite the territorial gap. Paarl Girls had hit the target three times in the opening 10 minutes — Bloemhof's keeper held firm. The Q1 break came at 0–0 with Paarl Girls actually edging the early aggression. By the end of Q2 it was still scoreless, but Bloemhof had begun to settle into their pattern of patient build-ups and lateral switching (32% of their ball movement went across).</p>
    <p>The match was decided in <strong>just under five minutes of Q3</strong>. Bloemhof's first goal arrived at 18:21 — a textbook D entry, shot on goal, finish. The second came 1:17 later at 19:38. Paarl Girls never recovered from the body blow. They kept pressing — 4 of their 5 shots came in the second half — but found a Bloemhof goalkeeper in inspired form.</p>
    <p>Bloemhof's clinical edge — 2 goals from 6 on-target shots versus Paarl Girls's 0 from 5 — was the difference. Final score: <strong style="color:#F59E0B;">2–0</strong>.</p>
  </div>
  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 15 MAY 2026 · <a href="https://kykie.net">kykie.net</a></div>
</div>
<script>
const stats = [
  { label: 'Possession',       h: 56,  a: 44,  isPct: true },
  { label: 'Territory',        h: 49,  a: 45,  isPct: true },
  { label: 'Turnovers Won',    h: 80,  a: 86 },
  { label: 'Possession Lost',  h: 118, a: 129, lowerBetter: true },
  { label: 'Attack Chances',   h: 66,  a: 51 },
  { label: 'D Entries',        h: 30,  a: 24 },
  { label: 'Short Corners',    h: 6,   a: 2 },
  { label: 'Shots',            h: 15,  a: 5 },
  { label: 'Shots on Target',  h: 6,   a: 5 },
  { label: 'Open Play Goals',  h: 2,   a: 0 },
  { label: 'SC Goals',         h: 0,   a: 0 },
];
const container = document.getElementById('stats');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement('div');
  row.className = 'stat-row';
  row.innerHTML = `
    <div class="stat-val ${tied ? 'draw' : hWin ? 'win' : 'lose'}">${s.h}${s.isPct ? '%' : ''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? 'green' : 'dim'}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? 'green' : 'dim'}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? 'draw' : aWin ? 'win' : 'lose'}">${s.a}${s.isPct ? '%' : ''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>$html$
)
ON CONFLICT (match_id, report_type) DO UPDATE
  SET title        = EXCLUDED.title,
      html_content = EXCLUDED.html_content,
      generated_at = NOW();

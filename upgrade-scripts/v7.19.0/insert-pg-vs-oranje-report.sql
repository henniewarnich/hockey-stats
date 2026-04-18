-- Insert match report: Paarl Girls vs Oranje, 18 April 2026
-- Coach-only sections wrapped in <div class="coach-only">
INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'a704a31e-f3ca-40ec-9a81-c3752130fca3',
  'analysis',
  'Paarl Girls vs Oranje — Match Analysis — 18 April 2026',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs Oranje</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0B0F1A; color: #CBD5E1; font-family: ''Outfit'', sans-serif; min-height: 100vh; }
  .wrap { max-width: 480px; margin: 0 auto; padding: 20px 16px 40px; }

  .logo-bar { text-align: center; margin-bottom: 24px; opacity: 0.7; }
  .logo-bar svg { vertical-align: middle; }
  .logo-bar span { font-size: 18px; font-weight: 900; color: #F59E0B; margin-left: 6px; vertical-align: middle; }
  .logo-bar .sub { font-size: 10px; font-weight: 600; color: #64748B; letter-spacing: 2px; text-transform: uppercase; margin-left: 4px; }

  .match-header { text-align: center; margin-bottom: 28px; }
  .match-type { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #64748B; margin-bottom: 12px; }
  .teams-row { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px; }
  .team-badge { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff; }
  .score-box { font-size: 36px; font-weight: 900; color: #F8FAFC; letter-spacing: 4px; }
  .score-box .dash { color: #334155; margin: 0 2px; }
  .team-names { display: flex; justify-content: center; gap: 40px; font-size: 13px; font-weight: 700; color: #94A3B8; }
  .match-meta { font-size: 10px; color: #475569; margin-top: 8px; }

  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin: 28px 0 14px; }

  .verdict { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 8px; position: relative; overflow: hidden; }
  .verdict::before { content: ''''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #F59E0B, #10B981); }
  .verdict .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #64748B; margin-bottom: 6px; }
  .verdict .team { font-size: 22px; font-weight: 900; color: #F59E0B; }
  .verdict .desc { font-size: 12px; color: #94A3B8; margin-top: 6px; line-height: 1.5; }

  .stat-compare { background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
  .stat-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #1a2332; }
  .stat-row:last-child { border-bottom: none; }
  .stat-val { width: 36px; font-size: 16px; font-weight: 800; text-align: center; }
  .stat-val.win { color: #10B981; }
  .stat-val.lose { color: #64748B; }
  .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; }
  .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; transition: width 0.6s ease; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }

  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }

  .halves { display: flex; gap: 10px; margin-bottom: 8px; }
  .half-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px; }
  .half-card .half-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; text-align: center; margin-bottom: 12px; }
  .half-team { margin-bottom: 10px; } .half-team:last-child { margin-bottom: 0; }
  .half-team-name { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .half-team-name.pg { color: #DC143C; }
  .half-team-name.or { color: #FF8C00; }
  .half-stats { display: flex; flex-wrap: wrap; gap: 4px; }
  .half-stat { background: #0B0F1A; border-radius: 6px; padding: 4px 7px; font-size: 9px; font-weight: 600; color: #94A3B8; }
  .half-stat strong { color: #CBD5E1; font-weight: 800; }

  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; }
  .insight-box.red { border-left-color: #F87171; }
  .insight-box.amber { border-left-color: #F59E0B; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }

  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; }
  .narrative strong { color: #CBD5E1; }

  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">

  <!-- Kykie logo -->
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/>
      <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/>
      <line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>

  <!-- Match header -->
  <div class="match-header">
    <div class="match-type">League · Full Time · 60 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background: linear-gradient(135deg, #DC143C, #A01030);">PG</div></div>
      <div class="score-box">1 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background: linear-gradient(135deg, #FF8C00, #CC7000);">OR</div></div>
    </div>
    <div class="team-names">
      <span>Paarl Girls</span>
      <span>Oranje</span>
    </div>
    <div class="match-meta">
      <span>18 April 2026</span> · <span>Home: Paarl Girls</span> · <span>41/59 possession</span>
    </div>
  </div>

  <!-- Verdict -->
  <div class="verdict">
    <div class="label">Dominated by</div>
    <div class="team">Oranje</div>
    <div class="desc">57 D entries, 18 shots on goal, 75 turnovers won.<br>The 1–2 scoreline flatters Paarl Girls enormously.</div>
  </div>

  <!-- Stat comparison -->
  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <!-- Ball Movement DNA -->
  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:62%"></div></div><div class="dna-bar-pct">62%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:5%"></div></div><div class="dna-bar-pct">5%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:9%"></div></div><div class="dna-bar-pct">9%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:44%"></div></div><div class="dna-bar-pct">44%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:47%"></div></div><div class="dna-bar-pct">47%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">

  <!-- Paarl Girls insights -->
  <div class="section-title">Paarl Girls — What Worked</div>
  <div class="insight-grid">
    <div class="insight-box green">
      <div class="insight-title">Heroic Defensive Effort</div>
      <div class="insight-text">Conceded only 2 goals from 57 D entries, 29 shots, and 9 short corners. A 3.5% D-entry-to-goal conversion rate for Oranje tells you everything — Paarl Girls defended the circle with their lives.</div>
    </div>
    <div class="insight-box green">
      <div class="insight-title">Fierce First-Half Press</div>
      <div class="insight-text">29 turnovers won in the first half — more than most teams manage in an entire match. The pressing intensity was elite, even while being pinned back.</div>
    </div>
    <div class="insight-box green">
      <div class="insight-title">Overhead Escape Route</div>
      <div class="insight-text">16 overheads (vs Oranje''s 1) — the aerial game was the only way to relieve Oranje''s suffocating press. 62% of ball movement went forward, showing direct intent even under siege.</div>
    </div>
    <div class="insight-box green">
      <div class="insight-title">Late Short Corner Conversion</div>
      <div class="insight-text">Scored from a short corner in the fourth quarter to make it 1-2. All 3 short corners and both shots on goal came in the second half — the team grew into the game when it mattered most.</div>
    </div>
  </div>

  <div class="section-title">Paarl Girls — What Fell Short</div>
  <div class="insight-grid">
    <div class="insight-box red">
      <div class="insight-title">Couldn''t Get Into the Game</div>
      <div class="insight-text">10 D entries in 60 minutes against a team that had 57 going the other way. Zero shots on goal in the entire first half. Paarl Girls barely threatened Oranje''s circle.</div>
    </div>
    <div class="insight-box red">
      <div class="insight-title">Ball Retention Collapsed</div>
      <div class="insight-text">87 possessions lost — the highest of any detailed match this season. Oranje won 75 turnovers. Paarl Girls won it, then lost it, over and over. The direct style (62% forward) meant less control.</div>
    </div>
    <div class="insight-box red">
      <div class="insight-title">Press Faded After Half Time</div>
      <div class="insight-text">Turnovers won dropped from 29 (1st half) to 18 (2nd half). At the same time Oranje''s D entries rose from 26 to 31 and their short corners from 2 to 7. The energy to press couldn''t sustain for 60 minutes.</div>
    </div>
  </div>

  <!-- Oranje insights -->
  <div class="section-title">Oranje — What Worked</div>
  <div class="insight-grid">
    <div class="insight-box green">
      <div class="insight-title">Total Territorial Domination</div>
      <div class="insight-text">59% possession, 61% territory. 57 D entries is extraordinary for any match. They lived in Paarl Girls'' half and dictated the tempo throughout, recycling patiently (47% back, 44% across).</div>
    </div>
    <div class="insight-box green">
      <div class="insight-title">Turnover Machine</div>
      <div class="insight-text">75 turnovers won — dismantled every Paarl Girls build-up attempt. Combined with only 9% forward ball movement, they strangled the game: win it, recycle, probe, repeat.</div>
    </div>
    <div class="insight-box green">
      <div class="insight-title">Second-Half Intensification</div>
      <div class="insight-text">Stepped up after half time — 31 D entries (vs 26), 7 short corners (vs 2), 39 turnovers (vs 36). Scored their second from a short corner. The longer the match went, the more dominant they became.</div>
    </div>
  </div>

  <div class="section-title">Oranje — What Fell Short</div>
  <div class="insight-grid">
    <div class="insight-box red">
      <div class="insight-title">Wasteful Finishing</div>
      <div class="insight-text">57 D entries, 18 shots on goal, 11 off target — but only 2 goals. A 3.5% D-entry-to-goal rate is poor for this level of domination. This should have been 5 or 6 nil.</div>
    </div>
    <div class="insight-box red">
      <div class="insight-title">Short Corner Conversion</div>
      <div class="insight-text">1 goal from 9 short corners (11%). For a team earning that volume, the set piece conversion rate is disappointing. Paarl Girls defended the injection well and charged aggressively.</div>
    </div>
    <div class="insight-box red">
      <div class="insight-title">Allowed a Late Goal</div>
      <div class="insight-text">At 2-0 up with total control, conceding from a short corner in Q4 is careless. The concentration dropped after the second goal. Against a better team, that lapse could cost them a result.</div>
    </div>
  </div>

  <!-- Final narrative -->
  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was <strong>total domination by Oranje</strong> from start to finish. 57 D entries, 29 shots, 75 turnovers won, 59% possession — every number tells the same story. They scored early through open play, then ground Paarl Girls down with patient possession (47% of passes going backwards, just 9% forward).</p>
    <p><strong>Paarl Girls</strong> had no answer in open play. 10 D entries, zero shots on goal in the first half. Their only weapons were a ferocious press (47 turnovers, 29 in the first half) and 16 overheads to relieve pressure. When they couldn''t play through Oranje''s midfield, they went over it.</p>
    <p>The second half told two stories. Oranje intensified — 31 D entries, 7 short corners — and scored their second from a set piece. But Paarl Girls found something too. All 3 of their short corners came in the second half, and they converted one in Q4 to make it <strong style="color:#F59E0B;">1-2</strong>.</p>
    <p>The scoreline doesn''t reflect the match. Oranje''s finishing — 2 goals from 57 D entries — is the only reason this wasn''t a rout. Paarl Girls will take heart from the defensive resilience and the late goal. But the data is unambiguous: Oranje were in <strong>a completely different class</strong>.</p>
  </div>

  </div><!-- end coach-only -->

  <!-- Footer -->
  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 18 APRIL 2026 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>

</div>

<script>
const stats = [
  { label: ''Possession'',       pg: 41, or: 59, isPct: true },
  { label: ''Territory'',        pg: 39, or: 61, isPct: true },
  { label: ''Turnovers Won'',    pg: 47, or: 75 },
  { label: ''Possession Lost'',  pg: 87, or: 89, lowerBetter: true },
  { label: ''D Entries'',        pg: 10, or: 57 },
  { label: ''Short Corners'',    pg: 3,  or: 9 },
  { label: ''SC Goals'',         pg: 1,  or: 1 },
  { label: ''Shots'',            pg: 2,  or: 29 },
  { label: ''Shots on Target'',  pg: 2,  or: 18 },
  { label: ''Overheads'',        pg: 16, or: 1 },
];

const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.pg, s.or) || 1;
  const pgWin = s.lowerBetter ? s.pg < s.or : s.pg > s.or;
  const orWin = s.lowerBetter ? s.or < s.pg : s.or > s.pg;
  const tied = s.pg === s.or;

  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : pgWin ? ''win'' : ''lose''}">${s.pg}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left">
      <div class="stat-bar ${pgWin ? ''green'' : ''dim''}" style="width: ${(s.pg/max)*100}%"></div>
    </div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right">
      <div class="stat-bar ${orWin ? ''green'' : ''dim''}" style="width: ${(s.or/max)*100}%"></div>
    </div>
    <div class="stat-val ${tied ? ''draw'' : orWin ? ''win'' : ''lose''}">${s.or}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>

</body>
</html>
'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();

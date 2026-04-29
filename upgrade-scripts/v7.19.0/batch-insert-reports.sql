-- Batch insert match reports
-- Generated from kykie export


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'fb32e6b3-05cb-452b-af6d-b371dd423b7b',
  'analysis',
  'St Johns vs Oranje — Match Analysis — 2026-03-06',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — St Johns vs Oranje</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">League · Full Time · 60 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#4169E1;">ST</div></div>
      <div class="score-box">0 <span class="dash">–</span> 4</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>St Johns</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-03-06</span> · <span>Home: St Johns</span> · 45/55 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Oranje</div><div class="desc">36 D entries, 7 shots on goal, 62 turnovers won.<br>The 0–4 scoreline flatters St Johns enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">St Johns</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:61%"></div></div><div class="dna-bar-pct">61%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:31%"></div></div><div class="dna-bar-pct">31%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:8%"></div></div><div class="dna-bar-pct">8%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:27%"></div></div><div class="dna-bar-pct">27%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:22%"></div></div><div class="dna-bar-pct">22%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:51%"></div></div><div class="dna-bar-pct">51%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">St Johns — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">43 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">61% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">St Johns — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">70 possessions lost. Oranje won 62 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">36 D entries to St Johns''s 10. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">62 turnovers won — outpressed St Johns (43). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept St Johns scoreless despite 10 D entries and 6 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">61 possessions lost. St Johns won 43 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Oranje</strong> — 36 D entries to 10, 7 shots on goal to 6.</p>
    <p><strong>St Johns</strong> played direct (61% forward) while <strong>Oranje</strong> was more patient (51% back, 22% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-06 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 45, a: 55, isPct: true },
    { label: ''Territory'', h: 35, a: 43, isPct: true },
    { label: ''Turnovers Won'', h: 43, a: 62 },
    { label: ''Possession Lost'', h: 70, a: 61, lowerBetter: true },
    { label: ''D Entries'', h: 10, a: 36 },
    { label: ''Short Corners'', h: 2, a: 2 },
    { label: ''Shots'', h: 6, a: 18 },
    { label: ''Shots on Target'', h: 6, a: 7 },
    { label: ''Overheads'', h: 14, a: 7 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'acd2b047-15e1-4c61-a679-91d9e90448ca',
  'analysis',
  'Paarl Girls vs Outeniqua — Match Analysis — 2026-03-20',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs Outeniqua</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">League · Full Time · 60 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">3 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#2E5090;">OU</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>Outeniqua</span></div>
    <div class="match-meta"><span>2026-03-20</span> · <span>Home: Paarl Girls</span> · 66/34 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Girls</div><div class="desc">18 D entries.<br>The 3–0 scoreline flatters Outeniqua enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:40%"></div></div><div class="dna-bar-pct">40%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:40%"></div></div><div class="dna-bar-pct">40%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:20%"></div></div><div class="dna-bar-pct">20%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Outeniqua</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:46%"></div></div><div class="dna-bar-pct">46%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:49%"></div></div><div class="dna-bar-pct">49%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:5%"></div></div><div class="dna-bar-pct">5%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">18 D entries to Outeniqua''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">11 turnovers won — outpressed Outeniqua (8). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Outeniqua scoreless despite 5 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">45 possessions lost. Outeniqua won 8 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>
  <div class="section-title">Outeniqua — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against Paarl Girls''s 18. Struggled to penetrate the opposition defence.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Girls</strong> — 18 D entries to 5, 3 shots on goal to 1.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-20 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 66, a: 34, isPct: true },
    { label: ''Territory'', h: 65, a: 55, isPct: true },
    { label: ''Turnovers Won'', h: 11, a: 8 },
    { label: ''Possession Lost'', h: 45, a: 39, lowerBetter: true },
    { label: ''D Entries'', h: 18, a: 5 },
    { label: ''Short Corners'', h: 3, a: 1 },
    { label: ''Shots'', h: 4, a: 3 },
    { label: ''Shots on Target'', h: 3, a: 1 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '87db971c-eaee-4671-9b87-fe2aa4a1c2f9',
  'analysis',
  'Pearson vs Paarl Girls — Match Analysis — 2026-03-26',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Pearson vs Paarl Girls</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#2D6B3F;">PE</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
    </div>
    <div class="team-names"><span>Pearson</span><span>Paarl Girls</span></div>
    <div class="match-meta"><span>2026-03-26</span> · <span>Home: Pearson</span> · 49/51 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Pearson</div><div class="desc">16 D entries.<br>The 0–0 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Pearson</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:68%"></div></div><div class="dna-bar-pct">68%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:4%"></div></div><div class="dna-bar-pct">4%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:30%"></div></div><div class="dna-bar-pct">30%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Pearson — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">16 D entries to Paarl Girls''s 10. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">15 turnovers won — outpressed Paarl Girls (12). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Paarl Girls scoreless despite 10 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Pearson — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Wasteful Finishing</div><div class="insight-text">16 D entries and 2 shots on goal but only 0 goal(s). A 0.0% D-entry-to-goal conversion rate.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 5 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Pearson scoreless despite 16 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Pearson</strong> — 16 D entries to 10, 2 shots on goal to 2.</p>
    <p><strong>Pearson</strong> played direct (68% forward) while <strong>Paarl Girls</strong> was more patient (35% back, 30% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-26 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 49, a: 51, isPct: true },
    { label: ''Territory'', h: 22, a: 29, isPct: true },
    { label: ''Turnovers Won'', h: 15, a: 12 },
    { label: ''Possession Lost'', h: 27, a: 20, lowerBetter: true },
    { label: ''D Entries'', h: 16, a: 10 },
    { label: ''Short Corners'', h: 5, a: 3 },
    { label: ''Shots'', h: 5, a: 5 },
    { label: ''Shots on Target'', h: 2, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '1c8d61e6-081c-44f3-8f9d-a12881b3f597',
  'analysis',
  'Oranje vs PMB Girls — Match Analysis — 2026-03-26',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Oranje vs PMB Girls</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
      <div class="score-box">1 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#228B22;">PM</div></div>
    </div>
    <div class="team-names"><span>Oranje</span><span>PMB Girls</span></div>
    <div class="match-meta"><span>2026-03-26</span> · <span>Home: Oranje</span> · 64/36 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Oranje</div><div class="desc">36 D entries, 6 shots on goal.<br>The 1–0 scoreline flatters PMB Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:65%"></div></div><div class="dna-bar-pct">65%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:23%"></div></div><div class="dna-bar-pct">23%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:12%"></div></div><div class="dna-bar-pct">12%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">PMB Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:25%"></div></div><div class="dna-bar-pct">25%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:17%"></div></div><div class="dna-bar-pct">17%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:58%"></div></div><div class="dna-bar-pct">58%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">36 D entries to PMB Girls''s 1. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">27 turnovers won — outpressed PMB Girls (17). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept PMB Girls scoreless despite 1 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Wasteful Finishing</div><div class="insight-text">36 D entries and 6 shots on goal but only 1 goal(s). A 2.8% D-entry-to-goal conversion rate.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 7 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">PMB Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Defensive Resilience</div><div class="insight-text">Conceded only 1 from 36 D entries and 6 shots. A 2.8% conversion rate for the opposition.</div></div>
    </div>
    <div class="section-title">PMB Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 1 D entries against Oranje''s 36. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Oranje</strong> — 36 D entries to 1, 6 shots on goal to 0.</p>
    <p><strong>Oranje</strong> played direct (65% forward) while <strong>PMB Girls</strong> was more patient (58% back, 17% across).</p>
    <p>The 1–0 scoreline doesn''t reflect the balance of play. Oranje created enough for a bigger margin but couldn''t convert.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-26 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 64, a: 36, isPct: true },
    { label: ''Territory'', h: 35, a: 13, isPct: true },
    { label: ''Turnovers Won'', h: 27, a: 17 },
    { label: ''Possession Lost'', h: 32, a: 29, lowerBetter: true },
    { label: ''D Entries'', h: 36, a: 1 },
    { label: ''Short Corners'', h: 7, a: 0 },
    { label: ''Shots'', h: 13, a: 0 },
    { label: ''Shots on Target'', h: 6, a: 0 },
    { label: ''Overheads'', h: 5, a: 3 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '8810aaf6-38a8-48df-b19b-668a7bb20c65',
  'analysis',
  'Waterkloof vs Affies (AHMP) — Match Analysis — 2026-03-26',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Waterkloof vs Affies (AHMP)</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#D4A017;">WA</div></div>
      <div class="score-box">2 <span class="dash">–</span> 1</div>
      <div><div class="team-badge" style="background:#003D82;">AF</div></div>
    </div>
    <div class="team-names"><span>Waterkloof</span><span>Affies (AHMP)</span></div>
    <div class="match-meta"><span>2026-03-26</span> · <span>Home: Waterkloof</span> · 63/37 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Waterkloof</div><div class="desc"></div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Waterkloof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:51%"></div></div><div class="dna-bar-pct">51%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:9%"></div></div><div class="dna-bar-pct">9%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Affies (AHMP)</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:24%"></div></div><div class="dna-bar-pct">24%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:19%"></div></div><div class="dna-bar-pct">19%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:57%"></div></div><div class="dna-bar-pct">57%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Waterkloof — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">14 D entries to Affies (AHMP)''s 4. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">23 turnovers won — outpressed Affies (AHMP) (15). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 1 short corners (100%). Clinical when it mattered.</div></div>
    </div>
  <div class="section-title">Affies (AHMP) — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 4 D entries against Waterkloof''s 14. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Waterkloof</strong> — 14 D entries to 4, 2 shots on goal to 0.</p>
    <p><strong>Waterkloof</strong> played direct (51% forward) while <strong>Affies (AHMP)</strong> was more patient (57% back, 19% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-26 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 63, a: 37, isPct: true },
    { label: ''Territory'', h: 43, a: 29, isPct: true },
    { label: ''Turnovers Won'', h: 23, a: 15 },
    { label: ''Possession Lost'', h: 21, a: 26, lowerBetter: true },
    { label: ''D Entries'', h: 14, a: 4 },
    { label: ''Short Corners'', h: 1, a: 0 },
    { label: ''SC Goals'', h: 1, a: 0 },
    { label: ''Shots'', h: 3, a: 1 },
    { label: ''Shots on Target'', h: 2, a: 0 },
    { label: ''Overheads'', h: 5, a: 5 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '89da8fa7-a7d1-4e0e-beac-c8a792948f9a',
  'analysis',
  'Rhenish vs Fatima — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Rhenish vs Fatima</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#000080;">RH</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#4169E1;">FA</div></div>
    </div>
    <div class="team-names"><span>Rhenish</span><span>Fatima</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Rhenish</span> · 60/40 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Rhenish</div><div class="desc"><br>The 0–0 scoreline flatters Fatima enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Rhenish</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:53%"></div></div><div class="dna-bar-pct">53%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:40%"></div></div><div class="dna-bar-pct">40%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:7%"></div></div><div class="dna-bar-pct">7%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Fatima</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:22%"></div></div><div class="dna-bar-pct">22%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:37%"></div></div><div class="dna-bar-pct">37%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Rhenish — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">14 D entries to Fatima''s 3. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">21 turnovers won — outpressed Fatima (17). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Fatima scoreless despite 3 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Rhenish — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 4 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Fatima — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Rhenish scoreless despite 14 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Fatima — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 3 D entries against Rhenish''s 14. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Rhenish</strong> — 14 D entries to 3, 2 shots on goal to 0.</p>
    <p><strong>Rhenish</strong> played direct (53% forward) while <strong>Fatima</strong> was more patient (41% back, 37% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 60, a: 40, isPct: true },
    { label: ''Territory'', h: 36, a: 24, isPct: true },
    { label: ''Turnovers Won'', h: 21, a: 17 },
    { label: ''Possession Lost'', h: 26, a: 24, lowerBetter: true },
    { label: ''D Entries'', h: 14, a: 3 },
    { label: ''Short Corners'', h: 4, a: 0 },
    { label: ''Shots'', h: 5, a: 1 },
    { label: ''Shots on Target'', h: 2, a: 0 },
    { label: ''Overheads'', h: 0, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '47307859-4bf6-430d-b88f-3790adbcfb7d',
  'analysis',
  'Paarl Girls vs Herchel — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs Herchel</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 1</div>
      <div><div class="team-badge" style="background:#1A3C6E;">HE</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>Herchel</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Paarl Girls</span> · 46/54 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Herchel</div><div class="desc"><br>The 0–1 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:72%"></div></div><div class="dna-bar-pct">72%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:17%"></div></div><div class="dna-bar-pct">17%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:12%"></div></div><div class="dna-bar-pct">12%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Herchel</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:20%"></div></div><div class="dna-bar-pct">20%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:30%"></div></div><div class="dna-bar-pct">30%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:51%"></div></div><div class="dna-bar-pct">51%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">22 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">72% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 6 D entries against Herchel''s 12. Struggled to penetrate the opposition defence.</div></div>
    </div>
  <div class="section-title">Herchel — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">12 D entries to Paarl Girls''s 6. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">27 turnovers won — outpressed Paarl Girls (22). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 2 short corners (50%). Clinical when it mattered.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Herchel</strong> — 12 D entries to 6, 3 shots on goal to 1.</p>
    <p><strong>Paarl Girls</strong> played direct (72% forward) while <strong>Herchel</strong> was more patient (51% back, 30% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 46, a: 54, isPct: true },
    { label: ''Territory'', h: 25, a: 43, isPct: true },
    { label: ''Turnovers Won'', h: 22, a: 27 },
    { label: ''Possession Lost'', h: 29, a: 29, lowerBetter: true },
    { label: ''D Entries'', h: 6, a: 12 },
    { label: ''Short Corners'', h: 2, a: 2 },
    { label: ''SC Goals'', h: 0, a: 1 },
    { label: ''Shots'', h: 3, a: 4 },
    { label: ''Shots on Target'', h: 1, a: 3 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '9c73bb88-cece-4d9c-929c-fae187d6ccc2',
  'analysis',
  'Bloemhof vs Paarl Gim — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Bloemhof vs Paarl Gim</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#8B0000;">BL</div></div>
      <div class="score-box">0 <span class="dash">–</span> 1</div>
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
    </div>
    <div class="team-names"><span>Bloemhof</span><span>Paarl Gim</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Bloemhof</span> · 46/54 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Gim</div><div class="desc">32 turnovers won.<br>The 0–1 scoreline flatters Bloemhof enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Bloemhof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:55%"></div></div><div class="dna-bar-pct">55%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:10%"></div></div><div class="dna-bar-pct">10%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:21%"></div></div><div class="dna-bar-pct">21%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:47%"></div></div><div class="dna-bar-pct">47%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Bloemhof — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">27 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">55% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Bloemhof — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against Paarl Gim''s 11. Struggled to penetrate the opposition defence.</div></div>
    </div>
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">11 D entries to Bloemhof''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">32 turnovers won — outpressed Bloemhof (27). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 2 short corners (50%). Clinical when it mattered.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Gim</strong> — 11 D entries to 5, 1 shots on goal to 1.</p>
    <p><strong>Bloemhof</strong> played direct (55% forward) while <strong>Paarl Gim</strong> was more patient (33% back, 47% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 46, a: 54, isPct: true },
    { label: ''Territory'', h: 33, a: 23, isPct: true },
    { label: ''Turnovers Won'', h: 27, a: 32 },
    { label: ''Possession Lost'', h: 37, a: 36, lowerBetter: true },
    { label: ''D Entries'', h: 5, a: 11 },
    { label: ''Short Corners'', h: 3, a: 2 },
    { label: ''SC Goals'', h: 0, a: 1 },
    { label: ''Shots'', h: 1, a: 5 },
    { label: ''Shots on Target'', h: 1, a: 1 },
    { label: ''Overheads'', h: 4, a: 5 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'b55d2946-f9b5-4922-8c4d-e926d6ab82d8',
  'analysis',
  'St Annes vs Paarl Girls — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — St Annes vs Paarl Girls</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#2C5AA0;">ST</div></div>
      <div class="score-box">2 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
    </div>
    <div class="team-names"><span>St Annes</span><span>Paarl Girls</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: St Annes</span> · 59/41 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">St Annes</div><div class="desc">6 shots on goal.<br>The 2–0 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">St Annes</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:61%"></div></div><div class="dna-bar-pct">61%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:29%"></div></div><div class="dna-bar-pct">29%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:10%"></div></div><div class="dna-bar-pct">10%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:18%"></div></div><div class="dna-bar-pct">18%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">St Annes — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">13 D entries to Paarl Girls''s 4. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">28 turnovers won — outpressed Paarl Girls (25). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 2 from 5 short corners (40%). Clinical when it mattered.</div></div>
    </div>
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">25 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 4 D entries against St Annes''s 13. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>St Annes</strong> — 13 D entries to 4, 6 shots on goal to 0.</p>
    <p><strong>St Annes</strong> played direct (61% forward) while <strong>Paarl Girls</strong> was more patient (41% back, 41% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 59, a: 41, isPct: true },
    { label: ''Territory'', h: 41, a: 32, isPct: true },
    { label: ''Turnovers Won'', h: 28, a: 25 },
    { label: ''Possession Lost'', h: 27, a: 33, lowerBetter: true },
    { label: ''D Entries'', h: 13, a: 4 },
    { label: ''Short Corners'', h: 5, a: 0 },
    { label: ''SC Goals'', h: 2, a: 0 },
    { label: ''Shots'', h: 7, a: 1 },
    { label: ''Shots on Target'', h: 6, a: 0 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '4124dc45-76a8-4726-be5d-df912f30dbda',
  'analysis',
  'Oranje vs Paarl Gim — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Oranje vs Paarl Gim</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
      <div class="score-box">2 <span class="dash">–</span> 1</div>
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
    </div>
    <div class="team-names"><span>Oranje</span><span>Paarl Gim</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Oranje</span> · 54/46 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Oranje</div><div class="desc">17 D entries, 9 shots on goal.<br>The 2–1 scoreline flatters Paarl Gim enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:51%"></div></div><div class="dna-bar-pct">51%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:42%"></div></div><div class="dna-bar-pct">42%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:7%"></div></div><div class="dna-bar-pct">7%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:34%"></div></div><div class="dna-bar-pct">34%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:19%"></div></div><div class="dna-bar-pct">19%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:47%"></div></div><div class="dna-bar-pct">47%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">17 D entries to Paarl Gim''s 11. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">28 turnovers won — outpressed Paarl Gim (21). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">51% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">21 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 3 short corners (33%). Clinical when it mattered.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Oranje</strong> — 17 D entries to 11, 9 shots on goal to 1.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 54, a: 46, isPct: true },
    { label: ''Territory'', h: 22, a: 41, isPct: true },
    { label: ''Turnovers Won'', h: 28, a: 21 },
    { label: ''Possession Lost'', h: 30, a: 30, lowerBetter: true },
    { label: ''D Entries'', h: 17, a: 11 },
    { label: ''Short Corners'', h: 3, a: 3 },
    { label: ''SC Goals'', h: 0, a: 1 },
    { label: ''Shots'', h: 12, a: 4 },
    { label: ''Shots on Target'', h: 9, a: 1 },
    { label: ''Overheads'', h: 4, a: 4 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '6ee038e8-0f25-4b34-895f-abe2d43e49aa',
  'analysis',
  'PV vs Waterkloof — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — PV vs Waterkloof</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#2563EB;">PV</div></div>
      <div class="score-box">0 <span class="dash">–</span> 4</div>
      <div><div class="team-badge" style="background:#D4A017;">WA</div></div>
    </div>
    <div class="team-names"><span>PV</span><span>Waterkloof</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: PV</span> · 55/45 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Waterkloof</div><div class="desc"><br>The 0–4 scoreline flatters PV enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">PV</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:66%"></div></div><div class="dna-bar-pct">66%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:26%"></div></div><div class="dna-bar-pct">26%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:8%"></div></div><div class="dna-bar-pct">8%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Waterkloof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:32%"></div></div><div class="dna-bar-pct">32%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:40%"></div></div><div class="dna-bar-pct">40%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">PV — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">66% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">PV — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 8 D entries against Waterkloof''s 13. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 5 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Waterkloof — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">13 D entries to PV''s 8. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">19 turnovers won — outpressed PV (11). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept PV scoreless despite 8 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Waterkloof</strong> — 13 D entries to 8, 4 shots on goal to 0.</p>
    <p><strong>PV</strong> played direct (66% forward) while <strong>Waterkloof</strong> was more patient (40% back, 32% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 55, a: 45, isPct: true },
    { label: ''Territory'', h: 20, a: 32, isPct: true },
    { label: ''Turnovers Won'', h: 11, a: 19 },
    { label: ''Possession Lost'', h: 21, a: 18, lowerBetter: true },
    { label: ''D Entries'', h: 8, a: 13 },
    { label: ''Short Corners'', h: 5, a: 0 },
    { label: ''Shots'', h: 2, a: 5 },
    { label: ''Shots on Target'', h: 0, a: 4 },
    { label: ''Overheads'', h: 0, a: 1 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '80d20088-35f0-4422-9761-0be4db4a5060',
  'analysis',
  'Roedean vs St Johns — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Roedean vs St Johns</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#2E5090;">RO</div></div>
      <div class="score-box">0 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background:#4169E1;">ST</div></div>
    </div>
    <div class="team-names"><span>Roedean</span><span>St Johns</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Roedean</span> · 36/64 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">St Johns</div><div class="desc">18 D entries.<br>The 0–2 scoreline flatters Roedean enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Roedean</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:74%"></div></div><div class="dna-bar-pct">74%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:24%"></div></div><div class="dna-bar-pct">24%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:2%"></div></div><div class="dna-bar-pct">2%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">St Johns</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:44%"></div></div><div class="dna-bar-pct">44%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:17%"></div></div><div class="dna-bar-pct">17%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:38%"></div></div><div class="dna-bar-pct">38%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Roedean — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">74% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Roedean — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 4 D entries against St Johns''s 18. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>
  <div class="section-title">St Johns — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">18 D entries to Roedean''s 4. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">26 turnovers won — outpressed Roedean (18). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 8 short corners (12%). Clinical when it mattered.</div></div>
    </div>
    <div class="section-title">St Johns — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">Only 1 from 8 short corners (12%). The volume was there but conversion wasn''t.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>St Johns</strong> — 18 D entries to 4, 3 shots on goal to 0.</p>
    <p><strong>Roedean</strong> played direct (74% forward) while <strong>St Johns</strong> was more patient (38% back, 17% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 36, a: 64, isPct: true },
    { label: ''Territory'', h: 15, a: 32, isPct: true },
    { label: ''Turnovers Won'', h: 18, a: 26 },
    { label: ''Possession Lost'', h: 29, a: 20, lowerBetter: true },
    { label: ''D Entries'', h: 4, a: 18 },
    { label: ''Short Corners'', h: 1, a: 8 },
    { label: ''SC Goals'', h: 0, a: 1 },
    { label: ''Shots'', h: 0, a: 6 },
    { label: ''Shots on Target'', h: 0, a: 3 },
    { label: ''Overheads'', h: 4, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '62db4557-de13-4781-944a-d064e0ff75dd',
  'analysis',
  'Herchel vs St Mary''s Waverley — Match Analysis — 2026-03-27',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Herchel vs St Mary''s Waverley</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1A3C6E;">HE</div></div>
      <div class="score-box">3 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#DC2626;">ST</div></div>
    </div>
    <div class="team-names"><span>Herchel</span><span>St Mary''s Waverley</span></div>
    <div class="match-meta"><span>2026-03-27</span> · <span>Home: Herchel</span> · 42/58 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Herchel</div><div class="desc">23 D entries.<br>The 3–0 scoreline flatters St Mary''s Waverley enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Herchel</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:84%"></div></div><div class="dna-bar-pct">84%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:13%"></div></div><div class="dna-bar-pct">13%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:4%"></div></div><div class="dna-bar-pct">4%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">St Mary''s Waverley</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:27%"></div></div><div class="dna-bar-pct">27%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:20%"></div></div><div class="dna-bar-pct">20%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:53%"></div></div><div class="dna-bar-pct">53%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Herchel — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">23 D entries to St Mary''s Waverley''s 4. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">24 turnovers won — outpressed St Mary''s Waverley (13). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept St Mary''s Waverley scoreless despite 4 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
  <div class="section-title">St Mary''s Waverley — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 4 D entries against Herchel''s 23. Struggled to penetrate the opposition defence.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Herchel</strong> — 23 D entries to 4, 5 shots on goal to 1.</p>
    <p><strong>Herchel</strong> played direct (84% forward) while <strong>St Mary''s Waverley</strong> was more patient (53% back, 20% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-27 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 42, a: 58, isPct: true },
    { label: ''Territory'', h: 39, a: 31, isPct: true },
    { label: ''Turnovers Won'', h: 24, a: 13 },
    { label: ''Possession Lost'', h: 23, a: 27, lowerBetter: true },
    { label: ''D Entries'', h: 23, a: 4 },
    { label: ''Short Corners'', h: 1, a: 2 },
    { label: ''Shots'', h: 7, a: 1 },
    { label: ''Shots on Target'', h: 5, a: 1 },
    { label: ''Overheads'', h: 5, a: 5 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '92527874-cf1e-4988-914b-a390e3f9a1ad',
  'analysis',
  'Paarl Girls vs Affies (AHMP) — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs Affies (AHMP)</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#003D82;">AF</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>Affies (AHMP)</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Paarl Girls</span> · 47/53 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Affies (AHMP)</div><div class="desc">32 turnovers won.<br>The 0–0 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:63%"></div></div><div class="dna-bar-pct">63%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:32%"></div></div><div class="dna-bar-pct">32%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:5%"></div></div><div class="dna-bar-pct">5%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Affies (AHMP)</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:30%"></div></div><div class="dna-bar-pct">30%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:19%"></div></div><div class="dna-bar-pct">19%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:52%"></div></div><div class="dna-bar-pct">52%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">31 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Affies (AHMP) scoreless despite 11 D entries and 4 shots on goal. Outstanding defensive resilience.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">63% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against Affies (AHMP)''s 11. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>
  <div class="section-title">Affies (AHMP) — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">11 D entries to Paarl Girls''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">32 turnovers won — outpressed Paarl Girls (31). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Paarl Girls scoreless despite 5 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Affies (AHMP)</strong> — 11 D entries to 5, 4 shots on goal to 0.</p>
    <p><strong>Paarl Girls</strong> played direct (63% forward) while <strong>Affies (AHMP)</strong> was more patient (52% back, 19% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 47, a: 53, isPct: true },
    { label: ''Territory'', h: 32, a: 41, isPct: true },
    { label: ''Turnovers Won'', h: 31, a: 32 },
    { label: ''Possession Lost'', h: 37, a: 39, lowerBetter: true },
    { label: ''D Entries'', h: 5, a: 11 },
    { label: ''Short Corners'', h: 1, a: 1 },
    { label: ''Shots'', h: 0, a: 4 },
    { label: ''Shots on Target'', h: 0, a: 4 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'eb5abe57-655b-4a40-9653-e79896426c55',
  'analysis',
  'Paarl Gim vs Collegiate — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Gim vs Collegiate</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#DC143C;">CO</div></div>
    </div>
    <div class="team-names"><span>Paarl Gim</span><span>Collegiate</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Paarl Gim</span> · 44/56 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Gim</div><div class="desc"><br>The 0–0 scoreline flatters Collegiate enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:61%"></div></div><div class="dna-bar-pct">61%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:27%"></div></div><div class="dna-bar-pct">27%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:11%"></div></div><div class="dna-bar-pct">11%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Collegiate</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:27%"></div></div><div class="dna-bar-pct">27%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:32%"></div></div><div class="dna-bar-pct">32%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">12 D entries to Collegiate''s 7. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">15 turnovers won — outpressed Collegiate (13). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Collegiate scoreless despite 7 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Paarl Gim — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>
  <div class="section-title">Collegiate — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Paarl Gim scoreless despite 12 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Collegiate — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 7 D entries against Paarl Gim''s 12. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Gim</strong> — 12 D entries to 7, 0 shots on goal to 0.</p>
    <p><strong>Paarl Gim</strong> played direct (61% forward) while <strong>Collegiate</strong> was more patient (32% back, 41% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 44, a: 56, isPct: true },
    { label: ''Territory'', h: 27, a: 23, isPct: true },
    { label: ''Turnovers Won'', h: 15, a: 13 },
    { label: ''Possession Lost'', h: 23, a: 22, lowerBetter: true },
    { label: ''D Entries'', h: 12, a: 7 },
    { label: ''Short Corners'', h: 3, a: 2 },
    { label: ''Shots'', h: 1, a: 0 },
    { label: ''Shots on Target'', h: 0, a: 0 },
    { label: ''Overheads'', h: 3, a: 0 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'f6d8a87d-bbe6-4174-b906-68829e70d6fe',
  'analysis',
  'Roedean vs Paarl Girls — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Roedean vs Paarl Girls</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#2E5090;">RO</div></div>
      <div class="score-box">0 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
    </div>
    <div class="team-names"><span>Roedean</span><span>Paarl Girls</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Roedean</span> · 35/65 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Girls</div><div class="desc"><br>The 0–2 scoreline flatters Roedean enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Roedean</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:71%"></div></div><div class="dna-bar-pct">71%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:24%"></div></div><div class="dna-bar-pct">24%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:5%"></div></div><div class="dna-bar-pct">5%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:26%"></div></div><div class="dna-bar-pct">26%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Roedean — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">71% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Roedean — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 1 D entries against Paarl Girls''s 14. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">14 D entries to Roedean''s 1. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">25 turnovers won — outpressed Roedean (20). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Roedean scoreless despite 1 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Girls</strong> — 14 D entries to 1, 4 shots on goal to 0.</p>
    <p><strong>Roedean</strong> played direct (71% forward) while <strong>Paarl Girls</strong> was more patient (41% back, 33% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 35, a: 65, isPct: true },
    { label: ''Territory'', h: 23, a: 33, isPct: true },
    { label: ''Turnovers Won'', h: 20, a: 25 },
    { label: ''Possession Lost'', h: 30, a: 26, lowerBetter: true },
    { label: ''D Entries'', h: 1, a: 14 },
    { label: ''Short Corners'', h: 0, a: 3 },
    { label: ''Shots'', h: 0, a: 9 },
    { label: ''Shots on Target'', h: 0, a: 4 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'c0632244-9923-488a-978c-795d96c49f57',
  'analysis',
  'Paarl Girls vs St Stithians — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs St Stithians</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">1 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background:#000080;">ST</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>St Stithians</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Paarl Girls</span> · 53/47 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">St Stithians</div><div class="desc">34 turnovers won.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:55%"></div></div><div class="dna-bar-pct">55%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:17%"></div></div><div class="dna-bar-pct">17%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">St Stithians</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:21%"></div></div><div class="dna-bar-pct">21%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:36%"></div></div><div class="dna-bar-pct">36%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:44%"></div></div><div class="dna-bar-pct">44%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">25 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 2 short corners (50%). Clinical when it mattered.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">55% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against St Stithians''s 9. Struggled to penetrate the opposition defence.</div></div>
    </div>
  <div class="section-title">St Stithians — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">9 D entries to Paarl Girls''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">34 turnovers won — outpressed Paarl Girls (25). Controlled the tempo through aggressive ball-hunting.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>St Stithians</strong> — 9 D entries to 5, 3 shots on goal to 2.</p>
    <p><strong>Paarl Girls</strong> played direct (55% forward) while <strong>St Stithians</strong> was more patient (44% back, 36% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 53, a: 47, isPct: true },
    { label: ''Territory'', h: 30, a: 38, isPct: true },
    { label: ''Turnovers Won'', h: 25, a: 34 },
    { label: ''Possession Lost'', h: 36, a: 28, lowerBetter: true },
    { label: ''D Entries'', h: 5, a: 9 },
    { label: ''Short Corners'', h: 2, a: 0 },
    { label: ''SC Goals'', h: 1, a: 0 },
    { label: ''Shots'', h: 2, a: 4 },
    { label: ''Shots on Target'', h: 2, a: 3 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '4ef97ca9-d161-44cb-ab6f-423894d676e2',
  'analysis',
  'Fatima vs Oranje — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Fatima vs Oranje</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#4169E1;">FA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 3</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>Fatima</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Fatima</span> · 46/54 possession</div>
  </div>

  <div class="verdict"><div class="label">Verdict</div><div class="team" style="color:#F59E0B">Even Contest</div><div class="desc">Neither team could establish clear dominance. The 0–3 scoreline reflects a balanced match.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Fatima</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:63%"></div></div><div class="dna-bar-pct">63%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:9%"></div></div><div class="dna-bar-pct">9%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:27%"></div></div><div class="dna-bar-pct">27%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:44%"></div></div><div class="dna-bar-pct">44%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:29%"></div></div><div class="dna-bar-pct">29%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Fatima — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">15 turnovers won — outpressed Oranje (14). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">63% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Fatima scoreless despite 14 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>A tightly contested match that finished 0–3. Neither team could establish clear dominance.</p>
    <p><strong>Fatima</strong> played direct (63% forward) while <strong>Oranje</strong> was more patient (29% back, 44% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 46, a: 54, isPct: true },
    { label: ''Territory'', h: 25, a: 35, isPct: true },
    { label: ''Turnovers Won'', h: 15, a: 14 },
    { label: ''Possession Lost'', h: 26, a: 22, lowerBetter: true },
    { label: ''D Entries'', h: 14, a: 14 },
    { label: ''Short Corners'', h: 2, a: 1 },
    { label: ''Shots'', h: 4, a: 5 },
    { label: ''Shots on Target'', h: 2, a: 5 },
    { label: ''Overheads'', h: 3, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'fce22a89-6cf7-4dcd-a1bd-91d9039050c6',
  'analysis',
  'MENLO vs Oranje — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — MENLO vs Oranje</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#003D82;">ME</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>MENLO</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: MENLO</span> · 56/44 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">MENLO</div><div class="desc">41 turnovers won.<br>The 0–0 scoreline flatters Oranje enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">MENLO</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:49%"></div></div><div class="dna-bar-pct">49%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:39%"></div></div><div class="dna-bar-pct">39%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:11%"></div></div><div class="dna-bar-pct">11%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:30%"></div></div><div class="dna-bar-pct">30%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:42%"></div></div><div class="dna-bar-pct">42%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">MENLO — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">15 D entries to Oranje''s 8. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">41 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Oranje scoreless despite 8 D entries and 3 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">MENLO — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">50 possessions lost. Oranje won 41 turnovers — the ball couldn''t be held under pressure.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 7 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">41 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept MENLO scoreless despite 15 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 8 D entries against MENLO''s 15. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">49 possessions lost. MENLO won 41 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>MENLO</strong> — 15 D entries to 8, 1 shots on goal to 3.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 56, a: 44, isPct: true },
    { label: ''Territory'', h: 13, a: 21, isPct: true },
    { label: ''Turnovers Won'', h: 41, a: 41 },
    { label: ''Possession Lost'', h: 50, a: 49, lowerBetter: true },
    { label: ''D Entries'', h: 15, a: 8 },
    { label: ''Short Corners'', h: 7, a: 3 },
    { label: ''Shots'', h: 1, a: 3 },
    { label: ''Shots on Target'', h: 1, a: 3 },
    { label: ''Overheads'', h: 4, a: 6 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '1fe2ed63-e630-48c3-8f53-61496d3d5d6f',
  'analysis',
  'Paarl Gim vs St Cyprians — Match Analysis — 2026-03-28',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Gim vs St Cyprians</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
      <div class="score-box">2 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#1A3C73;">ST</div></div>
    </div>
    <div class="team-names"><span>Paarl Gim</span><span>St Cyprians</span></div>
    <div class="match-meta"><span>2026-03-28</span> · <span>Home: Paarl Gim</span> · 61/39 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Gim</div><div class="desc">20 D entries.<br>The 2–0 scoreline flatters St Cyprians enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:68%"></div></div><div class="dna-bar-pct">68%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:21%"></div></div><div class="dna-bar-pct">21%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:11%"></div></div><div class="dna-bar-pct">11%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">St Cyprians</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:22%"></div></div><div class="dna-bar-pct">22%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:45%"></div></div><div class="dna-bar-pct">45%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">20 D entries to St Cyprians''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">29 turnovers won — outpressed St Cyprians (16). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept St Cyprians scoreless despite 5 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Paarl Gim — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 4 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">St Cyprians — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against Paarl Gim''s 20. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Gim</strong> — 20 D entries to 5, 5 shots on goal to 0.</p>
    <p><strong>Paarl Gim</strong> played direct (68% forward) while <strong>St Cyprians</strong> was more patient (45% back, 22% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-28 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 61, a: 39, isPct: true },
    { label: ''Territory'', h: 34, a: 25, isPct: true },
    { label: ''Turnovers Won'', h: 29, a: 16 },
    { label: ''Possession Lost'', h: 28, a: 35, lowerBetter: true },
    { label: ''D Entries'', h: 20, a: 5 },
    { label: ''Short Corners'', h: 4, a: 1 },
    { label: ''Shots'', h: 5, a: 0 },
    { label: ''Shots on Target'', h: 5, a: 0 },
    { label: ''Overheads'', h: 4, a: 3 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '20396e80-a470-485a-88cd-e77f1c331089',
  'analysis',
  'Waterkloof vs Paarl Gim — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Waterkloof vs Paarl Gim</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#D4A017;">WA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
    </div>
    <div class="team-names"><span>Waterkloof</span><span>Paarl Gim</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: Waterkloof</span> · 57/43 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Waterkloof</div><div class="desc">19 D entries, 32 turnovers won.<br>The 0–0 scoreline flatters Paarl Gim enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Waterkloof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:52%"></div></div><div class="dna-bar-pct">52%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:13%"></div></div><div class="dna-bar-pct">13%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:34%"></div></div><div class="dna-bar-pct">34%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:31%"></div></div><div class="dna-bar-pct">31%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Waterkloof — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">19 D entries to Paarl Gim''s 7. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">32 turnovers won — outpressed Paarl Gim (26). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Paarl Gim scoreless despite 7 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Waterkloof — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">41 possessions lost. Paarl Gim won 26 turnovers — the ball couldn''t be held under pressure.</div></div>
    <div class="insight-box red"><div class="insight-title">Wasteful Finishing</div><div class="insight-text">19 D entries and 1 shots on goal but only 0 goal(s). A 0.0% D-entry-to-goal conversion rate.</div></div>
    </div>
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">26 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Waterkloof scoreless despite 19 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Paarl Gim — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 7 D entries against Waterkloof''s 19. Struggled to penetrate the opposition defence.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Waterkloof</strong> — 19 D entries to 7, 1 shots on goal to 1.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 57, a: 43, isPct: true },
    { label: ''Territory'', h: 32, a: 17, isPct: true },
    { label: ''Turnovers Won'', h: 32, a: 26 },
    { label: ''Possession Lost'', h: 41, a: 39, lowerBetter: true },
    { label: ''D Entries'', h: 19, a: 7 },
    { label: ''Short Corners'', h: 3, a: 3 },
    { label: ''Shots'', h: 5, a: 1 },
    { label: ''Shots on Target'', h: 1, a: 1 },
    { label: ''Overheads'', h: 4, a: 6 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '86bf9135-4ad8-49db-9cb6-6af091915e9a',
  'analysis',
  'Paarl Girls vs PMB Girls — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs PMB Girls</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">2 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#228B22;">PM</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>PMB Girls</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: Paarl Girls</span> · 61/39 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Girls</div><div class="desc">17 D entries.<br>The 2–0 scoreline flatters PMB Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:58%"></div></div><div class="dna-bar-pct">58%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:31%"></div></div><div class="dna-bar-pct">31%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:10%"></div></div><div class="dna-bar-pct">10%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">PMB Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:34%"></div></div><div class="dna-bar-pct">34%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:23%"></div></div><div class="dna-bar-pct">23%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:43%"></div></div><div class="dna-bar-pct">43%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">17 D entries to PMB Girls''s 9. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 2 from 7 short corners (29%). Clinical when it mattered.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept PMB Girls scoreless despite 9 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
  <div class="section-title">PMB Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">16 turnovers won — outpressed Paarl Girls (14). Controlled the tempo through aggressive ball-hunting.</div></div>
    </div>
    <div class="section-title">PMB Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 9 D entries against Paarl Girls''s 17. Struggled to penetrate the opposition defence.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Girls</strong> — 17 D entries to 9, 5 shots on goal to 2.</p>
    <p><strong>Paarl Girls</strong> played direct (58% forward) while <strong>PMB Girls</strong> was more patient (43% back, 23% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 61, a: 39, isPct: true },
    { label: ''Territory'', h: 32, a: 31, isPct: true },
    { label: ''Turnovers Won'', h: 14, a: 16 },
    { label: ''Possession Lost'', h: 22, a: 22, lowerBetter: true },
    { label: ''D Entries'', h: 17, a: 9 },
    { label: ''Short Corners'', h: 7, a: 2 },
    { label: ''SC Goals'', h: 2, a: 0 },
    { label: ''Shots'', h: 6, a: 2 },
    { label: ''Shots on Target'', h: 5, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '2c22690f-c402-4497-b073-d654269adffb',
  'analysis',
  'Paarl Girls vs Durban GC — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Girls vs Durban GC</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">0 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background:#228B22;">DU</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>Durban GC</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: Paarl Girls</span> · 43/57 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Durban GC</div><div class="desc">19 D entries.<br>The 0–2 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:61%"></div></div><div class="dna-bar-pct">61%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:4%"></div></div><div class="dna-bar-pct">4%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Durban GC</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:25%"></div></div><div class="dna-bar-pct">25%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:40%"></div></div><div class="dna-bar-pct">40%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">27 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">61% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
  <div class="section-title">Durban GC — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">19 D entries to Paarl Girls''s 13. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">28 turnovers won — outpressed Paarl Girls (27). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Paarl Girls scoreless despite 13 D entries and 2 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Durban GC — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 6 short corners. Set piece execution needs work.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Durban GC</strong> — 19 D entries to 13, 5 shots on goal to 2.</p>
    <p><strong>Paarl Girls</strong> played direct (61% forward) while <strong>Durban GC</strong> was more patient (40% back, 25% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 43, a: 57, isPct: true },
    { label: ''Territory'', h: 29, a: 39, isPct: true },
    { label: ''Turnovers Won'', h: 27, a: 28 },
    { label: ''Possession Lost'', h: 39, a: 34, lowerBetter: true },
    { label: ''D Entries'', h: 13, a: 19 },
    { label: ''Short Corners'', h: 2, a: 6 },
    { label: ''Shots'', h: 3, a: 7 },
    { label: ''Shots on Target'', h: 2, a: 5 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'daea1409-f7ef-456d-9c5c-0259b94c55dc',
  'analysis',
  'Oranje vs Rhenish — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Oranje vs Rhenish</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#000080;">RH</div></div>
    </div>
    <div class="team-names"><span>Oranje</span><span>Rhenish</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: Oranje</span> · 52/48 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Rhenish</div><div class="desc"><br>The 0–0 scoreline flatters Oranje enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:45%"></div></div><div class="dna-bar-pct">45%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:43%"></div></div><div class="dna-bar-pct">43%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:12%"></div></div><div class="dna-bar-pct">12%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Rhenish</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:39%"></div></div><div class="dna-bar-pct">39%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:22%"></div></div><div class="dna-bar-pct">22%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:39%"></div></div><div class="dna-bar-pct">39%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">22 turnovers won — outpressed Rhenish (19). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Rhenish scoreless despite 10 D entries and 3 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 7 D entries against Rhenish''s 10. Struggled to penetrate the opposition defence.</div></div>
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>
  <div class="section-title">Rhenish — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">10 D entries to Oranje''s 7. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Oranje scoreless despite 7 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Rhenish</strong> — 10 D entries to 7, 3 shots on goal to 0.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 52, a: 48, isPct: true },
    { label: ''Territory'', h: 43, a: 21, isPct: true },
    { label: ''Turnovers Won'', h: 22, a: 19 },
    { label: ''Possession Lost'', h: 25, a: 28, lowerBetter: true },
    { label: ''D Entries'', h: 7, a: 10 },
    { label: ''Short Corners'', h: 0, a: 2 },
    { label: ''Shots'', h: 1, a: 4 },
    { label: ''Shots on Target'', h: 0, a: 3 },
    { label: ''Overheads'', h: 6, a: 11 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '32416ab9-001a-47f8-9f4b-e91e69160358',
  'analysis',
  'Paarl Gim vs Fatima — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Paarl Gim vs Fatima</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1A6B3C;">PA</div></div>
      <div class="score-box">1 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#4169E1;">FA</div></div>
    </div>
    <div class="team-names"><span>Paarl Gim</span><span>Fatima</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: Paarl Gim</span> · 57/43 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Paarl Gim</div><div class="desc"><br>The 1–0 scoreline flatters Fatima enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Gim</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:50%"></div></div><div class="dna-bar-pct">50%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:17%"></div></div><div class="dna-bar-pct">17%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Fatima</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:29%"></div></div><div class="dna-bar-pct">29%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:39%"></div></div><div class="dna-bar-pct">39%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Gim — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">13 D entries to Fatima''s 5. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">30 turnovers won — outpressed Fatima (24). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 6 short corners (17%). Clinical when it mattered.</div></div>
    </div>
    <div class="section-title">Paarl Gim — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">Only 1 from 6 short corners (17%). The volume was there but conversion wasn''t.</div></div>
    </div>
  <div class="section-title">Fatima — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">24 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    </div>
    <div class="section-title">Fatima — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 5 D entries against Paarl Gim''s 13. Struggled to penetrate the opposition defence.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Paarl Gim</strong> — 13 D entries to 5, 1 shots on goal to 2.</p>
    <p><strong>Paarl Gim</strong> played direct (50% forward) while <strong>Fatima</strong> was more patient (39% back, 33% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 57, a: 43, isPct: true },
    { label: ''Territory'', h: 14, a: 24, isPct: true },
    { label: ''Turnovers Won'', h: 30, a: 24 },
    { label: ''Possession Lost'', h: 34, a: 36, lowerBetter: true },
    { label: ''D Entries'', h: 13, a: 5 },
    { label: ''Short Corners'', h: 6, a: 1 },
    { label: ''SC Goals'', h: 1, a: 0 },
    { label: ''Shots'', h: 3, a: 2 },
    { label: ''Shots on Target'', h: 1, a: 2 },
    { label: ''Overheads'', h: 0, a: 2 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'fa0c97f5-0769-44b8-910a-133e999ed393',
  'analysis',
  'MENLO vs Oranje — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — MENLO vs Oranje</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#003D82;">ME</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>MENLO</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: MENLO</span> · 55/45 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">MENLO</div><div class="desc">16 D entries.<br>The 0–0 scoreline flatters Oranje enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">MENLO</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:54%"></div></div><div class="dna-bar-pct">54%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:31%"></div></div><div class="dna-bar-pct">31%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:14%"></div></div><div class="dna-bar-pct">14%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:36%"></div></div><div class="dna-bar-pct">36%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:36%"></div></div><div class="dna-bar-pct">36%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">MENLO — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">16 D entries to Oranje''s 10. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">18 turnovers won — outpressed Oranje (16). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Oranje scoreless despite 10 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">MENLO — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 8 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept MENLO scoreless despite 16 D entries and 0 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">No Shots on Target</div><div class="insight-text">Zero shots on goal in the entire match. Created no genuine scoring opportunities.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>MENLO</strong> — 16 D entries to 10, 0 shots on goal to 0.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 55, a: 45, isPct: true },
    { label: ''Territory'', h: 15, a: 27, isPct: true },
    { label: ''Turnovers Won'', h: 18, a: 16 },
    { label: ''Possession Lost'', h: 22, a: 24, lowerBetter: true },
    { label: ''D Entries'', h: 16, a: 10 },
    { label: ''Short Corners'', h: 8, a: 3 },
    { label: ''Shots'', h: 1, a: 9 },
    { label: ''Shots on Target'', h: 0, a: 0 },
    { label: ''Overheads'', h: 4, a: 6 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '6bdcb440-eb6a-44ef-8631-acc8378ca35f',
  'analysis',
  'St Marys Kloof vs Rhenish — Match Analysis — 2026-03-29',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — St Marys Kloof vs Rhenish</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">Festival · Full Time · 25 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#CC0033;">ST</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#000080;">RH</div></div>
    </div>
    <div class="team-names"><span>St Marys Kloof</span><span>Rhenish</span></div>
    <div class="match-meta"><span>2026-03-29</span> · <span>Home: St Marys Kloof</span> · 40/60 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Rhenish</div><div class="desc"><br>The 0–0 scoreline flatters St Marys Kloof enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">St Marys Kloof</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:61%"></div></div><div class="dna-bar-pct">61%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:24%"></div></div><div class="dna-bar-pct">24%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:15%"></div></div><div class="dna-bar-pct">15%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Rhenish</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:28%"></div></div><div class="dna-bar-pct">28%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:37%"></div></div><div class="dna-bar-pct">37%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:36%"></div></div><div class="dna-bar-pct">36%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">St Marys Kloof — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">23 turnovers won — outpressed Rhenish (21). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Rhenish scoreless despite 10 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    <div class="insight-box green"><div class="insight-title">Direct Intent</div><div class="insight-text">61% of ball movement went forward — showed positive attacking intent throughout.</div></div>
    </div>
    <div class="section-title">St Marys Kloof — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Limited Attacking Threat</div><div class="insight-text">Only 6 D entries against Rhenish''s 10. Struggled to penetrate the opposition defence.</div></div>
    </div>
  <div class="section-title">Rhenish — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">10 D entries to St Marys Kloof''s 6. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">21 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept St Marys Kloof scoreless despite 6 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Rhenish</strong> — 10 D entries to 6, 1 shots on goal to 1.</p>
    <p><strong>St Marys Kloof</strong> played direct (61% forward) while <strong>Rhenish</strong> was more patient (36% back, 37% across).</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-03-29 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 40, a: 60, isPct: true },
    { label: ''Territory'', h: 16, a: 26, isPct: true },
    { label: ''Turnovers Won'', h: 23, a: 21 },
    { label: ''Possession Lost'', h: 27, a: 27, lowerBetter: true },
    { label: ''D Entries'', h: 6, a: 10 },
    { label: ''Short Corners'', h: 0, a: 3 },
    { label: ''Shots'', h: 1, a: 1 },
    { label: ''Shots on Target'', h: 1, a: 1 },
    { label: ''Overheads'', h: 3, a: 6 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  '1253470e-d01e-4963-a3d2-40b87c21bbdd',
  'analysis',
  'Rhenish vs Oranje — Match Analysis — 2026-04-16',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Match Analysis — Rhenish vs Oranje</title>
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">League · Full Time · 60 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#000080;">RH</div></div>
      <div class="score-box">0 <span class="dash">–</span> 0</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>Rhenish</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-04-16</span> · <span>Home: Rhenish</span> · 58/42 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Rhenish</div><div class="desc">26 D entries, 6 shots on goal, 47 turnovers won.<br>The 0–0 scoreline flatters Oranje enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Rhenish</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:49%"></div></div><div class="dna-bar-pct">49%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:10%"></div></div><div class="dna-bar-pct">10%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:23%"></div></div><div class="dna-bar-pct">23%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:37%"></div></div><div class="dna-bar-pct">37%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:41%"></div></div><div class="dna-bar-pct">41%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Rhenish — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">26 D entries to Oranje''s 12. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">47 turnovers won — outpressed Oranje (37). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Oranje scoreless despite 12 D entries and 1 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Rhenish — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">52 possessions lost. Oranje won 37 turnovers — the ball couldn''t be held under pressure.</div></div>
    <div class="insight-box red"><div class="insight-title">Wasteful Finishing</div><div class="insight-text">26 D entries and 6 shots on goal but only 0 goal(s). A 0.0% D-entry-to-goal conversion rate.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">0 goals from 6 short corners. Set piece execution needs work.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">37 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Clean Sheet</div><div class="insight-text">Kept Rhenish scoreless despite 26 D entries and 6 shots on goal. Outstanding defensive resilience.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">58 possessions lost. Rhenish won 47 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Rhenish</strong> — 26 D entries to 12, 6 shots on goal to 1.</p>
    <p><strong>Rhenish</strong> played direct (49% forward) while <strong>Oranje</strong> was more patient (41% back, 37% across).</p>
    <p>The 0–0 scoreline doesn''t reflect the balance of play. Rhenish created enough for a bigger margin but couldn''t convert.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-04-16 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 58, a: 42, isPct: true },
    { label: ''Territory'', h: 37, a: 28, isPct: true },
    { label: ''Turnovers Won'', h: 47, a: 37 },
    { label: ''Possession Lost'', h: 52, a: 58, lowerBetter: true },
    { label: ''D Entries'', h: 26, a: 12 },
    { label: ''Short Corners'', h: 6, a: 2 },
    { label: ''Shots'', h: 8, a: 4 },
    { label: ''Shots on Target'', h: 6, a: 1 },
    { label: ''Overheads'', h: 6, a: 7 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();


INSERT INTO match_reports (match_id, report_type, title, html_content)
VALUES (
  'a704a31e-f3ca-40ec-9a81-c3752130fca3',
  'analysis',
  'Paarl Girls vs Oranje — Match Analysis — 2026-04-18',
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
  .stat-val.win { color: #10B981; } .stat-val.lose { color: #64748B; } .stat-val.draw { color: #F59E0B; }
  .stat-label { flex: 1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
  .stat-bar-wrap { flex: 1; display: flex; align-items: center; gap: 6px; }
  .stat-bar-wrap.left { justify-content: flex-end; } .stat-bar-wrap.right { justify-content: flex-start; }
  .stat-bar { height: 6px; border-radius: 3px; min-width: 4px; }
  .stat-bar.green { background: linear-gradient(90deg, #10B98155, #10B981); }
  .stat-bar.dim { background: linear-gradient(90deg, #33415555, #475569); }
  .dna-row { display: flex; gap: 10px; margin-bottom: 8px; }
  .dna-card { flex: 1; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 14px 12px; text-align: center; }
  .dna-card .team-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-bottom: 12px; }
  .dna-bar-group { display: flex; flex-direction: column; gap: 8px; }
  .dna-bar-row { display: flex; align-items: center; gap: 6px; }
  .dna-bar-label { font-size: 9px; font-weight: 600; color: #64748B; width: 48px; text-align: right; }
  .dna-bar-track { flex: 1; height: 8px; background: #0B0F1A; border-radius: 4px; overflow: hidden; }
  .dna-bar-fill { height: 100%; border-radius: 4px; }
  .dna-bar-pct { font-size: 10px; font-weight: 800; width: 32px; }
  .fwd { color: #10B981; } .fwd .dna-bar-fill { background: #10B981; }
  .acr { color: #F59E0B; } .acr .dna-bar-fill { background: #F59E0B; }
  .bck { color: #F87171; } .bck .dna-bar-fill { background: #F87171; }
  .insight-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .insight-box { background: #1E293B; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
  .insight-box.green { border-left-color: #10B981; } .insight-box.red { border-left-color: #F87171; }
  .insight-box .insight-title { font-size: 12px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px; }
  .insight-box .insight-text { font-size: 11px; color: #94A3B8; line-height: 1.5; }
  .narrative { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 8px; }
  .narrative p { font-size: 12px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
  .narrative p:last-child { margin-bottom: 0; } .narrative strong { color: #CBD5E1; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1E293B; font-size: 9px; color: #334155; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo-bar">
    <svg width="28" height="28" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" stroke-width="2"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="28" y1="4" x2="28" y2="18" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="38" x2="28" y2="52" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="28" x2="18" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/><line x1="38" y1="28" x2="52" y2="28" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/></svg>
    <span>kykie</span>
    <span class="sub">Match Analysis</span>
  </div>
  <div class="match-header">
    <div class="match-type">League · Full Time · 60 Minutes</div>
    <div class="teams-row">
      <div><div class="team-badge" style="background:#1B4D3E;">PA</div></div>
      <div class="score-box">1 <span class="dash">–</span> 2</div>
      <div><div class="team-badge" style="background:#E87722;">OR</div></div>
    </div>
    <div class="team-names"><span>Paarl Girls</span><span>Oranje</span></div>
    <div class="match-meta"><span>2026-04-18</span> · <span>Home: Paarl Girls</span> · 41/59 possession</div>
  </div>

  <div class="verdict"><div class="label">Dominated by</div><div class="team">Oranje</div><div class="desc">57 D entries, 18 shots on goal, 75 turnovers won.<br>The 1–2 scoreline flatters Paarl Girls enormously.</div></div>

  <div class="section-title">Head to Head Stats</div>
  <div class="stat-compare" id="stats"></div>

  <div class="section-title">Ball Movement DNA</div>
  <div class="dna-row">
    <div class="dna-card">
      <div class="team-label">Paarl Girls</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:74%"></div></div><div class="dna-bar-pct">74%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:22%"></div></div><div class="dna-bar-pct">22%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:4%"></div></div><div class="dna-bar-pct">4%</div></div>
      </div>
    </div>
    <div class="dna-card">
      <div class="team-label">Oranje</div>
      <div class="dna-bar-group">
        <div class="dna-bar-row fwd"><div class="dna-bar-label">Forward</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:32%"></div></div><div class="dna-bar-pct">32%</div></div>
        <div class="dna-bar-row acr"><div class="dna-bar-label">Across</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:33%"></div></div><div class="dna-bar-pct">33%</div></div>
        <div class="dna-bar-row bck"><div class="dna-bar-label">Back</div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:35%"></div></div><div class="dna-bar-pct">35%</div></div>
      </div>
    </div>
  </div>

  <!-- Coach-only tactical analysis -->
  <div class="coach-only">
  
  <div class="section-title">Paarl Girls — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Strong Press</div><div class="insight-text">47 turnovers won shows genuine pressing intensity, even against a strong opponent.</div></div>
    <div class="insight-box green"><div class="insight-title">Aerial Threat</div><div class="insight-text">16 overheads to Oranje''s 1 — used the aerial game effectively to relieve pressure or create attacking opportunities.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 3 short corners (33%). Clinical when it mattered.</div></div>
    </div>
    <div class="section-title">Paarl Girls — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">87 possessions lost. Oranje won 75 turnovers — the ball couldn''t be held under pressure.</div></div>
    </div>
  <div class="section-title">Oranje — What Worked</div><div class="insight-grid">
    <div class="insight-box green"><div class="insight-title">Attacking Dominance</div><div class="insight-text">57 D entries to Paarl Girls''s 10. Consistently threatened the opposition circle.</div></div>
    <div class="insight-box green"><div class="insight-title">Winning the Turnover Battle</div><div class="insight-text">75 turnovers won — outpressed Paarl Girls (47). Controlled the tempo through aggressive ball-hunting.</div></div>
    <div class="insight-box green"><div class="insight-title">Set Piece Conversion</div><div class="insight-text">Converted 1 from 9 short corners (11%). Clinical when it mattered.</div></div>
    </div>
    <div class="section-title">Oranje — What Fell Short</div><div class="insight-grid">
    <div class="insight-box red"><div class="insight-title">Ball Retention Issues</div><div class="insight-text">89 possessions lost. Paarl Girls won 47 turnovers — the ball couldn''t be held under pressure.</div></div>
    <div class="insight-box red"><div class="insight-title">Short Corner Conversion</div><div class="insight-text">Only 1 from 9 short corners (11%). The volume was there but conversion wasn''t.</div></div>
    </div>

  <div class="section-title">The Story of the Match</div>
  <div class="narrative" style="border-left:3px solid #F59E0B;">
    <p>This was a match dominated by <strong>Oranje</strong> — 57 D entries to 10, 18 shots on goal to 2.</p>
    <p><strong>Paarl Girls</strong> played direct (74% forward) while <strong>Oranje</strong> was more patient (35% back, 33% across).</p>
    <p>The 1–2 scoreline doesn''t reflect the balance of play. Oranje created enough for a bigger margin but couldn''t convert.</p>
  </div>

  </div><!-- end coach-only -->

  <div class="footer">KYKIE AI SCOUT · MATCH ANALYSIS · 2026-04-18 · <a href="https://kykie.net" style="color:#F59E0B; text-decoration:none;">kykie.net</a></div>
</div>

<script>
const stats = [
    { label: ''Possession'', h: 41, a: 59, isPct: true },
    { label: ''Territory'', h: 39, a: 61, isPct: true },
    { label: ''Turnovers Won'', h: 47, a: 75 },
    { label: ''Possession Lost'', h: 87, a: 89, lowerBetter: true },
    { label: ''D Entries'', h: 10, a: 57 },
    { label: ''Short Corners'', h: 3, a: 9 },
    { label: ''SC Goals'', h: 1, a: 1 },
    { label: ''Shots'', h: 2, a: 29 },
    { label: ''Shots on Target'', h: 2, a: 18 },
    { label: ''Overheads'', h: 16, a: 1 }
];
const container = document.getElementById(''stats'');
stats.forEach(s => {
  const max = Math.max(s.h, s.a) || 1;
  const hWin = s.lowerBetter ? s.h < s.a : s.h > s.a;
  const aWin = s.lowerBetter ? s.a < s.h : s.a > s.h;
  const tied = s.h === s.a;
  const row = document.createElement(''div'');
  row.className = ''stat-row'';
  row.innerHTML = `
    <div class="stat-val ${tied ? ''draw'' : hWin ? ''win'' : ''lose''}">${s.h}${s.isPct ? ''%'' : ''''}</div>
    <div class="stat-bar-wrap left"><div class="stat-bar ${hWin ? ''green'' : ''dim''}" style="width: ${(s.h/max)*100}%"></div></div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-bar-wrap right"><div class="stat-bar ${aWin ? ''green'' : ''dim''}" style="width: ${(s.a/max)*100}%"></div></div>
    <div class="stat-val ${tied ? ''draw'' : aWin ? ''win'' : ''lose''}">${s.a}${s.isPct ? ''%'' : ''''}</div>
  `;
  container.appendChild(row);
});
</script>
</body>
</html>'
)
ON CONFLICT (match_id, report_type) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  title = EXCLUDED.title,
  generated_at = NOW();

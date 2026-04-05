import { useState, useEffect, useRef, useCallback } from 'react';

const H = "#F59E0B", B = "#3B82F6", gA = "#2D8B4E", gB = "#258043";

// Match narrative: DLI (amber) at top defends top, attacks down. DEA (blue) at bottom, attacks up.
const CHALLENGES = [
  { title: "Kick off", inst: "The umpire blows the whistle. Eagles win the toss and take the centre pass. Start the match.", a: "start" },
  { title: "Eagles push forward", inst: "Eagles receive the ball and push through midfield into the Lions' half. Move the ball through zones 1 → 2 → 3.", a: "pass_fwd" },
  { title: "Ball out!", inst: "A stray Eagles pass runs off the right sideline in midfield.", a: "out" },
  { title: "Lions win it back", inst: "Lions take the free hit and immediately win the ball. Switch possession.", a: "turnover" },
  { title: "Lions go long", inst: "Lions play a long overhead ball into their attacking quarter. Tap the target zone.", a: "overhead" },
  { title: "Ball dead", inst: "Lions attack the Eagles' backline but the ball runs dead off a Lions player.", a: "dead" },
  { title: "Long corner", inst: "Lions clear from their own quarter but the ball deflects off a Lions defender over the backline. Eagles are awarded a long corner.", a: "lc" },
  { title: "Into the D!", inst: "Lions win the ball back and drive into the Eagles' circle!", a: "dentry" },
  { title: "Short corner!", inst: "The umpire awards a short corner after a foot in the D. Select it from the popup.", a: "sc" },
  { title: "Yellow card", inst: "An Eagles defender gets a yellow card for a deliberate stick tackle. Record the card.", a: "actions" },
  { title: "Half time", inst: "The umpire blows for half time. Pause the match.", a: "pause" },
  { title: "Swap ends", inst: "Teams swap ends during the break. Rotate the field.", a: "rotate" },
  { title: "Second half", inst: "The umpire restarts play. Resume the match.", a: "resume" },
  { title: "Mistake!", inst: "Wait — you accidentally recorded that last event wrong. Undo it.", a: "undo" },
  { title: "Full time!", inst: "The final whistle blows. End the match.", a: "end" },
];

export default function BenchmarkTest({ onPass, onBack }) {
  const [cur, setCur] = useState(0);
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState(null);
  const [passed, setPassed] = useState(false);
  const cRef = useRef(null);
  const flashTimer = useRef(null);

  const $ = useCallback((id) => cRef.current?.querySelector('#' + id), []);

  useEffect(() => {
    if (cRef.current && !passed) setupChallenge();
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current); };
  }, [cur, passed]);

  const arSvg = (c, up) => `<svg width="14" height="20" viewBox="0 0 14 20" style="position:absolute;left:50%;transform:translateX(-50%);${up?'top:4px':'bottom:4px'};pointer-events:none;opacity:0.8"><polygon points="${up?'7,2 13,16 1,16':'7,18 13,4 1,4'}" fill="${c}"/></svg>`;

  const setArrows = (c, up) => {
    for (let r = 0; r < 4; r++) ['ol','or'].forEach(s => {
      const o = $(`${s}${r}`); if (!o) return;
      const sv = o.querySelector('svg'); if (sv) sv.remove();
      o.insertAdjacentHTML('beforeend', arSvg(c, up));
    });
  };

  const mkBl = (t, p) => `<div style="display:flex;height:28px;background:#1a3a2a" id="bl-${p}"><div id="dd-${p}-l" style="width:50px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#94A3B8;text-transform:uppercase;background:#162D22;cursor:pointer">Dead</div><div id="lc-${p}-l" style="width:46px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#F59E0B;text-transform:uppercase;background:#1E3A2F;cursor:pointer">◁ LC</div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative"><span style="font-size:9px;font-weight:800;color:${t.c};text-transform:uppercase;letter-spacing:0.1em;line-height:1">${t.s}</span><span style="font-size:6px;font-weight:600;color:#64748B;text-transform:uppercase;line-height:1;margin-top:1px">${t.n}</span><div id="act-${p}" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;z-index:18;border:1.5px solid ${t.c}66;color:${t.c};cursor:pointer">⚡</div></div><div id="lc-${p}-r" style="width:46px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#F59E0B;text-transform:uppercase;background:#1E3A2F;cursor:pointer">LC ▷</div><div id="dd-${p}-r" style="width:50px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#94A3B8;text-transform:uppercase;background:#162D22;cursor:pointer">Dead</div></div>`;

  const ball = (c) => `<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;z-index:10;cursor:pointer"><div style="position:absolute;width:50px;height:50px;border-radius:50%;background:${c}55;box-shadow:0 0 20px ${c}99,0 0 40px ${c}66;animation:bm-hp 1.8s ease-in-out infinite"></div><div style="width:22px;height:22px;border-radius:50%;background:#F8FAFC;border:3px solid ${c};box-shadow:0 0 8px ${c}88;z-index:2"></div></div>`;
  const startBall = () => '<div style="width:30px;height:30px;border-radius:50%;background:#F8FAFC;border:3px solid #94A3B8;animation:bm-pb 2s infinite;cursor:pointer"></div>';

  const buildField = () => {
    const fld = $('fld'); if (!fld) return;
    const hm = {n:'Demo Lions',s:'DLI',c:H}, aw = {n:'Demo Eagles',s:'DEA',c:B};
    let h = mkBl(hm, 'top');
    for (let r = 0; r < 4; r++) {
      if (r === 2) h += '<div style="height:1px;background:rgba(255,255,255,0.15);position:relative"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.18)"></div><div id="cb" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:15;cursor:pointer"></div></div>';
      h += '<div style="display:flex;height:68px">';
      h += `<div id="ol${r}" style="width:26px;display:flex;align-items:center;justify-content:center;background:#334155;position:relative;opacity:0.6;cursor:pointer"><span style="font-size:7px;font-weight:800;color:#CBD5E1;writing-mode:vertical-rl;letter-spacing:0.05em;pointer-events:none">OUT</span></div>`;
      for (let c = 0; c < 3; c++) h += `<div id="z${r}${c}" style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;background:${r%2===0?gA:gB};border-right:${c<2?'1px solid rgba(255,255,255,0.06)':'none'};cursor:pointer"></div>`;
      h += `<div id="or${r}" style="width:26px;display:flex;align-items:center;justify-content:center;background:#334155;position:relative;opacity:0.6;cursor:pointer"><span style="font-size:7px;font-weight:800;color:#CBD5E1;writing-mode:vertical-rl;letter-spacing:0.05em;pointer-events:none">OUT</span></div></div>`;
    }
    h += mkBl(aw, 'bot');
    h += `<div style="position:absolute;left:50%;transform:translateX(-50%);top:28px;width:80px;height:22px;z-index:15;pointer-events:none"><div style="width:80px;height:22px;border-bottom-left-radius:40px;border-bottom-right-radius:40px;border:3px solid ${H};border-top:none;background:${H}55"></div></div>`;
    h += `<div id="dab" style="position:absolute;left:50%;transform:translateX(-50%);bottom:28px;width:80px;height:22px;z-index:15;cursor:pointer"><div id="dabs" style="width:80px;height:22px;border-top-left-radius:40px;border-top-right-radius:40px;border:3px solid ${B};border-bottom:none;background:${B}55"></div></div>`;
    h += '<div id="ov" style="position:absolute;inset:0;z-index:16;pointer-events:none"></div>';
    fld.innerHTML = h;
  };

  const fl = (id) => { const e = $(id); if (e) e.style.animation = 'bm-bk 0.6s infinite'; };
  const badge = (id, num) => {
    const e = $(id); if (!e) return;
    const d = document.createElement('div'); d.id = 'badge-' + id;
    d.style.cssText = 'position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#F59E0B;color:#0B0F1A;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;z-index:20;pointer-events:none';
    d.textContent = num; e.style.position = 'relative'; e.appendChild(d);
  };
  const pt = (pid, h, id) => { const p = $(pid); if (!p) return; const d = document.createElement('div'); if (id) d.id = id; d.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;'; d.innerHTML = h; p.appendChild(d); };
  const rm = (id) => { const e = $(id); if (e) e.remove(); };
  const ov = (h) => { const o = $('ov'); if (o) o.innerHTML = h; };

  const setCtrl = (items) => {
    const ctl = $('ctl'); if (!ctl) return;
    ctl.innerHTML = items.map(i => `<div id="${i[2]}" style="padding:6px 14px;border-radius:8px;border:none;font-size:12px;font-weight:700;background:${i[0]};color:${i[1]};cursor:pointer;transition:all 0.3s">${i[3]}</div>`).join('');
  };

  const setPoss = (c, n) => {
    const pb2 = $('pb2'); if (!pb2) return;
    pb2.style.display = 'flex';
    pb2.innerHTML = `<div style="font-size:9px;font-weight:700;padding:2px 10px;border-radius:99px;display:inline-flex;align-items:center;gap:4px;color:${c};background:${c}22"><div style="width:6px;height:6px;border-radius:50%;background:${c}"></div>${n}</div><div id="fbtn" style="padding:3px 8px;border-radius:6px;border:1px solid #334155;background:#1E293B;color:#94A3B8;font-size:10px;font-weight:700;cursor:pointer">🔄</div>`;
    setArrows(c, c === B);
  };

  function setupChallenge() {
    buildField(); setStep(0); setFlash(null);
    const a = CHALLENGES[cur].a;

    // Default: show controls and possession bar
    setPoss(B, 'DEA');
    setCtrl([[H,'#0B0F1A','cpa','⏸ Pause'],['#EF4444','#FFF','cend','⏹ End'],['#1E293B','#94A3B8','cun','↩ Undo']]);

    if (a === 'start') {
      const cb = $('cb'); if (cb) cb.innerHTML = startBall();
      const pb2 = $('pb2'); if (pb2) pb2.style.display = 'none';
      const ctl = $('ctl'); if (ctl) ctl.innerHTML = '';
    }
    if (a === 'pass_fwd') {
      pt('z31', ball(B), 'bw');
      ['z21','z11','z01'].forEach((z, i) => { badge(z, i + 1); fl(z); });
    }
    if (a === 'out') { pt('z12', ball(B), 'bw'); fl('or1'); }
    if (a === 'turnover') { setPoss(B, 'DEA'); pt('z12', ball(B), 'bw'); }
    if (a === 'overhead') { setPoss(H, 'DLI'); pt('z10', ball(H), 'bw'); fl('z30'); badge('z30', '↑'); }
    if (a === 'dead') { setPoss(H, 'DLI'); pt('z31', ball(H), 'bw'); fl('dd-bot-l'); }
    if (a === 'lc') { setPoss(H, 'DLI'); pt('z01', ball(H), 'bw'); fl('lc-top-r'); }
    if (a === 'dentry') { setPoss(H, 'DLI'); pt('z31', ball(H), 'bw'); fl('dab'); const dabs = $('dabs'); if (dabs) dabs.style.animation = 'bm-bk 0.6s infinite'; }
    if (a === 'sc') {
      setPoss(H, 'DLI');
      ov(`<div style="position:absolute;z-index:22;background:#0F172Aee;border:1px solid #33415566;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px;min-width:170px;left:50%;transform:translateX(-50%);bottom:58px;pointer-events:auto">${[['Goal!',H,'popup-goal'],['Short Corner','#8B5CF6','popup-sc'],['Shot on Goal','#10B981','popup-sog'],['Shot off Target','#6B7280','popup-sot'],['Penalty',H,'popup-pen'],['Long Corner',B,'popup-lc'],['Lost Possession','#EF4444','popup-lp'],['Dead Ball','#94A3B8','popup-db']].map(x => `<div id="${x[2]}" style="padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#F8FAFC;display:flex;align-items:center;gap:8px;border:1px solid ${x[1]}44;background:${x[1]}18;cursor:pointer${x[2]==='popup-sc'?';animation:bm-bk 0.6s infinite':''}">${x[0]}</div>`).join('')}</div>`);
    }
    if (a === 'actions') { setPoss(H, 'DLI'); pt('z31', ball(H), 'bw'); fl('act-bot'); }
    if (a === 'pause') { setPoss(H, 'DLI'); pt('z11', ball(H), 'bw'); fl('cpa'); }
    if (a === 'rotate') {
      setPoss(H, 'DLI'); pt('z11', ball(H), 'bw');
      ov('<div style="position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);pointer-events:none"><div style="font-size:14px;font-weight:800;color:#F59E0B;text-transform:uppercase;letter-spacing:0.1em;background:rgba(15,23,42,0.85);padding:6px 20px;border-radius:10px;border:1px solid #F59E0B44">⏸ Paused</div></div>');
      setCtrl([['#10B981','#FFF','cres','▶ Resume'],['#EF4444','#FFF','cend','⏹ End'],['#1E293B','#94A3B8','cun','↩ Undo']]);
      fl('fbtn');
    }
    if (a === 'resume') {
      setPoss(H, 'DLI'); pt('z11', ball(H), 'bw');
      ov('<div style="position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);pointer-events:none"><div style="font-size:14px;font-weight:800;color:#F59E0B;text-transform:uppercase;letter-spacing:0.1em;background:rgba(15,23,42,0.85);padding:6px 20px;border-radius:10px;border:1px solid #F59E0B44">⏸ Paused</div></div>');
      setCtrl([['#10B981','#FFF','cres','▶ Resume'],['#EF4444','#FFF','cend','⏹ End'],['#1E293B','#94A3B8','cun','↩ Undo']]);
      fl('cres');
    }
    if (a === 'undo') { setPoss(H, 'DLI'); pt('z11', ball(H), 'bw'); fl('cun'); }
    if (a === 'end') { setPoss(H, 'DLI'); pt('z21', ball(H), 'bw'); fl('cend'); }
  }

  function showFlash(color, cb) {
    setFlash(color);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => { setFlash(null); if (cb) cb(); }, 600);
  }

  function advance() {
    if (cur < CHALLENGES.length - 1) setCur(c => c + 1);
    else setPassed(true);
  }

  function handleTap(e) {
    if (passed || flash) return;
    const target = e.target.closest('[id]');
    if (!target) return;
    const tid = target.id;
    const a = CHALLENGES[cur].a;
    let correct = false;

    if (a === 'start') correct = (tid === 'cb' || !!target.closest('#cb'));
    if (a === 'pass_fwd') {
      const seq = ['z21','z11','z01'];
      if (tid === seq[step]) { rm('badge-' + tid); target.style.animation = ''; correct = true; }
    }
    if (a === 'turnover') correct = (tid === 'bw' || !!target.closest('#bw'));
    if (a === 'overhead') correct = (tid === 'z30' || !!target.closest('#z30'));
    if (a === 'out') correct = (tid === 'or1');
    if (a === 'dead') correct = (tid === 'dd-bot-l');
    if (a === 'lc') correct = (tid === 'lc-top-r');
    if (a === 'dentry') correct = (tid === 'dab' || tid === 'dabs' || !!target.closest('#dab'));
    if (a === 'sc') correct = (tid === 'popup-sc');
    if (a === 'actions') {
      if (step === 0 && (tid === 'act-bot' || !!target.closest('#act-bot'))) {
        ov(`<div style="position:absolute;z-index:22;background:#0F172Aee;border:1px solid #33415566;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px;min-width:170px;left:50%;transform:translateX(-50%);bottom:34px;pointer-events:auto">${[['Green Card','#22C55E','act-green'],['Yellow Card','#F59E0B','act-yellow'],['Short Corner','#8B5CF6','act-sc'],['Penalty','#EF4444','act-pen']].map(x => `<div id="${x[2]}" style="padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#F8FAFC;display:flex;align-items:center;gap:8px;border:1px solid ${x[1]}44;background:${x[1]}18;cursor:pointer${x[2]==='act-yellow'?';animation:bm-bk 0.6s infinite':''}">${x[0]}</div>`).join('')}</div>`);
        setStep(1); showFlash('green'); return;
      }
      if (step === 1) correct = (tid === 'act-yellow');
    }
    if (a === 'pause') correct = (tid === 'cpa');
    if (a === 'resume') correct = (tid === 'cres');
    if (a === 'undo') correct = (tid === 'cun');
    if (a === 'rotate') correct = (tid === 'fbtn');
    if (a === 'end') correct = (tid === 'cend');

    if (correct) {
      if (a === 'pass_fwd' && step < 2) { setStep(s => s + 1); showFlash('green'); return; }
      showFlash('green', advance);
    } else {
      showFlash('red');
    }
  }

  if (passed) {
    return (
      <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ width: 80, height: 80, borderRadius: 40, border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>✓</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>Test passed!</div>
        <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
          You've demonstrated competence with the Live Pro recorder. You're now a qualified commentator.
        </div>
        <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, width: '100%', marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>What's next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Start with lower-ranked matches to build experience','Complete at least 2 live matches before high-profile games','Your first 5 matches will be reviewed for quality'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94A3B8' }}>
                <span style={{ color: '#10B981' }}>●</span> {t}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onPass} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#10B981', color: '#F8FAFC', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          Continue as qualified commentator →
        </button>
      </div>
    );
  }

  const ch = CHALLENGES[cur];

  return (
    <div ref={cRef} style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes bm-hp{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}@keyframes bm-bk{0%,100%{opacity:1}50%{opacity:0.15}}@keyframes bm-pb{0%,100%{box-shadow:0 0 16px rgba(255,255,255,0.6),0 0 32px rgba(255,255,255,0.3);transform:scale(1)}50%{box-shadow:0 0 24px rgba(255,255,255,0.8),0 0 48px rgba(255,255,255,0.4);transform:scale(1.1)}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: 0 }}>← Quit</button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Benchmark test</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>{cur + 1}/{CHALLENGES.length}</span>
      </div>

      <div style={{ height: 4, background: '#1E293B', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${(cur / CHALLENGES.length) * 100}%`, height: '100%', background: '#10B981', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{ch.title}</div>
      <div style={{ fontSize: 13, color: '#F8FAFC', lineHeight: 1.6, marginBottom: 10 }}>{ch.inst}</div>

      <div id="pb2" onClick={handleTap} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '0 14px 4px' }} />

      <div id="fld" onClick={handleTap} style={{
        borderRadius: 10, overflow: 'hidden', border: `2px solid ${flash === 'green' ? '#10B981' : flash === 'red' ? '#EF4444' : '#1a5c32'}`,
        position: 'relative', userSelect: 'none', transition: 'border-color 0.2s',
      }} />

      <div id="ctl" onClick={handleTap} style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '6px 14px 4px', flexWrap: 'wrap', marginBottom: 10 }} />

      {flash && (
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: flash === 'green' ? '#10B981' : '#EF4444', marginTop: 4 }}>
          {flash === 'green' ? '✓ Correct!' : '✗ Try again — look for the flashing element'}
        </div>
      )}
    </div>
  );
}

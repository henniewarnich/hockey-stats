import { useState, useEffect, useRef, useCallback } from 'react';

const H = "#F59E0B", B = "#3B82F6", gA = "#2D8B4E", gB = "#258043";

const STORY = [
  { t:"Kick off", i:"Eagles win the toss. Tap the ball, then select Eagles from the popup.", a:"start" },
  { t:"Eagles push forward", i:"Eagles receive and push into the Lions' midfield. Tap the flashing zone.", a:"tap", target:"z11", pc:B, bz:"cb" },
  { t:"Turnover!", i:"A Lions defender intercepts. Tap the ball to switch possession.", a:"turnover", pc:B, bz:"z11" },
  { t:"Ball out", i:"Lions pass runs off the left sideline. Tap the flashing OUT strip.", a:"tap", target:"ol2", pc:H, bz:"z11" },
  { t:"Eagles attack", i:"Eagles win the free hit and push into the Lions' quarter. Tap the flashing zone.", a:"tap", target:"z01", pc:B, bz:"z20" },
  { t:"Into the D!", i:"Eagles enter the Lions' circle. Tap the flashing D.", a:"d_top", pc:B, bz:"z01" },
  { t:"Short corner!", i:"Umpire awards a short corner. Tap Short Corner from the popup.", a:"popup", target:"popup-sc", pc:B },
  { t:"Take the short corner", i:"Eagles line up on the backline. Push the ball outside the D first. Tap the flashing zone.", a:"sc_setup", target:"z01", pc:B },
  { t:"Back into the D!", i:"Eagles push the ball back into the circle. Tap the D.", a:"d_top", pc:B, bz:"z01" },
  { t:"Goal!!", i:"Eagles score from the short corner! Tap Goal from the popup.", a:"popup", target:"popup-goal", pc:B },
  { t:"Lions restart", i:"Lions take the centre pass and play an overhead into Eagles Quarter Right. Press and drag the ball to the flashing zone.", a:"overhead", target:"z32", pc:H, bz:"cb" },
  { t:"Eagles intercept", i:"Eagles win the ball back. Tap the ball to switch possession.", a:"turnover", pc:H, bz:"z32" },
  { t:"Eagles build", i:"Eagles move into their own midfield right. Tap the flashing zone.", a:"tap", target:"z22", pc:B, bz:"z32" },
  { t:"Undo!", i:"Wrong zone — that should have been centre! Tap Undo.", a:"btn", target:"cun", pc:B, bz:"z22" },
  { t:"Long corner", i:"Ball deflects off an Eagles defender over the backline. Tap LC to award Lions a long corner.", a:"tap", target:"lc-bot-r", pc:B, bz:"z32" },
  { t:"Lions enter the D", i:"Lions push into the Eagles' circle from the long corner. Tap the flashing D.", a:"d_bot", pc:H, bz:"z32", bzPos:"top:-4px" },
  { t:"Dead ball", i:"Ball crosses the backline. Tap Dead Ball from the popup.", a:"popup", target:"popup-db", pc:H },
  { t:"Eagles overhead", i:"Eagles restart with an overhead to Lions Midfield Centre. Press and drag the ball to the flashing zone.", a:"overhead", target:"z11", pc:B, bz:"z31" },
  { t:"Turnover", i:"Lions win the ball back. Tap the ball to switch possession.", a:"turnover", pc:B, bz:"z11" },
  { t:"Yellow card", i:"Lions player gets a yellow card for a dangerous tackle. Tap ⚡ then Yellow Card.", a:"card", pc:H, bz:"z11" },
  { t:"Turnover", i:"Eagles win the ball back. Tap the ball to switch possession.", a:"turnover", pc:H, bz:"z11" },
  { t:"Eagles attack", i:"Eagles pass into Lions Quarter Right. Tap the flashing zone.", a:"tap", target:"z02", pc:B, bz:"z11" },
  { t:"Ball dead", i:"Ball crosses the Lions' backline off the Eagles. Tap the flashing DEAD button.", a:"tap", target:"dd-top-r", pc:B, bz:"z02" },
  { t:"Half time", i:"The umpire blows for half time. Tap Pause.", a:"btn", target:"cpa", pc:H, bz:"z01" },
  { t:"Swap ends", i:"Teams swap ends for the second half. Tap 🔄.", a:"btn", target:"fbtn", pc:H, bz:"z01" },
  { t:"Second half", i:"The umpire restarts play. Tap Resume.", a:"btn", target:"cres", pc:H, bz:"z01", flip:true },
  { t:"Lions push forward", i:"Lions take the centre pass and push right through the middle. Tap the flashing zone.", a:"tap", target:"z11", pc:H, bz:"cb", flip:true },
  { t:"Lions continue", i:"Lions push into the Eagles' quarter. Tap the flashing zone.", a:"tap", target:"z01", pc:H, bz:"z11", flip:true },
  { t:"Into the D!", i:"Lions enter the Eagles' circle. Tap the flashing D.", a:"d_top", pc:H, bz:"z01", flip:true },
  { t:"Lost possession", i:"Eagles defend well and win the ball. Tap Lost Possession from the popup.", a:"popup", target:"popup-lp", pc:H, flip:true },
  { t:"Eagles build", i:"Eagles move into their own midfield centre. Tap the flashing zone.", a:"tap", target:"z21", pc:B, bz:"z01", flip:true },
  { t:"Turnover", i:"Lions steal it back! Tap the ball to switch possession.", a:"turnover", pc:B, bz:"z21", flip:true },
  { t:"Lions attack again", i:"Lions push into the Eagles' quarter. Tap the flashing zone.", a:"tap", target:"z01", pc:H, bz:"z21", flip:true },
  { t:"Into the D!", i:"Lions drive into the circle again. Tap the flashing D.", a:"d_top", pc:H, bz:"z01", flip:true },
  { t:"Shot off target", i:"Lions shoot but miss. Tap Shot off Target from the popup.", a:"popup", target:"popup-sot", pc:H, flip:true },
  { t:"Goal!!", i:"Lions score on the rebound! Tap Goal from the popup.", a:"popup", target:"popup-goal", pc:H, flip:true },
  { t:"Full time!", i:"The final whistle blows. End the match.", a:"btn", target:"cend", pc:H, bz:"z21", flip:true },
];

export default function BenchmarkTest({ onPass, onBack }) {
  const [cur, setCur] = useState(0);
  const [sub, setSub] = useState(0);
  const [flash, setFlash] = useState(null);
  const [passed, setPassed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cRef = useRef(null);
  const flashT = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });

  const $ = useCallback((id) => cRef.current?.querySelector('#' + id), []);

  useEffect(() => {
    if (cRef.current && !passed) setTimeout(setup, 50);
    return () => { if (flashT.current) clearTimeout(flashT.current); };
  }, [cur, passed]);

  const arSvg = (c, up) => `<svg width="14" height="20" viewBox="0 0 14 20" style="position:absolute;left:50%;transform:translateX(-50%);${up?'top:4px':'bottom:4px'};pointer-events:none;opacity:0.8"><polygon points="${up?'7,2 13,16 1,16':'7,18 13,4 1,4'}" fill="${c}"/></svg>`;
  const setA = (c, up) => { for (let r=0;r<4;r++) ['ol','or'].forEach(s => { const o=$(`${s}${r}`);if(!o)return;const sv=o.querySelector('svg');if(sv)sv.remove();o.insertAdjacentHTML('beforeend',arSvg(c,up)); }); };

  const mkBl = (t,p) => `<div style="display:flex;height:28px;background:#1a3a2a" id="bl-${p}"><div id="dd-${p}-l" style="width:50px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#94A3B8;text-transform:uppercase;background:#162D22;cursor:pointer">Dead</div><div id="lc-${p}-l" style="width:46px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#F59E0B;text-transform:uppercase;background:#1E3A2F;cursor:pointer">◁LC</div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative"><span style="font-size:9px;font-weight:800;color:${t.c};text-transform:uppercase;letter-spacing:0.1em;line-height:1">${t.s}</span><span style="font-size:6px;font-weight:600;color:#64748B;text-transform:uppercase;line-height:1;margin-top:1px">${t.n}</span><div id="act-${p}" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;z-index:18;border:1.5px solid ${t.c}66;color:${t.c};cursor:pointer">⚡</div></div><div id="lc-${p}-r" style="width:46px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#F59E0B;text-transform:uppercase;background:#1E3A2F;cursor:pointer">LC▷</div><div id="dd-${p}-r" style="width:50px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#94A3B8;text-transform:uppercase;background:#162D22;cursor:pointer">Dead</div></div>`;

  const bl = (c) => `<div id="bw" style="position:relative;display:inline-flex;align-items:center;justify-content:center;z-index:10;cursor:pointer;touch-action:none"><div style="position:absolute;width:50px;height:50px;border-radius:50%;background:${c}55;box-shadow:0 0 20px ${c}99,0 0 40px ${c}66;animation:bm-hp 1.8s ease-in-out infinite"></div><div style="width:22px;height:22px;border-radius:50%;background:#F8FAFC;border:3px solid ${c};box-shadow:0 0 8px ${c}88;z-index:2"></div></div>`;
  const startBl = () => '<div style="width:30px;height:30px;border-radius:50%;background:#F8FAFC;border:3px solid #94A3B8;animation:bm-pb 2s infinite;cursor:pointer"></div>';

  const buildF = (flip) => {
    const fld=$('fld');if(!fld)return;
    const hm={n:'Demo Lions',s:'DLI',c:H},aw={n:'Demo Eagles',s:'DEA',c:B};
    const tn=flip?[aw,hm]:[hm,aw];
    let h=mkBl(tn[0],'top');
    for(let r=0;r<4;r++){
      if(r===2)h+='<div style="height:1px;background:rgba(255,255,255,0.15);position:relative"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.18)"></div><div id="cb" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:15;cursor:pointer"></div></div>';
      h+='<div style="display:flex;height:68px">';
      h+=`<div id="ol${r}" style="width:26px;display:flex;align-items:center;justify-content:center;background:#334155;position:relative;opacity:0.6;cursor:pointer"><span style="font-size:7px;font-weight:800;color:#CBD5E1;writing-mode:vertical-rl;letter-spacing:0.05em;pointer-events:none">OUT</span></div>`;
      for(let c=0;c<3;c++)h+=`<div id="z${r}${c}" style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;background:${r%2===0?gA:gB};border-right:${c<2?'1px solid rgba(255,255,255,0.06)':'none'};cursor:pointer"></div>`;
      h+=`<div id="or${r}" style="width:26px;display:flex;align-items:center;justify-content:center;background:#334155;position:relative;opacity:0.6;cursor:pointer"><span style="font-size:7px;font-weight:800;color:#CBD5E1;writing-mode:vertical-rl;letter-spacing:0.05em;pointer-events:none">OUT</span></div></div>`;
    }
    h+=mkBl(tn[1],'bot');
    h+=`<div id="dat" style="position:absolute;left:50%;transform:translateX(-50%);top:28px;width:80px;height:22px;z-index:15;cursor:pointer"><div id="dats" style="width:80px;height:22px;border-bottom-left-radius:40px;border-bottom-right-radius:40px;border:3px solid ${tn[0].c};border-top:none;background:${tn[0].c}55"></div></div>`;
    h+=`<div id="dab" style="position:absolute;left:50%;transform:translateX(-50%);bottom:28px;width:80px;height:22px;z-index:15;cursor:pointer"><div id="dabs" style="width:80px;height:22px;border-top-left-radius:40px;border-top-right-radius:40px;border:3px solid ${tn[1].c};border-bottom:none;background:${tn[1].c}55"></div></div>`;
    h+='<div id="ov" style="position:absolute;inset:0;z-index:16;pointer-events:none"></div>';
    h+='<div id="dragline" style="position:absolute;inset:0;z-index:14;pointer-events:none"></div>';
    fld.innerHTML=h;
  };

  const fl = (id) => { const e=$(id);if(e)e.style.animation='bm-bk 0.6s infinite'; };
  const badge = (id,txt) => { const e=$(id);if(!e)return;const d=document.createElement('div');d.id='badge-'+id;d.style.cssText='position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#F59E0B;color:#0B0F1A;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;z-index:20;pointer-events:none';d.textContent=txt;e.style.position='relative';e.appendChild(d); };
  const pt = (pid,h,id,ex) => { const p=$(pid);if(!p)return;const d=document.createElement('div');if(id)d.id=id;d.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;'+(ex||'');d.innerHTML=h;p.appendChild(d); };
  const ov = (h) => { const o=$('ov');if(o)o.innerHTML=h; };

  const setCtrl = (items) => { const ctl=$('ctl');if(!ctl)return;ctl.innerHTML=items.map(x=>`<div id="${x[2]}" style="padding:6px 14px;border-radius:8px;border:none;font-size:12px;font-weight:700;background:${x[0]};color:${x[1]};cursor:pointer">${x[3]}</div>`).join(''); };
  const setPoss = (c,n,flip) => { const pb2=$('pb2');if(!pb2)return;pb2.style.display='flex';pb2.innerHTML=`<div style="font-size:9px;font-weight:700;padding:2px 10px;border-radius:99px;display:inline-flex;align-items:center;gap:4px;color:${c};background:${c}22"><div style="width:6px;height:6px;border-radius:50%;background:${c}"></div>${n}</div><div id="fbtn" style="padding:3px 8px;border-radius:6px;border:1px solid #334155;background:#1E293B;color:#94A3B8;font-size:10px;font-weight:700;cursor:pointer">🔄</div>`;setA(c,flip?c===H:c===B); };
  const stdCtrl = () => setCtrl([[H,'#0B0F1A','cpa','⏸ Pause'],['#EF4444','#FFF','cend','⏹ End'],['#1E293B','#94A3B8','cun','↩ Undo']]);
  const pauseCtrl = () => setCtrl([['#10B981','#FFF','cres','▶ Resume'],['#EF4444','#FFF','cend','⏹ End'],['#1E293B','#94A3B8','cun','↩ Undo']]);

  const dpop = `<div style="position:absolute;z-index:22;background:#0F172Aee;border:1px solid #33415566;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px;min-width:170px;left:50%;transform:translateX(-50%);bottom:58px;pointer-events:auto">${[['Goal!',H,'popup-goal'],['Short Corner','#8B5CF6','popup-sc'],['Shot on Goal','#10B981','popup-sog'],['Shot off Target','#6B7280','popup-sot'],['Penalty',H,'popup-pen'],['Long Corner',B,'popup-lc'],['Lost Possession','#EF4444','popup-lp'],['Dead Ball','#94A3B8','popup-db']].map(x=>`<div id="${x[2]}" style="padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#F8FAFC;display:flex;align-items:center;gap:8px;border:1px solid ${x[1]}44;background:${x[1]}18;cursor:pointer">${x[0]}</div>`).join('')}</div>`;

  function setup() {
    const s = STORY[cur]; if (!s) return;
    const flip = !!s.flip;
    buildF(flip); setSub(0); setFlash(null);
    setPoss(s.pc || B, s.pc === H ? 'DLI' : 'DEA', flip);
    stdCtrl();

    if (s.a === 'start') {
      const cb=$('cb');if(cb)cb.innerHTML=startBl();
      $('pb2').style.display='none';$('ctl').innerHTML='';
    } else if (s.a === 'tap') {
      if (s.bz === 'cb') { const cb=$('cb');if(cb)cb.innerHTML=bl(s.pc); }
      else if (s.bz) pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
      fl(s.target);
    } else if (s.a === 'sc_setup') {
      // Place ball on backline strip matching Live Pro: FieldRecorder.jsx line 351-357
      const blt=$('bl-top');if(blt){const m=blt.children[2];if(m){const d=document.createElement('div');d.id='bw';d.style.cssText='position:absolute;left:calc(50% - 70px);bottom:-11px;transform:translateX(-50%);z-index:20';d.innerHTML=bl(s.pc);m.appendChild(d);}}
      fl(s.target);
    } else if (s.a === 'turnover') {
      pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
    } else if (s.a === 'overhead') {
      if (s.bz === 'cb') { const cb=$('cb');if(cb){cb.innerHTML=bl(s.pc);cb.style.touchAction='none';} }
      else pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
      fl(s.target); badge(s.target, '↑');
    } else if (s.a === 'd_top') {
      pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
      fl('dat'); const dats=$('dats');if(dats)dats.style.animation='bm-bk 0.6s infinite';
    } else if (s.a === 'd_bot') {
      pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
      fl('dab'); const dabs=$('dabs');if(dabs)dabs.style.animation='bm-bk 0.6s infinite';
    } else if (s.a === 'popup') {
      ov(dpop);
      const t=$(s.target);if(t)t.style.animation='bm-bk 0.6s infinite';
    } else if (s.a === 'card') {
      pt(s.bz, bl(s.pc), 'bw', s.bzPos||''); fl('act-bot');
    } else if (s.a === 'btn') {
      if (s.bz === 'cb') { const cb=$('cb');if(cb)cb.innerHTML=bl(s.pc); }
      else if (s.bz) pt(s.bz, bl(s.pc), 'bw', s.bzPos||'');
      if (s.target === 'cres') {
        pauseCtrl();
        ov('<div style="position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);pointer-events:none"><div style="font-size:14px;font-weight:800;color:#F59E0B;text-transform:uppercase;background:rgba(15,23,42,0.85);padding:6px 20px;border-radius:10px;border:1px solid #F59E0B44">⏸ Paused</div></div>');
        fl('cres');
      } else if (s.target === 'fbtn') {
        pauseCtrl();
        ov('<div style="position:absolute;inset:0;z-index:25;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);pointer-events:none"><div style="font-size:14px;font-weight:800;color:#F59E0B;text-transform:uppercase;background:rgba(15,23,42,0.85);padding:6px 20px;border-radius:10px;border:1px solid #F59E0B44">⏸ Paused</div></div>');
        fl('fbtn');
      } else {
        fl(s.target);
      }
    }
  }

  function showFlash(c, cb) {
    setFlash(c);
    if (flashT.current) clearTimeout(flashT.current);
    flashT.current = setTimeout(() => { setFlash(null); if (cb) cb(); }, 600);
  }
  function advance() { if (cur < STORY.length - 1) setCur(c => c + 1); else setPassed(true); }

  // Pointer events for overhead drag
  function handlePointerDown(e) {
    if (passed || flash) return;
    const s = STORY[cur]; if (s.a !== 'overhead') return;
    const bw = $('bw') || $('cb');
    if (!bw) return;
    const t = e.target.closest('#bw') || e.target.closest('#cb');
    if (!t) return;
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY };
    setDragging(true);
  }
  function handlePointerMove(e) {
    if (!dragRef.current.active) return;
    const fld = $('fld'); if (!fld) return;
    const dl = $('dragline'); if (!dl) return;
    const rf = fld.getBoundingClientRect();
    const sx = dragRef.current.startX - rf.left, sy = dragRef.current.startY - rf.top;
    const ex = e.clientX - rf.left, ey = e.clientY - rf.top;
    dl.innerHTML = `<svg style="width:100%;height:100%"><line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="#3B82F6" stroke-width="2" stroke-dasharray="6 4" opacity="0.7"/></svg>`;
  }
  function handlePointerUp(e) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    const dl = $('dragline'); if (dl) dl.innerHTML = '';
    const s = STORY[cur]; if (s.a !== 'overhead') return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) { showFlash('red'); return; }
    const zone = target.closest('[id]');
    if (zone && (zone.id === s.target || !!zone.closest('#' + s.target))) {
      showFlash('green', advance);
    } else {
      showFlash('red');
    }
  }

  function handleTap(e) {
    if (passed || flash || dragging) return;
    const s = STORY[cur]; if (!s) return;
    if (s.a === 'overhead') return; // handled by drag
    const t = e.target.closest('[id]');
    if (!t) return;
    const tid = t.id;
    let ok = false;

    if (s.a === 'start') {
      if (tid === 'cb' || t.closest('#cb')) {
        // Show team popup
        ov(`<div style="position:absolute;z-index:30;left:50%;top:50%;transform:translate(-50%,-50%);background:#0F172Aee;border:1px solid #33415566;border-radius:12px;padding:12px;min-width:180px;pointer-events:auto;display:flex;flex-direction:column;gap:6px"><div style="font-size:11px;color:#94A3B8;text-align:center;margin-bottom:4px">Which team takes the centre pass?</div><div id="pick-home" style="padding:10px;border-radius:8px;border:2px solid ${H}44;background:${H}11;color:${H};font-size:13px;font-weight:700;text-align:center;cursor:pointer">🟡 Demo Lions</div><div id="pick-away" style="padding:10px;border-radius:8px;border:2px solid ${B}44;background:${B}11;color:${B};font-size:13px;font-weight:700;text-align:center;cursor:pointer;animation:bm-bk 0.6s infinite">🔵 Demo Eagles</div></div>`);
        setSub(1); return;
      }
      if (sub === 1 && tid === 'pick-away') ok = true;
      if (sub === 1 && tid === 'pick-home') { showFlash('red'); return; }
    }
    if (s.a === 'tap') ok = (tid === s.target || !!t.closest('#' + s.target));
    if (s.a === 'sc_setup') ok = (tid === s.target || !!t.closest('#' + s.target));
    if (s.a === 'turnover') ok = (tid === 'bw' || !!t.closest('#bw'));
    if (s.a === 'd_top') ok = (tid === 'dat' || tid === 'dats' || !!t.closest('#dat'));
    if (s.a === 'd_bot') ok = (tid === 'dab' || tid === 'dabs' || !!t.closest('#dab'));
    if (s.a === 'popup') ok = (tid === s.target);
    if (s.a === 'card') {
      if (sub === 0 && (tid === 'act-bot' || !!t.closest('#act-bot'))) {
        ov(`<div style="position:absolute;z-index:22;background:#0F172Aee;border:1px solid #33415566;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px;min-width:170px;left:50%;transform:translateX(-50%);bottom:34px;pointer-events:auto">${[['Green Card','#22C55E','act-green'],['Yellow Card','#F59E0B','act-yellow'],['Short Corner','#8B5CF6','act-sc'],['Penalty','#EF4444','act-pen']].map(x=>`<div id="${x[2]}" style="padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#F8FAFC;display:flex;align-items:center;gap:8px;border:1px solid ${x[1]}44;background:${x[1]}18;cursor:pointer${x[2]==='act-yellow'?';animation:bm-bk 0.6s infinite':''}">${x[0]}</div>`).join('')}</div>`);
        setSub(1); showFlash('green'); return;
      }
      if (sub === 1) ok = (tid === 'act-yellow');
    }
    if (s.a === 'btn') ok = (tid === s.target);

    if (ok) showFlash('green', advance);
    else showFlash('red');
  }

  if (passed) {
    return (
      <div style={{ fontFamily:"'Outfit','DM Sans',sans-serif",maxWidth:430,margin:'0 auto',background:'#0B0F1A',minHeight:'100vh',color:'#F8FAFC',padding:'16px 16px 24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16 }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={{width:80,height:80,borderRadius:40,border:'4px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>✓</div>
        <div style={{fontSize:22,fontWeight:800,color:'#10B981'}}>Test passed!</div>
        <div style={{fontSize:13,color:'#94A3B8',textAlign:'center',lineHeight:1.6}}>You have now entered the Apprentice program.</div>
        <div style={{background:'#1E293B',borderRadius:10,padding:14,width:'100%',marginTop:8}}>
          <div style={{fontSize:11,color:'#64748B',marginBottom:8,fontWeight:600}}>What's next</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {['Complete 1 Live and 1 Recorded match to remove the limitation on matches you can commentate','After 5 matches, you will qualify as a full Commentator and be eligible to start earning credits','Credits can be redeemed for Takealot vouchers — R100 per 100 credits'].map((t,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:11,color:'#94A3B8'}}><span style={{color:'#10B981',marginTop:2}}>●</span><span>{t}</span></div>
            ))}
          </div>
        </div>
        <button onClick={onPass} style={{width:'100%',padding:12,borderRadius:10,border:'none',background:'#10B981',color:'#F8FAFC',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:8}}>Continue as qualified commentator →</button>
      </div>
    );
  }

  const s = STORY[cur];
  return (
    <div ref={cRef} style={{fontFamily:"'Outfit','DM Sans',sans-serif",maxWidth:430,margin:'0 auto',background:'#0B0F1A',minHeight:'100vh',color:'#F8FAFC',padding:'16px 16px 24px'}}
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`@keyframes bm-hp{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}@keyframes bm-bk{0%,100%{opacity:1}50%{opacity:0.15}}@keyframes bm-pb{0%,100%{box-shadow:0 0 16px rgba(255,255,255,0.6),0 0 32px rgba(255,255,255,0.3);transform:scale(1)}50%{box-shadow:0 0 24px rgba(255,255,255,0.8),0 0 48px rgba(255,255,255,0.4);transform:scale(1.1)}}`}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'#64748B',fontSize:13,cursor:'pointer',padding:0}}>← Quit</button>
        <span style={{fontSize:14,fontWeight:700}}>Benchmark test</span>
        <span style={{fontSize:12,color:'#64748B'}}>{cur+1}/{STORY.length}</span>
      </div>
      <div style={{height:4,background:'#1E293B',borderRadius:2,marginBottom:14,overflow:'hidden'}}>
        <div style={{width:`${(cur/STORY.length)*100}%`,height:'100%',background:'#10B981',borderRadius:2,transition:'width 0.3s'}}/>
      </div>
      <div style={{fontSize:16,fontWeight:500,marginBottom:4}}>{s.t}</div>
      <div style={{fontSize:13,color:'#F8FAFC',lineHeight:1.6,marginBottom:10}}>{s.i}</div>

      <div id="pb2" onClick={handleTap} style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'0 14px 4px'}}/>
      <div id="fld" onClick={handleTap} onPointerDown={handlePointerDown} style={{
        borderRadius:10,overflow:'hidden',border:`2px solid ${flash==='green'?'#10B981':flash==='red'?'#EF4444':'#1a5c32'}`,
        position:'relative',userSelect:'none',transition:'border-color 0.2s',touchAction:'pan-y',
      }}/>
      <div id="ctl" onClick={handleTap} style={{display:'flex',gap:6,justifyContent:'center',padding:'6px 14px 4px',flexWrap:'wrap',marginBottom:10}}/>

      {flash&&<div style={{textAlign:'center',fontSize:12,fontWeight:700,color:flash==='green'?'#10B981':'#EF4444',marginTop:4}}>{flash==='green'?'✓ Correct!':'✗ Try again'}</div>}
    </div>
  );
}

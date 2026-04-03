/**
 * PlayPatternField — renders play pattern arrows + prominent player zones.
 *
 * Single mode:  <PlayPatternField patterns={agg} prominentZones={zones} />
 * Compare mode: <PlayPatternField patterns={agg} matchPatterns={match}
 *                 prominentZones={aggZones} matchProminentZones={matchZones} />
 */

export default function PlayPatternField({ patterns, matchPatterns, prominentZones, matchProminentZones }) {
  if (!patterns || !patterns.exit || !patterns.attack) return null;

  const compare = !!(matchPatterns?.exit);
  const X = { L: 50, C: 150, R: 250 };

  const ZONE_RECTS = {
    'OQ L': [1,1,99,99], 'OQ C': [101,1,98,99], 'OQ R': [201,1,98,99],
    'OM L': [1,101,99,99], 'OM C': [101,101,98,99], 'OM R': [201,101,98,99],
    'DM L': [1,201,99,99], 'DM C': [101,201,98,99], 'DM R': [201,201,98,99],
    'DQ L': [1,301,99,98], 'DQ C': [101,301,98,98], 'DQ R': [201,301,98,98],
  };
  const D_PATHS = {
    L: 'M 55,80 Q 90,40 145,16', C: 'M 150,80 L 150,14', R: 'M 245,80 Q 210,40 155,16',
  };

  function resolveLanes(p) {
    return {
      exitLane: p.exit?.entryLane || 'C',
      attackLane: p.attack?.transitLane || p.attack?.entryLane || 'C',
    };
  }

  function buildPaths(targetLane, y1, y2, prevLane) {
    const paths = [];
    if (targetLane === 'balanced') {
      for (const l of ['L', 'C', 'R']) {
        const x1 = prevLane === 'balanced' ? X[l] : X[prevLane || 'C'];
        const x2 = X[l];
        if (x1 === x2) paths.push({ d: `M ${x1},${y1} L ${x2},${y2}`, w: 9 });
        else { const my = (y1+y2)/2; paths.push({ d: `M ${x1},${y1} Q ${x1+(x2-x1)*0.3},${my} ${x2},${y2}`, w: 9 }); }
      }
    } else {
      const sx = prevLane === 'balanced' ? X.C : X[prevLane || 'C'];
      const ex = X[targetLane];
      if (sx === ex) paths.push({ d: `M ${sx},${y1} L ${ex},${y2}`, w: 12 });
      else { const my = (y1+y2)/2; paths.push({ d: `M ${sx},${y1} Q ${sx+(ex-sx)*0.5},${my} ${ex},${y2}`, w: 12 }); }
    }
    return paths;
  }

  function buildDPaths(data) {
    if (!data) return [];
    const paths = [];
    const el = data.entryLane;
    const lanes = data.lanes?.entry || {};
    const sorted = Object.entries(lanes).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [,c]) => s + c, 0) || 1;
    if (el === 'balanced') {
      paths.push({ d: D_PATHS.C, w: 8 }); paths.push({ d: D_PATHS.L, w: 5 }); paths.push({ d: D_PATHS.R, w: 5 });
    } else {
      paths.push({ d: D_PATHS[el] || D_PATHS.C, w: 10 });
      if (sorted.length >= 2) { const sl = sorted[1][0]; if (sorted[1][1]/total*100 > 15 && sl !== el) paths.push({ d: D_PATHS[sl], w: 6 }); }
    }
    return paths;
  }

  function getAllPaths(p) {
    const { exitLane, attackLane } = resolveLanes(p);
    return { exit: buildPaths(exitLane, 370, 210, 'C'), attack: buildPaths(attackLane, 205, 85, exitLane), dEntry: buildDPaths(p.dEntry) };
  }

  // Render one field
  function renderField(p, zones, isDotted, label, id) {
    const all = getAllPaths(p);
    const dash = isDotted ? '10 7' : 'none';
    const whiteW = isDotted ? 0 : 0.2; // no white inner on dotted

    return (
      <div style={{ flex: 1, textAlign: 'center' }}>
        {compare && <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>{label}</div>}
        <div style={{ textAlign: 'center', fontSize: 6, color: '#ffffff22', letterSpacing: 3, marginBottom: 1 }}>▲ ATK ▲</div>
        <svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
          <defs>
            <clipPath id={`ppf${id}`}><rect width="300" height="400" rx="12" /></clipPath>
            <marker id={`wa${id}`} viewBox="0 0 6 6" refX="6" refY="3" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0.5 L6,3 L0,5.5Z" fill="#fff" opacity="0.6" />
            </marker>
          </defs>
          <rect width="300" height="400" rx="12" fill="#7cc47c" />
          <g clipPath={`url(#ppf${id})`}>
            {/* Prominent zones — top 3, equal shading */}
            {(zones || []).map(z => {
              const r = ZONE_RECTS[z];
              return r ? <rect key={z} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill="#000" opacity="0.22" /> : null;
            })}
            {/* Grid */}
            <line x1="100" y1="0" x2="100" y2="400" stroke="#fff" strokeOpacity=".15" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="#fff" strokeOpacity=".15" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#fff" strokeOpacity=".15" />
            <line x1="0" y1="200" x2="300" y2="200" stroke="#fff" strokeOpacity=".2" strokeWidth="1.5" />
            <line x1="0" y1="300" x2="300" y2="300" stroke="#fff" strokeOpacity=".15" />
            <path d="M 100 0 Q 100 45 150 45 Q 200 45 200 0" fill="none" stroke="#fff" strokeOpacity=".15" />
            <path d="M 100 400 Q 100 355 150 355 Q 200 355 200 400" fill="none" stroke="#fff" strokeOpacity=".15" />
          </g>
          <rect width="300" height="400" rx="12" fill="none" stroke="#5ea85e" strokeWidth="2" />

          {/* Arrows: exit red, attack blue, D black */}
          {all.exit.map(({ d, w }) => (
            <g key={d+'r'}><path d={d} fill="none" stroke="#DC2626" strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
            {!isDotted && <path d={d} fill="none" stroke="#fff" strokeWidth={Math.max(1.5, w*0.2)} strokeLinecap="round" opacity="0.5" markerEnd={`url(#wa${id})`} />}
            </g>
          ))}
          {all.attack.map(({ d, w }) => (
            <g key={d+'b'}><path d={d} fill="none" stroke="#2563EB" strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
            {!isDotted && <path d={d} fill="none" stroke="#fff" strokeWidth={Math.max(1.5, w*0.2)} strokeLinecap="round" opacity="0.5" markerEnd={`url(#wa${id})`} />}
            </g>
          ))}
          {all.dEntry.map(({ d, w }) => (
            <g key={d+'k'}><path d={d} fill="none" stroke="#1a1a1a" strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
            {!isDotted && <path d={d} fill="none" stroke="#fff" strokeWidth={Math.max(1.2, w*0.2)} strokeLinecap="round" opacity="0.4" markerEnd={`url(#wa${id})`} />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: compare ? 8 : 0 }}>
        {renderField(patterns, prominentZones, false, `Overall (${patterns.matchCount})`, 'a')}
        {compare && renderField(matchPatterns, matchProminentZones, true, 'This Match', 'm')}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
        {[['#DC2626', 'Exit'], ['#2563EB', 'Attack'], ['#1a1a1a', 'To D']].map(([c, l]) => (
          <span key={l} style={{ fontSize: 8, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 12, height: 3, background: c, borderRadius: 2 }} /> {l}
          </span>
        ))}
        <span style={{ fontSize: 8, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(0,0,0,0.22)', borderRadius: 2 }} /> Prominent
        </span>
        {compare && (
          <span style={{ fontSize: 8, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 12, borderTop: '2px dashed #94A3B8' }} /> This match
          </span>
        )}
      </div>

      <div style={{ fontSize: 9, color: '#475569', textAlign: 'center' }}>
        {compare
          ? `This match: ${matchPatterns.exitCount} exits · ${matchPatterns.attackCount} attacks · ${matchPatterns.dEntryCount} D entries`
          : `${patterns.exitCount} exits · ${patterns.attackCount} attacks · ${patterns.dEntryCount} D entries · ${patterns.matchCount} matches`
        }
      </div>
    </div>
  );
}

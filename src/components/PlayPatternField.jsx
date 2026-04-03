/**
 * PlayPatternField — renders exit (red), attack (blue), and D-entry (black)
 * arrows on a hockey field SVG based on analysed play pattern data.
 */

export default function PlayPatternField({ patterns, teamName }) {
  if (!patterns || !patterns.exit || !patterns.attack) return null;
  const { exit, attack, dEntry } = patterns;

  const X = { L: 50, C: 150, R: 250 };
  const D_PATHS = {
    L: 'M 55,80 Q 90,40 145,16',
    C: 'M 150,80 L 150,14',
    R: 'M 245,80 Q 210,40 155,16',
  };

  // Resolve dominant lane for each phase
  const exitLane = exit.entryLane || 'C';
  const attackLane = attack.transitLane || attack.entryLane || 'C';

  // Build paths for a phase
  // prevLane: resolved lane of previous phase — determines where arrows START
  function buildPaths(targetLane, y1, y2, prevLane) {
    const paths = [];

    if (targetLane === 'balanced') {
      for (const l of ['L', 'C', 'R']) {
        // If previous phase was balanced, continue in same lane (L→L, C→C, R→R)
        // If previous phase was dominant (e.g. 'L'), all start from that lane and fan out
        const x1 = prevLane === 'balanced' ? X[l] : X[prevLane || 'C'];
        const x2 = X[l];
        if (x1 === x2) {
          paths.push({ d: `M ${x1},${y1} L ${x2},${y2}`, w: 9 });
        } else {
          const my = (y1 + y2) / 2;
          paths.push({ d: `M ${x1},${y1} Q ${x1 + (x2 - x1) * 0.3},${my} ${x2},${y2}`, w: 9 });
        }
      }
    } else {
      // Single dominant line
      const startX = prevLane === 'balanced' ? X.C : X[prevLane || 'C'];
      const endX = X[targetLane];
      if (startX === endX) {
        paths.push({ d: `M ${startX},${y1} L ${endX},${y2}`, w: 12 });
      } else {
        const my = (y1 + y2) / 2;
        paths.push({ d: `M ${startX},${y1} Q ${startX + (endX - startX) * 0.5},${my} ${endX},${y2}`, w: 12 });
      }
    }
    return paths;
  }

  // Build D-entry paths — always check for secondaries (>15% of total)
  function buildDPaths(data) {
    if (!data) return [];
    const paths = [];
    const entryLane = data.entryLane;
    const lanes = data.lanes?.entry || {};
    const sorted = Object.entries(lanes).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0) || 1;

    if (entryLane === 'balanced') {
      paths.push({ d: D_PATHS.C, w: 8 });
      paths.push({ d: D_PATHS.L, w: 5 });
      paths.push({ d: D_PATHS.R, w: 5 });
    } else {
      // Primary arrow
      paths.push({ d: D_PATHS[entryLane] || D_PATHS.C, w: 10 });
      // Secondary arrow if > 15% of total
      if (sorted.length >= 2) {
        const secLane = sorted[1][0];
        const secPct = sorted[1][1] / total * 100;
        if (secPct > 15 && secLane !== entryLane) {
          paths.push({ d: D_PATHS[secLane], w: 6 });
        }
      }
    }
    return paths;
  }

  // Exit always starts from centre (DQ C = 86-96% of starts)
  const exitPaths = buildPaths(exitLane, 370, 210, 'C');
  // Attack continues from where exit ended
  const attackPaths = buildPaths(attackLane, 205, 85, exitLane);
  const dPaths = buildDPaths(dEntry);

  const renderArrow = (d, w, color, whiteW, whiteOp) => (
    <g key={d + color}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={whiteW} strokeLinecap="round" opacity={whiteOp} markerEnd="url(#wa)" />
    </g>
  );

  return (
    <div>
      <div style={{ textAlign: 'center', fontSize: 7, color: '#ffffff33', letterSpacing: 3, marginBottom: 2 }}>▲ ATTACKING ▲</div>
      <svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
        <defs>
          <clipPath id="ppf"><rect width="300" height="400" rx="14" /></clipPath>
          <marker id="wa" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0.5 L6,3 L0,5.5Z" fill="#fff" opacity="0.6" />
          </marker>
        </defs>
        <rect width="300" height="400" rx="14" fill="#7cc47c" />
        <g clipPath="url(#ppf)">
          <line x1="100" y1="0" x2="100" y2="400" stroke="#fff" strokeOpacity=".18" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="#fff" strokeOpacity=".18" />
          <line x1="0" y1="100" x2="300" y2="100" stroke="#fff" strokeOpacity=".18" />
          <line x1="0" y1="200" x2="300" y2="200" stroke="#fff" strokeOpacity=".25" strokeWidth="1.5" />
          <line x1="0" y1="300" x2="300" y2="300" stroke="#fff" strokeOpacity=".18" />
          <path d="M 100 0 Q 100 45 150 45 Q 200 45 200 0" fill="none" stroke="#fff" strokeOpacity=".18" />
          <path d="M 100 400 Q 100 355 150 355 Q 200 355 200 400" fill="none" stroke="#fff" strokeOpacity=".18" />
        </g>
        <rect width="300" height="400" rx="14" fill="none" stroke="#5ea85e" strokeWidth="2" />

        {/* Layer order: red (bottom), blue (middle), black D on top */}
        {exitPaths.map(({ d, w }) => renderArrow(d, w, '#DC2626', Math.max(2, w * 0.2), 0.6))}
        {attackPaths.map(({ d, w }) => renderArrow(d, w, '#2563EB', Math.max(2, w * 0.2), 0.6))}
        {dPaths.map(({ d, w }) => renderArrow(d, w, '#1a1a1a', Math.max(1.2, w * 0.2), 0.5))}
      </svg>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '6px 0' }}>
        {[['#DC2626', 'Exit'], ['#2563EB', 'Attack'], ['#1a1a1a', 'To D']].map(([c, l]) => (
          <span key={l} style={{ fontSize: 9, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 14, height: 4, background: c, borderRadius: 2 }} /> {l}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 9, color: '#475569', textAlign: 'center' }}>
        {patterns.exitCount} exits · {patterns.attackCount} attacks · {patterns.dEntryCount} D entries · {patterns.matchCount} matches
      </div>
    </div>
  );
}

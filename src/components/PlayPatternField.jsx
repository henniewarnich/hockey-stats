/**
 * PlayPatternField — renders exit (red), attack (blue), and D-entry (black)
 * arrows on a hockey field SVG based on analysed play pattern data.
 */

export default function PlayPatternField({ patterns, teamName }) {
  if (!patterns || !patterns.exit || !patterns.attack) return null;
  const { exit, attack, dEntry } = patterns;

  const X = { L: 50, C: 150, R: 250 };

  // Build paths for a phase
  function buildPaths(data, y1, y2, curveDir) {
    if (!data) return [];
    const paths = [];

    if (data.entryLane === 'balanced') {
      // Three equal lines
      for (const l of ['L', 'C', 'R']) {
        const x1 = X[data.startLane === 'balanced' ? l : (data.startLane || 'C')];
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
      const startX = X[data.startLane === 'balanced' ? 'C' : (data.startLane || 'C')];
      const endX = X[data.entryLane || 'C'];
      if (startX === endX) {
        paths.push({ d: `M ${startX},${y1} L ${endX},${y2}`, w: 12 });
      } else {
        const my = (y1 + y2) / 2;
        paths.push({ d: `M ${startX},${y1} Q ${startX + (endX - startX) * 0.5},${my} ${endX},${y2}`, w: 12 });
      }
    }
    return paths;
  }

  // Build D-entry paths
  function buildDPaths(data) {
    if (!data) return [];
    const paths = [];
    const entryLane = data.entryLane;

    if (entryLane === 'C') {
      paths.push({ d: 'M 150,58 L 150,14', w: 12 });
    } else if (entryLane === 'balanced') {
      // Multiple entry points curving to D centre
      paths.push({ d: 'M 150,58 L 150,14', w: 8 });
      paths.push({ d: 'M 55,58 Q 90,32 145,14', w: 5 });
      paths.push({ d: 'M 245,58 Q 210,32 155,14', w: 5 });
    } else if (entryLane === 'R') {
      paths.push({ d: 'M 245,58 Q 210,32 155,14', w: 10 });
      // Check if secondary exists
      const lanes = data.lanes?.entry || {};
      const sorted = Object.entries(lanes).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 2 && sorted[1][1] > 0) {
        const secLane = sorted[1][0];
        if (secLane === 'L') paths.push({ d: 'M 55,58 Q 90,32 145,14', w: 6 });
        else if (secLane === 'C') paths.push({ d: 'M 150,58 L 150,14', w: 6 });
      }
    } else if (entryLane === 'L') {
      paths.push({ d: 'M 55,58 Q 90,32 145,14', w: 10 });
      const lanes = data.lanes?.entry || {};
      const sorted = Object.entries(lanes).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 2 && sorted[1][1] > 0) {
        const secLane = sorted[1][0];
        if (secLane === 'R') paths.push({ d: 'M 245,58 Q 210,32 155,14', w: 6 });
        else if (secLane === 'C') paths.push({ d: 'M 150,58 L 150,14', w: 6 });
      }
    }
    return paths;
  }

  const exitPaths = buildPaths(exit, 360, 195);
  const attackPaths = buildPaths(attack, 192, 60);
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

        {/* Layer order: black (bottom), blue (middle), red (top) */}
        {dPaths.map(({ d, w }) => renderArrow(d, w, '#1a1a1a', Math.max(1.2, w * 0.2), 0.5))}
        {attackPaths.map(({ d, w }) => renderArrow(d, w, '#2563EB', Math.max(2, w * 0.2), 0.6))}
        {exitPaths.map(({ d, w }) => renderArrow(d, w, '#DC2626', Math.max(2, w * 0.2), 0.6))}
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

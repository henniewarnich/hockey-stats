/**
 * MiniChart — small inline trend chart with value labels
 * 
 * Props:
 *   data: [{ label, value }]  — sorted oldest→newest
 *   label: string             — chart title
 *   color: string             — line/dot colour
 *   suffix: string            — appended to values (e.g. "%")
 *   showZeroLine: bool        — dashed zero line
 *   invert: bool              — lower=better (ranking)
 *   compact: bool             — no card wrapper, smaller height (for embedding)
 */
export default function MiniChart({ data, label, color, suffix = "", showZeroLine = false, invert = false, compact = false }) {
  if (data.length === 0) return null;
  const vals = data.map(d => d.value);
  const allSame = vals.every(v => v === vals[0]);
  const latest = data[data.length - 1];
  const prev = data.length >= 2 ? data[data.length - 2] : null;
  const trend = prev ? (latest.value - prev.value) : 0;
  const trendColor = invert
    ? (trend < 0 ? "#10B981" : trend > 0 ? "#EF4444" : "#64748B")
    : (trend > 0 ? "#10B981" : trend < 0 ? "#EF4444" : "#64748B");

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: compact ? 2 : 4 }}>
      <div style={{ fontSize: compact ? 9 : 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: compact ? 4 : 6 }}>
        <span style={{ fontSize: compact ? 11 : 14, fontWeight: 900, color: "#F8FAFC", fontFamily: "monospace" }}>{latest?.value}{suffix}</span>
        {prev && trend !== 0 && (
          <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, color: trendColor }}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}{suffix}
          </span>
        )}
      </div>
    </div>
  );

  // Flat line or single point — just show header, no chart
  if (allSame || data.length <= 1) {
    if (compact) return <div>{header}</div>;
    return (
      <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
        {header}
      </div>
    );
  }

  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 1);
  const range = max - min || 1;
  const W = 300, H = compact ? 50 : 90;
  const PAD = compact ? 30 : 24;
  const plotTop = compact ? 12 : 14, plotBot = compact ? 12 : 14;
  const plotH = H - plotTop - plotBot;

  const points = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = plotTop + plotH - ((d.value - min) / range) * plotH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const zeroY = range > 0 ? plotTop + plotH - ((0 - min) / range) * plotH : H / 2;

  const chart = (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {showZeroLine && <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const isFirst = i === 0;
        const isLast = i === points.length - 1;
        const anchor = isFirst ? "start" : isLast ? "end" : "middle";
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill={color} />
            <text x={p.x} y={p.y - 7} textAnchor={anchor} fill={color} fontSize={compact ? "8" : "9"} fontWeight="800">{p.value}{suffix}</text>
            <text x={p.x} y={H - 1} textAnchor={anchor} fill="#475569" fontSize={compact ? "6" : "7"} fontWeight="600">{p.label}</text>
          </g>
        );
      })}
    </svg>
  );

  if (compact) {
    return <div>{header}{chart}</div>;
  }

  return (
    <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
      {header}
      {chart}
    </div>
  );
}

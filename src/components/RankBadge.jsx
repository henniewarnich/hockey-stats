/**
 * RankBadge — inline rank display with trend indicator
 * 
 * Improved (lower number):  prevRank(gray) ▲ rank(green)
 * Dropped  (higher number): prevRank(gray) ▼ rank(red)
 * Unchanged or no prev:     #rank (amber)
 * No rank:                  nothing
 */
export default function RankBadge({ rank, prevRank }) {
  if (!rank && rank !== 0) return null;

  const style = {
    fontSize: 9, fontWeight: 800,
    display: "inline-flex", alignItems: "center", gap: 1,
    verticalAlign: "baseline",
  };

  // No previous or unchanged → amber #N
  if (prevRank == null || prevRank === rank) {
    return (
      <span style={{ ...style, color: "#F59E0B" }}>#{rank}</span>
    );
  }

  // Lower number = improved (green ▲), higher = dropped (red ▼)
  const improved = rank < prevRank;
  const color = improved ? "#10B981" : "#EF4444";
  const triangle = improved
    ? <svg width="6" height="5" viewBox="0 0 6 5" style={{ margin: "0 1px" }}><polygon points="3,0 6,5 0,5" fill={color} /></svg>
    : <svg width="6" height="5" viewBox="0 0 6 5" style={{ margin: "0 1px" }}><polygon points="3,5 6,0 0,0" fill={color} /></svg>;

  return (
    <span style={style}>
      <span style={{ color: "#94A3B8" }}>{prevRank}</span>
      {triangle}
      <span style={{ color }}>{rank}</span>
    </span>
  );
}

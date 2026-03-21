import { useState, useMemo } from 'react';
import { fmt } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';

export default function HistoryScreen({ games, onSelect, onBack }) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc"); // desc = newest first

  const filtered = useMemo(() => {
    let list = [...games];

    // Filter by search term (team names, venue)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => {
        const home = g.teams?.home?.name?.toLowerCase() || "";
        const away = g.teams?.away?.name?.toLowerCase() || "";
        const venue = (g.venue || "").toLowerCase();
        return home.includes(q) || away.includes(q) || venue.includes(q);
      });
    }

    // Sort by date
    list.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });

    return list;
  }, [games, search, sortDir]);

  const resultColor = (g) => {
    if (g.homeScore > g.awayScore) return "#10B981";
    if (g.homeScore < g.awayScore) return "#EF4444";
    return "#F59E0B";
  };

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Game History</div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: theme.textDim }}>{games.length} game{games.length !== 1 ? "s" : ""}</div>
      </div>
      <div style={S.page}>
        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <input style={{ ...S.input, fontSize: 12, flex: 1 }} value={search}
            onChange={e => setSearch(e.target.value)} placeholder="🔍 Search team or venue..." />
          <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} style={{
            padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.border}`,
            background: theme.surface, color: theme.textMuted, fontSize: 11, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {sortDir === "desc" ? "↓ New" : "↑ Old"}
          </button>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={S.empty}>
            {games.length === 0 ? "No games recorded yet." : "No matches found."}
          </div>
        ) : (
          filtered.map(g => {
            const d = new Date(g.date);
            const rc = resultColor(g);
            return (
              <div key={g.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}
                onClick={() => onSelect(g)}>
                {/* Score with result colour accent */}
                <div style={{ minWidth: 54, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: g.teams?.home?.color || theme.text }}>{g.homeScore}</span>
                    <span style={{ fontSize: 12, color: theme.textDim }}>–</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: g.teams?.away?.color || theme.text }}>{g.awayScore}</span>
                  </div>
                  <div style={{ width: "100%", height: 3, borderRadius: 2, background: rc, marginTop: 3 }} />
                </div>

                {/* Teams + Meta */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>
                    <span style={{ color: g.teams?.home?.color }}>{g.teams?.home?.name}</span>
                    <span style={{ color: theme.textDim, margin: "0 4px" }}>vs</span>
                    <span style={{ color: g.teams?.away?.color }}>{g.teams?.away?.name}</span>
                  </div>
                  <div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    {g.duration ? ` · ${fmt(g.duration)}` : ""}
                    {g.venue && ` · ${g.venue}`}
                    {g.quickScore && " · Quick"}
                    {g.imported && " · Imported"}
                  </div>
                </div>

                <div style={{ color: theme.textDimmer, fontSize: 14 }}>›</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

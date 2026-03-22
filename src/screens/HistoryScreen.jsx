import { useState, useMemo } from 'react';
import { fmt } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';

export default function HistoryScreen({ games, onSelect, onBack, onSyncAll, syncing }) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [syncResult, setSyncResult] = useState(null);

  const unsyncedCount = games.filter(g => !g.supabase_id).length;

  const filtered = useMemo(() => {
    let list = [...games];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => {
        const home = g.teams?.home?.name?.toLowerCase() || "";
        const away = g.teams?.away?.name?.toLowerCase() || "";
        const venue = (g.venue || "").toLowerCase();
        return home.includes(q) || away.includes(q) || venue.includes(q);
      });
    }
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

  const handleSync = async () => {
    if (!onSyncAll || syncing) return;
    setSyncResult(null);
    const result = await onSyncAll();
    setSyncResult(result);
    setTimeout(() => setSyncResult(null), 4000);
  };

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Game History</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: theme.textDim }}>{games.length} game{games.length !== 1 ? "s" : ""}</div>
      </div>
      <div style={S.page}>
        {/* Sync banner */}
        {unsyncedCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", marginBottom: 8,
            background: "#F59E0B11", borderRadius: 10, border: "1px solid #F59E0B33",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>
                📱 {unsyncedCount} game{unsyncedCount !== 1 ? "s" : ""} not synced to cloud
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                These games are only on this device
              </div>
            </div>
            <button onClick={handleSync} disabled={syncing} style={{
              padding: "8px 14px", borderRadius: 8, border: "1px solid #F59E0B44",
              background: syncing ? "#334155" : "#F59E0B22", color: "#F59E0B",
              fontSize: 11, fontWeight: 700, cursor: syncing ? "wait" : "pointer",
              whiteSpace: "nowrap",
            }}>
              {syncing ? "⏳ Syncing..." : "☁️ Sync All"}
            </button>
          </div>
        )}

        {syncResult && (
          <div style={{
            padding: "8px 12px", marginBottom: 8, borderRadius: 8,
            background: syncResult.failed > 0 ? "#EF444422" : "#10B98122",
            color: syncResult.failed > 0 ? "#EF4444" : "#10B981",
            fontSize: 11, fontWeight: 600, textAlign: "center",
          }}>
            {syncResult.synced > 0 && `✓ ${syncResult.synced} game${syncResult.synced > 1 ? "s" : ""} synced`}
            {syncResult.synced > 0 && syncResult.failed > 0 && " · "}
            {syncResult.failed > 0 && `✗ ${syncResult.failed} failed`}
          </div>
        )}

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

        {/* Game list */}
        {filtered.length === 0 ? (
          <div style={S.empty}>
            {games.length === 0 ? "No games recorded yet." : "No matches found."}
          </div>
        ) : (
          filtered.map(g => {
            const d = new Date(g.date);
            const rc = resultColor(g);
            const isSynced = !!g.supabase_id;
            return (
              <div key={g.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}
                onClick={() => onSelect(g)}>
                {/* Score */}
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                    <span style={{ color: g.teams?.home?.color }}>{g.teams?.home?.name}</span>
                    <span style={{ color: theme.textDim, margin: "0 4px" }}>vs</span>
                    <span style={{ color: g.teams?.away?.color }}>{g.teams?.away?.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    {g.duration ? ` · ${fmt(g.duration)}` : ""}
                    {g.venue && ` · ${g.matchType && g.matchType !== 'league' ? (g.matchType.charAt(0).toUpperCase() + g.matchType.slice(1)) + ' @ ' : ''}${g.venue}`}
                    {g.quickScore && " · Quick"}
                    {g.imported && " · Imported"}
                    {/* Sync indicator */}
                    <span style={{ fontSize: 10, marginLeft: 2 }} title={isSynced ? "Synced to cloud" : "Local only"}>
                      {isSynced ? "☁️" : "📱"}
                    </span>
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

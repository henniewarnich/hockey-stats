import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase.js';
import { fmt } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';

export default function HistoryScreen({ games, onSelect, onBack, onSyncAll, syncing, onVideoReview }) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [syncResult, setSyncResult] = useState(null);
  const [cloudMatches, setCloudMatches] = useState([]);
  const [loadingCloud, setLoadingCloud] = useState(true);

  // Fetch all ended matches from Supabase
  useEffect(() => {
    const fetchCloud = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('status', 'ended')
        .order('match_date', { ascending: false });
      if (data) {
        // Convert to the local game format
        const mapped = data.map(m => ({
          id: m.id,
          supabase_id: m.id,
          date: m.match_date,
          teams: {
            home: { name: m.home_team?.name, color: m.home_team?.color, id: m.home_team?.id, short: m.home_team?.name?.slice(0, 3).toUpperCase() },
            away: { name: m.away_team?.name, color: m.away_team?.color, id: m.away_team?.id, short: m.away_team?.name?.slice(0, 3).toUpperCase() },
          },
          homeScore: m.home_score,
          awayScore: m.away_score,
          duration: m.duration || 0,
          matchLength: m.match_length || 60,
          breakFormat: m.break_format || "quarters",
          venue: m.venue,
          matchType: m.match_type,
          quickScore: !m.duration || m.duration === 0,
          cloudOnly: true,
        }));
        setCloudMatches(mapped);
      }
      setLoadingCloud(false);
    };
    fetchCloud();
  }, []);

  // Merge local + cloud, deduplicate by supabase_id
  const allGames = useMemo(() => {
    const localIds = new Set(games.filter(g => g.supabase_id).map(g => g.supabase_id));
    const cloudOnly = cloudMatches.filter(cm => !localIds.has(cm.id));
    return [...games, ...cloudOnly];
  }, [games, cloudMatches]);

  const unsyncedCount = games.filter(g => !g.supabase_id).length;

  const filtered = useMemo(() => {
    let list = [...allGames];
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
  }, [allGames, search, sortDir]);

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
        <div style={S.navTitle}>Game History ({loadingCloud ? "..." : allGames.length})</div>
        <NavLogo />
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
            {allGames.length === 0 ? "No games recorded yet." : "No matches found."}
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
                    {g.venue && ` · ${g.matchType ? (g.matchType.charAt(0).toUpperCase() + g.matchType.slice(1)) + ' @ ' : ''}${g.venue}`}
                    {g.quickScore && " · Quick"}
                    {g.imported && " · Imported"}
                    {/* Sync indicator */}
                    <span style={{ fontSize: 10, marginLeft: 2 }} title={isSynced ? "Synced to cloud" : "Local only"}>
                      {isSynced ? "☁️" : "📱"}
                    </span>
                  </div>
                </div>

                <div style={{ color: theme.textDimmer, fontSize: 14 }}>›</div>
                {onVideoReview && isSynced && (
                  <button onClick={(e) => { e.stopPropagation(); onVideoReview(g); }} style={{
                    fontSize: 9, color: '#8B5CF6', background: '#8B5CF611', border: '1px solid #8B5CF644',
                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap',
                  }}>📹 Video</button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

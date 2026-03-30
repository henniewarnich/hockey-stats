import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import { MATCH_AWAY_TEAM, MATCH_HOME_TEAM, teamDisplayName, teamSearchString, teamShortName } from '../utils/teams.js';

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
        .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .eq('status', 'ended')
        .order('match_date', { ascending: false });
      if (data) {
        // Convert to the local game format
        const mapped = data.map(m => ({
          id: m.id,
          supabase_id: m.id,
          date: m.match_date,
          teams: {
            home: { name: teamShortName(m.home_team), color: m.home_team?.color, id: m.home_team?.id, short: teamShortName(m.home_team)?.slice(0, 3).toUpperCase() },
            away: { name: teamShortName(m.away_team), color: m.away_team?.color, id: m.away_team?.id, short: teamShortName(m.away_team)?.slice(0, 3).toUpperCase() },
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
        const home = teamSearchString(g.teams?.home) || "";
        const away = teamSearchString(g.teams?.away) || "";
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
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="16" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="3"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="3"/></svg>
          ← kykie
        </button>
        <div style={{ fontSize: 12, color: "#475569" }}>{loadingCloud ? "..." : allGames.length} matches</div>
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
                📱 {unsyncedCount} game{unsyncedCount !== 1 ? "s" : ""} not synced
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
            {syncResult.synced > 0 && `✓ ${syncResult.synced} synced`}
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
            const isLivePro = !g.quickScore; // has duration = was recorded live
            return (
              <div key={g.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", opacity: isLivePro ? 0.4 : 1 }}>
                {/* Video Stats button */}
                {onVideoReview && isSynced && (
                  <button onClick={(e) => { e.stopPropagation(); onVideoReview(g); }} style={{
                    width: 36, height: 36, borderRadius: 8, border: '1px solid #8B5CF644', background: '#8B5CF611',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, padding: 0,
                  }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>📹</span>
                    <span style={{ fontSize: 6, fontWeight: 700, color: '#8B5CF6', marginTop: 1 }}>Video Stats</span>
                  </button>
                )}

                {/* Teams + Meta */}
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onSelect(g)}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                    {teamDisplayName(g.teams?.home)} vs {teamDisplayName(g.teams?.away)}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                    {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    {g.venue && ` · ${g.venue}`}
                    {isLivePro && <span style={{ marginLeft: 6, fontSize: 8, fontWeight: 700, color: "#10B981", background: "#10B98118", padding: "1px 5px", borderRadius: 3 }}>LIVE PRO</span>}
                  </div>
                </div>

                {/* Score */}
                <div style={{ minWidth: 44, textAlign: "center", cursor: "pointer" }} onClick={() => onSelect(g)}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: rc, letterSpacing: 1 }}>{g.homeScore}–{g.awayScore}</div>
                  <div style={{ height: 3, borderRadius: 2, background: rc, marginTop: 3 }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

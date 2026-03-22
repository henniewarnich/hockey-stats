import { useState, useCallback, useEffect } from 'react';
import { loadData, saveData } from '../utils/helpers.js';
import { supabase } from '../utils/supabase.js';
import { upsertTeam as upsertTeamRemote, deleteTeamRemote, fetchTeams, saveMatchToSupabase, deleteMatchRemote, fetchMatchesForLocal } from '../utils/sync.js';

const TEAMS_KEY = 'hockey-teams';
const GAMES_KEY = 'hockey-games';

export function useMatchStore() {
  const [teams, setTeams] = useState(() => loadData(TEAMS_KEY, []));
  const [games, setGames] = useState(() => loadData(GAMES_KEY, []));
  const [syncing, setSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);

  // On mount: try to pull teams from Supabase (merge with local)
  useEffect(() => {
    fetchTeams().then(remote => {
      if (!remote) return;
      setTeams(prev => {
        const merged = mergeTeams(prev, remote);
        saveData(TEAMS_KEY, merged);
        return merged;
      });
    }).catch(() => {});

    // Also pull games from Supabase (merge with local)
    fetchMatchesForLocal().then(remote => {
      if (!remote || remote.length === 0) return;
      setGames(prev => {
        const merged = mergeGames(prev, remote);
        saveData(GAMES_KEY, merged);
        return merged;
      });
    }).catch(() => {});
  }, []);

  // Team CRUD — local first, then sync
  const saveTeam = useCallback((team) => {
    setTeams(prev => {
      let updated;
      if (team.id) {
        updated = prev.map(t => t.id === team.id ? { ...team, name: team.name.trim() } : t);
      } else {
        updated = [...prev, { ...team, id: Date.now().toString(), name: team.name.trim() }];
      }
      saveData(TEAMS_KEY, updated);
      return updated;
    });

    // Fire-and-forget sync to Supabase
    upsertTeamRemote(team).then(remote => {
      if (remote) {
        // Update local with Supabase ID
        setTeams(prev => {
          const updated = prev.map(t =>
            t.name.trim().toLowerCase() === remote.name.trim().toLowerCase()
              ? { ...t, supabase_id: remote.id }
              : t
          );
          saveData(TEAMS_KEY, updated);
          return updated;
        });
      }
    }).catch(() => {});
  }, []);

  const deleteTeam = useCallback((id) => {
    const team = teams.find(t => t.id === id);
    setTeams(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveData(TEAMS_KEY, updated);
      return updated;
    });
    // Sync delete
    if (team?.supabase_id) {
      deleteTeamRemote(team.supabase_id).catch(() => {});
    }
  }, [teams]);

  // Game CRUD — save locally, then sync to Supabase
  const saveGame = useCallback((game) => {
    setGames(prev => {
      const updated = [game, ...prev];
      saveData(GAMES_KEY, updated);
      return updated;
    });

    // Sync match + events to Supabase (fire-and-forget)
    setSyncing(true);
    setLastSyncError(null);
    saveMatchToSupabase(game).then(remote => {
      setSyncing(false);
      if (remote) {
        // Store Supabase match ID on the local game
        setGames(prev => {
          const updated = prev.map(g =>
            g.id === game.id ? { ...g, supabase_id: remote.id } : g
          );
          saveData(GAMES_KEY, updated);
          return updated;
        });
      } else {
        setLastSyncError('Match saved locally but cloud sync failed. Will retry next time.');
      }
    }).catch(err => {
      setSyncing(false);
      setLastSyncError('Offline — match saved locally.');
      console.warn('Sync failed:', err);
    });

    return game;
  }, []);

  const deleteGame = useCallback(async (id) => {
    const game = games.find(g => g.id === id);
    setGames(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveData(GAMES_KEY, updated);
      return updated;
    });

    // Try to delete from Supabase using all possible IDs
    const idsToTry = [game?.supabase_id, game?.id].filter(Boolean);
    let deleted = false;
    for (const tryId of idsToTry) {
      try {
        const { error } = await supabase.from('matches').delete().eq('id', tryId);
        if (!error) { deleted = true; break; }
        console.warn(`Delete by id=${tryId} failed:`, error.message);
      } catch (err) {
        console.warn(`Delete by id=${tryId} threw:`, err);
      }
    }
    if (!deleted && idsToTry.length > 0) {
      setLastSyncError(`Failed to delete match from cloud. You may need to delete it manually in Supabase.`);
      console.error('All delete attempts failed for game:', game);
    }
  }, [games]);

  // Force sync all unsynced games to Supabase
  const syncAllGames = useCallback(async () => {
    const unsynced = games.filter(g => !g.supabase_id);
    if (unsynced.length === 0) return { synced: 0, failed: 0 };

    setSyncing(true);
    setLastSyncError(null);
    let synced = 0, failed = 0;

    for (const game of unsynced) {
      try {
        const remote = await saveMatchToSupabase(game);
        if (remote) {
          setGames(prev => {
            const updated = prev.map(g => g.id === game.id ? { ...g, supabase_id: remote.id } : g);
            saveData(GAMES_KEY, updated);
            return updated;
          });
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    setSyncing(false);
    if (failed > 0) setLastSyncError(`${failed} game(s) failed to sync.`);
    return { synced, failed };
  }, [games]);

  return { teams, games, saveTeam, deleteTeam, saveGame, deleteGame, syncAllGames, syncing, lastSyncError };
}

// Merge local and remote teams (remote wins for name conflicts)
function mergeTeams(local, remote) {
  const merged = [...local];
  for (const rt of remote) {
    const existing = merged.find(t =>
      t.supabase_id === rt.id ||
      t.name.trim().toLowerCase() === rt.name.trim().toLowerCase()
    );
    if (existing) {
      existing.supabase_id = rt.id;
      existing.color = rt.color;
      existing.name = rt.name;
    } else {
      merged.push({
        id: rt.id, // use Supabase UUID as local ID too
        supabase_id: rt.id,
        name: rt.name,
        color: rt.color,
        school: rt.school,
      });
    }
  }
  return merged;
}

// Merge local and remote games — remote is source of truth for synced games
function mergeGames(local, remote) {
  const remoteIds = new Set(remote.map(r => r.supabase_id || r.id));

  // Start with local games that are either unsynced OR still exist in remote
  const kept = local.filter(g => {
    if (!g.supabase_id) return true; // unsynced — keep it, it's local-only
    return remoteIds.has(g.supabase_id); // synced — only keep if still in Supabase
  });

  // Now merge remote into kept
  for (const rg of remote) {
    const existing = kept.find(g =>
      g.supabase_id === rg.supabase_id ||
      g.id === rg.id ||
      (g.teams?.home?.name === rg.teams?.home?.name &&
       g.teams?.away?.name === rg.teams?.away?.name &&
       g.date?.slice(0, 10) === rg.date?.slice(0, 10))
    );
    if (existing) {
      existing.supabase_id = rg.supabase_id;
      existing.homeScore = rg.homeScore;
      existing.awayScore = rg.awayScore;
      existing.venue = rg.venue || existing.venue;
      existing.matchLength = rg.matchLength || existing.matchLength;
      existing.breakFormat = rg.breakFormat || existing.breakFormat;
      if ((!existing.events || existing.events.length === 0) && rg.events?.length > 0) {
        existing.events = rg.events;
        existing.duration = rg.duration;
      }
    } else {
      kept.push(rg);
    }
  }
  kept.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  return kept;
}

import { useState, useCallback, useEffect } from 'react';
import { loadData, saveData } from '../utils/helpers.js';
import { upsertTeam as upsertTeamRemote, deleteTeamRemote, fetchTeams, saveMatchToSupabase, deleteMatchRemote } from '../utils/sync.js';

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
      if (!remote) return; // offline or error
      setTeams(prev => {
        const merged = mergeTeams(prev, remote);
        saveData(TEAMS_KEY, merged);
        return merged;
      });
    }).catch(() => {}); // silent fail if offline
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

  const deleteGame = useCallback((id) => {
    const game = games.find(g => g.id === id);
    setGames(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveData(GAMES_KEY, updated);
      return updated;
    });
    // Sync delete
    if (game?.supabase_id) {
      deleteMatchRemote(game.supabase_id).catch(() => {});
    }
  }, [games]);

  return { teams, games, saveTeam, deleteTeam, saveGame, deleteGame, syncing, lastSyncError };
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

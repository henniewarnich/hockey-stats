import { useState, useEffect } from 'react';
import { getCoachTeams } from '../utils/auth.js';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
};
const fmtTime = (t) => {
  if (!t) return '';
  return t.slice(0, 5);
};

export default function CoachDashboard({ currentUser, onLogout }) {
  const [teams, setTeams] = useState([]);
  const [upcomingByTeam, setUpcomingByTeam] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);

    // Get assigned teams
    const myTeams = await getCoachTeams(currentUser.id);
    setTeams(myTeams);

    // Get upcoming matches for these teams
    if (myTeams.length > 0) {
      const teamIds = myTeams.map(t => t.id);
      const today = new Date().toISOString().split('T')[0];

      const { data: matches } = await supabase
        .from('matches')
        .select('id, home_team_id, away_team_id, match_date, scheduled_time, venue, status, home_score, away_score, home_team:teams!matches_home_team_id_fkey(name, color, short_name), away_team:teams!matches_away_team_id_fkey(name, color, short_name)')
        .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
        .in('status', ['upcoming', 'live', 'paused'])
        .gte('match_date', today)
        .order('match_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      // Group by team
      const grouped = {};
      teamIds.forEach(tid => { grouped[tid] = []; });
      (matches || []).forEach(m => {
        teamIds.forEach(tid => {
          if (m.home_team_id === tid || m.away_team_id === tid) {
            grouped[tid].push(m);
          }
        });
      });
      setUpcomingByTeam(grouped);
    }

    setLoading(false);
  };

  const slugify = (n) => n.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

  const goToTeam = (team) => {
    window.location.hash = `#/team/${slugify(team.name)}`;
  };

  if (loading) {
    return (
      <div style={S.app}>
        <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: theme.textDim }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="28" height="28" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
              <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
              <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>kykie</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: theme.textDim, textAlign: "right" }}>
              {currentUser.firstname}
              <span style={{ fontSize: 9, marginLeft: 4, padding: "2px 6px", borderRadius: 99, background: "#8B5CF622", color: "#8B5CF6", fontWeight: 700 }}>Coach</span>
            </div>
            {onLogout && (
              <button onClick={onLogout} style={{ fontSize: 10, color: "#EF4444", background: "none", border: "1px solid #EF444444", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
            )}
          </div>
        </div>
      </div>

      <div style={S.page}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 12 }}>Your Teams</div>

        {teams.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: theme.textDim }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏑</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No teams assigned yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Ask your admin to assign you to a team.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {teams.map(team => {
              const upcoming = upcomingByTeam[team.id] || [];
              return (
                <div key={team.id} style={{
                  background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`,
                  overflow: "hidden",
                }}>
                  {/* Team header — clickable */}
                  <div onClick={() => goToTeam(team)} style={{
                    padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    borderBottom: upcoming.length > 0 ? `1px solid ${theme.border}` : "none",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: (team.color || "#8B5CF6") + "22",
                      border: `2px solid ${(team.color || "#8B5CF6")}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: team.color || "#8B5CF6",
                    }}>{team.short_name || team.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{team.name}</div>
                      <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>
                        {upcoming.length > 0
                          ? `${upcoming.length} upcoming match${upcoming.length !== 1 ? 'es' : ''}`
                          : 'No upcoming matches'}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#8B5CF6", fontWeight: 700 }}>View Stats →</div>
                  </div>

                  {/* Upcoming matches */}
                  {upcoming.length > 0 && (
                    <div style={{ padding: "8px 12px" }}>
                      {upcoming.slice(0, 3).map(m => {
                        const isHome = m.home_team_id === team.id;
                        const opp = isHome ? m.away_team : m.home_team;
                        const isLive = m.status === 'live' || m.status === 'paused';
                        return (
                          <div key={m.id} style={{
                            padding: "8px 4px", display: "flex", alignItems: "center", gap: 8,
                            borderBottom: `1px solid ${theme.border}22`,
                          }}>
                            {isLive && (
                              <span style={{ fontSize: 8, color: "#10B981", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#10B98122", animation: "pulse 2s infinite" }}>LIVE</span>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>
                                {isHome ? 'vs' : '@'} {opp?.name || 'TBD'}
                              </div>
                              <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
                                {fmtDate(m.match_date)}{m.scheduled_time ? ` · ${fmtTime(m.scheduled_time)}` : ''}{m.venue ? ` · ${m.venue}` : ''}
                              </div>
                            </div>
                            {isLive && (
                              <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>
                                {m.home_score} - {m.away_score}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {upcoming.length > 3 && (
                        <div style={{ fontSize: 10, color: theme.textDim, padding: "6px 4px", textAlign: "center" }}>
                          + {upcoming.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 10, color: theme.textDimmer }}>v{APP_VERSION}</div>
          <button onClick={() => { window.location.hash = ''; }} style={{
            background: "none", border: "none", color: theme.textDim, fontSize: 10, cursor: "pointer", textDecoration: "underline",
          }}>← Back to kykie</button>
        </div>
      </div>
    </div>
  );
}

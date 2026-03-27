import { useState, useEffect } from 'react';
import { getCoachTeams } from '../utils/auth.js';
import { supabase } from '../utils/supabase.js';
import { fetchLatestRankings } from '../utils/sync.js';
import { S, theme } from '../utils/styles.js';
import RankBadge from './RankBadge.jsx';

export default function CoachDashboardPanel({ currentUser }) {
  const [teams, setTeams] = useState([]);
  const [records, setRecords] = useState({});
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const myTeams = await getCoachTeams(currentUser.id);
      setTeams(myTeams);

      if (myTeams.length > 0) {
        const teamIds = myTeams.map(t => t.id);
        const { data: matches } = await supabase
          .from('matches')
          .select('home_team_id, away_team_id, home_score, away_score, match_type')
          .eq('status', 'ended')
          .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','));

        const recs = {};
        (matches || []).forEach(m => {
          teamIds.forEach(id => {
            if (m.home_team_id !== id && m.away_team_id !== id) return;
            if (!recs[id]) recs[id] = { p: 0, w: 0, d: 0, l: 0 };
            const isHome = m.home_team_id === id;
            const my = isHome ? m.home_score : m.away_score;
            const their = isHome ? m.away_score : m.home_score;
            recs[id].p++;
            if (my > their) recs[id].w++;
            else if (my === their) recs[id].d++;
            else recs[id].l++;
          });
        });
        setRecords(recs);
      }

      fetchLatestRankings().then(r => setRankings(r)).catch(() => {});
      setLoading(false);

      // Single team coach: skip selection, go straight to team page
      if (myTeams.length === 1) {
        const slug = myTeams[0].name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        window.location.hash = `#/team/${slug}`;
      }
    };
    load();
  }, [currentUser.id]);

  const teamSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

  if (loading) return <div style={{ textAlign: 'center', padding: 20, color: theme.textDim, fontSize: 11 }}>Loading teams...</div>;

  return (
    <div style={{ padding: "0 16px 8px" }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        Your teams
      </div>

      {teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: theme.textDim, fontSize: 11 }}>No teams assigned</div>
      ) : (
        teams.map(team => {
          const r = records[team.id] || { p: 0, w: 0, d: 0, l: 0 };
          const rk = rankings[team.id];
          const wr = r.p > 0 ? Math.round(r.w / r.p * 100) : 0;
          return (
            <a key={team.id} href={`#/team/${teamSlug(team.name)}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: theme.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 4,
                border: `1px solid ${theme.border}44`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: team.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0,
              }}>{team.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {team.name}
                  {rk && <RankBadge rank={rk.rank} prevRank={rk.prevRank} />}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#CBD5E1', fontWeight: 600 }}>
                    {r.p}P {r.w}W {r.d}D {r.l}L
                  </span>
                  {wr > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#10B981', background: '#10B98122', padding: '1px 6px', borderRadius: 99 }}>{wr}%</span>}
                </div>
              </div>
              <span style={{ fontSize: 14, color: theme.textDim }}>›</span>
            </div>
            </a>
          );
        })
      )}
    </div>
  );
}

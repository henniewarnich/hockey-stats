import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { parseSASTDate } from '../utils/helpers.js';
import { fetchLatestRankings } from '../utils/sync.js';
import { theme } from '../utils/styles.js';
import RankBadge from './RankBadge.jsx';

export default function PublicMatchesSection() {
  const [tab, setTab] = useState('live');
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [results, setResults] = useState([]);
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: l }, { data: u }, { data: r }] = await Promise.all([
        supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').eq('status', 'live'),
        supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').eq('status', 'upcoming').order('match_date', { ascending: true }).limit(10),
        supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').eq('status', 'ended').order('match_date', { ascending: false }).limit(10),
      ]);
      setLive(l || []);
      setUpcoming(u || []);
      setResults(r || []);
      if (l?.length > 0) setTab('live');
      else if (u?.length > 0) setTab('upcoming');
      else setTab('results');
      fetchLatestRankings().then(rk => setRankings(rk)).catch(() => {});
      setLoading(false);
    };
    load();
    const poll = setInterval(async () => {
      const { data } = await supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').eq('status', 'live');
      if (data) setLive(data);
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  const counts = { live: live.length, upcoming: upcoming.length, results: results.length };
  const data = tab === 'live' ? live : tab === 'upcoming' ? upcoming : results;

  const goToTeam = (teamName) => {
    const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    window.location.hash = `#/team/${slug}`;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 12, color: theme.textDim, fontSize: 11 }}>Loading matches...</div>;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${theme.border}`, marginBottom: 8 }}>
        {[
          ['live', `Live${counts.live > 0 ? ` (${counts.live})` : ''}`],
          ['upcoming', `Upcoming${counts.upcoming > 0 ? ` (${counts.upcoming})` : ''}`],
          ['results', `Results${counts.results > 0 ? ` (${counts.results})` : ''}`],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: tab === k ? (k === 'live' ? '#10B98122' : '#F59E0B22') : theme.surface,
            color: tab === k ? (k === 'live' ? '#10B981' : '#F59E0B') : theme.textDim,
          }}>{label}</button>
        ))}
      </div>

      {/* Match list */}
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 16, color: theme.textDim, fontSize: 11 }}>
          {tab === 'live' ? 'No live matches right now' : tab === 'upcoming' ? 'No upcoming matches' : 'No results yet'}
        </div>
      ) : (
        data.slice(0, 5).map(m => {
          const d = parseSASTDate(m.match_date);
          const isLive = m.status === 'live';
          const isEnded = m.status === 'ended';
          return (
            <div key={m.id} onClick={() => goToTeam(m.home_team?.name)} style={{
              display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 8,
              background: theme.surface, borderRadius: 8, marginBottom: 3, cursor: 'pointer',
              border: isLive ? '1px solid #10B98144' : `1px solid ${theme.border}44`,
            }}>
              {isLive && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#10B981', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.home_team?.name} <RankBadge rank={rankings[m.home_team?.id]?.rank} prevRank={rankings[m.home_team?.id]?.prevRank} />
                  {' vs '}
                  {m.away_team?.name} <RankBadge rank={rankings[m.away_team?.id]?.rank} prevRank={rankings[m.away_team?.id]?.prevRank} />
                </div>
                <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>
                  {d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  {m.venue && ` · ${m.venue}`}
                </div>
              </div>
              {(isLive || isEnded) && (
                <div style={{ fontSize: 16, fontWeight: 900, color: theme.text, flexShrink: 0 }}>
                  {m.home_score}–{m.away_score}
                </div>
              )}
              {isLive && <div style={{ fontSize: 8, color: '#10B981', fontWeight: 700, flexShrink: 0 }}>LIVE</div>}
            </div>
          );
        })
      )}
      {data.length > 5 && (
        <div onClick={() => { window.location.hash = ''; }} style={{ textAlign: 'center', padding: 6, fontSize: 10, color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>
          View all on kykie →
        </div>
      )}
    </div>
  );
}

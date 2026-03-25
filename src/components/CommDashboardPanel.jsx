import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { parseSASTDate } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';
import RankBadge from './RankBadge.jsx';
import { fetchLatestRankings } from '../utils/sync.js';

export default function CommDashboardPanel({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), match_commentators(commentator_id)')
        .in('status', ['upcoming', 'live'])
        .order('match_date', { ascending: true });

      const tagged = (data || []).map(m => {
        const comms = m.match_commentators || [];
        const mine = comms.some(c => c.commentator_id === currentUser.id);
        const unassigned = comms.length === 0;
        return { ...m, _mine: mine, _canAction: mine || unassigned };
      });

      setMatches(tagged);
      fetchLatestRankings().then(r => setRankings(r)).catch(() => {});
      setLoading(false);
    };
    load();
  }, [currentUser.id]);

  const live = matches.filter(m => m.status === 'live' && m._canAction);
  const upcoming = matches.filter(m => m.status === 'upcoming' && m._canAction);
  const myCount = live.length + upcoming.length;

  if (loading) return <div style={{ textAlign: 'center', padding: 20, color: theme.textDim, fontSize: 11 }}>Loading matches...</div>;

  return (
    <div style={{ padding: "0 16px 8px" }}>
      {/* Quick nav */}
      <div onClick={() => { window.location.hash = '#/record'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: 8,
      }}>
        <div style={{ fontSize: 24 }}>📅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Match Schedule</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>All matches, start live, quick score</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
          My matches ({myCount})
        </div>
        <button onClick={() => { window.location.hash = '#/record'; }} style={{
          fontSize: 9, color: '#8B5CF6', background: '#8B5CF611', border: '1px solid #8B5CF644',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700,
        }}>Open full dashboard →</button>
      </div>

      {live.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#EF4444', letterSpacing: 1, marginBottom: 4 }}>LIVE NOW</div>
          {live.map(m => (
            <MatchCard key={m.id} m={m} rankings={rankings} isLive />
          ))}
        </>
      )}

      {upcoming.slice(0, 5).map(m => (
        <MatchCard key={m.id} m={m} rankings={rankings} />
      ))}

      {upcoming.length === 0 && live.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: theme.textDim, fontSize: 11 }}>No assigned matches</div>
      )}

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={() => { window.location.hash = '#/record'; }} style={{
          background: 'none', border: `1px solid ${theme.border}`, borderRadius: 8,
          padding: '6px 16px', color: theme.textDim, fontSize: 10, cursor: 'pointer', fontWeight: 600,
        }}>🎮 Demo Match</button>
      </div>
    </div>
  );
}

function MatchCard({ m, rankings, isLive }) {
  const d = parseSASTDate(m.match_date);
  return (
    <div onClick={() => { window.location.hash = '#/record'; }} style={{
      background: theme.surface, borderRadius: 8, padding: '8px 10px', marginBottom: 3, cursor: 'pointer',
      border: isLive ? '1px solid #EF444444' : `1px solid ${theme.border}44`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {isLive && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#EF4444', flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.home_team?.name} <RankBadge rank={rankings[m.home_team?.id]?.rank} prevRank={rankings[m.home_team?.id]?.prevRank} />
          {' vs '}
          {m.away_team?.name} <RankBadge rank={rankings[m.away_team?.id]?.rank} prevRank={rankings[m.away_team?.id]?.prevRank} />
        </div>
        <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>
          {d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
          {m.venue && ` · ${m.venue}`}
        </div>
      </div>
      {isLive && <div style={{ fontSize: 14, fontWeight: 900, color: theme.text }}>{m.home_score}–{m.away_score}</div>}
      {isLive && <div style={{ fontSize: 8, color: '#EF4444', fontWeight: 700 }}>LIVE</div>}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { MATCH_HOME_TEAM, MATCH_AWAY_TEAM, teamShortName, teamColor } from '../utils/teams.js';

export default function Homepage({ currentUser, liveMatches, onNavigate }) {
  const [stats, setStats] = useState({ matches: 0, teams: 0, viewers: 0 });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    // Platform stats
    const [{ count: mc }, { count: tc }] = await Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'ended'),
      supabase.from('teams').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
    ]);

    // Viewer count (unique in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { count: vc } = await supabase.from('match_viewers')
      .select('id', { count: 'exact', head: true })
      .gte('last_seen_at', thirtyDaysAgo);

    setStats({ matches: mc || 0, teams: tc || 0, viewers: vc || 0 });

    // Recent results (last 5)
    const { data: recent } = await supabase.from('matches')
      .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
      .eq('status', 'ended')
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentResults(recent || []);
    setLoading(false);
  };

  const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  return (
    <div style={{ padding: '0 0 20px' }}>
      {/* Hero */}
      <div style={{ padding: '24px 16px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
          Live scoring, stats & analysis for <span style={{ color: '#F59E0B' }}>school hockey</span>
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
          Follow your team in real time. Every goal, every short corner, every D entry — as it happens.
        </div>
      </div>

      {/* Live now pulse */}
      {liveMatches && liveMatches.length > 0 && (
        <div onClick={() => onNavigate('scores')} style={{
          margin: '0 16px 16px', background: '#EF444422', border: '1px solid #EF444444',
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#EF4444', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>
              {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} live now
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              {liveMatches.slice(0, 2).map(m => `${teamShortName(m.home_team)} vs ${teamShortName(m.away_team)}`).join('  |  ')}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>Watch &gt;</div>
        </div>
      )}

      {/* Platform stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 16px 16px' }}>
        <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>{loading ? '—' : fmtNum(stats.matches)}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Matches</div>
        </div>
        <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>{loading ? '—' : fmtNum(stats.teams)}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Teams</div>
        </div>
        <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6' }}>{loading ? '—' : fmtNum(stats.viewers)}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Viewers</div>
        </div>
      </div>

      {/* Recent results */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Recent results</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569' }}>Loading...</div>
        ) : recentResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569', fontSize: 12 }}>No results yet</div>
        ) : (
          recentResults.map(m => {
            const hc = teamColor(m.home_team) || '#64748B';
            const ac = teamColor(m.away_team) || '#64748B';
            const hw = m.home_score > m.away_score, aw = m.away_score > m.home_score;
            const d = new Date(m.match_date);
            return (
              <div key={m.id} style={{ background: '#1E293B', borderRadius: 8, padding: '8px 12px', marginBottom: 6, cursor: 'pointer' }}
                onClick={() => { if (m.home_team?.id) window.location.hash = `#/team/${teamShortName(m.home_team)?.toLowerCase().replace(/\s+/g,'-')}`; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: hc }} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{teamShortName(m.home_team)}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: hw ? '#10B981' : '#64748B' }}>{m.home_score}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: ac }} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{teamShortName(m.away_team)}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: aw ? '#10B981' : '#64748B' }}>{m.away_score}</span>
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                  {d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  {m.venue && ` · ${m.venue}`}
                  {m.match_type && ` · ${m.match_type}`}
                </div>
              </div>
            );
          })
        )}
        <div onClick={() => onNavigate('scores')} style={{ textAlign: 'center', padding: '6px 0', cursor: 'pointer' }}>
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>View all results &gt;</span>
        </div>
      </div>

      {/* Get involved CTA */}
      {!currentUser && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: '#10B98118', border: '1px solid #10B98144', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>Get involved</div>
            <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5, marginBottom: 10 }}>
              Follow your school, commentate live matches, or coach with data-driven insights.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { icon: '👀', label: 'Follow', desc: 'Supporter' },
                { icon: '🎙️', label: 'Commentate', desc: 'Earn vouchers' },
                { icon: '📊', label: 'Coach', desc: 'Team analytics' },
              ].map(r => (
                <div key={r.label} onClick={() => { window.location.hash = '#/register'; }}
                  style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', textAlign: 'center', border: '1px solid #33415566', cursor: 'pointer' }}>
                  <div style={{ fontSize: 18 }}>{r.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logged-in user quick actions */}
      {currentUser && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: '#1E293B', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>
              Welcome back, {currentUser.alias_nickname || currentUser.firstname}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {currentUser.role === 'commentator' || currentUser.role === 'admin' || currentUser.role === 'commentator_admin' ? (
                <>
                  <div onClick={() => { window.location.hash = '#/admin'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#F59E0B11', border: '1px solid #F59E0B44', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 18 }}>🎙️</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginTop: 2 }}>Dashboard</div>
                  </div>
                  <div onClick={() => { window.location.hash = '#/record'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', border: '1px solid #33415566', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 18 }}>📅</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>Schedule</div>
                  </div>
                </>
              ) : currentUser.role === 'coach' ? (
                <div onClick={() => { window.location.hash = '#/coach'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#3B82F611', border: '1px solid #3B82F644', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 18 }}>📊</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginTop: 2 }}>Coach Dashboard</div>
                </div>
              ) : null}
              <div onClick={() => { window.location.hash = '#/submit?mode=result'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', border: '1px solid #33415566', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 18 }}>📝</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>Submit</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

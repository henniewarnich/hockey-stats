import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { MATCH_HOME_TEAM, MATCH_AWAY_TEAM, teamShortName, teamColor, teamDisplayName, teamSlug } from '../utils/teams.js';
import MatchCardTeams from './MatchCardTeams.jsx';
import { parseSASTDate } from '../utils/helpers.js';

export default function Homepage({ currentUser, liveMatches, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    // ── Platform stats ──
    const [{ count: matchCount }, { count: teamCount }, { count: eventCount }] = await Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'ended'),
      supabase.from('teams').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
      supabase.from('match_events').select('id', { count: 'exact', head: true }),
    ]);

    // Total match view sessions (unique viewer × match pairs) × 1000
    const { count: vc } = await supabase.from('match_viewers')
      .select('id', { count: 'exact', head: true });

    // Total goals from ended matches
    const { data: goalData } = await supabase.from('matches')
      .select('home_score, away_score')
      .eq('status', 'ended');
    const totalGoals = (goalData || []).reduce((s, m) => s + (m.home_score || 0) + (m.away_score || 0), 0);

    // Matches analysed (have match_stats)
    const { count: analysedCount } = await supabase.from('match_stats')
      .select('match_id', { count: 'exact', head: true });
    // Dedupe (multiple rows per match)
    const { data: analysedMatches } = await supabase.from('match_stats')
      .select('match_id');
    const uniqueAnalysed = new Set((analysedMatches || []).map(r => r.match_id)).size;

    setStats({
      matches: matchCount || 0,
      teams: teamCount || 0,
      viewers: (vc || 0) * 1000,
      goals: totalGoals,
      events: eventCount || 0,
      analysed: uniqueAnalysed,
    });

    // ── Team analysis (from match_stats aggregates) ──
    // Totals rows use quarter=0
    const { data: totalStats } = await supabase.from('match_stats')
      .select('match_id, team, goals, d_entries, turnovers_won, poss_lost, territory_pct, possession_time_pct, shots_on, shots_off')
      .eq('quarter', 0);

    // We need to map team='home'/'away' back to actual team IDs
    // Fetch matches with team IDs
    const statsMatchIds = [...new Set((totalStats || []).map(s => s.match_id))];
    let matchTeamMap = {};
    if (statsMatchIds.length > 0) {
      const { data: sMatches } = await supabase.from('matches')
        .select(`id, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .in('id', statsMatchIds);
      (sMatches || []).forEach(m => { matchTeamMap[m.id] = { home: m.home_team, away: m.away_team }; });
    }

    // Aggregate per team
    const teamAgg = {};
    (totalStats || []).forEach(s => {
      const mt = matchTeamMap[s.match_id];
      if (!mt) return;
      const t = s.team === 'home' ? mt.home : mt.away;
      const opp = s.team === 'home' ? mt.away : mt.home;
      if (!t?.id) return;
      if (!teamAgg[t.id]) teamAgg[t.id] = { team: t, matches: 0, dEntries: 0, possLost: 0, turnoversWon: 0, goalsFor: 0, goalsAgainst: 0, territorySum: 0, possessionSum: 0, shotsOn: 0, shotsOff: 0 };
      const a = teamAgg[t.id];
      a.matches++;
      a.dEntries += s.d_entries || 0;
      a.possLost += s.poss_lost || 0;
      a.turnoversWon += s.turnovers_won || 0;
      a.goalsFor += s.goals || 0;
      a.territorySum += s.territory_pct || 0;
      a.possessionSum += s.possession_time_pct || 0;
      a.shotsOn += s.shots_on || 0;
      a.shotsOff += s.shots_off || 0;
      // Track goals conceded
      const oppStats = (totalStats || []).find(os => os.match_id === s.match_id && os.team !== s.team);
      if (oppStats) a.goalsAgainst += oppStats.goals || 0;
    });

    const teamsWithData = Object.values(teamAgg).filter(a => a.matches >= 3);
    if (teamsWithData.length >= 2) {
      // Most Accurate: highest D entry rate (d_entries per match)
      const mostAccurate = teamsWithData.reduce((best, t) => {
        const rate = t.dEntries / t.matches;
        return rate > (best._rate || 0) ? { ...t, _rate: rate } : best;
      }, { _rate: 0 });

      // Quickest: most shots + d_entries per match (proxy for tempo)
      const quickest = teamsWithData.reduce((best, t) => {
        const tempo = (t.shotsOn + t.shotsOff + t.dEntries) / t.matches;
        return tempo > (best._rate || 0) ? { ...t, _rate: tempo } : best;
      }, { _rate: 0 });

      // Most Patient: highest avg possession %
      const mostPatient = teamsWithData.reduce((best, t) => {
        const poss = t.possessionSum / t.matches;
        return poss > (best._rate || 0) ? { ...t, _rate: poss } : best;
      }, { _rate: 0 });

      // Strongest Defense: lowest goals conceded per match
      const strongestDef = teamsWithData.reduce((best, t) => {
        const gcpm = t.goalsAgainst / t.matches;
        return (best._rate === undefined || gcpm < best._rate) ? { ...t, _rate: gcpm } : best;
      }, { _rate: undefined });

      setAnalysis({ mostAccurate, quickest, mostPatient, strongestDef });
    }

    // ── Recent results ──
    const { data: recent } = await supabase.from('matches')
      .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
      .eq('status', 'ended')
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentResults(recent || []);
    setLoading(false);
  };

  const fmtNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const AnalysisCard = ({ icon, label, team, stat }) => {
    if (!team) return null;
    const c = teamColor(team.team) || '#64748B';
    return (
      <div onClick={() => { window.location.hash = `#/team/${teamSlug(team.team)}`; }}
        style={{ background: '#1E293B', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 2, background: c, flexShrink: 0 }} />
          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamShortName(team.team)}</div>
        </div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{stat}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      {/* Hero */}
      <div style={{ padding: '20px 16px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
          Live scoring, stats & analysis for <span style={{ color: '#F59E0B' }}>school hockey</span>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
          Follow your team in real time. Every goal, every short corner, every D entry — as it happens.
        </div>
      </div>

      {/* Live now pulse */}
      {liveMatches && liveMatches.length > 0 && (
        <div onClick={() => onNavigate('scores')} style={{
          margin: '0 16px 12px', background: '#EF444422', border: '1px solid #EF444444',
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

      {/* Stats row 1: Platform reach */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '0 16px 6px' }}>
        {[
          { val: stats?.matches, label: 'Matches', color: '#F59E0B' },
          { val: stats?.teams, label: 'Teams', color: '#10B981' },
          { val: stats?.viewers, label: 'Viewers', color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1E293B', borderRadius: 8, padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{loading ? '—' : fmtNum(s.val || 0)}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stats row 2: Data depth */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '0 16px 16px' }}>
        {[
          { val: stats?.goals, label: 'Goals', color: '#EF4444' },
          { val: stats?.events, label: 'Events tracked', color: '#8B5CF6' },
          { val: (stats?.analysed || 0) + 100, label: 'Matches analysed', color: '#10B981' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1E293B', borderRadius: 8, padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{loading ? '—' : fmtNum(s.val || 0)}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Team analysis */}
      {analysis && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Team analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <AnalysisCard icon="🎯" label="Most accurate" team={analysis.mostAccurate}
              stat={`${analysis.mostAccurate._rate.toFixed(1)} D entries/match`} />
            <AnalysisCard icon="⚡" label="Quickest" team={analysis.quickest}
              stat={`${analysis.quickest._rate.toFixed(1)} actions/match`} />
            <AnalysisCard icon="🧘" label="Most patient" team={analysis.mostPatient}
              stat={`${analysis.mostPatient._rate.toFixed(0)}% possession`} />
            <AnalysisCard icon="🛡️" label="Strongest defence" team={analysis.strongestDef}
              stat={`${analysis.strongestDef._rate.toFixed(1)} goals conceded/match`} />
          </div>
        </div>
      )}

      {/* Recent results */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Recent results</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569' }}>Loading...</div>
        ) : recentResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569', fontSize: 12 }}>No results yet</div>
        ) : (
          recentResults.map(m => {
            const hw = m.home_score > m.away_score;
            const aw = m.away_score > m.home_score;
            const draw = m.home_score === m.away_score;
            const badge = hw ? { label: 'W', bg: '#10B981' } : aw ? { label: 'L', bg: '#EF4444' } : { label: 'D', bg: '#F59E0B' };
            const d = parseSASTDate(m.match_date);
            return (
              <div key={m.id} onClick={() => { window.location.hash = `#/team/${teamSlug(m.home_team)}?match=${m.id}`; }}
                style={{ display: 'flex', alignItems: 'center', background: '#1E293B', borderRadius: 10, padding: '10px 12px', marginBottom: 4, gap: 10, border: '1px solid #1E293B', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{badge.label}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MatchCardTeams home={m.home_team} away={m.away_team}
                    meta={`${d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}${m.match_type ? ` · ${m.match_type}` : ''}`} />
                </div>
                <div style={{ textAlign: 'center', minWidth: 44 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#F8FAFC' }}>{m.home_score}–{m.away_score}</div>
                  {m.home_penalty_score != null && (
                    <div style={{ fontSize: 9, color: '#F59E0B', fontWeight: 700 }}>{m.home_penalty_score}-{m.away_penalty_score} pen</div>
                  )}
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

      {/* Logged-in quick actions */}
      {currentUser && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: '#1E293B', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>
              Welcome back, {currentUser.alias_nickname || currentUser.firstname}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['admin', 'commentator_admin', 'commentator'].includes(currentUser.role) && (
                <div onClick={() => { window.location.hash = '#/admin'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#F59E0B11', border: '1px solid #F59E0B44', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 18 }}>🎙️</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginTop: 2 }}>Dashboard</div>
                </div>
              )}
              {currentUser.role === 'coach' && (
                <div onClick={() => { window.location.hash = '#/coach'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#3B82F611', border: '1px solid #3B82F644', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 18 }}>📊</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginTop: 2 }}>Coach</div>
                </div>
              )}
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

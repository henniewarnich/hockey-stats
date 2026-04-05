import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase.js';
import { MATCH_HOME_TEAM, MATCH_AWAY_TEAM, teamShortName, teamColor, teamDisplayName, teamSlug } from '../utils/teams.js';
import MatchCardTeams from './MatchCardTeams.jsx';
import { parseSASTDate } from '../utils/helpers.js';

const CACHE_KEY = 'kykie-homepage-v5';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (Date.now() - c.ts > CACHE_TTL) return null;
    return c.data;
  } catch { return null; }
}
function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

// SVG icons — clean, professional
const Icon = ({ type }) => {
  const s = { width: 20, height: 20, display: 'block' };
  if (type === 'target') return (
    <svg style={s} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#EF4444" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="4" stroke="#EF4444" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="1.5" fill="#EF4444"/>
    </svg>
  );
  if (type === 'bolt') return (
    <svg style={s} viewBox="0 0 20 20" fill="none">
      <path d="M11 2L5 11h4l-1 7 6-9h-4l1-7z" fill="#F59E0B"/>
    </svg>
  );
  if (type === 'clock') return (
    <svg style={s} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#3B82F6" strokeWidth="1.5"/>
      <path d="M10 5v5l3.5 2" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'shield') return (
    <svg style={s} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 6v4c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-4z" stroke="#10B981" strokeWidth="1.5" fill="#10B98122"/>
    </svg>
  );
  return null;
};

export default function Homepage({ currentUser, liveMatches, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    // Show cache immediately
    const cached = loadCache();
    if (cached) {
      setStats(cached.stats);
      setAnalysis(cached.analysis);
      setRecentResults(cached.recentResults || []);
      setLoading(false);
    }
    load(!!cached);
  }, []);

  const load = async (hasCache) => {
    if (!hasCache) setLoading(true);

    // ── Platform stats ──
    const [{ count: matchCount }, { count: teamCount }, { count: eventCount }] = await Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'ended'),
      supabase.from('teams').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
      supabase.from('match_events').select('id', { count: 'exact', head: true }),
    ]);

    const { count: vc } = await supabase.from('match_viewers')
      .select('id', { count: 'exact', head: true });

    const { data: goalData } = await supabase.from('matches')
      .select('home_score, away_score').eq('status', 'ended');
    const totalGoals = (goalData || []).reduce((s, m) => s + (m.home_score || 0) + (m.away_score || 0), 0);

    const { data: analysedMatches } = await supabase.from('match_stats').select('match_id');
    const uniqueAnalysed = new Set((analysedMatches || []).map(r => r.match_id)).size;

    const newStats = {
      matches: matchCount || 0, teams: teamCount || 0,
      viewers: (vc || 0) + 100, goals: totalGoals,
      events: eventCount || 0, analysed: uniqueAnalysed,
    };
    setStats(newStats);

    // ── Team analysis (hybrid: all matches for record + Live Pro for AI Scout) ──

    // 1. Overall record from ALL ended matches
    const { data: allMatches } = await supabase.from('matches')
      .select(`id, home_team_id, away_team_id, home_score, away_score, duration, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
      .eq('status', 'ended');

    const overallRecord = {};
    (allMatches || []).forEach(m => {
      ['home', 'away'].forEach(side => {
        const tid = m[`${side}_team_id`];
        const opp = side === 'home' ? 'away' : 'home';
        const gf = m[`${side}_score`] || 0;
        const ga = m[`${opp}_score`] || 0;
        const team = side === 'home' ? m.home_team : m.away_team;
        if (!overallRecord[tid]) overallRecord[tid] = { team, total: 0, w: 0, l: 0, d: 0, gf: 0, ga: 0 };
        const r = overallRecord[tid];
        if (team) r.team = team; // keep latest team object
        r.total++; r.gf += gf; r.ga += ga;
        if (gf > ga) r.w++; else if (gf < ga) r.l++; else r.d++;
      });
    });

    // 2. AI Scout data from Live Pro matches (match_stats quarter=0)
    const { data: totalStats } = await supabase.from('match_stats')
      .select('match_id, team, goals, d_entries, turnovers_won, poss_lost, territory_pct, possession_time_pct, shots_on, shots_off')
      .eq('quarter', 0);

    const statsMatchIds = [...new Set((totalStats || []).map(s => s.match_id))];
    let matchTeamMap = {};
    if (statsMatchIds.length > 0) {
      const { data: sMatches } = await supabase.from('matches')
        .select(`id, duration, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .in('id', statsMatchIds);
      (sMatches || []).forEach(m => { matchTeamMap[m.id] = { home: m.home_team, away: m.away_team, duration: m.duration || 0 }; });
    }

    const scoutAgg = {};
    (totalStats || []).forEach(s => {
      const mt = matchTeamMap[s.match_id];
      if (!mt) return;
      const t = s.team === 'home' ? mt.home : mt.away;
      if (!t?.id) return;
      if (!scoutAgg[t.id]) scoutAgg[t.id] = { team: t, lpMatches: 0, dEntries: 0, possLost: 0, turnoversWon: 0, possessionSum: 0, shotsOn: 0, shotsOff: 0, durationSec: 0 };
      const a = scoutAgg[t.id];
      a.lpMatches++;
      a.dEntries += s.d_entries || 0;
      a.possLost += s.poss_lost || 0;
      a.turnoversWon += s.turnovers_won || 0;
      a.possessionSum += s.possession_time_pct || 0;
      a.shotsOn += s.shots_on || 0;
      a.shotsOff += s.shots_off || 0;
      a.durationSec += mt.duration;
    });

    // 3. Build analysis — qualify with positive GD from ALL matches
    const qualifiedOverall = Object.entries(overallRecord).filter(([, r]) => r.total >= 10 && (r.gf - r.ga) > 0 && r.w / r.total >= 0.4);
    const qualifiedScout = Object.entries(scoutAgg).filter(([tid, a]) => {
      const rec = overallRecord[tid];
      return a.lpMatches >= 1 && rec && rec.total >= 10 && (rec.gf - rec.ga) > 0 && rec.w / rec.total >= 0.4;
    });

    let newAnalysis = null;
    if (qualifiedScout.length >= 3 || qualifiedOverall.length >= 3) {
      const sortScout = (fn) => [...qualifiedScout].sort(fn).slice(0, 3).map(([, a]) => a);
      const sortOverall = (fn) => [...qualifiedOverall].sort(fn).slice(0, 3).map(([, r]) => r);

      newAnalysis = {
        // AI Scout: Accuracy = D entries / (D entries + poss_lost)
        mostAccurate: qualifiedScout.length >= 3 ? sortScout((a, b) => {
          const ra = a[1].dEntries / (a[1].dEntries + a[1].possLost + 0.01);
          const rb = b[1].dEntries / (b[1].dEntries + b[1].possLost + 0.01);
          return rb - ra;
        }) : null,
        // AI Scout: Speed = actions per minute
        quickest: qualifiedScout.length >= 3 ? sortScout((a, b) => {
          const ma = a[1].durationSec / 60 || 1;
          const mb = b[1].durationSec / 60 || 1;
          return ((b[1].dEntries + b[1].shotsOn + b[1].shotsOff + b[1].turnoversWon) / mb) -
                 ((a[1].dEntries + a[1].shotsOn + a[1].shotsOff + a[1].turnoversWon) / ma);
        }) : null,
        // AI Scout: Patience = avg possession %
        mostPatient: qualifiedScout.length >= 3 ? sortScout((a, b) =>
          (b[1].possessionSum / b[1].lpMatches) - (a[1].possessionSum / a[1].lpMatches)
        ) : null,
        // ALL matches: Defence = lowest GA/match
        strongestDef: qualifiedOverall.length >= 3 ? sortOverall((a, b) =>
          (a[1].ga / a[1].total) - (b[1].ga / b[1].total)
        ) : null,
      };
    }
    setAnalysis(newAnalysis);

    // ── Recent results ──
    const { data: recent } = await supabase.from('matches')
      .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
      .eq('status', 'ended')
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentResults(recent || []);
    setLoading(false);

    // Cache (strip deep objects for serialisation)
    saveCache({ stats: newStats, analysis: newAnalysis, recentResults: recent || [] });
  };

  const fmtNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const AnalysisCard = ({ icon, label, teams }) => {
    if (!teams || teams.length === 0) return null;
    return (
      <div style={{ background: '#1E293B', borderRadius: 8, padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
          <Icon type={icon} />
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>{label}</span>
        </div>
        {teams.map((t, i) => {
          const c = teamColor(t.team) || '#64748B';
          return (
            <div key={t.team.id} onClick={() => { window.location.hash = `#/team/${teamSlug(t.team)}`; }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 0', cursor: 'pointer' }}>
              <div style={{
                width: 16, height: 16, borderRadius: 3, fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: c, color: '#fff', opacity: i === 0 ? 1 : 0.7,
              }}>{i + 1}</div>
              <div style={{ fontSize: i === 0 ? 11 : 10, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#F8FAFC' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {teamDisplayName(t.team)}
              </div>
            </div>
          );
        })}
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

      {/* Stats row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '0 16px 6px' }}>
        {[
          { val: stats?.matches, label: 'Matches', color: '#F59E0B', link: 'scores' },
          { val: stats?.teams, label: 'Teams', color: '#10B981', link: 'teams' },
          { val: stats?.viewers, label: 'Viewers', color: '#3B82F6', link: 'supporters' },
        ].map(s => (
          <div key={s.label} onClick={() => { if (s.link === 'scores' || s.link === 'teams') onNavigate(s.link); else window.location.hash = `#/${s.link}`; }}
            style={{ background: '#1E293B', borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{!stats ? '—' : fmtNum(s.val || 0)}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stats row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '0 16px 16px' }}>
        {[
          { val: stats?.goals, label: 'Goals', color: '#EF4444', link: 'stats-overview' },
          { val: stats?.events, label: 'Stats collected', color: '#8B5CF6', link: 'stats-overview' },
          { val: (stats?.analysed || 0) + 100, label: 'Matches analysed', color: '#10B981', link: 'stats-overview' },
        ].map(s => (
          <div key={s.label} onClick={() => { window.location.hash = `#/${s.link}`; }}
            style={{ background: '#1E293B', borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{!stats ? '—' : fmtNum(s.val || 0)}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Team analysis — top 3 per metric */}
      {analysis && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Kykie AI Scout — team analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <AnalysisCard icon="target" label="Most accurate" teams={analysis.mostAccurate} />
            <AnalysisCard icon="bolt" label="Quickest" teams={analysis.quickest} />
            <AnalysisCard icon="clock" label="Most patient" teams={analysis.mostPatient} />
            <AnalysisCard icon="shield" label="Strongest defence" teams={analysis.strongestDef} />
          </div>
        </div>
      )}

      {/* Recent results */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Recent results</div>
        {!stats && loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569' }}>Loading...</div>
        ) : recentResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#475569', fontSize: 12 }}>No results yet</div>
        ) : (
          recentResults.map(m => {
            const hw = m.home_score > m.away_score;
            const aw = m.away_score > m.home_score;
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
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {['admin', 'commentator_admin', 'commentator'].includes(currentUser.role) && (
                <>
                  <div onClick={() => { window.location.hash = '#/admin'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#F59E0B11', border: '1px solid #F59E0B44', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 16 }}>🎙️</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', marginTop: 2 }}>Dashboard</div>
                  </div>
                  <div onClick={() => { window.location.hash = '#/admin'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', border: '1px solid #33415566', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 16 }}>📅</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>Schedule</div>
                  </div>
                  <div onClick={() => { window.location.hash = '#/admin'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', border: '1px solid #33415566', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 16 }}>📊</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>History</div>
                  </div>
                </>
              )}
              {currentUser.role === 'coach' && (
                <div onClick={() => { window.location.hash = '#/coach'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#3B82F611', border: '1px solid #3B82F644', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 16 }}>📊</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', marginTop: 2 }}>Coach</div>
                </div>
              )}
              <div onClick={() => { window.location.hash = '#/submit?mode=result'; }} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#0B0F1A', border: '1px solid #33415566', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 16 }}>📝</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>Submit</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

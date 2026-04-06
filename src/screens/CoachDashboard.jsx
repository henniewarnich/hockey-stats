import { useState, useEffect } from 'react';
import { getCoachTeams } from '../utils/auth.js';
import { supabase } from '../utils/supabase.js';
import { fetchLatestRankings } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import { parseSASTDate, matchOutcome } from '../utils/helpers.js';
import { getWeekStart } from '../utils/stats.js';
import RankBadge from '../components/RankBadge.jsx';
import RoleSwitcher from '../components/RoleSwitcher.jsx';
import MiniChart from '../components/MiniChart.jsx';
import { teamDisplayName, teamInitial, teamShortName, teamSlug } from '../utils/teams.js';
import { FREE_PLUS_THRESHOLD } from '../utils/credits.js';

const fmtDate = (d) => {
  if (!d) return '';
  const dt = parseSASTDate(d);
  return dt.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
};
const fmtTime = (t) => t ? t.slice(0, 5) : '';

export default function CoachDashboard({ currentUser, onLogout, onRoleSwitch }) {
  const [teams, setTeams] = useState([]);
  const [upcomingByTeam, setUpcomingByTeam] = useState({});
  const [resultsByTeam, setResultsByTeam] = useState({});
  const [loading, setLoading] = useState(true);
  const [teamTabs, setTeamTabs] = useState({});
  const [latestRankings, setLatestRankings] = useState({});
  const [oppForm, setOppForm] = useState({});
  const [oppRankings, setOppRankings] = useState({});
  const [oppGD, setOppGD] = useState({});
  const [tierInfo, setTierInfo] = useState({}); // team_id → tier info

  useEffect(() => { loadData(); }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);

    const myTeams = await getCoachTeams(currentUser.id);
    setTeams(myTeams);

    if (myTeams.length > 0) {
      const teamIds = myTeams.map(t => t.id);
      const today = new Date().toISOString().split('T')[0];

      const [{ data: upcoming }, { data: ended }] = await Promise.all([
        supabase
          .from('matches')
          .select('id, home_team_id, away_team_id, match_date, scheduled_time, venue, status, home_score, away_score, home_team:teams!matches_home_team_id_fkey(id, name, color), away_team:teams!matches_away_team_id_fkey(id, name, color)')
          .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
          .in('status', ['upcoming', 'live', 'paused'])
          .gte('match_date', today)
          .order('match_date', { ascending: true })
          .order('scheduled_time', { ascending: true }),
        supabase
          .from('matches')
          .select('id, home_team_id, away_team_id, match_date, scheduled_time, venue, status, home_score, away_score, duration, home_rank, away_rank, home_prev_rank, away_prev_rank, match_type, home_team:teams!matches_home_team_id_fkey(id, name, color), away_team:teams!matches_away_team_id_fkey(id, name, color)')
          .or(teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
          .eq('status', 'ended')
          .order('match_date', { ascending: false })
          .limit(50),
      ]);

      const groupUp = {}, groupRes = {};
      teamIds.forEach(tid => { groupUp[tid] = []; groupRes[tid] = []; });
      (upcoming || []).forEach(m => {
        teamIds.forEach(tid => {
          if (m.home_team_id === tid || m.away_team_id === tid) groupUp[tid].push(m);
        });
      });
      (ended || []).forEach(m => {
        teamIds.forEach(tid => {
          if (m.home_team_id === tid || m.away_team_id === tid) groupRes[tid].push(m);
        });
      });
      setUpcomingByTeam(groupUp);
      setResultsByTeam(groupRes);

      const tabs = {};
      teamIds.forEach(tid => { tabs[tid] = groupUp[tid].length > 0 ? 'upcoming' : 'results'; });
      setTeamTabs(tabs);

      fetchLatestRankings().then(r => setLatestRankings(r)).catch(() => {});

      // Fetch tier info for coach's teams
      supabase.from('team_tiers').select('*').in('team_id', teamIds).then(({ data: tiers }) => {
        const ti = {};
        (tiers || []).forEach(tt => {
          ti[tt.team_id] = { ...tt };
        });
        // Fetch total ended matches per team — compute correct avg and tier
        Promise.all(teamIds.map(async tid => {
          const { count } = await supabase.from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ended')
            .or(`home_team_id.eq.${tid},away_team_id.eq.${tid}`);
          if (!ti[tid]) ti[tid] = { credits_total: 0 };
          const credits = ti[tid].credits_total || 0;
          const totalMatches = count || 0;
          const avg = totalMatches > 0 ? credits / totalMatches : 0;
          const isOvr = ti[tid].tier_override && (!ti[tid].override_expires || new Date(ti[tid].override_expires) > new Date());
          const calculatedTier = avg >= FREE_PLUS_THRESHOLD ? 'free_plus' : 'free';
          ti[tid].totalMatches = totalMatches;
          ti[tid].avgAllMatches = avg;
          ti[tid].effectiveTier = isOvr ? ti[tid].tier_override : calculatedTier;
          ti[tid].isOverridden = isOvr;
        })).then(() => setTierInfo({ ...ti }));
      }).catch(() => {});

      // Get recent form for all opponents
      const oppIds = new Set();
      (upcoming || []).forEach(m => {
        teamIds.forEach(tid => {
          const oppId = m.home_team_id === tid ? m.away_team_id : (m.away_team_id === tid ? m.home_team_id : null);
          if (oppId) oppIds.add(oppId);
        });
      });

      if (oppIds.size > 0) {
        const { data: oppMatches } = await supabase
          .from('matches')
          .select('id, home_team_id, away_team_id, home_score, away_score, match_date, home_penalty_score, away_penalty_score')
          .eq('status', 'ended')
          .or([...oppIds].map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(','))
          .order('match_date', { ascending: false })
          .limit(100);

        const form = {};
        const gdByOpp = {};
        oppIds.forEach(oid => {
          const ms = (oppMatches || []).filter(m => m.home_team_id === oid || m.away_team_id === oid);
          const recent = ms.slice(0, 5);
          const results = recent.map(m => {
            const isHome = m.home_team_id === oid;
            const gf = isHome ? m.home_score : m.away_score;
            const ga = isHome ? m.away_score : m.home_score;
            return { result: matchOutcome(m, oid), gf, ga };
          });
          const gf = results.reduce((s, r) => s + r.gf, 0);
          const ga = results.reduce((s, r) => s + r.ga, 0);
          form[oid] = { results, gf, ga, played: results.length };

          // Weekly GD (oldest first)
          const weekMap = {};
          ms.forEach(m => {
            const week = getWeekStart(m.match_date);
            if (!weekMap[week]) weekMap[week] = { gf: 0, ga: 0 };
            const isHome = m.home_team_id === oid;
            weekMap[week].gf += isHome ? m.home_score : m.away_score;
            weekMap[week].ga += isHome ? m.away_score : m.home_score;
          });
          const weeks = Object.keys(weekMap).sort();
          gdByOpp[oid] = weeks.map(w => ({
            label: parseSASTDate(w).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
            value: weekMap[w].gf - weekMap[w].ga,
          }));
        });
        setOppForm(form);
        setOppGD(gdByOpp);

        // Fetch ranking history for all opponents (one batched query)
        const { data: oppRanks } = await supabase
          .from('rankings')
          .select('team_id, position, ranking_set:ranking_sets!ranking_set_id(scraped_at)')
          .in('team_id', [...oppIds]);
        const ranksByOpp = {};
        (oppRanks || []).forEach(r => {
          if (!r.ranking_set?.scraped_at) return;
          if (!ranksByOpp[r.team_id]) ranksByOpp[r.team_id] = [];
          ranksByOpp[r.team_id].push(r);
        });
        // Sort and format
        const rankDataByOpp = {};
        Object.entries(ranksByOpp).forEach(([tid, ranks]) => {
          ranks.sort((a, b) => a.ranking_set.scraped_at.localeCompare(b.ranking_set.scraped_at));
          rankDataByOpp[tid] = ranks.map(r => ({
            label: parseSASTDate(r.ranking_set.scraped_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
            value: r.position,
          }));
        });
        setOppRankings(rankDataByOpp);
      }
    }

    setLoading(false);
  };

  // slugify: use teamSlug from teams.js
  const goToTeam = (team) => { window.location.hash = `#/team/${teamSlug(team)}`; };

  const resultBadge = (m, teamId) => {
    const o = matchOutcome(m, teamId);
    if (o === 'W') return { label: 'W', color: '#10B981' };
    if (o === 'L') return { label: 'L', color: '#EF4444' };
    return { label: 'D', color: '#64748B' };
  };

  const FormDots = ({ form }) => {
    if (!form || form.results.length === 0) return null;
    return (
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {form.results.map((r, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3, fontSize: 8, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: r.result === 'W' ? '#10B98122' : r.result === 'L' ? '#EF444422' : '#64748B22',
            color: r.result === 'W' ? '#10B981' : r.result === 'L' ? '#EF4444' : '#64748B',
          }}>{r.result}</div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={S.app}>
        <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: theme.textDim }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

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
            <div style={{ fontSize: 10, color: theme.textDim }}>
              {currentUser.firstname}
              {' '}<RoleSwitcher currentUser={currentUser} onSwitch={onRoleSwitch} />
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
              const ti = tierInfo[team.id];

              return (
                <div key={team.id} onClick={() => goToTeam(team)} style={{ background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: (team.color || "#8B5CF6") + "22", border: `2px solid ${(team.color || "#8B5CF6")}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: team.color || "#8B5CF6",
                    }}>{team.short_name || teamInitial(team)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>
                        {teamDisplayName(team)} {(() => { const r = latestRankings[team.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}
                      </div>
                      <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>Tap to view team page</div>
                    </div>
                    <span style={{ color: "#334155", fontSize: 16 }}>›</span>
                  </div>

                  {/* Tier progress — avg = total credits / ALL ended matches */}
                  {(() => {
                    const credits = ti?.credits_total || 0;
                    const allMatches = ti?.totalMatches || 0;
                    const avg = ti?.avgAllMatches || (allMatches > 0 ? credits / allMatches : 0);
                    const tier = ti?.effectiveTier || 'free';
                    const pct = Math.min(100, Math.round((avg / FREE_PLUS_THRESHOLD) * 100));
                    const isPlus = tier === 'free_plus' || tier === 'premium';
                    const isPremium = tier === 'premium';
                    const color = isPremium ? '#10B981' : isPlus ? '#F59E0B' : '#3B82F6';
                    const label = isPremium ? 'Premium' : isPlus ? 'Free Plus' : 'Free';
                    return (
                      <div style={{ padding: '0 16px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: '#64748B' }}>
                            {credits > 0 ? `${Math.round(avg * 10) / 10} avg credits/match` : 'No credit data yet'}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: color + '22', color }}>
                            {label}{ti?.isOverridden ? ' (override)' : ''}
                          </span>
                        </div>
                        {!isPremium && !isPlus && allMatches > 0 && (() => {
                          const needed = Math.ceil(FREE_PLUS_THRESHOLD * allMatches - credits);
                          if (needed <= 0) return null;
                          // Suggest the simplest action to close the gap
                          let tip = '';
                          if (needed <= 5) tip = 'Enter one quick score to unlock';
                          else if (needed <= 10) tip = 'Record one Live Basic match to unlock';
                          else if (needed <= 20) tip = 'Record one match from video to unlock';
                          else if (needed <= 30) tip = 'Record one same-day video review to unlock';
                          else if (needed <= 50) tip = 'Record one Live Pro match to unlock';
                          else { const n = Math.ceil(needed / 20); tip = `Record ${n} matches from video to unlock`; }
                          return (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <div style={{ flex: 1, height: 4, background: '#0B0F1A', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: '#3B82F6', borderRadius: 2 }} />
                                </div>
                              </div>
                              <div style={{ fontSize: 9, color: '#94A3B8', lineHeight: 1.4 }}>
                                <span style={{ color: '#F59E0B', fontWeight: 600 }}>{needed} credits short</span> ({Math.round((FREE_PLUS_THRESHOLD - avg) * 10) / 10} avg × {allMatches} matches). {tip}.
                              </div>
                            </div>
                          );
                        })()}
                        {isPlus && !isPremium && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <div style={{ flex: 1, height: 4, background: '#0B0F1A', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: '100%', height: '100%', background: '#F59E0B', borderRadius: 2 }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

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

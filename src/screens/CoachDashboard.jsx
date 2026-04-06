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
          const isOvr = tt.tier_override && (!tt.override_expires || new Date(tt.override_expires) > new Date());
          ti[tt.team_id] = { ...tt, effectiveTier: isOvr ? tt.tier_override : (tt.tier || 'free'), isOverridden: isOvr };
        });
        setTierInfo(ti);
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
              const results = resultsByTeam[team.id] || [];
              const tab = teamTabs[team.id] || 'upcoming';

              return (
                <div key={team.id} style={{ background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  {/* Team header */}
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div onClick={() => goToTeam(team)} style={{
                      width: 40, height: 40, borderRadius: 10, cursor: "pointer",
                      background: (team.color || "#8B5CF6") + "22", border: `2px solid ${(team.color || "#8B5CF6")}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: team.color || "#8B5CF6",
                    }}>{team.short_name || teamInitial(team)}</div>
                    <div style={{ flex: 1 }} onClick={() => goToTeam(team)}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, cursor: "pointer" }}>
                        {teamDisplayName(team)} {(() => { const r = latestRankings[team.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}
                      </div>
                      <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>
                        {upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming'}
                        {results.length > 0 ? ` · ${results.length} result${results.length !== 1 ? 's' : ''}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Tier progress bar */}
                  {(() => {
                    const ti = tierInfo[team.id];
                    const avg = ti?.avg_per_match || 0;
                    const tier = ti?.effectiveTier || 'free';
                    const pct = Math.min(100, Math.round((avg / FREE_PLUS_THRESHOLD) * 100));
                    const isPlus = tier === 'free_plus' || tier === 'premium';
                    const isPremium = tier === 'premium';
                    const color = isPremium ? '#10B981' : isPlus ? '#F59E0B' : '#3B82F6';
                    const label = isPremium ? 'Premium' : isPlus ? 'Free Plus' : 'Free';
                    return (
                      <div style={{ padding: '0 16px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: '#64748B' }}>
                            {ti ? `${Math.round(avg * 10) / 10} avg credits/match · ${ti.matches_count || 0} matches` : 'No credit data yet'}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: color + '22', color }}>
                            {label}{ti?.isOverridden ? ' (override)' : ''}
                          </span>
                        </div>
                        {!isPremium && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 4, background: '#0B0F1A', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: isPlus ? '#F59E0B' : '#3B82F6', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 8, color: '#64748B' }}>
                              {isPlus ? 'Free Plus active' : `${Math.round(FREE_PLUS_THRESHOLD - avg)} more to Free Plus`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Tabs */}
                  <div style={{ display: "flex", borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                    {[['upcoming', `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ''}`], ['results', `Results${results.length > 0 ? ` (${results.length})` : ''}`]].map(([k, label]) => (
                      <button key={k} onClick={() => setTeamTabs(prev => ({ ...prev, [team.id]: k }))}
                        style={{
                          flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
                          background: tab === k ? "#334155" : "transparent",
                          color: tab === k ? "#F8FAFC" : "#64748B",
                        }}>{label}</button>
                    ))}
                  </div>

                  {/* Upcoming tab */}
                  {tab === 'upcoming' && (
                    <div style={{ padding: "6px 12px 10px" }}>
                      {upcoming.length === 0 ? (
                        <div style={{ padding: "16px 0", textAlign: "center", color: theme.textDim, fontSize: 11 }}>No upcoming matches</div>
                      ) : upcoming.slice(0, 5).map(m => {
                        const isHome = m.home_team_id === team.id;
                        const opp = isHome ? m.away_team : m.home_team;
                        const oppId = opp?.id;
                        const isLive = m.status === 'live' || m.status === 'paused';
                        const oppRank = latestRankings[oppId];
                        const form = oppForm[oppId];

                        return (
                          <div key={m.id} style={{ padding: "10px 4px", borderBottom: `1px solid ${theme.border}22` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {isLive && <span style={{ fontSize: 8, color: "#10B981", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#10B98122" }}>LIVE</span>}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>
                                  {'vs'} {teamShortName(opp) || 'TBD'} {oppRank ? <RankBadge rank={oppRank.rank} prevRank={oppRank.prevRank} /> : null}
                                </div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
                                  {fmtDate(m.match_date)}{m.scheduled_time ? ` · ${fmtTime(m.scheduled_time)}` : ''}{m.venue ? ` · ${m.venue}` : ''}
                                </div>
                              </div>
                              {isLive && <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{m.home_score} - {m.away_score}</div>}
                            </div>

                            {/* Opposition scouting — Free Plus required */}
                            {(() => {
                              const ti = tierInfo[team.id];
                              const tier = ti?.effectiveTier || 'free';
                              const canSeeOpp = tier === 'free_plus' || tier === 'premium';
                              if (!canSeeOpp) {
                                return (form?.played > 0 || oppRankings[oppId]?.length > 0) ? (
                                  <div style={{ marginTop: 6, padding: "8px 10px", background: "#0B0F1A", borderRadius: 6, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>🔒 Opposition scouting</div>
                                    <div style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>Upgrade to Free Plus to see form, rankings & goal difference</div>
                                  </div>
                                ) : null;
                              }
                              return (form?.played > 0 || oppRankings[oppId]?.length > 0) ? (
                              <div style={{ marginTop: 6, padding: "6px 8px", background: "#0B0F1A", borderRadius: 6 }}>
                                {form && form.played > 0 && (
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <div>
                                      <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                                        {opp?.name} · Last {form.played}
                                      </div>
                                      <FormDots form={form} />
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ fontSize: 11, fontWeight: 800, color: "#F8FAFC", fontFamily: "monospace" }}>{form.gf}:{form.ga}</div>
                                      <div style={{ fontSize: 8, color: "#64748B" }}>GF:GA</div>
                                    </div>
                                  </div>
                                )}
                                {oppRankings[oppId]?.length > 0 && (
                                  <div style={{ marginTop: form?.played > 0 ? 8 : 0, paddingTop: form?.played > 0 ? 8 : 0, borderTop: form?.played > 0 ? "1px solid #1E293B" : "none" }}>
                                    <MiniChart data={oppRankings[oppId]} label="Ranking" color="#F59E0B" invert compact />
                                  </div>
                                )}
                                {oppGD[oppId]?.length > 0 && (
                                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px solid #1E293B" }}>
                                    <MiniChart data={oppGD[oppId]} label="Goal difference" color="#F59E0B" showZeroLine compact />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ marginTop: 6, padding: "6px 8px", background: "#0B0F1A", borderRadius: 6 }}>
                                <div style={{ fontSize: 9, color: "#475569", textAlign: "center" }}>No match history available</div>
                              </div>
                            );
                            })()}
                          </div>
                        );
                      })}
                      {upcoming.length > 5 && (
                        <div style={{ fontSize: 10, color: theme.textDim, padding: "6px 4px", textAlign: "center" }}>+ {upcoming.length - 5} more</div>
                      )}
                    </div>
                  )}

                  {/* Results tab */}
                  {tab === 'results' && (
                    <div style={{ padding: "6px 12px 10px" }}>
                      {results.length === 0 ? (
                        <div style={{ padding: "16px 0", textAlign: "center", color: theme.textDim, fontSize: 11 }}>No results yet</div>
                      ) : results.slice(0, 5).map(m => {
                        const isHome = m.home_team_id === team.id;
                        const opp = isHome ? m.away_team : m.home_team;
                        const rl = resultBadge(m, team.id);
                        const d = parseSASTDate(m.match_date);

                        return (
                          <div key={m.id} onClick={() => { window.location.hash = `#/team/${teamSlug(team)}?match=${m.id}`; }}
                            style={{ padding: "8px 4px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${theme.border}22`, cursor: "pointer" }}>
                            <div style={{
                              width: 22, height: 22, borderRadius: 5, fontSize: 9, fontWeight: 900,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: rl.color + "22", color: rl.color, flexShrink: 0,
                            }}>{rl.label}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>
                                {'vs'} {teamShortName(opp) || 'TBD'} <RankBadge rank={isHome ? m.away_rank : m.home_rank} prevRank={isHome ? m.away_prev_rank : m.home_prev_rank} />
                              </div>
                              <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
                                {d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                                {m.venue && ` · ${m.match_type ? m.match_type.charAt(0).toUpperCase() + m.match_type.slice(1) + ' @ ' : ''}${m.venue}`}
                              </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{m.home_score}–{m.away_score}</div>
                            <span style={{ fontSize: 10, color: "#334155" }}>›</span>
                          </div>
                        );
                      })}
                      {results.length > 5 && (
                        <div onClick={() => goToTeam(team)} style={{ fontSize: 10, color: "#8B5CF6", padding: "8px 4px", textAlign: "center", cursor: "pointer", fontWeight: 600 }}>
                          View all {results.length} results →
                        </div>
                      )}
                    </div>
                  )}
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

import { useState, useEffect } from 'react';
import { getCoachTeams } from '../utils/auth.js';
import { supabase } from '../utils/supabase.js';
import { fetchLatestRankings } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import RankBadge from '../components/RankBadge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KykieSpinner from '../components/KykieSpinner.jsx';
import { teamDisplayName, teamInitial, teamSlug } from '../utils/teams.js';
import { FREE_PLUS_THRESHOLD } from '../utils/credits.js';

export default function CoachDashboard({ currentUser, onLogout, onRoleSwitch }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestRankings, setLatestRankings] = useState({});
  const [tierInfo, setTierInfo] = useState({});
  const [redirected, setRedirected] = useState(false);

  useEffect(() => { loadData(); }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    const myTeams = await getCoachTeams(currentUser.id);
    setTeams(myTeams);

    // Single team -> redirect immediately
    if (myTeams.length === 1) {
      sessionStorage.setItem('kykie-coach-team-count', '1');
      setRedirected(true);
      window.location.hash = '#/team/' + teamSlug(myTeams[0]);
      return;
    }

    if (myTeams.length > 1) {
      sessionStorage.setItem('kykie-coach-team-count', String(myTeams.length));
      const teamIds = myTeams.map(t => t.id);
      fetchLatestRankings().then(r => setLatestRankings(r)).catch(() => {});
      supabase.from('team_tiers').select('*').in('team_id', teamIds).then(({ data: tiers }) => {
        const ti = {};
        (tiers || []).forEach(tt => { ti[tt.team_id] = { ...tt }; });
        Promise.all(teamIds.map(async tid => {
          const { count } = await supabase.from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ended')
            .or('home_team_id.eq.' + tid + ',away_team_id.eq.' + tid);
          if (!ti[tid]) ti[tid] = { credits_total: 0 };
          const credits = ti[tid].credits_total || 0;
          const totalMatches = count || 0;
          const avg = totalMatches > 0 ? credits / totalMatches : 0;
          const isOvr = ti[tid].tier_override && (!ti[tid].override_expires || new Date(ti[tid].override_expires) > new Date());
          ti[tid].totalMatches = totalMatches;
          ti[tid].avgAllMatches = avg;
          ti[tid].effectiveTier = isOvr ? ti[tid].tier_override : (avg >= FREE_PLUS_THRESHOLD ? 'free_plus' : 'free');
        })).then(() => setTierInfo({ ...ti }));
      }).catch(() => {});
    }
    setLoading(false);
  };

  const goToTeam = (team) => { window.location.hash = '#/team/' + teamSlug(team); };

  if (redirected || loading) {
    return (
      <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <KykieSpinner size={40} />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div style={S.app}>
        <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch}
          onBack={() => { window.location.hash = ''; }} />
        <div style={{ textAlign: "center", padding: 60, color: theme.textDim }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏑</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No teams assigned yet</div>
          <div style={{ fontSize: 11, marginTop: 4, color: '#64748B' }}>Ask your admin to assign you to a team.</div>
        </div>
      </div>
    );
  }

  // Multi-team picker
  return (
    <div style={S.app}>
      <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch}
        onBack={() => { window.location.hash = ''; }} />
      <div style={S.page}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 12 }}>Select a team</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {teams.map(team => {
            const ti = tierInfo[team.id];
            const avg = ti ? ti.avgAllMatches || 0 : 0;
            const tier = ti ? ti.effectiveTier || 'free' : 'free';
            const isPlus = tier === 'free_plus' || tier === 'premium';
            const color = isPlus ? '#F59E0B' : '#3B82F6';
            const label = tier === 'premium' ? 'Premium' : isPlus ? 'Free Plus' : 'Free';
            return (
              <div key={team.id} onClick={() => goToTeam(team)} style={{ background: theme.surface, borderRadius: 12, border: '1px solid ' + theme.border, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: (team.color || "#8B5CF6") + "22", border: '2px solid ' + (team.color || "#8B5CF6") + "44",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: team.color || "#8B5CF6",
                  }}>{team.short_name || teamInitial(team)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>
                      {teamDisplayName(team)} {(() => { const r = latestRankings[team.id]; return r ? <RankBadge rank={r.rank} prevRank={r.prevRank} /> : null; })()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 9, color: '#64748B' }}>
                        {avg > 0 ? Math.round(avg * 10) / 10 + ' avg credits/match' : 'No credit data yet'}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: color + '22', color: color }}>
                        {label}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: "#334155", fontSize: 16 }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 30, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: theme.textDimmer }}>v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}

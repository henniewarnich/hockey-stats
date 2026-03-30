import { teamShortName, teamDerivedName } from '../utils/teams.js';
import RankBadge from './RankBadge.jsx';

/**
 * Two-line match card team display (Option A):
 * Line 1: "Paarl Girls #23 vs PMB" (short names bold + ranks)
 * Line 2: "Girls Hockey 1st" (derived team name, muted)
 */
export default function MatchCardTeams({ home, away, homeRank, awayRank, homePrevRank, awayPrevRank }) {
  const derived = teamDerivedName(home);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>{teamShortName(home)}</span>
        {homeRank != null && <RankBadge rank={homeRank} prevRank={homePrevRank} />}
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>vs</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>{teamShortName(away)}</span>
        {awayRank != null && <RankBadge rank={awayRank} prevRank={awayPrevRank} />}
      </div>
      <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{derived}</div>
    </div>
  );
}

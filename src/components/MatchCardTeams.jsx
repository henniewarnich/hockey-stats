import { teamShortName, teamDerivedName } from '../utils/teams.js';
import RankBadge from './RankBadge.jsx';

/**
 * Two-line match card team display:
 * Line 1: "Paarl Girls #23 vs PMB #8" (short names bold + ranks)
 * Line 2: "Girls Hockey 1st · 26 Mar · Tournament @ St Mary's"
 */
export default function MatchCardTeams({ home, away, homeRank, awayRank, homePrevRank, awayPrevRank, meta }) {
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
      <div style={{ fontSize: 10, marginTop: 2, color: '#64748B' }}>
        <span style={{ color: '#94A3B8', fontWeight: 600 }}>{derived}</span>
        {meta && <span> · {meta}</span>}
      </div>
    </div>
  );
}

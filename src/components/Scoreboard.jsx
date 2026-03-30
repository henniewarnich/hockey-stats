import { fmt } from '../utils/helpers.js';
import { theme } from '../utils/styles.js';
import SponsorBanner from './SponsorBanner.jsx';
import { teamColor, teamShortName } from '../utils/teams.js';

export default function Scoreboard({ teams, homeGoals, awayGoals, matchTime, matchState, running, matchId }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "10px 14px 4px" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: teamColor(teams.home), textTransform: "uppercase" }}>
            {teamShortName(teams.home)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{homeGoals}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            fontSize: 20, fontWeight: 700, fontFamily: "monospace",
            color: matchState === "ended" ? theme.danger : theme.accent,
          }}>
            {fmt(matchTime)}
          </div>
          <div style={{
            fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 99, textTransform: "uppercase",
            background: matchState === "ended" ? theme.danger + "22"
              : running ? theme.success + "22" : theme.accent + "22",
            color: matchState === "ended" ? theme.danger
              : running ? theme.success : theme.accent,
          }}>
            {matchState === "ended" ? "Full Time"
              : running ? "● Live"
              : matchTime === 0 ? "Ready" : "Paused"}
          </div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: teamColor(teams.away), textTransform: "uppercase" }}>
            {teamShortName(teams.away)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{awayGoals}</div>
        </div>
      </div>
      {matchId && <SponsorBanner tier="match" targetId={matchId} size="sm" />}
    </div>
  );
}

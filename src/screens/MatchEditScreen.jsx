import { useState } from 'react';
import { MATCH_TYPES } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';
import { teamDisplayName, teamMatchesSearch } from '../utils/teams.js';

export default function MatchEditScreen({ game, teams, onSave, onBack }) {
  const [homeTeamId, setHomeTeamId] = useState(game.teams?.home?.id || null);
  const [awayTeamId, setAwayTeamId] = useState(game.teams?.away?.id || null);
  const [homeScore, setHomeScore] = useState(game.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(game.awayScore ?? 0);
  const [matchDate, setMatchDate] = useState(game.date ? new Date(game.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState(game.venue || "");
  const [matchType, setMatchType] = useState(game.matchType || "league");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredTeams = search.trim()
    ? teams.filter(t => teamMatchesSearch(t, search))
    : teams;

  const homeTeam = teams.find(t => t.id === homeTeamId) || game.teams?.home;
  const awayTeam = teams.find(t => t.id === awayTeamId) || game.teams?.away;

  const handleSave = () => {
    const updated = {
      ...game,
      teams: {
        home: homeTeam || game.teams.home,
        away: awayTeam || game.teams.away,
      },
      homeScore,
      awayScore,
      date: new Date(matchDate).toISOString(),
      venue: venue.trim(),
      matchType,
    };
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TeamSelector = ({ label, selectedId, onSelect, otherId }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 130, overflowY: "auto" }}>
        {filteredTeams.map(t => {
          const isSel = t.id === selectedId;
          const isOth = t.id === otherId;
          return (
            <button key={t.id} onClick={() => !isOth && onSelect(t.id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8,
              border: isSel ? `2px solid ${t.color}` : `1px solid ${theme.border}44`,
              background: isSel ? t.color + "22" : theme.surface,
              cursor: isOth ? "not-allowed" : "pointer", opacity: isOth ? 0.3 : 1,
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: t.color, flexShrink: 0 }} />
              <div style={{ fontWeight: 600, fontSize: 11, color: theme.text }}>{teamDisplayName(t)}</div>
              {isSel && <div style={{ marginLeft: "auto", fontSize: 11 }}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Edit Match</div><NavLogo />
      </div>
      <div style={S.page}>
        {/* Search */}
        <input style={{ ...S.input, fontSize: 12, marginBottom: 12 }} value={search}
          onChange={e => setSearch(e.target.value)} placeholder="🔍 Search teams..." />

        <TeamSelector label="Home Team" selectedId={homeTeamId} onSelect={setHomeTeamId} otherId={awayTeamId} />
        <TeamSelector label="Away Team" selectedId={awayTeamId} onSelect={setAwayTeamId} otherId={homeTeamId} />

        {/* Score */}
        <div style={{ background: theme.surface, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${theme.border}` }}>
          <label style={{ ...S.label, marginBottom: 10 }}>Score</label>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            {[[homeTeam, homeScore, setHomeScore], [awayTeam, awayScore, setAwayScore]].map(([t, sc, setSc], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t?.color || theme.textDim, marginBottom: 6 }}>{t?.name || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setSc(Math.max(0, sc - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>−</button>
                  <div style={{ fontSize: 28, fontWeight: 800, minWidth: 32, textAlign: "center", fontFamily: "monospace", color: t?.color || theme.text }}>{sc}</div>
                  <button onClick={() => setSc(sc + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Venue */}
        <div style={{ background: theme.surface, borderRadius: 12, padding: 14, marginBottom: 16, border: `1px solid ${theme.border}` }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Date</div>
            <input type="date" style={{ ...S.input, fontSize: 12 }} value={matchDate} onChange={e => setMatchDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Match Type</div>
            <div style={{ display: "flex", gap: 6 }}>
              {MATCH_TYPES.map(mt => (
                <button key={mt.id} onClick={() => setMatchType(mt.id)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: matchType === mt.id ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  background: matchType === mt.id ? theme.accent + "22" : theme.bg,
                  color: matchType === mt.id ? theme.accent : theme.textMuted, cursor: "pointer",
                }}>{mt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Venue</div>
            <input style={{ ...S.input, fontSize: 12 }} value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Paarl Girls High" />
          </div>
        </div>

        <button onClick={handleSave} style={{ ...S.btn(theme.accent, theme.bg), marginBottom: 8 }}>
          {saved ? "✓ Saved!" : "💾 Save Changes"}
        </button>

        <div style={{ fontSize: 9, color: theme.textDim, textAlign: "center" }}>
          {game.events?.length || 0} events recorded · Editing teams/score won't change event data
        </div>
      </div>
    </div>
  );
}

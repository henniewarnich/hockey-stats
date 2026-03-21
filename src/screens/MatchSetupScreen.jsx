import { useState } from 'react';
import { BREAK_FORMATS } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';

export default function MatchSetupScreen({ teams, onStart, onBack, onManageTeams }) {
  const [setupHome, setSetupHome] = useState(null);
  const [setupAway, setSetupAway] = useState(null);
  const [matchLength, setMatchLength] = useState(60);
  const [breakFormat, setBreakFormat] = useState("quarters");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));

  const canStart = setupHome && setupAway && setupHome.id !== setupAway?.id;

  const handleStart = () => {
    if (!canStart) return;
    onStart({
      home: setupHome,
      away: setupAway,
      matchLength: parseInt(matchLength) || 60,
      breakFormat,
      venue: venue.trim(),
      date: matchDate,
    });
  };

  const TeamPicker = ({ label, selected, onSelect, other }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {teams.map(t => {
          const isSel = selected?.id === t.id;
          const isOther = other?.id === t.id;
          return (
            <button key={t.id} onClick={() => !isOther && onSelect(t)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
              border: isSel ? `2px solid ${t.color}` : `1.5px solid ${theme.border}44`,
              background: isSel ? t.color + "22" : theme.surface,
              cursor: isOther ? "not-allowed" : "pointer", opacity: isOther ? 0.3 : 1,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: t.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: "#fff",
              }}>
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{t.name}</div>
              {isSel && <div style={{ marginLeft: "auto", fontSize: 14 }}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (teams.length < 2) {
    return (
      <div style={S.app}>
        <div style={S.nav}>
          <button style={S.backBtn} onClick={onBack}>←</button>
          <div style={S.navTitle}>New Match</div>
        </div>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 16 }}>You need at least 2 teams</div>
          <button style={S.btn(theme.accent, theme.bg)} onClick={onManageTeams}>Manage Teams</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>New Match</div>
      </div>
      <div style={S.page}>
        <TeamPicker label="Home Team" selected={setupHome} onSelect={setSetupHome} other={setupAway} />
        <TeamPicker label="Away Team" selected={setupAway} onSelect={setSetupAway} other={setupHome} />

        {/* Match Settings */}
        <div style={{ background: theme.surface, borderRadius: 12, padding: 14, marginBottom: 16, border: `1px solid ${theme.border}` }}>
          <label style={{ ...S.label, marginBottom: 10 }}>Match Settings</label>

          {/* Match Length */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Match Length (minutes)</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[40, 50, 60, 70].map(m => (
                <button key={m} onClick={() => setMatchLength(m)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: matchLength === m ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  background: matchLength === m ? theme.accent + "22" : theme.bg,
                  color: matchLength === m ? theme.accent : theme.textMuted,
                  cursor: "pointer",
                }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Break Format */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Break Format</div>
            <div style={{ display: "flex", gap: 6 }}>
              {BREAK_FORMATS.map(bf => (
                <button key={bf.id} onClick={() => setBreakFormat(bf.id)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: breakFormat === bf.id ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  background: breakFormat === bf.id ? theme.accent + "22" : theme.bg,
                  color: breakFormat === bf.id ? theme.accent : theme.textMuted,
                  cursor: "pointer",
                }}>
                  {bf.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 4 }}>
              {breakFormat === "quarters" ? `4 × ${Math.floor(matchLength / 4)} min periods`
                : breakFormat === "halves" ? `2 × ${Math.floor(matchLength / 2)} min halves`
                : `${matchLength} min continuous`}
            </div>
          </div>

          {/* Venue */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Venue</div>
            <input style={{ ...S.input, fontSize: 12 }} value={venue}
              onChange={e => setVenue(e.target.value)} placeholder="e.g. Paarl Girls High" />
          </div>

          {/* Date */}
          <div>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Date</div>
            <input type="date" style={{ ...S.input, fontSize: 12 }} value={matchDate}
              onChange={e => setMatchDate(e.target.value)} />
          </div>
        </div>

        <button style={{ ...S.btn(theme.accent, theme.bg), opacity: canStart ? 1 : 0.4, marginTop: 8 }}
          onClick={handleStart}>
          🏑 Start Match
        </button>
      </div>
    </div>
  );
}

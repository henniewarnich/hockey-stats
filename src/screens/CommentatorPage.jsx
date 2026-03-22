import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { BREAK_FORMATS } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import LiveMatchScreen from './LiveMatchScreen.jsx';

export default function CommentatorPage({ teamSlug, onBack }) {
  const [team, setTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Match setup state
  const [awayTeam, setAwayTeam] = useState(null);
  const [awaySearch, setAwaySearch] = useState("");
  const [matchLength, setMatchLength] = useState("60");
  const [breakFormat, setBreakFormat] = useState("quarters");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));

  // Match state
  const [matchConfig, setMatchConfig] = useState(null);
  const [matchEnded, setMatchEnded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: teams } = await supabase.from('teams').select('*');
      if (teams) {
        setAllTeams(teams);
        const found = teams.find(t => t.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') === teamSlug);
        if (found) {
          setTeam(found);
          setVenue(found.name); // default venue to home team
          // Check session
          const stored = sessionStorage.getItem(`commentator-${found.id}`);
          if (stored === 'true') setVerified(true);
        }
      }
      setLoading(false);
    };
    load();
  }, [teamSlug]);

  const handlePinSubmit = () => {
    if (!team) return;
    if (team.commentator_pin && pin === team.commentator_pin) {
      setVerified(true);
      sessionStorage.setItem(`commentator-${team.id}`, 'true');
      setPinError(false);
    } else if (!team.commentator_pin && pin.length >= 4) {
      setVerified(true);
      sessionStorage.setItem(`commentator-${team.id}`, 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveGame = (game) => {
    // Save is handled by LiveMatchScreen pushing to Supabase
    setMatchEnded(true);
    return game;
  };

  const handleNavigate = (target) => {
    if (target === "home") {
      setMatchConfig(null);
      setMatchEnded(false);
      setAwayTeam(null);
    }
  };

  const ml = parseInt(matchLength) || 60;
  const canStart = awayTeam && awayTeam.id !== team?.id;

  const filteredTeams = awaySearch.trim()
    ? allTeams.filter(t => t.name.toLowerCase().includes(awaySearch.toLowerCase()) && t.id !== team?.id)
    : allTeams.filter(t => t.id !== team?.id);

  // ── LOADING ──
  if (loading) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ color: "#64748B", fontSize: 14 }}>Loading...</div>
    </div>
  );

  // ── TEAM NOT FOUND ──
  if (!team) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🏑</div>
        <div style={{ fontSize: 16, color: "#94A3B8" }}>Team not found</div>
        {onBack && <button onClick={onBack} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#F59E0B", color: "#0B0F1A", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Go Back</button>}
      </div>
    </div>
  );

  // ── PIN GATE ──
  if (!verified) return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ width: 48, height: 48, borderRadius: 12, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{team.name.charAt(0)}</div>
      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{team.name}</div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>🎙 Commentator Login</div>
      <input value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinError(false); }}
        type="password" placeholder="Commentator PIN"
        style={{ width: 220, padding: 14, borderRadius: 10, border: pinError ? "2px solid #EF4444" : "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 20, textAlign: "center", letterSpacing: "0.3em", outline: "none" }}
        autoFocus onKeyDown={e => e.key === "Enter" && handlePinSubmit()} />
      {pinError && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>Incorrect PIN</div>}
      <button onClick={handlePinSubmit} style={{ marginTop: 16, padding: "12px 40px", borderRadius: 10, border: "none", background: "#F59E0B", color: "#0B0F1A", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Unlock</button>
      {onBack && <button onClick={onBack} style={{ marginTop: 12, background: "none", border: "none", color: "#64748B", fontSize: 11, cursor: "pointer" }}>← Back</button>}
    </div>
  );

  // ── LIVE MATCH IN PROGRESS ──
  if (matchConfig) return (
    <LiveMatchScreen matchConfig={matchConfig} onSaveGame={handleSaveGame} onNavigate={handleNavigate} />
  );

  // ── MATCH SETUP (commentator view — home pre-selected) ──
  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#E2E8F0", userSelect: "none" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>}
        <div style={{ width: 36, height: 36, borderRadius: 10, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{team.name.charAt(0)}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900 }}>{team.name}</div>
          <div style={{ fontSize: 10, color: "#10B981", fontWeight: 600 }}>🎙 Commentator</div>
        </div>
      </div>

      <div style={{ padding: "0 14px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: "#F8FAFC" }}>New Match</div>

        {/* Home team — locked */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 4 }}>Home Team</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: team.color + "22", border: `2px solid ${team.color}` }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{team.name.charAt(0)}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#F8FAFC" }}>{team.name}</div>
            <div style={{ marginLeft: "auto", fontSize: 10, color: "#64748B" }}>🔒</div>
          </div>
        </div>

        {/* Away team — searchable */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 4 }}>Away Team</div>
          <input style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 6 }}
            value={awaySearch} onChange={e => setAwaySearch(e.target.value)} placeholder="🔍 Search away team..." />
          <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredTeams.slice(0, 30).map(t => {
              const isSel = awayTeam?.id === t.id;
              return (
                <button key={t.id} onClick={() => setAwayTeam(t)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8,
                  border: isSel ? `2px solid ${t.color}` : "1px solid #33415544", background: isSel ? t.color + "22" : "#1E293B", cursor: "pointer",
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: t.color, flexShrink: 0 }} />
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#F8FAFC" }}>{t.name}</div>
                  {isSel && <div style={{ marginLeft: "auto", fontSize: 11 }}>✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Match settings */}
        <div style={{ background: "#1E293B", borderRadius: 12, padding: 14, marginBottom: 16, border: "1px solid #334155" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Match Length (minutes)</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="number" style={{ width: 70, padding: 8, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" }}
                value={matchLength} onChange={e => setMatchLength(e.target.value)} min="1" max="120" />
              {[40, 50, 60, 70].map(m => (
                <button key={m} onClick={() => setMatchLength(String(m))} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: ml === m ? "2px solid #F59E0B" : "1px solid #334155",
                  background: ml === m ? "#F59E0B22" : "#0B0F1A", color: ml === m ? "#F59E0B" : "#94A3B8", cursor: "pointer",
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Break Format</div>
            <div style={{ display: "flex", gap: 6 }}>
              {BREAK_FORMATS.map(bf => (
                <button key={bf.id} onClick={() => setBreakFormat(bf.id)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: breakFormat === bf.id ? "2px solid #F59E0B" : "1px solid #334155",
                  background: breakFormat === bf.id ? "#F59E0B22" : "#0B0F1A", color: breakFormat === bf.id ? "#F59E0B" : "#94A3B8", cursor: "pointer",
                }}>{bf.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Venue</div>
            <input style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              value={venue} onChange={e => setVenue(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Date</div>
            <input type="date" style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              value={matchDate} onChange={e => setMatchDate(e.target.value)} />
          </div>
        </div>

        <button disabled={!canStart} onClick={() => setMatchConfig({
          home: { name: team.name, color: team.color, id: team.id },
          away: { name: awayTeam.name, color: awayTeam.color, id: awayTeam.id },
          matchLength: ml, breakFormat, venue: venue.trim(), date: matchDate,
        })} style={{
          width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: canStart ? "pointer" : "not-allowed",
          background: canStart ? "#F59E0B" : "#334155", color: canStart ? "#0B0F1A" : "#64748B",
        }}>
          🏑 Start Match
        </button>
      </div>
    </div>
  );
}

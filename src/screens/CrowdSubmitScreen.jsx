import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { submitCrowdResult, submitCrowdUpcoming, suggestTeam } from '../utils/sync.js';
import { MATCH_TYPES } from '../utils/constants.js';
import { MATCH_AWAY_TEAM, MATCH_AWAY_TEAM_NAME, MATCH_HOME_TEAM, MATCH_HOME_TEAM_NAME, TEAM_SELECT, teamColor, teamDisplayName, teamMatchesSearch, teamSearchString, teamShortName } from '../utils/teams.js';

const TEAM_COLORS = ['#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#64748B'];

export default function CrowdSubmitScreen({ currentUser, onBack, initialMode }) {
  const [mode, setMode] = useState(initialMode || null); // 'result' | 'upcoming' | 'team'
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Match fields
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [homeSearch, setHomeSearch] = useState('');
  const [awaySearch, setAwaySearch] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState('');
  const [venue, setVenue] = useState('');
  const [matchType, setMatchType] = useState('league');
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Team suggestion fields
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#64748B');
  const [similarTeams, setSimilarTeams] = useState([]);

  useEffect(() => {
    supabase.from('teams').select(TEAM_SELECT).or('status.eq.active,status.is.null').order('name')
      .then(({ data }) => { if (data) setTeams(data); });
  }, []);

  // Fuzzy match: checks if words in input overlap with team names
  const findSimilarTeams = (name) => {
    if (!name || name.trim().length < 3) { setSimilarTeams([]); return; }
    const words = name.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 3);
    const matches = teams.filter(t => {
      const tName = teamSearchString(t);
      // Exact substring match
      if (tName.includes(name.toLowerCase().trim())) return true;
      // Any significant word matches
      return words.some(w => tName.includes(w));
    }).slice(0, 5);
    setSimilarTeams(matches);
  };

  // Check for duplicate match (same teams, same day, either home/away order)
  const checkDuplicate = async (homeId, awayId, date) => {
    const { data } = await supabase
      .from('matches')
      .select(`id, status, ${MATCH_HOME_TEAM_NAME}, ${MATCH_AWAY_TEAM_NAME}`)
      .eq('match_date', date)
      .or(`and(home_team_id.eq.${homeId},away_team_id.eq.${awayId}),and(home_team_id.eq.${awayId},away_team_id.eq.${homeId})`);
    if (data && data.length > 0) {
      setDuplicateWarning(`${teamShortName(data[0].home_team)} vs ${teamShortName(data[0].away_team)} already exists on this date (${data[0].status})`);
      return true;
    }
    setDuplicateWarning(null);
    return false;
  };

  const resetForm = () => {
    setHomeTeam(null); setAwayTeam(null);
    setHomeSearch(''); setAwaySearch('');
    setHomeScore(0); setAwayScore(0);
    setMatchDate(new Date().toISOString().slice(0, 10));
    setScheduledTime(''); setVenue(''); setMatchType('league');
    setTeamName(''); setTeamColor('#64748B');
    setError(''); setDuplicateWarning(null); setSimilarTeams([]);
  };

  const handleSubmitResult = async () => {
    if (!homeTeam || !awayTeam) { setError('Select both teams'); return; }
    if (homeTeam.id === awayTeam.id) { setError('Teams must be different'); return; }
    setLoading(true); setError('');
    const isDupe = await checkDuplicate(homeTeam.id, awayTeam.id, matchDate);
    if (isDupe) { setLoading(false); return; }
    const result = await submitCrowdResult({
      homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
      homeScore, awayScore, matchDate, venue, matchType,
      submittedBy: currentUser.id,
    });
    setLoading(false);
    if (result) { setSuccess('Result submitted for approval!'); resetForm(); setTimeout(() => setSuccess(''), 3000); }
    else setError('Failed to submit');
  };

  const handleSubmitUpcoming = async () => {
    if (!homeTeam || !awayTeam) { setError('Select both teams'); return; }
    if (homeTeam.id === awayTeam.id) { setError('Teams must be different'); return; }
    setLoading(true); setError('');
    const isDupe = await checkDuplicate(homeTeam.id, awayTeam.id, matchDate);
    if (isDupe) { setLoading(false); return; }
    const result = await submitCrowdUpcoming({
      homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
      matchDate, scheduledTime, venue, matchType,
      submittedBy: currentUser.id,
    });
    setLoading(false);
    if (result) { setSuccess('Match submitted for approval!'); resetForm(); setTimeout(() => setSuccess(''), 3000); }
    else setError('Failed to submit');
  };

  const handleSuggestTeam = async () => {
    if (!teamName.trim()) { setError('Team name is required'); return; }
    if (similarTeams.length > 0 && !confirm(`Similar teams exist: ${similarTeams.map(t => teamDisplayName(t)).join(', ')}. Submit anyway?`)) return;
    setLoading(true); setError('');
    const result = await suggestTeam({ name: teamName, color: teamColor, suggestedBy: currentUser.id });
    setLoading(false);
    if (result) { setSuccess('Team suggestion submitted!'); resetForm(); setTimeout(() => setSuccess(''), 3000); }
    else setError('Failed to submit');
  };

  const filteredTeams = (search) => teams.filter(t => teamMatchesSearch(t, search)).slice(0, 8);

  const labelStyle = { fontSize: 11, color: '#94A3B8', marginBottom: 4 };
  const inputStyle = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const btnStyle = (bg) => ({ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: bg, color: bg === '#F59E0B' ? '#0B0F1A' : '#F8FAFC', fontSize: 14, fontWeight: 700, cursor: 'pointer' });

  const renderTeamSelector = (label, value, search, setSearch, onSelect) => (
    <div style={{ marginBottom: 12 }}>
      <div style={labelStyle}>{label}</div>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, background: '#1E293B', border: '1px solid #334155' }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: teamColor(value) }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', flex: 1 }}>{teamDisplayName(value)}</div>
          <button onClick={() => { onSelect(null); setSearch(''); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..."
            style={{ ...inputStyle, marginBottom: 4 }} />
          {search.length >= 1 && (
            <div style={{ maxHeight: 120, overflowY: 'auto', borderRadius: 6, border: '1px solid #1E293B' }}>
              {filteredTeams(search).map(t => (
                <div key={t.id} onClick={() => { onSelect(t); setSearch(''); }}
                  style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#CBD5E1' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: teamColor(t) }} />
                  {teamDisplayName(t)}
                </div>
              ))}
              {filteredTeams(search).length === 0 && (
                <div style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>No teams found</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>CONTRIBUTE</div>
        <div style={{ fontSize: 9, color: '#64748B' }}>{currentUser.alias_nickname || currentUser.firstname}</div>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{ padding: 12, borderRadius: 8, background: '#10B98122', border: '1px solid #10B98144', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✅</span>
          <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>{success}</span>
        </div>
      )}

      {!mode ? (
        // ── MODE SELECTION ──
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>What would you like to submit?</div>

          <button onClick={() => { setMode('result'); resetForm(); }} style={{
            padding: 16, borderRadius: 12, border: '1px solid #334155', background: '#1E293B', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          }}>
            <span style={{ fontSize: 28 }}>🏆</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Submit a Result</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Add a match score that has been played</div>
            </div>
          </button>

          <button onClick={() => { setMode('upcoming'); resetForm(); }} style={{
            padding: 16, borderRadius: 12, border: '1px solid #334155', background: '#1E293B', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          }}>
            <span style={{ fontSize: 28 }}>📅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Add Upcoming Match</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Schedule a match that hasn't happened yet</div>
            </div>
          </button>

          <button onClick={() => { setMode('team'); resetForm(); }} style={{
            padding: 16, borderRadius: 12, border: '1px solid #334155', background: '#1E293B', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          }}>
            <span style={{ fontSize: 28 }}>🏫</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Suggest a Team</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Add a school team not yet in the system</div>
            </div>
          </button>

          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#475569' }}>
            All submissions are reviewed before publishing
          </div>
        </div>
      ) : mode === 'team' ? (
        // ── SUGGEST TEAM ──
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏫</span> Suggest a Team
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>Team / School Name *</div>
            <input value={teamName} onChange={e => { setTeamName(e.target.value); findSimilarTeams(e.target.value); }} placeholder="e.g. Stellenbosch Girls" style={inputStyle} />
            {similarTeams.length > 0 && (
              <div style={{ marginTop: 6, padding: 8, borderRadius: 6, background: '#F59E0B11', border: '1px solid #F59E0B33' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>Similar teams already exist:</div>
                {similarTeams.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11, color: '#94A3B8' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: teamColor(t) }} />
                    {teamDisplayName(t)}
                  </div>
                ))}
                <div style={{ fontSize: 9, color: '#64748B', marginTop: 4 }}>You can still submit — admin will review</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Team Color</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {TEAM_COLORS.map(c => (
                <div key={c} onClick={() => setTeamColor(c)} style={{
                  width: 30, height: 30, borderRadius: 8, background: c, cursor: 'pointer',
                  border: teamColor === c ? '3px solid #F8FAFC' : '3px solid transparent',
                }} />
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</div>}

          <button onClick={handleSuggestTeam} disabled={loading} style={btnStyle(loading ? '#334155' : '#F59E0B')}>
            {loading ? 'Submitting...' : 'Submit Team'}
          </button>
          <button onClick={() => setMode(null)} style={{ ...btnStyle('transparent'), border: '1px solid #334155', color: '#94A3B8', marginTop: 8 }}>
            ← Back
          </button>
        </div>
      ) : (
        // ── SUBMIT RESULT or UPCOMING ──
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{mode === 'result' ? '🏆' : '📅'}</span>
            {mode === 'result' ? 'Submit a Result' : 'Add Upcoming Match'}
          </div>

          {renderTeamSelector("Home Team *", homeTeam, homeSearch, setHomeSearch, setHomeTeam)}
          {renderTeamSelector("Away Team *", awayTeam, awaySearch, setAwaySearch, setAwayTeam)}

          {mode === 'result' && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>{teamShortName(homeTeam) || 'Home'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setHomeScore(Math.max(0, homeScore - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#F8FAFC', minWidth: 30, textAlign: 'center' }}>{homeScore}</div>
                  <button onClick={() => setHomeScore(homeScore + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#475569', fontWeight: 700, marginTop: 14 }}>vs</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>{teamShortName(awayTeam) || 'Away'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setAwayScore(Math.max(0, awayScore - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#F8FAFC', minWidth: 30, textAlign: 'center' }}>{awayScore}</div>
                  <button onClick={() => setAwayScore(awayScore + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Date *</div>
              <input value={matchDate} onChange={e => setMatchDate(e.target.value)} type="date" style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            {mode === 'upcoming' && (
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Time</div>
                <input value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} type="time" style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Venue</div>
              <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Paarl" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Type</div>
              <select value={matchType} onChange={e => setMatchType(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {MATCH_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</div>}

          {duplicateWarning && (
            <div style={{ padding: 10, borderRadius: 8, background: '#EF444422', border: '1px solid #EF444444', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', marginBottom: 2 }}>Possible duplicate</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{duplicateWarning}</div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>Change the date or teams, or check the existing match first.</div>
            </div>
          )}

          <button onClick={mode === 'result' ? handleSubmitResult : handleSubmitUpcoming} disabled={loading}
            style={btnStyle(loading ? '#334155' : '#F59E0B')}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
          <button onClick={() => setMode(null)} style={{ ...btnStyle('transparent'), border: '1px solid #334155', color: '#94A3B8', marginTop: 8 }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { registerUser } from '../utils/auth.js';
import { fetchTeams } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import { teamDisplayName, teamMatchesSearch } from '../utils/teams.js';

const SPORTS = [
  { id: 'hockey', label: 'Hockey', emoji: '🏑' },
  { id: 'rugby', label: 'Rugby', emoji: '🏉' },
  { id: 'netball', label: 'Netball', emoji: '🏐' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields
  const [alias, setAlias] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState('');
  const [hometown, setHometown] = useState('');
  const [sportInterest, setSportInterest] = useState([]);
  const [supportingTeams, setSupportingTeams] = useState([]);

  // Role selection
  const [regRole, setRegRole] = useState('supporter'); // 'supporter' | 'commentator' | 'coach'
  const [selectedSport, setSelectedSport] = useState(''); // single sport for commentator/coach
  const [coachTeamId, setCoachTeamId] = useState(null);
  const [coachTeamSearch, setCoachTeamSearch] = useState('');

  // Notifications & T&C
  const [notifyLive, setNotifyLive] = useState(true);
  const [notifyRewards, setNotifyRewards] = useState(true);
  const [notifyGeneral, setNotifyGeneral] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const username = `${firstname.trim().toLowerCase()}.${lastname.trim().toLowerCase()}`.replace(/[^a-z0-9.]/g, '');

  useEffect(() => {
    fetchTeams().then(t => { if (t) setTeams(t); });
  }, []);

  const validateStep1 = () => {
    if (!firstname.trim()) return 'First name is required';
    if (!lastname.trim()) return 'Last name is required';
    if (!email.trim() || !email.includes('@')) return 'Valid email is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPw) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!acceptedTerms) { setError('You must accept the Terms & Conditions'); return; }
    if (regRole === 'commentator' && !selectedSport) { setError('Please select a sport'); return; }
    if (regRole === 'coach' && !selectedSport) { setError('Please select a sport'); return; }
    if (regRole === 'coach' && !coachTeamId) { setError('Please select a team'); return; }
    setLoading(true);
    setError('');
    const result = await registerUser({
      email: email.trim().toLowerCase(),
      password,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      username,
      role: regRole,
      alias_nickname: alias || null,
      date_of_birth: dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth.padStart(2,'0')}-${dobDay.padStart(2,'0')}` : null,
      biological_gender: gender || null,
      home_town: hometown || null,
      sport_interest: regRole === 'supporter' ? sportInterest : [selectedSport],
      supporting_team_ids: supportingTeams,
      teamId: regRole === 'coach' ? coachTeamId : null,
      notify_live: notifyLive,
      notify_rewards: notifyRewards,
      notify_general: notifyGeneral,
      accepted_terms_at: new Date().toISOString(),
    });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  };

  const toggleSport = (id) => {
    setSportInterest(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleTeam = (id) => {
    setSupportingTeams(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const filteredTeams = teams.filter(t =>
    teamMatchesSearch(t, teamSearch)
  );

  const coachFilteredTeams = teams.filter(t =>
    t.sport?.toLowerCase() === selectedSport.toLowerCase() &&
    teamMatchesSearch(t, coachTeamSearch)
  ).slice(0, 8);

  const inputStyle = (hasError) => ({
    width: '100%', padding: 12, borderRadius: 10,
    border: hasError ? '2px solid #EF4444' : '1px solid #334155',
    background: '#1E293B', color: '#F8FAFC', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  });

  const labelStyle = { fontSize: 11, color: '#94A3B8', marginBottom: 4 };

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 20, paddingTop: 40,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ marginBottom: 8 }}>
        <svg width="36" height="36" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
          <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
          <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B', marginBottom: 2 }}>kykie</div>

      {done ? (
        // ── SUCCESS ──
        <div style={{ textAlign: 'center', maxWidth: 280, marginTop: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>Almost there!</div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            We sent a confirmation link to <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{email}</span>. Click the link to activate your account.
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 10 }}>
            Can't find it? Check your spam or junk folder.
          </div>
          <button onClick={() => { window.location.hash = '#/login'; }} style={{
            marginTop: 24, background: '#F59E0B', border: 'none', borderRadius: 10, padding: '12px 24px',
            color: '#0B0F1A', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Go to Sign In</button>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 20 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F59E0B', color: '#0B0F1A',
            }}>1</div>
            <div style={{ width: 30, height: 2, background: step >= 2 ? '#F59E0B' : '#334155' }} />
            <div style={{
              width: 24, height: 24, borderRadius: 12, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= 2 ? '#F59E0B' : '#334155',
              color: step >= 2 ? '#0B0F1A' : '#64748B',
            }}>2</div>
          </div>

          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>
            {step === 1 ? 'Create your account' : 'Tell us about yourself'}
          </div>

          {step === 1 ? (
            // ── STEP 1: ACCOUNT ──
            <div style={{ width: '100%', maxWidth: 280 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>First Name *</div>
                  <input value={firstname} onChange={e => { setFirstname(e.target.value); setError(''); }}
                    placeholder="John" autoFocus style={inputStyle()} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Last Name *</div>
                  <input value={lastname} onChange={e => { setLastname(e.target.value); setError(''); }}
                    placeholder="Smith" style={inputStyle()} />
                </div>
              </div>

              {firstname && lastname && (
                <div style={{ marginBottom: 12 }}>
                  <div style={labelStyle}>Username (auto-generated)</div>
                  <div style={{
                    padding: 12, borderRadius: 10, background: '#1E293B', border: '1px solid #334155',
                    color: '#10B981', fontSize: 14, fontWeight: 600,
                  }}>{username}</div>
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Email Address *</div>
                <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="your.email@school.co.za" type="email" autoCapitalize="none"
                  style={inputStyle()} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Password *</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
                    style={{ ...inputStyle(), flex: 1, width: 'auto' }} />
                  <button onClick={() => setShowPassword(p => !p)} style={{
                    background: 'none', border: '1px solid #334155', borderRadius: 10, padding: '0 12px',
                    cursor: 'pointer', color: '#64748B', fontSize: 14,
                  }}>{showPassword ? '🙈' : '👁'}</button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Confirm Password *</div>
                <input value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                  type={showPassword ? 'text' : 'password'} placeholder="Re-enter password"
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  style={inputStyle()} />
              </div>

              {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12, textAlign: 'center' }}>{error}</div>}

              <button onClick={handleNext} style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none',
                background: '#F59E0B', color: '#0B0F1A', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>Next →</button>
            </div>
          ) : (
            // ── STEP 2: PROFILE ──
            <div style={{ width: '100%', maxWidth: 280 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Alias / Nickname</div>
                <input value={alias} onChange={e => setAlias(e.target.value)}
                  placeholder="How others will see you" style={inputStyle()} />
                <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>Shown publicly instead of your real name</div>
              </div>

              {/* Role selection */}
              <div style={{ marginBottom: 14 }}>
                <div style={labelStyle}>I want to register as *</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'supporter', label: 'Supporter', icon: '👀', desc: 'Follow matches' },
                    { id: 'commentator', label: 'Commentator', icon: '🎙️', desc: 'Record live stats' },
                    { id: 'coach', label: 'Coach', icon: '📋', desc: 'Team analytics' },
                  ].map(r => (
                    <button key={r.id} onClick={() => { setRegRole(r.id); setSelectedSport(''); setCoachTeamId(null); setCoachTeamSearch(''); }}
                      style={{
                        flex: 1, padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                        border: regRole === r.id ? '2px solid #F59E0B' : '1px solid #334155',
                        background: regRole === r.id ? '#F59E0B11' : '#1E293B',
                        color: regRole === r.id ? '#F59E0B' : '#94A3B8',
                        fontSize: 10, fontWeight: regRole === r.id ? 700 : 500,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      }}>
                      <span style={{ fontSize: 18 }}>{r.icon}</span>
                      {r.label}
                      <span style={{ fontSize: 8, color: regRole === r.id ? '#F59E0B88' : '#47556988' }}>{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sport selection (commentator + coach) */}
              {(regRole === 'commentator' || regRole === 'coach') && (
                <div style={{ marginBottom: 14 }}>
                  <div style={labelStyle}>Sport *</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {SPORTS.map(s => (
                      <button key={s.id} onClick={() => { if (s.id === 'hockey') { setSelectedSport(s.id); setCoachTeamId(null); setCoachTeamSearch(''); } }}
                        style={{
                          flex: 1, padding: '10px 6px', borderRadius: 10, cursor: s.id === 'hockey' ? 'pointer' : 'not-allowed',
                          border: selectedSport === s.id ? '2px solid #F59E0B' : '1px solid #334155',
                          background: selectedSport === s.id ? '#F59E0B11' : '#1E293B',
                          color: selectedSport === s.id ? '#F59E0B' : s.id === 'hockey' ? '#94A3B8' : '#334155',
                          opacity: s.id === 'hockey' ? 1 : 0.4,
                          fontSize: 12, fontWeight: selectedSport === s.id ? 700 : 500,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        }}>
                        <span style={{ fontSize: 18 }}>{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Team selection (coach only) */}
              {regRole === 'coach' && selectedSport && (
                <div style={{ marginBottom: 14 }}>
                  <div style={labelStyle}>My Team *</div>
                  {coachTeamId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, background: '#1E293B', border: '1px solid #10B98144' }}>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>
                        {teamDisplayName(teams.find(t => t.id === coachTeamId) || {})}
                      </div>
                      <button onClick={() => { setCoachTeamId(null); setCoachTeamSearch(''); }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 14, cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div>
                      <input value={coachTeamSearch} onChange={e => setCoachTeamSearch(e.target.value)}
                        placeholder="🔍 Search teams..." style={inputStyle()} />
                      {coachTeamSearch.trim().length >= 2 && (
                        <div style={{ maxHeight: 140, overflowY: 'auto', borderRadius: 6, border: '1px solid #1E293B', marginTop: 4 }}>
                          {coachFilteredTeams.length === 0 && (
                            <div style={{ padding: 10, fontSize: 11, color: '#475569', textAlign: 'center' }}>No teams found for {selectedSport}</div>
                          )}
                          {coachFilteredTeams.map(t => (
                            <div key={t.id} onClick={() => { setCoachTeamId(t.id); setCoachTeamSearch(''); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #1E293B22', fontSize: 12, color: '#CBD5E1' }}>
                              <div style={{ width: 10, height: 10, borderRadius: 5, background: t.institution?.color || t.color || '#64748B' }} />
                              {teamDisplayName(t)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>Your team assignment will need admin approval</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Date of Birth</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <select value={dobDay} onChange={e => setDobDay(e.target.value)}
                      style={{ ...inputStyle(), flex: 1, appearance: 'auto', padding: '10px 4px' }}>
                      <option value="">DD</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select value={dobMonth} onChange={e => setDobMonth(e.target.value)}
                      style={{ ...inputStyle(), flex: 1.3, appearance: 'auto', padding: '10px 4px' }}>
                      <option value="">Month</option>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select value={dobYear} onChange={e => setDobYear(e.target.value)}
                      style={{ ...inputStyle(), flex: 1.2, appearance: 'auto', padding: '10px 4px' }}>
                      <option value="">Year</option>
                      {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Gender</div>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    style={{ ...inputStyle(), appearance: 'auto' }}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Home Town</div>
                <input value={hometown} onChange={e => setHometown(e.target.value)}
                  placeholder="e.g. Paarl" style={inputStyle()} />
              </div>

              {/* Sport interests (supporters only — commentator/coach select sport above) */}
              {regRole === 'supporter' && (
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Sports I Follow</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {SPORTS.map(s => {
                    const active = sportInterest.includes(s.id);
                    return (
                      <button key={s.id} onClick={() => toggleSport(s.id)} style={{
                        flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                        border: active ? '2px solid #F59E0B' : '1px solid #334155',
                        background: active ? '#F59E0B11' : '#1E293B',
                        color: active ? '#F59E0B' : '#94A3B8',
                        fontSize: 12, fontWeight: active ? 700 : 500,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      }}>
                        <span style={{ fontSize: 18 }}>{s.emoji}</span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Supporting teams */}
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Teams I Support</div>
                <input value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
                  placeholder="🔍 Search teams..." style={{ ...inputStyle(), marginTop: 4, marginBottom: 6 }} />
                <div style={{
                  maxHeight: 140, overflowY: 'auto', borderRadius: 8,
                  border: '1px solid #1E293B',
                }}>
                  {filteredTeams.length === 0 && (
                    <div style={{ padding: 10, fontSize: 11, color: '#475569', textAlign: 'center' }}>No teams found</div>
                  )}
                  {filteredTeams.map(t => {
                    const active = supportingTeams.includes(t.id);
                    return (
                      <div key={t.id} onClick={() => toggleTeam(t.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                        cursor: 'pointer', borderBottom: '1px solid #1E293B11',
                        background: active ? (t.color || '#F59E0B') + '15' : 'transparent',
                      }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: 5, flexShrink: 0,
                          background: t.color || '#64748B',
                          border: active ? '2px solid #F8FAFC' : '2px solid transparent',
                        }} />
                        <div style={{ fontSize: 12, color: active ? '#F8FAFC' : '#94A3B8', fontWeight: active ? 700 : 400, flex: 1 }}>
                          {teamDisplayName(t)}
                        </div>
                        {active && <span style={{ fontSize: 12, color: '#10B981' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
                {supportingTeams.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {supportingTeams.map(tid => {
                      const t = teams.find(x => x.id === tid);
                      return t ? (
                        <span key={tid} onClick={() => toggleTeam(tid)} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 99, cursor: 'pointer',
                          background: (t.color || '#64748B') + '33', color: t.color || '#94A3B8',
                          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                          {teamDisplayName(t)} ✕
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div style={{ marginBottom: 14 }}>
                <div style={labelStyle}>Notifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#CBD5E1' }}>
                    <input type="checkbox" checked={notifyLive} onChange={e => setNotifyLive(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#F59E0B' }} />
                    Notify me when a live match starts for my teams
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#CBD5E1' }}>
                    <input type="checkbox" checked={notifyRewards} onChange={e => setNotifyRewards(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#F59E0B' }} />
                    Notify me about rewards and credit updates
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#CBD5E1' }}>
                    <input type="checkbox" checked={notifyGeneral} onChange={e => setNotifyGeneral(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#F59E0B' }} />
                    Feature updates and general announcements
                  </label>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12, color: '#CBD5E1' }}>
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#F59E0B', marginTop: 2, flexShrink: 0 }} />
                  <span>
                    I accept the{' '}
                    <span onClick={e => { e.preventDefault(); setShowTerms(true); }}
                      style={{ color: '#F59E0B', textDecoration: 'underline', cursor: 'pointer' }}>
                      Terms & Conditions
                    </span> *
                  </span>
                </label>
              </div>

              {/* T&C popup */}
              {showTerms && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                  onClick={() => setShowTerms(false)}>
                  <div onClick={e => e.stopPropagation()} style={{
                    background: '#1E293B', borderRadius: 12, padding: 20, maxWidth: 360, maxHeight: '80vh',
                    overflowY: 'auto', border: '1px solid #334155', width: '100%',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Terms & Conditions</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {`By creating an account on kykie.net, you agree to the following terms.

1. About Kykie
Kykie.net is a platform for recording, viewing, and analysing school sport match statistics.

2. Accounts
You must provide accurate information during registration. You are responsible for keeping your login credentials secure. One account per person.

3. User-Generated Content
Match statistics and scores you submit become part of the Kykie platform. You grant Kykie a non-exclusive, royalty-free licence to use and display this content. You must not submit false or deliberately inaccurate data.

4. Credits & Rewards
Credits are earned through platform activity. Credits have no cash value and cannot be transferred. Vouchers are issued at Kykie's discretion. Kykie reserves the right to modify credit values and thresholds at any time.

5. Privacy & Data
We collect personal information you provide during registration. Match data is publicly visible. We do not sell your personal information to third parties. You can request deletion of your account by contacting us.

6. Notifications
You may opt in to receive notifications about live matches and rewards. You can change preferences at any time.

7. Acceptable Use
You must not manipulate scores, credits, or rankings; harass other users; or use the platform for any unlawful purpose.

8. Disclaimers
Kykie is provided "as is" without warranties. Match statistics are user-generated and may contain inaccuracies.

9. Governing Law
These terms are governed by the laws of the Republic of South Africa.

Full terms: kykie.net/terms.md | Contact: info@kykie.net`}
                    </div>
                    <button onClick={() => { setShowTerms(false); setAcceptedTerms(true); }} style={{
                      width: '100%', marginTop: 12, padding: 10, borderRadius: 8, border: 'none',
                      background: '#F59E0B', color: '#0B0F1A', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>I Accept</button>
                    <button onClick={() => setShowTerms(false)} style={{
                      width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #334155',
                      background: 'none', color: '#94A3B8', fontSize: 11, cursor: 'pointer',
                    }}>Close</button>
                  </div>
                </div>
              )}

              {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12, textAlign: 'center' }}>{error}</div>}

              <button onClick={handleRegister} disabled={loading} style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none',
                background: loading ? '#334155' : '#10B981', color: loading ? '#64748B' : '#F8FAFC',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <button onClick={() => { setStep(1); setError(''); }} style={{
                width: '100%', marginTop: 8, padding: 10, borderRadius: 10, border: '1px solid #334155',
                background: 'none', color: '#94A3B8', fontSize: 12, cursor: 'pointer',
              }}>← Back</button>
            </div>
          )}

          <button onClick={() => { window.location.hash = '#/login'; }} style={{
            marginTop: 16, background: 'none', border: 'none', color: '#475569', fontSize: 10,
            cursor: 'pointer', textDecoration: 'underline',
          }}>Already have an account? Sign In</button>
        </>
      )}

      <div style={{ marginTop: 20, fontSize: 9, color: '#334155' }}>v{APP_VERSION}</div>
    </div>
  );
}

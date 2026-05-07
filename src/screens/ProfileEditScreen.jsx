import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { fetchInstitutions } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import PageHeader from '../components/PageHeader.jsx';
import KykieSpinner from '../components/KykieSpinner.jsx';

const SPORTS = [
  { id: 'hockey', label: 'Hockey', emoji: '🏑' },
  { id: 'rugby', label: 'Rugby', emoji: '🏉' },
  { id: 'netball', label: 'Netball', emoji: '🏐' },
];

export default function ProfileEditScreen({ currentUser, onLogout, onRoleSwitch, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState('');
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [instSearch, setInstSearch] = useState('');

  // Editable fields
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [aliasNickname, setAliasNickname] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [homeTown, setHomeTown] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [sportInterest, setSportInterest] = useState([]);
  const [supportingInsts, setSupportingInsts] = useState([]);
  const [notifyLive, setNotifyLive] = useState(true);
  const [notifyRewards, setNotifyRewards] = useState(true);
  const [notifyGeneral, setNotifyGeneral] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchInstitutions().then(setAllInstitutions).catch(() => {});
    supabase.from('profiles').select('*').eq('id', currentUser.id).single().then(({ data, error }) => {
      if (error || !data) { setError('Could not load your profile'); setLoading(false); return; }
      setFirstname(data.firstname || '');
      setLastname(data.lastname || '');
      setAliasNickname(data.alias_nickname || '');
      setMobileNumber(data.mobile_number || '');
      setHomeTown(data.home_town || '');
      setDob(data.date_of_birth || '');
      setGender(data.biological_gender || '');
      setSportInterest(data.sport_interest || []);
      setSupportingInsts(data.supporting_institution_ids || []);
      setNotifyLive(data.notify_live !== false);
      setNotifyRewards(data.notify_rewards !== false);
      setNotifyGeneral(data.notify_general !== false);
      setLoading(false);
    });
  }, [currentUser?.id]);

  const handleSave = async () => {
    if (!currentUser?.id) return;
    if (!firstname.trim() || !lastname.trim()) { setError('First name and last name are required'); return; }
    setSaving(true); setError('');
    const { error: err } = await supabase.from('profiles').update({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      alias_nickname: aliasNickname.trim() || null,
      mobile_number: mobileNumber.trim() || null,
      home_town: homeTown.trim() || null,
      date_of_birth: dob || null,
      biological_gender: gender || null,
      sport_interest: sportInterest,
      supporting_institution_ids: supportingInsts,
      notify_live: notifyLive,
      notify_rewards: notifyRewards,
      notify_general: notifyGeneral,
    }).eq('id', currentUser.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const toggleSport = (id) => {
    setSportInterest(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <KykieSpinner size={40} />
      </div>
    );
  }

  const labelStyle = { fontSize: 11, color: theme.textDim, marginBottom: 4 };
  const filteredInsts = allInstitutions.filter(i =>
    !supportingInsts.includes(i.id) &&
    (i.name?.toLowerCase().includes(instSearch.toLowerCase()) || i.short_name?.toLowerCase().includes(instSearch.toLowerCase()))
  ).slice(0, 30);

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch} onBack={onBack} />
      <div style={{ padding: '14px 16px 30px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>My Profile</div>
        <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 16 }}>Update your details. Email, username and role are managed by an admin.</div>

        {/* Read-only basics */}
        <div style={{ marginBottom: 14, background: theme.surface, borderRadius: 10, padding: '8px 12px', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <div style={{ fontSize: 10, color: theme.textDim, flex: '0 0 90px' }}>Email</div>
            <div style={{ fontSize: 12, color: theme.text, flex: 1, wordBreak: 'break-all' }}>{currentUser.email}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <div style={{ fontSize: 10, color: theme.textDim, flex: '0 0 90px' }}>Username</div>
            <div style={{ fontSize: 12, color: '#F59E0B', flex: 1 }}>{currentUser.username}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>First Name</div>
            <input style={S.input} value={firstname} onChange={e => setFirstname(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Last Name</div>
            <input style={S.input} value={lastname} onChange={e => setLastname(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Nickname / Alias <span style={{ color: '#475569' }}>(optional)</span></div>
          <input style={S.input} value={aliasNickname} onChange={e => setAliasNickname(e.target.value)} placeholder="e.g. Hennie" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Mobile Number</div>
          <input style={S.input} type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="e.g. 082 123 4567" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>Home Town</div>
          <input style={S.input} value={homeTown} onChange={e => setHomeTown(e.target.value)} placeholder="e.g. Paarl" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Date of Birth</div>
            <input style={S.input} type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Gender</div>
            <select style={{ ...S.input, appearance: 'auto' }} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Sport Interest</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SPORTS.map(s => {
              const on = sportInterest.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSport(s.id)} style={{
                  flex: 1, padding: '8px 6px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: on ? '2px solid #F59E0B' : `1px solid ${theme.border}`,
                  background: on ? '#F59E0B22' : theme.bg, color: on ? '#F59E0B' : theme.textMuted, cursor: 'pointer',
                }}>{s.emoji} {s.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Supporting Institutions</div>
          {supportingInsts.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {supportingInsts.map(id => {
                const inst = allInstitutions.find(i => i.id === id);
                if (!inst) return null;
                return (
                  <span key={id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: '#3B82F622', color: '#3B82F6', border: '1px solid #3B82F644',
                  }}>
                    {inst.short_name || inst.name}
                    <span onClick={() => setSupportingInsts(prev => prev.filter(x => x !== id))}
                      style={{ cursor: 'pointer', marginLeft: 2, fontSize: 13, lineHeight: 1 }}>×</span>
                  </span>
                );
              })}
            </div>
          )}
          <input style={{ ...S.input, fontSize: 12 }} value={instSearch} onChange={e => setInstSearch(e.target.value)}
            placeholder="🔍 Search institutions to add..." />
          {instSearch.trim() && (
            <div style={{ maxHeight: 140, overflowY: 'auto', marginTop: 4, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg }}>
              {filteredInsts.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: 11, color: theme.textDim }}>No matches</div>
              ) : filteredInsts.map(i => (
                <div key={i.id} onClick={() => { setSupportingInsts(prev => [...prev, i.id]); setInstSearch(''); }}
                  style={{ padding: '8px 12px', fontSize: 12, color: theme.text, cursor: 'pointer', borderBottom: `1px solid ${theme.border}` }}>
                  {i.short_name ? `${i.short_name} — ${i.name}` : i.name}
                </div>
              ))}
            </div>
          )}
          {currentUser.role === 'commentator' && (
            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 6 }}>
              Determines which matches you can reserve and which coaches can find you when assigning commentators.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Notification Preferences</div>
          {[
            { key: 'live', label: 'Live match alerts', value: notifyLive, set: setNotifyLive },
            { key: 'rewards', label: 'Rewards & vouchers', value: notifyRewards, set: setNotifyRewards },
            { key: 'general', label: 'General announcements', value: notifyGeneral, set: setNotifyGeneral },
          ].map(n => (
            <div key={n.key} onClick={() => n.set(!n.value)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
              background: theme.surface, border: `1px solid ${theme.border}`,
            }}>
              <div style={{ fontSize: 12, color: theme.text }}>{n.label}</div>
              <div style={{
                width: 36, height: 20, borderRadius: 10, position: 'relative',
                background: n.value ? '#10B981' : '#334155', transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: n.value ? 18 : 2,
                  width: 16, height: 16, borderRadius: 8, background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 10, textAlign: 'center' }}>{error}</div>}
        {savedFlash && <div style={{ fontSize: 11, color: '#10B981', marginBottom: 10, textAlign: 'center' }}>✓ Profile saved</div>}

        <button onClick={handleSave} disabled={saving}
          style={{ ...S.btn(theme.accent, theme.bg), opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 9, color: theme.textDimmer }}>v{APP_VERSION}</div>
      </div>
    </div>
  );
}

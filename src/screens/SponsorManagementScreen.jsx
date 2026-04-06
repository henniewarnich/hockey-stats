import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';
import { logAudit } from '../utils/audit.js';
import { MATCH_AWAY_TEAM, MATCH_AWAY_TEAM_NAME, MATCH_HOME_TEAM, MATCH_HOME_TEAM_NAME, TEAM_SELECT, teamDisplayName, teamShortName } from '../utils/teams.js';

const TIERS = [
  { id: 'platform', label: 'Platform', color: '#F59E0B', desc: 'Landing page + all embeds' },
  { id: 'team', label: 'Team', color: '#3B82F6', desc: 'Specific team page' },
  { id: 'match', label: 'Match', color: '#10B981', desc: 'Specific match scoreboard' },
];

export default function SponsorManagementScreen({ onBack }) {
  const [sponsors, setSponsors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, 'new' = create, sponsor obj = edit
  const [saving, setSaving] = useState(false);
  const [sponsorStats, setSponsorStats] = useState({}); // { sponsorId: { impressions, clicks } }

  // Form state
  const [name, setName] = useState('');
  const [tier, setTier] = useState('platform');
  const [targetId, setTargetId] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: t }, { data: m }] = await Promise.all([
      supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
      supabase.from('teams').select(TEAM_SELECT).or('status.eq.active,status.is.null').order('name'),
      supabase.from('matches').select(`id, ${MATCH_HOME_TEAM_NAME}, ${MATCH_AWAY_TEAM_NAME}, match_date, status`).in('status', ['upcoming', 'live']).order('match_date'),
    ]);
    setSponsors(s || []);
    setTeams(t || []);
    setMatches(m || []);

    // Fetch impression/click stats per sponsor
    if (s?.length > 0) {
      const ids = s.map(sp => sp.id);
      const stats = {};
      for (const id of ids) {
        const [{ count: imp }, { count: clk }] = await Promise.all([
          supabase.from('sponsor_impressions').select('id', { count: 'exact', head: true }).eq('sponsor_id', id),
          supabase.from('sponsor_clicks').select('id', { count: 'exact', head: true }).eq('sponsor_id', id),
        ]);
        stats[id] = { impressions: imp || 0, clicks: clk || 0 };
      }
      setSponsorStats(stats);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName(''); setTier('platform'); setTargetId(''); setWebsiteUrl('');
    setStartDate(''); setEndDate(''); setActive(true);
    setLogoFile(null); setLogoPreview(null); setExistingLogo(null);
  };

  const startEdit = (sponsor) => {
    setEditing(sponsor);
    setName(sponsor.name);
    setTier(sponsor.tier);
    setTargetId(sponsor.target_id || '');
    setWebsiteUrl(sponsor.website_url || '');
    setStartDate(sponsor.start_date || '');
    setEndDate(sponsor.end_date || '');
    setActive(sponsor.active);
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogo(sponsor.logo_url);
  };

  const startNew = () => {
    resetForm();
    setEditing('new');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (file, sponsorId) => {
    const ext = file.name.split('.').pop();
    const path = `${sponsorId}.${ext}`;
    // Delete existing logo files for this sponsor
    const { data: existing } = await supabase.storage.from('sponsor-logos').list('', { search: sponsorId });
    if (existing?.length > 0) {
      await supabase.storage.from('sponsor-logos').remove(existing.map(f => f.name));
    }
    const { error } = await supabase.storage.from('sponsor-logos').upload(path, file, { upsert: true });
    if (error) { console.error('Logo upload error:', error); return null; }
    const { data } = supabase.storage.from('sponsor-logos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const isNew = editing === 'new';
    const id = isNew ? undefined : editing.id;

    try {
      let logoUrl = isNew ? null : existingLogo;

      if (isNew) {
        // Insert first to get ID for logo path
        const { data: inserted, error } = await supabase.from('sponsors').insert({
          name: name.trim(), tier, target_id: (tier === 'platform' ? null : targetId || null),
          website_url: websiteUrl.trim() || null, start_date: startDate || null, end_date: endDate || null, active,
        }).select().single();
        if (error) throw error;

        if (logoFile) {
          logoUrl = await uploadLogo(logoFile, inserted.id);
          if (logoUrl) {
            await supabase.from('sponsors').update({ logo_url: logoUrl }).eq('id', inserted.id);
          }
        }
        await logAudit('sponsor_create', 'sponsor', inserted.id, { name: name.trim(), tier });
      } else {
        if (logoFile) {
          logoUrl = await uploadLogo(logoFile, id);
        }
        const { error } = await supabase.from('sponsors').update({
          name: name.trim(), tier, target_id: (tier === 'platform' ? null : targetId || null),
          logo_url: logoUrl, website_url: websiteUrl.trim() || null,
          start_date: startDate || null, end_date: endDate || null, active,
        }).eq('id', id);
        if (error) throw error;
        await logAudit('sponsor_update', 'sponsor', id, { name: name.trim(), tier });
      }

      setEditing(null);
      resetForm();
      load();
    } catch (err) {
      console.error('Save sponsor error:', err);
      alert('Failed to save sponsor');
    }
    setSaving(false);
  };

  const handleDelete = async (sponsor) => {
    if (!confirm(`Delete sponsor "${sponsor.name}"?`)) return;
    // Delete logo from storage
    if (sponsor.logo_url) {
      const path = sponsor.logo_url.split('/sponsor-logos/')[1];
      if (path) await supabase.storage.from('sponsor-logos').remove([path]);
    }
    await supabase.from('sponsors').delete().eq('id', sponsor.id);
    await logAudit('sponsor_delete', 'sponsor', sponsor.id, { name: sponsor.name });
    load();
  };

  const handleToggleActive = async (sponsor) => {
    await supabase.from('sponsors').update({ active: !sponsor.active }).eq('id', sponsor.id);
    load();
  };

  // ── EDIT/CREATE FORM ──
  if (editing) {
    const isNew = editing === 'new';
    const showTarget = tier === 'team' || tier === 'match';
    const currentLogo = logoPreview || existingLogo;

    return (
      <div style={S.app}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setEditing(null); resetForm(); }} style={{ background: "none", border: "none", color: "#64748B", fontSize: 16, cursor: "pointer", padding: 0 }}>←</button>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{isNew ? 'Add Sponsor' : 'Edit Sponsor'}</div>
        </div>
        <div style={S.page}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {currentLogo ? (
              <img src={currentLogo} alt="Logo" style={{ maxWidth: 160, maxHeight: 80, borderRadius: 8, background: '#fff', padding: 8, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 160, height: 80, borderRadius: 8, background: theme.surface, border: `2px dashed ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: theme.textDim, fontSize: 11 }}>
                No logo
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{ marginTop: 8, ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}` }}>
              📷 {currentLogo ? 'Change Logo' : 'Upload Logo'}
            </button>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Sponsor Name</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. FNB" />
          </div>

          {/* Tier */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Tier</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {TIERS.map(t => (
                <button key={t.id} onClick={() => setTier(t.id)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: tier === t.id ? `2px solid ${t.color}` : `1px solid ${theme.border}`,
                  background: tier === t.id ? t.color + '22' : theme.bg,
                  color: tier === t.id ? t.color : theme.textMuted, cursor: 'pointer',
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 4 }}>
              {TIERS.find(t => t.id === tier)?.desc}
            </div>
          </div>

          {/* Target (team or match) */}
          {showTarget && (
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>{tier === 'team' ? 'Team' : 'Match'}</label>
              <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ ...S.input, fontSize: 12 }}>
                <option value="">— Select —</option>
                {tier === 'team' && teams.map(t => (
                  <option key={t.id} value={t.id}>{teamDisplayName(t)}</option>
                ))}
                {tier === 'match' && matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {teamShortName(m.home_team)} vs {teamShortName(m.away_team)} ({new Date(m.match_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Website URL */}
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Website URL (optional)</label>
            <input style={S.input} value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." />
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Start Date</label>
              <input type="date" style={{ ...S.input, fontSize: 12 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>End Date</label>
              <input type="date" style={{ ...S.input, fontSize: 12 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setActive(!active)} style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
              background: active ? theme.success : theme.border,
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, background: '#fff',
                position: 'absolute', top: 2, left: active ? 20 : 2, transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 12, color: active ? theme.success : theme.textDim, fontWeight: 600 }}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving || !name.trim()} style={{
            ...S.btn(theme.accent, theme.bg),
            opacity: saving || !name.trim() ? 0.4 : 1,
          }}>
            {saving ? '⏳ Saving...' : isNew ? '✅ Add Sponsor' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  // ── SPONSOR LIST ──
  return (
    <div style={S.app}>

      <div style={S.page}>
        <button onClick={startNew} style={{ ...S.btn(theme.accent, theme.bg), marginBottom: 16 }}>
          ➕ Add Sponsor
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textDim }}>Loading...</div>
        ) : sponsors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textDim }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
            No sponsors yet
          </div>
        ) : (
          sponsors.map(sp => {
            const tierMeta = TIERS.find(t => t.id === sp.tier) || TIERS[0];
            const targetName = sp.tier === 'team'
              ? teamDisplayName(teams.find(t => t.id === sp.target_id))
              : sp.tier === 'match'
                ? matches.find(m => m.id === sp.target_id) ? `${teamShortName(matches.find(m => m.id === sp.target_id)?.home_team)} vs ${teamShortName(matches.find(m => m.id === sp.target_id)?.away_team)}` : null
                : null;

            return (
              <div key={sp.id} style={{
                background: theme.surface, borderRadius: 10, padding: 12, marginBottom: 6,
                border: `1px solid ${theme.border}`, opacity: sp.active ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {sp.logo_url ? (
                    <img src={sp.logo_url} alt={sp.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: tierMeta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: tierMeta.color, flexShrink: 0 }}>
                      {sp.name.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {sp.name}
                      <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 99, background: tierMeta.color + '22', color: tierMeta.color, fontWeight: 700 }}>
                        {tierMeta.label}
                      </span>
                      {!sp.active && <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 99, background: theme.danger + '22', color: theme.danger, fontWeight: 700 }}>OFF</span>}
                    </div>
                    {targetName && <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>→ {targetName}</div>}
                    {(sp.start_date || sp.end_date) && (
                      <div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>
                        {sp.start_date && new Date(sp.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        {sp.start_date && sp.end_date && ' – '}
                        {sp.end_date && new Date(sp.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
                {/* Stats */}
                {sponsorStats[sp.id] && (sponsorStats[sp.id].impressions > 0 || sponsorStats[sp.id].clicks > 0) && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, padding: '6px 10px', background: theme.bg, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: theme.textDim }}>
                      <span style={{ fontWeight: 700, color: theme.info }}>{sponsorStats[sp.id].impressions}</span> views
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>
                      <span style={{ fontWeight: 700, color: theme.success }}>{sponsorStats[sp.id].clicks}</span> clicks
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>
                      <span style={{ fontWeight: 700, color: theme.accent }}>
                        {sponsorStats[sp.id].impressions > 0 ? Math.round(sponsorStats[sp.id].clicks / sponsorStats[sp.id].impressions * 100) : 0}%
                      </span> CTR
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button onClick={() => startEdit(sp)} style={{ ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}`, flex: 1 }}>✏️ Edit</button>
                  <button onClick={() => handleToggleActive(sp)} style={{ ...S.btnSm(theme.surface, sp.active ? theme.danger : theme.success), border: `1px solid ${theme.border}` }}>
                    {sp.active ? '⏸ Off' : '▶ On'}
                  </button>
                  <button onClick={() => handleDelete(sp)} style={{ ...S.btnSm(theme.surface, theme.danger), border: `1px solid ${theme.border}` }}>🗑</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

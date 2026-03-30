import { useState, useEffect } from 'react';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';
import { teamColor, teamDisplayName, teamDerivedName, teamInitial, teamMatchesSearch } from '../utils/teams.js';
import { fetchInstitutions } from '../utils/sync.js';

const GENDERS = ['Girls', 'Boys'];
const AGE_GROUPS = ['U14', 'U16', '1st'];
const SPORTS = ['Hockey', 'Rugby', 'Netball'];

export default function TeamsScreen({ teams, onSave, onDelete, onBack, getShareLink }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [instSearch, setInstSearch] = useState("");

  useEffect(() => { fetchInstitutions().then(setInstitutions); }, []);

  const sorted = [...teams].sort((a, b) => teamDisplayName(a).localeCompare(teamDisplayName(b)));
  const filtered = search.trim() ? sorted.filter(t => teamMatchesSearch(t, search)) : sorted;

  // ── LIST VIEW ──
  if (!editing) {
    return (
      <div style={S.app}>
        <div style={S.nav}>
          <button style={S.backBtn} onClick={onBack}>←</button>
          <div style={S.navTitle}>Teams ({teams.length})</div>
          <NavLogo />
        </div>
        <div style={S.page}>
          <button style={S.btn(theme.accent, theme.bg)} onClick={() => setEditing({
            gender: 'Girls', age_group: '1st', sport: 'Hockey',
            institution_id: null, institution: null,
          })}>
            + Add Team
          </button>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <input style={{ ...S.input, fontSize: 12 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search teams..." />
          </div>
          <div>
            {filtered.length === 0 ? (
              <div style={S.empty}>{search.trim() ? "No teams found" : "No teams yet."}</div>
            ) : (
              filtered.map(t => (
                <div key={t.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}
                  onClick={() => { setEditing({ ...t }); setInstSearch(t.institution?.name || ""); }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: teamColor(t),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "#fff",
                  }}>
                    {teamInitial(t)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{teamDisplayName(t)}</div>
                    <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>
                      {t.institution?.name || 'No institution'}
                    </div>
                  </div>
                  {getShareLink && (
                    <button onClick={e => { e.stopPropagation(); const link = getShareLink(teamDisplayName(t)); navigator.clipboard?.writeText(link).then(() => alert("Link copied!\n" + link)).catch(() => prompt("Copy this link:", link)); }}
                      style={{ ...S.btnSm("transparent", "#10B981"), border: "1px solid #10B98144", fontSize: 10 }}>
                      🔗
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                    style={{ ...S.btnSm("transparent", theme.danger), border: `1px solid ${theme.danger}44` }}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ──
  const selectedInst = editing?.institution || institutions.find(i => i.id === editing?.institution_id);
  const instColor = selectedInst?.color || '#1D4ED8';
  const derivedName = teamDerivedName(editing);
  const previewName = (selectedInst?.short_name || selectedInst?.name || '?') + ' ' + derivedName;
  const filteredInst = instSearch.trim()
    ? institutions.filter(i => {
        const q = instSearch.toLowerCase();
        return (i.name || '').toLowerCase().includes(q) || (i.short_name || '').toLowerCase().includes(q) || (i.other_names || '').toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  const save = () => {
    if (!editing?.institution_id) return alert('Please select an institution');
    onSave({ ...editing, name: derivedName, color: instColor });
    setEditing(null);
    setInstSearch("");
  };

  const selectInst = (inst) => {
    setEditing(p => ({ ...p, institution_id: inst.id, institution: inst }));
    setInstSearch(inst.name);
  };

  const clearInst = () => {
    setEditing(p => ({ ...p, institution_id: null, institution: null }));
    setInstSearch("");
  };

  const Pill = ({ label, options, value, onChange }) => (
    <div style={{ flex: 1 }}>
      <label style={{ ...S.label, fontSize: 9 }}>{label}</label>
      <div style={{ display: 'flex', gap: 3 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: 1, padding: '8px 2px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            border: value === o ? `2px solid ${instColor}` : '1px solid #334155',
            background: value === o ? instColor + '22' : '#0B0F1A',
            color: value === o ? '#F8FAFC' : '#64748B', cursor: 'pointer',
          }}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { setEditing(null); setInstSearch(""); }}>←</button>
        <div style={S.navTitle}>{editing?.id ? "Edit" : "New"} Team</div>
        <NavLogo />
      </div>
      <div style={S.page}>
        {/* Institution picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Institution</label>
          {selectedInst ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, background: '#1E293B', border: `1px solid ${instColor}44` }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: instColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>
                {(selectedInst.short_name || selectedInst.name || '?').charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{selectedInst.name}</div>
                {selectedInst.short_name && <div style={{ fontSize: 9, color: '#64748B' }}>Short: {selectedInst.short_name}</div>}
              </div>
              <button onClick={clearInst} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 14, cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <>
              <input style={S.input} value={instSearch} onChange={e => setInstSearch(e.target.value)} placeholder="Search institutions..." />
              {instSearch.trim().length >= 1 && (
                <div style={{ maxHeight: 160, overflowY: 'auto', borderRadius: 6, border: '1px solid #1E293B', marginTop: 4 }}>
                  {filteredInst.map(i => (
                    <div key={i.id} onClick={() => selectInst(i)}
                      style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#CBD5E1', borderBottom: '1px solid #1E293B22' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: i.color || '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff' }}>
                        {(i.short_name || i.name || '?').charAt(0)}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600 }}>{i.name}</span>
                        {i.short_name && <span style={{ fontSize: 9, color: '#64748B', marginLeft: 4 }}>({i.short_name})</span>}
                      </div>
                    </div>
                  ))}
                  {filteredInst.length === 0 && (
                    <div style={{ padding: '8px 10px', fontSize: 11, color: '#475569' }}>No institutions found — create one in Institutions first</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Gender / Age Group / Sport — pill selectors */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Pill label="Gender" options={GENDERS} value={editing?.gender || 'Girls'}
            onChange={v => setEditing(p => ({ ...p, gender: v }))} />
          <Pill label="Age group" options={AGE_GROUPS} value={editing?.age_group || '1st'}
            onChange={v => setEditing(p => ({ ...p, age_group: v }))} />
          <Pill label="Sport" options={SPORTS} value={editing?.sport || 'Hockey'}
            onChange={v => setEditing(p => ({ ...p, sport: v }))} />
        </div>

        {/* Preview */}
        <div style={{
          background: theme.surface, borderRadius: 12, padding: 16, marginBottom: 20,
          textAlign: "center", borderTop: `4px solid ${instColor}`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: instColor,
            margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff",
          }}>
            {(selectedInst?.short_name || selectedInst?.name || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#F8FAFC' }}>
            {selectedInst?.short_name || selectedInst?.name || '?'}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
            {derivedName}
          </div>
        </div>

        <button style={{ ...S.btn(theme.accent, theme.bg), opacity: editing?.institution_id ? 1 : 0.4 }} onClick={save}>
          {editing?.id ? "Save Changes" : "Create Team"}
        </button>
      </div>
    </div>
  );
}

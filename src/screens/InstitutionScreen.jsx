import { useState, useEffect } from 'react';
import { TEAM_COLORS } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';
import { fetchInstitutions, upsertInstitution, deleteInstitution } from '../utils/sync.js';
import { supabase } from '../utils/supabase.js';
import KykieSpinner from '../components/KykieSpinner.jsx';

export default function InstitutionScreen({ onBack }) {
  const [institutions, setInstitutions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [teamCounts, setTeamCounts] = useState({});

  const load = async () => {
    setLoading(true);
    const [insts, { data: teams }] = await Promise.all([
      fetchInstitutions(),
      supabase.from('teams').select('institution_id').or('status.eq.active,status.is.null'),
    ]);
    setInstitutions(insts);
    // Count teams per institution
    const counts = {};
    (teams || []).forEach(t => {
      if (t.institution_id) counts[t.institution_id] = (counts[t.institution_id] || 0) + 1;
    });
    setTeamCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = search.trim()
    ? institutions.filter(i => {
        const q = search.toLowerCase();
        return (i.name || '').toLowerCase().includes(q) || (i.short_name || '').toLowerCase().includes(q) || (i.other_names || '').toLowerCase().includes(q);
      })
    : institutions;

  // ── LIST VIEW ──
  if (!editing) {
    return (
      <div style={S.app}>
        <div style={S.nav}>
          <button style={S.backBtn} onClick={onBack}>←</button>
          <div style={S.navTitle}>Institutions ({institutions.length})</div>
          <NavLogo />
        </div>
        <div style={S.page}>
          <button style={S.btn(theme.accent, theme.bg)} onClick={() => setEditing({ name: "", short_name: "", other_names: "", color: TEAM_COLORS[0].hex })}>
            + Add Institution
          </button>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <input style={{ ...S.input, fontSize: 12 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search institutions..." />
          </div>
          {loading ? (
            <div style={S.empty}><KykieSpinner /></div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>{search.trim() ? "No institutions found" : "No institutions yet."}</div>
          ) : (
            <div>
              {filtered.map(inst => (
                <div key={inst.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}
                  onClick={() => setEditing({ ...inst })}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: inst.color || '#1D4ED8',
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "#fff",
                  }}>
                    {(inst.short_name || inst.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{inst.name}</div>
                    <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>
                      {inst.short_name ? `${inst.short_name} · ` : ''}{teamCounts[inst.id] || 0} team{(teamCounts[inst.id] || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button onClick={async e => {
                    e.stopPropagation();
                    if (!confirm(`Delete ${inst.name}?`)) return;
                    const result = await deleteInstitution(inst.id);
                    if (result.error) { alert(result.error); return; }
                    load();
                  }}
                    style={{ ...S.btnSm("transparent", theme.danger), border: `1px solid ${theme.danger}44` }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ──
  const save = async () => {
    if (!editing?.name?.trim()) return;
    const result = await upsertInstitution(editing);
    if (result) {
      await load();
      setEditing(null);
    }
  };

  const previewInitial = (editing?.short_name || editing?.name || 'I').charAt(0).toUpperCase();
  const previewColor = editing?.color || TEAM_COLORS[0].hex;

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => setEditing(null)}>←</button>
        <div style={S.navTitle}>{editing?.id ? "Edit" : "New"} Institution</div>
        <NavLogo />
      </div>
      <div style={S.page}>
        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Institution Name</label>
          <input style={S.input} value={editing?.name || ""}
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Paarl Girls High" autoFocus />
        </div>

        {/* Short Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Short Name (for scoreboards)</label>
          <input style={S.input} value={editing?.short_name || ""}
            onChange={e => setEditing(p => ({ ...p, short_name: e.target.value }))}
            placeholder="e.g. PG" />
          <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>
            Shows on match cards, scoreboards, and predictions
          </div>
        </div>

        {/* Other Names */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Other Names (optional, comma-separated)</label>
          <input style={S.input} value={editing?.other_names || ""}
            onChange={e => setEditing(p => ({ ...p, other_names: e.target.value }))}
            placeholder="e.g. Paarl Gim, PGHS" />
          <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>
            Alternative names for search (nicknames, abbreviations)
          </div>
        </div>

        {/* Colour */}
        <div style={{ marginBottom: 20 }}>
          <label style={S.label}>Colour</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {TEAM_COLORS.map(c => (
              <button key={c.id} onClick={() => setEditing(p => ({ ...p, color: c.hex }))} style={{
                width: "100%", aspectRatio: "1", borderRadius: 10, background: c.hex,
                border: previewColor === c.hex ? "3px solid #F8FAFC" : "3px solid transparent",
                cursor: "pointer", position: "relative",
              }}>
                {previewColor === c.hex && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800 }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: theme.surface, borderRadius: 12, padding: 16, marginBottom: 20,
          textAlign: "center", borderTop: `4px solid ${previewColor}`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: previewColor,
            margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff",
          }}>
            {previewInitial}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: previewColor }}>
            {editing?.name || "Institution Name"}
          </div>
          {editing?.short_name && (
            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>
              Short: {editing.short_name}
            </div>
          )}
          {editing?.other_names && (
            <div style={{ fontSize: 9, color: theme.textDimmer, marginTop: 2 }}>
              Also known as: {editing.other_names}
            </div>
          )}
        </div>

        <button style={{ ...S.btn(theme.accent, theme.bg), opacity: editing?.name?.trim() ? 1 : 0.4 }} onClick={save}>
          {editing?.id ? "Save Changes" : "Create Institution"}
        </button>
      </div>
    </div>
  );
}

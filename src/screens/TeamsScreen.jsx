import { useState } from 'react';
import { TEAM_COLORS } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';

export default function TeamsScreen({ teams, onSave, onDelete, onBack, getShareLink }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : teams;

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
          <button style={S.btn(theme.accent, theme.bg)} onClick={() => setEditing({ name: "", color: TEAM_COLORS[0].hex })}>
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
                  onClick={() => setEditing({ ...t })}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "#fff",
                  }}>
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  </div>
                  {getShareLink && (
                    <button onClick={e => { e.stopPropagation(); const link = getShareLink(t.name); navigator.clipboard?.writeText(link).then(() => alert("Link copied!\n" + link)).catch(() => prompt("Copy this link:", link)); }}
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
  const save = () => {
    if (!editing?.name?.trim()) return;
    onSave(editing);
    setEditing(null);
  };

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => setEditing(null)}>←</button>
        <div style={S.navTitle}>{editing?.id ? "Edit" : "New"} Team</div>
        <NavLogo />
      </div>
      <div style={S.page}>
        <div style={{ marginBottom: 20 }}>
          <label style={S.label}>Team Name</label>
          <input style={S.input} value={editing?.name || ""}
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Western Province HC" autoFocus />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>Team Colour</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {TEAM_COLORS.map(c => (
              <button key={c.id} onClick={() => setEditing(p => ({ ...p, color: c.hex }))} style={{
                width: "100%", aspectRatio: "1", borderRadius: 10, background: c.hex,
                border: editing?.color === c.hex ? "3px solid #F8FAFC" : "3px solid transparent",
                cursor: "pointer", position: "relative",
              }}>
                {editing?.color === c.hex && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 800 }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Preview */}
        <div style={{
          background: theme.surface, borderRadius: 12, padding: 16, marginBottom: 20,
          textAlign: "center", borderTop: `4px solid ${editing?.color || theme.textDimmer}`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: editing?.color || theme.textDimmer,
            margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff",
          }}>
            {(editing?.name || "T").charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: editing?.color || theme.textDimmer }}>
            {editing?.name || "Team Name"}
          </div>
        </div>
        <button style={{ ...S.btn(theme.accent, theme.bg), opacity: editing?.name?.trim() ? 1 : 0.4 }} onClick={save}>
          {editing?.id ? "Save Changes" : "Create Team"}
        </button>
      </div>
    </div>
  );
}

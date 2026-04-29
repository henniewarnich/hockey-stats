import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import AdminBackBar from '../components/AdminBackBar.jsx';
import { parseSASTDate } from '../utils/helpers.js';
import { logAudit } from '../utils/audit.js';
import NavLogo from '../components/NavLogo.jsx';
import { TEAM_SELECT, teamColor, teamDisplayName } from '../utils/teams.js';
import KykieSpinner from '../components/KykieSpinner.jsx';

export default function RankingsScreen({ onBack, currentUser }) {
  const [sets, setSets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSet, setEditSet] = useState(null);
  const [rankings, setRankings] = useState({});
  const [original, setOriginal] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | ranked | unranked

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: allSets }, { data: allTeams }] = await Promise.all([
      supabase.from('ranking_sets').select('*, rankings(count)').order('ranking_date', { ascending: false }),
      supabase.from('teams').select(TEAM_SELECT).order('name'),
    ]);
    setSets(allSets || []);
    const sorted = (allTeams || []).sort((a, b) => teamDisplayName(a).localeCompare(teamDisplayName(b)));
    setTeams(sorted);
    setLoading(false);
  };

  const openSet = async (s) => {
    setEditSet(s);
    setSearch("");
    setFilter("all");
    const { data } = await supabase
      .from('rankings')
      .select('team_id, position, points')
      .eq('ranking_set_id', s.id);
    const map = {};
    (data || []).forEach(r => { map[r.team_id] = { position: r.position, points: r.points }; });
    setRankings({ ...map });
    setOriginal({ ...map });
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = [];
    const deletes = [];

    for (const t of teams) {
      const curr = rankings[t.id];
      const orig = original[t.id];
      const pos = curr?.position;

      if (pos != null && pos !== "") {
        upserts.push({
          ranking_set_id: editSet.id,
          team_id: t.id,
          position: parseInt(pos),
          points: curr?.points ?? null,
        });
      } else if (orig && (pos == null || pos === "")) {
        deletes.push(t.id);
      }
    }

    if (upserts.length > 0) {
      await supabase.from('rankings').upsert(upserts, { onConflict: 'ranking_set_id,team_id' });
    }
    if (deletes.length > 0) {
      for (const tid of deletes) {
        await supabase.from('rankings').delete()
          .eq('ranking_set_id', editSet.id)
          .eq('team_id', tid);
      }
    }

    const map = {};
    upserts.forEach(r => { map[r.team_id] = { position: r.position, points: r.points }; });
    setOriginal({ ...map });
    setRankings({ ...map });
    await logAudit('ranking_update', 'ranking', editSet.id, { upserts: upserts.length, deletes: deletes.length, date: editSet.ranking_date });
    setSaving(false);
    load();
  };

  const hasChanges = () => {
    for (const t of teams) {
      const curr = rankings[t.id]?.position;
      const orig = original[t.id]?.position;
      const currVal = curr != null && curr !== "" ? parseInt(curr) : null;
      const origVal = orig != null ? parseInt(orig) : null;
      if (currVal !== origVal) return true;
    }
    return false;
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return parseSASTDate(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  };

  // Edit view
  if (editSet) {
    const q = search.toLowerCase();
    const filtered = teams.filter(t => {
      if (q && !teamDisplayName(t).toLowerCase().includes(q)) return false;
      if (filter === "ranked" && !rankings[t.id]?.position) return false;
      if (filter === "unranked" && rankings[t.id]?.position) return false;
      return true;
    });

    const rankedCount = teams.filter(t => rankings[t.id]?.position).length;

    return (
      <div style={S.app}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setEditSet(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 16, cursor: "pointer", padding: 0 }}>←</button>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Back to ranking sets</div>
        </div>

        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC", marginBottom: 2 }}>
            Ranking Set — {fmtDate(editSet.ranking_date)}
          </div>
          <div style={{ fontSize: 10, color: "#64748B" }}>
            {rankedCount} of {teams.length} teams ranked
            {editSet.source_url && <span> · <a href={editSet.source_url} target="_blank" rel="noopener" style={{ color: "#3B82F6" }}>Source</a></span>}
          </div>
        </div>

        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6 }}>
          <input
            type="text" placeholder="Search teams..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: 12, outline: "none" }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 6px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: 11, outline: "none" }}>
            <option value="all">All</option>
            <option value="ranked">Ranked</option>
            <option value="unranked">Unranked</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          {filtered.map(t => {
            const r = rankings[t.id];
            const isNew = !original[t.id]?.position && r?.position;
            const isChanged = original[t.id]?.position != null && r?.position != null && parseInt(r.position) !== parseInt(original[t.id].position);
            return (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 2,
                background: isNew ? "#10B98108" : isChanged ? "#F59E0B08" : "#1E293B",
                borderRadius: 8,
                border: isNew ? "1px solid #10B98133" : isChanged ? "1px solid #F59E0B33" : "1px solid #334155",
              }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: teamColor(t), flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>
                  {teamDisplayName(t)}
                  {isNew && <span style={{ fontSize: 8, marginLeft: 6, color: "#10B981", fontWeight: 700 }}>NEW</span>}
                  {isChanged && <span style={{ fontSize: 8, marginLeft: 6, color: "#F59E0B", fontWeight: 700 }}>CHANGED</span>}
                </div>
                <input
                  type="number" min="1" placeholder="—"
                  value={r?.position ?? ""}
                  onChange={e => {
                    const val = e.target.value;
                    setRankings(prev => ({
                      ...prev,
                      [t.id]: { ...prev[t.id], position: val === "" ? null : parseInt(val) }
                    }));
                  }}
                  style={{
                    width: 52, padding: "6px 8px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                    border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text,
                    textAlign: "center", outline: "none",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px 16px", borderTop: `1px solid ${theme.border}` }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            style={{
              width: "100%", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "none", cursor: hasChanges() ? "pointer" : "default",
              background: hasChanges() ? "#F59E0B" : "#334155",
              color: hasChanges() ? "#0B0F1A" : "#64748B",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : hasChanges() ? "Save Changes" : "No changes"}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={S.app}>
      <AdminBackBar title="Rankings" onBack={onBack} />

      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{sets.length} ranking set{sets.length !== 1 ? "s" : ""}</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><KykieSpinner /></div>
      ) : sets.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No ranking sets found</div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          {sets.map(s => {
            const count = s.rankings?.[0]?.count ?? 0;
            return (
              <div key={s.id} onClick={() => openSet(s)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 12px",
                background: "#1E293B", borderRadius: 10, marginBottom: 4,
                border: "1px solid #334155", cursor: "pointer",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: "#F59E0B11", border: "1.5px solid #F59E0B33",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#F59E0B", lineHeight: 1 }}>
                    {s.ranking_date ? parseSASTDate(s.ranking_date).getDate() : "?"}
                  </div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>
                    {s.ranking_date ? parseSASTDate(s.ranking_date).toLocaleDateString("en-ZA", { month: "short" }) : ""}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>
                    {fmtDate(s.ranking_date)}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                    {count} team{count !== 1 ? "s" : ""} ranked
                    {s.notes && ` · ${s.notes}`}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#334155" }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

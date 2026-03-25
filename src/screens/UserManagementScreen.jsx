import { useState, useEffect } from 'react';
import { listUsers, createUser, updateProfile, toggleBlockUser, resetPassword, getAllCoachTeams, assignCoachTeam, removeCoachTeam } from '../utils/auth.js';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import NavLogo from '../components/NavLogo.jsx';

const timeAgo = (ts) => {
  if (!ts) return null;
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const ROLES = [
  { id: 'admin', label: 'Admin', color: '#EF4444' },
  { id: 'commentator_admin', label: 'Comm Admin', color: '#F59E0B' },
  { id: 'commentator', label: 'Commentator', color: '#10B981' },
  { id: 'coach', label: 'Coach', color: '#8B5CF6' },
];

export default function UserManagementScreen({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | create | edit
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");
  const [allTeams, setAllTeams] = useState([]);
  const [coachTeamsMap, setCoachTeamsMap] = useState({}); // { coachId: [team, ...] }
  const [editCoachTeams, setEditCoachTeams] = useState([]); // team IDs for edit view
  const [editRoles, setEditRoles] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");

  // Create form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("commentator");
  const [selectedRoles, setSelectedRoles] = useState(["commentator"]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [userTab, setUserTab] = useState("active");

  // Which roles can this user manage?
  const isAdmin = currentUser?.role === 'admin';
  const isCommAdmin = currentUser?.role === 'commentator_admin';
  const manageableRoles = isAdmin ? ROLES : ROLES.filter(r => r.id === 'commentator');

  useEffect(() => { loadUsers(); loadTeams(); }, []);

  const loadTeams = async () => {
    const { data } = await supabase.from('teams').select('id, name, color, short_name').order('name');
    setAllTeams(data || []);
  };

  const loadCoachTeams = async () => {
    const assignments = await getAllCoachTeams();
    const map = {};
    assignments.forEach(a => {
      if (!map[a.coach_id]) map[a.coach_id] = [];
      map[a.coach_id].push(a.teams);
    });
    setCoachTeamsMap(map);
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await listUsers();
    // CommAdmin only sees commentators
    setUsers(isAdmin ? data : data.filter(u => u.role === 'commentator'));
    setLoading(false);
    // Also refresh coach team assignments
    loadCoachTeams();
  };

  const autoUsername = (fn, ln) => {
    const u = `${fn.trim()}.${ln.trim()}`.toLowerCase().replace(/[\s@]/g, '');
    setUsername(u);
  };

  const handleCreate = async () => {
    if (!firstname.trim() || !lastname.trim() || !username.trim() || !email.trim() || password.length < 6) {
      setSaveError("All fields required. Password must be 6+ characters.");
      return;
    }
    if (username.includes('@')) {
      setSaveError("Username cannot contain @ symbol.");
      return;
    }
    if (!email.includes('@')) {
      setSaveError("Please enter a valid email address.");
      return;
    }
    setSaving(true); setSaveError(""); setSaveSuccess("");
    const result = await createUser({ firstname: firstname.trim(), lastname: lastname.trim(), username: username.trim(), email: email.trim().toLowerCase(), password, role, roles: selectedRoles });
    if (result.error) {
      setSaveError(result.error);
      setSaving(false);
      return;
    }
    setSaveSuccess(`${firstname} ${lastname} created!`);
    setSaving(false);
    setFirstname(""); setLastname(""); setUsername(""); setEmail(""); setPassword(""); setRole("commentator"); setSelectedRoles(["commentator"]);
    setTimeout(() => { setSaveSuccess(""); loadUsers(); setView("list"); }, 1500);
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true); setSaveError("");
    const result = await updateProfile(editUser.id, {
      firstname: editUser.firstname,
      lastname: editUser.lastname,
      role: editUser.role,
      roles: editRoles,
    });
    if (result.error) { setSaveError(result.error); setSaving(false); return; }

    // Save coach team assignments if roles include coach
    if (editRoles.includes('coach')) {
      const current = (coachTeamsMap[editUser.id] || []).map(t => t.id);
      // Remove unassigned
      for (const tid of current) {
        if (!editCoachTeams.includes(tid)) await removeCoachTeam(editUser.id, tid);
      }
      // Add new
      for (const tid of editCoachTeams) {
        if (!current.includes(tid)) await assignCoachTeam(editUser.id, tid);
      }
    }

    setSaving(false);
    loadUsers();
    setView("list");
  };

  const openEdit = (u) => {
    setEditUser({ ...u });
    setEditRoles(u.roles?.length > 0 ? [...u.roles] : [u.role]);
    setEditCoachTeams((coachTeamsMap[u.id] || []).map(t => t.id));
    setTeamSearch("");
    setView("edit");
    setSaveError("");
  };

  const handleToggleBlock = async (user) => {
    await toggleBlockUser(user.id, !user.blocked);
    loadUsers();
  };

  const filtered = search.trim()
    ? users.filter(u => `${u.firstname} ${u.lastname} ${u.username}`.toLowerCase().includes(search.toLowerCase()))
    : users;

  const roleColor = (r) => ROLES.find(x => x.id === r)?.color || "#64748B";
  const roleLabel = (r) => ROLES.find(x => x.id === r)?.label || r;
  const activeUsers = filtered.filter(u => !u.blocked);
  const blockedUsers = filtered.filter(u => u.blocked);
  const displayUsers = userTab === "active" ? activeUsers : blockedUsers;

  // ── CREATE VIEW ──
  if (view === "create") return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { setView("list"); setSaveError(""); setSaveSuccess(""); }}>←</button>
        <div style={S.navTitle}>New User</div><NavLogo />
      </div>
      <div style={S.page}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>First Name</div>
          <input style={S.input} value={firstname} onChange={e => { setFirstname(e.target.value); autoUsername(e.target.value, lastname); }} placeholder="e.g. John" autoFocus />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Last Name</div>
          <input style={S.input} value={lastname} onChange={e => { setLastname(e.target.value); autoUsername(firstname, e.target.value); }} placeholder="e.g. Smith" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Username</div>
          <input style={{ ...S.input, fontSize: 12, color: "#F59E0B" }} value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[\s@]/g, ''))} />
          <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>Auto-generated from name — you can edit it</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Email</div>
          <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@school.co.za" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Password</div>
          <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Roles <span style={{ fontSize: 9, color: "#475569" }}>(tap to toggle, first = primary)</span></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {manageableRoles.map(r => {
              const isOn = selectedRoles.includes(r.id);
              return (
                <button key={r.id} onClick={() => {
                  setSelectedRoles(prev => {
                    if (isOn) {
                      const next = prev.filter(x => x !== r.id);
                      if (next.length === 0) return prev; // must have at least one
                      setRole(next[0]);
                      return next;
                    }
                    const next = [...prev, r.id];
                    return next;
                  });
                  if (!isOn) setRole(r.id);
                }} style={{
                  padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: isOn ? `2px solid ${r.color}` : `1px solid ${theme.border}`,
                  background: isOn ? r.color + "22" : theme.bg,
                  color: isOn ? r.color : theme.textMuted, cursor: "pointer",
                }}>{r.label}{isOn && selectedRoles[0] === r.id ? ' ★' : ''}</button>
              );
            })}
          </div>
        </div>

        {saveError && <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 10, textAlign: "center" }}>{saveError}</div>}
        {saveSuccess && <div style={{ fontSize: 11, color: "#10B981", marginBottom: 10, textAlign: "center" }}>{saveSuccess}</div>}

        <button onClick={handleCreate} disabled={saving} style={{
          ...S.btn(theme.accent, theme.bg), opacity: saving ? 0.5 : 1,
        }}>{saving ? "Creating..." : "Create User"}</button>
      </div>
    </div>
  );

  // ── EDIT VIEW ──
  if (view === "edit" && editUser) return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { setView("list"); setSaveError(""); }}>←</button>
        <div style={S.navTitle}>Edit User</div><NavLogo />
      </div>
      <div style={S.page}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>First Name</div>
          <input style={S.input} value={editUser.firstname} onChange={e => setEditUser(p => ({ ...p, firstname: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Last Name</div>
          <input style={S.input} value={editUser.lastname} onChange={e => setEditUser(p => ({ ...p, lastname: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Username</div>
          <div style={{ fontSize: 13, color: "#F59E0B", padding: "10px 0" }}>{editUser.username}</div>
          <div style={{ fontSize: 9, color: theme.textDim }}>Username cannot be changed</div>
        </div>
        {isAdmin && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Roles <span style={{ fontSize: 9, color: "#475569" }}>(tap to toggle, first = primary)</span></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ROLES.map(r => {
                const isOn = editRoles.includes(r.id);
                return (
                  <button key={r.id} onClick={() => {
                    setEditRoles(prev => {
                      if (isOn) {
                        const next = prev.filter(x => x !== r.id);
                        if (next.length === 0) return prev;
                        setEditUser(p => ({ ...p, role: next[0] }));
                        return next;
                      }
                      return [...prev, r.id];
                    });
                    if (!isOn && editRoles.length === 0) setEditUser(p => ({ ...p, role: r.id }));
                  }} style={{
                    padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: isOn ? `2px solid ${r.color}` : `1px solid ${theme.border}`,
                    background: isOn ? r.color + "22" : theme.bg,
                    color: isOn ? r.color : theme.textMuted, cursor: "pointer",
                  }}>{r.label}{isOn && editRoles[0] === r.id ? ' ★' : ''}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Coach team assignments */}
        {editRoles.includes('coach') && isAdmin && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Assigned Teams</div>
            {/* Selected teams */}
            {editCoachTeams.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                {editCoachTeams.map(tid => {
                  const t = allTeams.find(x => x.id === tid);
                  if (!t) return null;
                  return (
                    <span key={tid} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: (t.color || "#8B5CF6") + "22", color: t.color || "#8B5CF6",
                      border: `1px solid ${(t.color || "#8B5CF6")}44`,
                    }}>
                      {t.short_name || t.name}
                      <span onClick={() => setEditCoachTeams(prev => prev.filter(x => x !== tid))}
                        style={{ cursor: "pointer", marginLeft: 2, fontSize: 13, lineHeight: 1 }}>×</span>
                    </span>
                  );
                })}
              </div>
            )}
            {/* Team search + add */}
            <input style={{ ...S.input, fontSize: 11 }} value={teamSearch} onChange={e => setTeamSearch(e.target.value)} placeholder="🔍 Search teams to add..." />
            {teamSearch.trim() && (
              <div style={{ maxHeight: 140, overflowY: "auto", marginTop: 4, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg }}>
                {allTeams.filter(t => !editCoachTeams.includes(t.id) && t.name.toLowerCase().includes(teamSearch.toLowerCase())).map(t => (
                  <div key={t.id} onClick={() => { setEditCoachTeams(prev => [...prev, t.id]); setTeamSearch(""); }}
                    style={{ padding: "8px 12px", fontSize: 12, color: theme.text, cursor: "pointer", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: t.color || "#8B5CF6", flexShrink: 0 }} />
                    {t.name}
                  </div>
                ))}
                {allTeams.filter(t => !editCoachTeams.includes(t.id) && t.name.toLowerCase().includes(teamSearch.toLowerCase())).length === 0 && (
                  <div style={{ padding: "8px 12px", fontSize: 11, color: theme.textDim }}>No matching teams</div>
                )}
              </div>
            )}
            {editCoachTeams.length === 0 && !teamSearch.trim() && (
              <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>No teams assigned — search above to add</div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={async () => {
            await handleToggleBlock(editUser);
            setEditUser(prev => ({ ...prev, blocked: !prev.blocked }));
            setSaveSuccess(editUser.blocked ? "User unblocked" : "User blocked");
            setTimeout(() => setSaveSuccess(""), 3000);
          }} style={{
            flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${editUser.blocked ? "#10B98144" : "#EF444444"}`,
            background: "transparent", color: editUser.blocked ? "#10B981" : "#EF4444",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>{editUser.blocked ? "Unblock User" : "Block User"}</button>
          <button onClick={async () => {
            const newPw = prompt("Enter new password for " + editUser.firstname + " (min 6 characters):");
            if (!newPw || newPw.length < 6) { if (newPw !== null) setSaveError("Password must be 6+ characters"); return; }
            const result = await resetPassword(editUser.id, newPw);
            if (result.error) { setSaveError(result.error); }
            else { setSaveSuccess(`Password reset for ${editUser.firstname}`); setTimeout(() => setSaveSuccess(""), 4000); }
          }} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "1px solid #F59E0B44",
            background: "transparent", color: "#F59E0B",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>🔑 Reset Password</button>
        </div>

        <button onClick={async () => {
          if (!confirm(`Permanently delete ${editUser.firstname} ${editUser.lastname}? This cannot be undone.`)) return;
          const { error } = await supabase.rpc('delete_user', { p_id: editUser.id });
          if (error) {
            if (error.message.includes('foreign key') || error.message.includes('violates') || error.message.includes('referenced')) {
              setSaveError(`Cannot delete — this user has match history. Use "Block User" instead.`);
            } else {
              setSaveError(`Delete failed: ${error.message}`);
            }
            return;
          }
          setView("list"); loadUsers();
        }} style={{
          width: "100%", padding: 10, borderRadius: 10, border: "1px solid #EF444444",
          background: "#EF444411", color: "#EF4444",
          fontSize: 11, fontWeight: 700, cursor: "pointer", marginBottom: 12,
        }}>🗑 Delete User Permanently</button>

        {saveError && <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 10, textAlign: "center" }}>{saveError}</div>}
        {saveSuccess && <div style={{ fontSize: 11, color: "#10B981", marginBottom: 10, textAlign: "center" }}>{saveSuccess}</div>}

        <button onClick={handleUpdate} disabled={saving} style={{
          ...S.btn(theme.accent, theme.bg), opacity: saving ? 0.5 : 1,
        }}>{saving ? "Saving..." : "Save Changes"}</button>
      </div>
    </div>
  );

  // ── LIST VIEW ──

  return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.navTitle}>Users</div><NavLogo />
      </div>
      <div style={S.page}>
        <button style={S.btn(theme.accent, theme.bg)} onClick={() => setView("create")}>+ New User</button>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.border}` }}>
          <button onClick={() => setUserTab("active")} style={{
            flex: 1, padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
            background: userTab === "active" ? "#33415577" : "#1E293B", color: userTab === "active" ? "#F8FAFC" : "#64748B",
          }}>Active ({activeUsers.length})</button>
          <button onClick={() => setUserTab("blocked")} style={{
            flex: 1, padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer",
            background: userTab === "blocked" ? "#EF444422" : "#1E293B", color: userTab === "blocked" ? "#EF4444" : "#64748B",
          }}>Blocked ({blockedUsers.length})</button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <input style={{ ...S.input, fontSize: 12 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users..." />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>Loading...</div>
        ) : displayUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>{userTab === "blocked" ? "No blocked users" : "No users found"}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {displayUsers.map(u => (
              <div key={u.id} onClick={() => openEdit(u)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: theme.surface, borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${theme.border}`,
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: roleColor(u.role) + "22",
                  border: `1.5px solid ${roleColor(u.role)}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: roleColor(u.role), flexShrink: 0,
                }}>{u.firstname?.charAt(0)}{u.lastname?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                    {u.firstname} {u.lastname}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>{u.username} · {u.email}</div>
                  {u.last_seen_at && (
                    <div style={{ fontSize: 9, color: timeAgo(u.last_seen_at).startsWith('Just') || timeAgo(u.last_seen_at).match(/^\d+[mh]/) ? "#10B981" : "#64748B", marginTop: 2 }}>
                      Last seen {timeAgo(u.last_seen_at)}
                    </div>
                  )}
                  {(u.roles?.includes('coach') || u.role === 'coach') && coachTeamsMap[u.id]?.length > 0 && (
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 3 }}>
                      {coachTeamsMap[u.id].map(t => (
                        <span key={t.id} style={{
                          fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                          background: (t.color || "#8B5CF6") + "22", color: t.color || "#8B5CF6",
                        }}>{t.short_name || t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", flexShrink: 0 }}>
                  {(u.roles?.length > 1 ? u.roles : [u.role]).map(r => (
                    <span key={r} style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99,
                      background: roleColor(r) + "22", color: roleColor(r),
                    }}>{roleLabel(r)}</span>
                  ))}
                </div>
                <span style={{ color: "#334155", fontSize: 14 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

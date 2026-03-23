import { useState, useEffect } from 'react';
import { listUsers, createUser, updateProfile, toggleBlockUser } from '../utils/auth.js';
import { S, theme } from '../utils/styles.js';

const ROLES = [
  { id: 'admin', label: 'Admin', color: '#EF4444' },
  { id: 'commentator_admin', label: 'Comm Admin', color: '#F59E0B' },
  { id: 'commentator', label: 'Commentator', color: '#10B981' },
  { id: 'coach', label: 'Coach', color: '#8B5CF6' },
  { id: 'viewer', label: 'Viewer', color: '#64748B' },
];

export default function UserManagementScreen({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | create | edit
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");

  // Create form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("commentator");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Which roles can this user manage?
  const isAdmin = currentUser?.role === 'admin';
  const isCommAdmin = currentUser?.role === 'commentator_admin';
  const manageableRoles = isAdmin ? ROLES : ROLES.filter(r => r.id === 'commentator');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await listUsers();
    // CommAdmin only sees commentators
    setUsers(isAdmin ? data : data.filter(u => u.role === 'commentator'));
    setLoading(false);
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
    const result = await createUser({ firstname: firstname.trim(), lastname: lastname.trim(), username: username.trim(), email: email.trim().toLowerCase(), password, role });
    if (result.error) {
      setSaveError(result.error);
      setSaving(false);
      return;
    }
    setSaveSuccess(`${firstname} ${lastname} created!`);
    setSaving(false);
    setFirstname(""); setLastname(""); setUsername(""); setEmail(""); setPassword(""); setRole("commentator");
    setTimeout(() => { setSaveSuccess(""); loadUsers(); setView("list"); }, 1500);
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true); setSaveError("");
    const result = await updateProfile(editUser.id, {
      firstname: editUser.firstname,
      lastname: editUser.lastname,
      role: editUser.role,
    });
    if (result.error) { setSaveError(result.error); setSaving(false); return; }
    setSaving(false);
    loadUsers();
    setView("list");
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

  // ── CREATE VIEW ──
  if (view === "create") return (
    <div style={S.app}>
      <div style={S.nav}>
        <button style={S.backBtn} onClick={() => { setView("list"); setSaveError(""); setSaveSuccess(""); }}>←</button>
        <div style={S.navTitle}>New User</div>
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
          <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Role</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {manageableRoles.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: role === r.id ? `2px solid ${r.color}` : `1px solid ${theme.border}`,
                background: role === r.id ? r.color + "22" : theme.bg,
                color: role === r.id ? r.color : theme.textMuted, cursor: "pointer",
              }}>{r.label}</button>
            ))}
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
        <div style={S.navTitle}>Edit User</div>
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
            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>Role</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setEditUser(p => ({ ...p, role: r.id }))} style={{
                  padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: editUser.role === r.id ? `2px solid ${r.color}` : `1px solid ${theme.border}`,
                  background: editUser.role === r.id ? r.color + "22" : theme.bg,
                  color: editUser.role === r.id ? r.color : theme.textMuted, cursor: "pointer",
                }}>{r.label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => handleToggleBlock(editUser)} style={{
            flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${editUser.blocked ? "#10B98144" : "#EF444444"}`,
            background: "transparent", color: editUser.blocked ? "#10B981" : "#EF4444",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>{editUser.blocked ? "Unblock User" : "Block User"}</button>
        </div>

        {saveError && <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 10, textAlign: "center" }}>{saveError}</div>}

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
        <div style={S.navTitle}>Users</div>
      </div>
      <div style={S.page}>
        <button style={S.btn(theme.accent, theme.bg)} onClick={() => setView("create")}>+ New User</button>

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <input style={{ ...S.input, fontSize: 12 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users..." />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: theme.textDim }}>No users found</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map(u => (
              <div key={u.id} onClick={() => { setEditUser({ ...u }); setView("edit"); setSaveError(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: theme.surface, borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${theme.border}`, opacity: u.blocked ? 0.5 : 1,
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
                    {u.blocked && <span style={{ fontSize: 9, color: "#EF4444", marginLeft: 6 }}>BLOCKED</span>}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>{u.username} · {u.email}</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: roleColor(u.role) + "22", color: roleColor(u.role),
                }}>{roleLabel(u.role)}</span>
                <span style={{ color: "#334155", fontSize: 14 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

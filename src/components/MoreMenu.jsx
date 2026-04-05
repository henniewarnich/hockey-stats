import { APP_VERSION } from '../utils/constants.js';

function goAdmin(screen) {
  sessionStorage.setItem('kykie-admin-screen', screen || 'home');
  window.location.hash = '#/admin';
}

const MenuItem = ({ icon, title, sub, onClick }) => (
  <div onClick={onClick} style={{
    background: '#1E293B', borderRadius: 10, padding: '12px 14px', marginBottom: 6,
    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
  }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748B' }}>{sub}</div>}
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 10, marginBottom: 6 }}>{children}</div>
);

export default function MoreMenu({ currentUser, onLogout }) {
  const isComm = currentUser && ['admin', 'commentator_admin', 'commentator'].includes(currentUser.role);
  const isAdmin = currentUser && ['admin', 'commentator_admin'].includes(currentUser.role);
  const isCoach = currentUser?.role === 'coach';

  return (
    <div style={{ padding: '16px 16px 20px' }}>
      {currentUser && (
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>
          Signed in as {currentUser.alias_nickname || currentUser.firstname} ({currentUser.role})
        </div>
      )}

      {/* ── ADMIN / COMM ADMIN ── */}
      {isAdmin && (
        <>
          <div onClick={() => goAdmin('home')} style={{
            background: '#F59E0B11', border: '1px solid #F59E0B44', borderRadius: 10,
            padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20 }}>🎙️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>Commentator dashboard</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Home screen with all options</div>
            </div>
          </div>

          <SectionLabel>Manage</SectionLabel>
          <MenuItem icon="📅" title="Match schedule" sub="Create, edit, start live" onClick={() => goAdmin('match_schedule')} />
          <MenuItem icon="📊" title="Game history" sub="Past matches and stats" onClick={() => goAdmin('history')} />
          <MenuItem icon="🏫" title="Institutions & Teams" sub="Schools and team setup" onClick={() => goAdmin('teams')} />
          <MenuItem icon="👥" title="Users" sub="Roles and assignments" onClick={() => goAdmin('users')} />
          <MenuItem icon="📋" title="Pending approvals" sub="Review submissions" onClick={() => goAdmin('pending')} />
          <MenuItem icon="🩺" title="System health" sub="Database and activity" onClick={() => goAdmin('health')} />
          <MenuItem icon="💰" title="Credits" sub="Credit statement and vouchers" onClick={() => goAdmin('credits')} />
        </>
      )}

      {/* ── COMMENTATOR (non-admin) ── */}
      {isComm && !isAdmin && (
        <>
          <div onClick={() => goAdmin('home')} style={{
            background: '#F59E0B11', border: '1px solid #F59E0B44', borderRadius: 10,
            padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20 }}>🎙️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>Commentator dashboard</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Match schedule, recording, credits</div>
            </div>
          </div>

          <SectionLabel>Quick access</SectionLabel>
          <MenuItem icon="📅" title="Match schedule" sub="Create, edit, start live" onClick={() => goAdmin('match_schedule')} />
          <MenuItem icon="📊" title="Game history" sub="Past matches and stats" onClick={() => goAdmin('history')} />
          <MenuItem icon="💰" title="My credits" sub="Credit statement and vouchers" onClick={() => goAdmin('credits')} />
        </>
      )}

      {/* ── COACH ── */}
      {isCoach && !isComm && (
        <>
          <MenuItem icon="📊" title="Coach dashboard" sub="Team analytics and trends"
            onClick={() => { window.location.hash = '#/coach'; }} />
        </>
      )}

      {/* ── CONTRIBUTE (all users) ── */}
      <SectionLabel>Contribute</SectionLabel>
      <MenuItem icon="📝" title="Submit a result" sub="Know a score? Add it"
        onClick={() => { window.location.hash = '#/submit?mode=result'; }} />
      <MenuItem icon="📅" title="Add upcoming match" sub="Fixture not yet listed"
        onClick={() => { window.location.hash = '#/submit?mode=upcoming'; }} />
      <MenuItem icon="🏫" title="Suggest a team" sub="Add a school not yet listed"
        onClick={() => { window.location.hash = '#/submit?mode=team'; }} />
      <MenuItem icon="⚠️" title="Report a mistake" sub="Flag incorrect data"
        onClick={() => { window.location.hash = '#/issues'; }} />

      {/* ── ACCOUNT ── */}
      {currentUser && (
        <>
          <SectionLabel>Account</SectionLabel>
          <MenuItem icon="🔒" title="Security" sub="Password and devices"
            onClick={() => { window.location.hash = '#/security'; }} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span onClick={onLogout} style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, cursor: 'pointer' }}>Sign out</span>
          </div>
        </>
      )}

      {!currentUser && (
        <div style={{ marginTop: 12 }}>
          <div onClick={() => { window.location.hash = '#/login'; }} style={{
            width: '100%', padding: 12, borderRadius: 10, border: 'none',
            background: '#F59E0B', color: '#0B0F1A', fontSize: 13, fontWeight: 700,
            textAlign: 'center', cursor: 'pointer', marginBottom: 8,
          }}>Sign in</div>
          <div onClick={() => { window.location.hash = '#/register'; }} style={{
            width: '100%', padding: 12, borderRadius: 10,
            border: '1px solid #334155', background: 'none', color: '#94A3B8',
            fontSize: 13, fontWeight: 700, textAlign: 'center', cursor: 'pointer',
          }}>Create account</div>
        </div>
      )}

      <div style={{ fontSize: 9, color: '#334155', textAlign: 'center', marginTop: 16 }}>v{APP_VERSION}</div>
    </div>
  );
}

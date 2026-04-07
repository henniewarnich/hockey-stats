import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icons.jsx';

export default function SupporterDashboard({ currentUser, onLogout, onRoleSwitch }) {
  const [openIssues, setOpenIssues] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('issues').select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id).neq('status', 'resolved')
      .then(({ count }) => setOpenIssues(count || 0))
      .catch(() => {});
  }, [currentUser]);

  const handleClearCache = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
    }
    caches?.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      navigator.serviceWorker?.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      window.location.reload(true);
    }).catch(() => window.location.reload(true));
  };

  const items = [
    ["browse", "scoreboard", "#06B6D4", "Browse Matches", "Live scores, upcoming fixtures, results & teams"],
    ["submit_result", "bar_chart", "#10B981", "Submit a Result", "Add a final score for a completed match"],
    ["submit_upcoming", "calendar_plus", "#F59E0B", "Add Upcoming Match", "Schedule a match that hasn't happened yet"],
    ["submit_team", "teams", "#3B82F6", "Suggest a Team", "Add a team not yet in the system"],
    ["issues", "alert_triangle", "#EF4444", "Report an Issue", "Flag a bug, inaccuracy, or problem"],
    ["security", "lock", "#64748B", "Security", "Password, devices & account"],
  ];

  const handleTap = (screen) => {
    if (screen === 'browse') window.location.hash = '#/browse';
    else if (screen === 'submit_result') window.location.hash = '#/submit?mode=result';
    else if (screen === 'submit_upcoming') window.location.hash = '#/submit?mode=upcoming';
    else if (screen === 'submit_team') window.location.hash = '#/submit?mode=team';
    else if (screen === 'issues') window.location.hash = '#/issues';
    else if (screen === 'security') window.location.hash = '#/security';
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />
      <div style={{ padding: "0 16px 20px" }}>
        {items.map(([screen, iconName, iconColor, title, sub]) => (
          <div key={screen} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => handleTap(screen)}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: iconColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={iconName} size={20} color={iconColor} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
              <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>{sub}</div>
            </div>
            {screen === 'issues' && openIssues > 0 && (
              <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: '#F59E0B22', color: '#F59E0B' }}>{openIssues} open</span>
            )}
          </div>
        ))}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 10, color: theme.textDimmer }}>v{APP_VERSION}</div>
          <button onClick={handleClearCache} style={{
            padding: "4px 12px", borderRadius: 6, border: `1px solid ${theme.border}`,
            background: theme.surface, color: theme.textDim, fontSize: 10, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          }}>
            🔄 Update
          </button>
        </div>
      </div>
    </div>
  );
}

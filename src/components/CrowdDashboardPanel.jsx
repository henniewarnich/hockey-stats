import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';

export default function CrowdDashboardPanel({ currentUser }) {
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('issues').select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id).neq('status', 'resolved')
      .then(({ count }) => setOpenCount(count || 0))
      .catch(() => {});
  }, [currentUser]);

  const actions = [
    { icon: "📊", title: "Submit a result", desc: "Add a final score for a completed match", hash: "#/submit?mode=result" },
    { icon: "📅", title: "Add upcoming match", desc: "Schedule a match that hasn't happened yet", hash: "#/submit?mode=upcoming" },
    { icon: "👥", title: "Suggest a team", desc: "Add a team not yet in the system", hash: "#/submit?mode=team" },
  ];

  return (
    <div style={{ padding: "0 16px 8px" }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: theme.textDimmer, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Contribute</div>
      {actions.map(a => (
        <div key={a.hash} onClick={() => { window.location.hash = a.hash; }} style={{
          ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
        }}>
          <div style={{ fontSize: 24 }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>{a.desc}</div>
          </div>
        </div>
      ))}
      <div onClick={() => { window.location.hash = '#/issues'; }} style={{
        ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
        border: "1px solid #EF444433",
      }}>
        <div style={{ fontSize: 24 }}>🚨</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Report an issue</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Flag a bug, inaccuracy, or problem</div>
        </div>
        {openCount > 0 && <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: '#F59E0B22', color: '#F59E0B' }}>{openCount} open</span>}
      </div>
    </div>
  );
}

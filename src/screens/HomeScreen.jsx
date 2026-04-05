import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION } from '../utils/constants.js';
import { S, theme } from '../utils/styles.js';
import PageHeader from '../components/PageHeader.jsx';

export default function HomeScreen({ teamCount, gameCount, onNavigate, syncing, lastSyncError, currentUser, onLogout, onRoleSwitch }) {
  const [scheduledCount, setScheduledCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'upcoming')
      .then(({ count }) => setScheduledCount(count || 0));
    // Fetch pending count for admin badge
    Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('teams').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]).then(([{ count: mc }, { count: tc }]) => setPendingCount((mc || 0) + (tc || 0)));

    // Auto-promote apprentice if criteria met
    if (currentUser?.commentator_status === 'apprentice') {
      checkApprenticePromotion();
    }
  }, []);

  const checkApprenticePromotion = async () => {
    // Count live and recorded matches from audit_log
    const { data: liveAudits } = await supabase.from('audit_log')
      .select('target_id').eq('user_id', currentUser.id).eq('action', 'match_start_live');
    const { data: recordAudits } = await supabase.from('audit_log')
      .select('target_id').eq('user_id', currentUser.id).eq('action', 'video_review_start');
    const liveCount = liveAudits?.length || 0;
    const recordCount = recordAudits?.length || 0;
    const totalMatches = liveCount + recordCount;

    if (liveCount >= 1 && recordCount >= 1) {
      // Promote to qualified
      await supabase.from('profiles').update({ commentator_status: 'qualified' }).eq('id', currentUser.id);
      currentUser.commentator_status = 'qualified';
    }
  };

  const handleClearCache = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
    }
    caches?.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      navigator.serviceWorker?.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      window.location.reload(true);
    }).catch(() => window.location.reload(true));
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch}
        onBack={() => { window.location.hash = ''; }} />
      <div style={{ padding: "0 16px 20px" }}>
        {(() => {
          const isApprentice = currentUser?.role === 'commentator' && currentUser?.commentator_status === 'apprentice';
          return <>
            {isApprentice && (
              <div style={{ background: "#F59E0B18", border: "1px solid #F59E0B44", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 24 }}>🎓</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>Apprentice Commentator</div>
                  <div style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.4 }}>Complete 1 Live and 1 Recorded match to unlock full access. After 5 matches, start earning credits.</div>
                </div>
              </div>
            )}
            {[
            ["match_schedule", "📅", "Match Schedule", `${scheduledCount} upcoming match${scheduledCount !== 1 ? "es" : ""}`],
            ["match_setup", "⚡", "New Match", isApprentice ? "You will be able to create new matches once you qualify as a Commentator" : "Live match or quick score"],
            ["teams", "🏫", "Institutions & Teams", `${teamCount} team${teamCount !== 1 ? "s" : ""}`],
            ["history", "📊", "Game History", `${gameCount} game${gameCount !== 1 ? "s" : ""}`],
            ...(currentUser?.role === 'admin' || currentUser?.role === 'commentator_admin' ? [
              ["users", "🔑", "Users", "Manage user accounts"],
              ["rankings", "🏆", "Rankings", "Manage team rankings"],
              ["pending", "📋", "Pending Approvals", pendingCount > 0 ? `${pendingCount} awaiting review` : "No pending items"],
              ["health", "🩺", "System Health", "Database, users & activity"],
              ["sponsors", "🤝", "Sponsors", "Manage sponsor placements"],
            ] : []),
          ].map(([screen, icon, title, sub]) => {
            const disabled = isApprentice && screen === 'match_setup';
            return (
              <div key={screen} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, opacity: disabled ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }} onClick={() => !disabled && onNavigate(screen)}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
                  <div style={{ fontSize: 11, color: disabled ? "#F59E0B" : theme.textDim, marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            );
          })}
          </>;
        })()}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 10, color: theme.textDimmer }}>v{APP_VERSION}</div>
            <div style={{ fontSize: 9, color: syncing ? theme.accent : theme.success, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 6 }}>{syncing ? "⏳" : "☁️"}</span>
              {syncing ? "Syncing..." : "Cloud connected"}
            </div>
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
    </div>
  );
}

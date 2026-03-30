import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { getContributorStats, getCreditLedger, onQuickScoreApproved, onQuickScoreRejected } from '../utils/credits.js';
import { approvePendingMatch, rejectPendingMatch } from '../utils/sync.js';
import { S, theme } from '../utils/styles.js';
import { parseSASTDate } from '../utils/helpers.js';
import { MATCH_AWAY_TEAM, MATCH_HOME_TEAM, teamShortName } from '../utils/teams.js';

const TIER_META = {
  apprentice: { label: 'Apprentice', color: '#64748B', icon: '🌱', next: 'Graduate' },
  graduate: { label: 'Graduate', color: '#F59E0B', icon: '🎓', next: 'Veteran' },
  veteran: { label: 'Veteran', color: '#10B981', icon: '⭐', next: null },
};

export default function CrowdDashboardPanel({ currentUser }) {
  const [openCount, setOpenCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [showLedger, setShowLedger] = useState(false);
  const [pendingForApproval, setPendingForApproval] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('issues').select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id).neq('status', 'resolved')
      .then(({ count }) => setOpenCount(count || 0))
      .catch(() => {});
    getContributorStats(currentUser.id).then(s => {
      setStats(s);
      // Veterans: load pending quick scores (not own)
      if (s?.tier === 'veteran') loadPendingForApproval();
    }).catch(() => {});
  }, [currentUser]);

  const loadPendingForApproval = async () => {
    const { data } = await supabase
      .from('matches')
      .select(`*, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
      .eq('status', 'pending')
      .eq('submitted_type', 'crowd')
      .neq('submitted_by', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);
    // Only show quick scores (no duration = quick)
    setPendingForApproval((data || []).filter(m => !m.duration || m.duration === 0));
  };

  const handleVetApprove = async (m) => {
    setApprovalLoading(m.id);
    await approvePendingMatch(m.id, currentUser.id, 'ended');
    if (m.submitted_by) await onQuickScoreApproved(m.submitted_by, m.id);
    // Credit the veteran for approving
    const vetStats = await getContributorStats(currentUser.id);
    if (vetStats) {
      const newBal = (vetStats.credits || 0) + 0.5;
      await supabase.from('contributor_stats').update({
        credits: newBal,
        total_approvals: (vetStats.total_approvals || 0) + 1,
      }).eq('user_id', currentUser.id);
      await supabase.from('credit_ledger').insert({
        user_id: currentUser.id, match_id: m.id, action: 'veteran_approval',
        credits: 0.5, balance_after: newBal, tier_before: 'veteran', tier_after: 'veteran',
      });
      setStats(prev => ({ ...prev, credits: newBal, total_approvals: (prev.total_approvals || 0) + 1 }));
    }
    setPendingForApproval(prev => prev.filter(p => p.id !== m.id));
    setApprovalLoading(null);
  };

  const handleVetReject = async (m) => {
    if (!confirm('Reject this score?')) return;
    setApprovalLoading(m.id);
    await rejectPendingMatch(m.id, currentUser.id);
    if (m.submitted_by) await onQuickScoreRejected(m.submitted_by, m.id);
    setPendingForApproval(prev => prev.filter(p => p.id !== m.id));
    setApprovalLoading(null);
  };

  const loadLedger = async () => {
    if (showLedger) { setShowLedger(false); return; }
    const data = await getCreditLedger(currentUser.id, 20);
    setLedger(data);
    setShowLedger(true);
  };

  const tier = TIER_META[stats?.tier] || TIER_META.apprentice;

  const progress = (() => {
    if (!stats) return null;
    if (stats.tier === 'apprentice') {
      return { current: stats.total_quicks_approved || 0, target: 20, label: 'approved quick scores' };
    }
    if (stats.tier === 'graduate') {
      const liveOk = Math.min(stats.total_live_approved || 0, 4);
      const quickOk = Math.min(stats.total_quicks_approved || 0, 4);
      return { current: liveOk + quickOk, target: 8, label: `live (${liveOk}/4) + quicks (${quickOk}/4)` };
    }
    return null;
  })();

  const actions = [
    { icon: "📊", title: "Submit a result", desc: "Add a final score for a completed match", hash: "#/submit?mode=result" },
    { icon: "📅", title: "Add upcoming match", desc: "Schedule a match that hasn't happened yet", hash: "#/submit?mode=upcoming" },
    { icon: "👥", title: "Suggest a team", desc: "Add a team not yet in the system", hash: "#/submit?mode=team" },
  ];

  return (
    <div style={{ padding: "0 16px 8px" }}>
      {stats && (
        <div style={{ background: theme.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: `1px solid ${tier.color}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{tier.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: tier.color }}>{tier.label}</div>
                <div style={{ fontSize: 9, color: theme.textDim }}>
                  {stats.total_quicks_approved || 0} quicks · {stats.total_live_approved || 0} live approved
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: (stats.credits || 0) >= 0 ? '#10B981' : '#EF4444' }}>{Math.round((stats.credits || 0) * 10) / 10}</div>
              <div style={{ fontSize: 8, color: theme.textDim }}>credits</div>
            </div>
          </div>
          {progress && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim, marginBottom: 3 }}>
                <span>Next: {tier.next}</span>
                <span>{progress.current}/{progress.target}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: '#334155', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%`, height: '100%', borderRadius: 2, background: tier.color, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>{progress.label}</div>
            </div>
          )}
          <div onClick={loadLedger} style={{ fontSize: 9, color: '#8B5CF6', fontWeight: 700, marginTop: 8, cursor: 'pointer', textAlign: 'center' }}>
            {showLedger ? '▲ Hide history' : 'View credit history →'}
          </div>
          {showLedger && (
            <div style={{ marginTop: 6, maxHeight: 150, overflowY: 'auto' }}>
              {ledger.length === 0 ? (
                <div style={{ fontSize: 9, color: theme.textDim, textAlign: 'center', padding: 8 }}>No activity yet</div>
              ) : ledger.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #33415522', fontSize: 9 }}>
                  <span style={{ color: theme.textDim }}>{l.action.replace(/_/g, ' ')}</span>
                  <span style={{ fontWeight: 700, color: l.credits > 0 ? '#10B981' : l.credits < 0 ? '#EF4444' : '#64748B' }}>
                    {l.credits > 0 ? '+' : ''}{l.credits}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
      {stats && (stats.tier === 'graduate' || stats.tier === 'veteran') && (
        <div onClick={() => { window.location.hash = '#/record'; }} style={{
          ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
          border: "1px solid #10B98133",
        }}>
          <div style={{ fontSize: 24 }}>📡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Go Live</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
              {stats.tier === 'veteran' ? 'Record live match (Live or Pro)' : 'Record live match (Live mode)'}
            </div>
          </div>
          <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: '#10B98122', color: '#10B981' }}>{TIER_META[stats.tier]?.icon} {TIER_META[stats.tier]?.label}</span>
        </div>
      )}
      {/* Veteran approvals */}
      {stats?.tier === 'veteran' && pendingForApproval.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 6 }}>
            Approve scores ({pendingForApproval.length}) · 0.5 cr each
          </div>
          {pendingForApproval.map(m => {
            const d = m.match_date ? parseSASTDate(m.match_date) : null;
            return (
              <div key={m.id} style={{ ...S.card, padding: '8px 10px', marginBottom: 3 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
                  {teamShortName(m.home_team) || '?'} {m.home_score}–{m.away_score} {teamShortName(m.away_team) || '?'}
                </div>
                <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 6 }}>
                  {d && d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  {m.venue && ` · ${m.venue}`}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={approvalLoading === m.id} onClick={() => handleVetApprove(m)} style={{
                    flex: 1, padding: 6, borderRadius: 6, border: 'none', background: '#10B981', color: '#fff',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', opacity: approvalLoading === m.id ? 0.5 : 1,
                  }}>{approvalLoading === m.id ? '...' : '✓ Approve'}</button>
                  <button disabled={approvalLoading === m.id} onClick={() => handleVetReject(m)} style={{
                    padding: '6px 10px', borderRadius: 6, border: '1px solid #EF444444', background: 'none',
                    color: '#EF4444', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}>✕</button>
                </div>
              </div>
            );
          })}
        </>
      )}
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

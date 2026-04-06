import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { VOUCHER_THRESHOLD, CREDIT_VALUES as CV } from '../utils/credits.js';
import Icon from '../components/Icons.jsx';

export default function AdminCreditsScreen({ currentUser, onBack }) {
  const [loading, setLoading] = useState(true);
  const [commentators, setCommentators] = useState([]);
  const [voucherPool, setVoucherPool] = useState({ available: 0, issued: 0, viewed: 0 });
  const [issuingId, setIssuingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLedger, setUserLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    // Get all commentator-role profiles
    const { data: profiles } = await supabase.from('profiles')
      .select('id, firstname, lastname, alias_nickname, email, role, roles, commentator_status')
      .or('role.in.(admin,commentator_admin,commentator),roles.cs.{commentator},roles.cs.{commentator_admin}');

    // Get contributor_stats for all
    const { data: stats } = await supabase.from('contributor_stats').select('*');
    const statsMap = {};
    (stats || []).forEach(s => { statsMap[s.user_id] = s; });

    // Get audit_log match counts per user
    const { data: audits } = await supabase.from('audit_log')
      .select('user_id, action, target_id')
      .in('action', ['match_start_live', 'video_review_end', 'match_end', 'live_lite_start', 'quick_score_save', 'quick_score_admin', 'schedule_match', 'match_end_live_lite']);

    const auditCounts = {};
    (audits || []).forEach(a => {
      if (!auditCounts[a.user_id]) auditCounts[a.user_id] = { live_pro: 0, video: 0, lite: 0, quick: 0, schedule: 0, total_completed: 0 };
      const c = auditCounts[a.user_id];
      if (a.action === 'match_start_live') c.live_pro++;
      if (a.action === 'video_review_end') c.video++;
      if (a.action === 'match_end_live_lite') c.lite++;
      if (a.action === 'quick_score_save' || a.action === 'quick_score_admin') c.quick++;
      if (a.action === 'schedule_match') c.schedule++;
      if (['match_end', 'video_review_end', 'match_end_live_lite'].includes(a.action)) c.total_completed++;
    });

    // Get voucher pool counts
    const { data: vouchers } = await supabase.from('vouchers').select('status');
    const vc = { available: 0, issued: 0, viewed: 0 };
    (vouchers || []).forEach(v => { vc[v.status] = (vc[v.status] || 0) + 1; });
    setVoucherPool(vc);

    // Build commentator list
    const list = (profiles || []).map(p => {
      const s = statsMap[p.id] || { credits: 0, vouchers_earned: 0 };
      const ac = auditCounts[p.id] || { live_pro: 0, video: 0, lite: 0, quick: 0, schedule: 0, total_completed: 0 };
      const isQualified = p.commentator_status === 'qualified';
      const isEarning = isQualified && ac.total_completed >= 5;
      const credits = s.credits || 0;
      const vouchersEarnable = Math.floor(credits / VOUCHER_THRESHOLD);
      const progressToNext = credits % VOUCHER_THRESHOLD;
      return {
        ...p,
        credits,
        vouchersEarned: s.vouchers_earned || 0,
        isQualified,
        isEarning,
        matchCounts: ac,
        vouchersEarnable,
        progressToNext,
        name: p.alias_nickname || p.firstname || p.email || '?',
      };
    });

    // Sort: earning first (by credits desc), then non-earning
    list.sort((a, b) => {
      if (a.isEarning && !b.isEarning) return -1;
      if (!a.isEarning && b.isEarning) return 1;
      return b.credits - a.credits;
    });

    setCommentators(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleIssueVoucher = async (userId) => {
    if (voucherPool.available <= 0) { alert('No vouchers available. Add vouchers first.'); return; }
    setIssuingId(userId);
    const { data, error } = await supabase.rpc('issue_voucher', { p_user_id: userId, p_admin_id: currentUser.id });
    if (error) alert('Error: ' + error.message);
    else if (data?.error) alert(data.error);
    else await load();
    setIssuingId(null);
  };

  const viewLedger = async (user) => {
    setSelectedUser(user);
    setLedgerLoading(true);
    const { data } = await supabase.from('credit_ledger')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setUserLedger(data || []);
    setLedgerLoading(false);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const LEDGER_LABELS = {
    live_pro: 'Live Pro', live_lite: 'Live Basic', video_same_day: 'Video (same day)',
    video_older: 'Video review', quick_score: 'Quick score', schedule: 'Scheduled',
    result_approved: 'Result approved', submission: 'Submission', issue_confirmed: 'Issue confirmed',
    voucher_issued: 'Voucher issued', voucher_claim: 'Voucher claimed', penalty: 'Penalty',
    quick_approved: 'Quick approved',
  };

  const totalCredits = commentators.reduce((s, c) => s + c.credits, 0);
  const earningCount = commentators.filter(c => c.isEarning).length;
  const earning = commentators.filter(c => c.isEarning);
  const notEarning = commentators.filter(c => !c.isEarning);

  // ── LEDGER DETAIL VIEW ──
  if (selectedUser) {
    return (
      <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16, cursor: 'pointer', padding: 0 }}>←</button>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedUser.name} — credit statement</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#64748B' }}>Balance</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981' }}>{Math.round(selectedUser.credits)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#64748B' }}>Vouchers earned</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>{selectedUser.vouchersEarned}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Transaction history</div>

        {ledgerLoading ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: 30 }}>Loading...</div>
        ) : userLedger.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: 30, fontSize: 12 }}>No credit transactions yet</div>
        ) : (
          userLedger.map(l => (
            <div key={l.id} style={{ background: '#1E293B', borderRadius: 8, padding: '10px 12px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{LEDGER_LABELS[l.action] || l.action}</div>
                <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{fmtDate(l.created_at)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: l.credits >= 0 ? '#10B981' : '#EF4444' }}>{l.credits >= 0 ? '+' : ''}{Math.round(l.credits)}</div>
                <div style={{ fontSize: 9, color: '#64748B' }}>bal: {Math.round(l.balance_after)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ── MAIN VIEW ──
  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16 }}>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#475569', padding: 40 }}>Loading...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981' }}>{Math.round(totalCredits)}</div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Total credits in system</div>
            </div>
            <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>{earningCount}</div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Earning commentators</div>
            </div>
            <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#3B82F6' }}>{voucherPool.available}</div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Vouchers available</div>
            </div>
            <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#8B5CF6' }}>{voucherPool.issued + voucherPool.viewed}</div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Vouchers issued</div>
            </div>
          </div>

          {/* Credit values reference */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Credit values</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[
                ['Live Pro', CV.live_pro], ['Video (same day)', CV.video_same_day], ['Video (older)', CV.video_older],
                ['Live Basic', CV.live_lite], ['Quick score', CV.quick_score], ['Schedule', CV.schedule], ['Issue report', CV.issue],
              ].map(([l, v]) => (
                <span key={l} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#1E293B', color: '#94A3B8' }}>{l}: <span style={{ color: '#10B981', fontWeight: 700 }}>+{v}</span></span>
              ))}
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#1E293B', color: '#94A3B8' }}>Voucher: <span style={{ color: '#F59E0B', fontWeight: 700 }}>100 cr = R100</span></span>
            </div>
          </div>

          {/* Pool warning */}
          {voucherPool.available === 0 && (
            <div style={{ background: '#EF444422', border: '1px solid #EF444444', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
              Voucher pool empty — add codes in Voucher Management
            </div>
          )}

          {/* Earning commentators */}
          {earning.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Commentator leaderboard</div>
              {earning.map(c => {
                const eligible = c.vouchersEarnable > 0;
                const progressPct = Math.min(100, Math.round(c.progressToNext / VOUCHER_THRESHOLD * 100));
                const toNext = VOUCHER_THRESHOLD - c.progressToNext;
                return (
                  <div key={c.id} onClick={() => viewLedger(c)} style={{
                    background: eligible ? '#10B98111' : '#1E293B',
                    border: eligible ? '1px solid #10B98133' : '1px solid transparent',
                    borderRadius: 10, padding: 12, marginBottom: 6, cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F59E0B33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#F59E0B' }}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: 9, color: '#64748B' }}>{c.role} · qualified</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: eligible ? '#10B981' : '#F59E0B' }}>{Math.round(c.credits)}</div>
                        <div style={{ fontSize: 8, color: '#64748B' }}>credits</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 9, color: '#94A3B8', marginBottom: 8, flexWrap: 'wrap' }}>
                      <span>{c.matchCounts.live_pro} Live Pro</span>
                      <span>{c.matchCounts.video} Video</span>
                      <span>{c.matchCounts.lite} Lite</span>
                      <span>{c.matchCounts.quick} Quick</span>
                      <span>{c.matchCounts.schedule} Sched</span>
                      {c.vouchersEarned > 0 && <span style={{ color: '#F59E0B' }}>{c.vouchersEarned} voucher{c.vouchersEarned !== 1 ? 's' : ''}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#0B0F1A', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', background: eligible ? '#10B981' : '#F59E0B', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 9, color: '#64748B' }}>{Math.round(c.progressToNext)}/{VOUCHER_THRESHOLD}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 9, color: eligible ? '#10B981' : '#64748B', fontWeight: eligible ? 700 : 400 }}>
                        {eligible ? `Eligible for ${c.vouchersEarnable}× R100 voucher` : `${Math.round(toNext)} to next voucher`}
                      </span>
                      {eligible ? (
                        <button onClick={(e) => { e.stopPropagation(); handleIssueVoucher(c.id); }} disabled={issuingId === c.id || voucherPool.available <= 0}
                          style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#10B981', color: '#0B0F1A', fontSize: 10, fontWeight: 700, cursor: 'pointer', opacity: issuingId === c.id ? 0.5 : 1 }}>
                          {issuingId === c.id ? '...' : 'Issue'}
                        </button>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#334155', color: '#64748B', fontSize: 9, fontWeight: 700 }}>Not eligible yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Not yet earning */}
          {notEarning.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginTop: 14, marginBottom: 8 }}>Not yet earning</div>
              {notEarning.map(c => {
                const status = c.commentator_status || 'unknown';
                const matchesNeeded = Math.max(0, 5 - c.matchCounts.total_completed);
                let statusText = '';
                if (status === 'trainee') statusText = 'Needs benchmark test';
                else if (status === 'apprentice') statusText = `Apprentice · ${c.matchCounts.total_completed} match${c.matchCounts.total_completed !== 1 ? 'es' : ''}`;
                else if (status === 'qualified' && c.matchCounts.total_completed < 5) statusText = `${matchesNeeded} more match${matchesNeeded !== 1 ? 'es' : ''} to earn`;
                else statusText = status;

                const badgeColor = status === 'trainee' ? '#334155' : status === 'apprentice' ? '#F59E0B' : '#10B981';
                const badgeBg = status === 'trainee' ? '#33415566' : status === 'apprentice' ? '#F59E0B22' : '#10B98122';

                return (
                  <div key={c.id} onClick={() => viewLedger(c)} style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#33415566', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#64748B' }}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>{c.name}</div>
                          <div style={{ fontSize: 9, color: '#475569' }}>{c.role} · {statusText}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: badgeBg, color: badgeColor, fontWeight: 600 }}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}

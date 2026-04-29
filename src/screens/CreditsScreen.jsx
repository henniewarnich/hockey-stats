import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import { MATCH_HOME_TEAM, MATCH_AWAY_TEAM, teamShortName } from '../utils/teams.js';
import { getCreditLedger, getContributorStats, CREDIT_VALUES as CV, VOUCHER_THRESHOLD } from '../utils/credits.js';
import KykieSpinner from '../components/KykieSpinner.jsx';
import AdminBackBar from '../components/AdminBackBar.jsx';

const AUDIT_MAP = {
  match_start_live: { label: 'Live Pro', icon: '🔴', credits: CV.live_pro },
  video_review_start: { label: 'Video review', icon: '📹', credits: CV.video_older },
  match_end_live_lite: { label: 'Live Basic', icon: '📡', credits: CV.live_lite },
  quick_score_save: { label: 'Quick score', icon: '💾', credits: CV.quick_score },
  schedule_match: { label: 'Scheduled', icon: '📅', credits: CV.schedule },
};

const LEDGER_MAP = {
  live_pro: { label: 'Live Pro', icon: '🔴' },
  live_lite: { label: 'Live Basic', icon: '📡' },
  video_same_day: { label: 'Video (same day)', icon: '📹' },
  video_older: { label: 'Video review', icon: '📹' },
  quick_score: { label: 'Quick score', icon: '💾' },
  schedule: { label: 'Scheduled', icon: '📅' },
  result_approved: { label: 'Result approved', icon: '📝' },
  team_approved: { label: 'Team suggestion approved', icon: '🏫' },
  issue_confirmed: { label: 'Issue confirmed', icon: '⚠️' },
  submission: { label: 'Submission approved', icon: '📝' },
  penalty: { label: 'Penalty', icon: '⚠️' },
  voucher_claim: { label: 'Voucher claimed', icon: '🎁' },
  voucher_issued: { label: 'Voucher issued', icon: '🎁' },
};

export default function CreditsScreen({ currentUser, onBack }) {
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [progress, setProgress] = useState({ live: 0, recorded: 0, total: 0 });
  const [stats, setStats] = useState(null);
  const [myVouchers, setMyVouchers] = useState([]);
  const [revealedId, setRevealedId] = useState(null);
  const [copied, setCopied] = useState(null);

  const isApprentice = currentUser?.commentator_status === 'apprentice';
  const isEarning = !isApprentice && progress.total >= 5;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    // Fetch audit entries for match counts + history (non-earning view)
    const { data: audits } = await supabase.from('audit_log')
      .select('action, target_id, created_at, details')
      .eq('user_id', currentUser.id)
      .in('action', ['match_start_live', 'video_review_start', 'match_end_live_lite', 'quick_score_save', 'schedule_match'])
      .order('created_at', { ascending: false })
      .limit(100);

    const liveCount = (audits || []).filter(a => a.action === 'match_start_live').length;
    const recordCount = (audits || []).filter(a => a.action === 'video_review_start').length;
    setProgress({ live: liveCount, recorded: recordCount, total: liveCount + recordCount });

    // Fetch match details for audit history
    const matchIds = [...new Set((audits || []).map(a => a.target_id).filter(Boolean))];
    let matchMap = {};
    if (matchIds.length > 0) {
      const { data: matches } = await supabase.from('matches')
        .select(`id, match_date, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .in('id', matchIds);
      (matches || []).forEach(m => { matchMap[m.id] = m; });
    }

    // Build audit-based history (for non-earning / "would be" view)
    const hist = (audits || []).map(a => {
      const m = matchMap[a.target_id];
      const cv = AUDIT_MAP[a.action];
      return {
        id: a.created_at + a.action,
        date: new Date(a.created_at),
        action: a.action,
        label: cv?.label || a.action,
        icon: cv?.icon || '📋',
        credits: cv?.credits || 0,
        matchName: m ? `${teamShortName(m.home_team)} vs ${teamShortName(m.away_team)}` : (a.details?.home ? `${a.details.home} vs ${a.details.away}` : 'Unknown match'),
      };
    });
    setMatchHistory(hist);

    // Fetch real credit data
    const [led, cs] = await Promise.all([
      getCreditLedger(currentUser.id),
      getContributorStats(currentUser.id),
    ]);

    // Enrich ledger with match names
    const ledgerMatchIds = [...new Set((led || []).map(l => l.match_id).filter(Boolean))];
    if (ledgerMatchIds.length > 0) {
      const { data: lm } = await supabase.from('matches')
        .select(`id, match_date, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .in('id', ledgerMatchIds);
      const lmMap = {}; (lm || []).forEach(m => { lmMap[m.id] = m; });
      led.forEach(l => {
        const m = lmMap[l.match_id];
        l._matchName = m ? `${teamShortName(m.home_team)} vs ${teamShortName(m.away_team)}` : null;
      });
    }

    setLedger(led);
    setStats(cs);

    // Fetch user's vouchers
    const { data: vouchers } = await supabase.from('vouchers')
      .select('*')
      .eq('issued_to', currentUser.id)
      .order('issued_at', { ascending: false });
    setMyVouchers(vouchers || []);

    setLoading(false);
  };

  // Calculate totals
  const wouldBeTotal = matchHistory.reduce((s, h) => s + h.credits, 0);
  const balance = isEarning ? (stats?.credits || 0) : 0;
  const vouchersEarned = stats?.vouchers_earned || 0;
  const toNextVoucher = isEarning ? VOUCHER_THRESHOLD - (Math.max(0, balance) % VOUCHER_THRESHOLD) : VOUCHER_THRESHOLD;

  const statusColor = isApprentice ? '#F59E0B' : !isEarning ? '#3B82F6' : '#10B981';
  const statusLabel = isApprentice ? 'Apprentice Commentator' : !isEarning ? 'Commentator (qualifying)' : 'Commentator';
  const statusMsg = isApprentice
    ? `Credits locked until you complete 5 matches (${progress.total}/5)`
    : !isEarning
      ? `${5 - progress.total} more match${5 - progress.total !== 1 ? 'es' : ''} to start earning`
      : `${toNextVoucher} more credits to your next voucher`;

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 0 }}>
      <AdminBackBar title="My Credits" onBack={onBack} />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ padding: '16px 16px 24px' }}>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><KykieSpinner /></div>
      ) : (
        <>
          {/* Balance circle + status */}
          <div style={{ background: statusColor + '18', border: `1px solid ${statusColor}44`, borderRadius: 10, padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, border: `3px solid ${statusColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: statusColor }}>{balance}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{statusMsg}</div>
            </div>
          </div>

          {/* Stats cards */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {isApprentice || !isEarning ? (
              <>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Matches</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{progress.total}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>of 5 to qualify</div>
                </div>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Live</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{progress.live}</div>
                  <div style={{ fontSize: 10, color: progress.live >= 1 ? '#10B981' : '#64748B' }}>{progress.live >= 1 ? '✓ done' : `${1 - progress.live} needed`}</div>
                </div>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Recorded</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{progress.recorded}</div>
                  <div style={{ fontSize: 10, color: progress.recorded >= 1 ? '#10B981' : '#64748B' }}>{progress.recorded >= 1 ? '✓ done' : `${1 - progress.recorded} needed`}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Balance</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{balance}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>credits</div>
                </div>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Earned</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{ledger.filter(l => l.credits > 0).reduce((s, l) => s + l.credits, 0)}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>all time</div>
                </div>
                <div style={{ flex: 1, background: '#1E293B', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748B' }}>Vouchers</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B' }}>{vouchersEarned}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>claimed</div>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ background: '#1E293B', borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 6 }}>
              <span>{isEarning ? 'Next voucher' : 'Progress to earning'}</span>
              <span>{isEarning ? `${balance % 100} / 100` : `${progress.total} / 5`}</span>
            </div>
            <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${isEarning ? (balance % 100) : (progress.total / 5) * 100}%`, height: '100%', background: statusColor, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>
              {isEarning
                ? `${toNextVoucher} more credits = R100 Takealot voucher`
                : `${5 - progress.total} more match${5 - progress.total !== 1 ? 'es' : ''} to start earning credits`}
            </div>
          </div>

          {/* Match history */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>
            {isEarning ? 'Credit history' : 'Match history'}
          </div>

          {isEarning ? (
            // Earning: show real credit ledger
            ledger.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#64748B', fontSize: 12 }}>No credit entries yet.</div>
            ) : ledger.map((l, i) => {
              const lm = LEDGER_MAP[l.action] || { label: l.action.replace(/_/g, ' '), icon: '📋' };
              const isVoucher = l.action === 'voucher_claim';
              const isPenalty = l.action === 'penalty';
              return (
                <div key={i} style={{
                  background: '#1E293B', borderRadius: isVoucher ? 0 : 8, padding: '10px 12px', marginBottom: 6,
                  ...(isVoucher ? { borderLeft: '3px solid #F59E0B' } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isVoucher ? '#F59E0B' : isPenalty ? '#EF4444' : '#F8FAFC' }}>
                        {l._matchName || lm.label}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                        {new Date(l.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' '}{lm.icon} {lm.label}
                        {isVoucher && ' R100 Takealot'}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: l.credits > 0 ? '#10B981' : isVoucher ? '#F59E0B' : '#EF4444' }}>
                      {l.credits > 0 ? '+' : ''}{l.credits}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Not earning: show audit-based history with "would be" amounts
            matchHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#64748B', fontSize: 12 }}>No matches recorded yet. Start with the Match Schedule.</div>
            ) : matchHistory.map(h => (
              <div key={h.id} style={{ background: '#1E293B', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{h.matchName}</div>
                    <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                      {h.date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}{h.icon} {h.label}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>+0</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>would be +{h.credits}</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* My Vouchers */}
          {myVouchers.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>My Vouchers</div>
              {myVouchers.map(v => {
                const isRevealed = revealedId === v.id;
                return (
                  <div key={v.id} style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {new Date(v.issued_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>R{v.value}</div>
                    </div>
                    {isRevealed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          flex: 1, fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#F59E0B',
                          background: '#0B0F1A', padding: '8px 12px', borderRadius: 8, border: '1px solid #F59E0B44',
                          letterSpacing: 1,
                        }}>{v.code}</div>
                        <button onClick={async () => {
                          try { await navigator.clipboard.writeText(v.code); setCopied(v.id); setTimeout(() => setCopied(null), 2000); } catch { }
                        }} style={{
                          padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: copied === v.id ? '#10B981' : '#F59E0B', color: '#0B0F1A', fontSize: 11, fontWeight: 700,
                        }}>{copied === v.id ? 'Copied!' : 'Copy'}</button>
                      </div>
                    ) : (
                      <button onClick={async () => {
                        setRevealedId(v.id);
                        if (v.status === 'issued') {
                          await supabase.from('vouchers').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', v.id);
                        }
                      }} style={{
                        width: '100%', padding: '10px', borderRadius: 8, cursor: 'pointer',
                        background: '#F59E0B22', border: '1px solid #F59E0B44', color: '#F59E0B',
                        fontSize: 12, fontWeight: 700,
                      }}>Reveal Voucher Code</button>
                    )}
                    {v.status === 'viewed' && !isRevealed && (
                      <div style={{ fontSize: 9, color: '#64748B', marginTop: 4 }}>Viewed {new Date(v.viewed_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: 12, marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>100 credits = R100 Takealot voucher</div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

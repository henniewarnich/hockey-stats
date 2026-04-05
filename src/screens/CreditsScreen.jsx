import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import { MATCH_HOME_TEAM, MATCH_AWAY_TEAM, teamShortName } from '../utils/teams.js';
import { getCreditLedger } from '../utils/credits.js';

const CREDIT_VALUES = {
  match_start_live: { label: 'Live Pro', icon: '🔴', credits: 50 },
  video_review_start: { label: 'Video review', icon: '📹', credits: 20 },
  match_end_live_lite: { label: 'Live Basic', icon: '📡', credits: 10 },
  quick_score: { label: 'Quick score', icon: '💾', credits: 1 },
  schedule_match: { label: 'Scheduled', icon: '📅', credits: 1 },
};

export default function CreditsScreen({ currentUser, onBack }) {
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [progress, setProgress] = useState({ live: 0, recorded: 0, total: 0 });

  const isApprentice = currentUser?.commentator_status === 'apprentice';
  const isEarning = !isApprentice && progress.total >= 5;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    // Fetch audit entries for this user's match activity
    const { data: audits } = await supabase.from('audit_log')
      .select('action, target_id, created_at, details')
      .eq('user_id', currentUser.id)
      .in('action', ['match_start_live', 'video_review_start', 'match_end_live_lite', 'quick_score_save', 'schedule_match'])
      .order('created_at', { ascending: false })
      .limit(100);

    const liveCount = (audits || []).filter(a => a.action === 'match_start_live').length;
    const recordCount = (audits || []).filter(a => a.action === 'video_review_start').length;
    setProgress({ live: liveCount, recorded: recordCount, total: liveCount + recordCount });

    // Fetch match details for each audit entry
    const matchIds = [...new Set((audits || []).map(a => a.target_id).filter(Boolean))];
    let matchMap = {};
    if (matchIds.length > 0) {
      const { data: matches } = await supabase.from('matches')
        .select(`id, match_date, ${MATCH_HOME_TEAM}, ${MATCH_AWAY_TEAM}`)
        .in('id', matchIds);
      (matches || []).forEach(m => { matchMap[m.id] = m; });
    }

    // Build history with match details
    const hist = (audits || []).map(a => {
      const m = matchMap[a.target_id];
      const cv = CREDIT_VALUES[a.action];
      return {
        id: a.created_at + a.action,
        date: new Date(a.created_at),
        action: a.action,
        label: cv?.label || a.action,
        icon: cv?.icon || '📋',
        credits: cv?.credits || 0,
        matchName: m ? `${teamShortName(m.home_team)} vs ${teamShortName(m.away_team)}` : (a.details?.home ? `${a.details.home} vs ${a.details.away}` : 'Unknown match'),
        matchDate: m?.match_date,
      };
    });
    setMatchHistory(hist);

    // Fetch actual credit ledger (for when credits are active)
    const led = await getCreditLedger(currentUser.id);
    setLedger(led);

    setLoading(false);
  };

  // Calculate totals
  const wouldBeTotal = matchHistory.reduce((s, h) => s + h.credits, 0);
  const actualTotal = ledger.reduce((s, l) => s + (l.credits || 0), 0);
  const balance = isEarning ? actualTotal : 0;
  const vouchersEarned = Math.floor(balance > 0 ? 0 : 0); // TODO: from contributor_stats
  const toNextVoucher = isEarning ? 100 - (balance % 100) : 100;

  const statusColor = isApprentice ? '#F59E0B' : !isEarning ? '#3B82F6' : '#10B981';
  const statusLabel = isApprentice ? 'Apprentice Commentator' : !isEarning ? 'Commentator (qualifying)' : 'Commentator';
  const statusMsg = isApprentice
    ? `Credits locked until you complete 5 matches (${progress.total}/5)`
    : !isEarning
      ? `${5 - progress.total} more match${5 - progress.total !== 1 ? 'es' : ''} to start earning`
      : `${toNextVoucher} more credits to your next voucher`;

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: 0 }}>← Back</button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>My credits</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading...</div>
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{wouldBeTotal}</div>
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Match history</div>
          {matchHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#64748B', fontSize: 12 }}>No matches recorded yet. Start with the Match Schedule.</div>
          ) : (
            matchHistory.map(h => (
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
                    {isEarning ? (
                      <div style={{ fontSize: 14, fontWeight: 700, color: h.credits >= 0 ? '#10B981' : '#EF4444' }}>
                        {h.credits >= 0 ? '+' : ''}{h.credits}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>+0</div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>would be +{h.credits}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Credit ledger entries (penalties, vouchers) — only when earning */}
          {isEarning && ledger.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, marginTop: 14 }}>Credit ledger</div>
              {ledger.map((l, i) => (
                <div key={i} style={{
                  background: '#1E293B', borderRadius: 8, padding: '10px 12px', marginBottom: 6,
                  ...(l.action === 'voucher_claim' ? { borderLeft: '3px solid #F59E0B', borderRadius: 0 } : {}),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: l.action === 'voucher_claim' ? '#F59E0B' : '#F8FAFC' }}>
                        {l.action === 'voucher_claim' ? 'Voucher claimed' : l.action.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                        {new Date(l.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {l.action === 'voucher_claim' && ' 🎁 R100 Takealot'}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: l.credits >= 0 ? '#10B981' : l.action === 'voucher_claim' ? '#F59E0B' : '#EF4444' }}>
                      {l.credits >= 0 ? '+' : ''}{l.credits}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Footer */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: 12, marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>100 credits = R100 Takealot voucher</div>
          </div>
        </>
      )}
    </div>
  );
}

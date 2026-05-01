import { useState, useEffect } from 'react';
import { supabase, SUPABASE_URL } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import AdminBackBar from '../components/AdminBackBar.jsx';
import KykieSpinner from '../components/KykieSpinner.jsx';

const TEST_OVERRIDE_EMAIL = 'hennie.warnich@gmail.com';
const IS_STAGING = (SUPABASE_URL || '').includes('gswvccchwrkcw');

function defaultDateFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function instLabel(team) {
  return team?.institution?.short_name || team?.institution?.name || team?.name || '—';
}

function coachName(c) {
  return [c.firstname, c.lastname].filter(Boolean).join(' ') || c.email || 'Unnamed coach';
}

export default function NotifyCoachesScreen({ currentUser, onBack }) {
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [loading, setLoading] = useState(true);
  const [byCoach, setByCoach] = useState([]); // [{ coach, isPending, items: [{ report, match, alreadyNotified }] }]
  const [selected, setSelected] = useState(new Set()); // keys: `${matchId}:${coachId}`
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [testMode, setTestMode] = useState(false);

  const load = async () => {
    setLoading(true);
    setSendResult(null);

    // Reports generated since dateFrom + match + team + institution
    const { data: reports } = await supabase
      .from('match_reports')
      .select(`
        id, match_id, report_type, title, generated_at,
        match:matches!inner(
          id, match_date, home_score, away_score, home_team_id, away_team_id,
          home_team:teams!matches_home_team_id_fkey(id, name, institution:institutions(name, short_name)),
          away_team:teams!matches_away_team_id_fkey(id, name, institution:institutions(name, short_name))
        )
      `)
      .gte('generated_at', dateFrom)
      .order('generated_at', { ascending: false });

    if (!reports || reports.length === 0) {
      setByCoach([]);
      setSelected(new Set());
      setLoading(false);
      return;
    }

    // Coaches for involved teams
    const teamIds = new Set();
    reports.forEach(r => {
      if (r.match?.home_team_id) teamIds.add(r.match.home_team_id);
      if (r.match?.away_team_id) teamIds.add(r.match.away_team_id);
    });

    const { data: coachLinks } = await supabase
      .from('coach_teams')
      .select('coach_id, team_id, coach:profiles!coach_id(id, firstname, lastname, email, coach_status)')
      .in('team_id', [...teamIds]);

    // team_id → array of {coach}
    const coachesByTeam = {};
    (coachLinks || []).forEach(link => {
      if (!link.coach || !link.coach.email) return;
      if (!coachesByTeam[link.team_id]) coachesByTeam[link.team_id] = [];
      coachesByTeam[link.team_id].push(link.coach);
    });

    // Already-notified set
    const { data: logs } = await supabase
      .from('communication_log')
      .select('recipient_id, related_ids')
      .eq('comm_type', 'report_digest');

    const alreadySent = new Set();
    (logs || []).forEach(l => {
      const reportIds = l.related_ids?.report_ids || [];
      reportIds.forEach(rid => alreadySent.add(`${l.recipient_id}:${rid}`));
    });

    // Group by coach
    const map = new Map(); // coach_id → { coach, isPending, items: [{ report, match, alreadyNotified, side }] }
    reports.forEach(r => {
      const homeCoaches = coachesByTeam[r.match?.home_team_id] || [];
      const awayCoaches = coachesByTeam[r.match?.away_team_id] || [];
      const seen = new Set();
      [...homeCoaches.map(c => ({ c, side: 'home' })), ...awayCoaches.map(c => ({ c, side: 'away' }))]
        .forEach(({ c, side }) => {
          if (seen.has(c.id)) return; // dedupe if coach is on both teams
          seen.add(c.id);
          if (!map.has(c.id)) {
            map.set(c.id, {
              coach: c,
              isPending: c.coach_status === 'pending',
              items: [],
            });
          }
          map.get(c.id).items.push({
            report: r,
            match: r.match,
            side,
            alreadyNotified: alreadySent.has(`${c.id}:${r.id}`),
          });
        });
    });

    // Sort coaches: non-pending first, then by lastname/firstname
    const grouped = [...map.values()].sort((a, b) => {
      if (a.isPending !== b.isPending) return a.isPending ? 1 : -1;
      const an = `${a.coach.lastname || ''} ${a.coach.firstname || ''}`.trim().toLowerCase();
      const bn = `${b.coach.lastname || ''} ${b.coach.firstname || ''}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });

    // Default selection: not pending, not already-notified
    const sel = new Set();
    grouped.forEach(g => {
      if (g.isPending) return;
      g.items.forEach(it => {
        if (!it.alreadyNotified) sel.add(`${it.match.id}:${g.coach.id}`);
      });
    });

    setByCoach(grouped);
    setSelected(sel);
    setLoading(false);
  };

  useEffect(() => { load(); }, [dateFrom]);

  const toggle = (matchId, coachId, disabled) => {
    if (disabled) return;
    const key = `${matchId}:${coachId}`;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const toggleAllForCoach = (group, target) => {
    const next = new Set(selected);
    group.items.forEach(it => {
      const key = `${it.match.id}:${group.coach.id}`;
      if (target) next.add(key);
      else next.delete(key);
    });
    setSelected(next);
  };

  // Group selection by coach for sending
  const sendPlan = byCoach
    .map(g => {
      const reportIds = g.items
        .filter(it => selected.has(`${it.match.id}:${g.coach.id}`))
        .map(it => it.report.id);
      return { coach: g.coach, isPending: g.isPending, reportIds };
    })
    .filter(p => p.reportIds.length > 0);

  const totalCoaches = sendPlan.length;
  const totalSelections = selected.size;

  const handleSend = async () => {
    const target = testMode
      ? `everything to ${TEST_OVERRIDE_EMAIL} (TEST — nothing logged)`
      : `${totalCoaches} coach${totalCoaches !== 1 ? 'es' : ''}`;
    if (!confirm(`Send ${totalSelections} report selection${totalSelections !== 1 ? 's' : ''} as digest emails — ${target}?`)) return;

    setSending(true);
    setSendResult(null);
    let sent = 0, failed = 0;
    const errors = [];
    for (const p of sendPlan) {
      try {
        const args = { p_coach_id: p.coach.id, p_report_ids: p.reportIds };
        if (testMode) args.p_override_email = TEST_OVERRIDE_EMAIL;
        const { data, error } = await supabase.rpc('notify_coach_digest', args);
        if (error || data?.error) {
          failed += 1;
          errors.push(`${p.coach.email}: ${error?.message || data?.error}`);
        } else {
          sent += 1;
        }
      } catch (e) {
        failed += 1;
        errors.push(`${p.coach.email}: ${e.message}`);
      }
    }
    setSendResult({ sent, failed, errors, testMode });
    setSending(false);
    if (sent > 0 && !testMode) await load();
  };

  return (
    <div style={S.app}>
      <AdminBackBar title="Notify Coaches" onBack={onBack} />

      {/* Test mode banner — staging only */}
      {IS_STAGING && (
        <div
          onClick={() => setTestMode(t => !t)}
          style={{
            margin: '8px 14px 0',
            padding: '8px 12px',
            borderRadius: 8,
            background: testMode ? '#F59E0B22' : '#1E293B',
            border: `1px solid ${testMode ? '#F59E0B' : '#334155'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <input
            type="checkbox"
            checked={testMode}
            readOnly
            style={{ pointerEvents: 'none' }}
          />
          <div style={{ flex: 1, fontSize: 11, color: testMode ? '#F59E0B' : '#94A3B8', fontWeight: 700 }}>
            🧪 Test mode {testMode && `— all sends go to ${TEST_OVERRIDE_EMAIL}, nothing logged`}
          </div>
        </div>
      )}

      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Reports since</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ ...S.input, fontSize: 12, padding: '6px 10px', flex: 1 }}
        />
        <button onClick={load} style={{
          padding: '6px 12px', borderRadius: 6, border: '1px solid #334155',
          background: theme.surface, color: '#94A3B8', fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      <div style={S.page}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><KykieSpinner /></div>
        ) : byCoach.length === 0 ? (
          <div style={S.empty}>No reports in this date range.</div>
        ) : (
          byCoach.map(g => {
            const allTickedForCoach = g.items.every(it => selected.has(`${it.match.id}:${g.coach.id}`));
            const someTickedForCoach = g.items.some(it => selected.has(`${it.match.id}:${g.coach.id}`));
            const disableCoach = g.isPending && !testMode;
            return (
              <div key={g.coach.id} style={{
                ...S.card, marginBottom: 10,
                opacity: disableCoach ? 0.5 : 1,
                borderLeft: `3px solid ${g.isPending ? '#F59E0B' : '#10B981'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>
                      {coachName(g.coach)}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{g.coach.email}</div>
                  </div>
                  {g.isPending && (
                    <span style={{ fontSize: 9, color: '#F59E0B', background: '#F59E0B22', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      pending {testMode ? '— allowed in test' : "— won't notify"}
                    </span>
                  )}
                  {!disableCoach && (
                    <button
                      onClick={() => toggleAllForCoach(g, !allTickedForCoach)}
                      style={{
                        fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 4,
                        border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer',
                      }}
                    >
                      {allTickedForCoach ? 'Deselect all' : someTickedForCoach ? 'Select all' : 'Select all'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.items.map(it => {
                    const key = `${it.match.id}:${g.coach.id}`;
                    const isChecked = selected.has(key);
                    return (
                      <label key={it.report.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 8px', borderRadius: 6,
                        background: isChecked ? '#10B98111' : 'transparent',
                        border: `1px solid ${isChecked ? '#10B98133' : '#1E293B'}`,
                        cursor: disableCoach ? 'not-allowed' : 'pointer',
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={disableCoach}
                          onChange={() => toggle(it.match.id, g.coach.id, disableCoach)}
                          style={{ cursor: disableCoach ? 'not-allowed' : 'pointer' }}
                        />
                        <div style={{ flex: 1, fontSize: 12 }}>
                          <span style={{ color: theme.text, fontWeight: 600 }}>
                            {instLabel(it.match.home_team)} {it.match.home_score} – {it.match.away_score} {instLabel(it.match.away_team)}
                          </span>
                          <span style={{ color: '#64748B', marginLeft: 6, fontSize: 10 }}>
                            {it.match.match_date} · {it.report.report_type === 'analysis' ? 'Analysis' : it.report.report_type === 'scouting' ? 'Scouting' : 'Season'}
                          </span>
                        </div>
                        {it.alreadyNotified && (
                          <span style={{ fontSize: 9, color: '#10B981', background: '#10B98122', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            already sent
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {!loading && byCoach.length > 0 && (
        <div style={{
          position: 'sticky', bottom: 0, padding: '12px 14px',
          background: '#0B0F1A', borderTop: '1px solid #1E293B',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1, fontSize: 11, color: testMode ? '#F59E0B' : '#94A3B8' }}>
            {totalCoaches === 0
              ? 'Tick reports to notify'
              : testMode
                ? `🧪 ${totalCoaches} test email${totalCoaches !== 1 ? 's' : ''} → ${TEST_OVERRIDE_EMAIL}`
                : `${totalCoaches} coach${totalCoaches !== 1 ? 'es' : ''} will receive a digest covering ${totalSelections} report${totalSelections !== 1 ? 's' : ''}`}
          </div>
          <button
            onClick={handleSend}
            disabled={sending || totalCoaches === 0}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: totalCoaches === 0 ? '#334155' : (testMode ? '#F59E0B' : '#10B981'),
              color: totalCoaches === 0 ? '#64748B' : '#fff',
              fontSize: 12, fontWeight: 700,
              cursor: sending || totalCoaches === 0 ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.5 : 1,
            }}
          >
            {sending ? 'Sending…' : `📧 ${testMode ? 'Test send' : 'Send'} (${totalCoaches})`}
          </button>
        </div>
      )}

      {sendResult && (
        <div style={{
          position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 16px', borderRadius: 10,
          background: sendResult.failed > 0 ? '#EF444422' : (sendResult.testMode ? '#F59E0B22' : '#10B98122'),
          color: sendResult.failed > 0 ? '#EF4444' : (sendResult.testMode ? '#F59E0B' : '#10B981'),
          fontSize: 12, fontWeight: 700,
          border: `1px solid ${sendResult.failed > 0 ? '#EF444444' : (sendResult.testMode ? '#F59E0B44' : '#10B98144')}`,
          maxWidth: 480, textAlign: 'center', zIndex: 50,
        }}>
          <div>
            {sendResult.testMode && '🧪 TEST · '}
            ✓ {sendResult.sent} sent
            {sendResult.failed > 0 && ` · ✗ ${sendResult.failed} failed`}
          </div>
          {sendResult.errors && sendResult.errors.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 500, textAlign: 'left', maxHeight: 180, overflow: 'auto' }}>
              {sendResult.errors.map((e, i) => (
                <div key={i} style={{ padding: '4px 0', borderTop: i > 0 ? '1px solid #EF444433' : 'none' }}>{e}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

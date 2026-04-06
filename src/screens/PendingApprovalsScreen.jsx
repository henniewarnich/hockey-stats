import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { fetchPending, approvePendingMatch, rejectPendingMatch, approvePendingTeam, rejectPendingTeam } from '../utils/sync.js';
import { onQuickScoreApproved, onQuickScoreRejected, onLiveMatchApproved, onLiveMatchRejected, awardSubmissionCredits } from '../utils/credits.js';
import { parseSASTDate } from '../utils/helpers.js';
import NavLogo from '../components/NavLogo.jsx';
import { teamColor, teamDisplayName, teamShortName } from '../utils/teams.js';

const ISSUE_TYPES = { inaccuracy: { label: 'Inaccuracy', color: '#F59E0B', bg: '#F59E0B22' }, bug: { label: 'Bug', color: '#EF4444', bg: '#EF444422' }, other: { label: 'Other', color: '#8B5CF6', bg: '#8B5CF622' } };
const STATUS_MAP = { open: { label: 'Open', color: '#F59E0B', bg: '#F59E0B22' }, in_progress: { label: 'In progress', color: '#3B82F6', bg: '#3B82F622' }, resolved: { label: 'Resolved', color: '#10B981', bg: '#10B98122' } };
const APP_AREAS = { live_matches: 'Live Matches', upcoming_matches: 'Upcoming Matches', statistics: 'Statistics', teams: 'Teams', user_experience: 'User Experience', login: 'Login', other: 'Other' };

export default function PendingApprovalsScreen({ currentUser, onBack }) {
  const [pendingMatches, setPendingMatches] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [issues, setIssues] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [voucherPool, setVoucherPool] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(null);
  const [issueTab, setIssueTab] = useState('active');
  const [issueSearch, setIssueSearch] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [adminStatus, setAdminStatus] = useState('open');
  const [savingIssue, setSavingIssue] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pending, { data: allIssues }, { data: eligibleStats }, { count: availableCount }] = await Promise.all([
      fetchPending(),
      supabase.from('issues')
        .select('*, reporter:profiles!issues_user_id_fkey(firstname, lastname, alias_nickname)')
        .order('created_at', { ascending: false }),
      supabase.from('contributor_stats')
        .select('*, user:profiles!contributor_stats_user_id_fkey(firstname, lastname, alias_nickname, email)')
        .gte('credits', 100),
      supabase.from('vouchers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'available'),
    ]);
    setPendingMatches(pending.pendingMatches);
    setPendingTeams(pending.pendingTeams);
    setIssues(allIssues || []);
    setEligibleUsers(eligibleStats || []);
    setVoucherPool(availableCount || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApproveMatch = async (match, asUpcoming) => {
    setActionLoading(match.id);
    await approvePendingMatch(match.id, currentUser.id, asUpcoming ? 'upcoming' : 'ended');
    // Award credits to submitter
    if (match.submitted_by) {
      const isLive = match.duration && match.duration > 0;
      if (isLive) await onLiveMatchApproved(match.submitted_by, match.id);
      else await awardSubmissionCredits(match.submitted_by, match.id, 'result_approved').catch(() => {});
    }
    setPendingMatches(prev => prev.filter(m => m.id !== match.id));
    setActionLoading(null);
  };

  const handleRejectMatch = async (match) => {
    if (!confirm('Reject this submission?')) return;
    setActionLoading(match.id);
    await rejectPendingMatch(match.id, currentUser.id);
    // Deduct credits from submitter
    if (match.submitted_by) {
      const isLive = match.duration && match.duration > 0;
      if (isLive) await onLiveMatchRejected(match.submitted_by, match.id);
      else await onQuickScoreRejected(match.submitted_by, match.id);
    }
    setPendingMatches(prev => prev.filter(m => m.id !== match.id));
    setActionLoading(null);
  };

  const handleApproveTeam = async (teamId, suggestedBy) => {
    setActionLoading(teamId);
    await approvePendingTeam(teamId, currentUser.id);
    if (suggestedBy) awardSubmissionCredits(suggestedBy, null, 'team_approved').catch(() => {});
    setPendingTeams(prev => prev.filter(t => t.id !== teamId));
    setActionLoading(null);
  };

  const handleRejectTeam = async (teamId) => {
    if (!confirm('Reject this team suggestion?')) return;
    setActionLoading(teamId);
    await rejectPendingTeam(teamId, currentUser.id);
    setPendingTeams(prev => prev.filter(t => t.id !== teamId));
    setActionLoading(null);
  };

  const submitterName = (s) => s?.alias_nickname || (s ? `${s.firstname} ${s.lastname}` : 'Unknown');

  const totalPending = pendingMatches.length + pendingTeams.length;

  const openIssue = (issue) => {
    setSelectedIssue(issue);
    setAdminResponse(issue.admin_response || '');
    setAdminStatus(issue.status);
  };

  const handleSaveIssue = async () => {
    if (!selectedIssue) return;
    setSavingIssue(true);
    const updates = {
      admin_response: adminResponse.trim() || null,
      admin_response_by: adminResponse.trim() ? currentUser.id : null,
      admin_response_at: adminResponse.trim() ? new Date().toISOString() : null,
      status: adminStatus,
      resolved_at: adminStatus === 'resolved' ? new Date().toISOString() : null,
    };
    await supabase.from('issues').update(updates).eq('id', selectedIssue.id);
    setSavingIssue(false);
    setSelectedIssue(null);
    await load();
  };

  const activeIssues = issues.filter(i => i.status !== 'resolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  const shownIssues = (issueTab === 'active' ? activeIssues : resolvedIssues).filter(i => {
    if (!issueSearch.trim()) return true;
    const q = issueSearch.toLowerCase();
    return i.description.toLowerCase().includes(q) ||
      (i.reporter?.firstname || '').toLowerCase().includes(q) ||
      (i.reporter?.alias_nickname || '').toLowerCase().includes(q);
  });

  const pertainsLabel = (i) => {
    if (i.pertains_to === 'app') return `Kykie App · ${APP_AREAS[i.pertains_app_area] || ''}`;
    return i.pertains_to === 'team' ? 'Team' : 'Match';
  };
  const reporterName = (i) => i.reporter?.alias_nickname || (i.reporter ? `${i.reporter.firstname} ${i.reporter.lastname}` : 'Unknown');
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '';

  const handleIssueVoucher = async (userId) => {
    if (voucherPool <= 0) { alert('No vouchers available in pool. Add vouchers first.'); return; }
    setActionLoading(userId);
    const { data, error } = await supabase.rpc('issue_voucher', { p_user_id: userId, p_admin_id: currentUser.id });
    if (error) {
      alert('Error issuing voucher: ' + error.message);
    } else if (data?.error) {
      alert(data.error);
    } else {
      await load();
    }
    setActionLoading(null);
  };

  const eligibleUserName = (eu) => {
    const u = eu.user;
    return u?.alias_nickname || u?.firstname || u?.email || 'Unknown';
  };

  // ═══ ISSUE DETAIL VIEW ═══
  if (selectedIssue) {
    const it = ISSUE_TYPES[selectedIssue.issue_type] || ISSUE_TYPES.other;
    const st = STATUS_MAP[selectedIssue.status] || STATUS_MAP.open;
    return (
      <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16 }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setSelectedIssue(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer' }}>←</button>
          <div style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>ISSUE DETAIL</div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: 10, padding: 12, border: '1px solid #334155', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: it.bg, color: it.color }}>{it.label}</span>
            <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: '#33415544', color: '#94A3B8' }}>{pertainsLabel(selectedIssue)}</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{selectedIssue.description}</div>
          <div style={{ fontSize: 9, color: '#475569', marginTop: 8 }}>Logged by {reporterName(selectedIssue)} · {fmtDate(selectedIssue.created_at)}</div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Admin response</div>
        <textarea
          value={adminResponse} onChange={e => setAdminResponse(e.target.value)}
          placeholder="Write a response..."
          style={{ width: '100%', minHeight: 60, padding: '8px 10px', borderRadius: 8, border: '1px solid #334155', background: '#0B0F1A', color: '#F8FAFC', fontSize: 11, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }}
        />

        <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Set status</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {Object.entries(STATUS_MAP).map(([id, s]) => (
            <div key={id} onClick={() => setAdminStatus(id)} style={{
              flex: 1, textAlign: 'center', padding: 8, borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              border: adminStatus === id ? `2px solid ${s.color}` : '1px solid #334155',
              background: adminStatus === id ? s.bg : '#0B0F1A',
              color: adminStatus === id ? s.color : '#64748B',
            }}>{s.label}</div>
          ))}
        </div>

        <button onClick={handleSaveIssue} disabled={savingIssue} style={{
          width: '100%', padding: 12, borderRadius: 8, border: 'none',
          background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: 'pointer', opacity: savingIssue ? 0.5 : 1,
        }}>{savingIssue ? 'Saving...' : 'Save response & update status'}</button>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>PENDING APPROVALS & ISSUES</div>
        <NavLogo />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
        {[
          { id: 'matches', label: 'Matches', count: pendingMatches.length },
          { id: 'teams', label: 'Teams', count: pendingTeams.length },
          { id: 'vouchers', label: 'Vouchers', count: eligibleUsers.length },
          { id: 'issues', label: 'Issues', count: issues.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? (t.id === 'issues' ? '#8B5CF6' : t.id === 'vouchers' ? '#10B981' : '#F59E0B') : '#0F172A',
            color: tab === t.id ? '#fff' : '#94A3B8',
            fontSize: 11, fontWeight: tab === t.id ? 800 : 500,
          }}>
            {t.label} {t.count > 0 && <span style={{
              fontSize: 10, padding: '1px 5px', borderRadius: 99, marginLeft: 3,
              background: tab === t.id ? 'rgba(255,255,255,0.25)' : '#F59E0B', color: tab === t.id ? '#fff' : '#0B0F1A',
              fontWeight: 800,
            }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>Loading...</div>
      ) : (
        <>
          {tab === 'matches' && (
            pendingMatches.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', marginTop: 40, fontSize: 13 }}>No pending matches</div>
            ) : (
              pendingMatches.map(m => {
                const hasScores = m.home_score > 0 || m.away_score > 0;
                const isResult = hasScores;
                return (
                  <div key={m.id} style={{
                    background: '#1E293B', borderRadius: 10, padding: 12, marginBottom: 10,
                    border: '1px solid #334155',
                  }}>
                    {/* Teams + score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: teamColor(m.home_team) }} />
                      <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{teamDisplayName(m.home_team) || '?'}</div>
                      {isResult && <div style={{ fontSize: 18, fontWeight: 900 }}>{m.home_score}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: teamColor(m.away_team) }} />
                      <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{teamDisplayName(m.away_team) || '?'}</div>
                      {isResult && <div style={{ fontSize: 18, fontWeight: 900 }}>{m.away_score}</div>}
                    </div>

                    {/* Meta */}
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>
                      {m.match_date && parseSASTDate(m.match_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {m.venue && ` · ${m.venue}`}
                      {m.match_type && ` · ${m.match_type}`}
                    </div>

                    {/* Submitter */}
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 10 }}>
                      Submitted by <span style={{ color: '#94A3B8' }}>{submitterName(m.submitter)}</span>
                      {' · '}{isResult ? 'Result' : 'Upcoming'}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleApproveMatch(m, !isResult)} disabled={actionLoading === m.id}
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: '#10B981', color: '#F8FAFC', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {actionLoading === m.id ? '...' : `✓ Approve as ${isResult ? 'Result' : 'Upcoming'}`}
                      </button>
                      <button onClick={() => handleRejectMatch(m)} disabled={actionLoading === m.id}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #EF444444', background: 'none', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {tab === 'teams' && (
            pendingTeams.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', marginTop: 40, fontSize: 13 }}>No pending teams</div>
            ) : (
              pendingTeams.map(t => (
                <div key={t.id} style={{
                  background: '#1E293B', borderRadius: 10, padding: 12, marginBottom: 10,
                  border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: teamColor(t) }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{teamDisplayName(t)}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      Suggested by {submitterName(t.suggester)}
                    </div>
                  </div>
                  <button onClick={() => handleApproveTeam(t.id, t.suggested_by)} disabled={actionLoading === t.id}
                    style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#10B981', color: '#F8FAFC', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {actionLoading === t.id ? '...' : '✓'}
                  </button>
                  <button onClick={() => handleRejectTeam(t.id)} disabled={actionLoading === t.id}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #EF444444', background: 'none', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ))
            )
          )}

          {tab === 'vouchers' && (
            <>
              {voucherPool <= 0 && (
                <div style={{ background: '#EF444422', border: '1px solid #EF444444', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                  No vouchers available in pool. Add vouchers in Voucher Management first.
                </div>
              )}
              {voucherPool > 0 && eligibleUsers.length > voucherPool && (
                <div style={{ background: '#F59E0B22', border: '1px solid #F59E0B44', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                  {eligibleUsers.length} eligible but only {voucherPool} voucher{voucherPool !== 1 ? 's' : ''} available.
                </div>
              )}
              {voucherPool > 0 && (
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>{voucherPool} voucher{voucherPool !== 1 ? 's' : ''} available in pool</div>
              )}
              {eligibleUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', marginTop: 30, fontSize: 12 }}>No commentators at 100+ credits right now</div>
              ) : (
                eligibleUsers.map(eu => {
                  const vouchersEarnable = Math.floor(eu.credits / 100);
                  return (
                    <div key={eu.user_id} style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{eligibleUserName(eu)}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>{eu.user?.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{Math.round(eu.credits)}</div>
                          <div style={{ fontSize: 9, color: '#64748B' }}>credits</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>
                          Eligible for {vouchersEarnable} × R100 voucher{vouchersEarnable !== 1 ? 's' : ''}
                          {' · '}R{Math.round(eu.credits % 100)} carries forward
                        </div>
                        <button onClick={() => handleIssueVoucher(eu.user_id)} disabled={actionLoading === eu.user_id || voucherPool <= 0} style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: '#10B981', color: '#0B0F1A', fontSize: 11, fontWeight: 700,
                          opacity: (actionLoading === eu.user_id || voucherPool <= 0) ? 0.5 : 1,
                        }}>{actionLoading === eu.user_id ? '...' : 'Issue'}</button>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 9, color: '#475569' }}>
                          Vouchers earned: {eu.vouchers_earned || 0} · Live: {eu.total_live || 0} · Quick: {eu.total_quicks || 0}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {tab === 'issues' && (
            <>
              {/* Active / Resolved sub-tabs */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
                <button onClick={() => setIssueTab('active')} style={{
                  flex: 1, padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: issueTab === 'active' ? '#F59E0B22' : '#1E293B', color: issueTab === 'active' ? '#F59E0B' : '#64748B',
                }}>Active ({activeIssues.length})</button>
                <button onClick={() => setIssueTab('resolved')} style={{
                  flex: 1, padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: issueTab === 'resolved' ? '#10B98122' : '#1E293B', color: issueTab === 'resolved' ? '#10B981' : '#64748B',
                }}>Resolved ({resolvedIssues.length})</button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <input
                  value={issueSearch} onChange={e => setIssueSearch(e.target.value)}
                  placeholder="Search issues..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #334155', background: '#1E293B', color: '#F8FAFC', fontSize: 11, outline: 'none', boxSizing: 'border-box' }}
                />
                {issueSearch && <button onClick={() => setIssueSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}>✕</button>}
              </div>

              {/* Issue list */}
              {shownIssues.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', marginTop: 40, fontSize: 13 }}>
                  {issueSearch ? 'No issues found' : issueTab === 'active' ? 'No active issues' : 'No resolved issues'}
                </div>
              ) : (
                shownIssues.map(issue => {
                  const it = ISSUE_TYPES[issue.issue_type] || ISSUE_TYPES.other;
                  const st = STATUS_MAP[issue.status] || STATUS_MAP.open;
                  return (
                    <div key={issue.id} onClick={() => openIssue(issue)} style={{
                      background: '#1E293B', borderRadius: 8, padding: '10px 12px', marginBottom: 4,
                      border: '1px solid #33415544', cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: it.bg, color: it.color }}>{it.label}</span>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.description}</div>
                        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                      </div>
                      <div style={{ fontSize: 9, color: '#64748B', marginTop: 3 }}>
                        {pertainsLabel(issue)} · {reporterName(issue)} · {fmtDate(issue.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

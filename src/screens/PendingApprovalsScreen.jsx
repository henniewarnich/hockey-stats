import { useState, useEffect } from 'react';
import { fetchPending, approvePendingMatch, rejectPendingMatch, approvePendingTeam, rejectPendingTeam } from '../utils/sync.js';
import { parseSASTDate } from '../utils/helpers.js';
import NavLogo from '../components/NavLogo.jsx';

export default function PendingApprovalsScreen({ currentUser, onBack }) {
  const [pendingMatches, setPendingMatches] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    const { pendingMatches: pm, pendingTeams: pt } = await fetchPending();
    setPendingMatches(pm);
    setPendingTeams(pt);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApproveMatch = async (matchId, asUpcoming) => {
    setActionLoading(matchId);
    await approvePendingMatch(matchId, currentUser.id, asUpcoming ? 'upcoming' : 'ended');
    setPendingMatches(prev => prev.filter(m => m.id !== matchId));
    setActionLoading(null);
  };

  const handleRejectMatch = async (matchId) => {
    if (!confirm('Reject this submission?')) return;
    setActionLoading(matchId);
    await rejectPendingMatch(matchId, currentUser.id);
    setPendingMatches(prev => prev.filter(m => m.id !== matchId));
    setActionLoading(null);
  };

  const handleApproveTeam = async (teamId) => {
    setActionLoading(teamId);
    await approvePendingTeam(teamId, currentUser.id);
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

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>PENDING APPROVALS</div>
        <NavLogo />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
        {[
          { id: 'matches', label: 'Matches', count: pendingMatches.length },
          { id: 'teams', label: 'Teams', count: pendingTeams.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
            background: tab === t.id ? '#F59E0B' : '#0F172A',
            color: tab === t.id ? '#0B0F1A' : '#94A3B8',
            fontSize: 12, fontWeight: tab === t.id ? 800 : 500,
          }}>
            {t.label} {t.count > 0 && <span style={{
              fontSize: 10, padding: '1px 5px', borderRadius: 99, marginLeft: 4,
              background: tab === t.id ? '#0B0F1A33' : '#F59E0B', color: tab === t.id ? '#0B0F1A' : '#0B0F1A',
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
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: m.home_team?.color || '#64748B' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{m.home_team?.name || '?'}</div>
                      {isResult && <div style={{ fontSize: 18, fontWeight: 900 }}>{m.home_score}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: m.away_team?.color || '#64748B' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{m.away_team?.name || '?'}</div>
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
                      <button onClick={() => handleApproveMatch(m.id, !isResult)} disabled={actionLoading === m.id}
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: '#10B981', color: '#F8FAFC', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {actionLoading === m.id ? '...' : `✓ Approve as ${isResult ? 'Result' : 'Upcoming'}`}
                      </button>
                      <button onClick={() => handleRejectMatch(m.id)} disabled={actionLoading === m.id}
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
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.color || '#64748B' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      Suggested by {submitterName(t.suggester)}
                    </div>
                  </div>
                  <button onClick={() => handleApproveTeam(t.id)} disabled={actionLoading === t.id}
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
        </>
      )}
    </div>
  );
}

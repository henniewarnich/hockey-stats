import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { archiveMatchStats } from '../utils/sync.js';
import { APP_VERSION } from '../utils/constants.js';
import NavLogo from '../components/NavLogo.jsx';

const THRESHOLDS = {
  matches:        { green: 1000, amber: 5000 },
  match_events:   { green: 50000, amber: 200000 },
  match_stats:    { green: 10000, amber: 50000 },
  profiles:       { green: 500, amber: 2000 },
  teams:          { green: 500, amber: 2000 },
  event_reactions:{ green: 10000, amber: 50000 },
  audit_log:      { green: 10000, amber: 40000 },
  match_viewers:  { green: 10000, amber: 50000 },
  coach_teams:    { green: 500, amber: 2000 },
  match_commentators: { green: 500, amber: 2000 },
  ranking_sets:   { green: 500, amber: 2000 },
  rankings:       { green: 5000, amber: 20000 },
};

const TABLES = ['matches','match_events','match_stats','profiles','teams','event_reactions','audit_log','match_viewers','coach_teams','match_commentators','ranking_sets','rankings'];

function badge(count, table) {
  const t = THRESHOLDS[table] || { green: 10000, amber: 50000 };
  if (count >= t.amber) return { label: 'HIGH', bg: '#EF444422', color: '#EF4444' };
  if (count >= t.green) return { label: 'WARN', bg: '#F59E0B22', color: '#F59E0B' };
  return { label: 'OK', bg: '#10B98122', color: '#10B981' };
}

export default function SystemHealthScreen({ onBack }) {
  const [tableCounts, setTableCounts] = useState({});
  const [userStats, setUserStats] = useState({ total: 0, active24h: 0, active7d: 0, active30d: 0, byRole: {} });
  const [matchStats, setMatchStats] = useState({ live: 0, pending: 0, upcoming: 0 });
  const [dbSize, setDbSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState(0);
  const [archiving, setArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Table row counts
      const counts = {};
      await Promise.all(TABLES.map(async (t) => {
        const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
        counts[t] = count || 0;
      }));
      setTableCounts(counts);

      // Match stats
      const [{ count: liveCount }, { count: pendingCount }, { count: upcomingCount }] = await Promise.all([
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
      ]);
      setMatchStats({ live: liveCount || 0, pending: pendingCount || 0, upcoming: upcomingCount || 0 });

      // User stats
      const { data: allProfiles } = await supabase.from('profiles').select('role, last_seen_at, blocked');
      if (allProfiles) {
        const now = Date.now();
        const h24 = 24 * 60 * 60 * 1000;
        const d7 = 7 * h24;
        const d30 = 30 * h24;
        const active = allProfiles.filter(p => !p.blocked);
        const byRole = {};
        active.forEach(p => { byRole[p.role] = (byRole[p.role] || 0) + 1; });
        setUserStats({
          total: active.length,
          active24h: active.filter(p => p.last_seen_at && (now - new Date(p.last_seen_at).getTime()) < h24).length,
          active7d: active.filter(p => p.last_seen_at && (now - new Date(p.last_seen_at).getTime()) < d7).length,
          active30d: active.filter(p => p.last_seen_at && (now - new Date(p.last_seen_at).getTime()) < d30).length,
          byRole,
        });
      }

      // DB size estimate (rough: sum of row counts * avg row size)
      const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);
      // Rough estimate: match_events ~200 bytes/row, others ~500 bytes/row avg
      const estBytes = (counts.match_events || 0) * 200 + (totalRows - (counts.match_events || 0)) * 500;
      setDbSize({ totalRows, estMB: Math.round(estBytes / 1024 / 1024) });

      setLoading(false);
    };
    load();

    // Visitor presence
    const channel = supabase.channel('health-presence', { config: { presence: { key: Math.random().toString(36).slice(2) } } });
    channel.on('presence', { event: 'sync' }, () => {
      setVisitors(Object.keys(channel.presenceState()).length);
    });
    channel.subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({}); });
    return () => supabase.removeChannel(channel);
  }, []);

  const totalRows = dbSize?.totalRows || 0;
  const dbPct = dbSize ? Math.max(1, Math.round((dbSize.estMB / 500) * 100)) : 0;
  const dbColor = dbPct > 80 ? '#EF4444' : dbPct > 50 ? '#F59E0B' : '#10B981';

  const roleMeta = {
    admin: { color: '#EF4444' },
    commentator_admin: { label: 'Comm Admin', color: '#F59E0B' },
    commentator: { color: '#10B981' },
    coach: { color: '#8B5CF6' },
    crowd: { color: '#3B82F6' },
  };

  const cardStyle = { background: '#1E293B', borderRadius: 8, padding: '10px 12px' };

  return (
    <div style={{
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>SYSTEM HEALTH</div>
        <NavLogo />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>Loading metrics...</div>
      ) : (
        <>
          {/* DB size + connections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ ...cardStyle, borderLeft: `3px solid ${dbColor}`, borderRadius: 0 }}>
              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Est. database size</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>~{dbSize.estMB} <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>/ 500 MB</span></div>
              <div style={{ height: 4, background: '#334155', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: 4, background: dbColor, borderRadius: 2, width: `${Math.min(dbPct, 100)}%` }} />
              </div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '3px solid #10B981', borderRadius: 0 }}>
              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Total rows</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{totalRows.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 6 }}>
                {totalRows < 100000 ? 'Healthy' : totalRows < 400000 ? 'Growing' : 'Consider pruning'}
              </div>
            </div>
          </div>

          {/* Table row counts */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>Table row counts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {TABLES.map(t => {
              const count = tableCounts[t] || 0;
              const b = badge(count, t);
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', ...cardStyle }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{t}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginRight: 8 }}>{count.toLocaleString()}</div>
                  <div style={{ padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: b.bg, color: b.color }}>{b.label}</div>
                </div>
              );
            })}
          </div>

          {/* Activity */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>Activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: matchStats.live > 0 ? '#10B981' : '#F8FAFC' }}>{matchStats.live}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Live now</div>
            </div>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: matchStats.pending > 0 ? '#F59E0B' : '#F8FAFC' }}>{matchStats.pending}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Pending</div>
            </div>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{visitors}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Online now</div>
            </div>
          </div>

          {/* User activity */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>User activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981' }}>{userStats.active24h}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Active 24h</div>
            </div>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>{userStats.active7d}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Active 7d</div>
            </div>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#94A3B8' }}>{userStats.active30d}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Active 30d</div>
            </div>
          </div>

          {/* Users by role */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>Users by role</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {Object.entries(userStats.byRole).map(([role, count]) => {
              const meta = roleMeta[role] || { color: '#64748B' };
              const label = meta.label || role.charAt(0).toUpperCase() + role.slice(1);
              return (
                <div key={role} style={{ padding: '6px 12px', borderRadius: 8, background: meta.color + '22', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: meta.color }}>{count}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{label}</div>
                </div>
              );
            })}
          </div>

          {/* Thresholds legend */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>Thresholds</div>
          <div style={{ ...cardStyle, fontSize: 11, color: '#64748B', lineHeight: 2 }}>
            <div><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#10B981', marginRight: 6 }} />Green: within safe limits</div>
            <div><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#F59E0B', marginRight: 6 }} />Amber: approaching limits — monitor</div>
            <div><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#EF4444', marginRight: 6 }} />Red: action needed (prune / upgrade)</div>
          </div>

          {/* Archive & Prune */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, margin: '14px 0 8px', textTransform: 'uppercase' }}>Data Management</div>
          <div style={cardStyle}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10 }}>
              Archive pre-computes stats for ended matches so raw events can be pruned later. New matches are archived automatically on end.
            </div>
            <button
              disabled={archiving}
              onClick={async () => {
                setArchiving(true);
                setArchiveResult(null);
                try {
                  // Find ended matches with events that aren't archived yet
                  const { data: unarchived } = await supabase
                    .from('matches')
                    .select('id')
                    .eq('status', 'ended')
                    .gt('duration', 0)
                    .or('stats_archived.eq.false,stats_archived.is.null');
                  if (!unarchived || unarchived.length === 0) {
                    setArchiveResult('All matches already archived');
                  } else {
                    let ok = 0, fail = 0;
                    for (const m of unarchived) {
                      const success = await archiveMatchStats(m.id);
                      if (success) ok++; else fail++;
                    }
                    setArchiveResult(`Archived ${ok} match${ok !== 1 ? 'es' : ''}${fail > 0 ? `, ${fail} failed` : ''}`);
                    // Refresh table counts
                    const { count } = await supabase.from('match_stats').select('id', { count: 'exact', head: true });
                    setTableCounts(prev => ({ ...prev, match_stats: count || 0 }));
                  }
                } catch (e) {
                  setArchiveResult('Error: ' + e.message);
                }
                setArchiving(false);
              }}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700,
                background: archiving ? '#334155' : '#3B82F622', color: archiving ? '#64748B' : '#3B82F6',
                cursor: archiving ? 'default' : 'pointer', marginBottom: 6,
              }}
            >
              {archiving ? '⏳ Archiving...' : '📦 Backfill Archives'}
            </button>
            {archiveResult && (
              <div style={{ fontSize: 10, color: archiveResult.startsWith('Error') ? '#EF4444' : '#10B981', marginTop: 4 }}>{archiveResult}</div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 9, color: '#334155' }}>v{APP_VERSION}</div>
        </>
      )}
    </div>
  );
}

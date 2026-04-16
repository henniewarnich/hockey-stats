import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import KykieSpinner from '../components/KykieSpinner.jsx';

const TIER_META = {
  apprentice: { label: 'Apprentice', color: '#64748B', icon: '🌱' },
  graduate: { label: 'Graduate', color: '#F59E0B', icon: '🎓' },
  veteran: { label: 'Veteran', color: '#10B981', icon: '⭐' },
};

export default function ContributorScreen({ onBack }) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | apprentice | graduate | veteran
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [runningDemotion, setRunningDemotion] = useState(false);
  const [demotionResult, setDemotionResult] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contributor_stats')
      .select('*, profile:profiles!contributor_stats_user_id_fkey(firstname, lastname, alias_nickname, email)')
      .order('credits', { ascending: false });
    setContributors(data || []);
    setLoading(false);
  };

  const openDetail = async (c) => {
    setSelected(c);
    const { data } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', c.user_id)
      .order('created_at', { ascending: false })
      .limit(30);
    setLedger(data || []);
  };

  // Auto-demotion check
  const runDemotions = async () => {
    setRunningDemotion(true);
    setDemotionResult(null);
    let demoted = 0;
    const now = Date.now();
    const y12 = 365 * 24 * 60 * 60 * 1000;

    for (const c of contributors) {
      if (c.tier !== 'veteran') continue;
      let shouldDemote = false;
      let reason = '';

      // Inactive 12+ months
      if (c.last_submission_at && (now - new Date(c.last_submission_at).getTime()) > y12) {
        shouldDemote = true;
        reason = 'inactive_12m';
      }

      // Accuracy below 80%
      const totalSubmissions = (c.total_quicks_approved || 0) + (c.total_quicks_rejected || 0) + (c.total_live_approved || 0) + (c.total_live_rejected || 0);
      const totalApproved = (c.total_quicks_approved || 0) + (c.total_live_approved || 0);
      if (totalSubmissions >= 5 && totalApproved / totalSubmissions < 0.8) {
        shouldDemote = true;
        reason = 'accuracy_below_80';
      }

      if (shouldDemote) {
        await supabase.from('contributor_stats').update({ tier: 'graduate' }).eq('user_id', c.user_id);
        await supabase.from('credit_ledger').insert({
          user_id: c.user_id, action: 'tier_demotion', credits: 0,
          balance_after: c.credits, tier_before: 'veteran', tier_after: 'graduate',
        });
        demoted++;
      }
    }

    setDemotionResult(`${demoted} veteran${demoted !== 1 ? 's' : ''} demoted`);
    setRunningDemotion(false);
    if (demoted > 0) load();
  };

  const name = (c) => {
    const p = c.profile;
    return p?.alias_nickname || (p ? `${p.firstname} ${p.lastname}` : 'Unknown');
  };

  const filtered = contributors.filter(c => {
    if (filter !== 'all' && c.tier !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const n = name(c).toLowerCase();
      return n.includes(q);
    }
    return true;
  });

  const tierCounts = { apprentice: 0, graduate: 0, veteran: 0 };
  contributors.forEach(c => { tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1; });

  // Detail view
  if (selected) {
    const t = TIER_META[selected.tier] || TIER_META.apprentice;
    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Contributors</button>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, fontWeight: 700, background: t.color + '22', color: t.color }}>{t.icon} {t.label}</span>
        </div>
        <div style={{ padding: "0 14px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: theme.text, marginBottom: 4 }}>{name(selected)}</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12 }}>{selected.profile?.email}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
            {[
              [Math.round((selected.credits || 0) * 10) / 10, 'Credits', (selected.credits || 0) >= 0 ? '#10B981' : '#EF4444'],
              [selected.total_quicks_approved || 0, 'Quicks ✓', '#10B981'],
              [selected.total_quicks_rejected || 0, 'Quicks ✕', '#EF4444'],
              [selected.total_live_approved || 0, 'Live ✓', '#10B981'],
              [selected.total_live_rejected || 0, 'Live ✕', '#EF4444'],
              [selected.total_approvals || 0, 'Approvals', '#8B5CF6'],
            ].map(([val, label, color]) => (
              <div key={label} style={{ background: theme.surface, borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: 18, fontWeight: 900, color }}>{val}</div>
                <div style={{ fontSize: 8, color: theme.textDim }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Credit history</div>
          <div style={{ background: theme.surface, borderRadius: 8, padding: '8px 10px', border: `1px solid ${theme.border}`, maxHeight: 300, overflowY: 'auto' }}>
            {ledger.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 12, color: theme.textDim, fontSize: 10 }}>No activity</div>
            ) : ledger.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #33415522', fontSize: 10 }}>
                <div>
                  <span style={{ color: theme.textDim }}>{l.action.replace(/_/g, ' ')}</span>
                  {l.tier_before !== l.tier_after && (
                    <span style={{ marginLeft: 6, fontSize: 8, color: '#F59E0B' }}>{l.tier_before} → {l.tier_after}</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, color: l.credits > 0 ? '#10B981' : l.credits < 0 ? '#EF4444' : '#64748B' }}>
                  {l.credits > 0 ? '+' : ''}{l.credits}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ padding: "12px 14px 6px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="16" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="3"/><circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="3"/></svg>
          ← kykie
        </button>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B", marginTop: 8 }}>Contributors</div>
      </div>

      {/* Tier summary */}
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 8px' }}>
        {[['all', `All (${contributors.length})`, '#F8FAFC'], ...Object.entries(TIER_META).map(([id, m]) => [id, `${m.icon} ${tierCounts[id] || 0}`, m.color])].map(([id, label, color]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', fontSize: 9, fontWeight: 700, cursor: 'pointer',
            background: filter === id ? '#10B98122' : '#1E293B',
            color: filter === id ? '#10B981' : '#64748B',
          }}>{label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '0 14px 8px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contributors..."
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* List */}
      <div style={{ padding: '0 14px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}><KykieSpinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#475569', fontSize: 12 }}>No contributors found</div>
        ) : filtered.map(c => {
          const t = TIER_META[c.tier] || TIER_META.apprentice;
          return (
            <div key={c.id} onClick={() => openDetail(c)} style={{
              ...S.card, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{name(c)}</div>
                <div style={{ fontSize: 9, color: theme.textDim }}>
                  {c.total_quicks_approved || 0}q · {c.total_live_approved || 0}l
                  {c.last_submission_at && ` · last ${new Date(c.last_submission_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: (c.credits || 0) >= 0 ? '#10B981' : '#EF4444' }}>{Math.round((c.credits || 0) * 10) / 10}</div>
                <div style={{ fontSize: 8, color: t.color, fontWeight: 700 }}>{t.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-demotion */}
      <div style={{ padding: '0 14px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Maintenance</div>
        <button disabled={runningDemotion} onClick={runDemotions} style={{
          width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface,
          color: theme.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: runningDemotion ? 0.5 : 1,
        }}>{runningDemotion ? 'Checking...' : 'Run veteran demotions (inactive 12m+ / accuracy <80%)'}</button>
        {demotionResult && <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4, textAlign: 'center' }}>{demotionResult}</div>}
      </div>
    </div>
  );
}

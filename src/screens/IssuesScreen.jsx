import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import { parseSASTDate } from '../utils/helpers.js';

const ISSUE_TYPES = [
  { id: 'inaccuracy', label: 'Inaccuracy', color: '#F59E0B', bg: '#F59E0B22' },
  { id: 'bug', label: 'Bug', color: '#EF4444', bg: '#EF444422' },
  { id: 'other', label: 'Other', color: '#8B5CF6', bg: '#8B5CF622' },
];
const PERTAINS = [
  { id: 'team', label: 'Team' },
  { id: 'match', label: 'Match' },
  { id: 'app', label: 'Kykie App' },
];
const APP_AREAS = [
  { id: 'live_matches', label: 'Live Matches' },
  { id: 'upcoming_matches', label: 'Upcoming Matches' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'teams', label: 'Teams' },
  { id: 'user_experience', label: 'User Experience' },
  { id: 'login', label: 'Login' },
  { id: 'other', label: 'Other' },
];
const STATUS_COLORS = {
  open: { color: '#F59E0B', bg: '#F59E0B22', label: 'Open' },
  in_progress: { color: '#3B82F6', bg: '#3B82F622', label: 'In progress' },
  resolved: { color: '#10B981', bg: '#10B98122', label: 'Resolved' },
};

export default function IssuesScreen({ currentUser, onBack }) {
  const [view, setView] = useState('list'); // list | detail | form
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selected, setSelected] = useState(null);

  // Form state
  const [issueType, setIssueType] = useState('inaccuracy');
  const [pertains, setPertains] = useState('team');
  const [pertainsRef, setPertainsRef] = useState(null);
  const [appArea, setAppArea] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ref picker data
  const [allTeams, setAllTeams] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [matchSearch, setMatchSearch] = useState('');

  useEffect(() => { loadIssues(); }, []);

  const loadIssues = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('issues')
      .select('*, profiles:user_id(firstname, lastname, alias_nickname)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    setIssues(data || []);
    setLoading(false);
  };

  const loadRefData = async () => {
    const [{ data: teams }, { data: matches }] = await Promise.all([
      supabase.from('teams').select('id, name, color').or('status.eq.active,status.is.null').order('name'),
      supabase.from('matches').select('id, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name), match_date, status')
        .in('status', ['upcoming', 'live', 'ended']).order('match_date', { ascending: false }).limit(100),
    ]);
    setAllTeams(teams || []);
    setAllMatches(matches || []);
  };

  const openForm = () => {
    setIssueType('inaccuracy');
    setPertains('team');
    setPertainsRef(null);
    setAppArea('');
    setDescription('');
    setTeamSearch('');
    setMatchSearch('');
    loadRefData();
    setView('form');
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    await supabase.from('issues').insert({
      user_id: currentUser.id,
      issue_type: issueType,
      pertains_to: pertains,
      pertains_ref: pertains === 'app' ? null : pertainsRef,
      pertains_app_area: pertains === 'app' ? appArea : null,
      description: description.trim(),
    });
    setSubmitting(false);
    await loadIssues();
    setView('list');
  };

  const active = issues.filter(i => i.status !== 'resolved');
  const resolved = issues.filter(i => i.status === 'resolved');
  const shown = activeTab === 'active' ? active : resolved;

  const typeStyle = (t) => {
    const cfg = ISSUE_TYPES.find(x => x.id === t) || ISSUE_TYPES[2];
    return { fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: cfg.bg, color: cfg.color };
  };
  const statusStyle = (s) => {
    const cfg = STATUS_COLORS[s] || STATUS_COLORS.open;
    return { fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: cfg.bg, color: cfg.color };
  };

  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const pertainsLabel = (issue) => {
    if (issue.pertains_to === 'app') {
      const area = APP_AREAS.find(a => a.id === issue.pertains_app_area);
      return `Kykie App · ${area?.label || issue.pertains_app_area || ''}`;
    }
    return issue.pertains_to === 'team' ? 'Team' : 'Match';
  };

  // ═══ DETAIL VIEW ═══
  if (view === 'detail' && selected) {
    const sc = STATUS_COLORS[selected.status] || STATUS_COLORS.open;
    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => { setSelected(null); setView('list'); }} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← My Issues</button>
          <span style={{ ...statusStyle(selected.status), fontSize: 10, padding: '4px 10px' }}>{sc.label}</span>
        </div>
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ background: "#1E293B", borderRadius: 10, padding: 12, border: "1px solid #33415544" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <span style={typeStyle(selected.issue_type)}>{ISSUE_TYPES.find(t => t.id === selected.issue_type)?.label}</span>
              <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: '#33415544', color: '#94A3B8' }}>{pertainsLabel(selected)}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 6 }}>{selected.description.length > 80 ? selected.description.slice(0, 80) + '...' : selected.description}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>{selected.description}</div>
            <div style={{ fontSize: 9, color: "#475569", marginTop: 8 }}>Logged {fmtDate(selected.created_at)}</div>
          </div>

          {selected.admin_response && (
            <div style={{ marginTop: 8, background: "#0B0F1A", borderRadius: 8, padding: "10px 12px", border: "1px solid #33415533" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>Admin response</div>
              <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>{selected.admin_response}</div>
              <div style={{ fontSize: 9, color: "#475569", marginTop: 4 }}>{fmtDate(selected.admin_response_at)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ FORM VIEW ═══
  if (view === 'form') {
    const filteredTeams = teamSearch.trim()
      ? allTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
      : allTeams.slice(0, 10);
    const filteredMatches = matchSearch.trim()
      ? allMatches.filter(m => (m.home_team?.name || '').toLowerCase().includes(matchSearch.toLowerCase()) || (m.away_team?.name || '').toLowerCase().includes(matchSearch.toLowerCase()))
      : allMatches.slice(0, 10);

    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ padding: "12px 14px 6px" }}>
          <button onClick={() => setView('list')} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Cancel</button>
        </div>
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B", marginBottom: 14 }}>New Issue</div>

          {/* Issue type */}
          <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Issue type</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {ISSUE_TYPES.map(t => (
              <div key={t.id} onClick={() => setIssueType(t.id)} style={{
                flex: 1, textAlign: "center", padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: issueType === t.id ? `2px solid ${t.color}` : "1px solid #334155",
                background: issueType === t.id ? t.bg : "#0B0F1A",
                color: issueType === t.id ? t.color : "#64748B",
              }}>{t.label}</div>
            ))}
          </div>

          {/* Pertains to */}
          <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Pertains to</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {PERTAINS.map(p => (
              <div key={p.id} onClick={() => { setPertains(p.id); setPertainsRef(null); setAppArea(''); }} style={{
                flex: 1, textAlign: "center", padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: pertains === p.id ? "2px solid #F59E0B" : "1px solid #334155",
                background: pertains === p.id ? "#F59E0B11" : "#0B0F1A",
                color: pertains === p.id ? "#F59E0B" : "#64748B",
              }}>{p.label}</div>
            ))}
          </div>

          {/* Context selector */}
          {pertains === 'team' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Select team</div>
              <input
                value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
                placeholder="Search teams..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 11, outline: "none", boxSizing: "border-box", marginBottom: 6 }}
              />
              <div style={{ maxHeight: 140, overflowY: "auto" }}>
                {filteredTeams.map(t => (
                  <div key={t.id} onClick={() => { setPertainsRef(t.id); setTeamSearch(t.name); }} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6,
                    border: pertainsRef === t.id ? "1px solid #F59E0B44" : "1px solid #33415533",
                    background: pertainsRef === t.id ? "#F59E0B11" : "#1E293B",
                    cursor: "pointer", marginBottom: 2,
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: pertainsRef === t.id ? "#F59E0B" : "#F8FAFC", fontWeight: 600 }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pertains === 'match' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Select match</div>
              <input
                value={matchSearch} onChange={e => setMatchSearch(e.target.value)}
                placeholder="Search matches..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 11, outline: "none", boxSizing: "border-box", marginBottom: 6 }}
              />
              <div style={{ maxHeight: 140, overflowY: "auto" }}>
                {filteredMatches.map(m => {
                  const label = `${m.home_team?.name || '?'} vs ${m.away_team?.name || '?'}`;
                  const d = m.match_date ? new Date(m.match_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '';
                  return (
                    <div key={m.id} onClick={() => { setPertainsRef(m.id); setMatchSearch(label); }} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6,
                      border: pertainsRef === m.id ? "1px solid #F59E0B44" : "1px solid #33415533",
                      background: pertainsRef === m.id ? "#F59E0B11" : "#1E293B",
                      cursor: "pointer", marginBottom: 2,
                    }}>
                      <span style={{ fontSize: 11, color: pertainsRef === m.id ? "#F59E0B" : "#F8FAFC", fontWeight: 600, flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 9, color: "#64748B" }}>{d}</span>
                      <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: m.status === 'live' ? '#EF444422' : m.status === 'upcoming' ? '#F59E0B22' : '#33415544', color: m.status === 'live' ? '#EF4444' : m.status === 'upcoming' ? '#F59E0B' : '#64748B', fontWeight: 600 }}>{m.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pertains === 'app' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>App area</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {APP_AREAS.map(a => (
                  <div key={a.id} onClick={() => setAppArea(a.id)} style={{
                    padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                    border: appArea === a.id ? "2px solid #F59E0B" : "1px solid #334155",
                    background: appArea === a.id ? "#F59E0B11" : "#0B0F1A",
                    color: appArea === a.id ? "#F59E0B" : "#64748B",
                  }}>{a.label}</div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ fontSize: 9, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Description</div>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            maxLength={1000}
            style={{ width: "100%", minHeight: 80, padding: "8px 10px", borderRadius: 8, border: "1px solid #334155", background: "#0B0F1A", color: "#F8FAFC", fontSize: 11, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", marginBottom: 4 }}
          />
          <div style={{ fontSize: 9, color: "#475569", textAlign: "right", marginBottom: 12 }}>{description.length}/1000</div>

          <button onClick={handleSubmit} disabled={submitting || !description.trim()} style={{
            width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: description.trim() ? "#F59E0B" : "#334155",
            color: description.trim() ? "#0B0F1A" : "#64748B",
            fontSize: 13, fontWeight: 800, cursor: description.trim() ? "pointer" : "default",
            opacity: submitting ? 0.5 : 1,
          }}>{submitting ? 'Submitting...' : 'Submit issue'}</button>
        </div>
      </div>
    );
  }

  // ═══ LIST VIEW ═══
  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>← Back</button>
        <button onClick={openForm} style={{ fontSize: 10, color: "#F59E0B", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700 }}>+ New issue</button>
      </div>
      <div style={{ padding: "0 14px 6px" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B" }}>My Issues</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "0 14px 8px", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
        <button onClick={() => setActiveTab('active')} style={{
          flex: 1, padding: "7px 0", textAlign: "center", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
          background: activeTab === 'active' ? "#F59E0B22" : "#1E293B", color: activeTab === 'active' ? "#F59E0B" : "#64748B",
        }}>Active ({active.length})</button>
        <button onClick={() => setActiveTab('resolved')} style={{
          flex: 1, padding: "7px 0", textAlign: "center", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
          background: activeTab === 'resolved' ? "#10B98122" : "#1E293B", color: activeTab === 'resolved' ? "#10B981" : "#64748B",
        }}>Resolved ({resolved.length})</button>
      </div>

      {/* List */}
      <div style={{ padding: "0 14px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: "#64748B", fontSize: 11 }}>Loading...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 12 }}>
            {activeTab === 'active' ? 'No active issues' : 'No resolved issues'}
          </div>
        ) : (
          shown.map(issue => (
            <div key={issue.id} onClick={() => { setSelected(issue); setView('detail'); }} style={{
              background: "#1E293B", borderRadius: 8, padding: "10px 12px", marginBottom: 4,
              border: "1px solid #33415544", cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={typeStyle(issue.issue_type)}>{ISSUE_TYPES.find(t => t.id === issue.issue_type)?.label}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F8FAFC", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{issue.description}</div>
                <span style={statusStyle(issue.status)}>{STATUS_COLORS[issue.status]?.label}</span>
              </div>
              <div style={{ fontSize: 9, color: "#64748B", marginTop: 3 }}>{pertainsLabel(issue)} · {fmtDate(issue.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

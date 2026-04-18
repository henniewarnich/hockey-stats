import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import KykieSpinner from '../components/KykieSpinner.jsx';

export default function ReportScreen({ reportId, matchId, currentUser, onBack }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        setError('login');
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from('match_reports').select('*');
        if (reportId) {
          query = query.eq('id', reportId);
        } else if (matchId) {
          query = query.eq('match_id', matchId);
        } else {
          setError('not_found');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          // RLS will block if not authorized — shows as empty result
          const isCoach = currentUser.roles?.includes('coach') || currentUser.role === 'coach';
          setError(isCoach ? 'not_found' : 'not_authorized');
          setLoading(false);
          return;
        }

        setReport(data);
      } catch (e) {
        console.error('Report load error:', e);
        setError('not_found');
      }
      setLoading(false);
    };

    load();
  }, [reportId, matchId, currentUser?.id]);

  // Write HTML content into iframe
  useEffect(() => {
    if (!report || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    doc.open();
    doc.write(report.html_content);
    doc.close();
    // Auto-resize iframe to content height
    const resize = () => {
      if (iframeRef.current && doc.body) {
        iframeRef.current.style.height = doc.body.scrollHeight + 'px';
      }
    };
    setTimeout(resize, 100);
    setTimeout(resize, 500);
  }, [report]);

  if (loading) {
    return (
      <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <KykieSpinner text message="Loading report..." />
      </div>
    );
  }

  if (error === 'login') {
    return (
      <div style={S.app}>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Sign in to view this report</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Match reports are available to registered coaches.</div>
          <button onClick={() => { window.location.hash = '#/login'; }} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Sign In</button>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => { window.location.hash = '#/register'; }} style={{
              background: 'none', border: 'none', color: '#F59E0B', fontSize: 11, cursor: 'pointer',
            }}>Don't have an account? Register as a coach</button>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'not_authorized') {
    return (
      <div style={S.app}>
        <div style={{ padding: '10px 14px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer' }}>← Back</button>
        </div>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Report not available</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Match reports are only available to coaches of the teams involved.</div>
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div style={S.app}>
        <div style={{ padding: '10px 14px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer' }}>← Back</button>
        </div>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Report not found</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>This report may have been removed or doesn't exist yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 500, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1E293B' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', padding: 0 }}>← Back</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, color: '#64748B' }}>{report.report_type === 'analysis' ? 'Match Analysis' : report.report_type === 'scouting' ? 'Scouting Report' : 'Season Review'}</div>
      </div>
      <iframe
        ref={iframeRef}
        style={{ width: '100%', border: 'none', minHeight: 400, background: '#0B0F1A' }}
        sandbox="allow-same-origin"
        title={report.title}
      />
    </div>
  );
}

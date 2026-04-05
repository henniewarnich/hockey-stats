import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';

export default function CommDashboardPanel({ currentUser, onNavigate }) {
  const isApprentice = currentUser?.commentator_status === 'apprentice';
  const [progress, setProgress] = useState({ live: 0, recorded: 0, total: 0 });

  useEffect(() => {
    if (!currentUser?.id) return;
    // Fetch match counts from audit_log for progression tracking
    Promise.all([
      supabase.from('audit_log').select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id).eq('action', 'match_start_live'),
      supabase.from('audit_log').select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id).eq('action', 'video_review_start'),
    ]).then(([{ count: lc }, { count: rc }]) => {
      const live = lc || 0, recorded = rc || 0;
      setProgress({ live, recorded, total: live + recorded });

      // Auto-promote apprentice → qualified
      if (isApprentice && live >= 1 && recorded >= 1) {
        supabase.from('profiles').update({ commentator_status: 'qualified' })
          .eq('id', currentUser.id).then(() => {
            currentUser.commentator_status = 'qualified';
            window.location.reload();
          });
      }
    });
  }, [currentUser?.id]);

  const statusLabel = isApprentice ? 'Apprentice Commentator'
    : progress.total < 5 ? 'Commentator (qualifying)'
    : 'Commentator';
  const statusColor = isApprentice ? '#F59E0B' : progress.total < 5 ? '#3B82F6' : '#10B981';

  return (
    <div style={{ padding: "0 16px 8px" }}>
      {/* Status banner */}
      <div style={{ background: statusColor + '18', border: `1px solid ${statusColor}44`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 24 }}>{isApprentice ? '🎓' : progress.total < 5 ? '🎙️' : '⭐'}</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
          <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>
            {isApprentice
              ? `Complete 1 Live and 1 Recorded match to remove limitations. (${progress.live}/1 live, ${progress.recorded}/1 recorded)`
              : progress.total < 5
                ? `${progress.total}/5 matches completed. After 5 matches you start earning credits.`
                : 'You are earning credits for every match you complete.'}
          </div>
        </div>
      </div>

      {/* Match Schedule — always available */}
      <div onClick={() => { window.location.hash = '#/record'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>📅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Match Schedule</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
            {isApprentice ? 'View and claim available matches' : 'All matches, start live, quick score'}
          </div>
        </div>
      </div>

      {/* Game History — always available (Top 10 filtered in HistoryScreen) */}
      {onNavigate && (
        <div onClick={() => onNavigate('history')} style={{
          ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ fontSize: 24 }}>📊</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Game History</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
              {isApprentice ? 'Record past matches (Top 10 teams excluded)' : 'View all recorded matches'}
            </div>
          </div>
        </div>
      )}

      {/* My Credits */}
      <div onClick={() => onNavigate && onNavigate('credits')} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: onNavigate ? 'pointer' : 'default',
      }}>
        <div style={{ fontSize: 24 }}>💰</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>My Credits</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>
            {progress.total < 5
              ? `0 credits — earning starts after ${5 - progress.total} more match${5 - progress.total !== 1 ? 'es' : ''}`
              : 'View your credit statement'}
          </div>
        </div>
      </div>

      {/* Contribute section */}
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 10, marginBottom: 4 }}>Contribute (1 credit each when approved)</div>

      <div onClick={() => { window.location.hash = '#/submit?mode=result'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>📝</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Submit a Result</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Enter a score for a match that has been played</div>
        </div>
      </div>

      <div onClick={() => { window.location.hash = '#/submit?mode=upcoming'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>📅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Add Upcoming Match</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Add a match that hasn't been played yet</div>
        </div>
      </div>

      <div onClick={() => { window.location.hash = '#/submit?mode=team'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>🏫</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Suggest a Team</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Add a school or team not yet in the system</div>
        </div>
      </div>

      <div onClick={() => { window.location.hash = '#/issues'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>⚠️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Report a Mistake</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Flag an incorrect score or missing data</div>
        </div>
      </div>

      {/* Demo Match */}
      <div onClick={() => { sessionStorage.setItem('kykie-start-demo', '1'); window.location.hash = '#/record'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>🎮</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Demo Match</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Try the recorder, data discarded</div>
        </div>
      </div>
    </div>
  );
}

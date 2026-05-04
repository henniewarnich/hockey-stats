import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase.js';
import { updateLiveScore, pushLiveEvent, endLiveMatch, lockMatch, updateScheduledMatch, snapshotRankings } from '../utils/sync.js';
import { awardLiveMatchCredits } from '../utils/credits.js';
import { logAudit } from '../utils/audit.js';
import { fmt } from '../utils/helpers.js';
import { S, theme } from '../utils/styles.js';
import { teamShortName, teamColor } from '../utils/teams.js';
import { useMatchTimer } from '../hooks/useMatchTimer.js';
import Scoreboard from '../components/Scoreboard.jsx';
import PausePopup from '../components/PausePopup.jsx';
import PenaltyShootout, { pushShootoutStart, pushPenaltyKick, deleteLastKickRow, wipeShootoutRows } from '../components/PenaltyShootout.jsx';

const EVENTS = [
  { id: 'goal', label: 'Goal', icon: '⚽', isGoal: true },
];

const PROMO_WINDOW = 5 * 60; // 5 minutes in seconds

export default function LiveLiteScreen({ match, currentUser, onEnd, onPromote }) {
  const timer = useMatchTimer();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [events, setEvents] = useState([]);
  const [showPause, setShowPause] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [shootoutOpen, setShootoutOpen] = useState(false);
  const [shootoutFirstKicker, setShootoutFirstKicker] = useState(null);
  const [shootoutKicks, setShootoutKicks] = useState([]);
  const [lastClicked, setLastClicked] = useState(null); // { team, eventId }
  const flashTimerRef = useRef(null);
  const [matchId, setMatchId] = useState(match.supabaseId || null);
  const [starting, setStarting] = useState(!match.supabaseId && !match.isDemo);
  const [error, setError] = useState('');
  const seqRef = useRef(0);
  const isDemo = match.isDemo;

  const homeTeam = match.home;
  const awayTeam = match.away;
  const promoAvailable = onPromote && timer.matchTime < PROMO_WINDOW && timer.matchState !== 'ended';
  const promoRemaining = Math.max(0, PROMO_WINDOW - timer.matchTime);

  // Initialize: lock match and set live if starting from scheduled
  useEffect(() => {
    if (isDemo) return;
    const init = async () => {
      if (match.supabaseId) {
        const locked = await lockMatch(match.supabaseId, currentUser.id);
        if (!locked) {
          setError('Another user is already recording this match.');
          return;
        }
        await updateScheduledMatch(match.supabaseId, { status: 'live' });
        await snapshotRankings(match.supabaseId);

        const { data: existingEvents } = await supabase
          .from('match_events')
          .select('*')
          .eq('match_id', match.supabaseId)
          .order('seq', { ascending: false })
          .limit(1);
        if (existingEvents?.length > 0) {
          seqRef.current = existingEvents[0].seq;
          const { data: m } = await supabase.from('matches').select('home_score, away_score').eq('id', match.supabaseId).single();
          if (m) { setHomeScore(m.home_score || 0); setAwayScore(m.away_score || 0); }
        }

        setMatchId(match.supabaseId);
        setStarting(false);
      }
    };
    init();
  }, []);

  // Push score updates to Supabase
  useEffect(() => {
    if (matchId && !isDemo && timer.matchState !== 'idle') {
      updateLiveScore(matchId, homeScore, awayScore);
    }
  }, [homeScore, awayScore]);

  const handleStart = () => {
    timer.start();
    if (!isDemo) logAudit('live_lite_start', 'match', matchId);
  };

  const handlePause = (reason) => {
    timer.pause();
    setShowPause(false);
    const seq = ++seqRef.current;
    const evt = { team: 'neutral', event: `Paused: ${reason}`, detail: reason, time: timer.matchTime };
    setEvents(prev => [evt, ...prev]);
    if (matchId && !isDemo) pushLiveEvent(matchId, evt, seq);
  };

  const handleResume = () => {
    timer.resume();
    const seq = ++seqRef.current;
    const evt = { team: 'neutral', event: 'Resumed', time: timer.matchTime };
    setEvents(prev => [evt, ...prev]);
    if (matchId && !isDemo) pushLiveEvent(matchId, evt, seq);
  };

  const handleEvent = (team, event) => {
    const seq = ++seqRef.current;
    const teamName = team === 'home' ? teamShortName(homeTeam) : teamShortName(awayTeam);
    let eventText = `${teamName} ${event.label.toLowerCase()}`;

    if (event.isGoal) {
      if (team === 'home') {
        setHomeScore(s => s + 1);
        eventText = `GOAL! ${teamName}`;
      } else {
        setAwayScore(s => s + 1);
        eventText = `GOAL! ${teamName}`;
      }
    }

    setLastClicked({ team, eventId: event.id });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setLastClicked(null), 2000);
    const evt = { team, event: eventText, detail: event.id, time: timer.matchTime };
    setEvents(prev => [evt, ...prev]);
    if (matchId && !isDemo) pushLiveEvent(matchId, evt, seq);
  };

  const handleUndo = () => {
    if (events.length === 0) return;
    const lastEvt = events[0];
    if (lastEvt.detail === 'goal') {
      if (lastEvt.team === 'home') setHomeScore(s => Math.max(0, s - 1));
      if (lastEvt.team === 'away') setAwayScore(s => Math.max(0, s - 1));
    }
    setEvents(prev => prev.slice(1));
    const seq = ++seqRef.current;
    const undoEvt = { team: 'neutral', event: `Undo: ${lastEvt.event}`, detail: 'undo', time: timer.matchTime };
    if (matchId && !isDemo) pushLiveEvent(matchId, undoEvt, seq);
  };

  const handleEndMatch = async (penOpts = {}) => {
    timer.end();
    setShowEndConfirm(false);
    if (matchId && !isDemo) {
      await endLiveMatch(matchId, homeScore, awayScore, timer.matchTime, penOpts);
      if (currentUser?.id) awardLiveMatchCredits(currentUser.id, matchId, 'lite').catch(() => {});
    }
    if (onEnd) onEnd({ matchId, homeScore, awayScore, duration: timer.matchTime });
  };

  // ─── Penalty Shoot-out handlers ─────────────────────
  const openShootout = () => {
    setShowEndConfirm(false);
    if (timer.running) timer.pause();
    setShootoutOpen(true);
  };

  const handlePickFirstKicker = async (team) => {
    setShootoutFirstKicker(team);
    const teamLabel = team === 'home' ? teamShortName(homeTeam) : teamShortName(awayTeam);
    const startEntry = { team: 'meta', event: 'Shootout Start', detail: team, time: timer.matchTime };
    const narrative = { team: 'commentary', event: '💬', detail: `Penalty shoot-out begins. ${teamLabel} kicks first.`, time: timer.matchTime };
    setEvents(prev => [narrative, startEntry, ...prev]);
    if (matchId && !isDemo) {
      const seq1 = ++seqRef.current;
      await pushShootoutStart(matchId, team, timer.matchTime, seq1);
      const seq2 = ++seqRef.current;
      await pushLiveEvent(matchId, narrative, seq2);
    }
  };

  const handleAddKick = async (kick) => {
    const localEntry = { team: kick.team, event: 'Penalty Kick', detail: kick.result, time: timer.matchTime };
    setEvents(prev => [localEntry, ...prev]);

    let dbId = null;
    if (matchId && !isDemo) {
      const seq = ++seqRef.current;
      const { id } = await pushPenaltyKick(matchId, kick, timer.matchTime, seq);
      dbId = id;
    }
    setShootoutKicks(prev => [...prev, { ...kick, eventId: dbId }]);
  };

  const handleUndoKick = async () => {
    if (shootoutKicks.length === 0) return;
    const last = shootoutKicks[shootoutKicks.length - 1];
    setShootoutKicks(prev => prev.slice(0, -1));
    setEvents(prev => {
      const idx = prev.findIndex(e => e.event === 'Penalty Kick');
      if (idx < 0) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    if (matchId && !isDemo && last.eventId) {
      await deleteLastKickRow(matchId, last.eventId);
    }
  };

  const handleCancelShootout = async () => {
    setShootoutOpen(false);
    setShootoutFirstKicker(null);
    setShootoutKicks([]);
    setEvents(prev => prev.filter(e =>
      e.event !== 'Penalty Kick' && e.event !== 'Shootout Start' && e.event !== 'Shootout End'
      && !(e.team === 'commentary' && e.detail?.toLowerCase()?.includes('shoot-out begins'))
    ));
    if (matchId && !isDemo) {
      await wipeShootoutRows(matchId);
      try {
        await supabase.from('match_events').delete().eq('match_id', matchId).eq('team', 'commentary').ilike('detail', '%shoot-out begins%');
      } catch {}
    }
  };

  const handleShootoutComplete = async (homePens, awayPens) => {
    const winLabel = homePens > awayPens ? teamShortName(homeTeam) : teamShortName(awayTeam);
    const endEntry = { team: 'meta', event: 'Shootout End', detail: `${winLabel} win shoot-out ${Math.max(homePens, awayPens)}–${Math.min(homePens, awayPens)}`, time: timer.matchTime };
    setEvents(prev => [endEntry, ...prev]);
    if (matchId && !isDemo) {
      const seq = ++seqRef.current;
      await pushLiveEvent(matchId, endEntry, seq);
    }
    setShootoutOpen(false);
    handleEndMatch({ homePenalty: homePens, awayPenalty: awayPens });
  };

  const handleAbandon = async () => {
    timer.end();
    setShowEndConfirm(false);
    if (matchId && !isDemo) {
      await endLiveMatch(matchId, homeScore, awayScore, timer.matchTime, { abandoned: true });
    }
    if (onEnd) onEnd({ matchId, homeScore, awayScore, duration: timer.matchTime, abandoned: true });
  };

  const handlePromote = () => {
    if (onPromote) {
      onPromote({
        supabaseId: matchId,
        home: homeTeam,
        away: awayTeam,
        homeScore,
        awayScore,
        matchTime: timer.matchTime,
        events,
        seq: seqRef.current,
        matchLength: match.matchLength,
        breakFormat: match.breakFormat,
      });
    }
  };

  if (error) {
    return (
      <div style={pageStyle}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, color: '#EF4444', fontWeight: 600, marginBottom: 16 }}>{error}</div>
          <button onClick={() => onEnd?.()} style={btnStyle('#334155')}>← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 0' }}>
        <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: isDemo ? '#8B5CF6' : '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>
          {isDemo ? '🎮 Demo' : 'Live Basic'}
        </div>
        <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: timer.running ? '#10B98122' : '#F59E0B22', color: timer.running ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
          {timer.matchState === 'idle' ? 'Ready' : timer.matchState === 'ended' ? 'Full Time' : timer.running ? '● Recording' : 'Paused'}
        </div>
      </div>

      {/* Scoreboard */}
      <Scoreboard
        teams={{ home: homeTeam, away: awayTeam }}
        homeGoals={homeScore}
        awayGoals={awayScore}
        matchTime={timer.matchTime}
        matchState={timer.matchState}
        running={timer.running}
        matchId={isDemo ? null : matchId}
      />

      {/* Event buttons */}
      {timer.matchState !== 'ended' && (
        <div style={{ padding: '8px 12px' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: teamColor(homeTeam), textAlign: 'center', textTransform: 'uppercase' }}>{teamShortName(homeTeam)}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: teamColor(awayTeam), textAlign: 'center', textTransform: 'uppercase' }}>{teamShortName(awayTeam)}</div>
          </div>

          {/* Event rows */}
          {EVENTS.map(evt => (
            <div key={evt.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
              {['home', 'away'].map(side => {
                const isActive = lastClicked?.team === side && lastClicked?.eventId === evt.id;
                const flashColor = side === 'home' ? teamColor(homeTeam) : teamColor(awayTeam);
                return (
                  <button
                    key={side}
                    onClick={() => timer.running && handleEvent(side, evt)}
                    disabled={!timer.running}
                    style={{
                      padding: '14px 8px', borderRadius: 10, border: 'none', cursor: timer.running ? 'pointer' : 'default',
                      background: isActive ? flashColor : '#1E293B',
                      color: isActive ? '#FFF' : '#CBD5E1',
                      fontSize: 14, fontWeight: isActive ? 800 : 600,
                      opacity: timer.running ? 1 : 0.4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{evt.icon}</span> {evt.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '4px 12px 8px', flexWrap: 'wrap' }}>
        {timer.matchState === 'idle' && (
          <button onClick={handleStart} style={S.btnSm(theme.success, '#FFF')}>
            ▶ Start Match
          </button>
        )}
        {timer.running && (
          <>
            <button onClick={() => setShowPause(true)} style={S.btnSm(theme.accent, theme.bg)}>⏸ Pause</button>
            <button onClick={() => setShowEndConfirm(true)} style={S.btnSm(theme.danger, '#FFF')}>⏹ End</button>
            {events.length > 0 && <button onClick={handleUndo} style={{ ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}` }}>↩ Undo</button>}
          </>
        )}
        {timer.matchState === 'paused' && (
          <>
            <button onClick={handleResume} style={S.btnSm(theme.success, '#FFF')}>▶ Resume</button>
            <button onClick={() => setShowEndConfirm(true)} style={S.btnSm(theme.danger, '#FFF')}>⏹ End</button>
            {events.length > 0 && <button onClick={handleUndo} style={{ ...S.btnSm(theme.surface, theme.textMuted), border: `1px solid ${theme.border}` }}>↩ Undo</button>}
          </>
        )}
        {timer.matchState === 'ended' && (
          <button onClick={() => onEnd?.({ matchId, homeScore, awayScore, duration: timer.matchTime })} style={S.btnSm(theme.surface, theme.textMuted)}>
            ← Done
          </button>
        )}
      </div>

      {/* Switch to Live Pro */}
      {promoAvailable && timer.matchState !== 'ended' && (
        <div style={{ padding: '0 12px 8px' }}>
          <button onClick={handlePromote} style={{
            width: '100%', padding: 10, borderRadius: 10, border: '1px solid #8B5CF644',
            background: '#8B5CF611', color: '#8B5CF6', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {timer.matchState === 'idle'
              ? '⬆ Switch to Live Pro'
              : `⬆ Switch to Live Pro (${Math.floor(promoRemaining / 60)}:${String(promoRemaining % 60).padStart(2, '0')} remaining)`}
          </button>
        </div>
      )}
      {!promoAvailable && timer.matchTime >= PROMO_WINDOW && timer.matchState !== 'ended' && timer.matchState !== 'idle' && onPromote && (
        <div style={{ padding: '0 12px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#475569' }}>Live Pro upgrade window expired</div>
        </div>
      )}

      {/* Event feed */}
      <div style={{ padding: '0 12px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Feed</div>
        {events.length === 0 ? (
          <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', padding: 16 }}>Events will appear here</div>
        ) : (
          events.slice(0, 20).map((evt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
              borderBottom: '1px solid #1E293B',
            }}>
              <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', width: 40, flexShrink: 0 }}>
                {fmt(evt.time)}
              </div>
              <div style={{
                width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                background: evt.team === 'home' ? teamColor(homeTeam) : evt.team === 'away' ? teamColor(awayTeam) : '#475569',
              }} />
              <div style={{
                fontSize: 12, flex: 1,
                color: evt.detail === 'goal' ? '#F59E0B' : evt.detail === 'undo' ? '#EF4444' : '#94A3B8',
                fontWeight: evt.detail === 'goal' ? 700 : 400,
              }}>
                {evt.event}
              </div>
            </div>
          ))
        )}
      </div>

      {/* End match confirm */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
        }} onClick={() => setShowEndConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1E293B', borderRadius: 16, padding: 20, width: 280, textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{isDemo ? '🎮 End Demo?' : '🏁 End Match?'}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>
              {teamShortName(homeTeam)} {homeScore} – {awayScore} {teamShortName(awayTeam)}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>
              Time: {fmt(timer.matchTime)}{isDemo ? ' · Data will not be saved' : ''}
            </div>
            {/* Penalty Shoot-out option when tied */}
            {!isDemo && homeScore === awayScore && (
              <div style={{ marginBottom: 12 }}>
                <button onClick={openShootout} style={{
                  width: '100%', padding: 12, borderRadius: 10, border: '1px solid #F59E0B66',
                  background: '#F59E0B22', color: '#F59E0B', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                }}>⚽ Decide by Penalty Shoot-out</button>
                <div style={{ fontSize: 9, color: '#64748B', marginTop: 4, textAlign: 'center' }}>Records each kick live for supporters</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowEndConfirm(false)} style={{ ...btnStyle('#334155'), flex: 1 }}>Cancel</button>
              <button onClick={() => handleEndMatch()} style={{ ...btnStyle('#EF4444'), flex: 1, color: '#F8FAFC' }}>{isDemo ? 'End & Discard' : 'End Match'}</button>
            </div>
            {!isDemo && (
              <button onClick={handleAbandon} style={{ ...btnStyle('#64748B'), width: '100%', marginTop: 6, fontSize: 10, color: '#94A3B8' }}>Abandon Match</button>
            )}
          </div>
        </div>
      )}

      <PausePopup show={showPause} onSelect={handlePause} onClose={() => setShowPause(false)} />

      {/* Penalty Shoot-out overlay */}
      {shootoutOpen && (
        <PenaltyShootout
          teams={{ home: homeTeam, away: awayTeam }}
          firstKicker={shootoutFirstKicker}
          kicks={shootoutKicks}
          onPickFirstKicker={handlePickFirstKicker}
          onAddKick={handleAddKick}
          onUndoLastKick={handleUndoKick}
          onCancelShootout={handleCancelShootout}
          onComplete={handleShootoutComplete}
        />
      )}
    </div>
  );
}

const pageStyle = {
  fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
  background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC',
};

const btnStyle = (bg) => ({
  padding: '12px 16px', borderRadius: 10, border: 'none',
  background: bg, color: '#F8FAFC', fontSize: 13, fontWeight: 700, cursor: 'pointer',
});

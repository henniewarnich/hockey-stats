import { useState, useMemo } from 'react';
import { teamColor, teamDisplayName, teamShortName } from '../utils/teams.js';
import { supabase } from '../utils/supabase.js';
import { pushLiveEvent } from '../utils/sync.js';

const REGULAR_ROUNDS = 5;

// Build kick events from the shootout state, but the source of truth is the parent's
// `kicks` array (populated from match_events when component mounts).
//
// Props:
//   teams      — { home, away }
//   matchId    — supabase match id (or null in demo mode)
//   isDemo     — when true, no DB writes
//   matchTime  — current match clock seconds (for event timestamps)
//   firstKicker — 'home' | 'away' | null. When null, component shows the picker.
//   kicks      — [{ team: 'home'|'away', result: 'Goal'|'Miss', id?: number }]
//   onPickFirstKicker(team) — caller persists 'Shootout Start' meta event
//   onAddKick(kick)         — caller persists Penalty Kick event, returns event id
//   onUndoLastKick()        — caller deletes most recent kick event
//   onCancelShootout()      — caller wipes shootout events, returns to tied state
//   onComplete(homePens, awayPens) — caller ends the match with pen scores
export default function PenaltyShootout({
  teams,
  firstKicker,
  kicks,
  onPickFirstKicker,
  onAddKick,
  onUndoLastKick,
  onCancelShootout,
  onComplete,
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);

  const homeColor = teamColor(teams.home);
  const awayColor = teamColor(teams.away);
  const homeName = teamShortName(teams.home);
  const awayName = teamShortName(teams.away);
  const homeDisplay = teamDisplayName(teams.home);
  const awayDisplay = teamDisplayName(teams.away);

  // Derive pen scores from kicks
  const homePens = kicks.filter(k => k.team === 'home' && k.result === 'Goal').length;
  const awayPens = kicks.filter(k => k.team === 'away' && k.result === 'Goal').length;

  // Per-team kick lists (chronological)
  const homeKicks = kicks.filter(k => k.team === 'home');
  const awayKicks = kicks.filter(k => k.team === 'away');

  // Round logic: each round is one kick per team. Round n is decided once both
  // teams have taken kick n, OR when the result is mathematically out of reach.
  const round = Math.max(homeKicks.length, awayKicks.length) || 1;

  // Whose turn is it? Within each round the firstKicker goes first.
  // Round R: firstKicker takes their R-th kick, then the other team takes R-th.
  const secondKicker = firstKicker === 'home' ? 'away' : 'home';
  const firstCount = firstKicker === 'home' ? homeKicks.length : awayKicks.length;
  const secondCount = firstKicker === 'home' ? awayKicks.length : homeKicks.length;
  const currentKicker = firstCount === secondCount ? firstKicker : secondKicker;

  // Decision logic — once a team is mathematically out of reach in regulation
  // OR sudden-death round is decided.
  const decided = useMemo(() => {
    if (kicks.length === 0) return null;
    // Regulation: rounds 1..5
    const homeTaken = homeKicks.length;
    const awayTaken = awayKicks.length;
    // In regulation, each team has up to 5 kicks
    const homeRemaining = Math.max(0, REGULAR_ROUNDS - homeTaken);
    const awayRemaining = Math.max(0, REGULAR_ROUNDS - awayTaken);
    if (homeTaken <= REGULAR_ROUNDS && awayTaken <= REGULAR_ROUNDS) {
      // Out of reach checks
      if (homePens > awayPens + awayRemaining) return 'home';
      if (awayPens > homePens + homeRemaining) return 'away';
      // Both teams have taken all 5 and tally is unequal
      if (homeTaken >= REGULAR_ROUNDS && awayTaken >= REGULAR_ROUNDS && homePens !== awayPens) {
        return homePens > awayPens ? 'home' : 'away';
      }
    } else {
      // Sudden death: decided once both teams have completed the same round and tally is unequal
      if (homeTaken === awayTaken && homePens !== awayPens) {
        return homePens > awayPens ? 'home' : 'away';
      }
    }
    return null;
  }, [kicks, homePens, awayPens, homeKicks.length, awayKicks.length]);

  // ─── UI: pick first kicker ───
  if (!firstKicker) {
    return (
      <Overlay onClose={onCancelShootout}>
        <div style={modalStyle}>
          <div style={titleStyle}>⚽ Penalty Shoot-out</div>
          <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 14, lineHeight: 1.4 }}>
            Tap the team that takes the opening kick.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => onPickFirstKicker('home')} style={teamPickStyle(homeColor)}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: homeColor }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{homeDisplay}</span>
              <span style={{ fontSize: 9, color: '#94A3B8' }}>kicks first</span>
            </button>
            <button onClick={() => onPickFirstKicker('away')} style={teamPickStyle(awayColor)}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: awayColor }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{awayDisplay}</span>
              <span style={{ fontSize: 9, color: '#94A3B8' }}>kicks first</span>
            </button>
          </div>
          <button onClick={onCancelShootout} style={cancelLinkStyle}>Cancel</button>
        </div>
      </Overlay>
    );
  }

  // ─── UI: shootout in progress / decided ───
  const inSuddenDeath = homeKicks.length > REGULAR_ROUNDS || awayKicks.length > REGULAR_ROUNDS;

  return (
    <Overlay>
      <div style={modalStyle}>
        <div style={titleStyle}>⚽ Penalty Shoot-out</div>

        {/* Running pen score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: homeColor, marginBottom: 2 }}>{homeName}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{homePens}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>–</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: awayColor, marginBottom: 2 }}>{awayName}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{awayPens}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 9, color: '#F59E0B', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
          {inSuddenDeath ? `SUDDEN DEATH · ROUND ${round}` : `ROUND ${round} OF ${REGULAR_ROUNDS}`}
        </div>

        {/* Kick grid */}
        <KickGrid label={homeName} color={homeColor} taken={homeKicks} totalShown={Math.max(REGULAR_ROUNDS, homeKicks.length, awayKicks.length, round)} suddenDeathStart={REGULAR_ROUNDS} currentKicker={!decided && currentKicker === 'home'} />
        <KickGrid label={awayName} color={awayColor} taken={awayKicks} totalShown={Math.max(REGULAR_ROUNDS, homeKicks.length, awayKicks.length, round)} suddenDeathStart={REGULAR_ROUNDS} currentKicker={!decided && currentKicker === 'away'} />

        {/* Decided banner OR current kicker + buttons */}
        {decided ? (
          <>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: '#10B98122', border: '1px solid #10B98144', textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#10B981' }}>
              🏆 {decided === 'home' ? homeDisplay : awayDisplay} win {Math.max(homePens, awayPens)} – {Math.min(homePens, awayPens)} on penalties
            </div>
            <button
              onClick={() => onComplete(homePens, awayPens)}
              style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              ✓ Complete Match
            </button>
          </>
        ) : (
          <>
            <div style={{ marginTop: 14, padding: 10, background: '#F59E0B22', border: '1px dashed #F59E0B', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>KICKING NOW</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: currentKicker === 'home' ? homeColor : awayColor }}>
                {currentKicker === 'home' ? homeDisplay : awayDisplay}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => onAddKick({ team: currentKicker, result: 'Goal' })}
                style={{ flex: 1, padding: 18, borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                ⚽ GOAL
              </button>
              <button
                onClick={() => onAddKick({ team: currentKicker, result: 'Miss' })}
                style={{ flex: 1, padding: 18, borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                ✗ MISS
              </button>
            </div>
          </>
        )}

        {/* Bottom controls */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155' }}>
          <button
            disabled={kicks.length === 0}
            onClick={() => setConfirmUndo(true)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: kicks.length === 0 ? '#475569' : '#94A3B8', fontSize: 10, fontWeight: 700, cursor: kicks.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            ↩ Undo Last Kick
          </button>
          <button
            onClick={() => setConfirmCancel(true)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #EF444444', background: 'transparent', color: '#EF4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            ✕ Cancel Shootout
          </button>
        </div>

        {/* Confirm Undo */}
        {confirmUndo && kicks.length > 0 && (
          <ConfirmInline
            title="Undo last kick?"
            body={(() => {
              const last = kicks[kicks.length - 1];
              const tname = last.team === 'home' ? homeDisplay : awayDisplay;
              return <>The last kick by <b style={{ color: '#F8FAFC' }}>{tname}</b> (<span style={{ color: last.result === 'Goal' ? '#10B981' : '#EF4444' }}>{last.result}</span>) will be removed from the shootout and the live commentary.</>;
            })()}
            confirmLabel="↩ Undo"
            onCancel={() => setConfirmUndo(false)}
            onConfirm={() => { setConfirmUndo(false); onUndoLastKick(); }}
          />
        )}

        {/* Confirm Cancel */}
        {confirmCancel && (
          <ConfirmInline
            title="Cancel shoot-out?"
            body={<>All <b>{kicks.length}</b> kick{kicks.length === 1 ? '' : 's'} will be removed and the match will return to a tied full-time score. You can start a new shoot-out afterwards.</>}
            confirmLabel="Cancel Shoot-out"
            onCancel={() => setConfirmCancel(false)}
            onConfirm={() => { setConfirmCancel(false); onCancelShootout(); }}
            danger
          />
        )}
      </div>
    </Overlay>
  );
}

// ─── Subcomponents ─────────────────────────────────

function KickGrid({ label, color, taken, totalShown, suddenDeathStart, currentKicker }) {
  const slots = [];
  for (let i = 0; i < totalShown; i++) {
    const k = taken[i];
    const isCurrent = currentKicker && i === taken.length;
    const isSuddenDeath = i >= suddenDeathStart;
    slots.push({ index: i, kick: k, isCurrent, isSuddenDeath });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <div style={{ width: 60, fontSize: 10, fontWeight: 700, color }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
        {slots.map(({ index, kick, isCurrent, isSuddenDeath }) => {
          const baseStyle = {
            width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, flexShrink: 0,
            border: '1px solid #334155',
          };
          if (kick) {
            const goal = kick.result === 'Goal';
            return (
              <div key={index} style={{
                ...baseStyle,
                background: goal ? '#10B981' : '#EF4444',
                color: '#fff',
                borderColor: goal ? '#10B981' : '#EF4444',
              }}>{goal ? '✓' : '✗'}</div>
            );
          }
          if (isCurrent) {
            return (
              <div key={index} style={{
                ...baseStyle,
                borderColor: '#F59E0B',
                borderWidth: 2,
                background: '#F59E0B22',
                color: '#F59E0B',
              }}>{index + 1}</div>
            );
          }
          return (
            <div key={index} style={{ ...baseStyle, color: '#475569', borderStyle: isSuddenDeath ? 'dashed' : 'solid' }}>{index + 1}</div>
          );
        })}
      </div>
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', padding: 12 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 360 }}>
        {children}
      </div>
    </div>
  );
}

function ConfirmInline({ title, body, confirmLabel, onCancel, onConfirm, danger }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,15,26,0.92)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 12, padding: 14, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14, lineHeight: 1.5 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Keep it</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 9, borderRadius: 8, border: 'none', background: danger ? '#EF4444' : '#F59E0B', color: danger ? '#fff' : '#0B0F1A', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers used by host components ────────────────────

// Push 'Shootout Start' meta event to DB
export async function pushShootoutStart(matchId, firstKicker, matchTime, seq) {
  if (!matchId) return true;
  const evt = {
    team: 'meta',
    event: 'Shootout Start',
    detail: firstKicker, // 'home' or 'away'
    time: matchTime,
  };
  return pushLiveEvent(matchId, evt, seq);
}

// Push a single penalty kick event
export async function pushPenaltyKick(matchId, kick, matchTime, seq) {
  if (!matchId) return { id: null };
  const { data, error } = await supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      team: kick.team,
      event: 'Penalty Kick',
      detail: kick.result, // 'Goal' or 'Miss'
      match_time: matchTime,
      seq,
    })
    .select('id')
    .single();
  if (error) console.error('Penalty kick push error:', error);
  return { id: data?.id || null, error };
}

// Delete the most recent shootout kick (for undo)
export async function deleteLastKickRow(matchId, kickId) {
  if (!matchId || !kickId) return true;
  const { error } = await supabase.from('match_events').delete().eq('id', kickId);
  if (error) console.error('Delete kick error:', error);
  return !error;
}

// Wipe all shootout-related events for this match (cancel)
export async function wipeShootoutRows(matchId) {
  if (!matchId) return true;
  const { error } = await supabase
    .from('match_events')
    .delete()
    .eq('match_id', matchId)
    .in('event', ['Penalty Kick', 'Shootout Start', 'Shootout End']);
  if (error) console.error('Wipe shootout error:', error);
  return !error;
}

// Build initial state from existing match events (for resume/refresh)
export function rebuildShootoutState(events) {
  const start = events.find(e => e.event === 'Shootout Start');
  if (!start) return { firstKicker: null, kicks: [] };
  // events come newest-first from match_events; reverse for chronological
  const kickEvents = events
    .filter(e => e.event === 'Penalty Kick')
    .slice()
    .reverse();
  const kicks = kickEvents.map(e => ({
    team: e.team,
    result: e.detail === 'Goal' ? 'Goal' : 'Miss',
    id: e.id,
  }));
  return { firstKicker: start.detail, kicks };
}

// ─── Styles ────────────────────────────────────────

const modalStyle = {
  position: 'relative',
  background: '#1E293B',
  border: '1px solid #334155',
  borderRadius: 16,
  padding: 16,
};

const titleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: '#F59E0B',
  textAlign: 'center',
  marginBottom: 10,
  letterSpacing: 0.5,
};

function teamPickStyle(color) {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 10,
    border: `2px solid ${color}66`,
    background: `${color}15`,
    color: '#F8FAFC',
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer',
  };
}

const cancelLinkStyle = {
  width: '100%', marginTop: 12, padding: 8,
  borderRadius: 8, border: '1px solid #334155',
  background: 'transparent', color: '#64748B',
  fontSize: 10, fontWeight: 700, cursor: 'pointer',
};

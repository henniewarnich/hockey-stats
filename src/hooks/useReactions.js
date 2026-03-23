import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase.js';

const EMOJIS = [
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'wow', emoji: '😮' },
  { id: 'heart', emoji: '❤️' },
];

// Get or create anonymous viewer ID (persists per session)
function getViewerId() {
  let id = sessionStorage.getItem('kykie-viewer-id');
  if (!id) {
    id = 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('kykie-viewer-id', id);
  }
  return id;
}

export { EMOJIS };

export function useReactions(matchId) {
  const [counts, setCounts] = useState({}); // { eventId: { fire: 3, clap: 1, ... } }
  const [myReactions, setMyReactions] = useState({}); // { eventId: { fire: true, ... } }
  const viewerId = useRef(getViewerId());

  // Load all reactions for a match's events
  const loadReactions = useCallback(async (eventIds) => {
    if (!eventIds || eventIds.length === 0) return;

    const { data } = await supabase
      .from('event_reactions')
      .select('match_event_id, emoji, viewer_id')
      .in('match_event_id', eventIds);

    if (!data) return;

    const newCounts = {};
    const newMy = {};

    data.forEach(r => {
      if (!newCounts[r.match_event_id]) newCounts[r.match_event_id] = {};
      newCounts[r.match_event_id][r.emoji] = (newCounts[r.match_event_id][r.emoji] || 0) + 1;

      if (r.viewer_id === viewerId.current) {
        if (!newMy[r.match_event_id]) newMy[r.match_event_id] = {};
        newMy[r.match_event_id][r.emoji] = true;
      }
    });

    setCounts(newCounts);
    setMyReactions(newMy);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase.channel(`reactions-${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_reactions' }, (payload) => {
        const r = payload.new;
        setCounts(prev => {
          const updated = { ...prev };
          if (!updated[r.match_event_id]) updated[r.match_event_id] = {};
          updated[r.match_event_id] = { ...updated[r.match_event_id] };
          updated[r.match_event_id][r.emoji] = (updated[r.match_event_id][r.emoji] || 0) + 1;
          return updated;
        });
        if (r.viewer_id === viewerId.current) {
          setMyReactions(prev => {
            const updated = { ...prev };
            if (!updated[r.match_event_id]) updated[r.match_event_id] = {};
            updated[r.match_event_id] = { ...updated[r.match_event_id], [r.emoji]: true };
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'event_reactions' }, (payload) => {
        const r = payload.old;
        setCounts(prev => {
          const updated = { ...prev };
          if (updated[r.match_event_id]?.[r.emoji]) {
            updated[r.match_event_id] = { ...updated[r.match_event_id] };
            updated[r.match_event_id][r.emoji] = Math.max(0, (updated[r.match_event_id][r.emoji] || 1) - 1);
            if (updated[r.match_event_id][r.emoji] === 0) delete updated[r.match_event_id][r.emoji];
          }
          return updated;
        });
        if (r.viewer_id === viewerId.current) {
          setMyReactions(prev => {
            const updated = { ...prev };
            if (updated[r.match_event_id]) {
              updated[r.match_event_id] = { ...updated[r.match_event_id] };
              delete updated[r.match_event_id][r.emoji];
            }
            return updated;
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  // Toggle a reaction
  const toggleReaction = useCallback(async (eventId, emoji) => {
    const isOn = myReactions[eventId]?.[emoji];

    if (isOn) {
      // Remove
      setMyReactions(prev => {
        const updated = { ...prev };
        if (updated[eventId]) {
          updated[eventId] = { ...updated[eventId] };
          delete updated[eventId][emoji];
        }
        return updated;
      });
      setCounts(prev => {
        const updated = { ...prev };
        if (updated[eventId]?.[emoji]) {
          updated[eventId] = { ...updated[eventId] };
          updated[eventId][emoji] = Math.max(0, updated[eventId][emoji] - 1);
          if (updated[eventId][emoji] === 0) delete updated[eventId][emoji];
        }
        return updated;
      });
      await supabase
        .from('event_reactions')
        .delete()
        .eq('match_event_id', eventId)
        .eq('emoji', emoji)
        .eq('viewer_id', viewerId.current);
    } else {
      // Add
      setMyReactions(prev => {
        const updated = { ...prev };
        if (!updated[eventId]) updated[eventId] = {};
        updated[eventId] = { ...updated[eventId], [emoji]: true };
        return updated;
      });
      setCounts(prev => {
        const updated = { ...prev };
        if (!updated[eventId]) updated[eventId] = {};
        updated[eventId] = { ...updated[eventId] };
        updated[eventId][emoji] = (updated[eventId][emoji] || 0) + 1;
        return updated;
      });
      await supabase
        .from('event_reactions')
        .upsert({
          match_event_id: eventId,
          emoji,
          viewer_id: viewerId.current,
        }, { onConflict: 'match_event_id,emoji,viewer_id' });
    }
  }, [myReactions]);

  return { counts, myReactions, toggleReaction, loadReactions, EMOJIS };
}

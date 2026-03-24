import { useState, useRef, useEffect } from 'react';
import { EMOJIS } from '../hooks/useReactions.js';

export default function ReactionBar({ eventId, counts, myReactions, onToggle, readOnly = false }) {
  const [floats, setFloats] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close picker on outside tap
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close, true);
    return () => document.removeEventListener('click', close, true);
  }, [open]);

  const handleTap = (emoji) => {
    const myEvt = myReactions?.[eventId] || {};
    const isOn = myEvt[emoji.id];

    if (isOn) {
      onToggle(eventId, emoji.id);
    } else {
      // Deselect any existing reaction first
      const currentEmoji = EMOJIS.find(e => myEvt[e.id]);
      if (currentEmoji) onToggle(eventId, currentEmoji.id);
      onToggle(eventId, emoji.id);
      // Float animation
      const id = Date.now() + emoji.id;
      setFloats(prev => [...prev, { id, emoji: emoji.emoji }]);
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 800);
    }
    setOpen(false);
  };

  const eventCounts = counts?.[eventId] || {};
  const myEvt = myReactions?.[eventId] || {};
  const activeEmojis = EMOJIS.filter(e => (eventCounts[e.id] || 0) > 0);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, position: "relative", justifyContent: "flex-end", flexWrap: "wrap" }}>
      {/* Show emojis that have reactions */}
      {activeEmojis.map(e => {
        const count = eventCounts[e.id] || 0;
        const isOn = myEvt[e.id];
        return (
          <span key={e.id}
            onClick={(ev) => { ev.stopPropagation(); if (!readOnly) handleTap(e); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 8px", borderRadius: 99, cursor: readOnly ? "default" : "pointer",
              fontSize: 15, userSelect: "none",
              background: isOn ? "#F59E0B22" : "#334155",
              border: isOn ? "1px solid #F59E0B44" : "1px solid transparent",
            }}>
            {e.emoji}
            <span style={{
              fontSize: 11, fontWeight: 600, minWidth: 8,
              color: isOn ? "#F59E0B" : "#CBD5E1",
            }}>{count}</span>
          </span>
        );
      })}

      {/* Add button (not shown in read-only / historical) */}
      {!readOnly && (
        <span
          onClick={(ev) => { ev.stopPropagation(); setOpen(!open); }}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 26, borderRadius: 99, cursor: "pointer",
            fontSize: 13, userSelect: "none", fontWeight: 700,
            background: "#334155", color: "#64748B",
            border: open ? "1px solid #F59E0B44" : "1px solid transparent",
          }}>+</span>
      )}

      {/* Picker flyout */}
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0,
          display: "flex", gap: 4, padding: "6px 8px",
          background: "#1E293B", borderRadius: 99,
          border: "1px solid #334155", zIndex: 10,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.4)",
        }}>
          {EMOJIS.map(e => {
            const isOn = myEvt[e.id];
            return (
              <span key={e.id}
                onClick={(ev) => { ev.stopPropagation(); handleTap(e); }}
                style={{
                  fontSize: 20, cursor: "pointer", userSelect: "none",
                  padding: "2px 4px", borderRadius: 6,
                  background: isOn ? "#F59E0B22" : "transparent",
                  transition: "transform 0.1s",
                }}>
                {e.emoji}
              </span>
            );
          })}
        </div>
      )}

      {/* Float animations */}
      {floats.map(f => (
        <span key={f.id} style={{
          position: "absolute", bottom: "100%", right: "20%",
          fontSize: 20, pointerEvents: "none",
          animation: "reaction-float 0.8s ease-out forwards",
        }}>{f.emoji}</span>
      ))}
    </div>
  );
}

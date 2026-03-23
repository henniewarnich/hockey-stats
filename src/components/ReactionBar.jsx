import { useState } from 'react';
import { EMOJIS } from '../hooks/useReactions.js';

export default function ReactionBar({ eventId, counts, myReactions, onToggle }) {
  const [floats, setFloats] = useState([]);

  const handleTap = (emoji) => {
    const myEvt = myReactions?.[eventId] || {};
    const isOn = myEvt[emoji.id];

    if (isOn) {
      // Toggle off
      onToggle(eventId, emoji.id);
    } else {
      // Deselect any existing reaction first
      const currentEmoji = EMOJIS.find(e => myEvt[e.id]);
      if (currentEmoji) {
        onToggle(eventId, currentEmoji.id);
      }
      // Select new one
      onToggle(eventId, emoji.id);
      // Float animation
      const id = Date.now() + emoji.id;
      setFloats(prev => [...prev, { id, emoji: emoji.emoji }]);
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 800);
    }
  };

  const eventCounts = counts?.[eventId] || {};
  const myEvt = myReactions?.[eventId] || {};

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, position: "relative", justifyContent: "flex-end" }}>
      {EMOJIS.map(e => {
        const count = eventCounts[e.id] || 0;
        const isOn = myEvt[e.id];
        return (
          <span key={e.id} onClick={(ev) => { ev.stopPropagation(); handleTap(e); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 8px", borderRadius: 99, cursor: "pointer",
              fontSize: 15, userSelect: "none",
              transition: "transform 0.1s",
              background: isOn ? "#F59E0B22" : "#334155",
              border: isOn ? "1px solid #F59E0B44" : "1px solid transparent",
            }}>
            {e.emoji}
            {count > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600, minWidth: 8,
                color: isOn ? "#F59E0B" : "#CBD5E1",
              }}>{count}</span>
            )}
          </span>
        );
      })}
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

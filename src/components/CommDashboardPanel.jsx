import { S, theme } from '../utils/styles.js';

export default function CommDashboardPanel() {
  return (
    <div style={{ padding: "0 16px 8px" }}>
      <div onClick={() => { window.location.hash = '#/record'; }} style={{
        ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
      }}>
        <div style={{ fontSize: 24 }}>📅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Match Schedule</div>
          <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>All matches, start live, quick score</div>
        </div>
      </div>
      <div onClick={() => { window.location.hash = '#/record'; }} style={{
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

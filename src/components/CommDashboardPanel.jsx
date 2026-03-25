import { S, theme } from '../utils/styles.js';

export default function CommDashboardPanel() {
  return (
    <div style={{ padding: "0 16px 8px" }}>
      <a href="#/record" style={{ textDecoration: 'none' }}>
        <div style={{
          ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ fontSize: 24 }}>📅</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>Match Schedule</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>All matches, start live, quick score</div>
          </div>
        </div>
      </a>
      <a href="#/record" style={{ textDecoration: 'none' }}>
        <div style={{
          ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ fontSize: 24 }}>🎮</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>Demo Match</div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 1 }}>Try the recorder, data discarded</div>
          </div>
        </div>
      </a>
    </div>
  );
}

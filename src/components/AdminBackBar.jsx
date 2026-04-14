/**
 * Compact back bar for admin sub-screens.
 * Shows: ← Admin  |  Screen Title
 */
export default function AdminBackBar({ title, onBack }) {
  return (
    <div style={{
      padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: '1px solid #1E293B',
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid #334155', borderRadius: 6,
          color: '#94A3B8', fontSize: 10, cursor: 'pointer', padding: '3px 10px',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          ← Admin
        </button>
      )}
      {title && <span style={{ fontSize: 13, fontWeight: 800, color: '#CBD5E1' }}>{title}</span>}
    </div>
  );
}

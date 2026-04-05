const tabs = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'scores', icon: '🏑', label: 'Scores' },
  { id: 'teams', icon: '🏫', label: 'Teams' },
  { id: 'rankings', icon: '🏆', label: 'Rankings' },
  { id: 'more', icon: '☰', label: 'More' },
];

export default function BottomNav({ active, onChange, liveBadge }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 600, height: 56, background: '#0F172A',
      borderTop: '1px solid #1E293B', display: 'flex', zIndex: 100,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <div key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 2, cursor: 'pointer', position: 'relative',
          }}>
            <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.6 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 600, color: isActive ? '#F59E0B' : '#64748B' }}>{t.label}</span>
            {t.id === 'scores' && liveBadge > 0 && (
              <div style={{
                position: 'absolute', top: 6, right: '50%', marginRight: -16,
                width: 14, height: 14, borderRadius: 7, background: '#EF4444',
                fontSize: 8, fontWeight: 800, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{liveBadge}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

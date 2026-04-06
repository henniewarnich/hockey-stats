// Kykie loading spinner — rotating arrow on logo
// Usage: <KykieSpinner /> for inline, <KykieSpinner size={64} text /> for full-screen

export default function KykieSpinner({ size = 40, text = false, message }) {
  const animStyle = `
    @keyframes kykie-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes kykie-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes kykie-dots { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: text ? 12 : 0 }}>
      <style>{animStyle}</style>
      <svg width={size} height={size} viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"
          style={{ animation: 'kykie-pulse 2s ease-in-out infinite' }} />
        <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2" />
        <g style={{ transformOrigin: '28px 28px', animation: 'kykie-spin 1.8s ease-in-out infinite' }}>
          <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
      {text && (
        <>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#F59E0B' }}>kykie</div>
          {message && <div style={{ fontSize: 11, color: '#64748B' }}>{message}</div>}
        </>
      )}
    </div>
  );
}

// Full-screen loading overlay
export function KykieLoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column',
    }}>
      <KykieSpinner size={64} text message={message} />
    </div>
  );
}

export default function NavLogo() {
  return (
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
      <svg width="16" height="16" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="3"/>
        <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="3"/>
        <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
        <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
        <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 900, color: "#F59E0B" }}>kykie</span>
    </div>
  );
}

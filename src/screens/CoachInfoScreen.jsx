import { useState } from 'react';
import { FREE_PLUS_THRESHOLD, TEAM_CREDIT_VALUES as TC } from '../utils/credits.js';

const S = { card: { background: '#1E293B', borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid transparent' } };

const FEATURES = [
  { id: 'stats', color: '#3B82F6', title: 'Match stats', desc: 'Per quarter breakdowns, conversion rates',
    icon: 'M18 20V10M12 20V4M6 20v-6',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>Match stats preview</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
        {[['12', 'D entries', '#F8FAFC'], ['3', 'Goals', '#10B981'], ['58%', 'Territory', '#F59E0B'], ['4:1', 'D:Goal', '#3B82F6']].map(([v, l, c]) =>
          <div key={l} style={{ background: '#1E293B', borderRadius: 6, padding: '6px 2px' }}><div style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</div><div style={{ fontSize: 7, color: '#64748B' }}>{l}</div></div>
        )}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
        {[70, 90, 45, 100].map((h, i) => <div key={i} style={{ flex: 1, background: '#3B82F6' + (i === 3 ? '88' : '44'), borderRadius: '2px 2px 0 0', height: h + '%' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 8, color: '#475569', marginTop: 2 }}><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
    </div> },
  { id: 'live', color: '#F59E0B', title: 'Live dashboard', desc: 'Follow matches in real time',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>Live dashboard preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 8, color: '#3B82F6', fontWeight: 700 }}>HOME</div><div style={{ fontSize: 22, fontWeight: 900 }}>2</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', margin: '0 auto 4px' }} /><div style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>Q3 18:42</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 8, color: '#EF4444', fontWeight: 700 }}>AWAY</div><div style={{ fontSize: 22, fontWeight: 900 }}>1</div></div>
      </div>
      <div style={{ marginTop: 6, fontSize: 9, color: '#94A3B8', lineHeight: 1.7 }}>
        <div style={{ padding: '2px 0', borderBottom: '1px solid #1E293B' }}>D Entry — attacking into the circle</div>
        <div style={{ padding: '2px 0' }}>Short corner awarded</div>
      </div>
    </div> },
  { id: 'insights', color: '#10B981', title: 'Match insights', desc: 'Strengths, weaknesses, patterns',
    icon: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>Match insights preview</div>
      <div style={{ marginBottom: 8 }}><div style={{ fontSize: 9, color: '#10B981', fontWeight: 700, marginBottom: 4 }}>Strengths</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{['High territory 62%', 'Clinical Q1 finishing', 'Low turnovers'].map(s => <span key={s} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#10B98118', color: '#10B981' }}>{s}</span>)}</div></div>
      <div><div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>Areas to work on</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{['Q3 intensity dip', 'Midfield turnovers', 'Conversion 8%'].map(s => <span key={s} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: '#EF444418', color: '#EF4444' }}>{s}</span>)}</div></div>
    </div> },
  { id: 'trends', color: '#8B5CF6', title: 'Season trends', desc: 'Performance over time',
    icon: 'M22 12l-4 0-3 9-6-18-3 9-4 0',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>Season trends preview</div>
      <svg width="100%" height="56" viewBox="0 0 300 56"><line x1="0" y1="28" x2="300" y2="28" stroke="#1E293B" strokeWidth="1"/><polyline points="10,48 45,42 80,44 115,35 150,28 185,22 220,18 255,12 290,8" fill="none" stroke="#8B5CF644" strokeWidth="6"/><polyline points="10,48 45,42 80,44 115,35 150,28 185,22 220,18 255,12 290,8" fill="none" stroke="#8B5CF6" strokeWidth="2"/><circle cx="290" cy="8" r="3.5" fill="#8B5CF6"/></svg>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>D entries per match trending upward across last 8 games</div>
    </div> },
];

const TIERS = [
  { color: '#3B82F6', label: 'Free', desc: 'Your team\'s match stats and insights — always available, no strings attached', icon: 'M20 6l-11 11-5-5', last: false },
  { color: '#F59E0B', label: 'Free Plus', desc: `Opposition scouting, visual play analysis, ranking trends — unlocks at ${FREE_PLUS_THRESHOLD}+ avg credits/match`, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z', last: false },
  { color: '#10B981', label: 'Premium', desc: 'TOP10 benchmarks, AI scouting reports, training suggestions — R5,000/team/year', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', last: true },
];

export default function CoachInfoScreen() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { window.history.back(); }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16, cursor: 'pointer', padding: 0 }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>kykie</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: '#10B98122', border: '1px solid #10B98144', marginBottom: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Your team, your edge</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 1.5 }}>Real match data. Visual analysis. Opposition intel.<br/>Everything a hockey coach needs — on your phone.</div>
      </div>

      <Lbl>What you get <span style={{ color: '#64748B', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(tap to preview)</span></Lbl>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {FEATURES.map(f => (
          <div key={f.id} onClick={() => setActive(active === f.id ? null : f.id)}
            style={{ ...S.card, borderColor: active === f.id ? f.color + '44' : 'transparent' }}>
            <div style={{ width: 32, height: 32, margin: '0 auto 6px', borderRadius: 8, background: f.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2"><path d={f.icon}/></svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{f.title}</div>
            <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      {active && (() => { const f = FEATURES.find(f => f.id === active); return f?.preview ? f.preview() : null; })()}

      <div style={{ height: 14 }} />
      <Lbl>Unlock more with coverage</Lbl>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
        {TIERS.map(t => (
          <div key={t.label} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color + '22', border: `2px solid ${t.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5"><path d={t.icon}/></svg>
              </div>
              {!t.last && <div style={{ width: 2, flex: 1, background: '#334155' }} />}
            </div>
            <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', flex: 1, borderLeft: `3px solid ${t.color}`, marginBottom: t.last ? 0 : 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Lbl>How your team earns credits</Lbl>
      <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Every match earns credits</span>
          <span style={{ fontSize: 9, color: '#64748B' }}>Both teams benefit</span>
        </div>
        <CreditRow label="Match scheduled" val={TC.schedule} />
        <CreditRow label="Score entered" val={TC.score} />
        <CreditRow label="Live Pro recorded" val={TC.live_pro} highlight />
        <CreditRow label="Video review (within 24h)" val={TC.video_same_day} />
        <CreditRow label="Video review (older)" val={TC.video_older} />
        <CreditRow label="Live Basic recorded" val={TC.live_lite} />
        <CreditRow label="Each unique viewer" val={TC.viewer} />
        <CreditRow label="Correct match prediction" val={2} />
        <CreditRow label="Exact score prediction" val={5} />
      </div>
      <Example text={<>A Live Pro match with 20 viewers = <G>80 credits</G><br/>That's 80 avg on one match — a few more with scores and you're past 20 avg</>} />

      <Lbl>Get your school involved</Lbl>
      <Steps items={[['Register', 'Select your school and team', '#3B82F6'], ['Promote', 'Share match links with parents', '#F59E0B'], ['Unlock', 'More coverage = more insights', '#10B981']]} />
      <Btn color="#10B981" label="Register as coach" href="#/register?role=coach" />
      <Sub>Free to join. Free features forever. Upgrade anytime.</Sub>
    </div>
  );
}

function Lbl({ children }) { return <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{children}</div>; }
function CreditRow({ label, val, highlight }) { return <div style={{ display: 'flex', justifyContent: 'space-between', ...(highlight ? { background: '#10B98108', margin: '2px -6px', padding: '4px 6px', borderRadius: 4 } : { padding: '2.5px 0' }) }}><span style={{ fontSize: 10, color: highlight ? '#CBD5E1' : '#94A3B8', fontWeight: highlight ? 600 : 400 }}>{label}</span><span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>+{val}</span></div>; }
function Example({ text }) { return <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: 12, marginBottom: 16 }}><div style={{ fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}><span style={{ color: '#F59E0B', fontWeight: 700 }}>Example: </span>{text}</div></div>; }
function G({ children }) { return <span style={{ color: '#10B981', fontWeight: 700 }}>{children}</span>; }
function Steps({ items }) { return <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>{items.map(([t, d, c], i) => <div key={i} style={{ flex: 1, background: '#1E293B', borderRadius: 10, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: c }}>{i + 1}</div><div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{t}</div><div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{d}</div></div>)}</div>; }
function Btn({ color, label, href }) { return <button onClick={() => { window.location.hash = href; }} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: color, color: '#0B0F1A', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>{label}</button>; }
function Sub({ children }) { return <div style={{ textAlign: 'center', fontSize: 10, color: '#64748B', marginBottom: 20 }}>{children}</div>; }

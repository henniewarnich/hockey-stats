import { useState } from 'react';
import { FREE_PLUS_THRESHOLD } from '../utils/credits.js';

const S = { card: { background: '#1E293B', borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid transparent' } };

const FEATURES = [
  { id: 'live', color: '#10B981', title: 'Live scores', desc: 'Ball-by-ball updates as it happens',
    icon: 'M23 7l-7 5 7 5zM1 5h15v14H1z',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>Live score preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 8, color: '#3B82F6', fontWeight: 700 }}>HOME</div><div style={{ fontSize: 20, fontWeight: 900 }}>2</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', margin: '0 auto 3px' }} /><div style={{ fontSize: 8, color: '#10B981', fontWeight: 700 }}>Q3</div></div>
          <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 8, color: '#EF4444', fontWeight: 700 }}>AWAY</div><div style={{ fontSize: 20, fontWeight: 900 }}>1</div></div>
        </div>
        <div style={{ fontSize: 9, color: '#94A3B8', borderTop: '1px solid #334155', paddingTop: 6, lineHeight: 1.7 }}>
          <div>D Entry — attacking into the circle</div><div>Short corner — drag flick saved!</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: '#64748B', marginTop: 6, textAlign: 'center' }}>Ball-by-ball commentary as it happens. No video needed — works on any phone.</div>
    </div> },
  { id: 'react', color: '#F59E0B', title: 'React live', desc: 'Cheer goals, celebrate saves',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>Live reactions preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>GOAL! 2-1 in the final quarter</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[['🔥', 24], ['🎉', 18], ['👏', 12], ['❤️', 8]].map(([e, n]) => <span key={e} style={{ background: '#F59E0B18', padding: '3px 8px', borderRadius: 99, fontSize: 11 }}>{e} {n}</span>)}
          <span style={{ background: '#33415566', padding: '3px 8px', borderRadius: 99, fontSize: 12 }}>+</span>
        </div>
      </div>
      <div style={{ fontSize: 9, color: '#64748B', marginTop: 6, textAlign: 'center' }}>React to every goal, save, and short corner. Your reactions appear in the live feed for everyone watching.</div>
    </div> },
  { id: 'predict', color: '#8B5CF6', title: 'Predict', desc: 'Predict scores, earn team credits',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', marginBottom: 8 }}>Match prediction preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 9, color: '#64748B', marginBottom: 6 }}>Sat 12 Apr · 14:00</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700 }}>Home</div></div>
          <div style={{ fontSize: 10, color: '#64748B' }}>vs</div>
          <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700 }}>Away</div></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0B0F1A', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>2</div>
          <span style={{ fontSize: 10, color: '#64748B' }}>—</span>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0B0F1A', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>1</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 99, background: '#8B5CF622', color: '#8B5CF6', fontWeight: 700 }}>23 predictions so far</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1, background: '#1E293B', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>+2</div>
          <div style={{ fontSize: 8, color: '#64748B' }}>Correct result</div>
        </div>
        <div style={{ flex: 1, background: '#1E293B', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#F59E0B' }}>+5</div>
          <div style={{ fontSize: 8, color: '#64748B' }}>Exact score</div>
        </div>
        <div style={{ flex: 1, background: '#1E293B', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>0</div>
          <div style={{ fontSize: 8, color: '#64748B' }}>Wrong (no penalty)</div>
        </div>
      </div>
    </div> },
  { id: 'results', color: '#3B82F6', title: 'Results & rankings', desc: 'Full match history for your school',
    icon: 'M18 20V10M12 20V4M6 20v-6',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>Results & rankings preview</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        {[['Home vs Away', '29 Mar', '3-1', '#10B981'], ['Home vs Away', '27 Mar', '0-0', '#F59E0B']].map(([t, d, s, c]) =>
          <div key={d} style={{ background: '#1E293B', borderRadius: 6, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: 10, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 8, color: '#64748B' }}>{d}</div></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{s}</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[['#1', 'School A', '#F59E0B'], ['#2', 'School B', '#94A3B8'], ['#28', 'Your school', '#F59E0B']].map(([r, n, c]) =>
          <div key={r} style={{ background: r === '#28' ? '#F59E0B11' : '#1E293B', border: r === '#28' ? '1px solid #F59E0B33' : 'none', borderRadius: 6, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: c, width: 24 }}>{r}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: r === '#28' ? '#F59E0B' : '#F8FAFC' }}>{n}</span>
          </div>
        )}
      </div>
    </div> },
];

export default function SupporterInfoScreen() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { window.location.hash = ''; }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16, cursor: 'pointer', padding: 0 }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>kykie</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: '#8B5CF622', border: '1px solid #8B5CF644', marginBottom: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Your support matters</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 1.5 }}>Follow your school. Watch live. Predict scores.<br/>Every view earns your team credits toward better analytics.</div>
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
      {active && (() => { const f = FEATURES.find(x => x.id === active); return f?.preview ? f.preview() : null; })()}

      <div style={{ height: 14 }} />
      <Lbl>How you help your team</Lbl>
      <div style={{ background: '#8B5CF611', border: '1px solid #8B5CF633', borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', marginBottom: 8, textAlign: 'center' }}>Every view counts</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[['#10B981', '+1', 'credit per', 'unique viewer'], ['#F59E0B', String(FREE_PLUS_THRESHOLD), 'avg credits/match', 'unlocks Free Plus'], ['#8B5CF6', '+2', 'per correct', 'prediction']].map(([c, v, l1, l2]) =>
            <div key={v+l2} style={{ flex: 1, background: '#0B0F1A', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{l1}<br/>{l2}</div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 }}>When you watch a match, your team earns a credit. Predict the score and get it right for bonus credits. Share the link with fellow parents — <span style={{ color: '#8B5CF6', fontWeight: 600 }}>the more viewers, the more your coach unlocks</span>.</div>
      </div>

      <Lbl>Share and grow</Lbl>
      <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        {[
          ['#25D366', 'Share match links via WhatsApp', 'One tap to share your team\'s live match with the parent group', 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'],
          ['#3B82F6', 'Rally your school community', 'More viewers = more credits = better insights for your coach', 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'],
        ].map(([c, t, d, icon]) =>
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, ...(c === '#3B82F6' ? { marginTop: 10 } : {}) }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d={icon}/></svg>
            </div>
            <div><div style={{ fontSize: 11, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{d}</div></div>
          </div>
        )}
      </div>

      <Lbl>It's free and simple</Lbl>
      <Steps items={[['Register', 'Pick your school', '#8B5CF6'], ['Follow', 'Get notified on match days', '#F59E0B'], ['Watch', 'Every view helps', '#10B981']]} />
      <Btn color="#8B5CF6" label="Follow your school" href="#/register?role=supporter" />
      <Sub>Free forever. No ads. Just school sport.</Sub>
    </div>
  );
}

function Lbl({ children }) { return <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{children}</div>; }
function Steps({ items }) { return <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>{items.map(([t, d, c], i) => <div key={i} style={{ flex: 1, background: '#1E293B', borderRadius: 10, padding: 12, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: c }}>{i + 1}</div><div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{t}</div><div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{d}</div></div>)}</div>; }
function Btn({ color, label, href }) { return <button onClick={() => { window.location.hash = href; }} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: color, color: '#FFF', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>{label}</button>; }
function Sub({ children }) { return <div style={{ textAlign: 'center', fontSize: 10, color: '#64748B', marginBottom: 20 }}>{children}</div>; }

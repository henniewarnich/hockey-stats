import { useState } from 'react';
import { CREDIT_VALUES as CV, VOUCHER_THRESHOLD } from '../utils/credits.js';

const S = { card: { background: '#1E293B', borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid transparent' } };

const FEATURES = [
  { id: 'livepro', color: '#EF4444', title: 'Live Pro', desc: 'Full field recorder with zones and positions',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 9a3 3 0 100 6 3 3 0 000-6z',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>Live Pro preview</div>
      <div style={{ background: '#116B35', borderRadius: 8, padding: 8, position: 'relative', height: 80, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 50, height: 34, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12 }} />
        <div style={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
        <div style={{ position: 'absolute', top: 20, left: '40%', width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
        <div style={{ position: 'absolute', bottom: 15, right: '30%', width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
      </div>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Tap zones on the field to record events in real time. Every touch, shot, and D entry is captured with position data.</div>
    </div> },
  { id: 'video', color: '#8B5CF6', title: 'Video review', desc: 'Record from YouTube or match video at your pace',
    icon: 'M2 2h20v20H2zM7 2v20M17 2v20M2 12h20',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', marginBottom: 8 }}>Video review preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 30, borderRadius: 4, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B5CF6"><polygon points="5 3 19 12 5 21"/></svg>
        </div>
        <div><div style={{ fontSize: 10, fontWeight: 700 }}>Watch and record</div><div style={{ fontSize: 9, color: '#64748B', marginTop: 1 }}>Pause anytime, speed controls (1x, 1.5x, 2x)</div></div>
      </div>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Record matches from YouTube or any video source. Same field recorder, at your own pace. Perfect for catching up on matches you missed.</div>
    </div> },
  { id: 'quick', color: '#10B981', title: 'Quick score', desc: 'Enter a final score in seconds',
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>Quick score preview</div>
      <div style={{ background: '#1E293B', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 8, color: '#64748B', fontWeight: 700 }}>HOME</div><div style={{ fontSize: 22, fontWeight: 900 }}>3</div></div>
        <div style={{ fontSize: 11, color: '#64748B' }}>vs</div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 8, color: '#64748B', fontWeight: 700 }}>AWAY</div><div style={{ fontSize: 22, fontWeight: 900 }}>1</div></div>
      </div>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Know the result? Enter it in 10 seconds. Select teams, tap the score, done. Every result helps build the rankings.</div>
    </div> },
  { id: 'schedule', color: '#3B82F6', title: 'Schedule', desc: 'Set up upcoming fixtures for your school',
    icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    preview: () => <div style={{ background: '#0F172A', borderRadius: 10, padding: 14, margin: '8px 0 0', border: '1px solid #334155' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>Scheduling preview</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[['Sat 12 Apr', '14:00 at Home'], ['Wed 16 Apr', '15:30 at Away']].map(([d, t]) =>
          <div key={d} style={{ background: '#1E293B', borderRadius: 6, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{d}</span><span style={{ fontSize: 9, color: '#64748B' }}>{t}</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Set up your school's fixture list. Other commentators can claim and record matches you schedule.</div>
    </div> },
];

const JOURNEY = [
  { color: '#64748B', label: 'Trainee', desc: 'Register and access training materials. Learn the field recorder at your own pace.', icon: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z', last: false },
  { color: '#F59E0B', label: 'Apprentice', desc: 'Pass the benchmark test by recording a sample match. Show you can use the recorder accurately.', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2', last: false },
  { color: '#10B981', label: 'Qualified', desc: 'Full access to record live and from video. Schedule matches. Earn credits toward vouchers.', icon: 'M20 6l-11 11-5-5', last: true },
];

export default function CommentatorInfoScreen() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { window.location.hash = ''; }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16, cursor: 'pointer', padding: 0 }}>←</button>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>kykie</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: '#F59E0B22', border: '1px solid #F59E0B44', marginBottom: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Earn while you cover</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 1.5 }}>Record school hockey matches from video or live.<br/>Earn credits. Get Takealot vouchers. Build your profile.</div>
      </div>

      <Lbl>What you do <span style={{ color: '#64748B', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(tap to preview)</span></Lbl>
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
      <Lbl>Your journey</Lbl>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
        {JOURNEY.map(t => (
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

      <Lbl>Earn credits, get vouchers</Lbl>
      <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Credits per contribution</span>
          <span style={{ fontSize: 9, color: '#64748B' }}>Once qualified</span>
        </div>
        <CreditRow label="Live Pro match" val={CV.live_pro} highlight />
        <CreditRow label="Video review (within 24h)" val={CV.video_same_day} />
        <CreditRow label="Video review (older)" val={CV.video_older} />
        <CreditRow label="Live Basic match" val={CV.live_lite} />
        <CreditRow label="Quick score" val={CV.quick_score} />
        <CreditRow label="Schedule match" val={CV.schedule} />
        <CreditRow label="Confirmed issue report" val={CV.issue} />
      </div>

      <div style={{ background: '#F59E0B11', border: '1px solid #F59E0B33', borderRadius: 10, padding: 14, marginBottom: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#F59E0B' }}>{VOUCHER_THRESHOLD} credits = R100 voucher</span>
        </div>
        <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.5 }}>Takealot e-voucher issued by admin when you hit {VOUCHER_THRESHOLD}.<br/>Leftover credits carry forward to the next one.</div>
      </div>

      <Example text={<>Record 2 Live Pro matches = <G>100 credits = R100</G><br/>Or 5 video reviews from your couch = <G>100 credits = R100</G></>} />

      <Lbl>Get started</Lbl>
      <Steps items={[['Register', 'Pick your sport', '#64748B'], ['Train', 'Learn the recorder', '#F59E0B'], ['Earn', 'Record and get paid', '#10B981']]} />
      <Btn color="#F59E0B" label="Register as commentator" href="#/register?role=commentator" />
      <Sub>Free to join. No experience needed. We'll teach you.</Sub>
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

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { APP_VERSION, ZONES, D_OPTIONS } from '../utils/constants.js';
import { getBenchmarkConfig, getBenchmarkReferenceEvents, compareBenchmark, saveBenchmarkResult } from '../utils/benchmark.js';
import RoleSwitcher from '../components/RoleSwitcher.jsx';
import LiveModeChooser from '../components/LiveModeChooser.jsx';
import LiveMatchScreen from './LiveMatchScreen.jsx';
import LiveLiteScreen from './LiveLiteScreen.jsx';

const LEARN_TOPICS = [
  {
    id: 'zones',
    title: 'The field zones',
    content: 'The hockey field is divided into 4 zones from the home team\'s perspective: Own Quarter → Own Midfield → Opp Midfield → Opp Quarter. Each zone has Left, Centre, and Right positions. Tap anywhere on the field to record where the action is happening.',
    tip: 'Remember: zones are always from the home team\'s perspective. The away team\'s zones are inverted.',
  },
  {
    id: 'events',
    title: 'Key event types',
    content: 'The main events you\'ll record are: D Entry (ball enters the D-circle), Goal, Shot on Goal, Shot Off Target, Short Corner, Long Corner, Turnover Won, Possession Conceded, and Dead Ball. Don\'t worry about getting every single event — focus on the key ones.',
    tip: 'D Entries, Goals, Short Corners, and Turnovers carry the most weight in analysis.',
  },
  {
    id: 'dcircle',
    title: 'D-circle popup',
    content: 'When you tap in the opponent\'s quarter, a D-circle popup appears asking what happened. You\'ll choose from: Shot on Goal, Shot Off Target, Goal, Short Corner, Long Corner, Penalty, Lost Possession, or Dead Ball. The popup stays open after shots so you can quickly record the next action.',
    tip: 'A Short Corner is awarded when a foul occurs inside the D. The ball is pushed from the backline.',
  },
  {
    id: 'recording',
    title: 'Recording flow',
    content: 'Before the match starts, you\'ll set up the teams, match length, and break format. Once live, the timer runs and you tap zones as the action moves. Use the Pause button for quarter breaks and injuries. At the end, tap End Match to save.',
    tip: 'Stay calm and don\'t chase every touch. Focus on when the ball changes zones, enters the D, or possession changes.',
  },
  {
    id: 'quality',
    title: 'Quality tips',
    content: 'Aim for 4-8 events per minute as a guideline. Too few events mean gaps in coverage. Too many (like tapping for every touch) clutters the data. Watch for D Entries — these are the most important events for coaches. Always record goals and short corners accurately.',
    tip: 'A good recording has clear zone transitions, all goals captured, and consistent coverage across all quarters.',
  },
];

const DEMO_CONFIG = {
  home: { name: 'Demo Lions', color: '#1D4ED8', id: 'demo-home', short: 'DLI' },
  away: { name: 'Demo Eagles', color: '#DC2626', id: 'demo-away', short: 'DEA' },
  matchLength: 10, breakFormat: 'none', venue: 'Demo Pitch',
  date: new Date().toISOString().slice(0, 10), isDemo: true,
};

export default function TrainingScreen({ currentUser, onLogout, onRoleSwitch, onQualified }) {
  const [view, setView] = useState('home'); // home | learn | benchmark_intro | benchmark_result
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [readTopics, setReadTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kykie-training-read') || '[]'); } catch { return []; }
  });
  const [practiceCount, setPracticeCount] = useState(() => {
    return parseInt(localStorage.getItem('kykie-training-practices') || '0', 10);
  });
  const [benchmarkConfig, setBenchmarkConfig] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(true);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Live match state for demo/benchmark
  const [activeMatch, setActiveMatch] = useState(null);
  const [liveMode, setLiveMode] = useState(null);
  const [pendingStart, setPendingStart] = useState(null);

  useEffect(() => {
    loadBenchmark();
  }, []);

  const loadBenchmark = async () => {
    setBenchmarkLoading(true);
    const cfg = await getBenchmarkConfig();
    setBenchmarkConfig(cfg);
    setBenchmarkLoading(false);
  };

  const markRead = (topicId) => {
    const next = readTopics.includes(topicId) ? readTopics : [...readTopics, topicId];
    setReadTopics(next);
    localStorage.setItem('kykie-training-read', JSON.stringify(next));
  };

  const markAllRead = () => {
    const all = LEARN_TOPICS.map(t => t.id);
    setReadTopics(all);
    localStorage.setItem('kykie-training-read', JSON.stringify(all));
  };

  const allRead = LEARN_TOPICS.every(t => readTopics.includes(t.id));
  const practiced = practiceCount > 0;
  const stepsComplete = (allRead ? 1 : 0) + (practiced ? 1 : 0);
  const canTest = allRead && practiced;

  // ── Demo match handlers ──
  const handleStartDemo = () => {
    setPendingStart({ _isDemo: true });
  };

  const handleModeChosen = (mode) => {
    const config = { ...DEMO_CONFIG, liveMode: mode };
    setActiveMatch(config);
    setLiveMode(mode);
    setPendingStart(null);
  };

  const handleDemoEnd = () => {
    setActiveMatch(null);
    setLiveMode(null);
    const next = practiceCount + 1;
    setPracticeCount(next);
    localStorage.setItem('kykie-training-practices', String(next));
  };

  // ── Benchmark test handlers ──
  const handleStartBenchmark = () => {
    if (!benchmarkConfig?.refMatchId) return;
    // Open video review mode with the benchmark video URL
    // For now, launch as a regular live match with demo teams
    // The trainee records against the video, then we compare
    const config = {
      home: { name: benchmarkConfig.homeTeam || 'Team A', color: '#1D4ED8', id: 'bench-home', short: 'TMA' },
      away: { name: benchmarkConfig.awayTeam || 'Team B', color: '#DC2626', id: 'bench-away', short: 'TMB' },
      matchLength: benchmarkConfig.matchLength || 60,
      breakFormat: benchmarkConfig.breakFormat || 'quarters',
      venue: 'Benchmark Test',
      date: new Date().toISOString().slice(0, 10),
      isBenchmark: true,
      benchmarkRefMatchId: benchmarkConfig.refMatchId,
      videoUrl: benchmarkConfig.videoUrl,
    };
    setActiveMatch(config);
    setLiveMode('pro');
    setPendingStart(null);
  };

  const handleBenchmarkEnd = async (game) => {
    setActiveMatch(null);
    setLiveMode(null);

    if (!game || !benchmarkConfig?.refMatchId) return;

    // Fetch reference events
    const refEvents = await getBenchmarkReferenceEvents(benchmarkConfig.refMatchId);
    const traineeEvents = game.events || [];

    // Compare
    const result = compareBenchmark(traineeEvents, refEvents);
    setBenchmarkResult(result);
    setView('benchmark_result');

    // Save to profile
    setSaving(true);
    await saveBenchmarkResult(currentUser.id, result.overall, result.passed);
    setSaving(false);
  };

  // ── Rendering active match ──
  if (pendingStart) {
    return (
      <LiveModeChooser
        matchConfig={DEMO_CONFIG}
        onChoose={handleModeChosen}
        onCancel={() => setPendingStart(null)}
      />
    );
  }

  if (activeMatch && liveMode === 'pro') {
    return (
      <LiveMatchScreen
        config={activeMatch}
        onSave={(game) => {
          if (activeMatch.isBenchmark) {
            handleBenchmarkEnd(game);
          } else {
            handleDemoEnd();
          }
          return game;
        }}
        onEnd={() => {
          if (activeMatch.isBenchmark) {
            // Don't end without saving — let onSave handle it
          } else {
            handleDemoEnd();
          }
        }}
        onBack={() => { setActiveMatch(null); setLiveMode(null); }}
        currentUser={currentUser}
      />
    );
  }

  if (activeMatch && liveMode === 'lite') {
    return (
      <LiveLiteScreen
        config={activeMatch}
        onSave={() => { handleDemoEnd(); return activeMatch; }}
        onEnd={handleDemoEnd}
        onBack={() => { setActiveMatch(null); setLiveMode(null); }}
        currentUser={currentUser}
      />
    );
  }

  const S = {
    page: {
      fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: '0 auto',
      background: '#0B0F1A', minHeight: '100vh', color: '#F8FAFC', padding: '16px 16px 24px',
    },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    statusBadge: {
      background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: 10, padding: 12,
      marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
    },
    card: {
      background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 8, cursor: 'pointer',
    },
    btn: (bg = '#10B981', disabled = false) => ({
      width: '100%', padding: 12, borderRadius: 10, border: 'none',
      background: disabled ? '#334155' : bg, color: disabled ? '#64748B' : bg === '#F59E0B' ? '#0B0F1A' : '#F8FAFC',
      fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    backBtn: {
      background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: 0,
    },
  };

  // ── Benchmark result view ──
  if (view === 'benchmark_result' && benchmarkResult) {
    const { metrics, overall, passed } = benchmarkResult;
    const scoreColor = passed ? '#10B981' : overall >= 60 ? '#F59E0B' : '#EF4444';
    return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}>
          <button onClick={() => setView('home')} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Benchmark result</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Score circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            width: 100, height: 100, borderRadius: 50, border: `4px solid ${scoreColor}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: scoreColor }}>{overall}%</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>{passed ? 'PASS' : 'FAIL'}</div>
          </div>
          <div style={{ fontSize: 12, color: scoreColor, fontWeight: 600, marginTop: 10 }}>
            {passed ? 'Congratulations! You qualify.' : 'Keep practising — you\'re getting there!'}
          </div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>80% required to pass</div>
        </div>

        {/* Metrics */}
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>Score breakdown</div>
        {metrics.map(m => {
          const c = m.score >= 80 ? '#10B981' : m.score >= 60 ? '#F59E0B' : '#EF4444';
          return (
            <div key={m.key} style={{ background: '#1E293B', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{m.score}%</span>
              </div>
              <div style={{ height: 4, background: '#334155', borderRadius: 2 }}>
                <div style={{ width: `${m.score}%`, height: '100%', background: c, borderRadius: 2, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>{m.detail}</div>
            </div>
          );
        })}

        {passed ? (
          <button onClick={async () => {
            // Reload profile to get updated status
            if (onQualified) onQualified();
            else window.location.reload();
          }} style={{ ...S.btn('#10B981'), marginTop: 16 }}>
            {saving ? 'Saving...' : 'Continue as qualified commentator →'}
          </button>
        ) : (
          <button onClick={() => { setBenchmarkResult(null); setView('home'); }} style={{ ...S.btn('#F59E0B'), marginTop: 16 }}>
            Back to training
          </button>
        )}

        <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', marginTop: 8 }}>
          You can retake the test anytime to improve your score
        </div>
      </div>
    );
  }

  // ── Learn view ──
  if (view === 'learn') {
    return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}>
          <button onClick={() => setView('home')} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Learn the basics</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
          Hockey recording captures what happens on the field in real time. You'll tap zones and events as the action unfolds. Read through each topic below.
        </div>

        {LEARN_TOPICS.map(topic => {
          const isRead = readTopics.includes(topic.id);
          const isExpanded = expandedTopic === topic.id;
          return (
            <div key={topic.id} style={{ ...S.card, borderLeft: isRead ? '3px solid #10B981' : '3px solid #334155' }}
              onClick={() => { setExpandedTopic(isExpanded ? null : topic.id); markRead(topic.id); }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{topic.title}</div>
                <div style={{ fontSize: 10, color: isRead ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                  {isRead ? '✓ Read' : 'Tap to read'}
                </div>
              </div>
              {isExpanded && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>{topic.content}</div>
                  {topic.tip && (
                    <div style={{
                      marginTop: 8, padding: '8px 10px', background: '#0B0F1A', borderRadius: 6,
                      borderLeft: '2px solid #F59E0B',
                    }}>
                      <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600, marginBottom: 2 }}>Tip</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.5 }}>{topic.tip}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Zone diagram */}
        <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 8, marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#64748B' }}>Field zones (home perspective)</div>
          <div style={{ display: 'flex', height: 50, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
            {ZONES.map((z, i) => {
              const colors = ['#10B98133', '#3B82F633', '#F59E0B33', '#EF444433'];
              const textColors = ['#6EE7B7', '#93C5FD', '#FCD34D', '#FCA5A5'];
              return (
                <div key={z.id} style={{
                  flex: 1, background: colors[i], display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 8, color: textColors[i], fontWeight: 600, textAlign: 'center',
                }}>{z.label}</div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 8, color: '#475569' }}>← Home defends</span>
            <span style={{ fontSize: 8, color: '#475569' }}>Home attacks →</span>
          </div>
        </div>

        {/* D-circle options reference */}
        <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#64748B' }}>D-circle options</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {D_OPTIONS.map(opt => (
              <div key={opt.id} style={{
                padding: '4px 8px', borderRadius: 6, background: opt.color + '22',
                fontSize: 10, color: opt.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>{opt.icon}</span> {opt.label}
              </div>
            ))}
          </div>
        </div>

        {!allRead && (
          <button onClick={markAllRead} style={S.btn('#10B981')}>
            Mark all as read ✓
          </button>
        )}
        {allRead && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 600, padding: 12 }}>
            All topics read ✓
          </div>
        )}
      </div>
    );
  }

  // ── Benchmark intro view ──
  if (view === 'benchmark_intro') {
    const available = benchmarkConfig?.enabled && benchmarkConfig?.refMatchId;
    return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={S.header}>
          <button onClick={() => setView('home')} style={S.backBtn}>← Back</button>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Benchmark test</span>
          <div style={{ width: 40 }} />
        </div>

        {available ? (
          <>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
              You'll record a real hockey match from a YouTube video. Your recording will be compared against an expert's recording of the same match.
            </div>

            <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Open the YouTube video in a separate window/tab',
                  'Start recording on Kykie as you watch',
                  'Record all events you see — goals, D entries, short corners, etc.',
                  'End the match when the video ends',
                  'Your recording is auto-graded against the expert benchmark',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#94A3B8' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 9, background: '#F59E0B22', color: '#F59E0B',
                      fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{i + 1}</div>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Pass criteria</div>
              <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>80% overall accuracy</div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>
                Scored on: Goals (25%), D Entries (20%), Short Corners (15%), Shots (15%), Zone Accuracy (15%), Turnovers (10%)
              </div>
            </div>

            {benchmarkConfig.videoUrl && (
              <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Match video</div>
                <a href={benchmarkConfig.videoUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#3B82F6', wordBreak: 'break-all' }}>
                  {benchmarkConfig.videoUrl}
                </a>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                  Open this in a separate tab before starting the test.
                </div>
              </div>
            )}

            {currentUser?.benchmark_score && (
              <div style={{ background: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12, borderLeft: '3px solid #F59E0B' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Previous best</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#F59E0B' }}>{currentUser.benchmark_score}%</div>
              </div>
            )}

            <button onClick={handleStartBenchmark} style={S.btn('#F59E0B')}>
              Start benchmark test →
            </button>
            <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', marginTop: 8 }}>
              Unlimited retakes allowed
            </div>
          </>
        ) : (
          <>
            <div style={{
              background: '#1E293B', borderRadius: 10, padding: 20, textAlign: 'center', marginTop: 20,
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Benchmark test coming soon</div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
                The benchmark test is being prepared. In the meantime, keep practising with demo matches to get comfortable with the field recorder.
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Home view ──
  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
            <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
            <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B' }}>kykie</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentUser?.roles?.length > 1 && (
            <RoleSwitcher currentUser={currentUser} onSwitch={onRoleSwitch} />
          )}
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 10, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div style={S.statusBadge}>
        <div style={{ fontSize: 28 }}>🎙️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>Commentator trainee</div>
          <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>
            Complete training to unlock live recording, scheduling, and earn credits.
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 6 }}>
          <span>Progress</span>
          <span>{stepsComplete} of 3 complete</span>
        </div>
        <div style={{ height: 6, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(stepsComplete / 3) * 100}%`, height: '100%', background: '#10B981', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Step 1: Learn */}
      <div style={{
        ...S.card, borderLeft: allRead ? '3px solid #10B981' : '3px solid #F59E0B',
        cursor: 'pointer',
      }} onClick={() => setView('learn')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              background: allRead ? '#10B981' : '#F59E0B',
              color: '#0B0F1A', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{allRead ? '✓' : '1'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Learn the basics</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Events, zones, and how to record</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: allRead ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
            {allRead ? 'Done' : `${readTopics.length}/${LEARN_TOPICS.length}`} ›
          </div>
        </div>
      </div>

      {/* Step 2: Practice */}
      <div style={{
        ...S.card,
        borderLeft: practiced ? '3px solid #10B981' : allRead ? '3px solid #F59E0B' : '3px solid #334155',
        opacity: allRead ? 1 : 0.6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              background: practiced ? '#10B981' : allRead ? '#F59E0B' : '#334155',
              color: practiced || allRead ? '#0B0F1A' : '#64748B',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{practiced ? '✓' : '2'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: allRead ? '#F8FAFC' : '#64748B' }}>Practice recording</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>
                {practiced ? `${practiceCount} demo match${practiceCount !== 1 ? 'es' : ''} completed` : 'Try a demo match with no pressure'}
              </div>
            </div>
          </div>
          {practiced && <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>Done</div>}
        </div>
        {allRead && (
          <button onClick={handleStartDemo} style={{ ...S.btn(practiced ? '#334155' : '#F59E0B'), marginTop: 10, background: practiced ? '#334155' : '#F59E0B', color: practiced ? '#94A3B8' : '#0B0F1A' }}>
            {practiced ? 'Practice again' : 'Start demo match'}
          </button>
        )}
      </div>

      {/* Step 3: Benchmark test */}
      <div style={{
        ...S.card,
        borderLeft: canTest ? '3px solid #F59E0B' : '3px solid #334155',
        opacity: canTest ? 1 : 0.5,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              background: canTest ? '#F59E0B' : '#334155',
              color: canTest ? '#0B0F1A' : '#64748B',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>3</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: canTest ? '#F8FAFC' : '#64748B' }}>Benchmark test</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Score a real match, 80% to pass</div>
            </div>
          </div>
          {!canTest && <div style={{ fontSize: 9, color: '#475569' }}>
            {!allRead ? 'Read topics first' : 'Practice first'}
          </div>}
        </div>
        {canTest && (
          <button onClick={() => setView('benchmark_intro')} style={{ ...S.btn('#F59E0B'), marginTop: 10 }}>
            {benchmarkLoading ? 'Loading...' : 'Start benchmark test →'}
          </button>
        )}
      </div>

      {/* What you'll unlock */}
      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>After qualifying you can:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {[
          'Record live matches (earn 50 credits)',
          'Record video reviews (earn 20-30 credits)',
          'Schedule and claim matches',
          'Earn vouchers (100 credits = R100)',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94A3B8' }}>
            <span style={{ color: '#10B981' }}>●</span> {item}
          </div>
        ))}
      </div>

      {/* Home link */}
      <button onClick={() => { window.location.hash = ''; }} style={{
        width: '100%', padding: 10, borderRadius: 10, border: '1px solid #334155',
        background: 'none', color: '#64748B', fontSize: 11, cursor: 'pointer', marginBottom: 8,
      }}>
        Browse matches as supporter
      </button>

      <div style={{ fontSize: 9, color: '#334155', textAlign: 'center' }}>v{APP_VERSION}</div>
    </div>
  );
}

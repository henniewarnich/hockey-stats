import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { S, theme } from '../utils/styles.js';
import KykieSpinner from '../components/KykieSpinner.jsx';

export default function PredictionLeaderboard({ currentUser, onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    (async () => {
      // Fetch all scored predictions
      const { data: allPreds } = await supabase.from('predictions')
        .select('user_id, prediction, correct, points, match_id')
        .not('scored_at', 'is', null);

      if (!allPreds) { setLoading(false); return; }

      // Aggregate by user
      const byUser = {};
      allPreds.forEach(p => {
        const uid = p.user_id || '__kykie__';
        if (!byUser[uid]) byUser[uid] = { user_id: p.user_id, points: 0, correct: 0, total: 0, homeCorrect: 0, homePred: 0, drawCorrect: 0, drawPred: 0, awayCorrect: 0, awayPred: 0 };
        byUser[uid].total++;
        byUser[uid].points += p.points || 0;
        if (p.correct) byUser[uid].correct++;
        if (p.prediction === 'home') { byUser[uid].homePred++; if (p.correct) byUser[uid].homeCorrect++; }
        if (p.prediction === 'draw') { byUser[uid].drawPred++; if (p.correct) byUser[uid].drawCorrect++; }
        if (p.prediction === 'away') { byUser[uid].awayPred++; if (p.correct) byUser[uid].awayCorrect++; }
      });

      // Fetch user names
      const userIds = Object.keys(byUser).filter(k => k !== '__kykie__');
      let nameMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles')
          .select('id, username, firstname, lastname, alias_nickname')
          .in('id', userIds);
        if (profiles) profiles.forEach(p => {
          nameMap[p.id] = p.alias_nickname || p.username || `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'User';
        });
      }

      const lb = Object.values(byUser).map(u => ({
        ...u,
        name: u.user_id ? (nameMap[u.user_id] || 'User') : '🤖 Kykie',
        isKykie: !u.user_id,
        accuracy: u.total > 0 ? Math.round(u.correct / u.total * 100) : 0,
      })).sort((a, b) => b.points - a.points || b.accuracy - a.accuracy);

      setLeaderboard(lb);

      // My stats
      if (currentUser) {
        const me = lb.find(l => l.user_id === currentUser.id);
        if (me) setMyStats({ ...me, rank: lb.indexOf(me) + 1 });
      }

      setLoading(false);
    })();
  }, [currentUser]);

  const ordinal = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

  return (
    <div style={S.app}>
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, cursor: "pointer", fontWeight: 700, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B" }}>🏆 Prediction Leaderboard</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={S.page}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><KykieSpinner /></div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>No predictions scored yet. Run Retrofit in System Health.</div>
        ) : (
          <>
            {/* My stats card */}
            {myStats && (
              <div style={{ background: "linear-gradient(135deg,#1E293B,#0F172A)", borderRadius: 10, padding: "12px", marginBottom: 10, border: "1px solid #3B82F633" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3B82F622", border: "2px solid #3B82F644", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#3B82F6" }}>
                    {ordinal(myStats.rank)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#F8FAFC" }}>Your Predictions</div>
                    <div style={{ fontSize: 9, color: "#475569" }}>{myStats.total} predictions scored</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, textAlign: "center" }}>
                  {[
                    { label: "Points", val: myStats.points, color: "#F59E0B" },
                    { label: "Correct", val: myStats.correct, color: "#10B981" },
                    { label: "Accuracy", val: `${myStats.accuracy}%`, color: "#3B82F6" },
                    { label: "Home", val: `${myStats.homeCorrect}/${myStats.homePred}`, color: "#F8FAFC" },
                    { label: "Draw", val: `${myStats.drawCorrect}/${myStats.drawPred}`, color: "#F59E0B" },
                    { label: "Away", val: `${myStats.awayCorrect}/${myStats.awayPred}`, color: "#F8FAFC" },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: "#0B0F1A", borderRadius: 6, padding: "6px 2px" }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 7, color: "#475569" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const kykieEntry = leaderboard.find(l => l.isKykie);
                  if (!kykieEntry) return null;
                  const diff = myStats.accuracy - kykieEntry.accuracy;
                  return (
                    <div style={{ marginTop: 6, fontSize: 9, color: "#475569", textAlign: "center" }}>
                      vs 🤖 Kykie: {diff > 0 ? <span style={{ color: "#10B981", fontWeight: 700 }}>you're ahead by {diff}%</span> : diff < 0 ? <span style={{ color: "#EF4444", fontWeight: 700 }}>Kykie leads by {Math.abs(diff)}%</span> : <span style={{ color: "#F59E0B", fontWeight: 700 }}>tied!</span>}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Leaderboard table */}
            <div style={{ background: "#1E293B", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" }}>
              {/* Header */}
              <div style={{ display: "flex", padding: "8px 12px", fontSize: 8, color: "#475569", fontWeight: 700, borderBottom: "1px solid #33415544", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div style={{ width: 30 }}>#</div>
                <div style={{ flex: 1 }}>Predictor</div>
                <div style={{ width: 45, textAlign: "right" }}>Pts</div>
                <div style={{ width: 45, textAlign: "right" }}>Acc</div>
                <div style={{ width: 35, textAlign: "right" }}>Pred</div>
              </div>

              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                const isMe = currentUser && entry.user_id === currentUser.id;
                const isKykie = entry.isKykie;
                const bg = isMe ? '#3B82F608' : isKykie ? '#F59E0B08' : 'transparent';
                const borderLeft = isMe ? '2px solid #3B82F6' : isKykie ? '2px solid #F59E0B' : '2px solid transparent';
                const rankColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : rank === 3 ? '#CD7F32' : '#475569';
                return (
                  <div key={entry.user_id || 'kykie'} style={{
                    display: "flex", alignItems: "center", padding: "8px 12px",
                    borderBottom: i < leaderboard.length - 1 ? "1px solid #33415522" : "none",
                    background: bg, borderLeft,
                  }}>
                    <div style={{ width: 30, fontSize: 13, fontWeight: 900, color: rankColor }}>{rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isMe ? '#3B82F6' : isKykie ? '#F59E0B' : '#F8FAFC', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {isMe ? `${entry.name} (you)` : entry.name}
                      </div>
                      <div style={{ fontSize: 8, color: isKykie ? '#F59E0B88' : '#475569' }}>
                        {isKykie ? 'AI model' : `${entry.correct} correct`}
                      </div>
                    </div>
                    <div style={{ width: 45, textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: isMe ? '#3B82F6' : isKykie ? '#F59E0B' : '#F8FAFC' }}>{entry.points}</div>
                    </div>
                    <div style={{ width: 45, textAlign: "right" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: entry.accuracy >= 60 ? '#10B981' : entry.accuracy >= 50 ? '#F59E0B' : '#EF4444' }}>{entry.accuracy}%</div>
                    </div>
                    <div style={{ width: 35, textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#475569" }}>{entry.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scoring rules */}
            <div style={{ background: "#1E293B", borderRadius: 10, padding: "10px 12px", marginTop: 8, border: "1px solid #334155" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Scoring</div>
              <div style={{ fontSize: 9, color: "#64748B", lineHeight: 1.8 }}>
                <div><span style={{ color: "#10B981", fontWeight: 700 }}>+1 pt</span> — Correct outcome (home win / draw / away win)</div>
                <div><span style={{ color: "#94A3B8", fontWeight: 700 }}>0 pts</span> — Wrong outcome</div>
                <div style={{ marginTop: 4, color: "#475569" }}>Predictions lock when match goes live. 🤖 Kykie auto-predicts all matches where both teams have 5+ games.</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { predictMatch } from '../utils/predict.js';
import { fetchLatestRankings } from '../utils/sync.js';
import RankBadge from './RankBadge.jsx';
import { TEAM_SELECT, teamColor, teamDisplayName, teamInitial, teamMatchesSearch, teamShortName } from '../utils/teams.js';

function TeamPicker({ label, value, search, onSearch, onSelect, exclude, teams, records, rankings }) {
  const filtered = teams.filter(t => t.id !== exclude && teamMatchesSearch(t, search));
  const selected = teams.find(t => t.id === value);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {selected ? (
        <div onClick={() => { onSelect(''); onSearch(''); }} style={{
          background: "#0B0F1A", border: `1px solid ${teamColor(selected) || '#334155'}44`, borderRadius: 8,
          padding: "8px 10px", cursor: "pointer", textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: teamColor(selected) || "#F8FAFC" }}>{teamDisplayName(selected)}</div>
          {records[selected.id] && <div style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>
            {records[selected.id].p}P {records[selected.id].w}W {records[selected.id].d}D {records[selected.id].l}L
            {rankings[selected.id] && <> · <RankBadge rank={rankings[selected.id].rank} /></>}
          </div>}
        </div>
      ) : (
        <div>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search team..."
            style={{ width: "100%", boxSizing: "border-box", background: "#0B0F1A", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px", color: "#F8FAFC", fontSize: 11, outline: "none" }} />
          {search && (
            <div style={{ maxHeight: 150, overflowY: "auto", background: "#0F172A", borderRadius: "0 0 8px 8px", border: "1px solid #334155", borderTop: "none" }}>
              {filtered.slice(0, 8).map(t => (
                <div key={t.id} onClick={() => { onSelect(t.id); onSearch(''); }}
                  style={{ padding: "6px 10px", fontSize: 11, color: "#F8FAFC", cursor: "pointer", borderBottom: "1px solid #1E293B" }}>
                  <span style={{ color: t.color || "#F8FAFC", fontWeight: 700 }}>{teamDisplayName(t)}</span>
                  {records[t.id] && <span style={{ color: "#64748B", fontSize: 9, marginLeft: 6 }}>{records[t.id].p}P</span>}
                </div>
              ))}
              {filtered.length === 0 && <div style={{ padding: "6px 10px", fontSize: 10, color: "#475569" }}>No teams found</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoutCard({ team, rec, rank, color }) {
  if (!team || !rec) return null;
  const gd = rec.gf - rec.ga;
  return (
    <div style={{ flex: 1, padding: "8px 10px", background: "#0B0F1A", borderRadius: 8, border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: color + "22", border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color }}>{teamInitial(team)}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#F8FAFC" }}>{teamDisplayName(team)} {rank && <RankBadge rank={rank.rank} />}</div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", fontSize: 10 }}>
        {[
          ["P", rec.p, "#F8FAFC"], ["W", rec.w, "#10B981"], ["D", rec.d, "#F59E0B"], ["L", rec.l, "#EF4444"],
          ["GF", rec.gf, "#F8FAFC"], ["GA", rec.ga, "#F8FAFC"], ["GD", gd, gd > 0 ? "#10B981" : gd < 0 ? "#EF4444" : "#F8FAFC"],
        ].map(([lbl, val, c]) => (
          <div key={lbl} style={{ textAlign: "center", minWidth: 22 }}>
            <div style={{ fontWeight: 900, color: c }}>{gd > 0 && lbl === "GD" ? "+" : ""}{val}</div>
            <div style={{ fontSize: 7, color: "#64748B" }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import AdminBackBar from './AdminBackBar.jsx';

export default function WhatIfScreen({ onBack }) {
  const [teams, setTeams] = useState([]);
  const [records, setRecords] = useState({});
  const [rankings, setRankings] = useState({});
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [homeSearch, setHomeSearch] = useState('');
  const [awaySearch, setAwaySearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: allTeams }, { data: allMatches }] = await Promise.all([
        supabase.from('teams').select(TEAM_SELECT).or('status.eq.active,status.is.null').order('name'),
        supabase.from('matches').select('home_team_id, away_team_id, home_score, away_score, match_type').eq('status', 'ended'),
      ]);
      setTeams(allTeams || []);

      // Compute records
      const recs = {};
      (allMatches || []).forEach(m => {
        if (m.match_type === 'friendly') return;
        for (const side of ['home', 'away']) {
          const tid = side === 'home' ? m.home_team_id : m.away_team_id;
          const my = side === 'home' ? m.home_score : m.away_score;
          const their = side === 'home' ? m.away_score : m.home_score;
          if (!recs[tid]) recs[tid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
          recs[tid].p++;
          recs[tid].gf += my || 0;
          recs[tid].ga += their || 0;
          if (my > their) recs[tid].w++;
          else if (my === their) recs[tid].d++;
          else recs[tid].l++;
        }
      });
      setRecords(recs);

      fetchLatestRankings().then(r => setRankings(r)).catch(() => {});
      setLoading(false);
    })();
  }, []);

  const doPredict = () => {
    const hRec = records[homeTeamId];
    const aRec = records[awayTeamId];
    const hTeam = teams.find(t => t.id === homeTeamId);
    const aTeam = teams.find(t => t.id === awayTeamId);
    if (!hRec || !aRec || !hTeam || !aTeam) { setPrediction(null); return; }
    const p = predictMatch(hRec, aRec, teamShortName(hTeam), teamShortName(aTeam), { homeRank: rankings[homeTeamId]?.rank, awayRank: rankings[awayTeamId]?.rank });
    setPrediction(p);
  };

  const reset = () => {
    setHomeTeamId('');
    setAwayTeamId('');
    setPrediction(null);
    setHomeSearch('');
    setAwaySearch('');
  };

  const hTeam = teams.find(t => t.id === homeTeamId);
  const aTeam = teams.find(t => t.id === awayTeamId);
  const hRec = records[homeTeamId];
  const aRec = records[awayTeamId];
  const hRank = rankings[homeTeamId];
  const aRank = rankings[awayTeamId];

  return (
    <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC" }}>
      <AdminBackBar title="🔮 What-If Match" onBack={onBack} />

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 12 }}>Loading teams...</div>
      ) : (
        <div style={{ padding: "0 16px 20px" }}>
          {/* Team Picker */}
          <div style={{ background: "#1E293B", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <TeamPicker label="HOME TEAM" value={homeTeamId} search={homeSearch} onSearch={setHomeSearch} onSelect={setHomeTeamId} exclude={awayTeamId} teams={teams} records={records} rankings={rankings} />
              <div style={{ alignSelf: "center", fontSize: 12, color: "#475569", fontWeight: 700, marginTop: 16 }}>vs</div>
              <TeamPicker label="AWAY TEAM" value={awayTeamId} search={awaySearch} onSearch={setAwaySearch} onSelect={setAwayTeamId} exclude={homeTeamId} teams={teams} records={records} rankings={rankings} />
            </div>
            <button disabled={!homeTeamId || !awayTeamId} onClick={doPredict} style={{
              width: "100%", padding: 12, borderRadius: 8, border: "none",
              background: homeTeamId && awayTeamId ? "#8B5CF6" : "#33415588",
              color: homeTeamId && awayTeamId ? "#fff" : "#64748B",
              fontSize: 13, fontWeight: 700, cursor: homeTeamId && awayTeamId ? "pointer" : "default",
            }}>
              🔮 Predict Match
            </button>
          </div>

          {/* Prediction Result */}
          {prediction && (
            <>
              <div style={{ background: "linear-gradient(135deg,#1E293B,#0F172A)", borderRadius: 10, padding: 12, border: "1px solid #8B5CF633", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>🔮</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 1 }}>What-If Prediction</span>
                </div>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  {(() => {
                    const isDraw = prediction.draw >= prediction.homeWin && prediction.draw >= prediction.awayWin;
                    const homeWins = prediction.homeWin >= prediction.awayWin && prediction.homeWin > prediction.draw;
                    const winner = homeWins ? teamShortName(hTeam) : teamShortName(aTeam);
                    return (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 900, color: isDraw ? "#F59E0B" : "#F8FAFC" }}>
                          {isDraw ? "Draw" : `${winner} to win`}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                          Based on {hRec?.p || 0} and {aRec?.p || 0} matches played
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${prediction.homeWin}%`, background: "#10B981" }} />
                  <div style={{ width: `${prediction.draw}%`, background: "#F59E0B" }} />
                  <div style={{ width: `${prediction.awayWin}%`, background: "#64748B" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 700 }}>
                  <span style={{ color: "#10B981" }}>{teamShortName(hTeam)} {prediction.homeWin}%</span>
                  <span style={{ color: "#F59E0B" }}>Draw {prediction.draw}%</span>
                  <span style={{ color: "#64748B" }}>{teamShortName(aTeam)} {prediction.awayWin}%</span>
                </div>
                {prediction.reasons?.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #33415544" }}>
                    {prediction.reasons.map((r, i) => (
                      <div key={i} style={{ fontSize: 9, color: r.type === 'home' ? '#10B981' : r.type === 'away' ? '#64748B' : '#F59E0B', lineHeight: 1.6 }}>
                        {r.type === 'neutral' ? '~' : '+'} {r.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scouting cards */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <ScoutCard team={hTeam} rec={hRec} rank={hRank} color={teamColor(hTeam) || "#10B981"} />
                <ScoutCard team={aTeam} rec={aRec} rank={aRank} color="#94A3B8" />
              </div>

              <button onClick={reset} style={{
                width: "100%", padding: 10, borderRadius: 8, border: "1px solid #334155",
                background: "transparent", color: "#64748B", fontSize: 11, cursor: "pointer",
              }}>Try another matchup</button>
            </>
          )}

          {/* No prediction possible */}
          {prediction === null && homeTeamId && awayTeamId && hRec && aRec && (hRec.p < 5 || aRec.p < 5) && (
            <div style={{ background: "#1E293B", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>Not enough data</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Both teams need at least 5 matches for a prediction.
                {hRec.p < 5 && ` ${teamShortName(hTeam)} has ${hRec.p}.`}
                {aRec.p < 5 && ` ${teamShortName(aTeam)} has ${aRec.p}.`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

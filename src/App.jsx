import { useState, useEffect } from 'react';
import { useMatchStore } from './hooks/useMatchStore.js';
import { S, theme } from './utils/styles.js';
import { saveData, loadData } from './utils/helpers.js';
import { saveMatchToSupabase } from './utils/sync.js';
import { APP_VERSION } from './utils/constants.js';
import HomeScreen from './screens/HomeScreen.jsx';
import TeamsScreen from './screens/TeamsScreen.jsx';
import MatchSetupScreen from './screens/MatchSetupScreen.jsx';
import LiveMatchScreen from './screens/LiveMatchScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import GameReviewScreen from './screens/GameReviewScreen.jsx';
import PublicLiveScreen from './screens/PublicLiveScreen.jsx';
import CoachLiveScreen from './screens/CoachLiveScreen.jsx';
import TeamPage from './screens/TeamPage.jsx';
import CommentatorPage from './screens/CommentatorPage.jsx';
import MatchEditScreen from './screens/MatchEditScreen.jsx';

const ADMIN_PIN_KEY = 'hockey-admin-pin';
const ADMIN_PIN_VERIFIED_KEY = 'hockey-admin-verified';

function getHashRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash.startsWith('team/')) return { type: 'team', slug: hash.replace('team/', '') };
  if (hash.startsWith('record/')) return { type: 'record', slug: hash.replace('record/', '') };
  return { type: 'app' };
}

// Admin PIN gate component
function AdminGate({ children }) {
  const [verified, setVerified] = useState(() => {
    // Check session — remains unlocked until browser tab closes
    return sessionStorage.getItem(ADMIN_PIN_VERIFIED_KEY) === 'true';
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  const storedPin = localStorage.getItem(ADMIN_PIN_KEY);

  const handleSubmit = () => {
    if (!storedPin) {
      // First time — set the PIN
      if (pin.length >= 4) {
        localStorage.setItem(ADMIN_PIN_KEY, pin);
        sessionStorage.setItem(ADMIN_PIN_VERIFIED_KEY, 'true');
        setVerified(true);
      }
    } else if (pin === storedPin) {
      sessionStorage.setItem(ADMIN_PIN_VERIFIED_KEY, 'true');
      setVerified(true);
    } else {
      setError(true);
    }
  };

  if (verified) return children;

  return (
    <div style={{
      fontFamily: "'DM Sans','Outfit',sans-serif", maxWidth: 430, margin: "0 auto",
      background: "#0F172A", minHeight: "100vh", color: "#F8FAFC",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏑</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Hockey Stats</div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 24 }}>
        {!storedPin ? "Set an Admin PIN to protect this app" : "Enter Admin PIN"}
      </div>

      <input
        value={pin}
        onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(false); }}
        type="password"
        placeholder={!storedPin ? "Choose a PIN (4-6 digits)" : "PIN"}
        style={{
          width: 220, padding: 14, borderRadius: 10,
          border: error ? "2px solid #EF4444" : "1px solid #334155",
          background: "#1E293B", color: "#F8FAFC", fontSize: 20, textAlign: "center",
          letterSpacing: "0.3em", outline: "none",
        }}
        autoFocus
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
      />
      {error && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 8 }}>Incorrect PIN</div>}
      {!storedPin && <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, textAlign: "center" }}>This PIN protects the recorder and admin features. You'll need it each time you open the app.</div>}

      <button onClick={handleSubmit} style={{
        marginTop: 16, padding: "12px 40px", borderRadius: 10, border: "none",
        background: "#F59E0B", color: "#0F172A", fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        {!storedPin ? "Set PIN & Enter" : "Unlock"}
      </button>

      <div style={{ marginTop: 24, fontSize: 9, color: "#475569" }}>v{APP_VERSION}</div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [screen, setScreen] = useState("home");
  const [matchConfig, setMatchConfig] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const store = useMatchStore();

  useEffect(() => {
    const handler = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Team pages are PUBLIC — no PIN needed
  if (route.type === 'team') {
    return <TeamPage teamSlug={route.slug} onBack={() => { window.location.hash = ''; setRoute({ type: 'app' }); }} />;
  }

  // Commentator recorder — needs commentator PIN
  if (route.type === 'record') {
    return <CommentatorPage teamSlug={route.slug} onBack={() => { window.location.hash = ''; setRoute({ type: 'app' }); }} />;
  }

  // Everything else requires Admin PIN
  return (
    <AdminGate>
      <AppContent store={store} screen={screen} setScreen={setScreen}
        matchConfig={matchConfig} setMatchConfig={setMatchConfig}
        reviewGame={reviewGame} setReviewGame={setReviewGame} />
    </AdminGate>
  );
}

function AppContent({ store, screen, setScreen, matchConfig, setMatchConfig, reviewGame, setReviewGame }) {
  const navigate = (target, data) => {
    if (["game_review", "public_view", "coach_view", "match_edit"].includes(target) && data) {
      setReviewGame(data);
    }
    setScreen(target);
  };

  const handleStartMatch = (config) => { setMatchConfig(config); setScreen("live"); };
  const handleSaveGame = (game) => { store.saveGame(game); return game; };
  const handleImportGame = (game) => { const saved = store.saveGame(game); setReviewGame(saved || game); setScreen("game_review"); };
  const handleDeleteGame = (id) => { store.deleteGame(id); setScreen("history"); };

  const handleUpdateGame = async (updatedGame) => {
    // Update locally
    const GAMES_KEY = 'hockey-games';
    const games = loadData(GAMES_KEY, []);
    const updated = games.map(g => g.id === updatedGame.id ? updatedGame : g);
    saveData(GAMES_KEY, updated);
    // Re-sync to Supabase, then reload
    try { await saveMatchToSupabase(updatedGame); } catch {}
    window.location.reload();
  };

  const handleSelectGame = (game) => { setReviewGame(game); setScreen("game_review"); };

  const getTeamShareLink = (teamName) => {
    const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    return `${window.location.origin}${window.location.pathname}#/team/${slug}`;
  };

  switch (screen) {
    case "home":
      return <HomeScreen teamCount={store.teams.length} gameCount={store.games.length} onNavigate={navigate} syncing={store.syncing} lastSyncError={store.lastSyncError} />;

    case "teams":
      return <TeamsScreen teams={store.teams} onSave={store.saveTeam} onDelete={store.deleteTeam} onBack={() => navigate("home")} getShareLink={getTeamShareLink} />;

    case "match_setup":
      return <MatchSetupScreen teams={store.teams} onStart={handleStartMatch} onImportGame={handleImportGame} onBack={() => navigate("home")} onManageTeams={() => navigate("teams")} />;

    case "live":
      if (!matchConfig) { navigate("home"); return null; }
      return <LiveMatchScreen matchConfig={matchConfig} onSaveGame={handleSaveGame} onNavigate={navigate} />;

    case "history":
      return <HistoryScreen games={store.games} onSelect={handleSelectGame} onBack={() => navigate("home")} onSyncAll={store.syncAllGames} syncing={store.syncing} />;

    case "game_review":
      if (!reviewGame) { navigate("history"); return null; }
      return <GameReviewScreen game={reviewGame} onDelete={handleDeleteGame} onBack={() => navigate("history")} onNavigate={navigate} />;

    case "public_view":
      if (!reviewGame) { navigate("history"); return null; }
      return <PublicLiveScreen match={{ ...reviewGame, status: "ended" }} events={reviewGame.events || []} matchTime={reviewGame.duration || 0} running={false} onBack={() => navigate("game_review", reviewGame)} />;

    case "coach_view":
      if (!reviewGame) { navigate("history"); return null; }
      return <CoachLiveScreen match={{ ...reviewGame, status: "ended" }} events={reviewGame.events || []} matchTime={reviewGame.duration || 0} running={false} onBack={() => navigate("game_review", reviewGame)} />;

    case "match_edit":
      if (!reviewGame) { navigate("history"); return null; }
      return <MatchEditScreen game={reviewGame} teams={store.teams} onSave={handleUpdateGame} onBack={() => navigate("game_review", reviewGame)} />;

    default:
      return <div style={S.app}><div style={S.empty}>Something went wrong. <button onClick={() => navigate("home")} style={S.btnSm("#F59E0B", "#0F172A")}>Go Home</button></div></div>;
  }
}

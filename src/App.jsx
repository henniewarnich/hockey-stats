import { useState, useEffect } from 'react';
import { useMatchStore } from './hooks/useMatchStore.js';
import { S, theme } from './utils/styles.js';
import { saveData, loadData } from './utils/helpers.js';
import { saveMatchToSupabase } from './utils/sync.js';
import { supabase } from './utils/supabase.js';
import { APP_VERSION } from './utils/constants.js';
import { getSession, getProfile, signOut } from './utils/auth.js';
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
import LandingPage from './screens/LandingPage.jsx';
import MatchEditScreen from './screens/MatchEditScreen.jsx';
import LoginPage from './screens/LoginPage.jsx';
import UserManagementScreen from './screens/UserManagementScreen.jsx';
import MatchScheduleScreen from './screens/MatchScheduleScreen.jsx';
import CommentatorDashboard from './screens/CommentatorDashboard.jsx';
import CoachDashboard from './screens/CoachDashboard.jsx';

function getHashRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash.startsWith('team/')) {
    const rest = hash.replace('team/', '');
    const [slug, query] = rest.split('?');
    const matchId = query?.match(/match=([^&]+)/)?.[1] || null;
    return { type: 'team', slug, matchId };
  }
  if (hash.startsWith('record/')) return { type: 'record', slug: hash.replace('record/', '') };
  if (hash === 'record') return { type: 'record', slug: '' };
  if (hash === 'login') return { type: 'login' };
  if (hash === 'coach') return { type: 'coach' };
  if (hash === 'admin' || hash.startsWith('admin')) return { type: 'admin' };
  return { type: 'landing' };
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [screen, setScreen] = useState("home");
  const [matchConfig, setMatchConfig] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const store = useMatchStore();

  // Listen for hash changes
  useEffect(() => {
    const handler = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        const profile = await getProfile();
        if (profile && !profile.blocked) {
          setCurrentUser(profile);
        }
      }
      setAuthLoading(false);
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (profile) => {
    setCurrentUser(profile);
    // Route based on role
    if (profile.role === 'admin' || profile.role === 'commentator_admin') {
      window.location.hash = '#/admin';
    } else if (profile.role === 'commentator') {
      window.location.hash = '#/record';
    } else if (profile.role === 'coach') {
      window.location.hash = '#/coach';
    } else {
      window.location.hash = '';
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setScreen("home");
    window.location.hash = '';
  };

  // ── PUBLIC ROUTES (no auth needed) ──

  if (route.type === 'team') {
    return <TeamPage teamSlug={route.slug} initialMatchId={route.matchId} onBack={() => { window.location.hash = ''; setRoute({ type: 'landing' }); }} />;
  }

  if (route.type === 'landing') {
    return <LandingPage />;
  }

  if (route.type === 'login') {
    if (currentUser) {
      // Already logged in — redirect immediately without rendering blank
      const target = currentUser.role === 'admin' || currentUser.role === 'commentator_admin' ? '#/admin'
        : currentUser.role === 'commentator' ? '#/record'
        : currentUser.role === 'coach' ? '#/coach' : '';
      if (window.location.hash !== target) window.location.hash = target;
      return <LoginPage onLogin={handleLogin} />;
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── AUTH-REQUIRED ROUTES ──

  if (authLoading) {
    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  // Commentator recorder
  if (route.type === 'record') {
    if (!currentUser || !['admin', 'commentator_admin', 'commentator'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    // If no slug — show the commentator dashboard
    if (!route.slug) {
      return <CommentatorDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
    // Team-specific — old commentator page (kept for backward compat)
    return <CommentatorPage teamSlug={route.slug} currentUser={currentUser} onBack={() => { window.location.hash = '#/record'; }} onLogout={handleLogout} />;
  }

  // Coach area
  if (route.type === 'coach') {
    if (!currentUser || currentUser.role !== 'coach') {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <CoachDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Admin area
  if (route.type === 'admin') {
    if (!currentUser || !['admin', 'commentator_admin'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return (
      <AppContent
        store={store} screen={screen} setScreen={setScreen}
        matchConfig={matchConfig} setMatchConfig={setMatchConfig}
        reviewGame={reviewGame} setReviewGame={setReviewGame}
        currentUser={currentUser} onLogout={handleLogout}
      />
    );
  }

  return <LandingPage />;
}

function AppContent({ store, screen, setScreen, matchConfig, setMatchConfig, reviewGame, setReviewGame, currentUser, onLogout }) {
  const navigate = (target, data) => {
    if (["game_review", "public_view", "coach_view", "match_edit"].includes(target) && data) {
      setReviewGame(data);
    }
    setScreen(target);
  };

  const handleStartMatch = (config) => { setMatchConfig(config); setScreen("live"); };
  const handleSaveGame = (game) => { store.saveGame(game); return game; };
  const handleImportGame = (game) => { const saved = store.saveGame(game); setReviewGame(saved || game); setScreen("game_review"); };
  const handleDeleteGame = async (id) => {
    // Delete from local storage
    store.deleteGame(id);
    // Delete from Supabase (events cascade via FK)
    try {
      await supabase.from('match_events').delete().eq('match_id', id);
      await supabase.from('match_commentators').delete().eq('match_id', id);
      await supabase.from('matches').delete().eq('id', id);
    } catch {}
    setScreen("history");
  };

  const handleUpdateGame = async (updatedGame) => {
    const GAMES_KEY = 'hockey-games';
    const games = loadData(GAMES_KEY, []);
    const updated = games.map(g => g.id === updatedGame.id ? updatedGame : g);
    saveData(GAMES_KEY, updated);
    try { await saveMatchToSupabase(updatedGame); } catch {}
    window.location.reload();
  };

  const handleSelectGame = async (game) => {
    // Cloud-only match — fetch events from Supabase
    if (game.cloudOnly && !game.events) {
      try {
        const { data: events } = await supabase
          .from('match_events')
          .select('*')
          .eq('match_id', game.id)
          .order('seq', { ascending: false });
        game = {
          ...game,
          events: (events || []).map(e => ({
            id: e.id,
            team: e.team,
            event: e.event,
            zone: e.zone || "",
            detail: e.detail || "",
            time: e.match_time || 0,
            seq: e.seq,
          })),
        };
      } catch {
        game = { ...game, events: [] };
      }
    }
    setReviewGame(game);
    setScreen("game_review");
  };

  const getTeamShareLink = (teamName) => {
    const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    return `${window.location.origin}${window.location.pathname}#/team/${slug}`;
  };

  switch (screen) {
    case "home":
      return <HomeScreen teamCount={store.teams.length} gameCount={store.games.length} onNavigate={navigate} syncing={store.syncing} lastSyncError={store.lastSyncError} currentUser={currentUser} onLogout={onLogout} />;

    case "users":
      return <UserManagementScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "match_schedule":
      return <MatchScheduleScreen onBack={() => navigate("home")} />;

    case "teams":
      return <TeamsScreen teams={store.teams} onSave={store.saveTeam} onDelete={store.deleteTeam} onBack={() => navigate("home")} getShareLink={getTeamShareLink} />;

    case "match_setup":
      return <MatchSetupScreen teams={store.teams} games={store.games} onStart={handleStartMatch} onImportGame={handleImportGame} onBack={() => navigate("home")} onManageTeams={() => navigate("teams")} />;

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

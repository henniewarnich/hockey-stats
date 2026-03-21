import { useState, useEffect } from 'react';
import { useMatchStore } from './hooks/useMatchStore.js';
import { S } from './utils/styles.js';
import { saveData, loadData } from './utils/helpers.js';
import HomeScreen from './screens/HomeScreen.jsx';
import TeamsScreen from './screens/TeamsScreen.jsx';
import MatchSetupScreen from './screens/MatchSetupScreen.jsx';
import LiveMatchScreen from './screens/LiveMatchScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import GameReviewScreen from './screens/GameReviewScreen.jsx';
import PublicLiveScreen from './screens/PublicLiveScreen.jsx';
import CoachLiveScreen from './screens/CoachLiveScreen.jsx';
import TeamPage from './screens/TeamPage.jsx';
import MatchEditScreen from './screens/MatchEditScreen.jsx';

function getHashRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash.startsWith('team/')) return { type: 'team', slug: hash.replace('team/', '') };
  return { type: 'app' };
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [screen, setScreen] = useState("home");
  const [matchConfig, setMatchConfig] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const store = useMatchStore();

  // Listen for hash changes (for team page URLs)
  useEffect(() => {
    const handler = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // If URL is a team page, render that instead of the app
  if (route.type === 'team') {
    return <TeamPage teamSlug={route.slug} onBack={() => { window.location.hash = ''; setRoute({ type: 'app' }); }} />;
  }

  const navigate = (target, data) => {
    if (["game_review", "public_view", "coach_view", "match_edit"].includes(target) && data) {
      setReviewGame(data);
    }
    setScreen(target);
  };

  const handleStartMatch = (config) => {
    setMatchConfig(config);
    setScreen("live");
  };

  const handleSaveGame = (game) => {
    store.saveGame(game);
    return game;
  };

  const handleImportGame = (game) => {
    const saved = store.saveGame(game);
    setReviewGame(saved || game);
    setScreen("game_review");
  };

  const handleDeleteGame = (id) => {
    store.deleteGame(id);
    setScreen("history");
  };

  const handleUpdateGame = (updatedGame) => {
    // Update in store
    const GAMES_KEY = 'hockey-games';
    const games = loadData(GAMES_KEY, []);
    const updated = games.map(g => g.id === updatedGame.id ? updatedGame : g);
    saveData(GAMES_KEY, updated);
    // Refresh store (force re-read)
    store.games.splice(0); // clear
    updated.forEach(g => store.games.push(g)); // refill
    setReviewGame(updatedGame);
    setScreen("game_review");
  };

  const handleSelectGame = (game) => {
    setReviewGame(game);
    setScreen("game_review");
  };

  // Generate team share link
  const getTeamShareLink = (teamName) => {
    const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    return `${window.location.origin}${window.location.pathname}#/team/${slug}`;
  };

  switch (screen) {
    case "home":
      return (
        <HomeScreen
          teamCount={store.teams.length}
          gameCount={store.games.length}
          onNavigate={navigate}
          syncing={store.syncing}
          lastSyncError={store.lastSyncError}
        />
      );

    case "teams":
      return (
        <TeamsScreen
          teams={store.teams}
          onSave={store.saveTeam}
          onDelete={store.deleteTeam}
          onBack={() => navigate("home")}
          getShareLink={getTeamShareLink}
        />
      );

    case "match_setup":
      return (
        <MatchSetupScreen
          teams={store.teams}
          onStart={handleStartMatch}
          onImportGame={handleImportGame}
          onBack={() => navigate("home")}
          onManageTeams={() => navigate("teams")}
        />
      );

    case "live":
      if (!matchConfig) { navigate("home"); return null; }
      return (
        <LiveMatchScreen
          matchConfig={matchConfig}
          onSaveGame={handleSaveGame}
          onNavigate={navigate}
        />
      );

    case "history":
      return (
        <HistoryScreen
          games={store.games}
          onSelect={handleSelectGame}
          onBack={() => navigate("home")}
        />
      );

    case "game_review":
      if (!reviewGame) { navigate("history"); return null; }
      return (
        <GameReviewScreen
          game={reviewGame}
          onDelete={handleDeleteGame}
          onBack={() => navigate("history")}
          onNavigate={navigate}
        />
      );

    case "public_view":
      if (!reviewGame) { navigate("history"); return null; }
      return (
        <PublicLiveScreen
          match={{ ...reviewGame, status: "ended" }}
          events={reviewGame.events || []}
          matchTime={reviewGame.duration || 0}
          running={false}
          onBack={() => navigate("game_review", reviewGame)}
        />
      );

    case "coach_view":
      if (!reviewGame) { navigate("history"); return null; }
      return (
        <CoachLiveScreen
          match={{ ...reviewGame, status: "ended" }}
          events={reviewGame.events || []}
          matchTime={reviewGame.duration || 0}
          running={false}
          onBack={() => navigate("game_review", reviewGame)}
        />
      );

    case "match_edit":
      if (!reviewGame) { navigate("history"); return null; }
      return (
        <MatchEditScreen
          game={reviewGame}
          teams={store.teams}
          onSave={handleUpdateGame}
          onBack={() => navigate("game_review", reviewGame)}
        />
      );

    default:
      return (
        <div style={S.app}>
          <div style={S.empty}>
            Something went wrong.{" "}
            <button onClick={() => navigate("home")} style={S.btnSm("#F59E0B", "#0F172A")}>Go Home</button>
          </div>
        </div>
      );
  }
}

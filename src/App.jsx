import { useState } from 'react';
import { useMatchStore } from './hooks/useMatchStore.js';
import { S } from './utils/styles.js';
import HomeScreen from './screens/HomeScreen.jsx';
import TeamsScreen from './screens/TeamsScreen.jsx';
import MatchSetupScreen from './screens/MatchSetupScreen.jsx';
import LiveMatchScreen from './screens/LiveMatchScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import GameReviewScreen from './screens/GameReviewScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState("home");
  const [matchConfig, setMatchConfig] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const store = useMatchStore();

  const navigate = (target, data) => {
    if (target === "game_review" && data) {
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

  const handleDeleteGame = (id) => {
    store.deleteGame(id);
    setScreen("history");
  };

  const handleSelectGame = (game) => {
    setReviewGame(game);
    setScreen("game_review");
  };

  // ── SCREENS ──
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
        />
      );

    case "match_setup":
      return (
        <MatchSetupScreen
          teams={store.teams}
          onStart={handleStartMatch}
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

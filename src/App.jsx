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
import ResetPasswordScreen from './screens/ResetPasswordScreen.jsx';
import RegisterPage from './screens/RegisterPage.jsx';
import CrowdSubmitScreen from './screens/CrowdSubmitScreen.jsx';
import PendingApprovalsScreen from './screens/PendingApprovalsScreen.jsx';
import SystemHealthScreen from './screens/SystemHealthScreen.jsx';
import LiveLiteScreen from './screens/LiveLiteScreen.jsx';
import RankingsScreen from './screens/RankingsScreen.jsx';

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
  if (hash === 'register') return { type: 'register' };
  if (hash === 'submit') return { type: 'submit' };
  if (hash.startsWith('submit?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    return { type: 'submit', mode: params.get('mode') };
  }
  if (hash === 'pending') return { type: 'pending' };
  if (hash === 'health') return { type: 'health' };
  if (hash === 'live-lite' || hash.startsWith('live-lite?')) {
    const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
    return { type: 'live-lite', matchId: params?.get('match') || null };
  }
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
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [liveLiteMatch, setLiveLiteMatch] = useState(null);
  const store = useMatchStore();

  // Listen for hash changes
  useEffect(() => {
    const handler = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    // Detect email confirmation redirect (Supabase puts tokens in hash)
    const hashParams = window.location.hash;
    const isEmailConfirmation = hashParams.includes('type=signup') || hashParams.includes('type=email');

    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        const profile = await getProfile();
        if (profile && !profile.blocked) {
          // Restore switched role from session if valid
          const savedRole = sessionStorage.getItem('kykie-active-role');
          if (savedRole && profile.roles?.includes(savedRole)) {
            profile.role = savedRole;
          }
          setCurrentUser(profile);

          if (isEmailConfirmation) {
            setEmailConfirmed(true);
            // Clean the hash to remove tokens
            window.location.hash = '';
            setTimeout(() => setEmailConfirmed(false), 5000);
          }
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
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
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
    sessionStorage.removeItem('kykie-active-role');
    window.location.hash = '';
  };

  const handleRoleSwitch = (newRole) => {
    if (!currentUser) return;
    sessionStorage.setItem('kykie-active-role', newRole);
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    // Navigate to the appropriate screen for the new role
    if (newRole === 'admin' || newRole === 'commentator_admin') {
      window.location.hash = '#/admin';
    } else if (newRole === 'commentator') {
      window.location.hash = '#/record';
    } else if (newRole === 'coach') {
      window.location.hash = '#/coach';
    } else {
      window.location.hash = '';
    }
  };

  // ── PASSWORD RECOVERY ──
  if (passwordRecovery) {
    return <ResetPasswordScreen onDone={() => {
      setPasswordRecovery(false);
      setCurrentUser(null);
      window.location.hash = '#/login';
    }} />;
  }

  // ── PUBLIC ROUTES (no auth needed) ──

  if (route.type === 'team') {
    return <TeamPage teamSlug={route.slug} initialMatchId={route.matchId} onBack={() => { window.location.hash = ''; setRoute({ type: 'landing' }); }} />;
  }

  if (route.type === 'landing') {
    return <LandingPage currentUser={currentUser} onLogout={handleLogout} emailConfirmed={emailConfirmed} />;
  }

  if (route.type === 'login') {
    if (currentUser) {
      // Already logged in — redirect to role's home (if known)
      const target = currentUser.role === 'admin' || currentUser.role === 'commentator_admin' ? '#/admin'
        : currentUser.role === 'commentator' ? '#/record'
        : currentUser.role === 'coach' ? '#/coach' : null;
      if (target && window.location.hash !== target) {
        window.location.hash = target;
        return <LoginPage onLogin={handleLogin} />;
      }
      // Unknown role — allow login page to show so user can re-auth
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  if (route.type === 'register') {
    return <RegisterPage />;
  }

  // ── AUTH-REQUIRED ROUTES ──

  if (authLoading) {
    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  // Live Lite: load match from route param
  useEffect(() => {
    if (route.type === 'live-lite' && route.matchId && !liveLiteMatch) {
      supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('id', route.matchId)
        .single()
        .then(({ data: m }) => {
          if (m) {
            setLiveLiteMatch({
              supabaseId: m.id,
              home: { name: m.home_team?.name || 'Home', color: m.home_team?.color || '#3B82F6', id: m.home_team?.id },
              away: { name: m.away_team?.name || 'Away', color: m.away_team?.color || '#EF4444', id: m.away_team?.id },
              matchLength: m.match_length || 60, breakFormat: m.break_format || 'quarters',
              matchType: m.match_type || 'league', venue: m.venue || '', date: m.match_date,
            });
          } else {
            window.location.hash = '';
          }
        });
    }
    if (route.type !== 'live-lite') setLiveLiteMatch(null);
  }, [route.type, route.matchId]);

  // Live Lite mode
  if (route.type === 'live-lite') {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    if (liveLiteMatch) {
      return <LiveLiteScreen
        match={liveLiteMatch}
        currentUser={currentUser}
        onEnd={() => { setLiveLiteMatch(null); window.location.hash = ''; }}
        onPromote={null}
      />;
    }
    if (route.matchId) {
      return <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading match...</div>;
    }
    // No match specified — redirect to submit
    window.location.hash = '#/submit?mode=upcoming';
    return null;
  }

  // Crowd submit area
  if (route.type === 'submit') {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <CrowdSubmitScreen currentUser={currentUser} onBack={() => { window.location.hash = ''; }} initialMode={route.mode || null} />;
  }

  // Pending approvals (admin/comm_admin)
  if (route.type === 'pending') {
    if (!currentUser || !['admin', 'commentator_admin'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <PendingApprovalsScreen currentUser={currentUser} onBack={() => { window.location.hash = '#/admin'; }} />;
  }

  // Commentator recorder
  if (route.type === 'record') {
    if (!currentUser || !['admin', 'commentator_admin', 'commentator'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    // If no slug — show the commentator dashboard
    if (!route.slug) {
      return <CommentatorDashboard currentUser={currentUser} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />;
    }
    // Team-specific — old commentator page (kept for backward compat)
    return <CommentatorPage teamSlug={route.slug} currentUser={currentUser} onBack={() => { window.location.hash = '#/record'; }} onLogout={handleLogout} />;
  }

  // Coach area
  if (route.type === 'coach') {
    if (!currentUser || currentUser.role !== 'coach') {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <CoachDashboard currentUser={currentUser} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />;
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
        currentUser={currentUser} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch}
      />
    );
  }

  return <LandingPage currentUser={currentUser} onLogout={handleLogout} emailConfirmed={emailConfirmed} />;
}

function AppContent({ store, screen, setScreen, matchConfig, setMatchConfig, reviewGame, setReviewGame, currentUser, onLogout, onRoleSwitch }) {
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
    // Delete from Supabase via audited function
    try {
      await supabase.rpc('delete_match', { p_match_id: id, p_user_id: currentUser?.id });
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
      return <HomeScreen teamCount={store.teams.length} gameCount={store.games.length} onNavigate={navigate} syncing={store.syncing} lastSyncError={store.lastSyncError} currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch} />;

    case "users":
      return <UserManagementScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "rankings":
      return <RankingsScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "pending":
      return <PendingApprovalsScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "health":
      return <SystemHealthScreen onBack={() => navigate("home")} />;

    case "match_schedule":
      return <MatchScheduleScreen currentUser={currentUser} onBack={() => navigate("home")} />;

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

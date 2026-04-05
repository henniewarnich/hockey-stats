import { useState, useEffect } from 'react';
import { useMatchStore } from './hooks/useMatchStore.js';
import { S, theme } from './utils/styles.js';
import { saveData, loadData } from './utils/helpers.js';
import { saveMatchToSupabase, startVideoReview, clearMatchEvents } from './utils/sync.js';
import { supabase } from './utils/supabase.js';
import { APP_VERSION } from './utils/constants.js';
import { teamSlug } from './utils/teams.js';
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
import IssuesScreen from './screens/IssuesScreen.jsx';
import SystemHealthScreen from './screens/SystemHealthScreen.jsx';
import PredictionLeaderboard from './screens/PredictionLeaderboard.jsx';
import LiveLiteScreen from './screens/LiveLiteScreen.jsx';
import LiveModeChooser from './components/LiveModeChooser.jsx';
import RankingsScreen from './screens/RankingsScreen.jsx';
import SponsorManagementScreen from './screens/SponsorManagementScreen.jsx';
import WhatIfScreen from './components/WhatIfScreen.jsx';
import TrainingScreen from './screens/TrainingScreen.jsx';

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
  if (hash === 'issues') return { type: 'issues' };
  if (hash === 'health') return { type: 'health' };
  if (hash === 'training') return { type: 'training' };
  if (hash === 'coach') return { type: 'coach' };
  if (hash === 'admin' || hash.startsWith('admin')) return { type: 'admin' };
  return { type: 'landing' };
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [subScreen, setSubScreen] = useState(null);
  const [screen, setScreen] = useState("home");
  const [matchConfig, setMatchConfig] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintDoor, setMaintDoor] = useState({ taps: 0, show: false, email: '', password: '', error: '', loading: false });
  const store = useMatchStore();

  // Check maintenance mode on load
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single()
      .then(({ data }) => { if (data?.value === 'true') setMaintenanceMode(true); })
      .catch(() => {});
  }, []);

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
          sessionStorage.setItem('kykie-user-id', profile.id);

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
    sessionStorage.setItem('kykie-user-id', profile.id);
    if (['admin', 'commentator_admin', 'commentator'].includes(profile.role)) {
      // Trainee commentators go to training, qualified go to admin
      if (profile.role === 'commentator' && profile.commentator_status === 'trainee') {
        window.location.hash = '#/training';
      } else {
        window.location.hash = '#/admin';
      }
    } else {
      window.location.hash = '';
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setScreen("home");
    sessionStorage.removeItem('kykie-active-role');
    sessionStorage.removeItem('kykie-user-id');
    window.location.hash = '';
  };

  const handleRoleSwitch = (newRole) => {
    if (!currentUser) return;
    sessionStorage.setItem('kykie-active-role', newRole);
    const isAdmin = newRole === 'admin' || newRole === 'commentator_admin' || newRole === 'commentator';
    // Trainee commentators go to training
    if (newRole === 'commentator' && currentUser.commentator_status === 'trainee') {
      window.location.hash = '#/training';
    } else {
      window.location.hash = isAdmin ? '#/admin' : '';
    }
    window.location.reload();
  };

  // ── PASSWORD RECOVERY ──
  if (passwordRecovery) {
    return <ResetPasswordScreen onDone={() => {
      setPasswordRecovery(false);
      setCurrentUser(null);
      window.location.hash = '#/login';
    }} />;
  }

  // ── MAINTENANCE MODE ──
  // Admin/CommAdmin bypass maintenance to toggle it off
  if (maintenanceMode && !['admin', 'commentator_admin'].includes(currentUser?.role)) {
    const handleMaintTap = () => {
      const next = maintDoor.taps + 1;
      if (next >= 5) setMaintDoor(d => ({ ...d, taps: next, show: true }));
      else setMaintDoor(d => ({ ...d, taps: next }));
    };
    const handleMaintLogin = async () => {
      setMaintDoor(d => ({ ...d, error: '', loading: true }));
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: maintDoor.email, password: maintDoor.password });
        if (error) { setMaintDoor(d => ({ ...d, error: error.message, loading: false })); return; }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (!profile || !['admin', 'commentator_admin'].includes(profile.role)) {
          setMaintDoor(d => ({ ...d, error: 'Admin access required', loading: false }));
          await supabase.auth.signOut();
          return;
        }
        // Success — reload to bypass maintenance with active session
        window.location.reload();
      } catch (e) {
        setMaintDoor(d => ({ ...d, error: 'Login failed', loading: false }));
      }
    };
    return (
      <div style={{
        fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto",
        background: "#0B0F1A", minHeight: "100vh", color: "#F8FAFC",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 20px",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: 16 }}>
          <circle cx="28" cy="28" r="20" fill="none" stroke="#10B981" strokeWidth="2"/>
          <circle cx="28" cy="28" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
          <line x1="34" y1="22" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="12" x2="44" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="12" x2="44" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#F59E0B", marginBottom: 8 }}>kykie</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>We're upgrading!</div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24, lineHeight: 1.6 }}>
          kykie is being upgraded with new features.<br />
          We'll be back in a couple of minutes.
        </div>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#334155", overflow: "hidden" }}>
          <div style={{ width: "60%", height: "100%", background: "#F59E0B", borderRadius: 2, animation: "loading 1.5s ease-in-out infinite alternate" }} />
        </div>
        <div onClick={handleMaintTap} style={{ fontSize: 10, color: "#475569", marginTop: 16, cursor: "default", userSelect: "none" }}>v{APP_VERSION}</div>

        {/* Secret admin login — appears after 5 taps on version */}
        {maintDoor.show && (
          <div style={{ marginTop: 20, width: "100%", maxWidth: 260 }}>
            <input type="email" placeholder="Email" value={maintDoor.email}
              onChange={e => setMaintDoor(d => ({ ...d, email: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 12, marginBottom: 6, outline: "none" }}
            />
            <input type="password" placeholder="Password" value={maintDoor.password}
              onChange={e => setMaintDoor(d => ({ ...d, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleMaintLogin()}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: 12, marginBottom: 8, outline: "none" }}
            />
            {maintDoor.error && <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 6 }}>{maintDoor.error}</div>}
            <button onClick={handleMaintLogin} disabled={maintDoor.loading}
              style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: "#F59E0B", color: "#0B0F1A", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: maintDoor.loading ? 0.5 : 1 }}>
              {maintDoor.loading ? 'Signing in...' : 'Admin Sign In'}
            </button>
          </div>
        )}

        <style>{`@keyframes loading { from { width: 20%; margin-left: 0; } to { width: 60%; margin-left: 40%; } }`}</style>
      </div>
    );
  }

  // ── PUBLIC ROUTES (no auth needed) ──

  if (route.type === 'team') {
    return <TeamPage teamSlug={route.slug} initialMatchId={route.matchId} onBack={() => { window.location.hash = ''; setRoute({ type: 'landing' }); }} />;
  }

  if (route.type === 'login') {
    if (currentUser) {
      // Already logged in — redirect to landing (dashboard tab auto-selects)
      const target = ['admin', 'commentator_admin', 'commentator'].includes(currentUser.role) ? '#/admin' : '#/';
      if (window.location.hash !== target) {
        window.location.hash = target;
        return <LoginPage onLogin={handleLogin} />;
      }
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

  // Issues (any authenticated user)
  if (route.type === 'issues') {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <IssuesScreen currentUser={currentUser} onBack={() => { window.location.hash = ''; }} />;
  }

  // Commentator training (trainee commentators)
  if (route.type === 'training') {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return (
      <TrainingScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
        onQualified={() => {
          // Reload profile to pick up qualified status
          window.location.hash = '#/admin';
          window.location.reload();
        }}
      />
    );
  }

  // Commentator recorder
  if (route.type === 'record') {
    if (!currentUser || !['admin', 'commentator_admin', 'commentator', 'supporter'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    // Trainee commentators can't record real matches
    if (currentUser.role === 'commentator' && currentUser.commentator_status === 'trainee') {
      window.location.hash = '#/training';
      return null;
    }
    // Team-specific — old commentator page (kept for backward compat)
    if (route.slug) {
      return <CommentatorPage teamSlug={route.slug} currentUser={currentUser} onBack={() => { window.location.hash = '#/record'; }} onLogout={handleLogout} />;
    }
    // Match Schedule — same view as admin, with role-gated actions
    return <MatchScheduleScreen currentUser={currentUser} onBack={() => { window.location.hash = ''; }} />;
  }

  // Coach area — standalone coach dashboard for team detail views
  if (route.type === 'coach') {
    if (!currentUser || !['admin', 'commentator_admin', 'coach'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <CoachDashboard currentUser={currentUser} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />;
  }

  // Admin area
  if (route.type === 'admin') {
    if (!currentUser || !['admin', 'commentator_admin', 'commentator'].includes(currentUser.role)) {
      return <LoginPage onLogin={handleLogin} />;
    }
    // Trainee commentators go to training instead
    if (currentUser.role === 'commentator' && currentUser.commentator_status === 'trainee') {
      window.location.hash = '#/training';
      return null;
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

  // Default landing — redirect admin to #/admin, pass onRoleSwitch for logged-in users
  const activeRole = sessionStorage.getItem('kykie-active-role') || currentUser?.role;
  if (currentUser && ['admin', 'commentator_admin', 'commentator'].includes(activeRole)) {
    // Trainee commentators go to training
    if (activeRole === 'commentator' && currentUser.commentator_status === 'trainee') {
      window.location.hash = '#/training';
    } else {
      window.location.hash = '#/admin';
    }
    return null;
  }

  // Non-admin sub-screens
  if (subScreen === 'predictions') {
    return <PredictionLeaderboard currentUser={currentUser} onBack={() => setSubScreen(null)} />;
  }
  if (subScreen === 'history') {
    return <HistoryScreen games={store.games} currentUser={currentUser} onSelect={() => {}} onBack={() => setSubScreen(null)} onSyncAll={store.syncAllGames} syncing={store.syncing} />;
  }

  const defaultNavigate = (target) => {
    setSubScreen(target);
  };
  return <LandingPage currentUser={currentUser} onLogout={handleLogout} emailConfirmed={emailConfirmed}
    onNavigate={currentUser ? defaultNavigate : null}
    onRoleSwitch={handleRoleSwitch} initialTab={currentUser ? "dashboard" : null} />;
}

function AppContent({ store, screen, setScreen, matchConfig, setMatchConfig, reviewGame, setReviewGame, currentUser, onLogout, onRoleSwitch }) {
  const navigate = (target, data) => {
    if (target === "home" && currentUser && !['admin', 'commentator_admin', 'commentator'].includes(currentUser.role)) {
      window.location.hash = '';
      return;
    }
    if (["game_review", "public_view", "coach_view", "match_edit"].includes(target) && data) {
      setReviewGame(data);
    }
    setScreen(target);
  };

  const handleStartMatch = (config) => {
    setMatchConfig(config);
    if (config.liveMode) {
      setScreen(config.liveMode === 'lite' ? 'live_lite' : 'live');
    } else {
      setScreen("choose_live_mode");
    }
  };
  const handleLiveModeChosen = (mode) => {
    if (mode === 'lite') setScreen("live_lite");
    else setScreen("live");
  };
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

  const handleVideoReview = async (game) => {
    const matchId = game.supabase_id || game.id;
    // Lock check
    const result = await startVideoReview(matchId, currentUser?.id);
    if (result.error) {
      alert(result.error);
      return;
    }
    // If existing events, confirm replacement
    if (result.existingEvents > 0) {
      const confirmed = window.confirm(
        `This match has ${result.existingEvents} existing events from a previous recording. Starting video review will replace them. Continue?`
      );
      if (!confirmed) return;
      await clearMatchEvents(matchId);
    }
    // Build config from game data
    const config = {
      home: game.teams?.home || {},
      away: game.teams?.away || {},
      matchLength: game.matchLength || 60,
      breakFormat: game.breakFormat || 'quarters',
      matchType: game.matchType || 'league',
      venue: game.venue || '',
      date: game.date,
      isDemo: false,
      isVideoReview: true,
      videoReviewMatchId: matchId,
      savedScore: { home: game.homeScore, away: game.awayScore },
    };
    setMatchConfig(config);
    setScreen("live");
  };

  const getTeamShareLink = (team) => {
    const slug = teamSlug(team);
    return `${window.location.origin}${window.location.pathname}#/team/${slug}`;
  };

  switch (screen) {
    case "home":
      return <LandingPage currentUser={currentUser} onLogout={onLogout} onNavigate={navigate} onRoleSwitch={onRoleSwitch} initialTab="dashboard" />;

    case "users":
      return <UserManagementScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "rankings":
      return <RankingsScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "pending":
      return <PendingApprovalsScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "health":
      return <SystemHealthScreen onBack={() => navigate("home")} />;

    case "sponsors":
      return <SponsorManagementScreen onBack={() => navigate("home")} />;

    case "match_schedule":
      return <MatchScheduleScreen currentUser={currentUser} onBack={() => navigate("home")} />;

    case "teams":
      return <TeamsScreen currentUser={currentUser} onSave={store.saveTeam} onBack={() => navigate("home")} getShareLink={getTeamShareLink} />;

    case "match_setup":
      if (currentUser?.commentator_status === 'apprentice') { navigate("home"); return null; }
      return <MatchSetupScreen teams={store.teams} games={store.games} onStart={handleStartMatch} onImportGame={handleImportGame} onBack={() => navigate("home")} onManageTeams={() => navigate("teams")} />;

    case "what_if":
      return <WhatIfScreen onBack={() => navigate("home")} />;

    case "choose_live_mode":
      if (!matchConfig) { navigate("home"); return null; }
      return (
        <div style={{ fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LiveModeChooser show={true} onSelect={handleLiveModeChosen} onClose={() => navigate("match_setup")} />
        </div>
      );

    case "live":
      if (!matchConfig) { navigate("home"); return null; }
      return (
        <div style={{ fontFamily: "'Outfit','DM Sans',sans-serif", maxWidth: 430, margin: "0 auto", background: "#0B0F1A", minHeight: "100vh" }}>
          <div style={{ padding: "4px 10px", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <button onClick={() => setScreen("live_lite")} style={{ background: "none", border: "1px solid #10B98144", borderRadius: 6, color: "#10B981", fontSize: 9, cursor: "pointer", fontWeight: 700, padding: "3px 8px" }}>
              ↓ Switch to Live
            </button>
          </div>
          <LiveMatchScreen matchConfig={matchConfig} existingMatchId={matchConfig.supabaseId || null}
            onSaveGame={handleSaveGame} onNavigate={navigate}
            currentUser={currentUser}
            onMatchCreated={(id) => setMatchConfig(prev => ({ ...prev, supabaseId: id }))} />
        </div>
      );

    case "live_lite":
      if (!matchConfig) { navigate("home"); return null; }
      return <LiveLiteScreen
        match={{ ...matchConfig, supabaseId: matchConfig.supabaseId || null }}
        currentUser={currentUser}
        onEnd={() => { setMatchConfig(null); navigate("home"); }}
        onPromote={() => setScreen("live")}
      />;

    case "history":
      return <HistoryScreen games={store.games} currentUser={currentUser} onSelect={handleSelectGame} onBack={() => navigate("home")} onSyncAll={store.syncAllGames} syncing={store.syncing} onVideoReview={handleVideoReview} />;

    case "predictions":
      return <PredictionLeaderboard currentUser={currentUser} onBack={() => navigate("home")} />;

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

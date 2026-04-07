import { useState, useEffect } from 'react';
import { getCoachTeams } from '../utils/auth.js';
import { S } from '../utils/styles.js';
import KykieSpinner from '../components/KykieSpinner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { teamSlug } from '../utils/teams.js';

export default function CoachDashboard({ currentUser, onLogout, onRoleSwitch }) {
  const [loading, setLoading] = useState(true);
  const [noTeams, setNoTeams] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getCoachTeams(currentUser.id).then(teams => {
      if (teams.length === 0) {
        setNoTeams(true);
        setLoading(false);
        return;
      }
      // Store team count + all slugs for TeamPage dropdown
      sessionStorage.setItem('kykie-coach-team-count', String(teams.length));
      sessionStorage.setItem('kykie-coach-teams', JSON.stringify(teams.map(t => {
        const instName = t.institution?.name || t.institution?.short_name || '';
        const desc = t.name || '';
        const full = instName ? `${instName} ${desc}` : desc;
        return { id: t.id, slug: teamSlug(t), name: full, short_name: t.short_name, color: t.color };
      })));
      // Always redirect to first team
      window.location.hash = '#/team/' + teamSlug(teams[0]);
    });
  }, [currentUser]);

  if (noTeams) {
    return (
      <div style={S.app}>
        <PageHeader currentUser={currentUser} onLogout={onLogout} onRoleSwitch={onRoleSwitch}
          onBack={() => { window.location.hash = ''; }} />
        <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏑</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>No teams assigned yet</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Ask your admin to assign you to a team.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <KykieSpinner size={40} />
    </div>
  );
}

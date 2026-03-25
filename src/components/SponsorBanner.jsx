import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase.js';

// Get or create anonymous viewer ID (same pattern as match_viewers)
function getViewerId() {
  let id = sessionStorage.getItem('kykie-viewer-id');
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem('kykie-viewer-id', id);
  }
  return id;
}

// Get current user ID if logged in (cached from session)
function getUserId() {
  try {
    const raw = sessionStorage.getItem('kykie-user-id');
    return raw || null;
  } catch { return null; }
}

// Log impression (fire-and-forget, deduplicated per session)
const loggedImpressions = new Set();

function logImpression(sponsorId, placement, contextId) {
  const key = `${sponsorId}:${placement}:${contextId || ''}`;
  if (loggedImpressions.has(key)) return; // already logged this session
  loggedImpressions.add(key);

  supabase.from('sponsor_impressions').insert({
    sponsor_id: sponsorId,
    viewer_id: getViewerId(),
    user_id: getUserId(),
    placement,
    context_id: contextId || null,
  }).then(({ error }) => {
    if (error) console.error('Sponsor impression error:', error);
  });
}

// Log click
function logClick(sponsorId, placement, contextId, destinationUrl) {
  supabase.from('sponsor_clicks').insert({
    sponsor_id: sponsorId,
    viewer_id: getViewerId(),
    user_id: getUserId(),
    placement,
    context_id: contextId || null,
    destination_url: destinationUrl,
  }).then(({ error }) => {
    if (error) console.error('Sponsor click error:', error);
  });
}

// Fetch active sponsors, optionally filtered by tier and target
export function useSponsors(tier, targetId) {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const load = async () => {
      let query = supabase.from('sponsors').select('*').eq('active', true);

      if (tier) query = query.eq('tier', tier);
      if (targetId) query = query.eq('target_id', targetId);

      // Date filtering: active within current range
      const today = new Date().toISOString().slice(0, 10);
      query = query.or(`start_date.is.null,start_date.lte.${today}`);
      query = query.or(`end_date.is.null,end_date.gte.${today}`);

      const { data } = await query;
      setSponsors(data || []);
    };
    load();
  }, [tier, targetId]);

  return sponsors;
}

// Derive placement name from tier + context
function getPlacement(tier, targetId) {
  if (tier === 'platform') return 'landing';
  if (tier === 'team') return 'team_page';
  if (tier === 'match') return 'scoreboard';
  return 'unknown';
}

// Render a sponsor banner
// size: 'sm' (scoreboard/match), 'md' (team page), 'lg' (landing page)
export default function SponsorBanner({ tier, targetId, size = 'sm' }) {
  const sponsors = useSponsors(tier, targetId);
  const tracked = useRef(false);

  const sponsor = sponsors.length > 0 ? sponsors[0] : null;

  // Log impression once when sponsor first renders
  useEffect(() => {
    if (sponsor && !tracked.current) {
      tracked.current = true;
      logImpression(sponsor.id, getPlacement(tier, targetId), targetId);
    }
  }, [sponsor?.id]);

  if (!sponsor) return null;

  const isClickable = !!sponsor.website_url;
  const heights = { sm: 28, md: 36, lg: 44 };
  const fontSizes = { sm: 8, md: 9, lg: 10 };
  const h = heights[size] || 28;
  const fs = fontSizes[size] || 8;

  const handleClick = () => {
    if (!isClickable) return;
    logClick(sponsor.id, getPlacement(tier, targetId), targetId, sponsor.website_url);
    window.open(sponsor.website_url, '_blank', 'noopener,noreferrer');
  };

  const content = (
    <div
      onClick={isClickable ? handleClick : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 6,
        background: '#1E293B88',
        cursor: isClickable ? 'pointer' : 'default',
      }}
    >
      {sponsor.logo_url && (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          style={{ height: h, maxWidth: h * 3, objectFit: 'contain', borderRadius: 4 }}
        />
      )}
      {!sponsor.logo_url && (
        <div style={{ fontSize: fs, color: '#64748B', fontWeight: 600 }}>
          Sponsored by {sponsor.name}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '4px 0' }}>
      {content}
      <div style={{ fontSize: 7, color: '#334155', marginTop: 2 }}>Sponsored</div>
    </div>
  );
}

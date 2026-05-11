// Centralized helpers for building and sharing match links.
//
// Match URL format: https://kykie.net/#/match/{uuid}
// Resolved at runtime by App.jsx → MatchRedirect, which looks up the
// home team and forwards to #/team/{slug}?match={uuid} (which is what
// every match-rendering screen already understands).

export function buildMatchLink(matchId) {
  if (!matchId) return null;
  return `${window.location.origin}${window.location.pathname}#/match/${matchId}`;
}

// Tries navigator.share (mobile-native picker). Falls back to clipboard.
// Returns { ok: true, method: 'share'|'clipboard' } on success,
// { ok: false, error } on failure.
export async function shareMatchLink(matchId, { title = 'Kykie Match', text } = {}) {
  const url = buildMatchLink(matchId);
  if (!url) return { ok: false, error: 'No match to share' };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text: text || title, url });
      return { ok: true, method: 'share' };
    } catch (err) {
      if (err?.name === 'AbortError') return { ok: false, error: 'cancelled' };
      // Fall through to clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return { ok: true, method: 'clipboard' };
    } catch (err) {
      return { ok: false, error: err?.message || 'Clipboard unavailable' };
    }
  }

  return { ok: false, error: 'Sharing not supported on this device' };
}

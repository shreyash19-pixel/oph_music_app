/**
 * Domain Manager Utility
 * Tracks and manages domain redirects for auth routes
 * Uses cookies (set by nginx/JS) instead of localStorage
 */

/**
 * Clear the origin domain cookie
 */
export const clearOriginCookie = () => {
  if (typeof document === 'undefined') return;
  
  // Clear cookie with Secure flag (HTTPS)
  document.cookie = 'oph_origin_domain=; path=/; max-age=0; SameSite=Lax; Secure';
  // Clear cookie without Secure flag (fallback for HTTP)
  document.cookie = 'oph_origin_domain=; path=/; max-age=0; SameSite=Lax';
};

/**
 * Get the original domain from cookie (set by nginx/JS)
 */
export const getOriginDomain = () => {
  if (typeof document === 'undefined') return null;
  
  // Read from cookie
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('oph_origin_domain='));
  
  if (match) {
    return match.split('=')[1] || null;
  }
  
  return null;
};

/**
 * Full path for cross-domain redirect: pathname + query (hash omitted; app uses search params).
 * Pass `path` only if you intentionally override; otherwise omit so current location keeps ?artist= / ?id=.
 */
export const getOriginUrl = (path = null) => {
  const hostname = window.location.hostname;
  const originDomain = getOriginDomain();
  const originPath =
    path ?? `${window.location.pathname}${window.location.search}`;

  // If we're on .org and have an origin cookie, use it
  if (hostname.includes('ophcommunity.org') && originDomain) {
    const protocol = window.location.protocol;
    // Normalize domain (remove www. if present)
    const normalizedDomain = originDomain.replace(/^www\./, '');
    console.log('[DomainManager] Redirecting to origin:', { originDomain, normalizedDomain, path: originPath });
    return `${protocol}//${normalizedDomain}${originPath}`;
  }
  
  // If we're on .org with no origin cookie, default to .com
  if (hostname.includes('ophcommunity.org') && !originDomain) {
    const protocol = window.location.protocol;
    console.log('[DomainManager] No origin cookie, defaulting to .com:', { path: originPath });
    return `${protocol}//ophcommunity.com${originPath}`;
  }
  
  return null;
};

/** Paths nginx proxies on ophcommunity.org — must not client-redirect to .com (drops SPA / query). */
const ORG_SPA_STAY_PATHS = [
  "/auth",
  "/dashboard",
  "/assets",
  "/@",
  "/collaboration-artist-detail",
  "/public-artist-detail",
];

function staysOnOrgSpa(pathname) {
  const p = pathname || "";
  return ORG_SPA_STAY_PATHS.some((prefix) => p.startsWith(prefix));
}

/**
 * Check if we're on .org and should redirect to origin (or .com by default)
 */
export const shouldRedirectToOrigin = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (!hostname.includes("ophcommunity.org")) {
    return false;
  }

  if (staysOnOrgSpa(pathname)) {
    return false;
  }

  return true;
};


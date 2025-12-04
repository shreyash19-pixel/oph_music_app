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
 * Get the full origin URL
 * If on .org with no origin cookie, defaults to .com
 */
export const getOriginUrl = (path = null) => {
  const hostname = window.location.hostname;
  const originDomain = getOriginDomain();
  
  // If we're on .org and have an origin cookie, use it
  if (hostname.includes('ophcommunity.org') && originDomain) {
    const protocol = window.location.protocol;
    const originPath = path || window.location.pathname;
    // Normalize domain (remove www. if present)
    const normalizedDomain = originDomain.replace(/^www\./, '');
    console.log('[DomainManager] Redirecting to origin:', { originDomain, normalizedDomain, path: originPath });
    return `${protocol}//${normalizedDomain}${originPath}`;
  }
  
  // If we're on .org with no origin cookie, default to .com
  if (hostname.includes('ophcommunity.org') && !originDomain) {
    const protocol = window.location.protocol;
    const originPath = path || window.location.pathname;
    console.log('[DomainManager] No origin cookie, defaulting to .com:', { path: originPath });
    return `${protocol}//ophcommunity.com${originPath}`;
  }
  
  return null;
};

/**
 * Check if we're on .org and should redirect to origin (or .com by default)
 */
export const shouldRedirectToOrigin = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Only redirect if:
  // 1. We're on .org
  // 2. We're NOT on an auth route (auth routes should stay on .org)
  // 3. We're NOT on dashboard routes (dashboard can stay on .org)
  // 4. We're NOT on assets routes
  if (
    hostname.includes('ophcommunity.org') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/assets') &&
    !pathname.startsWith('/@')
  ) {
    return true;
  }
  
  return false;
};


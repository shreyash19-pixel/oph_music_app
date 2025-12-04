/**
 * Domain Manager Utility
 * Tracks and manages domain redirects for auth routes
 */

const ORIGIN_DOMAIN_KEY = 'oph_origin_domain';
const ORIGIN_PATH_KEY = 'oph_origin_path';

/**
 * Store the original domain when redirecting to .org for auth
 */
export const storeOriginDomain = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Only store if coming from .com or .in
  if (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in')) {
    localStorage.setItem(ORIGIN_DOMAIN_KEY, hostname);
    // Store the path they were on (but not if it's an auth route)
    if (!pathname.startsWith('/auth')) {
      localStorage.setItem(ORIGIN_PATH_KEY, pathname);
    }
  }
};

/**
 * Get the original domain (if stored)
 */
export const getOriginDomain = () => {
  return localStorage.getItem(ORIGIN_DOMAIN_KEY);
};

/**
 * Get the original path (if stored)
 */
export const getOriginPath = () => {
  return localStorage.getItem(ORIGIN_PATH_KEY) || '/home';
};

/**
 * Get the full origin URL
 */
export const getOriginUrl = (path = null) => {
  const originDomain = getOriginDomain();
  if (!originDomain) return null;
  
  const protocol = window.location.protocol;
  const originPath = path || getOriginPath();
  
  return `${protocol}//${originDomain}${originPath}`;
};

/**
 * Navigate to original domain (if stored)
 */
export const navigateToOrigin = (path = null) => {
  const originUrl = getOriginUrl(path);
  if (originUrl) {
    window.location.href = originUrl;
  } else {
    // Fallback to current domain
    const navigatePath = path || '/home';
    window.location.href = navigatePath;
  }
};

/**
 * Clear stored origin domain
 */
export const clearOriginDomain = () => {
  localStorage.removeItem(ORIGIN_DOMAIN_KEY);
  localStorage.removeItem(ORIGIN_PATH_KEY);
};

/**
 * Check if we're on .org and should redirect to origin
 */
export const shouldRedirectToOrigin = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const originDomain = getOriginDomain();
  
  console.log('Checking redirect:', { hostname, pathname, originDomain });
  
  // Only redirect if:
  // 1. We're on .org
  // 2. We have a stored origin domain
  // 3. We're NOT on an auth route (auth routes should stay on .org)
  // 4. We're NOT on dashboard routes (dashboard can stay on .org)
  if (
    hostname.includes('ophcommunity.org') &&
    originDomain &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/dashboard')
  ) {
    console.log('Should redirect to origin:', originDomain);
    return true;
  }
  
  return false;
};


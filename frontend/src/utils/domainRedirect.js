/**
 * Domain redirect utility
 * Redirects auth routes to .org domain if accessed from .com or .in
 */
export const checkDomainAndRedirect = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Check if path starts with /auth (any auth route)
  const isAuthRoute = pathname.startsWith('/auth');
  
  // If we're on .com or .in and trying to access auth routes, redirect to .org
  if (isAuthRoute && (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in'))) {
    const protocol = window.location.protocol;
    const newUrl = `${protocol}//ophcommunity.org${pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(newUrl);
    return true; // Indicates redirect is happening
  }
  
  return false; // No redirect needed
};


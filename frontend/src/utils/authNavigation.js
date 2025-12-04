/**
 * Utility to ensure auth routes always navigate to .org domain
 * @param {string} path - Auth route path (e.g., '/auth/login', '/auth/signup')
 * @returns {string} Full URL with .org domain
 */
export const getAuthUrl = (path) => {
  // Ensure path starts with /auth
  const authPath = path.startsWith('/auth') ? path : `/auth${path}`;
  
  // Always use .org domain for auth routes
  const protocol = window.location.protocol;
  const baseUrl = `${protocol}//ophcommunity.org`;
  
  return `${baseUrl}${authPath}`;
};

/**
 * Navigate to auth route on .org domain
 * @param {string} path - Auth route path
 * @param {Function} navigate - React Router navigate function (optional)
 */
export const navigateToAuth = (path, navigate = null) => {
  const authUrl = getAuthUrl(path);
  
  // If we're already on .org, use React Router navigation
  if (window.location.hostname.includes('ophcommunity.org')) {
    if (navigate) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  } else {
    // If on .com or .in, redirect to .org
    window.location.href = authUrl;
  }
};


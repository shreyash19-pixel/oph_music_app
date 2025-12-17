// socket.js
import { io } from "socket.io-client";

function readCookie(name) {
  try {
    const parts = document.cookie.split(";").map((p) => p.trim());
    const hit = parts.find((p) => p.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.split("=").slice(1).join("=")) : null;
  } catch {
    return null;
  }
}

function safeOriginFromUrl(urlLike) {
  if (!urlLike) return null;
  try {
    // If urlLike is already absolute, this preserves protocol/host/port but drops any path like "/api".
    // If it's relative, resolve against current location.
    return new URL(urlLike, window.location.href).origin;
  } catch {
    return null;
  }
}

export function getSocketBaseUrl() {
  // Prefer an explicit socket URL if provided.
  const envSocket = safeOriginFromUrl(import.meta.env.VITE_SOCKET_URL);
  if (envSocket) return envSocket;

  // Next, derive from API URL but normalize to origin (avoid "/api" causing "/api/socket.io" 404s).
  const envApi = safeOriginFromUrl(import.meta.env.VITE_API_URL);
  if (envApi) return envApi;

  // Special case: auth portal on .org sets `oph_origin_domain` cookie (e.g. ophcommunity.com/in).
  // If present, use that as the base to avoid hitting .org for socket routes that may redirect.
  const originDomain = readCookie("oph_origin_domain");
  if (originDomain) return `https://${originDomain}`;

  // Final fallback: same-origin.
  return window.location.origin;
}

export const socket = io(getSocketBaseUrl(), {
  path: "/socket.io",
  withCredentials: true,
  autoConnect: false,
});

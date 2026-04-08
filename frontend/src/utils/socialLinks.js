/** First non-empty string among `artist[key]` for each key. */
export function socialHref(artist, ...keys) {
  for (const k of keys) {
    const v = artist?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/**
 * API often stores host-only URLs without scheme; relative hrefs would stay on the app origin.
 * Returns an absolute URL for external social links.
 */
export function normalizeExternalHref(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://${s.replace(/^\/+/, "")}`;
}

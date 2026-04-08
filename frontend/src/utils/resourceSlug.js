/** Valid segments for /resources/:resourceType/:slug */
export const RESOURCE_TYPES = ["podcast", "reel", "story", "learning"];

export function slugifyTitle(str) {
  return String(str ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 96) || "item";
}

/**
 * Public detail URL: /resources/{type}/{slugified-title} (no numeric id in path)
 * Example: /resources/podcast/learn-guitar-basics
 */
export function buildResourcePath(resourceType, id, title) {
  const t = RESOURCE_TYPES.includes(String(resourceType))
    ? resourceType
    : "podcast";
  const base = slugifyTitle(title);
  if (!base || base === "item") {
    return "/resources/music-learning-education";
  }
  return `/resources/${t}/${base}`;
}

/** Legacy paths used /resources/.../{slug}-{id}; match title slug + numeric id. */
export const LEGACY_SLUG_WITH_TRAILING_ID = /^(.+)-(\d+)$/;

/**
 * @deprecated Prefer LEGACY_SLUG_WITH_TRAILING_ID + slugifyTitle check server-side
 */
export function parseIdFromResourceSlug(slug) {
  if (slug == null || String(slug).trim() === "") return null;
  const s = String(slug).trim();
  const m = s.match(LEGACY_SLUG_WITH_TRAILING_ID);
  if (!m) return null;
  return { id: m[2], titleSlug: m[1] };
}

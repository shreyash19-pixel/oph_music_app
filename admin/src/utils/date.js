/** All date/time display in the admin app uses IST (Indian Standard Time). */
export const IST = "Asia/Kolkata";

const istOptions = (opts = {}) => ({ timeZone: IST, ...opts });

export function formatDateIST(isoDate, options = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("en-GB", istOptions(options));
}

/**
 * Parse DB datetime as UTC. DB stores "2026-02-16 08:27:56" in UTC.
 * JS parses "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss" (no Z) as LOCAL time,
 * so we normalize to ISO with Z so it's interpreted as UTC, then display in IST.
 */
function parseAsUTC(value) {
  if (value == null) return new Date(NaN);
  if (value instanceof Date) return value;
  const s = typeof value === "string" ? value.trim() : String(value);
  // Already has timezone → use as-is
  if (/Z|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  // Looks like DB datetime (date + time, no timezone) → treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{1,2}:\d{2}/.test(s)) {
    const normalized = s.replace(/^\s*(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/, "$1T$2").trim();
    const withZ = normalized.endsWith("Z") ? normalized : normalized + "Z";
    return new Date(withZ);
  }
  return new Date(value);
}

/**
 * Format DB datetime (e.g. "2026-02-16 08:27:56" UTC) as IST like "Feb 16, 2026, 1:57:56 PM".
 * Use everywhere in admin for created_at, updated_at, etc.
 */
export function formatDateTimeIST(isoDate) {
  if (!isoDate) return "";
  const dateObj = parseAsUTC(isoDate);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleString("en-US", istOptions({
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }));
}

export function formatDateOnlyIST(isoDate) {
  return formatDateIST(isoDate, { day: "2-digit", month: "short", year: "numeric" });
}

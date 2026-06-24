/** Shared calendar / release-date-change date helpers */

const RELEASE_DATE_CHANGE_FROM_SQL = `(LOWER(TRIM(from_source)) = 'release date change' OR from_source = 'Release date change' OR from_source = 'Release Date Change')`;

function normalizeCalendarDateOnly(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (!s || s === "0000-00-00") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parts = s.split(/[/-T]/).map((p) => p.replace(/T.*/, ""));
  if (parts.length >= 3) {
    const [a, b, c] = parts;
    if (a.length === 4) return `${a}-${String(b).padStart(2, "0")}-${String(c).padStart(2, "0")}`;
    if (c.length === 4) return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  return null;
}

function parseReasonHistory(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isReleaseDateChangeFrom(from) {
  if (!from || typeof from !== "string") return false;
  return from.trim().toLowerCase().replace(/\s+/g, " ") === "release date change";
}

/** Days from start of today (local server) to dateStr (YYYY-MM-DD); 0 = today */
function daysFromToday(dateStr) {
  const d = normalizeCalendarDateOnly(dateStr);
  if (!d) return null;
  const target = new Date(`${d}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function isWithinFiveDaysOfToday(dateStr) {
  const days = daysFromToday(dateStr);
  return days != null && days >= 0 && days <= 5;
}

module.exports = {
  RELEASE_DATE_CHANGE_FROM_SQL,
  normalizeCalendarDateOnly,
  parseReasonHistory,
  isReleaseDateChangeFrom,
  daysFromToday,
  isWithinFiveDaysOfToday,
};

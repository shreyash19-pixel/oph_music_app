/** IST display for admin Excel exports. DB datetimes are UTC without a Z suffix. */

const IST = "Asia/Kolkata";

function parseAsUTC(value) {
  if (value == null) return new Date(NaN);
  if (value instanceof Date) return value;
  const s = typeof value === "string" ? value.trim() : String(value);
  if (/Z|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{1,2}:\d{2}/.test(s)) {
    const normalized = s
      .replace(/^\s*(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/, "$1T$2")
      .trim();
    const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
    return new Date(withZ);
  }
  return new Date(value);
}

function formatDateTimeIST(val) {
  if (!val) return "";
  const dateObj = parseAsUTC(val);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleString("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateOnlyIST(val) {
  if (!val) return "";
  const dateObj = parseAsUTC(val);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Song duration is stored as mm:ss (e.g. 3:45); force text so Excel does not treat it as clock time. */
function formatSongDurationForExcel(duration) {
  if (duration == null || duration === "") return "";
  return String(duration).trim();
}

module.exports = {
  formatDateTimeIST,
  formatDateOnlyIST,
  formatSongDurationForExcel,
};

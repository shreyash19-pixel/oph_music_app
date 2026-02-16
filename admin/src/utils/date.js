/** All date/time display in the admin app uses IST (Indian Standard Time). */
export const IST = "Asia/Kolkata";

const istOptions = (opts = {}) => ({ timeZone: IST, ...opts });

export function formatDateIST(isoDate, options = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj)) return "";
  return dateObj.toLocaleDateString("en-GB", istOptions(options));
}

export function formatDateTimeIST(isoDate) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj)) return "";
  return dateObj.toLocaleString("en-GB", istOptions({
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }));
}

export function formatDateOnlyIST(isoDate) {
  return formatDateIST(isoDate, { day: "2-digit", month: "short", year: "numeric" });
}

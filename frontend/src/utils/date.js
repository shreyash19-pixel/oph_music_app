/** All date/time display in the app uses IST (Indian Standard Time). */
export const IST = "Asia/Kolkata";

const istOptions = (opts = {}) => ({ timeZone: IST, ...opts });

function formatDateAndAdjustMonth(isoDate) {
  if (!isoDate) return "";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj)) return "";
  return dateObj.toLocaleDateString("en-US", istOptions({ day: "2-digit", month: "short", year: "numeric" }));
}

export function formatDateTime(isoDate) {
  const dateObj = new Date(isoDate);
  const formattedDate = dateObj.toLocaleDateString("en-US", istOptions({ day: "2-digit", month: "long", year: "numeric" }));
  const formattedTime = dateObj.toLocaleTimeString("en-US", istOptions({ hour: "2-digit", minute: "2-digit", hour12: true }));
  return `${formattedDate} - ${formattedTime}`;
}

export function formatDateOnly(isoDate) {
  const dateObj = new Date(isoDate);
  return dateObj.toLocaleDateString("en-US", istOptions({ day: "2-digit", month: "short", year: "numeric" }));
}

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

export const formatDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(day)}/${pad(month)}/${year}`;
};

/** Today's date in IST (YYYY-MM-DD) for registration window checks */
export function getTodayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: IST });
}

/** Date-only string in IST from any date value (YYYY-MM-DD) */
export function toDateStringIST(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-CA", { timeZone: IST });
}

/** Registration opens at midnight IST on start day, closes at 11:59 PM IST of end day (inclusive) */
export function isRegistrationOpen(event) {
  if (!event) return false;
  const todayIST = getTodayIST();
  const startDayIST = toDateStringIST(event.registrationStart);
  const endDayIST = toDateStringIST(event.registrationEnd);
  if (startDayIST && todayIST < startDayIST) return false;
  if (endDayIST && todayIST > endDayIST) return false;
  return true;
}

/** Returns end-of-day (23:59:59.999) in IST for the given date - registration closes at 11:59 PM */
function getEndOfDayIST(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return null;
  const dateStr = d.toLocaleDateString("en-CA", { timeZone: IST });
  return new Date(`${dateStr}T23:59:59.999+05:30`);
}

/** True if registration start date (in IST) is still in the future */
export function isRegistrationNotStartedYet(event) {
  if (!event) return false;
  const startDayIST = toDateStringIST(event.registrationStart);
  if (!startDayIST) return false;
  return getTodayIST() < startDayIST;
}

/**
 * Registration open check using full date+time (matches backend EventBookingService).
 * Registration end date is inclusive until 11:59:59 PM IST of that day.
 */
export function isRegistrationOpenByDateTime(event) {
  if (!event) return false;
  const now = new Date();
  const start = event.registrationStart ? new Date(event.registrationStart) : null;
  const end = event.registrationEnd ? getEndOfDayIST(event.registrationEnd) : null;
  if (start && isNaN(start.getTime())) return false;
  if (end && isNaN(end.getTime())) return false;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

/** True if registration start date/time has not yet been reached (matches backend) */
export function isRegistrationNotStartedYetByDateTime(event) {
  if (!event) return false;
  const start = event.registrationStart ? new Date(event.registrationStart) : null;
  if (!start || isNaN(start.getTime())) return false;
  return new Date() < start;
}

export default formatDateAndAdjustMonth;

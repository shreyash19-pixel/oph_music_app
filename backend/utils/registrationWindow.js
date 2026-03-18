/**
 * Registration window helpers - uses IST (Asia/Kolkata).
 * Registration end date is inclusive until 11:59:59 PM of that day.
 */

const IST = "Asia/Kolkata";

/**
 * Returns end-of-day (23:59:59.999) in IST for the given date value.
 * This makes the end date inclusive - users can register until 11:59:59 PM.
 */
function getEndOfDayIST(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return null;
  const dateStr = d.toLocaleDateString("en-CA", { timeZone: IST }); // YYYY-MM-DD
  return new Date(`${dateStr}T23:59:59.999+05:30`);
}

module.exports = { getEndOfDayIST, IST };

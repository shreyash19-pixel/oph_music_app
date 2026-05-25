/**
 * professional_details may store:
 * - Separate columns: experience_yearly (full years) and experience_monthly (0–11), or
 * - Legacy: total months only in experience_monthly while experience_yearly is 0 (values > 11).
 */
export function normalizeExperienceFromProfessionalDetails(pd) {
  if (!pd) return { years: 0, months: 0, totalMonths: 0 };

  const y = Number(pd.experience_yearly ?? pd.ExperienceYearly ?? 0);
  const ySafe = Number.isFinite(y) ? y : 0;
  const mRaw = Number(pd.experience_monthly ?? pd.ExperienceMonthly ?? 0);
  const mSafe = Number.isFinite(mRaw) ? mRaw : 0;

  let years;
  let months;
  if (mSafe > 11 && ySafe === 0) {
    years = Math.floor(mSafe / 12);
    months = mSafe % 12;
  } else {
    years = ySafe;
    months = mSafe % 12;
  }

  const totalMonths = years * 12 + months;
  return { years, months, totalMonths };
}

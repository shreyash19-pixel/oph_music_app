const db = require("../../DB/connect");

const getUserDetailsByOphId = async (ophid) => {
  console.log("getUserDetailsByOphId - Querying for OPH_ID:", ophid);
  // Return user details regardless of status (approved, rejected, under review, etc.)
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ?",
    [ophid],
  );
  console.log("getUserDetailsByOphId - Rows returned:", rows.length);
  console.log("getUserDetailsByOphId - First row:", rows[0]);
  return rows[0] || null;
};

const getProfessionalDetailsByOphId = async (ophid) => {
  // Return professional details regardless of status (approved, rejected, under review, etc.)
  const [rows] = await db.execute(
    "SELECT * FROM professional_details WHERE oph_id = ?",
    [ophid],
  );
  return rows[0] || null;
};

const getDocumentationDetailsByOphId = async (ophid) => {
  // Return documentation details regardless of status (approved, rejected, under review, etc.)
  const [rows] = await db.execute(
    "SELECT * FROM documentation_details WHERE oph_id = ?",
    [ophid],
  );
  return rows[0] || null;
};

/** Latest Registration payment row per artist (rejected / under review / approved / etc.). */
const latestRegistrationPaymentJoin = `
  LEFT JOIN (
    SELECT p.oph_id,
           p.status AS registration_payment_status,
           p.reject_reason AS registration_payment_reject_reason
    FROM payments p
    INNER JOIN (
      SELECT oph_id, MAX(created_at) AS max_created
      FROM payments
      WHERE from_source = 'Registration'
      GROUP BY oph_id
    ) latest ON p.oph_id = latest.oph_id AND p.created_at = latest.max_created
    WHERE p.from_source = 'Registration'
  ) regpay ON ud.oph_id = regpay.oph_id
`;

const getAllUserDetailsWithAnyStepUnderReview = async () => {
  const [rows] = await db.execute(
    `
    SELECT DISTINCT
      ud.*,
      regpay.registration_payment_status,
      regpay.registration_payment_reject_reason
    FROM user_details ud
    ${latestRegistrationPaymentJoin}
    WHERE ud.oph_id IN (
        SELECT oph_id FROM user_details WHERE step_status = 'under review'
        UNION
        SELECT oph_id FROM professional_details WHERE step_status = 'under review'
        UNION
        SELECT oph_id FROM documentation_details WHERE step_status = 'under review'
    )
    ORDER BY ud.created_at DESC;
    `,
  );
  return rows;
};

/**
 * Single queue: artists with any onboarding step "under review" OR any step rejected,
 * with latest Registration payment fields. (Super admin / admin head / admin member.)
 * Sales head & sales member should use getAllUserDetailsWithAnyRejectedOnboardingStep only.
 */
const getAllUserDetailsNewArtistUnifiedQueue = async () => {
  const [rows] = await db.execute(
    `
    SELECT DISTINCT
      ud.*,
      pd.step_status AS professional_step_status,
      pd.reject_reason AS professional_reject_reason,
      dd.step_status AS documentation_step_status,
      dd.reject_reason AS documentation_reject_reason,
      regpay.registration_payment_status,
      regpay.registration_payment_reject_reason
    FROM user_details ud
    LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id
    LEFT JOIN documentation_details dd ON ud.oph_id = dd.oph_id
    ${latestRegistrationPaymentJoin}
    WHERE
      ud.oph_id IN (
        SELECT oph_id FROM user_details WHERE step_status = 'under review'
        UNION
        SELECT oph_id FROM professional_details WHERE step_status = 'under review'
        UNION
        SELECT oph_id FROM documentation_details WHERE step_status = 'under review'
      )
      OR LOWER(TRIM(COALESCE(ud.step_status, ''))) = 'rejected'
      OR LOWER(TRIM(COALESCE(pd.step_status, ''))) = 'rejected'
      OR LOWER(TRIM(COALESCE(dd.step_status, ''))) = 'rejected'
    ORDER BY ud.updated_at DESC, ud.created_at DESC
    `,
  );
  return rows;
};

/** Profile (user_details), professional, or documentation step is rejected */
const getAllUserDetailsWithAnyRejectedOnboardingStep = async () => {
  const [rows] = await db.execute(
    `
    SELECT DISTINCT
      ud.*,
      pd.step_status AS professional_step_status,
      pd.reject_reason AS professional_reject_reason,
      dd.step_status AS documentation_step_status,
      dd.reject_reason AS documentation_reject_reason,
      regpay.registration_payment_status,
      regpay.registration_payment_reject_reason
    FROM user_details ud
    LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id
    LEFT JOIN documentation_details dd ON ud.oph_id = dd.oph_id
    ${latestRegistrationPaymentJoin}
    WHERE LOWER(TRIM(COALESCE(ud.step_status, ''))) = 'rejected'
       OR LOWER(TRIM(COALESCE(pd.step_status, ''))) = 'rejected'
       OR LOWER(TRIM(COALESCE(dd.step_status, ''))) = 'rejected'
    ORDER BY ud.updated_at DESC, ud.created_at DESC
    `,
  );
  return rows;
};

const checkIncomeOfSpecialArtistMod = async (ophid) => {
  await db.execute(
    "INSERT IGNORE INTO special_artist_income_status (oph_id,status) VALUES (?,?)",
    [ophid,"locked"],
  );
};

const getAllSales = async () => {
  const [rows] = await db.execute(
    `
    SELECT DISTINCT ud.*
    FROM user_details ud
    INNER JOIN professional_details pd ON ud.oph_id = pd.oph_id
    INNER JOIN documentation_details dd ON ud.oph_id = dd.oph_id
    WHERE ud.step_status = 'rejected'
      AND pd.step_status = 'rejected'
      AND dd.step_status = 'rejected'
    ORDER BY ud.created_at DESC;
    `,
  );
  return rows;
};

const updateUserDetailsStatus = async (ophid, status, reason) => {
  const [rows] = await db.execute(
    `
    UPDATE user_details
    SET step_status = ?, reject_reason = ?
    WHERE oph_id = ?
    `,
    [status, reason, ophid],
  );

  return [rows];
};

const updateDocumentationStatus = async (ophid, status, reason) => {
  const [rows] = await db.execute(
    `
    UPDATE documentation_details
    SET step_status = ?, reject_reason = ?
    WHERE oph_id = ?
    `,
    [status, reason, ophid],
  );

  return [rows];
};

const updateProfessionalStatus = async (ophid, status, reason) => {
  const [rows] = await db.execute(
    `
    UPDATE professional_details
    SET step_status = ?, reject_reason = ?
    WHERE oph_id = ?
    `,
    [status, reason, ophid],
  );

  return [rows];
};

const getUserDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status, reject_reason FROM user_details WHERE oph_id = ?
    `,
    [ophid],
  );
  return rows;
};

const getProfessionalDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status, reject_reason FROM professional_details WHERE oph_id = ?
    `,
    [ophid],
  );
  return rows;
};

const getDocumentationDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status, reject_reason FROM documentation_details WHERE oph_id = ?
    `,
    [ophid],
  );
  return rows;
};

module.exports = {
  getUserDetailsByOphId,
  getProfessionalDetailsByOphId,
  getDocumentationDetailsByOphId,
  getAllUserDetailsWithAnyStepUnderReview,
  getAllUserDetailsNewArtistUnifiedQueue,
  getAllUserDetailsWithAnyRejectedOnboardingStep,
  updateUserDetailsStatus,
  updateProfessionalStatus,
  updateDocumentationStatus,
  getAllSales,
  getUserDetailsStepStatus,
  getProfessionalDetailsStepStatus,
  getDocumentationDetailsStepStatus,
  checkIncomeOfSpecialArtistMod,
};

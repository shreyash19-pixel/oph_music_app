const db = require('../../DB/connect');



const getUniqueOphIdsWithRegistration = async () => {
  const [rows] = await db.execute(
    `SELECT t.oph_id AS OPH_ID
     FROM payments t
     INNER JOIN (
       SELECT oph_id, MAX(created_at) AS max_created
       FROM payments
       WHERE from_source = ? 
         AND oph_id IS NOT NULL 
         AND oph_id != ''
         AND (status = 'Under Review' OR status = 'under review')
       GROUP BY oph_id
     ) latest 
     ON t.oph_id = latest.oph_id 
        AND t.created_at = latest.max_created
     WHERE t.from_source = ? 
       AND t.oph_id IS NOT NULL 
       AND t.oph_id != ''
       AND (t.status = 'Under Review' OR t.status = 'under review')`,
    ["Registration", "Registration"]
  );
  return rows;
};

 const getUserDetailsByOphIds = async (ophIds) => {
  if (ophIds.length === 0) return [];

  // Create placeholders (?, ?, ...) dynamically
  const placeholders = ophIds.map(() => "?").join(",");

  const [rows] = await db.execute(
    `SELECT *
     FROM user_details
     WHERE oph_id IN (${placeholders})`,
    ophIds
  );

  return rows;
};

const getUserDetailsByOphId = async (ophId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM user_details
     WHERE oph_id = ?`,
    [ophId]
  );
  return rows[0] || null;
};

const getTransactionsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT transaction_id AS Transaction_ID, created_at AS CreatedAt
     FROM payments
     WHERE oph_id = ? AND from_source = 'Registration'
     ORDER BY created_at DESC`,
    [ophid]
  );
  return rows;
};

/**
 * Users whose most recent Registration payment is rejected (same “current signup” rule as the under-review list).
 */
const getUserDetailsWithLatestRegistrationRejected = async () => {
  const [rows] = await db.execute(
    `SELECT ud.*,
            p.transaction_id AS signup_transaction_id,
            p.reject_reason AS signup_payment_reject_reason,
            p.updated_at AS signup_payment_updated_at,
            p.created_at AS signup_payment_created_at
     FROM user_details ud
     INNER JOIN payments p ON ud.oph_id = p.oph_id
     INNER JOIN (
       SELECT oph_id, MAX(created_at) AS max_created
       FROM payments
       WHERE from_source = 'Registration'
         AND oph_id IS NOT NULL
         AND oph_id != ''
       GROUP BY oph_id
     ) latest
       ON p.oph_id = latest.oph_id
      AND p.created_at = latest.max_created
     WHERE p.from_source = 'Registration'
       AND LOWER(TRIM(COALESCE(p.status, ''))) = 'rejected'`
  );
  return rows;
};

/**
 * Latest Registration payment is under review, rejected, or approved (one row per artist).
 * Replaces using /newsignup + /newsignup/rejected-signup-payments together.
 */
const getUnifiedNewSignupUserDetails = async () => {
  const [rows] = await db.execute(
    `SELECT DISTINCT ud.*,
            lp.transaction_id AS signup_transaction_id,
            lp.reject_reason AS signup_payment_reject_reason,
            lp.updated_at AS signup_payment_updated_at,
            lp.created_at AS signup_payment_created_at,
            lp.status AS signup_payment_status
     FROM user_details ud
     INNER JOIN (
       SELECT p.oph_id,
              p.transaction_id,
              p.reject_reason,
              p.updated_at,
              p.created_at,
              p.status
       FROM payments p
       INNER JOIN (
         SELECT oph_id, MAX(created_at) AS max_created
         FROM payments
         WHERE from_source = 'Registration'
           AND oph_id IS NOT NULL
           AND oph_id != ''
         GROUP BY oph_id
       ) latest ON p.oph_id = latest.oph_id AND p.created_at = latest.max_created
       WHERE p.from_source = 'Registration'
     ) lp ON ud.oph_id = lp.oph_id
     WHERE LOWER(TRIM(COALESCE(lp.status, ''))) IN ('under review', 'rejected', 'approved')
     ORDER BY ud.updated_at DESC, ud.created_at DESC`
  );
  return rows;
};

module.exports = {
  getUniqueOphIdsWithRegistration,
  getUserDetailsByOphIds,
  getUserDetailsByOphId,
  getTransactionsByOphId,
  getUserDetailsWithLatestRegistrationRejected,
  getUnifiedNewSignupUserDetails,
};
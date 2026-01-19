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

module.exports = {getUniqueOphIdsWithRegistration,getUserDetailsByOphIds,getUserDetailsByOphId, getTransactionsByOphId};
const db = require('../../DB/connect');



const getUniqueOphIdsWithRegistration = async () => {
  const [rows] = await db.execute(
    `SELECT t.OPH_ID
     FROM sign_up_payment t
     INNER JOIN (
       SELECT OPH_ID, MAX(CreatedAt) AS max_created
       FROM sign_up_payment
       WHERE \`From\` = ? 
         AND OPH_ID IS NOT NULL 
         AND OPH_ID != ''
         AND (Status = 'Under Review' OR Status = 'under review')
       GROUP BY OPH_ID
     ) latest 
     ON t.OPH_ID = latest.OPH_ID 
        AND t.CreatedAt = latest.max_created
     WHERE t.\`From\` = ? 
       AND t.OPH_ID IS NOT NULL 
       AND t.OPH_ID != ''
       AND (t.Status = 'Under Review' OR t.Status = 'under review')`,
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
     WHERE ophid IN (${placeholders})`,
    ophIds
  );

  return rows;
};

const getUserDetailsByOphId = async (ophId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM user_details
     WHERE ophid = ?`,
    [ophId]
  );
  return rows[0] || null;
};

const getTransactionsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT Transaction_ID, CreatedAt
     FROM sign_up_payment
     WHERE OPH_ID = ? AND \`From\` = 'Registeration'
     ORDER BY CreatedAt DESC`,
    [ophid]
  );
  return rows;
};

module.exports = {getUniqueOphIdsWithRegistration,getUserDetailsByOphIds,getUserDetailsByOphId, getTransactionsByOphId};
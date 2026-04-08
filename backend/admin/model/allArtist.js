const db = require('../../DB/connect');

const getUserDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ? AND step_status = 'approved'",
    [ophid]
  );
  return rows[0]; // Only one row since oph_id is PK
};

const getProfessionalDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM professional_details WHERE oph_id = ? AND step_status = 'approved'",
    [ophid]
  );
  return rows[0];
};

const getDocumentationDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM documentation_details WHERE oph_id = ? AND step_status = 'approved'",
    [ophid]
  );
  return rows[0];
};

const getAllUserDetails = async () => {
  const [rows] = await db.execute(
    `
    SELECT
      ud.*,
      regpay.registration_payment_status,
      regpay.registration_payment_reject_reason
    FROM user_details ud
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
    WHERE ud.oph_id IN (
      SELECT oph_id FROM application_status WHERE overall_status = 'completed'
    )
    `
  );
  return rows;
};


const updateUserDetails = async (ophid, data) => {
  // Build the SET clause dynamically
  const fields = Object.keys(data);
  const values = Object.values(data);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE user_details SET ${setClause} WHERE oph_id = ?`;
  
  const [rows] = await db.execute(query, [...values, ophid]);
  return rows;
};

const updateProfessionalDetails = async (ophid, data) => {
  console.log("Database update - oph_id:", ophid);
  console.log("Database update - Data:", data);
  
  // Build the SET clause dynamically
  const fields = Object.keys(data);
  const values = Object.values(data);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE professional_details SET ${setClause} WHERE oph_id = ?`;
  
  console.log("Database query:", query);
  console.log("Database values:", [...values, ophid]);
  
  const [rows] = await db.execute(query, [...values, ophid]);
  console.log("Database update result:", rows);
  return rows;
};


const updateDocumentationDetails = async (ophid, data) => {
  console.log("Database update - oph_id:", ophid);
  console.log("Database update - Data:", data);
  
  // Build the SET clause dynamically
  const fields = Object.keys(data);
  const values = Object.values(data);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE documentation_details SET ${setClause} WHERE oph_id = ?`;
  
  console.log("Database query:", query);
  console.log("Database values:", [...values, ophid]);
  
  const [rows] = await db.execute(query, [...values, ophid]);
  console.log("Database update result:", rows);
  return rows;
};
module.exports ={getUserDetailsByOphId,getDocumentationDetailsByOphId,getProfessionalDetailsByOphId,getAllUserDetails,updateUserDetails,updateProfessionalDetails,updateDocumentationDetails
}
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
    SELECT *
    FROM user_details
    WHERE oph_id IN (
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
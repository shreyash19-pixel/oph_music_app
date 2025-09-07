const db = require('../../DB/connect');

const getUserDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE ophid = ? AND step_status = 'completed'",
    [ophid]
  );
  return rows[0]; // Only one row since ophid is PK
};

const getProfessionalDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM professional_details WHERE OPH_ID = ? AND step_status = 'completed'",
    [ophid]
  );
  return rows[0];
};

const getDocumentationDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM documentation_details WHERE OPH_ID = ? AND step_status = 'completed'",
    [ophid]
  );
  return rows[0];
};

const getAllUserDetails = async () => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM user_details
    WHERE ophid IN (
      SELECT OPH_ID FROM application_status WHERE overall_status = 'completed'
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
  const query = `UPDATE user_details SET ${setClause} WHERE ophid = ?`;
  
  const [rows] = await db.execute(query, [...values, ophid]);
  return rows;
};

const updateProfessionalDetails = async (ophid, data) => {
  console.log("Database update - OPH_ID:", ophid);
  console.log("Database update - Data:", data);
  
  // Build the SET clause dynamically
  const fields = Object.keys(data);
  const values = Object.values(data);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE professional_details SET ${setClause} WHERE OPH_ID = ?`;
  
  console.log("Database query:", query);
  console.log("Database values:", [...values, ophid]);
  
  const [rows] = await db.execute(query, [...values, ophid]);
  console.log("Database update result:", rows);
  return rows;
};


const updateDocumentationDetails = async (ophid, data) => {
  console.log("Database update - OPH_ID:", ophid);
  console.log("Database update - Data:", data);
  
  // Build the SET clause dynamically
  const fields = Object.keys(data);
  const values = Object.values(data);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE documentation_details SET ${setClause} WHERE OPH_ID = ?`;
  
  console.log("Database query:", query);
  console.log("Database values:", [...values, ophid]);
  
  const [rows] = await db.execute(query, [...values, ophid]);
  console.log("Database update result:", rows);
  return rows;
};
module.exports ={getUserDetailsByOphId,getDocumentationDetailsByOphId,getProfessionalDetailsByOphId,getAllUserDetails,updateUserDetails,updateProfessionalDetails,updateDocumentationDetails
}
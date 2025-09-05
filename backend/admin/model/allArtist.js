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

module.exports ={getUserDetailsByOphId,getDocumentationDetailsByOphId,getProfessionalDetailsByOphId,getAllUserDetails
}
const db = require("../../DB/connect");

const getUserDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE ophid = ? AND step_status = 'under review'",
    [ophid],
  );
  return rows[0]; // Only one row since ophid is PK
};

const getProfessionalDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM professional_details WHERE OPH_ID = ? AND step_status = 'under review'",
    [ophid],
  );
  return rows[0];
};

const getDocumentationDetailsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM documentation_details WHERE OPH_ID = ? AND step_status = 'under review'",
    [ophid],
  );
  return rows[0];
};

const getAllUserDetailsWithAnyStepUnderReview = async () => {
  const [rows] = await db.execute(
    `
    SELECT *
FROM user_details
WHERE ophid IN (
    -- Case 1: Under review in ALL 3 tables
    SELECT ophid FROM user_details WHERE step_status = 'under review'
    INTERSECT
    SELECT OPH_ID FROM professional_details WHERE step_status = 'under review'
    INTERSECT
    SELECT OPH_ID FROM documentation_details WHERE step_status = 'under review'
)

UNION

SELECT *
FROM user_details
WHERE form_fill_count > 3
  AND ophid IN (
      -- Case 2: Under review in ANY ONE table
      SELECT ophid FROM user_details WHERE step_status = 'under review'
      UNION
      SELECT OPH_ID FROM professional_details WHERE step_status = 'under review'
      UNION
      SELECT OPH_ID FROM documentation_details WHERE step_status = 'under review'
  );


    `,
  );
  return rows;
};

const getAllSales = async () => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM user_details
    WHERE ophid IN (
      SELECT ophid FROM user_details WHERE step_status = 'rejected'
      INTERSECT
      SELECT OPH_ID FROM professional_details WHERE step_status = 'rejected'
      INTERSECT
      SELECT OPH_ID FROM documentation_details WHERE step_status = 'rejected'
    );

    `
  );
  return rows;
};

const updateUserDetailsStatus = async (ophid, status, reason) => {
  const [rows] = await db.execute(
    `
    UPDATE user_details
    SET step_status = ?, reject_reason = ?
    WHERE ophid = ?
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
    WHERE OPH_ID = ?
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
    WHERE OPH_ID = ?
    `,
    [status, reason, ophid],
  );

  return [rows];
};

const getUserDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status FROM user_details WHERE ophid = ?
    `,
    [ophid],
  );
  return rows;
};

const getProfessionalDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status FROM professional_details WHERE OPH_ID = ?
    `,
    [ophid],
  );
  return rows;
};

const getDocumentationDetailsStepStatus = async (ophid) => {
  const [rows] = await db.execute(
    `
    SELECT step_status FROM documentation_details WHERE OPH_ID = ?
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
  updateUserDetailsStatus,
  updateProfessionalStatus,
  updateDocumentationStatus,
  getAllSales,
  getUserDetailsStepStatus,
  getProfessionalDetailsStepStatus,
  getDocumentationDetailsStepStatus,
};

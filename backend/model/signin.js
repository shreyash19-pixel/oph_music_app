const db = require("../DB/connect");

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE email = ?",
    [email],
  );
  return rows;
};

const checkRejectedStep = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT *
  FROM application_status
  WHERE OPH_ID = ? `,
    [ophid],
  );

  return rows;
};

module.exports = { findUserByEmail, checkRejectedStep };

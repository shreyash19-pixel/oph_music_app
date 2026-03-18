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
  WHERE oph_id = ? `,
    [ophid],
  );

  return rows;
};

const getArtistDetail = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT overall_status FROM application_status WHERE oph_id = ?",
    [ophid],
  );
  return rows;
};

const findUserByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE ophid = ?",
    [ophid],
  );
  return rows;
};

module.exports = { findUserByEmail, checkRejectedStep, getArtistDetail, findUserByOphId };

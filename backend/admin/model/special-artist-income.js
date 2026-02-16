const db = require("../../DB/connect");

const checkSpecialArtistIncomeStatus = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT status FROM special_artist_income_status WHERE oph_id = ?",
    [ophid],
  );

  return rows;
};

const getIndividualSpecialArtistIncome = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_income_status WHERE oph_id = ?",
    [ophid],
  );

  return rows;
};

const getSpecialArtistIncome = async () => {
  const [rows] = await db.execute("SELECT * FROM special_artist_income_status");

  return rows;
};

const setSpecialArtistIncomeStatus = async (ophid,status) => {
  const [rows] = await db.execute(
    "UPDATE special_artist_income_status SET status = ? WHERE oph_id = ?",
    [status, ophid],
  );

  return rows;
};

module.exports = {
  checkSpecialArtistIncomeStatus,
  setSpecialArtistIncomeStatus,
  getSpecialArtistIncome,
  getIndividualSpecialArtistIncome,
};

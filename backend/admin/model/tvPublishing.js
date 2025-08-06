const db = require("../../DB/connect");

const getAllTv = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing",
    []
  );
  return rows;
};

const getTv = async (song_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing WHERE song_id = ?",
    [song_id]
  );
  return rows;
};

module.exports = {
  getAllTv,
  getTv,
};

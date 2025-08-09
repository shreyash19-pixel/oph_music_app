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

const updateTvLock = async (song_id, lock) => {
  const [result] = await db.execute(
    "UPDATE tvPublishing SET `lock` = ? WHERE song_id = ?",
    [lock, song_id]
  );
  return result;
};

const updateTvStatus = async (song_id, status, reason) => {
  const [result] = await db.execute(
    `UPDATE tvPublishing 
     SET status = ?, reason = ? 
     WHERE song_id = ?`,
    [status, reason, song_id]
  );
  return result;
};



module.exports = {
  getAllTv,
  getTv,
  updateTvLock,
  updateTvStatus,
};

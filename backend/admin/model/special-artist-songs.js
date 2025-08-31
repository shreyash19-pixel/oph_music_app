const db = require("../../DB/connect");

const getSongsList = async () => {
  const [rows] = await db.execute("SELECT * FROM special_artist_songs WHERE status != 'approved'");

  return rows;
};

const getIndividualSongDetails = async (ophid, songId) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_songs WHERE ophid = ? AND song_id = ?",
    [ophid, songId]
  );

  return rows;
};

const setSongStatus = async (ophid, songId, type, reason) => {
  let getReason = "";

  if (type === "approved") {
    getReason = null;
  } else if(type === "rejected") {
    getReason = reason;
  }

  const [rows] = await db.execute(
    "UPDATE special_artist_songs SET status = ?, reject_reason = ? WHERE ophid = ? AND song_id = ?",
    [type, getReason, ophid, songId]
  );

  return rows;
};

module.exports = { getSongsList, getIndividualSongDetails, setSongStatus };

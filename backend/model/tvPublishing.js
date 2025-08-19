const db = require("../DB/connect");

const updateContentFiles = async (song_id, audio, video) => {
  const [result] = await db.execute(
    `UPDATE tvPublishing 
     SET audio = ?, video = ?, status = ?
     WHERE song_id = ?`,
    [audio, video, "Submitted", song_id]
  );
  return result;
};





const TvUser = async (OPH_ID) => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing WHERE OPH_ID = ? AND `lock` = 0;",
    [OPH_ID]
  );
  return rows;
};

module.exports = { TvUser, updateContentFiles };


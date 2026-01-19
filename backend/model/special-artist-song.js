const db = require("../DB/connect");

const getSpeicalArtistSongStatus = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_songs WHERE oph_id = ?",
    [ophid]
  );

  return rows;
};

const insertSpecialArtistSongs = async (
  ophid,
  song_name,
  views,
  credits,
  duration,
  proof,
  songCount,
  audio_url
) => {

  const [rows] = 
    await db.execute(
      "INSERT INTO special_artist_songs (oph_id, song_name, views,credits,duration,proof, audio_url) VALUES (?,?,?,?,?,?,?)",
      [ophid, song_name, views, credits, duration, proof, audio_url]
    )
  // console.log(rows);
  
  const [songId] =  await db.execute(
      "SELECT song_id FROM special_artist_songs WHERE oph_id = ? AND song_name = ?",
      [ophid, song_name]
    )

    console.log(songId);
    

  //   if (songCount < 3) {
  //     await db.execute(
  //       "UPDATE special_artist_songs SET status = 'approved' WHERE song_id = ?",
  //       [songId[0].song_id]
  //     )
  // }

  return songId;
};

const getSongCount = async (ophid) => {
  const [count] = await db.execute(
    `WITH CTECount 
AS 
(SELECT oph_id, COUNT(*) cnt FROM special_artist_songs GROUP BY oph_id)
SELECT cnt FROM CTECount WHERE oph_id = ?`,
    [ophid]
  );

  return count;
};

module.exports = {
  insertSpecialArtistSongs,
  getSpeicalArtistSongStatus,
  getSongCount,
};

const db = require("../DB/connect");

const getSpeicalArtistSongStatus = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT 
        sas.song_id,
        sas.oph_id,
        sas.song_name,
        sas.created_at,
        sas.status AS song_status,
        sas.reject_reason,
        p.status AS payment_status
     FROM special_artist_songs sas
     LEFT JOIN payments p 
       ON sas.song_id = p.song_id 
      AND p.from_source = 'Special Artist Song Registration'
     WHERE sas.oph_id = ?`,
    [ophid],
  );

  return rows.map((row) => {
    let finalStatus = "pending";

    if (row.song_status === "rejected") {
      finalStatus = "rejected";
    } else if (
      row.song_status === "approved" &&
      row.payment_status === "approved"
    ) {
      finalStatus = "approved";
    } 

    return {
      song_id: row.song_id,
      oph_id: row.oph_id,
      song_name: row.song_name,
      created_at: row.created_at,
      status: finalStatus,
      reject_reason: row.reject_reason || "-",
    };
  });
};

const insertSpecialArtistSongs = async (
  ophid,
  song_name,
  views,
  credits,
  duration,
  proof,
  songCount,
  audio_url,
) => {
  const [rows] = await db.execute(
    "INSERT INTO special_artist_songs (oph_id, song_name, views,credits,duration,proof, audio_url) VALUES (?,?,?,?,?,?,?)",
    [ophid, song_name, views, credits, duration, proof, audio_url],
  );
  // console.log(rows);

  const [songId] = await db.execute(
    "SELECT song_id FROM special_artist_songs WHERE oph_id = ? AND song_name = ?",
    [ophid, song_name],
  );

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
    [ophid],
  );

  return count;
};

module.exports = {
  insertSpecialArtistSongs,
  getSpeicalArtistSongStatus,
  getSongCount,
};

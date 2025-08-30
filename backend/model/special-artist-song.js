const db = require("../DB/connect");

const getSpeicalArtistSongStatus = async (ophid) => {

    const [rows] = await db.execute("SELECT * FROM special_artist_songs WHERE ophid = ?", [ophid])

    return rows;

}

const insertSpecialArtistSongs = async (
  ophid,
  song_name,
  views,
  credits,
  duration,
  proof,
  audio_url
) => {
  await db.execute(
    "INSERT INTO special_artist_songs (ophid, song_name, views,credits,duration,proof, audio_url) VALUES (?,?,?,?,?,?,?)",
    [ophid, song_name, views, credits, duration, proof, audio_url]
  );

  const [getDetails] = await db.execute("SELECT song_id FROM special_artist_songs WHERE ophid = ?", [ophid])  
  
  const songMap = {}

  songMap[ophid] = {
    song_id: getDetails[0].song_id
  }

  return songMap;
};

module.exports = { insertSpecialArtistSongs, getSpeicalArtistSongStatus };

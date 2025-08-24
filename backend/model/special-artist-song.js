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
  const [rows] = await db.execute(
    "INSERT INTO special_artist_songs (ophid, song_name, views,credits,duration,proof, audio_url) VALUES (?,?,?,?,?,?,?)",
    [ophid, song_name, views, credits, duration, proof, audio_url]
  );

  return rows;
};

module.exports = { insertSpecialArtistSongs, getSpeicalArtistSongStatus };

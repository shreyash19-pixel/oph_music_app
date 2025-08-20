const db = require("../DB/connect");

const insertSongDetails = async (
  OPH_ID,
  song_id,
  Song_name,
  language,
  genre,
  sub_genre,
  mood,
  lyrics,
  primary_artist,
  audioPath
) => {
  const [result] = await db.execute(
    `INSERT INTO audio_details (
      OPH_ID, Song_name, language, genre, sub_genre, mood,
      lyrics, primary_artist, audio_url, song_id, reject_reason, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      Song_name = VALUES(Song_name),
      language = VALUES(language),
      genre = VALUES(genre),
      sub_genre = VALUES(sub_genre),
      mood = VALUES(mood),
      lyrics = VALUES(lyrics),
      primary_artist = VALUES(primary_artist),
      audio_url = VALUES(audio_url),
      reject_reason = null,
      status = 'under review'
      `,
      
    [
      OPH_ID,
      Song_name,
      language,
      genre,
      sub_genre,
      mood,
      lyrics,
      primary_artist,
      audioPath,
      song_id,
      null,
      'under review'
    ]
  );

  return result;
};


const checkVideoDetailsStatus = async (song_id) => {

  const [rows] = await db.execute("SELECT vd.status FROM songs_register sr LEFT JOIN video_details vd ON sr.song_id = vd.song_id WHERE sr.song_id = ?", [song_id]);
  
  let nextPagePath = ''

  if(rows[0].status === null || rows[0].status === 'rejected')
  {
    nextPagePath = 'video'
  }
  else{
    nextPagePath = 'pending'
  }

  return nextPagePath

}


const setNextPage = async (next_step, ophid, song_id) => {

  const [rows] = await db.execute("UPDATE songs_register SET current_page = ? WHERE OPH_ID = ? AND song_id = ?", [next_step, ophid, song_id])

  return rows

}

const getAudioMeta = async (song_id, ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM audio_details WHERE song_id = ? AND OPH_ID = ?", [song_id, ophid]
  )

  return rows
}

const getSecondaryArtist = async (song_id) => {

  const [rows] = await db.execute(
    "SELECT * FROM secondary_artist WHERE song_id = ?", [song_id]
  )

  return rows

}

module.exports = { insertSongDetails, getAudioMeta, getSecondaryArtist, setNextPage, checkVideoDetailsStatus };

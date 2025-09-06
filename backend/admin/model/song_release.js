const db = require("../../DB/connect");

const getSongReleaseList = async () => {
  const [rows] = await db.execute("SELECT * FROM song_release");

  return rows;
};

const getIndividualSongReleaseList = async (ophid, songId) => {
  const [rows] = await db.execute(
    "SELECT * FROM song_release WHERE ophid = ? AND song_id = ?",
    [ophid, songId]
  );

  return rows;
};

const setSongReleaseDetails = async (
  ophid,
  songId,
  release_time,
  youtube_release_time,
  spotify_release_time,
  apple_release_time,
  instagram_release_time,
  facebook_release_time,
  share_url,
  youtube_url,
  spotify_url,
  apple_url,
  instagram_url,
  facebook_url
) => {
  const [rows] = await db.execute(
    "UPDATE song_release SET release_time = ?, youtube_release_time = ?, spotify_release_time = ?, apple_release_time = ?, instagram_release_time = ?,facebook_release_time = ?, share_url = ?, youtube_url = ?, spotify_url = ?, apple_url = ?, instagram_url = ?, facebook_url = ? WHERE ophid = ? AND song_id = ?",
    [
      release_time,
      youtube_release_time,
      spotify_release_time,
      apple_release_time,
      instagram_release_time,
      facebook_release_time,
      share_url,
      youtube_url,
      spotify_url,
      apple_url,
      instagram_url,
      facebook_url,
      ophid,
      songId,
    ]
  );

  return rows;
};

module.exports = {
  getSongReleaseList,
  getIndividualSongReleaseList,
  setSongReleaseDetails,
};

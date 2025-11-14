// model/secondary_artist.js
const db = require("../DB/connect");

/**
 * Insert a new secondary artist row
 */
const insertSecondaryArtist = async (
  song_id,
  artist_type,
  artist_name,
  Legal_name,
  artistPictureUrl,
  SpotifyLink,
  InstagramLink,
  FacebookLink,
  AppleMusicLink
) => {
  const [result] = await db.execute(
    `INSERT INTO secondary_artist (
      song_id,
      artist_type,
      artist_name,
      Legal_name,
      artistPictureUrl,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink
     ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      song_id,
      artist_type,
      artist_name,
      Legal_name,
      artistPictureUrl,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink
    ]
  );

  return result;
};


const removeSecondaryArtist = async (song_id, artist_type, artist_name, legal_name) => 
{
    const [rows] = await db.execute(
      "DELETE FROM secondary_artist WHERE song_id = ? AND artist_type = ? AND artist_name = ? AND Legal_name = ?",[song_id,artist_type,artist_name,legal_name]
    )

    return rows;
}

/**
 * Update an existing secondary artist (keyed by OPH_ID + artist_type)
 */
const updateSecondaryArtist = async (
  OPH_ID,
  artist_type,
  artist_name,
  Legal_name,
  artistPictureUrl,
  SpotifyLink,
  InstagramLink,
  FacebookLink,
  AppleMusicLink
) => {
  const [result] = await db.execute(
    `UPDATE secondary_artist
     SET artist_name = ?, Legal_name = ?, artistPictureUrl = ?,
         SpotifyLink = ?, InstagramLink = ?, FacebookLink = ?, AppleMusicLink = ?
     WHERE OPH_ID = ? AND artist_type = ?`,
    [
      artist_name ?? null,
      Legal_name ?? null,
      artistPictureUrl ?? null,
      SpotifyLink ?? null,
      InstagramLink ?? null,
      FacebookLink ?? null,
      AppleMusicLink ?? null,
      OPH_ID ?? null,
      artist_type ?? null,
    ]
  );
  return result;
};

/**
 * Fetch a single secondary artist row by OPH_ID + artist_type
 */
const getByOphIdAndType = async (OPH_ID, artist_type) => {
  const [rows] = await db.execute(
    `SELECT *
       FROM secondary_artist
      WHERE OPH_ID      = ?
        AND artist_type = ?`,
    [OPH_ID, artist_type]
  );

  return rows;
};

/**
 * List all secondary artists for one OPH_ID
 */
const getSecondaryArtistsByOphId = async (OPH_ID) => {
  const [rows] = await db.execute(
    `SELECT *
       FROM secondary_artist
      WHERE OPH_ID = ?`,
    [OPH_ID]
  );

  return rows;
};

/**
 * Get all secondary artists for a song_id (excluding song_id and created_at)
 */
const getSecondaryArtistsBySongId = async (song_id) => {
  const [rows] = await db.execute(
    `SELECT 
      artist_type,
      artist_name,
      Legal_name,
      artistPictureUrl,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink
    FROM secondary_artist
    WHERE song_id = ?
    ORDER BY artist_type, artist_name`,
    [song_id]
  );

  return rows;
};

module.exports = {
  insertSecondaryArtist,
  updateSecondaryArtist,
  removeSecondaryArtist,
  getByOphIdAndType,
  getSecondaryArtistsByOphId,
  getSecondaryArtistsBySongId,
};

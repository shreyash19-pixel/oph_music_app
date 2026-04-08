const db = require("../DB/connect");

/** OPH ID pattern or user_details.artist_type for specialist / special artist accounts. */
const isSpecialArtistProfile = (artistType, ophId) => {
  if (ophId && String(ophId).toUpperCase().includes("-SA-")) return true;
  if (artistType && /special/i.test(String(artistType).trim())) return true;
  return false;
};

/**
 * Approved public tracks from special_artist_songs (MY EPK rules: free approved, or paid + payment approved).
 */
const fetchSpecialArtistPublicSongRows = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT DISTINCT
      sas.song_id,
      sas.song_name,
      sas.audio_url,
      sas.views
    FROM special_artist_songs sas
    LEFT JOIN (
      SELECT * FROM (
        SELECT *,
          COALESCE(song_id, reject_for) AS ref_song_id,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(song_id, reject_for)
            ORDER BY updated_at DESC
          ) AS rn
        FROM payments
        WHERE from_source = 'Special Artist Song Registration'
          AND oph_id = ?
      ) latest
      WHERE rn = 1
    ) p ON p.ref_song_id = sas.song_id
    WHERE sas.oph_id = ?
      AND sas.audio_url IS NOT NULL
      AND TRIM(sas.audio_url) <> ''
      AND (
        (sas.song_type = 'free' AND sas.status = 'approved')
        OR (
          sas.song_type = 'paid'
          AND sas.status = 'approved'
          AND p.status = 'approved'
        )
      )
    ORDER BY sas.song_id DESC`,
    [ophid, ophid],
  );
  return rows;
};

/** Shape for /get-artist-detail (home.js) */
const formatSpecialArtistSongsForHome = (rows, primaryLabel) => {
  const label = primaryLabel != null ? String(primaryLabel).trim() : "";
  return rows.map((r) => ({
    song_id: r.song_id,
    song_name: r.song_name,
    primaryArtist: label,
    primary_artist: label,
    secondary_artist: [],
    featuring_artists: [],
    total_song_views: r.views ?? 0,
    audio_url: r.audio_url,
    audio_file_url: r.audio_url,
  }));
};

/**
 * Shape for /get-top-artist-detail — ArtistProfile table expects `name`, `audio_file_url`.
 */
const formatSpecialArtistSongsForTopArtist = (rows) =>
  rows.map((r) => ({
    name: r.song_name,
    song_id: r.song_id,
    youtube_views: r.views ?? 0,
    total_views: r.views ?? 0,
    audio_file_url: r.audio_url,
    featuring_artists: [],
    overall_status: "approved",
  }));

module.exports = {
  isSpecialArtistProfile,
  fetchSpecialArtistPublicSongRows,
  formatSpecialArtistSongsForHome,
  formatSpecialArtistSongsForTopArtist,
};

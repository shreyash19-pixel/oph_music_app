const db = require("../DB/connect");

const getSpecialArtistDetails = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT 
    ud.full_name,
    p.status AS payment_status,
    ud.artist_story_video,
    pd.photo_urls,
    ud.stage_name,
    pd.video_url,
    ud.personal_photo,
    pd.profession,
    ud.location,
    pd.bio,
    pd.facebook_link,
    pd.instagram_link,
    pd.apple_music_link,
    pd.spotify_link,
    sps.song_id,
    sps.song_name,
    sps.song_type,
    sps.audio_url,
    sps.views,
    sps.status AS song_status
FROM user_details ud
LEFT JOIN professional_details pd 
    ON ud.oph_id = pd.oph_id
LEFT JOIN special_artist_songs sps 
    ON ud.oph_id = sps.oph_id
LEFT JOIN (
    SELECT *
    FROM (
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
) p 
    ON p.ref_song_id = sps.song_id
WHERE ud.oph_id = ?;`,
    [ophid, ophid],
  );

  const [song_count] = await db.execute(
    `SELECT 
    sas.oph_id,
    COUNT(DISTINCT sas.song_id) AS total_content
FROM special_artist_songs sas
LEFT JOIN payments p 
    ON sas.song_id = p.song_id
    AND p.oph_id = ?
WHERE sas.oph_id = ?
AND (
        -- Free songs → only song approved
        (sas.song_type = 'free' AND sas.status = 'approved')

        OR

        -- Paid songs → both must be approved
        (sas.song_type = 'paid' 
         AND sas.status = 'approved'
         AND p.status = 'approved')
    )
GROUP BY sas.oph_id;`,
    [ophid,ophid],
  );

  const songMap = {};

  rows.forEach((row) => {
    if (!songMap[ophid]) {
      songMap[ophid] = {
        name: row.full_name,
        artist_story_video: row.artist_story_video,
        photos: JSON.parse(row.photo_urls),
        stage_name: row.stage_name,
        video_bio: row.video_url,
        personal_photo: row.personal_photo,
        profession: row.profession,
        location: row.location,
        total_content: song_count.length > 0 ? song_count[0].total_content : 0,
        // total_views: row.total_views,
        bio: row.bio,
        facebook_url: row.facebook_link,
        instagram_url: row.instagram_link,
        apple_url: row.apple_music_link,
        spotify_url: row.spotify_link,
        songs: [
          {
            id: row.song_id,
            song_name: row.song_name,
            song_type: row.song_type,
            primary_artist: row.full_name,
            total_song_views: row.views,
            audio_url: row.audio_url,
            song_status: row.song_status,
            payment_status: row.payment_status,
          },
        ],
      };
    } else {
      songMap[ophid].songs.push({
        id: row.song_id,
        song_name: row.song_name,
        song_type: row.song_type,
        primary_artist: row.full_name,
        total_song_views: row.views,
        audio_url: row.audio_url,
        song_status: row.song_status,
        payment_status: row.payment_status,
      });
    }
  });

  console.log(songMap[ophid]);

  return songMap[ophid];
};

module.exports = { getSpecialArtistDetails };

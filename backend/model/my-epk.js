const db = require("../DB/connect");

const getSpecialArtistDetails = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT ud.full_name, sp.Status AS payment_status, ud.artist_story_video, pd.photo_urls, ud.stage_name, pd.video_url, ud.personal_photo, pd.profession, ud.location, pd.bio, pd.facebook_link, pd.instagram_link, pd.apple_music_link, pd.spotify_link, sps.song_id, sps.song_name, sps.audio_url, sps.views, sps.status FROM user_details ud LEFT JOIN professional_details pd on ud.oph_id = pd.OPH_ID LEFT JOIN special_artist_songs sps ON ud.oph_id = sps.oph_id LEFT JOIN payments sp ON sps.song_id = sp.song_id WHERE ud.oph_id = ?",
    [ophid]
  );

  const [song_count] = await db.execute(
    "SELECT oph_id, COUNT(oph_id) FROM special_artist_songs WHERE oph_id = ? AND `status` = 'approved' GROUP BY oph_id",
    [ophid]
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
        bio: row.Bio,
        facebook_url: row.facebook_link,
        instagram_url: row.instagram_link,
        apple_url: row.apple_music_link,
        spotify_url : row.spotify_link,
        songs: [
          {
            id: row.song_id,
            song_name: row.song_name,
            primary_artist: row.full_name,
            total_song_views: row.views,
            audio_url: row.audio_url,
            song_status: row.status,
            payment_status: row.payment_status,
          },
        ],
      };
    } else {
      songMap[ophid].songs.push({
        id: row.song_id,
        song_name: row.song_name,
        primary_artist: row.full_name,
        total_song_views: row.views,
        audio_url: row.audio_url,
        song_status: row.status,
        payment_status: row.payment_status,
      });
    }
  });

  console.log(songMap[ophid]);

  return songMap[ophid];
};

module.exports = { getSpecialArtistDetails };

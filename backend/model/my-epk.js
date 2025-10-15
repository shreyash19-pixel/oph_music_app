const db = require("../DB/connect");

const getSpecialArtistDetails = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT ud.full_name, pd.PhotoURLs, ud.stage_name, pd.VideoURL, ud.personal_photo, pd.Profession, ud.location, pd.Bio, pd.FacebookLink, pd.InstagramLink, sps.song_name, sps.audio_url, sps.views, sps.status FROM user_details ud LEFT JOIN professional_details pd on ud.ophid = pd.OPH_ID LEFT JOIN special_artist_songs sps ON ud.ophid = sps.ophid WHERE ud.ophid = ?",
    [ophid]
  );

  const [song_count] = await db.execute(
    "SELECT ophid, COUNT(ophid) FROM special_artist_songs WHERE ophid = ? AND `status` = 'approved' GROUP BY ophid",
    [ophid]
  );

  const songMap = {};

  rows.forEach((row) => {
    if (!songMap[ophid]) {
      songMap[ophid] = {
        name: row.full_name,
        photos: JSON.parse(row.PhotoURLs),
        stage_name: row.stage_name,
        video_bio: row.VideoURL,
        personal_photo: row.personal_photo,
        profession: row.Profession,
        location: row.location,
        total_content: song_count.length > 0 ? song_count[0].total_content : 0,
        // total_views: row.total_views,
        bio: row.Bio,
        facebook_url: row.FacebookLink,
        instagram_url: row.InstagramLink,
        songs: [
          {
            song_name: row.song_name,
            primary_artist: row.full_name,
            total_song_views: row.views,
            audio_file_url: row.audio_url,
            song_status: row.status,
          },
        ],
      };
    } else {
      songMap[ophid].songs.push({
        song_name: row.song_name,
        primary_artist: row.full_name,
        total_song_views: row.views,
        audio_file_url: row.audio_url,
         song_status: row.status,
      });
    }
  });


  console.log(songMap[ophid]);
  

  return songMap[ophid];
};

module.exports = { getSpecialArtistDetails };

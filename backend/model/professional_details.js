const db = require("../DB/connect");

/**
 * Professional Details model - Database operations only
 * Uses standardized column names: oph_id, snake_case for all fields
 */
const insertProfessionalDetails = async (
  ophId,
  profession,
  bio,
  videoUrl,
  photoUrls,
  spotifyLink,
  instagramLink,
  facebookLink,
  appleMusicLink,
  experienceYearly,
  experienceMonthly,
  songsPlanningCount,
  songsPlanningType,
  connection = null
) => {
  // Use provided connection if available (for transactions), otherwise use pool
  const query = connection || db;
  const [result] = await query.execute(
    `INSERT INTO professional_details (
      oph_id,
      profession,
      bio,
      video_url,
      photo_urls,
      spotify_link,
      instagram_link,
      facebook_link,
      apple_music_link,
      experience_yearly,
      experience_monthly,
      songs_planning_count,
      songs_planning_type,
      step_status,
      reject_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      profession = VALUES(profession),
      bio = VALUES(bio),
      video_url = VALUES(video_url),
      photo_urls = VALUES(photo_urls),
      spotify_link = VALUES(spotify_link),
      instagram_link = VALUES(instagram_link),
      facebook_link = VALUES(facebook_link),
      apple_music_link = VALUES(apple_music_link),
      experience_yearly = VALUES(experience_yearly),
      experience_monthly = VALUES(experience_monthly),
      songs_planning_count = VALUES(songs_planning_count),
      songs_planning_type = VALUES(songs_planning_type),
      step_status = VALUES(step_status),
      reject_reason = VALUES(reject_reason),
      updated_at = NOW()`
    ,
    [
      ophId,
      profession,
      bio,
      videoUrl,
      photoUrls,
      spotifyLink,
      instagramLink,
      facebookLink,
      appleMusicLink,
      experienceYearly,
      experienceMonthly,
      songsPlanningCount,
      songsPlanningType,
      'under review', // step_status
      null             // reject_reason
    ]
  );

  return result;
};


// const insertProfessionalDetails = async (
//   OPH_ID,
//   Profession,
//   Bio,
//   VideoURL,
//   PhotoURLs,
//   SpotifyLink,
//   InstagramLink,
//   FacebookLink,
//   AppleMusicLink,
//   ExperienceYearly,
//   ExperienceMonthly,
//   SongsPlanningCount,
//   SongsPlanningType
// ) => {
//   const [result] = await db.execute(
//     `INSERT INTO professional_details (
//       OPH_ID,
//       Profession,
//       Bio,
//       VideoURL,
//       PhotoURLs,
//       SpotifyLink,
//       InstagramLink,
//       FacebookLink,
//       AppleMusicLink,
//       ExperienceYearly,
//       ExperienceMonthly,
//       SongsPlanningCount,
//       SongsPlanningType
      
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       OPH_ID,
//       Profession,
//       Bio,
//       VideoURL,
//       PhotoURLs,
//       SpotifyLink,
//       InstagramLink,
//       FacebookLink,
//       AppleMusicLink,
//       ExperienceYearly,
//       ExperienceMonthly,
//       SongsPlanningCount,
//       SongsPlanningType,
//     ]
//   );

//   return result;
// };

// const updateProfessionalDetails = async (
//   OPH_ID,
//   Profession,
//   Bio,
//   VideoURL,
//   PhotoURLs,
//   SpotifyLink,
//   InstagramLink,
//   FacebookLink,
//   AppleMusicLink,
//   ExperienceYearly,
//   ExperienceMonthly,
//   SongsPlanningCount,
//   SongsPlanningType,

// ) => {
//   const [result] = await db.execute(
//     "UPDATE professional_details SET Profession = ?,Bio = ?,VideoURL= ?,PhotoURLs= ?,SpotifyLink= ?,InstagramLink= ?,FacebookLink= ?,AppleMusicLink= ?,ExperienceYearly= ?,ExperienceMonthly= ?,SongsPlanningCount= ?,SongsPlanningType= ?,step_status= ?, reject_reason = ? WHERE OPH_ID = ?",
      
//       [
//       Profession,
//       Bio,
//       VideoURL,
//       PhotoURLs,
//       SpotifyLink,
//       InstagramLink,
//       FacebookLink,
//       AppleMusicLink,
//       ExperienceYearly,
//       ExperienceMonthly,
//       SongsPlanningCount,
//       SongsPlanningType,
//       'under review',
//       null,
//       OPH_ID,
//     ]
//   );

//   return result;
// };

const getProfessionalByOphId = async (ophId) => {
    // Note: Uses standardized column names: oph_id, snake_case for all fields
    // Map snake_case DB columns to PascalCase for backward compatibility with frontend
    const [rows] = await db.execute(
      `SELECT 
        ud.oph_id as ophid,
        pd.profession as Profession,
        pd.bio as Bio,
        pd.video_url as VideoURL,
        pd.photo_urls as PhotoURLs,
        pd.spotify_link as SpotifyLink,
        pd.instagram_link as InstagramLink,
        pd.facebook_link as FacebookLink,
        pd.apple_music_link as AppleMusicLink,
        pd.experience_yearly as ExperienceYearly,
        pd.experience_monthly as ExperienceMonthly,
        pd.songs_planning_count as SongsPlanningCount,
        pd.songs_planning_type as SongsPlanningType,
        pd.reject_reason as reject_reason,
        pd.step_status as step_status
      FROM user_details ud 
      LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id 
      WHERE ud.oph_id = ?`,
      [ophId]
    );

    return rows;
};

const getProfessionalDetails = async (ophId) => {
  // Note: Uses standardized column name: oph_id (not ophid)
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ?",
    [ophId]
  );

  return rows;
};

module.exports = {
  insertProfessionalDetails,
  getProfessionalDetails,
  getProfessionalByOphId,
  // updateProfessionalDetails
};

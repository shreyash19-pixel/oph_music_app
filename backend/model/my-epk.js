
const db = require("../DB/connect")


const getSpecialArtistDetails = async (ophid) => {

    const [rows] = await db.execute("SELECT ud.full_name, pd.PhotoURLs, ud.stage_name, pd.VideoURL, ud.personal_photo, pd.Profession, ud.location, pd.Bio, pd.FacebookLink, pd.InstagramLink, sr.Song_name, ad.primary_artist,kpi.total_views, kpi.avg_view_duration, ad.audio_url FROM user_details ud LEFT JOIN professional_details pd on ud.ophid = pd.OPH_ID LEFT JOIN KPI_score kpi ON ud.ophid = kpi.OPH_ID LEFT JOIN songs_register sr ON ud.ophid = sr.OPH_ID LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id WHERE ud.ophid = ?", [ophid])

    const [song_count] = await db.execute("SELECT OPH_ID, COUNT(OPH_ID) total_content FROM songs_register WHERE OPH_ID = ? GROUP BY OPH_ID", [ophid])
   

    const songMap = {}

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
                total_content: song_count.length > 0 ? song_count[0].total_content : 0 ,
                total_views: row.total_views,
                bio: row.Bio,
                facebook_url: row.FacebookLink,
                instagram_url: row.InstagramLink,
                songs: [{
                    song_name: row.Song_name,
                    primary_artist: row.primary_artist,
                    total_song_views: row.total_views,
                    duration_in_minutes: row.avg_view_duration,
                    audio_file_url: row.audio_url
                }]
            }
        }
        else {
            songMap[ophid].songs.push({
                song_name: row.Song_name,
                primary_artist: row.primary_artist,
                total_song_views: row.total_views,
                duration_in_minutes: row.avg_view_duration,
                audio_file_url: row.audio_url
            })
        }


    })

    return songMap[ophid]

}

module.exports = { getSpecialArtistDetails }
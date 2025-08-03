

const db = require("../DB/connect")

const newReleases = async () => {

    const [rows] = await db.execute("WITH CTESongRankings AS (SELECT sr.song_id, vd.image_url, ad.Song_name, sa.artist_name, ssm.youtube_views, ad.audio_url, ad.primary_artist, sr.`status` song_register_status, ad.`status` audio_details_status, vd.`status` video_details_status FROM song_social_metrics ssm LEFT JOIN songs_register sr ON ssm.song_id = sr.song_id LEFT JOIN audio_details ad ON ssm.song_id = ad.song_id LEFT JOIN video_details vd ON ssm.song_id = vd.song_id LEFT JOIN secondary_artist sa ON ssm.song_id = sa.song_id ORDER BY ssm.youtube_views DESC LIMIT 5) SELECT * FROM CTESongRankings WHERE song_register_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved' ")

    const songMap = {}

    rows.forEach((row) => {
        const songId = row.song_id

        if (!songMap[songId]) {

            songMap[songId] = {
                ophid: row.OPH_ID,
                songName: row.Song_name,
                primaryArtist: row.primary_artist,
                songId: row.song_id,
                imageUrl: JSON.parse(row.image_url),
                audioUrl: row.audio_url,
                youtubeViews: row.youtube_views,
                secondaryArtist: []
            }
        }

        if (row.artist_name) {
            songMap[songId].secondaryArtist.push(row.artist_name)
        }
        else {
            if (songMap[songId].secondaryArtist.length === 0) {
                songMap[songId].secondaryArtist.push(null)
            }
        }
    })

    return songMap

}

module.exports = { newReleases }
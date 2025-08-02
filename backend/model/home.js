

const db = require("../DB/connect")

const newReleases = async () => {

    const [rows] = await db.execute("SELECT sr.song_id, vd.image_url, ad.Song_name, sa.artist_name, ssm.youtube_views, ad.audio_url, ad.primary_artist FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id ORDER BY ssm.youtube_views DESC LIMIT 5")

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
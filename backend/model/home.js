

const db = require("../DB/connect")

const newReleases = async () => {

    const [rows] = await db.execute("WITH CTESongStatus AS (SELECT sr.OPH_ID, sr.Song_name, sr.song_id, sr.`status` AS song_register_status , ad.`status` AS audio_details_status, vd.`status` AS video_details_status, vd.image_url,ad.audio_url, sa.artist_name, ad.primary_artist FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id ) SELECT * FROM CTESongStatus WHERE song_register_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved'")

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
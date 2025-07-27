const db = require("../DB/connect")


const getArtistInfo = async (ophid) => {

    const [rows] = await db.execute("SELECT * FROM user_details WHERE ophid = ?",[ophid]);
    return rows

}

const getSongRankings = async () => {

    const [rows] = await db.execute("WITH CTESongStatus AS (SELECT sr.OPH_ID, sr.Song_name, sr.song_id, sr.`status` AS song_register_status , ad.`status` AS audio_details_status, vd.`status` AS video_details_status FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id ) SELECT * FROM CTESongStatus WHERE song_register_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved'")

    return rows

}

module.exports = {getArtistInfo, getSongRankings}
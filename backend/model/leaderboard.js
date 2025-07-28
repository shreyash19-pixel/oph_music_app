const db = require("../DB/connect")

const getLeaderBoardDetails = async () => {

    const [rows] = await db.execute(`WITH CTEUserSongs AS (SELECT ud.ophid, ud.stage_name, ud.personal_photo,ud.location, COUNT(sr.OPH_ID) total_songs FROM user_details ud LEFT JOIN 
    songs_register sr ON ud.ophid = sr.OPH_ID
    GROUP BY ud.ophid, ud.stage_name, ud.personal_photo,ud.location)
    SELECT * FROM CTEUserSongs WHERE total_songs > 0`)
    return rows

}


module.exports = {getLeaderBoardDetails}
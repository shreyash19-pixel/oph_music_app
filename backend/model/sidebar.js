const db = require("../DB/connect")


const getArtistType = async (ophid) => {
    // Use standardized column name: oph_id (not ophid)
    const [rows] = await db.execute("SELECT artist_type FROM user_details WHERE oph_id = ?", [ophid])
    return rows
}

module.exports = {getArtistType}
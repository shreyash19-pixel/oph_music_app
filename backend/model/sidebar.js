const db = require("../DB/connect")


const getArtistType = async (ophid) => {

    const [rows] = await db.execute("SELECT artist_type FROM user_details  WHERE ophid = ?", [ophid])

    return rows

}

module.exports = {getArtistType}
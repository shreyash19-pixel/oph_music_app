const db = require("../DB/connect")

const getLeaderBoardDetails = async () => {

    const [rows] = await db.execute("SELECT Song_name, primary_artist, audio_url FROM audio_details")
    return rows

}


module.exports = {getLeaderBoardDetails}
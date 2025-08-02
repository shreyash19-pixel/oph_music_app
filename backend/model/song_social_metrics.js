const db = require("../DB/connect")


const songSocialMetric = async (ophid, traffic_counter) => {

    const [rows] = await db.execute("UPDATE song_social_metrics SET traffic = ? WHERE OPH_ID = ?", [traffic_counter + 1, ophid])

    return rows

}

const getTrafficCounter = async (ophid) => {

    const [rows] = await db.execute("SELECT traffic FROM song_social_metrics WHERE OPH_ID = ?", [ophid])

    return rows

}

module.exports = {songSocialMetric, getTrafficCounter}
const db = require("../DB/connect")


const incrementTrafficCounter = async (ophid, traffic_counter) => {    
    const [rows] = await db.execute("UPDATE user_details SET traffic = ? WHERE oph_id = ?", [traffic_counter, ophid])

    return rows

}

const getTrafficCounter = async (ophid) => {

    const [rows] = await db.execute("SELECT traffic FROM user_details WHERE oph_id = ?", [ophid])

    return rows

}

module.exports = {incrementTrafficCounter, getTrafficCounter}
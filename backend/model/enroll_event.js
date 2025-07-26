const db = require("../DB/connect");


const enrollEvents = async (ophid, event_id) => {

    const [rows] = await db.execute("INSERT INTO events (ophid,event_id) VALUES (?,?)", [ophid, event_id])

    return rows
}

const getAllEvents = async () => {

    const [rows] = await db.execute("SELECT * FROM events")
    return rows 

}


module.exports = { enrollEvents, getAllEvents } 
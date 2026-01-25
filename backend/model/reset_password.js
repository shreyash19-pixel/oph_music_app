const db = require('../DB/connect'); // MySQL connection


const updatePassword = async (ophid, password) => {

    const [rows] = await db.execute("UPDATE user_details SET user_pass = ? WHERE ophid = ?" ,[password, ophid])
    return rows
}

const checkExistingEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM user_details WHERE email = ?", [email])
    return rows
}


module.exports = {updatePassword, checkExistingEmail}

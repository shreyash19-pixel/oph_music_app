const db = require('../DB/connect'); // MySQL connection


const checkExistingEmail = async (email) => {

    const [rows] = await db.execute( "SELECT * FROM user_details WHERE email = ?" ,[email])
    return rows
}



module.exports = {checkExistingEmail}
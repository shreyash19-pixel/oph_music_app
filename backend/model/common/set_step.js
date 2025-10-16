
const db = require("../../DB/connect")


const setCurrentStep = async (step,ophid) => {
    console.log(step, ophid);
    
    const [rows] = await db.execute("UPDATE user_details SET current_step = ? WHERE ophid = ?", [step, ophid])
    return rows
}


module.exports = {setCurrentStep}
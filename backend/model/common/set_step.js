const db = require("../../DB/connect");

/**
 * Set current step for user
 * Uses standardized column name: oph_id (not ophid)
 * Note: The column name in the database is step_status (not current_step)
 */
const setCurrentStep = async (step, ophId) => {
    console.log(step, ophId);
    
    const [rows] = await db.execute(
        "UPDATE user_details SET step_status = ? WHERE oph_id = ?", 
        [step, ophId]
    );
    return rows;
};

module.exports = { setCurrentStep };
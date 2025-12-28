const db = require("../../DB/connect");

/**
 * Set current step for user
 * Uses standardized column name: oph_id (not ophid)
 * Updates current_step column (NOT step_status)
 */
const setCurrentStep = async (step, ophId) => {
    console.log("[setCurrentStep] Setting current_step to:", step, "for OPH_ID:", ophId);
    
    const [rows] = await db.execute(
        "UPDATE user_details SET current_step = ? WHERE oph_id = ?", 
        [step, ophId]
    );
    
    console.log("[setCurrentStep] Update result - affectedRows:", rows.affectedRows);
    return rows;
};

module.exports = { setCurrentStep };
const db = require("../DB/connect");

/**
 * Personal Details model - Database operations only
 * Uses standardized column names: oph_id (not ophid)
 */

const setPersonalDetails = async (
  ophId,
  legal_name,
  stage_name,
  contact_number,
  storageLocation,
  location,
  email,
  connection = null
) => {
  // Use provided connection if available (for transactions), otherwise use pool
  const query = connection || db;
  console.log("[setPersonalDetails] Updating user_details for OPH_ID:", ophId);
  console.log("[setPersonalDetails] Setting step_status to 'under review'");
  console.log("[setPersonalDetails] Parameters:", {
    legal_name,
    stage_name,
    email,
    contact_number: contact_number?.substring(0, 3) + '***',
    storageLocation: storageLocation ? 'provided' : 'null',
    location,
    step_status: 'under review',
    reject_reason: null,
    ophId
  });
  
  // First, check current step_status
  const [currentRows] = await query.execute(
    "SELECT step_status FROM user_details WHERE oph_id = ?",
    [ophId]
  );
  console.log("[setPersonalDetails] Current step_status before update:", currentRows[0]?.step_status);
  
  const [rows] = await query.execute(
    "UPDATE user_details SET full_name = ?, stage_name = ?, email = ?, contact_number = ?, personal_photo = ?, location = ?, step_status = ?, reject_reason = ?, updated_at = NOW() WHERE oph_id = ?",
    [legal_name, stage_name, email, contact_number, storageLocation, location, 'under review', null, ophId]
  );
  
  console.log("[setPersonalDetails] Update result - affectedRows:", rows.affectedRows);
  console.log("[setPersonalDetails] Update result - changedRows:", rows.changedRows);
  console.log("[setPersonalDetails] Update result - info:", rows.info);
  
  // Verify the update was applied
  const [verifyRows] = await query.execute(
    "SELECT step_status FROM user_details WHERE oph_id = ?",
    [ophId]
  );
  console.log("[setPersonalDetails] Verified step_status after update:", verifyRows[0]?.step_status);
  
  if (verifyRows[0]?.step_status !== 'under review') {
    console.error("[setPersonalDetails] ERROR: step_status was not set to 'under review'! Current value:", verifyRows[0]?.step_status);
  }
  
  return rows;
};

const getPersonalDetails = async (ophId) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ?",
    [ophId]
  );

  return rows;
};

const getFullPersonalDetails = async (ophId) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_details WHERE oph_id = ?",
    [ophId]
  );

  return rows;
};

const getFullPersonal = async () => {
  const [rows] = await db.execute("SELECT * FROM user_details;");

  // If you want to return as JSON explicitly (usually it already is an array of objects)
  return rows;
};


module.exports = { setPersonalDetails, getPersonalDetails ,getFullPersonalDetails,getFullPersonal};

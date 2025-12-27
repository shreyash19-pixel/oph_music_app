const db = require("../DB/connect");

/**
 * Personal Details model - Database operations only
 * Uses standardized column names: oph_id (not ophid)
 */

const setPersonalDetails = async (
  ophId,
  legal_name,
  stage_name,
  contact_num,
  storageLocation,
  location,
  email
) => {
  const [rows] = await db.execute(
    "UPDATE user_details SET full_name = ?, stage_name = ?, email = ?, contact_num = ?, personal_photo = ?, location = ?, step_status = ?, reject_reason = ? WHERE oph_id = ?",
    [legal_name, stage_name, email, contact_num, storageLocation, location, 'under review', null, ophId]
  );
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

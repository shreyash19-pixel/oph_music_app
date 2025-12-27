const db = require('../DB/connect');

/**
 * User model - Database operations only
 * Uses standardized column names: oph_id (not ophid)
 */

const createUser = async (connection, ophId, name, stageName, email, contactNumber, password, artistType, stepStatus) => {
  const [result] = await connection.execute(
    'INSERT INTO user_details (oph_id, full_name, stage_name, email, contact_num, user_pass, artist_type, step_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [ophId, name, stageName, email, contactNumber, password, artistType, stepStatus]
  );
  return result;
};

const getEmailAndNumber = async (connection, email, contactNumber) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_details WHERE email = ? OR contact_num = ?',
    [email, contactNumber]
  );
  return rows;
};

const getUsersByArtistType = async (connection, artistType) => {
  const [rows] = await connection.execute(
    'SELECT oph_id FROM user_details WHERE artist_type = ?',
    [artistType]
  );
  return rows;
};

const findUserByEmail = async (connection, email) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_details WHERE email = ?',
    [email]
  );
  return rows;
};

const findUserByOphId = async (connection, ophId) => {
  const [rows] = await connection.execute(
    'SELECT * FROM user_details WHERE oph_id = ?',
    [ophId]
  );
  return rows;
};

const updateStepStatus = async (connection, ophId, stepStatus) => {
  const [rows] = await connection.execute(
    'UPDATE user_details SET step_status = ?, updated_at = NOW() WHERE oph_id = ?',
    [stepStatus, ophId]
  );
  return rows;
};

module.exports = {
  createUser,
  getEmailAndNumber,
  getUsersByArtistType,
  findUserByEmail,
  findUserByOphId,
  updateStepStatus
};





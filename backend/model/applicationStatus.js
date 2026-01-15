const db = require('../DB/connect');

/**
 * Application Status model - Database operations only
 * Uses standardized column names: oph_id (not OPH_ID)
 */

const getApplicationStatus = async (connection, ophId) => {
  const [rows] = await connection.execute(
    'SELECT * FROM application_status WHERE oph_id = ?',
    [ophId]
  );
  return rows;
};

const createApplicationStatus = async (connection, ophId) => {
  const [result] = await connection.execute(
    `INSERT INTO application_status 
     (oph_id, user_status, professional_status, documentation_status, payment_status, overall_status) 
     VALUES (?, 'pending', 'pending', 'pending', 'pending', 'pending')`,
    [ophId]
  );
  return result;
};

const updateApplicationStatus = async (connection, ophId, statusUpdates) => {
  const fields = [];
  const values = [];

  if (statusUpdates.user_status !== undefined) {
    fields.push('user_status = ?');
    values.push(statusUpdates.user_status);
  }
  if (statusUpdates.professional_status !== undefined) {
    fields.push('professional_status = ?');
    values.push(statusUpdates.professional_status);
  }
  if (statusUpdates.documentation_status !== undefined) {
    fields.push('documentation_status = ?');
    values.push(statusUpdates.documentation_status);
  }
  if (statusUpdates.payment_status !== undefined) {
    fields.push('payment_status = ?');
    values.push(statusUpdates.payment_status);
  }
  if (statusUpdates.overall_status !== undefined) {
    fields.push('overall_status = ?');
    values.push(statusUpdates.overall_status);
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push('updated_at = NOW()');
  values.push(ophId);

  const [result] = await connection.execute(
    `UPDATE application_status SET ${fields.join(', ')} WHERE oph_id = ?`,
    values
  );

  return result;
};

module.exports = {
  getApplicationStatus,
  createApplicationStatus,
  updateApplicationStatus
};





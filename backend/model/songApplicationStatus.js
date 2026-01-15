const db = require('../DB/connect');

/**
 * Song Application Status model - Database operations only
 * Tracks status of song applications (audio, video, payment)
 */

const getSongApplicationStatus = async (connection, songId) => {
  const [rows] = await connection.execute(
    'SELECT * FROM song_application_status WHERE song_id = ?',
    [songId]
  );
  return rows;
};

const createSongApplicationStatus = async (connection, ophId, songId, songName) => {
  const [result] = await connection.execute(
    `INSERT INTO song_application_status 
     (oph_id, song_id, song_name, status_audio, status_video, status_payment, overall_status) 
     VALUES (?, ?, ?, 'pending', 'pending', 'pending', 'pending')`,
    [ophId, songId, songName]
  );
  return result;
};

const updateSongApplicationStatus = async (connection, songId, statusUpdates) => {
  const fields = [];
  const values = [];

  if (statusUpdates.status_audio !== undefined) {
    fields.push('status_audio = ?');
    values.push(statusUpdates.status_audio);
  }
  if (statusUpdates.status_video !== undefined) {
    fields.push('status_video = ?');
    values.push(statusUpdates.status_video);
  }
  if (statusUpdates.status_payment !== undefined) {
    fields.push('status_payment = ?');
    values.push(statusUpdates.status_payment);
  }
  if (statusUpdates.overall_status !== undefined) {
    fields.push('overall_status = ?');
    values.push(statusUpdates.overall_status);
  }
  if (statusUpdates.song_name !== undefined) {
    fields.push('song_name = ?');
    values.push(statusUpdates.song_name);
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push('updated_at = NOW()');
  values.push(songId);

  const [result] = await connection.execute(
    `UPDATE song_application_status SET ${fields.join(', ')} WHERE song_id = ?`,
    values
  );

  return result;
};

module.exports = {
  getSongApplicationStatus,
  createSongApplicationStatus,
  updateSongApplicationStatus
};



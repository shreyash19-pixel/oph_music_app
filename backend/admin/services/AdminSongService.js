const db = require('../../DB/connect');

class AdminSongService {
  /**
   * Update audio or video section status
   * Handles application logic for updating section status and recalculating song status
   * 
   * @param {string} songId - Song ID
   * @param {string} ophId - User's OPH ID
   * @param {string} section - "Audio" or "Video"
   * @param {string} status - "approved", "rejected", "under review"
   * @param {string|null} rejectReason - Rejection reason if rejected
   */
  async updateSectionStatus(songId, ophId, section, status, rejectReason = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Normalize status
      const normalizedStatus = this.normalizeStatus(status);
      const table = section === "Audio" ? "audio_details" : "video_details";

      // Update the section status
      let query = `UPDATE ${table} SET status = ?, reject_reason = ?, updated_at = NOW() WHERE song_id = ?`;
      const values = [normalizedStatus, rejectReason || null, songId];

      if (table === "audio_details" && ophId) {
        query += ` AND oph_id = ?`;
        values.push(ophId);
      }

      const [result] = await connection.query(query, values);

      if (result.affectedRows === 0) {
        throw new Error('No matching record found');
      }

      // Recalculate and update overall song status
      await this.recalculateSongStatus(connection, songId, ophId, rejectReason);

      await connection.commit();

      return {
        success: true,
        affectedRows: result.affectedRows
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Recalculate song status based on audio, video, and payment statuses
   * This replaces the stored procedure logic
   * 
   * @param {object} connection - Database connection
   * @param {string} songId - Song ID
   * @param {string} ophId - User's OPH ID
   * @param {string|null} rejectReason - Rejection reason if any component is rejected
   */
  async recalculateSongStatus(connection, songId, ophId, rejectReason = null) {
    // Get current statuses of all components
    const [components] = await connection.query(
      `SELECT 
        ad.status as audio_status,
        ad.reject_reason as audio_reject_reason,
        vd.status as video_status,
        vd.reject_reason as video_reject_reason,
        p.status as payment_status,
        p.reject_reason as payment_reject_reason
      FROM songs_register sr
      LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
      LEFT JOIN video_details vd ON sr.song_id = vd.song_id
      LEFT JOIN payments p ON sr.song_id = p.song_id AND (p.from_source = 'Song Registration' OR p.from_source = 'Special artist song registration')
      WHERE sr.song_id = ? AND sr.oph_id = ?
      LIMIT 1`,
      [songId, ophId]
    );

    if (components.length === 0) {
      throw new Error('Song not found');
    }

    const component = components[0];
    const audioStatus = component.audio_status;
    const videoStatus = component.video_status;
    const paymentStatus = component.payment_status;

    // Determine overall song status
    let overallStatus = 'Pending';
    let finalRejectReason = null;

    // Check if any component is rejected
    if (audioStatus === 'rejected') {
      overallStatus = 'Rejected';
      finalRejectReason = component.audio_reject_reason || rejectReason;
    } else if (videoStatus === 'rejected') {
      overallStatus = 'Rejected';
      finalRejectReason = component.video_reject_reason || rejectReason;
    } else if (paymentStatus === 'rejected') {
      overallStatus = 'Rejected';
      finalRejectReason = component.payment_reject_reason || rejectReason;
    }
    // Check if any component is under review
    else if (audioStatus === 'under review' || videoStatus === 'under review' || paymentStatus === 'under review') {
      overallStatus = 'Under Review';
    }
    // Check if any component is missing (draft state)
    else if (!audioStatus || !videoStatus || !paymentStatus) {
      overallStatus = 'Draft';
    }
    // All components approved
    else if (audioStatus === 'approved' && videoStatus === 'approved' && paymentStatus === 'approved') {
      overallStatus = 'Approved';
    }

    // Update songs_register table
    await connection.query(
      `UPDATE songs_register 
       SET status = ?, reject_reason = ?, updated_at = NOW() 
       WHERE song_id = ? AND oph_id = ?`,
      [overallStatus, finalRejectReason, songId, ophId]
    );

    console.log(`✅ Updated song status: ${songId} -> ${overallStatus}`);
  }

  /**
   * Normalize status values to database format
   * 
   * @param {string} status - Status from request
   * @returns {string} Normalized status
   */
  normalizeStatus(status) {
    const statusLower = String(status || "").toLowerCase();
    if (statusLower === "accepted" || statusLower === "approved") {
      return "approved";
    } else if (statusLower === "rejected") {
      return "rejected";
    } else if (statusLower === "under review" || statusLower === "under_review") {
      return "under review";
    }
    return "pending";
  }
}

module.exports = new AdminSongService();


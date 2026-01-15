const db = require('../../DB/connect');
const SongApplicationStatusService = require('../../services/song/SongApplicationStatusService');

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

      // Update song_application_status table
      const step = section === "Audio" ? "audio" : "video";
      await SongApplicationStatusService.updateStepStatus(
        connection,
        songId,
        step,
        normalizedStatus
      );

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
    // Use SongApplicationStatusService to recalculate overall_status
    // This ensures consistency - all status logic is centralized
    const SongApplicationStatusService = require('../../services/song/SongApplicationStatusService');
    
    // Recalculate overall_status based on individual step statuses in song_application_status
    await SongApplicationStatusService.recalculateOverallStatus(connection, songId);
    
    // Optionally update reject_reason in songs_register for backward compatibility
    // Get rejection reasons from individual tables
    const [components] = await connection.query(
      `SELECT 
        ad.reject_reason as audio_reject_reason,
        vd.reject_reason as video_reject_reason,
        p.reject_reason as payment_reject_reason
      FROM songs_register sr
      LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
      LEFT JOIN video_details vd ON sr.song_id = vd.song_id
      LEFT JOIN payments p ON sr.song_id = p.song_id 
        AND (p.from_source = 'Song Registration' OR p.from_source = 'Song Repayment' OR p.from_source = 'Special artist song registration')
      WHERE sr.song_id = ? AND sr.oph_id = ?
      LIMIT 1`,
      [songId, ophId]
    );

    if (components.length > 0) {
      const component = components[0];
      const finalRejectReason = component.audio_reject_reason || 
                                component.video_reject_reason || 
                                component.payment_reject_reason || 
                                rejectReason;
      
      if (finalRejectReason) {
        await connection.query(
          `UPDATE songs_register 
           SET reject_reason = ?, updated_at = NOW() 
           WHERE song_id = ? AND oph_id = ?`,
          [finalRejectReason, songId, ophId]
        );
      }
    }

    // Get the updated overall_status for logging
    const songStatus = await SongApplicationStatusService.getSongApplicationStatus(connection, songId);
    console.log(`✅ Recalculated song_application_status.overall_status: ${songId} -> ${songStatus?.overall_status || 'N/A'}`);
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


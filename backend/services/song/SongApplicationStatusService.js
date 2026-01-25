const db = require("../../DB/connect");
const songApplicationStatusModel = require("../../model/songApplicationStatus");

class SongApplicationStatusService {
  /**
   * Initialize song_application_status record for new song
   */
  async initializeSongApplicationStatus(connection, ophId, songId, songName) {
    try {
      await songApplicationStatusModel.createSongApplicationStatus(
        connection,
        ophId,
        songId,
        songName,
      );
    } catch (error) {
      // If record already exists, that's okay
      if (error.code !== "ER_DUP_ENTRY") {
        throw error;
      }
    }
  }

  /**
   * Get song application status for a song
   */
  async getSongApplicationStatus(connection, songId) {
    const rows = await songApplicationStatusModel.getSongApplicationStatus(
      connection,
      songId,
    );
    return rows[0] || null;
  }

  /**
   * Update individual step status (audio, video, payment)
   */
  async updateStepStatus(
    connection,
    songId,
    step,
    status,
    rejectReason = null,
  ) {
    const statusField = `status_${step}`;
    const updates = { [statusField]: status };

    console.log(statusField + " update");

    await songApplicationStatusModel.updateSongApplicationStatus(
      connection,
      songId,
      updates,
    );

    // Recalculate overall status after updating individual status
    await this.recalculateOverallStatus(connection, songId);
  }

  /**
   * Recalculate overall status based on individual statuses
   */
  async recalculateOverallStatus(connection, songId) {
    const status = await this.getSongApplicationStatus(connection, songId);

    if (!status) {
      return;
    }

    const { status_audio, status_video, status_payment } = status;

    let overallStatus = "pending";

    // Priority 1: If any status is "rejected", overall is "rejected"
    if (
      status_audio === "rejected" ||
      status_video === "rejected" ||
      status_payment === "rejected"
    ) {
      overallStatus = "rejected";
    }
    // Priority 2: If any status is "under review", overall is "under review"
    else if (
      status_audio === "under review" &&
      status_video === "under review" &&
      status_payment === "under review"
    ) {
      overallStatus = "under review";
    }
    // Priority 3: If all statuses are "approved", overall is "approved"
    else if (
      status_audio === "approved" &&
      status_video === "approved" &&
      status_payment === "approved"
    ) {
      overallStatus = "approved";
    }
    // Priority 4: If any status is missing/null or "pending", overall is "draft" (for UI display)
    // This means user hasn't completed all steps yet
    else if (
      !status_audio ||
      !status_video ||
      !status_payment ||
      status_audio === "pending" ||
      status_video === "pending" ||
      status_payment === "pending"
    ) {
      overallStatus = "pending";
    }
    // Otherwise, it's "pending" (shouldn't normally happen)
    else {
      overallStatus = "pending";
    }

    await songApplicationStatusModel.updateSongApplicationStatus(
      connection,
      songId,
      {
        overall_status: overallStatus,
      },
    );

    await this.insertSongReleaseDetails(connection, songId);
  }

  async insertSongReleaseDetails(connection, songId) {
    const status = await this.getSongApplicationStatus(connection, songId);

    if (!status) {
      return;
    }

    const {
      oph_id,
      song_id,
      song_name,
      status_audio,
      status_video,
      status_payment,
    } = status;

    const primaryArtist = await songApplicationStatusModel.getPrimaryArtist(
      connection,
      oph_id,
    );
    console.log(primaryArtist);

    const { full_name } = primaryArtist[0];

    const secondaryArtistRows =
      await songApplicationStatusModel.getSecondaryArtist(connection, song_id);

    // extract artist_name and join with comma
    const secondaryArtists =
      secondaryArtistRows.length > 0
        ? secondaryArtistRows.map((r) => r.artist_name).join(",")
        : null;

    console.log(full_name + " " + secondaryArtists);

    if (
      status_audio === "approved" &&
      status_video === "approved" &&
      status_payment === "approved"
    ) {
      // Prepare song data for handlers
      const songData = {
        oph_id,
        song_id: song_id,
        song_name,
        primary_artist: full_name,
        secondary_artists: secondaryArtists,
      };

      // Process all registered handlers for approved songs
      await this.processApprovedSongHandlers(connection, songData);
    }
  }

  /**
   * Registry of handlers for approved songs
   * Each handler is a function that receives (connection, songData) and inserts into its table
   * Add new handlers here for future tables
   */
  async processApprovedSongHandlers(connection, songData) {
    const handlers = [
      this.insertSongSocialMetrics.bind(this),
      this.updateSongRelease.bind(this),
      // Add more handlers here in the future:
      // this.insertSongAnalytics.bind(this),
      // this.insertSongRevenue.bind(this),
    ];

    // Execute all handlers sequentially (use Promise.all for parallel if needed)
    for (const handler of handlers) {
      try {
        await handler(connection, songData);
      } catch (error) {
        // Log error but continue with other handlers
        console.error(
          `Error in approved song handler ${handler.name}:`,
          error.message,
        );
        // Optionally: throw error to stop all handlers, or continue with others
        // For now, we continue with other handlers even if one fails
      }
    }
  }

  /**
   * Handler: Insert song details into song_social_metrics table
   * This initializes the social metrics record when song is fully approved
   */
  async insertSongSocialMetrics(connection, songData) {
    const { oph_id, song_id, song_name } = songData;

    // Check if record already exists
    const [existing] = await connection.query(
      `SELECT id FROM song_social_metrics WHERE song_id = ?`,
      [song_id],
    );

    if (existing.length > 0) {
      // Record already exists, skip insertion
      console.log(`Song social metrics already exists for song_id: ${song_id}`);
      return;
    }

    // Insert new record with default/zero values
    await connection.query(
      `INSERT INTO song_social_metrics 
        (oph_id, song_name, song_id, youtube_views, youtube_avg_view_duration, insta_engagement, created_at, updated_at)
        VALUES (?, ?, ?, 0, '00:00:00', 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [oph_id, song_name, song_id],
    );

    console.log(`Song social metrics initialized for song_id: ${song_id}`);
  }

  async updateSongRelease(
    connection,
    songData
  )
   {

    const { oph_id, song_id, song_name, primary_artist, secondary_artists} = songData;
    
    await connection.execute(
      `INSERT INTO song_release (oph_id,songId, song_name, primary_artist,featuring_artist ) VALUES (?,?,?,?,?)`,
      [oph_id, song_id, song_name, primary_artist, secondary_artists],
    );

    console.log(`Song release initialized for song_id: ${song_id}`);
  }
}

module.exports = new SongApplicationStatusService();

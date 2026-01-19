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
      await songApplicationStatusModel.updateSongRelease(
        connection,
        oph_id,
        songId,
        song_name,
        full_name,
        secondaryArtists   
      );
    }
  }
}

module.exports = new SongApplicationStatusService();

const db = require("../../DB/connect");
const songApplicationStatusModel = require("../../model/songApplicationStatus");
const costingModel = require("../../admin/model/costing");

class SongApplicationStatusService {
  /**
   * For paid-in-advance: sync status_payment from existing Date Booking payment
   * when a song is registered. For paid-in-advance + lyrical, use recompute (both payments).
   */
  async syncStatusPaymentFromDateBooking(connection, ophId, songId, releaseDate) {
    const [srRows] = await connection.execute(
      "SELECT project_type, Lyrics_services FROM songs_register WHERE song_id = ? AND oph_id = ? LIMIT 1",
      [songId, ophId]
    );
    const sr = srRows?.[0];
    const isPaidAdvanceLyrical = sr?.project_type && String(sr.project_type).toLowerCase().includes("paid in advance")
      && (sr.Lyrics_services === true || sr.Lyrics_services === 1 || sr.Lyrics_services === "true");
    if (isPaidAdvanceLyrical) {
      await this.recomputePaymentStatusFromPayments(connection, songId, ophId);
      return;
    }
    if (!releaseDate) return;
    const dateStr = typeof releaseDate === "string"
      ? releaseDate.trim().slice(0, 10)
      : releaseDate instanceof Date
        ? releaseDate.toISOString().slice(0, 10)
        : null;
    if (!dateStr) return;
    const [rows] = await connection.execute(
      `SELECT status FROM payments
       WHERE oph_id = ? AND (release_date = ? OR DATE(release_date) = ?)
       AND (from_source = 'Date booking' OR from_source = 'Date Booking')
       AND (status IS NULL OR status != 'rejected')
       ORDER BY created_at DESC LIMIT 1`,
      [ophId, dateStr, dateStr]
    );
    if (rows.length > 0) {
      const paymentStatus = rows[0].status;
      const statusPayment = paymentStatus === "approved"
        ? "approved"
        : paymentStatus === "under review"
          ? "under review"
          : "pending";
      await this.updateStepStatus(connection, songId, "payment", statusPayment);
    }
  }

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
   * For paid-in-advance + lyrical: compute status_payment from BOTH Date Booking and lyrical payments.
   * approved = both approved, rejected = either rejected, under review = else.
   */
  async recomputePaymentStatusFromPayments(connection, songId, ophId) {
    const [srRows] = await connection.execute(
      "SELECT project_type, Lyrics_services, release_date FROM songs_register WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?) LIMIT 1",
      [songId, ophId, ophId]
    );
    const sr = srRows?.[0];
    if (!sr) return false;
    const isPaidInAdvance = sr.project_type && String(sr.project_type).toLowerCase().includes("paid in advance");
    const hasLyrical = sr.Lyrics_services === true || sr.Lyrics_services === 1 || sr.Lyrics_services === "true";

    if (!isPaidInAdvance || !hasLyrical) {
      return false; // Caller should use single-payment logic
    }

    const dateStr = sr.release_date
      ? (typeof sr.release_date === "string" ? sr.release_date.slice(0, 10) : sr.release_date instanceof Date ? sr.release_date.toISOString().slice(0, 10) : null)
      : null;
    if (!dateStr) return false;

    const costs = await costingModel.getCostsForPaymentLogic();
    const lyricsServiceCost = costs.lyricsService;
    const combinedMin = costs.songRegistration + costs.lyricsService;

    const [dateBookingRows] = await connection.execute(
      `SELECT status FROM payments WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
       AND (song_id = ? OR release_date = ? OR DATE(release_date) = ?)
       AND (status IS NULL OR status != 'rejected')
       ORDER BY created_at DESC LIMIT 1`,
      [ophId, songId, dateStr, dateStr]
    );
    const [lyricalRows] = await connection.execute(
      `SELECT status FROM payments WHERE oph_id = ? AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')
       AND (song_id = ? OR reject_for = ?) AND amount < ?
       AND (status IS NULL OR status != 'rejected')
       ORDER BY created_at DESC LIMIT 1`,
      [ophId, songId, songId, costs.songRegistration]
    );
    let dateBookingStatus = dateBookingRows?.[0]?.status;
    let lyricalStatus = lyricalRows?.[0]?.status;

    // Combined repayment (Song Reg + Lyrics Service): one approved payment covers both
    const [combinedRows] = await connection.execute(
      `SELECT 1 FROM payments WHERE oph_id = ? AND song_id = ? AND status = 'approved' AND amount >= ?
       AND (from_source IN ('Song Registration','Song Repayment','Date booking','Date Booking')) LIMIT 1`,
      [ophId, songId, combinedMin]
    );
    if (Array.isArray(combinedRows) && combinedRows.length > 0) {
      dateBookingStatus = dateBookingStatus || "approved";
      lyricalStatus = lyricalStatus || "approved";
    }

    const [dateBookingRej] = await connection.execute(
      `SELECT 1 FROM payments WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
       AND (song_id = ? OR reject_for = ? OR reject_for = ? OR release_date = ?) AND status = 'rejected' LIMIT 1`,
      [ophId, songId, songId, dateStr, dateStr]
    );
    const [lyricalRej] = await connection.execute(
      `SELECT 1 FROM payments WHERE oph_id = ? AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')
       AND (song_id = ? OR reject_for = ?) AND amount < ? AND status = 'rejected' LIMIT 1`,
      [ophId, songId, songId, costs.songRegistration]
    );
    const dateBookingRejected = Array.isArray(dateBookingRej) && dateBookingRej.length > 0;
    const lyricalRejected = Array.isArray(lyricalRej) && lyricalRej.length > 0;

    let statusPayment = "pending";
    if (dateBookingRejected || lyricalRejected) {
      statusPayment = "rejected";
    } else if (dateBookingStatus === "approved" && lyricalStatus === "approved") {
      statusPayment = "approved";
    } else if (dateBookingStatus === "under review" || lyricalStatus === "under review" ||
               dateBookingStatus === "approved" || lyricalStatus === "approved") {
      statusPayment = "under review";
    }

    await songApplicationStatusModel.updateSongApplicationStatus(connection, songId, { status_payment: statusPayment });
    await this.recalculateOverallStatus(connection, songId);
    return true;
  }

  /**
   * Recalculate overall status based on individual statuses
   * "Under review" only when payment step is also submitted (not pending) — so if payment is not done, show as pending/draft.
   */
  async recalculateOverallStatus(connection, songId) {
    const status = await this.getSongApplicationStatus(connection, songId);

    if (!status || typeof status !== 'object') {
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
    // Priority 2: If payment is not done (pending/missing), overall is "pending" — don't show "under review" until payment is submitted
    else if (
      !status_payment ||
      status_payment === "pending"
    ) {
      overallStatus = "pending";
    }
    // Priority 3: If any status is "under review", overall is "under review" (all steps submitted, waiting for admin)
    else if (
      status_audio === "under review" ||
      status_video === "under review" ||
      status_payment === "under review"
    ) {
      overallStatus = "under review";
    }
    // Priority 4: If all statuses are "approved", overall is "approved"
    else if (
      status_audio === "approved" &&
      status_video === "approved" &&
      status_payment === "approved"
    ) {
      overallStatus = "approved";
    }
    // Priority 5: Any other case (e.g. mixed or missing) → pending
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
      this.insertSongAudioMetricsForApprovedSong.bind(this),
      this.updateSongRelease.bind(this),
      this.insertTvPublishing.bind(this),
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

    if (Array.isArray(existing) && existing.length > 0) {
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

  /**
   * Handler: one placeholder row with no platform (audio_platform_name NULL).
   * Admins assign real platforms later via Audio Metrics — each new platform INSERTs a new row;
   * the placeholder row stays for cumulative/unassigned tracking if desired.
   * Idempotent: skips if an unassigned row already exists for this song.
   */
  async insertSongAudioMetricsForApprovedSong(connection, songData) {
    const { oph_id, song_id, song_name } = songData;

    const [existingUnassigned] = await connection.query(
      `SELECT id FROM song_audio_metrics
       WHERE song_id = ?
         AND (audio_platform_name IS NULL OR TRIM(audio_platform_name) = '')
       LIMIT 1`,
      [song_id],
    );
    if (Array.isArray(existingUnassigned) && existingUnassigned.length > 0) {
      console.log(
        `insertSongAudioMetricsForApprovedSong: placeholder already exists for song_id ${song_id}`,
      );
      return;
    }

    await connection.query(
      `INSERT INTO song_audio_metrics
        (song_id, OPH_ID, song_name, audio_platform_name, audio_platform_streams, audio_platform_revenue, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 0, 0.00, NOW(), NOW())`,
      [song_id, oph_id, song_name || null],
    );

    console.log(
      `Song audio metrics placeholder row created for song_id: ${song_id}`,
    );
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

  /**
   * Handler: Insert song into tvPublishing when song is fully approved
   * Fetches audio_url and video_url from audio_details and video_details
   */
  async insertTvPublishing(connection, songData) {
    const { oph_id, song_id, song_name } = songData;

    const [existing] = await connection.query(
      `SELECT 1 FROM tvPublishing WHERE song_id = ? LIMIT 1`,
      [song_id],
    );
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`tvPublishing already exists for song_id: ${song_id}`);
      return;
    }

    const [audioRows] = await connection.query(
      `SELECT audio_url FROM audio_details WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?) LIMIT 1`,
      [song_id, oph_id, oph_id],
    );
    const [videoRows] = await connection.query(
      `SELECT video_url FROM video_details WHERE song_id = ? LIMIT 1`,
      [song_id],
    );
    const audio_url = audioRows?.[0]?.audio_url ?? '';
    const video_url = videoRows?.[0]?.video_url ?? '';

    await connection.query(
      `INSERT INTO tvPublishing 
        (audio_url, video_url, reason, status, song_id, song_name, OPH_ID, \`lock\`, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [audio_url, video_url, '', 'pending', song_id, song_name || null, oph_id],
    );

    console.log(`tvPublishing initialized for song_id: ${song_id}`);
  }
}

module.exports = new SongApplicationStatusService();

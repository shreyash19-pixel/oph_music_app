const db = require('../../DB/connect');
const SongApplicationStatusService = require('./SongApplicationStatusService');
const songRegModel = require('../../model/songs_register');
const costingModel = require('../../admin/model/costing');

class SongRegistrationService {
  /**
   * Get pending songs list with status determined from song_application_status
   * Gets reject reasons from individual tables (audio_details, video_details, payments)
   * Determines proper redirect path based on rejected step
   * Uses costing table for payment amounts (Song Registration, Lyrics Service)
   */
  async getPendingSongsList(ophId) {
    const connection = await db.getConnection();
    
    try {
      const costs = await costingModel.getCostsForPaymentLogic() || {};
      const songRegCost = costs.songRegistration ?? 799;
      const lyricsServiceCost = costs.lyricsService ?? 399;

      // Get all songs for the user with song_application_status
      // Use song_application_status.overall_status as the single source of truth
      // Payment: use subquery so we get reject_reason even when payment row has song_id moved to reject_for
      // One row per song: use subqueries for reject_reason so duplicates in ad/vd don't create multiple rows
      const [rows] = await connection.query(
        `SELECT 
          sr.song_id,
          sr.Song_name,
          sr.project_type,
          sr.Lyrics_services,
          sr.release_date,
          sr.current_page,
          sr.status AS register_status,
          sas.status_audio,
          sas.status_video,
          sas.status_payment,
          sas.overall_status,
          (SELECT ad2.reject_reason FROM audio_details ad2 
           WHERE ad2.song_id = sr.song_id AND ad2.OPH_ID = sr.oph_id 
           LIMIT 1) as audio_reject_reason,
          (SELECT vd2.reject_reason FROM video_details vd2 
           WHERE vd2.song_id = sr.song_id 
           LIMIT 1) as video_reject_reason,
          (SELECT p2.reject_reason FROM payments p2 
           WHERE p2.oph_id = sr.oph_id 
           AND (
             (p2.from_source = 'Song Registration' OR p2.from_source = 'Song Repayment')
               AND (p2.song_id = sr.song_id OR p2.reject_for = sr.song_id)
             OR (p2.from_source = 'Date booking' OR p2.from_source = 'Date Booking')
               AND (p2.song_id = sr.song_id OR p2.reject_for = sr.song_id OR p2.reject_for = sr.release_date OR p2.release_date = sr.release_date OR DATE(p2.release_date) = DATE(sr.release_date))
           )
           AND p2.status = 'rejected'
           ORDER BY p2.created_at DESC LIMIT 1) as payment_reject_reason,
          (SELECT p2.from_source FROM payments p2 
           WHERE p2.oph_id = sr.oph_id 
           AND (
             (p2.from_source = 'Song Registration' OR p2.from_source = 'Song Repayment')
               AND (p2.song_id = sr.song_id OR p2.reject_for = sr.song_id)
             OR (p2.from_source = 'Date booking' OR p2.from_source = 'Date Booking')
               AND (p2.song_id = sr.song_id OR p2.reject_for = sr.song_id OR p2.reject_for = sr.release_date OR p2.release_date = sr.release_date OR DATE(p2.release_date) = DATE(sr.release_date))
           )
           AND p2.status = 'rejected'
           ORDER BY p2.created_at DESC LIMIT 1) as payment_from_source
        FROM songs_register sr
        LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
        WHERE sr.oph_id = ?
        ORDER BY sr.created_at DESC`,
        [ophId]
      );

      // Get rejected payments for paid-in-advance + lyrical pricing (lyrical = amount < songReg)
      const [rejectedPaymentsRows] = await connection.query(
        `SELECT song_id, reject_for, release_date, from_source, amount
         FROM payments
         WHERE oph_id = ? AND status = 'rejected'
         AND (
           (from_source IN ('Date booking','Date Booking'))
           OR (from_source IN ('Song Registration','Song Repayment') AND amount < ?)
         )
         ORDER BY created_at DESC`,
        [ophId, songRegCost]
      );

      const songDetails = {};
      const rowsSafe = rows || [];

      rowsSafe.forEach((row) => {
        const songId = row.song_id;

        if (!songDetails[songId]) {
          const rejectedSections = [];
          let firstRejectedStepReason = "";
          let currentStep = "";
          // When user went back (register_status = 'draft'), show as draft; when payment not done, show as draft; else use overall_status
          let status = (row.register_status === 'draft')
            ? 'pending'
            : (row.status_payment === 'pending' || !row.status_payment)
              ? 'pending'   // payment not done = still in progress, show as Draft not "Under Review"
              : (row.overall_status || "pending");

          // Build list of ALL rejected sections (audio, video, payment) in fixed order so next_page = first
          // Use status and/or reject_reason so we don't miss a section when status is out of sync
          if (row.status_audio === "rejected" || (row.audio_reject_reason && String(row.audio_reject_reason).trim() !== "")) {
            rejectedSections.push({
              section: "audio",
              label: "Audio Rejected",
              reason: row.audio_reject_reason || ""
            });
          }
          if (row.status_video === "rejected" || (row.video_reject_reason && String(row.video_reject_reason).trim() !== "")) {
            rejectedSections.push({
              section: "video",
              label: "Video Rejected",
              reason: row.video_reject_reason || ""
            });
          }
          // Only add payment to rejectedSections when status_payment is "rejected".
          // Do NOT use payment_reject_reason alone: a resubmitted payment can be "under review"
          // while an old reject_reason still exists in the DB.
          const isDateBookingPayment =
            row.payment_from_source === "Date booking" ||
            row.payment_from_source === "Date Booking";
          const isPaidInAdvanceLyrical =
            row.project_type && String(row.project_type).toLowerCase().includes("paid in advance") &&
            (row.Lyrics_services === true || row.Lyrics_services === 1 || row.Lyrics_services === "true");
          let rejectedPayments = [];
          let paymentRepayAmount = 0;
          if (row.status_payment === "rejected" && isPaidInAdvanceLyrical && (rejectedPaymentsRows?.length || 0) > 0) {
            const toDateStr = (v) => {
              if (v == null || v === '') return null;
              if (typeof v === "string") return v.slice(0, 10);
              if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
              return null;
            };
            const dateStr = toDateStr(row.release_date);
            const seen = { date_booking: false, lyrical: false };
            for (const rp of rejectedPaymentsRows || []) {
              const isDateBooking = rp.from_source === "Date booking" || rp.from_source === "Date Booking";
              const isLyrical = (rp.from_source === "Song Registration" || rp.from_source === "Song Repayment") && Number(rp.amount) < songRegCost;
              let matches = false;
              if (isDateBooking && !seen.date_booking) {
                const rDate = toDateStr(rp.release_date);
                // reject_for may hold song_id (new) or release_date (legacy)
                matches = rp.song_id === songId || rp.reject_for === songId || rp.reject_for === dateStr || rDate === dateStr;
                if (matches) {
                  seen.date_booking = true;
                  const amt = Number(rp.amount) || songRegCost;
                  rejectedPayments.push({ type: "date_booking", amount: amt });
                  paymentRepayAmount += amt;
                }
              } else if (isLyrical && !seen.lyrical) {
                matches = rp.song_id === songId || String(rp.reject_for) === String(songId);
                if (matches) {
                  seen.lyrical = true;
                  const amt = Number(rp.amount) || lyricsServiceCost;
                  rejectedPayments.push({ type: "lyrical", amount: amt });
                  paymentRepayAmount += amt;
                }
              }
            }
          }
          if (row.status_payment === "rejected") {
            const repayAmount = paymentRepayAmount || (isDateBookingPayment ? songRegCost : lyricsServiceCost);
            rejectedSections.push({
              section: "payment",
              label: "Payment Rejected",
              reason: row.payment_reject_reason || "",
              isDateBooking: !!isDateBookingPayment,
              rejectedPayments: rejectedPayments.length ? rejectedPayments : undefined,
              paymentRepayAmount: repayAmount,
            });
          }

          // First rejected step (for backward compat / primary reason)
          const firstRejected = rejectedSections[0];
          const firstRejectedStep = firstRejected ? firstRejected.label : "";
          if (firstRejected) firstRejectedStepReason = firstRejected.reason;

          // next_page = first step: audio -> video -> payment.
          // Date Booking payment rejected → /auth/payment (repay for date). Song Reg payment rejected → video-metadata (Pay now).
          if (rejectedSections.length > 0) {
            const hasAudio = rejectedSections.some((s) => s.section === "audio");
            const hasVideo = rejectedSections.some((s) => s.section === "video");
            const paymentSection = rejectedSections.find((s) => s.section === "payment");
            const hasPayment = !!paymentSection;
            const isDateBookingPaymentRejected = paymentSection?.isDateBooking === true;
            if (hasAudio) {
              currentStep = "/dashboard/upload-song/audio-metadata/";
            } else if (hasVideo) {
              currentStep = "/dashboard/upload-song/video-metadata/";
            } else if (hasPayment && isDateBookingPaymentRejected) {
              currentStep = "/auth/payment"; // Date Booking rejected → payment page (repay for date)
            } else if (hasPayment) {
              currentStep = "/dashboard/upload-song/video-metadata/"; // Song Reg payment → video page (Pay now)
            } else {
              currentStep = "/dashboard/upload-song/audio-metadata/";
            }
          } else {
            if (status === "approved" || status === "under review") {
              currentStep = "";
            } else {
              if (!row.status_audio) {
                currentStep = "/dashboard/upload-song/audio-metadata/";
              } else if (!row.status_video) {
                currentStep = "/dashboard/upload-song/video-metadata/";
              } else if (!row.status_payment) {
                currentStep = "/auth/payment";
              } else {
                currentStep = row.current_page || "/dashboard/upload-song/audio-metadata/";
              }
            }
          }

          songDetails[songId] = {
            Song_name: row.Song_name,
            status: status,
            song_id: row.song_id,
            reject_reason: firstRejectedStepReason,
            next_page: currentStep,
            projectType: row.project_type,
            release_date: row.release_date,
            firstRejectedStep: firstRejectedStep,
            rejectedSections,
            lyrical_services: row.Lyrics_services
          };
        }
      });

      return songDetails;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update song current_page and status when user navigates.
   * Sets status to "under review" only when user is navigating TO a step that was rejected (fixing it).
   * Otherwise sets status to "draft" so that going back from video-metadata or payment does not mark the song as under review.
   */
  async updateSongNavigation(songId, ophId, nextPage) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Determine which step we're navigating TO based on nextPage
      let stepToUpdate = null;
      if (nextPage.includes('audio-metadata')) {
        stepToUpdate = 'audio';
      } else if (nextPage.includes('video-metadata')) {
        stepToUpdate = 'video';
      } else if (nextPage.includes('payment')) {
        stepToUpdate = 'payment';
      }

      let newStatus = 'draft';
      const songStatus = await SongApplicationStatusService.getSongApplicationStatus(connection, songId);
      
      if (stepToUpdate && songStatus) {
        const statusField = `status_${stepToUpdate}`;
        const currentStatus = songStatus[statusField];
        // Only set "under review" when user is fixing a rejected step
        if (currentStatus === 'rejected') {
          newStatus = 'under review';
          await SongApplicationStatusService.updateStepStatus(
            connection,
            songId,
            stepToUpdate,
            'under review'
          );
        }
      }

      // Update current_page and status in songs_register (draft when just going back, under review when fixing rejected)
      await connection.execute(
        `UPDATE songs_register 
         SET current_page = ?, status = ?, updated_at = NOW()
         WHERE song_id = ? AND oph_id = ?`,
        [nextPage, newStatus, songId, ophId]
      );

      await connection.commit();
      
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get the next rejected section for a song after resubmitting a section
   * Returns the path to redirect to, or null if no more rejected sections
   * 
   * @param {string} songId - Song ID
   * @param {string} ophId - User's OPH ID
   * @param {string} justSubmitted - The section that was just submitted ('audio', 'video', or 'payment')
   * @returns {object} { nextRejectedSection: string|null, redirectPath: string|null, songName: string }
   */
  async getNextRejectedSection(songId, ophId, justSubmitted) {
    const connection = await db.getConnection();
    
    try {
      // Get current song application status
      // Use subquery to get the latest payment for the song (check both song_id and reject_for)
      const [rows] = await connection.execute(
        `SELECT 
          sr.song_id,
          sr.Song_name,
          sr.release_date,
          sr.project_type,
          sr.Lyrics_services,
          sas.status_audio,
          sas.status_video,
          sas.status_payment,
          ad.reject_reason as audio_reject_reason,
          vd.reject_reason as video_reject_reason,
          p.reject_reason as payment_reject_reason
        FROM songs_register sr
        LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
        LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
        LEFT JOIN video_details vd ON sr.song_id = vd.song_id
        LEFT JOIN (
          SELECT p1.song_id, p1.reject_for, p1.reject_reason, p1.oph_id
          FROM payments p1
          WHERE (p1.from_source = 'Song Registration' OR p1.from_source = 'Song Repayment')
            AND p1.oph_id = ?
            AND (p1.song_id = ? OR p1.reject_for = ?)
          ORDER BY p1.created_at DESC
          LIMIT 1
        ) p ON (sr.song_id = p.song_id OR sr.song_id = p.reject_for) AND sr.oph_id = p.oph_id
        WHERE sr.song_id = ? AND sr.oph_id = ?
        LIMIT 1`,
        [ophId, songId, songId, songId, ophId]
      );

      if (rows.length === 0) {
        return { 
          nextRejectedSection: null, 
          redirectPath: '/dashboard/success', 
          songName: '',
          songId: null,
          releaseDate: null,
          projectType: null,
          lyricalServices: null
        };
      }

      const row = rows[0];
      const songName = row.Song_name || '';

      // Check for rejected sections in priority order: audio > video > payment
      // But skip the section that was just submitted
      let nextRejectedSection = null;
      let redirectPath = null;

      // Check audio (if not just submitted)
      if (justSubmitted !== 'audio' && row.status_audio === 'rejected' && row.audio_reject_reason) {
        nextRejectedSection = 'audio';
        redirectPath = '/dashboard/upload-song/audio-metadata/';
      }
      // Check video (if not just submitted)
      else if (justSubmitted !== 'video' && row.status_video === 'rejected' && row.video_reject_reason) {
        nextRejectedSection = 'video';
        redirectPath = '/dashboard/upload-song/video-metadata/';
      }
      // Check payment (if not just submitted)
      else if (justSubmitted !== 'payment' && row.status_payment === 'rejected' && row.payment_reject_reason) {
        nextRejectedSection = 'payment';
        // When coming from audio resubmit: send user to video metadata (read-only + Pay now) instead of payment page
        if (justSubmitted === 'audio') {
          redirectPath = '/dashboard/upload-song/video-metadata/';
        } else {
          redirectPath = '/auth/payment';
        }
      }

      // If no more rejected sections, redirect to success
      if (!nextRejectedSection) {
        redirectPath = '/dashboard/success';
      }

      const showPayNowOnVideo = nextRejectedSection === 'payment' && redirectPath === '/dashboard/upload-song/video-metadata/';

      return {
        nextRejectedSection,
        redirectPath,
        showPayNowOnVideo: !!showPayNowOnVideo,
        songName,
        songId: row.song_id,
        releaseDate: row.release_date,
        projectType: row.project_type,
        lyricalServices: row.Lyrics_services
      };
    } catch (error) {
      console.error('Error getting next rejected section:', error);
      // On error, default to success page
      return { nextRejectedSection: null, redirectPath: '/dashboard/success', songName: '' };
    } finally {
      connection.release();
    }
  }
}

module.exports = new SongRegistrationService();


const db = require('../../DB/connect');
const SongApplicationStatusService = require('./SongApplicationStatusService');
const songRegModel = require('../../model/songs_register');

class SongRegistrationService {
  /**
   * Get pending songs list with status determined from song_application_status
   * Gets reject reasons from individual tables (audio_details, video_details, payments)
   * Determines proper redirect path based on rejected step
   */
  async getPendingSongsList(ophId) {
    const connection = await db.getConnection();
    
    try {
      // Get all songs for the user with song_application_status
      // Use song_application_status.overall_status as the single source of truth
      const [rows] = await connection.execute(
        `SELECT 
          sr.song_id,
          sr.Song_name,
          sr.project_type,
          sr.Lyrics_services,
          sr.release_date,
          sr.current_page,
          sas.status_audio,
          sas.status_video,
          sas.status_payment,
          sas.overall_status,
          ad.reject_reason as audio_reject_reason,
          vd.reject_reason as video_reject_reason,
          p.reject_reason as payment_reject_reason
        FROM songs_register sr
        LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
        LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
        LEFT JOIN video_details vd ON sr.song_id = vd.song_id
        LEFT JOIN payments p ON sr.song_id = p.song_id 
          AND (p.from_source = 'Song Registration' OR p.from_source = 'Song Repayment')
        WHERE sr.oph_id = ?
        ORDER BY sr.created_at DESC`,
        [ophId]
      );

      const songDetails = {};

      console.log();
      

      rows.forEach((row) => {
        const songId = row.song_id;

        if (!songDetails[songId]) {
          let firstRejectedStep = "";
          let firstRejectedStepReason = "";
          let currentStep = "";
          let status = "";

          // Use overall_status from song_application_status as the single source of truth
          // Get rejection details from individual tables
          status = row.overall_status || "pending";
          
          // Priority: Check rejections first (audio > video > payment) to get rejection message
          if (row.status_audio === "rejected") {
            firstRejectedStep = "Audio Details has been rejected";
            firstRejectedStepReason = row.audio_reject_reason || "";
            currentStep = "/dashboard/upload-song/audio-metadata/";
          } else if (row.status_video === "rejected") {
            firstRejectedStep = "Video Details has been rejected";
            firstRejectedStepReason = row.video_reject_reason || "";
            currentStep = "/dashboard/upload-song/video-metadata/";
          } else if (row.status_payment === "rejected") {
            firstRejectedStep = "Payment Details has been rejected";
            firstRejectedStepReason = row.payment_reject_reason || "";
            // Payment comes after video, so redirect to video-metadata where they can navigate to payment
            currentStep = "/dashboard/upload-song/video-metadata/";
          } else {
            // No rejection, determine current step based on what's missing
            firstRejectedStepReason = "";
            firstRejectedStep = "";
            
            if (status === "approved") {
              currentStep = "";
            } else if (status === "under review") {
              currentStep = "";
            } else {
              // Draft or pending - determine current step based on what's missing
              if (!row.status_audio) {
                currentStep = "/dashboard/upload-song/audio-metadata/";
              } else if (!row.status_video) {
                currentStep = "/dashboard/upload-song/video-metadata/";
              } else if (!row.status_payment) {
                currentStep = "/dashboard/upload-song/video-metadata/"; // Payment comes after video
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
   * Update song current_page and status when user navigates to fix rejected item
   * Sets status to "under review" when user starts fixing a rejected step
   */
  async updateSongNavigation(songId, ophId, nextPage) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update current_page in songs_register
      await connection.execute(
        `UPDATE songs_register 
         SET current_page = ?, status = 'under review', updated_at = NOW()
         WHERE song_id = ? AND oph_id = ?`,
        [nextPage, songId, ophId]
      );

      // Determine which step is being fixed based on nextPage
      let stepToUpdate = null;
      if (nextPage.includes('audio-metadata')) {
        stepToUpdate = 'audio';
      } else if (nextPage.includes('video-metadata')) {
        stepToUpdate = 'video';
      } else if (nextPage.includes('payment')) {
        stepToUpdate = 'payment';
      }

      // If we're fixing a rejected step, update that step status back to "under review"
      if (stepToUpdate) {
        // Get current status to check if it was rejected
        const songStatus = await SongApplicationStatusService.getSongApplicationStatus(connection, songId);
        
        if (songStatus) {
          const statusField = `status_${stepToUpdate}`;
          const currentStatus = songStatus[statusField];
          
          // If the step was rejected, update it back to "under review"
          if (currentStatus === 'rejected') {
            await SongApplicationStatusService.updateStepStatus(
              connection,
              songId,
              stepToUpdate,
              'under review'
            );
          }
        }
      }

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
        redirectPath = '/auth/payment';
      }

      // If no more rejected sections, redirect to success
      if (!nextRejectedSection) {
        redirectPath = '/dashboard/success';
      }

      return {
        nextRejectedSection,
        redirectPath,
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


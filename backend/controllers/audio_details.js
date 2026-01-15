const { insertSongDetails, getAudioMeta, getSecondaryArtist, setNextPage, checkVideoDetailsStatus } = require("../model/audio_details");
const bucket = require("../utils.js");
const SongApplicationStatusService = require("../services/song/SongApplicationStatusService");

const insertSongDetailsController = async (req, res) => {
  try {
    const {
      OPH_ID,
      song_id,
      Song_name,
      languages,
      genre,
      sub_genre,
      mood,
      lyrics,
      primary_artist,
      next_step
    } = req.body;

    if (!OPH_ID || !song_id || !Song_name || !languages || !genre || !sub_genre || !mood || !primary_artist || !next_step) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const audio_file = req.file

    let audioPath = ''

    if (audio_file) {
      const fileURL = await bucket.uploadToS3(
        audio_file,
        `audio-meta/${OPH_ID}/audio-url`
      )
      if (fileURL) {
        audioPath = fileURL
      }
    }

    const result = await insertSongDetails(
      OPH_ID,
      song_id,
      Song_name,
      languages,
      genre,
      sub_genre,
      mood,
      lyrics,
      primary_artist,
      audioPath,
    );

    if (result) {
      await setNextPage(next_step, OPH_ID, song_id);
      
      // Check if this was a resubmission of a rejected audio BEFORE we clear the reject_reason
      const db = require("../DB/connect");
      const connection = await db.getConnection();
      let redirectPath = null;
      let nextRejectedSection = null;
      let songName = null;
      let releaseDate = null;
      let projectType = null;
      let lyricalServices = null;
      let wasRejected = false;
      
      try {
        // Check if audio was previously rejected (before we update it)
        const [audioDetails] = await connection.execute(
          `SELECT reject_reason, status FROM audio_details WHERE song_id = ? AND OPH_ID = ?`,
          [song_id, OPH_ID]
        );
        
        wasRejected = audioDetails.length > 0 && 
                     (audioDetails[0].reject_reason !== null || audioDetails[0].status === 'rejected');
        
        // Update status_audio to 'under review' in both:
        // 1. audio_details table (already set in insertSongDetails model)
        // 2. song_application_status table (for centralized status management)
        await connection.beginTransaction();
        
        // Ensure audio_details.status is set to 'under review' (should already be set by model, but ensure it)
        await connection.execute(
          `UPDATE audio_details 
           SET status = 'under review', reject_reason = NULL, updated_at = NOW()
           WHERE song_id = ? AND OPH_ID = ?`,
          [song_id, OPH_ID]
        );
        
        // Update song_application_status
        await SongApplicationStatusService.updateStepStatus(
          connection,
          song_id,
          'audio',
          'under review'
        );
        
        await connection.commit();
        
        // Only check for next rejected section if this was a resubmission
        if (wasRejected) {
          const SongRegistrationService = require("../services/song/SongRegistrationService");
          const nextSection = await SongRegistrationService.getNextRejectedSection(song_id, OPH_ID, 'audio');
          redirectPath = nextSection.redirectPath;
          nextRejectedSection = nextSection.nextRejectedSection;
          songName = nextSection.songName;
          releaseDate = nextSection.releaseDate;
          projectType = nextSection.projectType;
          lyricalServices = nextSection.lyricalServices;
        }
        // For new submissions, redirectPath will be null, so frontend uses default navigation
      } catch (error) {
        await connection.rollback();
        console.error("Error updating audio status:", error);
        // Don't fail the request if status update fails
      } finally {
        connection.release();
      }
      
      res.status(201).json({ 
        message: "Song details saved", 
        result, 
        song_id: song_id,
        nextRejectedSection: nextRejectedSection,
        redirectPath: redirectPath, // null for new submissions, will use default navigation
        songName: songName,
        releaseDate: releaseDate,
        projectType: projectType,
        lyricalServices: lyricalServices
      });
    }

  } catch (error) {
    console.error("Insert song detail error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSongDetailsController = async (req, res) => {

  try {

    const { contentId, ophid } = req.query


    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const audioMeta = await getAudioMeta(contentId, ophid)

    const secondaryArtist = await getSecondaryArtist(contentId)

    if (audioMeta && secondaryArtist) {
      return res.status(200).json({
        success: true,
        data: {
          audio_metadata: audioMeta,
          secondary_artists: secondaryArtist
        }
      })
    }

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }

}


const checkVideoDetailsStatusController = async (req, res) => {

  try{

      const {contentId} = req.query

      console.log(contentId);
      

      if(!contentId)
      {
        return res.status(400).json({
          success: false,
          message: "Missing required field"
        })
      }


      const response = await checkVideoDetailsStatus(contentId)

      if(response)
      {
        return res.status(200).json({
          success: true,
          message: "Data fetched successfully",
          data: response
        })
      }
  }

  catch(err)
  {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }

}

module.exports = { insertSongDetailsController, getSongDetailsController, checkVideoDetailsStatusController };

const details = require('../model/allArtist');
const bucket = require("../../utils.js");
const { saveNotification } = require("../../utils/notify");

const getAllDetails = async (req, res) => {
  try {
    const { ophid } = req.params;

    const userDetails = await details.getUserDetailsByOphId(ophid);
    const professionalDetails = await details.getProfessionalDetailsByOphId(ophid);
    const documentationDetails = await details.getDocumentationDetailsByOphId(ophid);

    // Check if no data found for all
    if (!userDetails && !professionalDetails && !documentationDetails) {
      return res.status(404).json({ message: "No details found for given OPH ID." });
    }

    res.status(200).json({
      userDetails,
      professionalDetails,
      documentationDetails,
    });
    console.log(res.data);
    
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    const userDetails = await details.getAllUserDetails();
    console.log(userDetails);
    

    // if (!userDetails || userDetails.length === 0) {
    //   return res.status(404).json({ message: "No user details found with step_status under review in any table" });
    // }

    res.status(200).json({ userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { ophid, data } = req.body;
    const profile_image = req.file;

    // Parse the data if it's a JSON string
    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    // Get existing user data to preserve current image if no new one is provided
    const existingUser = await details.getUserDetailsByOphId(ophid);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let updatedData = { ...parsedData };

    // Handle profile image upload
    if (profile_image) {
      // Upload new image to S3
      const storeImgIntoBucket = await bucket.uploadToS3(
        profile_image,
        `allUsers/${ophid}/profile_image`
      );
      if (storeImgIntoBucket) {
        updatedData.personal_photo = storeImgIntoBucket;
      }
    } else if (parsedData.existing_image_url) {
      // If no new image is provided but existing image URL is sent, use the existing one
      updatedData.personal_photo = parsedData.existing_image_url;
    } else if (parsedData.personal_photo === undefined) {
      // If personal_photo is not being updated, preserve the existing one
      updatedData.personal_photo = existingUser.personal_photo;
    }

    // Remove helper fields that don't exist in the database schema
    delete updatedData.existing_image_url;

    // Filter to only include valid database fields based on the schema
    const allowedFields = [
      'full_name', 'stage_name', 'email', 'contact_num', 'user_pass', 
      'artist_type', 'personal_photo', 'location', 'step_status', 
      'reject_reason', 'current_step', 'form_fill_count', 'traffic',
      'artist_story', 'artist_story_video'
    ];
    
    const filteredData = {};
    Object.keys(updatedData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updatedData[key];
      }
    });

    const updatedUserDetails = await details.updateUserDetails(ophid, filteredData);
    
    // Create and save notification
    const notificationPayload = {
      ophid,
      title: "Your User Profile has been Updated",
      message: "Your profile details have been successfully updated by admin.",
      link: `/dashboard/artist-detail?id=${ophid}` // Dynamic link with user's OPH ID
    };

    // Save notification to database
    const notification = await saveNotification(notificationPayload);

    // Emit notification via Socket.IO if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (io && onlineUsers) {
      const userSocketId = onlineUsers.get(ophid);
      if (userSocketId) {
        io.to(userSocketId).emit("Profile-update", notification);
        console.log(`Emitted 'Profile-update' to ophid ${ophid}, socket ID: ${userSocketId}`);
      } else {
        console.log(`No active socket found for ophid: ${ophid}`);
      }
    } else {
      console.warn("Socket IO or onlineUsers map is not initialized");
    }
    
    res.status(200).json({ 
      success: true,
      message: "User details updated successfully",
      updatedUserDetails 
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

const updateProfessionalDetailsController = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("Request headers:", req.headers);
    
    const { ophid, data } = req.body;
    
    console.log("Received ophid:", ophid);
    console.log("Received data:", data);
    
    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing ophid parameter",
      });
    }
    
    // Parse the data if it's a JSON string
    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    // Get existing professional details to preserve current data if not provided
    const existingDetails = await details.getProfessionalDetailsByOphId(ophid);
    if (!existingDetails) {
      return res.status(404).json({
        success: false,
        message: "Professional details not found",
      });
    }

    // Handle photo and video uploads to S3
    let photoURLs = [];
    let videoURL = "";

    // Process photos from frontend data (this includes both existing and new photos)
    if (parsedData.photos && Array.isArray(parsedData.photos)) {
      console.log("Processing photos from frontend:", parsedData.photos);
      
      // Process each photo in the frontend array
      for (const photo of parsedData.photos) {
        if (typeof photo === 'string' && !photo.startsWith('blob:')) {
          // This is an existing URL, add it directly
          photoURLs.push(photo);
        }
      }
    }

    // Handle video URL from frontend data
    if (parsedData.video) {
      if (parsedData.video.startsWith('blob:')) {
        console.log("New video blob detected, will be uploaded via files");
        // Video will be handled in the files processing below
      } else {
        console.log("Using existing video URL:", parsedData.video);
        videoURL = parsedData.video;
      }
    } else {
      // Use existing video if no new one provided
      videoURL = existingDetails.VideoURL || "";
    }

    // Process new file uploads to S3 (photos and videos)
    console.log("Processing files:", req.files);
    
    // Handle photos array
    if (req.files.photos && req.files.photos.length > 0) {
      console.log(`Found ${req.files.photos.length} photo files to upload`);
      for (const file of req.files.photos) {
        console.log("Uploading photo:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer ? 'has buffer' : 'no buffer'
        });
        try {
          const s3Url = await bucket.uploadToS3(
            file,
            `allUsers/${ophid}/professional_photos`
          );
          console.log("Photo S3 upload successful:", s3Url);
          if (s3Url) {
            photoURLs.push(s3Url);
          }
        } catch (uploadError) {
          console.error("Error uploading photo to S3:", uploadError);
        }
      }
    }
    
    // Handle video file
    if (req.files.video && req.files.video.length > 0) {
      console.log(`Found ${req.files.video.length} video files to upload`);
      for (const file of req.files.video) {
        console.log("Uploading video:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer ? 'has buffer' : 'no buffer'
        });
        try {
          const s3Url = await bucket.uploadToS3(
            file,
            `allUsers/${ophid}/professional_videos`
          );
          console.log("Video S3 upload successful:", s3Url);
          if (s3Url) {
            videoURL = s3Url;
          }
        } catch (uploadError) {
          console.error("Error uploading video to S3:", uploadError);
        }
      }
    }
    
    if (!req.files.photos && !req.files.video) {
      console.log("No files found in request");
    }

    // Limit to 5 photos maximum
    if (photoURLs.length > 5) {
      photoURLs = photoURLs.slice(0, 5);
    }

    console.log("Final photo URLs:", photoURLs);
    console.log("Final video URL:", videoURL);

    // Map frontend data to database schema
    const professionalData = {
      Profession: parsedData.profession || existingDetails.Profession || "",
      Bio: parsedData.bio || existingDetails.Bio || "",
      VideoURL: videoURL,
      PhotoURLs: JSON.stringify(photoURLs),
      SpotifyLink: parsedData.spotify || existingDetails.SpotifyLink || "",
      InstagramLink: parsedData.instagram || existingDetails.InstagramLink || "",
      FacebookLink: parsedData.facebook || existingDetails.FacebookLink || "",
      AppleMusicLink: parsedData.apple_music || existingDetails.AppleMusicLink || "",
      ExperienceYearly: parsedData.experience_yearly || existingDetails.ExperienceYearly || 0,
      ExperienceMonthly: parsedData.experience_monthly || existingDetails.ExperienceMonthly || 0,
      SongsPlanningCount: parsedData.songs_planning_count || existingDetails.SongsPlanningCount || 0,
      SongsPlanningType: parsedData.songs_planning_type || existingDetails.SongsPlanningType || "",
    };

    console.log("Sending to database update:", {
      ophid,
      professionalData: {
        ...professionalData,
        PhotoURLs: "JSON string with " + (JSON.parse(professionalData.PhotoURLs).length) + " photos"
      }
    });

    const updatedProfessionalDetails = await details.updateProfessionalDetails(ophid, professionalData);
    
    // Create and save notification
    const notificationPayload = {
      ophid,
      title: "Your Professional Profile has been Updated",
      message: "Your professional details have been successfully updated by admin.",
      link: `/dashboard/artist-detail?id=${ophid}` // Dynamic link with user's OPH ID
    };

    // Save notification to database
    const notification = await saveNotification(notificationPayload);

    // Emit notification via Socket.IO if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (io && onlineUsers) {
      const userSocketId = onlineUsers.get(ophid);
      if (userSocketId) {
        io.to(userSocketId).emit("Profile-update", notification);
        console.log(`Emitted 'Profile-update' to ophid ${ophid}, socket ID: ${userSocketId}`);
      } else {
        console.log(`No active socket found for ophid: ${ophid}`);
      }
    } else {
      console.warn("Socket IO or onlineUsers map is not initialized");
    }
    
    res.status(200).json({ 
      success: true,
      message: "Professional details updated successfully",
      updatedProfessionalDetails,
      photoURLs: photoURLs,
      videoURL: videoURL
    });
  } catch (error) {
    console.error("Error updating professional details:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};


const updateDocumentationDetails = async (req, res) => {
  try {
    const { ophid } = req.body;
    
    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "OPH ID is required"
      });
    }

    console.log("Processing documentation update for OPH ID:", ophid);
    console.log("Request files:", req.files);

    // Get existing documentation details
    const existingDetails = await details.getDocumentationDetailsByOphId(ophid);
    if (!existingDetails) {
      return res.status(404).json({
        success: false,
        message: "Documentation details not found"
      });
    }

    // Initialize documentation data with existing values
    const documentationData = {
      AadharFrontURL: existingDetails.AadharFrontURL || "",
      AadharBackURL: existingDetails.AadharBackURL || "",
      PanFrontURL: existingDetails.PanFrontURL || "",
      SignatureImageURL: existingDetails.SignatureImageURL || ""
    };

    // Process file uploads to S3
    const fileFields = ['AadharFrontURL', 'AadharBackURL', 'PanFrontURL', 'SignatureImageURL'];
    
    for (const field of fileFields) {
      if (req.files[field] && req.files[field].length > 0) {
        const file = req.files[field][0];
        console.log(`Uploading ${field}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        
        try {
          const s3Url = await bucket.uploadToS3(
            file,
            `allUsers/${ophid}/documentation/${field.toLowerCase()}`
          );
          console.log(`${field} S3 upload successful:`, s3Url);
          if (s3Url) {
            documentationData[field] = s3Url;
          }
        } catch (uploadError) {
          console.error(`Error uploading ${field} to S3:`, uploadError);
        }
      }
    }

    console.log("Final documentation data:", documentationData);

    // Update database
    const updatedDocumentationDetails = await details.updateDocumentationDetails(ophid, documentationData);

    // Create and save notification
    const notificationPayload = {
      ophid,
      title: "Your Documentation has been Updated",
      message: "Your documentation details have been successfully updated by admin.",
      link: `/dashboard/artist-detail?id=${ophid}` // Dynamic link with user's OPH ID
    };

    // Save notification to database
    const notification = await saveNotification(notificationPayload);

    // Emit notification via Socket.IO if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (io && onlineUsers) {
      const userSocketId = onlineUsers.get(ophid);
      if (userSocketId) {
        io.to(userSocketId).emit("Profile-update", notification);
        console.log(`Emitted 'Profile-update' to ophid ${ophid}, socket ID: ${userSocketId}`);
      } else {
        console.log(`No active socket found for ophid: ${ophid}`);
      }
    } else {
      console.warn("Socket IO or onlineUsers map is not initialized");
    }

    res.status(200).json({ 
      success: true,
      message: "Documentation details updated successfully",
      data: updatedDocumentationDetails
    });
  } catch (error) {
    console.error("Error updating documentation details:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports={getAllUserDetails,getAllDetails,updateUserDetails,updateProfessionalDetailsController,updateDocumentationDetails}
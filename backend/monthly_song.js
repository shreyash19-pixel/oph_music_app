// monthly_song.js
import fs from "fs";
import path from "path";
import Backendaxios from "./utils/backendAxios.js"; // your axios instance
import { deleteFromS3, saveToS3 } from "./utils.js";

const S3_KEY = "monthly_kpi/song_metrics.json";

/*
HOW TO RUN THIS FILE:

1. Navigate to the backend directory:
   cd backend

2. Run the file directly with Node.js:
   node monthly_song.js

3. Or if you have nodemon installed for development:
   nodemon monthly_song.js

4. Or run it as a module:
   node -e "import('./monthly_song.js')"

Note: Make sure you have all required dependencies installed:
   npm install

The file will:
- Fetch song metrics data from /get-all_song_metrics endpoint
- Process records and place them in both creation and update months
- Preserve historical months while allowing current month updates
- Save results to S3 bucket
- Show detailed logging of what's happening
*/

async function saveMonthlySongMetrics() {
  try {
    console.log("Fetching /get-all_song_metrics ...");
    const response = await Backendaxios.get("/get-all_song_metrics");
    const raw = response.data ?? response;

    console.log("Raw response:", typeof raw, Array.isArray(raw) ? "Array" : "Object");
    console.log(raw);

    // ensure we have an array
    const songs = Array.isArray(raw) ? raw : raw.data ?? raw.songs ?? [];
    if (!Array.isArray(songs)) {
      throw new Error("Expected API to return an array, got: " + JSON.stringify(raw));
    }

    console.log(`Processing ${songs.length} song records`);

    // filter out songs with empty audio_platform_name
    const validSongs = songs.filter(song => song.audio_platform_name && song.audio_platform_name.trim() !== '');
    console.log(`Filtered ${songs.length - validSongs.length} songs with empty audio_platform_name`);

    // try to get existing data from S3
    let existingData = {};
    try {
      // Note: You'll need to implement a getFromS3 function in your utils.js
      // For now, we'll start with empty data
      console.log("Starting with empty data structure");
    } catch (error) {
      console.log("No existing data found, starting fresh");
      existingData = {};
    }

    // create new data structure by merging with existing data
    const updatedData = { ...existingData };

    // Get current date to determine which month is active
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 (January = 0)
    const currentMonthName = currentDate.toLocaleString("en-US", { month: "long" });

    console.log(`Current month: ${currentMonthName} ${currentYear}`);

    // Create a map of all existing song_id + audio_platform_name combinations across all months to prevent duplicates
    const existingSongKeys = new Set();
    Object.keys(updatedData).forEach(year => {
      Object.keys(updatedData[year]).forEach(month => {
        updatedData[year][month].forEach(song => {
          const songKey = `${song.song_id}_${song.audio_platform_name}`;
          existingSongKeys.add(songKey);
        });
      });
    });

    console.log(`📊 Found ${existingSongKeys.size} existing song entries in current data structure`);

    // First, organize all incoming data by both created_at and updated_at months
    const organizedData = {};
    
    validSongs.forEach((song) => {
      // Get both creation and update dates
      const createdAt = new Date(song.created_at);
      const updatedAt = new Date(song.updated_at);
      
      const createdYear = createdAt.getFullYear();
      const createdMonth = createdAt.getMonth();
      const createdMonthName = createdAt.toLocaleString("en-US", { month: "long" });
      
      const updatedYear = updatedAt.getFullYear();
      const updatedMonth = updatedAt.getMonth();
      const updatedMonthName = updatedAt.toLocaleString("en-US", { month: "long" });

      const songKey = `${song.song_id}_${song.audio_platform_name}`;

      // Place record in creation month
      if (!organizedData[createdYear]) organizedData[createdYear] = {};
      if (!organizedData[createdYear][createdMonthName]) organizedData[createdYear][createdMonthName] = [];
      
      // Check if this song already exists in creation month
      const existingInCreatedMonth = organizedData[createdYear][createdMonthName].some(existingSong => 
        existingSong.song_id === song.song_id && 
        existingSong.audio_platform_name === song.audio_platform_name
      );
      
      if (!existingInCreatedMonth) {
        organizedData[createdYear][createdMonthName].push(song);
        console.log(`➕ Added song for song_id: ${song.song_id} (${song.audio_platform_name}) in ${createdMonthName} ${createdYear} (creation month)`);
      }

      // Place record in update month (if different from creation month)
      if (createdYear !== updatedYear || createdMonth !== updatedMonth) {
        if (!organizedData[updatedYear]) organizedData[updatedYear] = {};
        if (!organizedData[updatedYear][updatedMonthName]) organizedData[updatedYear][updatedMonthName] = [];
        
        // Check if this song already exists in update month
        const existingInUpdatedMonth = organizedData[updatedYear][updatedMonthName].some(existingSong => 
          existingSong.song_id === song.song_id && 
          existingSong.audio_platform_name === song.audio_platform_name
        );
        
        if (!existingInUpdatedMonth) {
          organizedData[updatedYear][updatedMonthName].push(song);
          console.log(`➕ Added song for song_id: ${song.song_id} (${song.audio_platform_name}) in ${updatedMonthName} ${updatedYear} (update month)`);
        }
      } else {
        console.log(`📝 Song for song_id: ${song.song_id} (${song.audio_platform_name}) created and updated in same month (${createdMonthName} ${createdYear})`);
      }
    });

    // Now merge with existing data, preserving historical months
    Object.keys(organizedData).forEach(year => {
      if (!updatedData[year]) updatedData[year] = {};
      
      Object.keys(organizedData[year]).forEach(month => {
        const isPastMonth = (parseInt(year) < currentYear) || 
                           (parseInt(year) === currentYear && 
                            new Date(Date.parse(year + '-' + month + '-01')).getMonth() < currentMonth);

        if (isPastMonth) {
          // For past months, preserve existing data and only add new records
          if (!updatedData[year][month]) updatedData[year][month] = [];
          
          organizedData[year][month].forEach(newSong => {
            const songKey = `${newSong.song_id}_${newSong.audio_platform_name}`;
            const songExists = updatedData[year][month].some(existingSong => 
              existingSong.song_id === newSong.song_id && 
              existingSong.audio_platform_name === newSong.audio_platform_name
            );
            
            if (!songExists) {
              updatedData[year][month].push(newSong);
              console.log(`✅ Added new historical song for song_id: ${newSong.song_id} (${newSong.audio_platform_name}) in ${month} ${year}`);
            } else {
              console.log(`🛡️ PROTECTED: Skipped updating historical song for song_id: ${newSong.song_id} (${newSong.audio_platform_name}) in ${month} ${year} (already exists, month is closed)`);
            }
          });
        } else {
          // For current month, allow full updates
          updatedData[year][month] = organizedData[year][month];
          console.log(`🔄 Updated current month data for ${month} ${year}`);
        }
      });
    });

    // save updated data to S3
    console.log("Saving updated data to S3...");
    await saveToS3(S3_KEY, updatedData);

    console.log(`✅ Successfully updated song metrics file in S3`);
    console.log(`📅 Historical months are preserved, only current month (${currentMonthName} ${currentYear}) can be updated`);
  } catch (err) {
    console.error("❌ Error updating song metrics:", err.message);
    console.error(err);
  }
}

await saveMonthlySongMetrics();

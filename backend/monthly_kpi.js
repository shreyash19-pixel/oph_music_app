// monthly_kpi.js
import fs from "fs";
import path from "path";
import Backendaxios from "./utils/backendAxios.js"; // your axios instance
import { readFromS3, saveToS3 } from "./utils.js";

const S3_KEY = "monthly_kpi/song_metrics.json";

async function saveMonthlySongMetrics() {
  try {
    console.log("Fetching /get_song_metrics ...");
    const response = await Backendaxios.get("/get-all_song_metrics");
    const raw = response.data ?? response;

    console.log("Raw response:", typeof raw, Array.isArray(raw) ? "Array" : "Object");

    // ensure we have an array
    const songs = Array.isArray(raw) ? raw : raw.data ?? raw.songs ?? [];
    if (!Array.isArray(songs)) {
      throw new Error("Expected API to return an array, got: " + JSON.stringify(raw));
    }

    // filter out songs with empty audio_platform_name
    const validSongs = songs.filter(song => song.audio_platform_name && song.audio_platform_name.trim() !== '');
    console.log(`Filtered ${songs.length - validSongs.length} songs with empty audio_platform_name`);

    // read existing data from S3
    console.log("Reading existing data from S3...");
    const existing = await readFromS3(S3_KEY);

    // group songs by year & month, avoiding duplicates
    validSongs.forEach((song) => {
      const updatedAt = new Date(song.updated_at);
      const year = updatedAt.getFullYear();
      const monthName = updatedAt.toLocaleString("en-US", { month: "long" });

      if (!existing[year]) existing[year] = {};
      if (!existing[year][monthName]) existing[year][monthName] = [];

      // check if song with same song_id and audio_platform_name already exists in this month
      const songExists = existing[year][monthName].some(existingSong => 
        existingSong.song_id === song.song_id && 
        existingSong.audio_platform_name === song.audio_platform_name
      );
      if (!songExists) {
        existing[year][monthName].push(song);
      }
    });

    // save updated data to S3
    console.log("Saving updated data to S3...");
    await saveToS3(S3_KEY, existing);

    console.log(`✅ Saved songs grouped by all months/years to S3`);
  } catch (err) {
    console.error("❌ Error saving song metrics:", err.message);
    console.error(err);
  }
}

await saveMonthlySongMetrics();

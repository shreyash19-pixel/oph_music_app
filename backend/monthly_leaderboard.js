// monthly_leaderboard.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const { deleteFromS3, saveToS3, readFromS3 } = require('./utils.js');

// Create axios instance
const Backendaxios = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  withCredentials: true
});

const S3_KEY = "monthly_kpi/leaderboard.json";

/*
HOW TO RUN THIS FILE:

1. Navigate to the backend directory:
   cd backend

2. Run the file directly with Node.js:
   node monthly_leaderboard.js

3. Or if you have nodemon installed for development:
   nodemon monthly_leaderboard.js

4. Or run it as a module:
   node -e "import('./monthly_leaderboard.js')"

Note: Make sure you have all required dependencies installed:
   npm install

The file will:
- Fetch leaderboard data from /leaderboard endpoint
- Calculate monthly differences (only new or changed records per month)
- Store incremental changes, not cumulative totals
- Save results to S3 bucket
- Show detailed logging of what's happening
*/

async function saveMonthlyLeaderboardMetrics() {
  try {
    console.log("Fetching /leaderboard ...");
    const response = await Backendaxios.get("/leaderboard");
    const raw = response.data ?? response;

    console.log("Raw response:", typeof raw, Array.isArray(raw) ? "Array" : "Object");
    console.log(raw);

    // ensure we have an array from the data property
    const leaderboardData = Array.isArray(raw) ? raw : raw.data ?? raw.leaderboard ?? [];
    if (!Array.isArray(leaderboardData)) {
      throw new Error("Expected API to return an array, got: " + JSON.stringify(raw));
    }

    console.log(`Processing ${leaderboardData.length} leaderboard records`);

    // try to get existing data from S3
    let existingData = {};
    try {
      // Try to get existing data from S3
      console.log("📥 Downloading existing data from S3...");
      const existingDataFromS3 = await readFromS3(S3_KEY);
      existingData = existingDataFromS3 || {};
      console.log("Successfully loaded existing data from S3");
      console.log(`Found existing data for years: ${Object.keys(existingData).join(', ')}`);
      
      // Count total existing records
      let totalExistingRecords = 0;
      Object.keys(existingData).forEach(year => {
        Object.keys(existingData[year]).forEach(month => {
          totalExistingRecords += existingData[year][month].length;
        });
      });
      console.log(`Total existing records: ${totalExistingRecords}`);
    } catch (error) {
      console.log("No existing data found in S3, starting fresh");
      existingData = {};
    }

    // create new data structure by deeply merging with existing data
    const updatedData = JSON.parse(JSON.stringify(existingData)); // Deep clone existing data

    // Get current date to determine which month is active
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 (January = 0)
    const currentMonthName = currentDate.toLocaleString("en-US", { month: "long" });

    console.log(`Current month: ${currentMonthName} ${currentYear}`);

    // Check if this is a first run (no data for August 2025)
    const hasAugustData = updatedData["2025"] && updatedData["2025"]["August"];
    const isFirstRun = !hasAugustData;
    
    if (isFirstRun) {
      console.log(`FIRST RUN DETECTED: No data found for August 2025`);
      console.log(`FIRST RUN: Will populate August 2025 with all historical data`);
    }

    // Create a map of all existing OPH_IDs across all months to prevent duplicates
    const existingOPHIDs = new Set();
    Object.keys(updatedData).forEach(year => {
      Object.keys(updatedData[year]).forEach(month => {
        updatedData[year][month].forEach(record => {
          existingOPHIDs.add(record.oph_id);
        });
      });
    });

    console.log(`Found ${existingOPHIDs.size} existing OPH_IDs in current data structure`);

    // First, organize all incoming data by both created_at and updated_at months
    // BUT ONLY process records that are relevant to current month or future months
    const organizedData = {};
    
    leaderboardData.forEach((record) => {
      // Get both creation and update dates (API returns snake_case)
      const createdAt = new Date(record.created_at);
      const updatedAt = new Date(record.updated_at);
      
      const createdYear = createdAt.getFullYear();
      const createdMonth = createdAt.getMonth();
      const createdMonthName = createdAt.toLocaleString("en-US", { month: "long" });
      
      const updatedYear = updatedAt.getFullYear();
      const updatedMonth = updatedAt.getMonth();
      const updatedMonthName = updatedAt.toLocaleString("en-US", { month: "long" });

      // Check if this record is relevant to current month or future months
      const isCreatedInCurrentOrFuture = (createdYear > currentYear) || 
                                        (createdYear === currentYear && createdMonth >= currentMonth);
      const isUpdatedInCurrentOrFuture = (updatedYear > currentYear) || 
                                        (updatedYear === currentYear && updatedMonth >= currentMonth);

      // For first run, process all records including historical data
      // For subsequent runs, only process records that are relevant to current or future months
      if (!isFirstRun && !isCreatedInCurrentOrFuture && !isUpdatedInCurrentOrFuture) {
        console.log(`SKIPPED: Record for OPH_ID: ${record.oph_id} is from past months only - not processing`);
        return; // Skip this record completely
      }

      if (isFirstRun) {
        console.log(`FIRST RUN: Processing all records including historical data for OPH_ID: ${record.oph_id}`);
      }

      // Place record in creation month
      if (isFirstRun || isCreatedInCurrentOrFuture) {
        if (!organizedData[createdYear]) organizedData[createdYear] = {};
        if (!organizedData[createdYear][createdMonthName]) organizedData[createdYear][createdMonthName] = [];
        
        // Check if this OPH_ID already exists in creation month
        const existingInCreatedMonth = organizedData[createdYear][createdMonthName].some(existingRecord => 
          existingRecord.oph_id === record.oph_id
        );
        
        if (!existingInCreatedMonth) {
          organizedData[createdYear][createdMonthName].push(record);
          console.log(`Added record for OPH_ID: ${record.oph_id} in ${createdMonthName} ${createdYear} (creation month)`);
        }
      }

      // Place record in update month (if different from creation)
      if ((isFirstRun || isUpdatedInCurrentOrFuture) && (createdYear !== updatedYear || createdMonth !== updatedMonth)) {
        if (!organizedData[updatedYear]) organizedData[updatedYear] = {};
        if (!organizedData[updatedYear][updatedMonthName]) organizedData[updatedYear][updatedMonthName] = [];
        
        // Check if this OPH_ID already exists in update month
        const existingInUpdatedMonth = organizedData[updatedYear][updatedMonthName].some(existingRecord => 
          existingRecord.oph_id === record.oph_id
        );
        
        if (!existingInUpdatedMonth) {
          organizedData[updatedYear][updatedMonthName].push(record);
          console.log(`Added record for OPH_ID: ${record.oph_id} in ${updatedMonthName} ${updatedYear} (update month)`);
        }
      } else if ((isFirstRun || isCreatedInCurrentOrFuture) && (isFirstRun || isUpdatedInCurrentOrFuture)) {
        console.log(`Record for OPH_ID: ${record.oph_id} created and updated in same month (${createdMonthName} ${createdYear})`);
      }
    });

    // Helper function to get all records from previous months (cumulative up to but not including target month)
    const getCumulativeRecordsUpToMonth = (targetYear, targetMonthName, data) => {
      const cumulativeRecords = new Map(); // Use Map to track latest version of each OPH_ID
      
      // Get all months/years that come before the target month
      Object.keys(data).forEach(year => {
        Object.keys(data[year]).forEach(month => {
          const yearNum = parseInt(year);
          const targetYearNum = parseInt(targetYear);
          
          // Parse month name to number (0-11)
          const monthNum = new Date(Date.parse(year + '-' + month + '-01')).getMonth();
          const targetMonthNum = new Date(Date.parse(targetYear + '-' + targetMonthName + '-01')).getMonth();
          
          // Include if year is before target year, or same year but month is before target month
          const isBeforeTarget = (yearNum < targetYearNum) || 
                                (yearNum === targetYearNum && monthNum < targetMonthNum);
          
          if (isBeforeTarget) {
            data[year][month].forEach(record => {
              // Keep the latest version of each OPH_ID
              const existing = cumulativeRecords.get(record.oph_id);
              if (!existing || new Date(record.updated_at) > new Date(existing.updated_at)) {
                cumulativeRecords.set(record.oph_id, record);
              }
            });
          }
        });
      });
      
      return Array.from(cumulativeRecords.values());
    };

    // Helper function to calculate difference (new or changed records in target month)
    const calculateMonthlyDifference = (targetYear, targetMonthName, newRecords, existingData) => {
      // Get all records that existed before this month (cumulative)
      const previousRecords = getCumulativeRecordsUpToMonth(targetYear, targetMonthName, existingData);
      const previousOPHIDs = new Set(previousRecords.map(r => r.oph_id));
      const previousRecordsMap = new Map(previousRecords.map(r => [r.oph_id, r]));
      
      // Find records that are new or changed
      const differences = [];
      
      newRecords.forEach(newRecord => {
        const ophId = newRecord.oph_id;
        const previousRecord = previousRecordsMap.get(ophId);
        
        if (!previousRecord) {
          // This is a completely new record
          differences.push(newRecord);
          console.log(`NEW: OPH_ID ${ophId} is new in ${targetMonthName} ${targetYear}`);
        } else {
          // Check if the record has changed (compare key fields)
          const hasChanged = 
            newRecord.song_count !== previousRecord.song_count ||
            newRecord.total_views !== previousRecord.total_views ||
            newRecord.score !== previousRecord.score ||
            new Date(newRecord.updated_at).getTime() !== new Date(previousRecord.updated_at).getTime();
          
          if (hasChanged) {
            differences.push(newRecord);
            console.log(`CHANGED: OPH_ID ${ophId} changed in ${targetMonthName} ${targetYear}`);
          }
        }
      });
      
      return differences;
    };

    // Now merge with existing data, calculating differences for each month
    Object.keys(organizedData).forEach(year => {
      if (!updatedData[year]) updatedData[year] = {};
      
      Object.keys(organizedData[year]).forEach(month => {
        const isCurrentMonth = (parseInt(year) === currentYear && 
                               new Date(Date.parse(year + '-' + month + '-01')).getMonth() === currentMonth);
        const isPastMonth = (parseInt(year) < currentYear) || 
                           (parseInt(year) === currentYear && 
                            new Date(Date.parse(year + '-' + month + '-01')).getMonth() < currentMonth);

        if (isFirstRun) {
          // For first run, calculate differences from empty (so all records are differences)
          const differences = calculateMonthlyDifference(year, month, organizedData[year][month], {});
          updatedData[year][month] = differences;
          console.log(`FIRST RUN: Set data for ${month} ${year} with ${differences.length} difference records (out of ${organizedData[year][month].length} total)`);
        } else if (isCurrentMonth) {
          // For current month, calculate differences from previous months
          const differences = calculateMonthlyDifference(year, month, organizedData[year][month], updatedData);
          
          // Replace current month data with only the differences
          updatedData[year][month] = differences;
          console.log(`CURRENT MONTH: Updated ${month} ${year} with ${differences.length} difference records (out of ${organizedData[year][month].length} total)`);
        } else if (!isPastMonth) {
          // For future months, calculate differences
          const differences = calculateMonthlyDifference(year, month, organizedData[year][month], updatedData);
          
          // Store only differences for future months
          updatedData[year][month] = differences;
          console.log(`FUTURE MONTH: Set data for ${month} ${year} with ${differences.length} difference records (out of ${organizedData[year][month].length} total)`);
        }
        // Note: Past months are preserved as-is (they already contain differences)
      });
    });

    // Count final records
    let totalFinalRecords = 0;
    Object.keys(updatedData).forEach(year => {
      Object.keys(updatedData[year]).forEach(month => {
        totalFinalRecords += updatedData[year][month].length;
      });
    });
    console.log(`Total final records after merge: ${totalFinalRecords}`);

    // Create local backup file first
    const localBackupPath = `./monthly_leaderboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    console.log("Creating local backup file...");
    fs.writeFileSync(localBackupPath, JSON.stringify(updatedData, null, 2));
    console.log(`Local backup created: ${localBackupPath}`);

    // save updated data to S3
    console.log("Uploading updated data to S3...");
    await saveToS3(S3_KEY, updatedData);

    console.log(`Successfully updated leaderboard metrics file in S3`);
    console.log(`Each month now stores only differences (new or changed records), not cumulative totals`);
    console.log(`Historical months are preserved, only current month (${currentMonthName} ${currentYear}) can be updated`);
    console.log(`Local backup available at: ${localBackupPath}`);
  } catch (err) {
    console.error("Error updating leaderboard metrics:", err.message);
    console.error(err);
  }
}

saveMonthlyLeaderboardMetrics();

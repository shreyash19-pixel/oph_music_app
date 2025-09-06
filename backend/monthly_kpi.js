// monthly_kpi.js
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

const S3_KEY = "monthly_kpi/kpi_metrics.json";

/*
HOW TO RUN THIS FILE:

1. Navigate to the backend directory:
   cd backend

2. Run the file directly with Node.js:
   node monthly_kpi.js

3. Or if you have nodemon installed for development:
   nodemon monthly_kpi.js

4. Or run it as a module:
   node -e "import('./monthly_kpi.js')"

Note: Make sure you have all required dependencies installed:
   npm install

The file will:
- Fetch KPI data from /kpi_monthly_score endpoint
- Process records and place them in both creation and update months
- Save results to S3 bucket
- Show detailed logging of what's happening
*/

async function saveMonthlyKPIMetrics() {
  try {
    console.log("Fetching /kpi_monthly_score ...");
    const response = await Backendaxios.get("/kpi_monthly_score");
    const raw = response.data ?? response;

    console.log("Raw response:", typeof raw, Array.isArray(raw) ? "Array" : "Object");
    console.log(raw);

    // ensure we have an array
    const kpiData = Array.isArray(raw) ? raw : raw.data ?? raw.kpi ?? [];
    if (!Array.isArray(kpiData)) {
      throw new Error("Expected API to return an array, got: " + JSON.stringify(raw));
    }

    console.log(`Processing ${kpiData.length} KPI records`);

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
          existingOPHIDs.add(record.OPH_ID);
        });
      });
    });

    console.log(`Found ${existingOPHIDs.size} existing OPH_IDs in current data structure`);

    // First, organize all incoming data by both created_at and updated_at months
    // BUT ONLY process records that are relevant to current month or future months
    const organizedData = {};
    
    kpiData.forEach((record) => {
      // Get both creation and update dates
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
        console.log(`SKIPPED: Record for OPH_ID: ${record.OPH_ID} is from past months only - not processing`);
        return; // Skip this record completely
      }

      if (isFirstRun) {
        console.log(`FIRST RUN: Processing all records including historical data for OPH_ID: ${record.OPH_ID}`);
      }

      // Place record in creation month
      if (isFirstRun || isCreatedInCurrentOrFuture) {
        if (!organizedData[createdYear]) organizedData[createdYear] = {};
        if (!organizedData[createdYear][createdMonthName]) organizedData[createdYear][createdMonthName] = [];
        
        // Check if this OPH_ID already exists in creation month
        const existingInCreatedMonth = organizedData[createdYear][createdMonthName].some(existingRecord => 
          existingRecord.OPH_ID === record.OPH_ID
        );
        
        if (!existingInCreatedMonth) {
          organizedData[createdYear][createdMonthName].push(record);
          console.log(`Added record for OPH_ID: ${record.OPH_ID} in ${createdMonthName} ${createdYear} (creation month)`);
        }
      }

      // Place record in update month (if different from creation)
      if ((isFirstRun || isUpdatedInCurrentOrFuture) && (createdYear !== updatedYear || createdMonth !== updatedMonth)) {
        if (!organizedData[updatedYear]) organizedData[updatedYear] = {};
        if (!organizedData[updatedYear][updatedMonthName]) organizedData[updatedYear][updatedMonthName] = [];
        
        // Check if this OPH_ID already exists in update month
        const existingInUpdatedMonth = organizedData[updatedYear][updatedMonthName].some(existingRecord => 
          existingRecord.OPH_ID === record.OPH_ID
        );
        
        if (!existingInUpdatedMonth) {
          organizedData[updatedYear][updatedMonthName].push(record);
          console.log(`Added record for OPH_ID: ${record.OPH_ID} in ${updatedMonthName} ${updatedYear} (update month)`);
        }
      } else if ((isFirstRun || isCreatedInCurrentOrFuture) && (isFirstRun || isUpdatedInCurrentOrFuture)) {
        console.log(`Record for OPH_ID: ${record.OPH_ID} created and updated in same month (${createdMonthName} ${createdYear})`);
      }
    });

    // Now merge with existing data, preserving historical months
    Object.keys(organizedData).forEach(year => {
      if (!updatedData[year]) updatedData[year] = {};
      
      Object.keys(organizedData[year]).forEach(month => {
        const isCurrentMonth = (parseInt(year) === currentYear && 
                               new Date(Date.parse(year + '-' + month + '-01')).getMonth() === currentMonth);
        const isPastMonth = (parseInt(year) < currentYear) || 
                           (parseInt(year) === currentYear && 
                            new Date(Date.parse(year + '-' + month + '-01')).getMonth() < currentMonth);

        if (isFirstRun) {
          // For first run, just use all organized data as-is
          updatedData[year][month] = organizedData[year][month];
          console.log(`FIRST RUN: Set data for ${month} ${year} with ${organizedData[year][month].length} records`);
        } else if (isCurrentMonth) {
          // For current month, only update records that were actually updated in current month
          if (!updatedData[year][month]) updatedData[year][month] = [];
          
          // Get records that were updated in current month (not just created)
          const currentMonthUpdatedRecords = organizedData[year][month].filter(record => {
            const updatedAt = new Date(record.updated_at);
            const updatedYear = updatedAt.getFullYear();
            const updatedMonth = updatedAt.getMonth();
            return updatedYear === currentYear && updatedMonth === currentMonth;
          });
          
          console.log(`Found ${currentMonthUpdatedRecords.length} records updated in current month (${month} ${year})`);
          
          // Update only the records that were actually updated in current month
          currentMonthUpdatedRecords.forEach(updatedRecord => {
            const existingIndex = updatedData[year][month].findIndex(existingRecord => 
              existingRecord.OPH_ID === updatedRecord.OPH_ID
            );
            
            if (existingIndex !== -1) {
              updatedData[year][month][existingIndex] = updatedRecord;
              console.log(`Updated record for OPH_ID: ${updatedRecord.OPH_ID} in current month (${month} ${year})`);
            } else {
              updatedData[year][month].push(updatedRecord);
              console.log(`Added new record for OPH_ID: ${updatedRecord.OPH_ID} in current month (${month} ${year})`);
            }
          });
          
          // Add any new records that were created in current month but not updated
          const currentMonthCreatedRecords = organizedData[year][month].filter(record => {
            const createdAt = new Date(record.created_at);
            const createdYear = createdAt.getFullYear();
            const createdMonth = createdAt.getMonth();
            const updatedAt = new Date(record.updated_at);
            const updatedYear = updatedAt.getFullYear();
            const updatedMonth = updatedAt.getMonth();
            
            // Only include if created in current month AND not updated in current month
            return (createdYear === currentYear && createdMonth === currentMonth) && 
                   !(updatedYear === currentYear && updatedMonth === currentMonth);
          });
          
          currentMonthCreatedRecords.forEach(newRecord => {
            const recordExists = updatedData[year][month].some(existingRecord => 
              existingRecord.OPH_ID === newRecord.OPH_ID
            );
            
            if (!recordExists) {
              updatedData[year][month].push(newRecord);
              console.log(`Added new record for OPH_ID: ${newRecord.OPH_ID} in current month (${month} ${year}) - created but not updated`);
            }
          });
        } else {
          // For future months, append new records without overwriting existing ones
          if (!updatedData[year][month]) updatedData[year][month] = [];
          
          organizedData[year][month].forEach(newRecord => {
            const recordExists = updatedData[year][month].some(existingRecord => 
              existingRecord.OPH_ID === newRecord.OPH_ID
            );
            
            if (!recordExists) {
              updatedData[year][month].push(newRecord);
              console.log(`Added new record for OPH_ID: ${newRecord.OPH_ID} in future month (${month} ${year})`);
            } else {
              // Update existing record only if the new one has a more recent updated_at
              const existingRecord = updatedData[year][month].find(existingRecord => 
                existingRecord.OPH_ID === newRecord.OPH_ID
              );
              
              if (existingRecord) {
                const existingUpdatedAt = new Date(existingRecord.updated_at);
                const newUpdatedAt = new Date(newRecord.updated_at);
                
                if (newUpdatedAt > existingUpdatedAt) {
                  const existingIndex = updatedData[year][month].findIndex(existingRecord => 
                    existingRecord.OPH_ID === newRecord.OPH_ID
                  );
                  updatedData[year][month][existingIndex] = newRecord;
                  console.log(`Updated record for OPH_ID: ${newRecord.OPH_ID} in future month (${month} ${year}) - newer data`);
                } else {
                  console.log(`PROTECTED: Kept existing record for OPH_ID: ${newRecord.OPH_ID} in future month (${month} ${year}) - existing data is newer`);
                }
              }
            }
          });
        }
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
    const localBackupPath = `./monthly_kpi_backup_${new Date().toISOString().split('T')[0]}.json`;
    console.log("Creating local backup file...");
    fs.writeFileSync(localBackupPath, JSON.stringify(updatedData, null, 2));
    console.log(`Local backup created: ${localBackupPath}`);

    // save updated data to S3
    console.log("Uploading updated data to S3...");
    await saveToS3(S3_KEY, updatedData);

    console.log(`Successfully updated KPI metrics file in S3`);
    console.log(`Historical months are preserved, only current month (${currentMonthName} ${currentYear}) can be updated`);
    console.log(`Local backup available at: ${localBackupPath}`);
  } catch (err) {
    console.error("Error updating KPI metrics:", err.message);
    console.error(err);
  }
}

saveMonthlyKPIMetrics();

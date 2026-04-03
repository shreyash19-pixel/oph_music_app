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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ophKey(record) {
  const id = record?.oph_id ?? record?.OPH_ID;
  return id == null ? "" : String(id).trim();
}

function normalizeKpiRecord(record) {
  const id = ophKey(record);
  if (!id) return null;
  return { ...record, oph_id: id };
}

/** Previous calendar month bucket in updatedData (for carry-forward). */
function getPreviousMonthBucket(updatedData, yearStr, monthName) {
  const yi = parseInt(yearStr, 10);
  const mi = MONTH_NAMES.indexOf(monthName);
  if (Number.isNaN(yi) || mi < 0) return null;
  if (mi === 0) {
    const py = String(yi - 1);
    const arr = updatedData[py]?.December;
    return Array.isArray(arr) && arr.length ? { y: py, m: "December" } : null;
  }
  const pm = MONTH_NAMES[mi - 1];
  const arr = updatedData[yearStr]?.[pm];
  return Array.isArray(arr) && arr.length ? { y: yearStr, m: pm } : null;
}

/**
 * The in-progress month must list every artist in KPI_score (like the old backups).
 * Previously we only merged rows updated *this* month, so after a month rollover
 * almost everyone disappeared until they were updated again.
 */
function applyCurrentMonthFullSnapshot(updatedData, kpiData, currentYear, currentMonthName) {
  const y = String(currentYear);
  if (!updatedData[y]) updatedData[y] = {};

  const prev = getPreviousMonthBucket(updatedData, y, currentMonthName);
  const byOph = new Map();

  if (prev) {
    const prevRows = updatedData[prev.y][prev.m];
    for (const r of prevRows) {
      const rec = normalizeKpiRecord(r);
      if (rec) byOph.set(rec.oph_id, rec);
    }
    console.log(
      `📋 Seeded ${currentMonthName} ${y} from ${prev.m} ${prev.y} (${byOph.size} rows)`,
    );
  }

  for (const row of kpiData) {
    const rec = normalizeKpiRecord(row);
    if (rec) byOph.set(rec.oph_id, rec);
  }

  updatedData[y][currentMonthName] = Array.from(byOph.values());
  console.log(
    `✅ Full snapshot for ${currentMonthName} ${y}: ${updatedData[y][currentMonthName].length} artists (all KPI rows overlaid)`,
  );
}

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
          existingOPHIDs.add(record.oph_id);
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

    // Now merge with existing data, preserving historical months
    Object.keys(organizedData).forEach(year => {
      if (!updatedData[year]) updatedData[year] = {};
      
      Object.keys(organizedData[year]).forEach(month => {
        const isCurrentMonth = (parseInt(year) === currentYear && 
                               new Date(Date.parse(year + '-' + month + '-01')).getMonth() === currentMonth);
        if (isFirstRun) {
          // For first run, just use all organized data as-is
          updatedData[year][month] = organizedData[year][month];
          console.log(`FIRST RUN: Set data for ${month} ${year} with ${organizedData[year][month].length} records`);
        } else if (isCurrentMonth) {
          // Filled by applyCurrentMonthFullSnapshot after this loop (all KPI rows + carry-forward).
          console.log(
            `Skipping partial merge for current month ${month} ${year} (full snapshot applied next)`,
          );
        } else {
          // For future months, append new records without overwriting existing ones
          if (!updatedData[year][month]) updatedData[year][month] = [];
          
          organizedData[year][month].forEach(newRecord => {
            const recordExists = updatedData[year][month].some(existingRecord => 
              existingRecord.oph_id === newRecord.oph_id
            );
            
            if (!recordExists) {
              updatedData[year][month].push(newRecord);
              console.log(`Added new record for OPH_ID: ${newRecord.oph_id} in future month (${month} ${year})`);
            } else {
              // Update existing record only if the new one has a more recent updated_at
              const existingRecord = updatedData[year][month].find(existingRecord => 
                existingRecord.oph_id === newRecord.oph_id
              );
              
              if (existingRecord) {
                const existingUpdatedAt = new Date(existingRecord.updated_at);
                const newUpdatedAt = new Date(newRecord.updated_at);
                
                if (newUpdatedAt > existingUpdatedAt) {
                  const existingIndex = updatedData[year][month].findIndex(existingRecord => 
                    existingRecord.oph_id === newRecord.oph_id
                  );
                  updatedData[year][month][existingIndex] = newRecord;
                  console.log(`Updated record for OPH_ID: ${newRecord.oph_id} in future month (${month} ${year}) - newer data`);
                } else {
                  console.log(`PROTECTED: Kept existing record for OPH_ID: ${newRecord.oph_id} in future month (${month} ${year}) - existing data is newer`);
                }
              }
            }
          });
        }
      });
    });

    applyCurrentMonthFullSnapshot(
      updatedData,
      kpiData,
      currentYear,
      currentMonthName,
    );

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
    console.log(
      `Historical months are preserved; ${currentMonthName} ${currentYear} is a full KPI snapshot (seeded from prior month, overlaid with all KPI_score rows)`,
    );
    console.log(`Local backup available at: ${localBackupPath}`);
  } catch (err) {
    console.error("Error updating KPI metrics:", err.message);
    console.error(err);
  }
}

saveMonthlyKPIMetrics();

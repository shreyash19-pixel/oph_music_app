#!/usr/bin/env node
/**
 * Cron Job Runner Script
 * 
 * This script runs scheduled tasks with proper logging and error handling.
 * Usage: node cron-runner.js <task-name>
 * 
 * Available tasks:
 * - kpi: Calculate and update KPI scores (daily)
 * - leaderboard: Generate and update leaderboard scores (daily)
 * - monthly-kpi: Save monthly KPI metrics to S3 (monthly)
 * - monthly-leaderboard: Save monthly leaderboard metrics to S3 (monthly)
 * - monthly-song: Save monthly song metrics to S3 (monthly)
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, `cron-${new Date().toISOString().split('T')[0]}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

function error(message) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ERROR: ${message}\n`;
  process.stderr.write(errorMessage);
  logStream.write(errorMessage);
}

// Get task name from command line
const taskName = process.argv[2];

if (!taskName) {
  error("No task name provided. Usage: node cron-runner.js <task-name>");
  process.exit(1);
}

// Get backend directory path
const backendDir = path.join(__dirname, "..");

// Change to backend directory
process.chdir(backendDir);

// Load NVM if available (for EC2 deployment)
const nvmPath = process.env.NVM_DIR || path.join(process.env.HOME || "/root", ".nvm");
const nvmSh = path.join(nvmPath, "nvm.sh");

if (fs.existsSync(nvmSh)) {
  // Set up environment for NVM
  process.env.NVM_DIR = nvmPath;
  // Note: NVM requires sourcing, which is handled by the cron job itself
  log(`NVM detected at: ${nvmPath}`);
}

log(`Starting cron task: ${taskName}`);
log(`Working directory: ${process.cwd()}`);

// Map task names to their corresponding files (relative to backend directory)
const taskMap = {
  'kpi': 'kpi.js',
  'leaderboard': 'leaderboard.js',
  'monthly-kpi': 'monthly_kpi.js',
  'monthly-leaderboard': 'monthly_leaderboard.js',
  'monthly-song': 'monthly_song.js'
};

const taskFileName = taskMap[taskName];

if (!taskFileName) {
  error(`Unknown task: ${taskName}`);
  error(`Available tasks: ${Object.keys(taskMap).join(', ')}`);
  process.exit(1);
}

// Resolve absolute path to task file
const taskFilePath = path.resolve(backendDir, taskFileName);

// Check if task file exists
if (!fs.existsSync(taskFilePath)) {
  error(`Task file not found: ${taskFilePath}`);
  error(`Backend directory: ${backendDir}`);
  error(`Looking for: ${taskFileName}`);
  process.exit(1);
}

log(`Task file found: ${taskFilePath}`);

// Run the task
const startTime = Date.now();
log(`Executing: ${taskFileName}`);

// Handle uncaught errors globally
process.on('uncaughtException', (err) => {
  error(`Uncaught exception in task ${taskName}: ${err.message}`);
  error(err.stack);
  logStream.end();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled rejection in task ${taskName}: ${reason}`);
  if (reason && reason.stack) {
    error(reason.stack);
  }
  logStream.end();
  process.exit(1);
});

// Set a maximum execution time (30 minutes)
const MAX_EXECUTION_TIME = 30 * 60 * 1000;
const timeout = setTimeout(() => {
  error(`Task ${taskName} exceeded maximum execution time (30 minutes)`);
  logStream.end();
  process.exit(1);
}, MAX_EXECUTION_TIME);

// Function to complete the task
function completeTask(success = true, message = '') {
  clearTimeout(timeout);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  if (success) {
    log(`Task ${taskName} completed successfully`);
    if (message) log(message);
  } else {
    error(`Task ${taskName} failed: ${message}`);
  }
  
  log(`Duration: ${duration} seconds`);
  logStream.end();
  process.exit(success ? 0 : 1);
}

try {
  // Import and run the task
  // For ES modules (kpi.js, leaderboard.js), we'll need to handle them differently
  if (taskFileName === 'kpi.js' || taskFileName === 'leaderboard.js') {
    // These are ES modules, need to use dynamic import
    // Note: These scripts auto-execute, so we just need to wait for them
    log(`Loading ES module: ${taskFilePath}`);
    
    import(taskFilePath)
      .then(() => {
        // ES modules that auto-execute - wait a bit for async operations to complete
        // The scripts themselves handle their own async operations
        log(`ES module loaded, waiting for async operations to complete...`);
        setTimeout(() => {
          completeTask(true);
        }, 10000); // Give 10 seconds for async operations
      })
      .catch((err) => {
        completeTask(false, err.message + '\n' + (err.stack || ''));
      });
  } else {
    // These are CommonJS modules that auto-execute
    log(`Loading CommonJS module: ${taskFilePath}`);
    require(taskFilePath);
    
    // For monthly scripts that auto-run, wait for async operations
    // They have their own async functions that complete
    log(`CommonJS module loaded, waiting for async operations to complete...`);
    setTimeout(() => {
      completeTask(true);
    }, 60000); // Give 60 seconds for monthly scripts (they do S3 operations)
  }
} catch (err) {
  completeTask(false, err.message + '\n' + (err.stack || ''));
}


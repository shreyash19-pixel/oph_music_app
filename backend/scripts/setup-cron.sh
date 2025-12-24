#!/bin/bash

# Cron Job Setup Script for OPH Music App
# This script sets up cron jobs for scheduled tasks on AWS EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"

echo -e "${GREEN}Setting up cron jobs for OPH Music App${NC}"
echo "Backend directory: $BACKEND_DIR"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}Warning: Running as root. Consider using a non-root user.${NC}"
fi

# Detect NVM path
if [ -d "$HOME/.nvm" ]; then
    NVM_DIR="$HOME/.nvm"
elif [ -d "/root/.nvm" ]; then
    NVM_DIR="/root/.nvm"
else
    echo -e "${YELLOW}Warning: NVM not found. Make sure Node.js is in PATH.${NC}"
    NVM_DIR=""
fi

# Create logs directory if it doesn't exist
LOGS_DIR="$BACKEND_DIR/logs"
mkdir -p "$LOGS_DIR"
echo -e "${GREEN}✓${NC} Logs directory: $LOGS_DIR"

# Make cron-runner.js executable
chmod +x "$SCRIPT_DIR/cron-runner.js"
echo -e "${GREEN}✓${NC} Made cron-runner.js executable"

# Create a temporary cron file
CRON_TEMP=$(mktemp)

# Backup existing crontab
if crontab -l > /dev/null 2>&1; then
    echo -e "${YELLOW}Backing up existing crontab...${NC}"
    crontab -l > "$CRON_TEMP.backup"
    crontab -l > "$CRON_TEMP"
    echo -e "${GREEN}✓${NC} Backup saved to: $CRON_TEMP.backup"
else
    echo -e "${YELLOW}No existing crontab found. Creating new one.${NC}"
    touch "$CRON_TEMP"
fi

# Check if cron jobs already exist
if grep -q "OPH Music App Cron Jobs" "$CRON_TEMP" 2>/dev/null; then
    echo -e "${YELLOW}OPH Music App cron jobs already exist.${NC}"
    read -p "Do you want to replace them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cancelled.${NC}"
        rm -f "$CRON_TEMP"
        exit 0
    fi
    # Remove existing OPH cron jobs
    sed -i '/# OPH Music App Cron Jobs/,/# End OPH Music App Cron Jobs/d' "$CRON_TEMP"
fi

# Build the cron job commands
# Note: All times are in UTC. Adjust as needed for your timezone.

# Setup NVM source command if NVM exists
NVM_SOURCE=""
if [ -n "$NVM_DIR" ]; then
    NVM_SOURCE="export NVM_DIR=\"$NVM_DIR\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && nvm use 22.21.1 > /dev/null 2>&1 && "
fi

# Add header
echo "" >> "$CRON_TEMP"
echo "# OPH Music App Cron Jobs" >> "$CRON_TEMP"
echo "# Generated on $(date)" >> "$CRON_TEMP"
echo "# All times are in UTC" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

# Daily tasks - Run at midnight UTC (12:00 AM)
echo "# Daily KPI calculation - Runs at midnight UTC (12:00 AM) daily" >> "$CRON_TEMP"
echo "0 0 * * * cd $BACKEND_DIR && $NVM_SOURCE node scripts/cron-runner.js kpi >> $LOGS_DIR/cron-kpi.log 2>&1" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

echo "# Daily Leaderboard generation - Runs at midnight UTC (12:00 AM) daily" >> "$CRON_TEMP"
echo "0 0 * * * cd $BACKEND_DIR && $NVM_SOURCE node scripts/cron-runner.js leaderboard >> $LOGS_DIR/cron-leaderboard.log 2>&1" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

# Monthly tasks - Run on the 1st of each month at midnight UTC (12:00 AM)
echo "# Monthly KPI metrics backup - Runs on 1st of each month at midnight UTC (12:00 AM)" >> "$CRON_TEMP"
echo "0 0 1 * * cd $BACKEND_DIR && $NVM_SOURCE node scripts/cron-runner.js monthly-kpi >> $LOGS_DIR/cron-monthly-kpi.log 2>&1" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

echo "# Monthly Leaderboard metrics backup - Runs on 1st of each month at midnight UTC (12:00 AM)" >> "$CRON_TEMP"
echo "0 0 1 * * cd $BACKEND_DIR && $NVM_SOURCE node scripts/cron-runner.js monthly-leaderboard >> $LOGS_DIR/cron-monthly-leaderboard.log 2>&1" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

echo "# Monthly Song metrics backup - Runs on 1st of each month at midnight UTC (12:00 AM)" >> "$CRON_TEMP"
echo "0 0 1 * * cd $BACKEND_DIR && $NVM_SOURCE node scripts/cron-runner.js monthly-song >> $LOGS_DIR/cron-monthly-song.log 2>&1" >> "$CRON_TEMP"
echo "" >> "$CRON_TEMP"

echo "# End OPH Music App Cron Jobs" >> "$CRON_TEMP"

# Install the new crontab
echo ""
echo -e "${GREEN}Installing cron jobs...${NC}"
crontab "$CRON_TEMP"
rm -f "$CRON_TEMP"

echo ""
echo -e "${GREEN}✓ Cron jobs installed successfully!${NC}"
echo ""
echo "Installed cron jobs:"
echo "  - Daily KPI calculation: midnight UTC (12:00 AM)"
echo "  - Daily Leaderboard generation: midnight UTC (12:00 AM)"
echo "  - Monthly KPI backup: 1st of month, midnight UTC (12:00 AM)"
echo "  - Monthly Leaderboard backup: 1st of month, midnight UTC (12:00 AM)"
echo "  - Monthly Song backup: 1st of month, midnight UTC (12:00 AM)"
echo ""
echo "To view your cron jobs, run: crontab -l"
echo "To edit cron jobs, run: crontab -e"
echo "To remove OPH cron jobs, run: crontab -e (then delete the OPH section)"
echo ""
echo -e "${YELLOW}Note: Make sure your .env file is properly configured in $BACKEND_DIR${NC}"
echo -e "${YELLOW}Logs will be written to: $LOGS_DIR${NC}"


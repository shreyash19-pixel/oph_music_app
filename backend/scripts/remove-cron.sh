#!/bin/bash
# Remove cron jobs for OPH Music App (or entire user crontab with --all).
# Run on the server as the same user whose crontab you use for the app (often deploy user).

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$BACKEND_DIR/logs"
mkdir -p "$LOGS_DIR"

BACKUP="$LOGS_DIR/crontab-backup-$(date +%Y%m%d-%H%M%S).txt"

if ! crontab -l >"$BACKUP" 2>/dev/null; then
  echo -e "${YELLOW}No crontab for user $(whoami). Nothing to remove.${NC}"
  exit 0
fi

echo -e "${GREEN}Backed up crontab to:${NC} $BACKUP"

if [ "${1:-}" = "--all" ]; then
  echo -e "${RED}This removes the ENTIRE crontab for user $(whoami) (every job, not only OPH).${NC}"
  read -r -p "Type YES to confirm: " confirm
  if [ "$confirm" != "YES" ]; then
    echo "Cancelled."
    exit 1
  fi
  crontab -r
  echo -e "${GREEN}Done. Crontab cleared.${NC}"
  echo "Restore from backup if needed: crontab \"$BACKUP\""
  exit 0
fi

TMP=$(mktemp)
sed '/# OPH Music App Cron Jobs/,/# End OPH Music App Cron Jobs/d' "$BACKUP" >"$TMP"
crontab "$TMP"
rm -f "$TMP"

echo -e "${GREEN}Removed OPH block (between # OPH Music App Cron Jobs and # End OPH Music App Cron Jobs).${NC}"
echo "Reinstall: cd $BACKEND_DIR && chmod +x scripts/setup-cron.sh && ./scripts/setup-cron.sh"

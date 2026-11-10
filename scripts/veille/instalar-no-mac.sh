#!/bin/bash
# Schedules scripts/veille/rodar-no-mac.sh every day at 12:00 (Paris/Ajaccio time = 08:00 in Brasília in winter).
# If the Mac is asleep at that time, macOS runs it at wake-up. Uninstall: launchctl bootout gui/$(id -u)/com.tadireito.veille
set -eu
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.tadireito.veille.plist"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/TaDireito-Veille"
chmod +x "$REPO/scripts/veille/rodar-no-mac.sh"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.tadireito.veille</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>$REPO/scripts/veille/rodar-no-mac.sh</string></array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$HOME/TaDireito-Veille/launchd.log</string>
  <key>StandardErrorPath</key><string>$HOME/TaDireito-Veille/launchd.log</string>
</dict>
</plist>
PLIST
launchctl bootout "gui/$(id -u)/com.tadireito.veille" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Veille programmée tous les jours à 12:00 (heure du Mac). Rapports : ~/TaDireito-Veille/"

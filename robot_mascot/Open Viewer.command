#!/bin/bash
# Start local server and open robot viewer
cd "$(dirname "$0")"
echo "Starting server at http://localhost:8765"
# Kill any existing server on this port
lsof -ti:8765 | xargs kill -9 2>/dev/null
# Start Python server in background
python3 -m http.server 8765 &
SERVER_PID=$!
sleep 1
# Open in default browser
open http://localhost:8765/robot_wave_viewer.html
echo "Viewer opened. Press Ctrl+C to stop the server."
wait $SERVER_PID

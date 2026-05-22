#!/bin/bash
# Example server control script for testing Servers GUI
# Usage: ./example.sh [start|stop|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/example.pid"
LOG_FILE="$SCRIPT_DIR/example.log"

start() {
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "Server is already running (PID: $(cat $PID_FILE))"
    exit 1
  fi
  
  # Start a long-running process (sleep infinity) as example
  # In real use, replace with your actual server command
  nohup sleep infinity > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  echo "Server started with PID: $(cat $PID_FILE)"
}

stop() {
  if [ ! -f "$PID_FILE" ]; then
    echo "Server is not running (no PID file)"
    exit 1
  fi
  
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm "$PID_FILE"
    echo "Server stopped"
  else
    rm "$PID_FILE"
    echo "Server was not running (cleaned up PID file)"
  fi
}

status() {
  if [ ! -f "$PID_FILE" ]; then
    echo "Server is not running"
    exit 1
  fi
  
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Server is running (PID: $PID)"
    exit 0
  else
    echo "Server is not running (but PID file exists)"
    rm "$PID_FILE"
    exit 1
  fi
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  status)
    status
    ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
    exit 1
esac
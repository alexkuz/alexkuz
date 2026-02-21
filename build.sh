#!/bin/sh

WATCH_MODE=false

# Parse command line arguments
while getopts "w" opt; do
  case $opt in
    w)
      WATCH_MODE=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

build() {
  echo "Building project..."
  
  TEXT="Alexander Kuznetsov Frontend developer CV"
  
  ENC_TEXT=$(echo "$TEXT" | jq -sRr @uri)
  
  rm -rf alexkuz.me/fonts
  
  npx webfont-dl "https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap&text=$ENC_TEXT" \
  	--css-rel "fonts" \
  	-o alexkuz.me/fonts/font.css
  
  npx html-inline-external --src src/index.html --dest alexkuz.me/index.html
  
  echo "Build completed at $(date '+%H:%M:%S')"
}

# Initial build
build

# Watch mode
if [ "$WATCH_MODE" = true ]; then
  echo "Watching src directory for changes..."
  echo "Press Ctrl+C to stop"
  
  # Check if inotifywait is available
  if ! command -v inotifywait >/dev/null 2>&1; then
    echo "Error: inotifywait is not installed. Please install inotify-tools:"
    echo "  sudo apt-get install inotify-tools"
    exit 1
  fi
  
  while true; do
    inotifywait -r -e modify,create,delete,move src/ 2>/dev/null
    echo ""
    build
  done
fi

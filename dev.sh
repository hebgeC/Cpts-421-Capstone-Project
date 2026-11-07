#!/bin/bash
# Runs the backend and Expo dev server side-by-side in one terminal window,
# using tmux so Expo gets a real TTY (needed for its QR code to render —
# it breaks under plain pipes/`concurrently`).
set -e
cd "$(dirname "$0")"

SESSION=trm-dev

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux attach -t "$SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n dev -c "$PWD/backend" "npm run dev"
tmux split-window -h -t "$SESSION" -c "$PWD/frontend" "npx expo start"
tmux attach -t "$SESSION"

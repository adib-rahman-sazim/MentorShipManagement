#!/bin/bash

SESSION="build-test-lint"

# Define your project working directory
# e.g, WORKDIR="$HOME/Engineering/fullcourt/fullcourt-frontend"
WORKDIR="."

if [ -n "$TMUX" ]; then
  echo "Warning: Already inside a tmux session. Unsetting TMUX to avoid nesting."
  unset TMUX
fi


if tmux has-session -t $SESSION 2>/dev/null; then
  echo "Session '$SESSION' already exists. Killing the existing session."
  tmux kill-session -t $SESSION
fi

tmux new-session -d -s $SESSION

# Create a new window for build, test, and lint
tmux new-window -t $SESSION -n "Build-Test-Lint"

# Run 'pnpm run build' in the current pane
tmux send-keys -t $SESSION:Build-Test-Lint "cd $WORKDIR && pnpm run build" C-m

# Create a horizontal split and run 'pnpm run lint' in the new pane
tmux split-window -h -t $SESSION:Build-Test-Lint
tmux send-keys -t $SESSION:Build-Test-Lint.1 "cd $WORKDIR && pnpm run lint" C-m

# Create a horizontal split and run 'pnpm run test' in the new pane
tmux split-window -h -t $SESSION:Build-Test-Lint
tmux send-keys -t $SESSION:Build-Test-Lint.2 "cd $WORKDIR && pnpm run test" C-m

# Attach to the session
tmux attach -t $SESSION

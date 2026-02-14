#!/bin/bash

echo "🛑 Stopping PantryPal..."

# Stop using PIDs file if it exists
if [ -f .pids ]; then
    while read pid; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "✓ Stopped process $pid"
        fi
    done < .pids
    rm .pids
fi

# Fallback: kill by process name
pkill -f "python main.py" 2>/dev/null && echo "✓ Stopped backend"
pkill -f "vite" 2>/dev/null && echo "✓ Stopped frontend"

echo ""
echo "✅ PantryPal stopped"

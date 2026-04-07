#!/bin/bash
# Move to the folder where this script is located
cd "$(dirname "$0")"

echo "--- Starting MASSUM AI Assistant ---"

# Activate your virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "Virtual environment activated."
else
    echo "ERROR: .venv folder not found! Make sure you ran 'python3 -m venv .venv' first."
    read -p "Press Enter to exit..."
    exit 1
fi

# Run the Flask server
python3 backend.py
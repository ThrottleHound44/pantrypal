#!/bin/bash

# Install dependencies
pip install --break-system-packages -r requirements.txt

# Start MongoDB (if not running)
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db 2>/dev/null || true

# Start FastAPI server
python main.py

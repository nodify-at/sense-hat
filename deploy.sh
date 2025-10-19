#!/bin/bash

# Deployment script for Sense HAT project
# Syncs project files to Raspberry Pi

TARGET_HOST="192.168.0.187"
TARGET_USER="nodify"
TARGET_PATH="/home/nodify/sense-hat2"

echo "🚀 Deploying to ${TARGET_USER}@${TARGET_HOST}:${TARGET_PATH}"

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.idea' \
  --exclude '*.iml' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  ./ ${TARGET_USER}@${TARGET_HOST}:${TARGET_PATH}

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed!"
  exit 1
fi

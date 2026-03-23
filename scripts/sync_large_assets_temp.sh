#!/bin/bash

BUCKET="gs://curify-static"
SOURCE_DIR="./public"

echo "⏫ Syncing assets to $BUCKET ..."

# DATA
# 1️⃣ Sync largest JSON (CRITICAL)
echo "🚨 Syncing nanobanana.json ..."
gsutil cp "$SOURCE_DIR/data/nanobanana.json" "$BUCKET/data/nanobanana.json"

# IMAGES
# gsutil -m rsync -r -x ".*\.(?!jpg$|jpeg$|png$|webp$).*" "$SOURCE_DIR/images/" "$BUCKET/images/"

echo "✨ Done syncing assets to GCS!"

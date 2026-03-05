#!/bin/bash

BUCKET="gs://curify-static"
SOURCE_DIR="./public"

echo "⏫ Syncing assets to $BUCKET ..."

# IMAGES
gsutil -m rsync -r -x ".*\.(?!jpg$|jpeg$|png$|webp$).*" "$SOURCE_DIR/images/" "$BUCKET/images/"

echo "✨ Done syncing assets to GCS!"

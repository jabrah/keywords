#!/usr/bin/env bash
set -euo pipefail

DERIVATIVES_DIR="img/derivatives/simple"
RAW_IMAGES_DIR="_data/raw_images/keywords"

needs_regen=false

if [ ! -d "$DERIVATIVES_DIR" ]; then
  echo "Derivatives directory does not exist. Regeneration needed."
  needs_regen=true
else
  # Get the creation time of the derivatives directory (birth time if available, else modification time)
  dir_timestamp=$(stat -c '%W' "$DERIVATIVES_DIR" 2>/dev/null)
  if [ "$dir_timestamp" = "0" ] || [ -z "$dir_timestamp" ]; then
    # Birth time not available, fall back to modification time
    dir_timestamp=$(stat -c '%Y' "$DERIVATIVES_DIR")
  fi

  echo "Derivatives directory timestamp: $(date -d @"$dir_timestamp")"

  # Check if any raw image has been modified after the derivatives directory was created
  while IFS= read -r -d '' file; do
    file_mtime=$(stat -c '%Y' "$file")
    if [ "$file_mtime" -gt "$dir_timestamp" ]; then
      echo "Newer file detected: $file (modified $(date -d @"$file_mtime"))"
      needs_regen=true
      break
    fi
  done < <(find "$RAW_IMAGES_DIR" -type f -print0 2>/dev/null)
fi

if [ "$needs_regen" = true ]; then
  echo "Regenerating site assets..."

  # Clear out old image derivatives
  rm -rf img/

  # Generate images for website
  bundle exec rake wax:derivatives:simple keywords

  # Remove old generated pages
  rm -f _keywords/*.md _keywords_descriptions/*.md _people/*.md

  # Generate website pages
  bundle exec rake wax:pages keywords
  bundle exec rake wax:pages keywords_descriptions
  bundle exec rake wax:pages people

  # Update search index
  bundle exec rake wax:search main

  echo "Regeneration complete."
else
  echo "No changes detected. Site assets are up to date."
fi

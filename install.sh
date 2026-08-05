#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_ROOT="${1:-$HOME/MagicMirror}"
TARGET_DIR="$TARGET_ROOT/modules/MMM-SchoolLunchMenu"

if [[ ! -d "$TARGET_ROOT" ]]; then
  echo "MagicMirror directory not found: $TARGET_ROOT" >&2
  echo "Pass your MagicMirror root as the first argument if it lives elsewhere." >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT/modules"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

rsync -a \
  --exclude ".git" \
  --exclude ".gitignore" \
  --exclude "node_modules" \
  --exclude ".DS_Store" \
  "$SOURCE_DIR/" "$TARGET_DIR/"

chmod +x "$TARGET_DIR/install.sh"

echo "MMM-SchoolLunchMenu installed to: $TARGET_DIR"
echo "Add the module to your MagicMirror config and restart MagicMirror."

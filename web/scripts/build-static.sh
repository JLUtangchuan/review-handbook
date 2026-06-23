#!/usr/bin/env bash
# ============================================================
# build-static.sh — Static export build for GitHub Pages
#
# Next.js output: 'export' rejects API routes in app/api/.
# This script temporarily hides app/api/ and swaps the config
# during the build, then restores everything.
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(dirname "$SCRIPT_DIR")"
cd "$WEB_DIR"

CONFIG="next.config.ts"
CONFIG_EXPORT="next.config.export.ts"
CONFIG_BACKUP="next.config.ts.bak"
API_DIR="src/app/api"
API_BACKUP=".api.bak"

cleanup() {
  # Restore original config
  if [ -f "$CONFIG_BACKUP" ]; then
    mv "$CONFIG_BACKUP" "$CONFIG"
    echo "  ✓ Restored $CONFIG"
  fi
  # Restore api/ directory
  if [ -d "$API_BACKUP" ]; then
    mv "$API_BACKUP" "$API_DIR"
    echo "  ✓ Restored $API_DIR"
  fi
}
trap cleanup EXIT

echo "=== Building static export for GitHub Pages ==="

# Step 1: Hide API routes (they cause build errors with output: 'export')
if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$API_BACKUP"
  echo "  → Temporarily moved $API_DIR out of build scope"
fi

# Step 2: Swap config to export version
mv "$CONFIG" "$CONFIG_BACKUP"
cp "$CONFIG_EXPORT" "$CONFIG"
echo "  → Switched to export config ($CONFIG_EXPORT)"

# Step 3: Build
echo "  → Running next build..."
npx next build

echo "=== Static build complete: web/out/ ==="

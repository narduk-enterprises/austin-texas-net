#!/usr/bin/env bash
# Pull production D1 and load it as the local dev database.
# Requires: doppler (for CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_TOKEN, etc.)
set -e
cd "$(dirname "$0")/.."
DB_NAME="austin-texas-net"
mkdir -p .data
echo "Exporting production D1 to .data/prod-export.sql ..."
doppler run -- wrangler d1 export "$DB_NAME" --remote --output=.data/prod-export.sql
echo "Clearing local D1 state ..."
rm -rf .wrangler/state/v3/d1 2>/dev/null || true
echo "Importing into local D1 ..."
wrangler d1 execute "$DB_NAME" --local --file=.data/prod-export.sql
echo "Done. Local DB is now seeded from prod."

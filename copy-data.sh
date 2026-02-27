#!/bin/bash
set -e
set -x

cd /Users/narduk/code/austin-texas-net-v2/app/data

# Safely copy everything
cp /Users/narduk/old-code/reference/atx-apps/bat-bridge/app/data/locations.ts bat-spots.ts
cp /Users/narduk/old-code/reference/atx-apps/chicken-shit-bingo/app/data/locations.ts chicken-shit-bingo-locations.ts
cp /Users/narduk/old-code/reference/atx-apps/disc-golf/app/data/courses.ts disc-golf-courses.ts
cp /Users/narduk/old-code/reference/atx-apps/games/app/data/locations.ts arcade-games.ts || true # Might not exist
cp /Users/narduk/old-code/reference/atx-apps/haunted-austin/app/data/locations.ts haunted-locations.ts
cp /Users/narduk/old-code/reference/atx-apps/kayak-launches/app/data/water-bodies.ts kayak-launches.ts
cp /Users/narduk/old-code/reference/atx-apps/rodeo-austin/app/data/events.ts rodeo-events.ts
cp /Users/narduk/old-code/reference/atx-apps/street-art/app/data/murals.ts murals.ts

echo "Done copying data files"

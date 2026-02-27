#!/bin/bash
set -e
set -x

cd /Users/narduk/code/austin-texas-net-v2/app/data

# Safely copy exactly the files that exist
cp /Users/narduk/old-code/reference/atx-apps/bat-bridge/app/data/bat-facts.ts bat-facts.ts || true
cp /Users/narduk/old-code/reference/atx-apps/bat-bridge/app/data/viewing-spots.ts bat-spots.ts || true
cp /Users/narduk/old-code/reference/atx-apps/chicken-shit-bingo/app/data/bingo.ts chicken-shit-bingo-locations.ts || true
cp /Users/narduk/old-code/reference/atx-apps/disc-golf/app/data/courses.ts disc-golf-courses.ts || true
cp /Users/narduk/old-code/reference/atx-apps/haunted-austin/app/data/places.ts haunted-locations.ts || true
cp /Users/narduk/old-code/reference/atx-apps/kayak-launches/app/data/launches.ts kayak-launches.ts
cp /Users/narduk/old-code/reference/atx-apps/rodeo-austin/app/data/events.ts rodeo-events.ts || true
cp /Users/narduk/old-code/reference/atx-apps/street-art/app/data/murals.ts murals.ts || true

echo "Done mapping data files properly!"

/**
 * google-places — Server utility for Google Places API (New).
 *
 * Uses the Places API (New) endpoints at places.googleapis.com
 * to find Google Place IDs and fetch place photos for map spots.
 * Auth: API key (GOOGLE_PLACES_API_KEY from Doppler).
 */

interface PlacePhoto {
  name: string // e.g. "places/ChIJ.../photos/AUacSh..."
  widthPx: number
  heightPx: number
  authorAttributions: Array<{
    displayName: string
    uri: string
    photoUri: string
  }>
}

interface TextSearchPlace {
  id: string
  displayName: { text: string; languageCode: string }
  photos?: PlacePhoto[]
}

export interface SpotPhotoResult {
  googlePlaceId: string
  photoUrl: string
  photoAttribution: string
}

/**
 * Get the Google Places API key from runtime config.
 */
function getApiKey(): string {
  const config = useRuntimeConfig()
  const key = (config as Record<string, string>).googlePlacesApiKey || ''
  if (!key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GOOGLE_PLACES_API_KEY not configured',
    })
  }
  return key
}

/**
 * Find a Google Place ID by searching for a business name near a location.
 * Uses Text Search (New): POST https://places.googleapis.com/v1/places:searchText
 */
export async function findGooglePlace(
  name: string,
  lat: number,
  lng: number,
): Promise<TextSearchPlace | null> {
  const apiKey = getApiKey()

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
    },
    body: JSON.stringify({
      textQuery: `${name} Austin TX`,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 1000.0, // 1km radius
        },
      },
      maxResultCount: 1,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[google-places] Text Search failed for "${name}": ${response.status} ${error}`)
    return null
  }

  const data = (await response.json()) as { places?: TextSearchPlace[] }
  return data.places?.[0] ?? null
}

/**
 * Get the photo URL for a photo resource name.
 * Uses Place Photos (New): GET https://places.googleapis.com/v1/{NAME}/media
 *
 * With skipHttpRedirect=true, returns a JSON object with the photoUri.
 */
export async function getPhotoUrl(
  photoResourceName: string,
  maxWidthPx = 400,
): Promise<string | null> {
  const apiKey = getApiKey()

  const url = `https://places.googleapis.com/v1/${photoResourceName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true&key=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    console.error(`[google-places] Photo fetch failed for ${photoResourceName}: ${response.status}`)
    return null
  }

  const data = (await response.json()) as { photoUri?: string; name?: string }
  return data.photoUri ?? null
}

/**
 * Build attribution string from photo author attributions.
 */
function buildAttribution(photo: PlacePhoto): string {
  return photo.authorAttributions?.map((a) => a.displayName).join(', ') || 'Photo via Google Places'
}

/**
 * Full enrichment: find Google Place ID → get first photo URL.
 * Returns null if no photo is found.
 */
export async function enrichSpotWithPhoto(
  name: string,
  lat: number,
  lng: number,
): Promise<SpotPhotoResult | null> {
  // Step 1: Find the Google Place
  const place = await findGooglePlace(name, lat, lng)
  if (!place) return null

  // Step 2: Get the first photo
  const firstPhoto = place.photos?.[0]
  if (!firstPhoto) return null

  // Step 3: Resolve the photo URL
  const photoUrl = await getPhotoUrl(firstPhoto.name)
  if (!photoUrl) return null

  return {
    googlePlaceId: place.id,
    photoUrl,
    photoAttribution: buildAttribution(firstPhoto),
  }
}

/**
 * POST /api/admin/apple-maps-test
 *
 * Admin-only endpoint for testing Apple Maps Server API endpoints.
 * Lets you call search, geocode, reverse-geocode, and neighborhood
 * endpoints with custom params and inspect the raw JSON response.
 *
 * Body:
 *   endpoint  — "search" | "geocode" | "reverseGeocode" | "neighborhood" | "searchAddress"
 *   query     — search term or address
 *   lat/lng   — optional coordinates (for search location or reverse geocode)
 *   limit     — optional result limit
 *   resultTypeFilter — optional: "Poi" | "Address" | etc.
 *   includeAddressCategories — optional: "SubLocality" | "PostalCode" | etc.
 */
import { z } from 'zod'
import { getAppleMapsAccessToken } from '~~/server/utils/appleMapToken'

 

const bodySchema = z.object({
  endpoint: z.enum(['search', 'geocode', 'reverseGeocode', 'neighborhood', 'searchAddress']),
  query: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  limit: z.number().optional(),
  resultTypeFilter: z.string().optional(),
  includeAddressCategories: z.string().optional(),
})

const AUSTIN_REGION = '30.65,-97.40,30.05,-98.15'

export default defineEventHandler(async (event) => {
  // Auth check — verify admin session cookie
  await requireAdmin(event)

  const body = await readBody(event)
  const { endpoint, query, lat, lng, limit, resultTypeFilter, includeAddressCategories } =
    bodySchema.parse(body)

  const accessToken = await getAppleMapsAccessToken()
  const startTime = Date.now()

  let url: string
  const params = new URLSearchParams()

  switch (endpoint) {
    case 'search': {
      if (!query) throw createError({ statusCode: 400, statusMessage: 'query required for search' })
      params.set('q', query)
      if (resultTypeFilter) params.set('resultTypeFilter', resultTypeFilter)
      if (includeAddressCategories) params.set('includeAddressCategories', includeAddressCategories)
      if (lat && lng) params.set('searchLocation', `${lat},${lng}`)
      else params.set('searchRegion', AUSTIN_REGION)
      params.set('limitToCountries', 'US')
      if (limit) params.set('limit', String(limit))
      url = `https://maps-api.apple.com/v1/search?${params.toString()}`
      break
    }

    case 'geocode': {
      if (!query)
        throw createError({ statusCode: 400, statusMessage: 'query required for geocode' })
      params.set('q', query)
      params.set('searchRegion', AUSTIN_REGION)
      params.set('limitToCountries', 'US')
      url = `https://maps-api.apple.com/v1/geocode?${params.toString()}`
      break
    }

    case 'reverseGeocode': {
      if (!lat || !lng)
        throw createError({ statusCode: 400, statusMessage: 'lat/lng required for reverseGeocode' })
      params.set('loc', `${lat},${lng}`)
      url = `https://maps-api.apple.com/v1/reverseGeocode?${params.toString()}`
      break
    }

    case 'neighborhood': {
      if (!query)
        throw createError({ statusCode: 400, statusMessage: 'query required for neighborhood' })
      params.set('q', `${query}, Austin, TX`)
      params.set('resultTypeFilter', 'Address')
      params.set('includeAddressCategories', 'SubLocality')
      params.set('limitToCountries', 'US')
      params.set('searchRegion', AUSTIN_REGION)
      url = `https://maps-api.apple.com/v1/search?${params.toString()}`
      break
    }

    case 'searchAddress': {
      if (!query)
        throw createError({ statusCode: 400, statusMessage: 'query required for searchAddress' })
      params.set('q', `${query}, Austin, TX`)
      params.set('resultTypeFilter', 'Address')
      params.set('limitToCountries', 'US')
      params.set('searchRegion', AUSTIN_REGION)
      if (limit) params.set('limit', String(limit))
      url = `https://maps-api.apple.com/v1/search?${params.toString()}`
      break
    }

    default:
      throw createError({ statusCode: 400, statusMessage: `Unknown endpoint: ${endpoint}` })
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const elapsed = Date.now() - startTime
  const responseBody: any = await response.json()

  // Extract neighborhood-relevant fields from each result
  const results: any[] = responseBody.results || []
  const neighborhoodFields = results.map((r: any) => {
    const sa = r.structuredAddress || {}
    return {
      name: r.name || r.formattedAddressLines?.join(', ') || '—',
      dependentLocalities: sa.dependentLocalities || [],
      subLocality: sa.subLocality || null,
      locality: sa.locality || null,
      administrativeArea: sa.administrativeArea || null,
      postCode: sa.postCode || null,
      coordinate: r.coordinate || null,
      displayRegion: r.displayRegion || null,
      poiCategory: r.poiCategory || null,
      country: sa.country || r.country || null,
    }
  })

  return {
    endpoint,
    requestUrl: url.replace(accessToken, '***'),
    status: response.status,
    elapsed: `${elapsed}ms`,
    resultCount: results.length,
    neighborhoodFields,
    rawResponse: responseBody,
  }
})

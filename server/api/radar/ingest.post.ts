import { eq } from 'drizzle-orm'

/**
 * POST /api/radar/ingest
 *
 * Full ingestion pipeline:
 *   1. Upsert seed keywords
 *   2. Expand via Google Autocomplete
 *   3. Classify intent, tag subtypes, score everything
 *
 * Secured with x-api-key header (reuses ingestApiKey) or admin session.
 * Designed to be called hourly by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  // Support both API-key auth (for cron workers) and session auth (for admin UI)
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (apiKey) {
    if (apiKey !== config.ingestApiKey) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  } else {
    await requireAdmin(event)
  }
  const db = useDatabase()

  const now = new Date().toISOString()
  let upserted = 0
  let expanded = 0

  // Phase 1: Upsert seed keywords
  for (const seed of SEED_KEYWORDS) {
    const existing = await db.select()
      .from(schema.keywords)
      .where(eq(schema.keywords.keyword, seed.keyword))
      .limit(1)

    if (existing.length) {
      // Update volume + lastSeen
      await db.update(schema.keywords)
        .set({ monthlyVolume: seed.estimatedVolume, lastSeen: now })
        .where(eq(schema.keywords.keyword, seed.keyword))
    } else {
      const intent = classifyIntent(seed.keyword)
      const rawDiff = estimateDifficulty(seed.keyword, seed.estimatedVolume, intent)
      const diffValidation = validateDifficulty({
        keyword: seed.keyword,
        rawDifficulty: rawDiff,
        monthlyVolume: seed.estimatedVolume,
      })
      const subtypes = tagSubtypes(seed.keyword)
      const coverage = matchKeywordToApp(seed.keyword)
      const geo = isAustinGeo(seed.keyword)
      const seasonBoost = getSeasonalityBoost(seed.keyword)

      const compositeScore = computeCompositeScore({
        monthlyVolume: normalizeVolume(seed.estimatedVolume),
        trendScore: 50,
        risingScore: 30,
      })

      const opportunityScore = computeOpportunityScore({
        monthlyVolume: seed.estimatedVolume,
        difficulty: diffValidation.difficulty,
        seasonalityBoost: seasonBoost,
        isCovered: !!coverage,
      })

      const strategicScore = computeStrategicScore({
        monthlyVolume: seed.estimatedVolume,
        difficulty: diffValidation.difficulty,
        subtypes,
        isAustinGeo: geo,
        bucket: seed.bucket,
        keyword: seed.keyword,
      })

      await db.insert(schema.keywords).values({
        keyword: seed.keyword,
        bucket: seed.bucket,
        monthlyVolume: seed.estimatedVolume,
        compositeScore,
        intent,
        difficulty: diffValidation.difficulty,
        difficultySource: diffValidation.difficultySource,
        difficultyConfidence: diffValidation.difficultyConfidence,
        difficultyAnomaly: diffValidation.anomaly,
        subtypes: JSON.stringify(subtypes),
        strategicScore,
        opportunityScore,
        matchedApp: coverage?.app ?? null,
        matchedUrl: coverage?.url ?? null,
        firstSeen: now,
        lastSeen: now,
      })
    }
    upserted++
  }

  // Phase 2: Autocomplete expansion (sample 8 top seeds to stay within timeout)
  const topSeeds = SEED_KEYWORDS
    .sort((a, b) => b.estimatedVolume - a.estimatedVolume)
    .slice(0, 8)

  for (const seed of topSeeds) {
    try {
      const suggestions = await fetchAutocompleteSuggestions(seed.keyword)

      for (const suggestion of suggestions) {
        const exists = await db.select()
          .from(schema.keywords)
          .where(eq(schema.keywords.keyword, suggestion.keyword))
          .limit(1)

        if (exists.length) continue
        if (!isAustinGeo(suggestion.keyword)) continue

        const intent = classifyIntent(suggestion.keyword)
        const rawDiff = estimateDifficulty(suggestion.keyword, 100, intent) // estimate vol at 100
        const diffValidation = validateDifficulty({
          keyword: suggestion.keyword,
          rawDifficulty: rawDiff,
          monthlyVolume: 100,
        })
        const subtypes = tagSubtypes(suggestion.keyword)
        const coverage = matchKeywordToApp(suggestion.keyword)
        const seasonBoost = getSeasonalityBoost(suggestion.keyword)

        const compositeScore = computeCompositeScore({
          monthlyVolume: normalizeVolume(100),
          trendScore: 50,
          risingScore: 30,
        })

        const opportunityScore = computeOpportunityScore({
          monthlyVolume: 100,
          difficulty: diffValidation.difficulty,
          seasonalityBoost: seasonBoost,
          isCovered: !!coverage,
        })

        const strategicScore = computeStrategicScore({
          monthlyVolume: 100,
          difficulty: diffValidation.difficulty,
          subtypes,
          isAustinGeo: true,
          bucket: seed.bucket,
          keyword: suggestion.keyword,
        })

        await db.insert(schema.keywords).values({
          keyword: suggestion.keyword,
          bucket: seed.bucket,
          monthlyVolume: 100,
          compositeScore,
          intent,
          difficulty: diffValidation.difficulty,
          difficultySource: diffValidation.difficultySource,
          difficultyConfidence: diffValidation.difficultyConfidence,
          difficultyAnomaly: diffValidation.anomaly,
          subtypes: JSON.stringify(subtypes),
          strategicScore,
          opportunityScore,
          matchedApp: coverage?.app ?? null,
          matchedUrl: coverage?.url ?? null,
          firstSeen: now,
          lastSeen: now,
        })
        expanded++
      }
    } catch {
      // Skip failed autocomplete seeds gracefully
    }
  }

  return {
    success: true,
    seeded: upserted,
    expanded,
    modelVersion: SCORING_MODEL_VERSION,
  }
})

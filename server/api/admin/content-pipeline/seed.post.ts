/**
 * POST /api/admin/content-pipeline/seed
 *
 * Seeds the content_pipeline_topics table with the default food category configs.
 * Safe to call multiple times — uses upsert logic.
 */
import { eq, and } from 'drizzle-orm'
import { contentPipelineTopics } from '~~/server/database/schema'

const DEFAULT_BODY_PROMPT = `You are a food writer for Austin-Texas.net, an illustrated city guide to Austin, TX.
Write engaging, opinionated prose about Austin's food scene. Be specific — name real places,
real dishes, real neighborhoods. Sound like a local who genuinely loves the city, not a tourist guide.
Use a warm, confident tone. Avoid generic superlatives. Under 400 words total for the body.`

const DEFAULT_FAQ_PROMPT = `You are a local Austin food expert writing FAQ answers for austin-texas.net.
Each answer should be 2-3 sentences, factual, helpful, and specific to Austin.
Mention real places, real prices, real seasons. Avoid filler.`

interface TopicSeed {
  topicKey: string
  topicLabel: string
  contentType: string
  spotFile: string
  accentColor?: string
  pinColor?: string
  icon?: string
  description?: string
  searchQueries: string[]
}

const foodTopics: TopicSeed[] = [
  {
    topicKey: 'bbq',
    topicLabel: 'BBQ Joints',
    contentType: 'spots',
    spotFile: 'bbqSpots.ts',
    accentColor: 'red',
    pinColor: '#dc2626',
    icon: 'i-lucide-flame',
    description:
      'Legendary East Side joints, suburban smokehouses, and the best brisket in the world.',
    searchQueries: [
      'best bbq restaurants austin texas 2026',
      'new bbq spots opened austin tx',
      'top rated barbecue austin brisket',
    ],
  },
  {
    topicKey: 'breakfast-tacos',
    topicLabel: 'Breakfast Tacos',
    contentType: 'spots',
    spotFile: 'tacoSpots.ts',
    accentColor: 'amber',
    icon: 'i-lucide-beef',
    description:
      'The definitive guide to Austin breakfast tacos — from migas to iconic Tex-Mex joints.',
    searchQueries: [
      'best breakfast tacos austin tx 2026',
      'top breakfast taco spots austin',
      'new taco restaurants austin texas',
    ],
  },
  {
    topicKey: 'coffee-shops',
    topicLabel: 'Coffee Shops',
    contentType: 'spots',
    spotFile: 'coffeeSpots.ts',
    accentColor: 'amber',
    pinColor: '#92400e',
    icon: 'i-lucide-coffee',
    description:
      'Best coffee shops in Austin — local roasters, WiFi-friendly spots, and cold brew.',
    searchQueries: [
      'best coffee shops austin texas 2026',
      'new coffee roasters austin tx',
      'specialty coffee austin local roasters',
    ],
  },
  {
    topicKey: 'food-trucks',
    topicLabel: 'Food Trucks',
    contentType: 'spots',
    spotFile: 'foodTruckSpots.ts',
    accentColor: 'emerald',
    pinColor: '#059669',
    icon: 'i-lucide-truck',
    description: 'Austin food trucks, from taco trailers to vegan hubs.',
    searchQueries: [
      'best food trucks austin tx 2026',
      'food truck parks austin texas',
      'new food trucks austin',
    ],
  },
  {
    topicKey: 'happy-hours',
    topicLabel: 'Happy Hours',
    contentType: 'spots',
    spotFile: 'happyHourSpots.ts',
    accentColor: 'violet',
    pinColor: '#7c3aed',
    icon: 'i-lucide-wine',
    description: 'The best happy hour deals in town — cheap drinks and great snacks.',
    searchQueries: [
      'best happy hour deals austin tx 2026',
      'cheap happy hour austin bars restaurants',
      'best cocktail happy hours austin',
    ],
  },
  {
    topicKey: 'restaurant-map',
    topicLabel: 'Restaurant Map',
    contentType: 'spots',
    spotFile: 'restaurantSpots.ts',
    accentColor: 'rose',
    pinColor: '#e11d48',
    icon: 'i-lucide-utensils-crossed',
    description: 'Interactive map of Austin most essential restaurants.',
    searchQueries: [
      'best new restaurants austin texas 2026',
      'james beard nominated austin restaurants',
      'top rated restaurants austin tx',
    ],
  },
  {
    topicKey: 'restaurants',
    topicLabel: 'Restaurants',
    contentType: 'spots',
    spotFile: 'restaurantSpots.ts',
    description: 'A curated guide to the best dining in Austin.',
    searchQueries: ['best new restaurants austin texas 2026', 'top rated restaurants austin tx'],
  },
]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()
  let created = 0
  let updated = 0

  for (const topic of foodTopics) {
    const existing = await db
      .select()
      .from(contentPipelineTopics)
      .where(
        and(
          eq(contentPipelineTopics.categorySlug, 'food'),
          eq(contentPipelineTopics.topicKey, topic.topicKey),
        ),
      )
      .get()

    if (existing) {
      // Only update search queries if they haven't been customized
      await db
        .update(contentPipelineTopics)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(contentPipelineTopics.id, existing.id))
      updated++
    } else {
      await db.insert(contentPipelineTopics).values({
        categorySlug: 'food',
        categoryLabel: 'Food',
        topicKey: topic.topicKey,
        topicLabel: topic.topicLabel,
        contentType: topic.contentType,
        spotFile: topic.spotFile,
        accentColor: topic.accentColor || null,
        pinColor: topic.pinColor || null,
        icon: topic.icon || null,
        description: topic.description || null,
        maxSpots: 10,
        searchQueries: JSON.stringify(topic.searchQueries),
        bodySystemPrompt: DEFAULT_BODY_PROMPT,
        faqSystemPrompt: DEFAULT_FAQ_PROMPT,
        enabled: true,
      })
      created++
    }
  }

  return { ok: true, created, updated, total: foodTopics.length }
})

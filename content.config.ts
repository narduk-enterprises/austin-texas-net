import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    categories: defineCollection({
      type: 'data',
      source: 'categories/*.md',
      schema: z.object({
        slug: z.string(),
        faqItems: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })).optional().default([]),
      }),
    }),
  },
})

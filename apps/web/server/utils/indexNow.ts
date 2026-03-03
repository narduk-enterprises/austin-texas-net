/**
 * IndexNow Ping Utility
 *
 * Proactively notifies search engines (Bing, Yandex, etc.) when URLs
 * are created or updated. Call this after map spot approvals, content
 * updates, or any page-level change that warrants immediate indexing.
 *
 * @see https://www.indexnow.org/documentation
 *
 * @example
 * ```ts
 * // Single URL
 * await notifyIndexNow(event, ['https://austin-texas.net/food/bbq/'])
 *
 * // Batch after bulk import
 * await notifyIndexNow(event, [
 *   'https://austin-texas.net/food/bbq/',
 *   'https://austin-texas.net/food/breakfast-tacos/',
 * ])
 * ```
 */
import type { H3Event } from 'h3'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITE_HOST = 'austin-texas.net'

export async function notifyIndexNow(
    event: H3Event,
    urls: string[],
): Promise<{ success: boolean; submitted: number; error?: string }> {
    const config = useRuntimeConfig(event)
    const key = config.indexNowKey as string

    if (!key) {
        return { success: false, submitted: 0, error: 'INDEXNOW_KEY not configured' }
    }

    if (urls.length === 0) {
        return { success: true, submitted: 0 }
    }

    try {
        // IndexNow supports batch submissions of up to 10,000 URLs
        await $fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: {
                host: SITE_HOST,
                key,
                keyLocation: `https://${SITE_HOST}/${key}.txt`,
                urlList: urls.slice(0, 10000), // API limit
            },
        })

        return { success: true, submitted: urls.length }
    } catch (error: unknown) {
        const err = error as { message?: string; status?: number }
        console.warn(`[IndexNow] Ping failed: ${err.message || 'Unknown error'}`)
        return {
            success: false,
            submitted: 0,
            error: err.message || 'IndexNow request failed',
        }
    }
}

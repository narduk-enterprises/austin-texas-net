import 'dotenv/config'
import { google } from 'googleapis'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadCredentials() {
    const keyFilePath = process.env.GSC_SERVICE_ACCOUNT_JSON_PATH?.trim()
    if (keyFilePath) {
        const resolved = resolve(process.cwd(), keyFilePath)
        if (existsSync(resolved)) {
            return JSON.parse(readFileSync(resolved, 'utf8'))
        }
    }

    const inline = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim()
    if (inline) {
        let str = inline
        if (!str.startsWith('{')) {
            str = Buffer.from(str, 'base64').toString('utf8')
        }
        return JSON.parse(str)
    }

    throw new Error('No service account credentials found for Google.')
}

async function getAuth() {
    const credentials = loadCredentials()
    return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/indexing'],
    })
}

async function run() {
    console.log('Fetching sitemap urls from JSON endpoint...')
    const rawUrls = await fetch('https://austin-texas.net/api/sitemap-urls', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    }).then(r => r.json())

    const urls = rawUrls.map((item: any) => {
        let loc = item.loc
        if (loc.startsWith('/')) {
            loc = 'https://austin-texas.net' + loc
        }
        return loc
    })

    console.log(`Found ${urls.length} URLs in sitemap`)

    // 1. Submit to IndexNow
    console.log('Submitting to IndexNow...')
    const indexNowKey = process.env.NUXT_INDEX_NOW_KEY || process.env.INDEXNOW_KEY
    if (indexNowKey) {
        for (let i = 0; i < urls.length; i += 1000) {
            const batch = urls.slice(i, i + 1000)
            try {
                const res = await fetch('https://api.indexnow.org/indexnow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        host: 'austin-texas.net',
                        key: indexNowKey,
                        keyLocation: `https://austin-texas.net/${indexNowKey}.txt`,
                        urlList: batch
                    })
                })
                console.log(`IndexNow batch ${i / 1000 + 1}: Status`, res.status)
            } catch (err: any) {
                console.error('IndexNow Error:', err.message)
            }
        }
    } else {
        console.error('No IndexNow Key found! Skipping IndexNow.')
    }

    // 2. Submit to Google Indexing API
    console.log('Submitting to Google Indexing API...')
    try {
        const auth = await getAuth()
        const client = await auth.getClient()

        // Google indexing API limits to 200 per batch usually, but we submit individually using the endpoint
        // "UrlNotifications: publish" allows publishing a single URL notification per request, max 200 queries per minute per project default
        // We will do a simple loop and batch them with a tiny delay
        const total = urls.length
        let success = 0
        let failed = 0

        for (let i = 0; i < total; i++) {
            const url = urls[i]
            try {
                await client.request({
                    url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                    method: 'POST',
                    data: {
                        url,
                        type: 'URL_UPDATED'
                    }
                })
                success++
                // minimal throttle
                await new Promise(r => setTimeout(r, 100))
            } catch (err: any) {
                failed++
                console.error(`Google API Error for ${url}:`, err.message)
            }
            if (i % 50 === 0 && i > 0) {
                console.log(`Progress: ${i} / ${total}`)
            }
        }
        console.log(`Google API Done. Success: ${success}, Failed: ${failed}`)
    } catch (err: any) {
        console.error('Google Indexing API Setup Error:', err.message)
    }

}

run().catch(console.error)

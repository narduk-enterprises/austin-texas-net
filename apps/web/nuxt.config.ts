import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  extends: ['@loganrenz/narduk-nuxt-template-layer'],

  modules: ['@nuxt/content', 'nitro-cloudflare-dev'],

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  // Prevent layer CSS from loading so only app theme applies (avoids flash of layer theme then app theme)
  hooks: {
    'config:resolved'(config: { css?: string[] }) {
      config.css = ['~/assets/css/main.css']
    },
  } as import('nuxt/schema').NuxtConfig['hooks'],

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['@cloudflare/workers-types'],
      },
    },
  },
  sourcemap: {
    server: true,
    client: false,
  },
  fonts: {
    families: [
      {
        name: 'Playfair Display',
        provider: 'google',
        weights: [400, 500, 600, 700],
        display: 'swap',
        global: true,
      },
      {
        name: 'Inter',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
        display: 'swap',
        global: true,
      },
      {
        name: 'Fira Code',
        provider: 'google',
        weights: [400, 500, 600],
        display: 'swap',
        global: true,
      },
    ],
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    payloadExtraction: true,
    buildCache: true,
  },

  ui: {
    colorMode: true,
  },
  colorMode: {
    preference: 'light',
  },

  vite: {
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    css: {
      devSourcemap: true,
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    appleClientId: process.env.APPLE_CLIENT_ID || 'com.atxapps',
    appleTeamId: process.env.APPLE_TEAM_ID || '',
    appleKeyId: process.env.APPLE_KEY_ID || '',
    appleSecretKey: process.env.APPLE_SECRET_KEY || '',
    mapkitServerApiKey: process.env.MAPKIT_SERVER_API_KEY || '',
    googlePollenApiKey: process.env.GOOGLE_POLLEN_API_KEY || '',
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    ingestApiKey: process.env.INGEST_API_KEY || '',
    airnowApiKey: process.env.AIRNOW_API_KEY || '',
    googleServiceAccountKey: process.env.GSC_SERVICE_ACCOUNT_JSON || '',
    posthogApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    indexNowKey: process.env.INDEXNOW_KEY || '',
    public: {
      appUrl: process.env.SITE_URL || 'https://austin-texas.net',
      mapkitToken: process.env.MAPKIT_TOKEN || '',
      gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
      appName: process.env.APP_NAME || 'Austin Texas',
    },
  },

  site: {
    url: 'https://austin-texas.net',
    name: 'Austin Texas',
  },

  ogImage: {
    defaults: {
      component: 'OgImageDefaultTakumi',
    },
  },

  sitemap: {
    sources: ['/api/sitemap-urls'],
    exclude: ['/login', '/admin/**'],
  },

  robots: {
    groups: [
      {
        userAgent: ['*'],
        disallow: ['/admin'],
      },
    ],
    blockNonSeoBots: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Austin Texas',
      url: 'https://austin-texas.net',
      logo: '/favicon.png',
      description:
        'Your guide to Austin, Texas — pollen counts, local food, live music, neighborhoods, and more.',
    },
  },

  nitro: {
    cloudflareDev: {
      configPath: resolve(__dirname, 'wrangler.json'),
    },
    preset: 'cloudflare-module',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    externals: {
      inline: ['drizzle-orm'],
    },
    serverAssets: [
      {
        baseName: 'data',
        dir: './public/data',
      },
    ],
    routeRules: {
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },
    },
  },

  app: {
    head: {
      title: 'Austin Texas — Your Guide to the Live Music Capital',
      htmlAttrs: { lang: 'en' },
      // Set color mode before first paint to avoid flash (matches colorMode.preference: 'light')
      script: [
        {
          innerHTML:
            "(function(){var d=document.documentElement;var p='light';try{var m=document.cookie.match(/color-mode=([^;]+)/);if(m)p=m[1];}catch(e){}d.classList.add(p);})();",
          tagPriority: 1,
        },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Your guide to Austin, Texas — live pollen counts, local food, live music, neighborhoods, and more.',
        },
        {
          name: 'keywords',
          content:
            'austin texas, austin guide, austin pollen, cedar fever, austin food, austin music, austin neighborhoods',
        },
        { name: 'theme-color', content: '#0a1004' },
        { name: 'geo.region', content: 'US-TX' },
        { name: 'geo.placename', content: 'Austin' },
        { name: 'geo.position', content: '30.2672;-97.7431' },
        { name: 'ICBM', content: '30.2672, -97.7431' },
        { name: 'google-site-verification', content: process.env.GOOGLE_SITE_VERIFICATION || '' },
        { name: 'build-time', content: new Date().toISOString() },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Austin Texas' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://cdn.apple-mapkit.com' },
        { rel: 'preconnect', href: 'https://us.i.posthog.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

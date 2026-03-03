#!/usr/bin/env bash
# Sync hub-spoke secrets into austin-texas-net Doppler project (same pattern as circuit-breaker-online).
# Hub: narduk-nuxt-template. Run once after creating the Doppler project.
set -e
PROJECT="austin-texas-net"
HUB="narduk-nuxt-template"
# Cross-project references from hub (single-quoted so shell does not expand)
REF_CF_TOKEN='${narduk-nuxt-template.prd.CLOUDFLARE_API_TOKEN}'
REF_CF_ACCOUNT='${narduk-nuxt-template.prd.CLOUDFLARE_ACCOUNT_ID}'
REF_PH_KEY='${narduk-nuxt-template.prd.POSTHOG_PUBLIC_KEY}'
REF_PH_PROJECT='${narduk-nuxt-template.prd.POSTHOG_PROJECT_ID}'
REF_PH_HOST='${narduk-nuxt-template.prd.POSTHOG_HOST}'
REF_GA_ACCOUNT='${narduk-nuxt-template.prd.GA_ACCOUNT_ID}'
REF_GSC_JSON='${narduk-nuxt-template.prd.GSC_SERVICE_ACCOUNT_JSON}'
REF_APPLE_SECRET='${narduk-nuxt-template.prd.APPLE_SECRET_KEY}'
REF_APPLE_TEAM='${narduk-nuxt-template.prd.APPLE_TEAM_ID}'
REF_APPLE_KEY_ID='${narduk-nuxt-template.prd.APPLE_KEY_ID}'
# App-specific literals (not from hub)
APP_NAME="Austin Texas"
SITE_URL="https://austin-texas.net"

for CONFIG in prd dev; do
  echo "Syncing hub references into $PROJECT ($CONFIG) from $HUB..."
  doppler secrets set \
    CLOUDFLARE_API_TOKEN="$REF_CF_TOKEN" \
    CLOUDFLARE_ACCOUNT_ID="$REF_CF_ACCOUNT" \
    POSTHOG_PUBLIC_KEY="$REF_PH_KEY" \
    POSTHOG_PROJECT_ID="$REF_PH_PROJECT" \
    POSTHOG_HOST="$REF_PH_HOST" \
    GA_ACCOUNT_ID="$REF_GA_ACCOUNT" \
    GSC_SERVICE_ACCOUNT_JSON="$REF_GSC_JSON" \
    APPLE_SECRET_KEY="$REF_APPLE_SECRET" \
    APPLE_TEAM_ID="$REF_APPLE_TEAM" \
    APPLE_KEY_ID="$REF_APPLE_KEY_ID" \
    APP_NAME="$APP_NAME" \
    SITE_URL="$SITE_URL" \
    --project "$PROJECT" \
    --config "$CONFIG"
done
echo "Done. App-specific secrets (e.g. CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN) stay in this project."
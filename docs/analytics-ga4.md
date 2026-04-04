# Analytics - GA4 + PostHog Guide

## Scope

This project uses:
- Vercel Analytics + Vercel Speed Insights for product performance monitoring.
- Google Analytics 4 for consent-gated audience measurement and marketing events.
- PostHog for product funnel continuity (website -> signup) and identity stitching.
- PostHog Query API for admin post-install analytics (`signup_completed`, `onboarding_completed`, `activation_completed`).

## Runtime Behavior

- GA4 script loads only when user enables analytics consent.
- PostHog loads only when user enables analytics consent.
- CSP `script-src` and `connect-src` must include PostHog ingestion/assets origins derived from `NEXT_PUBLIC_POSTHOG_HOST`.
- Consent updates are propagated to GA4 (`granted` / `denied`).
- GA cookies are cleared when analytics consent is revoked.
- `page_view` is sent on every route change.
- For compatibility, admin diagnostics also monitor PostHog `$pageview` when present.
- Additional marketing events are sent from `MarketingEventsTracker`.
- Marketing events are mirrored to PostHog.
- Join attribution context is persisted (`click_id`, `session_id`, `source`, `coach_code`, `utm_*`) and attached to analytics events when available.
- Auth bridge calls PostHog `identify()` on signed-in users and emits `signup_completed` when signup intent is detected.
- Admin conversion dashboard reads PostHog via private API when `POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_PERSONAL_API_KEY` are configured.

## Event Taxonomy

Standard GA4:
- `page_view`

Custom web events (GA4 + mirrored PostHog):
- `bf_marketing_page_view`
- `bf_cta_click`
- `bf_app_store_cta_click`
- `bf_scroll_depth`
- `bf_join_flow_started`
- `bf_web_vital`

Product events (PostHog, app/site identity bridge):
- `signup_completed`
- `onboarding_completed`
- `activation_completed`

Compatibility aliases (dashboard only, backward-compatible reads):
- `activation_complete` is aggregated with `activation_completed` in admin analytics.
- `$pageview` is aggregated with `page_view` for PostHog web diagnostics.

`bf_web_vital` params:
- `metric_name` (`LCP`, `INP`, `CLS`, `FCP`, `TTFB`)
- `metric_value`
- `metric_delta`
- `metric_rating` (`good`, `needs-improvement`, `poor`)
- `page_path`

## Recommended Conversions in GA4

Mark these custom events as key events/conversions:
- `bf_join_flow_started`
- `bf_app_store_cta_click`

Optional depending on funnel strategy:
- `bf_cta_click` (filtered by `cta_id`)

## Validation Checklist

1. Cookie banner appears for new visitor.
2. Before consent:
- no `googletagmanager.com/gtag/js` request.
- no `google-analytics.com/g/collect` request.
3. After clicking `Accepter`:
- `gtag/js` request appears.
- `page_view` is visible in GA4 DebugView.
- no CSP error blocks requests to the configured PostHog host.
- `page_view` (or `$pageview`) and `bf_marketing_page_view` appear in PostHog Live Events.
4. Route navigation sends additional `page_view`.
5. Clicking tracked CTA sends `bf_cta_click`.
6. Clicking primary funnel CTA sends `bf_join_flow_started`.
7. After refusing analytics:
- GA cookies (`_ga`, `_ga_*`) are removed.
- no new GA4 events are emitted.
8. In GA4 DebugView, `bf_web_vital` appears with `metric_name` and `metric_rating`.

## File Map

- `src/components/analytics/ga4-loader.tsx`
- `src/components/analytics/posthog-loader.tsx`
- `src/components/analytics/posthog-auth-bridge.tsx`
- `src/components/analytics/marketing-events-tracker.tsx`
- `src/components/analytics/consent-provider.tsx`
- `src/lib/analytics/marketing-events.ts`
- `src/lib/analytics/posthog.ts`
- `src/lib/analytics/auth-intent.ts`
- `src/lib/analytics/attribution-context.ts`
- `src/lib/consent/cookie-consent.ts`

## Production Measurement Loop

1. Run `npm run seo:prod-audit` to generate a production SEO/GEO baseline report under `docs/reports/`.
2. In GA4, build an exploration with dimensions:
- `eventName`
- `metric_name`
- `metric_rating`
- `page_path`
3. Track weekly trend of `bf_web_vital` split by `metric_name` and `metric_rating`.
4. Optimize pages where `LCP`/`INP` `poor` volume is highest first.

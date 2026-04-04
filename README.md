# BeFood Site

Site marketing/support de **BeFood** (application iOS) en architecture Next.js server.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Déploiement: Cloudflare Pages ou Vercel

## Démarrage local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Variables requises dans `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Utiliser les mêmes valeurs que l'application mobile pour partager les utilisateurs/profils.

## Vérification

```bash
npm run lint
npm run build
npm run start
npm run seo:prod-audit
```

## Déploiement

Le projet fonctionne en mode serveur Next.js.

## Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    pour-les-coachs/page.tsx
    connexion/page.tsx
    support/page.tsx
    privacy/page.tsx
    terms/page.tsx
    not-found.tsx
    not-found/page.tsx
    robots.ts
    sitemap.ts
  components/
    layout/
    sections/
    seo/
    ui/
  content/fr/
    home.ts
    coach.ts
    support.ts
    legal.ts
  lib/
public/
  images/
    app/
    og/
```

## Où éditer

- Configuration globale (URLs, navigation, routes indexées, accès coach/pro): `src/lib/site-config.ts`
- Copy FR homepage/coachs/support/légal: `src/content/fr/`
- Metadata + helpers schema JSON-LD: `src/lib/seo.ts`
- Structured data renderer: `src/components/seo/json-ld.tsx`

## Éléments à confirmer/remplacer

- URL Google Play (`googlePlayUrl` dans `src/lib/site-config.ts`) pour activer le bouton Android.
- URL de demande d'accès coach (`coachRequestAccessUrl`) si vous remplacez le parcours support.
- URL de connexion coach (`coachSignInUrl`) quand l'accès authentifié est réellement disponible.
- Canal support final (si différent du support in-app).
- Asset OG final: `public/images/og/befood-og.png`.
- Assets logo/icônes: `public/images/brand/`, `src/app/icon.png`, `src/app/apple-icon.png`, `src/app/favicon.ico`.

## Hors scope volontaire

- Auth web complète (guard server + parcours complet connexion)
- CMS / blog engine
- Dashboard admin
- Data warehouse / BI avancée (au-delà de GA4 + Vercel Analytics)

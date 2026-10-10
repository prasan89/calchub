# CalcHub

CalcHub is a standalone, SEO-first directory of 75 free online calculators for finance, health, math, and everyday use. It is independent of DevToolsHub.

## Stack
- Next.js App Router, React, TypeScript
- Tailwind CSS
- Static route generation for calculator detail pages
- Pure TypeScript calculation engine with unit tests

## Local development
```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## Deployment
Deploy as a separate service on Google Cloud Run. Set `NEXT_PUBLIC_SITE_URL` to the production origin before building so canonical URLs, sitemap and metadata use the correct host.

## Product principles
- Calculations run in the browser; do not send users' financial or health inputs to a server.
- Results are estimates for informational purposes, not tax, investment, legal, or medical advice.
- Calculator-specific SEO pages must have unique titles and descriptions, valid canonical URLs, and discoverable internal links.
- Ad placements must not obscure inputs or results.

## Initial calculator categories
- Financial: 30
- Health & fitness: 15
- Math: 15
- Everyday: 15

See `src/lib/calculators/catalog.ts` for the catalog and `src/lib/calculators/engine.ts` for calculation logic.

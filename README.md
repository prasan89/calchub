# CalcHub

CalcHub is a standalone, SEO-first directory of 75 free online calculators for finance, health and fitness, math, and everyday use. It lives in its own repository and is independent of DevToolsHub.

## Stack
- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Static generation for calculator detail routes
- Client-side calculator forms and shared TypeScript formula engine
- Vitest tests and GitHub Actions CI
- Docker multi-stage build for Google Cloud Run

## Run locally

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/prasan89/calchub.git
cd calchub
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Validate before deployment

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the production origin before building production artifacts. For local development, `http://localhost:3000` is fine.

## Deploy

The Dockerfile is designed for a separate Cloud Run service. Configure the real production `NEXT_PUBLIC_SITE_URL` as a build-time environment variable so canonical URLs, Open Graph URLs, robots, and sitemap use the deployed domain.

## Product principles
- User inputs and calculations stay in the browser; do not send financial or health values to a server.
- Results are estimates for informational purposes, not tax, investment, legal, or medical advice.
- Calculator pages should have unique titles and descriptions, canonical URLs, structured data, and internal links.
- Ad placements must not obscure calculator inputs or results.
- Validate formulas and locale-specific tax rules before describing estimates as authoritative.

## Initial catalog
- Financial: 30
- Health & fitness: 15
- Math: 15
- Everyday: 15

The catalog and input definitions live in `src/lib/calculators/catalog.ts`; formulas live in `src/lib/calculators/engine.ts`.

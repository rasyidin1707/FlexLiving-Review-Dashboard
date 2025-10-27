# Flex Living – Reviews Dashboard

Production-ready Next.js 14 (App Router) dashboard for ingesting, normalizing, managing and displaying multi‑channel reviews.

## Stack

- Next.js 14 + TypeScript (App Router)
- Prisma + SQLite
- Tailwind CSS + light shadcn-style components
- React Query (TanStack Query)
- Recharts (charts)
- Vitest + Testing Library (unit) and Playwright (e2e)
- ESLint (Next config) + Prettier + Husky pre-commit

## Getting started

1. Copy `.env.example` to `.env` and adjust if needed:

```
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=f94377e...9152
GOOGLE_PLACES_API_KEY=YOUR_KEY_OR_EMPTY
NODE_ENV=development
DATABASE_URL="file:./dev.db"
```

2. Install dependencies and generate Prisma client:

```
npm install
```

3. Seed the database (imports and normalizes `data/hostaway-mock.json`):

```
npm run seed
```

4. Start dev server:

```
npm run dev
```

Open http://localhost:3000/dashboard for the manager UI.

## Deploying to Vercel (with Postgres persistence)

SQLite is file-based and not persisted on serverless platforms. For production persistence, deploy with Postgres.

1) Create a Postgres database (Neon or Vercel Postgres).

2) In Vercel Project → Settings → Environment Variables, set:
- `DATABASE_URL` = your Postgres connection string
- `HOSTAWAY_ACCOUNT_ID`, `HOSTAWAY_API_KEY` (mock ok)
- `GOOGLE_PLACES_API_KEY` (optional)

3) Build command (auto via vercel.json):

```
npm run vercel-build
```

This runs:
- `prisma generate --schema prisma/schema.postgres.prisma`
- `prisma db push --schema prisma/schema.postgres.prisma`
- `next build`

4) Deploy. After first build, DB tables are created and approvals persist.

Notes:
- Local dev/tests continue to use SQLite via `prisma/schema.prisma`.
- Server uses Postgres via `prisma/schema.postgres.prisma`.

## API surface

- `GET /api/reviews/hostaway` – Loads mock JSON, normalizes into schema, upserts to DB (idempotent by `source+sourceReviewId`), and returns a structured response.
- `GET /api/reviews` – Paginated, filterable list. Accepts: `listingId, channel, type, status, approved, minRating, maxRating, from, to, q, page, perPage`.
- `POST /api/reviews/approve` – Body `{ ids: string[], approved: boolean }` bulk toggle.
- `GET /api/listings` – Listings with aggregates (counts, averages, recentIssues).
- `GET /api/reviews/google?placeId=...` – If `GOOGLE_PLACES_API_KEY` exists, fetches minimal reviews from Places API and normalizes (5★ → 10/10). Without key, responds `{ status: "disabled" }`.

## Normalization notes

- `rating` scales: 5★ and 10‑point converted via `toTenScale(value, scale)`.
- `reviewCategory` array normalized to `ratingItems` object. Assumed 0–10 scale.
- `submittedAt` converted to ISO string.
- Listings are ensured/created by `listingName` (mock has `listingId` for Hostaway too).

## Manager Dashboard

- Filters with URL state: listing, channel, type, status, approval, rating range, date range, free text.
- Summary cards: total, approved, average (all), average (approved).
- Charts: average rating by month (line), reviews by channel (bar).
- Reviews table: approve toggle, listing, channel, type, status, rating, key categories, text, author, date. Sortable (date/rating/listing). Bulk approve/unapprove. Right drawer with details.
- Listings section: per‑property cards (counts, averages). Clicking opens property page.

## Website page

`/properties/[id]` shows only `approved=true` reviews inside a property layout. Friendly empty state when none.

## Testing

- Unit: `npm test` (Vitest). Covers normalization, scales, category aggregation, idempotent upsert, and the Hostaway API route shape.
- E2E: `npm run e2e` (Playwright). Basic flow: load dashboard, toggle approve, open property page.

## Husky

Pre-commit runs lint, format check, and unit tests. Enable via `npm install` (runs `prepare`).

## Google Reviews: feasibility & constraints

## AI Assistance

This project was developed with help from OpenAI’s Codex CLI (GPT‑4 family) to scaffold components, tests, and build tooling. All normalization logic, API design, and UX decisions were reviewed and finalized manually. No production secrets were shared.

See `docs/google-reviews.md`. Summary: Places API returns only a limited set of recent reviews, has quotas and billing considerations, and ToS requires attribution.

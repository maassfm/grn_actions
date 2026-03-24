# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**Geocoding:**
- Nominatim (OpenStreetMap) — free geocoding API, no key required
  - Endpoint: `https://nominatim.openstreetmap.org/search`
  - Used in: `src/lib/geocoding.ts`
  - Rate limit: enforced manually at 1 request/second (1100ms delay between calls)
  - User-Agent sent: `GrueneMitte-Wahlkampf-App/1.0`
  - Called when: addresses on Aktionen are geocoded for map display

**Maps (Frontend):**
- Leaflet 1.9.4 + react-leaflet 5.0.0 — open-source map rendering library
  - No API key required; tile layers loaded from public CDN (OpenStreetMap tiles)
  - Used in: map components consuming latitude/longitude from Aktion records

## Data Storage

**Databases:**
- PostgreSQL 16 (via DDEV in development)
  - Connection: `DATABASE_URL` env var
  - Client: Prisma 6.19.2 (`@prisma/client`)
  - Singleton pattern in `src/lib/db.ts` (prevents hot-reload connection exhaustion)
  - Schema: `prisma/schema.prisma`
  - Migrations: `prisma/migrations/`
  - Seed: `prisma/seed.ts` (run via `npx tsx`)

**File Storage:**
- Local filesystem only — no cloud object storage
  - Excel uploads processed in-memory (Buffer) and not persisted to disk
  - Export files generated on-demand and streamed as HTTP responses

**Caching:**
- None — no Redis, Memcached, or in-memory cache layer

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v5 (beta) — `next-auth` 5.0.0-beta.30
  - Implementation: `src/lib/auth.ts`
  - Strategy: JWT (24-hour session, no database sessions)
  - Provider: Credentials only (email + password)
  - Password hashing: bcryptjs 3.0.3
  - Adapter: `@auth/prisma-adapter` 2.11.1 imported but JWT strategy bypasses DB session storage
  - Custom fields in JWT/session: `role` (ADMIN|EXPERT), `teamIds` (string[])
  - Login page: `/login` (custom, at `src/app/(auth)/`)
  - Middleware: proxies auth checks (Edge runtime constraint — cannot import NextAuth directly)

## Email Delivery

**Provider:**
- Nodemailer 7.0.13 — SMTP-based delivery (no locked-in SaaS provider)
  - Implementation: `src/lib/email.ts`
  - Transport: generic SMTP (configure any provider via env vars)
  - Configured via: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
  - Sender identity: `EMAIL_FROM`, `EMAIL_FROM_NAME`
  - HTML templates: `src/lib/email-templates.ts`
  - All sends logged to `EmailLog` table with status GESENDET or FEHLER: {message}
  - If `SMTP_*` vars are empty, email silently fails (no crash) and error is logged

**Email types (EmailTyp enum):**
- `BESTAETIGUNG` — registration confirmation to volunteer
- `AENDERUNG` — notification when an action is modified
- `ABSAGE` — notification when an action is cancelled
- `TAEGLICHE_UEBERSICHT` — daily digest email

## File Import/Export

**Excel Processing:**
- ExcelJS 4.4.0 — no external service, runs server-side
  - Import: `parseExcelFile()` in `src/lib/excel.ts` — parses uploaded .xlsx, maps columns to Aktion fields
  - Export (Aktionen): `createAktionenExcel()` — generates action list spreadsheet
  - Export (Anmeldungen): `createAnmeldungenExcel()` — generates volunteer list spreadsheet
  - Template generation: `createVorlageExcel()` — downloadable import template with example row
  - Text export (Signal): `createAktionenTxt()`, `createAnmeldungenTxt()` — plain-text for Signal messenger

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or equivalent

**Logs:**
- Console logging only
- Email audit trail in `EmailLog` database table (typ, empfaengerEmail, aktionId, status, gesendetAm)

## CI/CD & Deployment

**Development:**
- DDEV (Docker) — `ddev start` launches PostgreSQL 16 + Next.js dev server
- App available at `https://gruene-aktionen.ddev.site:3001`

**Production:**
- Target: self-hosted Linux server (implied by SMTP config and cron via system cron / curl)
- No containerization config (Dockerfile, docker-compose) committed for production
- No CI pipeline detected (no `.github/workflows/`, `.gitlab-ci.yml`, etc.)

## Cron Jobs

**Endpoints protected by `Authorization: Bearer <CRON_SECRET>` header:**
- `POST /api/cron/daily-summary` — sends daily Tagesübersicht emails (suggested schedule: 21:00)
- `POST /api/cron/cleanup-anmeldungen` — deletes Anmeldung records older than 72h (suggested: hourly)

**Trigger method:** external curl commands from server cron (examples in `.env.example`)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None (email is the only outbound channel)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret (min 32 chars)
- `NEXTAUTH_URL` — canonical URL (e.g., `https://aktionen.gruene-mitte.de`)
- `AUTH_TRUST_HOST=true` — required when behind a proxy
- `CRON_SECRET` — protects cron endpoints

**Optional env vars (email disabled if absent):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
- `EMAIL_FROM`, `EMAIL_FROM_NAME`

---

*Integration audit: 2026-03-24*

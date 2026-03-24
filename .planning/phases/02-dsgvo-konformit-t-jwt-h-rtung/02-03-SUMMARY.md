---
phase: 02-dsgvo-konformit-t-jwt-h-rtung
plan: 03
subsystem: anmeldungen
tags: [dsgvo, cancelToken, self-cancellation, prisma-migration, api]
dependency_graph:
  requires: []
  provides: [cancelToken-column, abmelden-route, abmeldung-page]
  affects: [src/app/api/anmeldungen/route.ts, prisma/schema.prisma]
tech_stack:
  added: []
  patterns: [token-based-self-cancellation, pii-strip-in-api-response]
key_files:
  created:
    - prisma/migrations/20260324000000_add_cancel_token/migration.sql
    - src/app/api/anmeldungen/abmelden/route.ts
    - src/app/(public)/abmeldung/page.tsx
  modified:
    - prisma/schema.prisma
    - src/app/api/anmeldungen/route.ts
decisions:
  - "cancelToken stored as nullable String with @unique on Anmeldung model (column on existing table, not separate table)"
  - "cancelToken generated as 32-byte hex (64 chars) using Node.js crypto.randomBytes — cryptographically secure"
  - "cancelToken never exposed in API response body — PII-strip enforced by not including it in NextResponse.json"
  - "abmelden route is GET (not POST) — token acts as capability credential in URL for email-link flow"
  - "abmeldung page is async server component using Promise<searchParams> pattern for Next.js 16 App Router"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 02 Plan 03: cancelToken Self-Cancellation Infrastructure Summary

**One-liner:** Token-based Anmeldung self-cancellation with 64-char hex cancelToken stored on Anmeldung, GET abmelden route, and German confirmation page.

## What Was Built

DSGVO Art. 7 requires volunteers to be able to withdraw consent. This plan adds the complete backend infrastructure for token-based self-cancellation:

1. **Prisma schema + migration** (`prisma/schema.prisma`, migration SQL): Added `cancelToken String? @unique` to the `Anmeldung` model. Migration applied via `prisma migrate deploy`.

2. **Token generation in POST /api/anmeldungen** (`src/app/api/anmeldungen/route.ts`): Each new `Anmeldung` now gets a cryptographically secure 64-char hex token via `crypto.randomBytes(32).toString("hex")`. The token is stored in DB but **never returned in the API response** (PII-strip).

3. **GET /api/anmeldungen/abmelden** (`src/app/api/anmeldungen/abmelden/route.ts`): Public route that accepts `?token=X`. Valid token → deletes the `Anmeldung` and redirects to `/abmeldung`. Invalid/missing token → redirects to `/abmeldung?fehler=1`. Single-use: token is deleted with the record.

4. **Confirmation page /abmeldung** (`src/app/(public)/abmeldung/page.tsx`): Async server component that reads `searchParams.fehler`. Shows success ("Erfolgreich abgemeldet") or error ("Abmeldung nicht möglich") state in German with a link back to the overview.

## Deviations from Plan

### Infrastructure Deviation

**`prisma migrate dev` non-interactive in DDEV:** The `prisma migrate dev` command detects a non-interactive TTY inside DDEV and refuses to run. Resolution: created the migration SQL file manually (matching the pattern of existing migrations) and applied it with `prisma migrate deploy`. The migration SQL (`ALTER TABLE "anmeldungen" ADD COLUMN "cancelToken" TEXT` + `CREATE UNIQUE INDEX`) is functionally equivalent to what `migrate dev` would have generated.

**No other deviations** — plan executed as designed.

## Acceptance Criteria Check

- [x] `prisma/schema.prisma` contains `cancelToken String? @unique` inside Anmeldung model
- [x] Migration file exists at `prisma/migrations/20260324000000_add_cancel_token/migration.sql`
- [x] Migration SQL contains `ALTER TABLE` and `cancelToken`
- [x] `prisma migrate status` shows no pending migrations
- [x] `src/app/api/anmeldungen/route.ts` contains `import crypto from "crypto"`
- [x] `src/app/api/anmeldungen/route.ts` contains `crypto.randomBytes(32).toString("hex")`
- [x] `src/app/api/anmeldungen/route.ts` contains `cancelToken` in `prisma.anmeldung.create` data object
- [x] `src/app/api/anmeldungen/route.ts` does NOT contain `cancelToken` in any `NextResponse.json()` call
- [x] `src/app/api/anmeldungen/abmelden/route.ts` exists and contains `prisma.anmeldung.delete`
- [x] `src/app/api/anmeldungen/abmelden/route.ts` contains `prisma.anmeldung.findUnique` with `where: { cancelToken: token }`
- [x] `src/app/api/anmeldungen/abmelden/route.ts` contains `NextResponse.redirect`
- [x] `src/app/(public)/abmeldung/page.tsx` exists and contains "erfolgreich"
- [x] `src/app/(public)/abmeldung/page.tsx` contains "fehler" parameter handling
- [x] `ddev exec npm run build` passes

## Known Stubs

None — the cancel token is fully wired into the DB. The email template (Plan 04) will add the cancellation link to confirmation emails. The infrastructure is complete and functional; volunteers just can't yet receive the token link via email until Plan 04.

## Self-Check: PASSED

- prisma/schema.prisma: FOUND (cancelToken String? @unique)
- prisma/migrations/20260324000000_add_cancel_token/migration.sql: FOUND
- src/app/api/anmeldungen/abmelden/route.ts: FOUND
- src/app/(public)/abmeldung/page.tsx: FOUND
- Commits: 8a62ff7 (schema+migration), ff9cc95 (routes+page)

---
phase: 02-dsgvo-konformit-t-jwt-h-rtung
plan: "02"
subsystem: auth-security
tags: [jwt, rate-limiting, sec-04, sec-05, authentication]
dependency_graph:
  requires: []
  provides: [jwt-lastchecked-check, rate-limited-get-aktionen, rate-limited-get-aktionen-id]
  affects: [src/lib/auth.ts, src/app/api/aktionen/route.ts, "src/app/api/aktionen/[id]/route.ts"]
tech_stack:
  added: []
  patterns: [in-memory-rate-limiting, jwt-null-return-invalidation]
key_files:
  created:
    - src/__tests__/security/jwt-invalidation.test.ts
    - src/__tests__/security/rate-limiting-get.test.ts
  modified:
    - src/lib/auth.ts
    - src/app/api/aktionen/route.ts
    - src/app/api/aktionen/[id]/route.ts
decisions:
  - "JWT-lastChecked timestamp in jwt callback: check user.active every 5 minutes, null return invalidates session immediately (D-12 to D-15)"
  - "Rate limits: 60 req/min for list endpoint, 30 req/min for detail endpoint (D-16)"
  - "Defensive initialization: token.lastChecked ?? 0 — legacy tokens without lastChecked trigger immediate DB check on first request"
metrics:
  duration_seconds: 156
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_changed: 5
---

# Phase 02 Plan 02: JWT Hardening + GET Rate Limiting Summary

JWT session lifecycle hardened with active-user check every 5 minutes via lastChecked timestamp; rate limiting added to public GET endpoints at 60/30 req/min to prevent PII harvesting.

## What Was Built

### Task 1: JWT lastChecked active-user check (SEC-04)

Modified `src/lib/auth.ts` jwt callback to:
- Set `token.lastChecked = Date.now()` on login
- Check `user.active` in DB every 5 minutes (CHECK_INTERVAL = 5 * 60 * 1000)
- Return `null` when user is deactivated or not found — NextAuth v5 interprets null as session invalidation (session cookie deleted, auth() returns null)
- Defensive fallback: `(token.lastChecked as number) ?? 0` ensures legacy tokens without lastChecked trigger immediate DB check

### Task 2: Rate Limiting on GET Endpoints (SEC-05)

Added in-memory rate limiting to both public GET handlers, using the same pattern as existing POST /api/anmeldungen:
- `GET /api/aktionen`: 60 requests per minute per IP
- `GET /api/aktionen/[id]`: 30 requests per minute per IP
- Returns 429 with German message: "Zu viele Anfragen. Bitte versuche es spaeter erneut."
- POST handler in aktionen/route.ts is NOT rate limited (only GET)
- Each route file has its own `rateLimitMap` instance (separate limits per endpoint)

## Tests Added

- `src/__tests__/security/jwt-invalidation.test.ts`: 5 tests covering all JWT invalidation scenarios (legacy token, within interval, past interval + active, deactivated user, deleted user)
- `src/__tests__/security/rate-limiting-get.test.ts`: 6 tests covering normal use, 429 blocking, IP isolation, window reset for both GET endpoints

## Verification

```
grep "return null" src/lib/auth.ts                    → confirmed (jwt callback)
grep "RATE_LIMIT = 60" src/app/api/aktionen/route.ts  → confirmed
grep "RATE_LIMIT = 30" src/app/api/aktionen/[id]/route.ts → confirmed
grep "maxAge: 24 * 60 * 60" src/lib/auth.ts           → confirmed (unchanged)
ddev exec npm run build                                → success, no errors
```

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 (RED+GREEN) | ef63f63 | feat(02-02): implement JWT lastChecked active-user check in auth.ts |
| Task 2 (RED+GREEN) | f9ac834 | feat(02-02): add rate limiting to GET /api/aktionen and GET /api/aktionen/[id] |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Out-of-Scope Issues Found

Pre-existing `cron-auth.test.ts` failure (1 test): `prisma.aktion.findMany` undefined in mock. This failure exists before this plan's changes (verified via git stash). Logged to deferred-items.md.

## Self-Check: PASSED

- `src/lib/auth.ts` — exists, contains lastChecked, CHECK_INTERVAL, return null, prisma.user.findUnique, maxAge: 24 * 60 * 60
- `src/app/api/aktionen/route.ts` — exists, contains RATE_LIMIT = 60, rateLimitMap, isRateLimited, status: 429
- `src/app/api/aktionen/[id]/route.ts` — exists, contains RATE_LIMIT = 30, rateLimitMap, status: 429
- `src/__tests__/security/jwt-invalidation.test.ts` — exists, 5 test cases, all pass
- `src/__tests__/security/rate-limiting-get.test.ts` — exists, 6 test cases, all pass
- Commits ef63f63 and f9ac834 exist in git log

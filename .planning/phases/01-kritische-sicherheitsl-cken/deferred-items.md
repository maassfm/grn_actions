# Deferred Items — Phase 01

## Pre-existing Test Failure (Out of Scope)

**File:** `src/__tests__/security/cron-auth.test.ts`
**Test:** `Cron-Endpunkt-Schutz > Mit korrektem Bearer-Token → Zugriff erlaubt`
**Error:** `TypeError: Cannot read properties of undefined (reading 'findMany')` at `src/app/api/cron/daily-summary/route.ts:36`

**Root cause:** The cron-auth test's success path calls the real route handler which calls `prisma.aktion.findMany()`, but the test file does not mock `prisma.aktion`. The test was already failing before plan 01-01 changes.

**Discovered during:** Plan 01-01 (Task 2 verification)
**Scope:** Pre-existing, unrelated to SEC-01/SEC-02 fixes
**Recommended fix:** Add `aktion: { findMany: vi.fn() }` to the `mockPrisma` object in `cron-auth.test.ts`

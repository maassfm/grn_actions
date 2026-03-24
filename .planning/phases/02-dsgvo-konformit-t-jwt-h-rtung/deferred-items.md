# Deferred Items — Phase 02

## Pre-existing Issues (Out of Scope)

### cron-auth.test.ts: 1 failing test

**File:** `src/__tests__/security/cron-auth.test.ts`
**Test:** "Cron-Endpunkt-Schutz > Mit korrektem Bearer-Token → Zugriff erlaubt"
**Error:** `TypeError: Cannot read properties of undefined (reading 'findMany')` in daily-summary/route.ts line 36

**Verified:** Pre-existing before plan 02-02 (confirmed via git stash test run).
**Cause:** The cron test's DB mock doesn't include the `aktion.findMany` method — the mock was not updated when the daily-summary route was extended.
**Action needed:** Update the cron-auth.test.ts mock to include `prisma.aktion.findMany: vi.fn()`.
**Priority:** Low (does not affect production behavior, only test coverage).

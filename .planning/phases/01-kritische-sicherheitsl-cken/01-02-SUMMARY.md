---
phase: 01-kritische-sicherheitsl-cken
plan: 02
subsystem: api
tags: [zod, validation, admin, security, testing]

# Dependency graph
requires: []
provides:
  - "userUpdateSchema in src/lib/validators.ts — validates PUT /api/admin/users input"
  - "Zod-validated PUT handler for admin user updates"
  - "6 regression tests for user update validation paths"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "userUpdateSchema with required id and all other fields optional for partial updates"
    - "ZodError catch in PUT handler returning 400 with 'Validierungsfehler'"
    - "Validation before any DB write pattern in admin routes"

key-files:
  created: []
  modified:
    - src/lib/validators.ts
    - src/app/api/admin/users/route.ts
    - src/__tests__/security/input-validation.test.ts

key-decisions:
  - "userUpdateSchema makes id required and all other fields optional — supports partial updates without requiring full object"
  - "Added vi.mock('@/lib/auth') to input-validation.test.ts to support testing auth-protected admin endpoints"

patterns-established:
  - "PUT endpoints use a dedicated update schema (not the create schema) with required id and optional fields"
  - "ZodError is caught and returns 400 with 'Validierungsfehler' — consistent with POST handler pattern"

requirements-completed: [SEC-06]

# Metrics
duration: 10min
completed: 2026-03-24
---

# Phase 01 Plan 02: SEC-06 Admin User Update Zod Validation Summary

**Zod-validated PUT /api/admin/users handler with userUpdateSchema (id required, all fields optional) and 6 regression tests**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-24T23:04:00Z
- **Completed:** 2026-03-24T23:14:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `userUpdateSchema` in `validators.ts` with `id` as the only required field; `name`, `email`, `password`, `role`, `active`, `teamIds` all optional for partial updates
- Replaced unvalidated PUT handler body destructuring with `userUpdateSchema.parse(body)` — invalid input rejected with 400 before any DB write
- Added 6 regression tests covering: missing id, invalid email, too-short password, invalid role, valid partial update, boolean `active` field

## Task Commits

1. **Task 1: Create userUpdateSchema and wire into PUT handler** - `0a22ebb` (feat)
2. **Task 2: Add regression tests for PUT validation** - `f6fbfee` (test)

**Plan metadata:** (docs commit follows)

_Note: Task 2 is TDD — tests written to cover the implementation from Task 1._

## Files Created/Modified

- `src/lib/validators.ts` - Added `userUpdateSchema` and `UserUpdateInput` type after `userSchema`
- `src/app/api/admin/users/route.ts` - Updated PUT handler: import `userUpdateSchema`, validate before DB write, add ZodError catch
- `src/__tests__/security/input-validation.test.ts` - Added `vi.mock('@/lib/auth')`, imported helpers, added 6-test describe block for PUT validation

## Decisions Made

- `userUpdateSchema` makes `id` required and all other fields optional — this allows partial updates (e.g., only changing `name`) without needing the full user object
- Added `vi.mock('@/lib/auth')` to `input-validation.test.ts` because testing admin endpoints requires mocking the auth session; the existing tests only covered public endpoints and didn't need this

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added vi.mock('@/lib/auth') to input-validation.test.ts**
- **Found during:** Task 2 (regression tests)
- **Issue:** Test file had no auth mock but admin PUT endpoint calls `auth()` — tests would fail without it
- **Fix:** Added `vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))` and imported `mockAuth`, `createJsonRequest`, `ADMIN_SESSION` from helpers
- **Files modified:** `src/__tests__/security/input-validation.test.ts`
- **Verification:** All 12 tests pass (6 original + 6 new)
- **Committed in:** f6fbfee (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical for test correctness)
**Impact on plan:** Necessary for tests to work against auth-protected endpoint. No scope creep.

## Issues Encountered

Pre-existing failure in `cron-auth.test.ts > Mit korrektem Bearer-Token → Zugriff erlaubt` — `prisma.aktion.findMany` not mocked in that test file. This is unrelated to plan 02 changes. Logged to deferred items.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- SEC-06 closed: PUT /api/admin/users now validates all input through Zod before any DB write
- Regression tests provide safety net for future refactoring
- No blockers for remaining plans in Phase 01

---
*Phase: 01-kritische-sicherheitsl-cken*
*Completed: 2026-03-24*

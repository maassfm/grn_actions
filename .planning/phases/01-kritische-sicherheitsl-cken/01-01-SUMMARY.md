---
phase: 01-kritische-sicherheitsl-cken
plan: "01"
subsystem: api-security
tags: [security, team-isolation, pii, export, regression-tests]
dependency_graph:
  requires: []
  provides: [SEC-01, SEC-02]
  affects: [src/app/api/export-aktionen/route.ts, "src/app/api/aktionen/[id]/route.ts", src/__tests__/security/team-isolation.test.ts]
tech_stack:
  added: []
  patterns: [team-isolation-where-clause, pii-strip-destructuring, vitest-mock-dynamic-import]
key_files:
  modified:
    - src/app/api/export-aktionen/route.ts
    - "src/app/api/aktionen/[id]/route.ts"
    - src/__tests__/security/team-isolation.test.ts
decisions:
  - "EXPERT team isolation in export-aktionen uses direct top-level where.teamId (not nested where.aktion.teamId like export/route.ts, because this query targets prisma.aktion.findMany directly)"
  - "PII strip uses rest-spread destructuring: ansprechpersonEmail and ansprechpersonTelefon renamed to _ and __ following project unused-variable convention"
  - "cron-auth.test.ts pre-existing failure is out of scope — logged as deferred"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_modified: 3
---

# Phase 01 Plan 01: Team Isolation and PII Fix Summary

**One-liner:** Closed two active data exfiltration vectors — added EXPERT team isolation to `/api/export-aktionen` and stripped contact PII from unauthenticated `GET /api/aktionen/[id]` responses, with 6 regression tests.

## What Was Built

### SEC-01: Team isolation in /api/export-aktionen

`src/app/api/export-aktionen/route.ts` previously called `prisma.aktion.findMany()` with no `where` clause, allowing any authenticated user (including EXPERTs from other teams) to export all Aktionen across all teams.

Fix: Added the same team isolation guard used in `/api/export/route.ts`:
- EXPERT callers: `where.teamId = { in: session.user.teamIds }` — filtered to own teams, `teamId` query param ignored
- ADMIN callers: no filter by default, optional `?teamId=xyz` filter respected
- `where` object passed directly to `prisma.aktion.findMany({ where, ... })`

### SEC-02: PII strip for unauthenticated GET /api/aktionen/[id]

`src/app/api/aktionen/[id]/route.ts` GET handler previously returned the full Aktion record (including `ansprechpersonEmail` and `ansprechpersonTelefon`) to unauthenticated callers. This exposed contact person PII to any internet visitor.

Fix: Added `const session = await auth()` check after fetching the Aktion. If unauthenticated, returns the Aktion with `ansprechpersonEmail` and `ansprechpersonTelefon` removed via rest-spread destructuring. `ansprechpersonName` remains visible (not PII per spec, consistent with public action list). Authenticated callers receive the full object unchanged.

### Regression tests

Added 6 new tests to `src/__tests__/security/team-isolation.test.ts`:

**describe "Team-Isolation: Aktionen-Export (export-aktionen)"** (4 tests):
1. EXPERT export filters to own team (where.teamId = { in: ["team-a"] })
2. EXPERT cannot bypass team filter via teamId query param
3. ADMIN sees all Aktionen without filter (where has no teamId key)
4. ADMIN can filter by teamId param (where.teamId = "team-b")

**describe "PII-Schutz: Oeffentlicher Aktionszugriff"** (2 tests):
5. Unauthenticated caller: ansprechpersonEmail and ansprechpersonTelefon absent from response; ansprechpersonName present
6. Authenticated caller: all PII fields present in response

Also added `createAktionenExcel` and `createAktionenTxt` to the `@/lib/excel` mock block so export-aktionen tests can resolve correctly.

## Test Results

```
Team-Isolation tests: 13/13 passed (7 pre-existing + 6 new)
Full security suite: 56/57 passed (1 pre-existing cron-auth failure, out of scope)
```

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all changes are complete functional fixes with no placeholders.

## Deferred Issues

**Pre-existing failure (out of scope):** `cron-auth.test.ts > Mit korrektem Bearer-Token → Zugriff erlaubt` fails with `TypeError: Cannot read properties of undefined (reading 'findMany')`. This exists in the codebase before this plan and is unrelated to the changes made here. The cron-auth test file does not mock `prisma.aktion` in its success-path test. Logged to `deferred-items.md`.

## Self-Check: PASSED

Files confirmed present:
- FOUND: src/app/api/export-aktionen/route.ts — contains `session.user.teamIds`, `session.user.role === "EXPERT"`, `where` passed to `prisma.aktion.findMany`
- FOUND: src/app/api/aktionen/[id]/route.ts — contains `const session = await auth()`, `ansprechpersonEmail: _`, `if (!session)` in GET handler
- FOUND: src/__tests__/security/team-isolation.test.ts — contains both new describe blocks, createAktionenExcel in mock

Commits confirmed:
- 465c7e8: fix(01-01): close team isolation gap in export-aktionen and strip PII from public GET
- 4a39ab3: test(01-01): add regression tests for export-aktionen team isolation and PII stripping

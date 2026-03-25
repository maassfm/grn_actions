---
phase: 03-rate-limiting-csp-und-accessibility
plan: 01
subsystem: security-headers
tags: [csp, security, headers, leaflet]
dependency_graph:
  requires: []
  provides: [CSP header on all responses]
  affects: [next.config.ts, all HTTP responses]
tech_stack:
  added: []
  patterns: [Next.js headers() config for CSP]
key_files:
  created:
    - src/__tests__/security/csp-header.test.ts
  modified:
    - next.config.ts
decisions:
  - "CSP uses static unsafe-inline for style-src (Leaflet compatibility; nonce-strategy excluded per D-04)"
metrics:
  duration: 15min
  completed: "2026-03-25"
  tasks: 2
  files: 2
requirements:
  - SEC-03
  - SEC-05
---

# Phase 03 Plan 01: CSP Header Summary

## One-liner

Content-Security-Policy header added to all HTTP responses via next.config.ts with Leaflet-compatible directives; regression test validates all directives.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add CSP header to next.config.ts | 769bb86 | next.config.ts |
| 2 | Add CSP header regression test | 144cfc8 | src/__tests__/security/csp-header.test.ts |

## What Was Built

- Added `Content-Security-Policy` header to `next.config.ts` alongside existing security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- CSP directives configured for Leaflet map compatibility: `style-src 'unsafe-inline'` for Leaflet inline styles, `img-src data: https:` for marker icons, `connect-src *.tile.openstreetmap.org` for map tiles
- 10-test regression suite in `src/__tests__/security/csp-header.test.ts` verifying all directive requirements and absence of dangerous directives

## Decisions Made

- SEC-03: CSP header uses `unsafe-inline` for style-src — required for Leaflet which injects inline styles; nonce-based CSP was explicitly excluded per D-04 as out of scope
- SEC-05: Rate limiting on GET /api/aktionen and GET /api/aktionen/[id] already complete from Phase 2 — no implementation work needed, requirement tracked here for coverage

## Deviations from Plan

None — plan executed exactly as written.

Test verification was run in DDEV (test file temporarily copied to main repo since DDEV only mounts the project root, not git worktrees). All 10 tests passed.

## Known Stubs

None.

## Self-Check: PASSED

- next.config.ts contains Content-Security-Policy: confirmed (commit 769bb86)
- src/__tests__/security/csp-header.test.ts exists: confirmed (commit 144cfc8)
- All 10 tests pass: confirmed (ddev exec npx vitest run)

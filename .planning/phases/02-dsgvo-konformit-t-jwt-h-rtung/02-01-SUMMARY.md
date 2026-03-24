---
phase: 02-dsgvo-konformit-t-jwt-h-rtung
plan: 01
subsystem: ui
tags: [dsgvo, datenschutz, impressum, legal, gdpr]

# Dependency graph
requires: []
provides:
  - Datenschutzerklaerung with concrete 72h Anmeldedaten retention and 31.10.2026 end-date for accounts/statistics
  - DEPLOY-BLOCKER comments at all address placeholders in datenschutz and impressum pages
  - Kanonische Formulierung for anonymized AktionStatistik retention per D-04
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/app/(public)/datenschutz/page.tsx
    - src/app/(public)/impressum/page.tsx

key-decisions:
  - "DEPLOY-BLOCKER comments in JSX mark both address placeholders — deployment tooling or code review will catch missing real address before go-live"
  - "Kanonische Formulierung from D-04 used verbatim for 72h Anmeldedaten retention paragraph"

patterns-established: []

requirements-completed: [DSGVO-01]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 02 Plan 01: Datenschutzerklaerung + Impressum DSGVO-Minimum Summary

**Datenschutzerklaerung updated with concrete 72h Anmeldedaten retention and 31.10.2026 end-date; DEPLOY-BLOCKER comments added to both pages' address placeholders**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T22:04:42Z
- **Completed:** 2026-03-24T22:10:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced vague "nach Abschluss der Wahlperiode" with concrete 72h retention period for Anmeldedaten
- Added 31. Oktober 2026 as explicit end-date for Nutzer-Accounts and anonymized AktionStatistik
- Added kanonische Formulierung from D-04 explaining that only anonymized Gesamtzahlen remain after 72h deletion
- Added DEPLOY-BLOCKER JSX comment to Datenschutzerklaerung address placeholder
- Added two DEPLOY-BLOCKER JSX comments to Impressum (§5 TMG and §55 RStV sections)
- Added Selbstabmeldung bullet to "Deine Rechte" section referencing cancellation link in confirmation email

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Datenschutzerklaerung with concrete retention periods and legal basis** - `d75d728` (feat)
2. **Task 2: Update Impressum with DEPLOY-BLOCKER comments for missing postal address** - `6f9f3ce` (feat)

**Plan metadata:** _(pending final docs commit)_

## Files Created/Modified
- `src/app/(public)/datenschutz/page.tsx` - Updated Loeschung der Daten section with concrete retention periods; added DEPLOY-BLOCKER comment; added Selbstabmeldung to Deine Rechte
- `src/app/(public)/impressum/page.tsx` - Added DEPLOY-BLOCKER comments to both address placeholders (§5 TMG and §55 RStV)

## Decisions Made
- DEPLOY-BLOCKER comments are in JSX `{/* ... */}` format — visible in source code review and grep, but not rendered to users. The placeholder text "Anschrift wird noch ergänzt" remains visible for users until the real address is added.
- Followed plan exactly: no architectural decisions required beyond plan spec.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. However, DEPLOY-BLOCKER comments in both files mark that the real postal address must be provided by the organization before going live.

## Next Phase Readiness
- DSGVO-01 legal text requirements met for datenschutz/impressum pages
- DEPLOY-BLOCKER markers ensure address placeholder is caught before deployment
- Phase 02 remaining plans: JWT hardening (SEC-04), tokenbasierte Selbstabmeldung (DSGVO-02/03), rate limiting on public GET endpoints (SEC-05)

## Self-Check: PASSED

- `src/app/(public)/datenschutz/page.tsx` — FOUND
- `src/app/(public)/impressum/page.tsx` — FOUND
- Commit `d75d728` — FOUND (feat(02-01): update Datenschutzerklaerung)
- Commit `6f9f3ce` — FOUND (feat(02-01): add DEPLOY-BLOCKER comments to Impressum)

---
*Phase: 02-dsgvo-konformit-t-jwt-h-rtung*
*Completed: 2026-03-24*

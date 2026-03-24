---
phase: 02-dsgvo-konformit-t-jwt-h-rtung
plan: 04
subsystem: email-templates, anmeldungen, cron
tags: [dsgvo, cancelToken, email-templates, abmeldung, daily-summary, EmailLog]
dependency_graph:
  requires: [cancelToken-column, abmelden-route, abmeldung-page]
  provides: [cancel-links-in-email, ABMELDUNG-EmailLog, daily-summary-abmeldungen]
  affects:
    - src/lib/email-templates.ts
    - src/app/api/anmeldungen/route.ts
    - src/app/api/anmeldungen/abmelden/route.ts
    - src/app/api/cron/daily-summary/route.ts
    - prisma/schema.prisma
tech_stack:
  added: []
  patterns: [cancel-link-in-email, EmailLog-as-audit-trail, daily-summary-grouping]
key_files:
  created:
    - prisma/migrations/20260324225003_add_abmeldung_email_typ/migration.sql
    - src/__tests__/security/cancel-token.test.ts
  modified:
    - prisma/schema.prisma
    - src/lib/email-templates.ts
    - src/app/api/anmeldungen/route.ts
    - src/app/api/anmeldungen/abmelden/route.ts
    - src/app/api/cron/daily-summary/route.ts
decisions:
  - "ABMELDUNG EmailLog uses status field to store 'ABMELDUNG: Vorname Nachname' — avoids separate table, volunteer name is preserved even after Anmeldung is deleted"
  - "cancelTokens[] is passed as parallel array to aktionen[] in anmeldebestaetigungEmail — index alignment keeps signature backward-compatible (optional param)"
metrics:
  duration: 15
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_modified: 7
---

# Phase 02 Plan 04: cancelToken Email Integration Summary

## One-liner

Wire cancelToken into confirmation email (per-aktion abmelden link) and daily summary (Abmeldungen heute section) via ABMELDUNG EmailLog audit trail.

## What Was Built

Plan 04 completes the DSGVO-03 self-cancellation feature end-to-end. Plan 03 created the cancelToken infrastructure (column, generation, abmelden route, abmeldung page). This plan connects it to the email system:

1. **ABMELDUNG added to EmailTyp enum** — Prisma migration adds the new enum value, enabling EmailLog entries of type ABMELDUNG.

2. **Confirmation email includes cancel links** — `anmeldebestaetigungEmail` accepts an optional `cancelTokens?: string[]` parameter (parallel to `aktionen[]`). Each action card in the confirmation email now includes a "Von dieser Aktion abmelden" link pointing to `/api/anmeldungen/abmelden?token=<hex>`.

3. **Daily summary shows today's cancellations** — `tagesUebersichtEmail` accepts an optional 5th parameter `abmeldungen: TagesAbmeldung[]`. When cancellations occurred today, the email shows an "Abmeldungen heute" section listing each volunteer and which action they cancelled from.

4. **Cancellations logged in EmailLog** — The `abmelden` route now reads the full anmeldung (vorname, nachname, email, aktionId) before deleting it, then creates an EmailLog entry with `typ: "ABMELDUNG"` and `status: "ABMELDUNG: Vorname Nachname"`. This preserves volunteer name for the daily summary even after the Anmeldung record is deleted.

5. **Daily-summary cron reads ABMELDUNG logs** — The cron handler queries `prisma.emailLog.findMany` for ABMELDUNG entries within today's date range, groups them by ansprechpersonEmail alongside registrations, and passes them to `tagesUebersichtEmail`.

6. **Regression tests** — 6 tests in `cancel-token.test.ts` cover: cancelToken is 64-char hex, cancelToken not in response body, valid token redirects to /abmeldung, invalid token redirects to /abmeldung?fehler=1, missing token redirects to /abmeldung?fehler=1, EmailLog.create called with typ ABMELDUNG on success.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `status` field stores `"ABMELDUNG: Vorname Nachname"` in EmailLog | Volunteer name is lost after Anmeldung deletion — status field acts as lightweight audit store without a separate table |
| `cancelTokens[]` is optional parallel array param | Backward compatible with existing callers of `anmeldebestaetigungEmail` that don't have tokens |
| abmelden route reads anmeldung before delete with `select` | Minimal field selection (id, aktionId, vorname, nachname, email, cancelToken) — no over-fetching |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All cancel link URLs are fully formed with real tokens. The abmeldungen section only renders when data is present (empty array default = no section rendered).

## Self-Check: PASSED

- [x] `prisma/schema.prisma` contains ABMELDUNG in EmailTyp
- [x] Migration file `20260324225003_add_abmeldung_email_typ/migration.sql` exists
- [x] `src/lib/email-templates.ts` has cancelTokens param, cancel link, TagesAbmeldung interface, Abmeldungen heute section
- [x] `src/app/api/anmeldungen/route.ts` passes cancelTokens to anmeldebestaetigungEmail
- [x] `src/app/api/anmeldungen/abmelden/route.ts` creates EmailLog with typ ABMELDUNG
- [x] `src/app/api/cron/daily-summary/route.ts` queries ABMELDUNG logs and passes to tagesUebersichtEmail
- [x] `src/__tests__/security/cancel-token.test.ts` — 6 tests all pass
- [x] Build succeeds
- [x] Commits: 11c5a1f (Task 1), d4d9f97 (Task 2)

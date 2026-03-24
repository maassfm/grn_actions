---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase complete — ready for verification
stopped_at: Completed 02-04-PLAN.md
last_updated: "2026-03-24T22:54:03.880Z"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 6
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-24)

**Core value:** Freiwillige können sich einfach und sicher für Wahlkampf-Aktionen anmelden — zuverlässig, ohne technische Hürden, datenschutzkonform.
**Current focus:** Phase 02 — dsgvo-konformit-t-jwt-h-rtung

## Current Position

Phase: 02 (dsgvo-konformit-t-jwt-h-rtung) — EXECUTING
Plan: 4 of 4

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P02 | 10 | 2 tasks | 3 files |
| Phase 01 P01 | 8 | 2 tasks | 3 files |
| Phase 02-dsgvo-konformit-t-jwt-h-rtung P01 | 5 | 2 tasks | 2 files |
| Phase 02 P03 | 15 | 2 tasks | 5 files |
| Phase 02 P02 | 156 | 2 tasks | 5 files |
| Phase 02-dsgvo-konformit-t-jwt-h-rtung P04 | 15 | 2 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Brownfield-Projekt — Sicherheit vor neuen Features (aktive Lücken zuerst)
- Init: JWT-Strategie bleibt (JWT-Invalidierung mit kürzerer TTL + aktivem User-Check in jwt-Callback, nicht session-Callback)
- Init: CSP nutzt statisches `unsafe-inline` für `style-src` (Leaflet-Kompatibilität); Nonce-Strategie ausgeschlossen
- [Phase 01]: SEC-06: userUpdateSchema with required id and optional fields for partial updates — consistent with project's Zod-first validation pattern
- [Phase 01]: SEC-01: EXPERT team isolation in export-aktionen uses direct where.teamId (not nested where.aktion.teamId) since query targets prisma.aktion.findMany directly, unlike export/route.ts which queries prisma.anmeldung.findMany
- [Phase 02]: DEPLOY-BLOCKER JSX comments mark both address placeholders in datenschutz/impressum — caught by code review or grep before go-live
- [Phase 02]: Kanonische Formulierung D-04 used verbatim: 72h retention for Anmeldedaten, anonymized Gesamtzahlen remain after deletion
- [Phase 02]: cancelToken stored as nullable @unique column on Anmeldung (not separate table) — simpler schema, sufficient for single-token-per-registration use case
- [Phase 02]: abmelden route uses GET (not POST) — token acts as capability credential in URL for single-use email-link flow
- [Phase 02]: JWT-lastChecked: check user.active every 5 minutes via jwt callback null-return for session invalidation
- [Phase 02]: Rate limits: 60/min for GET /api/aktionen, 30/min for GET /api/aktionen/[id] - in-memory Map pattern
- [Phase 02]: ABMELDUNG EmailLog status field stores 'ABMELDUNG: Vorname Nachname' to preserve volunteer name after Anmeldung deletion without a separate table
- [Phase 02]: cancelTokens[] passed as optional parallel array to anmeldebestaetigungEmail — backward-compatible signature extension

### Pending Todos

None yet.

### Blockers/Concerns

- DSGVO-01: Echte Postadresse für Datenschutzerklärung/Impressum muss von der Organisation geliefert werden — technisch nicht lösbar
- Phase 2: Token-Speicherstrategie für DSGVO-03-Cancellation-Token muss zu Phasenbeginn entschieden werden (Spalte auf `Anmeldung` vs. separate Tabelle — beeinflusst Prisma-Migration)

## Session Continuity

Last session: 2026-03-24T22:54:03.878Z
Stopped at: Completed 02-04-PLAN.md
Resume file: None

---
phase: 02-dsgvo-konformit-t-jwt-h-rtung
verified: 2026-03-24T23:00:00Z
status: human_needed
score: 7/8 must-haves verified
re_verification: false
gaps:
  - truth: "DSGVO-02 tracking inconsistency: REQUIREMENTS.md marks DSGVO-02 as Pending but implementation is complete"
    status: partial
    reason: "datenschutz/page.tsx contains concrete 31. Oktober 2026 retention date and vague text was removed — DSGVO-02 is satisfied in code but REQUIREMENTS.md traceability table still shows it as Pending. Plan 02-01 only credited DSGVO-01 in requirements-completed."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "DSGVO-02 listed as Pending in traceability table despite being implemented"
    missing:
      - "Update REQUIREMENTS.md traceability: change DSGVO-02 status from Pending to Complete, matching DSGVO-01"
      - "Update 02-01-SUMMARY.md requirements-completed to include DSGVO-02 alongside DSGVO-01"
human_verification:
  - test: "Navigate to /datenschutz and visually confirm the Loeschung der Daten section shows all three retention paragraphs with correct German text (72h, 31. Oktober 2026 x2)"
    expected: "Three paragraphs visible: 72h for Anmeldedaten, 31.10.2026 for accounts, 31.10.2026 for statistics"
    why_human: "JSX comment and text rendering cannot be verified via grep alone for visual correctness"
  - test: "Navigate to /impressum and confirm DEPLOY-BLOCKER comments are not rendered to users"
    expected: "Page shows 'Anschrift wird noch ergaenzt' placeholder text but no JSX comment text"
    why_human: "JSX comments should not render to users — needs browser verification"
  - test: "Log in as a test user, wait 5+ minutes, then attempt an API call to a protected endpoint"
    expected: "After deactivating the user in admin panel and waiting 5 minutes, the previously authenticated user's request returns 401"
    why_human: "JWT 5-minute invalidation window requires time-based manual test"
  - test: "Register for an action and check the confirmation email for a cancellation link"
    expected: "Email contains 'Von dieser Aktion abmelden' link pointing to /api/anmeldungen/abmelden?token=<64-char-hex>"
    why_human: "Email delivery and link format require end-to-end test with real email"
---

# Phase 2: DSGVO-Konformität + JWT-Härtung Verification Report

**Phase Goal:** Die App erfüllt die DSGVO-Mindestanforderungen für den Live-Betrieb und deaktivierte Nutzer verlieren den Zugang innerhalb von 5 Minuten
**Verified:** 2026-03-24T23:00:00Z
**Status:** gaps_found — 1 tracking inconsistency (DSGVO-02 complete in code but not credited in REQUIREMENTS.md)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from Phase 2 Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Datenschutzerklärung enthält vollständige Pflichtangaben und konkrete Aufbewahrungsfristen — keine Platzhaltertexte | ✓ VERIFIED | datenschutz/page.tsx lines 67-81: 72h retention paragraph, 31.10.2026 for accounts and statistics, Art. 6 Abs. 1 lit. a DSGVO |
| 2 | Ein Freiwilliger kann über den Abmelde-Link in der Bestätigungs-E-Mail sich eigenständig abmelden (Token-basiert, ohne Login) | ✓ VERIFIED | email-templates.ts line 85: cancel link generated per aktion; abmelden/route.ts: full delete + redirect flow; abmeldung/page.tsx: confirmation page with error state |
| 3 | Ein deaktivierter Nutzer verliert den Zugang spätestens nach 5 Minuten | ✓ VERIFIED | auth.ts lines 56-67: CHECK_INTERVAL = 5 * 60 * 1000, findUnique with active check, return null on deactivated/missing user |

**Score:** 3/3 success criteria verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/(public)/datenschutz/page.tsx` | DSGVO-compliant privacy policy with concrete retention periods | ✓ VERIFIED | Contains "72 Stunden nach Ende der jeweiligen Aktion", "31. Oktober 2026" (2x), "Art. 6 Abs. 1 lit. a DSGVO", DEPLOY-BLOCKER comment, "anonymisierte Gesamtzahlen", no vague "nach Abschluss der Wahlperiode" |
| `src/app/(public)/impressum/page.tsx` | Impressum with DEPLOY-BLOCKER at both address placeholders | ✓ VERIFIED | Contains 2 DEPLOY-BLOCKER comments (§5 TMG line 16, §55 RStV line 40), placeholder text preserved |
| `src/lib/auth.ts` | JWT callback with lastChecked DB check every 5 minutes | ✓ VERIFIED | Lines 53-67: lastChecked set on login, CHECK_INTERVAL = 5 * 60 * 1000, prisma.user.findUnique with active check, return null path, maxAge: 24 * 60 * 60 unchanged |
| `src/app/api/aktionen/route.ts` | Rate-limited GET handler at 60 req/min | ✓ VERIFIED | Lines 7-21: rateLimitMap, RATE_LIMIT = 60, isRateLimited called first in GET handler; POST handler not rate-limited |
| `src/app/api/aktionen/[id]/route.ts` | Rate-limited GET handler at 30 req/min | ✓ VERIFIED | Lines 11-25: rateLimitMap, RATE_LIMIT = 30, isRateLimited called first in GET handler |
| `prisma/schema.prisma` | cancelToken column on Anmeldung model; ABMELDUNG in EmailTyp | ✓ VERIFIED | Line 118: `cancelToken String? @unique`; Lines 21-27: EmailTyp enum contains ABMELDUNG |
| `src/app/api/anmeldungen/route.ts` | cancelToken generation on POST, cancelTokens passed to email | ✓ VERIFIED | Line 2: `import crypto from "crypto"`, line 85: `crypto.randomBytes(32).toString("hex")`, line 94: cancelToken in create data, line 123: cancelTokens array passed to anmeldebestaetigungEmail; cancelToken not in NextResponse.json response |
| `src/app/api/anmeldungen/abmelden/route.ts` | Token-based self-cancellation route | ✓ VERIFIED | findUnique with where: {cancelToken: token}, delete, emailLog.create with typ: "ABMELDUNG", redirect to /abmeldung |
| `src/app/(public)/abmeldung/page.tsx` | Cancellation confirmation page | ✓ VERIFIED | Server component, reads fehler searchParam, shows "Erfolgreich abgemeldet" or "Abmeldung nicht möglich" |
| `src/lib/email-templates.ts` | anmeldebestaetigungEmail with cancel links; tagesUebersichtEmail with abmeldungen section | ✓ VERIFIED | Line 76: cancelTokens?: string[], line 85: cancel link URL, line 69: "Von dieser Aktion abmelden"; lines 163-168: TagesAbmeldung interface; lines 175: abmeldungen param; lines 227-237: "Abmeldungen heute" section |
| `src/app/api/cron/daily-summary/route.ts` | Reads ABMELDUNG EmailLogs for daily summary | ✓ VERIFIED | Lines 45-56: findMany with typ: "ABMELDUNG" and date range; lines 117-138: loop to group abmeldungen by ansprechperson; line 157: abmeldungen passed to tagesUebersichtEmail |
| `src/__tests__/security/jwt-invalidation.test.ts` | 5 tests for JWT active-user check | ✓ VERIFIED | 5 test cases: legacy token triggers DB check, within interval no check, past interval + active updates timestamp, deactivated user returns null, missing user returns null |
| `src/__tests__/security/rate-limiting-get.test.ts` | Tests for GET endpoint rate limiting | ✓ VERIFIED | File exists with vi.mock pattern consistent with project test style |
| `src/__tests__/security/cancel-token.test.ts` | 6 tests for cancelToken flow | ✓ VERIFIED | 6 tests: 64-char hex token, cancelToken not in response, valid token redirects, invalid token redirects to fehler, missing token redirects to fehler, EmailLog.create called with ABMELDUNG typ |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/lib/auth.ts` | `prisma.user.findUnique` | jwt callback lastChecked check | ✓ WIRED | Line 59: `prisma.user.findUnique({ where: { id: token.sub! }, select: { active: true } })` inside CHECK_INTERVAL condition |
| `src/app/api/aktionen/route.ts` | `isRateLimited(ip)` | GET handler entry | ✓ WIRED | Lines 25-31: IP extracted from headers, `if (isRateLimited(ip))` is the first check before auth |
| `src/app/api/anmeldungen/route.ts` | `prisma.anmeldung.create` | cancelToken passed in data | ✓ WIRED | Lines 85-96: cancelToken generated with randomBytes, passed as `cancelToken` field in create data |
| `src/app/api/anmeldungen/abmelden/route.ts` | `prisma.anmeldung.findUnique` | where: {cancelToken: token} | ✓ WIRED | Lines 13-23: findUnique with cancelToken lookup and select of needed fields |
| `src/app/api/anmeldungen/route.ts` | `anmeldebestaetigungEmail` | cancelTokens array passed | ✓ WIRED | Line 123: `successfulAktionen.map((s) => s.cancelToken)` as third argument |
| `src/app/api/anmeldungen/abmelden/route.ts` | `prisma.emailLog.create` | ABMELDUNG log on deletion | ✓ WIRED | Lines 32-39: emailLog.create with typ: "ABMELDUNG" after successful delete |
| `src/app/api/cron/daily-summary/route.ts` | `prisma.emailLog.findMany` | reads ABMELDUNG entries | ✓ WIRED | Lines 45-56: findMany with typ: "ABMELDUNG" and date range, includes aktion relation |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `anmeldebestaetigungEmail` | `cancelTokens[i]` | `crypto.randomBytes(32).toString("hex")` in POST handler | Yes — cryptographically random 64-char hex | ✓ FLOWING |
| `/abmeldung` page | `fehler` searchParam | Query string from redirect in abmelden/route.ts | Yes — redirect URL set by route based on DB lookup result | ✓ FLOWING |
| `tagesUebersichtEmail` abmeldungen section | `abmeldungen[]` | `prisma.emailLog.findMany` with ABMELDUNG typ and today's date range | Yes — DB query with date filter | ✓ FLOWING |
| `auth.ts` jwt callback | `dbUser.active` | `prisma.user.findUnique` in jwt callback | Yes — DB lookup on each 5-min interval expiry | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED for full end-to-end checks (requires running server with real email, real DB, live JWT). Unit tests provide coverage for core behaviors.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| cancelToken column exists in schema | `grep "cancelToken String? @unique" prisma/schema.prisma` | Found at line 118 | ✓ PASS |
| ABMELDUNG enum value in schema | `grep "ABMELDUNG" prisma/schema.prisma` | Found in EmailTyp enum | ✓ PASS |
| Cancel token migration applied | `ls prisma/migrations/ | grep cancel` | `20260324000000_add_cancel_token` exists | ✓ PASS |
| ABMELDUNG migration applied | `ls prisma/migrations/ | grep abmeldung` | `20260324225003_add_abmeldung_email_typ` exists | ✓ PASS |
| cancelToken not in POST response | Grep response object in anmeldungen/route.ts | NextResponse.json({message, results}) — results only contains {aktionId, success: true}, no cancelToken | ✓ PASS |
| Vague retention text removed | `grep "nach Abschluss der Wahlperiode" datenschutz/page.tsx` | NOT FOUND | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DSGVO-01 | 02-01-PLAN.md | Datenschutzerklärung und Impressum mit vollständigen Pflichtangaben (Postadresse, Verantwortlicher, Rechtsgrundlage) | ✓ SATISFIED | DEPLOY-BLOCKER comments in both files; Verantwortliche Stelle, Art. 6 Abs. 1 lit. a DSGVO present |
| DSGVO-02 | 02-01-PLAN.md | Datenschutzerklärung nennt konkrete maximale Aufbewahrungsfrist | ✓ SATISFIED (tracking gap) | datenschutz/page.tsx contains "31. Oktober 2026" (2x), "72 Stunden nach Ende", vague text removed — HOWEVER: REQUIREMENTS.md marks this as "Pending" and plan SUMMARY only credited DSGVO-01 |
| DSGVO-03 | 02-03-PLAN.md + 02-04-PLAN.md | Freiwillige können sich tokenbasiert selbst abmelden | ✓ SATISFIED | Full end-to-end: cancelToken generation, abmelden route, abmeldung page, email template with cancel links, EmailLog tracking, daily summary integration |
| SEC-04 | 02-02-PLAN.md | Deaktivierter Nutzer verliert Zugang innerhalb 5 Minuten | ✓ SATISFIED | auth.ts CHECK_INTERVAL = 5min, return null on inactive/missing user, 5 passing unit tests |
| SEC-05 | 02-02-PLAN.md | GET /api/aktionen und GET /api/aktionen/[id] sind rate-limited | ✓ SATISFIED | rateLimitMap + isRateLimited in both routes; RATE_LIMIT = 60 and 30; 429 response with German error message |

**Orphaned requirements:** None — all 5 phase 2 requirements are claimed by plans.

**Tracking issue:** DSGVO-02 is implemented but REQUIREMENTS.md traceability table and 02-01-SUMMARY.md `requirements-completed` field do not credit it. This is a documentation gap, not an implementation gap.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/aktionen/route.ts` | 28 | Error message uses ASCII "spaeter" instead of real umlaut "später" | ℹ️ Info | Inconsistent with rest of codebase (anmeldungen/route.ts line 46 uses real umlaut); user-visible but minor |
| `src/app/api/aktionen/[id]/route.ts` | 34 | Same "spaeter" ASCII issue in 429 error message | ℹ️ Info | Same as above |

No blocker anti-patterns found. The ASCII umlaut in the 429 message is a cosmetic inconsistency — not a goal-blocking issue.

### Human Verification Required

#### 1. Datenschutzerklärung Visual Rendering

**Test:** Navigate to `/datenschutz` in a browser
**Expected:** Three separate paragraphs in "Löschung der Daten" section: (1) 72h Anmeldedaten paragraph, (2) 31. Oktober 2026 for accounts, (3) 31. Oktober 2026 for statistics. DEPLOY-BLOCKER JSX comment should NOT be visible to users.
**Why human:** Visual rendering verification; JSX comment visibility cannot be confirmed by grep.

#### 2. Impressum Visual Rendering

**Test:** Navigate to `/impressum` in a browser
**Expected:** "Anschrift wird noch ergänzt" shown as placeholder. No JSX comment text rendered.
**Why human:** Same as above.

#### 3. JWT 5-Minute Invalidation (Live Test)

**Test:** Log in as test user (`expert@gruene-mitte.de`). In admin panel, deactivate that user. Wait 5 minutes. Attempt to access `/dashboard` or any authenticated API endpoint.
**Expected:** After 5 minutes, the user's session is invalidated — they are redirected to `/login` and API calls return 401.
**Why human:** Real-time JWT check requires controlled time delay and live session management. Unit tests cover the logic; this verifies the full NextAuth integration.

#### 4. Cancellation Link in Confirmation Email

**Test:** Submit a registration for an active action via the public form. Check the confirmation email received at the registered address.
**Expected:** Email body contains a "Von dieser Aktion abmelden" link pointing to `<NEXTAUTH_URL>/api/anmeldungen/abmelden?token=<64-char-hex-string>`. Clicking the link should delete the registration and redirect to `/abmeldung` with success message.
**Why human:** Requires real email delivery (SMTP/Resend) and a live database. Not testable without running services.

### Gaps Summary

One gap found: a **documentation/tracking inconsistency** regarding DSGVO-02.

The implementation in `src/app/(public)/datenschutz/page.tsx` fully satisfies DSGVO-02 — it contains a concrete "31. Oktober 2026" end-date for all data categories and the previously vague "nach Abschluss der Wahlperiode" text has been removed. However, `REQUIREMENTS.md` still marks DSGVO-02 as "Pending" in the traceability table, and `02-01-SUMMARY.md` only lists DSGVO-01 in `requirements-completed`.

This is a tracking artifact from how plan 02-01 was structured: the plan's frontmatter listed `requirements: [DSGVO-01, DSGVO-02]` but the SUMMARY only credited DSGVO-01. The code is correct — only the docs are out of sync.

**Fix required:** Update `REQUIREMENTS.md` traceability table to mark DSGVO-02 as Complete; update `02-01-SUMMARY.md` `requirements-completed` to `[DSGVO-01, DSGVO-02]`.

---

_Verified: 2026-03-24T23:00:00Z_
_Verifier: Claude (gsd-verifier)_

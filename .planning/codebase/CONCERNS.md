# Codebase Concerns

**Analysis Date:** 2026-03-24
**Context:** Campaign action coordination platform for BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte. Collects PII (name, email, phone, Signal handle) from volunteers signing up to political campaign events. DSGVO/GDPR compliance is legally required.

---

## Security

### In-Memory Rate Limiting Resets on Server Restart
- **Severity:** Medium
- Issue: The rate-limit map in `src/app/api/anmeldungen/route.ts` is a plain `Map` stored in module scope. Any process restart, serverless cold start, or horizontal scaling resets all counters. Multiple instances of the app will have independent counters, giving each instance its own full 10-request window.
- Files: `src/app/api/anmeldungen/route.ts` lines 8–22
- Impact: Determined bots that probe multiple instances or restart timing will bypass the limit. On serverless (Vercel), every cold function start resets the map.
- Fix approach: Replace with a Redis-backed or database-backed rate limiter, or use an edge-level rate-limiting service (e.g., Upstash, Vercel Rate Limiting).

### Rate Limiting Only on Public Registration Endpoint
- **Severity:** Medium
- Issue: The only rate-limited endpoint is `POST /api/anmeldungen`. The public `GET /api/aktionen` endpoint (which returns full action listings with contact person details) and `GET /api/aktionen/[id]` have no rate limiting. An attacker can enumerate all contact person names, emails, and phone numbers without any throttling.
- Files: `src/app/api/aktionen/route.ts`, `src/app/api/aktionen/[id]/route.ts`
- Impact: Contact person PII (name, email, phone) is harvestable at full speed via the public API.
- Fix approach: Apply rate limiting or auth check to GET endpoints that expose contact PII, or remove `ansprechpersonTelefon` and `ansprechpersonEmail` from the public GET response.

### `GET /api/aktionen/[id]` Returns Full Action Data Without Authentication
- **Severity:** Medium
- Issue: The GET handler in `src/app/api/aktionen/[id]/route.ts` has no auth check. Any unauthenticated caller with a valid action ID can retrieve `ansprechpersonEmail`, `ansprechpersonTelefon`, `ansprechpersonName`, and `teamId`. Action IDs are CUIDs but are exposed in the public listing.
- Files: `src/app/api/aktionen/[id]/route.ts` lines 11–31
- Impact: Contact person details are public. Not inherently wrong if intended, but not consistent with the public listing (which only returns `ansprechpersonName`, not email/phone).
- Fix approach: Either document this as intentional or strip sensitive fields from the unauthenticated response.

### `GET /api/export-aktionen` Has No Team Isolation for Experts
- **Severity:** High
- Issue: `src/app/api/export-aktionen/route.ts` checks only that the user is authenticated (`if (!session)`), but does not apply the expert team-scoping filter that exists in `src/app/api/export/route.ts`. An EXPERT user can call this endpoint and receive a dump of all actions across all teams.
- Files: `src/app/api/export-aktionen/route.ts` lines 8–17
- Impact: Experts can exfiltrate action data (contact persons, addresses, participant counts) for teams outside their own.
- Fix approach: Add the same team isolation guard used in `src/app/api/export/route.ts` lines 27–29.

### Admin Hard-Delete Sends No Cancellation Emails
- **Severity:** Medium
- Issue: `src/app/api/admin/aktionen/[id]/route.ts` performs a hard database delete with no notification to registered volunteers. The soft-cancel endpoint (`DELETE /api/aktionen/[id]/route.ts`) does send emails. Volunteers will simply not show up.
- Files: `src/app/api/admin/aktionen/[id]/route.ts`
- Impact: Registered volunteers have no way to know their event was deleted. DSGVO consent records (EmailLog) are also silently deleted via cascade.
- Fix approach: Either always soft-cancel before hard-delete, or send cancellation emails before deleting.

### Missing Content-Security-Policy Header
- **Severity:** Medium
- Issue: `next.config.ts` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` but omits a `Content-Security-Policy` header.
- Files: `/Users/maassfm/projects/grn_actions/next.config.ts`
- Impact: No CSP means XSS payloads can load arbitrary scripts. Given that the public page collects PII (name, email, phone), this is a meaningful risk.
- Fix approach: Add a `Content-Security-Policy` header restricting `script-src`, `connect-src`, and `frame-ancestors`.

### JWT Tokens Not Invalidated on User Deactivation
- **Severity:** Medium
- Issue: `src/lib/auth.ts` uses JWT strategy with a 24-hour max age. The `active` flag is only checked at login time. If an admin deactivates a user (`active: false`), that user's existing JWT remains valid for up to 24 hours.
- Files: `src/lib/auth.ts` lines 22, 41–43
- Impact: A deactivated account can continue to operate for up to 24 hours post-deactivation.
- Fix approach: Add a database lookup on each request (in the `session` callback or via middleware), or shorten the JWT max age and periodically re-validate.

### Admin User Update Does Not Validate Input Schema
- **Severity:** Low
- Issue: The `PUT /api/admin/users` handler in `src/app/api/admin/users/route.ts` manually picks fields from `body` without running them through `userSchema`. Only the `POST` handler uses Zod validation. This means invalid email formats, short passwords, or unexpected role values are not caught.
- Files: `src/app/api/admin/users/route.ts` lines 80–101
- Impact: An admin could accidentally set a malformed email or too-short password via a direct API call.
- Fix approach: Apply `userSchema.partial()` (or a dedicated update schema) to the PUT body.

---

## Performance

### All `findMany` Queries Have No Pagination
- **Severity:** Medium
- Issue: Every `findMany` call in the API layer returns unbounded result sets. This includes `GET /api/aktionen` (all actions), `GET /api/export` (all registrations), `GET /api/export-aktionen` (all actions), and `GET /api/admin/users` (all users).
- Files: `src/app/api/aktionen/route.ts:51`, `src/app/api/export/route.ts:37`, `src/app/api/export-aktionen/route.ts:17`, `src/app/api/admin/users/route.ts:13`
- Impact: As the dataset grows (many actions, hundreds of registrations), responses will become slow and memory-heavy. Export endpoints loading all registrations into memory before streaming to a file is the most acute case.
- Fix approach: Add `take`/`skip` pagination to listing endpoints. For exports, use streaming or cursor-based iteration.

### Sequential Geocoding During Excel Bulk Import
- **Severity:** Medium
- Issue: The upload route (`src/app/api/upload/route.ts`) geocodes each imported action address sequentially, with a 1.1-second deliberate delay between calls enforced by `geocodeAddresses` in `src/lib/geocoding.ts`. Importing 20 rows takes at least 22 seconds, blocking the request.
- Files: `src/app/api/upload/route.ts` lines 73–108, `src/lib/geocoding.ts` lines 44–57
- Impact: Large imports will hit Next.js request timeouts and leave the user waiting with no feedback.
- Fix approach: Return import results immediately and perform geocoding asynchronously in the background, or use a queue. Alternatively, batch geocode with a single provider API call.

### Email Sending Is Synchronous and Blocks Action Updates
- **Severity:** Low
- Issue: When an action is cancelled or changed, the server loops over all registrations and sends emails sequentially before returning a response. For an action with many registrations, this adds significant latency to the DELETE/PUT handler.
- Files: `src/app/api/aktionen/[id]/route.ts` lines 137–145 (change notifications), lines 205–213 (cancellation), `src/app/api/cron/daily-summary/route.ts` lines 103–127
- Impact: Response time degrades linearly with the number of registrations. With Nodemailer, each send is a network round-trip.
- Fix approach: Decouple email sending from the request handler; enqueue emails and process in the background or via the cron job.

### Tageszeit Filter Applied In-Memory After DB Fetch
- **Severity:** Low
- Issue: `GET /api/aktionen` fetches all matching actions from the database, then filters by `tageszeit` in JavaScript. The database query could push this filter down to avoid transferring unnecessary rows.
- Files: `src/app/api/aktionen/route.ts` lines 62–71
- Impact: Minor now; becomes more expensive as action count grows.
- Fix approach: Parse `startzeit` to an integer in the DB query using a Prisma raw query, or store `stundeStart` as an integer column for efficient filtering.

---

## Technical Debt

### `any` Type Suppressions in Critical Query Logic
- **Severity:** Low
- Issue: The Prisma `where` object is typed as `any` in two query-building blocks, suppressing type safety in the most security-relevant part of the application.
- Files: `src/app/api/aktionen/route.ts` line 20 (`eslint-disable-next-line @typescript-eslint/no-explicit-any`), `src/app/api/export/route.ts` line 21
- Impact: Typos or incorrect field names in the `where` object will not be caught at compile time.
- Fix approach: Use Prisma-generated `Prisma.AktionWhereInput` type instead of `any`.

### `startzeit`/`endzeit` Stored as Strings, Not Time Values
- **Severity:** Low
- Issue: Action start and end times are stored as `String` columns (`HH:MM`) rather than a proper time type or as a combined `DateTime`. This requires string parsing in multiple places and makes DB-level time filtering impossible without raw SQL.
- Files: `prisma/schema.prisma` lines 81–82, `src/app/api/aktionen/route.ts` line 65, `src/app/api/cron/cleanup-anmeldungen/route.ts` lines 5–16
- Impact: The cleanup cron job has to parse the endzeit string manually with potential NaN bugs; tageszeit filtering is in-memory only.
- Fix approach: Migrate to `DateTime` or store an integer `stundeStart`/`minuteStart` alongside the string for query efficiency.

### Proxy File Named `proxy.ts` But Is the Actual Middleware
- **Severity:** Low
- Issue: Next.js middleware must live at `src/middleware.ts` (or `middleware.ts` at root). The file at `src/proxy.ts` uses `export default auth(...)` and `export const config` — the standard middleware export shape — but is named `proxy.ts`. Whether Next.js actually picks this up as middleware depends on project configuration and may be fragile.
- Files: `src/proxy.ts`
- Impact: If Next.js does not recognize `proxy.ts` as middleware, route protection (redirect to `/login`, role check) silently stops working.
- Fix approach: Confirm in `next.config.ts` how the middleware file is wired, or rename to `src/middleware.ts`.

### Email Log `status` Field Is a Free-Form String
- **Severity:** Low
- Issue: `EmailLog.status` in `prisma/schema.prisma` is typed as `String` rather than an enum. The send function writes `"GESENDET"` on success and `"FEHLER: {message}"` on failure. Querying or aggregating by status requires string matching.
- Files: `prisma/schema.prisma` line 131, `src/lib/email.ts` lines 36–51
- Impact: Error messages can contain arbitrary text (including SMTP server messages) stored in the DB; no easy way to count failures by type.
- Fix approach: Add a `EmailStatus` enum (`GESENDET`, `FEHLER`) and a separate nullable `fehlerMeldung` text column.

---

## Missing Coverage / Test Gaps

### No Tests for `export-aktionen` Team Isolation
- **Severity:** High
- Issue: The security gap described above (experts can export all actions) has no test coverage. The test suite covers `export` team isolation but not `export-aktionen`.
- Files: `src/__tests__/security/team-isolation.test.ts`, `src/app/api/export-aktionen/route.ts`
- Priority: High — the missing test masks an active security bug.

### No Integration or E2E Tests
- **Severity:** Medium
- Issue: All tests in `src/__tests__/security/` are unit tests that mock both the database and authentication. There are no integration tests hitting a real database and no E2E tests (Playwright/Cypress) exercising the registration flow.
- Impact: Regressions in Prisma query logic, database constraints, or UI flows will not be caught before deployment.
- Fix approach: Add at least one integration test suite using a test database (the DDEV environment supports this), and consider Playwright smoke tests for the public registration flow.

### No Test for Cron Cleanup Boundary Conditions
- **Severity:** Low
- Issue: The `cleanup-anmeldungen` cron job uses `computeDeletionThreshold` which manipulates `Date` objects with timezone-sensitive logic (`setUTCHours` on a local-time `datum`). There are no unit tests for this function with edge-case inputs (midnight events, timezone boundaries).
- Files: `src/app/api/cron/cleanup-anmeldungen/route.ts` lines 4–16
- Priority: Medium — incorrect threshold could delete registrations too early or never delete them.

### Volunteer Cancellation Has No Mechanism
- **Severity:** Medium
- Issue: The confirmation email tells registrants to "contact the Ansprechperson directly" to cancel. There is no self-service cancellation link or token-based unregistration endpoint.
- Files: `src/lib/email-templates.ts` lines 82–83, `src/app/api/anmeldungen/route.ts`
- Impact: Cancellations require manual admin/expert action; volunteer data persists until the cron cleanup even if the person wants to withdraw consent (DSGVO withdrawal right).

---

## GDPR / Compliance (DSGVO)

### Datenschutzerklärung Has Placeholder Address
- **Severity:** High
- Issue: The privacy policy page states "Anschrift wird noch ergänzt" (address to be added) in both the Datenschutz and Impressum sections. Under DSGVO Art. 13 and §5 TMG, a complete postal address of the data controller is mandatory before the service collects any personal data.
- Files: `src/app/(public)/datenschutz/page.tsx` line 15, `src/app/(public)/impressum/page.tsx` line 15
- Impact: Operating with an incomplete privacy notice while collecting PII is a DSGVO violation and can result in regulatory fines.
- Fix approach: Fill in the actual postal address before going live with user registrations.

### No Self-Service Data Access or Deletion for Volunteers
- **Severity:** High
- Issue: The Datenschutzerklärung lists DSGVO rights (access, rectification, deletion, withdrawal of consent) but provides no mechanism for volunteers to exercise them. There is no API endpoint, contact form, or process described for data subject requests.
- Files: `src/app/(public)/datenschutz/page.tsx` lines 75–84
- Impact: Failure to provide a practical way to exercise DSGVO rights violates Art. 12–17. The only current mechanism is emailing `datenschutz@gruene-mitte.de`, which is mentioned but unlinked.
- Fix approach: Add a mailto link for data subject requests, and document an internal process for handling them. A token-based self-service deletion for registrations would be ideal.

### Retention Policy Stated as "After the Election" — Not Time-Bound
- **Severity:** Medium
- Issue: The Datenschutzerklärung states data will be deleted "after the electoral period" (`nach Abschluss der Wahlperiode`), which is vague and not a specific date. DSGVO requires a defined retention period or the criteria for determining it.
- Files: `src/app/(public)/datenschutz/page.tsx` lines 65–69
- Impact: Legally insufficient retention statement. If the election is delayed or the org repurposes the platform, retention becomes indefinite.
- Fix approach: State a specific maximum retention period (e.g., 30 days after the election date) and automate deletion via the existing cron cleanup infrastructure.

### Volunteer PII Accessible to All Authenticated Experts
- **Severity:** Medium
- Issue: The cron daily-summary email and the dashboard anmeldungen view expose full volunteer PII (name, email, phone, Signal handle) to the `ansprechpersonEmail` of the action. This is appropriate. However, `GET /api/export` with `aktionId` filter can be called by any authenticated expert, not only the Ansprechperson or their team, if they know the action ID. Team isolation is applied at the team level, but an expert in any team can attempt to query by `aktionId` for any action in their team scope.
- Files: `src/app/api/export/route.ts` lines 22–31
- Impact: Low direct risk given team isolation, but worth reviewing whether the export scope matches the data minimisation principle.

### Daily Summary Email Contains Full Volunteer PII Unencrypted Over Email
- **Severity:** Low
- Issue: The `tagesUebersichtEmail` template embeds full name, email address, phone number, and Signal handle of all registrants in a plain HTML email sent to the Ansprechperson.
- Files: `src/lib/email-templates.ts` lines 170–186, `src/app/api/cron/daily-summary/route.ts`
- Impact: Email is not end-to-end encrypted. PII will reside in the recipient's email mailbox and email provider infrastructure. This is standard practice but worth noting in the privacy policy as a data processing activity involving email transmission.
- Fix approach: Document in the Datenschutzerklärung that volunteer details are shared with the responsible contact person via email. Confirm the recipient's email provider is covered by appropriate data processing agreements (Auftragsverarbeitungsvertrag).

### `AktionStatistik` Retains Team and Wahlkreis Linkage Indefinitely
- **Severity:** Low
- Issue: When anmeldungen are cleaned up after 72 hours, an `AktionStatistik` record is created preserving `anmeldungenCount`, `aktionDatum`, `wahlkreisId`, and `teamId`. These aggregate records are never deleted. While count-level data is less sensitive than PII, the retention policy in the Datenschutzerklärung does not mention statistical records.
- Files: `prisma/schema.prisma` lines 135–148, `src/app/api/cron/cleanup-anmeldungen/route.ts` lines 57–65
- Impact: Minor compliance gap; aggregate data is unlikely to be considered personal data, but the policy should acknowledge its indefinite retention.

---

## Fragile Areas

### Cron Jobs Rely on External Curl Calls with No Retry Logic
- **Severity:** Low
- Issue: Both cron jobs (`daily-summary`, `cleanup-anmeldungen`) are triggered by external `curl` commands per `.env.example`. There is no built-in retry, alerting, or monitoring if the curl call fails silently (network error, server restart during the window).
- Files: `.env.example` lines 13–17
- Impact: A missed `cleanup-anmeldungen` run means volunteer PII is retained beyond the 72-hour window. A missed `daily-summary` means Ansprechpersonen do not get their briefing.
- Fix approach: Add response validation to the curl call (check HTTP 200), or use a managed cron service that retries and sends alerts on failure.

### `tageszeit` Filter Logic Is Undocumented and Fragile
- **Severity:** Low
- Issue: The time-of-day categorisation (`vormittags` = before 12:00, `tagsueber` = 12:00–15:59, `abends` = 16:00+) is defined only in `src/app/api/aktionen/route.ts` with no comment. If the frontend filter labels or the API values diverge, filtering silently returns wrong results.
- Files: `src/app/api/aktionen/route.ts` lines 64–70
- Impact: Low for users but hard to debug.
- Fix approach: Extract the cutoff constants and categories to a shared constants file referenced by both frontend and API.

---

*Concerns audit: 2026-03-24*

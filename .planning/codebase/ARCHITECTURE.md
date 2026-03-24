# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** Monolithic Next.js full-stack application using the App Router with REST API routes

**Key Characteristics:**
- Single Next.js 16 app serving both UI (React Server/Client Components) and backend (API Route Handlers)
- No separate backend process — all server logic lives in `src/app/api/` route handlers
- Role-based access control enforced at the API layer, not the middleware layer (middleware only handles route redirects)
- All database access goes through a shared Prisma singleton (`src/lib/db.ts`)
- Frontend pages use client-side fetch to call internal API routes — there are no Server Actions in use

## Layers

**Public UI Layer:**
- Purpose: Unauthenticated volunteer-facing pages
- Location: `src/app/(public)/`
- Contains: Action listing, registration form, privacy policy, impressum
- Depends on: `src/app/api/aktionen`, `src/app/api/anmeldungen`, `src/app/api/wahlkreise`
- Used by: End-users (volunteers)

**Authenticated Dashboard Layer:**
- Purpose: Expert (campaign team) action management
- Location: `src/app/dashboard/`
- Contains: Action list, create/edit forms, registrant view
- Depends on: All `/api/aktionen`, `/api/export`, `/api/upload`, `/api/user/teams`, `/api/wahlkreise` endpoints
- Used by: Users with EXPERT or ADMIN role

**Admin Layer:**
- Purpose: Full platform administration
- Location: `src/app/admin/`
- Contains: All-action overview, team CRUD, user CRUD
- Depends on: All `/api/admin/*` endpoints plus standard aktionen endpoints
- Used by: Users with ADMIN role only

**API Layer:**
- Purpose: All server-side logic, data access, business rules
- Location: `src/app/api/`
- Contains: Route handlers organized by resource (`aktionen`, `anmeldungen`, `export`, `upload`, `admin/*`, `cron/*`)
- Depends on: `src/lib/` modules (db, auth, email, excel, validators, geocoding)
- Used by: UI layers via `fetch()`

**Lib Layer:**
- Purpose: Shared utilities and integrations
- Location: `src/lib/`
- Contains: Auth config, Prisma client, email sending, email templates, Excel parsing/generation, geocoding, Zod validators
- Depends on: External services (SMTP, Nominatim), Prisma, NextAuth
- Used by: API layer exclusively

**Component Layer:**
- Purpose: Reusable UI components
- Location: `src/components/`
- Contains: Domain components (`AktionCard`, `AktionMap`, `AnmeldeFormular`, `ExcelUpload`, `FilterBar`) and primitives in `src/components/ui/`
- Depends on: Nothing from `src/lib/` directly — all data comes via props or internal fetch
- Used by: Page components in all three UI layers

## Data Flow

**Public Registration Flow:**

1. Volunteer visits `src/app/(public)/page.tsx`, which fetches `GET /api/aktionen?public=true`
2. API returns only AKTIV/GEAENDERT future actions (no auth required)
3. Volunteer selects actions and submits `AnmeldeFormular`
4. `POST /api/anmeldungen` validates input (Zod), checks capacity, creates `Anmeldung` records
5. On success, `sendEmail()` fires a BESTAETIGUNG email via SMTP (`src/lib/email.ts`)
6. Email result (success/fail) is written to `EmailLog` table

**Expert Action Mutation Flow:**

1. Expert submits form in dashboard
2. `POST /api/aktionen` or `PUT /api/aktionen/[id]`: validates session, checks team membership, validates body with Zod `aktionSchema`
3. If address changed, `geocodeAddress()` calls Nominatim API for lat/lng
4. Prisma write to `aktionen` table
5. On update: if key fields (datum, startzeit, endzeit, adresse) changed → `status` set to GEAENDERT, AENDERUNG emails sent to all registrants
6. On cancel (DELETE): `status` set to ABGESAGT, ABSAGE emails sent to all registrants

**Admin Hard-Delete Flow:**

1. Admin calls `DELETE /api/admin/aktionen/[id]`
2. No email notifications sent (admin-only operation, intentional divergence from expert cancel)
3. Cascade deletes `Anmeldung` records; `AktionStatistik` (if present) is protected by `onDelete: Restrict`

**Cron Flow:**

1. External caller posts to `/api/cron/daily-summary` or `/api/cron/cleanup-anmeldungen` with `Authorization: Bearer <CRON_SECRET>`
2. `cleanup-anmeldungen`: creates `AktionStatistik` snapshot in a transaction, then deletes `Anmeldung` records 72h after action end time
3. `daily-summary`: groups today's registrations + tomorrow's actions by `ansprechpersonEmail`, sends one TAEGLICHE_UEBERSICHT email per contact person

**State Management:**
- No global client-side state store (no Redux, Zustand, etc.)
- Session state managed by NextAuth `SessionProvider` in `src/app/providers.tsx`; consumed via `useSession()` in client components
- Page-level state is local React state (`useState`)
- Data fetching is imperative `fetch()` in `useEffect` hooks, not React Query or SWR

## Key Abstractions

**Team Isolation:**
- Purpose: Restrict EXPERTs to only their team's data
- Implementation: `session.user.teamIds` (array of team IDs) embedded in JWT at login (`src/lib/auth.ts`)
- Enforcement: Every API handler for EXPERT access adds `where: { teamId: { in: session.user.teamIds } }` to Prisma queries
- Examples: `src/app/api/aktionen/route.ts` (lines 26–31), `src/app/api/aktionen/[id]/route.ts` (lines 54–59), `src/app/api/export/route.ts` (lines 27–30)

**Zod Validation:**
- Purpose: Single source of truth for all input shapes
- Location: `src/lib/validators.ts`
- Schemas: `loginSchema`, `userSchema`, `teamSchema`, `aktionSchema`, `anmeldungSchema`, `excelRowSchema`
- Pattern: Every API POST/PUT parses body with `schema.parse(body)` and catches `ZodError` → 400 response

**Email Lifecycle:**
- Purpose: Notify volunteers of registration and changes; notify contact persons of daily summaries
- Sending: `src/lib/email.ts` (`sendEmail()`) wraps nodemailer, always writes to `EmailLog` regardless of success/failure
- Templates: `src/lib/email-templates.ts` — named export functions per type (`anmeldebestaetigungEmail`, `aenderungsEmail`, `absageEmail`, `tagesUebersichtEmail`)

**AktionStatistik Preservation:**
- Purpose: Retain historical participation counts when `Anmeldung` records are deleted or when an `Aktion` is hard-deleted would be blocked
- Note: `onDelete: Restrict` on `AktionStatistik.aktionId` prevents hard-delete of an `Aktion` that already has a statistik record

## Entry Points

**Public App:**
- Location: `src/app/(public)/page.tsx`
- Triggers: Any unauthenticated browser request to `/`
- Responsibilities: Renders filterable action list and registration form

**NextAuth Handler:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: All `/api/auth/*` requests (login, session, signout)
- Responsibilities: Delegates to NextAuth config in `src/lib/auth.ts`

**Root Layout:**
- Location: `src/app/layout.tsx`
- Responsibilities: Wraps entire app in `SessionProvider` via `src/app/providers.tsx`

## Error Handling

**Strategy:** Explicit HTTP status codes returned from all API handlers; no global error boundary for API errors.

**Patterns:**
- 401 returned when `auth()` returns null (no session) — used consistently across all protected routes
- 403 returned when session exists but role/team check fails
- 400 returned on `ZodError` with `{ error: "Validierungsfehler", details: error }`
- 404 returned when Prisma `findUnique` returns null
- 500 returned as catch-all for unexpected errors (message: "Serverfehler")
- Email send failures are silently logged to `EmailLog` (return value not checked at call sites — fire-and-forget pattern)

## Cross-Cutting Concerns

**Authentication:** `auth()` from NextAuth called at the top of every protected route handler. Session contains `id`, `email`, `name`, `role`, and `teamIds`.

**Authorization (Role):** Inline role check — `if (!session || session.user.role !== "ADMIN")` — at the top of admin-only handlers. No shared middleware or decorator.

**Authorization (Team):** Inline `teamIds` check in EXPERT paths. No shared helper function — pattern repeated in each relevant handler.

**Validation:** All externally-supplied input validated via Zod schemas from `src/lib/validators.ts` before any DB write.

**Rate Limiting:** In-memory `Map`-based rate limiter in `src/app/api/anmeldungen/route.ts` only (10 req/min per IP). No rate limiting on other public or authenticated endpoints.

**Spam Protection:** Honeypot field in `anmeldungSchema` — requests with non-empty `honeypot` are silently accepted but discarded.

**Geocoding:** Address-to-coordinates lookup via Nominatim (OpenStreetMap) in `src/lib/geocoding.ts`. Called on Aktion create/update when coordinates are absent or address has changed. Falls back silently (null coordinates) on failure.

---

*Architecture analysis: 2026-03-24*

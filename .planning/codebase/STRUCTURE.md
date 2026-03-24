# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```
grn_actions/
├── prisma/
│   ├── schema.prisma          # Database schema (single source of truth for all models)
│   ├── seed.ts                # Dev seed data (admin + expert users, teams, wahlkreise, sample aktionen)
│   └── migrations/            # Prisma migration history
├── public/                    # Static assets (logo.png, favicon, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout — wraps all pages in SessionProvider
│   │   ├── providers.tsx      # Client wrapper for NextAuth SessionProvider
│   │   ├── globals.css        # Tailwind base styles + custom CSS vars
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx   # Login form
│   │   ├── (public)/
│   │   │   ├── layout.tsx     # Public nav layout
│   │   │   ├── page.tsx       # Public action listing + registration (main volunteer page)
│   │   │   ├── NavAuthSection.tsx  # Session-aware nav fragment
│   │   │   ├── datenschutz/
│   │   │   │   └── page.tsx   # Privacy policy
│   │   │   └── impressum/
│   │   │       └── page.tsx   # Legal notice
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Dashboard shell with sidebar nav (EXPERT + ADMIN)
│   │   │   ├── page.tsx       # Expert action overview
│   │   │   └── aktionen/
│   │   │       ├── neu/
│   │   │       │   └── page.tsx            # Create action form
│   │   │       └── [id]/
│   │   │           ├── page.tsx            # Edit action form
│   │   │           └── anmeldungen/
│   │   │               └── page.tsx        # Registrant list + export
│   │   ├── admin/
│   │   │   ├── layout.tsx     # Admin shell with sidebar nav
│   │   │   ├── page.tsx       # Admin dashboard (stats overview)
│   │   │   ├── aktionen/
│   │   │   │   └── page.tsx   # All actions across all teams
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── neu/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       ├── neu/page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts  # NextAuth handler (delegates to src/lib/auth.ts)
│   │       ├── aktionen/
│   │       │   ├── route.ts               # GET (public+auth), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts           # GET (public), PUT (update+emails), DELETE (cancel+emails)
│   │       │       └── anmeldungen/
│   │       │           └── route.ts       # GET registrants for an action (auth required)
│   │       ├── anmeldungen/
│   │       │   └── route.ts               # POST public registration (rate-limited, honeypot)
│   │       ├── export/
│   │       │   └── route.ts               # GET registrant export (.xlsx or .txt, auth required)
│   │       ├── export-aktionen/
│   │       │   └── route.ts               # GET action export (Excel, auth required)
│   │       ├── upload/
│   │       │   └── route.ts               # POST Excel import for bulk action creation
│   │       ├── vorlage/
│   │       │   └── route.ts               # GET download Excel import template
│   │       ├── wahlkreise/
│   │       │   └── route.ts               # GET all Wahlkreise (used in dropdowns)
│   │       ├── user/
│   │       │   └── teams/
│   │       │       └── route.ts           # GET current user's teams
│   │       ├── admin/
│   │       │   ├── aktionen/
│   │       │   │   └── [id]/route.ts      # DELETE hard-delete (admin only, no emails)
│   │       │   ├── stats/
│   │       │   │   └── route.ts           # GET aggregate statistics for admin dashboard
│   │       │   ├── teams/
│   │       │   │   └── route.ts           # GET/POST/PUT/DELETE team management
│   │       │   └── users/
│   │       │       └── route.ts           # GET/POST/PUT/DELETE user management
│   │       └── cron/
│   │           ├── daily-summary/
│   │           │   └── route.ts           # POST daily digest emails (CRON_SECRET protected)
│   │           └── cleanup-anmeldungen/
│   │               └── route.ts           # POST delete old Anmeldungen after 72h, snapshot stats
│   ├── components/
│   │   ├── AktionCard.tsx     # Single action card with selection toggle
│   │   ├── AktionMap.tsx      # Leaflet map view of actions (dynamic import, ssr:false)
│   │   ├── AnmeldeFormular.tsx # Volunteer registration form (multi-action)
│   │   ├── ExcelUpload.tsx    # Admin/Expert bulk import UI with preview + validation
│   │   ├── FilterBar.tsx      # Date/time/Wahlkreis filter controls
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config: credentials provider, JWT callbacks, role+teamIds in session
│   │   ├── db.ts              # Prisma client singleton (globalThis pattern for dev hot-reload)
│   │   ├── email.ts           # sendEmail() — nodemailer transport + EmailLog write
│   │   ├── email-templates.ts # HTML email constructors (4 templates: Bestaetigung, Aenderung, Absage, Uebersicht)
│   │   ├── excel.ts           # ExcelJS: parseExcelFile(), createAnmeldungenExcel(), createAnmeldungenTxt()
│   │   ├── geocoding.ts       # Nominatim geocoding: geocodeAddress(), geocodeAddresses() (rate-limited)
│   │   └── validators.ts      # Zod schemas for all models + inferred TypeScript types
│   ├── types/
│   │   └── next-auth.d.ts     # Module augmentation: adds role, teamIds to Session and JWT types
│   └── __tests__/
│       └── security/          # Vitest test files (auth, roles, team isolation, rate limiting, etc.)
├── CLAUDE.md                  # Project instructions for AI assistants
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── next.config.ts
```

## Directory Purposes

**`src/app/(auth)/`:**
- Purpose: Login page only
- Route group: does not add a URL segment
- Key files: `src/app/(auth)/login/page.tsx`

**`src/app/(public)/`:**
- Purpose: All unauthenticated volunteer-facing pages
- Route group: does not add a URL segment — `/` maps to `(public)/page.tsx`
- Key files: `src/app/(public)/page.tsx` (primary public page), `src/app/(public)/layout.tsx`

**`src/app/dashboard/`:**
- Purpose: EXPERT and ADMIN action management
- No explicit role guard in layout — protection is enforced at API level; layouts check `session.user.role` for conditional UI only
- Key files: `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`

**`src/app/admin/`:**
- Purpose: ADMIN-only platform management (users, teams, all actions, stats)
- Key files: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`

**`src/app/api/`:**
- Purpose: All REST endpoints — business logic lives here, not in page components
- Pattern: Resource directories with `route.ts` files using named HTTP method exports (`GET`, `POST`, `PUT`, `DELETE`)

**`src/app/api/admin/`:**
- Purpose: Admin-only API operations. All handlers check `session.user.role !== "ADMIN"` and return 401/403 otherwise.

**`src/app/api/cron/`:**
- Purpose: Scheduled jobs triggered externally. All handlers verify `Authorization: Bearer <CRON_SECRET>`.

**`src/lib/`:**
- Purpose: All server-side utilities. Import from here in API routes, never directly in page components.
- Note: `src/lib/auth.ts` uses Prisma — cannot be imported in Edge runtime. The middleware uses a proxy pattern instead.

**`src/components/`:**
- Purpose: Client-side React components. All are `"use client"` or safe for client use.
- `src/components/ui/` — generic primitives (no domain logic)
- Root `src/components/` — domain components tied to the Aktion/Anmeldung domain

**`src/types/`:**
- Purpose: TypeScript declaration files. Currently only `next-auth.d.ts` which augments the Session type with `role` and `teamIds`.

**`src/__tests__/security/`:**
- Purpose: Security-focused integration tests (Vitest, node environment)
- Tests auth protection, role authorization, data sanitization, input validation, team isolation, rate limiting, cron auth

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, `SessionProvider` wrapper
- `src/app/(public)/page.tsx`: Primary public-facing page
- `src/app/dashboard/page.tsx`: Expert landing after login
- `src/app/admin/page.tsx`: Admin landing

**Configuration:**
- `prisma/schema.prisma`: All database models, enums, and relations
- `src/lib/auth.ts`: NextAuth configuration (credentials provider, JWT strategy, session shape)
- `src/types/next-auth.d.ts`: Session type extensions
- `vitest.config.ts`: Test runner config (node environment)
- `next.config.ts`: Next.js config

**Core Logic:**
- `src/lib/validators.ts`: All Zod schemas — the authoritative definition of every API input shape
- `src/lib/email.ts`: Email dispatch + audit logging
- `src/lib/email-templates.ts`: All email HTML
- `src/lib/excel.ts`: Import parsing and export generation
- `src/lib/geocoding.ts`: Address-to-coordinate resolution

**API Resources:**
- `src/app/api/aktionen/route.ts`: Core action CRUD (GET public + authenticated, POST create)
- `src/app/api/aktionen/[id]/route.ts`: Single action (GET, PUT with change notifications, DELETE/cancel with notifications)
- `src/app/api/anmeldungen/route.ts`: Public registration endpoint
- `src/app/api/admin/users/route.ts`: Full user lifecycle management

## Naming Conventions

**Files:**
- Page files: `page.tsx` (Next.js convention)
- API files: `route.ts` (Next.js App Router convention)
- Layout files: `layout.tsx`
- Components: PascalCase, e.g., `AktionCard.tsx`, `FilterBar.tsx`
- Lib modules: camelCase, e.g., `email-templates.ts`, `geocoding.ts`

**Directories:**
- Route groups use parentheses: `(auth)/`, `(public)/`
- Dynamic segments use brackets: `[id]/`
- Domain-named: matches German domain language (`aktionen`, `anmeldungen`, `wahlkreise`, `admin`)

**Domain Terms (German throughout):**
- `Aktion` — campaign action
- `Anmeldung` — registration
- `Wahlkreis` — electoral district
- `Ansprechperson` — contact person
- `Abgesagt/Geaendert/Aktiv` — action status values

## Where to Add New Code

**New API endpoint for a resource:**
- Create `src/app/api/<resource>/route.ts`
- Add Zod schema to `src/lib/validators.ts`
- Add role/session check at the top of each handler

**New admin-only endpoint:**
- Create `src/app/api/admin/<resource>/route.ts`
- Always check `session.user.role !== "ADMIN"` at the start

**New page in the dashboard:**
- Add `src/app/dashboard/<feature>/page.tsx`
- Use `useSession()` for client-side role checks; add fetch calls to relevant API routes

**New page in admin:**
- Add `src/app/admin/<feature>/page.tsx`
- Sits inside `src/app/admin/layout.tsx` automatically

**New UI component:**
- Domain component → `src/components/<ComponentName>.tsx`
- Generic primitive → `src/components/ui/<ComponentName>.tsx`

**New email type:**
- Add template function to `src/lib/email-templates.ts`
- Add value to `EmailTyp` enum in `prisma/schema.prisma` + run migration
- Call `sendEmail({ ..., typ: "NEW_TYPE" })` from the relevant API handler

**New lib utility:**
- Add module to `src/lib/<name>.ts`
- Import only from API routes or other lib files — never directly from page components

**Database changes:**
- Edit `prisma/schema.prisma`
- Run `ddev exec npx prisma migrate dev --name <description>`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents and codebase analysis
- Generated: No (manually maintained)
- Committed: Yes

**`prisma/migrations/`:**
- Purpose: Auto-generated Prisma migration SQL history
- Generated: Yes (by `prisma migrate dev`)
- Committed: Yes

**`node_modules/`:**
- Generated: Yes
- Committed: No

**`src/__tests__/`:**
- Purpose: All test files
- Note: Only `security/` subdirectory exists; tests use Vitest with `node` environment (not jsdom)

---

*Structure analysis: 2026-03-24*

# Coding Conventions

**Analysis Date:** 2026-03-24

## German Domain Language

This codebase uses German throughout for domain concepts. All model names, field names, and UI strings are German. English is used only for TypeScript/React internals (hooks, types, infrastructure) and inline code comments.

**German domain terms in use:**
- `Aktion` — campaign action
- `Anmeldung` — volunteer registration
- `Wahlkreis` — electoral district
- `Ansprechperson` — contact person
- `Vorname` / `Nachname` — first / last name
- `Datenschutz` — privacy consent
- `Absage` — cancellation
- `Aenderung` — change/modification
- `Tageszeit` — time of day (filter)
- `Uebersicht` — overview/summary

**Conventions for German names:**
- Umlaut-free spellings in code: `aenderungsEmail`, `absageEmail`, `tagesUebersichtEmail`
- Prisma schema and API response fields match German: `ansprechpersonName`, `ansprechpersonEmail`, `ansprechpersonTelefon`, `createdById`
- Error messages returned from API in German: `"Nicht autorisiert"`, `"Kein Zugriff"`, `"Aktion nicht gefunden"`, `"Serverfehler"`
- Status enum values are German uppercase strings: `AKTIV`, `ABGESAGT`, `GEAENDERT`

## Naming Patterns

**Files:**
- React page files: `page.tsx` (Next.js convention)
- Route handler files: `route.ts`
- Layout files: `layout.tsx`
- Component files: PascalCase, descriptive German names — `AktionCard.tsx`, `AnmeldeFormular.tsx`, `FilterBar.tsx`
- UI primitive files: PascalCase English — `Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Dialog.tsx`, `Select.tsx`
- Lib modules: lowercase kebab-free single word — `auth.ts`, `db.ts`, `email.ts`, `excel.ts`, `geocoding.ts`, `validators.ts`
- Template file: `email-templates.ts` (hyphenated exception)

**Functions:**
- React components: PascalCase — `DashboardPage`, `EditAktionPage`, `AnmeldeFormular`
- Event handlers: `handle` prefix — `handleSubmit`, `handleCancel`, `handleTouchStart`
- Form update helpers: `updateForm`
- Lib functions: camelCase verbs — `sendEmail`, `geocodeAddress`, `mockAuth`, `createRequest`
- Email template functions: camelCase German names — `anmeldebestaetigungEmail`, `aenderungsEmail`, `absageEmail`, `tagesUebersichtEmail`

**Variables:**
- camelCase throughout
- German domain values use German names: `aktionen`, `anmeldungen`, `wahlkreise`, `teamIds`
- Boolean states follow `is`/`has` pattern: `isAdmin`, `isExpanded`, `loading`, `saving`
- Unused destructured variables: discarded with `_` — `const { password: _, ...user } = result`

**Types and Interfaces:**
- `interface` for component props and plain data shapes — `ButtonProps`, `AktionInfo`, `SendEmailParams`
- Named type aliases for union types — `ButtonVariant`, `ButtonSize`
- `z.infer<typeof schema>` for Zod-derived types — `LoginInput`, `AktionInput`, `AnmeldungInput`
- Interfaces are defined inline in the file where they are first used (no separate type files)
- Local interfaces use German domain field names matching Prisma schema exactly

## TypeScript Usage

**Strict mode is enabled** (`"strict": true` in `tsconfig.json`). All code must be strictly typed.

**Path alias:**
- `@/*` maps to `src/*` — used throughout: `import { auth } from "@/lib/auth"`, `import Button from "@/components/ui/Button"`

**`any` usage:**
- Avoid. When unavoidable (dynamic Prisma `where` objects, form body destructuring), suppress with inline comment:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  ```
- There are 4 such suppressions in the codebase, all in API route handlers for Prisma `where` objects.

**Type casting pattern:**
- `as unknown as ReturnType<typeof vi.fn>` — used in tests to type-check mocked Prisma methods
- `as any` — used for route handler params in tests (`req as any`)
- `token.sub!` — non-null assertion used once in NextAuth JWT callback

**`forwardRef` pattern for UI components:**
```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", ...props }, ref) => {
    return <button ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export default Button;
```

## Import Organization

**Order (observed):**
1. Next.js / React imports — `"next/server"`, `"react"`, `"next/navigation"`, `"next-auth/react"`
2. Internal lib modules — `"@/lib/auth"`, `"@/lib/db"`, `"@/lib/validators"`
3. Internal components — `"@/components/ui/Button"`, `"@/components/AktionCard"`
4. External packages — `"date-fns"`, `"bcryptjs"`, `"nodemailer"`

No barrel/index files. All imports are direct file paths.

## Component Patterns

**"use client" directive:**
- All interactive components and pages are marked `"use client"` at the top
- Server-only modules (`lib/auth.ts`, `lib/db.ts`, `lib/email.ts`) have no directive
- Layout files that use client hooks (`useSession`, `usePathname`, `useState`) are marked `"use client"`

**Form state pattern:**
```typescript
const [form, setForm] = useState({ titel: "", beschreibung: "", datum: "", ... });

function updateForm(field: string, value: string) {
  setForm({ ...form, [field]: value });
}
```
- Single `form` state object per form, updated with a generic `updateForm` helper
- Separate error state variables for each distinct error type: `error`, `contactError`, `signalError`

**Loading state pattern:**
- `const [loading, setLoading] = useState(true)` — page-level loading
- `const [saving, setSaving] = useState(false)` — submit-specific loading
- Render guard: `if (loading) return <div>Lade...</div>`

**Data fetching:**
- Client-side `useEffect` + `fetch` — no React Query or SWR
- Multiple parallel fetches: `Promise.all([fetch(...), fetch(...)])`

**Dynamic imports (Leaflet map):**
```typescript
const AktionMap = dynamic(() => import("@/components/AktionMap"), { ssr: false });
```

## API Route Patterns

**Standard route file structure** (`src/app/api/***/route.ts`):
1. Import `NextRequest`, `NextResponse` from `"next/server"`
2. Import `auth` from `"@/lib/auth"`, `prisma` from `"@/lib/db"`, schema from `"@/lib/validators"`
3. Auth check at top of protected handlers: `const session = await auth(); if (!session) return 401`
4. Role check for admin routes: `if (!session || session.user.role !== "ADMIN") return 401`
5. Zod `schema.parse(body)` for input validation
6. Try/catch wrapping DB calls; ZodError check in catch: `if (error instanceof Error && error.name === "ZodError")`

**Password sanitization pattern:**
```typescript
const { password: _, ...sanitized } = user;
return NextResponse.json(sanitized);
```
Used consistently whenever a User record is returned from any endpoint.

**Error response format:**
```typescript
NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })
NextResponse.json({ error: "Aktion nicht gefunden" }, { status: 404 })
NextResponse.json({ error: "Validierungsfehler", details: error }, { status: 400 })
NextResponse.json({ error: "Serverfehler" }, { status: 500 })
```

**Team isolation check pattern (for EXPERT routes):**
```typescript
if (session.user.role === "EXPERT") {
  const inTeam = existing.teamId != null && session.user.teamIds?.includes(existing.teamId);
  const isCreator = existing.createdById === session.user.id;
  if (!inTeam && !isCreator) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }
}
```

## Validation

All input validation uses **Zod schemas** defined in `src/lib/validators.ts`:
- One schema per entity: `loginSchema`, `userSchema`, `teamSchema`, `aktionSchema`, `anmeldungSchema`, `excelRowSchema`
- Validation messages are in German: `"Bitte gib eine gültige E-Mail-Adresse ein"`, `"Titel muss mindestens 3 Zeichen lang sein"`
- Inferred TypeScript types exported alongside schemas: `type AktionInput = z.infer<typeof aktionSchema>`
- Complex cross-field validation using `.refine()`: telefon or signalName must be present

## Error Handling

**API routes:**
- Wrap Prisma/validation calls in `try/catch`
- Specifically check `error.name === "ZodError"` for 400 vs generic 500
- Do not re-throw — always return a `NextResponse.json` with an appropriate status

**Email sending:**
- `sendEmail` catches all errors internally, logs to `EmailLog` with `FEHLER:` prefix, returns `false`
- Callers do not need to catch email errors

**Client components:**
- `setError(...)` on failed API calls, displayed inline
- No global error boundaries observed

## Prisma Client

Singleton pattern in `src/lib/db.ts`:
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Comments

**Inline comments are in German** for domain/business logic explanations:
```typescript
// Aktion gehört zu Team A
// Kein authentifizierter Benutzer
// Vordefinierte Test-Sessions
```

**English comments** are used for technical infrastructure notes:
```typescript
// Public: only active/changed, future actions
// Track changes for notification
// Geocode address if no coordinates provided
```

**JSDoc:** Not used. No block-level documentation comments in source or test files.

---

*Convention analysis: 2026-03-24*

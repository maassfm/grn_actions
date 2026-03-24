# Testing Patterns

**Analysis Date:** 2026-03-24

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`
- Environment: `node` (not jsdom — no DOM APIs available in tests)
- Globals enabled (`globals: true`) — `describe`, `it`, `expect`, `vi`, `beforeEach` do not need imports in test files, but all test files explicitly import them from `"vitest"` anyway

**Run Commands:**
```bash
ddev exec npm test              # Run all tests once (vitest run)
ddev exec npm run test:watch    # Watch mode (vitest)
# Single file:
ddev exec npx vitest run src/__tests__/security/auth-protection.test.ts
```

**No coverage configuration** — no coverage thresholds or reporting configured.

## Test File Organization

**Location:** All tests live in `src/__tests__/security/`

**Structure:**
```
src/__tests__/
└── security/
    ├── helpers.ts                  # Shared test utilities and fixtures
    ├── auth-protection.test.ts     # Unauthenticated → 401
    ├── role-authorization.test.ts  # EXPERT cannot access admin endpoints
    ├── team-isolation.test.ts      # EXPERT cannot access other team's data
    ├── input-validation.test.ts    # Invalid input → 400 rejections
    ├── data-sanitization.test.ts   # Passwords stripped, no personal data leaks
    ├── rate-limiting.test.ts       # Rate limit + honeypot enforcement
    └── cron-auth.test.ts           # Cron Bearer token protection
```

**Naming:**
- Test files: `kebab-case.test.ts`
- Test helper file: `helpers.ts` (no `.test.` in filename — not picked up by runner)
- Vitest `include` pattern: `src/__tests__/**/*.test.ts`

**Focus area:** All tests are security tests. There are no unit tests for business logic, no component tests, and no integration tests against a real database.

## Test Structure

**Suite organization:**
```typescript
/**
 * Sicherheitstests: [Area]
 *
 * [German description of what is being tested]
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuth, createRequest, EXPERT_TEAM_A } from "./helpers";

// Module-level mocks (hoisted automatically by Vitest)
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { ... } }));

beforeEach(async () => {
  vi.clearAllMocks();
  await mockAuth(null); // or a specific session
});

describe("German description of scenario", () => {
  it("HTTP method /api/path → expected status for condition", async () => {
    // Dynamic import of route handler (after mocks are set)
    const { GET } = await import("@/app/api/.../route");
    const req = createRequest("/api/...");
    const res = await GET(req as any, { params: Promise.resolve({ id: "..." }) });
    expect(res.status).toBe(401);
  });
});
```

**Key structural patterns:**
- File-level JSDoc block comment in German describing the test file's purpose
- All `vi.mock()` calls at module level (before `beforeEach`)
- `beforeEach`: `vi.clearAllMocks()` + optional `mockAuth(session)`
- Route handlers imported dynamically inside each `it()` block — this ensures mocks are fully set before the module is evaluated
- `vi.resetModules()` used in `rate-limiting.test.ts` and `input-validation.test.ts` to reset in-memory rate limit maps between tests

## Mocking

**Framework:** Vitest built-in (`vi.mock`, `vi.fn`, `vi.stubEnv`)

**What is always mocked:**
- `@/lib/auth` — `{ auth: vi.fn() }` — session controlled per-test via `mockAuth()`
- `@/lib/db` — full Prisma client mock with all entity methods as `vi.fn()`
- `@/lib/email` — `{ sendEmail: vi.fn() }`
- `@/lib/email-templates` — all template functions return `{ subject: "", html: "" }`
- `@/lib/geocoding` — `{ geocodeAddress: vi.fn() }`
- `bcryptjs` — `{ default: { hash: vi.fn(() => "$2a$12$hashedpassword") } }`

**Named Prisma mock (for asserting call arguments):**
```typescript
const mockPrisma = {
  aktion: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), ... },
  anmeldung: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
  // ...
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
```
Used in `team-isolation.test.ts` and `data-sanitization.test.ts` where tests need to call `.mock.calls[0][0]` on Prisma methods to assert query arguments.

**Inline mock setup:**
```typescript
mockPrisma.aktion.findUnique.mockResolvedValue({ id: "aktion-1", teamId: "team-a" });
(prisma.aktion.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ ... });
```
Both styles appear — named mock reference is cleaner; the cast pattern is used when Prisma is imported separately inside `it()`.

**Environment variable mocking:**
```typescript
vi.stubEnv("CRON_SECRET", "test-cron-secret-12345");
```
Used in `cron-auth.test.ts`.

## Test Utilities (`src/__tests__/security/helpers.ts`)

**Predefined sessions:**
```typescript
export const ADMIN_SESSION: MockSession = {
  user: { id: "admin-1", name: "Admin User", email: "admin@test.de", role: "ADMIN", teamId: "team-1" },
};

export const EXPERT_TEAM_A: MockSession = {
  user: { id: "expert-a", email: "expert-a@test.de", role: "EXPERT", teamId: "team-a", teamIds: ["team-a"] },
};

export const EXPERT_TEAM_B: MockSession = {
  user: { id: "expert-b", email: "expert-b@test.de", role: "EXPERT", teamId: "team-b", teamIds: ["team-b"] },
};
```

**Session injection:**
```typescript
export async function mockAuth(session: MockSession | null) {
  const { auth } = await import("@/lib/auth");
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);
}
```
Must be `async` due to dynamic import with path alias.

**Request factories:**
```typescript
export function createRequest(url: string, options?: RequestInit): Request {
  return new Request(`http://localhost:3000${url}`, options);
}

export function createJsonRequest(url: string, body: unknown, method = "POST"): Request {
  return new Request(`http://localhost:3000${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
```

**Local factory functions** (defined inside individual test files):
```typescript
function createAnmeldungBody(overrides: Record<string, unknown> = {}) {
  return { aktionIds: ["aktion-1"], vorname: "Max", nachname: "Muster", email: "max@test.de",
    telefon: "01711234567", datenschutz: true, ...overrides };
}

function createAnmeldungRequest(ip: string) {
  return new Request("http://localhost:3000/api/anmeldungen", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ ... }),
  });
}
```

## Invoking Route Handlers

Route handlers receive the raw `Request` object and optional `params` argument:

```typescript
// No params (simple routes):
const { GET } = await import("@/app/api/admin/users/route");
const res = await GET();   // some handlers accept no args

// With dynamic segment params:
const { GET } = await import("@/app/api/aktionen/[id]/anmeldungen/route");
const res = await GET(req as any, { params: Promise.resolve({ id: "aktion-1" }) });

// With request object only:
const { GET } = await import("@/app/api/export/route");
const res = await GET(req as any);
```

Route handlers return a `Response`/`NextResponse`. Inspect with:
```typescript
expect(res.status).toBe(401);
const body = await res.json();
expect(body.error).toBe("Kein Zugriff");
expect(body).not.toHaveProperty("password");
```

## Test Coverage Areas

**Covered:**
1. **Auth protection** (`auth-protection.test.ts`) — all protected API endpoints return 401 when unauthenticated
2. **Role authorization** (`role-authorization.test.ts`) — EXPERT users cannot access admin endpoints (`/api/admin/*`)
3. **Team isolation** (`team-isolation.test.ts`) — EXPERT can only read/write their own team's data; export filter cannot be overridden
4. **Input validation** (`input-validation.test.ts`) — Zod schema rejections for invalid email, missing fields, empty arrays, honeypot
5. **Data sanitization** (`data-sanitization.test.ts`) — passwords never appear in GET/POST/PUT responses; public endpoints don't expose personal data
6. **Rate limiting** (`rate-limiting.test.ts`) — 10 requests/IP limit on public registration endpoint; per-IP tracking; honeypot check
7. **Cron auth** (`cron-auth.test.ts`) — Bearer token required; wrong token → 401; correct format required

**Not covered:**
- Business logic unit tests (email template rendering, Excel import parsing, geocoding)
- Component rendering tests (no jsdom environment)
- Database integration tests (Prisma always mocked)
- End-to-end tests (no Playwright/Cypress)
- Success paths beyond basic `200`/`201` status assertion in most tests

## It Naming Convention

Test names follow the pattern: `"HTTP_METHOD /api/path → expected result for condition"`

```typescript
it("GET /api/aktionen/[id]/anmeldungen → 401 ohne Auth", ...)
it("EXPERT kann NICHT Anmeldungen eines fremden Teams abrufen → 403", ...)
it("Erlaubt 10 Anfragen pro IP, blockiert die 11.", ...)
it("Passwörter werden nie in Responses exponiert", ...)
```

German is used for business-level descriptions; HTTP method + path used for endpoint-specific tests.

---

*Testing analysis: 2026-03-24*

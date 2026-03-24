# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (strict mode enabled, `noEmit: true`, `isolatedModules: true`)

**Secondary:**
- CSS - Tailwind utility classes compiled via PostCSS

## Runtime

**Environment:**
- Node.js >=20.9.0 (requirement from Next.js; local dev uses v25.8.1)

**Package Manager:**
- npm (lockfile version 3)
- Lockfile: `package-lock.json` present and committed

## Frameworks

**Core:**
- Next.js 16.1.7 - Full-stack React framework using App Router
- React 19.2.3 / react-dom 19.2.3 - UI rendering

**Auth:**
- NextAuth.js 5.0.0-beta.30 (`next-auth`) - Session management with JWT strategy
- `@auth/prisma-adapter` 2.11.1 - Prisma adapter (imported but JWT strategy used, not DB sessions)

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS via `@tailwindcss/postcss` plugin
- PostCSS configured in `postcss.config.mjs`

**ORM / Database:**
- Prisma 6.19.2 (client + CLI) - Schema-first ORM, auto-generated on `postinstall`

**Testing:**
- Vitest 4.1.0 - Test runner, `node` environment, no jsdom
- Config: `vitest.config.ts`

**Build/Dev:**
- `tsx` 4.21.0 - TypeScript execution for seed scripts (`prisma/seed.ts`)
- ESLint 9 with `eslint-config-next` 16.1.7 (core-web-vitals + TypeScript presets)
- Config: `eslint.config.mjs`

## Key Dependencies

**Critical:**
- `zod` 4.3.6 - Runtime validation and schema definition for all model inputs (`src/lib/validators.ts`)
- `bcryptjs` 3.0.3 - Password hashing for credential authentication
- `date-fns` 4.1.0 - Date formatting utilities
- `exceljs` 4.4.0 - Excel import (parsing uploaded .xlsx files) and export (generating .xlsx reports)
- `nodemailer` 7.0.13 - SMTP email delivery for registration confirmations, changes, and daily summaries

**UI:**
- `leaflet` 1.9.4 + `react-leaflet` 5.0.0 - Interactive map rendering for action locations
- `node-cron` 4.2.1 - Cron scheduling (type definitions only; actual cron triggers are external curl commands)

## TypeScript Configuration

**Key settings (`tsconfig.json`):**
- `strict: true` — full strict mode
- `target: ES2017`
- `moduleResolution: bundler`
- `paths: { "@/*": ["./src/*"] }` — `@/` maps to `src/`
- `incremental: true`

## Next.js Configuration

**Security headers applied globally (`next.config.ts`):**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

No custom webpack, image domains, or redirects configured.

## Development Environment

**DDEV (Docker-based) — `.ddev/config.yaml`:**
- Project name: `gruene-aktionen`
- Webserver: nginx-fpm
- PHP version: 8.4 (container base; not used by the app)
- PostgreSQL 16
- Next.js dev server exposed on container port 3000 → https port 3001
- App URL: `https://gruene-aktionen.ddev.site:3001`
- `post-start` hooks: `npm install`, `npx prisma generate`

## Configuration

**Environment variables (see `.env.example`):**
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret (min 32 chars required)
- `NEXTAUTH_URL` — canonical app URL
- `AUTH_TRUST_HOST=true` — required for DDEV/proxy setups
- SMTP credentials: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
- `EMAIL_FROM`, `EMAIL_FROM_NAME` — sender identity
- `CRON_SECRET` — bearer token protecting cron endpoints

---

*Stack analysis: 2026-03-24*

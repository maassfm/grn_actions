# Aktionskoordination – BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte

## What This Is

Eine Web-App zur Koordinierung und Anmeldung von Aktiven bei Wahlkampf-Aktionen für BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte. Freiwillige (häufig ältere Mitglieder) können sich über eine öffentliche Seite für Aktionen anmelden; Experten verwalten Aktionen über ein geschütztes Dashboard; Admins verwalten Teams und Nutzer. Die App verarbeitet personenbezogene Daten (Name, E-Mail, Telefon, Signal-Handle) und unterliegt der DSGVO.

## Core Value

Freiwillige können sich einfach und sicher für Wahlkampf-Aktionen anmelden — zuverlässig, ohne technische Hürden, datenschutzkonform.

## Requirements

### Validated

- ✓ Öffentliche Aktionsübersicht mit Filterung (Datum, Tageszeit, Wahlkreis) — existing
- ✓ Anmeldeformular mit E-Mail-Bestätigung für Freiwillige — existing
- ✓ Expert-Dashboard zur Aktionsverwaltung (CRUD, Status, Geocoding) — existing
- ✓ Admin-Bereich für Nutzer-/Team-/Wahlkreisverwaltung — existing
- ✓ Excel-Import und -Export für Aktionen und Anmeldungen — existing
- ✓ Signal-Text-Export — existing
- ✓ E-Mail-Benachrichtigungen bei Änderung/Absage von Aktionen — existing
- ✓ Tägliche Zusammenfassungs-E-Mail an Ansprechpersonen (Cron) — existing
- ✓ Automatische Bereinigung von Anmeldungen nach 72h (Cron) — existing
- ✓ Rollenbasierte Zugriffskontrolle (ADMIN / EXPERT) mit Team-Isolation — existing
- ✓ Rate Limiting auf Public-Anmelde-Endpoint + Honeypot-Spam-Schutz — existing
- ✓ Basis-Sicherheits-Header (X-Frame-Options, CSP-Basis, etc.) — existing

### Validated

- ✓ SEC-01: Team-Isolation-Lücke in `/api/export-aktionen` geschlossen — Validated in Phase 01: kritische-sicherheitslücken
- ✓ SEC-02: Kontaktpersonen-PII aus öffentlichem `GET /api/aktionen/[id]` entfernt — Validated in Phase 01: kritische-sicherheitslücken
- ✓ SEC-06: Admin-User-Update Zod-Validierung ergänzt — Validated in Phase 01: kritische-sicherheitslücken
- ✓ DSGVO-01: Datenschutzerklärung + Impressum mit vollständigen Pflichtangaben — Validated in Phase 02: dsgvo-konformität-jwt-härtung
- ✓ DSGVO-02: Datenschutzerklärung nennt konkrete Aufbewahrungsfrist (31.10.2026) — Validated in Phase 02: dsgvo-konformität-jwt-härtung
- ✓ DSGVO-03: Freiwillige können sich tokenbasiert selbst abmelden (cancelToken + /abmelden route) — Validated in Phase 02: dsgvo-konformität-jwt-härtung
- ✓ SEC-04: Deaktivierter Nutzer verliert Zugang innerhalb 5 Minuten (JWT + DB-Check) — Validated in Phase 02: dsgvo-konformität-jwt-härtung
- ✓ SEC-05: Rate Limiting auf GET /api/aktionen und GET /api/aktionen/[id] (60/30 req/min) — Validated in Phase 02: dsgvo-konformität-jwt-härtung

### Active

- [ ] SEC-03: Content-Security-Policy Header hinzufügen
- [ ] UI-01: Aktionsübersicht (öffentlich) — Design und Usability für ältere Nutzer verbessern
- [ ] UI-02: Anmeldeformular — klarer, einfacher, vertrauenswürdiger gestalten
- [ ] UI-03: Feedback-Zustände (Ladeanimation, Erfolg, Fehler) konsistent überarbeiten

### Out of Scope

- Self-Service-Datenzugang/-löschung für Freiwillige (DSGVO Art. 15–17) — wichtig langfristig, zu komplex für v1
- Pagination für alle `findMany`-Queries — Performance-Optimierung für spätere Version wenn Datenmenge wächst
- Asynchrone E-Mail-Verarbeitung / Queue — technische Schuld, kein v1-Blocker
- Integration/E2E-Tests (Playwright) — wertvoll, aber nicht Teil dieses Milestones
- OAuth / Passwortlose Anmeldung — nicht benötigt für die Zielgruppe

## Context

- **Bestehende Codebasis:** Next.js 16 (App Router), TypeScript strict, PostgreSQL + Prisma, NextAuth.js v5 (JWT), Tailwind CSS v4, Nodemailer, ExcelJS
- **Zielgruppe Freiwillige:** Eher ältere Mitglieder — brauchen besonders klare, einfache Bedienung ohne technische Vorkenntnisse
- **DSGVO-Pflicht:** App sammelt PII (Name, E-Mail, Telefon, Signal) von Freiwilligen — Datenschutzerklärung und Impressum müssen vor Live-Betrieb vollständig sein
- **Bekannte Sicherheitslücken:** Aus dem Codebase-Map-Audit (2026-03-24) wurden 7 Sicherheits- und DSGVO-Probleme dokumentiert, davon 2 mit hoher Priorität (export-aktionen Team-Isolation, Datenschutzerklärung Pflichtangaben)
- **Dev-Umgebung:** DDEV (Docker), App unter `https://gruene-aktionen.ddev.site:3001`

## Constraints

- **Tech Stack:** Bestehender Stack (Next.js, Prisma, NextAuth, Tailwind) — kein Austausch von Core-Dependencies
- **Sprache:** UI und Domänensprache ist Deutsch — bleibt so
- **DSGVO:** Alle Änderungen, die personenbezogene Daten betreffen, müssen DSGVO-konform bleiben
- **Zielgruppe:** UI-Änderungen müssen für ältere, weniger technikaffine Nutzer verständlich sein — keine cleveren Tricks, klare Beschriftungen

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Brownfield-Projekt: Sicherheit vor neuen Features | Sicherheitslücken (Team-Isolation, CSP, PII-Leak) müssen geschlossen werden bevor weitere Features gebaut werden | — Pending |
| UI-Fokus auf öffentlichen Flow (Übersicht + Anmeldung) | Das ist der Primärfluss für Freiwillige — der kritischste Pfad für die Kernfunktion | — Pending |
| JWT-Strategie bleibt (kein DB-Session-Wechsel) | Zu riskant als Teil dieses Milestones; JWT-Invalidierung wird mit kürzerer TTL + aktiver Prüfung adressiert | — Pending |

## Evolution

Dieses Dokument entwickelt sich bei Phasenübergängen und Milestone-Abschlüssen.

**Nach jedem Phasenübergang:**
1. Invalidierte Requirements? → Nach Out of Scope verschieben (mit Grund)
2. Validierte Requirements? → Nach Validated verschieben (mit Phasenreferenz)
3. Neue Requirements? → Nach Active hinzufügen
4. Entscheidungen? → Key Decisions ergänzen
5. "What This Is" noch korrekt? → Bei Drift aktualisieren

**Nach jedem Milestone:**
1. Vollständige Überprüfung aller Abschnitte
2. Core Value prüfen — noch die richtige Priorität?
3. Out of Scope überprüfen — Gründe noch gültig?

---
*Last updated: 2026-03-25 after Phase 02 completion — DSGVO-Konformität + JWT-Härtung abgeschlossen (DSGVO-01, DSGVO-02, DSGVO-03, SEC-04, SEC-05)*

# Roadmap: Aktionskoordination — Security Hardening + DSGVO Compliance Milestone

## Overview

Brownfield milestone on an existing, functional campaign coordination platform. The app already works. This milestone makes it legally and safely deployable: close two active data-exfiltration gaps first, then bring DSGVO compliance and JWT hardening to a legally shippable state, then harden public-facing endpoints and improve the volunteer UI for older users. Three sequential phases, each delivering a verifiable and independently deployable improvement.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Kritische Sicherheitslücken** - Aktive Daten-Exfiltrationsvektoren und Input-Validierungslücken schließen (completed 2026-03-24)
- [ ] **Phase 2: DSGVO-Konformität + JWT-Härtung** - App vor Live-Betrieb mit echten Registrierungen rechtskonform machen
- [ ] **Phase 3: Rate Limiting, CSP und Accessibility** - Verbleibende Sicherheits-Header, öffentliche Endpunkt-Absicherung und WCAG-AA-Basiskonformität

## Phase Details

### Phase 1: Kritische Sicherheitslücken
**Goal**: Aktive Datenlecks sind geschlossen — kein authentifizierter Nutzer kann Daten fremder Teams lesen, kein anonymer Caller kann Kontaktpersonen-PII abrufen
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-06
**Success Criteria** (what must be TRUE):
  1. Ein eingeloggter Expert kann über `/api/export-aktionen` ausschließlich Aktionen seines eigenen Teams abrufen — nicht die anderer Teams
  2. Ein unauthentifizierter Caller erhält von `GET /api/aktionen/[id]` keine `ansprechpersonEmail` und keine `ansprechpersonTelefon`-Felder in der Antwort
  3. `PUT /api/admin/users` lehnt Request-Bodies mit fehlenden oder typfalschen Feldern mit einem validierten Fehler ab, bevor irgendein Datenbankschreibvorgang stattfindet
  4. Ein Sicherheits-Test schlägt fehl, wenn die Team-Isolation-Klausel in `export-aktionen` entfernt wird (Regression wird erkannt)
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — SEC-01 + SEC-02: Team-Isolation in export-aktionen + PII-Strip in GET /api/aktionen/[id] + Regressionstests
- [x] 01-02-PLAN.md — SEC-06: Zod-Validierung (userUpdateSchema) fuer PUT /api/admin/users + Regressionstests

### Phase 2: DSGVO-Konformität + JWT-Härtung
**Goal**: Die App erfüllt die DSGVO-Mindestanforderungen für den Live-Betrieb und deaktivierte Nutzer verlieren den Zugang innerhalb von 5 Minuten
**Depends on**: Phase 1
**Requirements**: DSGVO-01, DSGVO-02, DSGVO-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. Die Datenschutzerklärung und das Impressum enthalten eine vollständige Postadresse, den/die Verantwortliche(n), die Rechtsgrundlage und eine konkrete maximale Aufbewahrungsfrist — keine Platzhaltertexte
  2. Ein Freiwilliger kann auf den Link in seiner Bestätigungs-E-Mail klicken und sich damit eigenständig von einer Aktion abmelden (Token-basiert, ohne Login)
  3. Ein im Admin-Bereich deaktivierter Nutzer kann sich spätestens nach 5 Minuten nicht mehr mit einem vorhandenen JWT einloggen oder API-Calls durchführen
**Plans:** 4 plans

Plans:
- [ ] 02-01-PLAN.md — DSGVO-01/02: Datenschutzerklaerung + Impressum mit konkreten Loeschfristen und DEPLOY-BLOCKER
- [ ] 02-02-PLAN.md — SEC-04 + SEC-05: JWT lastChecked User-Check + Rate Limiting auf GET-Endpunkte
- [ ] 02-03-PLAN.md — DSGVO-03 Teil 1: Prisma cancelToken-Migration + Token-Generierung + Abmelde-Route + Bestaetigungsseite
- [ ] 02-04-PLAN.md — DSGVO-03 Teil 2: E-Mail-Templates mit Abmelde-Links + EmailLog ABMELDUNG-Tracking + Tagesuebersicht

### Phase 3: Rate Limiting, CSP und Accessibility
**Goal**: Öffentliche Endpunkte sind gegen PII-Harvesting geschützt, die App sendet einen CSP-Header der XSS einschränkt ohne die Leaflet-Karte zu brechen, und die öffentliche Aktionsübersicht ist für ältere Nutzer gut bedienbar
**Depends on**: Phase 2
**Requirements**: SEC-03, SEC-05, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. Die App sendet bei allen Seitenaufrufen einen `Content-Security-Policy`-Header — und die Leaflet-Karte zeigt Marker korrekt an (kein Marker-Verlust, keine Konsolen-Fehler durch blockierte Ressourcen)
  2. `GET /api/aktionen` und `GET /api/aktionen/[id]` geben bei mehr als N Anfragen pro IP-Adresse innerhalb eines definierten Zeitfensters einen `429`-Status zurück
  3. Alle Text-Elemente in der öffentlichen Aktionsübersicht erfüllen WCAG 2.1 AA Kontrastanforderungen (4,5:1) und verwenden mindestens 16px Schriftgröße
  4. Alle interaktiven Filter-Elemente (Wahlkreis, Datum, Tageszeit) haben eine Trefferzone von mindestens 44×44px und besitzen sichtbare Beschriftungen (keine rein Icon-only-Elemente)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Kritische Sicherheitslücken | 2/2 | Complete   | 2026-03-24 |
| 2. DSGVO-Konformität + JWT-Härtung | 0/4 | Planned | - |
| 3. Rate Limiting, CSP und Accessibility | 0/? | Not started | - |

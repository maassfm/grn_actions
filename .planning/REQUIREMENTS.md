# Requirements: Aktionskoordination — Milestone 1

**Defined:** 2026-03-24
**Core Value:** Freiwillige können sich einfach und sicher für Wahlkampf-Aktionen anmelden — zuverlässig, ohne technische Hürden, datenschutzkonform.

## v1 Requirements

### Sicherheit (Kritische Fixes)

- [x] **SEC-01**: Experte kann nicht auf Aktionsdaten fremder Teams über `/api/export-aktionen` zugreifen (Team-Isolation-Lücke schließen)
- [x] **SEC-02**: `GET /api/aktionen/[id]` gibt unauthentifizierten Aufrufern keine Kontaktpersonen-E-Mail oder -Telefonnummer zurück
- [ ] **SEC-03**: Die App sendet einen Content-Security-Policy-Header der XSS-Angriffe einschränkt und die Leaflet-Karte nicht bricht
- [ ] **SEC-04**: Ein deaktivierter Nutzer verliert den Zugang innerhalb von maximal 5 Minuten (JWT-TTL-Verkürzung + aktiver User-Check)
- [ ] **SEC-05**: `GET /api/aktionen` und `GET /api/aktionen/[id]` sind rate-limited um PII-Harvesting zu verhindern
- [x] **SEC-06**: `PUT /api/admin/users` validiert den Request-Body mit Zod bevor Datenbankschreibvorgänge stattfinden

### DSGVO-Konformität

- [x] **DSGVO-01**: Datenschutzerklärung und Impressum enthalten vollständige Pflichtangaben (Postadresse, Verantwortlicher, Rechtsgrundlage) — harter Go-Live-Blocker
- [ ] **DSGVO-02**: Datenschutzerklärung nennt eine konkrete maximale Aufbewahrungsfrist (keine vage "nach der Wahl"-Formulierung)
- [ ] **DSGVO-03**: Freiwillige können sich über einen tokenbasierten Link in der Bestätigungs-E-Mail selbst von einer Aktion abmelden (DSGVO Art. 7 Widerruf)

### UI — Öffentliche Aktionsübersicht

- [ ] **UI-01**: Die öffentliche Aktionsübersicht ist für ältere Nutzer gut lesbar (ausreichende Schriftgrößen, Kontrast WCAG AA, keine reinen Icon-only-Elemente)
- [ ] **UI-02**: Die Wahlkreis-/Filter-Elemente sind groß genug um zuverlässig mit Finger oder Maus bedient zu werden (min. 44×44px Trefferzone)

## v2 Requirements

### UI — Anmeldeformular

- **UI-04**: Das Anmeldeformular ist kein Bottom-Sheet mehr, sondern inline oder auf einer eigenen Seite (bessere Bedienbarkeit auf Mobilgeräten für ältere Nutzer)
- **UI-05**: Feedback-Zustände (Ladeanimation, Erfolg, Fehler) sind konsistent und bleiben dauerhaft sichtbar (kein automatisches Ausblenden)

### Sicherheit (Erweiterungen)

- **SEC-07**: Admin-Hard-Delete sendet Absage-E-Mails an registrierte Freiwillige vor dem Löschen
- **SEC-08**: In-Memory Rate Limiter ist durch Redis/Upstash austauschbar wenn die App auf mehrere Instanzen skaliert

### DSGVO (Erweiterungen)

- **DSGVO-04**: Freiwillige können per E-Mail eine Kopie ihrer gespeicherten Daten anfordern (DSGVO Art. 15)
- **DSGVO-05**: `AktionStatistik` Aufbewahrung ist in der Datenschutzerklärung dokumentiert

## Out of Scope

| Feature | Grund |
|---------|-------|
| Nonce-basiertes CSP | Zwingt alle Seiten in dynamisches Rendering (kein ISR/CDN); Leaflet benötigt ohnehin `unsafe-inline` in `style-src` |
| Redis-backed Rate Limiting | DDEV-Einzelprozess-Umgebung; in-memory mit lru-cache ausreichend für v1 |
| OAuth / Magic-Link-Login | Nicht benötigt für die Zielgruppe (interne Nutzer mit festen Accounts) |
| Echtzeit-Updates (WebSockets) | Hoher Aufwand, kein Nutzerbedarf identifiziert |
| Pagination für alle Listenendpunkte | Performance-Optimierung für spätere Version wenn Datenmenge wächst |
| E2E-Tests (Playwright/Cypress) | Wertvoll, aber außerhalb des Sicherheits-/UI-Milestones |
| CAPTCHA auf Anmeldeformular | Accessibility-Barriere für ältere Nutzer; Honeypot + Rate Limiting ausreichend |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| SEC-06 | Phase 1 | Complete |
| DSGVO-01 | Phase 2 | Complete |
| DSGVO-02 | Phase 2 | Pending |
| DSGVO-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| SEC-03 | Phase 3 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |

**Coverage:**
- v1 Requirements: 11 gesamt
- Phasen zugeordnet: 11
- Nicht zugeordnet: 0 ✓

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation*

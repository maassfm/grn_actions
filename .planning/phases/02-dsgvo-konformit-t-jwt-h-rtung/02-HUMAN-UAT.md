---
status: partial
phase: 02-dsgvo-konformit-t-jwt-h-rtung
source: [02-VERIFICATION.md]
started: 2026-03-25T06:28:00Z
updated: 2026-03-25T06:28:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Datenschutzerklärung Visual Rendering

expected: Three separate paragraphs in "Löschung der Daten" section: (1) 72h Anmeldedaten paragraph, (2) 31. Oktober 2026 for accounts, (3) 31. Oktober 2026 for statistics. DEPLOY-BLOCKER JSX comment NOT visible to users.
result: [pending]

### 2. Impressum Visual Rendering

expected: "Anschrift wird noch ergänzt" placeholder shown. No JSX comment text rendered to users.
result: [pending]

### 3. JWT 5-Minute Invalidation (Live Test)

expected: Log in as expert@gruene-mitte.de. Deactivate the user in admin panel. After 5 minutes, session is invalidated — redirected to /login and API calls return 401.
result: [pending]

### 4. Cancellation Link in Confirmation Email

expected: Submit a registration via public form. Confirmation email contains "Von dieser Aktion abmelden" link pointing to <NEXTAUTH_URL>/api/anmeldungen/abmelden?token=<64-char-hex>. Clicking the link deletes registration and redirects to /abmeldung with success message.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

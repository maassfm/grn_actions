# Design System — Aktionskoordination B90/GRÜNE Berlin-Mitte

## 1. Design-Philosophie: Soft Brutalism

Das UI folgt einem **Soft Brutalist**-Ansatz: rohe Ehrlichkeit in der Darstellung, physisch spürbare Interaktionselemente und radikale Klarheit durch Kontrast — ohne unnötige Dekorationen.

### Kernprinzipien

| Prinzip | Beschreibung |
|--------|-------------|
| **Klarheit durch Kontrast** | Inhalte werden durch kräftige schwarze Umrandungen (2–3 px) konsequent voneinander getrennt. |
| **Geometrische Strenge** | Ausschließlich 90°-Winkel. Keine abgerundeten Ecken (`border-radius: 0`). |
| **Greifbare Interaktivität** | Buttons und interaktive Elemente wirken durch Schatten und dicke Rahmen physisch präsent. |
| **Ehrliche Struktur** | Inhalte werden roh und direkt präsentiert — kein unnötiger Schmuck. |

---

## 2. Farbpalette

| Token (Tailwind) | Hex | Verwendung |
|-----------------|-----|-----------|
| `tanne` | `#005538` | Call-to-Actions, Statusanzeigen, ausgewählte Tags, aktive Filter |
| `himmel` | `#0BA1DD` | Sekundäre Highlights, Info-Badges |
| `sonne` | `#FFF17A` | Warnungen, „Geändert"-Badge |
| — | `#E6007E` | Fehler- und Alertzustände (Signal-Pink) |
| Hintergrund | `#FFFFFF` | Seiteninhalt (reines Weiß) |
| Konturen & Text | `#000000` | Alle Rahmen (2–3 px), gesamte Typografie |
| Schatten | schwarz/grau | Tiefe auf interaktiven Elementen |

> **Hinweis:** Die Tailwind-Tokens `tanne`, `himmel` und `sonne` sind bereits in `src/app/globals.css` definiert und sollten direkt verwendet werden.

---

## 3. Typografie

| Schrift | Einsatz | Gewicht |
|--------|---------|--------|
| **GrueneType Neue** | Überschriften (H1–H6), Markentext | Extra Bold · Uppercase |
| **DM Sans** | Fließtext, Labels, Formularelemente | Regular (400) · Bold (700) |

### Hierarchie

- **H1 / Titel** — GrueneType Neue, Extra Bold, sehr prominent, uppercase
- **Labels / Filter-Beschriftungen** — DM Sans Bold, gut lesbar beim schnellen Scannen
- **Fließtext / Eingabefelder** — DM Sans Regular, großzügiger Zeilenabstand (`line-height: 1.6`)

> Schriftdateien für GrueneType Neue liegen unter `/public/fonts/`. DM Sans ist über Google Fonts (`fonts.googleapis.com`) einzubinden oder als WOFF2 lokal abzulegen.

---

## 4. Komponenten

### 4.1 Navigation

- **Fixierte Leiste** oben im Viewport (`position: sticky; top: 0`)
- Logo linksbündig · Text-Links rechtsbündig
- Trennlinie: dicker schwarzer Balken (`border-bottom: 3px solid #000`) zwischen Navigation und Inhalt
- Hintergrund: `#005538` (tanne), weiße Schrift

### 4.2 Filterleiste (3 Zeilen)

**Zeile 1 — Datum:**
- Datumseingabe (Textfeld, scharfe Ecken, schwarzer Rahmen)
- Schnellauswahl-Buttons: „Heute" / „Morgen" — flach, schwarzer Rahmen, kein Radius

**Zeile 2 — Tageszeit:**
- Buttons: „Morgens" / „Nachmittags" / „Abends"
- Inaktiv: weißer Hintergrund, schwarzer Rahmen
- Aktiv: `#005538` Hintergrund, weiße Schrift, schwarzer Rahmen

**Zeile 3 — Wahlkreise:**
- Quadratische Kacheln pro WK (z. B. „WK 75" … „WK 79")
- Inaktiv: weiß mit schwarzem Rahmen
- Aktiv: `#005538` Hintergrund, weißer Text, schwarzer Rahmen
- Kein `border-radius`

### 4.3 Aktionskarten (Event Cards)

```
┌─────────────────────────────────────────┐
│ STAND LEOPOLDPLATZ               [✓]    │
│ 📅 Donnerstag, 26. März · 17:00–19:00   │
│ 📍 Leopoldpl. 1, 13353 Berlin           │
│ [WK 7: Humboldthain]  [Geändert]  👤 F │
└─────────────────────────────────────────┘
```

- **Rahmen:** 2–3 px solide schwarz, `border-radius: 0`
- **Hintergrund:** `#FFFFFF`
- **Ausgewählt:** grüner Rahmen (`#005538`, 3 px) oder schwarzer Box-Shadow
- **Icons:** System-Emojis (📅 Datum/Zeit, 📍 Ort, 👤 Ansprechperson) — keine Custom-SVGs
- **Checkbox rechts:** großes quadratisches Auswahlfeld
  - Inaktiv: weißes Quadrat, schwarzer Rahmen
  - Aktiv: schwarzes Quadrat mit weißem ✓

**Status-Badges:**
| Status | Hintergrund | Text | Rahmen |
|--------|------------|------|--------|
| Geändert | `#FFF17A` | `#000000` | 1 px schwarz |
| Abgesagt | `#E6007E` | `#FFFFFF` | 1 px schwarz |

### 4.4 Aktionsauswahl-Anzeige

Prominenter Zähler direkt oberhalb der Kartenliste:

```
┌──────────────────────────────────────┐
│  3 AKTIONEN AUSGEWÄHLT               │
│  [Stand Leopoldplatz] [Stand Europ.] │
└──────────────────────────────────────┘
```

- **Zähler:** GrueneType Neue, Extra Bold, `font-size: 1.5rem+`, schwarze Umrandung oder Shadow
- **Tags (ausgewählte Aktionen):**
  - Hintergrund: `#005538`
  - Schrift: `#FFFFFF`, klein und kompakt
  - Rahmen: 1–2 px schwarz, `border-radius: 0`
  - Inline unterhalb des Zählers

### 4.5 Anmeldeformular (Bottom Sheet / Seite)

**Layout:**
- Als Bottom Sheet auf Mobile (fixiert, hochschiebbar) oder als eigene Seite

**Felder:**
- Scharfe Ecken, schwarzer Rahmen (2 px), weißer Hintergrund
- Labels: DM Sans Bold, Uppercase
- Placeholder: DM Sans Regular, grau

**Feldreihenfolge:**
1. Vorname
2. Nachname
3. E-Mail
4. Telefonnummer
5. Signal-Nutzername (`z.B. name.123`)
6. Datenschutz-Checkbox + Zustimmungstext

**Zustimmungs-Checkbox:**
- Quadratisch, schwarzer Rahmen
- Aktiviert: schwarzes Quadrat mit grünem ✓ oder `#005538` Hintergrund

**Abschicken-Button:**
- `#005538` Hintergrund, weißer Text, schwarzer Rahmen (2 px)
- Box-Shadow: `4px 4px 0 #000` (leicht versetzt, ohne blur)
- `border-radius: 0`
- Text: „REGISTRIEREN" (uppercase, bold)

**Feedback-Boxen:**
| Typ | Hintergrund | Rahmen |
|-----|------------|--------|
| Fehler | `#E6007E` (hell-tint) | 2 px schwarz |
| Erfolg | `#005538` (hell-tint) | 2 px schwarz |

---

## 5. Interaktionsdesign

### Schatten-System

Alle interaktiven Elemente verwenden einen **harten Versatz-Schatten** (kein Blur):

```css
box-shadow: 4px 4px 0 #000000;
```

Hover-Zustand: Schatten reduzieren oder verschieben, um einen „Drücken"-Effekt zu simulieren:

```css
/* Hover */
box-shadow: 2px 2px 0 #000000;
transform: translate(2px, 2px);
```

### Fokus-Zustand

Klarer schwarzer `outline: 3px solid #000` ohne `outline-offset` — konsistent mit dem Brutalist-Stil. Kein farbiger Focus-Ring.

---

## 6. Raster & Abstände

- **Max-Width:** `max-width: 640px` für Mobile-First-Layout
- **Padding:** `16px` horizontaler Außenabstand auf Mobile
- **Gap zwischen Karten:** `12–16px`
- **Innerer Kartenabstand:** `16px`
- Kein CSS Grid für den öffentlichen Bereich — stattdessen einfacher vertikaler Stack

---

## 7. Abgrenzung zum bestehenden Design

| Bereich | Aktuell | Soft Brutalist (Ziel) |
|---------|---------|----------------------|
| Hintergrund | `sand` (`#F5F1E9`) | `#FFFFFF` (reines Weiß) |
| Kartenrahmen | `border-gray-200` | 2–3 px `#000000` |
| `border-radius` | `rounded-xl`, `rounded-full` | `0` durchgehend |
| Filterbuttons | `rounded-full` | eckige Kacheln |
| Body-Font | PT Sans | DM Sans |
| Box-Shadow | Tailwind-Standard | Harter Versatz `4px 4px 0 #000` |

> Diese Datei beschreibt den angestrebten Zielzustand. Die Umsetzung erfolgt schrittweise über das bestehende Tailwind-System in `src/app/globals.css` und die bestehenden Komponenten.

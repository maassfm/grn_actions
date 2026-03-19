import { format } from "date-fns";
import { de } from "date-fns/locale";

interface AktionInfo {
  titel: string;
  datum: Date;
  startzeit: string;
  endzeit: string;
  adresse: string;
  ansprechpersonName: string;
  ansprechpersonEmail: string;
  ansprechpersonTelefon: string;
}

const baseUrl = process.env.NEXTAUTH_URL ?? "https://aktionen.gruene-mitte.de";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'PT Sans', Arial, sans-serif; background-color: #F5F1E9; color: #171717; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; }
    .header { background-color: #005538; padding: 24px 32px; text-align: center; }
    .header h1 { color: #FFFFFF; font-size: 22px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .header .logo { width: 56px; height: 56px; margin-bottom: 8px; }
    .header .subtitle { color: #FFF17A; font-size: 16px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 4px 0; }
    .content { padding: 32px; }
    .content h2 { color: #005538; font-size: 18px; font-weight: 700; text-transform: uppercase; margin-top: 0; }
    .aktion-card { background: #F5F1E9; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #008939; }
    .aktion-card h3 { color: #005538; margin: 0 0 8px 0; font-size: 16px; }
    .aktion-card p { margin: 4px 0; font-size: 14px; color: #404040; }
    .footer { background-color: #F5F1E9; padding: 24px 32px; font-size: 12px; color: #737373; text-align: center; }
    .footer a { color: #005538; }
    .change-highlight { background: #FFF17A; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${baseUrl}/logo.png" alt="Sonnenblume" class="logo" />
      <p class="subtitle">Kreisvorstand</p>
      <h1>B90/GRÜNE Berlin-Mitte</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte</p>
      <p>Diese E-Mail wurde automatisch versendet. Bitte antworte nicht auf diese E-Mail.</p>
      <p>Deine Daten werden nur zur Koordination von Wahlkampfaktionen verwendet und nach der Wahl gelöscht.</p>
      <p><a href="${baseUrl}/datenschutz">Datenschutzerklärung</a> · <a href="${baseUrl}/impressum">Impressum</a></p>
    </div>
  </div>
</body>
</html>`;
}

function formatAktionCard(aktion: AktionInfo): string {
  const datumStr = format(aktion.datum, "EEEE, d. MMMM yyyy", { locale: de });
  return `<div class="aktion-card">
    <h3>${aktion.titel}</h3>
    <p>📅 ${datumStr}</p>
    <p>🕐 ${aktion.startzeit} – ${aktion.endzeit} Uhr</p>
    <p>📍 ${aktion.adresse}</p>
    <p>👤 ${aktion.ansprechpersonName} · <a href="mailto:${aktion.ansprechpersonEmail}">${aktion.ansprechpersonEmail}</a> · ${aktion.ansprechpersonTelefon}</p>
  </div>`;
}

export function anmeldebestaetigungEmail(
  vorname: string,
  aktionen: AktionInfo[]
): { subject: string; html: string } {
  const subject = `Deine Anmeldung bei B90/GRÜNE Berlin-Mitte – ${aktionen.length} Aktion${aktionen.length > 1 ? "en" : ""}`;

  const content = `
    <h2>Hallo ${vorname},</h2>
    <p>vielen Dank für Deine Anmeldung! Du hast Dich für ${aktionen.length > 1 ? "folgende Aktionen" : "folgende Aktion"} angemeldet:</p>
    ${aktionen.map(formatAktionCard).join("")}
    <p>Bei Fragen oder wenn Du absagen möchtest, wende Dich bitte direkt an die jeweilige Ansprechperson.</p>
    <p>Wir freuen uns auf Dich! 💚</p>
    <p>Viele Grüße<br>
    Annalena, Florian, Lara, Linus, Madlen und Timur<br>
    Kreisvorstand BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte/p>
  `;

  return { subject, html: baseLayout(content) };
}

export function aenderungsEmail(
  aktion: AktionInfo,
  changes: { field: string; oldValue: string; newValue: string }[]
): { subject: string; html: string } {
  const subject = `Änderung an Wahlkampfaktion: ${aktion.titel}`;

  const changesList = changes
    .map(
      (c) =>
        `<p><strong>${c.field}:</strong> <span class="change-highlight">${c.oldValue}</span> → <span class="change-highlight">${c.newValue}</span></p>`
    )
    .join("");

  const content = `
    <h2>Änderung an deiner Aktion</h2>
    <p>Eine Aktion, für die Du Dich angemeldet hast, wurde geändert:</p>
    <h3>${aktion.titel}</h3>
    ${changesList}
    <h3>Aktualisierte Details:</h3>
    ${formatAktionCard(aktion)}
    <p>Bei Fragen wende Dich bitte an die Ansprechperson.</p>
  `;

  return { subject, html: baseLayout(content) };
}

export function absageEmail(aktion: AktionInfo): { subject: string; html: string } {
  const datumStr = format(aktion.datum, "d. MMMM yyyy", { locale: de });
  const subject = `Absage: ${aktion.titel} am ${datumStr}`;

  const content = `
    <h2>Aktion abgesagt</h2>
    <p>Leider wurde die folgende Aktion absagt:</p>
    ${formatAktionCard(aktion)}
    <p>Wir bedauern die Unannehmlichkeiten. Schau gerne auf <a href="${baseUrl}">unserer Seite</a> nach weiteren Aktionen, bei denen Du mitmachen kannst!</p>
  `;

  return { subject, html: baseLayout(content) };
}

interface TagesAnmeldung {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string | null;
  signalName?: string | null;
}

interface TagesAktion {
  titel: string;
  datum: Date;
  startzeit: string;
  anmeldungen: TagesAnmeldung[];
}

export function tagesUebersichtEmail(
  expertName: string,
  datum: Date,
  aktionen: TagesAktion[]
): { subject: string; html: string } {
  const datumStr = format(datum, "d. MMMM yyyy", { locale: de });
  const subject = `Neue Anmeldungen – Tagesübersicht ${datumStr}`;

  const aktionenHtml = aktionen
    .map((a) => {
      const anmeldungenList = a.anmeldungen
        .map((an) => {
          const kontakt = an.signalName
            ? `Signal: ${an.signalName}`
            : an.telefon || "";
          return `<li>${an.vorname} ${an.nachname} · ${an.email}${kontakt ? ` · ${kontakt}` : ""}</li>`;
        })
        .join("");

      const aktionDatum = format(a.datum, "d. MMMM", { locale: de });
      return `
        <h3>${a.titel} (${aktionDatum}, ${a.startzeit} Uhr)</h3>
        <ul>${anmeldungenList}</ul>
      `;
    })
    .join("");

  const content = `
    <h2>Hallo ${expertName}!</h2>
    <p>Hier ist die Übersicht der heutigen neuen Anmeldungen für deine Aktionen:</p>
    ${aktionenHtml}
    <p><a href="${baseUrl}/dashboard">Zum Dashboard →</a></p>
  `;

  return { subject, html: baseLayout(content) };
}

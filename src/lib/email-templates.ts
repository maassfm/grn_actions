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

function baseLayout(content: string, accentBar?: string): string {
  const accent = accentBar ?? "#005538";
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFFFFF; color: #000000; }
    .container { max-width: 600px; width: 100%; background: #FFFFFF; border: 3px solid #000000; }
    .header { background-color: #005538; padding: 24px 32px; border-bottom: 3px solid #000000; }
    .header h1 { color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.2; }
    .header .subtitle { color: #FFF17A; font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 4px 0; font-weight: 700; }
    .content { padding: 32px; }
    .content p { font-size: 16px; line-height: 1.6; margin: 0 0 12px 0; }
    .content h2 { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 20px 0; border-bottom: 3px solid #000000; padding-bottom: 8px; }
    .content h3 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 24px 0 8px 0; }
    .content ul { margin: 0 0 16px 0; padding-left: 20px; }
    .content li { font-size: 15px; line-height: 1.6; margin-bottom: 4px; }
    .content a { color: #005538; font-weight: 700; text-decoration: underline; }
    .aktion-card { background: #FFFFFF; border: 2px solid #000000; padding: 20px; margin-bottom: 16px; box-shadow: 4px 4px 0 #000000; }
    .aktion-card-title { font-size: 17px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 12px 0; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 8px; }
    .aktion-card p { margin: 5px 0; font-size: 15px; color: #000000; line-height: 1.5; }
    .aktion-card a { color: #005538; font-weight: 700; }
    .aktion-card .cancel-link { display: inline-block; margin-top: 12px; font-size: 15px; color: #e63946; text-decoration: underline; font-weight: 700; }
    .change-row { border: 2px solid #000000; padding: 12px 16px; margin-bottom: 8px; background: #FFFFFF; }
    .change-row strong { font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em; display: block; margin-bottom: 4px; }
    .change-old { background: #262626; color: #FFFFFF; padding: 2px 6px; font-size: 14px; font-weight: 700; border: 1px solid #000000;display: inline-block; }
    .change-arrow { font-size: 18px; font-weight: 700; margin: 0 6px; }
    .change-new { background: #FFF17A; color: #000000; padding: 2px 6px; font-size: 14px; font-weight: 700; border: 1px solid #000000; display: inline-block; }
    .cta-button { display: inline-block; background-color: #005538; color: #FFFFFF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 14px; padding: 12px 24px; text-decoration: none; border: 2px solid #000000; box-shadow: 3px 3px 0 #000000; margin-top: 8px; }
    .greeting { font-size: 24px; font-weight: 700; margin: 0 0 16px 0; }
    .section-divider { border: none; border-top: 3px solid #000000; margin: 24px 0; }
    .badge-geaendert { background: #FFF17A; color: #000000; border: 1px solid #000000; padding: 2px 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; display: inline-block; }
    .badge-absage { background: #E6007E; color: #FFFFFF; border: 1px solid #000000; padding: 2px 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; display: inline-block; }
    .count-badge { background: #005538; color: #FFFFFF; border: 1px solid #000000; padding: 2px 8px; font-size: 12px; font-weight: 700; display: inline-block; }
    .footer { background-color: #000000; padding: 20px 32px; font-size: 12px; color: #FFFFFF; }
    .footer p { margin: 4px 0; line-height: 1.5; }
    .footer a { color: #FFF17A; text-decoration: none; font-weight: 700; }
    .footer-links { margin-top: 8px; }
    .footer-separator { color: #555555; margin: 0 8px; }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr><td align="center" style="padding: 24px 16px; background-color: #ffffff;">
  <div class="container">
      <div class="header">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="64" valign="middle" style="padding-right: 16px;">
              <!--[if mso]>
              <img src="${baseUrl}/logo.png" alt="Sonnenblume" width="48" height="48" style="display:block;" />
              <![endif]-->
              <!--[if !mso]><!-->
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 516" width="48" height="48" style="display:block;" role="img" aria-label="Sonnenblume">
                <defs>
                  <rect id="SVGID_1_" x="0.1" y="0.7" width="511.6" height="515.2"/>
                </defs>
                <clipPath id="SVGID_clip_path">
                  <use xlink:href="#SVGID_1_" style="overflow:visible;"/>
                </clipPath>
                <path style="clip-path:url(#SVGID_clip_path); fill:#FFF17A;" d="M365.7,225.1c-7,1.1-24.9,1.6-8.4,15.7c0,0,3,0.2-5.1,5c-8.1,4.8,18.1,7.7,21.2,11.1c3.1,3.5-26.1-0.3-25.5,8.5c0.6,8.8-5,3.2,14.4,23.9c0,0-11.6-2.7-13-1.1c-1.4,1.7,25.5,23.9,25.3,30.2c0,0-5.5,3.8-7.8,0.5c-2.3-3.3-18.5-21.3-21.2-21.8c-2-0.4-5.8,0.5-7.5,4c0,0,7.1,16.5,4.9,17c-2.2,0.5-13.3-7.4-13.3-7.4s-7.3,3.2-4.9,9.8c2.4,6.6,22.1,29,21,30.4c0,0-1.7,3.7-4.2,3.4c-2.5-0.3-16.2-25-19.6-26c-3.4-1,3.9,23.1,3.9,23.1s-12.3-13-15.6-15.7c-3.3-2.7-3.8,2.9-3.8,2.9l3.6,27.5c0,0-38.5-57.3-29,11c0,0-0.9,3.9-2.2,3.8c-1.3-0.1-9.5-22.6-8.5-28.8c1-6.2-6.7,17-6.7,17s-12.1-47.9-37,1.2c0,0-1.7-18.5-5.6-21.7c-3.8-3.2-7-4.9-8-4.3c-0.9,0.6-9.8,9-13.2,9.8c-3.4,0.8,2.8-11.1-2.4-14.5c0,0,0.5-3.3-2.5-8.1c-3-4.8-5.9-3-23.1,15.5c0,0,7.2-17.6,7.1-23.7c-0.1-6.1-6.8-7.5-6.8-7.5s-12.5,9.5-16.1,8.4c-3.6-1.2,6-12.8,6.2-16.1c0.1-1-1.4-0.6-1.4-0.6s-1.5-1.1-14.1,6.3l-20.4,13c-1.5-0.9-3.5-0.7-2.9-5.6c0.2-1.4,38.1-19.2,36.4-21.1c-1.7-1.9-14.4-5-14.4-5s7.9-9.6,5.6-10.6c-2.4-1-19.7-2.5-19.7-2.5s-3-4.8-2.4-3.8c0.6,1,16.9-2.6,16.9-2.6l-10.9-8.6c0,0,27.6-4.9,3.2-19.5c-9-5.4-18.4-9.1-28.6-11c26,1.3,43.2-5.3,40.3-14.8c0,0-0.8-3.4-26.7-12.9c0,0,0.7-3.1,2.4-3.5c1.7-0.4,28.7,9.4,26.8,7.9c-1.9-1.6-11.8-12.6-10-12.4c1.8,0.1,14.4,5.4,18.6,1.5c4-3.8,6.5-10.7,9.2-12.2c2.6-1.5-7-10.5,5.7-6.3c0,0,8.6-4.9,1.8-12.8c-6.8-8-28.4-33.5,6.8-2.7c8.4,7.4,29.5-15.1,27.8-27.4c0,0,8.4,8.5,10.2,9.4c1.8,0.9,13.6,2.3,16.3-1.8c1.2-1.9-4.3-19.3-0.8-27c0,0,1.5-0.1,2.9,1.5c1.4,1.6,1.6,19.8,8,23.3c0,0,7.2-4.2,8.4-7.4c1.2-3.1-1.9,19.6,19.6,9.8c0,0,10.5-9.3,13.5-9.6c3-0.3-2.2,11.1,0.4,15.1c2.7,4.1,11.5,6.8,14.3,1.7c2.8-5.1,16.3-15.2,17.3-14.8c1,0.4-6.9,21.5-7.8,23.5c-1.3,3-2.2,7.5-2.2,7.5s1,5.9,8.4,7.5c0,0,13.9-8.1,28.3-18.6c-1.5,1.8-3,3.7-4.6,5.7c0,0-18.7,19.2-18.7,22c0,2.8,6.4,9,11.6,5.5c5.2-3.5,17.9-8.7,19-7.8c1.1,0.9,3.1,3.5,0.5,5c-2.6,1.5-17.3,9.2-17.3,9.2s16.8,1.1,37.3-3c-22.2,9-29.9,22.8-29.8,24.1c0.7,4.4,35.2-4.6,36.2-2.4C388.5,230.9,372.6,223.9,365.7,225.1 M511.6,226c-0.2-1.3-3.6-2.5-5.8-4.4c-7.6-6.4-34.9-33.2-88.6-31.5c-6.8,0.2-13,0.9-18.6,1.8c11.4-3.7,17.4-5.9,20.8-7.3c4.2-1.7,31.5-11,46.3-59.2c1.3-4.1,4.8-14,3.9-14.8c-1.1-0.9-10.3,0.7-19.6,6.4c-9.3,5.7-40.7,10.6-44.4,11.2c-2.2,0.4-11.4-1-25.2,6.2c15.5-15.9,32-38.6,36.4-70.3c2.1-15.2,1.2-21.5,0.6-21.4c-0.9,0.1-1.4,0.1-2.6,0.4c-3.5,1-7,3.9-18.4,11.6c-11.4,7.6-23.5,16.1-23.5,16.1s4.1-41.5,2.9-42.5c-1.3-0.9-24.8-0.7-61,39.6c0,0,4.1-34.5-2.7-47.5c0,0-1.9-9.4-3.4-14.3c-0.7-2.5-2.7-5.1-3-4.8c-0.4,0.3-3.6,0.8-8.7,6.7c-8,9.1-45.1,20.3-51.2,68.3C241.2,56.9,231.3,31,207,17.9C193.2,4.4,187.1,0.4,186.4,0.8c-0.6,0.3-0.4,6.3-2.4,19.8c-2.4,15.1-4.4,19.9-4.4,19.9S154,18,153.4,17.3c-1.2-1.2-16.8,48.1-12.2,72.7c0,0-8.1-6.3-22.8-13.8c-16.7-8.6-44.7-10.1-44.5-8.7c0.3,2.2,23.7,47.8,33.5,63.8c0,0-62.9-10.8-61.8-6.9c0.4,1.3,1.9,3.8,4.3,14.3c0,0-24.7-0.5-24.4,1.5c0.4,2.3,18.7,32.6,20.1,34.3c0,0-19.1,3.7-23.1,3.9c-2.7,0.1,12.8,42.9,55.2,53.6c6.4,1.6,12.6,2.8,18.5,3.6c-13.9-0.3-29.3,2.6-47,9.2c0,0-10.2,4-15.6,8.3c-5.4,4.3-32.4,8.8-33.7,12.8c0.6,2.9,32.9,25,32.9,25s-18.9,9.2-20.2,11c-0.9,1.2-1.6,2.3-1.4,2.6c0.2,0.3,1.5,1.8,4.8,3.9c7.6,4.7,74.9,11.7,79,10.1c4.1-1.6-36.6,44.1-37.2,67.1c0,0,6.7,0.5,10.4,0.8c2.9,0.2-12.3,28.8-9.5,28.7c18.3-0.8,48.6-18.5,54.3-22.5c5.7-4.1,13.5-10.1,15.5-12.1c2.1-2-13.3,25.5-7,49.7c0,0,2,18.8,2.1,22.5c0.1,3.8,5.4,3.8,5.4,6.3c-0.1,3.1,14.8-11.8,21.9-17.5c7.1-5.7,16.6-16.7,21.3-24c4.6-7.2,0.5,56.8-1.4,69.1c-0.6,4,0.3,4.4,0.9,5.7c0.2,0.4,6.8-5,8.9-6.4c3.1-2.1,35.2-45.2,37.2-56c0,0,17.1,75.2,22.9,83.3c1.3,1.7,2.3,3.7,3.2,2.3c1.7-2.7,4.3-9.7,6.2-10.3c2.5-0.7,9.7-1.6,13.5-12.4c3.8-10.7,10.6-21.2,13.9-49c0,0,36.4,46.4,41.1,50.7c1.9,1.7,11.8-14.7,16.1-41.2c4.4-26.4-5-62-11-63.2c0,0-2.5-3.9,4.4-1.4c3.9,1.4,19.1,27.7,54,47.7c5.9,3.4,18.4,3.4,18.5,3.2c2.8-7.9-24.6-79.6-24.6-79.6s0.7-0.8,6.2,1.4c5.5,2.3,57.9,36.1,89.6,20.2c6.4-3.2,6.8-3.9,6.8-3.9c3.6-15.6-24.3-45.2-41.5-58.6c0,0,45.1-1.8,52-13.8c0,0,8.3-3,12.6-8.9c0.8-1-4.9-11.3-11.4-15.9c-17-11.8-20.7-16.3-20.7-16.3s4.8-5.8,11.6-7.9s29.1-15.9,23.2-22.6C504.7,233.9,511.9,227.6,511.6,226"/>
              </svg>
              <!--<![endif]-->
            </td>
            <td valign="middle">
              <p class="subtitle" style="color: #FFF17A; font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 4px 0; font-weight: 700;">Kreisvorstand</p>
              <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.2;">B90/GRÜNE<br>Berlin-Mitte</h1>
            </td>
          </tr>
        </table>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte</p>
        <p>Diese E-Mail wurde automatisch versendet. Bitte antworte nicht auf diese E-Mail.</p>
        <div class="footer-links">
          <a href="${baseUrl}/datenschutz">Datenschutzerklärung</a><span class="footer-separator">·</span><a href="https://gruene-mitte.de/impressum">Impressum</a>
        </div>
      </div>
    </div>
  </td></tr>
  </table>
</body>
</html>`;
}

function formatAktionCard(aktion: AktionInfo, cancelLink?: string): string {
  const datumStr = format(aktion.datum, "EEEE, d. MMMM yyyy", { locale: de });
  return `<div class="aktion-card">
    <div class="aktion-card-title">${aktion.titel}</div>
    <p>📅 ${datumStr}</p>
    <p>🕐 ${aktion.startzeit} – ${aktion.endzeit} Uhr</p>
    <p>📍 ${aktion.adresse}</p>
    <p>👋 Ansprechpartner*in vor Ort: ${aktion.ansprechpersonName} · <a href="mailto:${aktion.ansprechpersonEmail}">${aktion.ansprechpersonEmail}</a> · ${aktion.ansprechpersonTelefon}</p>
    ${cancelLink ? `<p><a href="${cancelLink}" class="cancel-link">❌ Von dieser Aktion abmelden →</a></p>` : ""}
  </div>`;
}

export function anmeldebestaetigungEmail(
  vorname: string,
  aktionen: AktionInfo[],
  cancelTokens?: string[]
): { subject: string; html: string } {
  const subject = `Deine Anmeldung bei B90/GRÜNE Berlin-Mitte – ${aktionen.length} Aktion${aktionen.length > 1 ? "en" : ""}`;

  const content = `
    <p class="greeting">Hallo ${vorname},</p>
    <p>vielen Dank für Deine Anmeldung und Deine Unterstützung im Wahlkampf.</p>
    <p>Wenn sich Deine Pläne ändern, kannst Dich jederzeit über den Link in der jeweiligen Aktion von der Teilnahme abmelden.</p>
    <p>Wir freuen uns auf Dich! 💚</p>
    <p>Viele Grüße<br>
    <strong>Annalena, Florian, Lara, Linus, Madlen und Timur</strong><br>
    Kreisvorstand BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte</p> 
    <hr class="section-divider" />
    <p>Du hast Dich für ${aktionen.length > 1 ? "folgende Aktionen" : "folgende Aktion"} angemeldet:</p>
    ${aktionen.map((a, i) => {
      const cancelLink = cancelTokens?.[i]
        ? `${baseUrl}/api/anmeldungen/abmelden?token=${cancelTokens[i]}`
        : undefined;
      return formatAktionCard(a, cancelLink);
    }).join("")}
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
        `<div class="change-row">
          <strong>${c.field}</strong>
          <span class="change-old">${c.oldValue}</span>
          <span class="change-arrow">→</span>
          <span class="change-new">${c.newValue}</span>
        </div>`
    )
    .join("");

  const content = `
    <span class="badge-geaendert">Geändert</span>
    <h2 style="margin-top: 12px;">Änderung an deiner Aktion</h2>
    <p>Eine Aktion, für die Du Dich angemeldet hast, wurde geändert:</p>
    ${changesList}
    <hr class="section-divider" />
    <h3>Aktualisierte Details</h3>
    ${formatAktionCard(aktion)}
    <p>Bei Fragen wende Dich bitte an die Ansprechperson der Aktion.</p>
  `;

  return { subject, html: baseLayout(content, "#FFF17A") };
}

export function absageEmail(aktion: AktionInfo): { subject: string; html: string } {
  const datumStr = format(aktion.datum, "d. MMMM yyyy", { locale: de });
  const subject = `Absage: ${aktion.titel} am ${datumStr}`;

  const content = `
    <span class="badge-absage">Abgesagt</span>
    <h2 style="margin-top: 12px;">Aktion abgesagt</h2>
    <p>Leider wurde die folgende Aktion abgesagt:</p>
    ${formatAktionCard(aktion)}
    <hr class="section-divider" />
    <p>Wir bedauern die Unannehmlichkeiten. Schau gerne auf <a href="${baseUrl}">unserer Seite</a> nach weiteren Aktionen, bei denen Du mitmachen kannst!</p>
  `;

  return { subject, html: baseLayout(content, "#E6007E") };
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

interface MorgenAktion {
  titel: string;
  datum: Date;
  startzeit: string;
  endzeit: string;
  adresse: string;
  anmeldungen: TagesAnmeldung[];
}

interface TagesAbmeldung {
  vorname: string;
  nachname: string;
  aktionTitel: string;
  aktionDatum: Date;
}

export function tagesUebersichtEmail(
  expertName: string,
  datum: Date,
  aktionen: TagesAktion[],
  aktionenMorgen: MorgenAktion[] = [],
  abmeldungen: TagesAbmeldung[] = []
): { subject: string; html: string } {
  const datumStr = format(datum, "d. MMMM yyyy", { locale: de });
  const subject = `Neue Anmeldungen – Tagesübersicht ${datumStr}`;

  const morgenHtml = aktionenMorgen.length > 0
    ? `
      <h2>Morgen findet statt</h2>
      ${aktionenMorgen.map((a) => {
        const aktionDatum = format(a.datum, "EEEE, d. MMMM", { locale: de });
        const anmeldungenList = a.anmeldungen.length > 0
          ? `<ul>${a.anmeldungen.map((an) => {
              const kontakt = an.signalName
                ? `Signal: ${an.signalName}`
                : an.telefon || "";
              return `<li>${an.vorname} ${an.nachname} · ${an.email}${kontakt ? ` · ${kontakt}` : ""}</li>`;
            }).join("")}</ul>`
          : `<p><em>Noch keine Anmeldungen.</em></p>`;
        return `
          <div class="aktion-card">
            <div class="aktion-card-title">${a.titel}</div>
            <p>📅 ${aktionDatum}, ${a.startzeit}–${a.endzeit} Uhr</p>
            <p>📍 ${a.adresse}</p>
            <p><span class="count-badge">${a.anmeldungen.length} Anmeldung${a.anmeldungen.length !== 1 ? "en" : ""}</span></p>
            ${anmeldungenList}
          </div>
        `;
      }).join("")}
    `
    : "";

  const neueAnmeldungenHtml = aktionen.length > 0
    ? `
      <h2>Neue Anmeldungen heute</h2>
      ${aktionen.map((a) => {
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
          <div class="aktion-card">
            <div class="aktion-card-title">${a.titel}</div>
            <p>📅 ${aktionDatum}, ${a.startzeit} Uhr</p>
            <p><span class="count-badge">${a.anmeldungen.length} neu</span></p>
            <ul>${anmeldungenList}</ul>
          </div>
        `;
      }).join("")}
    `
    : "";

  const abmeldungenHtml = abmeldungen.length > 0
    ? `
      <h2>Abmeldungen heute</h2>
      <ul>
        ${abmeldungen.map((a) => {
          const aktionDatum = format(a.aktionDatum, "d. MMMM", { locale: de });
          return `<li>${a.vorname} ${a.nachname} — ${a.aktionTitel} (${aktionDatum})</li>`;
        }).join("")}
      </ul>
    `
    : "";

  const content = `
    <p class="greeting">Hallo ${expertName}!</p>
    <p>Tagesübersicht für <strong>${datumStr}</strong>.</p>
    ${morgenHtml}
    ${morgenHtml && (neueAnmeldungenHtml || abmeldungenHtml) ? '<hr class="section-divider" />' : ""}
    ${neueAnmeldungenHtml}
    ${neueAnmeldungenHtml && abmeldungenHtml ? '<hr class="section-divider" />' : ""}
    ${abmeldungenHtml}
    <hr class="section-divider" />
    <p><a href="${baseUrl}/dashboard" class="cta-button">Zum Dashboard →</a></p>
  `;

  return { subject, html: baseLayout(content) };
}

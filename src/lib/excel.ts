import * as XLSX from "xlsx";

interface ExcelRow {
  titel: string;
  datum: string;
  startzeit: string;
  endzeit: string;
  adresse: string;
  wahlkreis: number;
  ansprechpersonName: string;
  ansprechpersonEmail: string;
  ansprechpersonTelefon: string;
  maxTeilnehmer?: number | null;
}

const COLUMN_MAP: Record<string, keyof ExcelRow> = {
  "Titel": "titel",
  "Datum": "datum",
  "Startzeit": "startzeit",
  "Endzeit": "endzeit",
  "Adresse": "adresse",
  "Wahlkreis": "wahlkreis",
  "Ansprechperson Name": "ansprechpersonName",
  "Ansprechperson E-Mail": "ansprechpersonEmail",
  "Ansprechperson Telefon": "ansprechpersonTelefon",
  "Max. Teilnehmer": "maxTeilnehmer",
};

function parseDatum(raw: string | number): string {
  if (typeof raw === "number") {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(raw);
    return `${String(date.d).padStart(2, "0")}.${String(date.m).padStart(2, "0")}.${date.y}`;
  }
  return String(raw).trim();
}

function parseZeit(raw: string | number): string {
  if (typeof raw === "number") {
    // Excel time fraction
    const totalMinutes = Math.round(raw * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return String(raw).trim();
}

export function convertDatumToISO(datum: string): string {
  // TT.MM.JJJJ → YYYY-MM-DD
  const match = datum.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return datum; // already ISO or unknown format
}

export function parseExcelFile(buffer: ArrayBuffer): ExcelRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: true,
    defval: "",
  });

  return rawRows.map((raw) => {
    const row: Partial<ExcelRow> = {};

    for (const [header, value] of Object.entries(raw)) {
      const key = COLUMN_MAP[header.trim()];
      if (!key) continue;

      if (key === "datum") {
        row.datum = parseDatum(value as string | number);
      } else if (key === "startzeit" || key === "endzeit") {
        row[key] = parseZeit(value as string | number);
      } else if (key === "wahlkreis") {
        row.wahlkreis = parseInt(String(value), 10);
      } else if (key === "maxTeilnehmer") {
        const num = parseInt(String(value), 10);
        row.maxTeilnehmer = isNaN(num) ? null : num;
      } else {
        (row as Record<string, unknown>)[key] = String(value).trim();
      }
    }

    return row as ExcelRow;
  });
}

interface AnmeldungExport {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string | null;
  signalName?: string | null;
  aktionTitel: string;
  aktionDatum: string;
  aktionOrt: string;
}

export function createAnmeldungenExcel(anmeldungen: AnmeldungExport[]): Buffer {
  const wsData = [
    ["Vorname", "Nachname", "E-Mail", "Telefon", "Signal", "Aktion", "Datum", "Ort"],
    ...anmeldungen.map((a) => [
      a.vorname,
      a.nachname,
      a.email,
      a.telefon || "",
      a.signalName || "",
      a.aktionTitel,
      a.aktionDatum,
      a.aktionOrt,
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 },
    { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Anmeldungen");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export function createAnmeldungenTxt(
  anmeldungen: AnmeldungExport[]
): string {
  return anmeldungen
    .map((a) => {
      const kontakt = a.signalName
        ? `Signal: ${a.signalName}`
        : a.telefon
        ? `Tel: ${a.telefon}`
        : "";
      return `${a.vorname} ${a.nachname}${kontakt ? ` – ${kontakt}` : ""}`;
    })
    .join("\n");
}

export function createVorlageExcel(): Buffer {
  const wsData = [
    [
      "Titel",
      "Datum",
      "Startzeit",
      "Endzeit",
      "Adresse",
      "Wahlkreis",
      "Ansprechperson Name",
      "Ansprechperson E-Mail",
      "Ansprechperson Telefon",
      "Max. Teilnehmer",
    ],
    [
      "Infostand Alexanderplatz",
      "15.04.2026",
      "10:00",
      "13:00",
      "Alexanderplatz 1, 10178 Berlin",
      1,
      "Max Mustermann",
      "max@example.com",
      "030 1234567",
      "",
    ],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = [
    { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 40 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
    { wch: 20 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Aktionen");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

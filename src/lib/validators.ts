import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte gib dein Passwort ein"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  role: z.enum(["ADMIN", "EXPERT"]),
  teamIds: z.array(z.string()).optional().default([]),
});

export const teamSchema = z.object({
  name: z.string().min(2, "Teamname muss mindestens 2 Zeichen lang sein"),
  wahlkreisId: z.string().optional().nullable(),
});

export const aktionSchema = z.object({
  titel: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein"),
  beschreibung: z.string().optional().nullable(),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum im Format JJJJ-MM-TT"),
  startzeit: z.string().regex(/^\d{2}:\d{2}$/, "Startzeit im Format HH:MM"),
  endzeit: z.string().regex(/^\d{2}:\d{2}$/, "Endzeit im Format HH:MM"),
  adresse: z.string().min(5, "Adresse muss mindestens 5 Zeichen lang sein"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  wahlkreisId: z.string().min(1, "Bitte wähle einen Wahlkreis"),
  ansprechpersonName: z.string().min(2, "Name der Ansprechperson erforderlich"),
  ansprechpersonEmail: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  ansprechpersonTelefon: z.string().min(5, "Telefonnummer erforderlich"),
  maxTeilnehmer: z.number().int().positive().optional().nullable(),
});

export const anmeldungSchema = z.object({
  aktionIds: z.array(z.string()).min(1, "Bitte wähle mindestens eine Aktion"),
  vorname: z.string().min(2, "Vorname muss mindestens 2 Zeichen lang sein"),
  nachname: z.string().min(2, "Nachname muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  telefon: z.string().optional().nullable(),
  signalName: z.string().optional().nullable(),
  datenschutz: z.literal(true, {
    error: "Du musst der Datenschutzerklärung zustimmen",
  }),
  honeypot: z.string().max(0).optional(),
}).refine(
  (data) => (data.telefon && data.telefon.length > 0) || (data.signalName && data.signalName.length > 0),
  { message: "Bitte gib eine Telefonnummer oder einen Signal-Namen an", path: ["telefon"] }
);

export const excelRowSchema = z.object({
  titel: z.string().min(1, "Titel fehlt"),
  datum: z.string().min(1, "Datum fehlt"),
  startzeit: z.string().regex(/^\d{2}:\d{2}$/, "Startzeit im Format HH:MM"),
  endzeit: z.string().regex(/^\d{2}:\d{2}$/, "Endzeit im Format HH:MM"),
  adresse: z.string().min(1, "Adresse fehlt"),
  wahlkreis: z.number().int().min(1).max(7, "Wahlkreis muss zwischen 1 und 7 liegen"),
  ansprechpersonName: z.string().min(1, "Ansprechperson Name fehlt"),
  ansprechpersonEmail: z.string().email("Ungültige E-Mail der Ansprechperson"),
  ansprechpersonTelefon: z.string().min(1, "Telefon der Ansprechperson fehlt"),
  maxTeilnehmer: z.number().int().positive().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type AktionInput = z.infer<typeof aktionSchema>;
export type AnmeldungInput = z.infer<typeof anmeldungSchema>;
export type ExcelRowInput = z.infer<typeof excelRowSchema>;

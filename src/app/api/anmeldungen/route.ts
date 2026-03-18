import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { anmeldungSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import { anmeldebestaetigungEmail } from "@/lib/email-templates";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Honeypot check
    if (body.honeypot && body.honeypot.length > 0) {
      // Silently accept but don't process (bot trap)
      return NextResponse.json({ message: "Anmeldung erfolgreich" });
    }

    const validated = anmeldungSchema.parse(body);

    // Create registrations for each action
    const results = [];
    const successfulAktionen = [];

    for (const aktionId of validated.aktionIds) {
      // Check if action exists and is active
      const aktion = await prisma.aktion.findUnique({
        where: { id: aktionId },
        include: { _count: { select: { anmeldungen: true } } },
      });

      if (!aktion || aktion.status === "ABGESAGT") {
        results.push({ aktionId, error: "Aktion nicht verfügbar" });
        continue;
      }

      // Check max participants
      if (aktion.maxTeilnehmer && aktion._count.anmeldungen >= aktion.maxTeilnehmer) {
        results.push({ aktionId, error: "Aktion ist bereits voll" });
        continue;
      }

      try {
        await prisma.anmeldung.create({
          data: {
            aktionId,
            vorname: validated.vorname,
            nachname: validated.nachname,
            email: validated.email,
            telefon: validated.telefon || null,
            signalName: validated.signalName || null,
          },
        });
        successfulAktionen.push(aktion);
        results.push({ aktionId, success: true });
      } catch (err) {
        // Unique constraint violation
        if (err instanceof Error && err.message.includes("Unique")) {
          results.push({ aktionId, error: "Bereits angemeldet" });
        } else {
          results.push({ aktionId, error: "Fehler bei der Anmeldung" });
        }
      }
    }

    // Send confirmation email for successful registrations
    if (successfulAktionen.length > 0) {
      const emailData = anmeldebestaetigungEmail(
        validated.vorname,
        successfulAktionen.map((a) => ({
          titel: a.titel,
          datum: a.datum,
          startzeit: a.startzeit,
          endzeit: a.endzeit,
          adresse: a.adresse,
          ansprechpersonName: a.ansprechpersonName,
          ansprechpersonEmail: a.ansprechpersonEmail,
          ansprechpersonTelefon: a.ansprechpersonTelefon,
        }))
      );

      await sendEmail({
        to: validated.email,
        subject: emailData.subject,
        html: emailData.html,
        typ: "BESTAETIGUNG",
      });
    }

    return NextResponse.json({
      message: `Erfolgreich für ${successfulAktionen.length} Aktion(en) angemeldet`,
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validierungsfehler", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

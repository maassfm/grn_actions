import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { tagesUebersichtEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  // Find all registrations from today
  const todaysAnmeldungen = await prisma.anmeldung.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      aktion: true,
    },
  });

  // Find all active actions happening tomorrow
  const aktionenMorgen = await prisma.aktion.findMany({
    where: {
      datum: { gte: tomorrow, lt: dayAfterTomorrow },
      status: { in: ["AKTIV", "GEAENDERT"] },
    },
    include: { anmeldungen: true },
  });

  if (todaysAnmeldungen.length === 0 && aktionenMorgen.length === 0) {
    return NextResponse.json({ message: "Keine neuen Anmeldungen und keine Aktionen morgen" });
  }

  // Group by ansprechpersonEmail
  const byAnsprechperson = new Map<
    string,
    {
      name: string;
      aktionen: Map<string, { titel: string; datum: Date; startzeit: string; anmeldungen: typeof todaysAnmeldungen }>;
      aktionenMorgen: { titel: string; datum: Date; startzeit: string; endzeit: string; adresse: string; anmeldungen: { vorname: string; nachname: string; email: string; telefon: string | null; signalName: string | null }[] }[];
    }
  >();

  for (const anmeldung of todaysAnmeldungen) {
    const { ansprechpersonEmail: email, ansprechpersonName: name } = anmeldung.aktion;

    if (!byAnsprechperson.has(email)) {
      byAnsprechperson.set(email, { name, aktionen: new Map(), aktionenMorgen: [] });
    }

    const entry = byAnsprechperson.get(email)!;
    if (!entry.aktionen.has(anmeldung.aktionId)) {
      entry.aktionen.set(anmeldung.aktionId, {
        titel: anmeldung.aktion.titel,
        datum: anmeldung.aktion.datum,
        startzeit: anmeldung.aktion.startzeit,
        anmeldungen: [],
      });
    }

    entry.aktionen.get(anmeldung.aktionId)!.anmeldungen.push(anmeldung);
  }

  // Add tomorrow's actions to the map
  for (const aktion of aktionenMorgen) {
    const { ansprechpersonEmail: email, ansprechpersonName: name } = aktion;

    if (!byAnsprechperson.has(email)) {
      byAnsprechperson.set(email, { name, aktionen: new Map(), aktionenMorgen: [] });
    }

    byAnsprechperson.get(email)!.aktionenMorgen.push({
      titel: aktion.titel,
      datum: aktion.datum,
      startzeit: aktion.startzeit,
      endzeit: aktion.endzeit,
      adresse: aktion.adresse,
      anmeldungen: aktion.anmeldungen.map((an: { vorname: string; nachname: string; email: string; telefon: string | null; signalName: string | null }) => ({
        vorname: an.vorname,
        nachname: an.nachname,
        email: an.email,
        telefon: an.telefon,
        signalName: an.signalName,
      })),
    });
  }

  // Send one email per Ansprechperson
  let emailsSent = 0;

  for (const [email, { name, aktionen, aktionenMorgen: morgenList }] of byAnsprechperson) {
    const aktionenList = Array.from(aktionen.values()).map((a) => ({
      titel: a.titel,
      datum: a.datum,
      startzeit: a.startzeit,
      anmeldungen: a.anmeldungen.map((an: { vorname: string; nachname: string; email: string; telefon: string | null; signalName: string | null }) => ({
        vorname: an.vorname,
        nachname: an.nachname,
        email: an.email,
        telefon: an.telefon,
        signalName: an.signalName,
      })),
    }));

    const emailData = tagesUebersichtEmail(name, today, aktionenList, morgenList);
    await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      typ: "TAEGLICHE_UEBERSICHT",
    });
    emailsSent++;
  }

  return NextResponse.json({
    message: `${emailsSent} E-Mail(s) gesendet`,
    anmeldungen: todaysAnmeldungen.length,
    aktionenMorgen: aktionenMorgen.length,
  });
}

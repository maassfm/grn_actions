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

  // Find all registrations from today
  const todaysAnmeldungen = await prisma.anmeldung.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      aktion: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  });

  if (todaysAnmeldungen.length === 0) {
    return NextResponse.json({ message: "Keine neuen Anmeldungen heute" });
  }

  // Group by team/expert
  const byTeam = new Map<
    string,
    {
      team: { id: string; name: string; users: { id: string; name: string; email: string }[] };
      aktionen: Map<string, { titel: string; datum: Date; startzeit: string; anmeldungen: typeof todaysAnmeldungen }>;
    }
  >();

  for (const anmeldung of todaysAnmeldungen) {
    const team = anmeldung.aktion.team;
    if (!byTeam.has(team.id)) {
      byTeam.set(team.id, {
        team: {
          id: team.id,
          name: team.name,
          users: team.users.filter((u) => u.active),
        },
        aktionen: new Map(),
      });
    }

    const teamData = byTeam.get(team.id)!;
    if (!teamData.aktionen.has(anmeldung.aktionId)) {
      teamData.aktionen.set(anmeldung.aktionId, {
        titel: anmeldung.aktion.titel,
        datum: anmeldung.aktion.datum,
        startzeit: anmeldung.aktion.startzeit,
        anmeldungen: [],
      });
    }

    teamData.aktionen.get(anmeldung.aktionId)!.anmeldungen.push(anmeldung);
  }

  // Send emails to experts
  let emailsSent = 0;

  for (const { team, aktionen } of byTeam.values()) {
    const aktionenList = Array.from(aktionen.values()).map((a) => ({
      titel: a.titel,
      datum: a.datum,
      startzeit: a.startzeit,
      anmeldungen: a.anmeldungen.map((an) => ({
        vorname: an.vorname,
        nachname: an.nachname,
        email: an.email,
        telefon: an.telefon,
        signalName: an.signalName,
      })),
    }));

    for (const user of team.users) {
      const emailData = tagesUebersichtEmail(user.name, today, aktionenList);
      await sendEmail({
        to: user.email,
        subject: emailData.subject,
        html: emailData.html,
        typ: "TAEGLICHE_UEBERSICHT",
      });
      emailsSent++;
    }
  }

  return NextResponse.json({
    message: `${emailsSent} E-Mail(s) gesendet`,
    anmeldungen: todaysAnmeldungen.length,
  });
}

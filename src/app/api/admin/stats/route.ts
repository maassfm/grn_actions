import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const [totalAktionen, activeAktionen, totalAnmeldungen, teamCount, userCount, wahlkreise] =
    await Promise.all([
      prisma.aktion.count(),
      prisma.aktion.count({ where: { status: { in: ["AKTIV", "GEAENDERT"] } } }),
      prisma.anmeldung.count(),
      prisma.team.count(),
      prisma.user.count(),
      prisma.wahlkreis.findMany({
        include: {
          aktionen: {
            include: { _count: { select: { anmeldungen: true } } },
          },
        },
        orderBy: { nummer: "asc" },
      }),
    ]);

  const anmeldungenByWahlkreis = wahlkreise.map((wk) => ({
    wahlkreis: wk.name,
    nummer: wk.nummer,
    count: wk.aktionen.reduce((sum, a) => sum + a._count.anmeldungen, 0),
  }));

  return NextResponse.json({
    totalAktionen,
    activeAktionen,
    totalAnmeldungen,
    teamCount,
    userCount,
    anmeldungenByWahlkreis,
  });
}

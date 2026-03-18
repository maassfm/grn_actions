import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { aktionSchema } from "@/lib/validators";
import { geocodeAddress } from "@/lib/geocoding";

// GET: Public listing (active actions) or authenticated (team-filtered)
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);

  const wahlkreis = searchParams.get("wahlkreis");
  const datum = searchParams.get("datum");
  const datumBis = searchParams.get("datumBis");
  const tageszeit = searchParams.get("tageszeit");
  const teamId = searchParams.get("teamId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Public: only active/changed, future actions
  if (!session) {
    where.status = { in: ["AKTIV", "GEAENDERT"] };
    where.datum = { gte: new Date(new Date().toISOString().split("T")[0]) };
  } else if (session.user.role === "EXPERT" && session.user.teamId) {
    where.teamId = session.user.teamId;
  }

  // Filters
  if (teamId && session?.user.role === "ADMIN") {
    where.teamId = teamId;
  }

  if (wahlkreis) {
    const wahlkreisNummern = wahlkreis.split(",").map(Number);
    where.wahlkreis = { nummer: { in: wahlkreisNummern } };
  }

  if (datum) {
    where.datum = { ...(where.datum || {}), gte: new Date(datum) };
    if (datumBis) {
      where.datum.lte = new Date(datumBis);
    }
  }

  const aktionen = await prisma.aktion.findMany({
    where,
    include: {
      wahlkreis: true,
      _count: { select: { anmeldungen: true } },
      team: true,
    },
    orderBy: { datum: "asc" },
  });

  // Filter by tageszeit client-side (based on startzeit)
  let filtered = aktionen;
  if (tageszeit) {
    filtered = aktionen.filter((a) => {
      const hour = parseInt(a.startzeit.split(":")[0], 10);
      if (tageszeit === "vormittags") return hour < 12;
      if (tageszeit === "tagsueber") return hour >= 12 && hour < 16;
      if (tageszeit === "abends") return hour >= 16;
      return true;
    });
  }

  return NextResponse.json(filtered);
}

// POST: Create new action (authenticated)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aktionSchema.parse(body);

    // Geocode address if no coordinates provided
    let latitude = validated.latitude;
    let longitude = validated.longitude;
    if (!latitude || !longitude) {
      const geo = await geocodeAddress(validated.adresse);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const teamId =
      session.user.role === "ADMIN" && body.teamId
        ? body.teamId
        : session.user.teamId;

    if (!teamId) {
      return NextResponse.json(
        { error: "Kein Team zugeordnet" },
        { status: 400 }
      );
    }

    const aktion = await prisma.aktion.create({
      data: {
        titel: validated.titel,
        beschreibung: validated.beschreibung || null,
        datum: new Date(validated.datum),
        startzeit: validated.startzeit,
        endzeit: validated.endzeit,
        adresse: validated.adresse,
        latitude,
        longitude,
        wahlkreisId: validated.wahlkreisId,
        ansprechpersonName: validated.ansprechpersonName,
        ansprechpersonEmail: validated.ansprechpersonEmail,
        ansprechpersonTelefon: validated.ansprechpersonTelefon,
        maxTeilnehmer: validated.maxTeilnehmer || null,
        createdById: session.user.id,
        teamId,
      },
      include: { wahlkreis: true },
    });

    return NextResponse.json(aktion, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validierungsfehler", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

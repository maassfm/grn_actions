import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;

  const aktion = await prisma.aktion.findUnique({
    where: { id },
    select: { teamId: true },
  });

  if (!aktion) {
    return NextResponse.json({ error: "Aktion nicht gefunden" }, { status: 404 });
  }

  if (session.user.role === "EXPERT" && aktion.teamId !== session.user.teamId) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const anmeldungen = await prisma.anmeldung.findMany({
    where: { aktionId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(anmeldungen);
}

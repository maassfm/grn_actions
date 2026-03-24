import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/abmeldung?fehler=1", origin));
  }

  try {
    const anmeldung = await prisma.anmeldung.findUnique({
      where: { cancelToken: token },
    });

    if (!anmeldung) {
      return NextResponse.redirect(new URL("/abmeldung?fehler=1", origin));
    }

    await prisma.anmeldung.delete({ where: { cancelToken: token } });

    return NextResponse.redirect(new URL("/abmeldung", origin));
  } catch {
    return NextResponse.redirect(new URL("/abmeldung?fehler=1", origin));
  }
}

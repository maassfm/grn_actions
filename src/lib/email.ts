import { Resend } from "resend";
import { prisma } from "./db";
import type { EmailTyp } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "aktionen@gruene-mitte.de";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  typ: EmailTyp;
  aktionId?: string;
}

export async function sendEmail({ to, subject, html, typ, aktionId }: SendEmailParams) {
  try {
    const { error } = await resend.emails.send({
      from: `GRÜNE Berlin-Mitte <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    await prisma.emailLog.create({
      data: {
        typ,
        empfaengerEmail: to,
        aktionId: aktionId || null,
        status: error ? `FEHLER: ${error.message}` : "GESENDET",
      },
    });

    return !error;
  } catch (err) {
    await prisma.emailLog.create({
      data: {
        typ,
        empfaengerEmail: to,
        aktionId: aktionId || null,
        status: `FEHLER: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      },
    });
    return false;
  }
}

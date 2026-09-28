import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(
      `[Akashia] RESEND_API_KEY no configurada. Correo simulado a ${opts.to}: ${opts.subject}`
    );
    return { simulated: true };
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM || "Akashia <onboarding@resend.dev>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

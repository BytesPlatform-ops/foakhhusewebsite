import nodemailer from "nodemailer";
import {
  enquiryHtml,
  enquirySubject,
  enquiryText,
  type EnquiryKind,
  type EnquiryPayload,
} from "@/lib/enquiry-email";

/**
 * POST /api/enquiry — the delivery path for both website forms.
 *
 * One route, two kinds: the general Register Interest and the Duplex
 * Penthouse enquiry. Both land in the same inbox; the template distinguishes
 * them so the recipient can triage at a glance.
 *
 * Spam protection is a honeypot field plus a submit-time floor. A bot fills
 * every input it finds and posts instantly; a person leaves the hidden field
 * empty and takes more than a couple of seconds to type three fields. No
 * CAPTCHA, because it would be the least premium thing on the page.
 *
 * The route never reports success it did not achieve: if SMTP is not
 * configured or the send fails, it answers 503/502 and the form says so,
 * rather than thanking someone whose enquiry went nowhere.
 */

export const runtime = "nodejs";

const TO = process.env.ENQUIRY_TO ?? "info@foakhwindcorridorenclave.com";
const MIN_FILL_MS = 2500;

function bad(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Malformed request.", 400);
  }

  const kind: EnquiryKind = body.kind === "penthouse" ? "penthouse" : "general";
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const website = String(body.website ?? "").trim(); // honeypot
  const startedAt = Number(body.startedAt ?? 0);

  /* silently accept the bot so it does not learn what tripped it */
  if (website) return Response.json({ ok: true });
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) {
    return Response.json({ ok: true });
  }

  if (!name || name.length > 120) return bad("Please enter your name.", 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return bad("Please enter a valid email address.", 422);
  }
  if (!/^[\d\s()+.-]{7,25}$/.test(phone)) {
    return bad("Please enter a valid phone number.", 422);
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    /* configuration gap, not the visitor's fault — say so plainly */
    return bad(
      "Enquiries are not connected yet. Please email info@foakhwindcorridorenclave.com.",
      503
    );
  }

  const payload: EnquiryPayload = {
    kind,
    name,
    email,
    phone,
    receivedAt: new Date().toUTCString(),
  };

  const port = Number(SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM ?? `"Foakh Wind Corridor Enclave" <${SMTP_USER}>`,
      to: TO,
      replyTo: `"${name}" <${email}>`,
      subject: enquirySubject(payload),
      text: enquiryText(payload),
      html: enquiryHtml(payload),
    });
  } catch (err) {
    console.error("[enquiry] send failed", err);
    return bad("We could not send that just now. Please try again shortly.", 502);
  }

  return Response.json({ ok: true });
}

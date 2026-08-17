/**
 * The enquiry notification sent to the sales inbox.
 *
 * Two shapes, one template: a general Register Interest and a Duplex
 * Penthouse enquiry. They differ only in what the subject and the header
 * band say, because whoever opens the inbox needs to know within a second
 * which of the two arrived — a penthouse lead is eight-units scarce and is
 * worked differently from a general one.
 *
 * Written as inline-styled tables rather than a stylesheet: mail clients
 * strip <style> unpredictably, and this has to survive Outlook as well as
 * Gmail. Colours are the FOAKH tokens so the mail reads as the project.
 */

import { FOAKH_PROJECT } from "@/lib/project";

export type EnquiryKind = "general" | "penthouse";

export interface EnquiryPayload {
  kind: EnquiryKind;
  name: string;
  email: string;
  phone: string;
  /** ISO string, stamped by the route rather than the browser */
  receivedAt: string;
}

const INK = "#2B211D";
const TERRACOTTA = "#94432F";
const CREAM = "#F5EDE3";
const CARD = "#FFF9F0";
const GOLD = "#C99355";
const ESPRESSO = "#241410";

const KIND: Record<EnquiryKind, { label: string; band: string; note: string }> = {
  general: {
    label: "Register Interest",
    band: TERRACOTTA,
    note: "General enquiry from the Foakh Wind Corridor Enclave website.",
  },
  penthouse: {
    label: "Duplex Penthouse Enquiry",
    band: ESPRESSO,
    note: "Penthouse enquiry — one of only eight duplex residences.",
  },
};

/** Mail clients are the last place you want an unescaped angle bracket. */
function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string, href?: string) {
  const shown = href
    ? `<a href="${esc(href)}" style="color:${TERRACOTTA};text-decoration:none;">${esc(value)}</a>`
    : esc(value);
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(148,67,47,0.14);width:34%;
                 font:600 11px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;
                 letter-spacing:0.12em;text-transform:uppercase;color:rgba(43,33,29,0.55);">
        ${esc(label)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid rgba(148,67,47,0.14);
                 font:400 15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${INK};">
        ${shown}
      </td>
    </tr>`;
}

export function enquirySubject(p: EnquiryPayload) {
  return `${KIND[p.kind].label} — ${p.name}`;
}

/** Plain-text part. Never optional: some clients show it, spam filters read it. */
export function enquiryText(p: EnquiryPayload) {
  return [
    `${KIND[p.kind].label}`,
    KIND[p.kind].note,
    "",
    `Name:  ${p.name}`,
    `Email: ${p.email}`,
    `Phone: ${p.phone}`,
    `Received: ${p.receivedAt}`,
    "",
    `${FOAKH_PROJECT.projectName} — ${FOAKH_PROJECT.displayAddress}`,
  ].join("\n");
}

export function enquiryHtml(p: EnquiryPayload) {
  const k = KIND[p.kind];
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px 12px;background:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr><td style="background:${k.band};border-radius:14px 14px 0 0;padding:22px 26px;">
      <div style="font:600 10px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;
                  letter-spacing:0.26em;text-transform:uppercase;color:${GOLD};">
        ${esc(FOAKH_PROJECT.projectName)}
      </div>
      <div style="margin-top:7px;font:600 21px/1.25 Georgia,'Times New Roman',serif;color:${CREAM};">
        ${esc(k.label)}
      </div>
    </td></tr>

    <tr><td style="background:${CARD};padding:24px 26px 8px;">
      <p style="margin:0 0 16px;font:400 14px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:rgba(43,33,29,0.7);">
        ${esc(k.note)}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Name", p.name)}
        ${row("Email", p.email, `mailto:${p.email}`)}
        ${row("Phone", p.phone, `tel:${p.phone.replace(/[^\d+]/g, "")}`)}
        ${row("Received", p.receivedAt)}
      </table>
    </td></tr>

    <tr><td style="background:${CARD};border-radius:0 0 14px 14px;padding:18px 26px 24px;">
      <a href="mailto:${esc(p.email)}"
         style="display:inline-block;background:${TERRACOTTA};color:${CREAM};text-decoration:none;
                border-radius:8px;padding:11px 20px;
                font:600 13px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
        Reply to ${esc(p.name)}
      </a>
      <p style="margin:16px 0 0;font:400 11px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:rgba(43,33,29,0.5);">
        Sent from foakhwindcorridorenclave.com · ${esc(FOAKH_PROJECT.displayAddress)}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

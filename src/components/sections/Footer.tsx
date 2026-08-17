/**
 * 23 — Footer. Contact, social and address alongside the compact index
 * (Dragonfly numbering), then the disclaimers and honest asset provenance.
 * Server-rendered, no motion.
 *
 * Every number is a real tel:/wa.me target rather than plain text, because a
 * phone number a thumb cannot dial is decoration. The WhatsApp links carry
 * the number in international form (wa.me refuses leading zeros and local
 * separators), while the label keeps the form the client publishes.
 */

import { FOAKH_PROJECT } from "@/lib/project";

const INDEX = [
  { num: "01", label: "Project", href: "#glance" },
  { num: "02", label: "Systems", href: "#route" },
  { num: "03", label: "Residences", href: "#residences" },
  { num: "04", label: "Location", href: "#location" },
  { num: "05", label: "Gallery", href: "#gallery" },
  { num: "06", label: "Enquire", href: "#enquire" },
];

/** Each row offers the actions that number actually supports: the Pakistan
 *  lines take a call or a WhatsApp message, so both are given rather than
 *  making the visitor guess which one the tap will do. */
const CONTACT = [
  { label: "US Toll Free", value: "(866) 405-3998", tel: "tel:+18664053998" },
  { label: "US WhatsApp", value: "+1 332 237 3313", wa: "https://wa.me/13322373313" },
  { label: "Pakistan", value: "0306-3256772", tel: "tel:+923063256772", wa: "https://wa.me/923063256772" },
  { label: "Pakistan", value: "0306-3256773", tel: "tel:+923063256773", wa: "https://wa.me/923063256773" },
];

const SOCIAL = [
  { name: "Facebook", href: "https://www.facebook.com/share/192FgxKXJy" },
  { name: "Instagram", href: "https://www.instagram.com/foakhwindcorridor" },
];

/** The address is never spelled out here — it comes from the project master
 *  record so the footer can never drift from the confirmed location. */
const ADDRESS = FOAKH_PROJECT.addressLines;

/**
 * The project's clarifications, written to lead with intent and close with
 * the qualification — the substance is unchanged, the register is not.
 * Nothing here is a claim the project has not made elsewhere on the page.
 */
const PROJECT_NOTES = [
  {
    title: "A future-ready environmental vision",
    body:
      "Foakh Wind Corridor Enclave has been thoughtfully conceived around a future-ready environmental vision. Natural airflow design, wind-responsive planning, renewable-energy integration and water-support systems are incorporated as part of the project intent, in alignment with final engineering development.",
  },
  {
    title: "Long-term energy efficiency",
    body:
      "The project has been envisioned to support meaningful long-term energy efficiency. Under favourable operating conditions and according to engineering performance, residents will benefit from substantial electricity-cost reduction potential. Actual performance may vary depending on environmental conditions, occupancy patterns, appliance usage, tariff structures and final implemented system specifications.",
  },
  {
    title: "About the visual material",
    body:
      "The visual material presented on this website is developed from the approved design direction and physical project model to illustrate the project character, spatial vision and architectural intent.",
  },
  {
    title: "A residential ownership opportunity",
    body:
      "Foakh Wind Corridor Enclave is presented as a residential lifestyle and ownership opportunity shaped around design, comfort and future-ready planning. Project features described as planned remain subject to final engineering and approvals.",
  },
];

function Icon({ name }: { name: "phone" | "whatsapp" | "pin" | "Facebook" | "Instagram" }) {
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", "aria-hidden": true as const };
  if (name === "phone")
    return (
      <svg {...common} fill="currentColor">
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.58 3.6a1 1 0 0 1-.25 1l-2.23 2.2Z" />
      </svg>
    );
  if (name === "whatsapp")
    return (
      <svg {...common} fill="currentColor">
        <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9a9.8 9.8 0 0 0 1.35 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.31-1.95 1.35-.5.05-.98.23-3.3-.7-2.78-1.1-4.53-3.95-4.67-4.14-.13-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27a1 1 0 0 1 .72-.34h.52c.17 0 .39-.6.6.46.24.55.8 1.9.87 2.04.7.13.11.29.02.47-.9.19-.13.3-.26.47l-.4.46c-.13.13-.26.28-.11.54.14.26.64 1.06 1.38 1.72.95.85 1.75 1.11 2 1.24.25.14.4.12.55-.7.15-.19.63-.73.8-.99.16-.25.33-.21.55-.12.23.8.43.29 1.85.98.42.2.7.31.8.48.11.17.11.96-.13 1.64Z" />
      </svg>
    );
  if (name === "pin")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    );
  if (name === "Facebook")
    return (
      <svg {...common} fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
      </svg>
    );
  return (
    <svg {...common} fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.64.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.88a3.96 3.96 0 1 0 0 7.92 3.96 3.96 0 0 0 0-7.92Zm0 6.53a2.57 2.57 0 1 1 0-5.14 2.57 2.57 0 0 1 0 5.14Zm5.04-6.69a.93.93 0 1 1-1.85 0 .93.93 0 0 1 1.85 0Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70 relative">
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) py-14">
        {/* ---------------- identity · contact · address · index -------- */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:gap-12">
          <div>
            <p className="font-display text-ivory text-2xl font-bold">wind corridor.</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Foakh Wind Corridor Enclave — where nature powers modern living.
            </p>
            <ul className="mt-5 flex gap-2.5">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Foakh Wind Corridor Enclave on ${s.name}`}
                    className="border-ivory/20 text-ivory/75 hover:border-champagne hover:text-champagne flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                  >
                    <Icon name={s.name as "Facebook" | "Instagram"} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-champagne/80 text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
              Talk to us
            </p>
            <ul className="mt-4 space-y-2">
              {CONTACT.map((c) => (
                <li key={`${c.label}-${c.value}`} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="text-ivory/45 block text-[0.62rem] tracking-[0.12em] uppercase">
                      {c.label}
                    </span>
                    <span className="block text-sm tabular-nums">{c.value}</span>
                  </span>
                  <span className="flex shrink-0 gap-1.5">
                    {c.tel && (
                      <a
                        href={c.tel}
                        aria-label={`Call ${c.label} ${c.value}`}
                        className="border-ivory/20 text-ivory/70 hover:border-champagne hover:text-champagne flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                      >
                        <Icon name="phone" />
                      </a>
                    )}
                    {c.wa && (
                      <a
                        href={c.wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${c.label} ${c.value}`}
                        className="border-ivory/20 text-ivory/70 hover:border-champagne hover:text-champagne flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                      >
                        <Icon name="whatsapp" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-champagne/80 text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
              Find us
            </p>
            <address className="mt-4 flex items-start gap-3 text-sm leading-relaxed not-italic">
              <span className="text-champagne/70 mt-0.5 shrink-0">
                <Icon name="pin" />
              </span>
              <span>
                {ADDRESS.map((line, i) => (
                  <span key={line} className={i === 0 ? "text-ivory block" : "block"}>
                    {line}
                  </span>
                ))}
              </span>
            </address>
          </div>

          <nav aria-label="Site index">
            <p className="text-champagne/80 text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
              Index
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 lg:grid-cols-1 lg:gap-x-0">
              {INDEX.map((i) => (
                <li key={i.num}>
                  <a
                    href={i.href}
                    className="hover:text-ivory flex min-h-11 items-center text-sm transition-colors"
                  >
                    <span className="text-champagne/70 mr-2 text-xs tabular-nums">{i.num}</span>
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ---------------- project notes ------------------------------
            The same clarifications, but written as part of the project's
            story rather than as a legal footnote — each one leads with the
            intent and follows with the qualification. On the phone they are
            native <details>, so the footer stays short and nothing needs
            JavaScript; from md the accordion is neutralised in CSS and all
            four read as an open two-column set. */}
        <section aria-labelledby="project-notes" className="border-ivory/10 mt-12 border-t pt-8">
          <h2
            id="project-notes"
            className="text-champagne/80 text-[0.62rem] font-semibold tracking-[0.24em] uppercase"
          >
            Project Notes
          </h2>
          <div className="mt-5 grid gap-x-10 gap-y-1 md:grid-cols-2 md:gap-y-6">
            {PROJECT_NOTES.map((note) => (
              <details key={note.title} open className="note border-ivory/10 border-b md:border-b-0">
                <summary className="text-ivory/85 flex min-h-11 cursor-pointer items-center justify-between gap-4 text-[0.8rem] font-medium md:min-h-0 md:text-[0.72rem] md:font-semibold md:tracking-[0.16em] md:uppercase">
                  {note.title}
                  <span aria-hidden="true" className="note-chevron text-champagne/70">
                    +
                  </span>
                </summary>
                <p className="text-ivory/60 pb-4 text-xs leading-relaxed md:mt-2 md:pb-0">
                  {note.body}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="border-ivory/10 mt-6 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ivory/55">
            © {new Date().getFullYear()} Foakh Wind Corridor Enclave. All rights reserved.
          </p>
          <p className="text-ivory/55">
            Made with{" "}
            <span aria-label="love" role="img" className="text-[#B65438]">
              ♥
            </span>{" "}
            by{" "}
            <a
              href="https://bytesplatform.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/80 hover:text-champagne underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
            >
              Bytes Platform
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

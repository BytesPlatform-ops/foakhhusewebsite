"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 22 — Limited Community & Long-Term Value, closing into the Final CTA.
 * Dusk three-quarter view: the building as a champagne outline on deep
 * bronze/charcoal, slight low angle. The route line (the same line that
 * has travelled the whole page) reaches the entrance, a few windows
 * illuminate, the glass enquiry panel appears — then everything stops.
 * Loop closure: the winch reel mark from the intro returns beside the CTA.
 *
 * The enquiry form renders real fields with validation styling but the
 * submit stays disabled until the sales inbox is confirmed — no fake
 * delivery, no fake success state.
 */

const VALUE_POINTS = [
  "Only 84 residences",
  "Two distinguished blocks",
  "Modern family layouts",
  "Renewable-energy planning",
  "Distinctive wind-corridor concept",
  "Connected location",
];

export default function FinalCTA() {
  const reduced = useReducedMotion();

  return (
    <section
      id="enquire"
      data-section="enquire"
      className="relative overflow-hidden bg-[#F6EBDD] py-(--spacing-section)"
      aria-labelledby="enquire-heading"
    >
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* deep forest CONTAINED panel — the one deep surface on the page */}
        <div
          className="grain relative overflow-hidden rounded-[32px] border border-[#D8B36A]/40 p-8 shadow-[0_44px_90px_-40px_rgba(31,58,48,0.55)] sm:p-12 lg:p-14"
          style={{
            background:
              "radial-gradient(80% 55% at 88% 0%, rgb(101 155 152 / 0.28) 0%, transparent 55%)," +
              "linear-gradient(160deg, #2E5245 0%, #294A3E 55%, #1F3A30 100%)",
          }}
        >
        {/* ---- Long-term value ---- */}
        <Eyebrow num="06" tone="light">
          Limited by design
        </Eyebrow>
        <ChapterHeading tone="light">A distinctive address with long-term potential.</ChapterHeading>
        <Lead tone="light">
          Limited inventory, a future-focused sustainability concept and a growing location
          contribute to the project&rsquo;s long-term appeal.
        </Lead>
        <ul className="mt-8 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
          {VALUE_POINTS.map((p) => (
            <li key={p} className="text-ivory/75 flex items-baseline gap-2.5 text-sm">
              <span aria-hidden="true" className="bg-champagne h-1.5 w-1.5 shrink-0 rounded-full" />
              {p}
            </li>
          ))}
        </ul>
        <p className="text-ivory/45 mt-6 max-w-2xl text-xs leading-relaxed">
          No returns, appreciation or rental yields are guaranteed. Project features described
          as planned remain subject to final engineering and approvals.
        </p>

        {/* ---- The dusk composition + enquiry ---- */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-12">
          <figure className="lg:col-span-6">
            <svg
              viewBox="0 0 640 520"
              className="h-auto w-full"
              role="img"
              aria-label="Dusk outline of the two residential blocks; the route line reaches the entrance and a few windows glow."
            >
              {/* champagne outline blocks, slight low angle */}
              {[
                { x: 130, w: 170, h: 360 },
                { x: 350, w: 170, h: 330 },
              ].map((b, i) => (
                <g key={i}>
                  <motion.rect
                    x={b.x}
                    y={470 - b.h}
                    width={b.w}
                    height={b.h}
                    fill="none"
                    stroke="#d4b36f"
                    strokeWidth="2.2"
                    initial={{ pathLength: reduced ? 1 : 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.8, delay: i * 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {/* floor lines */}
                  {Array.from({ length: 8 }).map((_, f) => (
                    <line
                      key={f}
                      x1={b.x}
                      y1={470 - b.h + 34 + f * ((b.h - 40) / 8)}
                      x2={b.x + b.w}
                      y2={470 - b.h + 34 + f * ((b.h - 40) / 8)}
                      stroke="#d4b36f"
                      strokeWidth="0.7"
                      opacity="0.4"
                    />
                  ))}
                  {/* a few windows illuminate, then stop */}
                  {[1, 3, 5].map((f, wi2) => (
                    <motion.rect
                      key={f}
                      x={b.x + 26 + wi2 * 44}
                      y={470 - b.h + 44 + f * ((b.h - 40) / 8)}
                      width="26"
                      height="14"
                      fill="#ffd88f"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.85 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.8, delay: reduced ? 0 : 2 + i * 0.4 + wi2 * 0.3 }}
                    />
                  ))}
                </g>
              ))}
              {/* rooftop marks */}
              <line x1="180" y1="110" x2="180" y2="86" stroke="#d4b36f" strokeWidth="1.6" />
              <circle cx="180" cy="82" r="6" fill="none" stroke="#d4b36f" strokeWidth="1.4" />
              <rect x="312" y="96" width="14" height="18" fill="none" stroke="#d4b36f" strokeWidth="1.4" />
              {/* the route reaches the entrance */}
              <motion.path
                d="M-20 505 C 160 500, 240 496, 322 480 C 342 476, 330 470, 325 462"
                fill="none"
                stroke="#6098aa"
                strokeWidth="2.4"
                strokeLinecap="round"
                initial={{ pathLength: reduced ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.8, delay: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* loop closure: the winch reel returns */}
              <circle cx="66" cy="474" r="14" fill="none" stroke="#b9bec2" strokeWidth="3" />
              <circle cx="66" cy="474" r="4" fill="#ef8a17" />
              <line x1="80" y1="470" x2="140" y2="452" stroke="#b9bec2" strokeWidth="1.4" />
            </svg>
          </figure>

          <div className="lg:col-span-6">
            <h3 className="font-display text-ivory text-d3 max-w-[14ch] font-semibold">
              Live where nature moves with you.
            </h3>
            <p className="text-ivory/70 mt-4 max-w-md text-pretty">
              Register your interest in The Wind Corridor Residences and receive project
              information, availability and the latest development updates.
            </p>

            {/* Enquiry panel — real fields, honest delivery state */}
            <form className="glass-dark mt-8 max-w-md space-y-4 rounded-2xl p-6" aria-label="Register interest">
              {[
                { id: "name", label: "Full name", type: "text", auto: "name" },
                { id: "email", label: "Email", type: "email", auto: "email" },
                { id: "phone", label: "Phone", type: "tel", auto: "tel" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="text-ivory/80 mb-1.5 block text-xs tracking-wide uppercase">
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    autoComplete={f.auto}
                    className="border-ivory/20 bg-charcoal/40 text-ivory placeholder:text-ivory/30 focus:border-cyan-optic w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none"
                    placeholder={f.label}
                  />
                </div>
              ))}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Form delivery activates once the sales inbox is confirmed"
                className="bg-champagne/40 text-charcoal w-full cursor-not-allowed rounded-full px-6 py-3 text-sm font-bold"
              >
                Register Interest
              </button>
              <p className="text-ivory/45 text-[0.7rem] leading-relaxed">
                Submissions activate once the sales inbox is confirmed — no enquiry is silently
                dropped in the meantime.
              </p>
            </form>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

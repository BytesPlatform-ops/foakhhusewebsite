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
  "160 Apartments",
  "08 Duplex Penthouses",
  "02 Distinguished Blocks",
  "12 Luxury Storeys",
  "Three Residential Categories",
  "Renewable-Energy Planning",
  "Wind-Catcher Architecture",
  "Integrated Water Strategy",
  "Connected Location",
];

export default function FinalCTA() {
  const reduced = useReducedMotion();

  return (
    <section
      id="enquire"
      data-section="enquire"
      className="relative overflow-hidden bg-[#F5EDE3] py-(--spacing-section)"
      aria-labelledby="enquire-heading"
    >
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* deep forest CONTAINED panel — the one deep surface on the page */}
        <div
          className="grain relative overflow-hidden rounded-[32px] border border-[#C99355]/40 p-8 shadow-[0_44px_90px_-40px_rgba(31,58,48,0.55)] sm:p-12 lg:p-14"
          style={{
            background:
              "radial-gradient(80% 55% at 88% 0%, rgb(101 155 152 / 0.28) 0%, transparent 55%)," +
              "linear-gradient(160deg, #294A3E 0%, #294A3E 55%, #294A3E 100%)",
          }}
        >
        {/* ---- Long-term value ---- */}
        <Eyebrow num="06" tone="light">
          Limited by Design
        </Eyebrow>
        <ChapterHeading tone="light">A distinctive address with long-term appeal.</ChapterHeading>
        <Lead tone="light">
          Foakh Wind Corridor Enclave combines a limited residential collection, distinctive
          architecture, multiple renewable-energy systems and a strategically positioned
          Karachi location.
        </Lead>
        <ul className="mt-8 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
          {VALUE_POINTS.map((p) => (
            <li key={p} className="text-ivory/75 flex items-baseline gap-2.5 text-sm">
              <span aria-hidden="true" className="bg-champagne h-1.5 w-1.5 shrink-0 rounded-full" />
              {p}
            </li>
          ))}
        </ul>
        <p className="text-ivory/60 mt-6 max-w-2xl text-xs leading-relaxed">
          No returns, appreciation or rental yields are guaranteed. Project features described
          as planned remain subject to final engineering and approvals.
        </p>

        {/* ---- The dusk composition + enquiry ---- */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-12">
          <figure className="lg:col-span-6">
            <TwoBlockIllustration reduced={!!reduced} />
          </figure>

          <div className="lg:col-span-6">
            <h3 className="font-display text-ivory text-d3 max-w-[14ch] font-semibold">
              Live where nature moves with you.
            </h3>
            <p className="text-ivory/70 mt-4 max-w-md text-pretty">
              Discover a residential development shaped around architecture, natural airflow,
              renewable resources and modern family living. Register your interest in Foakh
              Wind Corridor Enclave to receive project information, residential availability
              and future development updates.
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
                    className="border-ivory/20 bg-charcoal/40 text-ivory placeholder:text-ivory/30 focus:border-cyan-optic w-full rounded-lg border px-3.5 py-3 text-sm transition-colors outline-none"
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
              <p className="text-ivory/60 text-[0.7rem] leading-relaxed">
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

/* ================================================================== */
/* Refined architectural line-art of the approved two-block design:   */
/* Umer Block and Abdullah Block — 12 storeys, balcony rhythm, crown  */
/* band with wind catcher, rooftop turbines + solar outlines, central */
/* gap, entrance driveway, curved approach road, location marker,     */
/* softly lit windows and airflow lines toward the crown. Decorative  */
/* only (aria-hidden container, labelled role img). Lines draw once,  */
/* windows stagger on, airflow drifts briefly, marker pulses twice —  */
/* then everything rests. Reduced motion renders the settled drawing. */
/* ================================================================== */

const G = "#C99355";
const G2 = "rgba(216, 179, 106, 0.38)";
const LIT = "#F6D48A";
const AIR = "#78AFC1";
const PIN = "#E87957";

const FLOORS = 12;
const FLOOR_TOP = 135;
const FLOOR_H = 25;
const GROUND = FLOOR_TOP + FLOORS * FLOOR_H; // 435
const BLOCK_W = 240;

/** softly illuminated apartments: [blockX, floorIndex, bay 0|1|2] */
const LIT_WINDOWS: [number, number, number][] = [
  [40, 2, 0],
  [40, 6, 1],
  [40, 9, 2],
  [340, 4, 2],
  [340, 8, 1],
  [340, 10, 0],
];

function litRect([bx, f, bay]: [number, number, number]) {
  const y = FLOOR_TOP + f * FLOOR_H + 6;
  const x = bay === 0 ? bx + 16 : bay === 1 ? bx + 98 : bx + 176;
  const w = bay === 1 ? 44 : 48;
  return { x, y, w, h: 13 };
}

function BlockDetail({ x }: { x: number }) {
  const floors = Array.from({ length: FLOORS }, (_, i) => FLOOR_TOP + (i + 1) * FLOOR_H);
  return (
    <>
      {/* bay dividers */}
      <path d={`M ${x + 80} ${FLOOR_TOP} V ${GROUND} M ${x + 160} ${FLOOR_TOP} V ${GROUND}`} stroke={G2} strokeWidth="1" fill="none" />
      {/* floor slabs */}
      <path d={floors.slice(0, -1).map((y) => `M ${x} ${y} H ${x + BLOCK_W}`).join(" ")} stroke={G2} strokeWidth="1" fill="none" />
      {/* balcony railings + centre windows, per floor */}
      {floors.map((y, i) => (
        <g key={i}>
          {/* left + right balcony rails */}
          <path
            d={`M ${x + 10} ${y - 8} H ${x + 70} M ${x + 24} ${y - 8} V ${y - 2} M ${x + 40} ${y - 8} V ${y - 2} M ${x + 56} ${y - 8} V ${y - 2}` +
              ` M ${x + 170} ${y - 8} H ${x + 230} M ${x + 184} ${y - 8} V ${y - 2} M ${x + 200} ${y - 8} V ${y - 2} M ${x + 216} ${y - 8} V ${y - 2}`}
            stroke={G2}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          {/* recessed centre window pair */}
          <path d={`M ${x + 96} ${y - 18} h 20 v 12 h -20 z M ${x + 124} ${y - 18} h 20 v 12 h -20 z`} stroke={G2} strokeWidth="1" fill="none" />
        </g>
      ))}
      {/* crown band: frame + central wind-catcher opening */}
      <path d={`M ${x} ${FLOOR_TOP} H ${x + BLOCK_W}`} stroke={G} strokeWidth="1.2" fill="none" />
      <path d={`M ${x + 95} 100 h 50 v 30 h -50 z`} stroke={G} strokeWidth="1.2" fill="none" />
      <path d={`M ${x + 30} 108 h 40 M ${x + 30} 120 h 40 M ${x + 170} 108 h 40 M ${x + 170} 120 h 40`} stroke={G2} strokeWidth="1" fill="none" />
      {/* entrance */}
      <path d={`M ${x + 95} ${GROUND + 35} V ${GROUND + 6} q 25 -14 50 0 V ${GROUND + 35}`} stroke={G} strokeWidth="1.2" fill="none" />
    </>
  );
}

function RooftopSystems({ x }: { x: number }) {
  const turbine = (tx: number) => (
    <g key={tx}>
      <path d={`M ${tx} 95 V 72`} stroke={G} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx={tx} cy={66} r={7} stroke={G} strokeWidth="1.2" fill="none" />
      <path d={`M ${tx} 66 l 0 -6 M ${tx} 66 l 5.2 3 M ${tx} 66 l -5.2 3`} stroke={G} strokeWidth="1" strokeLinecap="round" fill="none" />
    </g>
  );
  return (
    <>
      {turbine(x + 40)}
      {turbine(x + 200)}
      {/* mast */}
      <path d={`M ${x + 120} 100 V 52 M ${x + 116} 60 h 8`} stroke={G} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* solar panel outlines */}
      <path
        d={`M ${x + 58} 95 l 8 -7 h 30 l -8 7 z M ${x + 70} 91.5 l 8 -7 M ${x + 62} 91.5 h 28` +
          ` M ${x + 148} 95 l 8 -7 h 30 l -8 7 z M ${x + 160} 91.5 l 8 -7 M ${x + 152} 91.5 h 28`}
        stroke={G2}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function TwoBlockIllustration({ reduced }: { reduced: boolean }) {
  const draw = (delay: number, dur = 1.6) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, amount: 0.35 },
          transition: { duration: dur, delay, ease: [0.22, 1, 0.36, 1] as const },
        };
  const fade = (delay: number, dur = 0.9) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, amount: 0.35 },
          transition: { duration: dur, delay },
        };

  return (
    <svg
      viewBox="0 0 620 540"
      className="mx-auto h-auto w-full max-w-[600px]"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Line drawing of Umer Block and Abdullah Block — twelve storeys with rooftop wind turbines and solar panels, the entrance driveway and approach road"
    >
      <defs>
        <filter id="wcr-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* airflow toward the crown */}
      <g id="airflow-lines">
        {[
          "M 8 52 C 90 34, 180 44, 268 92",
          "M 2 92 C 96 72, 190 80, 276 116",
          "M 614 60 C 540 40, 448 48, 352 94",
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke={AIR}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="3 9"
            fill="none"
            initial={reduced ? undefined : { opacity: 0, strokeDashoffset: 36 }}
            whileInView={
              reduced
                ? undefined
                : { opacity: [0, 0.75, 0.75, 0.55], strokeDashoffset: [36, 0, -36, -72] }
            }
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 5.5, delay: 1.6 + i * 0.3, times: [0, 0.2, 0.6, 1] }}
            style={reduced ? { opacity: 0.55 } : undefined}
          />
        ))}
      </g>

      {/* Umer Block */}
      <g id="umer-block">
        <motion.path
          d={`M 40 95 H 280 V ${GROUND + 35} M 40 95 V ${GROUND + 35}`}
          stroke={G}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          {...draw(0)}
        />
        <motion.g {...fade(0.7)}>
          <BlockDetail x={40} />
        </motion.g>
      </g>

      {/* Abdullah Block */}
      <g id="abdullah-block">
        <motion.path
          d={`M 340 95 H 580 V ${GROUND + 35} M 340 95 V ${GROUND + 35}`}
          stroke={G}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          {...draw(0.25)}
        />
        <motion.g {...fade(0.95)}>
          <BlockDetail x={340} />
        </motion.g>
      </g>

      {/* rooftop systems, softly glowing */}
      <g id="rooftop-systems">
        <motion.g {...fade(1.3)}>
          <g filter="url(#wcr-soft-glow)" opacity="0.5">
            <RooftopSystems x={40} />
            <RooftopSystems x={340} />
          </g>
          <RooftopSystems x={40} />
          <RooftopSystems x={340} />
        </motion.g>
      </g>

      {/* lit apartments — restrained stagger, with glow */}
      <g id="lit-windows">
        {LIT_WINDOWS.map((w, i) => {
          const r = litRect(w);
          return (
            <motion.g key={i} {...(reduced ? {} : fade(1.5 + i * 0.22, 0.7))}>
              <rect {...r} fill={LIT} opacity="0.55" filter="url(#wcr-soft-glow)" />
              <rect {...r} fill={LIT} opacity="0.85" rx="1.5" />
            </motion.g>
          );
        })}
      </g>

      {/* ground, driveway + curved approach road */}
      <g id="driveway">
        <motion.path
          d={`M 12 ${GROUND + 35} H 608` +
            ` M 250 ${GROUND + 35} C 240 505, 215 522, 180 533` +
            ` M 370 ${GROUND + 35} C 380 505, 405 522, 440 533` +
            ` M 4 522 C 90 528, 150 537, 240 536 M 2 534 C 90 540, 150 547, 236 545`}
          stroke={G}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          {...draw(0.9, 1.4)}
        />
        <motion.path
          d={`M 262 ${GROUND + 38} C 258 508, 244 520, 222 528 M 310 ${GROUND + 40} V 532`}
          stroke={G2}
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeLinecap="round"
          fill="none"
          {...fade(1.4)}
        />
      </g>

      {/* location marker on the driveway — pulses twice, then rests */}
      <g id="location-marker">
        <motion.g {...fade(1.9, 0.5)}>
          <motion.circle
            cx={310}
            cy={505}
            r={10}
            stroke={PIN}
            strokeWidth="1.2"
            fill="none"
            initial={reduced ? undefined : { scale: 0.6, opacity: 0 }}
            whileInView={reduced ? undefined : { scale: [0.6, 1.5, 0.6, 1.5, 1], opacity: [0, 0.5, 0, 0.5, 0] }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 3, delay: 2.1, times: [0, 0.3, 0.5, 0.8, 1] }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <g filter="url(#wcr-soft-glow)" opacity="0.6">
            <path d="M 310 486 c -7 0 -12 5 -12 11.5 c 0 8 12 19.5 12 19.5 s 12 -11.5 12 -19.5 c 0 -6.5 -5 -11.5 -12 -11.5 z" fill={PIN} />
          </g>
          <path d="M 310 486 c -7 0 -12 5 -12 11.5 c 0 8 12 19.5 12 19.5 s 12 -11.5 12 -19.5 c 0 -6.5 -5 -11.5 -12 -11.5 z" fill={PIN} />
          <circle cx={310} cy={497} r={4} fill="#294A3E" />
        </motion.g>
      </g>
    </svg>
  );
}

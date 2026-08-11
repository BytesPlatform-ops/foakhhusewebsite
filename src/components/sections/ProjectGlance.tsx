"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import BuildIn from "@/components/shared/BuildIn";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 01 — The Project: cinematic approach to the entrance.
 *
 * Scroll behaviour inspired by collabcapitolium.fr (mood/pacing only): the
 * dusk frontal render holds the sticky stage while a slow camera push —
 * scale anchored on the gate at 50% 74% of the frame — draws the visitor
 * down the walkway toward the entrance. The centred copy begins dim and
 * softly blurred, then brightens and sharpens as the doors approach; the
 * block names and CTA arrive with the final frame.
 *
 * Native scrolling, transform/opacity only, spring-driven progress (the
 * ScrollTimeline stale-range guard), no 3D. Reduced motion renders the
 * settled end-frame statically with everything readable.
 */

const COPY = {
  eyebrow: "01 — The Project",
  headline: "Designed around nature. Created around modern life.",
  body: "A distinctive residential concept created for comfort, efficiency and future-ready living.",
  caption: "Umer Block · Abdullah Block — 12 storeys · 160 apartments · 8 duplex penthouses",
};

const HIGHLIGHTS = [
  {
    title: "Limited Residential Community",
    copy: "160 carefully planned apartments across two distinguished blocks.",
  },
  {
    title: "Eight Duplex Penthouses",
    copy: "Exclusive duplex residences with independent swimming pools.",
  },
  {
    title: "Modern Family Living",
    copy: "Spacious layouts designed around comfort, functionality and everyday needs.",
  },
  {
    title: "Renewable Energy",
    copy: "Wind turbines, solar panels and kite energy planned as part of an integrated renewable-energy strategy.",
  },
  {
    title: "Innovative Ventilation",
    copy: "A dedicated wind-catcher system designed to capture and channel natural airflow.",
  },
  {
    title: "Strategic Location",
    copy: "Located within Karachi's wind corridor, adjacent to Shaukat Khanum Hospital.",
  },
];

const SAVINGS_NOTE =
  "Projected savings are based on optimum engineering performance and may vary according to wind conditions, solar output, occupancy, appliance usage, tariff changes and final system specifications.";

export default function ProjectGlance() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 });

  /* ---- STAGE 1 (0 -> 0.55): the approach — a dolly, not a zoom -------- */
  // Non-linear scale: speed builds as the gate nears. Origin on the door.
  const scale = useTransform(p, [0, 0.3, 0.55, 1], [1.06, 1.22, 1.58, 2.05]);
  const imgY = useTransform(p, [0, 0.55, 1], ["0%", "3.2%", "4.5%"]);
  // The walkway look-down settles flat on arrival — the perspective shift.
  const rotateX = useTransform(p, [0, 0.2, 0.55], [1.8, 1.1, 0]);
  // Atmosphere clears through the approach, deepens again at the threshold.
  const overlay = useTransform(p, [0, 0.42, 0.55, 0.7], [0.56, 0.3, 0.42, 0.52]);

  /* ---- THE THRESHOLD (0.55 -> 0.92): the window contracts ------------- */
  // The frame itself tightens into a portal while the image inside keeps
  // pushing deeper — window and content move against each other.
  // Two phases, both quicker than before: a fast contraction to the
  // portal, then the portal seals completely — the photograph vanishes
  // into the elevation drawing.
  const clip = useTransform(p, (v) => {
    const a = Math.min(Math.max((v - 0.55) / 0.17, 0), 1);
    const ea = 1 - Math.pow(1 - a, 3);
    const b = Math.min(Math.max((v - 0.74) / 0.16, 0), 1);
    const eb = b * b * (3 - 2 * b);
    const top = ea * 27 + eb * 23;
    const right = ea * 31 + eb * 19;
    const bottom = ea * 23 + eb * 27;
    const left = ea * 31 + eb * 19;
    const r = ea * 14 * (1 - b);
    return `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${bottom.toFixed(2)}% ${left.toFixed(2)}% round ${r.toFixed(1)}px)`;
  });

  /* ---- text: reveals on approach, dissolves at the crossing ----------- */
  const textOpacity = useTransform(p, [0.05, 0.4, 0.52, 0.6], [0.35, 1, 1, 0]);
  const textBlur = useTransform(p, [0.05, 0.4], ["blur(5px)", "blur(0px)"]);
  const textY = useTransform(p, [0.05, 0.45], [16, 0]);
  /* stage 2: restrained caption on the stone, beneath the portal */
  const innerOpacity = useTransform(p, [0.7, 0.84], [0, 1]);
  const innerY = useTransform(p, [0.7, 0.84], [14, 0]);

  if (reduced) return <StaticFrame />;

  return (
    <section
      id="glance"
      ref={sectionRef}
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative"
    >
      <div ref={pinRef} className="relative h-[230svh] lg:h-[290svh]">
      {/* Stage ground is the page's stone — when the window contracts, the
          portal sits on the same surface the next section begins from, so
          the two stages and the following section read as one passage. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* THE FRAME — full-bleed scene that tightens into a portal */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          {/* perspective wrapper: the dolly happens inside real depth */}
          <div className="absolute inset-0" style={{ perspective: "1100px" }}>
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ scale, y: imgY, rotateX, transformOrigin: "50% 74%" }}
            >
              <Image
                src="/buildingfront.jpg"
                alt=""
                fill
                priority={false}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "50% 60%" }}
              />
            </motion.div>
          </div>

          {/* atmosphere inside the frame */}
          <motion.div aria-hidden="true" className="absolute inset-0 bg-[#14100d]" style={{ opacity: overlay }} />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 42%, transparent 48%, rgb(20 16 13 / 0.55) 100%)",
            }}
          />
          <div className="grain absolute inset-0" aria-hidden="true" />
        </motion.div>

        {/* STAGE 1 message — brightens on approach, dissolves at the door */}
        <motion.div
          className="absolute inset-x-0 top-[30%] mx-auto max-w-3xl px-6 text-center lg:top-[26%]"
          style={{ opacity: textOpacity, y: textY, filter: textBlur }}
        >
          <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
            {COPY.eyebrow}
          </p>
          <h2
            id="glance-heading"
            className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
          >
            {COPY.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[0.85rem] leading-relaxed font-light text-[#F3E7D8]/85 md:text-[0.95rem]">
            {COPY.body}
          </p>
        </motion.div>

        {/* STAGE 2 — beyond the threshold: quiet caption on the stone */}
        <motion.div
          className="absolute inset-x-0 bottom-[7%] mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center"
          style={{ opacity: innerOpacity, y: innerY }}
        >
          <p className="text-[0.62rem] tracking-[0.3em] text-[#9C6247] uppercase">
            Beyond the gate
          </p>
          <p className="font-display text-xl font-medium text-[#1D1714] md:text-2xl">
            {COPY.caption}
          </p>
          <a
            href="#residences"
            className="mt-1 rounded-lg border border-[#9C6247]/45 px-6 py-3 text-sm font-medium text-[#1D1714] transition-colors hover:bg-[#9C6247] hover:text-[#F7F0E8]"
          >
            Explore the Residences
          </a>
        </motion.div>
      </div>
      </div>

      {/* ------- the project introduction — extends the chapter ------- */}
      <ProjectIntroduction />
    </section>
  );
}

/**
 * The project introduction as a contained architectural BLUEPRINT SHEET:
 * a warm-ivory presentation sheet (max 1380px, clear margins) carrying
 * the approved two-block elevation drawing, fine grid, dimension marks
 * and ALL of the approved copy inside the sheet composition. On scroll
 * the sheet starts slightly tilted (rotateZ/rotateX, scaled, lowered)
 * and straightens like a drawing being aligned on a desk — spring
 * smoothed, no bounce. Mobile drops the 3D tilt to a small rotateZ and
 * flows the content vertically. Reduced motion renders it settled.
 */

const mqSubscribe = (cb: () => void) => {
  const m = window.matchMedia("(min-width: 1024px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const mqRead = () => window.matchMedia("(min-width: 1024px)").matches;

function ProjectIntroduction() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useSyncExternalStore(mqSubscribe, mqRead, () => true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.22"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  const rotateZ = useTransform(p, [0, 0.72], isDesktop ? [-4, 0] : [-1.5, 0]);
  const rotateX = useTransform(p, [0, 0.72], isDesktop ? [5, 0] : [0, 0]);
  const scale = useTransform(p, [0, 0.72], [0.93, 1]);
  const y = useTransform(p, [0, 0.72], [70, 0]);
  const drawOpacity = useTransform(p, [0, 0.65], [0.28, 0.55]);
  const contentOpacity = useTransform(p, [0.1, 0.6], [0.25, 1]);

  const rise = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div ref={ref} className="relative overflow-hidden bg-[#F6EBDD] py-20 lg:py-24">
      {/* quiet ground outside the sheet — soft glow only, no drawing */}
      <div
        aria-hidden="true"
        className="absolute top-[10%] left-1/2 h-[70%] w-[70%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(199 91 59 / 0.14), transparent 70%)" }}
      />

      {/* the sheet — tilted, then aligned */}
      <motion.div
        className="relative mx-auto w-[92vw] max-w-[1380px] lg:w-[82vw]"
        style={
          reduced
            ? undefined
            : { rotateZ, rotateX, scale, y, transformPerspective: 1200, transformOrigin: "50% 20%" }
        }
      >
        <div
          className="grain relative overflow-hidden rounded-[8px] border p-6 sm:p-9 lg:p-12"
          style={{
            background: "#F7ECDE",
            borderColor: "rgba(155,82,55,0.34)",
            boxShadow:
              "0 60px 100px -44px rgba(90,45,25,0.45), 0 22px 44px -24px rgba(90,45,25,0.28)",
          }}
        >
          {/* fine drafting grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(217,133,105,0.09) 0 1px, transparent 1px 46px)," +
                "repeating-linear-gradient(90deg, rgba(217,133,105,0.09) 0 1px, transparent 1px 46px)",
            }}
          />
          {/* ruler ticks along the top edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(155,82,55,0.35) 0 1px, transparent 1px 23px)",
            }}
          />

          {/* the approved two-block elevation, inside the sheet */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[3%] top-[7%] bottom-[5%]"
            style={{ opacity: reduced ? 0.52 : drawOpacity }}
          >
            <Image
              src="/building-outline-lines.png"
              alt=""
              fill
              sizes="82vw"
              className="object-contain"
            />
          </motion.div>

          {/* dimension line + technical annotations */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] top-[4.5%] hidden items-center gap-2 lg:flex">
            <span className="h-px flex-1" style={{ background: "rgba(155,82,55,0.4)" }} />
            <span className="text-[0.55rem] tracking-[0.24em] whitespace-nowrap uppercase" style={{ color: "rgba(142,67,47,0.75)" }}>
              Umer Block · Abdullah Block — 12 storeys
            </span>
            <span className="h-px flex-1" style={{ background: "rgba(155,82,55,0.4)" }} />
          </div>
          <p
            aria-hidden="true"
            className="pointer-events-none absolute right-4 bottom-3 text-[0.52rem] tracking-[0.22em] uppercase lg:right-6 lg:bottom-4"
            style={{ color: "rgba(142,67,47,0.6)" }}
          >
            WCR · Sheet 01 — Project Introduction · Not to scale
          </p>

          {/* ---------------- content, attached to the sheet ---------- */}
          <motion.div className="relative" style={reduced ? undefined : { opacity: contentOpacity }}>
            {/* top-left: eyebrow / heading / lead */}
            <motion.div {...rise(0)} className="max-w-xl">
              <p className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#C78C49" }}>
                01 — The Project
              </p>
              <h3
                className="font-display mt-3 leading-[1.05] uppercase"
                style={{ color: "#8E432F", fontSize: "clamp(2rem,3.4vw,3.4rem)", fontWeight: 600 }}
              >
                Designed around nature
              </h3>
              <p className="mt-4 text-[1.05rem] leading-[1.6]" style={{ color: "#2B211D" }}>
                A distinctive residential concept created for comfort, efficiency and
                future-ready living.
              </p>
            </motion.div>

            <div className="mt-9 grid gap-9 lg:mt-10 lg:grid-cols-[1.04fr_1fr] lg:gap-12">
              {/* left/centre: the introduction, on a readability wash */}
              <motion.div
                {...rise(0.08)}
                className="rounded-md p-4 sm:p-5"
                style={{
                  background: "rgba(247,236,222,0.82)",
                  boxShadow: "0 0 34px 22px rgba(247,236,222,0.82)",
                }}
              >
                <p className="max-w-[62ch] text-[1.02rem] leading-[1.75]" style={{ color: "#51443D" }}>
                  Foakh Wind Corridor Enclave is an exclusive 12-storey residential development
                  in DHA City, Karachi, comprising Umer Block and Abdullah Block. With 160
                  carefully planned apartments and eight duplex penthouses with independent
                  swimming pools, the development brings together privacy, spacious living and
                  a distinctive contemporary architectural identity.
                </p>
                <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-[1.75]" style={{ color: "#51443D" }}>
                  The project has been conceived around the intelligent use of natural
                  resources. Wind turbines, solar energy and kite energy form part of its
                  renewable-energy strategy, while a dedicated wind-catcher system captures
                  high-velocity natural air and directs it through the development.
                </p>
                <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-[1.75]" style={{ color: "#51443D" }}>
                  Together, these systems are intended to enhance natural ventilation, reduce
                  heat buildup and lower dependence on conventional cooling and grid
                  electricity. Based on optimum engineering performance, residents may benefit
                  from electricity-bill savings of up to 75%.
                </p>
                <p
                  className="mt-4 max-w-[62ch] border-l-2 pl-3.5 text-[0.75rem] leading-[1.6]"
                  style={{ color: "rgba(81,68,61,0.85)", borderColor: "rgba(199,140,73,0.6)" }}
                >
                  {SAVINGS_NOTE}
                </p>
              </motion.div>

              {/* right: 2×2 feature panels */}
              <div className="grid content-start gap-4 sm:grid-cols-2">
                {HIGHLIGHTS.map((h, i) => (
                  <BuildIn
                    key={h.title}
                    delay={0.16 + i * 0.09}
                    amount={0.3}
                    className="rounded-[12px] border p-5"
                    style={{
                      background: "rgba(255,249,240,0.88)",
                      borderColor: "rgba(155,82,55,0.25)",
                      boxShadow: "0 14px 30px -20px rgba(90,45,25,0.35)",
                    }}
                  >
                    <p className="font-display text-[1.05rem] leading-snug font-medium" style={{ color: "#8E432F" }}>
                      {h.title}
                    </p>
                    <p className="mt-2 text-[0.85rem] leading-[1.6]" style={{ color: "#51443D" }}>
                      {h.copy}
                    </p>
                  </BuildIn>
                ))}
              </div>
            </div>

            {/* bottom: closing statement + CTA */}
            <motion.div
              {...rise(0.5)}
              className="mt-10 flex flex-col items-start gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "rgba(155,82,55,0.28)" }}
            >
              <p className="text-[0.74rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#8E432F" }}>
                The future of responsible urban living starts here.
              </p>
              <a
                href="#residences"
                className="inline-block shrink-0 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
                style={{ background: "#8E432F", color: "#FFF8EF" }}
              >
                Explore the Residences
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/** Reduced motion: the settled end-frame, fully readable, no pin. */
function StaticFrame() {
  return (
    <section
      id="glance"
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative flex min-h-svh items-center overflow-hidden bg-[#1D1714]"
    >
      <Image
        src="/buildingfront.jpg"
        alt=""
        fill
        sizes="100vw"
        className="scale-125 object-cover"
        style={{ objectPosition: "50% 66%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#14100d]/40" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
          {COPY.eyebrow}
        </p>
        <h2
          id="glance-heading"
          className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
        >
          {COPY.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[0.9rem] leading-relaxed font-light text-[#F3E7D8]/85">
          {COPY.body}
        </p>
        <p className="mt-8 text-[0.65rem] tracking-[0.26em] text-[#F7F0E8]/75 uppercase">
          {COPY.caption}
        </p>
      </div>
      <div className="relative bg-[#F6EBDD]">
        <ProjectIntroduction />
      </div>
    </section>
  );
}

"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  motion,
  type MotionValue,
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

/** one panel surface, shared by the desktop grid and the mobile rail */
const PANEL: React.CSSProperties = {
  background: "rgba(255,249,240,0.88)",
  borderColor: "rgba(155,82,55,0.25)",
  boxShadow: "0 14px 30px -20px rgba(90,45,25,0.35)",
};

function PanelCopy({ h }: { h: (typeof HIGHLIGHTS)[number] }) {
  return (
    <>
      <p className="font-display text-[1.05rem] leading-snug font-medium" style={{ color: "#94432F" }}>
        {h.title}
      </p>
      <p className="mt-2 text-[0.85rem] leading-[1.6]" style={{ color: "#625750" }}>
        {h.copy}
      </p>
    </>
  );
}

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
  /* the mobile scrim exists only to carry that copy, so it leaves with it —
     held on any longer it turns the contracting portal into a dark smear */
  const scrimOpacity = useTransform(p, [0.5, 0.62], [1, 0]);
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
      {/* 142svh gave the four beats — approach, threshold, seal, arrival —
          about 350px of scroll on a phone, so the photograph appeared and
          vanished inside a single flick. 215svh is still far shorter than
          the desktop run, but long enough for the push to read as a push. */}
      <div ref={pinRef} className="relative h-[215svh] lg:h-[290svh]">
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
          {/* Mobile only: the copy sits low, over the garden and the drive,
              and this carries it. At 390px the frame is all facade — lit
              windows top to bottom — and dim blurred type over that read as
              a printing fault rather than a reveal. Inside the clip so it
              seals away with the photograph. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[72%] lg:hidden"
            style={{
              opacity: scrimOpacity,
              background:
                "linear-gradient(to top, rgb(20 16 13 / 0.84) 6%, rgb(20 16 13 / 0.62) 38%, rgb(20 16 13 / 0.3) 68%, transparent 100%)",
            }}
          />

          <div className="grain absolute inset-0" aria-hidden="true" />
        </motion.div>

        {/* STAGE 1 message — brightens on approach, dissolves at the door.
            Centred on desktop; on a phone it drops onto the scrim below the
            towers, where there is ground to read against. */}
        <motion.div
          className="absolute inset-x-0 bottom-[19%] mx-auto max-w-3xl px-5 text-center sm:px-6 lg:top-[26%] lg:bottom-auto"
          style={{ opacity: textOpacity, y: textY, filter: textBlur }}
        >
          <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C99355] uppercase">
            {COPY.eyebrow}
          </p>
          <h2
            id="glance-heading"
            className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F5EDE3] text-balance"
          >
            {COPY.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.85rem] leading-relaxed font-light text-[#EEE1D3]/85 md:mt-6 md:text-[0.95rem]">
            {COPY.body}
          </p>
        </motion.div>

        {/* STAGE 2 — beyond the threshold: quiet caption on the stone */}
        <motion.div
          className="absolute inset-x-0 bottom-[10%] mx-auto flex max-w-3xl flex-col items-center gap-3.5 px-5 text-center sm:gap-4 sm:px-6 lg:bottom-[7%]"
          style={{ opacity: innerOpacity, y: innerY }}
        >
          <p className="text-[0.62rem] tracking-[0.3em] text-[#94432F] uppercase">
            Beyond the gate
          </p>
          <p className="font-display text-xl font-medium text-[#2B211D] md:text-2xl">
            {COPY.caption}
          </p>
          <a
            href="#residences"
            className="mt-1 rounded-lg border border-[#94432F]/45 px-6 py-3 text-sm font-medium text-[#2B211D] transition-colors hover:bg-[#94432F] hover:text-[#F5EDE3]"
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
    <div ref={ref} className="relative overflow-x-clip bg-[#F5EDE3] pt-16 pb-16 md:overflow-hidden lg:py-24">
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
          className="grain relative overflow-x-clip rounded-[8px] border p-5 sm:p-9 md:overflow-hidden lg:p-12"
          style={{
            background: "#F5EDE3",
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

          {/* The approved two-block elevation, inside the sheet. Desktop only:
              the mobile sheet is roughly 2400px tall, so object-contain
              stretches this to a full-height ghost that duplicates the fixed
              ElevationBackdrop already showing above and below the sheet. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[3%] top-[7%] bottom-[5%] hidden lg:block"
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
            className="pointer-events-none absolute right-4 bottom-3 hidden text-[0.52rem] tracking-[0.22em] uppercase lg:right-6 lg:bottom-4 lg:block"
            style={{ color: "rgba(142,67,47,0.6)" }}
          >
            WCR · Sheet 01 — Project Introduction · Not to scale
          </p>

          {/* ---------------- content, attached to the sheet ---------- */}
          <motion.div className="relative" style={reduced ? undefined : { opacity: contentOpacity }}>
            {/* top-left: eyebrow / heading / lead */}
            <motion.div {...rise(0)} className="max-w-xl">
              <p className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#C99355" }}>
                01 — The Project
              </p>
              <h3
                className="font-display mt-3 leading-[1.05] uppercase"
                style={{ color: "#94432F", fontSize: "clamp(2rem,3.4vw,3.4rem)", fontWeight: 600 }}
              >
                Designed around nature
              </h3>
              <p className="mt-4 text-[0.95rem] leading-[1.6] lg:text-[1.05rem]" style={{ color: "#2B211D" }}>
                A distinctive residential concept created for comfort, efficiency and
                future-ready living.
              </p>
            </motion.div>

            <div className="mt-9 grid gap-9 lg:mt-10 lg:grid-cols-[1.04fr_1fr] lg:gap-12">
              {/* left/centre: the introduction, on a readability wash */}
              {/* The wash exists to lift this copy off the elevation drawing
                  behind it. The drawing is desktop-only, so below lg the wash
                  is just a pale box with a 34px glow around it. */}
              <motion.div
                {...rise(0.08)}
                className="rounded-md p-0 sm:p-5 lg:bg-[rgba(247,236,222,0.82)] lg:shadow-[0_0_34px_22px_rgba(247,236,222,0.82)]"
              >
                <p className="max-w-[62ch] text-[0.92rem] leading-[1.7] lg:text-[1.02rem] lg:leading-[1.75]" style={{ color: "#625750" }}>
                  Foakh Wind Corridor Enclave is an exclusive 12-storey residential development
                  in DHA City, Karachi, comprising Umer Block and Abdullah Block. With 160
                  carefully planned apartments and eight duplex penthouses with independent
                  swimming pools, the development brings together privacy, spacious living and
                  a distinctive contemporary architectural identity.
                </p>
                <p className="mt-4 max-w-[62ch] text-[0.92rem] leading-[1.7] lg:text-[1.02rem] lg:leading-[1.75]" style={{ color: "#625750" }}>
                  The project has been conceived around the intelligent use of natural
                  resources. Wind turbines, solar energy and kite energy form part of its
                  renewable-energy strategy, while a dedicated wind-catcher system captures
                  high-velocity natural air and directs it through the development.
                </p>
                <p className="mt-4 max-w-[62ch] text-[0.92rem] leading-[1.7] lg:text-[1.02rem] lg:leading-[1.75]" style={{ color: "#625750" }}>
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

              {/* The six qualities. Below md they are a single-column
                  editorial stack at full width; from md up they return to
                  the 2x2 grid the sheet was designed around.

                  They used to be a swipe rail on a phone — 72vw cards in an
                  overflow-x container bled past the sheet with -mx-5, which
                  is what pushed the page wider than the viewport and left a
                  clipped half-card at the edge. Nothing here sets a width
                  now, so each card simply fills its column. */}
              {/* md and up: the 2-column grid the sheet was designed around */}
              <div className="hidden content-start gap-4 md:grid md:grid-cols-2">
                {HIGHLIGHTS.map((h, i) => (
                  <motion.div
                    key={h.title}
                    className="min-w-0 rounded-[12px] border p-5"
                    style={PANEL}
                    {...(reduced
                      ? {}
                      : {
                          initial: { opacity: 0, y: 20 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: true, amount: 0.25 },
                          transition: { duration: 0.5, delay: Math.min(i, 3) * 0.07, ease: [0.22, 1, 0.36, 1] },
                        })}
                  >
                    <PanelCopy h={h} />
                  </motion.div>
                ))}
              </div>

              {/* below md: one card at a time, the next rising over the last */}
              <HighlightDeck reduced={!!reduced} />
            </div>

            {/* bottom: closing statement + CTA */}
            <motion.div
              {...rise(0.5)}
              className="mt-9 hidden flex-col items-start gap-5 border-t pt-6 md:mt-10 md:flex md:flex-row md:items-center md:justify-between"
              style={{ borderColor: "rgba(155,82,55,0.28)" }}
            >
              <p className="text-[0.74rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#94432F" }}>
                The future of responsible urban living starts here.
              </p>
              <a
                href="#residences"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold transition-colors sm:w-auto sm:py-3"
                style={{ background: "#94432F", color: "#FAF6F0" }}
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


/**
 * The six highlights as a scroll-driven deck, below md only.
 *
 * One card holds the stage at a time; the next rises from the bottom and
 * covers it, so the set reads as a deck being dealt rather than a list. The
 * stage is a plain sticky element one viewport tall inside a dvh-sized
 * wrapper, so no height is invented by script and nothing is left blank when
 * the section ends. The CTA sits at the foot of the stage for the whole run
 * and leaves with the section.
 *
 * NOTE: this needs an unclipped ancestor chain — `overflow: hidden` anywhere
 * above silently disables position:sticky, which is exactly why an earlier
 * attempt rendered as a flat list.
 */
function HighlightDeck({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const n = HIGHLIGHTS.length;
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.32 });

  if (reduced) {
    return (
      <div className="grid gap-4 md:hidden">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="min-w-0 rounded-[12px] border p-[18px]" style={PANEL}>
            <PanelCopy h={h} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative md:hidden" style={{ height: `${n * 40}dvh` }}>
      <div className="sticky top-0 flex h-dvh flex-col pt-[4.5rem] pb-3">
        <div className="relative my-auto h-[22svh] max-h-[13rem] min-h-[9.5rem] w-full">
          {HIGHLIGHTS.map((h, i) => (
            <DeckCard key={h.title} h={h} i={i} n={n} p={p} />
          ))}
        </div>

        {/* the button stays at the foot for the whole run */}
        <div className="mt-4 shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] uppercase" style={{ color: "#94432F" }}>
            The future of responsible urban living starts here.
          </p>
          <a
            href="#residences"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-6 text-sm font-semibold"
            style={{ background: "#94432F", color: "#FAF6F0" }}
          >
            Explore the Residences
          </a>
        </div>
      </div>
    </div>
  );
}

/** One card: rises from below over the card before it, then holds. */
function DeckCard({
  h,
  i,
  n,
  p,
}: {
  h: (typeof HIGHLIGHTS)[number];
  i: number;
  n: number;
  p: MotionValue<number>;
}) {
  const seg = 1 / n;
  const from = (i - 1) * seg;
  const to = i * seg;
  const y = useTransform(p, [from, to], i === 0 ? ["0%", "0%"] : ["102%", "0%"]);
  /* the one underneath eases back a touch so the arrival reads as depth */
  const depth = useTransform(p, [to, to + seg], [0, 1]);
  const scale = useTransform(depth, [0, 1], [1, 0.965]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center overflow-hidden rounded-[16px] border px-5 py-4"
      style={{
        ...PANEL,
        background: "rgb(255 249 240)",
        boxShadow: "0 -14px 38px -20px rgba(90,45,25,0.5)",
        y,
        scale,
        zIndex: i + 1,
      }}
    >
      <PanelCopy h={h} />
    </motion.div>
  );
}

/** Reduced motion: the settled end-frame, fully readable, no pin. */
function StaticFrame() {
  return (
    <section
      id="glance"
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative flex min-h-svh items-center overflow-hidden bg-[#2B211D]"
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
        <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C99355] uppercase">
          {COPY.eyebrow}
        </p>
        <h2
          id="glance-heading"
          className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F5EDE3] text-balance"
        >
          {COPY.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[0.9rem] leading-relaxed font-light text-[#EEE1D3]/85">
          {COPY.body}
        </p>
        <p className="mt-8 text-[0.65rem] tracking-[0.26em] text-[#F5EDE3]/75 uppercase">
          {COPY.caption}
        </p>
      </div>
      <div className="relative bg-[#F5EDE3]">
        <ProjectIntroduction />
      </div>
    </section>
  );
}

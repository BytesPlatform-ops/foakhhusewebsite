"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import useIsMobile from "@/components/shared/useIsMobile";
import {
  cubicBezier,
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

/* Approved SEO copy, verbatim. These strings are immutable: no rewriting,
   shortening or punctuation normalisation. */
const COPY = {
  eyebrow: "01 — The Project",
  headline: "A New Residential Project in DHA City, Designed Around Nature",
  body: "A distinctive residential concept created for comfort, efficiency and future-ready living.",
  caption: "Umer Block · Abdullah Block — 12 storeys · 160 apartments · 8 duplex penthouses",
  closing: "The future of responsible urban living in DHA City starts here.",
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
    copy: "Spacious 1, 2 and 3 bedroom layouts designed around comfort and everyday needs.",
  },
  {
    title: "Renewable Energy",
    copy: "Wind turbines, solar panels and kite energy in one integrated strategy.",
  },
  {
    title: "Innovative Ventilation",
    copy: "A dedicated wind-catcher system that captures and channels natural airflow.",
  },
  {
    title: "Strategic Location",
    copy: "Within Karachi's wind corridor, adjacent to Shaukat Khanum Hospital.",
  },
];

/** The two opening paragraphs of the introduction, as the mobile scroll
 *  story reads them. Same words the sheet carries on desktop — held here so
 *  the story and the reduced-motion fallback cannot drift apart. */
const DECK_INTRO = [
  "Foakh Wind Corridor Enclave is an exclusive collection of apartments for sale in DHA City Karachi: a 12-storey development comprising Umer Block and Abdullah Block, with 160 carefully planned residences and eight duplex penthouses with independent swimming pools. The development brings together privacy, spacious living and a distinctive contemporary architectural identity.",
  "Most new projects in DHA City revolve around plots. Foakh is a ready-designed vertical community instead, where families can own a modern flat without the years of construction a plot demands. The project has been conceived around the intelligent use of natural resources: wind turbines, solar energy and kite energy form its renewable-energy strategy, while a dedicated wind-catcher system captures high-velocity natural air and directs it through the development.",
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

/** The energy story, stated as intent. No figure is claimed here, so no
 *  performance qualification has to travel with it. */
const SAVINGS_LEAD =
  "The project has been envisioned to support meaningful long-term energy efficiency.";

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
  const mobile = useIsMobile();
  const clip = useTransform(p, (v) => {
    if (mobile) {
      /* full-bleed until the very end, then one short seal */
      const m = Math.min(Math.max((v - 0.82) / 0.18, 0), 1);
      const em = m * m * (3 - 2 * m);
      const inset = em * 50;
      return `inset(${inset.toFixed(2)}% ${inset.toFixed(2)}% ${inset.toFixed(2)}% ${inset.toFixed(2)}% round ${(em * 10).toFixed(1)}px)`;
    }
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
      <div
        ref={pinRef}
        className="relative h-[215svh] lg:h-[290svh]"
        style={
          {
            "--stage-top": "calc(max(0.6rem, env(safe-area-inset-top)) + 4.9rem)",
            "--stage-gap": "0.75rem",
          } as React.CSSProperties
        }
      >
      {/* Stage ground is the page's stone — when the window contracts, the
          portal sits on the same surface the next section begins from, so
          the two stages and the following section read as one passage. */}
      <div
        className="sticky overflow-hidden rounded-[22px] lg:rounded-none"
        style={{
          top: "var(--stage-top)",
          height: "calc(100svh - var(--stage-top) - var(--stage-gap))",
        }}
      >
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

  /* The card zone's progress is owned here rather than inside the deck,
     because the pinned heading behind the cards needs it too: a position:
     sticky element parks at the end of its scope, which is exactly where the
     last card sits, so the heading is faded out before that can happen. Its
     scope ends with the zone, so it is already invisible when it parks. */
  const deckZoneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: deckRaw } = useScroll({
    target: deckZoneRef,
    offset: ["start start", "end end"],
  });
  const deckP = useSpring(deckRaw, { stiffness: 130, damping: 28, mass: 0.3 });
  const behindOpacity = useTransform(deckP, [0, 0.88, 0.99], [1, 1, 0]);

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
          /* No overflow clip below md: the card stage inside this sheet has to
             reach the full width of the phone. The outer wrapper still clips
             the page, so nothing can scroll sideways. */
          className="grain relative rounded-[8px] border p-5 sm:p-9 md:overflow-hidden lg:p-12"
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

          {/* ---------------- content, attached to the sheet ---------- */}
          <motion.div
            className="relative"
            style={
              {
                ...(reduced ? {} : { opacity: contentOpacity }),
                /* the phone's fixed edges, shared by the pinned heading and
                   the card stage so the two agree on where the free space is */
                "--deck-top": "calc(max(0.6rem, env(safe-area-inset-top)) + 5.15rem)",
                "--deck-cta": "calc(5.4rem + max(0.5rem, env(safe-area-inset-bottom)))",
                "--deck-card-h": "clamp(11.75rem, 30dvh, 15.5rem)",
              } as React.CSSProperties
            }
          >
            {/* Below md this wrapper is the stickiness scope: "Designed around
                nature" holds its place while the card zone scrolls, so the
                cards visibly pass OVER it — one heading, pinned, never a
                second copy. It fades out at the very end of the run, before
                sticky would park it on top of the last card. At md and up the
                wrapper vanishes and none of this applies. */}
            <div className="relative md:contents">
              <motion.div
                className={reduced ? undefined : "sticky top-(--deck-top) z-0 md:static"}
                style={reduced ? undefined : { opacity: behindOpacity }}
              >
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

                {/* Below md the introduction reads as ordinary section content —
                    the sheet must look completely normal until the card
                    sequence is actually reached. */}
                <div className="mt-8 md:hidden">
                  <p className="text-[0.88rem] leading-[1.65]" style={{ color: "#625750" }}>
                    {DECK_INTRO[0]}
                  </p>
                  <p className="mt-4 text-[0.88rem] leading-[1.65]" style={{ color: "#625750" }}>
                    {DECK_INTRO[1]}
                  </p>
                </div>
              </motion.div>

              <HighlightDeck reduced={!!reduced} zoneRef={deckZoneRef} p={deckP} />
            </div>

            <div className="mt-9 hidden gap-9 md:grid lg:mt-10 lg:grid-cols-[1.04fr_1fr] lg:gap-12">
              {/* left/centre: the introduction, on a readability wash */}
              {/* The wash exists to lift this copy off the elevation drawing
                  behind it. The drawing is desktop-only, so below lg the wash
                  is just a pale box with a 34px glow around it. */}
              <motion.div
                {...rise(0.08)}
                className="hidden rounded-md p-0 sm:p-5 md:block lg:bg-[rgba(247,236,222,0.82)] lg:shadow-[0_0_34px_22px_rgba(247,236,222,0.82)]"
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
                  Together, these systems are designed to enhance natural ventilation, moderate
                  heat gain and reduce reliance on conventional cooling and grid electricity.{" "}
                  {SAVINGS_LEAD}
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

            </div>

            {/* the energy story, as intent */}
            <div className="mt-10 md:hidden">
              <p className="text-[0.88rem] leading-[1.65]" style={{ color: "#625750" }}>
                Together, these systems are designed to enhance natural ventilation, moderate
                heat gain and reduce reliance on conventional cooling and grid electricity.
                {" "}{SAVINGS_LEAD}
              </p>
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
 * Below md: the six qualities as a centred scroll story.
 *
 * A single pinned stage one viewport tall holds the whole run. The
 * introduction reads first in the centre, then lifts away as the deck takes
 * the stage; from there each card rises from below and lands over the one
 * before it, the covered cards easing back in scale, opacity and focus so
 * the set reads as depth rather than a list. While the stage owns the
 * viewport a focus veil softens the page behind it; the veil is handed back
 * sharp before the neighbouring sections come into view.
 *
 * GEOMETRY — the card is centred between the two fixed edges of the phone,
 * never at a naive top:50%. `--deck-top` clears the floating header (its
 * 70px capsule plus the safe-area inset it is offset by) and `--deck-cta`
 * reserves the action bar plus the home indicator, so the content box is
 * what is genuinely free, on every device in the 320–430px range.
 *
 * SCROLL BUDGET — derived from the card count, never hardcoded: a short
 * lead-in for the first card plus a beat per card, with a short tail so the
 * last card can be read before the pin releases. The zone's own dvh height
 * IS the spacer, so it cannot outrun its content and leave a blank screen.
 *
 * WHERE IT LIVES — the zone stays inside the sheet, so the cards remain part
 * of the same "Designed around nature" story rather than becoming a separate
 * page. Only the STAGE inside it breaks out to the width of the phone, which
 * is what lets the veil cover the whole scene. The sheet's mobile overflow
 * clip is lifted for exactly this reason; the outer wrapper still clips the
 * page, so nothing can scroll sideways.
 *
 * NOTE: `overflow: hidden` on an ancestor silently disables position:sticky.
 * The sheet's clip is md-and-up only, so the mobile chain stays sticky-safe.
 */

/** Scroll budget in dvh: a short lead-in for the first card to rise and bring
 *  the veil up, then one beat per card. Note the pin consumes one viewport of
 *  this, so the scroll a thumb actually spends per card is seg × (total-100) —
 *  around 18dvh here, an unhurried but never sluggish pace. */
const DECK_LEAD_DVH = 30;
const DECK_CARD_DVH = 34;
/** a short hold after the last card lands, so it can be read before release */
const DECK_TAIL = 0.45;
/** the Apple easing curve — content arrives quickly, settles gently */
const APPLE_EASE = cubicBezier(0.25, 0.1, 0.25, 1);

function HighlightDeck({
  reduced,
  zoneRef,
  p,
}: {
  reduced: boolean;
  /* the zone element is measured by the parent, which drives both this deck
     and the pinned heading behind it from one scroll progress */
  zoneRef: React.RefObject<HTMLDivElement | null>;
  p: MotionValue<number>;
}) {
  const n = HIGHLIGHTS.length;

  /* beats: card 0 rises during the lead-in, the rest own one beat each */
  const beats = n - 1 + DECK_TAIL;
  const totalDvh = DECK_LEAD_DVH + beats * DECK_CARD_DVH;
  const leadEnd = DECK_LEAD_DVH / totalDvh;
  const seg = (1 - leadEnd) / beats;

  /* How far below the card's settled position it starts. Measured from the
     viewport, not guessed from the card, so the first card genuinely begins
     off the bottom EDGE of the phone rather than merely low on the screen. */
  const [travel, setTravel] = useState(640);
  useEffect(() => {
    const sync = () => setTravel(Math.round(window.innerHeight * 0.72));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /* The veil is absent until the sequence actually starts, so the sheet looks
     completely normal beforehand, and is handed back sharp before the next
     section arrives. */
  const veil = useTransform(p, [0, 0.1, 0.95, 1], [0, 1, 1, 0]);

  if (reduced) {
    /* no pin, no stacking, no blur — the same cards in plain reading order,
       with the action still at the end of the run */
    return (
      <div className="mt-8 md:hidden">
        <div className="grid gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="min-w-0 rounded-[18px] border p-[18px]" style={PANEL}>
              <PanelCopy h={h} />
            </div>
          ))}
        </div>
        <p
          className="mt-8 text-[0.68rem] font-semibold tracking-[0.22em] uppercase"
          style={{ color: "#94432F" }}
        >
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
    );
  }

  return (
    <div ref={zoneRef} className="relative mt-10 md:hidden" style={{ height: `${totalDvh}dvh` }}>
      {/* The stage breaks out of the sheet's padding to the full width of the
          phone — the zone stays inside the section, only the stage spans the
          viewport, so the veil can cover the whole scene behind it. */}
      {/* The geometry vars are inherited from the content wrapper, so the
          pinned heading behind and this stage agree on the free space. */}
      <div
        className="sticky top-0 h-dvh"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      >
        {/* FOCUS VEIL — an Apple-style focus pass over the scene, not a modal
            scrim: blur plus a touch of desaturation and a warm cream wash, so
            the scene behind stays completely recognisable. It sits below the
            cards in paint order so it can never touch them, and inside the
            section's own stacking context so it can never reach the header. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: veil,
            backdropFilter: "blur(7px) saturate(0.94) brightness(1.02)",
            WebkitBackdropFilter: "blur(7px) saturate(0.94) brightness(1.02)",
            background: "rgba(245,237,227,0.22)",
          }}
        />

        {/* THE TRAVEL WINDOW — reaches from under the header all the way to
            the bottom EDGE of the phone, so a card is seen entering from the
            edge itself rather than appearing at some line part-way up the
            screen. The action bar sits above this and stays sharp, so a card
            in transit passes behind it and is never obscured once settled. */}
        {/* 20px, the top of the intended 16–20px range: the sheet's own border
            sits between 12.8px and 19.2px from the edge across 320–480, so a
            flat 16px let the cards and the action bar run out past it. */}
        <div
          className="absolute inset-x-5 z-10 overflow-hidden"
          style={{ top: "var(--deck-top)", bottom: 0 }}
        >
          {/* THE SETTLED BOX — centred in the space the phone genuinely
              leaves free between the header and the action bar, which is not
              the same as the travel window and is never a naive top:50%. */}
          <div
            className="absolute inset-x-0"
            style={{
              top: "calc((100dvh - var(--deck-top) - var(--deck-cta)) / 2)",
              height: "var(--deck-card-h)",
              marginTop: "calc(var(--deck-card-h) / -2)",
            }}
          >
            {HIGHLIGHTS.map((h, i) => (
              <DeckCard
                key={h.title}
                h={h}
                i={i}
                p={p}
                leadEnd={leadEnd}
                seg={seg}
                travel={travel}
              />
            ))}
          </div>
        </div>

        {/* THE ACTION BAR — sharp, above the veil, pinned with the stage so it
            is present for the whole run and leaves with it. Never fixed, so it
            cannot leak past this section. */}
        <div className="absolute inset-x-5 bottom-0 z-20 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <p
            className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "#94432F" }}
          >
            The future of responsible urban living starts here.
          </p>
          <a
            href="#residences"
            className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center rounded-[14px] px-6 text-sm font-semibold shadow-[0_10px_26px_-14px_rgba(90,45,25,0.75)]"
            style={{ background: "#94432F", color: "#FAF6F0" }}
          >
            Explore the Residences
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * One card: rises from the bottom edge of the phone, settles at the optical
 * centre, then eases back as the next lands over it. The rise and the depth
 * live on separate elements because both are translateY.
 *
 * The card surface itself is never blurred or made translucent — the blur
 * belongs to the scene behind, so type, border and shadow stay crisp.
 */
function DeckCard({
  h,
  i,
  p,
  leadEnd,
  seg,
  travel,
}: {
  h: (typeof HIGHLIGHTS)[number];
  i: number;
  p: MotionValue<number>;
  leadEnd: number;
  seg: number;
  travel: number;
}) {
  /* card 0 rises through the lead-in; card i lands by leadEnd + i*seg */
  const from = i === 0 ? 0 : leadEnd + (i - 1) * seg;
  const to = i === 0 ? leadEnd : leadEnd + i * seg;
  const y = useTransform(p, [from, to], [travel, 0], { ease: APPLE_EASE });

  /* how many cards have since landed on top of this one */
  const depth = useTransform(p, (v) => {
    const d = (v - to) / seg;
    return d < 0 ? 0 : d > 2.4 ? 2.4 : d;
  });
  const lift = useTransform(depth, [0, 1, 2], [0, -12, -21]);
  const scale = useTransform(depth, [0, 1, 2], [1, 0.972, 0.948]);
  const opacity = useTransform(depth, [0, 1, 2, 2.4], [1, 0.62, 0.2, 0]);
  const blur = useTransform(depth, [0, 1, 2], ["blur(0px)", "blur(1.6px)", "blur(3px)"]);

  return (
    <motion.div className="absolute inset-0" style={{ y, zIndex: i + 1 }}>
      <motion.div
        className="flex h-full flex-col justify-center rounded-[18px] border px-5 py-5"
        style={{
          ...PANEL,
          background: "rgb(255 249 240)",
          borderColor: "rgba(155,82,55,0.28)",
          boxShadow:
            "0 -2px 1px rgba(255,255,255,0.7) inset, 0 18px 44px -22px rgba(90,45,25,0.55)",
          y: lift,
          scale,
          opacity,
          filter: blur,
        }}
      >
        <PanelCopy h={h} />
      </motion.div>
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

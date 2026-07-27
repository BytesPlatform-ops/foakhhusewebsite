"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 03 — Natural Systems: "NATURAL SYSTEMS BECOME LIVING SPACE."
 *
 * Editorial sticky spread built on Normal-is-Boring's grammar (oversized
 * luxury serif with active/muted phrases, photographic frames overlapping
 * one another across generous negative space, a thin vertical chapter
 * rail) with MONOLOG's interrupting frame and Capitolium's diagonal
 * choreography. Original composition; media are graded stills from the
 * client's film.
 *
 * Narrative: WIND -> CAPTURE -> CIRCULATION -> SOLAR SUPPORT ->
 * EVERYDAY COMFORT. Imagery travels outside -> system -> energy ->
 * human comfort. Every frame has an independent outer aperture
 * (size / position / clip-path) and inner media (scale / overlay) layer.
 * Five states across 250svh; native scroll; settles readable.
 */

const INK = "#171311";

/** vertical rail chapters with their active progress windows */
const RAIL = [
  { label: "Capture", range: [0.2, 0.33] as const },
  { label: "Channel", range: [0.33, 0.45] as const },
  { label: "Power", range: [0.45, 0.68] as const },
  { label: "Live", range: [0.68, 1.01] as const },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.35 });

  /* ================ typography: active phrase sequence ================= */
  const naturalOpacity = useTransform(p, [0, 0.2, 0.3], [1, 1, 0.14]);
  const naturalX = useTransform(p, [0.2, 0.45], ["0vw", "-3vw"]);
  const forceOpacity = useTransform(p, [0, 0.2, 0.3], [1, 1, 0.14]);

  // WIND / AND / SUNLIGHT — sequential actives (state 3)
  const windColOpacity = useTransform(p, [0.42, 0.47, 0.66, 0.72], [0, 1, 1, 0]);
  const windOp = useTransform(p, [0.45, 0.47, 0.53, 0.55], [0.16, 1, 1, 0.16]);
  const andOp = useTransform(p, [0.53, 0.55, 0.59, 0.61], [0.16, 1, 1, 0.16]);
  const sunOp = useTransform(p, [0.59, 0.61, 0.68, 0.7], [0.16, 1, 1, 0.16]);

  const everydayOpacity = useTransform(p, [0.6, 0.68, 1], [0.12, 0.12, 0.5]);
  const comfortOpacity = useTransform(p, [0.6, 0.68, 1], [0.12, 1, 1]);
  const comfortY = useTransform(p, [0.68, 0.9], ["0vh", "-2vh"]);
  const sliceOpacity = useTransform(p, [0.74, 0.82], [0, 1]);

  /* ================ Frame One — exterior, already open ================= */
  const f1W = useTransform(p, [0.2, 0.45, 0.68], ["27vw", "27vw", "20vw"]);
  const f1H = useTransform(p, [0.2, 0.45, 0.68], ["78vh", "66vh", "28vh"]);
  const f1X = useTransform(p, [0.45, 0.68], ["0vw", "-6vw"]);
  const f1Y = useTransform(p, [0.45, 0.68], ["0vh", "-14vh"]);
  const f1InnerScale = useTransform(p, [0, 0.45, 0.68], [1.12, 1.04, 1.14]);
  const f1Shade = useTransform(p, [0, 0.4], [0.22, 0.1]);

  /* ================ Frame Two — corridor opens from centre ============= */
  const f2Clip = useTransform(p, (v) => {
    // opens horizontally from a slit [0.2, 0.42]
    const t = Math.min(Math.max((v - 0.2) / 0.22, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    const side = 42 - e * 42;
    // partially closes again in state 4 [0.68, 0.84]
    const t2 = Math.min(Math.max((v - 0.68) / 0.16, 0), 1);
    const e2 = 1 - Math.pow(1 - t2, 2);
    const side2 = side + e2 * 16;
    const top2 = e2 * 10;
    return `inset(${top2}% ${side2}% ${top2}% ${side2}% round 5px)`;
  });
  const f2W = useTransform(p, [0.2, 0.42, 0.68], ["13vw", "45vw", "40vw"]);
  const f2H = useTransform(p, [0.2, 0.42, 0.68], ["38vh", "54vh", "48vh"]);
  const f2X = useTransform(p, [0.42, 0.68, 0.86], ["0vw", "-4vw", "-5vw"]);
  const f2Y = useTransform(p, [0.68, 0.86], ["0vh", "-8vh"]);
  const f2InnerScale = useTransform(p, [0.2, 0.42, 0.68], [1.35, 1.05, 1.1]);
  const f2Shade = useTransform(p, [0.2, 0.4], [0.3, 0.08]);

  /* ================ Frame Three — solar slit -> comfort ================ */
  const f3Opacity = useTransform(p, [0.45, 0.48], [0, 1]);
  const f3Clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.45) / 0.16, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    return `inset(${86 - e * 86}% 0% 0% 0% round 5px)`; // opens from bottom
  });
  const f3W = useTransform(p, [0.45, 0.68, 0.87], ["33vw", "38vw", "40vw"]);
  const f3H = useTransform(p, [0.45, 0.68, 0.87], ["40vh", "48vh", "52vh"]);
  const f3X = useTransform(p, [0.68, 0.87], ["0vw", "-3vw"]);
  const f3Y = useTransform(p, [0.68, 0.87], ["0vh", "-4vh"]);
  const f3InnerScale = useTransform(p, [0.45, 0.68], [1.2, 1.05]);
  // masked transition: solar -> comfort via an internal wipe
  const comfortWipe = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.7) / 0.14, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    return `inset(0% 0% 0% ${100 - e * 100}%)`;
  });
  // one champagne energy line across the solar frame
  const energyScale = useTransform(p, [0.52, 0.62], [0, 1]);
  const energyOpacity = useTransform(p, [0.52, 0.56, 0.64, 0.68], [0, 0.9, 0.9, 0]);

  /* ================ connective tissue ================================= */
  const tealDraw = useTransform(p, [0.24, 0.4], [0, 1]);
  const tealOpacity = useTransform(p, [0.24, 0.28, 0.6, 0.66], [0, 0.7, 0.7, 0]);
  const microOpacity = useTransform(p, [0.26, 0.32, 0.42, 0.46], [0, 1, 1, 0]);
  const copyOpacity = useTransform(p, [0.7, 0.8, 0.87, 0.94], [0, 0.4, 0.4, 1]);
  const ctaOpacity = useTransform(p, [0.9, 0.97], [0, 1]);
  const railDotTop = useTransform(p, [0.2, 1], ["24%", "72%"]);

  if (reduced) return <StaticSpread />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[225svh] lg:h-[250svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#EFE4D2]">
        <MineralGround />
        <div className="grain absolute inset-0" aria-hidden="true" />

        {/* eyebrow + accessible heading */}
        <p className="absolute top-[5%] left-[8%] z-40 text-[0.62rem] font-medium tracking-[0.3em] text-[#945C43] uppercase lg:left-[7.5rem]">
          03 — Natural Systems
        </p>
        <h2 id="route-heading" className="sr-only">
          From natural force to everyday comfort
        </h2>

        {/* ---------- vertical chapter rail (this section only) ---------- */}
        <div className="absolute inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col items-center justify-center gap-10 border-r border-[#171311]/10 bg-[#F7F1E7]/85 lg:flex">
          {RAIL.map((r) => (
            <RailLabel key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#945C43]"
            style={{ top: railDotTop }}
          />
        </div>
        {/* mobile: compact progress label */}
        <div className="absolute top-[5%] right-[5%] z-40 lg:hidden">
          {RAIL.map((r, i) => (
            <MobileRailLabel key={r.label} label={r.label} index={i} range={r.range} progress={p} />
          ))}
        </div>

        {/* ------------------- oversized typography ---------------------- */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute top-[9%] left-[8%] z-10 leading-[0.98] font-medium lg:left-[8rem]"
          style={{ color: INK, opacity: naturalOpacity, x: naturalX }}
        >
          <span className="block text-[clamp(2rem,5vw,4.6rem)]">FROM</span>
          <span className="block text-[clamp(2.6rem,7.2vw,6.6rem)]">NATURAL</span>
        </motion.p>
        <motion.p
          aria-hidden="true"
          className="font-display absolute top-[42%] left-[8%] z-10 text-[clamp(2.6rem,7.2vw,6.6rem)] leading-none font-medium lg:left-[8rem]"
          style={{ color: INK, opacity: forceOpacity }}
        >
          FORCE
        </motion.p>

        {/* WIND / AND / SUNLIGHT column (state 3) */}
        <motion.div
          aria-hidden="true"
          className="font-display absolute top-[12%] right-[6%] z-10 text-right leading-[1.02] font-medium"
          style={{ opacity: windColOpacity }}
        >
          <motion.span className="block text-[clamp(2.2rem,5.6vw,5.2rem)]" style={{ color: INK, opacity: windOp }}>
            WIND
          </motion.span>
          <motion.span className="block text-[clamp(1.6rem,3.6vw,3.2rem)]" style={{ color: INK, opacity: andOp }}>
            AND
          </motion.span>
          <motion.span className="block text-[clamp(2.2rem,5.6vw,5.2rem)]" style={{ color: INK, opacity: sunOp }}>
            SUNLIGHT
          </motion.span>
        </motion.div>

        {/* TO EVERYDAY / COMFORT. */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute right-[8%] bottom-[30%] z-10 text-right text-[clamp(1.8rem,4.4vw,4rem)] leading-none font-medium"
          style={{ color: INK, opacity: everydayOpacity }}
        >
          TO EVERYDAY
        </motion.p>
        <motion.p
          aria-hidden="true"
          className="font-display absolute right-[6%] bottom-[13%] z-10 text-[clamp(3rem,8.6vw,8rem)] leading-none font-medium"
          style={{ color: INK, opacity: comfortOpacity, y: comfortY }}
        >
          COMFORT.
        </motion.p>
        {/* foreground slice of COMFORT. passing in front of Frame Three */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute right-[6%] bottom-[13%] z-30 text-[clamp(3rem,8.6vw,8rem)] leading-none font-medium"
          style={{ color: INK, opacity: sliceOpacity, y: comfortY, clipPath: "inset(0 55% 0 0)" }}
        >
          COMFORT.
        </motion.p>

        {/* --------------------- Frame One: exterior --------------------- */}
        <motion.figure
          className="absolute top-[6%] left-[10%] z-20 lg:left-[9rem]"
          style={{ width: f1W, height: f1H, x: f1X, y: f1Y }}
        >
          <motion.div className="absolute inset-0 overflow-hidden rounded-[5px]">
            <motion.div className="absolute inset-0" style={{ scale: f1InnerScale }}>
              <Image
                src="/route-exterior.jpg"
                alt="Rooftop solar array and wind systems above the landscape at first light"
                fill
                sizes="28vw"
                className="object-cover"
                style={{ objectPosition: "38% 45%" }}
              />
            </motion.div>
            <motion.span aria-hidden="true" className="absolute inset-0 bg-[#171311]" style={{ opacity: f1Shade }} />
          </motion.div>
        </motion.figure>

        {/* ------------------ Frame Two: the corridor -------------------- */}
        <motion.figure
          className="absolute top-[24%] left-[38%] z-20"
          style={{ width: f2W, height: f2H, x: f2X, y: f2Y, clipPath: f2Clip }}
        >
          <motion.div className="absolute inset-0" style={{ scale: f2InnerScale }}>
            <Image
              src="/route-corridor.jpg"
              alt="Warm residential corridor in one-point perspective, air moving toward the light"
              fill
              sizes="46vw"
              className="object-cover"
              style={{ objectPosition: "50% 45%" }}
            />
          </motion.div>
          <motion.span aria-hidden="true" className="absolute inset-0 bg-[#171311]" style={{ opacity: f2Shade }} />
        </motion.figure>

        {/* ------------- Frame Three: solar -> comfort wipe -------------- */}
        <motion.figure
          className="absolute right-[7%] bottom-[10%] z-20"
          style={{ width: f3W, height: f3H, x: f3X, y: f3Y, clipPath: f3Clip, opacity: f3Opacity }}
        >
          <motion.div className="absolute inset-0" style={{ scale: f3InnerScale }}>
            <Image
              src="/route-solar.jpg"
              alt="Solar panels catching low sunlight on the rooftop"
              fill
              sizes="40vw"
              className="object-cover"
              style={{ objectPosition: "50% 50%" }}
            />
          </motion.div>
          {/* comfort image wipes across inside the same aperture */}
          <motion.div className="absolute inset-0" style={{ clipPath: comfortWipe }}>
            <Image
              src="/route-comfort.jpg"
              alt="Residents greeting in the warm sheltered parking court"
              fill
              sizes="40vw"
              className="object-cover"
              style={{ objectPosition: "50% 40%" }}
            />
          </motion.div>
          {/* single champagne energy line */}
          <motion.span
            aria-hidden="true"
            className="absolute top-[38%] left-0 h-[2px] w-full origin-left bg-gradient-to-r from-transparent via-[#CAA15C] to-transparent"
            style={{ scaleX: energyScale, opacity: energyOpacity }}
          />
        </motion.figure>

        {/* fine teal line connecting the frames (state 2) */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-[25] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M 24 46 C 34 44, 40 50, 50 48 C 60 46, 66 56, 74 62"
            fill="none"
            stroke="#397F82"
            strokeWidth="0.22"
            style={{ pathLength: tealDraw, opacity: tealOpacity }}
          />
        </svg>

        {/* state-2 microcopy */}
        <motion.p
          className="absolute bottom-[16%] left-[10%] z-30 max-w-56 text-[0.72rem] leading-relaxed text-[#171311]/70 lg:left-[9rem]"
          style={{ opacity: microOpacity }}
        >
          Natural airflow is captured and guided through the development.
        </motion.p>

        {/* ------------------ final copy + CTA (once) -------------------- */}
        <motion.div className="absolute bottom-[7%] left-[10%] z-40 max-w-xs lg:left-[9rem]" style={{ opacity: copyOpacity }}>
          <p className="font-display text-xl leading-snug font-medium text-[#171311] md:text-2xl">
            From natural force to everyday comfort.
          </p>
          <p className="mt-2.5 text-[0.82rem] leading-relaxed text-[#171311]/75">
            See how wind, sunlight and thoughtful planning are brought together across the
            development.
          </p>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-[#171311]/60">
            Natural airflow, renewable-energy planning and modern family living in one carefully
            considered development.
          </p>
          <motion.a
            href="#wind"
            style={{ opacity: ctaOpacity }}
            className="pointer-events-auto mt-4 inline-block rounded-lg border border-[#945C43]/50 px-5 py-2.5 text-sm font-medium text-[#171311] transition-colors hover:bg-[#945C43] hover:text-[#F7F1E7]"
          >
            Explore Natural Systems
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- helpers -- */

function RailLabel({
  label,
  range,
  progress,
}: {
  label: string;
  range: readonly [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.03, a, b, b + 0.03], [0.28, 1, 1, 0.28]);
  return (
    <motion.span
      className="text-[0.6rem] font-medium tracking-[0.3em] text-[#171311] uppercase"
      style={{ opacity, writingMode: "vertical-rl", rotate: 180 }}
    >
      {label}
    </motion.span>
  );
}

function MobileRailLabel({
  label,
  index,
  range,
  progress,
}: {
  label: string;
  index: number;
  range: readonly [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.02, a, b, b + 0.02], [0, 1, 1, 0]);
  return (
    <motion.span
      className="absolute top-0 right-0 text-[0.6rem] font-medium tracking-[0.22em] whitespace-nowrap text-[#171311]/80 uppercase"
      style={{ opacity }}
    >
      0{index + 1} / 04 — {label}
    </motion.span>
  );
}

/** near-invisible mineral marks + faint architectural lines */
function MineralGround() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
      <filter id="rt-marks">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.0055" numOctaves="2" seed="9" />
        <feColorMatrix values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 -1.15 1.06" />
      </filter>
      <rect width="100%" height="100%" filter="url(#rt-marks)" opacity="0.05" />
      <line x1="18%" y1="0" x2="18%" y2="100%" stroke="#171311" strokeWidth="1" opacity="0.04" />
      <line x1="0" y1="62%" x2="100%" y2="62%" stroke="#171311" strokeWidth="1" opacity="0.04" />
    </svg>
  );
}

/** Reduced motion: composed static spread. */
function StaticSpread() {
  return (
    <section
      id="route"
      data-section="route"
      aria-labelledby="route-heading"
      className="relative overflow-hidden bg-[#EFE4D2] py-24"
    >
      <MineralGround />
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-medium tracking-[0.3em] text-[#945C43] uppercase">
          03 — Natural Systems
        </p>
        <h2
          id="route-heading"
          className="font-display mt-6 max-w-[15ch] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.02] font-medium text-[#171311]"
        >
          From natural force to everyday comfort.
        </h2>
        <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-[#171311]/75">
          See how wind, sunlight and thoughtful planning are brought together across the
          development.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { src: "/route-exterior.jpg", alt: "Rooftop systems above the landscape", cap: "Capture" },
            { src: "/route-corridor.jpg", alt: "Warm residential corridor", cap: "Channel" },
            { src: "/route-comfort.jpg", alt: "Residents in the sheltered court", cap: "Live" },
          ].map((f) => (
            <figure key={f.src}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image src={f.src} alt={f.alt} fill sizes="33vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.6rem] tracking-[0.24em] text-[#171311]/70 uppercase">
                {f.cap}
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href="#wind"
          className="mt-8 inline-block rounded-lg border border-[#945C43]/50 px-5 py-2.5 text-sm font-medium text-[#171311] transition-colors hover:bg-[#945C43] hover:text-[#F7F1E7]"
        >
          Explore Natural Systems
        </a>
      </div>
    </section>
  );
}

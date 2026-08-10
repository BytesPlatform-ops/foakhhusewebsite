"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 01 — Project Vision: "THE BUILDING BREATHES."
 *
 * An editorial sticky composition translating MONOLOG (oversized serif
 * interrupted by a small central frame, active/muted words, text passing
 * around imagery) and Collab Capitolium (cream canvas, framed
 * architectural imagery repositioning diagonally, frames opening and
 * closing like architectural apertures) into an original Wind Corridor
 * spread.
 *
 * Every frame has TWO independent layers: the OUTER aperture (width /
 * height / x / y / clip-path) and the INNER media (scale, position,
 * overlay). Openings are aperture animations — never a bare image scale.
 * Choreography travels upper-left -> centre -> lower-right per the
 * supplied sketch. Media are graded stills from the client's film.
 *
 * Five states across a 250svh section; native scroll; settles into a
 * readable spread before unpinning.
 */

const INK = "#241B17";

export default function DesignedAroundNature() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 115, damping: 28, mass: 0.35 });

  /* ================= typography choreography ========================== */
  // Active window per line; muted otherwise. Diagonal drift overall.
  const l1Opacity = useTransform(p, [0, 0.18, 0.3], [1, 1, 0.16]);
  const l1X = useTransform(p, [0.18, 0.45], ["0vw", "-4vw"]);
  const l1Y = useTransform(p, [0.18, 0.45], ["0vh", "-3vh"]);

  const l2Opacity = useTransform(p, [0.12, 0.18, 0.42, 0.52], [0.16, 1, 1, 0.16]);
  const l2X = useTransform(p, [0.42, 0.68], ["0vw", "-3vw"]);

  const l3Opacity = useTransform(p, [0.36, 0.42, 0.68, 0.76], [0.16, 1, 1, 0.16]);
  const l3X = useTransform(p, [0.42, 0.68], ["0vw", "2.5vw"]);

  const l4Opacity = useTransform(p, [0.6, 0.68, 1], [0.14, 1, 1]);
  const l4Y = useTransform(p, [0.68, 0.9], ["0vh", "-2vh"]);
  // foreground slice of the dominant word passing IN FRONT of Frame Two —
  // it rides the SAME vertical path as the base word so the two copies
  // stay perfectly registered (no doubled letters).
  const sliceOpacity = useTransform(p, [0.72, 0.8], [0, 1]);

  /* ================= Frame One — the interrupting aperture ============ */
  // Opens horizontally from centre; then shrinks and travels upper-left.
  const f1W = useTransform(p, [0, 0.18, 0.42, 0.68], ["13vw", "13vw", "44vw", "22vw"]);
  const f1H = useTransform(p, [0, 0.18, 0.42, 0.68], ["31vh", "31vh", "54vh", "28vh"]);
  const f1X = useTransform(p, [0.42, 0.68], ["0vw", "-30vw"]);
  const f1Y = useTransform(p, [0.42, 0.68], ["0vh", "-22vh"]);
  const f1Clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.18) / 0.16, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    const inset = 38 - e * 38; // 38% -> 0%
    return `inset(0% ${inset}% 0% ${inset}% round 6px)`;
  });
  const f1InnerScale = useTransform(p, [0.18, 0.42, 0.68], [1.4, 1.08, 1.16]);
  const f1InnerY = useTransform(p, [0.42, 0.68], ["0%", "-6%"]);
  const f1Shade = useTransform(p, [0.18, 0.42], [0.34, 0.12]);

  /* ================= Frame Two — the environment opens ================ */
  // Opens vertically from the bottom (lower-right), becomes dominant,
  // then tightens slightly as Frame Three reveals.
  const f2Opacity = useTransform(p, [0.42, 0.46], [0, 1]);
  const f2W = useTransform(p, [0.45, 0.68, 0.86], ["34vw", "38vw", "36vw"]);
  const f2H = useTransform(p, [0.45, 0.68, 0.86], ["44vh", "50vh", "42vh"]);
  const f2X = useTransform(p, [0.68, 0.9], ["0vw", "-4vw"]);
  const f2Y = useTransform(p, [0.68, 0.9], ["0vh", "-10vh"]);
  const f2Clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.45) / 0.17, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    const bottomIn = 88 - e * 88; // slit -> open (from bottom)
    // gentle later tightening at the sides
    const t2 = Math.min(Math.max((v - 0.68) / 0.18, 0), 1);
    const side = t2 * 4;
    return `inset(${bottomIn}% ${side}% 0% ${side}% round 6px)`;
  });
  const f2InnerScale = useTransform(p, [0.45, 0.68, 1], [1.22, 1.05, 1.09]);
  const f2Shade = useTransform(p, [0.45, 0.62], [0.3, 0.1]);

  /* ================= Frame Three — the compact system detail ========== */
  const f3Opacity = useTransform(p, [0.68, 0.72], [0, 1]);
  const f3Clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.68) / 0.14, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    return `inset(${50 - e * 50}% 0% 0% ${50 - e * 50}% round 6px)`; // diagonal
  });
  const f3InnerScale = useTransform(p, [0.68, 0.86], [1.25, 1.05]);

  /* ================= labels + copy + progress ========================= */
  const labelsOpacity = useTransform(p, [0.7, 0.8], [0, 1]);
  const copyOpacity = useTransform(p, [0.7, 0.8], [0, 1]);
  const ctaOpacity = useTransform(p, [0.88, 0.96], [0, 1]);
  const progressX = useTransform(p, [0, 1], [0, 1]);

  if (reduced) return <StaticSpread />;

  return (
    <section
      id="nature"
      ref={sectionRef}
      data-section="nature"
      aria-labelledby="nature-heading"
      className="relative h-[220svh] lg:h-[250svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <MineralMarks />
        <div className="grain absolute inset-0" aria-hidden="true" />

        {/* eyebrow */}
        <p className="absolute top-[5%] left-[5%] z-40 text-[0.62rem] font-medium tracking-[0.3em] text-[#9A5D43] uppercase">
          01 — Project Vision
        </p>

        {/* accessible heading for the whole composition */}
        <h2 id="nature-heading" className="sr-only">
          Designed around how you live
        </h2>

        {/* ---------------- oversized heading, four fragments ------------ */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute top-[11%] left-[6%] z-10 text-[clamp(2.4rem,6.6vw,6rem)] leading-none font-medium"
          style={{ color: INK, opacity: l1Opacity, x: l1X, y: l1Y }}
        >
          DESIGNED
        </motion.p>
        <motion.p
          aria-hidden="true"
          className="font-display absolute top-[24%] left-[6%] z-10 text-[clamp(2.4rem,6.6vw,6rem)] leading-none font-medium"
          style={{ color: INK, opacity: l2Opacity, x: l2X }}
        >
          AROUND
        </motion.p>
        <motion.p
          aria-hidden="true"
          className="font-display absolute top-[46%] right-[8%] z-10 text-right text-[clamp(2.4rem,6.6vw,6rem)] leading-none font-medium"
          style={{ color: INK, opacity: l3Opacity, x: l3X }}
        >
          HOW YOU
        </motion.p>
        <motion.p
          aria-hidden="true"
          className="font-display absolute bottom-[26%] left-[6%] z-10 text-[clamp(2.4rem,6.6vw,6rem)] leading-none font-medium"
          style={{ color: INK, opacity: l4Opacity, y: l4Y }}
        >
          LIVE.
        </motion.p>
        {/* foreground slice of the dominant word, in front of Frame Two */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute bottom-[26%] left-[6%] z-30 text-[clamp(2.4rem,6.6vw,6rem)] leading-none font-medium"
          style={{
            color: INK,
            opacity: sliceOpacity,
            y: l4Y,
            clipPath: "inset(0 0 0 45%)",
          }}
        >
          LIVE.
        </motion.p>

        {/* ---------------- Frame One: interrupting aperture ------------- */}
        <motion.figure
          className="absolute top-[20%] left-1/2 z-20 -translate-x-1/2"
          style={{ width: f1W, height: f1H, x: f1X, y: f1Y, clipPath: f1Clip }}
        >
          <motion.div className="absolute inset-0" style={{ scale: f1InnerScale, y: f1InnerY }}>
            <Image
              src="/buildingtop.jpg"
              alt="Natural airflow drawn through a terracotta opening of the development"
              fill
              sizes="44vw"
              className="object-cover"
              style={{ objectPosition: "62% 45%" }}
            />
          </motion.div>
          <motion.span aria-hidden="true" className="absolute inset-0 bg-[#241B17]" style={{ opacity: f1Shade }} />
        </motion.figure>

        {/* ---------------- Frame Two: environment context --------------- */}
        <motion.figure
          className="absolute right-[7%] bottom-[13%] z-20"
          style={{ width: f2W, height: f2H, x: f2X, y: f2Y, clipPath: f2Clip, opacity: f2Opacity }}
        >
          <motion.div className="absolute inset-0" style={{ scale: f2InnerScale }}>
            <Image
              src="/foakhshaukat.jpg"
              alt="The two-block development within its green landscape at dawn"
              fill
              sizes="40vw"
              className="object-cover"
              style={{ objectPosition: "58% 40%" }}
            />
          </motion.div>
          <motion.span aria-hidden="true" className="absolute inset-0 bg-[#241B17]" style={{ opacity: f2Shade }} />
        </motion.figure>

        {/* ---------------- Frame Three: compact solar detail ------------ */}
        <motion.figure
          className="absolute top-[12%] right-[5%] z-20 h-[24vh] w-[17vw] min-w-40"
          style={{ clipPath: f3Clip, opacity: f3Opacity }}
        >
          <motion.div className="absolute inset-0" style={{ scale: f3InnerScale }}>
            <Image
              src="/buildingfront.jpg"
              alt="Rooftop solar panels catching first light"
              fill
              sizes="20vw"
              className="object-cover"
              style={{ objectPosition: "50% 55%" }}
            />
          </motion.div>
        </motion.figure>

        {/* ---------------- system labels with hairlines ------------------ */}
        <motion.div className="pointer-events-none absolute inset-0 z-30" style={{ opacity: labelsOpacity }}>
          <SystemLabel text="Natural airflow" x="26%" y="34%" lineTo="left" />
          <SystemLabel text="Renewable energy" x="71%" y="40%" lineTo="right" />
          <SystemLabel text="Water systems" x="10%" y="80%" lineTo="left" />
        </motion.div>

        {/* ---------------- supporting copy + CTA ------------------------ */}
        <motion.div className="absolute right-[6%] bottom-[7%] z-40 max-w-xs rounded-md border border-[#241B17]/10 bg-[#FFF8EF]/95 p-5 text-left shadow-[0_18px_44px_-28px_rgba(36,27,23,0.45)] backdrop-blur-sm lg:max-w-sm" style={{ opacity: copyOpacity }}>
          <p className="font-display text-xl leading-snug font-medium text-[#241B17] md:text-2xl">
            Architecture that responds to air, energy, water and everyday comfort.
          </p>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-[#241B17]/75 md:text-[0.9rem]">
            Natural airflow, renewable-energy planning, future-ready water systems and refined residential living — brought together in one considered development.
          </p>
          <motion.a
            href="#route"
            style={{ opacity: ctaOpacity }}
            className="pointer-events-auto mt-5 inline-block rounded-lg border border-[#9A5D43]/50 px-5 py-2.5 text-sm font-medium text-[#241B17] transition-colors hover:bg-[#9A5D43] hover:text-[#F7F0E8]"
          >
            Explore the Project
          </motion.a>
        </motion.div>

        {/* ---------------- chapter progress ------------------------------ */}
        <div className="absolute bottom-[5%] left-1/2 z-40 hidden -translate-x-1/2 items-center gap-3 lg:flex">
          <span className="text-[0.6rem] tracking-[0.24em] text-[#241B17]/50">02</span>
          <span className="relative h-px w-28 bg-[#241B17]/15">
            <motion.span
              className="absolute inset-y-0 left-0 w-full origin-left bg-[#9A5D43]"
              style={{ scaleX: progressX }}
            />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- helpers -- */

/** Fine label + hairline connecting toward its frame — never a card. */
function SystemLabel({
  text,
  x,
  y,
  lineTo,
}: {
  text: string;
  x: string;
  y: string;
  lineTo: "left" | "right";
}) {
  return (
    <span
      className={`absolute flex items-center gap-2.5 ${lineTo === "right" ? "flex-row-reverse" : ""}`}
      style={{ left: x, top: y }}
    >
      <span className="h-px w-12 bg-[#241B17]/40" />
      <span className="text-[0.6rem] font-medium tracking-[0.24em] whitespace-nowrap text-[#241B17]/80 uppercase">
        {text}
      </span>
    </span>
  );
}

/** Whisper-subtle mineral marks on the cream canvas (Capitolium ground). */
function MineralMarks() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.05]">
      <filter id="nm-marks">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.006" numOctaves="2" seed="14" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 -1.1 1.05" />
      </filter>
      <rect width="100%" height="100%" filter="url(#nm-marks)" />
    </svg>
  );
}

/** Reduced motion: the final composed spread, static and readable. */
function StaticSpread() {
  return (
    <section
      id="nature"
      data-section="nature"
      aria-labelledby="nature-heading"
      className="relative overflow-hidden bg-[#EFE3D0] py-24"
    >
      <MineralMarks />
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-40">
        <Image
          src="/building-outline-lines.png"
          alt=""
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-medium tracking-[0.3em] text-[#9A5D43] uppercase">
          01 — Project Vision
        </p>
        <h2
          id="nature-heading"
          className="font-display mt-6 max-w-[14ch] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.02] font-medium text-[#241B17]"
        >
          Designed around how you live.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { src: "/buildingtop.jpg", alt: "The rooftop wind catcher, kite and turbines above the terracotta crown", label: "Natural airflow" },
            { src: "/foakhshaukat.jpg", alt: "The development within its landscape at dusk", label: "Renewable energy" },
            { src: "/buildingfront.jpg", alt: "The two residential blocks in the evening light", label: "Water systems" },
          ].map((f) => (
            <figure key={f.src} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image src={f.src} alt={f.alt} fill sizes="33vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.6rem] tracking-[0.24em] text-[#241B17]/70 uppercase">
                {f.label}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 max-w-md text-[0.9rem] leading-relaxed text-[#241B17]/75">
          Natural airflow, renewable-energy planning, future-ready water systems and refined residential living — brought together in one considered development.
        </p>
        <a
          href="#route"
          className="mt-6 inline-block rounded-lg border border-[#9A5D43]/50 px-5 py-2.5 text-sm font-medium text-[#241B17] transition-colors hover:bg-[#9A5D43] hover:text-[#F7F0E8]"
        >
          Explore the Project
        </a>
      </div>
    </section>
  );
}

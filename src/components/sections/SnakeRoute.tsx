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
 * 03 — Natural Systems: a DIAGONAL HORIZONTAL scroll gallery.
 *
 * Native vertical scrolling drives a wide track that travels right AND
 * down the supplied sketch's diagonal (upper-left -> lower-right). Four
 * editorial panels ride the track — exterior force, corridor capture,
 * solar power, comfort + CTA — with oversized serif words overlapping
 * the photographic frames (words behind frames, slices in front). The
 * section-local vertical rail (CAPTURE / CHANNEL / POWER / LIVE) tracks
 * progress; frame media counter-drift slightly for depth.
 *
 * No wheel interception — the sticky stage only holds while the track
 * travels. Media are film stills, swap-ready by filename when approved
 * images arrive. Reduced motion renders the static spread.
 */

const INK = "#171311";

const RAIL = [
  { label: "Capture", range: [0.05, 0.3] as const },
  { label: "Channel", range: [0.3, 0.55] as const },
  { label: "Power", range: [0.55, 0.78] as const },
  { label: "Live", range: [0.78, 1.01] as const },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.35 });

  /* The diagonal travel: right AND down together. */
  const trackX = useTransform(p, [0.04, 0.9], ["0vw", "-168vw"]);
  const trackY = useTransform(p, [0.04, 0.9], ["0vh", "-54vh"]);

  /* subtle counter-drift inside frames for depth */
  const drift1 = useTransform(p, [0, 0.4], ["0%", "6%"]);
  const drift2 = useTransform(p, [0.15, 0.6], ["-4%", "4%"]);
  const drift3 = useTransform(p, [0.4, 0.85], ["-4%", "4%"]);
  const drift4 = useTransform(p, [0.6, 1], ["-5%", "3%"]);

  /* active word states along the journey */
  const wForce = useTransform(p, [0, 0.24, 0.34], [1, 1, 0.06]);
  const wCapture = useTransform(p, [0.22, 0.3, 0.5, 0.58], [0.07, 1, 1, 0.06]);
  const wSunlight = useTransform(p, [0.5, 0.58, 0.74, 0.82], [0.07, 1, 1, 0.05]);
  const wComfort = useTransform(p, [0.74, 0.82, 1], [0.07, 1, 1]);
  const energyScale = useTransform(p, [0.56, 0.68], [0, 1]);
  const energyOpacity = useTransform(p, [0.56, 0.6, 0.72, 0.76], [0, 0.9, 0.9, 0]);
  const ctaOpacity = useTransform(p, [0.84, 0.93], [0, 1]);
  const railDotTop = useTransform(p, [0.05, 1], ["24%", "72%"]);

  if (reduced) return <StaticSpread />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[300svh] lg:h-[340svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#EFE4D2]">
        <MineralGround />
        <div className="grain absolute inset-0" aria-hidden="true" />

        <p className="absolute top-[5%] left-[8%] z-40 text-[0.62rem] font-medium tracking-[0.3em] text-[#945C43] uppercase lg:left-[7.5rem]">
          03 — Natural Systems
        </p>
        <h2 id="route-heading" className="sr-only">
          From natural force to everyday comfort
        </h2>

        {/* section-local vertical rail */}
        <div className="absolute inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col items-center justify-center gap-10 border-r border-[#171311]/10 bg-[#F7F1E7]/85 lg:flex">
          {RAIL.map((r) => (
            <RailLabel key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#945C43]"
            style={{ top: railDotTop }}
          />
        </div>
        <div className="absolute top-[5%] right-[5%] z-40 lg:hidden">
          {RAIL.map((r, i) => (
            <MobileRailLabel key={r.label} label={r.label} index={i} range={r.range} progress={p} />
          ))}
        </div>

        {/* ==================== THE DIAGONAL TRACK ==================== */}
        <motion.div
          className="absolute top-0 left-0 h-[170svh] w-[260vw]"
          style={{ x: trackX, y: trackY }}
        >
          {/* faint diagonal guide line behind everything */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 260 170"
            preserveAspectRatio="none"
          >
            <path d="M 14 22 L 246 142" stroke="#171311" strokeWidth="0.08" opacity="0.25" />
          </svg>

          {/* -------- PANEL 1 · NATURAL FORCE (exterior) --------------- */}
          <div className="absolute top-[14svh] left-[8vw]">
            <figure className="relative h-[56svh] w-[34vw] min-w-72 overflow-hidden rounded-[5px]">
              <motion.div className="absolute inset-0" style={{ x: drift1 }}>
                <Image
                  src="/route-exterior.jpg"
                  alt="Rooftop solar array and wind systems above the landscape at first light"
                  fill
                  sizes="38vw"
                  className="scale-[1.15] object-cover"
                  style={{ objectPosition: "38% 45%" }}
                />
              </motion.div>
              <span aria-hidden="true" className="absolute inset-0 bg-[#171311]/12" />
            </figure>
            {/* overlapping giant words — crossing the frame's right edge */}
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[10%] left-[68%] z-10 leading-[0.98] font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wForce }}
            >
              <span className="block text-[clamp(1.6rem,3.6vw,3.2rem)]">FROM</span>
              <span className="block text-[clamp(2.2rem,5.6vw,5rem)]">NATURAL</span>
              <span className="block text-[clamp(2.2rem,5.6vw,5rem)]">FORCE</span>
            </motion.p>
            <p className="absolute top-[calc(100%+0.75rem)] left-0 w-56 text-[0.72rem] leading-relaxed text-[#171311]/70">
              High-velocity natural air reaches the development first.
            </p>
          </div>

          {/* -------- PANEL 2 · CAPTURE (corridor) --------------------- */}
          <div className="absolute top-[38svh] left-[68vw]">
            {/* word BEHIND the frame */}
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[-14%] left-[-18%] z-0 text-[clamp(3rem,8vw,7.4rem)] leading-none font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wCapture }}
            >
              CAPTURED
            </motion.p>
            <figure className="relative z-10 h-[58svh] w-[30vw] min-w-64 overflow-hidden rounded-[5px]">
              <motion.div className="absolute inset-0" style={{ x: drift2 }}>
                <Image
                  src="/route-corridor.jpg"
                  alt="Warm residential corridor in one-point perspective, air moving toward the light"
                  fill
                  sizes="34vw"
                  className="scale-[1.15] object-cover"
                  style={{ objectPosition: "50% 45%" }}
                />
              </motion.div>
            </figure>
            {/* slice of the same word IN FRONT of the frame */}
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[-14%] left-[-18%] z-20 text-[clamp(3rem,8vw,7.4rem)] leading-none font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wCapture, clipPath: "inset(0 0 0 72%)" }}
            >
              CAPTURED
            </motion.p>
            <p className="mt-3 max-w-52 text-[0.72rem] leading-relaxed text-[#171311]/70">
              Guided through corridors, lobbies and shared circulation.
            </p>
          </div>

          {/* -------- PANEL 3 · SUNLIGHT (solar) ----------------------- */}
          <div className="absolute top-[74svh] left-[128vw]">
            <figure className="relative h-[52svh] w-[36vw] min-w-72 overflow-hidden rounded-[5px]">
              <motion.div className="absolute inset-0" style={{ x: drift3 }}>
                <Image
                  src="/route-solar.jpg"
                  alt="Solar panels catching low sunlight on the rooftop"
                  fill
                  sizes="40vw"
                  className="scale-[1.15] object-cover"
                />
              </motion.div>
              <motion.span
                aria-hidden="true"
                className="absolute top-[42%] left-0 h-[2px] w-full origin-left bg-gradient-to-r from-transparent via-[#CAA15C] to-transparent"
                style={{ scaleX: energyScale, opacity: energyOpacity }}
              />
            </figure>
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[62%] left-[42%] z-20 leading-[0.95] font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wSunlight }}
            >
              <span className="block text-[clamp(1.8rem,4vw,3.6rem)]">WIND AND</span>
              <span className="block text-[clamp(2.8rem,7vw,6.4rem)]">SUNLIGHT</span>
            </motion.p>
            <p className="mt-3 max-w-52 text-[0.72rem] leading-relaxed text-[#171311]/70">
              Turbines and rooftop solar planned to work together.
            </p>
          </div>

          {/* -------- PANEL 4 · COMFORT + CTA -------------------------- */}
          <div className="absolute top-[96svh] left-[188vw] flex items-center gap-8">
            <div className="relative">
            {/* word behind, slice in front — same wrapper, same anchor */}
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[-0.55em] left-[-8%] z-0 text-[clamp(2.8rem,7.6vw,7rem)] leading-none font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wComfort }}
            >
              COMFORT.
            </motion.p>
            <figure className="relative z-10 h-[54svh] w-[38vw] min-w-80 overflow-hidden rounded-[5px]">
              <motion.div className="absolute inset-0" style={{ x: drift4 }}>
                <Image
                  src="/route-comfort.jpg"
                  alt="Residents greeting in the warm sheltered parking court"
                  fill
                  sizes="42vw"
                  className="scale-[1.15] object-cover"
                  style={{ objectPosition: "50% 40%" }}
                />
              </motion.div>
            </figure>
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[-0.55em] left-[-8%] z-20 text-[clamp(2.8rem,7.6vw,7rem)] leading-none font-medium whitespace-nowrap"
              style={{ color: INK, opacity: wComfort, clipPath: "inset(0 62% 0 0)" }}
            >
              COMFORT.
            </motion.p>
            </div>

            <motion.div className="w-72 shrink-0" style={{ opacity: ctaOpacity }}>
              <p className="font-display text-lg leading-snug font-medium text-[#171311] md:text-xl">
                From natural force to everyday comfort.
              </p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-[#171311]/70">
                Wind, sunlight and thoughtful planning brought together across one carefully
                considered development.
              </p>
              <a
                href="#wind"
                className="mt-4 inline-block rounded-lg bg-[#945C43] px-6 py-3 text-sm font-semibold text-[#F7F1E7] transition-colors hover:bg-[#171311]"
              >
                Explore Natural Systems
              </a>
            </motion.div>
          </div>
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

/** Reduced motion: composed static spread, no track. */
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
          className="mt-8 inline-block rounded-lg bg-[#945C43] px-6 py-3 text-sm font-semibold text-[#F7F1E7] transition-colors hover:bg-[#171311]"
        >
          Explore Natural Systems
        </a>
      </div>
    </section>
  );
}

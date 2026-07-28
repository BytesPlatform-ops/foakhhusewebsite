"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 03 — Natural Systems: a calm diagonal editorial journey.
 *
 * Rebuilt after review: the previous large film-still frames, diagonal
 * guide line and teal connector are removed. Each of the four panels is
 * now a SELF-CONTAINED composition — a small primary image container, a
 * tiny offset companion container, one giant serif word crossing the
 * container's top edge, and a short caption — all anchored panel-locally
 * (em/% of the panel, never viewport units), so nothing can drift into
 * collisions on wider or shorter screens. Containers are styled
 * placeholders awaiting the client's images; drop a file and wire its
 * name into PANELS to fill a slot.
 *
 * Native vertical scroll glides the track right and down the diagonal.
 * Panels are spaced so one or two are always composing the frame. The
 * final panel carries the copy and CTA. Reduced motion renders a static
 * spread.
 */

const INK = "#171311";

interface Panel {
  word: string;
  caption: string;
  /** placeholder tones for the two containers */
  tonePrimary: string;
  toneSmall: string;
  /** optional media — filename in /public once the client supplies it */
  src?: string;
}

const PANELS: Panel[] = [
  {
    word: "FORCE",
    caption: "High-velocity natural air reaches the development first.",
    tonePrimary: "#E2D3BC",
    toneSmall: "#CBCFC1",
  },
  {
    word: "CAPTURED",
    caption: "Guided through corridors, lobbies and shared circulation.",
    tonePrimary: "#DCC5B0",
    toneSmall: "#E2D3BC",
  },
  {
    word: "SUNLIGHT",
    caption: "Turbines and rooftop solar planned to work together.",
    tonePrimary: "#CBCFC1",
    toneSmall: "#DCC5B0",
  },
  {
    word: "COMFORT.",
    caption: "Wind, sunlight and thoughtful planning brought together across one carefully considered development.",
    tonePrimary: "#E2D3BC",
    toneSmall: "#CBCFC1",
  },
];

const RAIL = [
  { label: "Capture", range: [0.04, 0.26] as const },
  { label: "Channel", range: [0.26, 0.5] as const },
  { label: "Power", range: [0.5, 0.72] as const },
  { label: "Live", range: [0.72, 1.01] as const },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.35 });

  /* gentle diagonal glide — right and down */
  const trackX = useTransform(p, [0.04, 0.9], ["0vw", "-150vw"]);
  const trackY = useTransform(p, [0.04, 0.9], ["0svh", "-26svh"]);

  /* words emphasise at each panel's focal window */
  const w1 = useTransform(p, [0, 0.2, 0.3], [1, 1, 0.25]);
  const w2 = useTransform(p, [0.18, 0.26, 0.4, 0.48], [0.25, 1, 1, 0.25]);
  const w3 = useTransform(p, [0.46, 0.54, 0.68, 0.76], [0.25, 1, 1, 0.25]);
  const w4 = useTransform(p, [0.74, 0.84, 1], [0.25, 1, 1]);
  const wordOps = [w1, w2, w3, w4];

  /* whole panels fade in on approach and OUT before exiting the frame —
     no more full-opacity fragments riding the viewport edges */
  // Windows overlap so at least one panel is always at FULL opacity —
  // handoffs never leave the frame washed out.
  const p1 = useTransform(p, [0, 0.3, 0.38], [1, 1, 0]);
  const p2 = useTransform(p, [0.1, 0.16, 0.5, 0.58], [0, 1, 1, 0]);
  const p3 = useTransform(p, [0.36, 0.42, 0.74, 0.82], [0, 1, 1, 0]);
  const p4 = useTransform(p, [0.66, 0.72, 1], [0, 1, 1]);
  const panelOps = [p1, p2, p3, p4];
  const ctaOp = useTransform(p, [0.8, 0.9], [0, 1]);
  const railDotTop = useTransform(p, [0.04, 1], ["24%", "72%"]);

  if (reduced) return <StaticSpread />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[280svh] lg:h-[320svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
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
          className="absolute top-0 left-0 h-[160svh] w-[240vw]"
          style={{ x: trackX, y: trackY }}
        >
          {[
            { left: "8vw", top: "16svh" },
            { left: "58vw", top: "30svh" },
            { left: "108vw", top: "44svh" },
            { left: "158vw", top: "58svh" },
          ].map((pos, i) => (
            <JourneyPanel
              key={PANELS[i].word}
              panel={PANELS[i]}
              wordOp={wordOps[i]}
              panelOp={panelOps[i]}
              style={pos}
              isLast={i === 3}
              ctaOp={ctaOp}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- the panel --- */

/**
 * Self-contained editorial unit: everything anchors to the panel itself,
 * so word/image/caption relationships are identical at every viewport.
 */
function JourneyPanel({
  panel,
  wordOp,
  panelOp,
  style,
  isLast,
  ctaOp,
}: {
  panel: Panel;
  wordOp: MotionValue<number>;
  panelOp: MotionValue<number>;
  style: React.CSSProperties;
  isLast: boolean;
  ctaOp: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute" style={{ ...style, opacity: panelOp }}>
      <div className="relative">
        {/* giant word — behind the containers, crossing their top edge */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute -top-[0.5em] left-[22%] z-0 leading-none font-medium whitespace-nowrap"
          style={{ color: INK, opacity: wordOp, fontSize: "clamp(2.4rem,5.8vw,5.2rem)" }}
        >
          {panel.word}
        </motion.p>

        {/* small container pair — primary + tiny offset companion */}
        <div className="relative z-10 flex items-start gap-[1.2vw]">
          <Slot tone={panel.tonePrimary} className="h-[30svh] w-[21vw] min-w-52" />
          <Slot tone={panel.toneSmall} className="mt-[16svh] h-[13svh] w-[9vw] min-w-24" />
        </div>

        {/* caption + (final panel) CTA */}
        {isLast ? (
          <motion.div className="mt-4 max-w-64" style={{ opacity: ctaOp }}>
            <p className="font-display text-lg leading-snug font-medium text-[#171311]">
              From natural force to everyday comfort.
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-[#171311]/70">{panel.caption}</p>
            <a
              href="#wind"
              className="mt-4 inline-block rounded-lg bg-[#945C43] px-6 py-3 text-sm font-semibold text-[#F7F1E7] transition-colors hover:bg-[#171311]"
            >
              Explore Natural Systems
            </a>
          </motion.div>
        ) : (
          <p className="mt-3 max-w-52 text-[0.72rem] leading-relaxed text-[#171311]/70">
            {panel.caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** Styled placeholder container — awaiting the client's imagery. */
function Slot({ tone, className = "" }: { tone: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[5px] border border-[#171311]/10 ${className}`}
      style={{ background: `linear-gradient(150deg, ${tone}, ${tone}cc)` }}
    >
      <span className="absolute inset-0 grid place-items-center text-center text-[0.52rem] tracking-[0.24em] text-[#171311]/35 uppercase">
        Image
        <br />
        coming soon
      </span>
    </div>
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

/** near-invisible mineral marks (the guide/connector lines are removed) */
function MineralGround() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
      <filter id="rt-marks">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.0055" numOctaves="2" seed="9" />
        <feColorMatrix values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 -1.15 1.06" />
      </filter>
      <rect width="100%" height="100%" filter="url(#rt-marks)" opacity="0.05" />
    </svg>
  );
}

/* -------------------------------------------------- reduced motion ------ */

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
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {PANELS.map((panel) => (
            <figure key={panel.word}>
              <Slot tone={panel.tonePrimary} className="aspect-[3/4] w-full" />
              <figcaption className="mt-2 text-[0.6rem] tracking-[0.24em] text-[#171311]/70 uppercase">
                {panel.word.replace(".", "")}
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

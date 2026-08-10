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
 * 02 — Natural Systems: the calm diagonal editorial journey — kept —
 * with the content upgraded in place. Each of the four self-contained
 * panels now tells one REAL stage of the technical concept: a giant
 * stage word (CAPTURE / CHANNEL / POWER / COMFORT, matching the rail),
 * real project imagery in the frame pair (no placeholders), a feature
 * title and a fuller, technically grounded caption. The section
 * heading and intro ride the stage top-right and hand off to the
 * journey as the track begins to move.
 *
 * Native vertical scroll glides the track right and down the diagonal
 * over the shared fixed elevation backdrop. The final panel carries
 * the concluding line and CTA. Reduced motion renders a static spread.
 */

const INK = "#211A17";

interface Panel {
  word: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
  srcSmall: string;
  altSmall: string;
  objectPosition?: string;
}

const PANELS: Panel[] = [
  {
    word: "CAPTURE",
    title: "At the building crown",
    caption:
      "High-velocity natural airflow reaches the dedicated wind-catcher structure at the building crown.",
    src: "/buildingtop.jpg",
    alt: "The dedicated wind-catcher structure, kite system and turbines at the building crown",
    srcSmall: "/buildingfront.jpg",
    altSmall: "The two blocks open to the prevailing wind",
    objectPosition: "60% 30%",
  },
  {
    word: "CHANNEL",
    title: "Into the building",
    caption:
      "Captured air is directed into the building and through its internal circulation environment.",
    src: "/aislefoakh.jpg",
    alt: "Air directed along the ventilated internal circulation corridor",
    srcSmall: "/balconyfoakh.jpg",
    altSmall: "A balcony opening on the airflow path",
    objectPosition: "50% 45%",
  },
  {
    word: "CIRCULATE",
    title: "Through shared spaces",
    caption:
      "The airflow supports corridors, shared circulation spaces and internal common areas.",
    src: "/lounge.jpg",
    alt: "The elevator lobby and shared circulation spaces served by the airflow",
    srcSmall: "/lobby.jpg",
    altSmall: "Residents in the shared internal common areas",
    objectPosition: "50% 45%",
  },
  {
    word: "COMFORT.",
    title: "A fresher environment",
    caption:
      "Continuous natural airflow is intended to reduce trapped heat and create a fresher internal environment.",
    src: "/family.jpg",
    alt: "A family at ease in a fresh, daylit interior",
    srcSmall: "/drawingroomfoakh.jpg",
    altSmall: "A calm living space in the evening light",
    objectPosition: "50% 45%",
  },
];

const RAIL = [
  { label: "Capture", range: [0.04, 0.26] as const },
  { label: "Channel", range: [0.26, 0.5] as const },
  { label: "Circulate", range: [0.5, 0.72] as const },
  { label: "Comfort", range: [0.72, 1.01] as const },
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

  /* whole panels fade in on approach and OUT before exiting the frame */
  const p1 = useTransform(p, [0, 0.3, 0.38], [1, 1, 0]);
  const p2 = useTransform(p, [0.1, 0.16, 0.5, 0.58], [0, 1, 1, 0]);
  const p3 = useTransform(p, [0.36, 0.42, 0.74, 0.82], [0, 1, 1, 0]);
  const p4 = useTransform(p, [0.66, 0.72, 1], [0, 1, 1]);
  const panelOps = [p1, p2, p3, p4];
  const ctaOp = useTransform(p, [0.8, 0.9], [0, 1]);
  const railDotTop = useTransform(p, [0.04, 1], ["24%", "72%"]);

  /* the heading + intro hold the top-right, then hand off to the journey */
  const introOp = useTransform(p, [0, 0.1, 0.18], [1, 1, 0]);
  const introY = useTransform(p, [0.1, 0.18], ["0svh", "-3svh"]);

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

        <p className="absolute top-[5%] left-[8%] z-40 text-[0.62rem] font-medium tracking-[0.3em] text-[#943F2D] uppercase lg:left-[7.5rem]">
          02 — Natural Systems · 01 / 06 Wind Catcher
        </p>
        <h2 id="route-heading" className="sr-only">
          Nature, engineered for better living — the wind catcher, the heart of the wind
          corridor
        </h2>

        {/* heading + intro — present at the start, gone as the journey moves */}
        <motion.div
          aria-hidden="true"
          className="absolute top-[9%] right-[6%] z-30 hidden max-w-md text-right lg:block"
          style={{ opacity: introOp, y: introY }}
        >
          <p
            className="font-display leading-[1.14] text-balance"
            style={{ color: INK, fontSize: "clamp(1.7rem,2.2vw,2.4rem)", fontWeight: 500 }}
          >
            Nature, engineered for better living.
          </p>
          <p className="mt-3 ml-auto max-w-sm text-[0.85rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.72)" }}>
            Foakh brings multiple environmental systems together within one residential
            concept rather than treating sustainability as a single feature — beginning with
            the wind catcher, the heart of the wind corridor.
          </p>
          <p className="mt-3 ml-auto max-w-sm text-[0.78rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.6)" }}>
            A wind catcher is a traditional architectural solution created to intercept
            passing wind and guide it into a building — reimagined here around
            Karachi&rsquo;s natural wind conditions.
          </p>
        </motion.div>

        {/* section-local vertical rail */}
        <div className="absolute inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col items-center justify-center gap-10 border-r border-[#171311]/10 bg-[#F7F1E7]/85 lg:flex">
          {RAIL.map((r) => (
            <RailLabel key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#943F2D]"
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
            { left: "8vw", top: "18svh" },
            { left: "58vw", top: "30svh" },
            { left: "108vw", top: "44svh" },
            { left: "158vw", top: "58svh" },
          ].map((pos, i) => (
            <JourneyPanel
              key={PANELS[i].word}
              panel={PANELS[i]}
              index={i}
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
  index,
  wordOp,
  panelOp,
  style,
  isLast,
  ctaOp,
}: {
  panel: Panel;
  index: number;
  wordOp: MotionValue<number>;
  panelOp: MotionValue<number>;
  style: React.CSSProperties;
  isLast: boolean;
  ctaOp: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute" style={{ ...style, opacity: panelOp }}>
      <div className="relative">
        {/* giant stage word — behind the frames, crossing their top edge */}
        <motion.p
          aria-hidden="true"
          className="font-display absolute -top-[1em] left-[6%] z-0 leading-none font-medium whitespace-nowrap"
          style={{ color: INK, opacity: wordOp, fontSize: "clamp(2.4rem,5.8vw,5.2rem)" }}
        >
          {panel.word}
        </motion.p>

        {/* frame pair LEFT + reading card RIGHT — the text rides the
            panel's trailing side, so it stays on screen while the panel
            is focal instead of clipping at the viewport edge */}
        <div className="relative z-10 flex items-center gap-[1.6vw]">
          <div className="flex items-start gap-[1.2vw]">
            <Frame
              src={panel.src}
              alt={panel.alt}
              objectPosition={panel.objectPosition}
              sizes="24vw"
              className="h-[32svh] w-[21vw] min-w-52"
            />
            <Frame
              src={panel.srcSmall}
              alt={panel.altSmall}
              sizes="10vw"
              className="mt-[16svh] h-[13svh] w-[8.5vw] min-w-24"
            />
          </div>

          {/* stage number + feature title + caption; final panel adds CTA */}
          <div className="w-[21rem] max-w-[24vw] min-w-64 rounded-[14px] border border-[#D8B36A]/50 bg-[#FFF8EF]/90 p-5 shadow-[0_20px_44px_-26px_rgba(148,63,45,0.4)] backdrop-blur-[2px]">
            <p className="flex items-baseline gap-2.5">
              <span className="text-[0.72rem] font-bold tabular-nums" style={{ color: "#C75B3B" }}>
                0{index + 1}
              </span>
              <span className="font-display text-[1.35rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
                {panel.title}
              </span>
            </p>
            <p className="mt-2.5 text-[0.9rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.82)" }}>
              {panel.caption}
            </p>
            {isLast && (
              <motion.div className="mt-4" style={{ opacity: ctaOp }}>
                <p className="font-display text-lg leading-snug italic" style={{ color: "#C75B3B" }}>
                  From natural force to everyday comfort.
                </p>
                <a
                  href="#wind"
                  className="mt-4 inline-block rounded-lg bg-[#943F2D] px-6 py-3 text-sm font-semibold text-[#FFF8EF] transition-colors hover:bg-[#211A17]"
                >
                  Continue — Kite Energy
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Real project imagery in the journey frame — warm mat, champagne edge. */
function Frame({
  src,
  alt,
  sizes,
  objectPosition,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] border border-[#D8B36A]/55 bg-[#FFF8EF] p-1 shadow-[0_24px_48px_-28px_rgba(148,63,45,0.45)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[7px]">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" style={{ objectPosition }} />
      </div>
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

/** near-invisible mineral marks */
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
      className="relative overflow-hidden bg-[#F6EBDD] py-24"
    >
      <MineralGround />
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-medium tracking-[0.3em] text-[#943F2D] uppercase">
          02 — Natural Systems · 01 / 06 Wind Catcher
        </p>
        <h2
          id="route-heading"
          className="font-display mt-6 max-w-[15ch] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.02] font-medium text-[#211A17]"
        >
          Nature, engineered for better living.
        </h2>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-[#211A17]/75">
          The wind catcher — a traditional architectural solution reimagined around
          Karachi&rsquo;s natural wind conditions — captures high-velocity air and guides it
          through the building.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {PANELS.map((panel, i) => (
            <figure key={panel.word}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[10px] border border-[#D8B36A]/55">
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  fill
                  sizes="(min-width:768px) 24vw, 46vw"
                  className="object-cover"
                  style={{ objectPosition: panel.objectPosition }}
                />
              </div>
              <figcaption className="mt-2">
                <span className="block text-[0.6rem] tracking-[0.24em] text-[#211A17]/80 uppercase">
                  0{i + 1} — {panel.title}
                </span>
                <span className="mt-1 block text-[0.72rem] leading-relaxed text-[#211A17]/65">
                  {panel.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href="#wind"
          className="mt-8 inline-block rounded-lg bg-[#943F2D] px-6 py-3 text-sm font-semibold text-[#FFF8EF] transition-colors hover:bg-[#211A17]"
        >
          Continue — Kite Energy
        </a>
      </div>
    </section>
  );
}

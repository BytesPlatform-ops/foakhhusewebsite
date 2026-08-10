"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 02 — Natural Systems: THE BUILDING AS THE CANVAS.
 *
 * One immersive scroll experience over the approved FOAKH elevation —
 * same cream/terracotta editorial language as before, no cards, no
 * collage. A ~420svh section pins a 100svh stage; the render is blown
 * up to a façade close-up on a subtle perspective plane and the
 * camera descends the building from the crown to the gate.
 *
 * The chapter is organised into TWO connected parts on one descent:
 *   PART 01 — ENERGY & VENTILATION (Capture → Channel → Power →
 *   Comfort): wind catcher, turbines, kite energy, solar and corridor
 *   airflow told as one story with subtle airflow lines.
 *   PART 02 — WATER SYSTEMS (Desalination → Atmospheric Water →
 *   Resilience) introduced on the same descent, never disconnected.
 *
 * Selected windows warm on irregularly through the Comfort stage; the
 * final beat scales out (bottom-anchored) to reveal the lower façade,
 * landscaping and gate entrance, closing on "From natural force to
 * everyday comfort." A compact stage rail (Capture / Channel / Power /
 * Comfort / Water) tracks progress in the old section's style.
 *
 * Transform/opacity only, measured MotionValues, no WebGL. Reduced
 * motion renders a settled editorial spread.
 */

const ASPECT = 1238 / 2200;
const INK = "#211A17";

/* ------------------------------------------------ the stage rail ---- */
const RAIL = [
  { label: "Capture", range: [0.06, 0.24] as const },
  { label: "Channel", range: [0.24, 0.4] as const },
  { label: "Power", range: [0.4, 0.54] as const },
  { label: "Comfort", range: [0.54, 0.66] as const },
  { label: "Water", range: [0.66, 0.92] as const },
];

/* ---------------------------------------- the editorial sub-stages -- */
interface Beat {
  kicker: string;
  title: string;
  copy: string;
  side: "left" | "right";
  at: [number, number, number, number];
  top: string;
}

const ENERGY_BEATS: Beat[] = [
  {
    kicker: "01 — Capture",
    title: "Natural Air Capture",
    copy: "High-velocity natural airflow reaches and enters the dedicated wind catcher.",
    side: "left",
    at: [0.09, 0.13, 0.21, 0.25],
    top: "56%",
  },
  {
    kicker: "02 — Channel",
    title: "Corridor Distribution",
    copy: "Captured air is guided through corridors, lobbies and shared circulation spaces.",
    side: "right",
    at: [0.25, 0.29, 0.37, 0.41],
    top: "42%",
  },
  {
    kicker: "03 — Power",
    title: "Renewable Energy Support",
    copy: "Wind turbines, kite energy and solar panels work together as part of the development's renewable-energy strategy.",
    side: "left",
    at: [0.41, 0.45, 0.52, 0.55],
    top: "50%",
  },
  {
    kicker: "04 — Comfort",
    title: "Everyday Comfort",
    copy: "Improved airflow, renewable planning and environmental systems support fresher, more comfortable shared spaces.",
    side: "right",
    at: [0.55, 0.59, 0.65, 0.68],
    top: "46%",
  },
];

const WATER_BEATS: Beat[] = [
  {
    kicker: "01 — Desalination",
    title: "Water Treatment Support",
    copy: "A planned desalination system supports dependable water availability through treatment and purification.",
    side: "left",
    at: [0.69, 0.72, 0.77, 0.8],
    top: "54%",
  },
  {
    kicker: "02 — Atmospheric Water",
    title: "The Future of Water is in the Air",
    copy: "Thin Air technology extracts water from atmospheric air to support long-term sustainability and reduce dependence on conventional supply.",
    side: "right",
    at: [0.78, 0.81, 0.85, 0.88],
    top: "38%",
  },
  {
    kicker: "03 — Resilience",
    title: "A More Reliable Water Network",
    copy: "Together, these systems create a diversified and future-focused domestic water strategy.",
    side: "left",
    at: [0.85, 0.88, 0.93, 0.96],
    top: "34%",
  },
];

/* windows that warm on through the Comfort stage — % of the façade */
const LIGHTS: { x: number; y: number; at: number }[] = [
  { x: 23.0, y: 36.0, at: 0.5 },
  { x: 63.5, y: 34.5, at: 0.53 },
  { x: 30.5, y: 44.0, at: 0.56 },
  { x: 70.5, y: 42.5, at: 0.59 },
  { x: 26.0, y: 53.5, at: 0.62 },
  { x: 66.5, y: 51.5, at: 0.65 },
  { x: 20.5, y: 61.0, at: 0.68 },
  { x: 73.5, y: 59.5, at: 0.71 },
  { x: 29.5, y: 66.5, at: 0.74 },
  { x: 62.5, y: 68.0, at: 0.77 },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.35 });

  /* measured descent + reveal geometry */
  const yStart = useMotionValue(0);
  const yEnd = useMotionValue(0);
  const endScale = useMotionValue(0.4);
  const lift = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const el = layerRef.current;
      if (!el) return;
      const layerH = el.offsetWidth * ASPECT;
      const vh = window.innerHeight;
      yStart.set(-(0.04 * layerH));
      yEnd.set(Math.min(0, vh - layerH + 60));
      endScale.set(Math.min(1, (0.78 * vh) / layerH));
      lift.set(-(0.21 * vh));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [yStart, yEnd, endScale, lift]);

  /* descend the façade, then the bottom-anchored gate reveal */
  const y = useTransform([p, yStart, yEnd, lift] as const, ([v, a0, a1, l]) => {
    const a = Math.min(Math.max(((v as number) - 0.02) / 0.78, 0), 1);
    const ea = a * a * (3 - 2 * a);
    const b = Math.min(Math.max(((v as number) - 0.84) / 0.13, 0), 1);
    const eb = 1 - Math.pow(1 - b, 3);
    return (a0 as number) + ea * ((a1 as number) - (a0 as number)) + eb * (l as number);
  });
  const scale = useTransform([p, endScale] as const, ([v, s]) => {
    const b = Math.min(Math.max(((v as number) - 0.84) / 0.13, 0), 1);
    const e = 1 - Math.pow(1 - b, 3);
    return 1 - (1 - (s as number)) * e;
  });
  const radius = useTransform(p, [0.85, 0.97], [0, 24]);
  const rotateX = useTransform(p, [0, 0.8, 0.95], [2, -1.5, 0]);

  /* editorial beats */
  const introOp = useTransform(p, [0, 0.1, 0.18], [1, 1, 0]);
  const introY = useTransform(p, [0.1, 0.18], [0, -16]);
  const waterHeadOp = useTransform(p, [0.66, 0.7, 0.9, 0.94], [0, 1, 1, 0]);
  const endOp = useTransform(p, [0.93, 0.99], [0, 1]);
  const endY = useTransform(p, [0.93, 0.99], [14, 0]);

  if (reduced) return <StaticSystems />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[350svh] lg:h-[420svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F6EBDD]">
        {/* ---------------- the building canvas -------------------------- */}
        <div className="absolute inset-0" style={{ perspective: "1300px", perspectiveOrigin: "50% 45%" }}>
          <motion.div
            ref={layerRef}
            className="absolute top-0 left-1/2 w-[520vw] overflow-hidden will-change-transform lg:w-[240vw]"
            style={{
              x: "-50%",
              y,
              scale,
              rotateX,
              borderRadius: radius,
              transformOrigin: "50% 100%",
              aspectRatio: "2200 / 1238",
              boxShadow: "0 60px 120px -50px rgba(70,32,16,0.5)",
            }}
          >
            <Image
              src="/buildingfront.jpg"
              alt="The FOAKH elevation from the wind-catcher crown down to the landscaped gate entrance"
              fill
              priority={false}
              quality={90}
              sizes="100vw"
              className="object-cover"
            />

            {/* quiet grade so overlays read on the dusk render */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(42,46,74,0.18) 0%, transparent 30%, transparent 68%, rgba(28,17,12,0.24) 100%)",
              }}
            />

            {/* airflow + water accents — anchored to the façade */}
            <SystemLines p={p} />

            {/* windows warming on through the Comfort stage */}
            {LIGHTS.map((l) => (
              <WindowGlow key={`${l.x}-${l.y}`} p={p} {...l} />
            ))}
          </motion.div>
        </div>

        {/* ---------------- stage rail (old section language) ------------ */}
        <div className="absolute inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col items-center justify-center gap-9 border-r border-[#171311]/10 bg-[#F7F1E7]/85 lg:flex">
          {RAIL.map((r) => (
            <RailLabel key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
        </div>
        <div className="absolute top-[5%] right-[5%] z-40 lg:hidden">
          {RAIL.map((r, i) => (
            <MobileRailLabel key={r.label} label={r.label} index={i} range={r.range} progress={p} />
          ))}
        </div>

        {/* ---------------- intro — Part 01 ------------------------------ */}
        <motion.div
          className="absolute top-[8%] left-[8%] z-30 max-w-xl lg:top-[10%] lg:left-[9rem]"
          style={{ opacity: introOp, y: introY }}
        >
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
            02 — Natural Systems · Part 01 — Energy &amp; Ventilation
          </p>
          <h2
            id="route-heading"
            className="font-display mt-3 leading-[1.1] text-balance"
            style={{ color: INK, fontSize: "clamp(1.9rem,2.9vw,3rem)", fontWeight: 500 }}
          >
            The wind-catcher concept — from natural force to everyday comfort.
          </h2>
          <p className="mt-3 max-w-md text-[0.92rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.75)" }}>
            A purpose-built system designed to capture high-velocity air and guide it through
            the building, while renewable-energy systems support a more efficient residential
            environment.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(33,26,23,0.55)" }}>
            Scroll to descend <span aria-hidden="true">↓</span>
          </p>
        </motion.div>

        {/* ---------------- Part 02 header ------------------------------- */}
        <motion.div
          className="absolute top-[9%] right-[6%] z-30 max-w-sm rounded-xl border border-[#D8B36A]/50 bg-[#FFF8EF]/92 p-5 text-right shadow-[0_20px_44px_-26px_rgba(90,45,22,0.4)] backdrop-blur-[2px]"
          style={{ opacity: waterHeadOp }}
        >
          <p className="text-[0.6rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#C78C49" }}>
            Part 02 — Water Systems
          </p>
          <p className="font-display mt-2 text-[1.35rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
            Reliable Water Systems.
          </p>
          <p className="mt-2 text-[0.8rem] leading-[1.6]" style={{ color: "#51443D" }}>
            A future-ready water strategy combining desalination and atmospheric water
            generation for a more dependable and resilient residential environment.
          </p>
        </motion.div>

        {/* ---------------- the connected sub-stages --------------------- */}
        {[...ENERGY_BEATS, ...WATER_BEATS].map((b) => (
          <StageBeat key={b.kicker} p={p} beat={b} />
        ))}

        {/* ---------------- closing — at the gate ------------------------ */}
        <motion.div
          className="absolute inset-x-0 bottom-[3%] z-30 flex flex-col items-center gap-3 px-6 text-center"
          style={{ opacity: endOp, y: endY }}
        >
          <p className="font-display text-[1.3rem] italic" style={{ color: "#943F2D" }}>
            From natural force to everyday comfort.
          </p>
          <a
            href="#residences"
            className="rounded-lg bg-[#943F2D] px-6 py-3 text-sm font-semibold text-[#FFF8EF] transition-colors hover:bg-[#C75B3B]"
          >
            Explore the Residences
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- stage beat ------ */

function StageBeat({ p, beat }: { p: MotionValue<number>; beat: Beat }) {
  const opacity = useTransform(p, beat.at, [0, 1, 1, 0]);
  const x = useTransform(
    p,
    [beat.at[0], beat.at[1]],
    beat.side === "left" ? [-22, 0] : [22, 0]
  );
  return (
    <motion.div
      className={`absolute z-30 max-w-[17rem] rounded-xl border border-[#D8B36A]/50 bg-[#FFF8EF]/92 p-5 shadow-[0_20px_44px_-26px_rgba(90,45,22,0.4)] backdrop-blur-[2px] ${
        beat.side === "left" ? "left-[8%] lg:left-[9rem]" : "right-[6%] text-right"
      }`}
      style={{ opacity, x, top: beat.top }}
    >
      <p className="text-[0.58rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C78C49" }}>
        {beat.kicker}
      </p>
      <p className="font-display mt-1.5 text-[1.15rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
        {beat.title}
      </p>
      <p className="mt-2 text-[0.82rem] leading-[1.6]" style={{ color: "#51443D" }}>
        {beat.copy}
      </p>
    </motion.div>
  );
}

/* ----------------------------------------------------- overlays ------ */

function WindowGlow({ p, x, y, at }: { p: MotionValue<number>; x: number; y: number; at: number }) {
  /* warm on through Comfort; hand off to the render's own dusk lights
     before the gate reveal */
  const opacity = useTransform(p, [at, at + 0.06, 0.82, 0.88], [0, 0.75, 0.75, 0]);
  return (
    <motion.span
      aria-hidden="true"
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: "1.7%",
        height: "3%",
        opacity,
        borderRadius: "20%",
        background:
          "radial-gradient(ellipse at center, rgba(255,220,150,0.9) 0%, rgba(246,212,138,0.4) 55%, transparent 80%)",
        mixBlendMode: "screen",
        filter: "blur(1.5px)",
      }}
    />
  );
}

/** Airflow into the crown, circulation down the cores, water accents. */
function SystemLines({ p }: { p: MotionValue<number> }) {
  const crownOp = useTransform(p, [0.04, 0.09, 0.2, 0.25], [0, 0.5, 0.5, 0]);
  const crownD = useTransform(p, [0.04, 0.25], [0, -16]);
  const coreOp = useTransform(p, [0.26, 0.31, 0.4, 0.45], [0, 0.4, 0.4, 0]);
  const coreD = useTransform(p, [0.26, 0.45], [0, -18]);
  const waterOp = useTransform(p, [0.68, 0.73, 0.84, 0.88], [0, 0.45, 0.45, 0]);
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 56.3"
      preserveAspectRatio="none"
    >
      {/* wind entering the two crowns */}
      <motion.path
        d="M 14 6 C 20 7.5, 25 11, 29.5 14.5 M 48 5 C 42 7, 37 10.5, 33 14 M 86 6 C 80 7.5, 75 11, 70.5 14.5"
        fill="none"
        stroke="#78AAA5"
        strokeWidth="0.14"
        strokeLinecap="round"
        strokeDasharray="1.1 1.6"
        style={{ opacity: crownOp, strokeDashoffset: crownD }}
      />
      {/* circulation guided down the building cores */}
      <motion.path
        d="M 31 15 V 44 M 69 15 V 44 M 28 24 h 6 M 66 30 h 6"
        fill="none"
        stroke="#78AAA5"
        strokeWidth="0.13"
        strokeLinecap="round"
        strokeDasharray="0.9 1.5"
        style={{ opacity: coreOp, strokeDashoffset: coreD }}
      />
      {/* water accents near the base — desalination + atmospheric */}
      <motion.g style={{ opacity: waterOp }}>
        <path
          d="M 24 47 C 28 46.4, 32 47.3, 36 46.7 M 64 47 C 68 46.4, 72 47.3, 76 46.7"
          fill="none"
          stroke="#6F9B98"
          strokeWidth="0.14"
          strokeLinecap="round"
          strokeDasharray="1.2 1.6"
        />
        {[
          [27, 45.4],
          [33, 45.9],
          [67, 45.6],
          [73, 45.2],
        ].map(([cx, cy]) => (
          <path
            key={`${cx}`}
            d={`M ${cx} ${cy} c -0.45 0.6 -0.45 1.15 0 1.5 c 0.45 -0.35 0.45 -0.9 0 -1.5 z`}
            fill="#6F9B98"
            opacity="0.8"
          />
        ))}
      </motion.g>
    </svg>
  );
}

/* --------------------------------------------------- rail labels ----- */

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
      0{index + 1} / 05 — {label}
    </motion.span>
  );
}

/* -------------------------------------------------- reduced motion --- */

function StaticSystems() {
  return (
    <section
      id="route"
      data-section="route"
      aria-labelledby="route-heading"
      className="relative bg-[#F6EBDD] py-24"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
          02 — Natural Systems
        </p>
        <h2
          id="route-heading"
          className="font-display mt-4 max-w-[22ch] leading-[1.08]"
          style={{ color: INK, fontSize: "clamp(2rem,3.4vw,3.4rem)", fontWeight: 500 }}
        >
          The wind-catcher concept — from natural force to everyday comfort.
        </h2>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.65] text-[#211A17]/75">
          A purpose-built system designed to capture high-velocity air and guide it through
          the building, while renewable-energy systems support a more efficient residential
          environment.
        </p>
        <figure className="relative mt-10 overflow-hidden rounded-[24px] shadow-[0_50px_100px_-46px_rgba(70,32,16,0.5)]">
          <Image
            src="/buildingfront.jpg"
            alt="The FOAKH elevation from the wind-catcher crown down to the landscaped gate entrance"
            width={2200}
            height={1238}
            sizes="92vw"
            className="h-auto w-full"
          />
        </figure>
        <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#C78C49" }}>
              Part 01 — Energy &amp; Ventilation
            </p>
            <ul className="mt-4 space-y-4">
              {ENERGY_BEATS.map((b) => (
                <li key={b.kicker}>
                  <p className="font-display text-[1.05rem] font-medium" style={{ color: "#943F2D" }}>
                    {b.title}
                  </p>
                  <p className="mt-1 text-[0.85rem] leading-[1.6] text-[#211A17]/72">{b.copy}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#C78C49" }}>
              Part 02 — Water Systems
            </p>
            <ul className="mt-4 space-y-4">
              {WATER_BEATS.map((b) => (
                <li key={b.kicker}>
                  <p className="font-display text-[1.05rem] font-medium" style={{ color: "#943F2D" }}>
                    {b.title}
                  </p>
                  <p className="mt-1 text-[0.85rem] leading-[1.6] text-[#211A17]/72">{b.copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="font-display mt-10 text-[1.2rem] italic" style={{ color: "#943F2D" }}>
          From natural force to everyday comfort.
        </p>
      </div>
    </section>
  );
}

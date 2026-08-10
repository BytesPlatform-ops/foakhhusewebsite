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
 * 02 — Natural Systems: THE REAL BUILDING, MOVING BEHIND THE PAGE.
 *
 * The approved FOAKH tower (a tall crown-to-gate crop of the master
 * elevation render) is the background layer: pinned for ~360svh, it
 * translates slowly downward as the visitor scrolls — rooftop wind
 * catcher first, then the floors, ending on the entrance, landscaping
 * and street. No rotation, no fake 3D — a real architectural
 * photograph drifting behind the spread, blended into the cream
 * canvas (and the shared terracotta line-art backdrop) at its edges.
 *
 * The foreground keeps the diagonal editorial language: a large serif
 * heading entering top-left, cream printed-note cards and small framed
 * stills staggered across the diagonal, one group at a time —
 *   A — Air & Ventilation · Wind Catcher
 *   B — Renewable Energy · Wind Turbines · Solar · Kite
 *   C — Water Systems · Desalination · Atmospheric Water
 * with only small drifts (18px, fade, 0.985→1 scale). The section
 * closes at the arrival level: "From natural systems to everyday
 * comfort."
 */

const INK = "#211A17";
const B_ASPECT = 720 / 1238;

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(248, 240, 229, 0.96)",
  border: "1px solid rgba(170, 95, 61, 0.18)",
  borderRadius: 16,
  boxShadow: "0 18px 50px rgba(68, 39, 25, 0.08)",
};

interface Stage {
  eyebrow: string;
  heading: string;
  copy: string;
  items: { t: string; d?: string }[];
  at: [number, number, number, number];
  card: string;
  frame: { src: string; alt: string; pos?: string; className: string };
}

const STAGES: Stage[] = [
  {
    eyebrow: "A — Air & Ventilation",
    heading: "Wind Catcher",
    copy: "A dedicated architectural system designed to capture high-velocity natural air and guide it through internal circulation spaces.",
    items: [{ t: "Natural Air Capture" }, { t: "Corridor Distribution" }, { t: "Cooler Shared Areas" }],
    at: [0.05, 0.1, 0.26, 0.31],
    card: "left-[6%] top-[42%] lg:left-[7%] lg:top-[46%]",
    frame: {
      src: "/buildingtop.jpg",
      alt: "The wind catcher, kite and turbines at the crown",
      pos: "60% 30%",
      className: "left-[46%] top-[14%] w-[15rem] rotate-[1.6deg]",
    },
  },
  {
    eyebrow: "B — Renewable Energy",
    heading: "Wind Turbines · Solar · Kite Energy",
    copy: "Wind, sunlight and high-altitude airflow contribute to a diversified renewable-energy strategy.",
    items: [
      { t: "Wind Turbines", d: "Planned to convert available regional wind into renewable electricity." },
      { t: "Solar Energy", d: "Panels harness Karachi's abundant sunlight to complement the other systems." },
      { t: "Kite Energy", d: "Airborne tethered wings capture stronger high-altitude winds for ground-based generation." },
    ],
    at: [0.31, 0.36, 0.55, 0.6],
    card: "left-[6%] top-[24%] lg:left-[33%] lg:top-[32%]",
    frame: {
      src: "/foakhshaukat.jpg",
      alt: "The development with the regional wind farm on the horizon",
      pos: "72% 45%",
      className: "left-[9%] top-[57%] w-[17rem] -rotate-[1.8deg]",
    },
  },
  {
    eyebrow: "C — Water Systems",
    heading: "A more resilient approach to water.",
    copy: "Desalination and atmospheric water generation work together as part of a diversified water strategy.",
    items: [
      { t: "Water Desalination", d: "Reverse-osmosis treatment planned to support dependable water availability." },
      { t: "Atmospheric Water Generation", d: "Thin Air technology extracts water from atmospheric air." },
    ],
    at: [0.6, 0.65, 0.82, 0.87],
    card: "left-[6%] top-[28%] lg:left-[58%] lg:top-[42%]",
    frame: {
      src: "/buildingfront.jpg",
      alt: "The landscaped water-feature courtyard at dusk",
      pos: "50% 84%",
      className: "left-[32%] top-[62%] w-[16rem] rotate-[1.4deg]",
    },
  },
];

const RAIL = [
  { label: "Air", range: [0.05, 0.31] as const },
  { label: "Energy", range: [0.31, 0.6] as const },
  { label: "Water", range: [0.6, 0.87] as const },
  { label: "Arrival", range: [0.87, 1.01] as const },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.35 });

  /* the real building fills the screen and drifts down — rooftop to
     entrance; travel measured from the rendered image height */
  const bRef = useRef<HTMLDivElement>(null);
  const travel = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const el = bRef.current;
      if (!el) return;
      travel.set(Math.min(0, window.innerHeight - el.offsetHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [travel]);
  const buildingY = useTransform([p, travel] as const, ([v, t]) => {
    const a = Math.min(Math.max(((v as number) - 0.02) / 0.9, 0), 1);
    const e = a * a * (3 - 2 * a);
    return e * (t as number);
  });

  const headOp = useTransform(p, [0, 0.24, 0.31], [1, 1, 0]);
  const headY = useTransform(p, [0.24, 0.31], [0, -14]);
  const airOp = useTransform(p, [0.05, 0.1, 0.24, 0.29], [0, 0.55, 0.55, 0]);
  const endOp = useTransform(p, [0.88, 0.95], [0, 1]);
  const endY = useTransform(p, [0.88, 0.95], [12, 0]);

  if (reduced) return <StaticSystems />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[320svh] lg:h-[360svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* ------------- the real building, fullscreen parallax -------- */}
        <motion.div
          ref={bRef}
          className="absolute top-0 left-1/2 w-[178vw] -translate-x-1/2 will-change-transform sm:w-[120vw] lg:w-screen"
          style={{ y: buildingY, aspectRatio: `${B_ASPECT}` }}
        >
          <Image
            src="/buildingtall.jpg"
            alt="The FOAKH tower from the wind-catcher crown down to the landscaped entrance"
            fill
            quality={90}
            sizes="(min-width:1024px) 46vw, 90vw"
            className="object-cover"
          />
          {/* readability scrim — quiet, photographic */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,15,10,0.42) 0%, rgba(26,15,10,0.14) 34%, rgba(26,15,10,0) 55%)," +
                "linear-gradient(180deg, rgba(26,15,10,0.18) 0%, transparent 18%, transparent 82%, rgba(26,15,10,0.3) 100%)",
            }}
          />
          {/* airflow whisper toward the crown — stage A only */}
          <motion.svg
            aria-hidden="true"
            className="pointer-events-none absolute top-[9%] left-[-6%] h-[14%] w-[70%]"
            style={{ opacity: airOp }}
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <path
              d="M 2 10 C 22 6, 44 12, 66 9 S 92 8, 98 11 M 4 22 C 24 18, 46 23, 68 19"
              fill="none"
              stroke="#78AAA5"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeDasharray="2.6 3.6"
            />
          </motion.svg>
        </motion.div>

        {/* ------------- heading — enters from the left --------------- */}
        <motion.div
          className="absolute top-[8%] left-[6%] z-30 max-w-xl lg:top-[11%] lg:left-[7%]"
          style={{ opacity: headOp, y: headY }}
        >
          <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#EFD5A3", textShadow: "0 1px 12px rgba(20,10,6,0.7)" }}>
            02 — Natural Systems
          </p>
          <h2
            id="route-heading"
            className="font-display mt-4 leading-[1.06] text-balance"
            style={{ color: "#FFF8EF", fontSize: "clamp(2.3rem,3.8vw,3.9rem)", fontWeight: 500, textShadow: "0 2px 26px rgba(20,10,6,0.75)" }}
          >
            Nature, engineered for better living.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-[1.65]" style={{ color: "rgba(255,248,239,0.92)", textShadow: "0 1px 16px rgba(20,10,6,0.8)" }}>
            A connected set of natural-resource systems designed to support airflow, renewable
            power and resilient water planning throughout the development.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(255,248,239,0.75)" }}>
            Scroll <span aria-hidden="true">↓</span>
          </p>
        </motion.div>

        {/* ------------- the diagonal stage pieces -------------------- */}
        {STAGES.map((st) => (
          <StagePieces key={st.eyebrow} st={st} p={p} />
        ))}

        {/* ------------- stage rail — bottom left --------------------- */}
        <div className="absolute bottom-[5%] left-[6%] z-30 flex items-center gap-3 lg:left-[7%]">
          {RAIL.map((r) => (
            <RailMark key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
        </div>

        {/* ------------- arrival ---------------------------------------- */}
        <motion.p
          className="font-display absolute bottom-[10%] left-[6%] z-30 max-w-sm text-[1.35rem] leading-snug italic lg:left-[7%]"
          style={{ opacity: endOp, y: endY, color: "#FFF8EF", textShadow: "0 2px 18px rgba(20,10,6,0.75)" }}
        >
          From natural systems to everyday comfort.
        </motion.p>
      </div>
    </section>
  );
}

/* --------------------------------------------------- stage pieces ---- */

function StagePieces({ st, p }: { st: Stage; p: MotionValue<number>; flip?: boolean }) {
  const opacity = useTransform(p, st.at, [0, 1, 1, 0]);
  /* the pieces travel the diagonal: in from upper-left, out lower-right */
  const x = useTransform(p, [st.at[0], st.at[1], st.at[2], st.at[3]], [-26, 0, 0, 20]);
  const y = useTransform(p, [st.at[0], st.at[1], st.at[2], st.at[3]], [-18, 0, 0, 14]);
  const scale = useTransform(p, [st.at[0], st.at[1]], [0.985, 1]);
  return (
    <>
      {/* the printed editorial note */}
      <motion.div
        className={`absolute z-30 w-[min(88vw,21.5rem)] p-6 lg:p-7 ${st.card}`}
        style={{ opacity, x, y, scale, ...CARD_STYLE }}
      >
        <p className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#B95334" }}>
          {st.eyebrow}
        </p>
        <p className="font-display mt-2.5 leading-[1.12] font-medium" style={{ color: "#7C3428", fontSize: "clamp(1.35rem,1.7vw,1.7rem)" }}>
          {st.heading}
        </p>
        <p className="mt-3 text-[0.85rem] leading-[1.6]" style={{ color: "rgba(42,30,26,0.75)" }}>
          {st.copy}
        </p>
        <div className="mt-4">
          {st.items.map((item, j) => (
            <div
              key={item.t}
              className={j > 0 ? "mt-3 border-t pt-3" : ""}
              style={j > 0 ? { borderColor: "rgba(170,95,61,0.16)" } : undefined}
            >
              <p className="text-[0.8rem] font-semibold" style={{ color: INK }}>
                {item.t}
              </p>
              {item.d && (
                <p className="mt-0.5 text-[0.76rem] leading-[1.55]" style={{ color: "rgba(42,30,26,0.64)" }}>
                  {item.d}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* the companion still — diagonal counterweight */}
      <motion.figure
        className={`absolute z-20 hidden overflow-hidden rounded-[12px] border border-[#D8B36A]/55 bg-[#FFF8EF] p-1 shadow-[0_24px_48px_-28px_rgba(68,39,25,0.4)] lg:block ${st.frame.className}`}
        style={{ opacity, scale }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px]">
          <Image
            src={st.frame.src}
            alt={st.frame.alt}
            fill
            sizes="18rem"
            className="object-cover"
            style={{ objectPosition: st.frame.pos }}
          />
        </div>
      </motion.figure>
    </>
  );
}

function RailMark({
  label,
  range,
  progress,
}: {
  label: string;
  range: readonly [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.03, a, b, b + 0.03], [0.35, 1, 1, 0.35]);
  return (
    <motion.span
      className="text-[0.6rem] font-semibold tracking-[0.26em] uppercase"
      style={{ opacity, color: "#EFD5A3", textShadow: "0 1px 10px rgba(20,10,6,0.7)" }}
    >
      {label}
    </motion.span>
  );
}

/* --------------------------------------------------- reduced motion -- */

function StaticSystems() {
  return (
    <section
      id="route"
      data-section="route"
      aria-labelledby="route-heading"
      className="relative overflow-hidden py-24"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
          02 — Natural Systems
        </p>
        <h2
          id="route-heading"
          className="font-display mt-4 max-w-[16ch] leading-[1.06]"
          style={{ color: INK, fontSize: "clamp(2.3rem,3.8vw,3.9rem)", fontWeight: 500 }}
        >
          Nature, engineered for better living.
        </h2>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
          <figure className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[16px] border border-[#D8B36A]/55">
            <Image
              src="/buildingtall.jpg"
              alt="The FOAKH tower from crown to entrance"
              width={720}
              height={1238}
              sizes="(min-width:1024px) 34vw, 80vw"
              className="h-auto w-full"
            />
          </figure>
          <div className="space-y-6">
            {STAGES.map((st) => (
              <div key={st.eyebrow} className="p-6" style={CARD_STYLE}>
                <p className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#B95334" }}>
                  {st.eyebrow}
                </p>
                <p className="font-display mt-2 text-[1.3rem] leading-snug font-medium" style={{ color: "#7C3428" }}>
                  {st.heading}
                </p>
                <p className="mt-2.5 text-[0.85rem] leading-[1.6]" style={{ color: "rgba(42,30,26,0.75)" }}>
                  {st.copy}
                </p>
              </div>
            ))}
            <p className="font-display text-[1.2rem] italic" style={{ color: "#943F2D" }}>
              From natural systems to everyday comfort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

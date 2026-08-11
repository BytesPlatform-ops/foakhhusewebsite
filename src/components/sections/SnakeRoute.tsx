"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ClayFace } from "@/components/shared/BuildIn";
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
 * 02 — Natural Systems: THE BUILDING CONSTRUCTS ITSELF.
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

/* the layer runs taller than the render (1122x1402) so object-cover
   crops the render's own pale margins instead of glaring at the edges */
const FRAME_ASPECT = 0.7;

/* the heading is lit letter by letter as the façade rises behind it:
   ink while the cream scrim is there, warm white once the terracotta
   fills the frame */
const HEADING_TEXT = "Nature, engineered for better living.";
const LEAD_TEXT =
  "A connected set of natural-resource systems designed to support airflow, renewable power and resilient water planning throughout the development.";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(248, 240, 229, 0.985)",
  border: "1px solid rgba(170, 95, 61, 0.18)",
  borderRadius: 16,
  boxShadow: "0 18px 50px rgba(68, 39, 25, 0.08)",
};

interface StageFrame {
  src: string;
  alt: string;
  label: string;
  pos?: string;
  className: string;
}

interface Stage {
  eyebrow: string;
  heading: string;
  copy: string;
  items: { t: string; d?: string }[];
  at: [number, number, number, number];
  card: string;
  frames: StageFrame[];
}

const STAGES: Stage[] = [
  {
    eyebrow: "A — Air & Ventilation",
    heading: "Wind Catcher",
    copy: "A dedicated architectural system designed to capture high-velocity natural air and guide it through internal circulation spaces.",
    items: [{ t: "Natural Air Capture" }, { t: "Corridor Distribution" }, { t: "Cooler Shared Areas" }],
    at: [0.05, 0.1, 0.26, 0.31],
    card: "left-[6%] top-[42%] lg:left-[7%] lg:top-[46%]",
    frames: [
      {
        src: "/buildingtop.jpg",
        alt: "The wind catcher and kite system at the crown",
        label: "Natural Air Capture",
        pos: "60% 22%",
        className: "left-[44%] top-[11%] w-[19rem] rotate-[1.6deg]",
      },
      {
        src: "/aislefoakh.jpg",
        alt: "Captured air guided along the ventilated corridor",
        label: "Corridor Distribution",
        pos: "50% 45%",
        className: "left-[40%] top-[56%] w-[16rem] -rotate-[1.8deg]",
      },
    ],
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
    card: "left-[6%] top-[24%] lg:left-[34%] lg:top-[30%]",
    frames: [
      {
        src: "/windturbineimagefinal.png",
        alt: "The rooftop wind turbines silhouetted against the sunset",
        label: "Wind Turbines",
        pos: "50% 30%",
        className: "left-[6%] top-[13%] w-[18rem] -rotate-[1.8deg]",
      },
      {
        src: "/buildingtop.jpg",
        alt: "The rooftop solar array within the terracotta crown",
        label: "Solar Energy",
        pos: "10% 44%",
        className: "left-[7%] top-[57%] w-[17rem] rotate-[1.4deg]",
      },
      {
        src: "/kiteenergyimg.png",
        alt: "The tethered kite-energy wing above the roof, winch cable in view",
        label: "Kite Energy",
        pos: "63% 20%",
        className: "left-[66%] top-[13%] w-[15rem] rotate-[2deg]",
      },
    ],
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
    card: "left-[6%] top-[28%] lg:left-[56%] lg:top-[40%]",
    frames: [
      {
        src: "/windcatcher.png",
        alt: "The landscaped water-feature courtyard and arrival fountain",
        label: "Water in the Landscape",
        pos: "50% 78%",
        className: "left-[26%] top-[13%] w-[18rem] rotate-[1.6deg]",
      },
      {
        src: "/waterreliability.png",
        alt: "The building's water treatment and reliability systems at work",
        label: "Dependable Supply",
        pos: "50% 70%",
        className: "left-[24%] top-[58%] w-[17rem] -rotate-[1.6deg]",
      },
    ],
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
  /* the building glides on a much softer spring — it visibly trails the
     scroll and keeps settling after the page stops */
  const pb = useSpring(scrollYProgress, { stiffness: 42, damping: 19, mass: 0.9 });

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
  /* the camera travels the full height of the render, top to bottom */
  const buildingY = useTransform([pb, travel] as const, ([v, t]) => {
    const a = Math.min(Math.max(((v as number) - 0.02) / 0.9, 0), 1);
    const e = a * a * (3 - 2 * a);
    return e * (t as number);
  });

  const headOp = useTransform(p, [0, 0.28, 0.35], [1, 1, 0]);
  const headY = useTransform(p, [0.28, 0.35], [0, -14]);
  const airOp = useTransform(p, [0.05, 0.1, 0.24, 0.29], [0, 0.55, 0.55, 0]);
  /* the eyebrow, lead and cue follow the letters from ink into warm
     white as the façade takes over behind them */
  /* the reading side deepens as the letters light, so the white always
     has ground to sit on — the lights come up, the room goes dark */
  const headWash = useTransform(p, [0.03, 0.19, 0.28, 0.35], [0, 1, 1, 0]);
  const eyebrowColour = useTransform(p, [0.04, 0.18], ["#943F2D", "#EFD5A3"]);
  const cueColour = useTransform(
    p,
    [0.14, 0.27],
    ["rgba(33,26,23,0.5)", "rgba(255,248,239,0.75)"]
  );
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
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F6EBDD]">
        {/* ------------- the building, panning slowly with scroll ------- */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            ref={bRef}
            className="absolute top-0 left-1/2 w-[230vw] -translate-x-1/2 will-change-transform sm:w-[150vw] lg:w-full"
            style={{ y: buildingY, aspectRatio: `${FRAME_ASPECT}` }}
          >
            <Image
              src="/buildingpov.jpg"
              alt="The Foakh tower in section — rooftop kite, wind turbine and solar above the residences, amenity floors and entrance"
              fill
              quality={88}
              sizes="100vw"
              className="object-cover"
            />

            {/* airflow whisper toward the crown — stage A only */}
            <motion.svg
              aria-hidden="true"
              className="pointer-events-none absolute top-[3%] left-[-10%] h-[12%] w-[64%]"
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
        </div>

        {/* the wash the lit heading reads against */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: headWash,
            background:
              "linear-gradient(112deg, rgba(28,13,7,0.88) 0%, rgba(28,13,7,0.62) 24%, rgba(28,13,7,0.18) 44%, rgba(28,13,7,0) 62%)",
          }}
        />

        {/* ------------- heading — enters from the left --------------- */}
        <motion.div
          className="absolute top-[8%] left-[6%] z-30 max-w-xl lg:top-[11%] lg:left-[7%]"
          style={{ opacity: headOp, y: headY }}
        >
          <motion.p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: eyebrowColour }}>
            02 — Natural Systems
          </motion.p>
          <h2
            id="route-heading"
            className="font-display mt-4 leading-[1.06]"
            style={{ fontSize: "clamp(2.3rem,3.8vw,3.9rem)", fontWeight: 500 }}
          >
            <span className="sr-only">{HEADING_TEXT}</span>
            <LitText
              p={p}
              text={HEADING_TEXT}
              start={0.04}
              span={0.17}
              win={0.045}
              from={INK}
              to="#FFF8EF"
            />
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-[1.65]">
            <span className="sr-only">{LEAD_TEXT}</span>
            <LitText
              p={p}
              text={LEAD_TEXT}
              start={0.12}
              span={0.14}
              win={0.028}
              from="rgba(33,26,23,0.72)"
              to="rgba(255,248,239,0.92)"
            />
          </p>
          <motion.p className="mt-5 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: cueColour }}>
            Scroll <span aria-hidden="true">↓</span>
          </motion.p>
        </motion.div>

        {/* ------------- the constant journey line --------------------- */}
        <ConnectorLine p={p} />

        {/* ------------- the diagonal stage pieces -------------------- */}
        {STAGES.map((st) => (
          <StagePieces key={st.eyebrow} st={st} p={p} />
        ))}

        {/* ------------- stage rail — bottom left --------------------- */}
        <div className="absolute bottom-[5%] left-[6%] z-30 flex items-center gap-3 rounded-full bg-[#F6EBDD]/88 px-4 py-2 lg:left-[7%]">
          {RAIL.map((r) => (
            <RailMark key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
        </div>

        {/* ------------- arrival ---------------------------------------- */}
        <motion.p
          className="font-display absolute bottom-[10%] left-[6%] z-30 max-w-[15rem] text-[1.35rem] leading-snug italic lg:left-[7%]"
          style={{ opacity: endOp, y: endY, color: "#943F2D" }}
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
  /* construction: rise in six clay courses, then the clay fires clean */
  const clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - st.at[0]) / (st.at[1] - st.at[0]), 0), 1);
    const c = Math.ceil(t * 6) / 6;
    return `inset(${(1 - c) * 100}% 0% 0% 0%)`;
  });
  const clay = useTransform(
    p,
    [st.at[0] + (st.at[1] - st.at[0]) * 0.25, st.at[0] + (st.at[1] - st.at[0]) * 0.8],
    [1, 0]
  );
  /* the pieces travel the diagonal: in from upper-left, out lower-right */
  const x = useTransform(p, [st.at[0], st.at[1], st.at[2], st.at[3]], [-26, 0, 0, 20]);
  const y = useTransform(p, [st.at[0], st.at[1], st.at[2], st.at[3]], [-18, 0, 0, 14]);
  const scale = useTransform(p, [st.at[0], st.at[1]], [0.985, 1]);
  return (
    <>
      {/* the printed editorial note */}
      <motion.div
        className={`absolute z-30 w-[min(92vw,28rem)] overflow-hidden p-7 lg:p-8 ${st.card}`}
        style={{ opacity, x, y, scale, clipPath: clip, ...CARD_STYLE }}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50"
          style={{ opacity: clay, borderRadius: "inherit" }}
        >
          <ClayFace />
        </motion.span>
        <p className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#B95334" }}>
          {st.eyebrow}
        </p>
        <p className="font-display mt-2.5 leading-[1.12] font-medium" style={{ color: "#7C3428", fontSize: "clamp(1.75rem,2.4vw,2.5rem)" }}>
          {st.heading}
        </p>
        <p className="mt-4 text-[0.98rem] leading-[1.68]" style={{ color: "rgba(42,30,26,0.75)" }}>
          {st.copy}
        </p>
        <div className="mt-4">
          {st.items.map((item, j) => (
            <div
              key={item.t}
              className={j > 0 ? "mt-3 border-t pt-3" : ""}
              style={j > 0 ? { borderColor: "rgba(170,95,61,0.16)" } : undefined}
            >
              <p className="text-[0.92rem] font-semibold" style={{ color: INK }}>
                {item.t}
              </p>
              {item.d && (
                <p className="mt-1 text-[0.82rem] leading-[1.6]" style={{ color: "rgba(42,30,26,0.64)" }}>
                  {item.d}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* the companion stills — each one lays itself up in brick courses */}
      {st.frames.map((f, i) => (
        <StageStill key={f.label} p={p} st={st} f={f} i={i} opacity={opacity} scale={scale} />
      ))}
    </>
  );
}

/** one letter, lit from ink to warm white at its own moment */
function Letter({
  p,
  ch,
  start,
  win,
  from,
  to,
}: {
  p: MotionValue<number>;
  ch: string;
  start: number;
  win: number;
  from: string;
  to: string;
}) {
  const colour = useTransform(p, [start, start + win], [from, to]);
  return <motion.span style={{ color: colour }}>{ch}</motion.span>;
}

/**
 * Text lit letter by letter across a scroll window. The heading leads;
 * the supporting line follows on an offset, so the copy lights up a beat
 * behind the headline rather than with it.
 */
function LitText({
  p,
  text,
  start,
  span,
  win,
  from,
  to,
}: {
  p: MotionValue<number>;
  text: string;
  start: number;
  span: number;
  win: number;
  from: string;
  to: string;
}) {
  const words = text.split(" ");
  const total = text.replace(/ /g, "").length;
  const plan = words.reduce<{ word: string; from: number }[]>((acc, word) => {
    const prev = acc[acc.length - 1];
    return [...acc, { word, from: prev ? prev.from + prev.word.length : 0 }];
  }, []);
  return (
    <span aria-hidden="true">
      {plan.map(({ word, from: at }, w) => (
        <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
          {word.split("").map((ch, k) => (
            <Letter
              key={`${w}-${k}`}
              p={p}
              ch={ch}
              start={start + ((at + k) / Math.max(1, total - 1)) * (span - win)}
              win={win}
              from={from}
              to={to}
            />
          ))}
          {w < plan.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/** a companion still that lays itself up in brick courses, slowly */
function StageStill({
  p,
  st,
  f,
  i,
  opacity,
  scale,
}: {
  p: MotionValue<number>;
  st: Stage;
  f: StageFrame;
  i: number;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  /* a long, unhurried window — staggered so the frames build in turn */
  const s0 = st.at[0] + 0.015 + i * 0.035;
  const s1 = s0 + 0.13;
  const clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - s0) / (s1 - s0), 0), 1);
    const c = t * 9;
    const laid = Math.floor(c) / 9;
    const frac = c % 1;
    if (frac <= 0.74) return `inset(${(1 - laid) * 100}% 0% 0% 0%)`;
    const lift = (frac - 0.74) / 0.26;
    const e = laid + (lift * lift * (3 - 2 * lift)) / 9;
    return `inset(${(1 - Math.min(1, e)) * 100}% 0% 0% 0%)`;
  });
  /* the brick courses lay all the way up before the clay fires clean —
     the photo never shows through mid-build */
  const clay = useTransform(p, [s0 + (s1 - s0) * 0.92, s1 + (s1 - s0) * 0.1], [1, 0]);

  return (
    <motion.figure
      className={`absolute z-20 hidden overflow-hidden rounded-[12px] border border-[#D8B36A]/55 bg-[#FFF8EF] p-1 shadow-[0_24px_48px_-28px_rgba(20,10,6,0.55)] lg:block ${f.className}`}
      style={{ opacity, scale, clipPath: clip }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px]">
        <Image
          src={f.src}
          alt={f.alt}
          fill
          sizes="20rem"
          className="object-cover"
          style={{ objectPosition: f.pos }}
        />
      </div>
      <figcaption className="px-2 pt-1.5 pb-1 text-center text-[0.55rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#943F2D" }}>
        {f.label}
      </figcaption>
      {/* the clay it is built from, firing clean as the last course lands */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-50"
        style={{ opacity: clay, borderRadius: "inherit" }}
      >
        <ClayFace />
      </motion.span>
    </motion.figure>
  );
}

/** one continuous line linking the stages — draws with the scroll */
function ConnectorLine({ p }: { p: MotionValue<number> }) {
  const pathLength = useTransform(p, [0.06, 0.88], [0, 1]);
  const opacity = useTransform(p, [0.04, 0.1, 0.9, 0.97], [0, 0.55, 0.55, 0]);
  return (
    <motion.svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[15] hidden h-full w-full lg:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <motion.path
        d="M 12 38 C 22 46, 26 56, 34 52 S 44 34, 52 36 S 62 52, 68 56 S 82 66, 88 78"
        fill="none"
        stroke="#EFD5A3"
        strokeWidth="0.22"
        strokeLinecap="round"
        strokeDasharray="0.8 1.4"
        style={{ pathLength }}
      />
    </motion.svg>
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
      style={{ opacity, color: "#943F2D" }}
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

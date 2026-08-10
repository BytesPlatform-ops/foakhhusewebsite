"use client";

import { useReducedMotion, motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

/**
 * 02 — Natural Systems: THE LIVING WALL.
 *
 * The section background is a code-built FOAKH façade — a full 3D wall
 * of recessed windows in the exact terracotta language (no photo, no
 * stock texture): plaster piers, slab shadows, deep window reveals, a
 * parapet crown carrying the kite / turbine / solar silhouettes in
 * terracotta line art, and a taller arcaded ground floor at the base.
 *
 * A ~380svh sticky stage scrolls the wall past the viewer, floor by
 * floor. As each band of floors passes, its windows OPEN UP — a warm
 * interior glow rises inside each recess (irregular, deterministic
 * offsets; some windows stay dark) — while the matching editorial
 * group lightens into focus on alternating sides:
 *   A — Air & Ventilation · Wind Catcher      (left)
 *   B — Renewable Energy · Wind/Solar/Kite    (right)
 *   C — Water Systems · Desalination/Thin Air (left)
 * ending on the lit ground floor and the closing line.
 *
 * Transform/opacity only — no WebGL, no images. Reduced motion renders
 * the settled, fully lit wall with all content readable.
 */

const ROWS = 13;
const COLS = 6;
/* svh geometry: parapet + floors + ground arcade */
const PARAPET_SVH = 18;
const ROW_SVH = 15;
const GROUND_SVH = 26;
const WALL_SVH = PARAPET_SVH + ROWS * ROW_SVH + GROUND_SVH; // 239svh

/* deterministic jitter — SSR-safe, no Math.random */
const jitter = (r: number, c: number) => ((r * 53 + c * 97) % 100) / 100;
const isDark = (r: number, c: number) => (r * 7 + c * 5) % 4 === 0;

/* ------------------------------------------------ editorial groups -- */
interface Group {
  kicker: string;
  title: string;
  lead: string;
  items?: { t: string; d: string }[];
  points?: string[];
  side: "left" | "right";
  at: [number, number, number, number];
  top: string;
}

const GROUPS: Group[] = [
  {
    kicker: "A — Air & Ventilation",
    title: "Wind Catcher",
    lead: "The dedicated wind catcher captures high-velocity natural air and directs it into the building to support airflow through internal circulation areas.",
    points: ["Natural Air Capture", "Corridor Distribution", "Cooler Shared Areas", "Reduced Heat Buildup"],
    side: "left",
    at: [0.14, 0.19, 0.36, 0.42],
    top: "30%",
  },
  {
    kicker: "B — Renewable Energy",
    title: "Wind Turbines · Solar · Kite Energy",
    lead: "Wind, sunlight and high-altitude airflow contribute to a diversified renewable-energy strategy.",
    items: [
      { t: "Wind Turbines", d: "Planned to convert available regional wind into renewable electricity." },
      { t: "Solar Energy", d: "Panels harness Karachi's abundant sunlight, complementing the other systems." },
      { t: "Kite Energy", d: "Airborne tethered wings capture stronger high-altitude winds for ground-based generation." },
    ],
    side: "right",
    at: [0.4, 0.45, 0.62, 0.68],
    top: "24%",
  },
  {
    kicker: "C — Water Systems",
    title: "Reliable Water Systems",
    lead: "A diversified water strategy combining desalination and atmospheric water generation.",
    items: [
      { t: "Water Desalination", d: "A planned reverse-osmosis system supports dependable water availability." },
      { t: "Atmospheric Water · Thin Air", d: "Water extracted directly from air supports a resilient long-term strategy." },
    ],
    side: "left",
    at: [0.66, 0.71, 0.85, 0.9],
    top: "30%",
  },
];

export default function SnakeRoute() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 105, damping: 30, mass: 0.35 });

  /* the wall travels past the viewer, floor by floor */
  const wallY = useTransform(p, (v) => {
    const a = Math.min(Math.max((v - 0.02) / 0.88, 0), 1);
    const e = a * a * (3 - 2 * a);
    return `${-e * (WALL_SVH - 100)}svh`;
  });
  const rotateX = useTransform(p, [0, 0.9], [1.6, -1.4]);

  /* intro + closing */
  const introOp = useTransform(p, [0, 0.09, 0.16], [1, 1, 0]);
  const introY = useTransform(p, [0.09, 0.16], [0, -16]);
  const endOp = useTransform(p, [0.91, 0.97], [0, 1]);
  const endY = useTransform(p, [0.91, 0.97], [14, 0]);

  if (reduced) return <StaticWall />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative h-[340svh] lg:h-[380svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#2A1E1A]">
        {/* ---------------- the living wall --------------------------- */}
        <div className="absolute inset-0" style={{ perspective: "1400px", perspectiveOrigin: "50% 45%" }}>
          <motion.div
            className="absolute inset-x-0 top-0 will-change-transform"
            style={{ y: wallY, rotateX, height: `${WALL_SVH}svh` }}
          >
            <Facade p={p} lit={false} />
          </motion.div>
        </div>

        {/* ---------------- intro ------------------------------------- */}
        <motion.div
          className="absolute top-[9%] left-[6%] z-30 max-w-xl rounded-2xl border border-[#D8B36A]/45 bg-[#FFF8EF]/94 p-6 shadow-[0_26px_54px_-30px_rgba(40,15,5,0.6)] backdrop-blur-[2px] lg:top-[12%] lg:left-[8%] lg:p-8"
          style={{ opacity: introOp, y: introY }}
        >
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
            02 — Natural Systems
          </p>
          <h2
            id="route-heading"
            className="font-display mt-3 leading-[1.08] text-balance"
            style={{ color: "#211A17", fontSize: "clamp(1.9rem,3vw,3.1rem)", fontWeight: 500 }}
          >
            Nature, engineered for better living.
          </h2>
          <p className="mt-3 max-w-md text-[0.92rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.75)" }}>
            A connected set of natural-resource systems designed to support airflow, renewable
            power and resilient water planning throughout the development.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(33,26,23,0.55)" }}>
            Scroll — the building wakes up <span aria-hidden="true">↓</span>
          </p>
        </motion.div>

        {/* ---------------- alternating groups ------------------------ */}
        {GROUPS.map((g) => (
          <GroupPanel key={g.kicker} p={p} g={g} />
        ))}

        {/* ---------------- closing ----------------------------------- */}
        <motion.div
          className="absolute inset-x-0 bottom-[6%] z-30 flex flex-col items-center gap-3 px-6 text-center"
          style={{ opacity: endOp, y: endY }}
        >
          <p className="rounded-full bg-[#FFF8EF]/94 px-6 py-2.5 shadow-[0_18px_40px_-24px_rgba(40,15,5,0.6)]">
            <span className="font-display text-[1.15rem] italic" style={{ color: "#943F2D" }}>
              From natural force to everyday comfort.
            </span>
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

/* ===================================================== the façade ==== */

function Facade({ p, lit }: { p: MotionValue<number> | null; lit: boolean }) {
  return (
    <div className="relative h-full w-full" style={{ background: "linear-gradient(178deg, #C4653F 0%, #BA5A36 45%, #A94E2D 100%)" }}>
      {/* soft plaster variation */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(80% 30% at 30% 12%, rgba(255,190,140,0.16), transparent 70%)," +
            "radial-gradient(70% 30% at 75% 55%, rgba(90,30,10,0.14), transparent 70%)",
        }}
      />

      {/* parapet crown with kite · turbines · solar line art */}
      <div className="absolute inset-x-0 top-0" style={{ height: `${PARAPET_SVH}svh` }}>
        <div className="absolute inset-x-0 bottom-0 h-[2.2svh]" style={{ background: "linear-gradient(180deg, rgba(60,20,8,0), rgba(60,20,8,0.35))" }} />
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 18" preserveAspectRatio="none">
          <g stroke="#F3C9A8" strokeWidth="0.22" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M 2 15.5 H 98 M 4 15.5 V 12.8 M 12 15.5 V 12.8 M 20 15.5 V 12.8 M 28 15.5 V 12.8 M 36 15.5 V 12.8 M 44 15.5 V 12.8 M 52 15.5 V 12.8 M 60 15.5 V 12.8 M 68 15.5 V 12.8 M 76 15.5 V 12.8 M 84 15.5 V 12.8 M 92 15.5 V 12.8 M 2 12.8 H 98" />
            <path d="M 22 12.8 V 8.6 M 22 8.6 l 0 -2.2 M 22 8.6 l 1.9 1.1 M 22 8.6 l -1.9 1.1" />
            <circle cx="22" cy="8.6" r="2.6" opacity="0.55" />
            <path d="M 62 12.8 V 8.2 M 62 8.2 l 0 -2.2 M 62 8.2 l 1.9 1.1 M 62 8.2 l -1.9 1.1" />
            <circle cx="62" cy="8.2" r="2.6" opacity="0.55" />
            <path d="M 36 12.8 l 2.4 -2.1 h 8 l -2.4 2.1 z M 39 11.7 l 2.4 -2.1 M 42 11.7 l 2.4 -2.1" />
            <path d="M 76 12.8 l 2.4 -2.1 h 8 l -2.4 2.1 z M 79 11.7 l 2.4 -2.1 M 82 11.7 l 2.4 -2.1" />
            <path d="M 50 12.8 C 49 9, 47.5 6, 45 3.4" strokeDasharray="0.7 0.9" />
            <path d="M 43.2 2.2 q 2 -1.6 4 0 q -2 2.1 -4 0 z" fill="rgba(243,201,168,0.28)" />
          </g>
        </svg>
      </div>

      {/* the floors */}
      <div className="absolute inset-x-0" style={{ top: `${PARAPET_SVH}svh`, height: `${ROWS * ROW_SVH}svh` }}>
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className="relative flex" style={{ height: `${ROW_SVH}svh` }}>
            <div className="absolute inset-x-0 top-0 h-[1.1svh]" style={{ background: "linear-gradient(180deg, rgba(60,20,8,0.32), rgba(60,20,8,0))" }} />
            {Array.from({ length: COLS }, (_, c) => (
              <WindowCell key={c} r={r} c={c} p={p} lit={lit} />
            ))}
          </div>
        ))}
      </div>

      {/* ground floor arcade — the arrival level */}
      <div className="absolute inset-x-0 bottom-0 flex" style={{ height: `${GROUND_SVH}svh` }}>
        <div className="absolute inset-x-0 top-0 h-[1.4svh]" style={{ background: "linear-gradient(180deg, rgba(60,20,8,0.4), rgba(60,20,8,0))" }} />
        {Array.from({ length: COLS }, (_, c) => (
          <ArchCell key={c} c={c} p={p} lit={lit} />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-[3svh]" style={{ background: "linear-gradient(0deg, #3A1F12, rgba(58,31,18,0))" }} />
      </div>
    </div>
  );
}

const GLOW_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(255,215,140,0.95) 0%, rgba(255,178,96,0.55) 55%, rgba(120,60,25,0.12) 100%)";

/* one recessed FOAKH window with an opening warm glow */
function WindowCell({ r, c, p, lit }: { r: number; c: number; p: MotionValue<number> | null; lit: boolean }) {
  const dark = isDark(r, c);
  const start = 0.1 + (r / (ROWS - 1)) * 0.68 + jitter(r, c) * 0.06;
  return (
    <div className="relative flex-1" style={{ padding: "2.6svh 2.2vw 2svh" }}>
      <div
        className="relative h-full w-full overflow-hidden rounded-[3px]"
        style={{
          background: "linear-gradient(165deg, #4A4150 0%, #2E2430 42%, #1D1512 100%)",
          boxShadow:
            "inset 0 1.6svh 2svh -1svh rgba(35,12,4,0.85), inset -0.5vw 0 1vw -0.5vw rgba(35,12,4,0.55), inset 0.4vw 0 0.8vw -0.4vw rgba(255,190,140,0.18), inset 0 -0.5svh 0.8svh -0.4svh rgba(255,200,160,0.22)",
        }}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2" style={{ background: "rgba(20,10,6,0.6)" }} />
        {!dark &&
          (p ? (
            <GlowLayer p={p} start={start} />
          ) : (
            <span aria-hidden="true" className="absolute inset-[6%]" style={{ opacity: lit ? 0.9 : 0, background: GLOW_BG, borderRadius: 2 }} />
          ))}
      </div>
      <span
        aria-hidden="true"
        className="absolute right-[2vw] bottom-[1.3svh] left-[2vw] h-[0.55svh] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #D8875C, #A94E2D)", boxShadow: "0 0.35svh 0.5svh rgba(50,18,6,0.4)" }}
      />
    </div>
  );
}

function GlowLayer({ p, start }: { p: MotionValue<number>; start: number }) {
  const opacity = useTransform(p, [start, start + 0.05], [0, 0.92]);
  const scaleY = useTransform(p, [start, start + 0.07], [0.18, 1]);
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-[6%] origin-bottom"
      style={{ opacity, scaleY, background: GLOW_BG, borderRadius: 2, boxShadow: "0 0 3vw 0.6vw rgba(255,190,110,0.28)" }}
    />
  );
}

/* taller arched ground-floor opening — the arrival level glows last */
function ArchCell({ c, p, lit }: { c: number; p: MotionValue<number> | null; lit: boolean }) {
  const start = 0.82 + jitter(12, c) * 0.05;
  return (
    <div className="relative flex-1" style={{ padding: "3.5svh 2.6vw 3svh" }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "45% 45% 4px 4px / 30% 30% 4px 4px",
          background: "linear-gradient(170deg, #3A3040 0%, #241B20 50%, #170F0C 100%)",
          boxShadow: "inset 0 2svh 2.4svh -1svh rgba(35,12,4,0.85), inset -0.5vw 0 1vw -0.5vw rgba(35,12,4,0.55), inset 0.4vw 0 0.8vw -0.4vw rgba(255,190,140,0.16)",
        }}
      >
        {p ? (
          <GlowLayer p={p} start={start} />
        ) : (
          <span aria-hidden="true" className="absolute inset-[8%]" style={{ opacity: lit ? 0.9 : 0, background: GLOW_BG }} />
        )}
      </div>
    </div>
  );
}

/* ===================================================== group panel === */

function GroupPanel({ p, g }: { p: MotionValue<number>; g: Group }) {
  const opacity = useTransform(p, g.at, [0, 1, 1, 0]);
  const x = useTransform(p, [g.at[0], g.at[1]], g.side === "left" ? [-24, 0] : [24, 0]);
  return (
    <motion.div
      className={`absolute z-30 w-[min(88vw,23rem)] rounded-2xl border border-[#D8B36A]/45 bg-[#FFF8EF]/94 p-6 shadow-[0_26px_54px_-30px_rgba(40,15,5,0.6)] backdrop-blur-[2px] ${
        g.side === "left" ? "left-[6%] lg:left-[8%]" : "right-[6%] lg:right-[8%]"
      }`}
      style={{ opacity, x, top: g.top }}
    >
      <p className="text-[0.6rem] font-bold tracking-[0.26em] uppercase" style={{ color: "#C78C49" }}>
        {g.kicker}
      </p>
      <p className="font-display mt-2 text-[1.35rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
        {g.title}
      </p>
      <p className="mt-2.5 text-[0.85rem] leading-[1.6]" style={{ color: "#51443D" }}>
        {g.lead}
      </p>
      {g.points && (
        <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2">
          {g.points.map((pt) => (
            <li key={pt} className="flex items-baseline gap-2 text-[0.76rem]" style={{ color: "#51443D" }}>
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#78AAA5" }} />
              {pt}
            </li>
          ))}
        </ul>
      )}
      {g.items && (
        <div className="mt-3.5">
          {g.items.map((item, i) => (
            <div key={item.t} className={i > 0 ? "mt-3 border-t pt-3" : ""} style={i > 0 ? { borderColor: "rgba(216,179,106,0.4)" } : undefined}>
              <p className="text-[0.85rem] font-semibold" style={{ color: "#211A17" }}>
                {item.t}
              </p>
              <p className="mt-0.5 text-[0.78rem] leading-[1.55]" style={{ color: "#51443D" }}>
                {item.d}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* =================================================== reduced motion == */

function StaticWall() {
  return (
    <section
      id="route"
      data-section="route"
      aria-labelledby="route-heading"
      className="relative overflow-hidden bg-[#2A1E1A] py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-45">
        <div className="absolute inset-x-0 top-0" style={{ height: "200%" }}>
          <Facade p={null} lit />
        </div>
      </div>
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <div className="max-w-2xl rounded-2xl border border-[#D8B36A]/45 bg-[#FFF8EF]/96 p-8">
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
            02 — Natural Systems
          </p>
          <h2
            id="route-heading"
            className="font-display mt-3 leading-[1.08]"
            style={{ color: "#211A17", fontSize: "clamp(2rem,3.4vw,3.2rem)", fontWeight: 500 }}
          >
            Nature, engineered for better living.
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.75)" }}>
            A connected set of natural-resource systems designed to support airflow, renewable
            power and resilient water planning throughout the development.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.kicker} className="rounded-2xl border border-[#D8B36A]/45 bg-[#FFF8EF]/96 p-6">
              <p className="text-[0.6rem] font-bold tracking-[0.26em] uppercase" style={{ color: "#C78C49" }}>
                {g.kicker}
              </p>
              <p className="font-display mt-2 text-[1.25rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
                {g.title}
              </p>
              <p className="mt-2 text-[0.85rem] leading-[1.6]" style={{ color: "#51443D" }}>
                {g.lead}
              </p>
              {g.points && (
                <ul className="mt-3 space-y-1.5">
                  {g.points.map((pt) => (
                    <li key={pt} className="flex items-baseline gap-2 text-[0.78rem]" style={{ color: "#51443D" }}>
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#78AAA5" }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {g.items && (
                <div className="mt-3 space-y-2.5">
                  {g.items.map((item) => (
                    <div key={item.t}>
                      <p className="text-[0.85rem] font-semibold" style={{ color: "#211A17" }}>
                        {item.t}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] leading-[1.55]" style={{ color: "#51443D" }}>
                        {item.d}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="font-display mt-10 text-[1.2rem] italic" style={{ color: "#F3C9A8" }}>
          From natural force to everyday comfort.
        </p>
      </div>
    </section>
  );
}

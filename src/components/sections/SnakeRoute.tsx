"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ClayFace, courses } from "@/components/shared/BuildIn";
import { M } from "@/components/shared/useIsMobile";
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

const INK = "#2B211D";

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
  /** Set instead of a real src when no asset in /public honestly depicts
   *  this topic. Renders a clearly marked gap so the slot cannot ship
   *  unnoticed and cannot be mistaken for finished artwork. */
  missing?: string;
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
        /* the wind-catcher tower itself — the previous frame showed the gap
           between the two blocks with an arrival fountain, which explained
           nothing about air capture */
        src: "/sys-windcatcher.jpg",
        alt: "The wind catcher above the two blocks, its captured air drawn down into the buildings",
        label: "Natural Air Capture",
        pos: "50% 50%",
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
        /* each energy frame now shows its own equipment at readable scale —
           the old frames were distant tower shots where the turbines, panels
           and kite were a few pixels each */
        src: "/sys-windturbines.jpg",
        alt: "The ducted wind turbines standing on the development's own roof terrace",
        label: "Wind Turbines",
        pos: "50% 50%",
        className: "left-[6%] top-[13%] w-[18rem] -rotate-[1.8deg]",
      },
      {
        src: "/sys-solar.jpg",
        alt: "The photovoltaic array on the development's roof terrace catching first light",
        label: "Solar Energy",
        pos: "50% 50%",
        className: "left-[7%] top-[57%] w-[17rem] rotate-[1.4deg]",
      },
      {
        src: "/sys-kite.jpg",
        alt: "The tethered kite aloft on its line above the development's roof",
        label: "Kite Energy",
        pos: "50% 50%",
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
        /* the reverse-osmosis plant itself. The old frame here was the
           arrival fountain labelled "Water in the Landscape" — a fountain
           is not a desalination system, and it duplicated the image used
           for Natural Air Capture. */
        src: "/sys-desalination.jpg",
        alt: "The reverse-osmosis desalination plant — membrane racks, pressure vessels and control panel",
        label: "Water Desalination",
        pos: "50% 50%",
        className: "left-[26%] top-[13%] w-[18rem] rotate-[1.6deg]",
      },
      {
        /* the generation plant in its bay at the foot of the towers, cropped
           from the site render at native resolution — the first attempt was
           upscaled and went soft, so this one is not resized at all, only
           lifted out of the night render's shadow. */
        src: "/sys-atmospheric-water.jpg",
        alt: "The atmospheric water generation plant — process racking and generator unit lit in its bay",
        label: "Atmospheric Water",
        pos: "50% 50%",
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
  const eyebrowColour = useTransform(p, [0.04, 0.18], ["#94432F", "#E8CFA4"]);
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
      className="relative lg:h-[360svh]"
    >
      {/* ---------------- mobile: tabs on top, panels below -------------- */}
      <div className="lg:hidden">
        <MobileSystems />
      </div>

      {/* ---------------- desktop: the pinned facade composition --------- */}
      <div className="sticky top-0 hidden h-svh overflow-hidden bg-[#F5EDE3] lg:block">
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
                stroke="#78AFC1"
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
              to="#FAF6F0"
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
        <div className="absolute bottom-[5%] left-[6%] z-30 flex items-center gap-3 rounded-full bg-[#F5EDE3]/88 px-4 py-2 lg:left-[7%]">
          {RAIL.map((r) => (
            <RailMark key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
        </div>

        {/* ------------- arrival ---------------------------------------- */}
        <motion.p
          className="font-display absolute bottom-[10%] left-[6%] z-30 max-w-[15rem] text-[1.35rem] leading-snug italic lg:left-[7%]"
          style={{ opacity: endOp, y: endY, color: "#94432F" }}
        >
          From natural systems to everyday comfort.
        </motion.p>
      </div>
    </section>
  );
}

/* --------------------------------------------------- stage pieces ---- */


/* ---------------------------------------------------------------- mobile --
   The desktop stage pins a full-bleed facade and floats the panels and their
   stills across it in absolute rem positions — at 390px the heading lands on
   top of the render and the stage rail ends up at the foot of the screen.

   Mobile instead reads as three panels, each one screen's worth, with the
   stage control sitting at the top under the section heading where it can be
   reached. The stills keep their editorial character by overlapping the
   panel's corners rather than becoming full-width blocks. "Arrival" is a
   transition state on desktop, not content, so it is not offered as a tab. */

function MobileStill({ f, index }: { f: StageFrame; index: number }) {
  const reduced = useReducedMotion();
  /* the composition assembles: each still rises into place in discrete
     courses rather than fading, so it reads as built rather than dropped */
  const build = reduced
    ? {}
    : {
        clipPath: { duration: 0.62, delay: index * 0.12, ease: courses(3) },
        y: { duration: 0.6, delay: index * 0.12, ease: M.ease },
      };

  return (
    <motion.figure
      initial={reduced ? undefined : "raw"}
      whileInView={reduced ? undefined : "built"}
      viewport={{ once: true, amount: 0.3 }}
      className="relative w-full"
    >
      <motion.div
        className="overflow-hidden rounded-[12px] border border-[#C99355]/55 bg-[#FAF6F0] p-1 shadow-[0_18px_36px_-20px_rgba(20,10,6,0.55)]"
        variants={{
          raw: { clipPath: "inset(100% 0% 0% 0%)", y: 14 },
          built: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
        }}
        transition={build}
      >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px]">
        {f.missing ? (
          <div
            data-image-required="true"
            className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(148,63,45,0.08) 0 8px, rgba(148,63,45,0.15) 8px 16px)",
            }}
          >
            <span className="text-[0.42rem] font-bold tracking-[0.16em] uppercase" style={{ color: "#94432F" }}>
              HQ Image Required
            </span>
            <span className="text-[0.48rem] leading-tight font-medium" style={{ color: "rgba(43,33,29,0.72)" }}>
              {f.missing}
            </span>
          </div>
        ) : (
          <Image src={f.src} alt={f.alt} fill sizes="(min-width:640px) 60vw, 88vw" className="object-cover" style={{ objectPosition: f.pos }} />
        )}
      </div>
      <figcaption
        className="px-1 pt-1 pb-0.5 text-center text-[0.44rem] font-bold tracking-[0.16em] uppercase"
        style={{ color: "#94432F" }}
      >
        {f.label}
      </figcaption>
      </motion.div>
    </motion.figure>
  );
}

function MobileSystems() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  /* the building is the canvas: it descends slowly behind the panels while
     the content moves at full scroll speed, so the two read as depth rather
     than as one flat page. The image spans exactly this container, so the
     facade runs out at the same moment the last panel does. */
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const bg = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const buildingY = useTransform(bg, [0, 1], ["0%", "-34%"]);

  /* the tab follows whichever stage holds the screen */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const i = panels.current.indexOf(best.target as HTMLElement);
        if (i >= 0) setActive(i);
      },
      { threshold: [0.2, 0.5], rootMargin: "-30% 0px -40% 0px" }
    );
    panels.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative bg-[#F5EDE3]">
      {/* ---------------- the building, standing at the head ------------
          It used to be stretched over the whole section: a 1122x1402
          portrait render inside a container several thousand pixels tall,
          object-cover, so the sides were cropped away and what survived
          read as a slab of masonry rather than the towers. It now keeps
          its own aspect ratio at full width, anchored to the top, so the
          building is seen whole. The cream wash that used to sit at 30–72%
          across the entire section is gone; only the head of the image is
          lifted, and only enough to carry the heading. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
        <motion.div
          className="relative w-full will-change-transform"
          style={{ y: buildingY, aspectRatio: "1122 / 1402" }}
        >
          <Image src="/buildingpov.jpg" alt="" fill sizes="100vw" className="object-cover" priority={false} />
          {/* the facade settles into the cream ground instead of cutting */}
          <span
            className="absolute inset-x-0 bottom-0 h-[38%]"
            style={{ background: "linear-gradient(180deg, rgb(245 237 227 / 0) 0%, rgb(245 237 227 / 0.86) 62%, #F5EDE3 100%)" }}
          />
          {/* just enough lift behind the eyebrow and heading to stay legible */}
          <span
            className="absolute inset-x-0 top-0 h-[52%]"
            style={{ background: "linear-gradient(180deg, rgb(245 237 227 / 0.80) 0%, rgb(245 237 227 / 0.42) 52%, rgb(245 237 227 / 0) 100%)" }}
          />
        </motion.div>
      </div>

      {/* ---------------- heading ---------------------------------------- */}
      <div className="relative px-5 pt-12">
        <p className="text-[0.6rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#94432F" }}>
          02 — Natural Systems
        </p>
        <h2 id="route-heading" className="font-display mt-3 text-[2.1rem] leading-[1.06] font-medium" style={{ color: "#2B211D" }}>
          Nature, engineered for better living.
        </h2>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-[#2B211D]/78">
          A connected set of natural-resource systems designed to support airflow, renewable power
          and resilient water planning throughout the development.
        </p>
      </div>

      {/* ---------------- stage control, joined to the heading ----------- */}
      <div className="sticky top-[68px] z-30 mt-4 px-4 pb-2">
        <ul
          className="flex gap-1.5 rounded-full p-1.5"
          style={{ background: "rgba(250,246,240,0.92)", backdropFilter: "blur(6px)", boxShadow: "0 8px 22px -14px rgba(36,27,23,0.5)" }}
        >
          {STAGES.map((st, i) => (
            <li key={st.eyebrow} className="flex-1">
              <button
                type="button"
                onClick={() => panels.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                aria-current={active === i ? "true" : undefined}
                className="w-full rounded-full px-2 text-[0.64rem] font-bold tracking-[0.14em] uppercase transition-colors duration-300"
                style={{
                  minHeight: 40,
                  background: active === i ? "#B65438" : "transparent",
                  color: active === i ? "#FAF6F0" : "rgba(43,33,29,0.6)",
                }}
              >
                {["Air", "Energy", "Water"][i]}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- the three stages ------------------------------- */}
      {STAGES.map((st, i) => (
        <article
          key={st.eyebrow}
          ref={(el) => {
            panels.current[i] = el;
          }}
          className="relative scroll-mt-[124px] px-4 pt-10 pb-10"
        >
          <div
            className="relative rounded-[20px] border border-[#C99355]/45 px-6 pt-6 pb-6"
            style={{
              background: "rgba(250,246,240,0.97)",
              boxShadow: "0 22px 46px -30px rgba(36,27,23,0.5)",
            }}
          >
            <p className="text-[0.58rem] font-bold tracking-[0.22em] uppercase" style={{ color: "#B65438" }}>
              {st.eyebrow}
            </p>
            <h3 className="font-display mt-2.5 text-[1.7rem] leading-[1.1] font-medium" style={{ color: "#94432F" }}>
              {st.heading}
            </h3>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#2B211D]/78">{st.copy}</p>
            <ul className="mt-4">
              {st.items.map((it) => (
                <li key={it.t} className="border-t border-[#94432F]/12 py-2.5 first:border-t-0 first:pt-0">
                  <p className="text-[0.86rem] font-semibold" style={{ color: "#2B211D" }}>
                    {it.t}
                  </p>
                  {it.d && <p className="mt-0.5 text-[0.8rem] leading-snug text-[#2B211D]/70">{it.d}</p>}
                </li>
              ))}
            </ul>
            {/* the stage's own stills, in flow and full width — they were
                small rotated cards pinned to the corners, which floated over
                the heading above and the next stage below. Same images, same
                captions, now stacked under the copy they explain. */}
            <div className="mt-6 space-y-4">
              {st.frames.map((f, fi) => (
                <MobileStill key={f.label} f={f} index={fi} />
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

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
        <p className="font-display mt-2.5 leading-[1.12] font-medium" style={{ color: "#713427", fontSize: "clamp(1.75rem,2.4vw,2.5rem)" }}>
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
  /* staggered so the frames build in turn, but finished shortly after the
     stage is fully on screen — a still that is still clay while its card
     is being read looks broken, not slow */
  const s0 = st.at[0] + 0.01 + i * 0.022;
  const s1 = st.at[1] + 0.03 + i * 0.022;
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
      className={`absolute z-20 hidden overflow-hidden rounded-[12px] border border-[#C99355]/55 bg-[#FAF6F0] p-1 shadow-[0_24px_48px_-28px_rgba(20,10,6,0.55)] lg:block ${f.className}`}
      style={{ opacity, scale, clipPath: clip }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px]">
        {f.missing ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 text-center"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(148,63,45,0.07) 0 10px, rgba(148,63,45,0.13) 10px 20px)",
            }}
          >
            <span className="text-[0.5rem] font-bold tracking-[0.18em] uppercase" style={{ color: "#94432F" }}>
              HQ Image Required
            </span>
            <span className="text-[0.58rem] leading-tight font-medium" style={{ color: "rgba(43,33,29,0.72)" }}>
              {f.missing}
            </span>
          </div>
        ) : (
          <Image
            src={f.src}
            alt={f.alt}
            fill
            sizes="20rem"
            className="object-cover"
            style={{ objectPosition: f.pos }}
          />
        )}
      </div>
      <figcaption className="px-2 pt-1.5 pb-1 text-center text-[0.55rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#94432F" }}>
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
        stroke="#E8CFA4"
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
      style={{ opacity, color: "#94432F" }}
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
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#94432F" }}>
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
          <figure className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[16px] border border-[#C99355]/55">
            <Image
              src="/buildingpov.jpg"
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
                <p className="font-display mt-2 text-[1.3rem] leading-snug font-medium" style={{ color: "#713427" }}>
                  {st.heading}
                </p>
                <p className="mt-2.5 text-[0.85rem] leading-[1.6]" style={{ color: "rgba(42,30,26,0.75)" }}>
                  {st.copy}
                </p>
              </div>
            ))}
            <p className="font-display text-[1.2rem] italic" style={{ color: "#94432F" }}>
              From natural systems to everyday comfort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

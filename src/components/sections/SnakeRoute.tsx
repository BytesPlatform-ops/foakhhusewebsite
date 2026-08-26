"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ClayFace } from "@/components/shared/BuildIn";
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

/** The two systems that carry the project's innovation story. Named rather
 *  than taken by position: the last row of the air stage is "Cooler Shared
 *  Areas", which is an outcome, not an innovation to spotlight. */
const SPOTLIT = new Set(["Kite Energy", "Atmospheric Water Generation"]);

/* the layer runs taller than the render (1122x1402) so object-cover
   crops the render's own pale margins instead of glaring at the edges */
const FRAME_ASPECT = 0.7;

/* the heading is lit letter by letter as the façade rises behind it:
   ink while the cream scrim is there, warm white once the terracotta
   fills the frame */
const HEADING_TEXT = "Nature, Engineered for Lower Bills and Better Living";
const LEAD_TEXT =
  "A connected set of natural-resource systems designed to support airflow, renewable power and resilient water planning throughout the development. Electricity costs are the biggest hidden expense of apartment living in Karachi; Foakh was designed around that reality.";

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
    eyebrow: "A: Air & Ventilation. The Wind Catcher",
    heading: "Wind Catcher",
    copy: "A dedicated architectural system captures high-velocity natural air from Karachi\u2019s wind corridor and guides it through internal circulation spaces.",
    items: [
      {
        t: "Natural Air Capture",
        d: "High-velocity air is captured through the wind-catcher system and directed into the development.",
      },
      {
        t: "Corridor Distribution",
        d: "Captured airflow moves through internal corridors for continuous natural ventilation.",
      },
      {
        t: "Cooler Shared Areas",
        d: "Corridors, lift lobbies and communal areas stay comfortable with less conventional cooling.",
      },
    ],
    at: [0.04, 0.08, 0.22, 0.26],
    /* Sat at 46% while its three rows were headings only. With their
       descriptions restored the card is ~540px tall, which ran past the
       bottom of a 768px pinned stage — it starts higher now so the whole
       card is inside the viewport at every desktop height. */
    /* Right-hand side: on the left it sat under the heading and covered the
       sub-line. The two stills swap across to the space it vacated. */
    card: "left-[6%] top-[42%] lg:left-auto lg:right-[5%] lg:top-[20%]",
    frames: [
      {
        /* the wind-catcher tower itself — the previous frame showed the gap
           between the two blocks with an arrival fountain, which explained
           nothing about air capture */
        src: "/sys-windcatcher.jpg",
        alt: "The wind catcher above the two blocks, its captured air drawn down into the buildings",
        label: "Natural Air Capture",
        pos: "50% 50%",
        className: "left-[6%] top-[37%] w-[19rem] rotate-[1.6deg]",
      },
      {
        src: "/aislefoakh.jpg",
        alt: "Captured air guided along the ventilated corridor",
        label: "Corridor Distribution",
        pos: "50% 45%",
        className: "left-[13%] top-[70%] w-[16rem] -rotate-[1.8deg]",
      },
    ],
  },
  {
    eyebrow: "B: Renewable Energy. Wind Turbines, Solar and Kite Energy",
    heading: "Wind Turbines · Solar · Kite Energy",
    copy: "Wind, sunlight and high-altitude airflow contribute to a diversified renewable-energy strategy: solar powered apartment living designed for meaningful long-term energy efficiency.",
    items: [
      { t: "Wind Turbines", d: "Convert available regional wind into renewable electricity." },
      { t: "Solar Energy", d: "Panels harness Karachi's abundant sunlight." },
      { t: "Kite Energy", d: "Airborne tethered wings capture stronger high-altitude winds for ground-based generation." },
    ],
    at: [0.26, 0.30, 0.46, 0.50],
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
    eyebrow: "C: Water Systems. A More Resilient Approach",
    heading: "A more resilient approach to water.",
    copy: "Desalination and atmospheric water generation work together as a diversified water strategy, built for dependable supply.",
    items: [
      { t: "Water Desalination", d: "Reverse-osmosis treatment planned to support dependable availability." },
      { t: "Atmospheric Water Generation", d: "Thin Air technology extracts water from atmospheric air." },
    ],
    at: [0.50, 0.54, 0.68, 0.72],
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
  { label: "Air", range: [0.04, 0.26] as const },
  { label: "Energy", range: [0.26, 0.5] as const },
  { label: "Water", range: [0.5, 0.72] as const },
  { label: "Arrival", range: [0.72, 1.01] as const },
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
  const endOp = useTransform(p, [0.74, 0.84], [0, 1]);
  const endY = useTransform(p, [0.74, 0.84], [12, 0]);

  if (reduced) return <StaticSystems />;

  return (
    <section
      id="route"
      ref={sectionRef}
      data-section="route"
      aria-labelledby="route-heading"
      className="relative lg:h-[290svh]"
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
          /* The approved heading is half again as long as the one this was
             sized for, so at the old width it ran to three lines and the
             third landed inside the Wind Catcher card. Wider column, smaller
             ceiling: it holds two lines and clears the card. */
          className="absolute top-[5%] left-[6%] z-30 max-w-[34rem] lg:top-[6%] lg:left-[7%] lg:max-w-[44rem]"
          style={{ opacity: headOp, y: headY }}
        >
          <motion.p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: eyebrowColour }}>
            02 — Natural Systems
          </motion.p>
          <h2
            id="route-heading"
            className="font-display mt-4 leading-[1.06]"
            style={{ fontSize: "clamp(1.85rem,2.9vw,3.05rem)", fontWeight: 500 }}
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

/** The frames that carry the project's two innovations. Named by source so
 *  the desktop stage and the phone cannot drift apart on which they are. */
const EMPHASIS_FRAMES = new Set(["/sys-kite.jpg", "/sys-atmospheric-water.jpg"]);

function MobileStill({
  f,
  className,
  width,
  index,
  emphasis = false,
  active = true,
}: {
  f: StageFrame;
  className: string;
  width: string;
  index: number;
  /** the one frame in its stage that carries the idea — given a slow float
   *  and a champagne ring so it reads as the innovation, not a third photo */
  emphasis?: boolean;
  /** whether its stage is the one currently holding the screen: the active
   *  system's stills come forward, the others sit back a step */
  active?: boolean;
}) {
  const reduced = useReducedMotion();
  /* These were built in discrete courses like the desktop stage. On a phone
     the clipPath holds the still at zero height until the observer fires, and
     a thumb crossing the trigger band faster than the courses can lay leaves
     a photograph that is half-drawn or never drawn at all. A still is not a
     wall: it arrives, with a short fade and a small rise. */
  const build = reduced
    ? {}
    : {
        opacity: { duration: M.media, delay: index * 0.1, ease: M.ease },
        y: { duration: M.media, delay: index * 0.1, ease: M.ease },
      };

  return (
    <motion.figure
      initial={reduced ? undefined : "raw"}
      whileInView={reduced ? undefined : "built"}
      viewport={{ once: true, amount: 0.3 }}
      className={`absolute ${emphasis ? "z-30" : "z-20"} ${className}`}
      style={{ width }}
      /* a slow rise and fall, closer to a tethered wing holding station than
         to a UI animation — long period, a few pixels of travel */
      animate={reduced || !emphasis ? undefined : { y: [0, -7, 0] }}
      transition={
        reduced || !emphasis
          ? undefined
          : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* THE SPOTLIGHT — the active system's stills come forward a step and
          the others fall back. Scale and opacity only, so nothing reflows
          and the panels underneath never move. */}
      <motion.div
        className="relative"
        animate={reduced ? undefined : { scale: active ? 1 : 0.945, opacity: active ? 1 : 0.72 }}
        transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
      >
      {emphasis && !reduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-[16px] border"
          style={{ borderColor: "rgba(201,147,85,0.65)" }}
          animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.035, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        className="glass-light relative overflow-hidden rounded-[12px] p-1"
        style={
          emphasis
            ? { boxShadow: "0 18px 40px -20px rgba(148,63,45,0.6)" }
            : undefined
        }
        variants={{
          raw: { opacity: 0, y: 14 },
          built: { opacity: 1, y: 0 },
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
          <Image
            src={f.src}
            alt={f.alt}
            fill
            /* the card paints at ~166px, but a phone renders it at 2-3x, and
               the picked candidate tracked this hint rather than the hint
               times DPR — declaring the painted width served a 175px file
               into a 500px slot, which is what made these read as soft */
            sizes="520px"
            className="object-cover"
            style={{ objectPosition: f.pos }}
          />
        )}
      </div>
      <figcaption
        className="px-1 pt-1 pb-0.5 text-center text-[0.44rem] font-bold tracking-[0.16em] uppercase"
        style={{ color: "#94432F" }}
      >
        {f.label}
      </figcaption>
      </motion.div>
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

  /* the heading lights letter by letter as it rises, the same move the
     desktop stage makes — and the facade behind it deepens as they turn so
     cream type never has to sit on bright sky */
  const headRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: headRaw } = useScroll({
    target: headRef,
    offset: ["start 0.88", "end 0.62"],
  });
  const hp = useSpring(headRaw, { stiffness: 90, damping: 26, mass: 0.35 });
  const headWash = useTransform(hp, [0, 0.14, 0.44], [0, 0.6, 0.92]);

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
      {/* ---------------- the building, descending through the section ----
          The same gesture as desktop, now actually pinned on mobile: the
          layer sticks to the viewport for the length of the section, and
          the render travels inside it. Previously it was a static
          full-section layer, so the building never moved — it just sat
          there hugely over-scaled.

          The travel is solved, not guessed. The inner layer is 152% of the
          viewport, so 52svh of it is out of frame; expressed as a share of
          the layer's own height that is 52/152 = 34.2%. Moving it -34%
          therefore lands the foot of the render exactly as the section
          ends — crown at "Nature, engineered…", entrance at the close —
          and because the driver is this section's own 0→1 scroll progress,
          the background and the cards in front advance on one clock. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 h-[152%] will-change-transform"
            style={{ y: buildingY }}
          >
            {/* a mobile-only master: the source render carries its own pale
                cream surround, and on a narrow layer that surround was what
                read as white glare down the sides. This copy is trimmed to
                the façade itself, so no edge of the render can show however
                the layer crops. */}
            <Image
              src="/building-mobile.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "50% 50%" }}
            />
          </motion.div>
          {/* No full-cover wash any more — that sheet of cream over the whole
              façade was the glare. Only the head is lifted, and it is clear
              by a third of the way down; the cards carry their own legibility
              from here. */}
          <span
            className="absolute inset-x-0 top-0 h-[38%]"
            style={{
              background:
                "linear-gradient(180deg, rgb(245 237 227 / 0.58) 0%, rgb(245 237 227 / 0.20) 55%, rgb(245 237 227 / 0) 100%)",
            }}
          />
        </div>
      </div>

      {/* ---------------- heading ---------------------------------------- */}
      <div ref={headRef} className="relative px-5 pt-12">
        {/* the wash rides with the letters, not the scroll position */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 -bottom-4"
          style={{
            opacity: headWash,
            background:
              "linear-gradient(180deg, rgb(24 13 8 / 0.78) 0%, rgb(24 13 8 / 0.72) 62%, rgb(24 13 8 / 0.38) 88%, transparent 100%)",
          }}
        />
        <p className="relative text-[0.6rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#C99355" }}>
          02 — Natural Systems
        </p>
        <h2 id="route-heading" className="font-display relative mt-3 text-[2.1rem] leading-[1.06] font-medium">
          <span className="sr-only">{HEADING_TEXT}</span>
          <LitText p={hp} text={HEADING_TEXT} start={0.04} span={0.5} win={0.09} from={INK} to="#FFF8EF" />
        </h2>
        <p className="relative mt-3 text-[0.92rem] leading-relaxed">
          <span className="sr-only">{LEAD_TEXT}</span>
          <LitText p={hp} text={LEAD_TEXT} start={0.24} span={0.5} win={0.06} from="rgba(43,33,29,0.82)" to="rgba(244,231,214,0.94)" />
        </p>
      </div>

      {/* ---------------- stage control, joined to the heading ----------- */}
      <div className="sticky top-[68px] z-30 mt-4 px-4 pb-2">
        {/* no tray behind the tabs — each capsule carries its own ground so
            the facade stays visible between them */}
        <ul className="flex gap-2">
          {STAGES.map((st, i) => (
            <li key={st.eyebrow} className="flex-1">
              <button
                type="button"
                onClick={() => panels.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                aria-current={active === i ? "true" : undefined}
                /* flex-1 already stops these three colliding, so they keep
                   their own uppercase type; truncate is only a safety net so a
                   longer label degrades to an ellipsis instead of spilling. */
                className={`w-full truncate rounded-full px-2 text-[0.64rem] font-bold tracking-[0.14em] uppercase transition-colors duration-300 ${
                  active === i ? "" : "glass-light"
                }`}
                style={{
                  minHeight: 40,
                  ...(active === i
                    ? {
                        background: "#B65438",
                        color: "#FAF6F0",
                        border: "1px solid transparent",
                        boxShadow: "0 10px 22px -12px rgba(148,63,45,0.65)",
                      }
                    : { color: "rgba(43,33,29,0.72)" }),
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
          className="relative scroll-mt-[124px] px-4 pt-14 pb-10"
        >
          {/* Sizes are per stage rather than one figure for all three: the
              energy stage carries three stills and the water stage two, so
              the same percentage reads generous in one and cramped in the
              other. Water is deliberately the largest pair — it was the
              least legible of the three on a phone. */}
          <MobileStill
            f={st.frames[0]}
            index={0}
            active={active === i}
            width={st.frames[2] ? "42%" : i === 2 ? "48%" : "44%"}
            className="top-0 right-5 rotate-[2.2deg]"
          />

          {/* The emphasis is on THIS card, not on the article around it —
             the stills and the section behind hold still, so the panel
             reads as coming forward rather than the page jumping. */}
          <motion.div
            className="relative rounded-[20px] border px-6 pt-20 pb-6"
            style={{
              /* mobile only — the desktop cards are unchanged. Dropped from
                 0.97 to 0.82 so the façade reads through the card instead of
                 being blanked out behind it; the blur keeps the copy clean
                 over the balcony detail moving underneath. */
              background: "rgba(250,246,240,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              transformOrigin: "50% 30%",
            }}
            animate={
              reduced
                ? undefined
                : active === i
                  ? {
                      scale: 1.02,
                      y: -4,
                      borderColor: "rgba(201,147,85,0.75)",
                      boxShadow: "0 30px 60px -28px rgba(36,27,23,0.62)",
                    }
                  : {
                      scale: 1,
                      y: 0,
                      borderColor: "rgba(201,147,85,0.45)",
                      boxShadow: "0 22px 46px -30px rgba(36,27,23,0.5)",
                    }
            }
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[0.58rem] font-bold tracking-[0.22em] uppercase" style={{ color: "#B65438" }}>
              {st.eyebrow}
            </p>
            <h3 className="font-display mt-2.5 text-[1.7rem] leading-[1.1] font-medium" style={{ color: "#94432F" }}>
              {st.heading}
            </h3>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#2B211D]/88">{st.copy}</p>
            {/* each system resolves out of a soft blur as it is reached,
                one after the next — the reveal that makes the water systems
                in particular feel like arrivals rather than a bullet list */}
            <div className="mt-4">
              {st.items.map((it, k) => (
                <SystemRow
                  key={it.t}
                  item={it}
                  j={k}
                  tone="mobile"
                  spotlight={SPOTLIT.has(it.t)}
                />
              ))}
            </div>
            {/* clear space for whichever stills sit over the card's foot */}
            {st.frames[1] && (
              <div aria-hidden="true" className={st.frames[2] ? "h-36" : i === 2 ? "h-28" : "h-24"} />
            )}
          </motion.div>

          {st.frames[1] && (
            <MobileStill
              f={st.frames[1]}
              index={1}
              active={active === i}
              /* Atmospheric Water Generation is the water stage's innovation
                 the way the kite is energy's, so it carries the same ring
                 and float rather than sitting as a plain second photo. */
              emphasis={i === 2}
              width={st.frames[2] ? "36%" : i === 2 ? "46%" : "41%"}
              className={
                st.frames[2]
                  ? "bottom-7 left-5 -rotate-[2.4deg]"
                  : "bottom-4 left-6 -rotate-[2.4deg]"
              }
            />
          )}

          {/* The third frame — Kite Energy — was simply never rendered below
              lg, so the one system that makes this project distinctive was
              invisible on a phone. It gets the emphasis treatment and the
              largest share of the row. */}
          {st.frames[2] && (
            <MobileStill
              f={st.frames[2]}
              index={2}
              active={active === i}
              width="46%"
              /* bottom-5, not bottom-1: the next stage's own top still sits
                 at the article seam, and at this size the two met there */
              className="right-4 bottom-5 rotate-[2.2deg]"
              emphasis
            />
          )}
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
  /* the card sits fractionally forward while its system is the active one,
     then settles back as it leaves — the card only; the stills and the stage
     behind it never move */
  const scale = useTransform(p, st.at, [0.985, 1.02, 1.02, 1]);
  /* the spotlight window for this stage's innovation row: it lifts once the
     stage has landed and settles again before the stage leaves. The row is on
     a pinned stage, so it cannot measure its own crossing — this is the only
     progress that actually moves while the card is held. */
  const rowLit = useTransform(
    p,
    [
      st.at[1],
      st.at[1] + (st.at[2] - st.at[1]) * 0.3,
      st.at[2] - (st.at[2] - st.at[1]) * 0.12,
      st.at[2],
    ],
    [0, 1, 1, 0]
  );
  const cardShadow = useTransform(p, st.at, [
    "0 18px 40px -26px rgba(36,27,23,0.42)",
    "0 34px 66px -30px rgba(36,27,23,0.6)",
    "0 34px 66px -30px rgba(36,27,23,0.6)",
    "0 18px 40px -26px rgba(36,27,23,0.42)",
  ]);
  return (
    <>
      {/* the printed editorial note */}
      <motion.div
        className={`absolute z-30 w-[min(92vw,28rem)] overflow-hidden p-7 lg:w-[21rem] lg:p-6 xl:w-[27rem] xl:p-8 ${st.card}`}
        style={{ opacity, x, y, scale, clipPath: clip, ...CARD_STYLE, boxShadow: cardShadow }}
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
            <SystemRow
              key={item.t}
              item={item}
              j={j}
              spotlight={SPOTLIT.has(item.t)}
              emphasis={rowLit}
            />
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

  /* The two systems that carry the project's innovation get the same
     emphasis on desktop as on the phone. A ring is not an option here —
     the figure is overflow-hidden for the course-laying clip, which would
     cut it — so the lift is carried by a warm glow, which paints outside
     the clip, and a slow float. */
  const reduced = useReducedMotion();
  const emphasis = EMPHASIS_FRAMES.has(f.src);

  return (
    <motion.figure
      className={`absolute z-20 hidden overflow-hidden rounded-[12px] border bg-[#FAF6F0] p-1 lg:block ${
        emphasis ? "border-[#C99355]/85" : "border-[#C99355]/55"
      } ${f.className}`}
      style={{
        opacity,
        scale,
        clipPath: clip,
        boxShadow: emphasis
          ? "0 0 0 1px rgba(201,147,85,0.35), 0 26px 60px -26px rgba(148,63,45,0.75)"
          : "0 24px 48px -28px rgba(20,10,6,0.55)",
      }}
      animate={reduced || !emphasis ? undefined : { y: [0, -6, 0] }}
      transition={
        reduced || !emphasis ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }
      }
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
            sizes="40rem"
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

/**
 * One system row inside a stage card, with a scroll-scrubbed spotlight.
 *
 * The emphasis exists for the row that carries the stage's innovation —
 * Kite Energy in the renewable stage, Atmospheric Water in the water one.
 * It is deliberately confined to the row: the card, the stills and the
 * section behind it never move, so the effect reads as one line coming
 * forward rather than the layout shifting.
 *
 * `emphasis` is supplied by the caller when the row sits on a PINNED stage,
 * where the element itself never travels and its own scroll offset would
 * stay flat. Otherwise the row measures its own crossing of the viewport,
 * which is what lets it settle back as the scroll leaves.
 */
function SystemRow({
  item,
  j,
  spotlight,
  emphasis,
  tone = "desktop",
}: {
  item: { t: string; d?: string };
  j: number;
  /** does this row carry the stage's innovation */
  spotlight: boolean;
  emphasis?: MotionValue<number>;
  tone?: "desktop" | "mobile";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* rise as the row comes up the screen, hold, settle as it leaves */
  const own = useTransform(scrollYProgress, [0.24, 0.44, 0.66, 0.84], [0, 1, 1, 0]);
  const raw = emphasis ?? own;
  const lit = useSpring(raw, { stiffness: 120, damping: 26, mass: 0.3 });

  const on = spotlight && !reduced;
  const y = useTransform(lit, [0, 1], [0, -5]);
  const scale = useTransform(lit, [0, 1], [1, 1.022]);
  const titleColor = useTransform(lit, [0, 1], [INK, "#A8492F"]);
  const descColor = useTransform(
    lit,
    [0, 1],
    tone === "mobile"
      ? ["rgba(43,33,29,0.82)", "rgba(43,33,29,1)"]
      : ["rgba(42,30,26,0.64)", "rgba(42,30,26,0.92)"]
  );
  const glow = useTransform(lit, [0, 1], [0, 1]);

  const titleCls =
    tone === "mobile" ? "text-[0.86rem] font-semibold" : "text-[0.92rem] font-semibold";
  const descCls =
    tone === "mobile"
      ? "mt-0.5 text-[0.8rem] leading-snug"
      : "mt-1 text-[0.82rem] leading-[1.6]";

  return (
    <motion.div
      ref={ref}
      className={
        tone === "mobile"
          ? "relative border-t border-[#94432F]/12 py-2.5 first:border-t-0 first:pt-0"
          : j > 0
            ? "relative mt-3 border-t pt-3"
            : "relative"
      }
      style={{
        ...(tone === "desktop" && j > 0 ? { borderColor: "rgba(170,95,61,0.16)" } : {}),
        ...(on ? { y, scale, transformOrigin: "0% 50%" } : {}),
      }}
    >
      {on && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-3 -inset-y-1.5 -z-10 rounded-[12px]"
          style={{
            opacity: glow,
            background:
              "radial-gradient(70% 120% at 12% 50%, rgba(201,147,85,0.28) 0%, rgba(201,147,85,0.10) 46%, transparent 78%)",
          }}
        />
      )}
      <motion.p className={titleCls} style={on ? { color: titleColor } : { color: INK }}>
        {item.t}
      </motion.p>
      {item.d && (
        <motion.p
          className={descCls}
          style={
            on
              ? { color: descColor }
              : { color: tone === "mobile" ? "rgba(43,33,29,0.82)" : "rgba(42,30,26,0.64)" }
          }
        >
          {item.d}
        </motion.p>
      )}
    </motion.div>
  );
}

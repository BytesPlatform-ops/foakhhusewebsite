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
 * 04 — Renewable & Resource Systems: a pinned horizontal card story.
 *
 * Merges the former Power, Solar/Harmony and Water sections into one
 * editorial gallery (agencefoudre card rhythm, translated to quiet
 * luxury): intro anchor -> three substantial centred visual cards with
 * minimal side text -> a soft closing line. Native vertical scroll
 * drives the horizontal track; each card enters with a gentle fade,
 * 0.96 -> 1 settle, and the media card / side text parallax at slightly
 * different rates. Nothing loops; the story settles.
 *
 * The 60% savings statement and its qualification render as ONE unit in
 * Card 02 — the footnote is structurally inseparable from the claim.
 *
 * Mobile and reduced-motion render the same story as stacked panels —
 * no pin, no horizontal trap.
 */

/* Global warm-editorial tokens (see globals.css :root) — a bright
   architectural-magazine spread, not a dark dashboard. */
const C = {
  bg: "#F6EBDD",
  surface: "#FFF5E9",
  ivory: "#943F2D", /* display headings — deep terracotta on ivory */
  muted: "rgba(33, 26, 23, 0.5)",
  body: "rgba(41, 74, 62, 0.88)", /* body — deep forest, small sizes only */
  champagne: "#A9803C", /* champagne deepened for text legibility */
  teal: "#659B98",
  amber: "#E5AD42",
  terracotta: "#C75B3B",
  sage: "#6E8163",
};

interface StoryCard {
  num: string;
  label: string;
  heading: React.ReactNode;
  body: string;
  secondary?: string;
  extra?: string;
  points?: { t: string; d: string }[];
  note: string;
  spec?: string;
  media: "solar" | "systems" | "water";
  accent: string;
}

const CARDS: StoryCard[] = [
  {
    num: "01",
    label: "Main Advantages",
    heading: (
      <>
        A smarter way
        <span className="block">to live.</span>
      </>
    ),
    body: "Natural airflow, renewable power and thoughtful planning come together in one landmark development.",
    points: [
      { t: "Naturally Cooler Environment", d: "Captured wind is circulated through the corridor network to help reduce heat buildup in common areas." },
      { t: "Up to 60% Bill Reduction", d: "Wind and solar energy are intended to reduce conventional electricity use, subject to final engineering performance." },
      { t: "Wind-Generated Power", d: "Integrated wind turbines convert available wind into renewable electricity for selected building requirements." },
      { t: "Solar Energy Support", d: "Solar panels complement the wind-energy system to maximise the use of natural resources." },
      { t: "Clean Water Planning", d: "A planned water-treatment and desalination solution supports a dependable water supply." },
      { t: "Long-Term Value", d: "Limited inventory, a distinctive sustainability concept and a growing location strengthen the project's long-term potential." },
    ],
    note: "The stated savings are projected targets and may vary according to wind conditions, solar output, occupancy, appliance usage, tariff changes and final system specifications.",
    spec: "Wind · Solar · Airflow · Water",
    media: "systems",
    accent: C.teal,
  },
  {
    num: "02",
    label: "Wind-Catcher Concept",
    heading: (
      <>
        The heart of the
        <span className="block">wind corridor.</span>
      </>
    ),
    body: "The defining feature of the project is its dedicated wind catcher. Rather than relying on balconies or windows to collect air, the wind catcher is positioned and engineered to intercept high-velocity natural wind from the surrounding environment.",
    secondary:
      "The captured air is then directed into the building's central corridor system, where it circulates through corridors, elevator lobbies and shared circulation areas — a controlled movement of air intended to create a fresher, cooler and more comfortable internal environment.",
    points: [
      { t: "Dedicated Wind Catcher", d: "The primary structure that captures and channels high-velocity natural air." },
      { t: "Central Corridor Distribution", d: "Captured air is guided through the internal corridor network." },
      { t: "Cooler Shared Areas", d: "Continuous airflow helps reduce trapped heat in corridors and elevator lobbies." },
      { t: "Reduced Cooling Demand", d: "Improved natural ventilation may lower dependence on mechanical cooling in common spaces." },
    ],
    note: "The project aims to become an epicentre of wind circulation through an architectural approach presented as a first-of-its-kind residential concept in Pakistan, subject to final technical validation and project certification.",
    media: "solar",
    accent: C.amber,
  },
  {
    num: "03",
    label: "Sustainability",
    heading: (
      <>
        Powered by
        <span className="block">natural resources.</span>
      </>
    ),
    body: "The Wind Corridor Residences has been conceived to make meaningful use of available natural resources. Wind turbines and solar panels are planned to generate renewable electricity, while the dedicated wind-catcher system channels natural air through the building's internal corridor network.",
    secondary:
      "Together, these systems are intended to reduce dependence on conventional electricity, improve comfort in shared areas and support potential electricity-bill savings of up to 60%, subject to final design, testing and operating conditions.",
    points: [
      { t: "Wind Energy", d: "Turbines planned to convert natural wind into usable electricity." },
      { t: "Solar Energy", d: "Solar panels planned to supplement renewable power generation." },
      { t: "Natural Air Circulation", d: "A wind catcher directs high-velocity air through central corridors and common spaces." },
      { t: "Responsible Water Use", d: "Treatment and desalination planning support dependable water management." },
      { t: "Lower Environmental Impact", d: "Reduced reliance on conventional energy sources." },
      { t: "Future-Ready Design", d: "An innovative concept created for responsible urban living in Pakistan." },
    ],
    note: "The stated savings are projected targets and may vary according to wind conditions, solar output, occupancy, appliance usage, tariff changes and final system specifications.",
    media: "water",
    accent: C.teal,
  },
];

export default function WindTunnel() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 28, mass: 0.4 });

  const trackX = useTransform(p, [0.04, 0.9], ["0vw", "-300vw"]);

  /* per-panel windows (focal points along the 300vw travel) */
  const introOp = useTransform(p, [0, 0.08, 0.14], [1, 1, 0]);
  const closeOp = useTransform(p, [0.8, 0.9], [0, 1]);
  const closeY = useTransform(p, [0.8, 0.9], [18, 0]);
  const progressLabel = [
    useTransform(p, [0.08, 0.14, 0.3, 0.36], [0, 1, 1, 0]),
    useTransform(p, [0.3, 0.36, 0.55, 0.61], [0, 1, 1, 0]),
    useTransform(p, [0.55, 0.61, 0.82, 0.88], [0, 1, 1, 0]),
  ];

  if (reduced) return <StackedStory />;

  return (
    <section
      id="wind"
      ref={sectionRef}
      data-section="wind"
      aria-labelledby="wind-heading"
      className="relative lg:h-[380svh]"
      style={{ background: C.bg }}
    >
      <h2 id="wind-heading" className="sr-only">
        Renewable and resource systems — power, solar harmony and water planning
      </h2>

      {/* ---------------- mobile: stacked story ---------------- */}
      <div className="lg:hidden">
        <StackedStory embedded />
      </div>

      {/* ---------------- desktop: pinned horizontal gallery ----------------
          NOTE: wrapper must inherit the section's full height — sticky
          containment is the parent block, and an auto-height wrapper would
          leave the stage no room to travel. */}
      <div className="hidden lg:block lg:h-full">
        <div className="sticky top-0 h-svh overflow-hidden">
          <Ambience />

          <p
            className="absolute top-[6%] left-[8%] z-40 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: C.champagne }}
          >
            02 — Natural Systems · In Depth
          </p>

          {/* compact progress — bottom left */}
          <div className="absolute bottom-[6%] left-[8%] z-40 flex items-center gap-4">
            {CARDS.map((card, i) => (
              <motion.span
                key={card.num}
                className="text-[0.68rem] font-semibold tabular-nums"
                style={{ color: C.champagne, opacity: progressLabel[i] }}
              >
                {card.num} / 03
              </motion.span>
            ))}
            <span className="h-px w-12" style={{ background: `${C.champagne}45` }} />
            <span className="text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: C.muted }}>
              Wind · Solar · Water
            </span>
          </div>

          <motion.div className="absolute top-0 left-0 h-full w-[400vw]" style={{ x: trackX }}>
            {/* ---- intro anchor ---- */}
            <motion.div
              className="absolute top-0 left-[6vw] flex h-full w-[38vw] flex-col justify-center"
              style={{ opacity: introOp }}
            >
              <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: C.champagne }}>
                Advantages · Wind catcher · Sustainability
              </p>
              <p
                className="font-display mt-6 leading-[1.05] font-medium"
                style={{ color: C.ivory, fontSize: "clamp(2.6rem,3.4vw,3.6rem)" }}
              >
                The systems behind the corridor, in depth.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.22em] uppercase" style={{ color: C.muted }}>
                Scroll <span aria-hidden="true">→</span>
              </p>
            </motion.div>

            {/* ---- the three cards ---- */}
            {CARDS.map((card, i) => (
              <StoryPanel key={card.num} card={card} index={i} progress={p} left={52 + i * 86} />
            ))}

            {/* ---- closing ---- */}
            <motion.div
              className="absolute top-0 left-[314vw] flex h-full w-[58vw] flex-col justify-center"
              style={{ opacity: closeOp, y: closeY }}
            >
              <span className="h-px w-16" style={{ background: `${C.champagne}66` }} />
              <p
                className="font-display mt-7 max-w-[16ch] leading-[1.08] font-medium"
                style={{ color: C.ivory, fontSize: "clamp(2.4rem,3.2vw,3.4rem)" }}
              >
                One carefully considered environment.
              </p>
              <p className="mt-5 max-w-md text-[0.95rem] leading-[1.6]" style={{ color: C.body }}>
                Every system described here is planned and engineered as part of a single
                residential concept — subject to final engineering, approvals and
                specifications.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==================== desktop card panel ==================== */

function StoryPanel({
  card,
  index,
  progress,
  left,
}: {
  card: StoryCard;
  index: number;
  progress: MotionValue<number>;
  left: number;
}) {
  // focal windows along the travel
  const focal = [0.19, 0.44, 0.68][index];
  const win = 0.13;
  const op = useTransform(
    progress,
    [focal - win, focal - win * 0.55, focal + win * 0.8, focal + win * 1.4],
    [0, 1, 1, 0.25],
  );
  const settle = useTransform(progress, [focal - win, focal], [0.96, 1]);
  // media and text drift at slightly different rates
  const mediaY = useTransform(progress, [focal - win, focal + win], ["2.5svh", "-2.5svh"]);
  const textX = useTransform(progress, [focal - win, focal + win], ["1.5vw", "-1vw"]);

  return (
    <motion.article
      className="absolute top-0 flex h-full w-[86vw] items-center"
      style={{ left: `${left}vw`, opacity: op }}
      aria-label={`${card.num} — ${card.label}`}
    >
      <div className="grid w-full grid-cols-[19%_1fr_24%] items-center gap-[2.5vw] pr-[3vw] pl-[6vw]">
        {/* LEFT — chapter marker + heading */}
        <motion.div style={{ x: textX }}>
          <p className="text-[0.72rem] font-semibold tabular-nums" style={{ color: C.champagne }}>
            {card.num}
          </p>
          <p className="mt-1.5 text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: C.muted }}>
            {card.label}
          </p>
          <p
            className="font-display mt-6 leading-[1.02] font-medium"
            style={{ color: C.ivory, fontSize: "clamp(1.9rem,2.5vw,2.7rem)" }}
          >
            {card.heading}
          </p>
          {card.spec && (
            <p className="mt-7 text-[0.58rem] tracking-[0.24em] uppercase" style={{ color: C.muted }}>
              {card.spec}
            </p>
          )}
        </motion.div>

        {/* CENTER — the dominant visual card, slightly above centre */}
        <motion.figure
          className="relative -mt-[4svh] h-[62svh] overflow-hidden rounded-[10px] border border-[#D8B36A]/55 bg-[#FFF8EF] shadow-[0_36px_70px_-38px_rgba(148,63,45,0.4)]"
          style={{ scale: settle, y: mediaY }}
        >
          <CardMedia media={card.media} accent={card.accent} />
        </motion.figure>

        {/* RIGHT — short copy + notes */}
        <motion.div style={{ x: useTransform(textX, (v) => `calc(${v} * -0.7)`) }}>
          <p className="text-[0.88rem] leading-[1.6]" style={{ color: C.body }}>
            {card.body}
          </p>
          {card.secondary && (
            <p className="mt-3 text-[0.78rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.6)" }}>
              {card.secondary}
            </p>
          )}
          {card.extra && (
            <p className="mt-3 text-[0.78rem] leading-[1.6]" style={{ color: C.sage }}>
              {card.extra}
            </p>
          )}
          {card.points && (
            <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: "rgba(216,179,106,0.4)" }}>
              {card.points.map((pt) => (
                <li key={pt.t}>
                  <p className="text-[0.78rem] font-semibold" style={{ color: C.ivory }}>
                    {pt.t}
                  </p>
                  <p className="text-[0.74rem] leading-[1.55]" style={{ color: C.body }}>
                    {pt.d}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-[0.6rem] leading-relaxed tracking-[0.12em] uppercase" style={{ color: C.muted }}>
            {card.note}
          </p>
        </motion.div>
      </div>
    </motion.article>
  );
}

/* ==================== media ==================== */

function CardMedia({ media, accent }: { media: StoryCard["media"]; accent: string }) {
  if (media === "water") return <WaterPanel />;
  const src = media === "solar" ? "/route-solar.jpg" : "/route-exterior.jpg";
  const alt =
    media === "solar"
      ? "Low-angle rooftop solar panels within the terracotta architecture, wind line reflected across the cells"
      : "Rooftop energy systems above the development — solar array, wind equipment and landscape at first light";
  return (
    <>
      <Image src={src} alt={alt} fill sizes="46vw" className="object-cover" style={{ objectPosition: "55% 45%" }} />
      {/* quiet grade + one accent hairline */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, rgb(229 173 66 / 0.1) 0%, transparent 38%, rgb(33 26 23 / 0.2) 100%)",
        }}
      />
      <span aria-hidden="true" className="absolute right-0 bottom-0 left-0 h-[2px]" style={{ background: `${accent}88` }} />
    </>
  );
}

/** Original abstract water composition — architectural calm, no machinery. */
function WaterPanel() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, #24312f 0%, #2c403e 46%, #1c2a29 100%)`,
      }}
    >
      <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="wp-shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1E8DA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F1E8DA" stopOpacity="0" />
          </linearGradient>
          <filter id="wp-caustic">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.75  0 0 0 0 0.73  0 0 0 -1.3 0.7" />
          </filter>
        </defs>
        {/* soft caustic field */}
        <rect width="600" height="800" filter="url(#wp-caustic)" opacity="0.1" />
        {/* one shaft of light entering the water */}
        <polygon points="330,0 430,0 520,800 260,800" fill="url(#wp-shaft)" opacity="0.5" />
        {/* the water line + architectural horizon */}
        <line x1="0" y1="300" x2="600" y2="300" stroke="#F1E8DA" strokeOpacity="0.28" strokeWidth="1.5" />
        <line x1="0" y1="306" x2="600" y2="306" stroke="#6F9B98" strokeOpacity="0.3" strokeWidth="1" />
        {/* concentric ripple geometry, still and composed */}
        {[52, 96, 148, 208].map((r, i) => (
          <ellipse
            key={r}
            cx="300"
            cy="520"
            rx={r}
            ry={r * 0.32}
            fill="none"
            stroke="#6F9B98"
            strokeOpacity={0.5 - i * 0.1}
            strokeWidth={1.6 - i * 0.25}
          />
        ))}
        <circle cx="300" cy="520" r="4" fill="#C5A46C" opacity="0.85" />
        {/* falling droplet path — a single fine line */}
        <line x1="300" y1="330" x2="300" y2="508" stroke="#F1E8DA" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="1 7" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(110% 90% at 50% 40%, transparent 55%, rgb(16 20 19 / 0.5) 100%)" }}
      />
    </div>
  );
}

/* ==================== ambience ==================== */

function Ambience() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div
        className="absolute top-[12%] left-[2%] h-[50%] w-[40%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${C.amber}30, transparent 72%)` }}
      />
      <div
        className="absolute top-[20%] right-[4%] h-[55%] w-[42%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${C.terracotta}26, transparent 72%)` }}
      />
      <div
        className="absolute bottom-[8%] left-[30%] h-[36%] w-[36%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${C.teal}2e, transparent 72%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 50% 45%, transparent 60%, rgb(199 91 59 / 0.1) 100%)" }}
      />
      <div className="grain absolute inset-0" />
    </div>
  );
}

/* ==================== stacked story (mobile + reduced motion) ========= */

function StackedStory({ embedded = false }: { embedded?: boolean }) {
  const body = (
    <div className="relative mx-auto max-w-2xl px-6 py-20">
      <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: C.champagne }}>
        02 — Natural Systems · In Depth
      </p>
      <p
        className="font-display mt-5 leading-[1.08] font-medium"
        style={{ color: C.ivory, fontSize: "clamp(2.2rem,7vw,3rem)" }}
      >
        The systems behind the corridor, in depth.
      </p>

      <div className="mt-12 space-y-16">
        {CARDS.map((card) => (
          <article key={card.num} aria-label={`${card.num} — ${card.label}`}>
            <p className="text-[0.72rem] font-semibold tabular-nums" style={{ color: C.champagne }}>
              {card.num} <span style={{ color: C.muted }}>/ 03</span>
            </p>
            <p className="mt-1 text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: C.muted }}>
              {card.label}
            </p>
            <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-[10px] sm:aspect-[4/3]">
              <CardMedia media={card.media} accent={card.accent} />
            </div>
            <p
              className="font-display mt-5 leading-[1.05] font-medium"
              style={{ color: C.ivory, fontSize: "clamp(1.7rem,5.4vw,2.3rem)" }}
            >
              {card.heading}
            </p>
            <p className="mt-3 text-[0.9rem] leading-[1.6]" style={{ color: C.body }}>
              {card.body}
            </p>
            {card.secondary && (
              <p className="mt-2 text-[0.85rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.6)" }}>
                {card.secondary}
              </p>
            )}
            {card.points && (
              <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: "rgba(216,179,106,0.4)" }}>
                {card.points.map((pt) => (
                  <li key={pt.t}>
                    <p className="text-[0.82rem] font-semibold" style={{ color: C.ivory }}>
                      {pt.t}
                    </p>
                    <p className="text-[0.78rem] leading-[1.55]" style={{ color: C.body }}>
                      {pt.d}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[0.6rem] leading-relaxed tracking-[0.12em] uppercase" style={{ color: C.muted }}>
              {card.note}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-16">
        <span className="block h-px w-16" style={{ background: `${C.champagne}66` }} />
        <p className="font-display mt-6 leading-[1.1] font-medium" style={{ color: C.ivory, fontSize: "1.5rem" }}>
          One carefully considered environment.
        </p>
        <p className="mt-3 text-[0.85rem] leading-[1.6]" style={{ color: C.body }}>
          Every system described here is planned and engineered as part of a single
          residential concept — subject to final engineering, approvals and specifications.
        </p>
      </div>
    </div>
  );

  if (embedded) return body;
  return (
    <section
      id="wind"
      data-section="wind"
      aria-labelledby="wind-heading"
      className="relative"
      style={{ background: C.bg }}
    >
      <h2 id="wind-heading" className="sr-only">
        Renewable and resource systems — power, solar harmony and water planning
      </h2>
      {body}
    </section>
  );
}

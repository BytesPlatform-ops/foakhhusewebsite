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

const C = {
  bg: "#202522",
  surface: "#2B302D",
  ivory: "#F1E8DA",
  muted: "rgba(241, 232, 218, 0.42)",
  body: "rgba(241, 232, 218, 0.74)",
  champagne: "#C5A46C",
  teal: "#6F9B98",
  amber: "#D59B54",
  terracotta: "#9B6047",
  sage: "#879388",
};

interface StoryCard {
  num: string;
  label: string;
  heading: React.ReactNode;
  body: string;
  secondary?: string;
  extra: string;
  note: string;
  spec?: string;
  media: "solar" | "systems" | "water";
  accent: string;
}

const CARDS: StoryCard[] = [
  {
    num: "01",
    label: "Renewable Support",
    heading: (
      <>
        POWER
        <span className="block font-sans text-[0.42em] font-semibold tracking-[0.3em] uppercase">
          Shaped by
        </span>
        MOVEMENT.
      </>
    ),
    body: "Wind turbines are planned to convert available wind into renewable electricity for selected building requirements.",
    extra: "Designed to reduce dependency on conventional power sources and support long-term operational efficiency.",
    note: "Planned renewable-support system, subject to final engineering and approved specifications.",
    spec: "Wind · Solar · Airflow · Support",
    media: "solar",
    accent: C.teal,
  },
  {
    num: "02",
    label: "Systems in Concert",
    heading: (
      <>
        Wind and sunlight,
        <span className="block">working together.</span>
      </>
    ),
    body: "Solar panels are planned to complement the wind-energy system, increasing the use of available natural resources and supporting cleaner electricity generation.",
    secondary:
      "Every system in harmony — comfort is shaped not by one feature, but by how airflow, energy, water and architecture work together.",
    extra: "Integrated planning helps improve everyday comfort while making the development more resource-conscious.",
    note: "Rooftop panel arrangement shown conceptually — the project uses building-scale solar, not a solar farm.",
    media: "systems",
    accent: C.amber,
  },
  {
    num: "03",
    label: "Water Systems",
    heading: (
      <>
        Water,
        <span className="block">planned responsibly.</span>
      </>
    ),
    body: "Treatment and desalination planning support a cleaner, more dependable water system for the whole development.",
    secondary:
      "From natural force to everyday comfort — airflow, energy and water planning come together as one carefully considered residential environment.",
    extra: "Planned water resilience supports day-to-day reliability for residents and strengthens long-term building performance.",
    note: "Water-system strategy shown conceptually and subject to final engineering, environmental review and approved specifications.",
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
            04 — Renewable &amp; Resource Systems
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
                Three systems · One environment
              </p>
              <p
                className="font-display mt-6 leading-[1.05] font-medium"
                style={{ color: C.ivory, fontSize: "clamp(2.6rem,3.4vw,3.6rem)" }}
              >
                Power, sunlight and water — planned as one.
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
                A building that works with its environment.
              </p>
              <p className="mt-5 max-w-md text-[0.95rem] leading-[1.6]" style={{ color: C.body }}>
                The Wind Corridor Residences brings natural airflow, renewable-energy planning
                and modern family living into one carefully considered development.
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
          className="relative -mt-[4svh] h-[62svh] overflow-hidden rounded-[10px] shadow-[0_36px_80px_-38px_rgba(10,12,11,0.7)]"
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
            <p className="mt-3 text-[0.78rem] leading-[1.6]" style={{ color: "rgba(241,232,218,0.58)" }}>
              {card.secondary}
            </p>
          )}
          <p className="mt-3 text-[0.78rem] leading-[1.6]" style={{ color: C.sage }}>
            {card.extra}
          </p>
          {/* Card 02 carries the savings claim + its inseparable footnote */}
          {index === 1 && (
            <div className="mt-5 border-l pl-3.5" style={{ borderColor: `${C.amber}66` }}>
              <p className="font-display text-[1.15rem] leading-snug" style={{ color: C.ivory }}>
                Potential electricity-bill savings of up to 60%
                <span aria-hidden="true">*</span>
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed" style={{ color: C.muted }}>
                <span aria-hidden="true">*</span>Projected savings may vary according to wind
                conditions, solar output, occupancy, appliance usage, tariff changes and final
                system specifications.
              </p>
            </div>
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
            "linear-gradient(165deg, rgb(213 155 84 / 0.08) 0%, transparent 38%, rgb(32 37 34 / 0.28) 100%)",
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
        style={{ background: `radial-gradient(closest-side, ${C.champagne}17, transparent 72%)` }}
      />
      <div
        className="absolute top-[20%] right-[4%] h-[55%] w-[42%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${C.amber}1d, transparent 72%)` }}
      />
      <div
        className="absolute bottom-[8%] left-[30%] h-[36%] w-[36%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${C.teal}15, transparent 72%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 50% 45%, transparent 55%, rgb(16 20 19 / 0.5) 100%)" }}
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
        04 — Renewable &amp; Resource Systems
      </p>
      <p
        className="font-display mt-5 leading-[1.08] font-medium"
        style={{ color: C.ivory, fontSize: "clamp(2.2rem,7vw,3rem)" }}
      >
        Power, sunlight and water — planned as one.
      </p>

      <div className="mt-12 space-y-16">
        {CARDS.map((card, i) => (
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
            <p className="mt-2 text-[0.8rem] leading-[1.6]" style={{ color: C.sage }}>
              {card.extra}
            </p>
            {i === 1 && (
              <div className="mt-4 border-l pl-3.5" style={{ borderColor: `${C.amber}66` }}>
                <p className="font-display text-[1.1rem]" style={{ color: C.ivory }}>
                  Potential electricity-bill savings of up to 60%<span aria-hidden="true">*</span>
                </p>
                <p className="mt-2 text-[0.62rem] leading-relaxed" style={{ color: C.muted }}>
                  <span aria-hidden="true">*</span>Projected savings may vary according to wind
                  conditions, solar output, occupancy, appliance usage, tariff changes and final
                  system specifications.
                </p>
              </div>
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
          A building that works with its environment.
        </p>
        <p className="mt-3 text-[0.85rem] leading-[1.6]" style={{ color: C.body }}>
          The Wind Corridor Residences brings natural airflow, renewable-energy planning and
          modern family living into one carefully considered development.
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

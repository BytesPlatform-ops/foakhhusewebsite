"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 03 — The Residences: "Homes made for real life."
 *
 * Redesigned from the SVG plate scroll-story into one image-led editorial
 * spread (Ironhill's layered-card feeling, translated to our clay/ivory
 * identity — not its system): serif heading upper-left, a staggered
 * collage of four angled image cards centre (one primary, three
 * secondary at varying depth and scale), and the four residence
 * qualities as a quiet reading column on the right.
 *
 * Motion is calm: cards rise and settle with a stagger on entry, drift
 * on micro-parallax at slightly different rates while the section passes,
 * and lift a breath on hover. Nothing flips, nothing loops.
 */

const INK = "#241B17";
const IVORY = "#F7F0E8";

interface ResidenceCard {
  src: string;
  alt: string;
  label: string;
  line: string;
  /** collage placement (desktop) */
  className: string;
  rotate: number;
  z: number;
  /** parallax rate multiplier */
  drift: number;
  objectPosition?: string;
}

const CARDS: ResidenceCard[] = [
  {
    src: "/route-corridor.jpg",
    alt: "Warm interior corridor with soft linear light and a resident walking toward the window",
    label: "01 — Living Spaces",
    line: "Daylight crossing the floor.",
    className: "left-[6%] top-[4%] w-[46%] aspect-[4/5] z-20",
    rotate: -2.2,
    z: 20,
    drift: 1,
    objectPosition: "50% 42%",
  },
  {
    src: "/env-air.jpg",
    alt: "Sunlit terracotta opening with fabric moving in the airflow",
    label: "02 — Private Balconies",
    line: "Quieter outdoor moments.",
    className: "left-[44%] top-[-2%] w-[34%] aspect-[4/3] z-30",
    rotate: 2.6,
    z: 30,
    drift: 1.5,
    objectPosition: "60% 40%",
  },
  {
    src: "/building-approach.jpg",
    alt: "The residence facade at dusk, windows warm against the evening",
    label: "03 — Natural Light",
    line: "Orientation shaped by the sun.",
    className: "left-[54%] top-[46%] w-[36%] aspect-[4/3] z-10",
    rotate: -1.6,
    z: 10,
    drift: 0.6,
    objectPosition: "50% 26%",
  },
  {
    src: "/route-comfort.jpg",
    alt: "Residents greeting in the warm sheltered court",
    label: "04 — Everyday Comfort",
    line: "Space that holds real life.",
    className: "left-[16%] top-[58%] w-[30%] aspect-[5/4] z-30",
    rotate: 1.8,
    z: 30,
    drift: 1.2,
    objectPosition: "50% 38%",
  },
];

const QUALITIES = [
  {
    num: "01",
    title: "Living Spaces",
    copy: "Generous, well-proportioned rooms where daylight crosses the floor — spaces designed to hold real family life.",
  },
  {
    num: "02",
    title: "Private Balconies",
    copy: "Residences open outward with quieter outdoor moments, private views and a stronger sense of personal space.",
  },
  {
    num: "03",
    title: "Natural Light",
    copy: "Thoughtful orientation helps sunlight move through the home, supporting warmth, calm and everyday comfort.",
  },
  {
    num: "04",
    title: "Everyday Comfort",
    copy: "Layouts are shaped for practical living — not just visual appeal — with space that feels flexible, usable and refined.",
  },
];

export default function ResidencesStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  /* micro-parallax rates, one per card */
  const drifts = [
    useTransform(p, [0, 1], ["2.5svh", "-2.5svh"]),
    useTransform(p, [0, 1], ["4svh", "-4svh"]),
    useTransform(p, [0, 1], ["1.5svh", "-1.5svh"]),
    useTransform(p, [0, 1], ["3svh", "-3svh"]),
  ];

  return (
    <section
      id="residences"
      ref={sectionRef}
      data-section="residences"
      aria-labelledby="residences-heading"
      className="mineral-clay grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#202522" } as React.CSSProperties}
    >
      {/* soft champagne breath behind the collage */}
      <div
        aria-hidden="true"
        className="absolute top-[18%] left-[26%] h-[55%] w-[44%] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(198 164 107 / 0.5), transparent 72%)" }}
      />

      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* ---------------- heading ---------------- */}
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#F3E7D8" }}>
          03 — The Residences
        </p>
        <h2
          id="residences-heading"
          className="font-display mt-5 max-w-[13ch] leading-[1.04] font-medium text-balance"
          style={{ color: IVORY, fontSize: "clamp(2.4rem,4.8vw,4.4rem)" }}
        >
          Homes made for real life.
        </h2>
        <p className="mt-5 max-w-md text-[0.95rem] leading-[1.6]" style={{ color: "rgba(247,240,232,0.8)" }}>
          Generous, well-proportioned rooms shaped by daylight, airflow and practical family
          use.
        </p>

        {/* ---------------- collage + qualities ---------------- */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-8">
          {/* the layered card collage */}
          <div className="relative hidden aspect-[13/9] lg:block">
            {CARDS.map((card, i) => (
              <motion.figure
                key={card.label}
                className={`group absolute ${card.className}`}
                initial={reduced ? undefined : { opacity: 0, y: 34, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.85, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                style={reduced ? { rotate: card.rotate } : { y: drifts[i] }}
              >
                <div className="overflow-hidden rounded-[10px] border border-[#F7F0E8]/20 bg-[#F7F0E8] p-1.5 shadow-[0_34px_70px_-34px_rgba(26,16,11,0.65)] transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5">
                  <div className={`relative w-full overflow-hidden rounded-[6px] ${card.className.includes("4/5") ? "aspect-[4/5]" : card.className.includes("5/4") ? "aspect-[5/4]" : "aspect-[4/3]"}`}>
                      <Image
                        src={card.src}
                        alt={card.alt}
                        fill
                        sizes="40vw"
                        className="object-cover"
                        style={{ objectPosition: card.objectPosition }}
                      />
                      {/* warm grade */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(170deg, rgb(198 164 107 / 0.08) 0%, transparent 35%, rgb(36 27 23 / 0.18) 100%)",
                        }}
                      />
                  </div>
                  <figcaption className="flex items-baseline justify-between px-2.5 pt-2 pb-1">
                    <span className="text-[0.56rem] font-semibold tracking-[0.22em] uppercase" style={{ color: INK }}>
                      {card.label}
                    </span>
                    <span className="font-display hidden text-[0.78rem] italic sm:block" style={{ color: "rgba(36,27,23,0.65)" }}>
                      {card.line}
                    </span>
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>

          {/* mobile: primary card + two-up secondaries */}
          <div className="space-y-4 lg:hidden">
            {CARDS.slice(0, 1).map((card) => (
              <MobileCard key={card.label} card={card} tall />
            ))}
            <div className="grid grid-cols-2 gap-4">
              {CARDS.slice(1, 3).map((card) => (
                <MobileCard key={card.label} card={card} />
              ))}
            </div>
            <MobileCard card={CARDS[3]} />
          </div>

          {/* the qualities reading column */}
          <div className="lg:pt-6">
            <ol className="space-y-7">
              {QUALITIES.map((q, i) => (
                <motion.li
                  key={q.num}
                  initial={reduced ? undefined : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="flex items-baseline gap-3">
                    <span className="text-[0.68rem] font-semibold tabular-nums" style={{ color: "#F3E7D8" }}>
                      {q.num}
                    </span>
                    <span className="font-display text-[1.15rem] font-medium" style={{ color: IVORY }}>
                      {q.title}
                    </span>
                  </p>
                  <p className="mt-1.5 pl-8 text-[0.8rem] leading-[1.6]" style={{ color: "rgba(247,240,232,0.72)" }}>
                    {q.copy}
                  </p>
                </motion.li>
              ))}
            </ol>
            <div className="mt-9 border-t pt-5" style={{ borderColor: "rgba(247,240,232,0.2)" }}>
              <p className="text-[0.62rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(247,240,232,0.55)" }}>
                Interior imagery shown conceptually — final finishes subject to approved
                specifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- mobile -- */

function MobileCard({ card, tall = false }: { card: ResidenceCard; tall?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[10px] border border-[#F7F0E8]/20 bg-[#F7F0E8] p-1.5 shadow-[0_24px_50px_-28px_rgba(26,16,11,0.6)]">
      <div className={`relative overflow-hidden rounded-[6px] ${tall ? "aspect-[4/3]" : "aspect-square"}`}>
        <Image
          src={card.src}
          alt={card.alt}
          fill
          sizes="(min-width:640px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: card.objectPosition }}
        />
      </div>
      <figcaption className="px-2 pt-2 pb-1">
        <span className="text-[0.56rem] font-semibold tracking-[0.2em] uppercase" style={{ color: INK }}>
          {card.label}
        </span>
      </figcaption>
    </figure>
  );
}

"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 20 — Connected to What Matters. Road-level perspective (25mm feel,
 * camera ~40cm above the plane): the road enters wide at the bottom and
 * narrows to the building silhouette at the upper third, in warm sunset
 * haze. A small premium car silhouette follows the centre line with
 * scroll; milestones appear beside the route. Explicitly labelled
 * conceptual — no distances or travel times anywhere.
 */

const MILESTONES = [
  { name: "Shaukat Khanum Hospital", at: 0.2, side: "l" },
  { name: "Mega Imtiaz Store", at: 0.38, side: "r" },
  { name: "Schools & education", at: 0.56, side: "l" },
  { name: "Major road networks", at: 0.72, side: "r" },
  { name: "The Wind Corridor Residences", at: 0.92, side: "l" },
] as const;

/** Centre line of the road, bottom-wide to the vanishing building. */
const CENTER = "M450 660 C 450 560, 442 430, 448 330 C 452 260, 450 220, 450 178";

export default function LocationRoad() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.65", "end 0.9"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  // Car follows the centre line; scale shrinks with distance for depth.
  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    const car = carRef.current;
    if (!path || !car) return;
    const t = Math.min(Math.max(v, 0), 1);
    const pt = path.getPointAtLength(path.getTotalLength() * t);
    const s = 1 - t * 0.72;
    car.setAttribute("transform", `translate(${pt.x} ${pt.y}) scale(${s})`);
  });

  return (
    <section
      id="location"
      ref={ref}
      data-section="location"
      className="mineral-sunset grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#32271F" } as React.CSSProperties}
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="04" tone="light">
          Location
        </Eyebrow>
        <ChapterHeading id="location-heading" tone="light">
          Connected to what matters.
        </ChapterHeading>
        <Lead tone="light">
          A peaceful residential setting with convenient access to healthcare, shopping,
          education and major road networks.
        </Lead>

        <figure className="relative mx-auto mt-12 max-w-3xl">
          <svg
            viewBox="0 0 900 700"
            className="h-auto w-full"
            role="img"
            aria-label="Conceptual road journey toward the Wind Corridor Residences at sunset, passing healthcare, shopping, schools and major roads."
          >
            <defs>
              <linearGradient id="lr-road" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#3f3d3a" />
                <stop offset="100%" stopColor="#5d5852" />
              </linearGradient>
            </defs>

            {/* sunset sky + haze band */}
            <rect width="900" height="360" fill="#e2a869" />
            <rect y="120" width="900" height="240" fill="#d9b98c" opacity="0.7" />
            <rect y="250" width="900" height="110" fill="#6098aa" opacity="0.18" />
            {/* landscape */}
            <rect y="330" width="900" height="370" fill="#8a7a5e" />
            <polygon points="0,700 900,700 900,352 0,352" fill="#6f7d5e" opacity="0.55" />

            {/* destination building silhouette at the upper third */}
            <g opacity="0.92">
              {[402, 462].map((x, b) => (
                <g key={b}>
                  <rect x={x} y={150 - b * 0} width="38" height="130" fill="#7c4632" />
                  {Array.from({ length: 8 }).map((_, f) => (
                    <rect key={f} x={x + 3} y={160 + f * 15} width="32" height="2.6" fill="#5a3323" />
                  ))}
                  <rect x={x} y="144" width="38" height="7" fill="#c98a68" />
                </g>
              ))}
              {/* tiny rooftop turbine + catcher marks */}
              <line x1="416" y1="144" x2="416" y2="128" stroke="#d8d4cd" strokeWidth="2.4" />
              <circle cx="416" cy="126" r="5" fill="none" stroke="#d8d4cd" strokeWidth="1.8" />
              <rect x="447" y="126" width="8" height="18" fill="#5a3323" />
            </g>

            {/* the road: wide base narrowing to the building */}
            <polygon points="140,700 760,700 476,178 424,178" fill="url(#lr-road)" />
            {/* kerb strips */}
            <polygon points="150,700 190,700 434,182 428,182" fill="#c9baa6" opacity="0.6" />
            <polygon points="710,700 750,700 472,182 466,182" fill="#c9baa6" opacity="0.6" />
            {/* centre line the car follows */}
            <path ref={pathRef} d={CENTER} fill="none" stroke="#efe7dd" strokeWidth="4" strokeDasharray="14 18" opacity="0.55" />

            {/* light trail behind the car */}
            {!reduced && (
              <motion.path
                d={CENTER}
                fill="none"
                stroke="#ffd88f"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.5"
                style={{ pathLength: progress }}
              />
            )}

            {/* the car — small premium silhouette */}
            <g ref={carRef} transform="translate(450 660)">
              <g transform="translate(-30 -22)">
                <rect x="0" y="8" width="60" height="18" rx="8" fill="#171816" />
                <rect x="10" y="0" width="38" height="14" rx="7" fill="#171816" />
                <rect x="13" y="3" width="30" height="8" rx="4" fill="#6098aa" opacity="0.8" />
                <circle cx="12" cy="27" r="5" fill="#0d0d0c" />
                <circle cx="48" cy="27" r="5" fill="#0d0d0c" />
                <rect x="55" y="12" width="6" height="4" rx="2" fill="#ffd88f" />
              </g>
            </g>
          </svg>

          {/* milestone labels beside the route */}
          {MILESTONES.map((m) => (
            <motion.span
              key={m.name}
              className="glass-dark absolute rounded-full px-4 py-2 text-xs font-medium"
              style={{
                top: `${86 - m.at * 62}%`,
                [m.side === "l" ? "left" : "right"]: "2%",
              }}
              initial={reduced ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : m.at * 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {m.name}
            </motion.span>
          ))}

          <figcaption className="text-ivory/70 mt-3 text-xs">
            Conceptual location journey — not to scale. No distances or travel times implied.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

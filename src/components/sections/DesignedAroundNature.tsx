"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 04 — Designed Around Nature.
 * Low three-quarter facade crop (30mm feel, camera at lower-middle floor
 * height): vertical structure lines converge slightly upward; a teal wind
 * ribbon draws across the frame and each glass label lights only when the
 * ribbon reaches its position. The building itself stays still.
 */

const LABELS = [
  { text: "Natural airflow", x: "6%", y: "18%", delay: 0.9 },
  { text: "Renewable support", x: "8%", y: "44%", delay: 1.5 },
  { text: "Limited community", x: "60%", y: "26%", delay: 2.1 },
  { text: "Modern family living", x: "58%", y: "62%", delay: 2.7 },
];

export default function DesignedAroundNature() {
  const reduced = useReducedMotion();

  return (
    <section
      id="nature"
      data-section="nature"
      className="mineral-clay grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#efe7dd" } as React.CSSProperties}
      aria-labelledby="nature-heading"
    >
      {/* sky-blue vertical haze */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[8%] w-[30%] opacity-40 blur-3xl"
        style={{ background: "linear-gradient(to bottom, rgb(96 152 170 / 0.5), transparent 75%)" }}
      />

      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          Project vision
        </Eyebrow>
        <ChapterHeading id="nature-heading" tone="light">
          A building that works with its environment.
        </ChapterHeading>
        <Lead tone="light">
          The Wind Corridor Residences brings natural airflow, renewable-energy planning and
          modern family living into one carefully considered development.
        </Lead>

        <div className="relative mt-14">
          {/* Facade crop: low three-quarter, verticals converging slightly */}
          <svg
            viewBox="0 0 900 480"
            className="h-auto w-full"
            role="img"
            aria-label="Low-angle view of the residential facade with a wind current passing across it."
          >
            <defs>
              <linearGradient id="na-face" x1="0" y1="1" x2="0.3" y2="0">
                <stop offset="0%" stopColor="#8a5138" />
                <stop offset="100%" stopColor="#c98a68" />
              </linearGradient>
              <linearGradient id="na-face2" x1="0" y1="1" x2="0.2" y2="0">
                <stop offset="0%" stopColor="#6d3f2c" />
                <stop offset="100%" stopColor="#a06a44" />
              </linearGradient>
            </defs>
            {/* foreground block, slightly tapered toward the top (low angle) */}
            <polygon points="150,480 210,30 560,60 560,480" fill="url(#na-face)" />
            {/* balcony bands following the taper */}
            {Array.from({ length: 9 }).map((_, f) => {
              const t = f / 8;
              const yL = 456 - t * 400;
              const yR = 460 - t * 384;
              const xL = 158 + t * 50;
              return (
                <polygon
                  key={f}
                  points={`${xL},${yL} 560,${yR} 560,${yR + 9} ${xL},${yL + 10}`}
                  fill="#5f3826"
                  opacity="0.85"
                />
              );
            })}
            {/* second block behind */}
            <polygon points="600,480 620,110 830,140 830,480" fill="url(#na-face2)" />
            {Array.from({ length: 7 }).map((_, f) => {
              const t = f / 6;
              const y = 450 - t * 300;
              return (
                <rect key={f} x="606" y={y} width="224" height="7" fill="#4a2c1e" opacity="0.7" />
              );
            })}
            {/* the wind ribbon — draws across and past both blocks */}
            <motion.path
              d="M-40 150 C 160 110, 320 210, 500 170 C 640 140, 740 210, 940 180"
              fill="none"
              stroke="#51b5b5"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 0.8 : 0 }}
              whileInView={{ pathLength: 1, opacity: 0.85 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M-40 320 C 200 290, 420 360, 660 320 C 780 300, 860 340, 940 330"
              fill="none"
              stroke="#51b5b5"
              strokeWidth="2.2"
              strokeLinecap="round"
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 0.5 : 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 2.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {/* Labels light as the ribbon reaches them */}
          {LABELS.map((l) => (
            <motion.span
              key={l.text}
              className="glass-dark absolute rounded-full px-4 py-2 text-xs font-medium tracking-wide"
              style={{ left: l.x, top: l.y }}
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : l.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              {l.text}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

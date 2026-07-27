"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SavingsClaim } from "./SavingsClaim";

const COLS = 6;
const ROWS = 9;

/**
 * Renewable-energy preview.
 *
 * The solar colour-scan and the rhythm notes live in a SIDE column, not in
 * the hero and not behind body copy — the accent colours stay a peripheral
 * event, which is what keeps the base page mineral rather than neon.
 *
 * Everything is SVG + Framer Motion. No Three.js here; the single WebGL
 * canvas is reserved for the building.
 */
export default function RenewablePreview() {
  return (
    <section
      aria-labelledby="renewable-heading"
      data-section="technology"
      className="mineral-dark grain relative overflow-hidden py-(--spacing-section)"
    >
      <div className="mx-auto grid max-w-(--container-page) items-center gap-12 px-(--spacing-gutter) lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-champagne mb-4 text-[0.6875rem] tracking-[0.22em] uppercase">
            Renewable support
          </p>
          <h2
            id="renewable-heading"
            className="font-display text-ivory max-w-[16ch] text-d2 font-semibold"
          >
            Wind and sunlight, working together.
          </h2>
          <p className="text-ivory/75 mt-6 max-w-(--container-prose) text-lead">
            Wind turbines and solar panels are planned to support cleaner electricity
            generation and reduce reliance on conventional energy.
          </p>

          <div className="mt-10">
            <SavingsClaim tone="dark" />
          </div>

          <p className="text-ivory/50 mt-8 text-xs tracking-[0.14em] uppercase">
            Planned system — currently under development
          </p>
        </div>

        {/* Side column: the solar scan + rhythm notes */}
        <div className="lg:col-span-5">
          <SolarRhythmPanel />
        </div>
      </div>
    </section>
  );
}

function SolarRhythmPanel() {
  const reduced = useReducedMotion();

  return (
    <figure className="relative">
      <svg
        viewBox="0 0 300 420"
        className="h-auto w-full"
        role="img"
        aria-label="Diagram of a solar panel array with a band of light passing across the cells."
      >
        <defs>
          <linearGradient id="sr-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22a8aa" stopOpacity="0" />
            <stop offset="45%" stopColor="#d4b36f" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#c43b91" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22a8aa" stopOpacity="0" />
          </linearGradient>
          <clipPath id="sr-clip">
            <rect x="18" y="18" width="264" height="384" rx="6" />
          </clipPath>
        </defs>

        {/* Panel body */}
        <rect x="18" y="18" width="264" height="384" rx="6" fill="#141d29" />

        {/* Cells */}
        <g clipPath="url(#sr-clip)">
          {Array.from({ length: COLS * ROWS }).map((_, i) => {
            const c = i % COLS;
            const r = Math.floor(i / COLS);
            return (
              <rect
                key={i}
                x={26 + c * 42}
                y={26 + r * 42}
                width={36}
                height={36}
                rx={2}
                fill="#1d2b3c"
                stroke="#2f4356"
                strokeWidth="1"
              />
            );
          })}

          {/* The scan — one band crossing once on entry, then it rests.
              Not a loop, so nothing pulses forever in the corner of the eye. */}
          {!reduced && (
            <motion.rect
              x="18"
              width="264"
              height="120"
              fill="url(#sr-scan)"
              initial={{ y: -140 }}
              whileInView={{ y: 420 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </g>

        <rect
          x="18"
          y="18"
          width="264"
          height="384"
          rx="6"
          fill="none"
          stroke="#3d5468"
          strokeWidth="2"
        />

        {/* Rhythm notes — five fine-line marks rising from selected cells,
            some drifting into wind strokes. Fires once. */}
        {!reduced &&
          NOTES.map((note, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: [0, 0.85, 0], y: -110 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 2.6,
                delay: 0.5 + i * 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {note.wind ? (
                <path
                  d={`M${note.x} ${note.y} c 14 -8, 28 6, 42 -3`}
                  fill="none"
                  stroke="#6098aa"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <circle cx={note.x} cy={note.y} r="4.6" fill="none" stroke="#d4b36f" strokeWidth="1.6" />
                  <path
                    d={`M${note.x + 4.4} ${note.y} L${note.x + 4.4} ${note.y - 22}`}
                    stroke="#d4b36f"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </>
              )}
            </motion.g>
          ))}
      </svg>

      <figcaption className="text-ivory/55 mt-4 text-xs">
        Conceptual diagram — rooftop solar arrangement subject to final system design.
      </figcaption>
    </figure>
  );
}

const NOTES = [
  { x: 58, y: 300, wind: false },
  { x: 122, y: 260, wind: true },
  { x: 176, y: 320, wind: false },
  { x: 228, y: 268, wind: false },
  { x: 90, y: 218, wind: true },
];

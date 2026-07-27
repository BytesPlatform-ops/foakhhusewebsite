"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 06 — The Wind-Catcher Experience.
 * Perfect one-point perspective (24mm feel): the camera faces straight into
 * the catcher opening; nested terracotta frames recede to an ivory light at
 * the corridor's end. Fourteen airflow lines enter wide, compress through
 * the throat, accelerate, and divide left/right into the corridor —
 * CAPTURE / CHANNEL / CIRCULATE / COOL activate in that order.
 */

const STAGES = [
  { word: "Capture", delay: 0.4 },
  { word: "Channel", delay: 1.0 },
  { word: "Circulate", delay: 1.6 },
  { word: "Cool", delay: 2.2 },
];

/** Airflow line factory: wide at entry, pinched at the throat (x≈450). */
function flowPath(i: number, n: number) {
  const t = i / (n - 1);
  const yIn = 60 + t * 400; // entry spread
  const yThroat = 218 + t * 84; // compressed band
  const yExit = t < 0.5 ? 190 - t * 90 : 330 + (t - 0.5) * 90; // divide L/R
  return `M-30 ${yIn} C 180 ${yIn}, 300 ${yThroat}, 450 ${yThroat} C 620 ${yThroat}, 700 ${yExit}, 930 ${yExit}`;
}

export default function WindCatcher() {
  const reduced = useReducedMotion();
  const N = 14;

  return (
    <section
      id="windcatcher"
      data-section="windcatcher"
      className="mineral-dark grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#171816" } as React.CSSProperties}
      aria-labelledby="windcatcher-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          The defining idea
        </Eyebrow>
        <ChapterHeading id="windcatcher-heading" tone="light">
          The heart of the Wind Corridor.
        </ChapterHeading>
        <Lead tone="light">
          A dedicated wind catcher is designed to intercept high-velocity natural air and guide
          it into the building&rsquo;s central corridor network — creating fresher, cooler shared
          circulation areas.
        </Lead>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          <figure className="lg:col-span-8">
            <svg
              viewBox="0 0 900 520"
              className="h-auto w-full"
              role="img"
              aria-label="One-point perspective through the wind catcher: air enters, compresses in the opening, accelerates and divides into the central corridor."
            >
              <defs>
                <radialGradient id="wc-end" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#f7ead2" />
                  <stop offset="100%" stopColor="#caa36c" />
                </radialGradient>
                <linearGradient id="wc-frame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b06c4c" />
                  <stop offset="100%" stopColor="#6d3f2c" />
                </linearGradient>
              </defs>

              {/* nested terracotta frames receding to the vanishing point */}
              {[0, 1, 2, 3, 4].map((i) => {
                const cx = 450;
                const cy = 260;
                const w = 860 - i * 172;
                const h = 500 - i * 96;
                return (
                  <rect
                    key={i}
                    x={cx - w / 2}
                    y={cy - h / 2}
                    width={w}
                    height={h}
                    fill="none"
                    stroke="url(#wc-frame)"
                    strokeWidth={9 - i * 1.6}
                    opacity={0.95 - i * 0.14}
                  />
                );
              })}
              {/* corridor end-light */}
              <rect x="395" y="212" width="110" height="96" fill="url(#wc-end)" />
              {/* converging ceiling/floor guides */}
              <line x1="20" y1="10" x2="395" y2="212" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
              <line x1="880" y1="10" x2="505" y2="212" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
              <line x1="20" y1="510" x2="395" y2="308" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
              <line x1="880" y1="510" x2="505" y2="308" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />

              {/* the airflow: 14 lines, drawn in sequence, thinner past the throat */}
              {Array.from({ length: N }).map((_, i) => (
                <motion.path
                  key={i}
                  d={flowPath(i, N)}
                  fill="none"
                  stroke="#51b5b5"
                  strokeWidth={2.4 - (i % 3) * 0.5}
                  strokeLinecap="round"
                  opacity={0.7 - (i % 4) * 0.1}
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{
                    duration: 2.1,
                    delay: reduced ? 0 : 0.15 + (i % 5) * 0.14,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </svg>
            <figcaption className="text-ivory/50 mt-3 text-xs">
              Conceptual airflow diagram — corridor distribution subject to final engineering.
            </figcaption>
          </figure>

          {/* Stage words activate in order */}
          <div className="lg:col-span-4">
            <ol className="space-y-5">
              {STAGES.map((s, i) => (
                <motion.li
                  key={s.word}
                  initial={reduced ? undefined : { opacity: 0.15, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: reduced ? 0 : s.delay, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline gap-4"
                >
                  <span className="text-champagne text-xs tabular-nums">0{i + 1}</span>
                  <span className="font-display text-ivory text-3xl font-semibold lg:text-4xl">
                    {s.word}
                  </span>
                </motion.li>
              ))}
            </ol>
            <p className="text-ivory/60 mt-8 max-w-xs text-sm leading-relaxed">
              Reduced trapped heat and lower common-area cooling demand across lobbies and
              shared circulation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

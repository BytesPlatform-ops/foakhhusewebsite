"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";
import { SavingsClaim } from "@/components/technology/SavingsClaim";

/**
 * 08 — Solar, at the low grazing angle from the film (22mm feel, camera
 * 10–20cm above the panel plane). Cell rows converge hard toward the
 * upper-left; the nearest panel edge enters from bottom-right and runs off
 * frame. On entry: rows emerge from darkness -> a champagne light travels
 * diagonally across the cells -> a cyan wind wave crosses with four
 * travelling nodes -> the energy route exits downward. Then it settles.
 * Replaces the v1 flat front-facing grid entirely.
 */

/** Build receding panel rows as trapezoids converging to the upper-left. */
function rows() {
  const out: { pts: string; opacity: number }[] = [];
  const vp = { x: 120, y: 40 }; // vanishing point
  for (let r = 0; r < 6; r++) {
    const t0 = r / 6;
    const t1 = (r + 0.82) / 6;
    // near edge (bottom-right) to far edge, interpolated toward the vp
    const nearY0 = 560 - t0 * 420;
    const nearY1 = 560 - t1 * 420;
    const p = (t: number, y: number) => ({
      x: 900 - t * (900 - vp.x) * 0.92,
      y: y - t0 * 0,
    });
    const a = p(0, nearY0);
    const b = p(0.95, vp.y + (nearY0 - vp.y) * 0.34);
    const c = p(0.95, vp.y + (nearY1 - vp.y) * 0.34);
    const d = p(0, nearY1);
    out.push({
      pts: `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`,
      opacity: 1 - r * 0.09,
    });
  }
  return out;
}
const ROWS = rows();

/** The cyan wind wave's crossing path. */
const WAVE = "M940 300 C 700 240, 480 320, 300 250 C 220 222, 160 190, 90 150";

export default function SolarGrazing() {
  const reduced = useReducedMotion();

  return (
    <section
      id="solar"
      data-section="solar"
      className="mineral-dark grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#12455a" } as React.CSSProperties}
      aria-labelledby="solar-heading"
    >
      {/* soft amber horizon behind the array */}
      <div
        aria-hidden="true"
        className="absolute top-[6%] left-[4%] h-[30%] w-[45%] opacity-35 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(239 138 23 / 0.5), transparent 72%)" }}
      />

      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          Renewable support · Solar
        </Eyebrow>
        <ChapterHeading id="solar-heading" tone="light">
          Wind and sunlight, working together.
        </ChapterHeading>
        <Lead tone="light">
          Solar panels are planned to complement the wind-energy system, increasing the use of
          available natural resources and supporting cleaner electricity generation.
        </Lead>

        <figure className="mt-12">
          <svg
            viewBox="0 0 900 560"
            className="h-auto w-full"
            role="img"
            aria-label="Solar array seen from just above the panel surface: rows converge into perspective while a band of sunlight and a wind wave cross the cells."
          >
            <defs>
              <linearGradient id="sg-cell" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#24384c" />
                <stop offset="100%" stopColor="#101b28" />
              </linearGradient>
              <linearGradient id="sg-scan" x1="0" y1="0" x2="1" y2="0.4">
                <stop offset="0%" stopColor="#d4b36f" stopOpacity="0" />
                <stop offset="48%" stopColor="#ffdf9e" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#d4b36f" stopOpacity="0" />
              </linearGradient>
              <clipPath id="sg-clip">
                <polygon points="900,560 60,560 108,44 900,120" />
              </clipPath>
              {/* distant rooftop silhouette */}
              <linearGradient id="sg-roof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3a2c22" />
                <stop offset="100%" stopColor="#1c1512" />
              </linearGradient>
            </defs>

            {/* faint building silhouette + distant turbine behind the array */}
            <rect x="80" y="60" width="230" height="90" fill="url(#sg-roof)" opacity="0.8" />
            <g opacity="0.7" stroke="#8a9296" strokeWidth="3" strokeLinecap="round">
              <line x1="352" y1="118" x2="352" y2="62" />
              <line x1="352" y1="62" x2="336" y2="44" />
              <line x1="352" y1="62" x2="368" y2="44" />
              <line x1="352" y1="62" x2="352" y2="38" />
            </g>

            {/* the receding panel rows, revealed from darkness */}
            <g clipPath="url(#sg-clip)">
              {ROWS.map((r, i) => (
                <motion.polygon
                  key={i}
                  points={r.pts}
                  fill="url(#sg-cell)"
                  stroke="#3d5468"
                  strokeWidth="1.6"
                  initial={reduced ? undefined : { opacity: 0 }}
                  whileInView={{ opacity: r.opacity }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.8, delay: reduced ? 0 : i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
              {/* converging cell seams */}
              {[0.18, 0.36, 0.54, 0.72, 0.88].map((t) => (
                <line
                  key={t}
                  x1={900 - t * 60}
                  y1="560"
                  x2={140 + t * 120}
                  y2={60 + t * 30}
                  stroke="#3d5468"
                  strokeWidth="1"
                  opacity="0.55"
                />
              ))}

              {/* champagne sunlight travelling diagonally — once */}
              {!reduced && (
                <motion.polygon
                  points="0,0 260,0 60,560 -200,560"
                  fill="url(#sg-scan)"
                  initial={{ x: 900, opacity: 0.9 }}
                  whileInView={{ x: -260 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 2.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </g>

            {/* cyan wind wave crossing right-to-left with travelling nodes */}
            {!reduced && (
              <>
                <motion.path
                  d={WAVE}
                  fill="none"
                  stroke="#22a8aa"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.85 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 2.2, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
                />
                {[
                  { c: "#22a8aa", d: 2.3 },
                  { c: "#d4b36f", d: 2.55 },
                  { c: "#4c7056", d: 2.8 },
                  { c: "#c43b91", d: 3.05 },
                ].map((n) => (
                  <motion.circle
                    key={n.c}
                    r="5"
                    fill={n.c}
                    initial={{ offsetDistance: "0%", opacity: 0 }}
                    whileInView={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 2.4, delay: n.d, ease: [0.16, 1, 0.3, 1] }}
                    style={{ offsetPath: `path("${WAVE}")` }}
                  />
                ))}
                {/* energy route exits downward toward the harmony chapter */}
                <motion.path
                  d="M90 150 C 60 260, 120 400, 80 560"
                  fill="none"
                  stroke="#d4b36f"
                  strokeWidth="2"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.8 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.4, delay: 4.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </>
            )}
          </svg>
          <figcaption className="text-ivory/50 mt-3 text-xs">
            Conceptual rooftop solar arrangement — subject to final system design.
          </figcaption>
        </figure>

        <div className="mt-12 max-w-2xl">
          <SavingsClaim tone="dark" />
        </div>
      </div>
    </section>
  );
}

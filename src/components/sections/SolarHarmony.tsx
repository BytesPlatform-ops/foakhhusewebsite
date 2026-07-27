"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 10 + 13 — the near top-down solar field and Every System in Harmony,
 * one continuous composition (the film's above-view shot flows straight
 * into the rhythm moment). ~70 degree overhead: the panel field is a
 * slightly sheared grid, believable as a rooftop — NOT a solar farm.
 * A single amber pulse crosses the cells and its path becomes a thin
 * rhythm line from which 5 fine-line notation symbols rise; some become
 * wind strokes, a turbine circle, a water ripple. The field drifts 2–4
 * degrees with scroll. A final circular symbol hands off to the water
 * chapter as a droplet.
 */

const SYMBOLS = [
  { x: 200, y: 300, kind: "note", delay: 2.0 },
  { x: 330, y: 250, kind: "wind", delay: 2.3 },
  { x: 470, y: 320, kind: "circle", delay: 2.6 },
  { x: 590, y: 260, kind: "note", delay: 2.9 },
  { x: 700, y: 310, kind: "ripple", delay: 3.2 },
] as const;

export default function SolarHarmony() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: rawP } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Spring-wrapped so the binding stays JS-driven — see WindTunnel.tsx.
  const scrollYProgress = useSpring(rawP, { stiffness: 300, damping: 36, mass: 0.4 });
  const drift = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section
      id="harmony"
      ref={ref}
      data-section="harmony"
      className="grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={
        {
          "--blend-from": "#171816",
          background:
            "radial-gradient(110% 80% at 25% 0%, #17384c 0%, transparent 60%), radial-gradient(90% 70% at 85% 95%, rgb(76 112 86 / 0.4) 0%, transparent 60%), #10222e",
        } as React.CSSProperties
      }
      aria-labelledby="harmony-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          Systems in concert
        </Eyebrow>
        <ChapterHeading id="harmony-heading" tone="light">
          Every system in harmony.
        </ChapterHeading>
        <Lead tone="light">
          Comfort is shaped not by one feature, but by how airflow, energy, water and
          architecture work together.
        </Lead>

        <motion.figure className="mt-12" style={reduced ? undefined : { rotate: drift }}>
          <svg
            viewBox="0 0 900 480"
            className="h-auto w-full"
            role="img"
            aria-label="Rooftop solar field seen from above; an energy pulse crosses the cells and becomes fine rhythm marks — wind, circle and ripple symbols rising from the panels."
          >
            <defs>
              <linearGradient id="sh-cell" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e3a55" />
                <stop offset="100%" stopColor="#12253a" />
              </linearGradient>
            </defs>

            {/* rooftop bounds: two panel areas + a service strip between */}
            <g transform="skewX(-6)">
              <rect x="120" y="120" width="740" height="300" fill="#2a2420" />
              <rect x="120" y="120" width="740" height="10" fill="#c17b58" />
              {/* panel grids */}
              {[
                { x0: 150, cols: 7 },
                { x0: 530, cols: 6 },
              ].map((area, ai) => (
                <g key={ai}>
                  {Array.from({ length: area.cols * 4 }).map((_, i) => {
                    const c = i % area.cols;
                    const r = Math.floor(i / area.cols);
                    return (
                      <motion.rect
                        key={i}
                        x={area.x0 + c * 46}
                        y={150 + r * 58}
                        width="40"
                        height="50"
                        rx="2"
                        fill="url(#sh-cell)"
                        stroke="#33506b"
                        strokeWidth="1"
                        initial={reduced ? undefined : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.5, delay: reduced ? 0 : (r + c) * 0.05 }}
                      />
                    );
                  })}
                </g>
              ))}
              {/* service strip with a walking-scale path */}
              <rect x="478" y="120" width="36" height="300" fill="#4c7056" />
              <rect x="492" y="120" width="8" height="300" fill="#c9baa6" opacity="0.7" />
            </g>

            {/* amber pulse crossing horizontally, once */}
            {!reduced && (
              <motion.line
                y1="140"
                y2="410"
                stroke="#ef8a17"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ x1: 90, x2: 66, opacity: 0 }}
                whileInView={{ x1: 850, x2: 826, opacity: [0, 0.9, 0.9, 0] }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 2.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {/* the rhythm line the pulse leaves behind */}
            <motion.path
              d="M100 372 C 300 356, 560 388, 820 360"
              fill="none"
              stroke="#d4b36f"
              strokeWidth="1.6"
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 0.7 : 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.6, delay: reduced ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* rising notation — energy marks, not cartoon notes */}
            {!reduced &&
              SYMBOLS.map((s, i) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  whileInView={{ opacity: [0, 0.9, 0], y: -120 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 2.8, delay: s.delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  {s.kind === "note" && (
                    <>
                      <circle cx={s.x} cy={s.y} r="5" fill="none" stroke="#d4b36f" strokeWidth="1.6" />
                      <line x1={s.x + 4.8} y1={s.y} x2={s.x + 4.8} y2={s.y - 26} stroke="#d4b36f" strokeWidth="1.6" strokeLinecap="round" />
                    </>
                  )}
                  {s.kind === "wind" && (
                    <path d={`M${s.x} ${s.y} c 16 -10, 34 8, 52 -4`} fill="none" stroke="#6098aa" strokeWidth="1.8" strokeLinecap="round" />
                  )}
                  {s.kind === "circle" && (
                    <>
                      <circle cx={s.x} cy={s.y} r="12" fill="none" stroke="#8fd0e0" strokeWidth="1.6" />
                      {[0, 120, 240].map((a) => (
                        <line
                          key={a}
                          x1={s.x}
                          y1={s.y}
                          x2={(s.x + 10 * Math.cos((a * Math.PI) / 180)).toFixed(2)}
                          y2={(s.y + 10 * Math.sin((a * Math.PI) / 180)).toFixed(2)}
                          stroke="#8fd0e0"
                          strokeWidth="1.3"
                        />
                      ))}
                    </>
                  )}
                  {s.kind === "ripple" && (
                    <>
                      <circle cx={s.x} cy={s.y} r="6" fill="none" stroke="#51b5b5" strokeWidth="1.5" />
                      <circle cx={s.x} cy={s.y} r="13" fill="none" stroke="#51b5b5" strokeWidth="1" opacity="0.6" />
                    </>
                  )}
                </motion.g>
              ))}
          </svg>
          <figcaption className="text-ivory/50 mt-3 text-xs">
            Rooftop panel arrangement shown conceptually — the project uses building-scale solar,
            not a solar farm.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

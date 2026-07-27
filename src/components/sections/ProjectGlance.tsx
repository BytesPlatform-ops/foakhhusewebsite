"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 03 — Project at a Glance.
 * High three-quarter site view (~40 degrees above the model, 40mm feel):
 * an isometric-leaning SVG site diagram whose lines draw once, with the
 * four figures entering at staggered vertical positions — no identical
 * card row. The road line exits the frame bottom-right and becomes the
 * snake route in the next chapter.
 */

const STATS = [
  { value: "12", label: "Storeys", offset: "lg:mt-0" },
  { value: "02", label: "Blocks", offset: "lg:mt-14" },
  { value: "84", label: "Apartments", offset: "lg:mt-4" },
  { value: "DHA", label: "View City, Karachi", offset: "lg:mt-20" },
];

export default function ProjectGlance() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: rawP } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Spring-wrapped so the binding stays JS-driven — see WindTunnel.tsx.
  const scrollYProgress = useSpring(rawP, { stiffness: 300, damping: 36, mass: 0.4 });
  // 2–4 degree drift only — the diagram breathes, it does not spin.
  const drift = useTransform(scrollYProgress, [0, 1], [-2.5, 2.5]);

  return (
    <section
      id="glance"
      ref={ref}
      data-section="glance"
      className="mineral-ivory grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#efe7dd" } as React.CSSProperties}
      aria-labelledby="glance-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="01">The project at a glance</Eyebrow>
        <ChapterHeading id="glance-heading">
          Limited in number. Considered in every detail.
        </ChapterHeading>
        <Lead>
          Two distinguished residential blocks bring together thoughtful layouts, modern
          architecture and a more private community of only 84 apartments.
        </Lead>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          {/* Site diagram */}
          <motion.figure
            style={reduced ? undefined : { rotate: drift }}
            className="lg:col-span-7"
          >
            <svg
              viewBox="0 0 640 420"
              className="h-auto w-full"
              role="img"
              aria-label="Site diagram: Umer and Abdullah blocks either side of a central shared square, with the access road along the front."
            >
              <defs>
                <linearGradient id="gl-block" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c98a68" />
                  <stop offset="100%" stopColor="#8a5138" />
                </linearGradient>
              </defs>
              <g transform="translate(40 30) skewX(-9)">
                {/* Site boundary + inner grid, drawn on entry */}
                <motion.rect
                  x="0"
                  y="0"
                  width="540"
                  height="330"
                  fill="none"
                  stroke="#87543e"
                  strokeWidth="1.6"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                />
                {[80, 160, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="540" y2={y} stroke="#87543e" strokeWidth="0.5" opacity="0.25" />
                ))}
                {/* Blocks with slight extrusion */}
                {[
                  { x: 46, name: "UMER BLOCK" },
                  { x: 330, name: "ABDULLAH BLOCK" },
                ].map((b, i) => (
                  <motion.g
                    key={b.name}
                    initial={reduced ? undefined : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <rect x={b.x + 10} y="66" width="164" height="118" fill="#6d3f2c" />
                    <rect x={b.x} y="56" width="164" height="118" fill="url(#gl-block)" />
                    <rect x={b.x} y="56" width="164" height="14" fill="#daa27e" />
                    <text x={b.x + 8} y="196" fontSize="12" letterSpacing="2" fill="#5f3826">
                      {b.name}
                    </text>
                  </motion.g>
                ))}
                {/* Central shared square */}
                <rect x="252" y="196" width="56" height="44" fill="#c9baa6" />
                <rect x="260" y="203" width="40" height="30" fill="#4c7056" />
                {/* Road along the front — its tail becomes the snake route */}
                <motion.path
                  d="M-30 268 L540 268 M-30 300 L540 300"
                  stroke="#3b3a37"
                  strokeWidth="2.4"
                  fill="none"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d="M540 284 C 600 284, 620 330, 600 400"
                  stroke="#22a8aa"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="2 7"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </g>
            </svg>
            <figcaption className="text-ink-soft mt-3 text-xs">
              Site arrangement derived from the architectural model — schematic, not to scale.
            </figcaption>
          </motion.figure>

          {/* Staggered figures */}
          <div className="grid grid-cols-2 gap-x-8 lg:col-span-5">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className={s.offset}
                initial={reduced ? undefined : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-display text-charcoal block text-6xl font-semibold lg:text-7xl">
                  {s.value}
                </span>
                <span className="text-bronze mt-2 block text-xs tracking-[0.16em] uppercase">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

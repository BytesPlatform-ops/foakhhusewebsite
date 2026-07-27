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
 * 05 — Natural Systems Snake Route. A major chapter, not a small timeline.
 *
 * One winding SVG route runs the full height of the section. Its stroke is
 * a gradient that shifts blueprint-teal -> wind -> amber energy -> solar ->
 * daylight, drawn on by scroll (native scrolling — nothing is pinned).
 * A pulse dot rides the path via getPointAtLength, and the background
 * deepens from ivory into mineral charcoal as the systems become
 * technical, then the route exits toward the wind catcher.
 */

const MILESTONES = [
  { num: "01", name: "Capture", copy: "High-velocity natural air reaches the purpose-built wind catcher.", side: "l", at: 0.06 },
  { num: "02", name: "Channel", copy: "Captured air is guided toward central corridors, elevator lobbies and shared circulation areas.", side: "r", at: 0.2 },
  { num: "03", name: "Circulate", copy: "Continuous airflow is intended to reduce trapped heat and support a fresher shared environment.", side: "l", at: 0.34 },
  { num: "04", name: "Generate", copy: "Wind turbines are planned to convert available wind into renewable electricity for selected requirements.", side: "r", at: 0.5 },
  { num: "05", name: "Support", copy: "Solar panels complement the wind-energy system and increase the use of available natural resources.", side: "l", at: 0.64 },
  { num: "06", name: "Manage", copy: "Treatment and desalination planning support a cleaner, more dependable water system.", side: "r", at: 0.78 },
  { num: "07", name: "Live", copy: "Architecture, natural systems and well-planned residences come together for comfortable family living.", side: "l", at: 0.92 },
] as const;

/** The winding path in a 100 x 1400 coordinate space (preserveAspectRatio none). */
const PATH =
  "M50 0 C 50 40, 16 70, 16 110 C 16 160, 84 170, 84 230 C 84 300, 16 300, 16 370 " +
  "C 16 440, 84 440, 84 510 C 84 580, 16 580, 16 650 C 16 720, 84 720, 84 790 " +
  "C 84 860, 16 860, 16 930 C 16 1000, 84 1000, 84 1070 C 84 1140, 16 1140, 16 1210 " +
  "C 16 1290, 50 1330, 50 1400";

export default function SnakeRoute() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.85"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });

  // Pulse rides the path. Imperative on purpose: getPointAtLength every
  // scroll tick through React state would re-render the whole section.
  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;
    const pt = path.getPointAtLength(path.getTotalLength() * Math.min(Math.max(v, 0), 1));
    dot.setAttribute("cx", String(pt.x));
    dot.setAttribute("cy", String(pt.y));
  });

  return (
    <section
      id="route"
      ref={ref}
      data-section="route"
      className="blend-top grain relative overflow-hidden"
      style={
        {
          "--blend-from": "#b06c4c",
          background:
            "linear-gradient(to bottom, #efe7dd 0%, #d9cebd 22%, #6d5a4a 55%, #26241f 82%, #171816 100%)",
        } as React.CSSProperties
      }
      aria-labelledby="route-heading"
    >
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-(--spacing-section)">
        <Eyebrow num="02">Natural systems</Eyebrow>
        <ChapterHeading id="route-heading">From natural force to everyday comfort.</ChapterHeading>
        <Lead>
          See how wind, sunlight and thoughtful planning are brought together across the
          development.
        </Lead>
      </div>

      <div className="relative mx-auto max-w-5xl px-(--spacing-gutter) pb-(--spacing-section)">
        {/* The route, behind the milestone panels */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[8%] top-0 h-full w-[84%]"
          viewBox="0 0 100 1400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sr-route" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22a8aa" />
              <stop offset="28%" stopColor="#51b5b5" />
              <stop offset="50%" stopColor="#ef8a17" />
              <stop offset="68%" stopColor="#d4b36f" />
              <stop offset="86%" stopColor="#6098aa" />
              <stop offset="100%" stopColor="#efe7dd" />
            </linearGradient>
          </defs>
          {/* faint full path underneath */}
          <path d={PATH} fill="none" stroke="#87543e" strokeWidth="0.4" opacity="0.3" />
          {/* the drawn route */}
          <motion.path
            ref={pathRef}
            d={PATH}
            fill="none"
            stroke="url(#sr-route)"
            strokeWidth="0.9"
            strokeLinecap="round"
            style={reduced ? undefined : { pathLength: progress }}
            initial={reduced ? { pathLength: 1 } : undefined}
            vectorEffect="non-scaling-stroke"
          />
          {!reduced && <circle ref={dotRef} r="1.4" cx="50" cy="0" fill="#efe7dd" />}
          {/* nodes at each milestone */}
          {MILESTONES.map((m) => {
            const y = m.at * 1400;
            const x = m.side === "l" ? 16 : 84;
            return <circle key={m.num} cx={x} cy={y} r="1.1" fill="#d4b36f" opacity="0.9" />;
          })}
        </svg>

        {/* Milestone panels alternate sides around the route */}
        <ol className="relative">
          {MILESTONES.map((m, i) => {
            // Panels toward the end sit on the dark half of the gradient.
            const dark = i >= 3;
            return (
              <li
                key={m.num}
                className={`flex min-h-[52svh] items-center py-6 ${
                  m.side === "l" ? "justify-start" : "justify-end"
                }`}
              >
                <motion.div
                  className={`${dark ? "glass-dark" : "glass-light"} w-full max-w-sm rounded-2xl p-6`}
                  initial={reduced ? undefined : { opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p
                    className={`text-[0.6875rem] tracking-[0.22em] uppercase ${
                      dark ? "text-champagne" : "text-bronze"
                    }`}
                  >
                    {m.num} — {m.name}
                  </p>
                  <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-ivory/85" : "text-ink"}`}>
                    {m.copy}
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

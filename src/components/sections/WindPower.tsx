"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 07 — Wind Power. Its own chapter, not a solar footnote.
 * Shot A: front-facing rotor, circle perfectly centred (80mm feel),
 * background soft; a leaf drifts into the hub as the section enters.
 * The rotor turns slowly and ONLY while in view (useInView gates the
 * animation), with a restrained 4–7 degree side drift on scroll.
 * The rooftop edge holds the lower foreground so the turbine reads as
 * architecture, not a cutout in the sky.
 */
export default function WindPower() {
  const ref = useRef<HTMLElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(figRef, { amount: 0.3 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  const spinning = inView && !reduced;

  return (
    <section
      id="wind"
      ref={ref}
      data-section="wind"
      className="mineral-windsky grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#171816" } as React.CSSProperties}
      aria-labelledby="wind-heading"
    >
      <div className="mx-auto grid max-w-(--container-page) items-center gap-12 px-(--spacing-gutter) lg:grid-cols-12">
        {/* Rotor figure — the circular subject, centred */}
        <motion.div
          ref={figRef}
          className="order-2 lg:order-1 lg:col-span-6"
          style={reduced ? undefined : { rotate: drift }}
        >
          <svg
            viewBox="0 0 560 560"
            className="mx-auto h-auto w-full max-w-lg"
            role="img"
            aria-label="Front-facing rooftop wind turbine, rotor centred, mounted on the building parapet."
          >
            <defs>
              <radialGradient id="wp-sky" cx="50%" cy="42%" r="70%">
                <stop offset="0%" stopColor="#7fb5ca" />
                <stop offset="100%" stopColor="#1d5064" />
              </radialGradient>
              <linearGradient id="wp-blade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8e4de" />
                <stop offset="100%" stopColor="#9aa0a4" />
              </linearGradient>
            </defs>
            <circle cx="280" cy="252" r="238" fill="url(#wp-sky)" />
            {/* shroud ring — the circular motif */}
            <circle cx="280" cy="252" r="190" fill="none" stroke="#d8d4cd" strokeWidth="13" opacity="0.95" />
            <circle cx="280" cy="252" r="176" fill="none" stroke="#8a9296" strokeWidth="3" opacity="0.7" />
            {/* rotor: 3 blades, slow believable spin, gated by visibility */}
            <motion.g
              style={{ originX: "280px", originY: "252px" }}
              animate={spinning ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spinning
                  ? { duration: 9, ease: "linear", repeat: Infinity }
                  : { duration: 0.6 }
              }
            >
              {[0, 120, 240].map((a) => (
                <g key={a} transform={`rotate(${a} 280 252)`}>
                  <path d="M280 252 C 262 190, 266 118, 280 74 C 294 118, 298 190, 280 252 Z" fill="url(#wp-blade)" />
                </g>
              ))}
            </motion.g>
            <circle cx="280" cy="252" r="26" fill="#c4c9cc" />
            <circle cx="280" cy="252" r="10" fill="#6f777b" />
            {/* leaf drifting into the hub */}
            {!reduced && (
              <motion.path
                d="M0 0 C 8 -8, 20 -8, 26 0 C 20 8, 8 8, 0 0 Z"
                fill="#4c7056"
                initial={{ x: 30, y: 120, opacity: 0, rotate: -20 }}
                whileInView={{ x: 262, y: 244, opacity: [0, 1, 1, 0], rotate: 200 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 2.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {/* rooftop edge holds the lower foreground */}
            <rect y="452" width="560" height="108" fill="#a06a44" />
            <rect y="452" width="560" height="14" fill="#c17b58" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={22 + i * 80} y="466" width="9" height="94" fill="#8a5138" />
            ))}
            {/* mast connecting rotor to roof */}
            <rect x="271" y="278" width="18" height="180" fill="#b3b9bc" />
          </svg>
        </motion.div>

        <div className="order-1 lg:order-2 lg:col-span-6">
          <Eyebrow num="02" tone="light">
            Renewable support · Wind
          </Eyebrow>
          <ChapterHeading id="wind-heading" tone="light">
            Power shaped by movement.
          </ChapterHeading>
          <Lead tone="light">
            Wind turbines are planned to convert available wind into renewable electricity for
            selected building requirements.
          </Lead>
          <p className="text-ivory/55 mt-8 text-xs tracking-[0.14em] uppercase">
            Planned system — currently under development
          </p>
        </div>
      </div>
    </section>
  );
}

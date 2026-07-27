"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 14 — Responsible Water Planning. Three beats from the film:
 *   A) macro droplet (90mm feel) grows and falls, once;
 *   B) near top-down ripple expands where it lands;
 *   C) eye-level warm room where AQUA LIGHT BLEEDS onto the ceiling edge
 *      and glass at 6–12% opacity — reflected environment, not blue paint.
 * The caustic drift runs only while the room is in view.
 *
 * Copy is the verified treatment/desalination language. No water-from-air.
 */
export default function WaterPlanning() {
  const reduced = useReducedMotion();
  const roomRef = useRef<SVGSVGElement>(null);
  const roomInView = useInView(roomRef, { amount: 0.3 });

  return (
    <section
      id="water"
      data-section="water"
      className="mineral-water grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#10222e" } as React.CSSProperties}
      aria-labelledby="water-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          Water systems
        </Eyebrow>
        <ChapterHeading id="water-heading" tone="light">
          Water, planned responsibly.
        </ChapterHeading>
        <Lead tone="light">
          Treatment and desalination planning support a cleaner, more dependable water system
          for the whole development.
        </Lead>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          {/* A + B — droplet falls into ripple */}
          <figure className="lg:col-span-5">
            <svg
              viewBox="0 0 400 520"
              className="h-auto w-full max-w-sm"
              role="img"
              aria-label="A water droplet forms, falls and lands as an expanding ripple."
            >
              <defs>
                <radialGradient id="wt-drop" cx="38%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#eafcfb" />
                  <stop offset="55%" stopColor="#8fd8d5" />
                  <stop offset="100%" stopColor="#2b8a92" />
                </radialGradient>
                <linearGradient id="wt-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bfe6e4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0f5665" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <rect width="400" height="520" rx="14" fill="url(#wt-bg)" />
              {/* droplet: grows at the lip, then falls */}
              <motion.g
                initial={reduced ? { y: 0 } : { y: 0 }}
                whileInView={
                  reduced
                    ? undefined
                    : { y: [0, 0, 300], scale: [0.7, 1, 1], opacity: [0, 1, 0.9] }
                }
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 2.2, times: [0, 0.55, 1], ease: [0.6, 0, 0.9, 1] }}
              >
                <path
                  d="M200 60 C 186 92, 176 112, 176 130 a24 24 0 0 0 48 0 C 224 112, 214 92, 200 60 Z"
                  fill="url(#wt-drop)"
                />
              </motion.g>
              {/* ripple rings where it lands */}
              {[0, 1, 2].map((i) => (
                <motion.ellipse
                  key={i}
                  cx="200"
                  cy="440"
                  fill="none"
                  stroke="#d9f4f2"
                  strokeWidth={2 - i * 0.5}
                  initial={{ rx: 6, ry: 2.4, opacity: 0 }}
                  whileInView={
                    reduced
                      ? { rx: 70 + i * 40, ry: 20 + i * 11, opacity: 0.35 - i * 0.08 }
                      : { rx: [6, 90 + i * 44], ry: [2.4, 26 + i * 12], opacity: [0, 0.7 - i * 0.15, 0] }
                  }
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 2.4, delay: reduced ? 0 : 1.9 + i * 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
              {/* water plane */}
              <ellipse cx="200" cy="446" rx="160" ry="34" fill="#1d7a85" opacity="0.5" />
            </svg>
          </figure>

          {/* C — the ambient room: pool light entering a warm interior */}
          <figure className="lg:col-span-7">
            <svg
              ref={roomRef}
              viewBox="0 0 720 520"
              className="h-auto w-full"
              role="img"
              aria-label="A warm interior beside the pool: soft aqua light reflects onto the ceiling edge and glass while golden daylight keeps the room warm."
            >
              <defs>
                <linearGradient id="wt-wall" x1="0" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="#f0e6d6" />
                  <stop offset="100%" stopColor="#cbb096" />
                </linearGradient>
                <linearGradient id="wt-floor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94684a" />
                  <stop offset="100%" stopColor="#5b3f2d" />
                </linearGradient>
                <linearGradient id="wt-sun" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="#ffe2a6" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffe2a6" stopOpacity="0" />
                </linearGradient>
                <filter id="wt-caustic">
                  <feTurbulence type="fractalNoise" baseFrequency="0.018 0.04" numOctaves="2" seed="5" />
                  <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.95  0 0 0 0 0.95  0 0 0 -1.35 0.75" />
                </filter>
              </defs>
              {/* room */}
              <rect width="720" height="400" fill="url(#wt-wall)" />
              <rect y="400" width="720" height="120" fill="url(#wt-floor)" />
              {/* window to the pool terrace */}
              <rect x="470" y="70" width="200" height="300" fill="#cfe9e7" />
              <rect x="470" y="70" width="200" height="300" fill="none" stroke="#7c4a35" strokeWidth="7" />
              <line x1="570" y1="70" x2="570" y2="370" stroke="#7c4a35" strokeWidth="4" />
              {/* pool visible low through the glass */}
              <rect x="477" y="300" width="186" height="66" fill="#3aa6a4" />
              {/* golden daylight keeps the room warm */}
              <polygon points="470,380 670,372 560,520 330,520" fill="url(#wt-sun)" />
              {/* curtain */}
              <path d="M440 60 C 420 190, 452 300, 428 470 L 468 470 C 488 300, 458 190, 472 60 Z" fill="#f8f1e5" opacity="0.9" />

              {/* THE AQUA BLEED — reflected caustic light on ceiling edge,
                  upper wall and glass. 6–12% opacity, drifting slowly only
                  while the room is on screen. */}
              <motion.g
                animate={
                  roomInView && !reduced ? { x: [0, -46] } : { x: 0 }
                }
                transition={
                  roomInView && !reduced
                    ? { duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                    : { duration: 0.5 }
                }
              >
                <rect x="-60" y="0" width="880" height="86" filter="url(#wt-caustic)" opacity="0.12" />
                <rect x="360" y="70" width="360" height="140" filter="url(#wt-caustic)" opacity="0.09" />
                <rect x="-60" y="400" width="500" height="52" filter="url(#wt-caustic)" opacity="0.07" />
              </motion.g>

              {/* sideboard */}
              <rect x="70" y="320" width="240" height="86" rx="8" fill="#7c5136" />
              <rect x="70" y="320" width="240" height="10" rx="4" fill="#9a6c49" />
            </svg>
            <figcaption className="text-ivory/55 mt-3 text-xs">
              Planned water treatment and desalination — shown as ambience, not an installed
              system.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import useIsMobile, { M } from "./useIsMobile";

/**
 * UNIVERSAL CONSTRUCTION ENTRANCE — content containers "build" into view
 * out of raw clay:
 *
 *  1. the container rises from its foundation in discrete COURSES —
 *     each course holds, then lifts into place (game-like construction,
 *     not a smooth wipe),
 *  2. a clay surface covers it while it builds — warm terracotta with
 *     irregular strata (two prime-period bands so the texture never
 *     visibly repeats) and a bright leading edge at the course line,
 *  3. dust and smoke puff at the foundation as the courses land,
 *  4. then the clay fires clean and the finished container settles.
 *
 * Applied to CONTENT containers only — photographs are never covered.
 *
 * STRUCTURE NOTE: Chromium intersects an element's IO rect with its own
 * clip-path, so a clipped container reports no intersection and would
 * never trigger (tall panels never fired at all). The observer therefore
 * lives on an unclipped wrapper and drives the clipped inner shell
 * through variants.
 */

/** discrete courses: each holds, then lands into the next */
export const courses =
  (n: number) =>
  (t: number): number => {
    const c = Math.min(Math.max(t, 0), 1) * n;
    const laid = Math.floor(c) / n;
    const frac = c % 1;
    if (frac <= 0.72) return laid;
    const lift = (frac - 0.72) / 0.28;
    return Math.min(1, laid + (lift * lift * (3 - 2 * lift)) / n);
  };

/** raw clay: warm terracotta with irregular strata, no grid */
export const CLAY_BG =
  "repeating-linear-gradient(0deg, rgba(58,22,10,0.13) 0 1px, transparent 1px 17px)," +
  "repeating-linear-gradient(0deg, rgba(255,196,146,0.07) 0 1px, transparent 1px 29px)," +
  "radial-gradient(120% 60% at 30% 12%, rgba(255,190,140,0.16), transparent 70%)," +
  "linear-gradient(180deg, #B65438 0%, #94432F 48%, #713427 100%)";

/** the bright course line at the top of the rising clay */
export const CLAY_EDGE =
  "linear-gradient(180deg, rgba(255,214,164,0.75) 0%, rgba(255,190,140,0.18) 45%, transparent 100%)";

const DUST = [
  { left: "16%", w: 96, d: 0.16 },
  { left: "46%", w: 124, d: 0.32 },
  { left: "74%", w: 88, d: 0.48 },
];

/** clay skin + leading edge — shared with the scroll-driven builders */
export function ClayFace() {
  return (
    <>
      <span className="absolute inset-0" style={{ background: CLAY_BG, borderRadius: "inherit" }} />
      <span
        className="absolute inset-x-0 top-0 h-[4px]"
        style={{ background: CLAY_EDGE, borderRadius: "inherit" }}
      />
    </>
  );
}

export default function BuildIn({
  children,
  delay = 0,
  className = "",
  style,
  amount = 0.2,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  /* MOBILE: the construction reveal does not survive a phone. It hides the
     container behind a clipPath until an observer fires, and a thumb moving
     at phone speed either outruns the courses — leaving a terracotta block
     where the content should be — or scrolls the element through the trigger
     band so fast that it never fires and the card stays blank. The clay is a
     desktop pleasure; here the content simply arrives, with enough of a fade
     to register as an arrival. */
  if (mobile) {
    return (
      <motion.div
        className={className}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount }}
        transition={{ duration: M.text, delay: delay * 0.5, ease: M.ease }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative"
      initial="raw"
      whileInView="built"
      viewport={{ once: true, amount }}
    >
      {/* the shell: clipped, rising course by course */}
      <motion.div
        className={`relative ${className}`}
        style={style}
        variants={{
          raw: { clipPath: "inset(100% 0% 0% 0%)", y: 14, scale: 0.99 },
          built: { clipPath: "inset(0% 0% 0% 0%)", y: 0, scale: 1 },
        }}
        transition={{
          clipPath: { duration: 0.72, delay, ease: courses(5) },
          y: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {children}

        {/* the clay state — covers while building, then fires clean */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50"
          style={{ borderRadius: "inherit" }}
          variants={{ raw: { opacity: 1 }, built: { opacity: 0 } }}
          transition={{ duration: 0.42, delay: delay + 0.6, ease: "easeOut" }}
        >
          <ClayFace />
        </motion.span>
      </motion.div>

      {/* dust and smoke at the foundation as the courses land */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[51] h-0">
        {DUST.map((d) => (
          <motion.span
            key={d.left}
            className="absolute bottom-0 block rounded-full blur-md"
            style={{
              left: d.left,
              width: d.w,
              height: d.w * 0.42,
              background:
                "radial-gradient(ellipse at 50% 70%, rgba(226,186,142,0.6) 0%, rgba(198,150,110,0.25) 45%, transparent 75%)",
            }}
            variants={{
              raw: { opacity: 0, y: 6, scale: 0.55 },
              built: { opacity: [0, 0.6, 0], y: [6, -22], scale: [0.55, 1.4] },
            }}
            transition={{ duration: 1.15, delay: delay + d.d, ease: "easeOut" }}
          />
        ))}
      </span>
    </motion.div>
  );
}

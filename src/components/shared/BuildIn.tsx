"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * NOTE: the initial clip leaves a 6% "foundation slab" visible — a fully
 * clipped element reports zero intersection area in Chromium, so the
 * whileInView observer would never fire. The `amount` prop maps to a
 * bottom root-margin instead of an intersection ratio for the same
 * reason.
 *
 * UNIVERSAL CONSTRUCTION ENTRANCE — any container "builds" into view
 * like clay-block masonry:
 *
 *  1. the container rises course-by-course from its foundation — a
 *     bottom-up clip revealed in SIX discrete steps (game-like block
 *     courses, not a smooth wipe),
 *  2. while a terracotta CLAY layer (with brick course-lines) covers
 *     the content, so what appears first is raw clay masonry,
 *  3. then the clay fades and the finished container stands revealed,
 *     settling the last 16px into place.
 *
 * Wrap any card/panel: <BuildIn className="...card classes" delay={0.1}>
 * Runs once per container on first view; reduced motion renders plainly.
 */

/** stepped easing — N discrete construction courses */
export const courses =
  (n: number) =>
  (t: number): number =>
    Math.ceil(Math.min(Math.max(t, 0), 1) * n) / n;

/** raw clay masonry finish, with horizontal + vertical course lines */
export const CLAY_BG =
  "repeating-linear-gradient(0deg, rgba(70,30,14,0.18) 0 2px, rgba(0,0,0,0) 2px 12px)," +
  "repeating-linear-gradient(90deg, rgba(70,30,14,0.1) 0 2px, rgba(0,0,0,0) 2px 26px)," +
  "linear-gradient(180deg, #C4653F 0%, #A9472E 55%, #8A3D2A 100%)";

export default function BuildIn({
  children,
  delay = 0,
  className = "",
  style,
  amount = 0.25,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={`relative ${className}`}
      style={style}
      initial={{ clipPath: "inset(94% 0% 0% 0%)", y: 16, scale: 0.985 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", y: 0, scale: 1 }}
      viewport={{ once: true, amount: "some", margin: `0px 0px -${Math.round(amount * 100)}% 0px` }}
      transition={{
        clipPath: { duration: 0.6, delay, ease: courses(6) },
        y: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {children}
      {/* the clay state — covers while building, then fires clean */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-50"
        style={{ background: CLAY_BG, borderRadius: "inherit" }}
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 0 }}
        viewport={{ once: true, amount: "some", margin: `0px 0px -${Math.round(amount * 100)}% 0px` }}
        transition={{ duration: 0.45, delay: delay + 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

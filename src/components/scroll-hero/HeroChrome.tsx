"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { HERO_FACTS } from "@/lib/scroll-hero-states";

/**
 * HeroFacts — compact editorial facts rail for the residences state:
 * one band, thin dividers, varied number scale. Not four cards.
 *
 * HeroActions — the persistent promotional chrome: project identity +
 * "Skip visual story" available the whole ride (Register Interest already
 * persists in the chapter rail / mobile header), plus the CTA cluster
 * that arrives with the final state.
 */

export function HeroFacts({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.83, 0.86, 0.925, 0.95], [0, 1, 1, 0]);
  const y = useTransform(progress, [0.83, 0.86], [22, 0]);

  return (
    <motion.dl
      className="glass-light absolute right-[4%] bottom-[5%] flex items-start rounded-lg px-2 py-4"
      style={{ opacity, y }}
    >
      {HERO_FACTS.map((fact, i) => (
        <div
          key={fact.label}
          className={`px-4 ${i > 0 ? "border-l border-charcoal/12" : ""} ${i % 2 ? "mt-2" : ""}`}
        >
          <dt className="sr-only">{fact.label}</dt>
          <dd>
            <span
              className={`font-display text-charcoal block leading-none font-semibold ${
                i === 2 ? "text-4xl" : i === 0 ? "text-3xl" : "text-2xl"
              }`}
            >
              {fact.value}
            </span>
            <span className="text-ink-soft mt-1.5 block max-w-[7rem] text-[0.55rem] tracking-[0.12em] uppercase">
              {fact.label}
            </span>
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}

export function HeroActions({ progress }: { progress: MotionValue<number> }) {
  const ctaOpacity = useTransform(progress, [0.94, 0.97], [0, 1]);
  const ctaY = useTransform(progress, [0.94, 0.97], [18, 0]);

  return (
    <>
      {/* Persistent micro-bar: identity + skip. Never blocks the story. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 lg:p-6">
        <p className="text-[0.65rem] leading-relaxed tracking-[0.2em] text-[#653528] uppercase lg:hidden">
          The Wind Corridor Residences
          <span className="block opacity-70">DHA View City · Karachi</span>
        </p>
        <span className="hidden lg:block" />
        <a
          href="#glance"
          className="pointer-events-auto rounded-full border border-[#653528]/30 bg-[#efe7dd]/70 px-4 py-2 text-[0.65rem] font-medium tracking-[0.16em] text-[#653528] uppercase backdrop-blur-sm transition-colors hover:bg-[#171816] hover:text-[#efe7dd]"
        >
          Skip visual story ↓
        </a>
      </div>

      {/* Final-state CTA cluster */}
      <motion.div
        className="absolute inset-x-0 bottom-[5%] z-20 flex flex-wrap items-center justify-center gap-3 px-4"
        style={{ opacity: ctaOpacity, y: ctaY }}
      >
        <a
          href="#enquire"
          className="bg-charcoal text-ivory rounded-full px-7 py-3.5 text-sm font-bold transition-colors hover:bg-[#653528]"
        >
          Register Interest
        </a>
        <a
          href="#residences"
          className="glass-light rounded-full px-7 py-3.5 text-sm font-semibold"
        >
          Explore the Residences
        </a>
        <span
          className="text-ink-soft rounded-full border border-charcoal/15 px-7 py-3.5 text-sm"
          title="Available once the final brochure is approved"
        >
          Brochure — coming soon
        </span>
      </motion.div>
    </>
  );
}

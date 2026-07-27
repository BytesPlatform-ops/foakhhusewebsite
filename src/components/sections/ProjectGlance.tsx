"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 01 — The Project: cinematic approach to the entrance.
 *
 * Scroll behaviour inspired by collabcapitolium.fr (mood/pacing only): the
 * dusk frontal render holds the sticky stage while a slow camera push —
 * scale anchored on the gate at 50% 74% of the frame — draws the visitor
 * down the walkway toward the entrance. The centred copy begins dim and
 * softly blurred, then brightens and sharpens as the doors approach; the
 * block names and CTA arrive with the final frame.
 *
 * Native scrolling, transform/opacity only, spring-driven progress (the
 * ScrollTimeline stale-range guard), no 3D. Reduced motion renders the
 * settled end-frame statically with everything readable.
 */

const COPY = {
  eyebrow: "01 · The project at a glance",
  headline: "Limited in number. Considered in every detail.",
  body: "Two distinguished residential blocks bring together thoughtful layouts, modern architecture and a more private community of only 84 apartments.",
  caption: "Umer Block · Abdullah Block — 12 storeys · 84 residences",
};

export default function ProjectGlance() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 });

  /* the camera push — origin sits on the entrance */
  const scale = useTransform(p, [0, 1], [1.08, 1.62]);
  const y = useTransform(p, [0, 1], ["0%", "3.5%"]); // gate drifts toward centre
  /* atmosphere clears as we approach */
  const overlay = useTransform(p, [0, 0.75], [0.56, 0.28]);
  /* the message reveals */
  const textOpacity = useTransform(p, [0.05, 0.55], [0.35, 1]);
  const textBlur = useTransform(p, [0.05, 0.5], ["blur(5px)", "blur(0px)"]);
  const textY = useTransform(p, [0.05, 0.55], [16, 0]);
  /* end-frame arrivals */
  const lateOpacity = useTransform(p, [0.68, 0.85], [0, 1]);
  const lateY = useTransform(p, [0.68, 0.85], [12, 0]);

  if (reduced) return <StaticFrame />;

  return (
    <section
      id="glance"
      ref={sectionRef}
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative h-[170svh] lg:h-[220svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#1D1714]">
        {/* image layer — the push */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale, y, transformOrigin: "50% 74%" }}
        >
          <Image
            src="/building-approach.jpg"
            alt=""
            fill
            priority={false}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 60%" }}
          />
        </motion.div>

        {/* atmosphere: dark overlay + vignette + grain */}
        <motion.div aria-hidden="true" className="absolute inset-0 bg-[#14100d]" style={{ opacity: overlay }} />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 42%, transparent 48%, rgb(20 16 13 / 0.55) 100%)",
          }}
        />
        <div className="grain absolute inset-0" aria-hidden="true" />

        {/* the message — centred, slightly above centre */}
        <motion.div
          className="absolute inset-x-0 top-[30%] mx-auto max-w-3xl px-6 text-center lg:top-[26%]"
          style={{ opacity: textOpacity, y: textY, filter: reduced ? undefined : textBlur }}
        >
          <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
            {COPY.eyebrow}
          </p>
          <h2
            id="glance-heading"
            className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
          >
            {COPY.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[0.85rem] leading-relaxed font-light text-[#F3E7D8]/85 md:text-[0.95rem]">
            {COPY.body}
          </p>
        </motion.div>

        {/* end-frame: block names + CTA, arriving as the doors near */}
        <motion.div
          className="absolute inset-x-0 bottom-[8%] mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center"
          style={{ opacity: lateOpacity, y: lateY }}
        >
          <p className="text-[0.65rem] tracking-[0.26em] text-[#F7F0E8]/75 uppercase">
            {COPY.caption}
          </p>
          <a
            href="#residences"
            className="rounded-lg border border-[#C6A46B]/55 bg-[#1D1714]/35 px-6 py-3 text-sm font-medium text-[#F7F0E8] backdrop-blur-sm transition-colors hover:bg-[#1D1714]/60"
          >
            Explore the Residences
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/** Reduced motion: the settled end-frame, fully readable, no pin. */
function StaticFrame() {
  return (
    <section
      id="glance"
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative flex min-h-svh items-center overflow-hidden bg-[#1D1714]"
    >
      <Image
        src="/building-approach.jpg"
        alt=""
        fill
        sizes="100vw"
        className="scale-125 object-cover"
        style={{ objectPosition: "50% 66%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#14100d]/40" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
          {COPY.eyebrow}
        </p>
        <h2
          id="glance-heading"
          className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
        >
          {COPY.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[0.9rem] leading-relaxed font-light text-[#F3E7D8]/85">
          {COPY.body}
        </p>
        <p className="mt-8 text-[0.65rem] tracking-[0.26em] text-[#F7F0E8]/75 uppercase">
          {COPY.caption}
        </p>
      </div>
    </section>
  );
}

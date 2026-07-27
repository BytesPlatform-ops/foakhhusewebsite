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

  /* ---- STAGE 1 (0 -> 0.55): the approach — a dolly, not a zoom -------- */
  // Non-linear scale: speed builds as the gate nears. Origin on the door.
  const scale = useTransform(p, [0, 0.3, 0.55, 1], [1.06, 1.22, 1.58, 2.05]);
  const imgY = useTransform(p, [0, 0.55, 1], ["0%", "3.2%", "4.5%"]);
  // The walkway look-down settles flat on arrival — the perspective shift.
  const rotateX = useTransform(p, [0, 0.2, 0.55], [1.8, 1.1, 0]);
  // Atmosphere clears through the approach, deepens again at the threshold.
  const overlay = useTransform(p, [0, 0.42, 0.55, 0.7], [0.56, 0.3, 0.42, 0.52]);

  /* ---- THE THRESHOLD (0.55 -> 0.92): the window contracts ------------- */
  // The frame itself tightens into a portal while the image inside keeps
  // pushing deeper — window and content move against each other.
  const clip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.55) / 0.37, 0), 1);
    const e = 1 - Math.pow(1 - t, 3); // ease-out
    return `inset(${(e * 27).toFixed(2)}% ${(e * 31).toFixed(2)}% ${(e * 23).toFixed(2)}% ${(e * 31).toFixed(2)}% round ${(e * 14).toFixed(1)}px)`;
  });

  /* ---- text: reveals on approach, dissolves at the crossing ----------- */
  const textOpacity = useTransform(p, [0.05, 0.4, 0.52, 0.6], [0.35, 1, 1, 0]);
  const textBlur = useTransform(p, [0.05, 0.4], ["blur(5px)", "blur(0px)"]);
  const textY = useTransform(p, [0.05, 0.45], [16, 0]);
  /* stage 2: restrained caption on the stone, beneath the portal */
  const innerOpacity = useTransform(p, [0.72, 0.88], [0, 1]);
  const innerY = useTransform(p, [0.72, 0.88], [14, 0]);

  if (reduced) return <StaticFrame />;

  return (
    <section
      id="glance"
      ref={sectionRef}
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative h-[230svh] lg:h-[290svh]"
    >
      {/* Stage ground is the page's stone — when the window contracts, the
          portal sits on the same surface the next section begins from, so
          the two stages and the following section read as one passage. */}
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F3ECE4]">
        {/* THE FRAME — full-bleed scene that tightens into a portal */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          {/* perspective wrapper: the dolly happens inside real depth */}
          <div className="absolute inset-0" style={{ perspective: "1100px" }}>
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ scale, y: imgY, rotateX, transformOrigin: "50% 74%" }}
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
          </div>

          {/* atmosphere inside the frame */}
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
        </motion.div>

        {/* STAGE 1 message — brightens on approach, dissolves at the door */}
        <motion.div
          className="absolute inset-x-0 top-[30%] mx-auto max-w-3xl px-6 text-center lg:top-[26%]"
          style={{ opacity: textOpacity, y: textY, filter: textBlur }}
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

        {/* STAGE 2 — beyond the threshold: quiet caption on the stone */}
        <motion.div
          className="absolute inset-x-0 bottom-[7%] mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center"
          style={{ opacity: innerOpacity, y: innerY }}
        >
          <p className="text-[0.62rem] tracking-[0.3em] text-[#9C6247] uppercase">
            Beyond the gate
          </p>
          <p className="font-display text-xl font-medium text-[#1D1714] md:text-2xl">
            {COPY.caption}
          </p>
          <a
            href="#residences"
            className="mt-1 rounded-lg border border-[#9C6247]/45 px-6 py-3 text-sm font-medium text-[#1D1714] transition-colors hover:bg-[#9C6247] hover:text-[#F7F0E8]"
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

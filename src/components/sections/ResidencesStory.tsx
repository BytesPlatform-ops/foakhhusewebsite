"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 03 — The Residences: the statement stage.
 *
 * Structure follows the supplied agency reference (translated to our
 * clay/ivory identity, not its colours or copy): one flat saturated
 * ground, a portrait video card dead-centre, and a single giant serif
 * headline split into two halves that flank it — left half and right
 * half sliding in from opposite edges while rising from the lower third
 * to centre, passing BEHIND the media card. A small featured card holds
 * the lower-right corner and arrives last.
 *
 * The four residence qualities follow as a quiet four-column strip on
 * the same ground — no overlapping collage, nothing grouped.
 *
 * Native scroll pin, spring-driven progress (ScrollTimeline stale-range
 * guard), transform/opacity only. Reduced motion renders the settled
 * frame with the poster still and no autoplaying video.
 */

const IVORY = "#F7F0E8";

const QUALITIES = [
  {
    num: "01",
    title: "Living Spaces",
    copy: "Generous, well-proportioned rooms where daylight crosses the floor — designed to hold real family life.",
  },
  {
    num: "02",
    title: "Private Balconies",
    copy: "Residences open outward with quieter outdoor moments, private views and a stronger sense of personal space.",
  },
  {
    num: "03",
    title: "Natural Light",
    copy: "Thoughtful orientation helps sunlight move through the home, supporting warmth, calm and everyday comfort.",
  },
  {
    num: "04",
    title: "Everyday Comfort",
    copy: "Layouts shaped for practical living — not just visual appeal — with space that feels flexible, usable and refined.",
  },
];

export default function ResidencesStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  /* the two headline halves cross in from opposite edges and rise */
  const leftX = useTransform(p, [0, 0.55, 1], ["-16vw", "0vw", "1.5vw"]);
  const rightX = useTransform(p, [0, 0.55, 1], ["16vw", "0vw", "-1.5vw"]);
  const textY = useTransform(p, [0, 0.55], ["17svh", "0svh"]);
  const textOpacity = useTransform(p, [0, 0.18], [0.4, 1]);

  /* the media card settles and breathes */
  const mediaScale = useTransform(p, [0, 0.5], [0.93, 1]);
  const mediaY = useTransform(p, [0, 1], ["4svh", "-3svh"]);

  /* the featured corner card arrives once the headline has landed */
  const cardOpacity = useTransform(p, [0.6, 0.78], [0, 1]);
  const cardY = useTransform(p, [0.6, 0.78], [28, 0]);

  return (
    <section
      id="residences"
      ref={sectionRef}
      data-section="residences"
      aria-labelledby="residences-heading"
      className="mineral-clay grain blend-top relative"
      style={{ "--blend-from": "#202522" } as React.CSSProperties}
    >
      {/* ------------------------------------------------ pinned stage -- */}
      <div className="relative hidden lg:block lg:h-[240svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* eyebrow — quiet, upper-left, always present */}
          <p
            className="absolute top-[7%] left-[6%] z-30 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "rgba(247,240,232,0.75)" }}
          >
            03 — The Residences
          </p>

          {/* the split headline — BEHIND the media card */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 z-10"
            style={reduced ? undefined : { y: textY, opacity: textOpacity }}
          >
            <motion.p
              className="font-display absolute left-[3.5%] whitespace-nowrap uppercase"
              style={{
                color: IVORY,
                fontSize: "clamp(3.4rem,6.4vw,7rem)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontWeight: 600,
                y: "-50%",
                ...(reduced ? {} : { x: leftX }),
              }}
            >
              Homes made
            </motion.p>
            <motion.p
              className="font-display absolute right-[3.5%] whitespace-nowrap uppercase"
              style={{
                color: "rgba(247,240,232,0.62)",
                fontSize: "clamp(3.4rem,6.4vw,7rem)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontWeight: 600,
                y: "-50%",
                ...(reduced ? {} : { x: rightX }),
              }}
            >
              for real life.
            </motion.p>
          </motion.div>

          {/* accessible heading for the split display text */}
          <h2 id="residences-heading" className="sr-only">
            Homes made for real life.
          </h2>

          {/* the portrait media card — centre, above the headline */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <motion.div
              className="relative w-[clamp(300px,25vw,400px)] overflow-hidden rounded-xl shadow-[0_50px_100px_-40px_rgba(26,16,11,0.7)]"
              style={reduced ? undefined : { scale: mediaScale, y: mediaY }}
            >
              <StageMedia reduced={!!reduced} />
            </motion.div>
          </div>

          {/* featured corner card — the reference's "case of the month" */}
          <motion.aside
            className="absolute right-[4%] bottom-[6%] z-30 w-[19.5rem] overflow-hidden rounded-2xl bg-[#294338] p-3 shadow-[0_34px_70px_-30px_rgba(20,26,22,0.8)]"
            style={reduced ? undefined : { opacity: cardOpacity, y: cardY }}
          >
            <div className="flex gap-3">
              <div className="relative w-[7.5rem] shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/route-comfort.jpg"
                  alt="Residents in the warm sheltered court"
                  fill
                  sizes="120px"
                  className="object-cover"
                  style={{ objectPosition: "50% 38%" }}
                />
              </div>
              <div className="flex flex-col py-1 pr-1">
                <p className="text-[0.58rem] tracking-[0.22em] uppercase" style={{ color: "rgba(247,240,232,0.6)" }}>
                  Now in development
                </p>
                <p className="font-display mt-1.5 text-[1.05rem] leading-[1.15] font-medium" style={{ color: IVORY }}>
                  84 residences.
                  <br />
                  Two blocks.
                </p>
                <a
                  href="#enquire"
                  className="mt-auto inline-block w-fit rounded-full bg-[#C6A46B] px-4 py-2 text-[0.7rem] font-semibold text-[#1D1714] transition-colors hover:bg-[#D6B87E]"
                >
                  Register interest
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* -------------------------------------------- mobile / reduced -- */}
      <div className="px-(--spacing-gutter) pt-24 pb-4 lg:hidden">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "rgba(247,240,232,0.75)" }}>
          03 — The Residences
        </p>
        <p
          className="font-display mt-5 uppercase"
          style={{ color: IVORY, fontSize: "clamp(2.3rem,9.5vw,3.6rem)", lineHeight: 1.02, fontWeight: 600 }}
          aria-hidden="true"
        >
          Homes made
          <br />
          <span style={{ color: "rgba(247,240,232,0.62)" }}>for real life.</span>
        </p>
        <div className="relative mx-auto mt-10 w-full max-w-sm overflow-hidden rounded-xl shadow-[0_40px_80px_-40px_rgba(26,16,11,0.7)]">
          <StageMedia reduced={!!reduced} />
        </div>
      </div>

      {/* ------------------------------------------- qualities strip ---- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-6 pb-(--spacing-section) lg:pt-0">
        <div className="grid gap-x-8 gap-y-9 border-t pt-12 sm:grid-cols-2 lg:-mt-2 lg:grid-cols-4" style={{ borderColor: "rgba(247,240,232,0.22)" }}>
          {QUALITIES.map((q, i) => (
            <motion.div
              key={q.num}
              initial={reduced ? undefined : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[0.68rem] font-semibold tabular-nums" style={{ color: "rgba(247,240,232,0.65)" }}>
                {q.num}
              </p>
              <p className="font-display mt-2 text-[1.15rem] font-medium" style={{ color: IVORY }}>
                {q.title}
              </p>
              <p className="mt-2 text-[0.8rem] leading-[1.65]" style={{ color: "rgba(247,240,232,0.72)" }}>
                {q.copy}
              </p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-[0.62rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(247,240,232,0.55)" }}>
          Imagery shown conceptually — final finishes subject to approved specifications
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- media -- */

/**
 * The portrait card: the project film cropped to portrait, with the
 * reference's pause control (WCAG pausable motion). Reduced motion — and
 * any playback failure — hold the poster still.
 */
function StageMedia({ reduced }: { reduced: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  if (reduced) {
    return (
      <div className="relative aspect-[3/4.2] w-full">
        <Image
          src="/hero-poster.jpg"
          alt="Evening view of the Wind Corridor Residences"
          fill
          sizes="(min-width:1024px) 25vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4.2] w-full bg-[#1D1714]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Film of the Wind Corridor Residences and its surroundings"
      />
      {/* gentle grade so the card reads warm on the clay ground */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(178deg, rgb(198 164 107 / 0.06) 0%, transparent 30%, rgb(29 23 20 / 0.22) 100%)",
        }}
      />
      <button
        type="button"
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          if (v.paused) {
            v.play().catch(() => undefined);
            setPaused(false);
          } else {
            v.pause();
            setPaused(true);
          }
        }}
        aria-label={paused ? "Play film" : "Pause film"}
        className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F0E8] text-[#1D1714] transition-transform hover:scale-105"
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5v9l8-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Video hero — the client's cinematic rooftop film as the hero background
 * (public/hero.mp4: 1080p H.264 transcode of the supplied 4K HEVC source,
 * muted, looping; public/hero-poster.jpg paints immediately).
 *
 * Playback is gated in JS rather than via the autoPlay attribute so
 * reduced-motion visitors get the still poster frame — no motion, same
 * composition. Content overlays on a charcoal scrim: eyebrow, headline,
 * copy, CTAs and the compact facts rail.
 */

const FACTS = [
  { value: "12", label: "Storeys" },
  { value: "02", label: "Blocks" },
  { value: "84", label: "Apartments" },
  { value: "DHA", label: "View City · Karachi" },
];

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    // Muted inline playback is allowed everywhere; the catch guards the
    // rare autoplay rejection, where the poster simply remains.
    video.play().catch(() => {});
    return () => video.pause();
  }, [reduced]);

  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-end overflow-hidden lg:m-3 lg:min-h-[calc(100svh-1.5rem)] lg:rounded-3xl"
    >
      {/* background film */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* scrim: keeps type legible without flattening the film */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgb(17 17 17 / 0.78) 0%, rgb(17 17 17 / 0.35) 38%, rgb(17 17 17 / 0.08) 62%, rgb(17 17 17 / 0.22) 100%)",
        }}
      />

      {/* content */}
      <div className="relative z-10 mx-auto w-full max-w-(--container-page) px-(--spacing-gutter) pt-28 pb-10 lg:pb-14">
        <p className="mb-4 text-[0.6875rem] tracking-[0.26em] text-[#f5ede4]/80 uppercase">
          DHA View City · Karachi
        </p>
        <h1 className="font-display max-w-[13ch] text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[0.96] font-bold tracking-[-0.02em] text-[#f5ede4] text-balance">
          Where nature powers modern living.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[#f5ede4]/85 md:text-base">
          A future-focused residential development shaped around natural airflow,
          renewable-energy planning and refined family living.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#enquire"
            className="rounded-full bg-[#f5ede4] px-6 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#d2815d] hover:text-[#111111]"
          >
            Register Interest
          </a>
          <a
            href="#residences"
            className="rounded-full border border-[#f5ede4]/40 px-6 py-3 text-sm font-semibold text-[#f5ede4] backdrop-blur-sm transition-colors hover:bg-[#f5ede4]/15"
          >
            Explore the Residences
          </a>
          <span
            className="hidden rounded-full border border-[#f5ede4]/20 px-6 py-3 text-sm text-[#f5ede4]/60 sm:inline"
            title="Available once the final brochure is approved"
          >
            Brochure — soon
          </span>
        </div>

        {/* compact facts rail */}
        <dl className="mt-10 flex w-fit flex-wrap items-start rounded-xl border border-[#f5ede4]/15 bg-[#111111]/45 px-2 py-4 backdrop-blur-md">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={`px-5 ${i > 0 ? "border-l border-[#f5ede4]/15" : ""}`}
            >
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span
                  className={`font-display block leading-none font-semibold text-[#f5ede4] ${
                    i === 2 ? "text-4xl" : "text-3xl"
                  }`}
                >
                  {fact.value}
                </span>
                <span className="mt-1.5 block max-w-[7rem] text-[0.6rem] tracking-[0.14em] text-[#f5ede4]/65 uppercase">
                  {fact.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

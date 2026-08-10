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
  { value: "12", label: "Luxury Storeys" },
  { value: "02", label: "Umer & Abdullah Blocks" },
  { value: "160", label: "Exclusive Apartments" },
  { value: "08", label: "Duplex Penthouses" },
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
      className="relative z-10 flex min-h-svh items-end overflow-hidden lg:m-3 lg:min-h-[calc(100svh-1.5rem)] lg:rounded-3xl"
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
        <p className="mb-4 text-[0.65rem] font-medium tracking-[0.3em] text-[#C6A46B] uppercase">
          DHA City · Karachi
        </p>
        <h1 className="font-display max-w-[14ch] text-[clamp(2.8rem,6.2vw,5.6rem)] leading-[1.02] font-semibold tracking-[-0.01em] text-[#F7F0E8] text-balance">
          Where nature powers <em className="italic">modern living.</em>
        </h1>
        <p className="mt-5 max-w-md text-[0.85rem] leading-relaxed font-light text-[#F3E7D8]/85 md:text-[0.95rem]">
          A future-focused residential development shaped around natural airflow, renewable
          energy, resilient water planning and refined family living.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#enquire"
            className="rounded-lg bg-[#C6A46B] px-6 py-3 text-sm font-semibold tracking-wide text-[#1D1714] transition-colors hover:bg-[#B8935A]"
          >
            Register Interest
          </a>
          <a
            href="#residences"
            className="rounded-lg border border-[#C6A46B]/55 bg-[#1D1714]/30 px-6 py-3 text-sm font-medium text-[#F7F0E8] backdrop-blur-sm transition-colors hover:bg-[#1D1714]/55"
          >
            Explore the Residences
          </a>
          <span
            className="hidden rounded-lg border border-[#F7F0E8]/18 px-6 py-3 text-sm text-[#F7F0E8]/50 sm:inline"
            title="Available once the final brochure is approved"
          >
            Brochure — soon
          </span>
        </div>

        {/* compact facts rail */}
        <dl className="mt-10 flex w-fit flex-wrap items-start rounded-xl border border-[#C6A46B]/25 bg-[#1D1714]/50 px-2 py-4 backdrop-blur-md">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={`px-5 ${i > 0 ? "border-l border-[#F7F0E8]/12" : ""}`}
            >
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span
                  className={`font-display block leading-none font-semibold text-[#F7F0E8] ${
                    i === 2 ? "text-[2.6rem]" : "text-[2.1rem]"
                  }`}
                >
                  {fact.value}
                </span>
                <span className="mt-1.5 block max-w-[7rem] text-[0.6rem] tracking-[0.14em] text-[#C6A46B] uppercase">
                  {fact.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 max-w-md text-[0.7rem] tracking-[0.08em] text-[#F3E7D8]/70">
          Eight exclusive duplex penthouses with independent swimming pools.
        </p>
      </div>
    </section>
  );
}

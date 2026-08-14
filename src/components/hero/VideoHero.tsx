"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Video hero — the client's cinematic rooftop film as the hero background
 * (public/hero.mp4: 1080p H.264 transcode of the supplied 4K HEVC source,
 * looping; public/hero-poster.jpg paints immediately).
 *
 * Playback is gated in JS rather than via the autoPlay attribute so
 * reduced-motion visitors get the still poster frame — no motion, same
 * composition. Content overlays on a charcoal scrim: eyebrow, headline,
 * copy, CTAs and the compact facts rail.
 *
 * Autoplay policies require the video to start muted; a fixed corner
 * control lets the visitor turn the film's own audio on as a deliberate
 * action, and stays pinned to the viewport (not the section) while the
 * hero is playing. The film only pauses — and audio resets off — once
 * the ENTIRE hero has scrolled out of view, not the moment it starts
 * leaving; scrolling back up resumes it.
 */

const FACTS = [
  { value: "12", label: "Luxury Storeys" },
  { value: "02", label: "Umer & Abdullah Blocks" },
  { value: "160", label: "Exclusive Apartments" },
  { value: "08", label: "Duplex Penthouses" },
];

export default function VideoHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const hintShown = useRef(false);

  /* draw attention to the audio control once, shortly after the film
     starts — dismisses itself, or the moment the visitor acts on it */
  useEffect(() => {
    if (reduced || hintShown.current || !playing) return;
    hintShown.current = true;
    const showTimer = setTimeout(() => setShowHint(true), 1400);
    const hideTimer = setTimeout(() => setShowHint(false), 7400);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [reduced, playing]);

  /* the film keeps playing until the whole hero has scrolled past —
     not the instant it starts leaving the viewport */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          return;
        }
        // fully passed only once its bottom edge has cleared the top —
        // not while it simply hasn't been reached yet on first load
        if (entry.boundingClientRect.bottom <= 0) {
          setPlaying(false);
          setMuted(true);
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    if (playing) {
      // Muted inline playback is allowed everywhere; the catch guards the
      // rare autoplay rejection, where the poster simply remains.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    if (!playing) setShowHint(false);
  }, [reduced, playing]);

  const toggleAudio = () => {
    setMuted((m) => !m);
    setShowHint(false);
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      /* the film runs edge to edge — the mobile header steps aside for it */
      data-hide-header
      className="relative z-10 flex min-h-svh items-end overflow-hidden lg:m-3 lg:min-h-[calc(100svh-1.5rem)] lg:rounded-3xl"
    >
      {/* background film */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* audio toggle — fixed to the viewport, bottom-right, so it stays
          reachable the whole time the film is playing; the film starts
          muted (autoplay requires it) and this is the visitor's own
          choice to turn its sound on. Fades away once the film pauses. */}
      {!reduced && (
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.92 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-5 bottom-6 z-40 flex items-center gap-3 lg:right-8 lg:bottom-8"
            >
              {/* attention bubble — appears once, points at the control */}
              <AnimatePresence>
                {showHint && (
                  <motion.button
                    type="button"
                    onClick={toggleAudio}
                    initial={{ opacity: 0, x: 8, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.94 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-h-11 items-center gap-2 rounded-full border border-[#F5EDE3]/20 bg-[#2B211D]/80 py-2.5 pr-4 pl-4 text-[0.78rem] font-medium whitespace-nowrap text-[#F5EDE3] shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors hover:bg-[#2B211D]/92"
                  >
                    Tap to hear the film
                    <span aria-hidden="true" className="text-[#C99355]">
                      →
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="relative flex h-12 w-12 items-center justify-center">
                {/* pulse ring — a quiet sonar ping while the hint is up */}
                {showHint && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-[#C99355]/70"
                    initial={{ opacity: 0.55, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.65 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <motion.button
                  type="button"
                  onClick={toggleAudio}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  aria-pressed={!muted}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#F5EDE3]/25 bg-[#2B211D]/55 text-[#F5EDE3] shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors hover:bg-[#2B211D]/75"
                >
              <span className="sr-only">{muted ? "Unmute video" : "Mute video"}</span>
              {muted ? (
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z"
                  />
                  <path
                    fill="currentColor"
                    d="M17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 0 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L18.56 12l1.72-1.72a.75.75 0 0 0-1.06-1.06l-1.72 1.72-1.72-1.72Z"
                  />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z"
                  />
                  <path
                    fill="currentColor"
                    d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z"
                  />
                  <path
                    fill="currentColor"
                    d="M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
              )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
      <div className="relative z-10 mx-auto w-full max-w-(--container-page) px-(--spacing-gutter) pt-20 pb-16 sm:pt-28 sm:pb-10 lg:pb-14">
        <p className="mb-4 text-[0.65rem] font-medium tracking-[0.3em] text-[#C99355] uppercase">
          DHA City · Karachi
        </p>
        <h1 className="font-display max-w-[14ch] text-[clamp(2.8rem,6.2vw,5.6rem)] leading-[1.02] font-semibold tracking-[-0.01em] text-[#F5EDE3] text-balance">
          Where nature powers <em className="italic">modern living.</em>
        </h1>
        <p className="mt-4 max-w-md text-[0.82rem] leading-relaxed font-light text-[#EEE1D3]/85 sm:mt-5 sm:text-[0.85rem] md:text-[0.95rem]">
          A future-focused residential development shaped around natural airflow, renewable
          energy, resilient water planning and refined family living.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
          <a
            href="#enquire"
            className="rounded-lg bg-[#C99355] px-6 py-3 text-sm font-semibold tracking-wide text-[#2B211D] transition-colors hover:bg-[#B8935A]"
          >
            Register Interest
          </a>
          <a
            href="#residences"
            className="rounded-lg border border-[#C99355]/55 bg-[#2B211D]/30 px-6 py-3 text-sm font-medium text-[#F5EDE3] backdrop-blur-sm transition-colors hover:bg-[#2B211D]/55"
          >
            Explore the Residences
          </a>
          <a
            href="/FWCE.pdf"
            download
            className="hidden rounded-lg border border-[#F5EDE3]/35 px-6 py-3 text-sm font-medium text-[#F5EDE3] backdrop-blur-sm transition-colors hover:bg-[#2B211D]/40 sm:inline"
          >
            Download Brochure
          </a>
        </div>

        {/* compact facts rail */}
        <p className="mt-4 max-w-md sm:mt-5 text-[0.66rem] leading-snug tracking-[0.06em] text-[#EEE1D3]/70 sm:mt-3 sm:text-[0.7rem] sm:tracking-[0.08em]">
          Eight exclusive duplex penthouses with independent swimming pools.
        </p>
        <dl className="mt-5 flex w-full items-stretch rounded-xl border border-[#C99355]/25 bg-[#2B211D]/50 px-1 py-3 backdrop-blur-md sm:mt-10 sm:w-fit sm:flex-wrap sm:items-start sm:px-2 sm:py-4">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={`min-w-0 flex-1 px-2 sm:flex-none sm:px-5 ${i > 0 ? "border-l border-[#F5EDE3]/12" : ""}`}
            >
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span
                  className={`font-display block leading-none font-semibold text-[#F5EDE3] ${
                    i === 2 ? "text-[1.5rem] sm:text-[2.6rem]" : "text-[1.35rem] sm:text-[2.1rem]"
                  }`}
                >
                  {fact.value}
                </span>
                <span className="mt-1 block text-[0.46rem] leading-[1.25] tracking-[0.1em] text-[#C99355] uppercase sm:mt-1.5 sm:max-w-[7rem] sm:text-[0.6rem] sm:tracking-[0.14em]">
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

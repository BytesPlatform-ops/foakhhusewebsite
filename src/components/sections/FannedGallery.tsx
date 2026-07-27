"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";
import { Plate, type PlateId } from "./plates";

/**
 * 21 — Fanned Architectural Gallery (Lando-deck behaviour, restrained).
 * Desktop: 5–7 cards partially visible; active card 0 degrees and forward,
 * neighbours 4–9 degrees with progressive offset; drag, buttons and
 * keyboard arrows; numeric 01/08 progress; the section background takes a
 * low-saturation tint from the active card's category. Captions are always
 * visible — never hover-only. Mobile: active card + next-card preview,
 * swipe or buttons.
 *
 * Cards are original concept plates until approved model photography is
 * supplied as files — each is captioned honestly as a concept.
 */

interface Card {
  id: PlateId;
  title: string;
  category: string;
  /** low-saturation background tint for the active state */
  tint: string;
}

const CARDS: Card[] = [
  { id: "facade", title: "Front elevation", category: "Architecture — concept", tint: "#d9c6b4" },
  { id: "site", title: "Site & road", category: "Architecture — concept", tint: "#d5cbb8" },
  { id: "balcony", title: "Balcony outlook", category: "Residences — concept", tint: "#cfc0ae" },
  { id: "living", title: "Living space", category: "Residences — concept", tint: "#d8c2ac" },
  { id: "pool", title: "Pool", category: "Amenities — concept", tint: "#bcd2cd" },
  { id: "lobby", title: "Elevator lobby", category: "Amenities — concept", tint: "#c9b8a4" },
  { id: "parking", title: "Parking", category: "Amenities — concept", tint: "#bfbab2" },
  { id: "recreation", title: "Recreation", category: "Lifestyle — concept", tint: "#c2cdb9" },
];

export default function FannedGallery() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => Math.min(Math.max(a + dir, 0), CARDS.length - 1)),
    [],
  );

  // Keyboard arrows while the gallery region has focus.
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const card = CARDS[active];

  return (
    <section
      id="gallery"
      data-section="gallery"
      className="grain blend-top relative overflow-hidden py-(--spacing-section) transition-colors duration-[900ms]"
      style={
        {
          "--blend-from": "#a06a44",
          backgroundColor: card.tint,
        } as React.CSSProperties
      }
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="06">Gallery</Eyebrow>
        <ChapterHeading id="gallery-heading">The project, from every angle.</ChapterHeading>
        <Lead>
          Architectural concepts across the development — model photography joins the deck once
          approved imagery is supplied.
        </Lead>

        <div
          ref={regionRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Project gallery"
          tabIndex={0}
          className="relative mt-12 outline-offset-4"
        >
          {/* The fan */}
          <div className="relative mx-auto h-[46svh] min-h-72 max-w-3xl select-none">
            {CARDS.map((c, i) => {
              const d = i - active;
              const abs = Math.abs(d);
              if (abs > 3) return null;
              const rotate = d * (abs === 1 ? 5 : 7);
              const x = d * 13; // percent
              return (
                <motion.figure
                  key={c.id}
                  className="absolute inset-y-0 left-1/2 w-[74%] max-w-md cursor-grab active:cursor-grabbing"
                  style={{ zIndex: 10 - abs }}
                  animate={{
                    x: `calc(-50% + ${x}%)`,
                    rotate: reduced ? 0 : rotate,
                    scale: d === 0 ? 1 : 0.92 - abs * 0.03,
                    opacity: abs === 3 ? 0.4 : 1,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  drag={d === 0 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.28}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(1);
                    else if (info.offset.x > 60) go(-1);
                  }}
                >
                  <div
                    className={`overflow-hidden rounded-2xl bg-white/40 transition-shadow duration-500 ${
                      d === 0
                        ? "shadow-[0_40px_80px_-36px_rgba(23,24,22,0.6)]"
                        : "shadow-[0_16px_40px_-28px_rgba(23,24,22,0.45)]"
                    }`}
                  >
                    <div className="pointer-events-none aspect-[10/7]">
                      <Plate id={c.id} />
                    </div>
                  </div>
                </motion.figure>
              );
            })}
          </div>

          {/* Caption + controls — always visible */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4">
            <div aria-live="polite">
              <p className="text-bronze text-[0.6875rem] tracking-[0.22em] uppercase">
                {card.category}
              </p>
              <p className="font-display text-charcoal mt-1 text-2xl font-semibold">{card.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-ink-soft text-sm tabular-nums">
                {String(active + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={active === 0}
                aria-label="Previous image"
                className="border-charcoal/25 text-charcoal hover:bg-charcoal hover:text-ivory rounded-full border px-4 py-2.5 transition-colors duration-[var(--duration-ui)] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-inherit"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={active === CARDS.length - 1}
                aria-label="Next image"
                className="border-charcoal/25 text-charcoal hover:bg-charcoal hover:text-ivory rounded-full border px-4 py-2.5 transition-colors duration-[var(--duration-ui)] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-inherit"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

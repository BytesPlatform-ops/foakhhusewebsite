"use client";

import { useState } from "react";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 17 — Two Blocks, One Considered Community.
 * High three-quarter site view (~35 degrees, 40mm feel). The toggle shifts
 * the composition 3–5 degrees and edge-lights the active block; the other
 * stays present but quieter. No invented per-block differences — the
 * brochure verifies none, so both describe the same standard.
 */

const BLOCKS = [
  { key: "umer", name: "Umer Block" },
  { key: "abdullah", name: "Abdullah Block" },
] as const;

export default function TwoBlocks() {
  const [active, setActive] = useState<(typeof BLOCKS)[number]["key"]>("umer");
  const isUmer = active === "umer";

  return (
    <section
      id="blocks"
      data-section="blocks"
      className="mineral-ivory grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#b06c4c" } as React.CSSProperties}
      aria-labelledby="blocks-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="03">The composition</Eyebrow>
        <ChapterHeading id="blocks-heading">Two blocks. One considered community.</ChapterHeading>
        <Lead>
          Umer Block and Abdullah Block share one architectural standard, one amenity
          programme and one limited community of 84 apartments.
        </Lead>

        {/* Toggle */}
        <div role="tablist" aria-label="Select block" className="mt-10 inline-flex gap-1 rounded-full border border-charcoal/15 p-1">
          {BLOCKS.map((b) => (
            <button
              key={b.key}
              role="tab"
              aria-selected={active === b.key}
              onClick={() => setActive(b.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-ui)] ${
                active === b.key ? "bg-charcoal text-ivory" : "text-ink-soft hover:text-charcoal"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <figure className="mt-10">
          <svg
            viewBox="0 0 900 460"
            className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out-quint)]"
            style={{ transform: `rotate(${isUmer ? -1.5 : 1.5}deg)` }}
            role="img"
            aria-label={`Site view of both blocks with ${isUmer ? "Umer" : "Abdullah"} Block highlighted.`}
          >
            <defs>
              <linearGradient id="tb-face" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c98a68" />
                <stop offset="100%" stopColor="#8a5138" />
              </linearGradient>
            </defs>
            <g transform="translate(70 30) skewX(-9)">
              {/* ground + road */}
              <rect x="-30" y="330" width="820" height="60" fill="#3b3a37" />
              <rect x="-30" y="348" width="820" height="4" fill="#c9baa6" />
              <rect x="-30" y="392" width="820" height="30" fill="#4c7056" />
              {/* central shared square */}
              <rect x="352" y="256" width="64" height="50" fill="#c9baa6" />
              <rect x="362" y="264" width="44" height="34" fill="#4c7056" />
              {/* blocks */}
              {[
                { x: 60, key: "umer", label: "UMER" },
                { x: 470, key: "abdullah", label: "ABDULLAH" },
              ].map((blk) => {
                const on = active === blk.key;
                return (
                  <g
                    key={blk.key}
                    style={{
                      transition: "opacity 0.7s var(--ease-out-quint), transform 0.7s var(--ease-out-quint)",
                      opacity: on ? 1 : 0.55,
                      transform: on ? "translateY(-8px)" : "translateY(0)",
                    }}
                  >
                    <rect x={blk.x + 14} y="94" width="220" height="216" fill="#6d3f2c" />
                    <rect x={blk.x} y="80" width="220" height="216" fill="url(#tb-face)" />
                    {Array.from({ length: 7 }).map((_, f) => (
                      <rect key={f} x={blk.x} y={104 + f * 28} width="220" height="6" fill="#5f3826" opacity="0.8" />
                    ))}
                    <rect x={blk.x} y="64" width="220" height="18" fill="#daa27e" />
                    {/* champagne edge light on the active block */}
                    <rect
                      x={blk.x - 4}
                      y="64"
                      width="6"
                      height="232"
                      fill="#ffd88f"
                      opacity={on ? 0.9 : 0}
                      style={{ transition: "opacity 0.7s var(--ease-out-quint)" }}
                    />
                    <text x={blk.x + 6} y="322" fontSize="14" letterSpacing="3" fill="#5f3826">
                      {blk.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
          <figcaption className="text-ink-soft mt-3 text-xs">
            Both blocks are built to the same verified specification — 12 storeys, shared
            amenity programme, one community.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

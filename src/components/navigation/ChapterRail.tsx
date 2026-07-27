"use client";

import { useEffect, useState } from "react";

/**
 * Units-inspired chapter rail, translated into the Wind Corridor palette.
 * Desktop: fixed left rail with numbered colour chapters, active chapter
 * expands, Register Interest pinned at the bottom. Mobile: compact top bar.
 *
 * Scroll-spy via IntersectionObserver; `aria-current` marks the active
 * chapter for assistive tech, not just visually.
 */

const CHAPTERS = [
  { num: "01", label: "Project", target: "glance", color: "bg-wind-blue" },
  { num: "02", label: "Systems", target: "route", color: "bg-champagne" },
  { num: "03", label: "Residences", target: "residences", color: "bg-terracotta" },
  { num: "04", label: "Lifestyle", target: "amenities", color: "bg-garden" },
  { num: "05", label: "Location", target: "location", color: "bg-mineral" },
  { num: "06", label: "Enquire", target: "enquire", color: "bg-bronze" },
] as const;

export default function ChapterRail() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const targets = CHAPTERS.map((c) => document.getElementById(c.target)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!targets.length) return;

    // Track which chapter sections are on screen; the top-most wins.
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = CHAPTERS.find((c) => visible.has(c.target));
        if (first) setActive(first.target);
      },
      { rootMargin: "-20% 0px -40% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ---------------- Desktop rail ---------------- */}
      <nav
        aria-label="Chapters"
        className="bg-ivory/92 border-charcoal/8 fixed inset-y-0 left-0 z-(--z-rail) hidden w-44 flex-col border-r px-3 py-5 backdrop-blur-sm lg:flex"
      >
        <a href="#hero" className="mb-6 block px-2" aria-label="The Wind Corridor Residences — top">
          <span className="font-display text-charcoal block text-xl leading-none font-bold">
            wind
            <br />
            corridor.
          </span>
          <span className="text-ink-soft mt-1.5 block text-[0.55rem] tracking-[0.18em] uppercase">
            Unique residences · Karachi
          </span>
        </a>

        <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {CHAPTERS.map((c) => {
            const isActive = active === c.target;
            return (
              <li key={c.num}>
                <a
                  href={`#${c.target}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`${c.color} group relative block overflow-hidden rounded-xl px-3 transition-all duration-[var(--duration-ui)] ease-[var(--ease-out-quint)] ${
                    isActive ? "py-6 opacity-100" : "py-3.5 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="text-charcoal/80 block text-[0.6rem] font-semibold tracking-wide">
                    {c.num}
                  </span>
                  <span className="text-charcoal mt-0.5 block text-[0.8rem] leading-tight font-bold">
                    {c.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-charcoal/70 absolute top-2.5 right-2.5 text-xs transition-transform duration-[var(--duration-ui)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href="#enquire"
          className="bg-charcoal text-ivory hover:bg-deep-earth mt-3 block rounded-xl px-3 py-3.5 text-center text-[0.8rem] font-bold transition-colors duration-[var(--duration-ui)]"
        >
          Register Interest
        </a>
      </nav>

      {/* ---------------- Mobile top bar ---------------- */}
      <header className="bg-ivory/92 border-charcoal/8 fixed inset-x-0 top-0 z-(--z-header) flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm lg:hidden">
        <a href="#hero" className="font-display text-charcoal text-lg leading-none font-bold">
          wind corridor.
        </a>
        <a
          href="#enquire"
          className="bg-charcoal text-ivory rounded-full px-4 py-2 text-xs font-bold"
        >
          Register Interest
        </a>
      </header>
    </>
  );
}

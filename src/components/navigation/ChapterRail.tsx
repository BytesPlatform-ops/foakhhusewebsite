"use client";

import { useEffect, useState } from "react";

/**
 * Chapter rail rebuilt to the Units structural reference: a solid designed
 * object — warm cream ground, strong black wordmark, four large flat
 * colour blocks (number upper-left, NE arrow upper-right, bold title
 * anchored lower-left), purple primary CTA, black utility block. No glass,
 * no gradients, no outlines-as-buttons. The cinematic treatment belongs to
 * the hero; the rail stays flat and confident.
 *
 * Desktop: fixed 200px rail. Mobile: cream top header with menu button +
 * CTA, opening a full-screen menu that keeps the four chapter colours.
 */

interface Chapter {
  number: string;
  title: string;
  href: string;
  colour: string;
}

/**
 * Inactive cards sit in a single cohesive tint family — same lightness and
 * saturation across all four hues (Apple Notes–folder style), so the set
 * reads as one considered palette rather than four unrelated pastels.
 * The active card jumps to the bold brand accent so it always stays distinct.
 */
const ACCENT = "#B65438";
const TEXT_INACTIVE = "#2B211D";
const TEXT_ACTIVE = "#FAF6F0";

const CHAPTERS: Chapter[] = [
  { number: "01", title: "The Project", href: "#glance", colour: "#EFD1C8" },
  { number: "02", title: "Natural Systems", href: "#route", colour: "#D1E6DB" },
  { number: "03", title: "Residences & Lifestyle", href: "#residences", colour: "#EFE2C8" },
  { number: "04", title: "Location & Gallery", href: "#location", colour: "#CBDEEB" },
];

/** Darken a hex colour by a factor (0–1) for hover states, keeping each chapter's own hue. */
function darken(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

/** section ids that roll up into each chapter for the scroll-spy */
const SPY_TARGETS: Record<string, string[]> = {
  "#glance": ["glance", "nature"],
  "#route": ["route"],
  "#residences": ["residences"],
  "#location": ["location", "gallery", "enquire"],
};

function useActiveChapter() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const idToChapter = new Map<string, string>();
    for (const [href, ids] of Object.entries(SPY_TARGETS))
      for (const id of ids) idToChapter.set(id, href);

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        for (const c of CHAPTERS) {
          if (SPY_TARGETS[c.href].some((id) => visible.has(id))) {
            setActive(c.href);
            return;
          }
        }
        setActive("");
      },
      { rootMargin: "-20% 0px -40% 0px" },
    );
    idToChapter.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className="block">
      <span
        className={`font-display block leading-[0.9] font-bold tracking-[-0.01em] text-[#B65438] ${
          big ? "text-4xl" : "text-[1.7rem]"
        }`}
      >
        foakh
        <br />
        wind corridor.
      </span>
      <span className="mt-1.5 block text-[0.55rem] font-medium tracking-[0.18em] text-[#2B211D]/70 uppercase">
        Wind Corridor Enclave · Karachi
      </span>
    </span>
  );
}

function ChapterCard({
  chapter,
  isActive,
  onNavigate,
  tall = true,
}: {
  chapter: Chapter;
  isActive: boolean;
  onNavigate?: () => void;
  tall?: boolean;
}) {
  return (
    <a
      href={chapter.href}
      onClick={onNavigate}
      aria-current={isActive ? "location" : undefined}
      className={`group relative flex flex-col justify-between rounded-[13px] p-3.5 transition-[transform,box-shadow,height,width,background-color,color] duration-200 ease-out hover:z-10 hover:scale-[1.05] hover:shadow-[0_10px_28px_-10px_rgb(0_0_0/0.6)] ${
        isActive ? "w-full shadow-[0_8px_24px_-10px_rgb(0_0_0/0.55)]" : "w-[92%] hover:w-full"
      }`}
      style={{
        backgroundColor: isActive ? ACCENT : chapter.colour,
        height: tall
          ? `clamp(104px, ${isActive ? "15vh" : "14vh"}, ${isActive ? "140px" : "132px"})`
          : "96px",
        boxShadow: isActive ? "inset 0 0 0 2px rgb(255 248 239 / 0.5)" : undefined,
        color: isActive ? TEXT_ACTIVE : TEXT_INACTIVE,
        transitionProperty: "transform, box-shadow, height, width, background-color, color",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = darken(chapter.colour, 0.82);
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = chapter.colour;
      }}
    >
      <span className="flex items-start justify-between">
        <span className="text-[0.7rem] font-bold" style={{ color: isActive ? TEXT_ACTIVE : ACCENT }}>
          {chapter.number}
        </span>
        <span
          aria-hidden="true"
          className="text-base leading-none font-bold transition-transform duration-200 group-hover:translate-x-[2.5px] group-hover:-translate-y-[2.5px]"
        >
          ↗
        </span>
      </span>
      <span className="max-w-[9.5rem] text-[0.95rem] leading-[1.15] font-bold">
        {chapter.title}
      </span>
    </a>
  );
}

function RailActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-2.5">
      <a
        href="#enquire"
        onClick={onNavigate}
        className="flex h-[54px] w-full items-center justify-center rounded-[11px] bg-[#294A3E] text-[0.85rem] font-bold text-[#FAF6F0] transition-transform duration-200 hover:scale-[1.01]"
      >
        Register Interest
      </a>
      <a
        href="/FWCE.pdf"
        download
        onClick={onNavigate}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#2B211D] text-[0.8rem] font-bold text-white/85 transition-transform duration-200 hover:scale-[1.01]"
      >
        Download Brochure <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

export default function ChapterRail() {
  const active = useActiveChapter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* ---------------- Desktop rail ---------------- */}
      <nav
        aria-label="Chapters"
        className="fixed inset-y-0 left-0 z-(--z-rail) hidden w-[200px] flex-col bg-[#F5EDE3] px-4 py-5 lg:flex"
      >
        <a href="#hero" className="mb-5 block w-[82%]" aria-label="Foakh Wind Corridor Enclave — top">
          <Wordmark />
        </a>

        <ul className="flex flex-1 flex-col gap-[11px]">
          {CHAPTERS.map((c) => (
            <li key={c.number}>
              <ChapterCard chapter={c} isActive={active === c.href} />
            </li>
          ))}
        </ul>

        <div className="mt-3">
          <RailActions />
        </div>
      </nav>

      {/* ---------------- Mobile header + full-screen menu ---------------- */}
      <header className="fixed inset-x-0 top-0 z-(--z-header) flex items-center justify-between bg-[#F5EDE3] px-4 py-2.5 lg:hidden">
        <a href="#hero" aria-label="Foakh Wind Corridor Enclave — top">
          <span className="font-display text-xl leading-none font-bold tracking-[-0.01em] text-[#B65438]">
            foakh wind corridor.
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="#enquire"
            className="rounded-full bg-[#294A3E] px-3.5 py-2 text-xs font-bold text-[#FAF6F0]"
          >
            Register Interest
          </a>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full bg-[#2B211D] px-3.5 py-2 text-xs font-bold text-white"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-(--z-header) flex flex-col bg-[#F5EDE3] px-4 pt-16 pb-5 lg:hidden"
        >
          <div className="mb-5">
            <Wordmark big />
          </div>
          <ul className="flex flex-1 flex-col gap-2.5">
            {CHAPTERS.map((c) => (
              <li key={c.number}>
                <ChapterCard
                  chapter={c}
                  isActive={active === c.href}
                  onNavigate={() => setMenuOpen(false)}
                  tall={false}
                />
              </li>
            ))}
          </ul>
          <RailActions onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </>
  );
}

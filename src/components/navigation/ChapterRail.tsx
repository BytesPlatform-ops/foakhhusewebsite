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

const CHAPTERS: Chapter[] = [
  { number: "01", title: "The Project", href: "#glance", colour: "#1874E8" },
  { number: "02", title: "Natural Systems", href: "#route", colour: "#FFB400" },
  { number: "03", title: "Residences & Lifestyle", href: "#residences", colour: "#FF5A20" },
  { number: "04", title: "Location & Gallery", href: "#location", colour: "#00AD4F" },
];

/** section ids that roll up into each chapter for the scroll-spy */
const SPY_TARGETS: Record<string, string[]> = {
  "#glance": ["glance", "nature"],
  "#route": ["route", "wind", "solar", "harmony", "water"],
  "#residences": ["residences", "blocks", "amenities", "timeline"],
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
        className={`font-display block leading-[0.9] font-black tracking-[-0.02em] text-[#111111] ${
          big ? "text-4xl" : "text-[1.7rem]"
        }`}
      >
        wind
        <br />
        corridor.
      </span>
      <span className="mt-1.5 block text-[0.55rem] font-medium tracking-[0.18em] text-[#111111]/70 uppercase">
        Unique residences · Karachi
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
      className="group relative flex w-full flex-col justify-between rounded-[13px] p-3.5 transition-[transform,box-shadow,height] duration-200 ease-out hover:scale-[1.01] hover:shadow-[0_6px_18px_-8px_rgb(17_17_17/0.45)]"
      style={{
        backgroundColor: chapter.colour,
        height: tall
          ? `clamp(104px, ${isActive ? "15vh" : "14vh"}, ${isActive ? "140px" : "132px"})`
          : "96px",
        boxShadow: isActive ? "inset 0 0 0 2px rgb(17 17 17 / 0.8)" : undefined,
      }}
    >
      <span className="flex items-start justify-between">
        <span className="text-[0.7rem] font-bold text-[#111111]">{chapter.number}</span>
        <span
          aria-hidden="true"
          className="text-base leading-none font-bold text-[#111111] transition-transform duration-200 group-hover:translate-x-[2.5px] group-hover:-translate-y-[2.5px]"
        >
          ↗
        </span>
      </span>
      <span className="max-w-[9.5rem] text-[0.95rem] leading-[1.15] font-bold text-[#111111]">
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
        className="flex h-[54px] w-full items-center justify-center rounded-[11px] bg-[#A74CF4] text-[0.85rem] font-bold text-[#111111] transition-transform duration-200 hover:scale-[1.01]"
      >
        Register Interest
      </a>
      <span
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#111111] text-[0.8rem] font-bold text-white/85"
        title="Available once the final brochure is approved"
      >
        Download Brochure <span aria-hidden="true">↓</span>
      </span>
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
        className="fixed inset-y-0 left-0 z-(--z-rail) hidden w-[200px] flex-col bg-[#F3EAE1] px-4 py-5 lg:flex"
      >
        <a href="#hero" className="mb-5 block w-[82%]" aria-label="The Wind Corridor Residences — top">
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
      <header className="fixed inset-x-0 top-0 z-(--z-header) flex items-center justify-between bg-[#F3EAE1] px-4 py-2.5 lg:hidden">
        <a href="#hero" aria-label="The Wind Corridor Residences — top">
          <span className="font-display text-xl leading-none font-black tracking-[-0.02em] text-[#111111]">
            wind corridor.
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="#enquire"
            className="rounded-full bg-[#A74CF4] px-3.5 py-2 text-xs font-bold text-[#111111]"
          >
            Register Interest
          </a>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full bg-[#111111] px-3.5 py-2 text-xs font-bold text-white"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-(--z-header) flex flex-col bg-[#F3EAE1] px-4 pt-16 pb-5 lg:hidden"
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

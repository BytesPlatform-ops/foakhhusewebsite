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
  /** soft tint while inactive — dark ink text */
  tint: string;
  /** strong colour only while active */
  active: string;
  /** text colour on the ACTIVE surface */
  activeText: string;
}

const INK = "#211A17";

const CHAPTERS: Chapter[] = [
  { number: "01", title: "The Project", href: "#glance", tint: "#EBC6B6", active: "#C75B3B", activeText: "#FFF8EF" },
  { number: "02", title: "Natural Systems", href: "#route", tint: "#CAD5C3", active: "#659B98", activeText: "#FFF8EF" },
  { number: "03", title: "Residences & Lifestyle", href: "#residences", tint: "#F1C1B0", active: "#E87957", activeText: "#FFF8EF" },
  { number: "04", title: "Location & Gallery", href: "#location", tint: "#EAD9B4", active: "#E5AD42", activeText: "#211A17" },
];

/** section ids that roll up into each chapter for the scroll-spy */
const SPY_TARGETS: Record<string, string[]> = {
  "#glance": ["glance", "nature"],
  "#route": ["route", "wind", "solar", "harmony", "water"],
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
        className={`font-display block leading-[0.9] font-bold tracking-[-0.01em] text-[#C75B3B] ${
          big ? "text-4xl" : "text-[1.7rem]"
        }`}
      >
        foakh
        <br />
        wind corridor.
      </span>
      <span className="mt-1.5 block text-[0.55rem] font-medium tracking-[0.18em] text-[#211A17]/70 uppercase">
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
      className="group relative flex w-full flex-col justify-between rounded-[13px] p-3.5 transition-[transform,box-shadow,height] duration-200 ease-out hover:scale-[1.01] hover:shadow-[0_6px_18px_-8px_rgb(17_17_17/0.45)]"
      style={{
        backgroundColor: isActive ? chapter.active : chapter.tint,
        height: tall
          ? `clamp(104px, ${isActive ? "15vh" : "14vh"}, ${isActive ? "140px" : "132px"})`
          : "96px",
        boxShadow: isActive ? "inset 0 0 0 2px rgb(255 248 239 / 0.5)" : undefined,
        color: isActive ? chapter.activeText : INK,
        transitionProperty: "transform, box-shadow, height, background-color, color",
      }}
    >
      <span className="flex items-start justify-between">
        <span className="text-[0.7rem] font-bold">{chapter.number}</span>
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
        className="flex h-[54px] w-full items-center justify-center rounded-[11px] bg-[#294A3E] text-[0.85rem] font-bold text-[#FFF8EF] transition-transform duration-200 hover:scale-[1.01]"
      >
        Register Interest
      </a>
      <span
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#211A17] text-[0.8rem] font-bold text-white/85"
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
        className="fixed inset-y-0 left-0 z-(--z-rail) hidden w-[200px] flex-col bg-[#F6EBDD] px-4 py-5 lg:flex"
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
      <header className="fixed inset-x-0 top-0 z-(--z-header) flex items-center justify-between bg-[#F6EBDD] px-4 py-2.5 lg:hidden">
        <a href="#hero" aria-label="Foakh Wind Corridor Enclave — top">
          <span className="font-display text-xl leading-none font-bold tracking-[-0.01em] text-[#C75B3B]">
            foakh wind corridor.
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="#enquire"
            className="rounded-full bg-[#294A3E] px-3.5 py-2 text-xs font-bold text-[#FFF8EF]"
          >
            Register Interest
          </a>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full bg-[#211A17] px-3.5 py-2 text-xs font-bold text-white"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-(--z-header) flex flex-col bg-[#F6EBDD] px-4 pt-16 pb-5 lg:hidden"
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

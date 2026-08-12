"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

/**
 * Mobile gets its own destination list, not the desktop four squeezed down.
 * Gallery and Enquire are real sections with their own anchors, so on a phone
 * they are their own destinations rather than being folded into "Location &
 * Gallery" — a visitor looking for the gallery should not have to know it
 * lives under Location. Tints stay inside the existing cream / forest family;
 * no mobile-only hues.
 */
const MOBILE_NAV: Chapter[] = [
  { number: "01", title: "The Project", href: "#glance", colour: "#EFD1C8" },
  { number: "02", title: "Natural Systems", href: "#route", colour: "#D1E6DB" },
  { number: "03", title: "Residences", href: "#residences", colour: "#EFE2C8" },
  { number: "04", title: "Location", href: "#location", colour: "#CBDEEB" },
  { number: "05", title: "Gallery", href: "#gallery", colour: "#EADCCB" },
  { number: "06", title: "Enquire", href: "#enquire", colour: "#C9DBD0" },
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
      {/* the FWCE emblem — kites, turbine and water, the three systems */}
      <Image
        src="/foakh-mark.png"
        alt=""
        width={898}
        height={958}
        priority
        className={`mb-2 block w-auto ${
          big ? "h-14" : "h-[clamp(30px,5vh,54px)]"
        }`}
      />
      {/* one line of type, not two: the full name carries the place and the
          category on its own, so the small caps strip underneath was saying
          the same thing a second time */}
      <span
        className={`font-display block leading-[0.9] font-bold tracking-[-0.01em] text-[#B65438] ${
          big ? "text-4xl" : "text-[clamp(1rem,2.3vh,1.7rem)]"
        }`}
      >
        foakh
        <br />
        wind corridor enclave
      </span>
    </span>
  );
}

function ChapterCard({
  chapter,
  isActive,
  onNavigate,
  tall = true,
  fill = false,
}: {
  chapter: Chapter;
  isActive: boolean;
  onNavigate?: () => void;
  tall?: boolean;
  /** In the rail the card fills whatever share of the column its <li> was
   *  given, so the set always fits the viewport exactly. Elsewhere (the
   *  mobile menu) it keeps its own intrinsic height. */
  fill?: boolean;
}) {
  return (
    <a
      href={chapter.href}
      onClick={onNavigate}
      aria-current={isActive ? "location" : undefined}
      className={`group relative flex flex-col justify-between rounded-[13px] transition-[transform,box-shadow,height,width,background-color,color] duration-200 ease-out hover:z-10 hover:scale-[1.05] hover:shadow-[0_10px_28px_-10px_rgb(0_0_0/0.6)] ${
        fill ? "p-[clamp(9px,1.5vh,14px)]" : "p-3.5"
      } ${
        isActive ? "w-full shadow-[0_8px_24px_-10px_rgb(0_0_0/0.55)]" : "w-[92%] hover:w-full"
      }`}
      style={{
        backgroundColor: isActive ? ACCENT : chapter.colour,
        height: fill
          ? "100%"
          : tall
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
      <span
        className={`max-w-[9.5rem] leading-[1.15] font-bold ${
          fill ? "text-[clamp(0.78rem,1.65vh,0.95rem)]" : "text-[0.95rem]"
        }`}
      >
        {chapter.title}
      </span>
    </a>
  );
}

function RailActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-[clamp(6px,1vh,10px)]">
      <a
        href="#enquire"
        onClick={onNavigate}
        className="flex h-[clamp(40px,5.6vh,54px)] w-full items-center justify-center rounded-[11px] bg-[#294A3E] text-[clamp(0.72rem,1.5vh,0.85rem)] font-bold text-[#FAF6F0] transition-transform duration-200 hover:scale-[1.01]"
      >
        Register Interest
      </a>
      <a
        href="/FWCE.pdf"
        download
        onClick={onNavigate}
        className="flex h-[clamp(34px,4.8vh,46px)] w-full items-center justify-center gap-2 rounded-[11px] bg-[#2B211D] text-[clamp(0.68rem,1.4vh,0.8rem)] font-bold text-white/85 transition-transform duration-200 hover:scale-[1.01]"
      >
        Download Brochure <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

export default function ChapterRail() {
  const active = useActiveChapter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock page scroll while the mobile menu is open, and let Escape close it
  // — tapping the X is the primary route, but a tablet with a keyboard
  // should not be stuck inside the drawer.
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      {/* ---------------- Desktop rail ---------------- */}
      <nav
        aria-label="Chapters"
        className="fixed inset-y-0 left-0 z-(--z-rail) hidden w-[200px] flex-col overflow-hidden bg-[#F5EDE3] px-4 py-[clamp(10px,2vh,20px)] lg:flex"
      >
        <a
          href="#hero"
          className="mb-[clamp(8px,2vh,20px)] block w-[82%] shrink-0"
          aria-label="Foakh Wind Corridor Enclave — top"
        >
          <Wordmark />
        </a>

        {/* The rail never scrolls. The masthead and the two actions take
            their (clamped) intrinsic height, and the chapter list gets
            everything left over, dividing it between the four cards — so
            the same four cards are always all visible, at any window
            height, just proportionally shorter. The active card keeps its
            emphasis by claiming a slightly larger share rather than a
            larger fixed height. */}
        <ul className="flex min-h-0 flex-1 flex-col gap-[clamp(5px,1.1vh,11px)]">
          {CHAPTERS.map((c) => (
            <li
              key={c.number}
              className="min-h-0 basis-0"
              style={{
                flexGrow: active === c.href ? 1.14 : 1,
                /* the same ceiling the fixed heights used to set, so a tall
                   window looks exactly as designed and the spare height
                   collects as one gap above the actions — only a short
                   window pushes the cards below it */
                maxHeight: active === c.href ? 140 : 132,
              }}
            >
              <ChapterCard chapter={c} isActive={active === c.href} fill />
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(8px,1.4vh,12px)] shrink-0">
          <RailActions />
        </div>
      </nav>

      {/* ---------------- Mobile header + full-screen menu ----------------
          The header carries the mark and one control. The old header also
          held a "Register Interest" pill next to a text Menu button; at
          390px that row measured wider than the viewport, so it was a real
          source of horizontal overflow. The CTA lives in the drawer and in
          the closing section, where it has room to be a proper target. */}
      <header
        className="fixed inset-x-0 top-0 z-(--z-header) flex items-center justify-between border-b border-[#2B211D]/10 bg-[#F5EDE3] px-5 pb-2 lg:hidden"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <a href="#hero" className="flex min-w-0 items-center gap-2" aria-label="Foakh Wind Corridor Enclave — top">
          <Image src="/foakh-mark.png" alt="" width={898} height={958} priority className="h-8 w-auto shrink-0" />
          <span className="font-display truncate text-[clamp(0.8rem,3.4vw,1.05rem)] leading-none font-bold tracking-[-0.01em] text-[#B65438]">
            foakh wind corridor enclave
          </span>
        </a>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2B211D] active:bg-[#2B211D]/8"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Sections"
          className="fixed inset-0 z-[calc(var(--z-header)+1)] flex flex-col overflow-y-auto bg-[#F5EDE3] px-5 lg:hidden"
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* The drawer covers the header, so the header's own toggle is not
              reachable while it is open — the close control has to live in
              here. 44px, ink on cream, never tinted into the background. */}
          <div className="flex items-start justify-between gap-4">
            <Wordmark big />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              autoFocus
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2B211D] text-[#F5EDE3] transition-transform active:scale-95"
            >
              <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <ul className="mt-7 flex flex-col">
            {MOBILE_NAV.map((c) => (
              <li key={c.number}>
                <a
                  href={c.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === c.href ? "location" : undefined}
                  className="flex min-h-[56px] items-center gap-4 border-b border-[#2B211D]/10 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: active === c.href ? ACCENT : c.colour }}
                  />
                  <span className="text-[0.7rem] font-bold tabular-nums" style={{ color: ACCENT }}>
                    {c.number}
                  </span>
                  <span className="flex-1 text-[1.05rem] leading-tight font-bold text-[#2B211D]">
                    {c.title}
                  </span>
                  <span aria-hidden="true" className="text-base font-bold text-[#2B211D]/40">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <RailActions onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

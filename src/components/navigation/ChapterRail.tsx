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

/**
 * Full-screen sections — the hero and the residences deck — own the whole
 * frame, and the cream bar sitting across the top of them reads as chrome
 * laid over a picture. They opt out by marking their wrapper
 * `data-hide-header`; the header slides away while one of them is under it
 * and comes straight back on the next section.
 *
 * Starts hidden because the hero is one of those sections and is what a
 * visitor lands on — this way the bar never flashes in and out on load.
 */
function useHeaderHidden() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const zones = document.querySelectorAll("[data-hide-header]");
    if (!zones.length) {
      setHidden(false);
      return;
    }
    const covering = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) covering.add(e.target);
          else covering.delete(e.target);
        }
        setHidden(covering.size > 0);
      },
      /* Shrink the root to the strip the header actually occupies, so a zone
         only counts while it is behind the bar rather than anywhere on
         screen. A percentage rides out the mobile URL bar resizing the
         viewport, which a pixel margin would not. */
      { rootMargin: "0px 0px -90% 0px" },
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  return hidden;
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

/* ---------------------------------------------------------------------
   Air currents in the header glass
   ------------------------------------------------------------------ */

const CURRENT_BOX = { w: 400, h: 70 };

/** How far past the box each stream runs. A line crossing on a diagonal has
 *  to be longer than the box is wide or its ends swing into view as it
 *  rotates, so every stream is built well outside the frame and cropped. */
const CURRENT_REACH = 520;

/**
 * One wave as a run of cubic segments. Each half wavelength is a single
 * cubic whose two control points sit at 1/3 and 2/3 with the amplitude
 * scaled by 4/3 — at the midpoint a cubic returns three quarters of its
 * control height, so that factor lands the crest exactly on `amp`.
 *
 * Built along a horizontal axis and then rotated into place, so the travel
 * animation is always "along the line" whatever direction the line runs.
 */
function wavePath(period: number, amp: number, y: number) {
  const half = period / 2;
  const c = amp * 1.3333;
  const start = -CURRENT_REACH;
  const spans = Math.ceil((CURRENT_REACH * 2) / period) + 1;
  let d = `M ${start} ${y}`;
  for (let i = 0; i < spans; i++) {
    const x = start + i * period;
    d +=
      ` C ${(x + half / 3).toFixed(1)} ${(y - c).toFixed(1)}` +
      ` ${(x + (half * 2) / 3).toFixed(1)} ${(y - c).toFixed(1)}` +
      ` ${(x + half).toFixed(1)} ${y}` +
      ` C ${(x + half + half / 3).toFixed(1)} ${(y + c).toFixed(1)}` +
      ` ${(x + half + (half * 2) / 3).toFixed(1)} ${(y + c).toFixed(1)}` +
      ` ${(x + period).toFixed(1)} ${y}`;
  }
  return d;
}

/**
 * Six streams, no two alike and no two on the same clock — angle,
 * wavelength, amplitude, speed, direction and bob are all off from one
 * another, and the durations share no common factor, so the set never falls
 * into step and never visibly restarts.
 *
 * `angle` is what stops this reading as ruled lines: the streams cross the
 * glass on their own headings, steep and shallow, up and down, the way air
 * actually moves around a building rather than along a grid.
 *
 * Written out rather than generated — random values at render time would not
 * survive hydration, and hand-chosen ones keep the set balanced.
 */
const CURRENTS = [
  { y: 8, angle: -27, period: 128, amp: 7, dur: 6.2, dir: 1, bob: 4, bobDur: 3.7, width: 1.1, opacity: 0.85 },
  { y: 22, angle: 14, period: 86, amp: 4, dur: 4.3, dir: -1, bob: -3.2, bobDur: 5.1, width: 0.8, opacity: 0.6 },
  { y: 34, angle: -6, period: 172, amp: 9, dur: 8.1, dir: 1, bob: 3.6, bobDur: 4.3, width: 1.3, opacity: 1 },
  { y: 44, angle: 31, period: 104, amp: 5, dur: 5.4, dir: -1, bob: 4.4, bobDur: 6.7, width: 0.9, opacity: 0.7 },
  { y: 58, angle: -18, period: 146, amp: 6.4, dur: 7.3, dir: 1, bob: -3.8, bobDur: 3.1, width: 1, opacity: 0.55 },
  { y: 66, angle: 23, period: 112, amp: 5.6, dur: 4.9, dir: -1, bob: 3, bobDur: 5.9, width: 0.85, opacity: 0.45 },
];

/**
 * The etched surface of the header glass. This used to be a ruled grid —
 * graph paper, which says drafting table. The project is a wind corridor,
 * so the surface carries moving air instead: faint curved streams drifting
 * across at their own speeds.
 */
function HeaderCurrents() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${CURRENT_BOX} 70`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.16 }}
    >
      {CURRENTS.map((c) => (
        /* two transforms, so they need two elements: the group carries the
           slow vertical drift, the path the travel along its own length */
        <g
          key={c.y}
          className="foakh-current-bob"
          style={{ "--bob": `${c.bob}px`, "--bob-dur": `${c.bobDur}s` } as React.CSSProperties}
        >
          <path
            className="foakh-current"
            d={wavePath(c.period, c.amp, c.y, CURRENT_BOX)}
            fill="none"
            stroke="#4A2418"
            strokeWidth={c.width}
            strokeLinecap="round"
            opacity={c.opacity}
            style={
              {
                "--p": `${c.dir * c.period}px`,
                "--dur": `${c.dur}s`,
              } as React.CSSProperties
            }
          />
        </g>
      ))}
    </svg>
  );
}

/** The menu control: a glass squircle carrying two thin rules that fold
 *  into a cross. Two lines, not three — the third bar is a convention, not
 *  a requirement, and two reads quieter against the pavilion. */
function MenuControl({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onToggle}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] transition-transform duration-200 active:scale-95"
      style={{
        background: "rgba(255, 252, 246, 0.55)",
        backdropFilter: "blur(14px) saturate(1.4)",
        WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 12px -8px rgba(60,30,18,0.5)",
      }}
    >
      <span aria-hidden="true" className="relative block h-3 w-[18px]">
        <span
          className="absolute left-0 block h-px w-full rounded-full bg-[#94432F] transition-all duration-300 ease-out"
          style={{ top: open ? "50%" : "2px", transform: open ? "translateY(-50%) rotate(45deg)" : "none" }}
        />
        <span
          className="absolute left-0 block h-px w-full rounded-full bg-[#94432F] transition-all duration-300 ease-out"
          style={{ top: open ? "50%" : "10px", transform: open ? "translateY(-50%) rotate(-45deg)" : "none" }}
        />
      </span>
    </button>
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
  const headerHidden = useHeaderHidden();
  /* the pavilion tightens once the page has moved */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      {/* ---------------- Mobile: the floating glass pavilion ------------
          Not a full-width bar clamped to the edge — a rounded glass object
          inset from both sides with the hero running on behind it, so the
          navigation reads as part of the architecture rather than chrome
          laid over it. Warm ivory glass, a hairline of light along the top
          edge, faint etched elevation lines in the surface, and one slow
          highlight crossing it every thirteen seconds like air moving over
          a facade. */}
      <header
        inert={headerHidden || undefined}
        className={`fixed inset-x-3 z-(--z-header) transition-transform duration-300 ease-out lg:hidden ${
          headerHidden ? "-translate-y-[130%]" : "translate-y-0"
        }`}
        style={{ top: "max(0.6rem, env(safe-area-inset-top))" }}
      >
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-[22px] pr-2.5 pl-3 transition-[height,background-color] duration-300 ease-out"
          style={{
            height: scrolled ? 58 : 70,
            background: "rgba(250, 243, 233, 0.72)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            border: "1px solid rgba(255, 252, 246, 0.6)",
            boxShadow:
              "0 10px 30px -18px rgba(60, 30, 18, 0.4), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          {/* etched air currents — material, not illustration */}
          <HeaderCurrents />
          {/* the wind pass */}
          <span
            aria-hidden="true"
            className="foakh-sweep pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              background:
                "linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)",
            }}
          />

          <a
            href="#hero"
            className="relative flex min-w-0 flex-1 items-center gap-2.5"
            aria-label="Foakh Wind Corridor Enclave — top"
          >
            <Image
              src="/foakh-mark.png"
              alt=""
              width={898}
              height={958}
              priority
              className="w-auto shrink-0 transition-[height] duration-300 ease-out"
              style={{ height: scrolled ? 30 : 36 }}
            />
            <span className="min-w-0">
              <span
                className="font-display block truncate leading-none font-semibold tracking-[0.01em] text-[#94432F] transition-[font-size] duration-300 ease-out"
                style={{ fontSize: scrolled ? "1.02rem" : "1.14rem" }}
              >
                FOAKH
              </span>
              {/* the second line condenses away rather than disappearing */}
              <span
                className="block overflow-hidden text-[0.53rem] font-semibold tracking-[0.24em] whitespace-nowrap text-[#2B211D]/55 uppercase transition-all duration-300 ease-out"
                style={{ maxHeight: scrolled ? 0 : 16, opacity: scrolled ? 0 : 1, marginTop: scrolled ? 0 : 3 }}
              >
                Wind Corridor Enclave
              </span>
            </span>
          </a>

          <MenuControl open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Sections"
          /* the same pavilion, unfolded — not a separate white drawer */
          className="fixed inset-x-3 z-[calc(var(--z-header)+1)] flex origin-top flex-col overflow-y-auto rounded-[22px] px-5 pb-6 lg:hidden motion-safe:animate-[foakh-unfold_360ms_cubic-bezier(0.22,1,0.36,1)]"
          style={{
            top: "max(0.6rem, env(safe-area-inset-top))",
            maxHeight: "calc(100dvh - max(1.2rem, env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
            paddingTop: "0.7rem",
            background: "rgba(250, 243, 233, 0.9)",
            backdropFilter: "blur(26px) saturate(1.5)",
            WebkitBackdropFilter: "blur(26px) saturate(1.5)",
            border: "1px solid rgba(255, 252, 246, 0.6)",
            boxShadow: "0 24px 60px -28px rgba(60,30,18,0.55), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          {/* The drawer covers the header, so the header's own toggle is not
              reachable while it is open — the close control has to live in
              here. 44px, ink on cream, never tinted into the background. */}
          <div className="flex items-center gap-3">
            <Image src="/foakh-mark.png" alt="" width={898} height={958} className="h-9 w-auto shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="font-display block text-[1.14rem] leading-none font-semibold tracking-[0.01em] text-[#94432F]">
                FOAKH
              </span>
              <span className="mt-[3px] block text-[0.53rem] font-semibold tracking-[0.24em] text-[#2B211D]/55 uppercase">
                Wind Corridor Enclave
              </span>
            </span>
            <MenuControl open onToggle={() => setMenuOpen(false)} />
          </div>

          <ul className="mt-7 flex flex-col">
            {MOBILE_NAV.map((c) => (
              <li key={c.number}>
                <a
                  href={c.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === c.href ? "location" : undefined}
                  className="flex min-h-[58px] items-baseline gap-3 border-b border-[#94432F]/12 py-3"
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

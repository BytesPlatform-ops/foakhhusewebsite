"use client";

import { useEffect, useRef, useState } from "react";
import useIsMobile from "@/components/shared/useIsMobile";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

/**
 * 03A — Lifestyle & Amenities: the AMENITY THEATRE.
 *
 * Desktop: a sticky stage (~250svh). All EIGHT amenity names stay
 * visible at all times as two compact vertical rails — 01–04 left,
 * 05–08 right — flanking one large centre image. Exactly ONE amenity
 * is active at a time: its rail row expands accordion-style into a
 * readable ivory card (number, title, description, CURRENT AMENITY
 * label, arrow toward the media) while the centre image, caption and
 * 03/08 progress update in sync from an explicit per-amenity image
 * mapping. Eight equal scroll states drive the sequence; rows, the
 * visible prev/next buttons and arrow keys drive it directly. A quiet
 * autoplay advances only after ~6s without interaction, pausing
 * off-screen, on hidden tabs and under reduced motion.
 *
 * Mobile: heading → slideshow → selector chips → active card. No
 * sticky trap.
 */

const IVORY = "#F5EDE3";

/** The amenity theatre's own ground — the chapter's upper terracotta,
 *  isolated here so this block can be retuned without touching the
 *  section gradient behind the rest of the chapter. */
/* the theatre sits on the residences section's own ground — it only adds
   soft warmth on top, never a second opaque terracotta (that banded) */
const AMENITIES_BG =
  "radial-gradient(85% 60% at 74% 20%, rgb(215 139 112 / 0.2) 0%, transparent 58%)," +
  "radial-gradient(62% 46% at 50% 52%, rgb(201 147 85 / 0.14) 0%, transparent 70%)";

interface Amenity {
  num: string;
  /** the compact label the mobile capsules show when closed */
  short: string;
  /** set instead of src when no asset honestly depicts this amenity */
  missing?: string;
  title: string;
  copy: string;
  /** explicit approved-asset mapping — image always matches the amenity */
  src: string;
  alt: string;
  pos?: string;
}

const AMENITIES: Amenity[] = [
  {
    num: "01",
    title: "Indoor Swimming Pool",
    short: "Pool",
    copy: "A dedicated indoor environment for recreation and relaxation.",
    src: "/foakhindoorswmpool.jpg",
    alt: "The indoor swimming pool at night, loungers along the water and the fitness gallery above",
  },
  {
    num: "02",
    title: "Lobby",
    short: "Lobby",
    copy: "A welcoming arrival experience designed around comfort and everyday interaction.",
    src: "/lounge.jpg",
    alt: "The welcoming arrival lobby in warm stone and timber",
  },
  {
    num: "03",
    title: "Fully Equipped Fitness Centre",
    short: "Fitness",
    copy: "A modern fitness environment supporting wellness and an active lifestyle.",
    src: "/foakhgym.jpg",
    alt: "Residents training in the fully equipped fitness centre",
  },
  {
    num: "04",
    title: "High-Speed Elevators",
    short: "Elevators",
    copy: "Advanced elevator systems designed for fast and convenient access throughout the development.",
    src: "/aislefoakh.jpg",
    alt: "The corridor beside the high-speed elevators",
  },
  {
    num: "05",
    title: "24/7 Security",
    short: "Security",
    copy: "Controlled access and continuous security supporting everyday peace of mind.",
    src: "/foakhsecurity.jpg",
    alt: "The staffed security gate with controlled turnstile access at the entrance",
  },
  {
    num: "06",
    title: "Community Hall",
    short: "Community",
    copy: "A dedicated space for gatherings, celebrations and resident events.",
    src: "/amenity-community-hall.jpg",
    alt: "Residents gathered in the community hall for a presentation",
  },
  {
    num: "07",
    title: "Concierge",
    short: "Concierge",
    copy: "Resident-focused assistance adding another layer of everyday convenience.",
    src: "/recepton.jpg",
    alt: "The concierge desk assisting residents in the lobby",
    pos: "80% 45%",
  },
  {
    num: "08",
    title: "Dedicated Parking",
    short: "Parking",
    copy: "Organised parking with controlled resident entry and exit.",
    src: "/foakhparking.jpg",
    alt: "The covered resident parking level with its controlled entry barrier",
  },
  {
    num: "09",
    title: "Modern Architecture",
    short: "Architecture",
    copy: "A contemporary architectural identity balancing aesthetics, functionality and environmental thinking.",
    src: "/foakhmodernarchitecture.jpg",
    alt: "The landscaped courtyard between the two blocks at sunset",
  },
];

const N = AMENITIES.length;

export default function AmenitiesShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  const [active, setActive] = useState(0);
  const stateRef = useRef(0);
  const holdRef = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inView = useRef(false);
  const controlsFocused = useRef(false);

  /* pause autoplay for ~6s after any scroll/manual interaction */
  const hold = () => {
    holdRef.current = true;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdRef.current = false;
    }, 4500);
  };
  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    []
  );

  /* eight equal scroll states — a small scroll gives a visible response */
  useMotionValueEvent(p, "change", (v) => {
    if (mobile) return;
    const s = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    if (s !== stateRef.current) {
      stateRef.current = s;
      hold();
      setActive(s);
    }
  });

  /* pause autoplay while off-screen. The desktop stage is display:none on a
     phone, so observing only that left mobile autoplay permanently gated. */
  const mobileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const targets = [stageRef.current, mobileRef.current].filter(Boolean) as Element[];
    if (!targets.length) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => seen.set(e.target, e.isIntersecting));
        inView.current = [...seen.values()].some(Boolean);
      },
      { rootMargin: "-10% 0px -10% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  /* quiet autoplay — interaction always wins */
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (!inView.current || document.hidden || controlsFocused.current || holdRef.current) return;
      setActive((s) => (s + 1) % N);
    }, 2600);
    return () => clearInterval(id);
  }, [reduced]);

  const go = (dir: 1 | -1) => {
    hold();
    setActive((s) => (s + dir + N) % N);
  };
  const jump = (i: number) => {
    hold();
    setActive(i);
  };

  const a = AMENITIES[active];

  /* ------------------------------------------------ reduced motion --- */
  if (reduced) {
    return (
      <div className="relative" style={{ background: AMENITIES_BG }}>
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-28 pb-16 lg:pt-32">
        <Heading />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <figure className="relative min-h-[320px] overflow-hidden rounded-[24px] ring-1 ring-[#C99355]/50">
            <AmenityMedia a={AMENITIES[0]} sizes="46vw" />
          </figure>
          <div className="grid gap-4 sm:grid-cols-2">
            {AMENITIES.map((x) => (
              <article key={x.num} className="rounded-[16px] border border-[#C99355]/45 bg-[#FAF6F0] p-5">
                <p className="text-[0.62rem] font-bold tracking-[0.22em] uppercase" style={{ color: "#C99355" }}>
                  {x.num}
                </p>
                <p className="font-display mt-1 text-[1.2rem] leading-snug font-medium" style={{ color: "#94432F" }}>
                  {x.title}
                </p>
                <p className="mt-2 text-[0.88rem] leading-[1.6]" style={{ color: "#625750" }}>
                  {x.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ background: AMENITIES_BG }}>
      {/* ==================== desktop sticky theatre ================== */}
      <div ref={stageRef} className="relative hidden lg:block lg:h-[250svh]">
        <div className="sticky top-0 flex h-svh flex-col px-(--spacing-gutter) pt-14 pb-7">
          <div className="mx-auto flex w-full max-w-(--container-page) flex-wrap items-end justify-between gap-4">
            <Heading compact />
            <p className="pb-1 text-[0.6rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "rgba(250,243,232,0.75)" }}>
              Scroll or select an amenity
            </p>
          </div>

          <div
            className="mx-auto mt-6 grid w-full max-w-(--container-page) flex-1 grid-cols-[minmax(0,0.66fr)_minmax(0,1.3fr)_minmax(0,0.66fr)] items-stretch gap-7"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                go(1);
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                go(-1);
              }
            }}
          >
            {/* left rail: 01–04 */}
            <Rail items={AMENITIES.slice(0, 5)} offset={0} active={active} onSelect={jump} side="left" />

            {/* centre media */}
            <div className="relative self-center overflow-hidden rounded-[24px] shadow-[0_44px_88px_-40px_rgba(26,16,11,0.65)] ring-1 ring-[#C99355]/55" style={{ height: "min(66svh, 720px)" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={a.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.035, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AmenityMedia a={a} sizes="46vw" />
                </motion.div>
              </AnimatePresence>
              {/* preload next */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0">
                <AmenityMedia a={AMENITIES[(active + 1) % N]} sizes="46vw" alt="" />
              </div>

              {/* caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2B211D]/78 via-[#2B211D]/30 to-transparent px-6 pt-16 pb-5">
                <p className="text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#E8CFA4" }}>
                  {a.num} — {a.title}
                </p>
                <p className="mt-1.5 max-w-md text-[0.85rem] leading-snug" style={{ color: "rgba(255,248,239,0.9)" }}>
                  {a.copy}
                </p>
              </div>

              {/* progress: count + eight segments */}
              <div className="pointer-events-none absolute right-5 bottom-5 flex items-center gap-3">
                <span className="text-[0.68rem] font-semibold tracking-[0.18em] tabular-nums" style={{ color: "#FAF6F0" }}>
                  {a.num} / 09
                </span>
                <span className="flex items-center gap-1">
                  {AMENITIES.map((x, i) => (
                    <span
                      key={x.num}
                      className="h-[2px] rounded-full transition-all duration-400"
                      style={{
                        width: i === active ? 18 : 8,
                        background: i === active ? "#C99355" : "rgba(255,248,239,0.45)",
                      }}
                    />
                  ))}
                </span>
              </div>

              {/* visible prev / next */}
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={dir === 1 ? "Next amenity" : "Previous amenity"}
                  onClick={() => go(dir)}
                  onFocus={() => (controlsFocused.current = true)}
                  onBlur={() => (controlsFocused.current = false)}
                  className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#FAF6F0]/55 bg-[#2B211D]/40 text-[#FAF6F0] opacity-80 backdrop-blur-sm transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 ${
                    dir === 1 ? "right-4" : "left-4"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={{ transform: dir === -1 ? "rotate(180deg)" : undefined }}>
                    <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>

            {/* right rail: 05–08 */}
            <Rail items={AMENITIES.slice(5)} offset={5} active={active} onSelect={jump} side="right" />
          </div>
        </div>
      </div>

      {/* ========================== mobile ============================ */}
      <div ref={mobileRef} className="px-5 pt-16 lg:hidden">
        <Heading />

        {/* the amenity itself: the capsules ride the image edges the way the
            rails flank the stage on desktop — 01–04 left, 05–09 right — and
            the name sits over the picture. The description stays below. */}
        <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-[20px] ring-1 ring-[#C99355]/55">
          <AnimatePresence initial={false}>
            <motion.div
              key={a.src || a.num}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            >
              <AmenityMedia a={a} sizes="92vw" />
            </motion.div>
          </AnimatePresence>

          {/* a soft wash at each edge so the capsules keep contrast without
              hiding the subject in the middle of the frame */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgb(20 16 13 / 0.42) 0%, transparent 26%, transparent 74%, rgb(20 16 13 / 0.42) 100%)",
            }}
          />

          <MobileRail items={AMENITIES.slice(0, 4)} offset={0} active={active} onSelect={jump} side="left" />
          <MobileRail items={AMENITIES.slice(4)} offset={4} active={active} onSelect={jump} side="right" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2B211D]/85 via-[#2B211D]/35 to-transparent px-4 pt-16 pb-4">
            <p className="text-[0.55rem] font-semibold tracking-[0.24em] uppercase" style={{ color: "#E8CFA4" }}>
              {a.num} / {String(N).padStart(2, "0")}
            </p>
            <p className="font-display mt-1 text-[1.45rem] leading-tight font-medium" style={{ color: "#FAF6F0" }}>
              {a.title}
            </p>
          </div>
        </div>

        {/* the description, below the image where it can be read */}
        <AnimatePresence mode="wait">
          <motion.div
            key={a.num}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            <p className="text-[0.95rem] leading-[1.6]" style={{ color: "rgba(250,243,232,0.85)" }}>
              {a.copy}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


/** Capsules riding one edge of the mobile stage: compact and numbered when
 *  closed, opening inward to add the name when active so they never run off
 *  the frame. */
function MobileRail({
  items,
  offset,
  active,
  onSelect,
  side,
}: {
  items: Amenity[];
  offset: number;
  active: number;
  onSelect: (i: number) => void;
  side: "left" | "right";
}) {
  return (
    <ul
      role="tablist"
      aria-label={`Amenities ${side}`}
      className={`absolute top-3 bottom-24 z-10 flex flex-col justify-center gap-2 ${
        side === "left" ? "left-2 items-start" : "right-2 items-end"
      }`}
    >
      {items.map((x, k) => {
        const i = offset + k;
        const on = i === active;
        return (
          <li key={x.num}>
            <button
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={x.title}
              onClick={() => onSelect(i)}
              className={`flex items-center overflow-hidden rounded-full transition-all duration-300 ease-out ${
                side === "right" ? "flex-row-reverse" : ""
              } ${on ? "" : "glass-dark"}`}
              style={{
                minHeight: 44,
                minWidth: 44,
                gap: on ? 8 : 0,
                paddingLeft: 13,
                paddingRight: 13,
                ...(on
                  ? {
                      background: "rgba(250,246,240,0.96)",
                      border: "1px solid #C99355",
                    }
                  : {}),
              }}
            >
              <span
                className="text-[0.66rem] font-bold tabular-nums"
                style={{ color: on ? "#C99355" : "rgba(250,246,240,0.9)" }}
              >
                {x.num}
              </span>
              <span
                className="block overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
                style={{ maxWidth: on ? 128 : 0, opacity: on ? 1 : 0 }}
              >
                <span className="text-[0.72rem] font-semibold" style={{ color: "#94432F" }}>
                  {x.short}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------ rail --- */

/**
 * Compact vertical amenity rail: every name always visible, one row
 * expanded at a time (accordion), no overlap, clear affordance.
 */
function Rail({
  items,
  offset,
  active,
  onSelect,
  side,
}: {
  items: Amenity[];
  offset: number;
  active: number;
  onSelect: (i: number) => void;
  side: "left" | "right";
}) {
  return (
    <div className="flex flex-col justify-center gap-2.5">
      {items.map((x, i) => {
        const idx = offset + i;
        const isActive = idx === active;
        return (
          <motion.button
            key={x.num}
            type="button"
            onClick={() => onSelect(idx)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Show ${x.title}`}
            className="relative w-full cursor-pointer overflow-hidden rounded-[14px] border text-left transition-colors"
            animate={{
              backgroundColor: isActive ? "#FAF6F0" : "rgba(255,245,233,0.14)",
              borderColor: isActive ? "#C99355" : "rgba(255,245,233,0.3)",
              boxShadow: isActive
                ? "0 26px 52px -28px rgba(26,16,11,0.55)"
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span
                className="text-[0.64rem] font-bold tracking-[0.18em] tabular-nums"
                style={{ color: isActive ? "#C99355" : "rgba(255,248,239,0.75)" }}
              >
                {x.num}
              </span>
              <span
                className="font-display min-w-0 flex-1 truncate text-[1.02rem] leading-snug font-medium"
                style={{ color: isActive ? "#94432F" : "rgba(255,248,239,0.92)" }}
              >
                {x.title}
              </span>
              {/* arrow toward the centre media */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: isActive ? 1 : 0.35, x: isActive ? 0 : side === "left" ? -4 : 4 }}
                transition={{ duration: 0.35 }}
                style={{ color: isActive ? "#B65438" : "rgba(255,248,239,0.7)" }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" style={{ transform: side === "right" ? "rotate(180deg)" : undefined }}>
                  <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
            </div>

            {/* accordion body — only the active row expands */}
            <motion.div
              initial={false}
              animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <span aria-hidden="true" className="block h-px w-9" style={{ background: "#C99355" }} />
                <p className="mt-2.5 text-[0.86rem] leading-[1.6]" style={{ color: "#625750" }}>
                  {x.copy}
                </p>
                <p className="mt-2.5 text-[0.55rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C99355" }}>
                  Current amenity
                </p>
              </div>
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------- pieces --- */

/** An amenity's picture — or a clearly marked gap when /public has no
 *  asset that honestly shows it, so the slot cannot ship unnoticed. */
function AmenityMedia({ a, sizes, alt }: { a: Amenity; sizes: string; alt?: string }) {
  if (a.missing) {
    return (
      <div
        data-image-required="true"
        className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(148,63,45,0.10) 0 12px, rgba(148,63,45,0.18) 12px 24px)",
        }}
      >
        <span className="text-[0.58rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#FAF6F0" }}>
          HQ Image Required
        </span>
        <span className="text-[0.72rem] leading-tight font-medium" style={{ color: "rgba(250,246,240,0.85)" }}>
          {a.missing}
        </span>
      </div>
    );
  }
  return (
    <Image src={a.src} alt={alt ?? a.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: a.pos }} />
  );
}

function Heading({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#E8CFA4" }}>
        03 — Amenities &amp; Lifestyle
      </p>
      <h3
        className="font-display mt-3 leading-[1.06] text-balance"
        style={{ color: IVORY, fontSize: compact ? "clamp(1.9rem,2.7vw,2.8rem)" : "clamp(2.4rem,3.8vw,3.9rem)", fontWeight: 500 }}
      >
        Everyday comfort, elevated.
      </h3>
      {!compact && (
        <p className="mt-3 max-w-xl text-[1rem] leading-[1.65]" style={{ color: "rgba(250,243,232,0.88)" }}>
          A carefully selected collection of amenities supports convenience, wellness,
        security and family life.
        </p>
      )}
    </div>
  );
}

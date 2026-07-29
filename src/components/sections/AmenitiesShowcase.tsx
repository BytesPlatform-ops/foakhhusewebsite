"use client";

import { useEffect, useRef, useState } from "react";
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

const IVORY = "#F7F0E8";

interface Amenity {
  num: string;
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
    title: "Swimming Pool",
    copy: "A relaxing recreation space designed for residents and families.",
    src: "/buildingfront.jpg",
    alt: "The landscaped water-feature courtyard between the two blocks at dusk",
    pos: "50% 82%",
  },
  {
    num: "02",
    title: "High-Speed Elevators",
    copy: "Efficient vertical movement throughout the development.",
    src: "/lounge.jpg",
    alt: "The grand elevator lobby with its warm stone and bronze elevator doors",
  },
  {
    num: "03",
    title: "Ventilated Elevator Lobbies",
    copy: "Wind-catcher airflow is directed towards common circulation spaces for added comfort.",
    src: "/aislefoakh.jpg",
    alt: "The ventilated corridor beside the elevators, open to daylight and airflow",
    pos: "50% 45%",
  },
  {
    num: "04",
    title: "Dedicated Parking",
    copy: "Secure and organised parking for residents.",
    src: "/foakhshaukat.jpg",
    alt: "The secured development with its organised access road and parking",
    pos: "30% 78%",
  },
  {
    num: "05",
    title: "Family Recreation Areas",
    copy: "Welcoming spaces for relaxation and social interaction.",
    src: "/lobby.jpg",
    alt: "Residents relaxing and socialising in the shared family lounge",
  },
  {
    num: "06",
    title: "24/7 Security",
    copy: "Controlled access and continuous monitoring for peace of mind.",
    src: "/recepton.jpg",
    alt: "The staffed reception desk controlling access to the residences",
    pos: "80% 45%",
  },
  {
    num: "07",
    title: "Modern Architecture",
    copy: "A contemporary design balancing elegance, function and environmental responsibility.",
    src: "/buildingtop.jpg",
    alt: "The contemporary terracotta crown with its rooftop systems",
    pos: "50% 55%",
  },
  {
    num: "08",
    title: "Reliable Water System",
    copy: "A planned treatment solution supporting clean and dependable water availability.",
    src: "/hero-poster.jpg",
    alt: "The building's service systems glowing in the evening elevation",
  },
];

const N = AMENITIES.length;

export default function AmenitiesShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

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
    }, 6000);
  };
  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    []
  );

  /* eight equal scroll states — a small scroll gives a visible response */
  useMotionValueEvent(p, "change", (v) => {
    const s = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    if (s !== stateRef.current) {
      stateRef.current = s;
      hold();
      setActive(s);
    }
  });

  /* pause autoplay while off-screen */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      inView.current = es.some((e) => e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* quiet autoplay — interaction always wins */
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (!inView.current || document.hidden || controlsFocused.current || holdRef.current) return;
      setActive((s) => (s + 1) % N);
    }, 5000);
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
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-28 pb-16 lg:pt-32">
        <Heading />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <figure className="relative min-h-[320px] overflow-hidden rounded-[24px] ring-1 ring-[#D8B36A]/50">
            <Image src={AMENITIES[0].src} alt={AMENITIES[0].alt} fill sizes="46vw" className="object-cover" style={{ objectPosition: AMENITIES[0].pos }} />
          </figure>
          <div className="grid gap-4 sm:grid-cols-2">
            {AMENITIES.map((x) => (
              <article key={x.num} className="rounded-[16px] border border-[#D8B36A]/45 bg-[#FFF5E9] p-5">
                <p className="text-[0.62rem] font-bold tracking-[0.22em] uppercase" style={{ color: "#D8B36A" }}>
                  {x.num}
                </p>
                <p className="font-display mt-1 text-[1.2rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
                  {x.title}
                </p>
                <p className="mt-2 text-[0.88rem] leading-[1.6]" style={{ color: "#66544B" }}>
                  {x.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
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
            <Rail items={AMENITIES.slice(0, 4)} offset={0} active={active} onSelect={jump} side="left" />

            {/* centre media */}
            <div className="relative self-center overflow-hidden rounded-[24px] shadow-[0_44px_88px_-40px_rgba(26,16,11,0.65)] ring-1 ring-[#D8B36A]/55" style={{ height: "min(66svh, 720px)" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={a.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.035, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={a.src} alt={a.alt} fill sizes="46vw" className="object-cover" style={{ objectPosition: a.pos }} />
                </motion.div>
              </AnimatePresence>
              {/* preload next */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0">
                <Image src={AMENITIES[(active + 1) % N].src} alt="" fill sizes="46vw" className="object-cover" />
              </div>

              {/* caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1D1714]/78 via-[#1D1714]/30 to-transparent px-6 pt-16 pb-5">
                <p className="text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#EFD5A3" }}>
                  {a.num} — {a.title}
                </p>
                <p className="mt-1.5 max-w-md text-[0.85rem] leading-snug" style={{ color: "rgba(255,248,239,0.9)" }}>
                  {a.copy}
                </p>
              </div>

              {/* progress: count + eight segments */}
              <div className="pointer-events-none absolute right-5 bottom-5 flex items-center gap-3">
                <span className="text-[0.68rem] font-semibold tracking-[0.18em] tabular-nums" style={{ color: "#FFF8EF" }}>
                  {a.num} / 08
                </span>
                <span className="flex items-center gap-1">
                  {AMENITIES.map((x, i) => (
                    <span
                      key={x.num}
                      className="h-[2px] rounded-full transition-all duration-400"
                      style={{
                        width: i === active ? 18 : 8,
                        background: i === active ? "#D8B36A" : "rgba(255,248,239,0.45)",
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
                  className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFF8EF]/55 bg-[#1D1714]/40 text-[#FFF8EF] opacity-80 backdrop-blur-sm transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 ${
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
            <Rail items={AMENITIES.slice(4)} offset={4} active={active} onSelect={jump} side="right" />
          </div>
        </div>
      </div>

      {/* ========================== mobile ============================ */}
      <div className="px-(--spacing-gutter) pt-24 lg:hidden">
        <Heading />
        <p className="mt-4 text-[0.6rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "rgba(250,243,232,0.7)" }}>
          Select an amenity
        </p>
        <div className="relative mt-4 h-[56svh] overflow-hidden rounded-[20px] ring-1 ring-[#D8B36A]/55">
          <AnimatePresence initial={false}>
            <motion.div key={a.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Image src={a.src} alt={a.alt} fill sizes="92vw" className="object-cover" style={{ objectPosition: a.pos }} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1D1714]/75 to-transparent px-4 pt-12 pb-4">
            <p className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase" style={{ color: "#EFD5A3" }}>
              {a.num} — {a.title}
            </p>
            <p className="mt-1 text-[0.72rem]" style={{ color: "rgba(255,248,239,0.85)" }}>
              {a.num} / 08
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Amenities">
          {AMENITIES.map((x, i) => (
            <button
              key={x.num}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={x.title}
              onClick={() => jump(i)}
              className="shrink-0 rounded-full border px-3.5 py-2 text-[0.62rem] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition-colors"
              style={
                i === active
                  ? { background: "#FFF5E9", color: "#943F2D", borderColor: "#D8B36A" }
                  : { background: "transparent", color: "rgba(255,248,239,0.8)", borderColor: "rgba(255,248,239,0.4)" }
              }
            >
              {x.num}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-[16px] border border-[#D8B36A]/60 bg-[#FFF5E9] p-5 shadow-[0_20px_44px_-26px_rgba(26,16,11,0.5)]">
          <p className="text-[0.62rem] font-semibold tracking-[0.22em] uppercase" style={{ color: "#D8B36A" }}>
            {a.num}
          </p>
          <p className="font-display mt-1 text-[1.4rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
            {a.title}
          </p>
          <p className="mt-2 text-[0.95rem] leading-[1.65]" style={{ color: "#66544B" }}>
            {a.copy}
          </p>
        </div>
      </div>
    </div>
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
              backgroundColor: isActive ? "#FFF5E9" : "rgba(255,245,233,0.14)",
              borderColor: isActive ? "#D8B36A" : "rgba(255,245,233,0.3)",
              boxShadow: isActive
                ? "0 26px 52px -28px rgba(26,16,11,0.55)"
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span
                className="text-[0.64rem] font-bold tracking-[0.18em] tabular-nums"
                style={{ color: isActive ? "#D8B36A" : "rgba(255,248,239,0.75)" }}
              >
                {x.num}
              </span>
              <span
                className="font-display min-w-0 flex-1 truncate text-[1.02rem] leading-snug font-medium"
                style={{ color: isActive ? "#943F2D" : "rgba(255,248,239,0.92)" }}
              >
                {x.title}
              </span>
              {/* arrow toward the centre media */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: isActive ? 1 : 0.35, x: isActive ? 0 : side === "left" ? -4 : 4 }}
                transition={{ duration: 0.35 }}
                style={{ color: isActive ? "#C75B3B" : "rgba(255,248,239,0.7)" }}
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
                <span aria-hidden="true" className="block h-px w-9" style={{ background: "#D8B36A" }} />
                <p className="mt-2.5 text-[0.86rem] leading-[1.6]" style={{ color: "#66544B" }}>
                  {x.copy}
                </p>
                <p className="mt-2.5 text-[0.55rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C78C49" }}>
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

function Heading({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
        03 — Residences &amp; Lifestyle
      </p>
      <h3
        className="font-display mt-3 leading-[1.06] text-balance"
        style={{ color: IVORY, fontSize: compact ? "clamp(1.9rem,2.7vw,2.8rem)" : "clamp(2.4rem,3.8vw,3.9rem)", fontWeight: 500 }}
      >
        Everyday comfort, elevated.
      </h3>
      {!compact && (
        <p className="mt-3 max-w-xl text-[1rem] leading-[1.65]" style={{ color: "rgba(250,243,232,0.88)" }}>
          Thoughtfully selected amenities for convenience, security and refined family living.
        </p>
      )}
    </div>
  );
}

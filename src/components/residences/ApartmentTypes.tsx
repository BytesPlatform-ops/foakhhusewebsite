"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 03 — Apartment Types.
 *
 * The four floor-plan types, read one at a time as the visitor scrolls. It
 * sits ahead of the Classic / Elegant / Sonder categories on purpose: a
 * buyer picks a SHAPE of home first — how many bedrooms, is there a balcony,
 * is there a parking space — and only then a level of finish. Answering the
 * shape question first is what makes the category tabs meaningful.
 *
 * MOTION — one stage is pinned and the types cross through it. The image
 * dissolves and drifts, the area counts up, and the specification rows lift
 * in one after another. Everything is driven by scroll position; nothing
 * plays on a timer. Reduced motion gets all four as a plain static grid.
 *
 * SCROLL BUDGET — derived from the type count, never hardcoded: the pin eats
 * one viewport, so the zone is 100dvh plus a beat per type. At 70dvh a beat
 * a type turns over in well under a screen of thumb travel.
 */

const TYPE_BEAT_DVH = 70;

type ApartmentType = {
  letter: string;
  name: string;
  area: number;
  /** the line that gives the type its character, not a spec repeat */
  blurb: string;
  src: string;
  alt: string;
  specs: { label: string; value: string }[];
};

const TYPES: ApartmentType[] = [
  {
    letter: "A",
    name: "Type A",
    area: 1102,
    blurb:
      "The largest of the four layouts — a three-bedroom home with an attached bathroom to every room and a balcony off the living space.",
    src: "/drawingroomfoakh.jpg",
    alt: "The living space of a Type A three-bedroom residence",
    specs: [
      { label: "Covered area", value: "1,102 sq ft" },
      { label: "Bedrooms", value: "Three" },
      { label: "Bathrooms", value: "Three, all attached" },
      { label: "Balcony", value: "Private balcony" },
      { label: "Parking", value: "One dedicated space" },
    ],
  },
  {
    letter: "B",
    name: "Type B",
    area: 860,
    blurb:
      "A balanced two-bedroom layout that keeps the balcony and the dedicated parking space of the larger plan in a more compact footprint.",
    src: "/residence-open.jpg",
    alt: "The open living area of a Type B two-bedroom residence",
    specs: [
      { label: "Covered area", value: "860 sq ft" },
      { label: "Bedrooms", value: "Two" },
      { label: "Bathrooms", value: "Two" },
      { label: "Balcony", value: "Private balcony" },
      { label: "Parking", value: "One dedicated space" },
    ],
  },
  {
    letter: "C",
    name: "Type C",
    area: 682,
    blurb:
      "Two bedrooms held in an efficient plan — the full room count of Type B, arranged for a smaller, easier-to-run home.",
    src: "/kitchen.jpg",
    alt: "The kitchen and dining area of a Type C two-bedroom residence",
    specs: [
      { label: "Covered area", value: "682 sq ft" },
      { label: "Bedrooms", value: "Two" },
      { label: "Bathrooms", value: "Two" },
      { label: "Balcony", value: "Not part of this layout" },
      { label: "Parking", value: "Available separately, subject to allocation" },
    ],
  },
  {
    letter: "D",
    name: "Type D",
    area: 464,
    blurb:
      "The most compact residence in the collection — a single-bedroom home planned around one person or a couple, and the easiest entry into the address.",
    src: "/residence-composed.jpg",
    alt: "The composed interior of a Type D one-bedroom residence",
    specs: [
      { label: "Covered area", value: "464 sq ft" },
      { label: "Bedrooms", value: "One" },
      { label: "Bathrooms", value: "One" },
      { label: "Balcony", value: "Not part of this layout" },
      { label: "Parking", value: "Not included with this layout" },
    ],
  },
];

const IVORY = "#F5EDE3";
const CHAMPAGNE = "#E8CFA4";
/** where the heading lands — deep enough to clear 3:1 on the terracotta
 *  ground at display size, which is what large text has to hold */
const HEADING_LIT = "#1C110D";

export default function ApartmentTypes() {
  const reduced = useReducedMotion();
  const zoneRef = useRef<HTMLDivElement>(null);
  const n = TYPES.length;

  const { scrollYProgress } = useScroll({
    target: zoneRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.32 });

  /* which type the scroll is currently sitting on, for the capsule state */
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setActive((prev) => (prev === i ? prev : i));
  });

  /* Choosing a type moves the page to the middle of that type's beat. The
     pin consumes one viewport, so the travel available inside the zone is
     its height minus the viewport — not its full height. */
  const goTo = (i: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const top = zone.getBoundingClientRect().top + window.scrollY;
    const pinned = Math.max(zone.offsetHeight - window.innerHeight, 0);
    window.scrollTo({
      top: top + pinned * ((i + 0.5) / n),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  if (reduced) return <StaticTypes />;

  return (
    <section aria-labelledby="apartment-types-heading" className="relative">
      {/* the introduction reads normally, before anything is pinned */}
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-16 lg:pt-24">
        <p
          className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
          style={{ color: CHAMPAGNE }}
        >
          Apartment Types
        </p>
        <LetterHeading text="Four plans. One address." reduced={false} />
        <p
          className="mt-5 max-w-[56ch] text-[0.92rem] leading-[1.7] lg:text-[1rem] lg:leading-[1.75]"
          style={{ color: "rgba(250,243,232,0.85)" }}
        >
          Every residence at Foakh begins as one of four floor plans. Choose the shape of the
          home first — then the level of finish.
        </p>
      </div>

      {/* The stage stacks four inert copies in one cell, so none of them can
          be announced. The full specification lives here instead — one
          readable pass through all four types for assistive technology. */}
      <div className="sr-only">
        {TYPES.map((t) => (
          <div key={t.letter}>
            <h3>{t.name}</h3>
            <p>{t.blurb}</p>
            <dl>
              {t.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div
        ref={zoneRef}
        className="relative mt-10 lg:mt-14"
        style={{ height: `${100 + n * TYPE_BEAT_DVH}dvh` }}
      >
        <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
          <div className="mx-auto w-full max-w-(--container-page) px-(--spacing-gutter)">
            {/* the switcher rides the pinned stage, so it is reachable for
                the whole sequence rather than only on the way in */}
            <TypeCapsules active={active} onSelect={goTo} reduced={false} />

            <div className="mt-5 grid items-center gap-5 lg:mt-9 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
              {/* ---------------- the image ----------------------------
                  Sized against the viewport rather than by aspect ratio
                  below lg: on a 568px-tall phone a 4/3 frame plus the
                  specification is taller than the screen, and the last rows
                  fall off the bottom of a stage that cannot scroll. */}
              <div className="relative h-[23dvh] w-full overflow-hidden rounded-[20px] border border-[#E8CFA4]/25 sm:h-[30dvh] lg:h-auto lg:aspect-[5/4]">
                {TYPES.map((t, i) => (
                  <TypeImage key={t.letter} t={t} i={i} n={n} p={p} />
                ))}
                {/* a quiet floor under the type letter, so it never sits
                    directly on a bright part of the photograph */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                  style={{
                    background: "linear-gradient(to top, rgba(28,15,10,0.66), transparent)",
                  }}
                />
                {TYPES.map((t, i) => (
                  <TypeLetter key={`l-${t.letter}`} t={t} i={i} n={n} p={p} />
                ))}
              </div>

              {/* ---------------- the specification -------------------- */}
              <div className="relative min-h-[20rem] sm:min-h-[19rem] lg:min-h-[24rem]">
                {TYPES.map((t, i) => (
                  <TypePanel key={`p-${t.letter}`} t={t} i={i} n={n} p={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The heading, resolving one character at a time from cream to deep ink as
 * the section is reached.
 *
 * Characters are plain inline spans, NOT inline-block: making each letter a
 * block breaks the font's shaping and spacing, and on a display serif that
 * is immediately visible. Only `color` animates, so there is no layout shift
 * at any point, and it runs once — `viewport.once` — rather than replaying
 * every time the section is scrolled back over.
 */
function LetterHeading({ text, reduced }: { text: string; reduced: boolean }) {
  const chars = [...text];

  if (reduced) {
    return (
      <h2
        id="apartment-types-heading"
        className="font-display mt-5 max-w-[20ch] leading-[1.12]"
        style={{ color: HEADING_LIT, fontSize: "clamp(1.9rem,4.4vw,3rem)", fontWeight: 500 }}
      >
        {text}
      </h2>
    );
  }

  return (
    <motion.h2
      id="apartment-types-heading"
      className="font-display mt-5 max-w-[20ch] leading-[1.12]"
      style={{ fontSize: "clamp(1.9rem,4.4vw,3rem)", fontWeight: 500 }}
      initial="rest"
      whileInView="lit"
      viewport={{ once: true, amount: 0.55 }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          variants={{ rest: { color: IVORY }, lit: { color: HEADING_LIT } }}
          transition={{ duration: 0.5, delay: i * 0.03, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.h2>
  );
}

/**
 * The A/B/C/D control — a segmented capsule set, not a row of labels.
 *
 * These are real buttons: the section is a scroll story, so choosing a type
 * moves the page to that type's place in the sequence rather than swapping
 * state behind the scenes. The selected capsule is a single shared element
 * animated between slots with layoutId, which is what gives the selection
 * its glide instead of one pill blinking off as another blinks on.
 */
function TypeCapsules({
  active,
  onSelect,
  reduced,
}: {
  active: number;
  onSelect: (i: number) => void;
  reduced: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Jump to an apartment type"
      className="inline-flex items-center gap-1 rounded-full p-[3px] sm:p-1"
      style={{
        /* the track: a warm glass rail the capsules sit inside. Deep enough
           that the unselected letters read against it — the section ground
           is already terracotta, so a light track would give nothing to
           separate the control from the page. */
        background: "rgba(28,15,10,0.32)",
        border: "1px solid rgba(232,207,164,0.22)",
        backdropFilter: "blur(14px) saturate(1.5)",
        WebkitBackdropFilter: "blur(14px) saturate(1.5)",
        boxShadow: "inset 0 1px 0 rgba(255,236,222,0.14)",
      }}
    >
      {TYPES.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.letter}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${t.name} — ${t.area.toLocaleString("en-US")} square feet`}
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-[0.82rem] tracking-[0.14em] transition-colors duration-300 sm:px-5"
            style={{
              fontWeight: 600,
              /* the selected capsule inverts to warm cream: a terracotta fill
                 on a terracotta section reads as barely-selected, and the
                 inversion is what makes the choice unmistakable */
              color: isActive ? "#8E3B27" : "rgba(250,243,232,0.85)",
              transitionTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)",
            }}
          >
            {/* the selection itself — one element, moved between slots */}
            {isActive && (
              <motion.span
                aria-hidden="true"
                layoutId={reduced ? undefined : "apartment-type-pill"}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(150deg, #FBF4EA 0%, #F1E4D3 100%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 24px -12px rgba(20,10,6,0.65)",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.7 }}
              />
            )}
            <span className="relative">{t.letter}</span>
          </button>
        );
      })}
    </div>
  );
}

/** the beat window for type i, plus a short shared crossfade at each edge */
function windowFor(i: number, n: number) {
  const seg = 1 / n;
  return { start: i * seg, end: (i + 1) * seg, seg };
}

/** How present type i is, 0 → 1 → 0, as the scroll passes through its beat. */
function usePresence(i: number, n: number, p: MotionValue<number>) {
  const { start, end, seg } = windowFor(i, n);
  const fade = seg * 0.26;
  return useTransform(
    p,
    [start - fade, start + fade * 0.5, end - fade * 0.5, end + fade],
    [0, 1, 1, 0],
    { clamp: true }
  );
}

function TypeImage({
  t,
  i,
  n,
  p,
}: {
  t: ApartmentType;
  i: number;
  n: number;
  p: MotionValue<number>;
}) {
  const presence = usePresence(i, n, p);
  const { start, end } = windowFor(i, n);
  /* a slow drift across the beat — the parallax that stops a crossfade
     between four still photographs from reading as a slideshow */
  const scale = useTransform(p, [start - 0.1, end + 0.1], [1.1, 1.0]);
  const y = useTransform(p, [start - 0.1, end + 0.1], ["-2.5%", "2.5%"]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity: presence }}>
      <motion.div className="absolute inset-0" style={{ scale, y }}>
        <Image
          src={t.src}
          alt={t.alt}
          fill
          sizes="(min-width: 1024px) 52vw, 92vw"
          className="object-cover"
          priority={i === 0}
        />
      </motion.div>
    </motion.div>
  );
}

function TypeLetter({
  t,
  i,
  n,
  p,
}: {
  t: ApartmentType;
  i: number;
  n: number;
  p: MotionValue<number>;
}) {
  const presence = usePresence(i, n, p);
  return (
    <motion.p
      aria-hidden="true"
      className="font-display absolute bottom-3 left-4 leading-none"
      style={{
        opacity: presence,
        color: IVORY,
        fontSize: "clamp(2.4rem,7vw,4rem)",
        fontWeight: 500,
        textShadow: "0 6px 22px rgba(20,10,6,0.5)",
      }}
    >
      {t.letter}
    </motion.p>
  );
}

function TypePanel({
  t,
  i,
  n,
  p,
}: {
  t: ApartmentType;
  i: number;
  n: number;
  p: MotionValue<number>;
}) {
  const presence = usePresence(i, n, p);
  const { start, end } = windowFor(i, n);
  const y = useTransform(presence, [0, 1], [22, 0]);
  const blur = useTransform(presence, [0, 1], [7, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  /* the area counts up as the type arrives and holds once it has landed */
  const count = useTransform(p, [start, start + (end - start) * 0.42], [0, t.area], {
    clamp: true,
  });
  const areaText = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));

  return (
    <motion.div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2"
      style={{ opacity: presence, y, filter }}
      /* only the type in focus is reachable — the others are inert copies
         stacked in the same cell, and must not be announced or tabbed into */
      aria-hidden="true"
    >
      <p
        className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase"
        style={{ color: CHAMPAGNE }}
      >
        {t.name}
      </p>

      <p className="mt-2 flex items-baseline gap-2">
        <motion.span
          className="font-display leading-none"
          style={{ color: IVORY, fontSize: "clamp(2.6rem,6vw,4.2rem)", fontWeight: 500 }}
        >
          {areaText}
        </motion.span>
        <span
          className="text-[0.72rem] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "rgba(250,243,232,0.65)" }}
        >
          sq ft
        </span>
      </p>

      <p
        className="mt-3 line-clamp-3 max-w-[46ch] text-[0.86rem] leading-[1.65] lg:line-clamp-none lg:text-[0.95rem]"
        style={{ color: "rgba(250,243,232,0.82)" }}
      >
        {t.blurb}
      </p>

      <dl className="mt-5 lg:mt-6">
        {t.specs.slice(1).map((s, k) => (
          <SpecRow key={s.label} s={s} k={k} presence={presence} />
        ))}
      </dl>
    </motion.div>
  );
}

/** One specification row, lifting in a beat behind the one above it. */
function SpecRow({
  s,
  k,
  presence,
}: {
  s: { label: string; value: string };
  k: number;
  presence: MotionValue<number>;
}) {
  /* each row waits its turn inside the type's own arrival, which is what
     makes the block read as assembling rather than appearing */
  const startAt = 0.34 + k * 0.15;
  const local = useTransform(presence, [startAt, Math.min(startAt + 0.34, 1)], [0, 1], {
    clamp: true,
  });
  const y = useTransform(local, [0, 1], [12, 0]);

  return (
    <motion.div
      className="flex items-baseline justify-between gap-5 border-b py-2 lg:py-2.5"
      style={{ opacity: local, y, borderColor: "rgba(232,207,164,0.18)" }}
    >
      <dt
        className="shrink-0 text-[0.66rem] font-semibold tracking-[0.16em] uppercase"
        style={{ color: "rgba(232,207,164,0.75)" }}
      >
        {s.label}
      </dt>
      <dd
        className="text-right text-[0.84rem] leading-snug"
        style={{ color: "rgba(250,243,232,0.92)" }}
      >
        {s.value}
      </dd>
    </motion.div>
  );
}

/**
 * Reduced motion — and the accessible reading of the section in every case.
 * Nothing is pinned, nothing counts up, and all four types are present at
 * once as a plain responsive grid.
 */
function StaticTypes() {
  return (
    <section aria-labelledby="apartment-types-heading" className="relative">
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-16 pb-4 lg:pt-24">
        <p
          className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
          style={{ color: CHAMPAGNE }}
        >
          Apartment Types
        </p>
        <LetterHeading text="Four plans. One address." reduced />
        <p
          className="mt-5 max-w-[56ch] text-[0.92rem] leading-[1.7]"
          style={{ color: "rgba(250,243,232,0.85)" }}
        >
          Every residence at Foakh begins as one of four floor plans. Choose the shape of the
          home first — then the level of finish.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {TYPES.map((t) => (
            <article
              key={t.letter}
              className="overflow-hidden rounded-[20px] border"
              style={{ borderColor: "rgba(232,207,164,0.25)", background: "rgba(28,15,10,0.28)" }}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  sizes="(min-width: 640px) 46vw, 92vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p
                  className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase"
                  style={{ color: CHAMPAGNE }}
                >
                  {t.name}
                </p>
                <p
                  className="font-display mt-1.5 leading-none"
                  style={{ color: IVORY, fontSize: "2rem", fontWeight: 500 }}
                >
                  {t.area.toLocaleString("en-US")}{" "}
                  <span className="text-[0.7rem] tracking-[0.2em] uppercase">sq ft</span>
                </p>
                <dl className="mt-4">
                  {t.specs.slice(1).map((s) => (
                    <div
                      key={s.label}
                      className="flex items-baseline justify-between gap-5 border-b py-2"
                      style={{ borderColor: "rgba(232,207,164,0.18)" }}
                    >
                      <dt
                        className="shrink-0 text-[0.64rem] font-semibold tracking-[0.16em] uppercase"
                        style={{ color: "rgba(232,207,164,0.75)" }}
                      >
                        {s.label}
                      </dt>
                      <dd
                        className="text-right text-[0.82rem] leading-snug"
                        style={{ color: "rgba(250,243,232,0.92)" }}
                      >
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

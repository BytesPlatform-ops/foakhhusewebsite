"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionTemplate,
  useInView,
  useMotionValue,
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

const TYPE_BEAT_DVH = 50;

type ApartmentType = {
  letter: string;
  name: string;
  area: number;
  /** the line that gives the type its character, not a spec repeat */
  blurb: string;
  /** the floor plan — the functional proof, and the primary visual here */
  plan: string;
  planAlt: string;
  /** the premium presentation visual shown in "View" mode */
  sheet: string;
  /** where the plan sits inside that sheet: [x, y, w, h] as fractions, so
   *  the card shows the drawing rather than the whole poster */
  crop: [number, number, number, number];
  /** the interior, kept as secondary context: this section is about layout,
   *  and the Classic / Elegant / Sonder categories handle finish properly */
  src: string;
  alt: string;
  specs: { label: string; value: string }[];
};

/**
 * The penthouse rides the SAME selector as the four layouts, first in the
 * row, because that is how a buyer scans the collection. It is still not a
 * fifth letter: it is labelled "Penthouse", never "Type E", and it carries
 * two levels rather than one plan.
 */
type PenthouseLevel = {
  id: string;
  tab: string;
  floor: number;
  title: string;
  sub: string;
  plan: string;
  planAlt: string;
  note: string;
  features: { t: string; d: string }[];
  sheet: string;
  /** the whole-floor drawing, shown in the floor-map viewer */
  plate: string;
  crop: [number, number, number, number];
};

const PENTHOUSE = {
  label: "Penthouse",
  name: "Duplex Penthouse",
  headline: "Two levels. One exceptional residence.",
  blurb:
    "A double-storey residence occupying the 11th and 12th floors, connected by its own internal staircase \u2014 with a private swimming pool and open terrace on the upper level.",
  specs: [
    { label: "Configuration", value: "Double-storey" },
    { label: "Levels", value: "11th + 12th Floor" },
    { label: "Covered area", value: "3,200 sq ft" },
    { label: "Bedrooms", value: "Three" },
  ],
  levels: [
    {
      id: "l11",
      tab: "11th",
      floor: 11,
      title: "11th Floor",
      sub: "Lower Level",
      /* the card shows the duplex's own plan; `plate` is the whole-floor
         drawing, which the floor-map viewer opens */
      plan: "/penthouse-plan-11.png",
      sheet: "/penthouse-plan-11.png",
      plate: "/IMG-20260819-WA0000.jpg",
      crop: [0.31, 0.07, 0.48, 0.79],
      planAlt:
        "Eleventh floor plan of Foakh Wind Corridor Enclave \u2014 the lower level of the duplex penthouses",
      note: "The arrival level. Entrance halls, family lounges and bedrooms sit either side of the central circulation core, with the internal staircase rising to the level above.",
      features: [
        { t: "Entrance Hall", d: "with family lounge" },
        { t: "Bedrooms", d: "with attached baths" },
        { t: "Kitchen", d: "and dining" },
        { t: "Staircase", d: "to upper level" },
      ],
    },
    {
      id: "l12",
      tab: "12th",
      floor: 12,
      title: "12th Floor",
      sub: "Upper Level",
      plan: "/penthouse-plan-12.png",
      sheet: "/penthouse-plan-12.png",
      plate: "/IMG-20260819-WA0001.jpg",
      crop: [0.11, 0.11, 0.42, 0.83],
      planAlt:
        "Twelfth floor plan of Foakh Wind Corridor Enclave \u2014 the upper level, with private swimming pools and open terraces",
      note: "The private level. Each residence opens onto its own swimming pool and open terrace, reached by the staircase from the floor below.",
      features: [
        { t: "Swimming Pool", d: "private to each residence" },
        { t: "Open Terrace", d: "with open views" },
        { t: "Bedrooms", d: "with attached baths" },
        { t: "Stair & Lift Lobby", d: "from the level below" },
      ],
    },
  ] as PenthouseLevel[],
};

const TYPES: ApartmentType[] = [
  {
    letter: "A",
    name: "Type A",
    area: 1102,
    blurb:
      "The largest of the four layouts — a three-bedroom home with an attached bathroom to every room and a balcony off the living space.",
    plan: "/plan-type-a.png",
      sheet: "/plan-view-type-a.png",
    crop: [0.36, 0.04, 0.53, 0.89],
    planAlt: "Type A floor plan — three bedrooms, two balconies, lounge and kitchenette",
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
    plan: "/plan-type-b.png",
      sheet: "/plan-view-type-b.png",
    crop: [0.44, 0.04, 0.41, 0.86],
    planAlt: "Type B floor plan — two bedrooms, balcony, lounge and kitchenette",
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
    plan: "/plan-type-c.png",
      sheet: "/plan-view-type-c.png",
    crop: [0.35, 0.03, 0.45, 0.86],
    planAlt: "Type C floor plan — two bedrooms, lounge and kitchenette",
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
    plan: "/plan-type-d.png",
      sheet: "/plan-view-type-d.png",
    crop: [0.43, 0.04, 0.43, 0.86],
    planAlt: "Type D floor plan — one bedroom, lounge and kitchenette",
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
const INK_DEEP = "#0B0705";
/** the residence experience's own ground */
const INK_BLACK = "#090705";
/** the four standard layouts: burnt sienna into muted clay */
const CLAY_GROUND =
  "radial-gradient(75% 50% at 78% 6%, rgba(224,140,102,0.30) 0%, transparent 60%)," +
  "radial-gradient(60% 45% at 10% 96%, rgba(120,52,36,0.42) 0%, transparent 62%)," +
  "linear-gradient(168deg,#8E3B27 0%,#A0472F 34%,#7E3423 68%,#5E2719 100%)";
/** the duplex keeps the espresso-and-copper room */
const DARK_GROUND =
  "radial-gradient(70% 50% at 78% 4%, rgba(201,144,90,0.16) 0%, transparent 62%)," +
  "radial-gradient(60% 45% at 12% 98%, rgba(201,144,90,0.08) 0%, transparent 60%)," +
  `linear-gradient(168deg,#14100D 0%,${INK_BLACK} 56%,#0A0705 100%)`;
/* The page ground is terracotta again — only the penthouse beat is black —
   so the reveal resolves to deep ink as before. */
const HEADING_LIT = "#201713";
/* the same line, resolved for the penthouse's black ground */
const HEADING_LIT_DARK = "#F7EFE3";
const HEADING_REST_DARK = "rgba(247,239,227,0.16)";
/** where the heading starts — light enough to read as unlit, dark enough to
 *  stay legible on the terracotta ground before the scroll reaches it */
const HEADING_REST = "rgba(255,245,228,0.5)";
const LEAD_REST = "rgba(250,243,232,0.34)";
const LEAD_LIT = "rgba(250,243,232,0.9)";
const LEAD_TEXT =
  "Four standard layouts, and a double-storey penthouse above them. Choose the shape of the home first \u2014 then the level of finish.";

export default function ApartmentTypes() {
  const reduced = useReducedMotion();
  /* The sticky controls sit under the site header, so the offset is measured
     from the header itself rather than guessed — it is a floating bar with a
     top inset, so its occupied height is bottom-of-header, not just height. */
  const stickyTop = useHeaderOffset();
  /* The bottom bar belongs to the penthouse card, not the whole chapter:
     tied to the section it hung around long after the plan had scrolled by.
     `amount: 0.5` retires it once the card is mostly behind you. */
  const sectionRef = useRef<HTMLElement>(null);
  /* "some" kept the bar alive until the section's last pixel left, so it
     rode along into the statement screen. This retires it once the section's
     bottom is within the lower part of the viewport — i.e. while the reader
     is still on the residences, but gone before the next section arrives. */
  const [sectionInView, setSectionInView] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      /* How much of the section is actually on screen. Comparing edges to
         fixed fractions of the viewport failed here: unpinned, the mobile
         section is barely taller than one screen, so an edge rule retired the
         bar almost as soon as it appeared. */
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const share = visible / Math.min(r.height || vh, vh);
      setSectionInView(share > 0.35);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const zoneRef = useRef<HTMLDivElement>(null);
  /* Beats, not entries: the penthouse spends two (11th, then 12th) while
     each layout spends one. BEAT_ENTRY maps a beat back to the selector
     item it belongs to, so the capsule reads "Penthouse" across both of
     its beats instead of flickering between them. */
  const BEAT_ENTRY = [0, 1, 2, 3, 4];
  const n = BEAT_ENTRY.length;
  const ENTRY_FIRST_BEAT = [0, 1, 2, 3, 4];

  const { scrollYProgress } = useScroll({
    target: zoneRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.32 });

  /* Below lg the head scrolls, so it lights against its own crossing. */
  const headRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: headRaw } = useScroll({
    target: headRef,
    offset: ["start 0.92", "start 0.28"],
  });
  const headP = useSpring(headRaw, { stiffness: 120, damping: 26, mass: 0.3 });

  /* From lg the head is pinned and never travels, so it lights against the
     zone's progress instead — the only value that still moves. It completes
     inside the first type's beat, well before the switcher is used. */
  const deskHeadP = useTransform(p, [0.01, 0.16], [0, 1], { clamp: true });

  /* beat 0 is the penthouse: the black room is fully up across it and gone
     by the time Type A lands */
  const phVeil = useTransform(p, [0, 1 / 5 - 0.06, 1 / 5 + 0.05], [1, 1, 0], { clamp: true });
  /* The section is black end to end now, so every heading resolves light.
     (1 = "the ground is dark".) */
  const onBlack = useMotionValue(1);

  /* which type the scroll is currently sitting on, for the capsule state */
  const [active, setActive] = useState(0);
  /* plan first: this section answers "what is the layout", not "how is it
     finished" — the categories below own finish */
  /* The penthouse holds one beat and its two levels advance on their own —
     the visitor sees both without having to hunt for a control. Manual
     selection restarts the cycle rather than fighting it. */
  const [phFloor, setPhFloor] = useState(0);
  const [phPaused, setPhPaused] = useState(false);
  /* full-screen viewer: the boards carry room labels and dimensions that a
     phone cannot render legibly at stage size */
  const [zoom, setZoom] = useState(false);

  /* View = the finished presentation visual; Draw = the architectural
     drawing it is built on. Two ways of looking at the same residence. */
  const [view, setView] = useState<"view" | "draw">("view");
  /* which selector item the scroll is sitting on */
  useMotionValueEvent(p, "change", (v) => {
    /* A spring overshoots, so raw Math.floor flickers between two beats at
       every boundary — which is what made the tabs flip rapidly. Only move
       once the progress is clearly inside the next beat. */
    const raw = v * n;
    const b = Math.min(n - 1, Math.max(0, Math.floor(raw)));
    const frac = raw - b;
    setActive((prev) => {
      const next = BEAT_ENTRY[b];
      if (prev === next) return prev;
      const prevBeat = ENTRY_FIRST_BEAT[prev];
      if (b > prevBeat && frac < 0.18) return prev; // not yet committed forward
      if (b < prevBeat && frac > 0.82) return prev; // nor backward
      return next;
    });
  });

  /* Cycle the two penthouse levels while the penthouse is the active entry.
     Paused for reduced motion and for a short while after a manual pick. */
  /* "some", not a fraction: the zone is 350dvh tall, so a viewport can never
     show 35% of it and the gate would stay shut forever. Any part visible is
     the right test — the cycle is already scoped to the penthouse beat. */
  const zoneInView = useInView(zoneRef, { amount: "some" });
  useEffect(() => {
    /* 4.2s read as a flicker once the plan needs studying, and the timer used
       to run off-screen so arriving mid-cycle looked like a glitch. Seven
       seconds, and only while the section is actually being looked at. */
    if (reduced || active !== 0 || phPaused || !zoneInView) return;
    const t = setInterval(() => setPhFloor((f) => (f + 1) % PENTHOUSE.levels.length), 7000);
    return () => clearInterval(t);
  }, [reduced, active, phPaused, zoneInView]);

  /* a manual choice holds for a beat, then the cycle resumes */
  useEffect(() => {
    if (!phPaused) return;
    const t = setTimeout(() => setPhPaused(false), 14000);
    return () => clearTimeout(t);
  }, [phPaused]);

  const pickFloor = (i: number) => {
    setPhFloor(i);
    setPhPaused(true);
  };

  /* Choosing a type moves the page to the middle of that type's beat. The
     pin consumes one viewport, so the travel available inside the zone is
     its height minus the viewport — not its full height. */
  const goToBeat = (b: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const top = zone.getBoundingClientRect().top + window.scrollY;
    const pinned = Math.max(zone.offsetHeight - window.innerHeight, 0);
    window.scrollTo({
      top: top + pinned * ((b + 0.5) / n),
      behavior: reduced ? "auto" : "smooth",
    });
  };
  /* the capsule selects an ENTRY; it lands on that entry's first beat */
  const goTo = (e: number) => goToBeat(ENTRY_FIRST_BEAT[e]);

  if (reduced) return <StaticTypes />;

  return (
    <section
      ref={sectionRef}
      aria-label="Residences"
      className="relative"
      /* The parent chapter is terracotta. Without its own ground the
         residence experience let that orange show around the cards and,
         on mobile, behind the whole selector. It paints its own. */
      /* The ground follows the residence: the four standard layouts sit on
         the Foakh terracotta, and only the duplex takes the dark room. It
         crossfades rather than cutting, so switching tabs reads as one
         surface changing tone. */
      style={{ background: CLAY_GROUND }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: active === 0 ? 1 : 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ background: DARK_GROUND }}
      />


      <FloorBottomBar
        show={active === 0 && sectionInView && !zoom}
        floor={phFloor}
        onPick={pickFloor}
        reduced={!!reduced}
      />

      {/* BELOW LG the head scrolls normally ahead of the pinned stage — a
          phone cannot hold head, switcher, image and specification in one
          viewport. It lights against its own crossing of the screen. */}
      <div
        ref={headRef}
        className="relative z-10 mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-5 lg:hidden"
      >
        <p
          className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
          style={{ color: CHAMPAGNE }}
        >
          The Residences
        </p>
        <LetterHeading
          text="A penthouse. Four plans."
          progress={headP}
          dark={onBlack}
          className="mt-4"
        />
        <LeadCopy progress={headP} className="mt-4 max-w-[52ch] text-[0.92rem] leading-[1.7]" />
      </div>

      {/* The stage stacks four inert copies in one cell, so none of them can
          be announced. The full specification lives here instead — one
          readable pass through all four types for assistive technology. */}
      <div className="sr-only">
        <div>
          <h3>{PENTHOUSE.name}</h3>
          <p>{PENTHOUSE.blurb}</p>
          <dl>
            {PENTHOUSE.specs.map((sp) => (
              <div key={sp.label}>
                <dt>{sp.label}</dt>
                <dd>{sp.value}</dd>
              </div>
            ))}
          </dl>
          {PENTHOUSE.levels.map((l) => (
            <div key={l.id}>
              <h4>{`${l.title} — ${l.sub}`}</h4>
              <p>{l.note}</p>
            </div>
          ))}
        </div>
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

      <AnimatePresence>
        {zoom && (
          <ZoomViewer
            src={
              active === 0
                ? PENTHOUSE.levels[phFloor].plate
                : view === "view"
                  ? TYPES[active - 1].sheet
                  : TYPES[active - 1].plan
            }
            alt={
              active === 0
                ? PENTHOUSE.levels[phFloor].planAlt
                : TYPES[active - 1].planAlt
            }
            title={
              active === 0
                ? `${PENTHOUSE.name} — ${PENTHOUSE.levels[phFloor].title}`
                : `${TYPES[active - 1].name} — ${TYPES[active - 1].area.toLocaleString("en-US")} sq ft`
            }
            active={active}
            onActive={setActive}
            phFloor={phFloor}
            onFloor={pickFloor}
            reduced={!!reduced}
            onClose={() => setZoom(false)}
          />
        )}
      </AnimatePresence>

      {/* below lg the pinned stage is replaced by a flowing composition */}
      <div className="relative z-10 mt-2 lg:hidden">
        <MobileResidences
          stickyTop={stickyTop}
          active={active}
          setActive={setActive}
          phFloor={phFloor}
          view={view}
          setView={setView}
          onFull={() => setZoom(true)}
          reduced={!!reduced}
        />
      </div>

      <div
        ref={zoneRef}
        className="relative z-10 mt-6 hidden lg:mt-8 lg:block"
        style={{ height: `${100 + n * TYPE_BEAT_DVH}dvh` }}
      >
        <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
          {/* The penthouse takes the whole room, edge to edge, the way the
              presentation sheets do. It lifts again for the four layouts,
              which keep the terracotta page. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ opacity: phVeil }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 50% at 78% 6%, rgba(201,147,85,0.13) 0%, transparent 62%)," +
                  "radial-gradient(60% 45% at 12% 96%, rgba(201,147,85,0.08) 0%, transparent 60%)," +
                  `linear-gradient(168deg,#14100D 0%,${INK_DEEP} 55%,#0A0705 100%)`,
              }}
            />
          </motion.div>
          <div className="relative mx-auto w-full max-w-(--container-page) px-(--spacing-gutter) pt-14 lg:pt-0">
            {/* FROM LG the head rides the pinned stage, so eyebrow, heading,
                intro, switcher and the active type are one composition held
                in a single frame instead of the head floating a screen above
                the experience it introduces. */}
            <div className="hidden lg:block">
              <p
                className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
                style={{ color: CHAMPAGNE }}
              >
                The Residences
              </p>
              <LetterHeading
                text="A penthouse. Four plans."
                progress={deskHeadP}
                dark={onBlack}
                className="mt-2.5"
              />
              <LeadCopy
                progress={deskHeadP}
                className="mt-2.5 mb-0 max-w-[46ch] text-[0.92rem] leading-[1.6]"
              />
            </div>

            {/* The reference posters were aesthetic direction only. What ships
                is the ORIGINAL architectural drawing inside a frame, with every
                heading, description, highlight and the floor-position stack
                rendered as real markup beside it — so the type stays
                responsive and the geometry stays untouched. */}
            <div className="relative mt-5 lg:mt-4">
              {/* Top stays quiet: only the master capsule. The floor switch
                  and the view controls sit down with the board, where the
                  decision is actually made. */}
              <TypeCapsules active={active} onSelect={goTo} reduced={false} />

              <div
                className="mt-3 rounded-[22px] border p-2.5 sm:p-4 lg:mt-4 lg:p-5"
                style={{
                  background:
                    active === 0
                      ? "radial-gradient(80% 60% at 78% 4%, rgba(201,144,90,0.10) 0%, transparent 60%)," +
                        "linear-gradient(165deg,#191108 0%,#0D0806 62%,#0A0705 100%)"
                      : "radial-gradient(80% 60% at 80% 4%, rgba(255,255,255,0.5) 0%, transparent 60%)," +
                        "linear-gradient(165deg,#FDF8F1 0%,#F5E9D8 100%)",
                  borderColor:
                    active === 0 ? "rgba(201,144,90,0.30)" : "rgba(148,63,45,0.22)",
                  boxShadow:
                    active === 0
                      ? "inset 0 1px 0 rgba(201,144,90,0.14), 0 44px 96px -54px rgba(0,0,0,0.95)"
                      : "inset 0 1px 0 rgba(255,255,255,0.7), 0 36px 78px -46px rgba(20,10,6,0.5)",
                }}
              >
                <div className="hidden min-[400px]:block">
                  <BoardHeader
                    dark={active === 0}
                    category={active === 0 ? "Double Storey Residence" : "Apartment Type"}
                  />
                </div>

                <div className="min-[400px]:mt-3.5 lg:grid lg:grid-cols-[1.45fr_1fr] lg:items-start lg:gap-x-8">
                <div>
                {/* ---------- the hero ---------------------------------- */}
                <button
                  type="button"
                  onClick={() => setZoom(true)}
                  aria-label="Enlarge this floor plan"
                  className="group relative block h-[19dvh] w-full cursor-zoom-in overflow-hidden rounded-[14px] border p-1.5 min-[400px]:h-[24dvh] sm:h-[30dvh] sm:p-2 lg:h-[40dvh]"
                  style={{
                    maxHeight: "500px",
                    background: active === 0 ? "rgba(0,0,0,0.34)" : "rgba(255,255,255,0.62)",
                    borderColor:
                      active === 0 ? "rgba(201,144,90,0.26)" : "rgba(148,63,45,0.18)",
                    boxShadow:
                      active === 0
                        ? "inset 0 0 30px rgba(0,0,0,0.55)"
                        : "inset 0 0 24px rgba(148,63,45,0.06)",
                  }}
                >
                  <PenthousePlans floor={phFloor} n={n} p={p} view={view} />
                  {TYPES.map((t, i) => (
                    <TypeImage key={t.letter} t={t} i={i + 1} n={n} p={p} view={view} />
                  ))}
                </button>

                {/* ---------- controls, directly under the visual ---------- */}
                {/* fixed height so the row never reflows when the tab changes */}
                <div className="mt-3 flex min-h-[2.75rem] items-center">
                  <ViewCapsule
                    view={view}
                    onView={setView}
                    onFull={() => setZoom(true)}
                    showFull={active === 0}
                    dark={active === 0}
                    reduced={!!reduced}
                  />
                </div>

                </div>

                {/* ---------- the reading ------------------------------- */}
                <div className="mt-3.5 lg:mt-0">
                  <div className="lg:hidden">
                    <BoardRule dark={active === 0} />
                  </div>
                  <div className="mt-3.5 lg:mt-0">
                    {active === 0 ? (
                      <PenthouseInfo
                        floor={phFloor}
                        floorControl={
                          <FloorCapsule
                            floor={phFloor}
                            onPick={pickFloor}
                            reduced={!!reduced}
                          />
                        }
                      />
                    ) : (
                      <TypeInfo t={TYPES[active - 1]} />
                    )}
                  </div>
                </div>
                </div>

                <BoardFooter dark={active === 0} />
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
function HeadChar({
  ch,
  i,
  n,
  p,
  dark,
}: {
  ch: string;
  i: number;
  n: number;
  p: MotionValue<number>;
  dark: MotionValue<number>;
}) {
  /* Each character owns a slice of the scroll. The slices overlap, so the
     darkening travels as a soft front across the line rather than snapping
     letter by letter. The last character finishes at p = 1. */
  const span = 0.42;
  const from = (i / n) * (1 - span);
  /* Two inputs: how far this character has resolved, and how black the
     ground is. On the penthouse beat the line resolves to ivory; on the
     terracotta page it resolves to ink, exactly as before. */
  const color = useTransform([p, dark] as const, ([pv, dv]: number[]) => {
    const t = Math.min(1, Math.max(0, (pv - from) / span));
    const lit = mixHex(HEADING_LIT, HEADING_LIT_DARK, dv);
    const rest = dv > 0.5 ? HEADING_REST_DARK : HEADING_REST;
    return t <= 0 ? rest : t >= 1 ? lit : mixCss(rest, lit, t);
  });
  return (
    <motion.span aria-hidden="true" style={{ color }}>
      {ch}
    </motion.span>
  );
}

/* small colour helpers so the heading can cross two grounds ------------- */
function hexToRgb(h: string) {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function mixHex(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
}
function parseCss(c: string): number[] {
  if (c.startsWith("#")) return [...hexToRgb(c), 1];
  const n = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1];
  return [n[0], n[1], n[2], n[3] ?? 1];
}
function mixCss(a: string, b: string, t: number) {
  const A = parseCss(a);
  const B = parseCss(b);
  const m = (i: number) => A[i] + (B[i] - A[i]) * t;
  return `rgba(${Math.round(m(0))}, ${Math.round(m(1))}, ${Math.round(m(2))}, ${m(3).toFixed(3)})`;
}

/**
 * The heading, darkening character by character AGAINST SCROLL POSITION.
 *
 * `progress` is supplied by the caller because on desktop this heading sits
 * on a pinned stage: the element never travels, so its own scroll offset
 * would read a constant and the line would never light. The caller passes
 * whichever progress actually moves — the zone's, when pinned; the heading's
 * own crossing of the viewport, when it scrolls normally.
 */
function LetterHeading({
  text,
  progress,
  dark,
  className = "",
}: {
  text: string;
  progress: MotionValue<number>;
  dark: MotionValue<number>;
  className?: string;
}) {
  const chars = [...text];

  return (
    <h2
      aria-label={text}
      className={`font-display max-w-[20ch] leading-[1.12] ${className}`}
      style={{ fontSize: "clamp(1.9rem,3.6vw,2.6rem)", fontWeight: 500 }}
    >
      {chars.map((ch, i) => (
        <HeadChar key={`${ch}-${i}`} ch={ch} i={i} n={chars.length} p={progress} dark={dark} />
      ))}
    </h2>
  );
}

/** The lead paragraph, resolving on the same scroll but far more quietly —
 *  a word-level darkening with a blur that clears, so the heading stays the
 *  stronger of the two effects. */
function LeadCopy({
  progress,
  className = "",
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const words = LEAD_TEXT.split(" ");
  return (
    <p aria-label={LEAD_TEXT} className={className}>
      {words.map((w, i) => (
        <LeadWord key={`${w}-${i}`} w={w} i={i} n={words.length} p={progress} />
      ))}
    </p>
  );
}

function LeadWord({
  w,
  i,
  n,
  p,
}: {
  w: string;
  i: number;
  n: number;
  p: MotionValue<number>;
}) {
  const span = 0.55;
  const from = (i / n) * (1 - span);
  const t = useTransform(p, [from, from + span], [0, 1], { clamp: true });
  const color = useTransform(t, [0, 1], [LEAD_REST, LEAD_LIT]);
  const blur = useTransform(t, [0, 1], [3.5, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span aria-hidden="true" style={{ color, filter }}>
      {w}
      {i < n - 1 ? " " : ""}
    </motion.span>
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
  scope = "d",
}: {
  active: number;
  onSelect: (i: number) => void;
  reduced: boolean;
  scope?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Jump to a residence"
      className="inline-flex items-center gap-1 rounded-full p-[3px] sm:p-1"
      style={{
        /* The duplex scrolls a dense drawing under this control, so there it
           has to be a solid rail — at low opacity the plan showed through and
           read as a rendering fault. The four layouts sit on the calm
           terracotta ground, where liquid glass belongs. */
        background:
          active === 0
            ? "linear-gradient(180deg,#241811 0%,#160E09 100%)"
            : "rgba(28,15,10,0.30)",
        border: `1px solid rgba(232,207,164,${active === 0 ? 0.28 : 0.24})`,
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        boxShadow:
          active === 0
            ? "inset 0 1px 0 rgba(255,236,222,0.16), 0 12px 30px -14px rgba(0,0,0,0.85)"
            : "inset 0 1px 0 rgba(255,236,222,0.18), 0 10px 26px -16px rgba(20,10,6,0.5)",
        transition: "background 400ms ease, box-shadow 400ms ease",
      }}
    >
      {/* One control for the whole collection, the penthouse first. It is
          still not a fifth letter: it is labelled "Penthouse", and the four
          layouts keep their letters. */}
      {[
        { key: "ph", label: PENTHOUSE.label, aria: `${PENTHOUSE.name} — 3,200 square feet` },
        ...TYPES.map((t) => ({
          key: t.letter,
          label: t.letter,
          aria: `${t.name} — ${t.area.toLocaleString("en-US")} square feet`,
        })),
      ].map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={isActive ? "true" : undefined}
            aria-label={t.aria}
            className={`relative inline-flex min-h-11 items-center justify-center rounded-full tracking-[0.12em] transition-colors duration-300 ${
              i === 0
                ? "px-3.5 text-[0.62rem] uppercase sm:px-4 sm:text-[0.68rem]"
                : "min-w-11 px-3.5 text-[0.82rem] sm:px-5"
            }`}
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
                layoutId={reduced ? undefined : `apartment-type-pill-${scope}`}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(150deg, #FBF4EA 0%, #F1E4D3 100%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 24px -12px rgba(20,10,6,0.65)",
                }}
                /* a segmented-control glide: firm, horizontal, no bounce */
                transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.6 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** the beat window for type i, plus a short shared crossfade at each edge */

/** Height the fixed site header occupies, plus a small breathing gap. */
function useHeaderOffset() {
  const [top, setTop] = useState(96);
  useEffect(() => {
    const measure = () => {
      const el = document.querySelector("header");
      if (!el) return;
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed") return;
      /* read its resting inset, not its current transform: the header hides
         on scroll-down, and a transformed rect would collapse the offset */
      const inset = parseFloat(cs.top || "0") || 0;
      const h = el.offsetHeight;
      setTop(Math.round(inset + h + 14));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return top;
}

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
  view,
}: {
  t: ApartmentType;
  i: number;
  n: number;
  p: MotionValue<number>;
  view: "view" | "draw";
}) {
  const presence = usePresence(i, n, p);
  /* Never scaled or drifted: both the drawing and the presentation visual
     carry small type, and a parallax on either makes the labels swim. */

  return (
    <motion.div className="absolute inset-0" style={{ opacity: presence }}>
      <motion.div className="absolute inset-2 sm:inset-3">
        <Image
          src={view === "view" ? t.sheet : t.plan}
          alt={t.planAlt}
          fill
          sizes="(min-width: 1024px) 46vw, 92vw"
          /* contain, always, for the plan: cover would crop the drawing's
             own boundary and its printed area label off the frame */
          className="object-contain"
          priority={i === 0}
        />
      </motion.div>
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
        <h2
          className="font-display mt-4 max-w-[20ch] leading-[1.12]"
          style={{ color: HEADING_LIT, fontSize: "clamp(1.9rem,4.4vw,3rem)", fontWeight: 500 }}
        >
          Four plans. One address.
        </h2>
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

/**
 * The penthouse plans. One scroll beat holds them both; the two levels
 * cross-fade on their own timer, so a visitor sees the whole duplex without
 * having to find a control. Contained, never cropped.
 */
function PenthousePlans({
  floor,
  n,
  p,
  view,
}: {
  floor: number;
  n: number;
  p: MotionValue<number>;
  view: "view" | "draw";
}) {
  const presence = usePresence(0, n, p);
  return (
    <motion.div className="absolute inset-0 p-2 sm:p-3" style={{ opacity: presence }}>
      {PENTHOUSE.levels.map((l, i) => (
        <motion.div
          key={l.id}
          className="absolute inset-2 sm:inset-3"
          animate={{
            opacity: i === floor ? 1 : 0,
            scale: i === floor ? 1 : 0.985,
            filter: i === floor ? "blur(0px)" : "blur(4px)",
          }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <FittedPlan
            sheet={l.sheet}
            plan={l.plan}
            alt={l.planAlt}
            view={view}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/** 11TH / 12TH — deliberately quieter than the master capsule above it. */
function FloorCapsule({
  floor,
  onPick,
  reduced,
  scope = "d",
}: {
  floor: number;
  onPick: (i: number) => void;
  reduced: boolean;
  scope?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Choose a penthouse level"
      className="inline-flex items-center gap-1 rounded-full p-[3px]"
      style={{
        background: "rgba(201,147,85,0.10)",
        border: "1px solid rgba(201,147,85,0.30)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {PENTHOUSE.levels.map((lv, i) => {
        const on = i === floor;
        return (
          <button
            key={lv.id}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={on}
            /* 36px: subordinate to the 44px master capsule, still a
               comfortable target for a secondary control */
            className="relative min-h-9 rounded-full px-3 text-[0.55rem] font-semibold tracking-[0.12em] uppercase sm:px-3.5 sm:text-[0.58rem]"
            style={{ color: on ? "#2B1A10" : "rgba(245,237,227,0.62)" }}
          >
            {on && (
              <motion.span
                aria-hidden="true"
                layoutId={reduced ? undefined : `penthouse-floor-pill-${scope}`}
                className="absolute inset-0 rounded-full"
                style={{ background: `linear-gradient(150deg,#F2E3CC 0%,${CHAMPAGNE} 100%)` }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
              />
            )}
            <span className="relative">{lv.tab} Floor</span>
          </button>
        );
      })}
    </div>
  );
}

/* ===================================================================
   Everything below is native UI. The supplied reference posters were
   aesthetic direction only — the dark charcoal ground, copper accents,
   serif display and fine rules are recreated here in CSS so the type
   stays responsive, selectable and translatable, while the ONLY image
   on screen is the original architectural drawing.
   =================================================================== */

const COPPER = "#C9905A";

/** Penthouse copy — native text in the reference's register. */
function PenthouseInfo({
  floor,
  floorControl,
}: {
  floor: number;
  floorControl: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col">
      <div className="relative min-h-[9.5rem] min-[400px]:min-h-[10rem] sm:min-h-[9.5rem] lg:min-h-[10.5rem]">
        {PENTHOUSE.levels.map((lv, i) => (
          <motion.div
            key={lv.id}
            className="absolute inset-x-0 top-0"
            animate={{ opacity: i === floor ? 1 : 0, y: i === floor ? 0 : 12 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ pointerEvents: i === floor ? "auto" : "none" }}
          >
            <p
              className="text-[0.5rem] font-semibold tracking-[0.3em] uppercase sm:text-[0.55rem]"
              style={{ color: COPPER }}
            >
              Duplex Penthouse
            </p>
            {/* the oversized copper floor number the sheet leads with */}
            <p
              className="font-display mt-1.5 leading-[0.92]"
              style={{
                color: COPPER,
                fontSize: "clamp(2rem,4.2vw,3.4rem)",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {lv.title.toUpperCase()}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <p
                className="text-[0.5rem] font-semibold tracking-[0.28em] whitespace-nowrap uppercase sm:text-[0.55rem]"
                style={{ color: "rgba(245,237,227,0.72)" }}
              >
                {lv.sub}
              </p>
              <span
                aria-hidden="true"
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg,rgba(201,144,90,0.5),transparent)" }}
              />
            </div>
            <p
              className="mt-2.5 line-clamp-3 max-w-[40ch] text-[0.74rem] leading-[1.6] sm:text-[0.78rem] lg:line-clamp-none lg:text-[0.83rem]"
              style={{ color: "rgba(245,237,227,0.62)" }}
            >
              {lv.note}
            </p>
          </motion.div>
        ))}
      </div>

      {/* the floor switch sits under the reading, not above it */}
      <div className="mt-3.5">{floorControl}</div>

      <div className="relative mt-3.5 min-h-[5.5rem] sm:min-h-[5rem]">
        {PENTHOUSE.levels.map((lv, i) => (
          <motion.div
            key={`f-${lv.id}`}
            className="absolute inset-x-0 top-0 grid grid-cols-2 gap-1.5"
            animate={{ opacity: i === floor ? 1 : 0 }}
            transition={{ duration: 0.45 }}
            style={{ pointerEvents: i === floor ? "auto" : "none" }}
          >
            {lv.features.map((f) => (
              <FeatureCell key={f.t} t={f.t} d={f.d} dark />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Type copy — the same native treatment in the cream/terracotta register. */
function TypeInfo({ t }: { t: ApartmentType }) {
  return (
    <div className="flex h-full flex-col">
      <p
        className="text-[0.5rem] font-semibold tracking-[0.3em] uppercase sm:text-[0.55rem]"
        style={{ color: "#94432F" }}
      >
        {t.name}
      </p>
      <p
        className="font-display mt-1.5 leading-[0.92]"
        style={{ color: "#94432F", fontSize: "clamp(2rem,4.2vw,3.2rem)", fontWeight: 500 }}
      >
        {t.area.toLocaleString("en-US")}
        <span
          className="ml-2 align-middle text-[0.55rem] font-semibold tracking-[0.24em] uppercase"
          style={{ color: "rgba(59,31,20,0.62)" }}
        >
          sq ft
        </span>
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg,rgba(148,63,45,0.34),transparent)" }}
        />
      </div>
      <p
        className="mt-2.5 line-clamp-3 max-w-[42ch] text-[0.74rem] leading-[1.6] sm:text-[0.78rem] lg:line-clamp-none lg:text-[0.83rem]"
        style={{ color: "rgba(59,31,20,0.72)" }}
      >
        {t.blurb}
      </p>
      <dl className="mt-3 flex-1">
        {t.specs.slice(1).map((sp, si) => (
          <div
            key={sp.label}
            className={`flex items-baseline justify-between border-t py-1 sm:py-2 ${
              si === 3 ? "hidden min-[360px]:flex" : ""
            }`}
            style={{ borderColor: "rgba(148,63,45,0.16)" }}
          >
            <dt
              className="text-[0.52rem] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "rgba(59,31,20,0.55)" }}
            >
              {sp.label}
            </dt>
            <dd className="text-[0.78rem]" style={{ color: "#3B1F14" }}>
              {sp.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The presentation board.
 *
 * Rebuilt from the reference sheet's design language rather than lifted
 * from its pixels: board header with the wordmark and category, copper
 * hairlines, an oversized serif floor number, small tracked labels,
 * bordered feature cells, and a footer strip of qualities. The only
 * bitmap inside it is the original architectural drawing.
 * ------------------------------------------------------------------ */

const QUALITIES = [
  "Private & Prestigious",
  "Double Height Potential",
  "Panoramic Views",
  "Exceptional Craftsmanship",
];

function BoardRule({ dark }: { dark: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="block h-px w-full"
      style={{
        background: dark
          ? "linear-gradient(90deg,rgba(201,144,90,0.42),rgba(201,144,90,0.06))"
          : "linear-gradient(90deg,rgba(148,63,45,0.34),rgba(148,63,45,0.05))",
      }}
    />
  );
}

/** The board's own masthead — wordmark left, category right. */
function BoardHeader({ dark, category }: { dark: boolean; category: string }) {
  const ink = dark ? "rgba(245,237,227,0.9)" : "#5A2A1C";
  const soft = dark ? "rgba(201,144,90,0.85)" : "#94432F";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p
          className="text-[0.46rem] font-semibold tracking-[0.28em] uppercase sm:text-[0.52rem]"
          style={{ color: ink }}
        >
          Foakh Collection
        </p>
        <p
          className="text-[0.46rem] font-semibold tracking-[0.28em] uppercase sm:text-[0.52rem]"
          style={{ color: soft }}
        >
          {category}
        </p>
      </div>
      <div className="mt-2.5">
        <BoardRule dark={dark} />
      </div>
    </div>
  );
}

/** Footer strip of qualities, as on the reference sheet. */
function BoardFooter({ dark }: { dark: boolean }) {
  return (
    <div className="mt-3 hidden min-[1100px]:block">
      <BoardRule dark={dark} />
      <div className="mt-2.5 flex items-center justify-between gap-3">
        {QUALITIES.map((q) => (
          <p
            key={q}
            className="text-[0.44rem] font-semibold tracking-[0.24em] uppercase"
            style={{ color: dark ? "rgba(201,144,90,0.6)" : "rgba(148,63,45,0.55)" }}
          >
            {q}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A bordered feature cell — the reference's iconed list, in markup. */
function FeatureCell({ t, d, dark }: { t: string; d: string; dark: boolean }) {
  return (
    <div
      className="rounded-[7px] border px-2.5 py-1.5"
      style={{
        borderColor: dark ? "rgba(201,144,90,0.24)" : "rgba(148,63,45,0.2)",
        background: dark ? "rgba(201,144,90,0.045)" : "rgba(148,63,45,0.035)",
      }}
    >
      <p
        className="text-[0.63rem] leading-tight font-semibold tracking-[0.04em]"
        style={{ color: dark ? IVORY : "#3B1F14" }}
      >
        {t}
      </p>
      <p
        className="mt-0.5 text-[0.56rem] leading-tight"
        style={{ color: dark ? "rgba(245,237,227,0.5)" : "rgba(59,31,20,0.6)" }}
      >
        {d}
      </p>
    </div>
  );
}

/** View · Draw · View Full — the same capsule language, one line. */
function ViewCapsule({
  view,
  onView,
  onFull,
  dark,
  reduced,
  scope = "d",
  showFull = true,
}: {
  view: "view" | "draw";
  onView: (v: "view" | "draw") => void;
  onFull: () => void;
  dark: boolean;
  reduced: boolean;
  scope?: string;
  /** the full-map control belongs to the duplex only */
  showFull?: boolean;
}) {
  const items: { k: "view" | "draw"; label: string }[] = [
    { k: "view", label: "View" },
    { k: "draw", label: "Draw" },
  ];
  const idle = dark ? "rgba(245,237,227,0.66)" : "rgba(59,31,20,0.62)";
  return (
    /* one line, never wrapping: the three controls read as a single row */
    <div className="flex flex-nowrap items-center gap-2">
      <div
        role="group"
        aria-label="Choose how to view this residence"
        className="inline-flex items-center gap-1 rounded-full p-[3px]"
        style={{
          background: dark ? "rgba(201,144,90,0.10)" : "rgba(148,63,45,0.07)",
          border: `1px solid ${dark ? "rgba(201,144,90,0.28)" : "rgba(148,63,45,0.18)"}`,
        }}
      >
        {items.map((o) => {
          const on = view === o.k;
          return (
            <button
              key={o.k}
              type="button"
              onClick={() => onView(o.k)}
              aria-pressed={on}
              className="relative min-h-10 rounded-full px-3.5 text-[0.6rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: on ? (dark ? "#2B1A10" : "#FBF5EC") : idle }}
            >
              {on && (
                <motion.span
                  aria-hidden="true"
                  layoutId={reduced ? undefined : `residence-view-pill-${scope}`}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: dark
                      ? `linear-gradient(150deg,#F2E3CC 0%,${CHAMPAGNE} 100%)`
                      : "linear-gradient(150deg,#A44A31 0%,#8E3B27 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 340, damping: 34 }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
      {showFull && (
        <button
          type="button"
          onClick={onFull}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.55rem] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors sm:px-4 sm:text-[0.6rem] sm:tracking-[0.14em]"
          style={{
            color: "#2B1A10",
            border: "1px solid rgba(201,144,90,0.5)",
            background: "linear-gradient(150deg,#F2E3CC 0%,#C9905A 100%)",
            boxShadow: "0 8px 20px -12px rgba(201,144,90,0.8)",
          }}
        >
          View Floor Map
          <span aria-hidden="true" style={{ fontSize: "0.7rem", lineHeight: 1 }}>
            ⤢
          </span>
        </button>
      )}
    </div>
  );
}

/** Fullscreen inspection: wheel / pinch to zoom, drag to pan. */
function ZoomViewer({
  src,
  alt,
  title,
  active,
  onActive,
  phFloor,
  onFloor,
  reduced,
  onClose,
}: {
  src: string;
  alt: string;
  title: string;
  active: number;
  onActive: (i: number) => void;
  phFloor: number;
  onFloor: (i: number) => void;
  reduced: boolean;
  onClose: () => void;
}) {
  const [z, setZ] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ d: number; z: number } | null>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /* A new plan starts unzoomed and centred, or the previous pan carries over
     and opens the next one somewhere off its own edge. Reset where the change
     originates — an effect watching `src` would be setState-in-effect. */
  const reset = () => {
    setZ(1);
    setOff({ x: 0, y: 0 });
  };
  const pickType = (i: number) => {
    reset();
    onActive(i);
  };
  const pickFloorReset = (i: number) => {
    reset();
    onFloor(i);
  };

  const clamp = (v: number) => Math.min(5, Math.max(1, v));
  const dist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[120] flex touch-none items-center justify-center overflow-hidden"
      style={{ background: "rgba(6,4,3,0.96)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onWheel={(e) => {
        setZ((v) => clamp(v - e.deltaY * 0.0016));
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
      }}
      onPointerMove={(e) => {
        if (!drag.current || z === 1) return;
        setOff({
          x: drag.current.ox + (e.clientX - drag.current.x),
          y: drag.current.oy + (e.clientY - drag.current.y),
        });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 2) pinch.current = { d: dist(e.touches), z };
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2 && pinch.current) {
          setZ(clamp((pinch.current.z * dist(e.touches)) / pinch.current.d));
        }
      }}
      onTouchEnd={() => {
        pinch.current = null;
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        draggable={false}
        className="max-h-full max-w-full object-contain select-none"
        style={{ x: off.x, y: off.y, scale: z, cursor: z > 1 ? "grab" : "zoom-in" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onDoubleClick={() => {
          setZ((v) => (v > 1 ? 1 : 2.2));
          setOff({ x: 0, y: 0 });
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* the same selectors as the section, so the viewer is not a dead end:
          a visitor can move between residences, and between the duplex's two
          levels, without closing it */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-3 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.7rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <TypeCapsules active={active} onSelect={pickType} reduced={reduced} scope="v" />
        <div
          className="overflow-hidden transition-[height,opacity] duration-300 ease-out"
          style={{ height: active === 0 ? 42 : 0, opacity: active === 0 ? 1 : 0 }}
        >
          <FloorCapsule floor={phFloor} onPick={pickFloorReset} reduced={reduced} scope="v" />
        </div>
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ background: "rgba(20,13,9,0.86)", border: "1px solid rgba(201,144,90,0.34)" }}
        >
          {[
            { l: "−", a: () => setZ((v) => clamp(v - 0.4)) },
            { l: "Reset", a: reset },
            { l: "+", a: () => setZ((v) => clamp(v + 0.4)) },
          ].map((b) => (
            <button
              key={b.l}
              type="button"
              onClick={b.a}
              className="min-h-10 rounded-full px-3.5 text-[0.66rem] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "rgba(245,237,227,0.86)" }}
            >
              {b.l}
            </button>
          ))}
        </div>
      </div>

      {/* what you are looking at */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6">
        <p
          className="text-[0.48rem] font-semibold tracking-[0.3em] uppercase"
          style={{ color: COPPER }}
        >
          Floor map
        </p>
        <p
          className="font-display mt-1 text-[0.95rem] sm:text-[1.1rem]"
          style={{ color: IVORY, fontWeight: 500 }}
        >
          {title}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-[1.05rem] sm:top-6 sm:right-6"
        style={{ background: "rgba(245,237,227,0.95)", color: "#1A100B" }}
      >
        ✕
      </button>
    </motion.div>
  );
}

/**
 * The plan, fitted.
 *
 * "View" uses a file pre-cropped to the plan region, so the card holds a
 * framed drawing rather than a shrunken poster — and object-contain can do
 * the fitting without CSS crop maths fighting the frame's aspect. "Draw"
 * shows the original architectural file.
 */
function FittedPlan({
  sheet,
  plan,
  alt,
  view,
}: {
  sheet: string;
  plan: string;
  alt: string;
  view: "view" | "draw";
}) {
  /* Same drawing either way: "View" fits the whole sheet, "Draw" reads it
     closer so the room labels and dimensions are legible without opening
     the viewer. The frame clips, so the zoom stays inside its mount. */
  const closer = view === "draw";
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={closer ? plan : sheet}
        alt={alt}
        fill
        sizes="(min-width:1024px) 46vw, 92vw"
        className="object-contain transition-transform duration-500 ease-out"
        style={{ transform: closer ? "scale(1.55)" : "scale(1)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Mobile.
 *
 * Deliberately NOT the pinned stage. A phone viewport cannot hold the
 * switcher, a plan worth studying, the copy, the floor switch and the
 * highlights at once — every attempt ended in either a clipped column or
 * a postage-stamp plan. Unpinned, the plan gets its full portrait height,
 * the spacing can breathe, and nothing is cropped.
 * ------------------------------------------------------------------ */

function MobileResidences({
  stickyTop,
  active,
  setActive,
  phFloor,
  view,
  setView,
  onFull,
  reduced,
}: {
  stickyTop: number;
  active: number;
  setActive: (i: number) => void;
  phFloor: number;
  view: "view" | "draw";
  setView: (v: "view" | "draw") => void;
  onFull: () => void;
  reduced: boolean;
}) {
  const dark = active === 0;
  const lv = PENTHOUSE.levels[phFloor];
  const t = active > 0 ? TYPES[active - 1] : null;
  const last = TYPES.length; // penthouse + four layouts
  /* which way the last change went, so the card can answer the gesture:
     content leaves toward the swipe and the next one arrives behind it */
  const [dir, setDir] = useState(0);
  const go = (next: number) => {
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
  };
  const swipe = useSwipe(
    () => go(Math.max(0, active - 1)),
    () => go(Math.min(last, active + 1))
  );

  return (
    <div className="mx-auto w-full max-w-(--container-page) px-(--spacing-gutter) pb-4">
      {/* a. both switchers travel with the reader: the master capsule, and
             beneath it the penthouse level — persistent sub-navigation for as
             long as the penthouse is the active residence. The stack retires
             just before the card's tail so it never parks on the content. */}
      <div
        /* No painted backdrop: the gradient band behind this read as a
           broken header shadow on mobile. The capsule's own glass track is
           enough to keep it legible over whatever scrolls beneath.
           It no longer fades at the tail — that made it unclickable through
           the lower half of the section. */
        className="sticky z-30 pt-1 pb-2"
        style={{ top: stickyTop }}
      >
        <TypeCapsules active={active} onSelect={go} reduced={reduced} scope="m" />
      </div>

      {/* No keyed remount and no vertical entry: switching tabs used to drop
          the whole card in from above, which read as a dropdown rather than a
          segmented control. The sliding pill carries the change now; the card
          only cross-fades its contents. */}
      <motion.div
        {...swipe}
        key={active}
        initial={reduced ? false : { opacity: 0, x: dir * 26 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 rounded-[20px] border p-3.5"
        style={{
          background: dark
            ? "radial-gradient(90% 55% at 76% 2%, rgba(201,144,90,0.22) 0%, transparent 62%)," +
              "radial-gradient(70% 40% at 12% 100%, rgba(201,144,90,0.10) 0%, transparent 60%)," +
              "linear-gradient(162deg,#2A1D12 0%,#1B1309 46%,#140E08 100%)"
            : "linear-gradient(165deg,#FDF8F1 0%,#F5E9D8 100%)",
          borderColor: dark ? "rgba(201,144,90,0.30)" : "rgba(148,63,45,0.22)",
          boxShadow: dark
            ? "0 34px 78px -48px rgba(0,0,0,0.95)"
            : "0 28px 62px -40px rgba(20,10,6,0.45)",
        }}
      >
        {/* b. the plan, at its own portrait height so it is worth reading */}
        <button
          type="button"
          onClick={onFull}
          aria-label="Enlarge this floor plan"
          className="relative block w-full overflow-hidden rounded-[14px] border"
          style={{
            /* the duplex plates are landscape (1224x864) while the type plans
               are portrait (896x1200) — one fixed ratio left a dead band under
               whichever orientation did not match */
            aspectRatio: dark ? "1224 / 864" : "896 / 1200",
            /* a lighter mount than the card, so the drawing reads as a board
               on a surface rather than black-on-black */
            background: dark
              ? "linear-gradient(160deg,#3A2817 0%,#241A0F 100%)"
              : "rgba(255,255,255,0.6)",
            borderColor: dark ? "rgba(201,144,90,0.42)" : "rgba(148,63,45,0.16)",
            boxShadow: dark ? "inset 0 0 0 1px rgba(201,144,90,0.12)" : undefined,
          }}
        >
          <div className="absolute inset-2">
            <FittedPlan
              sheet={dark ? lv.sheet : t!.sheet}
              plan={dark ? lv.plan : t!.plan}
              alt={dark ? lv.planAlt : t!.planAlt}
              view={view}
            />
          </div>
        </button>

        {/* c. the action row */}
        <div className="mt-4 pb-0.5">
          <ViewCapsule
            view={view}
            onView={setView}
            onFull={onFull}
            dark={dark}
            reduced={reduced}
            scope="m"
            showFull={dark}
          />
        </div>

        <div className="mt-5">
          <BoardRule dark={dark} />
        </div>

        {/* d. the reading */}
        <div className="mt-5">
          {dark ? (
            <>
              <p
                className="text-[0.55rem] font-semibold tracking-[0.3em] uppercase"
                style={{ color: COPPER }}
              >
                Duplex Penthouse
              </p>
              <p
                className="font-display mt-1.5 leading-[0.95]"
                style={{ color: COPPER, fontSize: "clamp(2rem,9vw,2.6rem)", fontWeight: 500 }}
              >
                {lv.title.toUpperCase()}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p
                  className="text-[0.55rem] font-semibold tracking-[0.28em] whitespace-nowrap uppercase"
                  style={{ color: "rgba(245,237,227,0.72)" }}
                >
                  {lv.sub}
                </p>
                <span
                  aria-hidden="true"
                  className="h-px flex-1"
                  style={{ background: "linear-gradient(90deg,rgba(201,144,90,0.5),transparent)" }}
                />
              </div>
              <p
                className="mt-3 text-[0.82rem] leading-[1.65]"
                style={{ color: "rgba(245,237,227,0.66)" }}
              >
                {lv.note}
              </p>
            </>
          ) : (
            <>
              <p
                className="text-[0.55rem] font-semibold tracking-[0.3em] uppercase"
                style={{ color: "#94432F" }}
              >
                {t!.name}
              </p>
              <p
                className="font-display mt-1.5 leading-[0.95]"
                style={{ color: "#94432F", fontSize: "clamp(2rem,9vw,2.6rem)", fontWeight: 500 }}
              >
                {t!.area.toLocaleString("en-US")}
                <span
                  className="ml-2 align-middle text-[0.55rem] font-semibold tracking-[0.24em] uppercase"
                  style={{ color: "rgba(59,31,20,0.6)" }}
                >
                  sq ft
                </span>
              </p>
              <p
                className="mt-3 text-[0.82rem] leading-[1.65]"
                style={{ color: "rgba(59,31,20,0.72)" }}
              >
                {t!.blurb}
              </p>
            </>
          )}
        </div>

        {/* f. highlights, then supporting detail */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {dark
            ? lv.features.map((f) => <FeatureCell key={f.t} t={f.t} d={f.d} dark />)
            : t!.specs.slice(1).map((sp) => (
                <FeatureCell key={sp.label} t={sp.value} d={sp.label} dark={false} />
              ))}
        </div>
      </motion.div>
    </div>
  );
}


/**
 * The penthouse level switch, as a bottom bar on mobile.
 *
 * It exists only while the duplex is the active residence AND the residence
 * section is on screen, so it can never linger over the rest of the page. It
 * sits in its own fixed layer with nothing painted behind it but the control
 * itself, which is what keeps it from reading as a stray band.
 */
function FloorBottomBar({
  show,
  floor,
  onPick,
  reduced,
}: {
  show: boolean;
  floor: number;
  onPick: (i: number) => void;
  reduced: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: 14 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center lg:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
        >
          <div className="pointer-events-auto">
            <FloorCapsule floor={floor} onPick={onPick} reduced={reduced} scope="m" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Horizontal swipe between residences.
 *
 * Only acts on a clearly horizontal gesture, so it never steals a vertical
 * scroll — which on a tall page is the gesture that matters most. Returns
 * handlers to spread onto the element that should accept the swipe.
 */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s0 = start.current;
      start.current = null;
      if (!s0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s0.x;
      const dy = t.clientY - s0.y;
      /* a real sideways flick: far enough, and more across than down */
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}

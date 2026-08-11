"use client";

import { useRef } from "react";
import Image from "next/image";
import AmenitiesShowcase from "./AmenitiesShowcase";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 03 — Residences & Lifestyle: two connected subsections.
 *
 * 03A — LIFESTYLE & AMENITIES: "Everyday comfort, elevated." One
 * dominant lifestyle image beside eight editorial amenity panels
 * (premium cards, not icon chips), soft scroll reveals.
 *
 * 03B — APARTMENTS & INTERIORS: the statement stage with the rising
 * card deck — kept, extended from four to SIX residence qualities
 * (Spacious / Functional / Elegant / Comfort Focused / Private
 * Balconies / Limited Community). The film card rises first, then each
 * quality card covers the last with a changing boundary while its
 * reading pair (heading left, copy right) swaps in. The split backdrop
 * headline "HOMES MADE / FOR REAL LIFE" recedes once the beats begin.
 *
 * Native scroll pin, spring-driven progress (ScrollTimeline stale-range
 * guard), transform/opacity only. Reduced motion renders settled
 * frames; mobile stacks everything readably.
 */

const IVORY = "#F7F0E8";
const INK = "#1D1714";

/* ------------------------------------------- 03B — the quality deck -- */

interface Quality {
  num: string;
  title: string;
  copy: string;
}

interface DeckSpec {
  kind: "film" | "image";
  src: string;
  alt: string;
  rise: [number, number];
  cover: [number, number] | null;
  fromY: string;
  width: string;
  aspect: string;
  radius: string;
  rotate: number;
  z: number;
  quality: Quality | null;
  accent: string;
  objectPosition?: string;
}

const DECK: DeckSpec[] = [
  {
    kind: "image",
    src: "/lobby.jpg",
    alt: "Residents at ease together in the warm family lounge of the residences",
    rise: [0.02, 0.12],
    cover: [0.15, 0.23],
    fromY: "62svh",
    width: "clamp(280px,20vw,350px)",
    aspect: "3 / 4.2",
    radius: "12px",
    rotate: 0,
    z: 20,
    quality: null,
    accent: "198 164 107",
    objectPosition: "38% 50%",
  },
  {
    kind: "image",
    src: "/drawingroomfoakh.jpg",
    alt: "The generous living and dining space filled with evening light",
    rise: [0.15, 0.23],
    cover: [0.27, 0.35],
    fromY: "118svh",
    width: "clamp(340px,26vw,460px)",
    aspect: "4 / 3",
    radius: "22px",
    rotate: -2,
    z: 21,
    quality: {
      num: "01",
      title: "Spacious",
      copy: "Generously planned living, dining and bedroom spaces.",
    },
    accent: "213 155 84",
  },
  {
    kind: "image",
    src: "/kitchen.jpg",
    alt: "The functional family kitchen in warm terracotta and stone",
    rise: [0.27, 0.35],
    cover: [0.39, 0.47],
    fromY: "118svh",
    width: "clamp(320px,24vw,420px)",
    aspect: "4 / 5",
    radius: "10px",
    rotate: 1.8,
    z: 22,
    quality: {
      num: "02",
      title: "Functional",
      copy: "Practical layouts created around everyday family routines.",
    },
    accent: "135 147 131",
  },
  {
    kind: "image",
    src: "/bed.jpg",
    alt: "A refined bedroom with contemporary finishes and soft evening light",
    rise: [0.39, 0.47],
    cover: [0.51, 0.59],
    fromY: "118svh",
    width: "clamp(360px,28vw,500px)",
    aspect: "16 / 11",
    radius: "26px",
    rotate: -1.4,
    z: 23,
    quality: {
      num: "03",
      title: "Elegant",
      copy: "Thoughtful finishes and contemporary interior detailing.",
    },
    accent: "213 155 84",
    objectPosition: "50% 40%",
  },
  {
    kind: "image",
    src: "/family.jpg",
    alt: "Daylight filling the open family living space",
    rise: [0.51, 0.59],
    cover: [0.63, 0.71],
    fromY: "118svh",
    width: "clamp(300px,22vw,390px)",
    aspect: "3 / 4",
    radius: "16px",
    rotate: 2.2,
    z: 24,
    quality: {
      num: "04",
      title: "Comfort Focused",
      copy: "Planning designed around light, usability and comfortable everyday living.",
    },
    accent: "111 155 152",
    objectPosition: "50% 50%",
  },
  {
    kind: "image",
    src: "/balconyfoakh.jpg",
    alt: "A private balcony with seating above the green landscape",
    rise: [0.63, 0.71],
    cover: [0.75, 0.83],
    fromY: "118svh",
    width: "clamp(340px,26vw,460px)",
    aspect: "4 / 3",
    radius: "8px",
    rotate: -1.8,
    z: 25,
    quality: {
      num: "05",
      title: "Private Balconies",
      copy: "Personal outdoor space for fresh air, relaxation and views.",
    },
    accent: "213 155 84",
    objectPosition: "50% 55%",
  },
  {
    kind: "image",
    src: "/buildingfront.jpg",
    alt: "The refined terracotta materials of the two blocks at dusk",
    rise: [0.75, 0.83],
    cover: null,
    fromY: "118svh",
    width: "clamp(320px,24vw,430px)",
    aspect: "1 / 1",
    radius: "24px",
    rotate: 1.4,
    z: 26,
    quality: {
      num: "06",
      title: "Refined Materials",
      copy: "Carefully selected finishes contribute to a lasting residential environment.",
    },
    accent: "198 164 107",
  },
];

export default function ResidencesStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: deckRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  /* the two headline halves cross in from the edges, then recede to a
     faint backdrop once the quality beats begin */
  const leftX = useTransform(p, [0, 0.12, 1], ["-16vw", "0vw", "-1.8vw"]);
  const rightX = useTransform(p, [0, 0.12, 1], ["16vw", "0vw", "1.8vw"]);
  const textY = useTransform(p, [0, 0.12, 0.18, 0.95], ["15svh", "0svh", "0svh", "7svh"]);
  const textOpacity = useTransform(p, [0, 0.08, 0.16, 0.26], [0.4, 1, 1, 0.11]);

  /* the featured corner card arrives as the deck completes */
  const cardOpacity = useTransform(p, [0.85, 0.95], [0, 1]);
  const cardY = useTransform(p, [0.85, 0.95], [28, 0]);

  return (
    <section
      id="residences"
      ref={sectionRef}
      data-section="residences"
      aria-labelledby="residences-heading"
      className="grain blend-top relative"
      style={
        {
          "--blend-from": "#F6EBDD",
          background:
            "radial-gradient(85% 60% at 74% 20%, rgb(255 138 97 / 0.62) 0%, transparent 58%)," +
            "radial-gradient(62% 46% at 50% 52%, rgb(230 190 108 / 0.4) 0%, transparent 70%)," +
            "radial-gradient(55% 45% at 82% 55%, rgb(255 244 229 / 0.18) 0%, transparent 72%)," +
            "radial-gradient(70% 50% at 14% 84%, rgb(101 155 152 / 0.2) 0%, transparent 60%)," +
            "linear-gradient(172deg, #C6431E 0%, #E85F34 34%, #CC4826 62%, #6E2911 100%)",
        } as React.CSSProperties
      }
    >
      {/* ==================== 03A — RESIDENCE CATEGORIES =============== */}
      <ResidenceCategories reduced={!!reduced} />

      {/* ---- Apartments & Interiors — intro copy before the deck ----- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-16 lg:pb-20">
        {/* seam: the duplex finale above is a pinned dark stage that cuts
            instantly to this section once its scroll track ends — a radial
            wash anchored at the seam dissolves that cut outward into the
            gradient below instead of leaving a hard edge or a solid bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[34vh] lg:h-[40vh]"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, #1A0F0A 0%, rgba(26,15,10,0.55) 38%, transparent 72%)",
          }}
        />
        <p className="relative text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#FFC178" }}>
          Apartments &amp; Interiors
        </p>
        <p
          className="font-display relative mt-4 max-w-[26ch] leading-[1.15]"
          style={{ color: IVORY, fontSize: "clamp(1.9rem,2.6vw,2.8rem)", fontWeight: 500 }}
        >
          Homes made for real life.
        </p>
        <p className="relative mt-4 max-w-[62ch] text-[1rem] leading-[1.75]" style={{ color: "rgba(250,243,232,0.88)" }}>
          Every residence is shaped around comfort, practicality and visual refinement.
        </p>
      </div>

      {/* ==================== 03B — the quality deck =================== */}
      <div ref={deckRef} className="relative hidden lg:block lg:h-[600svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* per-beat ambient glow — the stage light shifts with each card */}
          {!reduced &&
            DECK.map((spec) => <AccentGlow key={`glow-${spec.src}`} spec={spec} p={p} />)}

          {/* the split headline — BEHIND the deck */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 z-10"
            style={reduced ? undefined : { y: textY, opacity: textOpacity }}
          >
            <motion.p
              className="font-display absolute left-[3.5%] whitespace-nowrap uppercase"
              style={{
                color: "#EFD5A3",
                fontSize: "clamp(3.4rem,6.2vw,7.2rem)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontWeight: 600,
                y: "-50%",
                ...(reduced ? {} : { x: leftX }),
              }}
            >
              Homes made
            </motion.p>
            <motion.p
              className="font-display absolute right-[3.5%] whitespace-nowrap uppercase"
              style={{
                color: "rgba(224,193,148,0.72)",
                fontSize: "clamp(3.4rem,6.2vw,7.2rem)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontWeight: 600,
                y: "-50%",
                ...(reduced ? {} : { x: rightX }),
              }}
            >
              for real life.
            </motion.p>
          </motion.div>

          {/* accessible heading + qualities for the animated display text */}
          <h2 id="residences-heading" className="sr-only">
            Homes made for real life.
          </h2>
          <ul className="sr-only">
            {DECK.filter((d) => d.quality).map((d) => (
              <li key={d.quality!.num}>
                {d.quality!.title} — {d.quality!.copy}
              </li>
            ))}
          </ul>

          {/* the rising deck — each card travels up and covers the last */}
          {(reduced ? DECK.slice(0, 1) : DECK).map((spec) => (
            <DeckCard key={spec.src} spec={spec} p={p} reduced={!!reduced} />
          ))}

          {/* per-card reading pair: heading left gutter, copy right gutter */}
          {!reduced &&
            DECK.filter((d) => d.quality).map((spec) => (
              <QualityAside key={spec.quality!.num} spec={spec} p={p} />
            ))}

          {/* featured corner card */}
          <motion.aside
            className="absolute right-[4%] bottom-[6%] z-40 w-[19.5rem] overflow-hidden rounded-2xl bg-[#294338] p-3 shadow-[0_34px_70px_-30px_rgba(20,26,22,0.8)]"
            style={reduced ? undefined : { opacity: cardOpacity, y: cardY }}
          >
            <div className="flex gap-3">
              <div className="relative w-[7.5rem] shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/buildingtop.jpg"
                  alt="The rooftop systems catching the late sun"
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col py-1 pr-1">
                <p className="text-[0.58rem] tracking-[0.22em] uppercase" style={{ color: "rgba(247,240,232,0.6)" }}>
                  Now in development
                </p>
                <p className="font-display mt-1.5 text-[1.05rem] leading-[1.15] font-medium" style={{ color: IVORY }}>
                  160 apartments.
                  <br />
                  8 penthouses.
                </p>
                <a
                  href="#enquire"
                  className="mt-auto inline-block w-fit rounded-full bg-[#C6A46B] px-5 py-3 text-xs font-semibold text-[#1D1714] transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-[#D6B87E]"
                >
                  Register interest
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* -------------------------------------------- mobile / reduced -- */}
      <div className="px-(--spacing-gutter) pb-4 lg:hidden">
        <p
          className="font-display uppercase"
          style={{ color: "#EFD5A3", fontSize: "clamp(2.3rem,9.5vw,3.6rem)", lineHeight: 1.02, fontWeight: 600 }}
          aria-hidden="true"
        >
          Homes made
          <br />
          <span style={{ color: "rgba(224,193,148,0.72)" }}>for real life.</span>
        </p>
        <figure className="relative mx-auto mt-10 aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl shadow-[0_40px_80px_-40px_rgba(26,16,11,0.7)]">
          <Image
            src="/lobby.jpg"
            alt="Residents at ease together in the warm family lounge of the residences"
            fill
            sizes="(min-width:640px) 60vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "38% 50%" }}
          />
        </figure>
        {/* each image card followed by its quality pair */}
        <div className="mt-10 space-y-10">
          {DECK.filter((d) => d.quality).map((d) => (
            <div key={d.quality!.num}>
              <figure className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-[0_30px_60px_-32px_rgba(26,16,11,0.65)]">
                <Image
                  src={d.src}
                  alt={d.alt}
                  fill
                  sizes="(min-width:640px) 60vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: d.objectPosition }}
                />
              </figure>
              <p className="mt-5 text-[0.68rem] font-semibold tracking-[0.24em] uppercase tabular-nums" style={{ color: "#FFC178" }}>
                {d.quality!.num} — {d.quality!.title}
              </p>
              <p className="font-display mt-2 leading-[1.08]" style={{ color: "#FFF8EF", fontSize: "1.7rem", fontWeight: 600 }}>
                {d.quality!.title}
              </p>
              <p className="mt-3 text-[1rem] leading-[1.65]" style={{ color: "rgba(250,243,232,0.9)" }}>
                {d.quality!.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 03C — AMENITIES & LIFESTYLE ============== */}
      <AmenitiesShowcase />

      {/* --------------------------------------- compliance note -------- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-12 pb-10 lg:pt-0 lg:pb-12">
        <p className="text-[0.62rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(247,240,232,0.55)" }}>
          Imagery shown conceptually — final finishes subject to approved specifications
        </p>
      </div>
    </section>
  );
}

/* ================================================== categories ====== */
/* The Residences showcase on the classic panel chassis: pinned cream
   stage, horizontal track, each category a three-zone editorial panel
   (serif column · framed media · reading column) with focal fades,
   0.96->1 settle and counter-parallax. The Duplex Penthouses panel is
   the finale — larger media, deep bronze-charcoal treatment, the 08
   numeral and signature cues. Mobile and reduced motion stack. */

interface CatPanelData {
  num: string;
  label: string;
  mark: string;
  heading: React.ReactNode;
  lead: string;
  body: string;
  points: { t: string; d: string }[];
  note: string;
  src: string;
  alt: string;
  pos?: string;
  duplex?: boolean;
}

const CAT_PANELS: CatPanelData[] = [
  {
    num: "01",
    label: "Classic",
    mark: "CLASSIC",
    heading: (
      <>
        Comfortable living,
        <span className="block">thoughtfully planned.</span>
      </>
    ),
    lead: "Precisely planned layouts created for practical everyday living.",
    body: "Classic Apartments feature precisely planned architectural layouts created for comfortable, convenient and practical everyday living.",
    points: [
      { t: "Fine Finishes", d: "Dependable workmanship and carefully selected materials." },
      { t: "Welcoming Environment", d: "A calm, practical home for modern families." },
    ],
    note: "Best for · practical modern family living.",
    src: "/family.jpg",
    alt: "A family sharing a meal in a bright Classic apartment",
  },
  {
    num: "02",
    label: "Elegant",
    mark: "ELEGANT",
    heading: (
      <>
        A more refined
        <span className="block">specification.</span>
      </>
    ),
    lead: "The qualities of Classic, elevated by an enhanced interior.",
    body: "Elegant Apartments include the fundamental qualities of the Classic category with an enhanced interior specification.",
    points: [
      { t: "Enhanced Interiors", d: "Modern fixtures, carpet flooring and selected wallpapers." },
      { t: "Statement Details", d: "Feature lighting, chandeliers and a solid-wood entrance door." },
    ],
    note: "Best for · residents seeking an upgraded interior experience.",
    src: "/bed.jpg",
    alt: "A refined Elegant-category bedroom in warm evening light",
    pos: "50% 45%",
  },
  {
    num: "03",
    label: "Sonder Class · Serviced",
    mark: "SONDER",
    heading: (
      <>
        Ready-to-live
        <span className="block">sophistication.</span>
      </>
    ),
    lead: "Foakh's premium serviced-apartment category.",
    body: "Coordinated interiors, premium finishes, selected furnishings and resident-focused convenience combine to create an effortless and refined ready-to-live experience.",
    points: [
      { t: "Coordinated Interiors", d: "Furnished and finished as one considered composition." },
      { t: "Resident Services", d: "Everyday convenience built into the experience." },
    ],
    note: "Best for · elevated comfort, convenience and serviced living.",
    src: "/drawingroomfoakh.jpg",
    alt: "The coordinated interior of a Sonder Class serviced apartment",
  },
  {
    num: "04",
    label: "Duplex Penthouses",
    mark: "DUPLEX",
    heading: (
      <>
        Living above
        <span className="block">the ordinary.</span>
      </>
    ),
    lead: "The most exclusive residences in the collection.",
    body: "Eight exclusive duplex penthouses elevate the residential collection with additional space, privacy and independent swimming pools.",
    points: [
      { t: "Private Pools", d: "An independent swimming pool with every penthouse." },
      { t: "Elevated Privacy", d: "Duplex living at the crown of the building." },
      { t: "Premium Outlook", d: "Signature residences with commanding views." },
    ],
    note: "Only 08 · signature duplex residences.",
    src: "/balconyfoakh.jpg",
    alt: "A private penthouse terrace at golden hour, high above the landscape",
    pos: "50% 42%",
    duplex: true,
  },
];

function ResidenceCategories({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const cp = useSpring(scrollYProgress, { stiffness: 100, damping: 28, mass: 0.4 });

  const trackX = useTransform(cp, [0.04, 0.92], ["0vw", "-300vw"]);
  const introOp = useTransform(cp, [0, 0.06, 0.11], [1, 1, 0]);
  /* the finale takes over: cream stage crossfades to deep bronze-charcoal */
  const duplexOp = useTransform(cp, [0.79, 0.89, 0.94, 0.995], [0, 1, 1, 0]);
  /* the section's coral rises and fills the stage over the last stretch,
     so the pin releases into the same colour instead of cutting from
     near-black straight to red */
  const eyebrowOut = useTransform(cp, [0.9, 0.97], [1, 0]);
  const baseOp = useTransform(cp, [0.94, 0.995], [1, 0]);
  const handoffOp = useTransform(cp, [0.965, 1], [1, 0.55]);
  const handoffY = useTransform(cp, (v) => {
    const t = Math.min(Math.max((v - 0.88) / 0.12, 0), 1);
    const e = t * t * (3 - 2 * t);
    return `${104 - e * 128}%`;
  });
  const counter = [
    useTransform(cp, [0.05, 0.11, 0.28, 0.33], [0, 1, 1, 0]),
    useTransform(cp, [0.28, 0.33, 0.54, 0.59], [0, 1, 1, 0]),
    useTransform(cp, [0.54, 0.59, 0.79, 0.84], [0, 1, 1, 0]),
    useTransform(cp, [0.79, 0.84, 1, 1.01], [0, 1, 1, 1]),
  ];

  if (reduced) return <StackedCategories />;

  return (
    <div>
      {/* ------------- desktop: pinned horizontal showcase ------------ */}
      <div ref={wrapRef} className="relative hidden lg:block lg:h-[460svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#F6EBDD]"
            style={{ opacity: baseOp }}
          />
          <div className="grain absolute inset-0" aria-hidden="true" />
          {/* the coral handoff — fills upward, matching the section ground */}
          {/* rendered after the theme layer below so it sits on top of it */}
          {/* duplex theme layer */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              opacity: duplexOp,
              background:
                "radial-gradient(70% 60% at 78% 88%, rgb(214 138 74 / 0.22) 0%, transparent 60%)," +
                "radial-gradient(55% 45% at 18% 12%, rgb(120 60 30 / 0.25) 0%, transparent 65%)," +
                "linear-gradient(165deg, #241410 0%, #1A0F0A 55%, #2A160E 100%)",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[130%]"
            style={{
              y: handoffY,
              opacity: handoffOp,
              background:
                "linear-gradient(180deg, rgba(199,91,59,0) 0%, rgba(199,91,59,0.55) 9%, #C75B3B 24%, #BE5433 60%, #B85030 100%)",
            }}
          />

          <motion.p
            className="absolute top-[6%] left-[8%] z-40 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "#A9803C", opacity: eyebrowOut }}
          >
            03 — Residences · The Collection
          </motion.p>

          {/* compact progress — bottom left, the classic strip */}
          <div className="absolute bottom-[6%] left-[8%] z-40 flex items-center gap-4">
            {CAT_PANELS.map((c, i) => (
              <motion.span
                key={c.num}
                className="text-[0.68rem] font-semibold tabular-nums"
                style={{ color: "#A9803C", opacity: counter[i] }}
              >
                {c.num} / 04
              </motion.span>
            ))}
            <span className="h-px w-12" style={{ background: "rgba(169,128,60,0.4)" }} />
            <span className="relative text-[0.6rem] tracking-[0.26em] uppercase">
              <span style={{ color: "rgba(33,26,23,0.5)" }}>Classic · Elegant · Sonder · Duplex</span>
              <motion.span className="absolute inset-0" style={{ opacity: duplexOp, color: "rgba(255,248,239,0.75)" }}>
                Classic · Elegant · Sonder · Duplex
              </motion.span>
            </span>
          </div>

          <motion.div className="absolute top-0 left-0 h-full w-[500vw]" style={{ x: trackX }}>
            {/* ---- intro anchor ---- */}
            <motion.div
              className="absolute top-0 left-[6vw] flex h-full w-[38vw] flex-col justify-center"
              style={{ opacity: introOp }}
            >
              <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#A9803C" }}>
                Three categories · One finale
              </p>
              <p
                className="font-display mt-6 leading-[1.05] font-medium"
                style={{ color: "#943F2D", fontSize: "clamp(2.6rem,3.4vw,3.6rem)" }}
              >
                One exceptional address. Three distinctive categories.
              </p>
              <p className="mt-5 max-w-md text-[0.95rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.72)" }}>
                From practical family living to serviced sophistication — each category
                reflects thoughtful planning, quality materials and dependable craftsmanship.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.22em] uppercase" style={{ color: "rgba(33,26,23,0.5)" }}>
                Scroll <span aria-hidden="true">→</span>
              </p>
            </motion.div>

            {CAT_PANELS.map((c, i) => (
              <CategoryPanel key={c.num} c={c} index={i} progress={cp} left={48 + i * 86} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ------------- mobile: stacked story -------------------------- */}
      <div className="lg:hidden">
        <StackedCategories embedded />
      </div>
    </div>
  );
}

/** classic three-zone panel: serif column · framed media · reading column */
function CategoryPanel({
  c,
  index,
  progress,
  left,
}: {
  c: CatPanelData;
  index: number;
  progress: MotionValue<number>;
  left: number;
}) {
  const focal = [0.16, 0.42, 0.67, 0.9][index];
  const win = 0.12;
  const op = useTransform(
    progress,
    [focal - win, focal - win * 0.55, focal + win * 0.8, focal + win * 1.4],
    [0, 1, 1, 0.12]
  );
  const settle = useTransform(progress, [focal - win, focal], [0.96, 1]);
  const mediaY = useTransform(progress, [focal - win, focal + win], ["2.5svh", "-2.5svh"]);
  const textX = useTransform(progress, [focal - win, focal + win], ["1.5vw", "-1vw"]);
  const textX2 = useTransform(textX, (v) => `calc(${v} * -0.7)`);
  const dup = !!c.duplex;

  if (dup) {
    return (
      <motion.article
        className="absolute top-0 flex h-full w-[80vw] items-center"
        style={{ left: `${left}vw`, opacity: op }}
        aria-label={`${c.num} — ${c.label}`}
      >
        {/* giant house-type watermark behind the finale */}
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute bottom-[4%] left-[3%] leading-none font-semibold whitespace-nowrap uppercase"
          style={{ color: "rgba(239,213,163,0.07)", fontSize: "13vw", letterSpacing: "-0.01em" }}
        >
          {c.mark}
        </span>
        <div className="grid w-full grid-cols-[19%_1fr_28%] items-center gap-[2vw] pr-[1.5vw] pl-[5vw]">
          {/* LEFT — the exclusive marker */}
          <motion.div style={{ x: textX }}>
            <p className="text-[0.72rem] font-semibold tabular-nums" style={{ color: "#EFD5A3" }}>
              {c.num}
            </p>
            <p className="mt-1.5 text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: "rgba(255,248,239,0.6)" }}>
              {c.label}
            </p>
            <p
              className="font-display mt-6 leading-[1.04] font-medium"
              style={{ color: "#FFF8EF", fontSize: "clamp(2.5rem,3.4vw,3.7rem)" }}
            >
              {c.heading}
            </p>
            <p className="font-display mt-4 text-[0.98rem] leading-snug italic" style={{ color: "#EFD5A3" }}>
              {c.lead}
            </p>
            <p className="font-display mt-7 leading-none font-semibold" style={{ color: "#C78C49", fontSize: "4.2rem" }}>
              08
            </p>
            <p className="mt-1.5 max-w-[10rem] text-[0.56rem] font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(255,248,239,0.7)" }}>
              Exclusive Duplex Penthouses
            </p>
          </motion.div>

          {/* CENTRE — the penthouse collage */}
          <motion.div className="relative -mt-[3svh] h-[68svh]" style={{ scale: settle, y: mediaY }}>
            {/* main terrace */}
            <figure className="absolute top-0 left-0 h-[74%] w-[78%] overflow-hidden rounded-[14px] border border-[#D8B36A]/75 bg-[#140B07] p-1.5 shadow-[0_44px_88px_-36px_rgba(0,0,0,0.8)]">
              <div className="relative h-full w-full overflow-hidden rounded-[9px]">
                <Image src="/balconyfoakh.jpg" alt="A private penthouse terrace at golden hour" fill sizes="34vw" className="object-cover" style={{ objectPosition: "50% 42%" }} />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(200deg, transparent 45%, rgb(14 8 5 / 0.55) 100%)" }} />
                <span className="absolute bottom-4 left-5 text-[0.58rem] font-bold tracking-[0.28em] uppercase" style={{ color: "#EFD5A3" }}>
                  The grand finale
                </span>
              </div>
            </figure>
            {/* duplex bedroom */}
            <figure className="absolute top-[8%] right-0 h-[38%] w-[34%] rotate-[1.6deg] overflow-hidden rounded-[12px] border border-[#D8B36A]/70 bg-[#140B07] p-1 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]">
              <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                <Image src="/bed.jpg" alt="A penthouse bedroom in soft evening light" fill sizes="16vw" className="object-cover" style={{ objectPosition: "50% 45%" }} />
              </div>
            </figure>
            {/* duplex lounge */}
            <figure className="absolute bottom-0 right-[10%] h-[36%] w-[42%] -rotate-[1.4deg] overflow-hidden rounded-[12px] border border-[#D8B36A]/70 bg-[#140B07] p-1 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]">
              <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                <Image src="/drawingroomfoakh.jpg" alt="The double-height penthouse lounge" fill sizes="20vw" className="object-cover" />
              </div>
            </figure>
          </motion.div>

          {/* RIGHT — reading column + the single enquiry CTA */}
          <motion.div style={{ x: textX2 }}>
            <p className="text-[0.88rem] leading-[1.6]" style={{ color: "rgba(255,248,239,0.9)" }}>
              {c.body}
            </p>
            <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: "rgba(216,179,106,0.45)" }}>
              {c.points.map((pt) => (
                <li key={pt.t}>
                  <p className="text-[0.78rem] font-semibold" style={{ color: "#EFD5A3" }}>
                    {pt.t}
                  </p>
                  <p className="text-[0.74rem] leading-[1.55]" style={{ color: "rgba(255,248,239,0.65)" }}>
                    {pt.d}
                  </p>
                </li>
              ))}
            </ul>
            <PenthouseEnquiry className="mt-5" />
          </motion.div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="absolute top-0 flex h-full w-[80vw] items-center"
      style={{ left: `${left}vw`, opacity: op }}
      aria-label={`${c.num} — ${c.label}`}
    >
      {/* giant house-type watermark behind the panel */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute bottom-[4%] left-[3%] leading-none font-semibold whitespace-nowrap uppercase"
        style={{ color: "rgba(148,63,45,0.06)", fontSize: "13vw", letterSpacing: "-0.01em" }}
      >
        {c.mark}
      </span>
      <div className="grid w-full grid-cols-[23%_1fr_22%] items-center gap-[2.2vw] pr-[1.5vw] pl-[5vw]">
        {/* LEFT — marker + serif heading + italic lead */}
        <motion.div className="relative z-20" style={{ x: textX }}>
          <p className="text-[0.72rem] font-semibold tabular-nums" style={{ color: "#A9803C" }}>
            {c.num}
          </p>
          <p className="mt-1.5 text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: "rgba(33,26,23,0.5)" }}>
            {c.label}
          </p>
          <p
            className="font-display mt-6 leading-[1.04] font-medium"
            style={{ color: "#943F2D", fontSize: "clamp(2.2rem,2.9vw,3.1rem)" }}
          >
            {c.heading}
          </p>
          <p className="font-display mt-4 text-[0.98rem] leading-snug italic" style={{ color: "#6E8163" }}>
            {c.lead}
          </p>
          {dup && (
            <p className="font-display mt-6 leading-none font-semibold" style={{ color: "#C78C49", fontSize: "3.6rem" }}>
              08
            </p>
          )}
        </motion.div>

        {/* CENTRE — the dominant framed media */}
        <motion.figure
          className={`relative overflow-hidden rounded-[14px] border bg-[#FFF8EF] p-1.5 ${
            dup
              ? "-mt-[2svh] h-[68svh] border-[#D8B36A]/80 shadow-[0_50px_100px_-40px_rgba(20,10,5,0.75)]"
              : "-mt-[4svh] h-[62svh] border-[#D8B36A]/55 shadow-[0_36px_70px_-38px_rgba(148,63,45,0.4)]"
          }`}
          style={{ scale: settle, y: mediaY }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[9px]">
            <Image
              src={c.src}
              alt={c.alt}
              fill
              sizes="46vw"
              className="object-cover"
              style={{ objectPosition: c.pos ?? "50% 50%" }}
            />
            {dup ? (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(70% 55% at 18% 96%, rgb(255 176 96 / 0.32) 0%, transparent 60%)," +
                      "linear-gradient(200deg, rgb(20 11 7 / 0.12) 0%, rgb(20 11 7 / 0.3) 55%, rgb(14 8 5 / 0.78) 100%)",
                  }}
                />
                <span className="absolute bottom-5 left-6 text-[0.6rem] font-bold tracking-[0.3em] uppercase" style={{ color: "#EFD5A3" }}>
                  The grand finale
                </span>
                <span className="absolute right-6 bottom-5 flex gap-2">
                  {["Private Pools", "Signature Residences"].map((cue) => (
                    <span
                      key={cue}
                      className="rounded-full border border-[#EFD5A3]/50 bg-[#140B07]/45 px-3 py-1.5 text-[0.55rem] font-semibold tracking-[0.16em] uppercase backdrop-blur-[2px]"
                      style={{ color: "rgba(255,248,239,0.92)" }}
                    >
                      {cue}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(165deg, rgb(229 173 66 / 0.08) 0%, transparent 38%, rgb(33 26 23 / 0.18) 100%)",
                }}
              />
            )}
          </div>
        </motion.figure>

        {/* RIGHT — reading column */}
        <motion.div style={{ x: textX2 }}>
          <p className="text-[0.88rem] leading-[1.6]" style={{ color: dup ? "#211A17" : "rgba(33,26,23,0.78)" }}>
            {c.body}
          </p>
          <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: "rgba(216,179,106,0.45)" }}>
            {c.points.map((pt) => (
              <li key={pt.t}>
                <p className="text-[0.78rem] font-semibold" style={{ color: "#943F2D" }}>
                  {pt.t}
                </p>
                <p className="text-[0.74rem] leading-[1.55]" style={{ color: "rgba(33,26,23,0.65)" }}>
                  {pt.d}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[0.6rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(33,26,23,0.5)" }}>
            {c.note}
          </p>
        </motion.div>
      </div>
    </motion.article>
  );
}

/** stacked story — mobile and reduced motion */
function StackedCategories({ embedded = false }: { embedded?: boolean }) {
  const body = (
    <div className="relative mx-auto max-w-2xl px-6 py-20">
      <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#A9803C" }}>
        03 — Residences · The Collection
      </p>
      <p
        className="font-display mt-5 leading-[1.08] font-medium"
        style={{ color: "#943F2D", fontSize: "clamp(2.2rem,7vw,3rem)" }}
      >
        One exceptional address. Three distinctive categories.
      </p>
      <div className="mt-12 space-y-16">
        {CAT_PANELS.map((c) => (
          <article key={c.num} aria-label={`${c.num} — ${c.label}`}>
            <p className="text-[0.72rem] font-semibold tabular-nums" style={{ color: "#A9803C" }}>
              {c.num} <span style={{ color: "rgba(33,26,23,0.45)" }}>/ 04</span>
            </p>
            <p className="mt-1 text-[0.6rem] tracking-[0.26em] uppercase" style={{ color: "rgba(33,26,23,0.5)" }}>
              {c.label}
            </p>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[12px] border border-[#D8B36A]/55 bg-[#FFF8EF] p-1">
              <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                <Image src={c.src} alt={c.alt} fill sizes="92vw" className="object-cover" style={{ objectPosition: c.pos ?? "50% 50%" }} />
                {c.duplex && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(200deg, transparent 40%, rgb(14 8 5 / 0.7) 100%)" }}
                  />
                )}
              </div>
            </div>
            <p
              className="font-display mt-5 leading-[1.05] font-medium"
              style={{ color: "#943F2D", fontSize: "clamp(1.7rem,5.4vw,2.3rem)" }}
            >
              {c.heading}
            </p>
            <p className="font-display mt-2 text-[0.95rem] italic" style={{ color: "#6E8163" }}>
              {c.lead}
            </p>
            <p className="mt-3 text-[0.9rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.75)" }}>
              {c.body}
            </p>
            <ul className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "rgba(216,179,106,0.45)" }}>
              {c.points.map((pt) => (
                <li key={pt.t}>
                  <p className="text-[0.8rem] font-semibold" style={{ color: "#943F2D" }}>
                    {pt.t}
                  </p>
                  <p className="text-[0.76rem] leading-[1.55]" style={{ color: "rgba(33,26,23,0.65)" }}>
                    {pt.d}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.6rem] tracking-[0.14em] uppercase" style={{ color: "rgba(33,26,23,0.5)" }}>
              {c.note}
            </p>
            {c.duplex && <PenthouseEnquiry className="mt-4" />}
          </article>
        ))}
      </div>
    </div>
  );

  if (embedded) return <div className="bg-[#F6EBDD]">{body}</div>;
  return <div className="bg-[#F6EBDD]">{body}</div>;
}


/* ------------------------------------------- penthouse enquiry ----- */

const PENTHOUSE_FIELDS = [
  { id: "ph-name", label: "Full name", type: "text", auto: "name" },
  { id: "ph-email", label: "Email", type: "email", auto: "email" },
  { id: "ph-phone", label: "Phone", type: "tel", auto: "tel" },
];

/**
 * A dedicated enquiry form for the eight duplex penthouses — separate
 * from the general Register Interest form. Real fields and validation
 * styling; submission stays disabled until the penthouse sales inbox is
 * confirmed, so no enquiry is silently dropped.
 */
function PenthouseEnquiry({ className = "" }: { className?: string }) {
  return (
    <form
      aria-label="Enquire about the duplex penthouses"
      onSubmit={(e) => e.preventDefault()}
      className={`rounded-[14px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-4 shadow-[0_20px_44px_-26px_rgba(0,0,0,0.6)] ${className}`}
    >
      <p className="text-[0.55rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C78C49" }}>
        Penthouse enquiry
      </p>
      <p className="font-display mt-1 text-[1.05rem] leading-snug font-medium" style={{ color: "#943F2D" }}>
        Register for the eight.
      </p>
      <div className="mt-3 space-y-2">
        {PENTHOUSE_FIELDS.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="sr-only">
              {f.label}
            </label>
            <input
              id={f.id}
              name={f.id}
              type={f.type}
              autoComplete={f.auto}
              placeholder={f.label}
              className="w-full rounded-md border border-[#D8B36A]/45 bg-[#FFFCF7] px-3 py-2 text-[0.8rem] text-[#211A17] transition-colors outline-none placeholder:text-[#211A17]/40 focus:border-[#C78C49]"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled
        aria-disabled="true"
        title="Penthouse enquiries activate once the sales inbox is confirmed"
        className="mt-3 w-full cursor-not-allowed rounded-full bg-[#C78C49]/45 px-4 py-2.5 text-[0.78rem] font-bold text-[#1A0F0A]"
      >
        Enquire About Penthouses
      </button>
      <p className="mt-2 text-[0.58rem] leading-relaxed" style={{ color: "rgba(33,26,23,0.55)" }}>
        Penthouse enquiries activate once the sales inbox is confirmed — no enquiry is
        silently dropped in the meantime.
      </p>
    </form>
  );
}

/* ============================================================ deck == *//* ============================================================ deck == *//* ============================================================ deck == */

/** A soft colour wash that breathes in while its card holds centre. */
function AccentGlow({ spec, p }: { spec: DeckSpec; p: MotionValue<number> }) {
  const [s, e] = spec.rise;
  const cover = spec.cover;
  const opacity = useTransform(
    p,
    cover ? [s, e, cover[0], cover[1]] : [s, e],
    cover ? [0, 1, 1, 0] : [0, 1]
  );
  return (
    <motion.div
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 z-[5] h-[80svh] w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      style={{
        opacity,
        background: `radial-gradient(closest-side, rgb(${spec.accent} / 0.34) 0%, rgb(${spec.accent} / 0.1) 55%, transparent 75%)`,
      }}
    />
  );
}

function DeckCard({
  spec,
  p,
  reduced,
}: {
  spec: DeckSpec;
  p: MotionValue<number>;
  reduced: boolean;
}) {
  const [s, e] = spec.rise;
  const cover = spec.cover;

  const y = useTransform(p, [s, e], [spec.fromY, "0svh"]);
  const scale = useTransform(
    p,
    cover ? [s, e, cover[0], cover[1]] : [s, e],
    cover ? [0.97, 1, 1, 0.955] : [0.97, 1]
  );
  const rotate = useTransform(p, [s, e], [spec.rotate * 2.2, spec.rotate]);
  const dim = useTransform(p, cover ? [cover[0], cover[1]] : [0, 1], cover ? [0, 0.28] : [0, 0]);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ zIndex: spec.z }}
    >
      <motion.figure
        className="pointer-events-auto relative overflow-hidden shadow-[0_50px_100px_-40px_rgba(26,16,11,0.7)]"
        style={{
          width: spec.width,
          aspectRatio: spec.aspect,
          borderRadius: spec.radius,
          backgroundColor: INK,
          ...(reduced ? {} : { y, scale, rotate }),
        }}
      >
        <Image
          src={spec.src}
          alt={spec.alt}
          fill
          sizes="30vw"
          className="object-cover"
          style={{ objectPosition: spec.objectPosition }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(178deg, rgb(198 164 107 / 0.06) 0%, transparent 30%, rgb(29 23 20 / 0.2) 100%)",
          }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-[#1D1714]"
          style={{ opacity: reduced ? 0 : dim }}
        />
      </motion.figure>
    </div>
  );
}

/* --------------------------------------------------- reading pair ----- */

function QualityAside({ spec, p }: { spec: DeckSpec; p: MotionValue<number> }) {
  const q = spec.quality!;
  const [s, e] = spec.rise;
  const cover = spec.cover;
  const mid = (s + e) / 2;

  const opacity = useTransform(
    p,
    cover ? [mid, e, cover[0], cover[0] + 0.05] : [mid, e],
    cover ? [0, 1, 1, 0] : [0, 1]
  );
  const headX = useTransform(p, [mid, e], [-36, 0]);
  const copyX = useTransform(p, [mid, e], [36, 0]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
      {/* heading — left gutter */}
      <motion.div
        className="absolute top-1/2 left-[6%] w-[24vw] max-w-[380px]"
        style={{ opacity, x: headX, y: "-50%" }}
      >
        <p
          className="text-[0.82rem] font-semibold tracking-[0.26em] uppercase tabular-nums"
          style={{ color: "#FFC178" }}
        >
          {q.num} — {q.title}
        </p>
        <p
          className="font-display mt-4 leading-[1.05]"
          style={{
            color: "#FFF8EF",
            fontSize: "clamp(2.4rem,4vw,4.4rem)",
            fontWeight: 600,
            letterSpacing: "-0.015em",
          }}
        >
          {q.title}
        </p>
        <span className="mt-5 block h-px w-9" style={{ background: "rgba(240,178,105,0.4)" }} />
      </motion.div>

      {/* copy — right gutter, drawn toward the image */}
      <motion.div
        className="absolute top-1/2 right-[7%] w-[22vw] max-w-[380px]"
        style={{ opacity, x: copyX, y: "-50%" }}
      >
        <p
          className="leading-[1.6]"
          style={{ color: "rgba(250,243,232,0.93)", fontSize: "clamp(1.15rem,1.25vw,1.375rem)" }}
        >
          {q.copy}
        </p>
      </motion.div>
    </div>
  );
}

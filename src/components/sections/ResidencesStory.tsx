"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AmenitiesShowcase from "./AmenitiesShowcase";
import {
  AnimatePresence,
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
 * card deck — SIX residence motifs. The opening three were rewritten
 * from the old Spacious / Functional / Elegant, which were generic and
 * echoed the category names above:
 *
 *   01 OPEN      — room to breathe (space, daylight, the balcony edge)
 *   02 INTUITIVE — a plan that works (kitchen, dining, circulation)
 *   03 COMPOSED  — detail up close (materials, finish, calm)
 *   04 COMFORT FOCUSED · 05 PRIVATE BALCONIES · 06 REFINED MATERIALS
 *
 * "Refined" was deliberately avoided for 03: the collection panels above
 * already run on Elegant / "a more refined specification", and 06 owns
 * Refined Materials, so a third use would echo rather than add an idea.
 * The three images behind 01–03 are exclusive to this sequence — no
 * other section of the site uses them.
 *
 * Each card rises and covers the last with a changing boundary while its
 * reading pair (heading left, copy right) swaps in. The split backdrop
 * headline "HOMES MADE / FOR REAL LIFE" recedes once the beats begin.
 *
 * Native scroll pin, spring-driven progress (ScrollTimeline stale-range
 * guard), transform/opacity only. Reduced motion renders settled
 * frames; mobile stacks everything readably.
 */

const IVORY = "#F5EDE3";
const INK = "#2B211D";

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

/**
 * Six beats. The opening three carry their own shape rhythm — OPEN is the
 * broadest card in the deck, INTUITIVE squares off, COMPOSED stands tall —
 * so the sequence reads expanse → order → stillness before the words even
 * arrive, then hands over to the original four-to-six run.
 *
 * Even step of 0.14: rise over 0.10, hold for 0.05, then the next card
 * covers. Slightly more generous than the old 0.12 step, which keeps the
 * reading pairs editorial rather than carousel-paced.
 */
const DECK: DeckSpec[] = [
  {
    kind: "image",
    src: "/drawingroomfoakh.jpg",
    alt: "A living room with its corner glazing slid fully open to a private balcony, morning daylight across the limestone floor",
    rise: [0.03, 0.13],
    cover: [0.18, 0.27],
    fromY: "86svh",
    width: "clamp(400px,32vw,600px)",
    aspect: "16 / 9",
    radius: "20px",
    rotate: -1.6,
    z: 21,
    quality: {
      num: "01",
      title: "Open",
      copy: "Generous layouts that carry daylight from the living room to the balcony edge.",
    },
    accent: "224 190 132",
  },
  {
    kind: "image",
    src: "/family.jpg",
    alt: "The circulation spine of a residence — entry, open kitchen and dining reading through in a single line of sight",
    rise: [0.18, 0.27],
    cover: [0.32, 0.41],
    fromY: "118svh",
    width: "clamp(340px,26vw,470px)",
    aspect: "4 / 3",
    radius: "12px",
    rotate: 1.8,
    z: 22,
    quality: {
      num: "02",
      title: "Intuitive",
      copy: "Planning that follows real routines — cooking, gathering, moving through the day.",
    },
    accent: "138 152 132",
  },
  {
    kind: "image",
    src: "/bed.jpg",
    alt: "The fluted walnut headboard wall of a principal bedroom, lime plaster and brass caught in low evening light",
    rise: [0.32, 0.41],
    cover: [0.46, 0.55],
    fromY: "118svh",
    width: "clamp(300px,22vw,400px)",
    aspect: "4 / 5",
    radius: "24px",
    rotate: -1.3,
    z: 23,
    quality: {
      num: "03",
      title: "Composed",
      copy: "Considered finishes and quiet detailing, resolved into one calm interior.",
    },
    accent: "205 143 96",
  },
  {
    kind: "image",
    src: "/residence-open.jpg",
    alt: "A bright, generously planned living room opening to its balcony",
    rise: [0.46, 0.55],
    cover: [0.60, 0.69],
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
    rise: [0.60, 0.69],
    cover: [0.74, 0.83],
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
    src: "/residence-composed.jpg",
    alt: "The fluted walnut headboard wall, lime plaster and brass of a principal bedroom",
    rise: [0.74, 0.83],
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
  const cardOpacity = useTransform(p, [0.86, 0.95], [0, 1]);
  const cardY = useTransform(p, [0.86, 0.95], [28, 0]);

  return (
    <section
      id="residences"
      ref={sectionRef}
      data-section="residences"
      aria-labelledby="residences-heading"
      className="grain blend-top relative"
      style={
        {
          "--blend-from": "#F5EDE3",
          background:
            "radial-gradient(85% 60% at 74% 20%, rgb(215 139 112 / 0.34) 0%, transparent 58%)," +
            "radial-gradient(62% 46% at 50% 52%, rgb(201 147 85 / 0.24) 0%, transparent 70%)," +
            "radial-gradient(55% 45% at 82% 55%, rgb(245 237 227 / 0.1) 0%, transparent 72%)," +
            "radial-gradient(70% 50% at 14% 84%, rgb(41 74 62 / 0.16) 0%, transparent 60%)," +
            "linear-gradient(172deg, #94432F 0%, #B65438 34%, #A8492F 62%, #713427 100%)",
        } as React.CSSProperties
      }
    >
      {/* ==================== 03A — RESIDENCE CATEGORIES =============== */}
      <ResidenceCategories reduced={!!reduced} />

      {/* ---- Apartments & Interiors — the deck's introduction ------- */}
      <div className="relative">
        <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-16 pb-16 lg:pt-20 lg:pb-20">
        <p className="relative text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#E8CFA4" }}>
          Apartments &amp; Interiors
        </p>
        <p
          className="font-display relative mt-4 max-w-[26ch] leading-[1.15]"
          style={{ color: IVORY, fontSize: "clamp(1.9rem,2.6vw,2.8rem)", fontWeight: 500 }}
        >
          Homes made for real life.
        </p>
        <p className="relative mt-4 max-w-[62ch] text-[1rem] leading-[1.75]" style={{ color: "rgba(250,243,232,0.88)" }}>
          Every residence is shaped around openness, everyday practicality and
          considered material detail.
        </p>
        </div>
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
                color: "#E8CFA4",
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
            className="absolute right-[4%] bottom-[6%] z-40 w-[19.5rem] overflow-hidden rounded-2xl bg-[#294A3E] p-3 shadow-[0_34px_70px_-30px_rgba(20,26,22,0.8)]"
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
                  className="mt-auto inline-block w-fit rounded-full bg-[#C99355] px-5 py-3 text-xs font-semibold text-[#2B211D] transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-[#D6B87E]"
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
          style={{ color: "#E8CFA4", fontSize: "clamp(2.3rem,9.5vw,3.6rem)", lineHeight: 1.02, fontWeight: 600 }}
          aria-hidden="true"
        >
          Homes made
          <br />
          <span style={{ color: "rgba(224,193,148,0.72)" }}>for real life.</span>
        </p>
        {/* the same six beats, stacked — each card keeps its own shape so the
            deck's rhythm survives on a phone, and the numeral carries the
            count instead of repeating the title underneath itself */}
        <div className="mt-12 space-y-14">
          {DECK.filter((d) => d.quality).map((d) => (
            <div key={d.quality!.num}>
              <figure
                className="relative overflow-hidden rounded-xl shadow-[0_30px_60px_-32px_rgba(26,16,11,0.65)]"
                style={{ aspectRatio: d.aspect }}
              >
                <Image
                  src={d.src}
                  alt={d.alt}
                  fill
                  sizes="(min-width:640px) 60vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: d.objectPosition }}
                />
              </figure>
              <p className="mt-5 text-[0.68rem] font-semibold tracking-[0.24em] tabular-nums" style={{ color: "#E8CFA4" }}>
                {d.quality!.num} <span style={{ color: "rgba(232,207,164,0.5)" }}>/ 06</span>
              </p>
              <p className="font-display mt-2 leading-[1.08]" style={{ color: "#FAF6F0", fontSize: "1.9rem", fontWeight: 600 }}>
                {d.quality!.title}
              </p>
              <span className="mt-4 block h-px w-9" style={{ background: "rgba(240,178,105,0.4)" }} />
              <p className="mt-4 text-[1rem] leading-[1.65]" style={{ color: "rgba(250,243,232,0.9)" }}>
                {d.quality!.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 03C — AMENITIES & LIFESTYLE ============== */}
      <AmenitiesShowcase />
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
  /** the name the standing index uses — short enough to read as a list */
  short: string;
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
    short: "Classic",
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
    src: "/residence-intuitive.jpg",
    alt: "A Classic apartment in everyday use — kitchen, dining and circulation reading through",
  },
  {
    num: "02",
    label: "Elegant",
    short: "Elegant",
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
    src: "/interior-elegant.jpg",
    alt: "An Elegant-category living room — feature lighting, panelled walls and the solid-wood entrance door",
    pos: "50% 50%",
  },
  {
    num: "03",
    label: "Sonder Class · Serviced",
    short: "Sonder Class",
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
    src: "/kitchen.jpg",
    alt: "The coordinated, ready-to-live interior of a Sonder Class serviced apartment",
  },
  {
    num: "04",
    label: "Duplex Penthouses",
    short: "Duplex Penthouses",
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
    src: "/foakhduplexbalcony.jpg",
    alt: "The duplex penthouse terrace and double-height living room at golden hour",
    pos: "50% 42%",
    duplex: true,
  },
];

/* the scroll positions at which each panel holds the stage — shared by
   the panels and by the index that points at them */
const FOCALS = [0.115, 0.282, 0.441, 0.588];

/**
 * THE STANDING INDEX — one list, never two.
 *
 * It opens beneath the intro copy and then travels down the stage as the
 * collection begins, ending as the index that stands beside every panel.
 * There is no second copy fading in below: the same element moves, so the
 * eye carries the list from the introduction into the collection. It also
 * replaces the small "Classic · Elegant · Sonder · Duplex" strip that used
 * to sit at the foot of the stage, and it takes over the 01/label pair the
 * panels used to print for themselves — the category is named once.
 */
/** one row height, so the vertical stack lands on an even rhythm */
const ROW = 46;

function IndexRow({
  c,
  i,
  p,
  duplex,
  morph,
  natX,
  onJump,
}: {
  c: CatPanelData;
  i: number;
  p: MotionValue<number>;
  duplex: MotionValue<number>;
  /** 0 = the vertical index of the intro, 1 = the horizontal bar below */
  morph: MotionValue<number>;
  /** where this entry sits when the list is laid out as a row */
  natX: number;
  onJump: (i: number) => void;
}) {
  const focal = FOCALS[i];
  const win = 0.085;
  /* lit while its panel holds the stage; the finale stays lit to the end */
  const active = useTransform(
    p,
    i === 3
      ? [focal - win, focal, 1.6, 1.7]
      : [focal - win, focal, focal + win, focal + win * 1.6],
    [0, 1, 1, 0]
  );
  const rest = useTransform(p, [0.05, 0.11], [0.62, 0.34]);
  const dim = useTransform([active, rest] as MotionValue<number>[], ([a, r]: number[]) => r + (1 - r) * a);

  /* the morph itself: the row is always laid out horizontally, and the
     vertical index is that same row pulled back to a single column — so
     the entries travel between the two layouts instead of re-flowing */
  const x = useTransform(morph, (m) => -natX * (1 - m));
  const y = useTransform(morph, (m) => i * ROW * (1 - m));

  /* the indicator changes with the layout: a rule to the left of the
     entry while it reads as a column, an underline once it reads as a bar */
  const leftRule = useTransform([active, morph] as MotionValue<number>[], ([a, m]: number[]) => `${a * (1 - m)}rem`);
  const underline = useTransform([active, morph] as MotionValue<number>[], ([a, m]: number[]) => `${a * m * 100}%`);
  const shift = useTransform([active, morph] as MotionValue<number>[], ([a, m]: number[]) => a * (1 - m) * 15);
  const dividerOp = useTransform(morph, [0, 1], [1, 0]);

  /* the finale darkens the stage, so the index changes tone with it */
  const tone = useTransform(duplex, [0, 1], ["#94432F", "#EFD5A3"]);
  const numTone = useTransform(duplex, [0, 1], ["rgba(33,26,23,0.55)", "rgba(255,248,239,0.62)"]);
  const divider = useTransform(duplex, [0, 1], ["rgba(148,63,45,0.15)", "rgba(239,213,163,0.18)"]);

  return (
    <motion.li
      className="relative flex shrink-0 items-center"
      style={{ x, y, height: ROW }}
    >
      {/* the hairlines that separate the column entries — gone in the bar */}
      {i > 0 && (
        <motion.span
          aria-hidden="true"
          className="absolute top-0 left-0 h-px w-[11.5rem]"
          style={{ background: divider, opacity: dividerOp }}
        />
      )}
      <motion.span
        aria-hidden="true"
        className="absolute top-1/2 left-0 h-px -translate-y-1/2"
        style={{ width: leftRule, background: tone }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1.5 left-0 h-px"
        style={{ width: underline, background: tone }}
      />
      <motion.button
        type="button"
        onClick={() => onJump(i)}
        className="flex items-baseline gap-2.5 text-left whitespace-nowrap"
        style={{ opacity: dim, x: shift }}
      >
        <motion.span className="text-[0.56rem] font-semibold tabular-nums" style={{ color: numTone }}>
          {c.num}
        </motion.span>
        <motion.span className="font-display text-[1rem] leading-none" style={{ color: tone }}>
          {c.short}
        </motion.span>
      </motion.button>
    </motion.li>
  );
}

function ResidenceIndex({
  p,
  duplex,
  onJump,
}: {
  p: MotionValue<number>;
  duplex: MotionValue<number>;
  onJump: (i: number) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [natX, setNatX] = useState<number[]>(() => CAT_PANELS.map(() => 0));

  /* measure the row layout once it exists — the column is derived from it
     by pulling each entry back to x=0, and the un-measured default (0) is
     exactly the column, so the opening screen is right on first paint */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () =>
      setNatX(Array.from(el.children, (c) => (c as HTMLElement).offsetLeft));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* column on the right of the opening screen → bar along the foot of
     the collection, one element crossing the stage as the track starts */
  const morph = useTransform(p, [0.03, 0.088], [0, 1]);
  const top = useTransform(p, [0, 0.03, 0.088], ["27%", "27%", "84%"]);
  const left = useTransform(p, [0, 0.03, 0.088], ["54vw", "54vw", "3.2vw"]);
  /* the opening screen carries the index large — it is the second thing
     you read there. It settles back to its own size as it becomes the bar,
     where it has to sit quietly under four full panels of content */
  const scale = useTransform(morph, [0, 1], [1.55, 1]);
  const fade = useTransform(p, [0.86, 0.95], [1, 0]);
  const eyebrow = useTransform(duplex, [0, 1], ["rgba(33,26,23,0.42)", "rgba(255,248,239,0.45)"]);
  /* the label belongs to the column; the bar carries its own rhythm */
  const eyebrowOp = useTransform(morph, [0, 0.5], [1, 0]);

  return (
    <motion.nav
      aria-label="Residence categories"
      className="absolute z-40"
      style={{ top, left, opacity: fade, scale, transformOrigin: "left top" }}
    >
      {/* the index holds still — depth comes from the shadow alone */}
      <div style={{ filter: "drop-shadow(0 14px 22px rgba(90,40,22,0.12))" }}>
        <motion.p
          className="absolute -top-6 left-0 text-[0.52rem] font-semibold tracking-[0.3em] whitespace-nowrap uppercase"
          style={{ color: eyebrow, opacity: eyebrowOp }}
        >
          The collection
        </motion.p>
        <ul ref={listRef} className="flex items-center gap-9">
          {CAT_PANELS.map((c, i) => (
            <IndexRow
              key={c.num}
              c={c}
              i={i}
              p={p}
              duplex={duplex}
              morph={morph}
              natX={natX[i] ?? 0}
              onJump={onJump}
            />
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}

function ResidenceCategories({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const cp = useSpring(scrollYProgress, { stiffness: 100, damping: 28, mass: 0.4 });

  const trackX = useTransform(cp, [0.04, 0.6], ["0vw", "-300vw"]);
  const introOp = useTransform(cp, [0, 0.05, 0.09], [1, 1, 0]);
  /* the finale takes over: cream stage crossfades to deep bronze-charcoal */
  const duplexOp = useTransform(cp, [0.474, 0.541], [0, 1]);
  /* the next section's orange rises over the duplex itself as you scroll
     toward it — one slow radial wave from bottom-centre that reaches full
     cover exactly as the pin hands over, so the colour change and the
     move to the next section are the same gesture */
  const bloom = useTransform(cp, (v) => {
    const t = Math.min(Math.max((v - 0.8) / 0.2, 0), 1);
    const e = t * t * t * (t * (t * 6 - 15) + 10);
    return `circle(${(e * 168).toFixed(2)}% at 50% 100%)`;
  });
  /* the section's coral rises and fills the stage over the last stretch,
     so the pin releases into the same colour instead of cutting from
     near-black straight to red */
  const eyebrowOut = useTransform(cp, [0.86, 0.95], [1, 0]);
  /* the section's orange takes the stage over as one circle blooming from
     bottom-centre — eased long and soft (Apple's slow-out curve) so the
     colour arrives rather than switches */
  /* clicking an index entry lands the track on that panel's focal point */
  const jumpTo = (i: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + FOCALS[i] * span, behavior: "smooth" });
  };

  if (reduced) return <StackedCategories />;

  return (
    <div>
      {/* ------------- desktop: pinned horizontal showcase ------------ */}
      <div ref={wrapRef} className="relative hidden lg:block lg:h-[700svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[#F5EDE3]" />
          <div className="grain absolute inset-0" aria-hidden="true" />
          {/* duplex theme layer — black, held to the last pixel */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              opacity: duplexOp,
              background:
                "radial-gradient(70% 60% at 78% 88%, rgb(214 138 74 / 0.22) 0%, transparent 60%)," +
                "radial-gradient(55% 45% at 18% 12%, rgb(120 60 30 / 0.25) 0%, transparent 65%)," +
                "linear-gradient(165deg, #241410 0%, #241410 55%, #2A160E 100%)",
            }}
          />
          {/* the next section's colour, arriving as a radial wave */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              clipPath: bloom,
              background:
                "radial-gradient(150% 150% at 50% 100%, #BC6543 0%, #B85F3E 48%, #A8532F 100%)",
            }}
          />

          <motion.p
            className="absolute top-[6%] left-[8%] z-40 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "#94432F", opacity: eyebrowOut }}
          >
            03 — Residences · The Collection
          </motion.p>

          {/* the standing index — one element, travelling (see below) */}
          <ResidenceIndex p={cp} duplex={duplexOp} onJump={jumpTo} />

          <motion.div className="absolute top-0 left-0 h-full w-[500vw]" style={{ x: trackX }}>
            {/* ---- intro anchor ---- */}
            <motion.div
              className="absolute top-0 left-[6vw] flex h-full w-[38vw] flex-col justify-center"
              style={{ opacity: introOp }}
            >
              <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#94432F" }}>
                Three categories · One finale
              </p>
              <p
                className="font-display mt-6 leading-[1.05] font-medium"
                style={{ color: "#94432F", fontSize: "clamp(2.6rem,3.4vw,3.6rem)" }}
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
  const focal = FOCALS[index];
  const win = 0.076;
  /* the finale holds full strength to the release — the colour changes
     around it, the panel itself never dims */
  const op = useTransform(
    progress,
    index === 3
      ? [focal - win, focal - win * 0.55, 1.5, 1.6]
      : [focal - win, focal - win * 0.55, focal + win * 0.8, focal + win * 1.4],
    index === 3 ? [0, 1, 1, 1] : [0, 1, 1, 0.12]
  );
  const settle = useTransform(progress, [focal - win, focal], [0.985, 1]);
  const textY = useTransform(progress, [focal - win, focal], [12, 0]);
  const mediaY = useTransform(progress, [focal - win, focal + win], ["2.5svh", "-2.5svh"]);
  const textX = useTransform(progress, [focal - win, focal + win], ["0.6vw", "-0.4vw"]);
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
          <motion.div style={{ x: textX, y: textY }}>
            <p
              className="font-display mt-6 leading-[1.04] font-medium"
              style={{ color: "#FAF6F0", fontSize: "clamp(2.5rem,3.4vw,3.7rem)" }}
            >
              {c.heading}
            </p>
            <p className="font-display mt-4 text-[0.98rem] leading-snug italic" style={{ color: "#E8CFA4" }}>
              {c.lead}
            </p>
            <p className="font-display mt-7 leading-none font-semibold" style={{ color: "#C99355", fontSize: "4.2rem" }}>
              08
            </p>
            <p className="mt-1.5 max-w-[10rem] text-[0.56rem] font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(255,248,239,0.7)" }}>
              Exclusive Duplex Penthouses
            </p>
          </motion.div>

          {/* CENTRE — the penthouse collage */}
          <motion.div className="relative -mt-[3svh] h-[68svh]" style={{ scale: settle, y: mediaY }}>
            {/* main terrace */}
            <figure className="absolute top-0 left-0 h-[74%] w-[78%] overflow-hidden rounded-[14px] border border-[#C99355]/75 bg-[#140B07] p-1.5 shadow-[0_44px_88px_-36px_rgba(0,0,0,0.8)]">
              <div className="relative h-full w-full overflow-hidden rounded-[9px]">
                <Image src="/foakhduplexbalcony.jpg" alt="The duplex penthouse terrace opening to a double-height living room at golden hour" fill sizes="34vw" className="object-cover" style={{ objectPosition: "50% 42%" }} />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(200deg, transparent 45%, rgb(14 8 5 / 0.55) 100%)" }} />
                <span className="absolute bottom-4 left-5 text-[0.58rem] font-bold tracking-[0.28em] uppercase" style={{ color: "#E8CFA4" }}>
                  The grand finale
                </span>
              </div>
            </figure>
            {/* the private pool — "Private Pools" is the first thing this
                panel claims and the first cue printed over the hero, yet the
                collage showed a terrace, a gallery walk and a lounge. This is
                the quieter second pool render, kept clear of the communal
                pool the amenities use, so the finale stays exclusive. */}
            <figure className="absolute top-[8%] right-0 h-[38%] w-[34%] rotate-[1.6deg] overflow-hidden rounded-[12px] border border-[#C99355]/70 bg-[#140B07] p-1 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]">
              <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                <Image src="/duplex-pool.jpg" alt="The penthouse's own swimming pool, lit behind full-height glazing at dusk" fill sizes="16vw" className="object-cover" style={{ objectPosition: "50% 55%" }} />
              </div>
            </figure>
            {/* duplex lounge */}
            <figure className="absolute bottom-0 right-[10%] h-[36%] w-[42%] -rotate-[1.4deg] overflow-hidden rounded-[12px] border border-[#C99355]/70 bg-[#140B07] p-1 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]">
              <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                <Image src="/penthouse-lounge.jpg" alt="The penthouse lounge above the city, lit by its chandelier" fill sizes="20vw" className="object-cover" />
              </div>
            </figure>
          </motion.div>

          {/* RIGHT — reading column + the single enquiry CTA */}
          <motion.div style={{ x: textX2, y: textY }}>
            <p className="text-[0.88rem] leading-[1.6]" style={{ color: "rgba(255,248,239,0.9)" }}>
              {c.body}
            </p>
            <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: c.duplex ? "rgba(239,213,163,0.3)" : "rgba(216,179,106,0.45)" }}>
              {c.points.map((pt) => (
                <li key={pt.t}>
                  <p className="text-[0.78rem] font-semibold" style={{ color: "#E8CFA4" }}>
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
        <motion.div className="relative z-20" style={{ x: textX, y: textY }}>
          <p
            className="font-display mt-6 leading-[1.04] font-medium"
            style={{ color: "#94432F", fontSize: "clamp(2.2rem,2.9vw,3.1rem)" }}
          >
            {c.heading}
          </p>
          <p className="font-display mt-4 text-[0.98rem] leading-snug italic" style={{ color: "#6E8163" }}>
            {c.lead}
          </p>
          {dup && (
            <p className="font-display mt-6 leading-none font-semibold" style={{ color: "#C99355", fontSize: "3.6rem" }}>
              08
            </p>
          )}
        </motion.div>

        {/* CENTRE — the dominant framed media */}
        <motion.figure
          className={`relative overflow-hidden rounded-[14px] border bg-[#FAF6F0] p-1.5 ${
            dup
              ? "-mt-[2svh] h-[68svh] border-[#C99355]/80 shadow-[0_50px_100px_-40px_rgba(20,10,5,0.75)]"
              : "-mt-[4svh] h-[62svh] border-[#C99355]/55 shadow-[0_36px_70px_-38px_rgba(148,63,45,0.4)]"
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
                <span className="absolute bottom-5 left-6 text-[0.6rem] font-bold tracking-[0.3em] uppercase" style={{ color: "#E8CFA4" }}>
                  The grand finale
                </span>
                <span className="absolute right-6 bottom-5 flex gap-2">
                  {["Private Pools", "Signature Residences"].map((cue) => (
                    <span
                      key={cue}
                      className="rounded-full border border-[#E8CFA4]/50 bg-[#140B07]/45 px-3 py-1.5 text-[0.55rem] font-semibold tracking-[0.16em] uppercase backdrop-blur-[2px]"
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
        <motion.div style={{ x: textX2, y: textY }}>
          <p className="text-[0.88rem] leading-[1.6]" style={{ color: dup ? "#2B211D" : "rgba(33,26,23,0.78)" }}>
            {c.body}
          </p>
          <ul className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: c.duplex ? "rgba(239,213,163,0.3)" : "rgba(216,179,106,0.45)" }}>
            {c.points.map((pt) => (
              <li key={pt.t}>
                <p className="text-[0.78rem] font-semibold" style={{ color: "#94432F" }}>
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
/** mobile: the same index, compacted to a snapping strip above the stack */
function MobileIndex({ active, onJump }: { active: number; onJump: (i: number) => void }) {
  return (
    <div className="sticky top-[68px] z-30 -mx-6 mb-8 border-b bg-[#F5EDE3]/94 backdrop-blur-sm" style={{ borderColor: "rgba(148,63,45,0.12)" }}>
      <ul className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CAT_PANELS.map((c, i) => (
          <li key={c.num} className="snap-start">
            <button
              type="button"
              onClick={() => onJump(i)}
              className="flex flex-col items-start gap-1.5 whitespace-nowrap"
              aria-current={active === i ? "true" : undefined}
            >
              <span
                className="font-display text-[0.95rem] leading-none transition-colors duration-300"
                style={{ color: active === i ? "#94432F" : "rgba(33,26,23,0.4)" }}
              >
                {c.short}
              </span>
              <span
                className="block h-px transition-all duration-300 ease-out"
                style={{ width: active === i ? "100%" : "0%", background: "#B65438" }}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackedCategories({ embedded = false }: { embedded?: boolean }) {
  const items = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  /* the capsule only exists while the finale is on screen */
  const [duplexNear, setDuplexNear] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const el = items.current[CAT_PANELS.length - 1];
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDuplexNear(e.isIntersecting), {
      rootMargin: "-10% 0px -20% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* the finale takes the whole screen with it: a fixed layer crossfades the
     entire environment to espresso as the duplex arrives and releases it
     again on the way out, so the change reads as the room darkening rather
     than one card changing colour */
  const duplexRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: dp } = useScroll({
    target: duplexRef,
    offset: ["start end", "end start"],
  });
  const duskOpacity = useTransform(dp, [0, 0.28, 0.72, 1], [0, 1, 1, 0]);

  /* the strip follows whichever residence is holding the screen */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!seen) return;
        const i = items.current.indexOf(seen.target as HTMLElement);
        if (i >= 0) setActive(i);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -35% 0px" }
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (i: number) =>
    items.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  const body = (
    <div className="relative mx-auto max-w-2xl px-6 py-20">
      <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#94432F" }}>
        03 — Residences · The Collection
      </p>
      <p
        className="font-display mt-5 leading-[1.08] font-medium"
        style={{ color: "#94432F", fontSize: "clamp(2.2rem,7vw,3rem)" }}
      >
        One exceptional address. Three distinctive categories.
      </p>
      <MobileIndex active={active} onJump={jump} />
      <div className="space-y-16">
        {CAT_PANELS.map((c, i) => (
          <motion.article
            key={c.num}
            ref={(el) => {
              items.current[i] = el;
              if (c.duplex) duplexRef.current = el;
            }}
            aria-label={`${c.num} — ${c.label}`}
            className={`relative z-10 scroll-mt-[124px] ${c.duplex ? "pt-6 pb-10" : ""}`}
            {...(reduced
              ? {}
              : {
                  /* the editorial diagonal, kept small enough to stay stable */
                  initial: { opacity: 0, x: i % 2 === 0 ? -18 : 18, y: 24, scale: 0.985 },
                  whileInView: { opacity: 1, x: 0, y: 0, scale: 1 },
                  viewport: { once: true, amount: 0.18 },
                  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
                })}
          >
            <div className={`relative mt-4 aspect-[4/3] overflow-hidden rounded-[12px] border p-1 ${c.duplex ? "border-[#C99355]/75 bg-[#140B07]" : "border-[#C99355]/55 bg-[#FAF6F0]"}`}>
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
              style={{ color: c.duplex ? "#FAF6F0" : "#94432F", fontSize: "clamp(1.7rem,5.4vw,2.3rem)" }}
            >
              {c.heading}
            </p>
            <p className="font-display mt-2 text-[0.95rem] italic" style={{ color: c.duplex ? "#E8CFA4" : "#6E8163" }}>
              {c.lead}
            </p>
            <p className="mt-3 text-[0.9rem] leading-[1.6]" style={{ color: c.duplex ? "rgba(250,246,240,0.86)" : "rgba(33,26,23,0.75)" }}>
              {c.body}
            </p>
            <ul className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: c.duplex ? "rgba(239,213,163,0.3)" : "rgba(216,179,106,0.45)" }}>
              {c.points.map((pt) => (
                <li key={pt.t}>
                  <p className="text-[0.8rem] font-semibold" style={{ color: c.duplex ? "#EFD5A3" : "#94432F" }}>
                    {pt.t}
                  </p>
                  <p className="text-[0.76rem] leading-[1.55]" style={{ color: c.duplex ? "rgba(250,246,240,0.7)" : "rgba(33,26,23,0.65)" }}>
                    {pt.d}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.6rem] tracking-[0.14em] uppercase" style={{ color: c.duplex ? "rgba(239,213,163,0.72)" : "rgba(33,26,23,0.5)" }}>
              {c.note}
            </p>
          </motion.article>
        ))}
      </div>

      {/* the environment itself, dissolving to espresso for the finale */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] lg:hidden"
        style={{
          opacity: duskOpacity,
          background:
            "radial-gradient(70% 45% at 78% 10%, rgb(214 138 74 / 0.14) 0%, transparent 62%)," +
            "linear-gradient(168deg, #2A160E 0%, #241410 58%, #180D08 100%)",
        }}
      />

      <AnimatePresence>
        {duplexNear && !sheetOpen && <PenthouseCapsule onOpen={() => setSheetOpen(true)} />}
      </AnimatePresence>
      <PenthouseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );

  if (embedded) return <div className="bg-[#F5EDE3]">{body}</div>;
  return <div className="bg-[#F5EDE3]">{body}</div>;
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

/* ------------------------------------------------------- duplex, mobile --
   The penthouse form sits at the very bottom of the duplex story, which on a
   phone means scrolling the whole finale to reach it. A capsule follows the
   duplex panel instead and opens the same form as a bottom sheet.           */

function PenthouseCapsule({ onOpen }: { onOpen: () => void }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-4 bottom-5 z-40 flex min-h-[46px] items-center gap-2 rounded-full px-5 py-3 lg:hidden"
      style={{
        background: "linear-gradient(140deg, #2A160E 0%, #3A1F13 100%)",
        border: "1px solid rgba(232,207,164,0.45)",
        boxShadow: "0 16px 34px -16px rgba(20,10,6,0.75)",
      }}
    >
      {/* a slow breath, not a bounce */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(232,207,164,0.5)" }}
        animate={reduced ? undefined : { opacity: [0.5, 0, 0.5], scale: [1, 1.13, 1] }}
        transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative text-[0.72rem] font-bold tracking-[0.12em] uppercase" style={{ color: "#EFD5A3" }}>
        Penthouse Enquiry
      </span>
      <span aria-hidden="true" className="relative text-[0.8rem]" style={{ color: "#EFD5A3" }}>
        ↗
      </span>
    </motion.button>
  );
}

function PenthouseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  /* the page must not scroll behind an open sheet */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Penthouse enquiry">
          <motion.button
            type="button"
            aria-label="Close enquiry"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-[#140B07]/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[22px] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{ background: "linear-gradient(180deg, #2A160E 0%, #241410 100%)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#EFD5A3]/30" aria-hidden="true" />
            <div className="mb-3 flex items-start justify-between gap-4">
              <p className="pt-1 text-[0.55rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C99355" }}>
                04 — Duplex Penthouses
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enquiry"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#EFD5A3]/35 text-[#EFD5A3]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <PenthouseEnquiry />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PenthouseEnquiry({ className = "" }: { className?: string }) {
  return (
    <form
      aria-label="Enquire about the duplex penthouses"
      onSubmit={(e) => e.preventDefault()}
      className={`rounded-[14px] border border-[#C99355]/50 bg-[#FAF6F0] p-4 shadow-[0_20px_44px_-26px_rgba(0,0,0,0.6)] ${className}`}
    >
      <p className="text-[0.55rem] font-bold tracking-[0.24em] uppercase" style={{ color: "#C99355" }}>
        Penthouse enquiry
      </p>
      <p className="font-display mt-1 text-[1.05rem] leading-snug font-medium" style={{ color: "#94432F" }}>
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
              className="w-full rounded-md border border-[#C99355]/45 bg-[#FAF6F0] px-3 py-2 text-[0.8rem] text-[#2B211D] transition-colors outline-none placeholder:text-[#2B211D]/40 focus:border-[#C99355]"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled
        aria-disabled="true"
        title="Penthouse enquiries activate once the sales inbox is confirmed"
        className="mt-3 w-full cursor-not-allowed rounded-full bg-[#C99355]/45 px-4 py-2.5 text-[0.78rem] font-bold text-[#241410]"
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
          className="absolute inset-0 bg-[#2B211D]"
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
          style={{ color: "#E8CFA4" }}
        >
          {q.num} — {q.title}
        </p>
        <p
          className="font-display mt-4 leading-[1.05]"
          style={{
            color: "#FAF6F0",
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

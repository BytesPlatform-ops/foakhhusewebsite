"use client";

import { useRef, useState } from "react";
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
    kind: "film",
    src: "/hero.mp4",
    alt: "Film of the Wind Corridor Residences and its surroundings",
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
      copy: "Generously planned living, dining and bedroom areas.",
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
      copy: "Practical layouts designed around daily family routines.",
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
      copy: "Contemporary finishes and refined interior details.",
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
      copy: "Planning that supports light, airflow and year-round usability.",
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
      copy: "Personal outdoor space for relaxation and views.",
    },
    accent: "213 155 84",
    objectPosition: "50% 55%",
  },
  {
    kind: "image",
    src: "/buildingfront.jpg",
    alt: "The two distinguished blocks of the limited community at dusk",
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
      title: "Limited Community",
      copy: "Only 84 residences across two distinguished blocks.",
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
            "radial-gradient(85% 60% at 74% 20%, rgb(232 121 87 / 0.5) 0%, transparent 58%)," +
            "radial-gradient(62% 46% at 50% 52%, rgb(216 179 106 / 0.32) 0%, transparent 70%)," +
            "radial-gradient(55% 45% at 82% 55%, rgb(255 244 229 / 0.14) 0%, transparent 72%)," +
            "radial-gradient(70% 50% at 14% 84%, rgb(101 155 152 / 0.16) 0%, transparent 60%)," +
            "linear-gradient(172deg, #A8492E 0%, #C75B3B 34%, #B34F31 62%, #8A3B26 100%)",
        } as React.CSSProperties
      }
    >
      {/* ==================== 03A — LIFESTYLE & AMENITIES ============== */}
      <AmenitiesShowcase />

      {/* ---- Apartments & Interiors — intro copy before the deck ----- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-16 lg:pb-20">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#F0B269" }}>
          Apartments &amp; Interiors
        </p>
        <p
          className="font-display mt-4 max-w-[26ch] leading-[1.15]"
          style={{ color: IVORY, fontSize: "clamp(1.9rem,2.6vw,2.8rem)", fontWeight: 500 }}
        >
          Spacious, functional and elegant apartments planned around the needs of modern
          families.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-10">
          <p className="max-w-[62ch] text-[1rem] leading-[1.75]" style={{ color: "rgba(250,243,232,0.88)" }}>
            Every apartment is designed to balance comfort, practicality and visual
            refinement. Generous living spaces, functional kitchens, comfortable bedrooms,
            private balconies and carefully selected finishes create a welcoming home
            environment.
          </p>
          <p className="max-w-[62ch] text-[0.92rem] leading-[1.7]" style={{ color: "rgba(250,243,232,0.72)" }}>
            The wind-catcher system primarily supports the corridor and shared-area
            ventilation network. Apartment comfort is further supported through thoughtful
            planning, practical layouts and controlled natural ventilation according to the
            final architectural and mechanical design.
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
                  84 residences.
                  <br />
                  Two blocks.
                </p>
                <a
                  href="#enquire"
                  className="mt-auto inline-block w-fit rounded-full bg-[#C6A46B] px-4 py-2 text-[0.7rem] font-semibold text-[#1D1714] transition-colors hover:bg-[#D6B87E]"
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
        <div className="relative mx-auto mt-10 w-full max-w-sm overflow-hidden rounded-xl shadow-[0_40px_80px_-40px_rgba(26,16,11,0.7)]">
          <FilmMedia reduced={!!reduced} />
        </div>
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
              <p className="mt-5 text-[0.68rem] font-semibold tracking-[0.24em] uppercase tabular-nums" style={{ color: "#F0B269" }}>
                {d.quality!.num} — {d.quality!.title}
              </p>
              <p className="font-display mt-2 leading-[1.08]" style={{ color: "#F2E7D8", fontSize: "1.7rem", fontWeight: 500 }}>
                {d.quality!.title}
              </p>
              <p className="mt-3 text-[1rem] leading-[1.65]" style={{ color: "rgba(250,243,232,0.9)" }}>
                {d.quality!.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------- compliance note -------- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-12 pb-10 lg:pt-0 lg:pb-12">
        <p className="text-[0.62rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(247,240,232,0.55)" }}>
          Imagery shown conceptually — final finishes subject to approved specifications
        </p>
      </div>
    </section>
  );
}

/* ============================================================ deck == */

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
        {spec.kind === "film" ? (
          <FilmMedia reduced={reduced} fill />
        ) : (
          <Image
            src={spec.src}
            alt={spec.alt}
            fill
            sizes="30vw"
            className="object-cover"
            style={{ objectPosition: spec.objectPosition }}
          />
        )}
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
          style={{ color: "#F0B269" }}
        >
          {q.num} — {q.title}
        </p>
        <p
          className="font-display mt-4 leading-[1.05]"
          style={{
            color: "#F2E7D8",
            fontSize: "clamp(2.4rem,4vw,4.4rem)",
            fontWeight: 500,
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

/* ------------------------------------------------------------- media -- */

function FilmMedia({ reduced, fill = false }: { reduced: boolean; fill?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  if (reduced) {
    return (
      <div className={fill ? "absolute inset-0" : "relative aspect-[3/4.2] w-full"}>
        <Image
          src="/hero-poster.jpg"
          alt="Evening view of the Wind Corridor Residences"
          fill
          sizes="(min-width:1024px) 25vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${fill ? "absolute inset-0" : "relative aspect-[3/4.2] w-full"} bg-[#1D1714]`}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Film of the Wind Corridor Residences and its surroundings"
      />
      <button
        type="button"
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          if (v.paused) {
            v.play().catch(() => undefined);
            setPaused(false);
          } else {
            v.pause();
            setPaused(true);
          }
        }}
        aria-label={paused ? "Play film" : "Pause film"}
        className="absolute bottom-3.5 left-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F0E8] text-[#1D1714] transition-transform hover:scale-105"
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5v9l8-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}

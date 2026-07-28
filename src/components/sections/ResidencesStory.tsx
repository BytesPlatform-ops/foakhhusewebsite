"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 03 — The Residences: the statement stage with a rising card deck.
 *
 * Structure follows the supplied agency reference (translated to our
 * clay/ivory identity): one flat saturated ground and a giant serif
 * headline split into two halves flanking centre stage. Over the pinned
 * scroll a deck of media cards rises from the bottom edge one after
 * another — the film first, then image cards — each travelling up to
 * centre and settling OVER the previous one with a different width,
 * aspect and corner radius, so the boundary of the centre frame keeps
 * changing. While the cards travel up, the headline drifts gently the
 * opposite way. Covered cards scale back and dim a breath, giving the
 * stack depth. A small featured card takes the lower-right corner as
 * the deck completes.
 *
 * The four residence qualities follow as a quiet four-column strip.
 *
 * Native scroll pin, spring-driven progress (ScrollTimeline stale-range
 * guard), transform/opacity only. Reduced motion renders the settled
 * frame with the poster still and no autoplaying video.
 */

const IVORY = "#F7F0E8";
const INK = "#1D1714";

interface DeckSpec {
  kind: "film" | "image";
  src: string;
  alt: string;
  label: string;
  /** progress window over which the card rises to centre */
  rise: [number, number];
  /** progress window over which the NEXT card covers this one (dim/retreat) */
  cover: [number, number] | null;
  fromY: string;
  width: string;
  aspect: string;
  radius: string;
  rotate: number;
  chipSide: "left" | "right";
  z: number;
  objectPosition?: string;
}

const DECK: DeckSpec[] = [
  {
    kind: "film",
    src: "/hero.mp4",
    alt: "Film of the Wind Corridor Residences and its surroundings",
    label: "The corridor film",
    rise: [0.02, 0.26],
    cover: [0.3, 0.48],
    fromY: "62svh",
    width: "clamp(280px,20vw,350px)",
    aspect: "3 / 4.2",
    radius: "12px",
    rotate: 0,
    chipSide: "right",
    z: 20,
  },
  {
    kind: "image",
    src: "/route-corridor.jpg",
    alt: "Warm interior corridor with soft linear light",
    label: "01 — Living spaces",
    rise: [0.3, 0.48],
    cover: [0.52, 0.7],
    fromY: "118svh",
    width: "clamp(320px,24vw,420px)",
    aspect: "4 / 5",
    radius: "22px",
    rotate: -2,
    chipSide: "left",
    z: 21,
    objectPosition: "50% 42%",
  },
  {
    kind: "image",
    src: "/env-air.jpg",
    alt: "Sunlit terracotta opening with fabric moving in the airflow",
    label: "02 — Private balconies",
    rise: [0.52, 0.7],
    cover: [0.74, 0.92],
    fromY: "118svh",
    width: "clamp(360px,28vw,500px)",
    aspect: "4 / 3",
    radius: "8px",
    rotate: 2.2,
    chipSide: "right",
    z: 22,
    objectPosition: "60% 40%",
  },
  {
    kind: "image",
    src: "/building-approach.jpg",
    alt: "The residence facade at dusk, windows warm against the evening",
    label: "03 — Natural light",
    rise: [0.74, 0.92],
    cover: null,
    fromY: "118svh",
    width: "clamp(300px,22vw,390px)",
    aspect: "1 / 1",
    radius: "26px",
    rotate: -1.4,
    chipSide: "left",
    z: 23,
    objectPosition: "50% 30%",
  },
];

const QUALITIES = [
  {
    num: "01",
    title: "Living Spaces",
    copy: "Generous, well-proportioned rooms where daylight crosses the floor — designed to hold real family life.",
  },
  {
    num: "02",
    title: "Private Balconies",
    copy: "Residences open outward with quieter outdoor moments, private views and a stronger sense of personal space.",
  },
  {
    num: "03",
    title: "Natural Light",
    copy: "Thoughtful orientation helps sunlight move through the home, supporting warmth, calm and everyday comfort.",
  },
  {
    num: "04",
    title: "Everyday Comfort",
    copy: "Layouts shaped for practical living — not just visual appeal — with space that feels flexible, usable and refined.",
  },
];

export default function ResidencesStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  /* the two headline halves cross in from the edges, then drift apart
     slightly — the opposite way to the rising cards */
  const leftX = useTransform(p, [0, 0.26, 1], ["-16vw", "0vw", "-1.8vw"]);
  const rightX = useTransform(p, [0, 0.26, 1], ["16vw", "0vw", "1.8vw"]);
  /* rise to centre with the first card, then sink against the deck */
  const textY = useTransform(p, [0, 0.26, 0.34, 0.95], ["15svh", "0svh", "0svh", "7svh"]);
  const textOpacity = useTransform(p, [0, 0.16], [0.4, 1]);

  /* the featured corner card arrives as the deck completes */
  const cardOpacity = useTransform(p, [0.86, 0.97], [0, 1]);
  const cardY = useTransform(p, [0.86, 0.97], [28, 0]);

  return (
    <section
      id="residences"
      ref={sectionRef}
      data-section="residences"
      aria-labelledby="residences-heading"
      className="mineral-clay grain blend-top relative"
      style={{ "--blend-from": "#202522" } as React.CSSProperties}
    >
      {/* ------------------------------------------------ pinned stage -- */}
      <div className="relative hidden lg:block lg:h-[340svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* eyebrow — quiet, upper-left, always present */}
          <p
            className="absolute top-[7%] left-[6%] z-30 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "rgba(247,240,232,0.75)" }}
          >
            03 — The Residences
          </p>

          {/* the split headline — BEHIND the deck */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 z-10"
            style={reduced ? undefined : { y: textY, opacity: textOpacity }}
          >
            <motion.p
              className="font-display absolute left-[3.5%] whitespace-nowrap uppercase"
              style={{
                color: IVORY,
                fontSize: "clamp(2.9rem,4.9vw,5.6rem)",
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
                color: "rgba(247,240,232,0.62)",
                fontSize: "clamp(2.9rem,4.9vw,5.6rem)",
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

          {/* accessible heading for the split display text */}
          <h2 id="residences-heading" className="sr-only">
            Homes made for real life.
          </h2>

          {/* the rising deck — each card travels up and covers the last */}
          {(reduced ? DECK.slice(0, 1) : DECK).map((spec) => (
            <DeckCard key={spec.label} spec={spec} p={p} reduced={!!reduced} />
          ))}

          {/* featured corner card — the reference's "case of the month" */}
          <motion.aside
            className="absolute right-[4%] bottom-[6%] z-30 w-[19.5rem] overflow-hidden rounded-2xl bg-[#294338] p-3 shadow-[0_34px_70px_-30px_rgba(20,26,22,0.8)]"
            style={reduced ? undefined : { opacity: cardOpacity, y: cardY }}
          >
            <div className="flex gap-3">
              <div className="relative w-[7.5rem] shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/route-comfort.jpg"
                  alt="Residents in the warm sheltered court"
                  fill
                  sizes="120px"
                  className="object-cover"
                  style={{ objectPosition: "50% 38%" }}
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
      <div className="px-(--spacing-gutter) pt-24 pb-4 lg:hidden">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "rgba(247,240,232,0.75)" }}>
          03 — The Residences
        </p>
        <p
          className="font-display mt-5 uppercase"
          style={{ color: IVORY, fontSize: "clamp(2.3rem,9.5vw,3.6rem)", lineHeight: 1.02, fontWeight: 600 }}
          aria-hidden="true"
        >
          Homes made
          <br />
          <span style={{ color: "rgba(247,240,232,0.62)" }}>for real life.</span>
        </p>
        <div className="relative mx-auto mt-10 w-full max-w-sm overflow-hidden rounded-xl shadow-[0_40px_80px_-40px_rgba(26,16,11,0.7)]">
          <FilmMedia reduced={!!reduced} />
        </div>
        {/* the deck's image cards, stacked simply */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {DECK.filter((d) => d.kind === "image").map((d) => (
            <figure
              key={d.label}
              className="relative aspect-square overflow-hidden rounded-lg first:col-span-2 first:aspect-[16/10]"
            >
              <Image
                src={d.src}
                alt={d.alt}
                fill
                sizes="(min-width:640px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: d.objectPosition }}
              />
              <figcaption className="absolute bottom-2 left-2 rounded-full bg-[#F7F0E8]/92 px-3 py-1 text-[0.55rem] font-semibold tracking-[0.18em] uppercase" style={{ color: INK }}>
                {d.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* ------------------------------------------- qualities strip ---- */}
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-6 pb-(--spacing-section) lg:pt-0">
        <div className="grid gap-x-8 gap-y-9 border-t pt-12 sm:grid-cols-2 lg:-mt-2 lg:grid-cols-4" style={{ borderColor: "rgba(247,240,232,0.22)" }}>
          {QUALITIES.map((q, i) => (
            <motion.div
              key={q.num}
              initial={reduced ? undefined : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[0.68rem] font-semibold tabular-nums" style={{ color: "rgba(247,240,232,0.65)" }}>
                {q.num}
              </p>
              <p className="font-display mt-2 text-[1.15rem] font-medium" style={{ color: IVORY }}>
                {q.title}
              </p>
              <p className="mt-2 text-[0.8rem] leading-[1.65]" style={{ color: "rgba(247,240,232,0.72)" }}>
                {q.copy}
              </p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-[0.62rem] leading-relaxed tracking-[0.14em] uppercase" style={{ color: "rgba(247,240,232,0.55)" }}>
          Imagery shown conceptually — final finishes subject to approved specifications
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- deck -- */

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

  /* rise from below the fold to centre; eased by the shared spring */
  const y = useTransform(p, [s, e], [spec.fromY, "0svh"]);
  /* arrive a touch small, settle, then retreat a breath when covered */
  const scale = useTransform(
    p,
    cover ? [s, e, cover[0], cover[1]] : [s, e],
    cover ? [0.97, 1, 1, 0.955] : [0.97, 1]
  );
  const rotate = useTransform(p, [s, e], [spec.rotate * 2.2, spec.rotate]);
  /* covered cards dim so the incoming boundary reads clearly */
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
        {/* warm grade */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(178deg, rgb(198 164 107 / 0.06) 0%, transparent 30%, rgb(29 23 20 / 0.2) 100%)",
          }}
        />
        {/* cover dim */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-[#1D1714]"
          style={{ opacity: reduced ? 0 : dim }}
        />
        {/* label chip — alternating sides, the "text other side" beat */}
        <figcaption
          className={`absolute bottom-3.5 rounded-full bg-[#F7F0E8]/92 px-3.5 py-1.5 text-[0.55rem] font-semibold tracking-[0.18em] uppercase backdrop-blur-sm ${
            spec.chipSide === "left" ? "left-3.5" : "right-3.5"
          }`}
          style={{ color: INK }}
        >
          {spec.label}
        </figcaption>
      </motion.figure>
    </div>
  );
}

/* ------------------------------------------------------------- media -- */

/**
 * The film: cropped portrait, with the reference's pause control (WCAG
 * pausable motion). Reduced motion — and any playback failure — hold
 * the poster still.
 */
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

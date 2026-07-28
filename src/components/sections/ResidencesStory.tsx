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
 * One flat clay ground. The split serif headline flanks centre stage
 * while the film card rises from the bottom edge; then four image
 * cards follow it up one per scroll beat, each settling OVER the
 * previous with a different width, aspect and corner radius — the
 * centre boundary keeps changing. As the quality beats begin the big
 * headline recedes to a faint backdrop, and each card brings its own
 * reading pair: number + title arriving from the LEFT gutter, the
 * copy paragraph from the RIGHT — swapped out as the next card covers.
 * Covered cards scale back and dim so the stack reads with depth. The
 * featured corner card lands last.
 *
 * Native scroll pin, spring-driven progress (ScrollTimeline stale-range
 * guard), transform/opacity only. Reduced motion renders a settled
 * frame; mobile stacks card + text pairs.
 */

const IVORY = "#F7F0E8";
const INK = "#1D1714";

interface Quality {
  num: string;
  title: string;
  copy: string;
}

interface DeckSpec {
  kind: "film" | "image";
  src: string;
  alt: string;
  /** progress window over which the card rises to centre */
  rise: [number, number];
  /** progress window over which the NEXT card covers this one */
  cover: [number, number] | null;
  fromY: string;
  width: string;
  aspect: string;
  radius: string;
  rotate: number;
  z: number;
  quality: Quality | null;
  /** ambient stage glow while this card holds centre */
  accent: string;
  objectPosition?: string;
}

const DECK: DeckSpec[] = [
  {
    kind: "film",
    src: "/hero.mp4",
    alt: "Film of the Wind Corridor Residences and its surroundings",
    rise: [0.02, 0.18],
    cover: [0.22, 0.34],
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
    src: "/route-corridor.jpg",
    alt: "Warm interior corridor with soft linear light",
    rise: [0.22, 0.34],
    cover: [0.4, 0.52],
    fromY: "118svh",
    width: "clamp(320px,24vw,420px)",
    aspect: "4 / 5",
    radius: "22px",
    rotate: -2,
    z: 21,
    quality: {
      num: "01",
      title: "Living Spaces",
      copy: "Generous, well-proportioned rooms where daylight crosses the floor — designed to hold real family life.",
    },
    accent: "213 155 84",
    objectPosition: "50% 42%",
  },
  {
    kind: "image",
    src: "/env-air.jpg",
    alt: "Sunlit terracotta opening with fabric moving in the airflow",
    rise: [0.4, 0.52],
    cover: [0.58, 0.7],
    fromY: "118svh",
    width: "clamp(360px,28vw,500px)",
    aspect: "4 / 3",
    radius: "8px",
    rotate: 2.2,
    z: 22,
    quality: {
      num: "02",
      title: "Private Balconies",
      copy: "Residences open outward with quieter outdoor moments, private views and a stronger sense of personal space.",
    },
    accent: "135 147 131",
    objectPosition: "60% 40%",
  },
  {
    kind: "image",
    src: "/building-approach.jpg",
    alt: "The residence facade at dusk, windows warm against the evening",
    rise: [0.58, 0.7],
    cover: [0.76, 0.88],
    fromY: "118svh",
    width: "clamp(300px,22vw,390px)",
    aspect: "1 / 1",
    radius: "26px",
    rotate: -1.4,
    z: 23,
    quality: {
      num: "03",
      title: "Natural Light",
      copy: "Thoughtful orientation helps sunlight move through the home, supporting warmth, calm and everyday comfort.",
    },
    accent: "111 155 152",
    objectPosition: "50% 30%",
  },
  {
    kind: "image",
    src: "/route-comfort.jpg",
    alt: "Residents greeting in the warm sheltered court",
    rise: [0.76, 0.88],
    cover: null,
    fromY: "118svh",
    width: "clamp(340px,26vw,460px)",
    aspect: "5 / 4",
    radius: "16px",
    rotate: 1.6,
    z: 24,
    quality: {
      num: "04",
      title: "Everyday Comfort",
      copy: "Layouts shaped for practical living — not just visual appeal — with space that feels flexible, usable and refined.",
    },
    accent: "213 155 84",
    objectPosition: "50% 38%",
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

  /* the two headline halves cross in from the edges, then recede to a
     faint backdrop once the quality beats begin */
  const leftX = useTransform(p, [0, 0.18, 1], ["-16vw", "0vw", "-1.8vw"]);
  const rightX = useTransform(p, [0, 0.18, 1], ["16vw", "0vw", "1.8vw"]);
  const textY = useTransform(p, [0, 0.18, 0.26, 0.95], ["15svh", "0svh", "0svh", "7svh"]);
  const textOpacity = useTransform(p, [0, 0.12, 0.24, 0.36], [0.4, 1, 1, 0.11]);

  /* the featured corner card arrives as the deck completes */
  const cardOpacity = useTransform(p, [0.88, 0.97], [0, 1]);
  const cardY = useTransform(p, [0.88, 0.97], [28, 0]);

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
      {/* ------------------------------------------------ pinned stage -- */}
      <div className="relative hidden lg:block lg:h-[420svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* eyebrow — quiet, upper-left, always present */}
          <p
            className="absolute top-[7%] left-[6%] z-30 text-[0.65rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "#943F2D" }}
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

          {/* per-beat ambient glow — the stage light shifts with each card */}
          {!reduced &&
            DECK.map((spec) => <AccentGlow key={`glow-${spec.src}`} spec={spec} p={p} />)}

          {/* the rising deck — each card travels up and covers the last */}
          {(reduced ? DECK.slice(0, 1) : DECK).map((spec) => (
            <DeckCard key={spec.src} spec={spec} p={p} reduced={!!reduced} />
          ))}

          {/* per-card reading pair: heading left gutter, copy right gutter */}
          {!reduced &&
            DECK.filter((d) => d.quality).map((spec) => (
              <QualityAside key={spec.quality!.num} spec={spec} p={p} />
            ))}

          {/* featured corner card — the reference's "case of the month" */}
          <motion.aside
            className="absolute right-[4%] bottom-[6%] z-40 w-[19.5rem] overflow-hidden rounded-2xl bg-[#294338] p-3 shadow-[0_34px_70px_-30px_rgba(20,26,22,0.8)]"
            style={reduced ? undefined : { opacity: cardOpacity, y: cardY }}
          >
            <div className="flex gap-3">
              <div className="relative w-[7.5rem] shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/env-solar.jpg"
                  alt="Solar panels catching the late sun on the roof terrace"
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
      <div className="px-(--spacing-gutter) pt-24 lg:hidden">
        <p className="text-[0.65rem] font-medium tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
          03 — The Residences
        </p>
        <p
          className="font-display mt-5 uppercase"
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

/* -------------------------------------------------------------- deck -- */

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
      </motion.figure>
    </div>
  );
}

/* --------------------------------------------------- reading pair ----- */

/**
 * Each card's quality: number + title from the left gutter, copy from
 * the right — in as the card settles, out as the next card covers it.
 */
function QualityAside({ spec, p }: { spec: DeckSpec; p: MotionValue<number> }) {
  const q = spec.quality!;
  const [s, e] = spec.rise;
  const cover = spec.cover;
  const mid = (s + e) / 2;

  const opacity = useTransform(
    p,
    cover ? [mid, e, cover[0], cover[0] + 0.07] : [mid, e],
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
            fontSize: "clamp(2.6rem,4.5vw,4.9rem)",
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

/**
 * The film: cropped portrait, with the pause control (WCAG pausable
 * motion). Reduced motion — and any playback failure — hold the poster.
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

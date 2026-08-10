"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 01 — Project Vision: THE LIVING FAÇADE.
 *
 * A 3D close-up of ONE FOAKH building façade — the approved
 * single-building render (buildingtop: real balcony depth, exact
 * terracotta, the actual window rhythm), mounted on a CSS-perspective
 * wall plane. The plane leans away from the viewer (static rotateY,
 * a whisper of scroll-linked rotateX drift) so the surface reads as a
 * real vertical structure you are standing close to — not a flat
 * pasted image, and no WebGL.
 *
 * A ~280svh section pins a 100svh stage; scroll translates the wall
 * upward along its plane, reading as a camera descending the façade.
 * Selected windows warm on softly and irregularly (screen-blended
 * glows anchored in façade percentages, so they inherit the 3D
 * transform), and two whisper-thin airflow lines appear briefly near
 * the balconies. Editorial content holds the upper-left exactly as
 * before: label, heading, support line, scroll cue. A single quiet
 * caption + CTA close the descent.
 *
 * One composited 3D transform + opacity children — 60fps, lightweight.
 * Reduced motion renders the settled framed façade.
 */

const ASPECT = 1238 / 2200;
const IVORY = "#FFF8EF";

/* interior light reaching the balcony glass — strips along the glass
   bands of the façade, warming on in irregular order */
const LIGHTS: { x: number; y: number; at: number }[] = [
  { x: 12, y: 63.2, at: 0.16 },
  { x: 30, y: 63.8, at: 0.24 },
  { x: 47, y: 63.4, at: 0.32 },
  { x: 20, y: 73.6, at: 0.4 },
  { x: 39, y: 74.1, at: 0.48 },
  { x: 55, y: 73.7, at: 0.56 },
  { x: 83, y: 63.0, at: 0.62 },
];

export default function DesignedAroundNature() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.35 });

  /* measured descent range — MotionValues, no state. The journey
     starts below the sky band (facade in frame from the first pixel)
     and overshoots both edges so the leaned plane never exposes them. */
  const yStart = useMotionValue(0);
  const yEnd = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const el = layerRef.current;
      if (!el) return;
      const layerH = el.offsetWidth * ASPECT;
      const vh = window.innerHeight;
      yStart.set(-(0.17 * layerH));
      yEnd.set(Math.min(0, vh - layerH + 90));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [yStart, yEnd]);

  /* the descent along the wall plane */
  const y = useTransform([p, yStart, yEnd] as const, ([v, a0, a1]) => {
    const a = Math.min(Math.max(((v as number) - 0.04) / 0.78, 0), 1);
    const e = a * a * (3 - 2 * a); // smoothstep
    return (a0 as number) + e * ((a1 as number) - (a0 as number));
  });
  /* camera tilt drifts as you descend — the 3D read, kept subtle */
  const rotateX = useTransform(p, [0, 0.9], [2, -2]);

  /* editorial beats */
  const headOp = useTransform(p, [0, 0.18, 0.3], [1, 1, 0]);
  const headY = useTransform(p, [0.18, 0.3], [0, -18]);
  const s1Op = useTransform(p, [0.32, 0.38, 0.54, 0.6], [0, 1, 1, 0]);
  const s2Op = useTransform(p, [0.58, 0.64, 0.76, 0.81], [0, 1, 1, 0]);
  const endOp = useTransform(p, [0.87, 0.95], [0, 1]);
  const endY = useTransform(p, [0.87, 0.95], [16, 0]);

  if (reduced) return <StaticVision />;

  return (
    <section
      id="nature"
      ref={sectionRef}
      data-section="nature"
      aria-labelledby="nature-heading"
      className="relative h-[240svh] lg:h-[280svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#241B22]">
        {/* blue-hour ground behind the plane's leaned edges */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #2A2436 0%, #4A3336 46%, #6B4234 78%, #2E1E18 100%)",
          }}
        />

        {/* ---------------- the 3D wall plane ------------------------- */}
        <div className="absolute inset-0" style={{ perspective: "1250px", perspectiveOrigin: "50% 45%" }}>
          <motion.div
            ref={layerRef}
            className="absolute top-0 left-1/2 w-[560vw] overflow-hidden will-change-transform lg:w-[250vw]"
            style={{
              x: "-50%",
              y,
              rotateX,
              rotateY: -9,
              transformOrigin: "50% 50%",
              aspectRatio: "2200 / 1238",
              boxShadow: "0 80px 140px -60px rgba(20,12,10,0.7)",
            }}
          >
            <Image
              src="/buildingtop.jpg"
              alt="Close view down the terracotta façade of a Wind Corridor block — balconies, window bays and the rooftop systems above"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
            />

            {/* blue-hour grade: cool sky above, quiet vignette below */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(42,46,74,0.3) 0%, transparent 34%, transparent 62%, rgba(28,17,12,0.34) 100%)",
              }}
            />

            {/* selected windows warming on — realistic, one-way, soft */}
            {LIGHTS.map((l) => (
              <WindowGlow key={`${l.x}-${l.y}`} p={p} {...l} />
            ))}

            {/* airflow whispers near the balconies — brief moments only */}
            <AirflowLines p={p} />
          </motion.div>
        </div>

        {/* ---------------- editorial content — upper-left, unchanged -- */}
        <motion.div
          className="absolute top-[9%] left-[6%] z-30 max-w-md lg:top-[11%] lg:left-[7%]"
          style={{ opacity: headOp, y: headY }}
        >
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#EFD5A3", textShadow: "0 1px 14px rgba(20,12,10,0.7)" }}>
            01 — Project Vision
          </p>
          <h2
            id="nature-heading"
            className="font-display mt-3 leading-[1.07] text-balance"
            style={{
              color: IVORY,
              fontSize: "clamp(2rem,3.6vw,3.6rem)",
              fontWeight: 500,
              textShadow: "0 2px 30px rgba(20,12,10,0.75)",
            }}
          >
            Designed around how you live.
          </h2>
          <p
            className="mt-3 max-w-sm text-[0.95rem] leading-[1.6]"
            style={{ color: "rgba(255,248,239,0.92)", textShadow: "0 1px 18px rgba(20,12,10,0.8)" }}
          >
            Architecture that responds to air, light, energy and everyday comfort.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(255,248,239,0.75)" }}>
            Scroll to descend <span aria-hidden="true">↓</span>
          </p>
        </motion.div>

        <motion.p
          className="absolute top-[58%] left-[6%] z-30 max-w-[15rem] rounded-lg bg-[#160E0A]/60 px-4 py-3 text-[0.85rem] leading-[1.55] backdrop-blur-[2px] lg:left-[7%]"
          style={{ opacity: s1Op, color: "rgba(255,248,239,0.95)" }}
        >
          Air is captured at the crown and guided down through the building&rsquo;s corridors.
        </motion.p>

        <motion.p
          className="absolute top-[36%] right-[6%] z-30 max-w-[15rem] rounded-lg bg-[#160E0A]/60 px-4 py-3 text-right text-[0.85rem] leading-[1.55] backdrop-blur-[2px] lg:right-[7%]"
          style={{ opacity: s2Op, color: "rgba(255,248,239,0.95)" }}
        >
          Private balconies set the rhythm of the façade — shade, air and outlook for every home.
        </motion.p>

        {/* closing beat — quiet caption + CTA */}
        <motion.div
          className="absolute inset-x-0 bottom-[6%] z-30 flex flex-col items-center gap-3 px-6 text-center"
          style={{ opacity: endOp, y: endY }}
        >
          <p
            className="rounded-full bg-[#160E0A]/60 px-5 py-2 text-[0.62rem] font-semibold tracking-[0.26em] uppercase backdrop-blur-[2px]"
            style={{ color: "rgba(255,248,239,0.92)" }}
          >
            The living façade · DHA View City, Karachi
          </p>
          <a
            href="#route"
            className="rounded-lg bg-[#943F2D] px-6 py-3 text-sm font-semibold text-[#FFF8EF] transition-colors hover:bg-[#C75B3B]"
          >
            Explore the Project
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- window glow --- */

function WindowGlow({ p, x, y, at }: { p: MotionValue<number>; x: number; y: number; at: number }) {
  /* one-way warm-on: rises over a slow beat, then stays lit */
  const opacity = useTransform(p, [at, at + 0.1], [0, 0.6]);
  return (
    <motion.span
      aria-hidden="true"
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: "7%",
        height: "2.2%",
        opacity,
        borderRadius: "40%",
        background:
          "radial-gradient(ellipse at center, rgba(255,214,146,0.75) 0%, rgba(246,212,138,0.3) 55%, transparent 80%)",
        mixBlendMode: "screen",
        filter: "blur(4px)",
      }}
    />
  );
}

/* ---------------------------------------------------- airflow lines -- */

function AirflowLines({ p }: { p: MotionValue<number> }) {
  const o1 = useTransform(p, [0.18, 0.23, 0.3, 0.35], [0, 0.32, 0.32, 0]);
  const o2 = useTransform(p, [0.46, 0.51, 0.58, 0.63], [0, 0.32, 0.32, 0]);
  const d1 = useTransform(p, [0.18, 0.35], [0, -14]);
  const d2 = useTransform(p, [0.46, 0.63], [0, -14]);
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 56.3"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 20 47 C 25 46.2, 30 47.4, 35.5 46.6 M 21.5 49.2 C 26 48.6, 30.5 49.4, 34.5 48.9"
        fill="none"
        stroke="#8FB8B2"
        strokeWidth="0.13"
        strokeLinecap="round"
        strokeDasharray="1.1 1.7"
        style={{ opacity: o1, strokeDashoffset: d1 }}
      />
      <motion.path
        d="M 62 44.5 C 66.5 43.8, 71 44.9, 75.5 44.2 M 63.5 46.7 C 67.5 46.1, 71.5 47, 75 46.5"
        fill="none"
        stroke="#8FB8B2"
        strokeWidth="0.13"
        strokeLinecap="round"
        strokeDasharray="1.1 1.7"
        style={{ opacity: o2, strokeDashoffset: d2 }}
      />
    </svg>
  );
}

/* --------------------------------------------------- reduced motion -- */

function StaticVision() {
  return (
    <section
      id="nature"
      data-section="nature"
      aria-labelledby="nature-heading"
      className="relative bg-[#F6EBDD] py-24"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#943F2D" }}>
          01 — Project Vision
        </p>
        <h2
          id="nature-heading"
          className="font-display mt-4 max-w-[16ch] leading-[1.07]"
          style={{ color: "#211A17", fontSize: "clamp(2.2rem,4vw,3.8rem)", fontWeight: 500 }}
        >
          Designed around how you live.
        </h2>
        <p className="mt-4 max-w-lg text-[1rem] leading-[1.65] text-[#211A17]/75">
          Architecture that responds to air, light, energy and everyday comfort.
        </p>
        <figure className="relative mt-10 overflow-hidden rounded-[24px] shadow-[0_50px_100px_-46px_rgba(70,32,16,0.5)]">
          <Image
            src="/buildingtop.jpg"
            alt="Close view down the terracotta façade of a Wind Corridor block — balconies, window bays and the rooftop systems above"
            width={2200}
            height={1238}
            sizes="92vw"
            className="h-auto w-full"
          />
        </figure>
        <p className="mt-6 text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#943F2D" }}>
          The living façade · DHA View City, Karachi
        </p>
      </div>
    </section>
  );
}

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
 * 01 — Project Vision: THE FAÇADE DESCENT.
 *
 * A vertical scroll-driven architectural experience over the approved
 * buildingfront render — the real FOAKH Wind Corridor Enclave façade,
 * untouched: exact terracotta tone, balcony rhythm, window proportions.
 *
 * A ~280svh section pins a 100svh stage. The render is blown up to a
 * façade close-up (240vw desktop / 520vw mobile) and translated
 * upward as the user scrolls, reading as a camera travelling DOWN the
 * façade from the upper floors toward the entrance. In the final
 * stage the layer scales about its bottom edge, revealing the lower
 * façade, landscaped frontage and entrance as a contained, rounded
 * editorial frame on the site canvas.
 *
 * Along the descent, selected apartment windows warm on — irregular
 * offsets, one-way, screen-blended glows anchored in façade
 * percentages so they ride the transform. Two whisper-thin airflow
 * lines appear near balconies for a few moments only, scroll-linked.
 * Editorial text stays minimal: heading at the top of the descent,
 * two small statements en route, a closing line + CTA at the reveal —
 * all small chips that never cover key architecture.
 *
 * Everything animates via transform/opacity on one composited layer
 * (60fps); travel distances are measured into MotionValues so the
 * maths stays correct across viewports. Reduced motion renders the
 * settled full-elevation frame.
 */

const ASPECT = 1238 / 2200;
const IVORY = "#FFF8EF";

/* selected windows that warm on — % of the façade layer, irregular order */
const LIGHTS: { x: number; y: number; at: number }[] = [
  { x: 23.0, y: 36.0, at: 0.13 },
  { x: 63.5, y: 34.5, at: 0.17 },
  { x: 30.5, y: 44.0, at: 0.22 },
  { x: 70.5, y: 42.5, at: 0.27 },
  { x: 26.0, y: 53.5, at: 0.32 },
  { x: 66.5, y: 51.5, at: 0.36 },
  { x: 20.5, y: 61.0, at: 0.41 },
  { x: 73.5, y: 59.5, at: 0.45 },
  { x: 29.5, y: 66.5, at: 0.50 },
  { x: 62.5, y: 68.0, at: 0.55 },
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

  /* measured descent range + final fit scale — MotionValues, no state */
  const travel = useMotionValue(0);
  const endScale = useMotionValue(0.4);
  const lift = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const el = layerRef.current;
      if (!el) return;
      const layerH = el.offsetWidth * ASPECT;
      const vh = window.innerHeight;
      travel.set(Math.min(0, vh - layerH));
      endScale.set(Math.min(1, (0.82 * vh) / layerH));
      lift.set(-(0.16 * vh));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [travel, endScale, lift]);

  /* the descent: eased travel down the façade, then the bottom-anchored
     zoom-out that reveals frontage and entrance */
  const y = useTransform([p, travel, lift] as const, ([v, t, l]) => {
    const a = Math.min(Math.max(((v as number) - 0.04) / 0.68, 0), 1);
    const ea = a * a * (3 - 2 * a); // smoothstep — no parallax tricks
    const b = Math.min(Math.max(((v as number) - 0.76) / 0.2, 0), 1);
    const eb = 1 - Math.pow(1 - b, 3);
    return ea * (t as number) + eb * (l as number);
  });
  const scale = useTransform([p, endScale] as const, ([v, s]) => {
    const b = Math.min(Math.max(((v as number) - 0.76) / 0.2, 0), 1);
    const e = 1 - Math.pow(1 - b, 3);
    return 1 - (1 - (s as number)) * e;
  });
  const radius = useTransform(p, [0.78, 0.96], [0, 26]);

  /* editorial beats */
  const headOp = useTransform(p, [0, 0.16, 0.26], [1, 1, 0]);
  const headY = useTransform(p, [0.16, 0.26], [0, -18]);
  const s1Op = useTransform(p, [0.3, 0.36, 0.52, 0.58], [0, 1, 1, 0]);
  const s2Op = useTransform(p, [0.56, 0.62, 0.74, 0.79], [0, 1, 1, 0]);
  const endOp = useTransform(p, [0.86, 0.94], [0, 1]);
  const endY = useTransform(p, [0.86, 0.94], [16, 0]);

  if (reduced) return <StaticVision />;

  return (
    <section
      id="nature"
      ref={sectionRef}
      data-section="nature"
      aria-labelledby="nature-heading"
      className="relative h-[240svh] lg:h-[280svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F6EBDD]">
        {/* ---------------- the façade layer — one composited transform */}
        <motion.div
          ref={layerRef}
          className="absolute top-0 left-1/2 w-[520vw] overflow-hidden will-change-transform lg:w-[240vw]"
          style={{
            x: "-50%",
            y,
            scale,
            borderRadius: radius,
            transformOrigin: "50% 100%",
            aspectRatio: "2200 / 1238",
            boxShadow: "0 60px 120px -50px rgba(70,32,16,0.5)",
          }}
        >
          <Image
            src="/buildingfront.jpg"
            alt="The terracotta façade of the two residential blocks, from the upper floors down to the landscaped entrance"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />

          {/* selected windows warming on — irregular, one-way, subtle */}
          {LIGHTS.map((l) => (
            <WindowGlow key={`${l.x}-${l.y}`} p={p} {...l} />
          ))}

          {/* airflow whispers near balconies — a few moments only */}
          <AirflowLines p={p} />
        </motion.div>

        {/* ---------------- editorial beats — small, never covering ---- */}
        <motion.div
          className="absolute top-[9%] left-[6%] z-30 max-w-md lg:top-[11%] lg:left-[7%]"
          style={{ opacity: headOp, y: headY }}
        >
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase" style={{ color: "#EFD5A3", textShadow: "0 1px 14px rgba(28,17,12,0.6)" }}>
            01 — Project Vision
          </p>
          <h2
            id="nature-heading"
            className="font-display mt-3 leading-[1.07] text-balance"
            style={{
              color: IVORY,
              fontSize: "clamp(2rem,3.6vw,3.6rem)",
              fontWeight: 500,
              textShadow: "0 2px 28px rgba(28,17,12,0.65)",
            }}
          >
            Designed around how you live.
          </h2>
          <p
            className="mt-3 max-w-sm text-[0.95rem] leading-[1.6]"
            style={{ color: "rgba(255,248,239,0.92)", textShadow: "0 1px 18px rgba(28,17,12,0.7)" }}
          >
            Architecture that responds to air, light, energy and everyday comfort.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(255,248,239,0.75)" }}>
            Scroll to descend <span aria-hidden="true">↓</span>
          </p>
        </motion.div>

        <motion.p
          className="absolute top-[56%] left-[6%] z-30 max-w-[15rem] rounded-lg bg-[#1C110C]/55 px-4 py-3 text-[0.85rem] leading-[1.55] backdrop-blur-[2px] lg:left-[7%]"
          style={{ opacity: s1Op, color: "rgba(255,248,239,0.95)" }}
        >
          Air is captured at the crown and guided down through the building&rsquo;s corridors.
        </motion.p>

        <motion.p
          className="absolute top-[38%] right-[6%] z-30 max-w-[15rem] rounded-lg bg-[#1C110C]/55 px-4 py-3 text-right text-[0.85rem] leading-[1.55] backdrop-blur-[2px] lg:right-[7%]"
          style={{ opacity: s2Op, color: "rgba(255,248,239,0.95)" }}
        >
          Private balconies set the rhythm of the façade — shade, air and outlook for every home.
        </motion.p>

        {/* final reveal caption + CTA */}
        <motion.div
          className="absolute inset-x-0 bottom-[3%] z-30 flex flex-col items-center gap-3 px-6 text-center"
          style={{ opacity: endOp, y: endY }}
        >
          <p className="text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#943F2D" }}>
            Landscaped frontage · Secure entrance · DHA View City, Karachi
          </p>
          <a
            href="#route"
            className="rounded-lg bg-[#943F2D] px-6 py-3 text-sm font-semibold text-[#FFF8EF] transition-colors hover:bg-[#211A17]"
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
  /* warm-on during the descent; hands off to the render's own lit
     windows as the wide reveal begins */
  const opacity = useTransform(p, [at, at + 0.09, 0.76, 0.85], [0, 0.85, 0.85, 0]);
  return (
    <motion.span
      aria-hidden="true"
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: "1.7%",
        height: "3%",
        opacity,
        borderRadius: "18%",
        background:
          "radial-gradient(ellipse at center, rgba(255,222,150,0.95) 0%, rgba(246,212,138,0.45) 55%, transparent 80%)",
        mixBlendMode: "screen",
        filter: "blur(1px)",
      }}
    />
  );
}

/* ---------------------------------------------------- airflow lines -- */

function AirflowLines({ p }: { p: MotionValue<number> }) {
  const o1 = useTransform(p, [0.16, 0.21, 0.28, 0.33], [0, 0.35, 0.35, 0]);
  const o2 = useTransform(p, [0.44, 0.49, 0.56, 0.61], [0, 0.35, 0.35, 0]);
  const d1 = useTransform(p, [0.16, 0.33], [0, -14]);
  const d2 = useTransform(p, [0.44, 0.61], [0, -14]);
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 56.3"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 19.5 21.5 C 24 20.7, 28.5 22, 33 21.2 M 21 23.8 C 25 23.2, 29 24.1, 32.5 23.5"
        fill="none"
        stroke="#8FB8B2"
        strokeWidth="0.13"
        strokeLinecap="round"
        strokeDasharray="1.1 1.7"
        style={{ opacity: o1, strokeDashoffset: d1 }}
      />
      <motion.path
        d="M 62 40 C 66 39.3, 70 40.4, 74.5 39.8 M 63.5 42.3 C 67 41.7, 70.5 42.6, 74 42.1"
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
            src="/buildingfront.jpg"
            alt="The terracotta façade of the two residential blocks, from the upper floors down to the landscaped entrance"
            width={2200}
            height={1238}
            sizes="92vw"
            className="h-auto w-full"
          />
        </figure>
        <p className="mt-6 text-[0.62rem] font-semibold tracking-[0.26em] uppercase" style={{ color: "#943F2D" }}>
          Landscaped frontage · Secure entrance · DHA View City, Karachi
        </p>
      </div>
    </section>
  );
}

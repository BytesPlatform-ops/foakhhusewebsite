"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 04 — Renewable Support: "POWER SHAPED BY MOVEMENT."
 *
 * Redesigned as a single composed architectural spread — spacious, warm,
 * intentional. The previous four-scene horizontal chapter, its ticker,
 * vertical rail, cropped giant letters, magenta nodes and colour waves
 * are all removed.
 *
 * Exactly three scroll-driven motions, then the section settles:
 *   01 headline reveal (POWER -> SHAPED BY -> MOVEMENT., opacity + <=28px)
 *   02 media opening   (aperture width/clip opens; inner image moves
 *                       independently — never a bare scale)
 *   03 energy light    (one dusty-teal wind line reaches the media and
 *                       becomes a single soft amber reflection, once)
 *
 * Ambient light is environmental, not decorative: champagne breath
 * behind the headline, warm amber behind the media, dusty-teal haze on
 * the wind side, soft vignette + grain. Desktop pins briefly; mobile is
 * normal flow. Reduced motion renders the settled composition.
 */

const C = {
  bg: "#202522",
  surface: "#2B302D",
  ivory: "#F1E8DA",
  muted: "rgba(241, 232, 218, 0.42)",
  champagne: "#C5A46C",
  teal: "#6F9B98",
  amber: "#D59B54",
  terracotta: "#9B6047",
  sage: "#879388",
};

export default function WindTunnel() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 28, mass: 0.4 });

  /* -- 01 · headline reveal ------------------------------------------- */
  const powerOp = useTransform(p, [0.04, 0.14], [0, 1]);
  const powerY = useTransform(p, [0.04, 0.14], [26, 0]);
  const shapedOp = useTransform(p, [0.11, 0.21], [0, 1]);
  const shapedY = useTransform(p, [0.11, 0.21], [20, 0]);
  const moveOp = useTransform(p, [0.17, 0.28], [0, 1]);
  const moveY = useTransform(p, [0.17, 0.28], [24, 0]);
  const copyOp = useTransform(p, [0.24, 0.36], [0, 1]);

  /* -- 02 · media opening --------------------------------------------- */
  const mediaClip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.12) / 0.28, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    return `inset(${(6 - e * 6).toFixed(2)}% ${(38 - e * 38).toFixed(2)}% ${(6 - e * 6).toFixed(2)}% ${(38 - e * 38).toFixed(2)}% round 6px)`;
  });
  const innerScale = useTransform(p, [0.12, 0.44], [1.24, 1.04]);
  const innerX = useTransform(p, [0.12, 0.44], ["4%", "0%"]);

  /* -- 03 · energy light: teal route -> one amber reflection ----------- */
  const routeDraw = useTransform(p, [0.34, 0.56], [0, 1]);
  const routeOp = useTransform(p, [0.34, 0.4, 0.72, 0.8], [0, 0.85, 0.85, 0.5]);
  const sweepX = useTransform(p, [0.5, 0.72], ["-35%", "135%"]);
  const sweepOp = useTransform(p, [0.5, 0.56, 0.68, 0.74], [0, 0.5, 0.5, 0]);

  const s = !!reduced;

  return (
    <section
      id="wind"
      ref={sectionRef}
      data-section="wind"
      aria-labelledby="wind-heading"
      className="relative lg:h-[190svh]"
      style={{ background: C.bg }}
    >
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-svh">
        {/* ---------- environmental light, vignette, grain -------------- */}
        <div aria-hidden="true" className="absolute inset-0">
          {/* champagne breath behind the headline */}
          <div
            className="absolute top-[14%] left-[4%] h-[52%] w-[46%] rounded-full blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${C.champagne}1a, transparent 72%)` }}
          />
          {/* warm amber behind the media */}
          <div
            className="absolute top-[16%] right-[-6%] h-[62%] w-[46%] rounded-full blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${C.amber}24, transparent 72%)` }}
          />
          {/* dusty-teal haze on the wind side */}
          <div
            className="absolute bottom-[6%] left-[10%] h-[38%] w-[38%] rounded-full blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${C.teal}17, transparent 72%)` }}
          />
          {/* soft edge vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(120% 95% at 50% 45%, transparent 55%, rgb(18 21 19 / 0.5) 100%)",
            }}
          />
          <div className="grain absolute inset-0" />
        </div>

        {/* ---------- composition --------------------------------------- */}
        <div className="relative mx-auto grid min-h-svh max-w-(--container-page) items-center gap-10 px-(--spacing-gutter) py-20 lg:grid-cols-[54%_1fr] lg:gap-6 lg:py-0">
          {/* LEFT — type column */}
          <div>
            <p
              className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
              style={{ color: C.champagne }}
            >
              04 — Renewable Support
            </p>

            <h2 id="wind-heading" className="mt-8">
              <motion.span
                className="font-display block leading-[0.95] font-medium"
                style={{
                  color: C.ivory,
                  fontSize: "clamp(3.4rem,7.6vw,7rem)",
                  ...(s ? {} : { opacity: powerOp, y: powerY }),
                }}
              >
                POWER
              </motion.span>
              <motion.span
                className="mt-3 block font-semibold tracking-[0.3em] uppercase"
                style={{
                  color: C.ivory,
                  fontSize: "clamp(0.95rem,1.5vw,1.35rem)",
                  ...(s ? {} : { opacity: shapedOp, y: shapedY }),
                }}
              >
                Shaped by
              </motion.span>
              <motion.span
                className="font-display mt-2 block leading-[0.95] font-medium lg:ml-[0.6em]"
                style={{
                  color: C.ivory,
                  fontSize: "clamp(2.8rem,6vw,5.6rem)",
                  ...(s ? {} : { opacity: moveOp, y: moveY }),
                }}
              >
                MOVEMENT.
              </motion.span>
            </h2>

            <motion.div className="mt-9 max-w-[27rem]" style={s ? undefined : { opacity: copyOp }}>
              <p className="text-[1rem] leading-[1.55] md:text-[1.06rem]" style={{ color: "rgba(241,232,218,0.74)" }}>
                Wind turbines are planned to convert available wind into renewable electricity
                for selected building requirements.
              </p>
              <p className="mt-3 text-[0.72rem] leading-relaxed" style={{ color: C.muted }}>
                Planned renewable-support system, subject to final engineering and approved
                specifications.
              </p>

              {/* compact progress — the only indicator in the section */}
              <div className="mt-9 flex items-center gap-4">
                <span className="text-[0.72rem] font-semibold tabular-nums" style={{ color: C.champagne }}>
                  04 / 04
                </span>
                <span className="h-px w-14" style={{ background: `${C.champagne}55` }} />
                <span className="text-[0.62rem] tracking-[0.26em] uppercase" style={{ color: C.muted }}>
                  Wind · Solar · Airflow · Support
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — one dominant media frame, breaking the right edge */}
          <div className="relative lg:-mr-[6vw]">
            <motion.figure
              className="relative h-[52svh] w-full overflow-hidden lg:h-[66svh]"
              style={s ? { borderRadius: 6 } : { clipPath: mediaClip }}
            >
              <motion.div
                className="absolute inset-0"
                style={s ? undefined : { scale: innerScale, x: innerX }}
              >
                <Image
                  src="/route-solar.jpg"
                  alt="Low-angle rooftop solar panels within the terracotta architecture, wind line reflected in the cells"
                  fill
                  sizes="(min-width:1024px) 46vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "62% 45%" }}
                />
              </motion.div>
              {/* warm grade: gentle highlight lift, no heavy overlay */}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, rgb(213 155 84 / 0.10) 0%, transparent 40%, rgb(32 37 34 / 0.22) 100%)",
                }}
              />
              {/* 03b — the single amber reflection, passing once */}
              {!s && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-[30%]"
                  style={{
                    left: 0,
                    x: sweepX,
                    opacity: sweepOp,
                    background: `linear-gradient(100deg, transparent, ${C.amber}59 50%, transparent)`,
                  }}
                />
              )}
            </motion.figure>
          </div>
        </div>

        {/* ---------- 03a — the wind route reaching the media ----------- */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ws-route" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.teal} stopOpacity="0" />
              <stop offset="45%" stopColor={C.teal} />
              <stop offset="100%" stopColor={C.amber} stopOpacity="0.8" />
            </linearGradient>
            <filter id="ws-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* blurred duplicate beneath for low glow */}
          <motion.path
            d="M-40 700 C 240 660, 420 690, 620 610 C 730 566, 800 520, 900 470"
            fill="none"
            stroke="url(#ws-route)"
            strokeWidth="6"
            filter="url(#ws-soft)"
            opacity="0.35"
            style={s ? undefined : { pathLength: routeDraw }}
          />
          <motion.path
            d="M-40 700 C 240 660, 420 690, 620 610 C 730 566, 800 520, 900 470"
            fill="none"
            stroke="url(#ws-route)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={s ? { opacity: 0.6 } : { pathLength: routeDraw, opacity: routeOp }}
          />
        </svg>
      </div>
    </section>
  );
}

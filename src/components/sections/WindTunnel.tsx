"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * 04 — Renewable Support: "POWER SHAPED BY MOVEMENT."
 *
 * A finite horizontal editorial chapter. Native vertical scroll drives a
 * 420vw track through four scenes: typographic activation (giant serif
 * with a narrow solar slit interrupting it) -> the slit opens into an
 * overhead solar field that activates (champagne sweep, amber zones,
 * magenta nodes, cyan wind wave, edge reflection) -> three arch-top
 * system windows (turbine / wind catcher / corridor) under a chapter
 * band -> an ivory finale with an overlapping collage, huge type and the
 * CTA. One energy line enters from the previous section, turns 90°,
 * threads every system and exits into the next chapter; its pulse loops
 * ONLY while the section is on screen. Kite appears solely as a
 * conceptual wind symbol, labelled as such.
 *
 * Track ends at 90% progress so the finale holds. Reduced motion renders
 * a static summary. No wheel interception anywhere.
 */

const C = {
  ink: "#111514",
  solarBlue: "#162A40",
  teal: "#2A8D91",
  cyan: "#39C7D3",
  champagne: "#D3A34F",
  amber: "#E89231",
  coral: "#E85B4B",
  magenta: "#E062A7",
  ivory: "#EFE4D2",
};

const RAIL = [
  { label: "Wind", range: [0.0, 0.22] as const },
  { label: "Solar", range: [0.22, 0.48] as const },
  { label: "Airflow", range: [0.48, 0.73] as const },
  { label: "Support", range: [0.73, 1.01] as const },
];

export default function WindTunnel() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(stageRef, { amount: 0.15 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 105, damping: 30, mass: 0.4 });

  /* -------- track travel: STEPS with dwells, not a linear glide.
     Each scene composes fully in the viewport (slight drift while
     dwelling keeps it alive), transits are brief. ---------------------- */
  const trackX = useTransform(
    p,
    [0, 0.05, 0.16, 0.24, 0.42, 0.5, 0.66, 0.76, 0.9],
    ["0vw", "-2vw", "-7vw", "-102vw", "-112vw", "-212vw", "-222vw", "-318vw", "-320vw"],
  );

  /* -------- scene 1: typographic activation -------------------------- */
  const powerOp = useTransform(p, [0, 0.14, 0.22], [1, 1, 0.12]);
  const shapedOp = useTransform(p, [0, 0.07, 0.12, 0.22], [0.15, 0.15, 1, 0.12]);

  /* -------- S2 solar field: opens from a centre slit where the
              viewport actually is during 20-48% ----------------------- */
  const fieldClip = useTransform(p, (v) => {
    const t = Math.min(Math.max((v - 0.22) / 0.13, 0), 1);
    const e = 1 - Math.pow(1 - t, 3);
    return `inset(${6 - e * 6}% ${46 - e * 46}% ${6 - e * 6}% ${46 - e * 46}%)`;
  });
  const apInnerScale = useTransform(p, [0.22, 0.4], [1.3, 1.04]);
  const apInnerX = useTransform(p, [0.2, 0.48], ["0%", "-4%"]);
  const apBright = useTransform(p, [0.22, 0.34], [0.62, 1]);

  /* -------- solar activation choreography ---------------------------- */
  const goldSweep = useTransform(p, [0.27, 0.4], ["-30%", "130%"]);
  const goldOp = useTransform(p, [0.27, 0.3, 0.38, 0.42], [0, 0.75, 0.75, 0]);
  const amberOp = useTransform(p, [0.3, 0.42], [0, 0.5]);
  const nodeStagger = [0.3, 0.325, 0.35, 0.375, 0.4];
  const waveDraw = useTransform(p, [0.32, 0.44], [0, 1]);
  const waveOp = useTransform(p, [0.32, 0.36, 0.46, 0.5], [0, 0.9, 0.9, 0.35]);
  const waveNodeDist = useTransform(p, [0.34, 0.46], [0, 1]);
  const waveNodePct = useTransform(waveNodeDist, (v) => `${v * 100}%`);
  const waveNodeOp = useTransform(p, [0.34, 0.38, 0.44, 0.48], [0, 1, 1, 0]);
  const reflectX = useTransform(p, [0.37, 0.44], ["0%", "-500%"]);
  const reflectOp = useTransform(p, [0.37, 0.4, 0.43, 0.45], [0, 0.55, 0.55, 0]);

  const apBrightFilter = useTransform(apBright, (b) => `brightness(${b})`);

  /* -------- scene 3 labels ------------------------------------------- */
  const archOp = useTransform(p, [0.46, 0.53], [0, 1]);
  const capOp = useTransform(p, [0.5, 0.54, 0.68, 0.72], [0.25, 1, 1, 0.25]);
  const chanOp = useTransform(p, [0.55, 0.59, 0.7, 0.74], [0.25, 1, 1, 0.25]);
  const circOp = useTransform(p, [0.6, 0.64, 0.72, 0.76], [0.25, 1, 1, 0.4]);

  /* -------- kite: conceptual, S2 -> S3 only --------------------------- */
  const kiteT = useTransform(p, [0.44, 0.62], [0, 1]);
  const kiteX = useTransform(kiteT, (t) => 150 + t * 130); // vw on track
  const kiteY = useTransform(kiteT, (t) => 16 + Math.sin(t * Math.PI * 1.5) * 7); // svh
  const kiteXvw = useTransform(kiteX, (v) => `${v}vw`);
  const kiteYvh = useTransform(kiteY, (v) => `${v}svh`);
  const kiteOp = useTransform(p, [0.44, 0.48, 0.6, 0.65], [0, 0.9, 0.9, 0]);
  const kiteRot = useTransform(kiteT, [0, 0.5, 1], [-18, -8, -14]);

  /* -------- scene 4 ---------------------------------------------------*/
  const moveOp = useTransform(p, [0.76, 0.84, 1], [0.14, 1, 1]);
  const finalCopyOp = useTransform(p, [0.78, 0.86], [0, 1]);

  /* -------- the energy route across the whole track ------------------ */
  const routeDraw = useTransform(p, [0.04, 0.86], [0, 1]);

  const railDotTop = useTransform(p, [0.03, 1], ["26%", "70%"]);

  if (reduced) return <StaticSummary />;

  return (
    <section
      id="wind"
      ref={sectionRef}
      data-section="wind"
      aria-labelledby="wind-heading"
      className="relative h-[320svh] lg:h-[360svh]"
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden" style={{ background: C.ink }}>
        <h2 id="wind-heading" className="sr-only">
          Power shaped by movement — renewable support
        </h2>
        <p className="absolute top-[5%] left-[8%] z-40 text-[0.62rem] font-medium tracking-[0.3em] uppercase lg:left-[7.5rem]" style={{ color: C.champagne }}>
          04 — Renewable Support
        </p>

        {/* section-local vertical rail */}
        <div className="absolute inset-y-0 left-0 z-40 hidden w-[4.5rem] flex-col items-center justify-center gap-9 border-r border-white/8 lg:flex" style={{ background: "rgba(17,21,20,0.85)" }}>
          <span className="text-[0.6rem] font-semibold tracking-[0.3em]" style={{ color: C.champagne }}>04</span>
          {RAIL.map((r) => (
            <RailWord key={r.label} label={r.label} range={r.range} progress={p} />
          ))}
          <motion.span className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ top: railDotTop, background: C.champagne }} />
        </div>
        <div className="absolute top-[5%] right-[5%] z-40 lg:hidden">
          {RAIL.map((r, i) => (
            <MobileRailWord key={r.label} label={r.label} index={i} range={r.range} progress={p} />
          ))}
        </div>

        {/* bottom system ticker — pauses off-screen */}
        <div className="absolute inset-x-0 bottom-0 z-40 overflow-hidden border-t border-white/8 py-2.5" style={{ background: "rgba(17,21,20,0.72)" }}>
          <div
            className="flex w-max gap-10 text-[0.6rem] tracking-[0.3em] whitespace-nowrap uppercase"
            style={{
              color: "rgba(239,228,210,0.6)",
              animation: "wt-ticker 32s linear infinite",
              animationPlayState: inView ? "running" : "paused",
            }}
          >
            {[0, 1].map((k) => (
              <span key={k} className="flex gap-10">
                <span>Wind turbines</span><span style={{ color: C.champagne }}>·</span>
                <span>Solar support</span><span style={{ color: C.champagne }}>·</span>
                <span>Wind catcher</span><span style={{ color: C.champagne }}>·</span>
                <span>Natural airflow</span><span style={{ color: C.champagne }}>·</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes wt-ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>

        {/* ==================== THE HORIZONTAL TRACK ==================== */}
        <motion.div className="absolute top-0 left-0 h-full w-[420vw]" style={{ x: trackX }}>
          {/* scene grounds: ink field then ivory finale + colour planes */}
          <div className="absolute inset-y-0 left-[328vw] w-[92vw]" style={{ background: C.ivory }} />
          <div className="absolute inset-y-0 left-[382vw] w-[38vw] opacity-90" style={{ background: C.coral }} />
          <div className="absolute top-[8svh] left-[336vw] h-[26svh] w-[20vw]" style={{ background: C.solarBlue }} />
          <div className="grain absolute inset-0" aria-hidden="true" />

          {/* ---------------- the energy route ------------------------- */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 z-[5] h-full w-full"
            viewBox="0 0 4200 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wt-route" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.teal} />
                <stop offset="30%" stopColor={C.champagne} />
                <stop offset="60%" stopColor={C.cyan} />
                <stop offset="100%" stopColor={C.champagne} />
              </linearGradient>
            </defs>
            {/* enters from previous section top-left, turns 90°, threads the systems, exits right */}
            <motion.path
              d="M 60 0 L 60 800 Q 60 830 100 830 L 980 830 Q 1030 830 1060 780 L 1500 700 L 2260 700 Q 2320 700 2360 660 L 2650 660 L 2940 660 L 3260 660 Q 3320 660 3360 620 L 4200 620"
              fill="none"
              stroke="url(#wt-route)"
              strokeWidth="2.5"
              style={{ pathLength: routeDraw }}
            />
            {/* ambient pulse — loops only while on screen */}
            {inView && (
              <motion.circle
                r="7"
                fill={C.champagne}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 14, ease: "linear", repeat: Infinity }}
                style={{
                  offsetPath:
                    'path("M 60 0 L 60 800 Q 60 830 100 830 L 980 830 Q 1030 830 1060 780 L 1500 700 L 2260 700 Q 2320 700 2360 660 L 2650 660 L 2940 660 L 3260 660 Q 3320 660 3360 620 L 4200 620")',
                }}
              />
            )}
          </svg>

          {/* ================= SCENE 01 · ACTIVATION ==================== */}
          <div className="absolute top-0 left-0 h-full w-[100vw]">
            <motion.p
              aria-hidden="true"
              className="font-display absolute top-[12svh] left-[9vw] leading-none font-medium"
              style={{ color: C.ivory, opacity: powerOp, fontSize: "clamp(4rem,11vw,10rem)" }}
            >
              POWER
            </motion.p>
            <motion.p
              aria-hidden="true"
              className="absolute top-[34svh] left-[10vw] font-semibold tracking-[0.34em] uppercase"
              style={{ color: C.ivory, opacity: shapedOp, fontSize: "clamp(1.1rem,2.4vw,2rem)" }}
            >
              Shaped
            </motion.p>
            <p
              aria-hidden="true"
              className="font-display absolute top-[58svh] left-[86vw] leading-none font-medium whitespace-nowrap opacity-[0.14]"
              style={{ color: C.ivory, fontSize: "clamp(3rem,8vw,7.4rem)" }}
            >
              BY MOVEMENT
            </p>
            <p className="absolute bottom-[14svh] left-[9vw] max-w-64 text-[0.75rem] leading-relaxed" style={{ color: "rgba(239,228,210,0.7)" }}>
              Wind turbines are planned to convert available wind into renewable electricity for
              selected building requirements.
            </p>
            {/* thin champagne chapter lines */}
            <span aria-hidden="true" className="absolute top-[10svh] left-[9vw] h-px w-[30vw]" style={{ background: `${C.champagne}55` }} />
          </div>

          {/* ---- S1: narrow static slit interrupting the headline ------ */}
          <figure className="absolute top-[14svh] left-[54vw] h-[44svh] w-[13vw] overflow-hidden">
            <Image
              src="/route-solar.jpg"
              alt=""
              fill
              sizes="14vw"
              className="scale-150 object-cover"
              style={{ objectPosition: "40% 45%" }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(17,21,20,0.35), transparent 55%)" }}
            />
          </figure>

          {/* ====== S2: THE SOLAR FIELD opens from a centre slit ======== */}
          <div className="absolute top-[13svh] left-[106vw]">
            <motion.figure className="relative h-[72svh] w-[82vw] overflow-hidden" style={{ clipPath: fieldClip }}>
              <motion.div className="absolute inset-0" style={{ scale: apInnerScale, x: apInnerX, filter: apBrightFilter }}>
                <Image
                  src="/route-solar.jpg"
                  alt="Overhead view of the rooftop solar field catching first light"
                  fill
                  sizes="80vw"
                  className="object-cover"
                  style={{ objectPosition: "50% 45%" }}
                />
              </motion.div>

              {/* champagne-gold illumination travelling the cells */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 w-[26%]"
                style={{
                  left: 0,
                  x: goldSweep,
                  opacity: goldOp,
                  background: `linear-gradient(100deg, transparent, ${C.champagne}aa 45%, ${C.amber}66 60%, transparent)`,
                }}
              />
              {/* warm amber zones */}
              <motion.span aria-hidden="true" className="absolute top-[16%] left-[12%] h-[22%] w-[24%]" style={{ opacity: amberOp, background: `${C.amber}44` }} />
              <motion.span aria-hidden="true" className="absolute top-[52%] left-[48%] h-[26%] w-[28%]" style={{ opacity: amberOp, background: `${C.amber}36` }} />
              {/* magenta nodes at grid intersections, progressive */}
              {nodeStagger.map((at, i) => (
                <SolarNode key={i} at={at} i={i} progress={p} />
              ))}
              {/* cyan wind wave crossing the rows */}
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M -4 62 C 18 54, 34 68, 52 58 C 68 50, 82 60, 104 50"
                  fill="none"
                  stroke={C.cyan}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  style={{ pathLength: waveDraw, opacity: waveOp }}
                />
              </svg>
              <motion.span
                aria-hidden="true"
                className="absolute top-0 left-0 h-2.5 w-2.5 rounded-full"
                style={{
                  background: C.coral,
                  opacity: waveNodeOp,
                  offsetPath: 'path("M -4 62 C 18 54, 34 68, 52 58 C 68 50, 82 60, 104 50")',
                  offsetDistance: waveNodePct,
                  scale: 4,
                }}
              />
              {/* bright reflection crossing the far-right edge */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-[8%]"
                style={{ x: reflectX, opacity: reflectOp, background: "linear-gradient(90deg, transparent, rgba(255,250,240,0.85), transparent)" }}
              />
            </motion.figure>
          </div>

          {/* ================= SCENE 02 side furniture ================== */}
          <div className="absolute top-0 left-[100vw] h-full w-[115vw]">
            <p
              aria-hidden="true"
              className="absolute top-[40svh] left-[3.5vw] text-[0.6rem] font-medium tracking-[0.3em] uppercase"
              style={{ color: C.champagne, writingMode: "vertical-rl", rotate: "180deg" }}
            >
              Solar support
            </p>
            {/* cropped giant word behind the field's right edge */}
            <p
              aria-hidden="true"
              className="font-display absolute top-[30svh] left-[92vw] z-0 leading-none font-medium whitespace-nowrap opacity-[0.14]"
              style={{ color: C.ivory, fontSize: "clamp(4rem,10vw,9rem)" }}
            >
              SUNLIGHT
            </p>
          </div>

          {/* ============ SCENE 03 · THREE SYSTEM WINDOWS =============== */}
          <motion.div className="absolute top-0 left-[215vw] h-full w-[115vw]" style={{ opacity: archOp }}>
            {/* chapter band */}
            <div className="absolute top-[7svh] right-[8vw] left-[6vw]">
              <div className="flex items-baseline justify-between text-[0.62rem] tracking-[0.28em] uppercase" style={{ color: "rgba(239,228,210,0.75)" }}>
                <span>Wind system</span>
                <span className="font-display text-[1rem] normal-case" style={{ color: C.ivory }}>
                  Power shaped by movement
                </span>
                <span>Renewable support</span>
              </div>
              <div className="mt-2 h-px w-full" style={{ background: `${C.champagne}45` }} />
              <p className="mt-1.5 text-center text-[0.58rem] tracking-[0.3em] uppercase" style={{ color: C.champagne }}>
                04 — System in motion
              </p>
            </div>

            <div className="absolute top-[20svh] left-[6vw] flex items-end gap-[3vw]">
              {/* FRAME 01 — turbine (SVG, refined) */}
              <ArchFrame width="22vw" height="52svh" label="Capture" labelOp={capOp}>
                <TurbineArt spinning={inView} />
              </ArchFrame>
              {/* FRAME 02 — wind catcher (taller centre) */}
              <ArchFrame width="29vw" height="60svh" label="Channel" labelOp={chanOp}>
                <Image src="/env-air.jpg" alt="Air drawn through the terracotta wind-catcher opening" fill sizes="30vw" className="object-cover" style={{ objectPosition: "58% 40%" }} />
                {/* airflow narrowing inward */}
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[30, 50, 70].map((y, i) => (
                    <path key={y} d={`M -4 ${y} C 30 ${y - 4}, 55 ${50 + (y - 50) * 0.3}, 104 ${50 + (y - 50) * 0.15}`} fill="none" stroke={C.cyan} strokeWidth="0.8" opacity={0.55 - i * 0.1} />
                  ))}
                </svg>
              </ArchFrame>
              {/* FRAME 03 — corridor */}
              <ArchFrame width="22vw" height="52svh" label="Circulate · Support" labelOp={circOp}>
                <Image src="/route-corridor.jpg" alt="Airflow continuing through the shared corridor toward warm light" fill sizes="24vw" className="object-cover" style={{ objectPosition: "50% 40%" }} />
              </ArchFrame>
            </div>
          </motion.div>

          {/* ---------------- conceptual kite over S2->S3 ---------------- */}
          <motion.div
            aria-hidden="true"
            className="absolute z-20 hidden lg:block"
            style={{ left: kiteXvw, top: kiteYvh, opacity: kiteOp, rotate: kiteRot }}
          >
            <svg viewBox="0 0 96 44" className="w-20">
              <path d="M4 26 C 22 6, 66 1, 84 13 C 68 26, 24 32, 4 26 Z" fill={C.ink} opacity="0.9" />
              <path d="M8 24 C 24 9, 62 4, 78 13" fill="none" stroke={C.coral} strokeWidth="1.4" opacity="0.8" />
              <line x1="44" y1="30" x2="58" y2="44" stroke={C.ink} strokeWidth="0.8" opacity="0.6" />
            </svg>
            <p className="mt-1 text-[0.5rem] tracking-[0.22em] uppercase" style={{ color: "rgba(239,228,210,0.55)" }}>
              Conceptual wind-movement visual
            </p>
          </motion.div>

          {/* ================= SCENE 04 · FINALE ======================== */}
          <div className="absolute top-0 left-[330vw] h-full w-[90vw]">
            {/* overlapping collage, left */}
            <div className="absolute top-[14svh] left-[5vw]">
              <figure className="relative h-[42svh] w-[24vw] overflow-hidden">
                <Image src="/route-solar.jpg" alt="Rooftop solar field" fill sizes="26vw" className="object-cover" />
              </figure>
              <figure className="absolute top-[26svh] left-[14vw] z-10 h-[30svh] w-[18vw] overflow-hidden shadow-[0_24px_60px_-30px_rgba(17,21,20,0.5)]">
                <Image src="/hero-poster.jpg" alt="The rooftop systems at first light" fill sizes="20vw" className="object-cover" />
              </figure>
              <figure className="absolute top-[52svh] left-[6vw] z-0 h-[18svh] w-[12vw] overflow-hidden opacity-90">
                <Image src="/route-corridor.jpg" alt="Shared corridor" fill sizes="14vw" className="object-cover" />
              </figure>
            </div>

            {/* compact route node, centre */}
            <div className="absolute top-[58svh] left-[40vw] flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full" style={{ background: C.champagne }} />
              <span className="text-[0.58rem] tracking-[0.26em] uppercase" style={{ color: C.ink }}>
                Convert
              </span>
            </div>

            {/* huge typography, right — MOVEMENT. active */}
            <div aria-hidden="true" className="font-display absolute top-[10svh] left-[48vw] leading-[0.95] font-medium whitespace-nowrap">
              <p style={{ color: C.ink, opacity: 0.14, fontSize: "clamp(3rem,7.6vw,7rem)" }}>POWER</p>
              <p style={{ color: C.ink, opacity: 0.14, fontSize: "clamp(3rem,7.6vw,7rem)" }}>SHAPED BY</p>
              <motion.p style={{ color: C.ink, opacity: moveOp, fontSize: "clamp(3.6rem,9vw,8.6rem)" }}>
                MOVEMENT.
              </motion.p>
            </div>

            <motion.div className="absolute bottom-[13svh] left-[48vw] max-w-sm" style={{ opacity: finalCopyOp }}>
              <p className="text-[0.82rem] leading-relaxed" style={{ color: "rgba(17,21,20,0.8)" }}>
                Wind turbines are planned to convert available wind into renewable electricity for
                selected building requirements.
              </p>
              <p className="mt-2 text-[0.75rem] leading-relaxed" style={{ color: "rgba(17,21,20,0.6)" }}>
                Wind, sunlight and thoughtful planning are brought together across the development.
              </p>
              <a
                href="#solar"
                className="mt-4 inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
                style={{ background: C.ink, color: C.ivory }}
              >
                Explore Renewable Systems
              </a>
              <p className="mt-3 text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "rgba(17,21,20,0.55)" }}>
                Planned system — subject to final engineering and system specifications
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- pieces --- */

function SolarNode({ at, i, progress }: { at: number; i: number; progress: MotionValue<number> }) {
  const op = useTransform(progress, [at, at + 0.03, 0.46, 0.5], [0, 1, 1, 0.45]);
  const positions = [
    { left: "22%", top: "30%" },
    { left: "40%", top: "56%" },
    { left: "58%", top: "34%" },
    { left: "72%", top: "62%" },
    { left: "84%", top: "40%" },
  ];
  return (
    <motion.span
      aria-hidden="true"
      className="absolute h-2 w-2 rounded-full"
      style={{ ...positions[i], background: C.magenta, opacity: op, boxShadow: `0 0 10px ${C.magenta}66` }}
    />
  );
}

/** Contemporary arch-top media window with its hairline label. */
function ArchFrame({
  width,
  height,
  label,
  labelOp,
  children,
}: {
  width: string;
  height: string;
  label: string;
  labelOp: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" style={{ width, minWidth: "13rem" }}>
      <figure
        className="relative overflow-hidden"
        style={{ height, borderRadius: "999px 999px 6px 6px" }}
      >
        {children}
      </figure>
      <motion.p
        className="mt-3 flex items-center gap-2.5 text-[0.62rem] tracking-[0.26em] uppercase"
        style={{ color: C.ivory, opacity: labelOp }}
      >
        <span className="h-px w-8" style={{ background: C.champagne }} />
        {label}
      </motion.p>
    </div>
  );
}

/** Refined shrouded turbine — architectural, not clip-art. */
function TurbineArt({ spinning }: { spinning: boolean }) {
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.solarBlue}, ${C.ink})` }}>
      <svg viewBox="0 0 220 420" className="h-full w-full">
        <defs>
          <linearGradient id="ta-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9e4da" />
            <stop offset="100%" stopColor="#7c8286" />
          </linearGradient>
        </defs>
        {/* building context */}
        <rect x="0" y="330" width="220" height="90" fill="#7c4a36" />
        <rect x="0" y="330" width="220" height="8" fill="#a06a4c" />
        <rect x="102" y="196" width="16" height="140" fill="#5c6165" />
        {/* shroud + housing depth */}
        <circle cx="110" cy="150" r="78" fill="#0d1620" />
        <circle cx="110" cy="150" r="84" fill="none" stroke="url(#ta-ring)" strokeWidth="10" />
        {/* rotor */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={spinning ? { rotate: 360 } : undefined}
          transition={spinning ? { duration: 12, ease: "linear", repeat: Infinity } : undefined}
        >
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="106" y="76" width="8" height="70" rx="4" fill="#dfe3e6" transform={`rotate(${a} 110 150)`} />
          ))}
        </motion.g>
        <circle cx="110" cy="150" r="12" fill="#c4c9cc" />
        {/* cyan airflow entering the shroud */}
        {[130, 150, 170].map((y, i) => (
          <path key={y} d={`M -10 ${y} C 30 ${y - 4}, 60 ${y + 2}, 96 ${150 + (y - 150) * 0.3}`} fill="none" stroke={C.cyan} strokeWidth="2" opacity={0.6 - i * 0.12} />
        ))}
      </svg>
    </div>
  );
}

function RailWord({ label, range, progress }: { label: string; range: readonly [number, number]; progress: MotionValue<number> }) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.03, a, b, b + 0.03], [0.3, 1, 1, 0.3]);
  return (
    <motion.span
      className="text-[0.6rem] font-medium tracking-[0.3em] uppercase"
      style={{ color: C.ivory, opacity, writingMode: "vertical-rl", rotate: "180deg" }}
    >
      {label}
    </motion.span>
  );
}

function MobileRailWord({ label, index, range, progress }: { label: string; index: number; range: readonly [number, number]; progress: MotionValue<number> }) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.02, a, b, b + 0.02], [0, 1, 1, 0]);
  return (
    <motion.span
      className="absolute top-0 right-0 text-[0.6rem] font-medium tracking-[0.22em] whitespace-nowrap uppercase"
      style={{ color: C.champagne, opacity }}
    >
      0{index + 1} / 04 — {label}
    </motion.span>
  );
}

/* -------------------------------------------------- reduced motion ------ */

function StaticSummary() {
  return (
    <section
      id="wind"
      data-section="wind"
      aria-labelledby="wind-heading"
      className="relative overflow-hidden py-24"
      style={{ background: C.ink }}
    >
      <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <p className="text-[0.62rem] font-medium tracking-[0.3em] uppercase" style={{ color: C.champagne }}>
          04 — Renewable Support
        </p>
        <h2
          id="wind-heading"
          className="font-display mt-6 max-w-[14ch] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1.02] font-medium"
          style={{ color: C.ivory }}
        >
          Power shaped by movement.
        </h2>
        <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed" style={{ color: "rgba(239,228,210,0.75)" }}>
          Wind turbines are planned to convert available wind into renewable electricity for
          selected building requirements. Wind, sunlight and thoughtful planning work together
          across the development.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { src: "/route-solar.jpg", alt: "Rooftop solar field", cap: "Solar support" },
            { src: "/env-air.jpg", alt: "Wind-catcher opening", cap: "Wind catcher" },
            { src: "/route-corridor.jpg", alt: "Shared corridor airflow", cap: "Natural airflow" },
          ].map((f) => (
            <figure key={f.src}>
              <div className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: "999px 999px 6px 6px" }}>
                <Image src={f.src} alt={f.alt} fill sizes="33vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: "rgba(239,228,210,0.7)" }}>
                {f.cap}
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href="#solar"
          className="mt-8 inline-block rounded-lg px-6 py-3 text-sm font-semibold"
          style={{ background: C.ivory, color: C.ink }}
        >
          Explore Renewable Systems
        </a>
        <p className="mt-3 text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "rgba(239,228,210,0.5)" }}>
          Planned system — subject to final engineering and system specifications
        </p>
      </div>
    </section>
  );
}

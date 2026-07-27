"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Eyebrow } from "@/components/shared/Chapter";

/**
 * WIND POWER — the film's turbine-to-tunnel move, as a scroll chapter.
 *
 * One sticky stage, four states driven by native scroll (no wheel
 * interception — the page keeps scrolling normally; the stage merely
 * holds while its states play out):
 *
 *   1. TURBINE  — front-facing shrouded rotor, ring centred (~75mm feel),
 *                 rotor turning slowly, leaf drifting to the hub.
 *   2. ENTER    — the shroud scales past the viewport edges: the camera
 *                 pushes through the centre; blades part and fade.
 *   3. TUNNEL   — concentric rings fly past, circular at first and
 *                 progressively more rectangular (~20mm feel), teal
 *                 airflow accelerating along the axis, bronze wall light.
 *   4. CORRIDOR — the rings resolve into the terracotta wind-catcher
 *                 passage in perfect one-point perspective; airflow
 *                 divides; CAPTURE / CHANNEL / CIRCULATE / COOL attach to
 *                 the corridor as glass labels; the line exits downward
 *                 toward the solar chapter.
 *
 * Everything is transform/opacity only. Reduced motion renders the final
 * corridor state statically with all labels visible.
 */

const LABELS = [
  { word: "Capture", at: 0.74, x: "12%", y: "30%" },
  { word: "Channel", at: 0.8, x: "68%", y: "26%" },
  { word: "Circulate", at: 0.86, x: "14%", y: "64%" },
  { word: "Cool", at: 0.92, x: "70%", y: "62%" },
] as const;

/** Tunnel rings: first circular, later ones increasingly rectangular. */
const RINGS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  radius: 300,
  rx: i < 2 ? 300 : 300 - (i - 1) * 52, // 300 = circle; smaller = squarer
  start: 0.42 + i * 0.038,
}));

export default function WindTunnel() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress: raw } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Spring-wrapped ON PURPOSE, and not only for feel: a bare scroll value
  // handed to `style` gets promoted to a native ScrollTimeline animation
  // whose pixel ranges are measured once at mount — and this page's height
  // changes after mount (fonts, canvas, facts rail), leaving those ranges
  // stale. The spring keeps every stage JS-driven and correct.
  const p = useSpring(raw, { stiffness: 300, damping: 36, mass: 0.4 });

  if (reduced) return <StaticFallback />;

  return (
    <section
      id="wind"
      ref={sectionRef}
      data-section="wind"
      className="blend-top relative h-[340svh]"
      style={{ "--blend-from": "#171816" } as React.CSSProperties}
      aria-labelledby="wind-heading"
    >
      <div className="mineral-windsky grain sticky top-0 h-svh overflow-hidden">
        <TurbineStage p={p} />
        <TunnelStage p={p} />
        <CorridorStage p={p} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- stage 1+2 */

function TurbineStage({ p }: { p: MotionValue<number> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.2 });

  // The push-through: the whole assembly scales up 9x centred on the hub.
  const scale = useTransform(p, [0, 0.22, 0.44], [1, 1.05, 9]);
  const opacity = useTransform(p, [0, 0.36, 0.46], [1, 1, 0]);
  const bladeOpacity = useTransform(p, [0.24, 0.4], [1, 0]);
  const headingOpacity = useTransform(p, [0, 0.14, 0.22], [1, 1, 0]);
  const leafX = useTransform(p, [0.04, 0.2], [-260, -6]);
  const leafOpacity = useTransform(p, [0.02, 0.08, 0.18, 0.22], [0, 1, 1, 0]);

  return (
    <motion.div ref={stageRef} style={{ opacity }} className="absolute inset-0">
      {/* Heading — visible only while the turbine holds the frame */}
      <motion.div
        style={{ opacity: headingOpacity }}
        className="absolute inset-x-0 top-[9%] z-10 mx-auto max-w-(--container-page) px-(--spacing-gutter)"
      >
        <Eyebrow num="02" tone="light">
          Renewable support · Wind
        </Eyebrow>
        <h2 id="wind-heading" className="font-display text-ivory text-d2 max-w-[14ch] font-semibold">
          Power shaped by movement.
        </h2>
        <p className="text-ivory/70 text-lead mt-4 max-w-md">
          Wind turbines are planned to convert available wind into renewable electricity for
          selected building requirements.
        </p>
      </motion.div>

      {/* The shrouded turbine, ring centred */}
      <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="-320 -320 640 640" className="h-[78svh] w-auto" role="presentation">
          <defs>
            <radialGradient id="wtn-depth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#050b10" />
              <stop offset="62%" stopColor="#0c1a24" />
              <stop offset="100%" stopColor="#1d3a4a" />
            </radialGradient>
            <linearGradient id="wtn-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0ede8" />
              <stop offset="45%" stopColor="#b9bec2" />
              <stop offset="100%" stopColor="#6f777b" />
            </linearGradient>
            <linearGradient id="wtn-blade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8e4de" />
              <stop offset="100%" stopColor="#8a9296" />
            </linearGradient>
          </defs>

          {/* rooftop parapet softly holding the lower edge */}
          <rect x="-320" y="212" width="640" height="108" fill="#8a5138" opacity="0.65" />
          <rect x="-320" y="212" width="640" height="10" fill="#c17b58" opacity="0.65" />

          {/* housing depth — the tunnel-like dark centre */}
          <circle r="252" fill="url(#wtn-depth)" />
          {/* internal duct rings hinting at depth */}
          {[210, 160, 112].map((r) => (
            <circle key={r} r={r} fill="none" stroke="#22a8aa" strokeWidth="1" opacity="0.18" />
          ))}

          {/* rotor — slow believable spin, only while on screen */}
          <motion.g
            style={{ opacity: bladeOpacity }}
            animate={inView ? { rotate: 360 } : undefined}
            transition={inView ? { duration: 11, ease: "linear", repeat: Infinity } : undefined}
          >
            {[0, 90, 180, 270].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <path d="M0 -18 C -20 -80, -16 -170, 0 -228 C 16 -170, 20 -80, 0 -18 Z" fill="url(#wtn-blade)" />
              </g>
            ))}
          </motion.g>
          {/* hub with champagne catch-light */}
          <circle r="34" fill="url(#wtn-ring)" />
          <circle r="12" fill="#4a5257" />
          <circle cx="-9" cy="-9" r="5" fill="#ffe2ae" opacity="0.85" />

          {/* support arms */}
          {[45, 135, 270].map((a) => (
            <rect key={a} x="-7" y="-268" width="14" height="86" fill="#5c6165" transform={`rotate(${a})`} />
          ))}

          {/* outer shroud ring — the essential covered housing */}
          <circle r="264" fill="none" stroke="url(#wtn-ring)" strokeWidth="26" />
          <circle r="279" fill="none" stroke="#4a5257" strokeWidth="5" opacity="0.8" />
          {/* bolts */}
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={(264 * Math.cos((a * Math.PI) / 180)).toFixed(2)} cy={(264 * Math.sin((a * Math.PI) / 180)).toFixed(2)} r="5" fill="#3d4448" />
          ))}

          {/* the leaf drifting into the centre */}
          <motion.path
            d="M0 0 C 9 -9, 22 -9, 29 0 C 22 9, 9 9, 0 0 Z"
            fill="#4c7056"
            style={{ x: leafX, opacity: leafOpacity }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- stage 3 */

function TunnelStage({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.4, 0.48, 0.66, 0.74], [0, 1, 1, 0]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden="true">
      {/* deep duct ground */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 90% at 50% 50%, #10222e 0%, #0a161f 55%, #060d13 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="-400 -300 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="presentation">
          {/* rings flying past: circular first, progressively rectangular */}
          {RINGS.map((ring, i) => (
            <TunnelRing key={i} p={p} ring={ring} i={i} />
          ))}
          {/* axial airflow lines accelerating toward the viewer's edges */}
          {[-0.85, -0.5, -0.18, 0.18, 0.5, 0.85].map((t, i) => (
            <AxialLine key={i} p={p} angle={t * Math.PI} index={i} />
          ))}
          {/* destination glow */}
          <motion.circle
            r="46"
            fill="#f7ead2"
            style={{ opacity: useTransform(p, [0.56, 0.72], [0, 0.9]) }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

function TunnelRing({
  p,
  ring,
  i,
}: {
  p: MotionValue<number>;
  ring: (typeof RINGS)[number];
  i: number;
}) {
  const scale = useTransform(p, [ring.start, ring.start + 0.26], [0.08, 5.2]);
  const opacity = useTransform(
    p,
    [ring.start, ring.start + 0.05, ring.start + 0.2, ring.start + 0.26],
    [0, 0.85, 0.6, 0],
  );
  // later rings are bronze (architecture approaching), early ones steel/teal
  const stroke = i < 3 ? (i % 2 ? "#51b5b5" : "#8a9296") : "#a06a44";
  return (
    <motion.rect
      x={-ring.radius}
      y={-ring.radius * 0.78}
      width={ring.radius * 2}
      height={ring.radius * 1.56}
      rx={ring.rx}
      fill="none"
      stroke={stroke}
      strokeWidth={i < 3 ? 5 : 8}
      style={{ scale, opacity }}
    />
  );
}

function AxialLine({
  p,
  angle,
  index,
}: {
  p: MotionValue<number>;
  angle: number;
  index: number;
}) {
  const x2 = Math.cos(angle) * 560;
  const y2 = Math.sin(angle) * 420;
  const pathLength = useTransform(p, [0.46 + index * 0.02, 0.66], [0, 1]);
  const opacity = useTransform(p, [0.46, 0.52, 0.7, 0.74], [0, 0.7, 0.7, 0]);
  return (
    <motion.line
      x1={Math.cos(angle) * 40}
      y1={Math.sin(angle) * 30}
      x2={x2}
      y2={y2}
      stroke="#22a8aa"
      strokeWidth="2.4"
      strokeLinecap="round"
      style={{ pathLength, opacity }}
    />
  );
}

/* --------------------------------------------------------------- stage 4 */

function CorridorStage({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.68, 0.76], [0, 1]);
  // arrive slightly large and settle — the tail of the axial push
  const scale = useTransform(p, [0.68, 0.8], [1.14, 1]);
  const exitLength = useTransform(p, [0.9, 1], [0, 1]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 900 560"
          className="h-full w-full max-w-6xl px-4"
          role="img"
          aria-label="The wind-catcher passage in one-point perspective: air is captured, channelled, circulated and cools the shared corridor."
        >
          <defs>
            <radialGradient id="wtc-end" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f7ead2" />
              <stop offset="100%" stopColor="#caa36c" />
            </radialGradient>
            <linearGradient id="wtc-frame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b06c4c" />
              <stop offset="100%" stopColor="#6d3f2c" />
            </linearGradient>
          </defs>
          {/* nested terracotta frames — the rings, now architecture */}
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 860 - i * 172;
            const h = 520 - i * 100;
            return (
              <rect
                key={i}
                x={450 - w / 2}
                y={280 - h / 2}
                width={w}
                height={h}
                fill="none"
                stroke="url(#wtc-frame)"
                strokeWidth={9 - i * 1.6}
                opacity={0.95 - i * 0.14}
              />
            );
          })}
          <rect x="398" y="232" width="104" height="96" fill="url(#wtc-end)" />
          <line x1="20" y1="24" x2="398" y2="232" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
          <line x1="880" y1="24" x2="502" y2="232" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
          <line x1="20" y1="536" x2="398" y2="328" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />
          <line x1="880" y1="536" x2="502" y2="328" stroke="#8a5138" strokeWidth="1.4" opacity="0.5" />

          {/* airflow: enters wide, compresses at the throat, divides */}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const yIn = 70 + t * 420;
            const yThroat = 238 + t * 84;
            const yExit = t < 0.5 ? 200 - t * 90 : 340 + (t - 0.5) * 90;
            return (
              <FlowLine
                key={i}
                p={p}
                d={`M-30 ${yIn} C 180 ${yIn}, 300 ${yThroat}, 450 ${yThroat} C 620 ${yThroat}, 700 ${yExit}, 930 ${yExit}`}
                index={i}
              />
            );
          })}

          {/* the line that leaves toward the solar chapter */}
          <motion.path
            d="M450 328 C 452 420, 430 480, 450 600"
            fill="none"
            stroke="#d4b36f"
            strokeWidth="2.4"
            strokeDasharray="2 8"
            strokeLinecap="round"
            style={{ pathLength: exitLength }}
          />
        </svg>
      </motion.div>

      {/* corridor-attached glass labels, in airflow order */}
      {LABELS.map((l, i) => (
        <CorridorLabel key={l.word} p={p} label={l} index={i} />
      ))}
    </motion.div>
  );
}

function FlowLine({ p, d, index }: { p: MotionValue<number>; d: string; index: number }) {
  const pathLength = useTransform(p, [0.72 + (index % 5) * 0.016, 0.92], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="#51b5b5"
      strokeWidth={2.4 - (index % 3) * 0.5}
      strokeLinecap="round"
      opacity={0.7 - (index % 4) * 0.1}
      style={{ pathLength }}
    />
  );
}

function CorridorLabel({
  p,
  label,
  index,
}: {
  p: MotionValue<number>;
  label: (typeof LABELS)[number];
  index: number;
}) {
  const opacity = useTransform(p, [label.at, label.at + 0.04], [0, 1]);
  const y = useTransform(p, [label.at, label.at + 0.04], [10, 0]);
  return (
    <motion.span
      style={{ opacity, y, left: label.x, top: label.y }}
      className="glass-dark absolute rounded-full px-4 py-2 text-xs font-medium tracking-[0.14em] uppercase"
    >
      <span className="text-champagne mr-2 tabular-nums">0{index + 1}</span>
      {label.word}
    </motion.span>
  );
}

/* ------------------------------------------------------ reduced motion -- */

function StaticFallback() {
  return (
    <section
      id="wind"
      data-section="wind"
      className="mineral-windsky grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#171816" } as React.CSSProperties}
      aria-labelledby="wind-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="02" tone="light">
          Renewable support · Wind
        </Eyebrow>
        <h2 id="wind-heading" className="font-display text-ivory text-d2 max-w-[14ch] font-semibold">
          Power shaped by movement.
        </h2>
        <p className="text-ivory/70 text-lead mt-4 max-w-(--container-prose)">
          Wind turbines are planned to convert available wind into renewable electricity.
          A dedicated wind catcher guides high-velocity air into the central corridor
          network — captured, channelled, circulated, cooling the shared spaces.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {LABELS.map((l, i) => (
            <span
              key={l.word}
              className="glass-dark rounded-full px-4 py-2 text-xs font-medium tracking-[0.14em] uppercase"
            >
              <span className="text-champagne mr-2 tabular-nums">0{i + 1}</span>
              {l.word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { POSTER } from "@/lib/scroll-hero-states";

/**
 * Poster-graphic atmosphere behind the silhouette — bold colour planes with
 * assigned meanings (blue = technology/wind, yellow = sun, coral = energy,
 * cyan = airflow, green = nature), a restrained halftone region and one
 * orchid accent in a single transition. Composed, not a gradient wash.
 * Unequal cadence: each plane has its own range and easing windows.
 */

const P = POSTER;

export default function GraphicBackdrop({
  progress,
  staticMode = false,
}: {
  progress: MotionValue<number>;
  staticMode?: boolean;
}) {
  const p = progress;

  /* B — electric blue plane behind the upper building */
  const blueScale = useTransform(p, [0.08, 0.2, 0.44, 0.56, 0.72], [0, 1, 1.12, 0.85, 0.7]);
  const blueX = useTransform(p, [0.23, 0.4, 0.54, 0.7], [0, -40, -10, 60]);
  const blueOpacity = useTransform(p, [0.08, 0.14, 0.9, 0.97], [0, 1, 1, 0.85]);

  /* C — solar disc behind the rooftop */
  const discScale = useTransform(p, [0.13, 0.28, 0.54, 0.66, 0.79], [0, 0.8, 1.9, 2.3, 0.9]);
  const discX = useTransform(p, [0.23, 0.4, 0.54, 0.69, 0.82], [0, -120, -60, 0, 260]);
  const discY = useTransform(p, [0.54, 0.69, 0.82], [0, 60, -80]);
  const discOpacity = useTransform(p, [0.13, 0.2, 0.93, 1], [0, 0.95, 0.95, 0.8]);

  /* D — coral energy plane */
  const coralX = useTransform(p, [0.24, 0.42, 0.82, 0.93], [420, 120, 60, -30]);
  const coralOpacity = useTransform(p, [0.24, 0.3, 0.5, 0.56, 0.82, 0.88], [0, 0.85, 0.85, 0.35, 0.35, 0.9]);
  const coralRotate = useTransform(p, [0.24, 0.93], [-16, -8]);

  /* E — cyan wind route across the whole stage */
  const routeLength = useTransform(p, [0.2, 0.5, 0.8], [0, 0.65, 1]);
  const routeOpacity = useTransform(p, [0.2, 0.26, 0.9, 0.97], [0, 0.9, 0.9, 0.5]);
  /* coral + green nodes travelling the route (state 04) */
  const nodeA = useTransform(p, [0.55, 0.68], [0, 1]);
  const nodeB = useTransform(p, [0.58, 0.7], [0, 1]);
  const nodeADist = useTransform(nodeA, (v) => `${v * 100}%`);
  const nodeBDist = useTransform(nodeB, (v) => `${v * 100}%`);
  const nodesOpacity = useTransform(p, [0.55, 0.58, 0.68, 0.71], [0, 1, 1, 0]);

  /* F — green nature plane near the base */
  const greenOpacity = useTransform(p, [0.55, 0.6, 0.63, 0.66, 0.82, 0.88], [0, 0.7, 0.7, 0.25, 0.25, 0.85]);
  const greenY = useTransform(p, [0.82, 0.93], [40, 0]);

  /* G — halftone region: corner in 01, drifts toward kite path in 03 */
  const halftoneOpacity = useTransform(p, [0.1, 0.16, 0.88, 0.96], [0, 0.5, 0.5, 0.14]);
  const halftoneX = useTransform(p, [0.32, 0.5], [0, 180]);
  const halftoneY = useTransform(p, [0.32, 0.5], [0, -120]);

  /* H — single orchid accent in the 04 -> 05 transition only */
  const orchidOpacity = useTransform(p, [0.66, 0.69, 0.72, 0.75], [0, 0.7, 0.7, 0]);

  /* speed marks near the kite (state 03) */
  const speedOpacity = useTransform(p, [0.42, 0.45, 0.52, 0.55], [0, 0.8, 0.8, 0]);

  /* aqua reflection sliver (state 06) */
  const aquaOpacity = useTransform(p, [0.83, 0.87, 0.93, 0.98], [0, 0.5, 0.5, 0.3]);

  const s = staticMode;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* A — warm cream base + grain lives on the stage element */}

      {/* B — electric blue plane */}
      <motion.div
        className="absolute top-[4%] left-1/2 h-[46%] w-[64%] rounded-[3rem]"
        style={{
          background: P.blue,
          rotate: -7,
          translateX: "-58%",
          ...(s
            ? { opacity: 0.9, scale: 1 }
            : { scale: blueScale, x: blueX, opacity: blueOpacity }),
        }}
      />

      {/* C — solar disc */}
      <motion.div
        className="absolute top-[6%] left-[54%] aspect-square w-[30%] rounded-full"
        style={{
          background: `radial-gradient(circle at 38% 34%, #ffd75e, ${P.yellow})`,
          ...(s ? { opacity: 0.95 } : { scale: discScale, x: discX, y: discY, opacity: discOpacity }),
        }}
      />

      {/* D — coral energy plane */}
      <motion.div
        className="absolute top-[30%] right-[-14%] h-[34%] w-[52%] rounded-[6rem]"
        style={{
          background: P.coral,
          ...(s ? { opacity: 0.85, rotate: -10 } : { x: coralX, rotate: coralRotate, opacity: coralOpacity }),
        }}
      />

      {/* F — green nature plane at the base */}
      <motion.div
        className="absolute bottom-[-6%] left-[6%] h-[22%] w-[56%] rounded-[5rem]"
        style={{
          background: P.green,
          rotate: 4,
          ...(s ? { opacity: 0.8 } : { opacity: greenOpacity, y: greenY }),
        }}
      />

      {/* aqua sliver (residences state) */}
      <motion.div
        className="absolute right-[4%] bottom-[8%] h-[30%] w-[10%] rounded-[3rem]"
        style={{
          background: "linear-gradient(to bottom, #51b5b5, #22a8aa)",
          ...(s ? { opacity: 0.4 } : { opacity: aquaOpacity }),
        }}
      />

      {/* E + G + H + speed marks live in one SVG for crispness */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
        <defs>
          <pattern id="gb-halftone" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2.4" fill={P.blue} />
          </pattern>
        </defs>

        {/* G — halftone region */}
        <motion.rect
          x="1020" y="80" width="360" height="300" rx="24"
          fill="url(#gb-halftone)"
          style={s ? { opacity: 0.35 } : { opacity: halftoneOpacity, x: halftoneX, y: halftoneY }}
        />

        {/* E — cyan wind route weaving between the blocks */}
        <motion.path
          d="M-60 330 C 240 260, 420 380, 700 300 C 830 262, 880 190, 960 160 C 1080 118, 1230 170, 1500 120"
          fill="none" stroke={P.cyan} strokeWidth="5" strokeLinecap="round"
          style={s ? undefined : { pathLength: routeLength, opacity: routeOpacity }}
        />
        {/* travelling nodes */}
        {!s && (
          <>
            <motion.circle
              r="9" fill={P.coral}
              style={{
                offsetPath: `path("M-60 330 C 240 260, 420 380, 700 300 C 830 262, 880 190, 960 160 C 1080 118, 1230 170, 1500 120")`,
                offsetDistance: nodeADist,
                opacity: nodesOpacity,
              }}
            />
            <motion.circle
              r="7" fill={P.green}
              style={{
                offsetPath: `path("M-60 330 C 240 260, 420 380, 700 300 C 830 262, 880 190, 960 160 C 1080 118, 1230 170, 1500 120")`,
                offsetDistance: nodeBDist,
                opacity: nodesOpacity,
              }}
            />
          </>
        )}

        {/* H — orchid accent arc, once */}
        <motion.path
          d="M420 700 C 560 640, 760 660, 900 600"
          fill="none" stroke={P.orchid} strokeWidth="4" strokeLinecap="round"
          style={s ? { opacity: 0 } : { opacity: orchidOpacity }}
        />

        {/* coral speed marks near the kite path (state 03) */}
        <motion.g style={s ? { opacity: 0 } : { opacity: speedOpacity }}>
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={980 + i * 56} y1={150 + i * 34}
              x2={1060 + i * 56} y2={132 + i * 34}
              stroke={P.coral} strokeWidth="5" strokeLinecap="round"
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

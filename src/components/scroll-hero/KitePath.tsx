"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { POSTER } from "@/lib/scroll-hero-states";

/**
 * The kite as a promotional wind-energy motif (state 03). It enters
 * upper-right, follows a curved bezier under scroll control — it moves
 * only as the visitor scrolls, holds position through the solar state,
 * and exits during residences. The cable is a live line from the rooftop
 * winch anchor to the kite's current point, so tension always reads true.
 *
 * Positions are computed from the bezier in plain math so the cable's
 * endpoint and the kite's transform can never drift apart.
 */

// Cubic bezier control points in the overlay's 1440x900 space.
const B0 = { x: 1560, y: -60 }; // enters off-canvas upper-right
const B1 = { x: 1240, y: 60 };
const B2 = { x: 1050, y: 250 };
const B3 = { x: 940, y: 205 }; // hold position above the rear roof

const ANCHOR = { x: 700, y: 320 }; // rooftop winch anchor (stage coords)

function bez(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

export default function KitePath({ progress }: { progress: MotionValue<number> }) {
  // travel over state 03, hold, exit upward during state 06
  const t = useTransform(progress, [0.4, 0.53], [0, 1]);
  const kx = useTransform(t, (v) => bez(v, B0.x, B1.x, B2.x, B3.x));
  const ky = useTransform(t, (v) => bez(v, B0.y, B1.y, B2.y, B3.y));
  const exitY = useTransform(progress, [0.82, 0.9], [0, -320]);
  const opacity = useTransform(progress, [0.4, 0.43, 0.82, 0.88], [0, 1, 1, 0]);
  // gentle bank following travel direction
  const rotate = useTransform(t, [0, 0.5, 1], [-24, -10, -16]);

  const cableD = useTransform([kx, ky, exitY], ([x, y, ey]) => {
    const kxN = x as number;
    const kyN = (y as number) + (ey as number);
    const mx = (ANCHOR.x + kxN) / 2;
    const my = (ANCHOR.y + kyN) / 2 + 26; // slight catenary sag
    return `M${ANCHOR.x} ${ANCHOR.y} Q ${mx} ${my} ${kxN} ${kyN}`;
  });

  return (
    <motion.svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* cable — thin, elegant, always attached */}
      <motion.path d={cableD} fill="none" stroke={POSTER.ink} strokeWidth="1.6" opacity="0.65" />
      {/* kite: cambered red/white canopy */}
      <motion.g style={{ x: kx, y: useTransform([ky, exitY], ([a, b]) => (a as number) + (b as number)), rotate }}>
        <g transform="translate(-46 -18)">
          <path d="M0 22 C 18 2, 74 -6, 92 10 C 80 26, 20 34, 0 22 Z" fill="#e8493a" />
          <path d="M8 20 C 24 6, 68 0, 84 11 C 72 22, 24 28, 8 20 Z" fill="#f6f1e8" />
          <path d="M16 18 C 30 9, 62 5, 76 12 C 66 19, 28 24, 16 18 Z" fill="#e8493a" opacity="0.85" />
          {/* bridle lines */}
          <line x1="18" y1="24" x2="46" y2="40" stroke={POSTER.ink} strokeWidth="1" opacity="0.6" />
          <line x1="74" y1="20" x2="46" y2="40" stroke={POSTER.ink} strokeWidth="1" opacity="0.6" />
        </g>
      </motion.g>
    </motion.svg>
  );
}

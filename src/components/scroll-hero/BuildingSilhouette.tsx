"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { POSTER } from "@/lib/scroll-hero-states";

/**
 * The building as animated architectural poster art — a layered terracotta
 * SVG silhouette derived from the physical model: two blocks, central gap,
 * balcony bands, parapets, shrouded turbines, solar strip, wind catcher.
 *
 * Depth without 3D: a blurred rear duplicate, front/rear block parallax
 * (rear ~10px slower), transition-window chromatic offset duplicates, a
 * colour-shifting glow outline, and an internal airflow route that draws
 * once the facade turns translucent. Every binding is a transform of the
 * single spring-wrapped progress value.
 *
 * ViewBox 0 0 640 620. Blocks: front/left x 70..270, rear/right x 370..570,
 * roofs at y≈120/140, ground at y=560.
 */

const P = POSTER;

/** balcony line ys for a block */
const floors = (top: number) => Array.from({ length: 11 }, (_, i) => top + 36 + i * 34);

export default function BuildingSilhouette({
  progress,
  staticMode = false,
}: {
  progress: MotionValue<number>;
  staticMode?: boolean;
}) {
  const p = progress;

  /* ---- state drivers -------------------------------------------------- */
  const outline = useTransform(p, [0.0, 0.075], [0, 1]); // 00: outline draws
  const gapShift = useTransform(p, [0.02, 0.08], [0, 1]); // blocks separate
  const fill = useTransform(p, [0.09, 0.18], [0, 1]); // 01: terracotta fades in
  const balconies = useTransform(p, [0.12, 0.22], [0, 1]);
  const edgeLight = useTransform(p, [0.13, 0.2, 0.23], [0, 1, 0]); // yellow pass
  const edgeLightX = useTransform(p, [0.13, 0.23], [-220, 240]);
  const turbines = useTransform(p, [0.24, 0.3], [0, 1]); // 02
  const rotor = useTransform(p, [0.23, 0.93], [0, 320]); // degrees, stops at 06
  const catcher = useTransform(p, [0.27, 0.34], [0, 1]);
  const roofRoute = useTransform(p, [0.25, 0.4], [0, 1]); // cyan reaches roof
  const solar = useTransform(p, [0.55, 0.62], [0, 1]); // 04
  const scanX = useTransform(p, [0.57, 0.68], [-140, 560]);
  const winA = useTransform(p, [0.6, 0.66], [0.12, 0.85]); // first warm windows
  const facadeDip = useTransform(p, [0.69, 0.73, 0.8, 0.84], [1, 0.55, 0.55, 1]); // 05
  const innerRoute = useTransform(p, [0.7, 0.82], [0, 1]);
  const flowLines = useTransform(p, [0.71, 0.82], [0, 1]);
  const winB = useTransform(p, [0.83, 0.9], [0.12, 0.9]); // 06: more windows
  const shadowSoft = useTransform(p, [0.82, 0.93], [0.35, 0.18]);
  const chroma = useTransform(
    p,
    [0.08, 0.1, 0.13, 0.4, 0.42, 0.45, 0.69, 0.71, 0.74],
    [0, 1, 0, 0, 1, 0, 0, 1, 0],
  ); // brief 4-7px offsets at three transitions
  const glowColor = useTransform(
    p,
    [0.1, 0.3, 0.5, 0.65, 0.88],
    [P.cyan, P.cyan, P.blue, P.yellow, P.coral],
  );
  const glowDrift = useTransform(p, [0, 1], [0, -3]);

  // front/rear parallax: rear moves ~10px slower across the story
  const rearY = useTransform(p, [0.08, 0.95], [10, 0]);
  const frontY = useTransform(p, [0.08, 0.95], [-4, 4]);
  const gapX = useTransform(gapShift, [0, 1], [10, 0]); // rear slides right
  const gapXfNeg = useTransform(gapShift, [0, 1], [-8, 0]); // front slides left

  // composite drivers (hoisted — hooks may not live inside JSX branches)
  const shadowOpacity = useTransform(
    [fill, shadowSoft],
    ([f, sh]) => (f as number) * (sh as number),
  );
  const frontFillOpacity = useTransform(
    [fill, facadeDip],
    ([f, d]) => (f as number) * (d as number),
  );
  const frontBalconyOpacity = useTransform(
    [balconies, facadeDip],
    ([b, d]) => (b as number) * (d as number),
  );

  const s = staticMode; // render final values without motion

  return (
    <svg
      viewBox="0 0 640 620"
      className="h-full w-auto max-w-full"
      role="presentation"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="bs-facade" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor={P.highlight} />
          <stop offset="38%" stopColor={P.terracotta} />
          <stop offset="100%" stopColor={P.facadeShadow} />
        </linearGradient>
        <linearGradient id="bs-facade-r" x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor={P.terracotta} />
          <stop offset="100%" stopColor={P.facadeShadow} />
        </linearGradient>
        <linearGradient id="bs-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={P.yellow} stopOpacity="0" />
          <stop offset="50%" stopColor={P.yellow} stopOpacity="0.65" />
          <stop offset="100%" stopColor={P.yellow} stopOpacity="0" />
        </linearGradient>
        <filter id="bs-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id="bs-clip-front">
          <rect x="70" y="120" width="200" height="440" />
        </clipPath>
      </defs>

      {/* site-line -------------------------------------------------------- */}
      <motion.g style={s ? undefined : { opacity: outline }}>
        <line x1="8" y1="560" x2="632" y2="560" stroke={P.facadeShadow} strokeWidth="2.5" />
        <line x1="60" y1="576" x2="330" y2="576" stroke={P.facadeShadow} strokeWidth="1.2" opacity="0.4" />
        <line x1="390" y1="576" x2="600" y2="576" stroke={P.facadeShadow} strokeWidth="1.2" opacity="0.4" />
        <rect x="300" y="566" width="46" height="10" fill={P.green} opacity="0.55" />
      </motion.g>

      {/* building-shadow: blurred rear duplicate --------------------------- */}
      <motion.g
        filter="url(#bs-blur)"
        style={s ? { opacity: 0.18 } : { opacity: shadowOpacity, x: 16, y: 12 }}
      >
        <rect x="70" y="120" width="200" height="440" fill={P.facadeShadow} />
        <rect x="370" y="140" width="200" height="420" fill={P.facadeShadow} />
      </motion.g>

      {/* chromatic-offset-shadow duplicates (transition windows only) ------ */}
      <motion.g style={s ? { opacity: 0 } : { opacity: chroma }} aria-hidden="true">
        <rect x="64" y="114" width="200" height="440" fill="none" stroke={P.coral} strokeWidth="2.5" />
        <rect x="377" y="147" width="200" height="420" fill="none" stroke={P.cyan} strokeWidth="2.5" />
      </motion.g>

      {/* ------------------- REAR BLOCK (Abdullah) ------------------------ */}
      <motion.g style={s ? undefined : { y: rearY, x: gapX }}>
        {/* outline first, fill fades over it */}
        <motion.rect
          x="370" y="140" width="200" height="420"
          fill="none" stroke={P.terracotta} strokeWidth="2.5"
          style={s ? undefined : { pathLength: outline }}
        />
        <motion.g style={s ? undefined : { opacity: fill }}>
          <rect x="370" y="140" width="200" height="420" fill="url(#bs-facade-r)" />
          <rect x="370" y="128" width="200" height="14" fill={P.highlight} />
          {/* parapet */}
          <rect x="366" y="108" width="8" height="24" fill={P.terracotta} />
          <rect x="566" y="108" width="8" height="24" fill={P.terracotta} />
        </motion.g>
        {/* balcony-lines */}
        <motion.g style={s ? undefined : { opacity: balconies }}>
          {floors(140).map((y) => (
            <rect key={y} x="370" y={y} width="200" height="5" fill={P.facadeShadow} opacity="0.75" />
          ))}
        </motion.g>
        {/* window-groups B (illuminate in state 06) */}
        <motion.g style={s ? { opacity: 0.9 } : { opacity: winB }}>
          {floors(140).filter((_, i) => i % 2 === 0).map((y) => (
            <g key={y}>
              <rect x="392" y={y + 12} width="30" height="14" rx="1.5" fill={P.yellow} opacity="0.8" />
              <rect x="486" y={y + 12} width="30" height="14" rx="1.5" fill={P.yellow} opacity="0.6" />
            </g>
          ))}
        </motion.g>
        {/* solar strip on rear roof */}
        <motion.g style={s ? { opacity: 1 } : { opacity: solar }}>
          <rect x="386" y="112" width="120" height="14" rx="2" fill={P.blue} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={410 + i * 24} y1="112" x2={410 + i * 24} y2="126" stroke={P.cream} strokeWidth="1.4" opacity="0.7" />
          ))}
        </motion.g>
        {/* shrouded turbine (rear) */}
        <Turbine cx={545} cy={92} r={26} rotor={rotor} appear={turbines} staticMode={s} />
      </motion.g>

      {/* ------------------- FRONT BLOCK (Umer) --------------------------- */}
      <motion.g style={s ? undefined : { y: frontY, x: gapXfNeg }}>
        <motion.rect
          x="70" y="120" width="200" height="440"
          fill="none" stroke={P.terracotta} strokeWidth="2.5"
          style={s ? undefined : { pathLength: outline }}
        />
        <motion.g style={s ? undefined : { opacity: frontFillOpacity }}>
          <rect x="70" y="120" width="200" height="440" fill="url(#bs-facade)" />
          <rect x="70" y="108" width="200" height="14" fill={P.highlight} />
          <rect x="66" y="88" width="8" height="24" fill={P.terracotta} />
          <rect x="266" y="88" width="8" height="24" fill={P.terracotta} />
        </motion.g>
        <motion.g style={s ? undefined : { opacity: frontBalconyOpacity }}>
          {floors(120).map((y) => (
            <rect key={y} x="70" y={y} width="200" height="5" fill={P.facadeShadow} opacity="0.8" />
          ))}
        </motion.g>
        {/* facade-highlight: yellow edge light passing (state 01) */}
        <motion.g clipPath="url(#bs-clip-front)" style={s ? { opacity: 0 } : { opacity: edgeLight }}>
          <motion.rect y="120" width="90" height="440" fill="url(#bs-edge)" style={s ? undefined : { x: edgeLightX }} />
        </motion.g>
        {/* window-groups A (warm in state 04) */}
        <motion.g style={s ? { opacity: 0.85 } : { opacity: winA }}>
          {floors(120).filter((_, i) => i % 3 === 1).map((y) => (
            <g key={y}>
              <rect x="94" y={y + 12} width="30" height="14" rx="1.5" fill={P.yellow} opacity="0.8" />
              <rect x="188" y={y + 12} width="30" height="14" rx="1.5" fill={P.yellow} opacity="0.65" />
            </g>
          ))}
        </motion.g>
        {/* solar strip + scan */}
        <motion.g style={s ? { opacity: 1 } : { opacity: solar }}>
          <rect x="130" y="92" width="120" height="14" rx="2" fill={P.blue} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={154 + i * 24} y1="92" x2={154 + i * 24} y2="106" stroke={P.cream} strokeWidth="1.4" opacity="0.7" />
          ))}
          {!s && (
            <motion.rect
              y="88" width="34" height="22" fill={P.yellow} opacity="0.55"
              style={{ x: scanX, skewX: -18 }}
            />
          )}
        </motion.g>
        {/* shrouded turbine (front) */}
        <Turbine cx={100} cy={72} r={30} rotor={rotor} appear={turbines} staticMode={s} />
      </motion.g>

      {/* wind-catcher in the central gap ---------------------------------- */}
      <motion.g style={s ? undefined : { opacity: catcher }}>
        <rect x="296" y="96" width="48" height="80" fill={P.facadeShadow} />
        <rect x="292" y="88" width="56" height="10" fill={P.highlight} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="300" y={108 + i * 20} width="40" height="7" fill={P.cream} opacity="0.75" />
        ))}
        {/* catcher throat continuing down into the gap */}
        <rect x="310" y="176" width="20" height="60" fill={P.facadeShadow} opacity="0.6" />
      </motion.g>

      {/* airflow-route: cyan wind entering, roof -> catcher ---------------- */}
      <motion.path
        d="M-60 150 C 60 120, 150 140, 250 108 C 290 96, 306 100, 318 118"
        fill="none" stroke={P.cyan} strokeWidth="3.5" strokeLinecap="round"
        style={s ? undefined : { pathLength: roofRoute }}
        opacity="0.9"
      />
      {/* internal route through the architecture (state 05) --------------- */}
      <motion.g style={s ? { opacity: 0 } : { opacity: innerRoute }}>
        <motion.path
          d="M320 176 L320 400 M320 260 L200 260 M320 260 L470 260 M320 400 L150 400 M320 400 L500 400 M320 400 L320 552"
          fill="none" stroke={P.cyan} strokeWidth="2.6" strokeLinecap="round"
          strokeDasharray="1 9"
          style={s ? undefined : { pathLength: innerRoute }}
        />
        {/* flow lines drifting through corridors */}
        {[236, 254, 272, 384, 402, 418].map((y, i) => (
          <motion.path
            key={y}
            d={`M${i % 2 ? 160 : 190} ${y} C 260 ${y - 6}, 380 ${y + 6}, ${i % 2 ? 500 : 470} ${y}`}
            fill="none" stroke={P.cyan} strokeWidth="1.6" strokeLinecap="round" opacity={0.55 - (i % 3) * 0.12}
            style={s ? undefined : { pathLength: flowLines }}
          />
        ))}
      </motion.g>

      {/* glow-outline: colour-shifting poster edge ------------------------- */}
      <motion.g style={s ? { opacity: 0.55 } : { opacity: fill, y: glowDrift }}>
        <motion.rect
          x="63" y="113" width="214" height="454" fill="none" strokeWidth="2"
          style={s ? { stroke: P.coral } : { stroke: glowColor, pathLength: outline }}
          opacity="0.55"
        />
        <motion.rect
          x="363" y="133" width="214" height="434" fill="none" strokeWidth="2"
          style={s ? { stroke: P.coral } : { stroke: glowColor, pathLength: outline }}
          opacity="0.4"
        />
      </motion.g>
    </svg>
  );
}

/** Shrouded turbine: outer ring, housing depth, 4-blade rotor, arms. */
function Turbine({
  cx,
  cy,
  r,
  rotor,
  appear,
  staticMode,
}: {
  cx: number;
  cy: number;
  r: number;
  rotor: MotionValue<number>;
  appear: MotionValue<number>;
  staticMode: boolean;
}) {
  return (
    <motion.g style={staticMode ? undefined : { opacity: appear }}>
      {/* mast */}
      <rect x={cx - 3} y={cy + r - 4} width="6" height={120 - r} fill={POSTER.facadeShadow} />
      {/* housing depth */}
      <circle cx={cx} cy={cy} r={r - 3} fill="#22303a" />
      {/* rotor */}
      <motion.g style={staticMode ? undefined : { rotate: rotor, originX: `${cx}px`, originY: `${cy}px` }}>
        {[0, 90, 180, 270].map((a) => (
          <rect
            key={a}
            x={cx - 2.5}
            y={cy - r + 5}
            width="5"
            height={r - 8}
            rx="2"
            fill="#dfe3e6"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
      </motion.g>
      <circle cx={cx} cy={cy} r={4.5} fill="#b9bec2" />
      {/* shroud ring + arms */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8ccce" strokeWidth="4.5" />
      {[30, 150, 270].map((a) => (
        <line
          key={a}
          x1={cx}
          y1={cy}
          x2={(cx + (r + 6) * Math.cos((a * Math.PI) / 180)).toFixed(2)}
          y2={(cy + (r + 6) * Math.sin((a * Math.PI) / 180)).toFixed(2)}
          stroke={POSTER.facadeShadow}
          strokeWidth="2.5"
        />
      ))}
    </motion.g>
  );
}

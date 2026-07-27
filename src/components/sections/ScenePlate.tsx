/**
 * Original architectural plates — no photography, no stock, no third-party
 * imagery. Each is pure CSS/SVG built from the cinematography bible's
 * material and lighting language, so they weigh nothing and scale cleanly.
 *
 * These stand in for approved renders. When real photography arrives, swap
 * the plate for an <Image> and the surrounding scroll behaviour is untouched.
 */

export type PlateId = "living" | "bedroom" | "balcony" | "pool";

export function ScenePlate({ id }: { id: PlateId }) {
  switch (id) {
    case "living":
      return <LivingPlate />;
    case "bedroom":
      return <BedroomPlate />;
    case "balcony":
      return <BalconyPlate />;
    case "pool":
      return <PoolPlate />;
  }
}

/** Warm interior with the clean rectangle of golden sun across the floor. */
function LivingPlate() {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id="lv-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9dccc" />
          <stop offset="100%" stopColor="#cdb49c" />
        </linearGradient>
        <linearGradient id="lv-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d6647" />
          <stop offset="100%" stopColor="#5e4230" />
        </linearGradient>
        <linearGradient id="lv-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd79a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ef8a17" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="url(#lv-wall)" />
      <rect y="360" width="800" height="200" fill="url(#lv-floor)" />
      {/* Golden-hour rectangle — the quiet architectural moment. */}
      <polygon points="250,360 470,360 560,560 150,560" fill="url(#lv-sun)" />
      {/* Window opening casting it */}
      <rect x="524" y="92" width="180" height="240" rx="3" fill="#f6e6cd" opacity="0.92" />
      <rect x="524" y="92" width="180" height="240" rx="3" fill="none" stroke="#87543e" strokeWidth="6" />
      <line x1="614" y1="92" x2="614" y2="332" stroke="#87543e" strokeWidth="4" />
      {/* Seating mass, kept as simple architectural volume */}
      <rect x="96" y="286" width="250" height="78" rx="10" fill="#ae7f63" />
      <rect x="112" y="264" width="60" height="30" rx="8" fill="#c9a486" />
      <rect x="186" y="264" width="60" height="30" rx="8" fill="#c9a486" />
    </svg>
  );
}

/** Calm bedroom, cream and shadow, light entering from one side. */
function BedroomPlate() {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id="bd-wall" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3ece1" />
          <stop offset="100%" stopColor="#c3b6a6" />
        </linearGradient>
        <linearGradient id="bd-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d5b41" />
          <stop offset="100%" stopColor="#4f3828" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="url(#bd-wall)" />
      <rect y="400" width="800" height="160" fill="url(#bd-floor)" />
      {/* Bed volume */}
      <rect x="180" y="300" width="440" height="130" rx="8" fill="#efe7dd" />
      <rect x="180" y="300" width="440" height="34" rx="8" fill="#dbcfbf" />
      <rect x="212" y="268" width="130" height="42" rx="10" fill="#f6f1e8" />
      <rect x="458" y="268" width="130" height="42" rx="10" fill="#f6f1e8" />
      {/* Headboard */}
      <rect x="168" y="150" width="464" height="126" rx="6" fill="#87543e" />
      {/* Soft light wash from the left */}
      <rect width="330" height="560" fill="#ffe7bd" opacity="0.28" />
    </svg>
  );
}

/** Terracotta balcony opening — the wind arriving at the residence. */
function BalconyPlate() {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id="bl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fc6d8" />
          <stop offset="100%" stopColor="#f2c98d" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="#ae6649" />
      {/* Opening onto sky */}
      <rect x="150" y="80" width="500" height="400" rx="4" fill="url(#bl-sky)" />
      {/* Balcony rail */}
      <rect x="150" y="386" width="500" height="10" fill="#c17b58" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect key={i} x={172 + i * 56} y="396" width="7" height="84" fill="#c17b58" />
      ))}
      {/* Airflow lines entering the opening — 10 strokes, not a particle field */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M170 ${140 + i * 46} C 320 ${118 + i * 46}, 470 ${168 + i * 46}, 630 ${134 + i * 46}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.42 - i * 0.05}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      <rect y="480" width="800" height="80" fill="#8b5138" />
    </svg>
  );
}

/** Pool — top-down turquoise with caustic geometry. */
function PoolPlate() {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id="pl-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#63c6c4" />
          <stop offset="100%" stopColor="#125d6a" />
        </linearGradient>
        <filter id="pl-caustic">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.03" numOctaves="2" seed="7" />
          <feColorMatrix
            values="0 0 0 0 0.85  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1"
          />
        </filter>
      </defs>
      <rect width="800" height="560" fill="#d9cebd" />
      <rect x="70" y="60" width="660" height="440" rx="6" fill="url(#pl-water)" />
      {/* Caustics: one static filtered rect, never animated */}
      <rect x="70" y="60" width="660" height="440" filter="url(#pl-caustic)" opacity="0.5" />
      {/* Lane / edge geometry */}
      <rect x="70" y="60" width="660" height="440" rx="6" fill="none" stroke="#efe7dd" strokeWidth="10" />
      <circle cx="400" cy="280" r="46" fill="#efe7dd" opacity="0.16" />
    </svg>
  );
}

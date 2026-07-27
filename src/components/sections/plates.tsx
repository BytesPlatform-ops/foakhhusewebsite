/**
 * Cinematic plate library — original illustrated scenes, no photography,
 * no stock, no third-party imagery. Each plate is composed like a film
 * frame: gradient light fields, a few geometry shapes, soft shadow, and a
 * vignette — not flat vector clip-art. They stand in for approved renders;
 * when photography arrives each plate swaps for an <Image> without touching
 * the surrounding scroll behaviour.
 *
 * Shared conventions: 800x560 viewBox, per-plate unique gradient ids,
 * role="presentation" (captions live in the owning section).
 */

export type PlateId =
  | "living"
  | "layout"
  | "balcony"
  | "curtain"
  | "family"
  | "pool"
  | "lobby"
  | "parking"
  | "recreation"
  | "security"
  | "facade"
  | "site";

export function Plate({ id }: { id: PlateId }) {
  const P = REGISTRY[id];
  return <P />;
}

/** Soft vignette + film grade used by every plate. */
function Grade({ uid, warm = true }: { uid: string; warm?: boolean }) {
  return (
    <>
      <radialGradient id={`${uid}-vig`} cx="50%" cy="46%" r="72%">
        <stop offset="62%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor={warm ? "#2d211d" : "#0d1418"} stopOpacity="0.38" />
      </radialGradient>
    </>
  );
}
// `warm` is decorative parity with Grade — the gradient id carries the tone.
const VigRect = ({ uid }: { uid: string; warm?: boolean }) => (
  <rect width="800" height="560" fill={`url(#${uid}-vig)`} />
);

/* ---------------------------------------------------------- residences --- */

/** 01 — eye-level room corner, 30mm feel, golden rectangle on the floor. */
function Living() {
  const u = "pl-lv";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-wall`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f2e9db" />
          <stop offset="100%" stopColor="#cbb096" />
        </linearGradient>
        <linearGradient id={`${u}-wall2`} x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0%" stopColor="#e3d3bd" />
          <stop offset="100%" stopColor="#b2917a" />
        </linearGradient>
        <linearGradient id={`${u}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#95684a" />
          <stop offset="100%" stopColor="#583c2b" />
        </linearGradient>
        <linearGradient id={`${u}-sun`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ffdf9e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ef8a17" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`${u}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe3ea" />
          <stop offset="70%" stopColor="#f6e3bd" />
          <stop offset="100%" stopColor="#eabf7f" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      {/* room corner: two wall planes meeting left of centre */}
      <polygon points="0,0 300,28 300,398 0,430" fill={`url(#${u}-wall2)`} />
      <polygon points="300,28 800,0 800,392 300,398" fill={`url(#${u}-wall)`} />
      <polygon points="0,430 300,398 800,392 800,560 0,560" fill={`url(#${u}-floor)`} />
      {/* balcony opening as the light source */}
      <rect x="560" y="70" width="182" height="300" fill={`url(#${u}-glass)`} />
      <rect x="560" y="70" width="182" height="300" fill="none" stroke="#7c4a35" strokeWidth="7" />
      <line x1="651" y1="70" x2="651" y2="370" stroke="#7c4a35" strokeWidth="4" />
      {/* light across the floor from the opening */}
      <polygon points="560,392 742,388 690,560 388,560" fill={`url(#${u}-sun)`} />
      {/* seating mass, low and calm */}
      <g>
        <rect x="80" y="330" width="270" height="86" rx="12" fill="#a97a5d" />
        <rect x="80" y="316" width="270" height="26" rx="10" fill="#c39a7c" />
        <rect x="98" y="288" width="76" height="34" rx="9" fill="#d8b494" />
        <rect x="188" y="288" width="76" height="34" rx="9" fill="#d8b494" />
        <ellipse cx="215" cy="428" rx="150" ry="14" fill="#2d211d" opacity="0.22" />
      </g>
      {/* low table */}
      <ellipse cx="470" cy="470" rx="88" ry="26" fill="#6b4a35" />
      <ellipse cx="470" cy="462" rx="88" ry="24" fill="#8a6248" />
      <VigRect uid={u} />
    </svg>
  );
}

/** 02 — 55–65 degree overhead conceptual layout fragment. */
function Layout() {
  const u = "pl-ly";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#efe7dd" />
          <stop offset="100%" stopColor="#d5c5ae" />
        </linearGradient>
        <linearGradient id={`${u}-room`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9d9c2" />
          <stop offset="100%" stopColor="#cdb091" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-paper)`} />
      {/* sheared plan fragment to read as an overhead view, not a flat map */}
      <g transform="translate(120 60) skewX(-8)">
        <rect x="0" y="0" width="520" height="420" fill={`url(#${u}-room)`} stroke="#87543e" strokeWidth="3" />
        <line x1="210" y1="0" x2="210" y2="420" stroke="#87543e" strokeWidth="2.4" />
        <line x1="210" y1="200" x2="520" y2="200" stroke="#87543e" strokeWidth="2.4" />
        <line x1="0" y1="290" x2="210" y2="290" stroke="#87543e" strokeWidth="2.4" />
        {/* balcony strip */}
        <rect x="0" y="420" width="520" height="34" fill="#b66d4d" opacity="0.55" />
        {/* door arcs */}
        <path d="M210 96 a52 52 0 0 1 52 52" fill="none" stroke="#87543e" strokeWidth="2" />
        <path d="M96 290 a44 44 0 0 1 44 44" fill="none" stroke="#87543e" strokeWidth="2" />
        {/* airflow through the plan */}
        <path d="M-30 230 C 120 200, 320 250, 560 210" fill="none" stroke="#22a8aa" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" opacity="0.75" />
      </g>
      <text x="132" y="530" fontSize="15" letterSpacing="2.5" fill="#87543e">
        CONCEPTUAL LAYOUT — FINAL PLANS AWAITING APPROVAL
      </text>
      <VigRect uid={u} />
    </svg>
  );
}

/** 03 — from inside the residence looking out, rail in the foreground. */
function Balcony() {
  const u = "pl-bc";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fb5ca" />
          <stop offset="55%" stopColor="#dbe6dd" />
          <stop offset="100%" stopColor="#f4c98c" />
        </linearGradient>
        <linearGradient id={`${u}-frame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5138" />
          <stop offset="100%" stopColor="#5f3826" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      {/* interior surround, darker than the day outside */}
      <rect width="800" height="560" fill={`url(#${u}-frame)`} />
      {/* the opening */}
      <rect x="96" y="54" width="608" height="430" fill={`url(#${u}-sky)`} />
      {/* neighbouring block edge on one side */}
      <g opacity="0.85">
        <rect x="96" y="96" width="118" height="388" fill="#b06c4c" />
        {[0, 1, 2, 3, 4, 5].map((f) => (
          <rect key={f} x="110" y={116 + f * 62} width="90" height="10" fill="#8a5138" />
        ))}
      </g>
      {/* wind lines drifting past */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M250 ${150 + i * 74} C 400 ${132 + i * 74}, 540 ${170 + i * 74}, 690 ${144 + i * 74}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.5 - i * 0.12}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ))}
      {/* balcony rail close in the foreground */}
      <rect x="96" y="398" width="608" height="12" fill="#3f2a1e" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <rect key={i} x={118 + i * 60} y="410" width="8" height="74" fill="#3f2a1e" />
      ))}
      <rect x="96" y="480" width="608" height="8" fill="#33221a" />
      <VigRect uid={u} />
    </svg>
  );
}

/** 04 — side angle: curtain, light and airflow moving through material. */
function Curtain() {
  const u = "pl-ct";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-room`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#3c2b20" />
          <stop offset="55%" stopColor="#8a6349" />
          <stop offset="100%" stopColor="#f3dcb4" />
        </linearGradient>
        <linearGradient id={`${u}-curtain`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fdf6ea" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#f2dab2" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${u}-shaft`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe1a1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffe1a1" stopOpacity="0" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-room)`} />
      {/* light shaft entering from the right opening */}
      <polygon points="800,60 800,470 360,560 220,560" fill={`url(#${u}-shaft)`} />
      {/* curtain panels, caught mid-billow */}
      <path
        d="M560 40 C 520 190, 600 300, 545 520 L 610 520 C 660 330, 600 200, 640 40 Z"
        fill={`url(#${u}-curtain)`}
      />
      <path
        d="M660 40 C 636 200, 706 320, 665 520 L 716 520 C 756 340, 706 180, 736 40 Z"
        fill={`url(#${u}-curtain)`}
        opacity="0.85"
      />
      {/* airflow route entering the room */}
      <path
        d="M780 210 C 620 240, 430 200, 240 260 C 160 286, 110 330, 60 392"
        fill="none"
        stroke="#22a8aa"
        strokeWidth="2.6"
        strokeDasharray="1 10"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* floor */}
      <rect y="470" width="800" height="90" fill="#4a3423" />
      <VigRect uid={u} />
    </svg>
  );
}

/** 05 — top-down family table, circular composition (video shot 4). */
function Family() {
  const u = "pl-fm";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <radialGradient id={`${u}-wood`} cx="50%" cy="46%" r="70%">
          <stop offset="0%" stopColor="#8a5c3c" />
          <stop offset="100%" stopColor="#54341f" />
        </radialGradient>
        <radialGradient id={`${u}-orange`} cx="46%" cy="42%" r="66%">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="60%" stopColor="#f0921f" />
          <stop offset="100%" stopColor="#c96a12" />
        </radialGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-wood)`} />
      {/* place settings around the circle */}
      {[
        [400, 96], [608, 180], [640, 380], [400, 470], [166, 380], [196, 180],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="52" fill="#f4ede2" />
          <circle cx={x} cy={y} r="40" fill="#e8ddcd" />
          <rect x={x - 76} y={y - 14} width="16" height="34" rx="4" fill="#8b1719" opacity="0.9" />
        </g>
      ))}
      {/* the central orange — sun, pool and energy in one circle */}
      <circle cx="400" cy="284" r="86" fill={`url(#${u}-orange)`} />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={400 + Math.cos(a) * 18}
            y1={284 + Math.sin(a) * 18}
            x2={400 + Math.cos(a) * 78}
            y2={284 + Math.sin(a) * 78}
            stroke="#fff3d8"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })}
      <VigRect uid={u} />
    </svg>
  );
}

/* ------------------------------------------------------------ amenities --- */

/** Pool from ~60 degrees overhead — aqua field with caustic light. */
function Pool() {
  const u = "pl-po";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-water`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6fd0cd" />
          <stop offset="100%" stopColor="#0f5665" />
        </linearGradient>
        <filter id={`${u}-caustic`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.016 0.034" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 0.9" />
        </filter>
        <Grade uid={u} warm={false} />
      </defs>
      <rect width="800" height="560" fill="#dccdb8" />
      {/* deck lines */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={40 + i * 22} y1="0" x2={10 + i * 22} y2="560" stroke="#c4b096" strokeWidth="3" />
      ))}
      <g transform="rotate(-3 400 280)">
        <rect x="120" y="70" width="600" height="420" rx="10" fill={`url(#${u}-water)`} />
        <rect x="120" y="70" width="600" height="420" rx="10" filter={`url(#${u}-caustic)`} opacity="0.42" />
        <rect x="120" y="70" width="600" height="420" rx="10" fill="none" stroke="#f2ecdd" strokeWidth="9" />
        {/* lane shadow + float line */}
        <line x1="180" y1="120" x2="660" y2="440" stroke="#0c4552" strokeWidth="20" opacity="0.24" strokeLinecap="round" />
        <circle cx="330" cy="240" r="14" fill="#f2ecdd" opacity="0.5" />
      </g>
      <VigRect uid={u} warm={false} />
    </svg>
  );
}

/** Elevator lobby — perfect one-point perspective, warm linear light. */
function Lobby() {
  const u = "pl-lb";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-glow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9c4" />
          <stop offset="100%" stopColor="#caa36c" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill="#241a14" />
      {/* nested receding frames toward the lit end */}
      {[0, 1, 2, 3, 4].map((i) => {
        const inset = i * 74;
        return (
          <rect
            key={i}
            x={130 + inset * 0.9}
            y={60 + inset * 0.62}
            width={540 - inset * 1.8}
            height={430 - inset * 1.24}
            fill="none"
            stroke="#a06a44"
            strokeWidth={5 - i * 0.7}
            opacity={0.9 - i * 0.13}
          />
        );
      })}
      {/* end light */}
      <rect x="352" y="252" width="96" height="122" fill={`url(#${u}-glow)`} />
      {/* ceiling light strips converging */}
      <polygon points="130,60 670,60 448,252 352,252" fill="#ffdf9e" opacity="0.1" />
      {/* floor reflection */}
      <polygon points="130,490 670,490 448,374 352,374" fill="#ffdf9e" opacity="0.14" />
      {/* airflow line travelling the corridor */}
      <path d="M140 300 C 300 280, 520 316, 396 312" fill="none" stroke="#22a8aa" strokeWidth="2.4" strokeDasharray="2 9" strokeLinecap="round" opacity="0.8" />
      <VigRect uid={u} />
    </svg>
  );
}

/** Parking — camera low to the floor, 22mm, road marking leads the eye. */
function Parking() {
  const u = "pl-pk";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-floor`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#191817" />
          <stop offset="100%" stopColor="#3a3835" />
        </linearGradient>
        <radialGradient id={`${u}-head`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9bd" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe9bd" stopOpacity="0" />
        </radialGradient>
        <Grade uid={u} warm={false} />
      </defs>
      <rect width="800" height="560" fill="#221f1d" />
      <polygon points="0,560 800,560 640,220 160,220" fill={`url(#${u}-floor)`} />
      {/* columns receding */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={1 - i * 0.24}>
          <rect x={116 + i * 96} y={220 - i * 26} width={26 - i * 5} height={200 + i * 60} fill="#33302c" />
          <rect x={660 - i * 96} y={220 - i * 26} width={26 - i * 5} height={200 + i * 60} fill="#33302c" />
          <rect x={116 + i * 96} y={220 - i * 26} width={26 - i * 5} height={8} fill="#c17b58" />
          <rect x={660 - i * 96} y={220 - i * 26} width={26 - i * 5} height={8} fill="#c17b58" />
        </g>
      ))}
      {/* leading road marking */}
      <polygon points="380,560 420,560 404,240 396,240" fill="#d8cdbb" opacity="0.85" />
      {/* vehicle silhouette + one headlight */}
      <g>
        <rect x="474" y="330" width="200" height="74" rx="20" fill="#0e0d0c" />
        <rect x="500" y="300" width="140" height="46" rx="16" fill="#0e0d0c" />
        <circle cx="492" cy="360" r="40" fill={`url(#${u}-head)`} />
        <rect x="474" y="404" width="200" height="10" fill="#000" opacity="0.5" />
      </g>
      {/* ceiling light strips */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={240 + i * 120} y={120 - i * 18} width={80 - i * 14} height="7" rx="3" fill="#ffe2ae" opacity={0.8 - i * 0.2} />
      ))}
      <VigRect uid={u} warm={false} />
    </svg>
  );
}

/** Family recreation — garden green, warm light, layered planting. */
function Recreation() {
  const u = "pl-rc";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e6c4" />
          <stop offset="100%" stopColor="#e5c690" />
        </linearGradient>
        <linearGradient id={`${u}-lawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d9678" />
          <stop offset="100%" stopColor="#3f5f4b" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-sky)`} />
      {/* building edge with balconies, soft in the background */}
      <g opacity="0.72">
        <rect x="580" y="40" width="180" height="330" fill="#b06c4c" />
        {[0, 1, 2, 3, 4].map((f) => (
          <rect key={f} x="596" y={64 + f * 62} width="148" height="10" fill="#8a5138" />
        ))}
      </g>
      {/* lawn */}
      <polygon points="0,360 800,330 800,560 0,560" fill={`url(#${u}-lawn)`} />
      {/* path curving through */}
      <path d="M60 560 C 240 460, 420 500, 720 380" fill="none" stroke="#d8cdbb" strokeWidth="26" strokeLinecap="round" opacity="0.85" />
      {/* trees: canopy discs with shadow */}
      {[
        [150, 320, 66], [330, 292, 50], [520, 322, 58],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + r * 0.98} rx={r * 0.9} ry={r * 0.2} fill="#2d211d" opacity="0.2" />
          <rect x={x - 5} y={y} width="10" height={r * 0.9} fill="#5f3f2b" />
          <circle cx={x} cy={y - r * 0.35} r={r * 0.72} fill="#48704f" />
          <circle cx={x - r * 0.3} cy={y - r * 0.5} r={r * 0.4} fill="#5c8a63" />
        </g>
      ))}
      {/* swing frame */}
      <g stroke="#6b4a35" strokeWidth="9" strokeLinecap="round">
        <line x1="620" y1="470" x2="662" y2="392" />
        <line x1="740" y1="470" x2="700" y2="392" />
        <line x1="656" y1="396" x2="706" y2="396" />
      </g>
      <line x1="672" y1="398" x2="672" y2="440" stroke="#3f2a1e" strokeWidth="3" />
      <line x1="692" y1="398" x2="692" y2="440" stroke="#3f2a1e" strokeWidth="3" />
      <rect x="664" y="440" width="36" height="7" rx="3" fill="#3f2a1e" />
      <VigRect uid={u} />
    </svg>
  );
}

/** Security — the entrance at slight low angle, warm practical light. */
function Security() {
  const u = "pl-sc";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20242a" />
          <stop offset="100%" stopColor="#4a3a30" />
        </linearGradient>
        <linearGradient id={`${u}-door`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9c4" />
          <stop offset="100%" stopColor="#d8a95f" />
        </linearGradient>
        <Grade uid={u} warm={false} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-dusk)`} />
      {/* entrance mass, slight low angle: verticals lean outward gently */}
      <polygon points="150,540 200,90 600,90 650,540" fill="#8a5138" />
      <polygon points="200,90 230,40 570,40 600,90" fill="#6d3f2c" />
      {/* lit lobby door */}
      <polygon points="330,540 344,220 456,220 470,540" fill={`url(#${u}-door)`} />
      <line x1="400" y1="220" x2="400" y2="540" stroke="#8a5138" strokeWidth="5" />
      {/* canopy + downlights */}
      <rect x="266" y="196" width="268" height="16" fill="#3f2a1e" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={318 + i * 82} cy="224" r="12" fill="#ffe2ae" opacity="0.8" />
      ))}
      {/* subtle camera + intercom detail, not a shield icon */}
      <rect x="252" y="300" width="26" height="40" rx="6" fill="#2d211d" />
      <circle cx="265" cy="312" r="5" fill="#22a8aa" opacity="0.9" />
      {/* forecourt */}
      <polygon points="0,560 800,560 690,500 110,500" fill="#33302c" />
      <line x1="400" y1="560" x2="400" y2="502" stroke="#c9baa6" strokeWidth="5" opacity="0.6" />
      <VigRect uid={u} warm={false} />
    </svg>
  );
}

/* -------------------------------------------------------------- gallery --- */

/** Building front elevation — schematic, honestly labelled by its caption. */
function Facade() {
  const u = "pl-fc";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8cddb" />
          <stop offset="100%" stopColor="#f0dcb4" />
        </linearGradient>
        <linearGradient id={`${u}-face`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c2795a" />
          <stop offset="100%" stopColor="#8a5138" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-sky)`} />
      {[210, 470].map((cx, b) => (
        <g key={b}>
          <rect x={cx - 90} y="80" width="180" height="400" fill={`url(#${u}-face)`} />
          {Array.from({ length: 10 }).map((_, f) => (
            <g key={f}>
              <rect x={cx - 90} y={102 + f * 38} width="180" height="7" fill="#6d3f2c" />
              {[0, 1, 2].map((w) => (
                <rect key={w} x={cx - 72 + w * 56} y={112 + f * 38} width="34" height="18" fill="#22303a" opacity="0.85" />
              ))}
            </g>
          ))}
          <rect x={cx - 90} y="64" width="180" height="18" fill="#c17b58" />
        </g>
      ))}
      {/* ground + road */}
      <rect y="480" width="800" height="80" fill="#8f8577" />
      <rect y="500" width="800" height="34" fill="#3b3a37" />
      <VigRect uid={u} />
    </svg>
  );
}

/** Site view — the road geometry from the physical model, high angle. */
function Site() {
  const u = "pl-st";
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="presentation">
      <defs>
        <linearGradient id={`${u}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9cebd" />
          <stop offset="100%" stopColor="#b7a68d" />
        </linearGradient>
        <Grade uid={u} />
      </defs>
      <rect width="800" height="560" fill={`url(#${u}-ground)`} />
      <g transform="translate(90 60) skewX(-10)">
        {/* road */}
        <rect x="-40" y="300" width="700" height="86" fill="#3b3a37" />
        <rect x="-40" y="322" width="700" height="5" fill="#c9baa6" />
        <rect x="-40" y="360" width="700" height="5" fill="#c9baa6" />
        {/* green strip */}
        <rect x="-40" y="396" width="700" height="42" fill="#4c7056" />
        {/* two block footprints, extruded a little */}
        {[60, 380].map((x, b) => (
          <g key={b}>
            <rect x={x + 12} y="88" width="180" height="128" fill="#6d3f2c" />
            <rect x={x} y="76" width="180" height="128" fill="#b06c4c" />
            <rect x={x} y="76" width="180" height="16" fill="#c98a68" />
          </g>
        ))}
        {/* central shared square */}
        <rect x="288" y="220" width="66" height="52" fill="#c9baa6" />
        <rect x="298" y="228" width="46" height="36" fill="#4c7056" />
      </g>
      <VigRect uid={u} />
    </svg>
  );
}

const REGISTRY: Record<PlateId, () => React.ReactElement> = {
  living: Living,
  layout: Layout,
  balcony: Balcony,
  curtain: Curtain,
  family: Family,
  pool: Pool,
  lobby: Lobby,
  parking: Parking,
  recreation: Recreation,
  security: Security,
  facade: Facade,
  site: Site,
};

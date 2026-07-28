"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Branded map card interior for the Location section.
 *
 * Loads the Google Maps JavaScript API dynamically (only once the card
 * is actually on screen, never blocking initial render) when
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured. With a Map ID
 * (NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) the marker uses
 * AdvancedMarkerElement with a custom Foakh pin; without one the map
 * falls back to inline styling JSON and a custom SVG pin icon.
 *
 * When no key is configured — or the API fails — the card renders the
 * branded illustrative fallback, clearly labelled as illustrative, with
 * the external Google Maps link as the source of truth for navigation.
 */

export const FOAKH_TOWER_LOCATION = {
  lat: 25.0407493,
  lng: 67.4501243,
};

export const FOAKH_MAPS_URL = "https://maps.app.goo.gl/WfWt1ugz5HmEpXur6";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

/* Inline styling for the no-Map-ID path: deep warm base, sunset roads,
   muted green nature, ivory labels, POI clutter off. */
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#3a241c" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#f2e2ce" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#2a1712" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#8a5637" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f29a3f" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d8ae62" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#b3703f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#243f33" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#43302a" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#2e4437" }] },
];

type MapStatus = "idle" | "loading" | "ready" | "fallback";

let loaderPromise: Promise<void> | null = null;

function loadMapsScript(key: string): Promise<void> {
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=marker&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("maps script failed"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

function buildPinSvg(): string {
  /* coral pin, champagne rim, espresso core — no default red marker */
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58">
        <path d="M22 2C11 2 3 10.4 3 20.8 3 34 22 56 22 56s19-22 19-35.2C41 10.4 33 2 22 2Z"
          fill="#E7653E" stroke="#D8AE62" stroke-width="2.4"/>
        <circle cx="22" cy="20.5" r="8.2" fill="#291A16"/>
        <path d="M18 24v-6.5l4-2.6 4 2.6V24h-2.6v-3.4h-2.8V24Z" fill="#FFF4E5"/>
      </svg>`
    )
  );
}

export default function FoakhMap({ heightClass = "h-full" }: { heightClass?: string }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapStatus>(API_KEY ? "idle" : "fallback");

  useEffect(() => {
    if (!API_KEY) return;
    const holder = holderRef.current;
    if (!holder) return;

    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setStatus("loading");
        loadMapsScript(API_KEY)
          .then(async () => {
            if (cancelled || !holderRef.current) return;
            const g = (window as unknown as { google?: typeof google }).google;
            if (!g?.maps) throw new Error("maps unavailable");
            const map = new g.maps.Map(holderRef.current, {
              center: FOAKH_TOWER_LOCATION,
              zoom: 13,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: "cooperative",
              keyboardShortcuts: true,
              backgroundColor: "#3a241c",
              ...(MAP_ID ? { mapId: MAP_ID } : { styles: MAP_STYLES }),
            });
            if (MAP_ID) {
              const { AdvancedMarkerElement } = (await g.maps.importLibrary(
                "marker"
              )) as google.maps.MarkerLibrary;
              const pin = document.createElement("div");
              pin.innerHTML = `<img src="${buildPinSvg()}" width="44" height="58" alt="" style="filter:drop-shadow(0 8px 14px rgba(30,15,8,0.45))"/>
                <div style="margin-top:2px;background:#FFF4E5;color:#291A16;font:600 10px/1 var(--font-body,sans-serif);letter-spacing:0.14em;padding:5px 9px;border-radius:999px;border:1px solid #D8AE62;text-align:center">FOAKH TOWER</div>`;
              pin.style.display = "grid";
              pin.style.justifyItems = "center";
              new AdvancedMarkerElement({
                map,
                position: FOAKH_TOWER_LOCATION,
                content: pin,
                title: "Foakh Tower",
              });
            } else {
              new g.maps.Marker({
                map,
                position: FOAKH_TOWER_LOCATION,
                title: "Foakh Tower",
                icon: {
                  url: buildPinSvg(),
                  scaledSize: new g.maps.Size(44, 58),
                  anchor: new g.maps.Point(22, 56),
                },
              });
            }
            if (!cancelled) setStatus("ready");
          })
          .catch(() => {
            if (!cancelled) setStatus("fallback");
          });
      },
      { rootMargin: "200px" }
    );
    io.observe(holder);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  return (
    <div className={`relative w-full ${heightClass}`}>
      {/* live map mounts here */}
      <div
        ref={holderRef}
        className="absolute inset-0"
        aria-label="Map showing the location of Foakh Tower near DHA, Karachi"
        role="application"
      />
      {status === "loading" && (
        <div className="absolute inset-0 grid animate-pulse place-items-center bg-[#33201A]">
          <p className="text-[0.65rem] tracking-[0.28em] text-[#F2E2CE]/70 uppercase">
            Loading map…
          </p>
        </div>
      )}
      {(status === "fallback" || status === "idle") && (
        <div className={status === "fallback" ? "absolute inset-0" : "absolute inset-0 opacity-0"}>
          <IllustrativeMap />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Branded illustrative fallback — geography simplified from the real  */
/* setting: the M-9 Super Highway corridor with DHA City Karachi to    */
/* its south and Shaukat Khanum Hospital alongside the highway. It is  */
/* labelled illustrative; the Google Maps link is the navigation truth.*/
/* ------------------------------------------------------------------ */

function IllustrativeMap() {
  return (
    <svg
      viewBox="0 0 820 620"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustrative map: Foakh Tower sits near DHA City Karachi, south of the M-9 Main Super Highway, close to Shaukat Khanum Hospital"
    >
      <defs>
        <linearGradient id="fm-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3E2820" />
          <stop offset="0.55" stopColor="#33201A" />
          <stop offset="1" stopColor="#2A1712" />
        </linearGradient>
        <filter id="fm-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <rect width="820" height="620" fill="url(#fm-base)" />

      {/* natural areas — muted deep green */}
      <path d="M0 470 Q120 420 210 470 T450 540 Q560 590 480 620 L0 620 Z" fill="#243F33" opacity="0.5" />
      <path d="M640 80 q80 30 110 90 q30 60 70 70 l0 -240 -180 0 Z" fill="#243F33" opacity="0.34" />
      <ellipse cx="150" cy="180" rx="90" ry="52" fill="#2E4437" opacity="0.3" />

      {/* secondary road lattice — champagne hairlines */}
      <g stroke="#D8AE62" strokeOpacity="0.22" strokeWidth="2" fill="none">
        <path d="M60 620 Q160 480 260 430 T520 330" />
        <path d="M200 620 Q300 500 420 460 T700 380" />
        <path d="M0 320 Q140 330 260 300 T520 220" />
        <path d="M540 620 Q560 480 640 400" />
        <path d="M340 620 Q380 540 470 500" />
      </g>

      {/* M-9 Main Super Highway — glowing gold artery */}
      <path d="M-20 260 Q220 190 430 150 T840 60" stroke="#F29A3F" strokeWidth="16" fill="none" opacity="0.35" filter="url(#fm-glow)" />
      <path d="M-20 260 Q220 190 430 150 T840 60" stroke="#F29A3F" strokeWidth="7" fill="none" />
      <path d="M-20 260 Q220 190 430 150 T840 60" stroke="#FFD9A0" strokeWidth="1.6" strokeDasharray="14 12" fill="none" opacity="0.8" />

      {/* connector from the highway down to the tower */}
      <path d="M436 149 Q430 240 418 302" stroke="#D8AE62" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* labels — placed to match the real relationships */}
      <g fill="#FFF4E5" fontFamily="var(--font-body), sans-serif">
        <text x="500" y="112" fontSize="13" letterSpacing="3" transform="rotate(-9 500 112)" opacity="0.9">
          MAIN SUPER HIGHWAY · M-9
        </text>
        <text x="72" y="252" fontSize="11" letterSpacing="2" opacity="0.65">
          TOWARD KARACHI
        </text>
        <text x="545" y="420" fontSize="15" letterSpacing="3.5" opacity="0.85">
          DHA CITY
        </text>
        <text x="545" y="440" fontSize="11" letterSpacing="2.5" opacity="0.6">
          KARACHI
        </text>
      </g>

      {/* Shaukat Khanum Hospital — alongside the highway */}
      <g>
        <circle cx="238" cy="196" r="11" fill="#B84E2F" stroke="#D8AE62" strokeWidth="1.6" />
        <path d="M238 191v10M233 196h10" stroke="#FFF4E5" strokeWidth="2.4" strokeLinecap="round" />
        <text x="256" y="192" fontSize="12" fill="#FFF4E5" opacity="0.9" fontFamily="var(--font-body), sans-serif">
          Shaukat Khanum
        </text>
        <text x="256" y="207" fontSize="12" fill="#FFF4E5" opacity="0.9" fontFamily="var(--font-body), sans-serif">
          Hospital
        </text>
      </g>

      {/* Foakh Tower pin */}
      <g transform="translate(396 258)">
        <ellipse cx="22" cy="60" rx="16" ry="5" fill="#150A06" opacity="0.45" />
        <path
          d="M22 2C11 2 3 10.4 3 20.8 3 34 22 56 22 56s19-22 19-35.2C41 10.4 33 2 22 2Z"
          fill="#E7653E"
          stroke="#D8AE62"
          strokeWidth="2.4"
        />
        <circle cx="22" cy="20.5" r="8.2" fill="#291A16" />
        <path d="M18 24v-6.5l4-2.6 4 2.6V24h-2.6v-3.4h-2.8V24Z" fill="#FFF4E5" />
      </g>
      <g transform="translate(354 326)">
        <rect width="128" height="26" rx="13" fill="#FFF4E5" stroke="#D8AE62" />
        <text x="64" y="17" fontSize="11" letterSpacing="2" textAnchor="middle" fill="#291A16" fontWeight="600" fontFamily="var(--font-body), sans-serif">
          FOAKH TOWER
        </text>
      </g>

      {/* honesty note */}
      <text x="72" y="600" fontSize="10.5" letterSpacing="1.5" fill="#FFF4E5" opacity="0.55" fontFamily="var(--font-body), sans-serif">
        ILLUSTRATIVE MAP — OPEN GOOGLE MAPS FOR PRECISE NAVIGATION
      </text>
    </svg>
  );
}

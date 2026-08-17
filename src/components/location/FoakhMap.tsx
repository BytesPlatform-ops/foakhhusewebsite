"use client";

import { useEffect, useRef, useState } from "react";
import { FOAKH_PROJECT } from "@/lib/project";

/**
 * The live map inside the Location card — always a REAL, moveable
 * Google map, never a drawn illustration.
 *
 * Two paths:
 *  1. With NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — Google Maps JS API with
 *     the cream/green brand styling JSON (or a cloud-styled Map ID via
 *     NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) and the custom Foakh pin.
 *  2. Without a key (current default) — the keyless Google Maps embed,
 *     colour-graded to the cream/green identity with a CSS grade. The
 *     camera pans and zooms natively inside the frame.
 *
 * A click-to-explore veil keeps wheel/touch gestures from trapping the
 * page scroll until the visitor opts in; leaving the card re-arms it.
 */

/* Location comes from the project master record, never from this file. The
   JS-API path needs numeric coordinates to centre and to anchor the marker;
   the keyless embed is queried by the confirmed plus code instead, so it
   resolves the exact address rather than a decoded approximation. */
const { coordinates: FOAKH_TOWER_LOCATION, embedUrl: EMBED_SRC } = FOAKH_PROJECT;

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

/* Brand styling for the JS-API path: cream ground, champagne/sunset
   roads, deep-green water and parks, espresso labels, POI clutter off. */
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#EEE1D3" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3C2E22" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFF7EA" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FAF6F0" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#F4C98E" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#F29A3F" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#C99355" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#5E93AA" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#B8CDB4" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#EBDFC9" }] },
];

/* CSS grade for the keyless embed: pulls Google's default palette into
   warm cream while keeping parks/greens legible. */
const EMBED_GRADE =
  "sepia(0.34) saturate(1.12) hue-rotate(-8deg) brightness(1.03) contrast(0.97)";

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
          fill="#E7653E" stroke="#C99355" stroke-width="2.4"/>
        <circle cx="22" cy="20.5" r="8.2" fill="#2B211D"/>
        <path d="M18 24v-6.5l4-2.6 4 2.6V24h-2.6v-3.4h-2.8V24Z" fill="#FAF6F0"/>
      </svg>`
    )
  );
}

type Mode = "js-pending" | "js-ready" | "embed";

export default function FoakhMap({ heightClass = "h-full" }: { heightClass?: string }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>(API_KEY ? "js-pending" : "embed");
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (!API_KEY) return;
    const holder = holderRef.current;
    if (!holder) return;

    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
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
              backgroundColor: "#EEE1D3",
              ...(MAP_ID ? { mapId: MAP_ID } : { styles: MAP_STYLES }),
            });
            if (MAP_ID) {
              const { AdvancedMarkerElement } = (await g.maps.importLibrary(
                "marker"
              )) as google.maps.MarkerLibrary;
              const pin = document.createElement("div");
              pin.innerHTML = `<img src="${buildPinSvg()}" width="44" height="58" alt="" style="filter:drop-shadow(0 8px 14px rgba(30,15,8,0.35))"/>
                <div style="margin-top:2px;background:#FAF6F0;color:#2B211D;font:600 10px/1 var(--font-body,sans-serif);letter-spacing:0.14em;padding:5px 9px;border-radius:999px;border:1px solid #C99355;text-align:center">FOAKH WIND CORRIDOR ENCLAVE</div>`;
              pin.style.display = "grid";
              pin.style.justifyItems = "center";
              new AdvancedMarkerElement({
                map,
                position: FOAKH_TOWER_LOCATION,
                content: pin,
                title: "Foakh Wind Corridor Enclave",
              });
            } else {
              new g.maps.Marker({
                map,
                position: FOAKH_TOWER_LOCATION,
                title: "Foakh Wind Corridor Enclave",
                icon: {
                  url: buildPinSvg(),
                  scaledSize: new g.maps.Size(44, 58),
                  anchor: new g.maps.Point(22, 56),
                },
              });
            }
            if (!cancelled) setMode("js-ready");
          })
          .catch(() => {
            if (!cancelled) setMode("embed");
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

  const showEmbed = mode === "embed";

  return (
    <div
      className={`group relative w-full overflow-hidden bg-[#EEE1D3] ${heightClass}`}
      onMouseLeave={() => setEngaged(false)}
    >
      {/* JS-API map mounts here when a key is configured */}
      <div
        ref={holderRef}
        className={showEmbed ? "hidden" : "absolute inset-0"}
        aria-label={`Map showing the location of ${FOAKH_PROJECT.projectName} at ${FOAKH_PROJECT.displayAddress}`}
        role="application"
      />

      {/* keyless path: the real Google embed, colour-graded to brand */}
      {showEmbed && (
        <iframe
          title={`Google Map — ${FOAKH_PROJECT.projectName}, ${FOAKH_PROJECT.displayAddress}`}
          src={EMBED_SRC}
          className="absolute inset-0 h-full w-full border-0"
          style={{ filter: EMBED_GRADE }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {/* brand chip — card furniture, not a geo label */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 rounded-full border border-[#C99355] bg-[#FAF6F0]/95 px-3.5 py-1.5 shadow-sm">
        <p className="text-[0.6rem] font-bold tracking-[0.18em] text-[#2B211D] uppercase">
          Foakh Wind Corridor Enclave
        </p>
      </div>

      {/* click-to-explore veil — keeps page scroll free until opted in */}
      {showEmbed && !engaged && (
        <button
          type="button"
          onClick={() => setEngaged(true)}
          aria-label="Activate the interactive map"
          className="absolute inset-0 z-10 flex cursor-pointer items-end justify-center bg-transparent pb-4"
        >
          <span className="rounded-full border border-[#C99355]/70 bg-[#2B211D]/85 px-4 py-2 text-[0.62rem] font-semibold tracking-[0.2em] text-[#FAF6F0] uppercase backdrop-blur-sm transition-opacity group-hover:opacity-100 lg:opacity-0">
            Click to explore the map
          </span>
        </button>
      )}
    </div>
  );
}

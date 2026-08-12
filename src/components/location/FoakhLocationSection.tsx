"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import FoakhMap, { FOAKH_MAPS_URL } from "./FoakhMap";
import NearbyLocationGrid from "./NearbyLocationGrid";
import FoakhLocationVisual from "./FoakhLocationVisual";
import BuildIn from "@/components/shared/BuildIn";

/**
 * 04 — Location: "Connected to what matters."
 *
 * Two-column editorial spread on the warm stone page ground: a rich
 * terracotta information panel (~57%) with the serif headline, the
 * supporting paragraph and the 2×3 nearby grid; and a right column
 * holding the branded map card above the architectural line-drawing
 * card. Mobile reflows to eyebrow → heading → paragraph → map →
 * directions → nearby → visual, per the approved order.
 *
 * Reveal: panel fades upward, the map card unmasks, nearby items
 * stagger — once, on view; nothing loops. Reduced motion renders
 * everything settled.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function LocationPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#FAF6F0]/35 bg-[#FAF6F0]/12 px-3.5 py-2 whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C99355" strokeWidth="2" aria-hidden="true">
        <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
      <span className="text-[0.55rem] font-semibold tracking-[0.22em] text-[#FAF6F0] uppercase sm:text-[0.62rem] sm:tracking-[0.3em]">
        04 — Location &amp; Connectivity
      </span>
    </span>
  );
}

function DirectionButtons({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={FOAKH_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#C99355] px-5 py-2.5 text-[0.68rem] font-bold tracking-[0.18em] text-[#2B211D] uppercase transition-colors hover:bg-[#E8C27C]"
      >
        Get directions
      </a>
      <a
        href={FOAKH_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-full border px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.18em] uppercase transition-colors ${
          dark
            ? "border-[#FAF6F0]/40 text-[#FAF6F0] hover:bg-[#FAF6F0]/10"
            : "border-[#B65438]/50 text-[#713427] hover:bg-[#B65438]/10"
        }`}
      >
        View on Google Maps
      </a>
    </div>
  );
}

function PanelHeader() {
  return (
    <>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <LocationPill />
        <div className="text-left sm:text-right">
          <p className="text-[0.7rem] font-semibold tracking-[0.26em] text-[#FAF6F0] uppercase">
            Foakh Wind Corridor Enclave
          </p>
          <p className="mt-1 text-[0.66rem] tracking-[0.18em] text-[#FAF6F0]/70 uppercase">
            DHA City · Karachi
          </p>
        </div>
      </div>
      <h2
        id="location-heading"
        className="font-display mt-7 leading-[1.06] sm:mt-9 sm:leading-[1.07]"
        style={{ fontSize: "clamp(2.05rem,8.4vw,4rem)", fontWeight: 500, letterSpacing: "-0.01em" }}
      >
        <span className="block text-[#FAF6F0]">Connected to</span>
        <span className="block text-[#C99355]">what matters.</span>
      </h2>
      {/* champagne divider with diamond accent */}
      <div className="mt-6 flex items-center gap-2.5" aria-hidden="true">
        <span className="h-px w-14 bg-[#C99355]" />
        <span className="h-1.5 w-1.5 rotate-45 bg-[#C99355]" />
      </div>
      <p className="mt-5 max-w-lg text-[0.98rem] leading-[1.65] text-[#FAF6F0]/92 sm:mt-6 sm:text-[1.02rem] sm:leading-[1.7]">
        A convenient address close to healthcare, shopping, education and major road links.
      </p>
      <p className="mt-3 max-w-lg text-[0.88rem] leading-[1.65] text-[#FAF6F0]/78 sm:mt-4 sm:text-[0.92rem] sm:leading-[1.7]">
        Foakh Wind Corridor Enclave is positioned within Karachi&rsquo;s wind corridor and
        adjacent to Shaukat Khanum Hospital, combining environmental advantages with access
        to an important emerging residential area.
      </p>
    </>
  );
}

/** Rich terracotta surface with sunset depth + faint tower drawing. */
const PANEL_STYLE: React.CSSProperties = {
  background:
    "radial-gradient(90% 65% at 85% 0%, rgb(242 154 63 / 0.35) 0%, transparent 55%)," +
    "radial-gradient(70% 55% at 10% 100%, rgb(126 47 34 / 0.65) 0%, transparent 60%)," +
    "linear-gradient(155deg, #B65438 0%, #B65438 45%, #94432F 100%)",
};

export default function FoakhLocationSection() {
  const reduced = useReducedMotion();
  const rise = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section
      id="location"
      data-section="location"
      aria-labelledby="location-heading"
      className="blend-top relative bg-[#F5EDE3] py-(--spacing-section)"
      style={{ "--blend-from": "#713427" } as React.CSSProperties}
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* ------------------------------------------------ desktop -- */}
        <div className="hidden gap-7 lg:grid lg:grid-cols-[57%_minmax(0,1fr)]">
          {/* left information panel */}
          <div
            className="relative overflow-hidden rounded-[30px] border border-[#C99355]/45 p-10 shadow-[0_40px_80px_-36px_rgba(90,35,18,0.55)] xl:p-12"
            style={PANEL_STYLE}
          >
            {/* faint approved tower drawing in the lower-right */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -bottom-6 h-[46%] w-[55%] opacity-[0.14] mix-blend-multiply">
              <Image src="/building-outline-lines.png" alt="" fill sizes="30vw" className="object-contain object-bottom" />
            </div>
            <div className="relative">
              <PanelHeader />
              <div className="mt-10">
                <NearbyLocationGrid onPanel />
              </div>
            </div>
          </div>

          {/* right column: map above the architectural visual */}
          <div className="flex min-w-0 flex-col gap-7">
            <motion.div
              {...rise(0.12)}
              className="flex flex-1 flex-col overflow-hidden rounded-[28px] border border-[#C99355]/45 bg-[#2B211D] shadow-[0_34px_70px_-32px_rgba(50,20,10,0.6)]"
            >
              <div className="min-h-[380px] flex-1">
                <FoakhMap />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#C99355]/25 p-4">
                <DirectionButtons dark />
              </div>
            </motion.div>
            <BuildIn delay={0.3} amount={0.15} className="rounded-[28px]">
              <FoakhLocationVisual />
            </BuildIn>
          </div>
        </div>

        {/* ------------------------------------------------- mobile -- */}
        <div className="space-y-6 lg:hidden">
          <motion.div
            {...rise(0)}
            className="relative overflow-hidden rounded-[22px] border border-[#C99355]/45 p-5 sm:p-8"
            style={PANEL_STYLE}
          >
            <PanelHeader />
          </motion.div>

          <motion.div
            {...rise(0.08)}
            className="overflow-hidden rounded-[24px] border border-[#C99355]/45 bg-[#2B211D] shadow-[0_30px_60px_-30px_rgba(50,20,10,0.55)]"
          >
            <FoakhMap heightClass="h-[420px]" />
            <div className="border-t border-[#C99355]/25 p-4">
              <DirectionButtons dark />
            </div>
          </motion.div>

          <NearbyLocationGrid />

          <motion.div {...rise(0.05)}>
            <FoakhLocationVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

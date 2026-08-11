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
    <span className="inline-flex items-center gap-2 rounded-full border border-[#FFF4E5]/35 bg-[#FFF4E5]/12 px-4 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D8AE62" strokeWidth="2" aria-hidden="true">
        <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
      <span className="text-[0.62rem] font-semibold tracking-[0.3em] text-[#FFF4E5] uppercase">
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
        className="rounded-full bg-[#D8AE62] px-5 py-2.5 text-[0.68rem] font-bold tracking-[0.18em] text-[#291A16] uppercase transition-colors hover:bg-[#E8C27C]"
      >
        Get directions
      </a>
      <a
        href={FOAKH_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-full border px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.18em] uppercase transition-colors ${
          dark
            ? "border-[#FFF4E5]/40 text-[#FFF4E5] hover:bg-[#FFF4E5]/10"
            : "border-[#B84E2F]/50 text-[#7E2F22] hover:bg-[#B84E2F]/10"
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <LocationPill />
        <div className="text-right">
          <p className="text-[0.7rem] font-semibold tracking-[0.26em] text-[#FFF4E5] uppercase">
            Foakh Wind Corridor Enclave
          </p>
          <p className="mt-1 text-[0.66rem] tracking-[0.18em] text-[#FFF4E5]/70 uppercase">
            DHA City · Karachi
          </p>
        </div>
      </div>
      <h2
        id="location-heading"
        className="font-display mt-9 leading-[1.07]"
        style={{ fontSize: "clamp(2.5rem,3.6vw,4rem)", fontWeight: 500, letterSpacing: "-0.01em" }}
      >
        <span className="block text-[#FFF4E5]">Connected to</span>
        <span className="block text-[#D8AE62]">what matters.</span>
      </h2>
      {/* champagne divider with diamond accent */}
      <div className="mt-6 flex items-center gap-2.5" aria-hidden="true">
        <span className="h-px w-14 bg-[#D8AE62]" />
        <span className="h-1.5 w-1.5 rotate-45 bg-[#D8AE62]" />
      </div>
      <p className="mt-6 max-w-lg text-[1.02rem] leading-[1.7] text-[#FFF4E5]/92">
        A convenient address close to healthcare, shopping, education and major road links.
      </p>
      <p className="mt-4 max-w-lg text-[0.92rem] leading-[1.7] text-[#FFF4E5]/78">
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
    "linear-gradient(155deg, #C25835 0%, #B84E2F 45%, #93392a 100%)",
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
      className="blend-top relative bg-[#F6EBDD] py-(--spacing-section)"
      style={{ "--blend-from": "#8A3B26" } as React.CSSProperties}
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* ------------------------------------------------ desktop -- */}
        <div className="hidden gap-7 lg:grid lg:grid-cols-[57%_minmax(0,1fr)]">
          {/* left information panel */}
          <div
            className="relative overflow-hidden rounded-[30px] border border-[#D8AE62]/45 p-10 shadow-[0_40px_80px_-36px_rgba(90,35,18,0.55)] xl:p-12"
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
              className="flex flex-1 flex-col overflow-hidden rounded-[28px] border border-[#D8AE62]/45 bg-[#291A16] shadow-[0_34px_70px_-32px_rgba(50,20,10,0.6)]"
            >
              <div className="min-h-[380px] flex-1">
                <FoakhMap />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#D8AE62]/25 p-4">
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
            className="relative overflow-hidden rounded-[26px] border border-[#D8AE62]/45 p-6 sm:p-8"
            style={PANEL_STYLE}
          >
            <PanelHeader />
          </motion.div>

          <motion.div
            {...rise(0.08)}
            className="overflow-hidden rounded-[24px] border border-[#D8AE62]/45 bg-[#291A16] shadow-[0_30px_60px_-30px_rgba(50,20,10,0.55)]"
          >
            <FoakhMap heightClass="h-[420px]" />
            <div className="border-t border-[#D8AE62]/25 p-4">
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

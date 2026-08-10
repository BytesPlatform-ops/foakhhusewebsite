"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * 02 — Natural Systems: "Nature, engineered for better living."
 *
 * The original premium editorial language restored — cream ground over
 * the shared fixed elevation line art, serif headings, real project
 * renders, generous spacing, calm whileInView reveals. No pin, no 3D,
 * no card grid.
 *
 * The six brochure systems are grouped into THREE large features, each
 * one strong image beside concise editorial text:
 *   A — AIR & VENTILATION · Wind Catcher (four support points)
 *   B — RENEWABLE ENERGY · Wind Turbines · Solar · Kite Energy
 *       (presented together as one group with hairline dividers)
 *   C — WATER SYSTEMS · Desalination · Atmospheric Water Generation
 * Subtle teal accents mark airflow/water; terracotta carries the
 * architecture. Reduced motion renders everything settled.
 */

const INK = "#211A17";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AIR_POINTS = [
  "Natural Air Capture",
  "Corridor Distribution",
  "Cooler Shared Areas",
  "Reduced Heat Buildup",
];

const ENERGY_ITEMS = [
  {
    title: "Wind Turbines",
    copy: "Wind turbines are planned to convert available regional wind into renewable electricity.",
  },
  {
    title: "Solar Energy",
    copy: "Solar panels are planned to harness Karachi's abundant sunlight and complement the other renewable systems.",
  },
  {
    title: "Kite Energy",
    copy: "Airborne tethered wings capture stronger high-altitude winds and transfer aerodynamic force to ground-based generation equipment.",
  },
];

const WATER_ITEMS = [
  {
    title: "Water Desalination",
    copy: "A planned desalination system using reverse-osmosis treatment supports dependable water availability.",
  },
  {
    title: "Atmospheric Water Generation · Thin Air",
    copy: "Atmospheric water technology extracts water directly from air to support a more resilient long-term water strategy.",
  },
];

export default function SnakeRoute() {
  const reduced = useReducedMotion();
  const rise = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.75, delay, ease: EASE },
        };

  return (
    <section
      id="route"
      data-section="route"
      aria-labelledby="route-heading"
      className="relative py-(--spacing-section)"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        {/* ------------------------------- intro ---------------------- */}
        <motion.p
          {...rise(0)}
          className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
          style={{ color: "#943F2D" }}
        >
          02 — Natural Systems
        </motion.p>
        <motion.h2
          {...rise(0.05)}
          id="route-heading"
          className="font-display mt-5 max-w-[16ch] leading-[1.06] text-balance"
          style={{ color: INK, fontSize: "clamp(2.3rem,3.8vw,3.9rem)", fontWeight: 500 }}
        >
          Nature, engineered for better living.
        </motion.h2>
        <motion.p
          {...rise(0.1)}
          className="mt-5 max-w-2xl text-[1rem] leading-[1.7]"
          style={{ color: "rgba(33,26,23,0.75)" }}
        >
          A connected set of natural-resource systems designed to support airflow, renewable
          power and resilient water planning throughout the development.
        </motion.p>

        {/* ---------------- A — AIR & VENTILATION --------------------- */}
        <div className="mt-16 grid items-center gap-10 lg:mt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <motion.figure
            {...rise(0.08)}
            className="relative overflow-hidden rounded-[20px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1.5 shadow-[0_32px_64px_-34px_rgba(148,63,45,0.45)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
              <Image
                src="/buildingtop.jpg"
                alt="The dedicated wind catcher within the terracotta crown, with kite, turbines and solar above"
                fill
                sizes="(min-width:1024px) 48vw, 92vw"
                className="object-cover"
                style={{ objectPosition: "55% 35%" }}
              />
              {/* subtle airflow accent */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 62.5"
                preserveAspectRatio="none"
              >
                <path
                  d="M 4 24 C 16 21, 28 25, 40 22 M 6 30 C 18 27, 29 30.5, 40 28"
                  fill="none"
                  stroke="#78AAA5"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                  opacity="0.55"
                />
              </svg>
            </div>
          </motion.figure>

          <div>
            <motion.p {...rise(0.1)} className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#C78C49" }}>
              A — Air &amp; Ventilation
            </motion.p>
            <motion.h3
              {...rise(0.14)}
              className="font-display mt-3 leading-[1.1]"
              style={{ color: "#943F2D", fontSize: "clamp(1.8rem,2.6vw,2.7rem)", fontWeight: 500 }}
            >
              Wind Catcher
            </motion.h3>
            <motion.p {...rise(0.18)} className="mt-4 max-w-[58ch] text-[0.98rem] leading-[1.7]" style={{ color: "rgba(33,26,23,0.75)" }}>
              The dedicated wind catcher captures high-velocity natural air and directs it
              into the building to support airflow through internal circulation areas.
            </motion.p>
            <motion.ul {...rise(0.24)} className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
              {AIR_POINTS.map((pt) => (
                <li key={pt} className="flex items-baseline gap-2.5 text-[0.85rem]" style={{ color: "#51443D" }}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#78AAA5" }} />
                  {pt}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* ---------------- B — RENEWABLE ENERGY ---------------------- */}
        <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <motion.p {...rise(0)} className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#C78C49" }}>
              B — Renewable Energy
            </motion.p>
            <motion.h3
              {...rise(0.05)}
              className="font-display mt-3 leading-[1.1]"
              style={{ color: "#943F2D", fontSize: "clamp(1.8rem,2.6vw,2.7rem)", fontWeight: 500 }}
            >
              Wind Turbines · Solar · Kite Energy
            </motion.h3>
            <motion.p {...rise(0.1)} className="mt-4 max-w-[58ch] text-[0.98rem] leading-[1.7]" style={{ color: "rgba(33,26,23,0.75)" }}>
              Wind, sunlight and high-altitude airflow contribute to a diversified
              renewable-energy strategy.
            </motion.p>
            <div className="mt-6 max-w-xl">
              {ENERGY_ITEMS.map((item, i) => (
                <motion.div
                  key={item.title}
                  {...rise(0.14 + i * 0.08)}
                  className={i > 0 ? "mt-5 border-t pt-5" : ""}
                  style={i > 0 ? { borderColor: "rgba(216,179,106,0.4)" } : undefined}
                >
                  <p className="font-display text-[1.08rem] leading-snug font-medium" style={{ color: INK }}>
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[0.87rem] leading-[1.65]" style={{ color: "#51443D" }}>
                    {item.copy}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.figure
            {...rise(0.08)}
            className="relative order-1 overflow-hidden rounded-[20px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1.5 shadow-[0_32px_64px_-34px_rgba(148,63,45,0.45)] lg:order-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
              <Image
                src="/foakhshaukat.jpg"
                alt="The development at dusk with the regional wind farm on the horizon"
                fill
                sizes="(min-width:1024px) 48vw, 92vw"
                className="object-cover"
                style={{ objectPosition: "70% 45%" }}
              />
            </div>
          </motion.figure>
        </div>

        {/* ---------------- C — WATER SYSTEMS ------------------------- */}
        <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <motion.figure
            {...rise(0.08)}
            className="relative overflow-hidden rounded-[20px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1.5 shadow-[0_32px_64px_-34px_rgba(148,63,45,0.45)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
              <Image
                src="/buildingfront.jpg"
                alt="The landscaped water-feature courtyard between the two blocks at dusk"
                fill
                sizes="(min-width:1024px) 48vw, 92vw"
                className="object-cover"
                style={{ objectPosition: "50% 84%" }}
              />
              {/* subtle water accent */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 62.5"
                preserveAspectRatio="none"
              >
                <path
                  d="M 60 52 C 68 50.8, 76 52.6, 84 51.4 M 62 56 C 69 54.9, 76 56.4, 82 55.4"
                  fill="none"
                  stroke="#6F9B98"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  strokeDasharray="2.2 3"
                  opacity="0.55"
                />
              </svg>
            </div>
          </motion.figure>

          <div>
            <motion.p {...rise(0.1)} className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase" style={{ color: "#C78C49" }}>
              C — Water Systems
            </motion.p>
            <motion.h3
              {...rise(0.14)}
              className="font-display mt-3 leading-[1.1]"
              style={{ color: "#943F2D", fontSize: "clamp(1.8rem,2.6vw,2.7rem)", fontWeight: 500 }}
            >
              Reliable Water Systems
            </motion.h3>
            <motion.p {...rise(0.18)} className="mt-4 max-w-[58ch] text-[0.98rem] leading-[1.7]" style={{ color: "rgba(33,26,23,0.75)" }}>
              A diversified water strategy combining desalination and atmospheric water
              generation.
            </motion.p>
            <div className="mt-6 max-w-xl">
              {WATER_ITEMS.map((item, i) => (
                <motion.div
                  key={item.title}
                  {...rise(0.22 + i * 0.08)}
                  className={i > 0 ? "mt-5 border-t pt-5" : ""}
                  style={i > 0 ? { borderColor: "rgba(216,179,106,0.4)" } : undefined}
                >
                  <p className="font-display text-[1.08rem] leading-snug font-medium" style={{ color: INK }}>
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[0.87rem] leading-[1.65]" style={{ color: "#51443D" }}>
                    {item.copy}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------- closing -------------------- */}
        <motion.p
          {...rise(0.2)}
          className="font-display mt-16 text-[1.25rem] italic lg:mt-20"
          style={{ color: "#943F2D" }}
        >
          From natural force to everyday comfort.
        </motion.p>
      </div>
    </section>
  );
}

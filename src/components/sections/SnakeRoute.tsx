"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * 03 — Natural Systems: the technical concept, told plainly and
 * premium-ly. Two-column editorial spread over the shared fixed
 * elevation backdrop: LEFT — a composed visual sequence of the real
 * project imagery, each frame chip-labelled with its stage (CAPTURE /
 * CHANNEL / POWER), closed by the four-stage flow strip; RIGHT — the
 * heading, the technical explanation and the four feature blocks that
 * map 1:1 to the stages, ending on the concluding line.
 *
 * No pin, no floating words, no placeholders — calm whileInView
 * reveals only. All performance statements framed as planned/intended.
 */

const INK = "#211A17";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STAGES = ["Capture", "Channel", "Power", "Comfort"];

const FEATURES = [
  {
    num: "01",
    title: "Natural Air Capture",
    copy: "High-velocity natural wind is intended to be captured through a dedicated wind-catching system at the crown of the building.",
  },
  {
    num: "02",
    title: "Corridor Distribution",
    copy: "Captured air is guided through internal corridors, elevator lobbies and shared circulation zones.",
  },
  {
    num: "03",
    title: "Renewable Energy Support",
    copy: "Rooftop wind turbines and solar panels are planned to support cleaner electricity generation for selected building requirements.",
  },
  {
    num: "04",
    title: "Everyday Comfort",
    copy: "Together, these systems are intended to improve ventilation, reduce heat buildup and support more comfortable daily living.",
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
        <div className="grid items-start gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          {/* ==================== LEFT — the visual sequence =========== */}
          <div className="order-2 lg:order-1">
            <motion.p
              {...rise(0)}
              className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase"
              style={{ color: "#943F2D" }}
            >
              The wind-corridor concept
            </motion.p>

            {/* composed frames — real project imagery, stage-labelled */}
            <div className="relative mt-6 pr-[10%] pb-16 lg:pb-20">
              {/* main frame — CAPTURE */}
              <motion.figure
                {...rise(0.08)}
                className="relative overflow-hidden rounded-[20px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1.5 shadow-[0_32px_64px_-34px_rgba(148,63,45,0.45)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
                  <Image
                    src="/env-air.jpg"
                    alt="High natural airflow moving through the sunlit terracotta opening of the wind catcher"
                    fill
                    sizes="(min-width:1024px) 44vw, 92vw"
                    className="object-cover"
                    style={{ objectPosition: "60% 40%" }}
                  />
                  <StageChip>01 · Capture</StageChip>
                </div>
              </motion.figure>

              {/* secondary frame — POWER, overlapping lower-right */}
              <motion.figure
                {...rise(0.2)}
                className="absolute right-0 -bottom-2 w-[46%] rotate-[1.6deg] overflow-hidden rounded-[16px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1.5 shadow-[0_26px_52px_-28px_rgba(148,63,45,0.5)] lg:-bottom-4"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[11px]">
                  <Image
                    src="/route-solar.jpg"
                    alt="Rooftop solar panels within the terracotta architecture"
                    fill
                    sizes="22vw"
                    className="object-cover"
                  />
                  <StageChip>03 · Power</StageChip>
                </div>
              </motion.figure>

              {/* small frame — CHANNEL, mid-left */}
              <motion.figure
                {...rise(0.14)}
                className="absolute top-[46%] -left-2 w-[34%] -rotate-[1.8deg] overflow-hidden rounded-[14px] border border-[#D8B36A]/50 bg-[#FFF8EF] p-1 shadow-[0_22px_44px_-26px_rgba(148,63,45,0.5)] lg:-left-5"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[10px]">
                  <Image
                    src="/route-corridor.jpg"
                    alt="Air guided along the warm interior corridor"
                    fill
                    sizes="16vw"
                    className="object-cover"
                    style={{ objectPosition: "50% 42%" }}
                  />
                  <StageChip>02 · Channel</StageChip>
                </div>
              </motion.figure>
            </div>

            {/* the four-stage flow strip */}
            <motion.div {...rise(0.26)} className="mt-10 lg:mt-14">
              <ol
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
                aria-label="The four stages of the natural system"
              >
                {STAGES.map((stage, i) => (
                  <li key={stage} className="flex items-center gap-3">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[0.62rem] font-semibold tabular-nums" style={{ color: "#943F2D" }}>
                        0{i + 1}
                      </span>
                      <span className="text-[0.68rem] font-semibold tracking-[0.24em] uppercase" style={{ color: INK }}>
                        {stage}
                      </span>
                    </span>
                    {i < STAGES.length - 1 && (
                      <span aria-hidden="true" className="h-px w-7" style={{ background: "rgba(148,63,45,0.4)" }} />
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-3 max-w-md text-[0.8rem] leading-[1.6]" style={{ color: "rgba(33,26,23,0.62)" }}>
                Natural wind reaches the site, the wind catcher captures and directs it, planned
                renewable systems support electricity generation, and residents experience the
                result as everyday comfort.
              </p>
            </motion.div>
          </div>

          {/* ==================== RIGHT — the explanation ============== */}
          <div className="order-1 lg:order-2">
            <motion.p
              {...rise(0)}
              className="text-[0.65rem] font-medium tracking-[0.3em] uppercase"
              style={{ color: "#943F2D" }}
            >
              03 — Natural Systems
            </motion.p>
            <motion.h2
              {...rise(0.06)}
              id="route-heading"
              className="font-display mt-5 max-w-[16ch] leading-[1.08] text-balance"
              style={{ color: INK, fontSize: "clamp(2.2rem,3vw,3.2rem)", fontWeight: 500 }}
            >
              A building that works with its environment.
            </motion.h2>
            <motion.p
              {...rise(0.12)}
              className="mt-6 max-w-xl text-[1rem] leading-[1.7]"
              style={{ color: "rgba(33,26,23,0.8)" }}
            >
              The Wind Corridor Residences brings natural airflow, renewable-energy planning and
              modern family living into one carefully considered development.
            </motion.p>
            <motion.p
              {...rise(0.16)}
              className="mt-4 max-w-xl text-[0.9rem] leading-[1.7]"
              style={{ color: "rgba(33,26,23,0.66)" }}
            >
              High-velocity natural air reaches the development first. A dedicated wind catcher
              is designed to capture that airflow and guide it through the building&rsquo;s internal
              corridors and shared circulation spaces — while rooftop wind and solar systems are
              planned to support cleaner electricity generation.
            </motion.p>

            {/* the four feature blocks — one coherent card system */}
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <motion.article
                  key={f.num}
                  {...rise(0.18 + i * 0.08)}
                  className="rounded-[16px] border border-[#D8B36A]/45 bg-[#FFF8EF]/92 p-5 shadow-[0_18px_38px_-24px_rgba(148,63,45,0.35)] backdrop-blur-[2px]"
                >
                  <p className="flex items-baseline gap-2.5">
                    <span className="text-[0.66rem] font-semibold tabular-nums" style={{ color: "#C75B3B" }}>
                      {f.num}
                    </span>
                    <span className="font-display text-[1.05rem] leading-snug font-medium" style={{ color: INK }}>
                      {f.title}
                    </span>
                  </p>
                  <p className="mt-2.5 text-[0.8rem] leading-[1.65]" style={{ color: "rgba(33,26,23,0.68)" }}>
                    {f.copy}
                  </p>
                </motion.article>
              ))}
            </div>

            {/* concluding line */}
            <motion.p
              {...rise(0.5)}
              className="font-display mt-9 text-[1.25rem] italic"
              style={{ color: "#943F2D" }}
            >
              From natural force to everyday comfort.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- */

function StageChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="absolute bottom-2.5 left-2.5 rounded-full border border-[#D8B36A]/70 bg-[#FFF8EF]/95 px-3 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase"
      style={{ color: "#211A17" }}
    >
      {children}
    </span>
  );
}

"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import BuildingSilhouette from "./BuildingSilhouette";
import GraphicBackdrop from "./GraphicBackdrop";
import KitePath from "./KitePath";
import TechnicalLoader from "./TechnicalLoader";
import { FlowPills, GiantWords, StateBlocks } from "./ScrollCopy";
import { HeroActions, HeroFacts } from "./HeroChrome";

/**
 * THE BUILDING AWAKENS AS YOU SCROLL.
 *
 * A 520svh (340svh mobile) section with a sticky 100svh stage. The
 * terracotta silhouette stays pinned centre while the graphic world,
 * typography and energy systems evolve through eight storyboard states
 * (docs/SCROLL-HERO-PLAN.md). Native scrolling only — the visitor owns
 * the pace, and "Skip visual story" jumps straight past the pin.
 *
 * One spring-wrapped progress value drives everything (JS-driven on
 * purpose: bare scroll bindings get promoted to native ScrollTimeline
 * animations whose mount-time pixel ranges go stale on this page).
 *
 * Reduced motion: no pinning — the final poster renders statically with
 * every fact, headline and CTA present.
 */
export default function ScrollBuildingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  // Building presence: settles from 0.92 to 1, breathes <=1.5 degrees.
  const buildingScale = useTransform(progress, [0, 0.1, 1], [0.92, 1, 1]);
  const buildingRotate = useTransform(progress, [0, 0.35, 0.7, 1], [0, -1.4, 1, 0]);

  if (reduced) return <StaticPoster />;

  return (
    <>
      <TechnicalLoader />
      <section
        id="hero"
        ref={sectionRef}
        className="relative h-[340svh] lg:h-[520svh]"
        aria-label="Wind Corridor visual story"
      >
        <h1 className="sr-only">
          The Wind Corridor Residences — where nature powers modern living. DHA View City,
          Karachi.
        </h1>

        <div className="grain sticky top-0 h-svh overflow-hidden bg-[#efe7dd]">
          <GraphicBackdrop progress={progress} />

          {/* giant words ride behind the building */}
          <GiantWords progress={progress} />

          {/* the pinned silhouette, centred, restrained perspective */}
          <motion.div
            className="absolute inset-0 grid place-items-center py-[6svh]"
            style={{
              scale: buildingScale,
              rotate: buildingRotate,
              perspective: 1200,
            }}
          >
            <div className="h-[74svh] max-h-full">
              <BuildingSilhouette progress={progress} />
            </div>
          </motion.div>

          <KitePath progress={progress} />
          <FlowPills progress={progress} />
          <StateBlocks progress={progress} />
          <HeroFacts progress={progress} />
          <HeroActions progress={progress} />
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------- reduced motion */

/**
 * Static poster: the final composed state, no pin, no loader animation.
 * Everything the scroll story communicates is present as plain content.
 */
function StaticPoster() {
  // A constant MotionValue is overkill here — components accept progress,
  // so we render their static variants directly instead.
  return (
    <section id="hero" aria-label="Wind Corridor visual story" className="relative">
      <div className="grain relative min-h-svh overflow-hidden bg-[#efe7dd]">
        <StaticBackdropAndBuilding />
        <div className="relative z-10 mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-end gap-5 px-6 pb-14 text-center">
          <p className="text-[0.6875rem] tracking-[0.24em] text-[#653528] uppercase">
            DHA View City · Karachi
          </p>
          <h1 className="font-display text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95] font-bold text-[#171816]">
            WHERE NATURE
            <br />
            POWERS
            <br />
            MODERN LIVING.
          </h1>
          <p className="max-w-xl text-[#4a453f]">
            A future-focused residential development shaped around natural airflow,
            renewable-energy planning and refined family living. 12 storeys · Umer &
            Abdullah blocks · 84 exclusive apartments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#enquire" className="bg-charcoal text-ivory rounded-full px-7 py-3.5 text-sm font-bold">
              Register Interest
            </a>
            <a href="#residences" className="glass-light rounded-full px-7 py-3.5 text-sm font-semibold">
              Explore the Residences
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticBackdropAndBuilding() {
  // Reuse the same components in their static mode via a frozen value.
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <StaticFrame />
    </div>
  );
}

function StaticFrame() {
  const { scrollYProgress } = useScroll(); // unused values; static mode ignores them
  return (
    <>
      <GraphicBackdrop progress={scrollYProgress} staticMode />
      <div className="absolute inset-0 grid place-items-center py-[6svh] opacity-95">
        <div className="h-[70svh] max-h-full">
          <BuildingSilhouette progress={scrollYProgress} staticMode />
        </div>
      </div>
    </>
  );
}

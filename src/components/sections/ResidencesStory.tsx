"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChapterHeading, Eyebrow } from "@/components/shared/Chapter";
import { Plate, type PlateId } from "./plates";

/**
 * 16 — Homes Made for Real Life. Scroll-led editorial residence story.
 * Five states, each with its own camera language (see plates.tsx), the
 * backdrop adopting each state's surface, and a floating glass caption
 * that CHANGES POSITION per state — no identical fixed card.
 * Native scrolling: the sticky layer is only the backdrop.
 */

interface StoryState {
  id: PlateId;
  index: string;
  title: string;
  copy: string;
  surface: string;
  ink: "light" | "dark";
  /** Caption placement varies by state. */
  captionPos: string;
  /** Plate column order flips through the story. */
  flip?: boolean;
}

const STATES: StoryState[] = [
  {
    id: "living",
    index: "01",
    title: "Living spaces",
    copy: "Generous, well-proportioned rooms where low sunlight crosses the floor — space that holds real family life.",
    surface: "mineral-terracotta",
    ink: "light",
    captionPos: "lg:self-end lg:mb-10",
  },
  {
    id: "layout",
    index: "02",
    title: "Functional layouts",
    copy: "Considered circulation, working kitchens and rooms placed where daily life actually needs them.",
    surface: "mineral-ivory",
    ink: "dark",
    captionPos: "lg:self-start lg:mt-14",
    flip: true,
  },
  {
    id: "balcony",
    index: "03",
    title: "Private balconies",
    copy: "Every residence opens outward — the same airflow the corridors are designed around reaches the balcony first.",
    surface: "mineral-clay",
    ink: "light",
    captionPos: "lg:self-center",
  },
  {
    id: "curtain",
    index: "04",
    title: "Light and airflow",
    copy: "Controlled natural ventilation and daylight move through the home, not just past its windows.",
    surface: "mineral-ivory",
    ink: "dark",
    captionPos: "lg:self-end lg:mb-16",
    flip: true,
  },
  {
    id: "family",
    index: "05",
    title: "Family comfort",
    copy: "A private community of only 84 homes, made for shared tables and everyday routines.",
    surface: "mineral-terracotta",
    ink: "light",
    captionPos: "lg:self-start lg:mt-8",
  },
];

export default function ResidencesStory() {
  const [active, setActive] = useState(0);
  const current = STATES[active];

  return (
    <section
      id="residences"
      data-section="residences"
      className="blend-top relative"
      style={{ "--blend-from": "#202522" } as React.CSSProperties}
      aria-labelledby="residences-heading"
    >
      {/* Backdrop stack adopting the active state's surface */}
      <div className="pointer-events-none sticky top-0 h-svh overflow-hidden" aria-hidden="true">
        {STATES.map((s, i) => (
          <div
            key={s.id}
            className={`${s.surface} grain absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out-quint)]`}
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>

      <div className="relative -mt-[100svh]">
        <header className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-(--spacing-section) pb-4">
          <Eyebrow num="03" tone={current.ink}>
            The residences
          </Eyebrow>
          <ChapterHeading id="residences-heading" tone={current.ink}>
            Homes made for real life.
          </ChapterHeading>
        </header>

        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-(--spacing-section)">
          {STATES.map((s, i) => (
            <StoryCard key={s.id} state={s} isActive={i === active} onActivate={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryCard({
  state,
  isActive,
  onActivate,
}: {
  state: StoryState;
  isActive: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: rawP } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Spring-wrapped so the binding stays JS-driven — see WindTunnel.tsx.
  const scrollYProgress = useSpring(rawP, { stiffness: 300, damping: 36, mass: 0.4 });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [48, 0, -48]);
  const lift = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.97, 1, 0.97]);

  return (
    <motion.article
      ref={ref}
      onViewportEnter={onActivate}
      viewport={{ amount: 0.55 }}
      className="flex min-h-[88svh] items-center py-8"
    >
      <div
        className={`grid w-full items-stretch gap-8 lg:grid-cols-12 lg:gap-14 ${
          state.flip ? "lg:[direction:rtl]" : ""
        }`}
      >
        <motion.div
          style={reduced ? undefined : { y, scale: lift }}
          className="lg:col-span-7 lg:[direction:ltr]"
        >
          <div
            className={`overflow-hidden rounded-2xl transition-shadow duration-700 ${
              isActive
                ? "shadow-[0_44px_90px_-40px_rgba(23,24,22,0.62)]"
                : "shadow-[0_18px_46px_-32px_rgba(23,24,22,0.4)]"
            }`}
          >
            <Plate id={state.id} />
          </div>
        </motion.div>

        <div className={`flex lg:col-span-5 lg:[direction:ltr] ${state.captionPos}`}>
          <div className="glass-light h-fit max-w-md rounded-2xl p-7">
            <p className="text-bronze text-[0.6875rem] tracking-[0.22em] uppercase">
              {state.index} — {state.title}
            </p>
            <p className="text-ink text-lead mt-4 text-pretty">{state.copy}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ScenePlate, type PlateId } from "./ScenePlate";

interface Scene {
  id: PlateId;
  index: string;
  title: string;
  copy: string;
  /** Background the whole section adopts while this card is active. */
  surface: string;
  ink: "light" | "dark";
}

const SCENES: Scene[] = [
  {
    id: "living",
    index: "01",
    title: "Living spaces",
    copy: "Generous, well-proportioned rooms that hold real family life — where daylight moves across the floor through the day.",
    surface: "mineral-terracotta",
    ink: "light",
  },
  {
    id: "bedroom",
    index: "02",
    title: "Bedrooms",
    copy: "Quiet, softly lit rooms placed away from shared circulation, finished in calm neutral tones.",
    surface: "mineral-ivory",
    ink: "dark",
  },
  {
    id: "balcony",
    index: "03",
    title: "Private balconies",
    copy: "Every residence opens outward. The same airflow the corridors are designed around reaches the balcony first.",
    surface: "mineral-terracotta",
    ink: "light",
  },
  {
    id: "pool",
    index: "04",
    title: "Swimming pool",
    copy: "A considered leisure space for residents, part of the development's shared family amenities.",
    surface: "mineral-water",
    ink: "light",
  },
];

/**
 * Scroll-led residence sequence.
 *
 * The section background adopts the active card's surface, so the page
 * itself becomes the room being described — the cinematography bible's
 * "technology becomes life" progression, applied to scroll.
 *
 * Native scrolling throughout: no pinning, no hijack, no wheel interception.
 * The sticky layer is only the backdrop; the cards scroll normally past it.
 */
export default function LivingScrollCards() {
  const [active, setActive] = useState(0);
  const activeScene = SCENES[active];

  return (
    <section
      aria-labelledby="residences-heading"
      className="relative"
      data-section="residences"
    >
      {/* Backdrop stack — one layer per scene, cross-faded. Sticky so it
          holds behind the cards without trapping the scroll. */}
      <div className="pointer-events-none sticky top-0 h-svh overflow-hidden" aria-hidden="true">
        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            className={`${scene.surface} grain absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out-quint)]`}
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Content rides on top of the sticky backdrop. The pull-up must be an
          arbitrary value — there is no `-mt-svh` utility, and silently getting
          no margin leaves a full empty viewport above the heading. */}
      <div className="relative -mt-[100svh]">
        <header className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-(--spacing-section) pb-8">
          <p
            className={`mb-4 text-[0.6875rem] tracking-[0.22em] uppercase transition-colors duration-700 ${
              activeScene.ink === "light" ? "text-ivory/70" : "text-bronze"
            }`}
          >
            The residences
          </p>
          <h2
            id="residences-heading"
            className={`font-display max-w-[14ch] text-d2 font-semibold transition-colors duration-700 ${
              activeScene.ink === "light" ? "text-ivory" : "text-charcoal"
            }`}
          >
            Homes made for real life.
          </h2>
        </header>

        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-(--spacing-section)">
          {SCENES.map((scene, i) => (
            <Card
              key={scene.id}
              scene={scene}
              isActive={i === active}
              onActivate={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  scene,
  isActive,
  onActivate,
}: {
  scene: Scene;
  isActive: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Levitation — the plate drifts up as the card crosses the viewport.
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [46, 0, -46]);
  const lift = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.97, 1, 0.97]);

  return (
    <motion.article
      ref={ref}
      onViewportEnter={onActivate}
      viewport={{ amount: 0.55 }}
      className="flex min-h-[86svh] items-center py-10"
    >
      <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Plate */}
        <motion.div
          style={reduced ? undefined : { y, scale: lift }}
          className="lg:col-span-7"
        >
          <div
            className={`overflow-hidden rounded-2xl transition-shadow duration-700 ${
              isActive
                ? "shadow-[0_44px_90px_-40px_rgba(23,24,22,0.62)]"
                : "shadow-[0_18px_46px_-32px_rgba(23,24,22,0.4)]"
            }`}
          >
            <ScenePlate id={scene.id} />
          </div>
        </motion.div>

        {/* Caption */}
        <div className="lg:col-span-5">
          <div className="glass-light max-w-md rounded-2xl p-7">
            <p className="text-bronze text-[0.6875rem] tracking-[0.22em] uppercase">
              {scene.index} — {scene.title}
            </p>
            <p className="text-ink mt-4 text-lead text-pretty">{scene.copy}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

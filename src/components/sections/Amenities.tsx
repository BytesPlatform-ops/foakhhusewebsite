"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";
import { Plate, type PlateId } from "./plates";

/**
 * 18 — Everyday Comfort. Editorial amenity sequence — five scenes, each
 * with its own cinematography and palette (pool overhead / lobby one-point /
 * parking low-angle / recreation garden / security entrance). Panels enter
 * layered and offset; nothing is a repeated identical card.
 */

interface AmenityScene {
  id: PlateId;
  num: string;
  title: string;
  copy: string;
  surface: string;
  ink: "light" | "dark";
  /** editorial offsets — the layout breathes instead of stacking uniformly */
  wrap: string;
}

const SCENES: AmenityScene[] = [
  {
    id: "pool",
    num: "01",
    title: "Swimming pool",
    copy: "A considered leisure space at the heart of the amenity programme — the aqua light of this pool carries into the neighbouring interiors.",
    surface: "mineral-water",
    ink: "light",
    wrap: "lg:col-span-8",
  },
  {
    id: "lobby",
    num: "02",
    title: "Ventilated elevator lobbies",
    copy: "High-speed elevators open onto lobbies served by the corridor airflow system.",
    surface: "mineral-dark",
    ink: "light",
    wrap: "lg:col-span-4 lg:mt-24",
  },
  {
    id: "parking",
    num: "03",
    title: "Dedicated parking",
    copy: "Sheltered, well-lit parking with a direct route to the lobbies.",
    surface: "mineral-graphite",
    ink: "light",
    wrap: "lg:col-span-5 lg:-mt-10",
  },
  {
    id: "recreation",
    num: "04",
    title: "Family recreation",
    copy: "Green shared spaces planned for families — play, walking and evening air.",
    surface: "mineral-garden",
    ink: "light",
    wrap: "lg:col-span-7 lg:mt-14",
  },
  {
    id: "security",
    num: "05",
    title: "24/7 security",
    copy: "A managed entrance with round-the-clock security and warm, practical lighting.",
    surface: "mineral-graphite",
    ink: "light",
    wrap: "lg:col-span-6 lg:col-start-4",
  },
];

export default function Amenities() {
  const reduced = useReducedMotion();

  return (
    <section
      id="amenities"
      data-section="amenities"
      className="mineral-ivory grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#efe7dd" } as React.CSSProperties}
      aria-labelledby="amenities-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="04">Everyday comfort</Eyebrow>
        <ChapterHeading id="amenities-heading">Considered beyond the front door.</ChapterHeading>
        <Lead>
          Thoughtfully selected amenities support convenience, security and refined family
          living.
        </Lead>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {SCENES.map((s, i) => (
            <motion.figure
              key={s.id}
              className={`${s.wrap}`}
              initial={reduced ? undefined : { opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.75, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`${s.surface} overflow-hidden rounded-2xl`}>
                <div className="aspect-[10/7]">
                  <Plate id={s.id} />
                </div>
                <figcaption className="flex items-baseline gap-4 px-6 py-5">
                  <span
                    className={`text-xs tabular-nums ${s.ink === "light" ? "text-champagne" : "text-bronze"}`}
                  >
                    {s.num}
                  </span>
                  <span>
                    <span
                      className={`font-display block text-xl font-semibold ${
                        s.ink === "light" ? "text-ivory" : "text-charcoal"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`mt-1 block text-sm leading-relaxed ${
                        s.ink === "light" ? "text-ivory/70" : "text-ink-soft"
                      }`}
                    >
                      {s.copy}
                    </span>
                  </span>
                </figcaption>
              </div>
            </motion.figure>
          ))}
        </div>

        <p className="text-ink-soft mt-10 text-sm">
          Also part of the programme: high-speed elevators, modern architecture and reliable
          water-system planning.
        </p>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";

/**
 * 19 — Design Journey. The snake route continues as a vertical connector;
 * each verified stage is an architectural marker whose building mark
 * evolves from line drawing to solid material. No invented dates or
 * completion percentages — the repository contains none.
 */

const STAGES = [
  { num: "01", name: "Residential vision", copy: "A limited community shaped around family living." },
  { num: "02", name: "Architectural planning", copy: "Two 12-storey blocks with private balconies and shared space." },
  { num: "03", name: "Wind-corridor integration", copy: "The wind catcher and corridor airflow designed into the core." },
  { num: "04", name: "Renewable-energy planning", copy: "Turbines and rooftop solar planned to support selected requirements." },
  { num: "05", name: "Detailed engineering", copy: "Systems, water treatment and desalination planning refined." },
  { num: "06", name: "Future community", copy: "84 homes sharing one considered environment." },
];

export default function Timeline() {
  const reduced = useReducedMotion();

  return (
    <section
      id="timeline"
      data-section="timeline"
      className="mineral-ivory grain blend-top relative overflow-hidden py-(--spacing-section)"
      style={{ "--blend-from": "#efe7dd" } as React.CSSProperties}
      aria-labelledby="timeline-heading"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="04">Design journey</Eyebrow>
        <ChapterHeading id="timeline-heading">From vision to a living system.</ChapterHeading>
        <Lead>Verified stages of the project&rsquo;s development — no projected dates are published
          until approved.</Lead>

        <ol className="relative mt-14 max-w-3xl">
          {/* the continuing route */}
          <motion.span
            aria-hidden="true"
            className="bg-bronze/40 absolute top-2 bottom-2 left-[11px] w-0.5 origin-top"
            initial={reduced ? undefined : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {STAGES.map((s, i) => {
            // the mark solidifies as the journey progresses
            const solid = i / (STAGES.length - 1);
            return (
              <motion.li
                key={s.num}
                className="relative flex gap-6 pb-10 pl-1 last:pb-0"
                initial={reduced ? undefined : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* marker: building glyph, line -> material */}
                <svg viewBox="0 0 24 24" className="relative z-10 mt-0.5 h-6 w-6 shrink-0" aria-hidden="true">
                  <rect x="4" y="6" width="16" height="14" rx="1" fill="#b06c4c" fillOpacity={solid} stroke="#87543e" strokeWidth="1.6" />
                  <line x1="4" y1="11" x2="20" y2="11" stroke="#87543e" strokeWidth="1" />
                  <line x1="4" y1="15" x2="20" y2="15" stroke="#87543e" strokeWidth="1" />
                </svg>
                <div>
                  <p className="text-bronze text-[0.6875rem] tracking-[0.22em] uppercase">
                    {s.num} — {s.name}
                  </p>
                  <p className="text-ink mt-1.5 leading-relaxed">{s.copy}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

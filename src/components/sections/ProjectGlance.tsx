"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * 01 — The Project: cinematic approach to the entrance.
 *
 * Scroll behaviour inspired by collabcapitolium.fr (mood/pacing only): the
 * dusk frontal render holds the sticky stage while a slow camera push —
 * scale anchored on the gate at 50% 74% of the frame — draws the visitor
 * down the walkway toward the entrance. The centred copy begins dim and
 * softly blurred, then brightens and sharpens as the doors approach; the
 * block names and CTA arrive with the final frame.
 *
 * Native scrolling, transform/opacity only, spring-driven progress (the
 * ScrollTimeline stale-range guard), no 3D. Reduced motion renders the
 * settled end-frame statically with everything readable.
 */

const COPY = {
  eyebrow: "01 — The Project",
  headline: "Designed around nature.",
  body: "A distinctive residential concept created for comfort, efficiency and future-ready living.",
  caption: "Umer Block · Abdullah Block — 12 storeys · 84 residences",
};

const HIGHLIGHTS = [
  {
    title: "Limited Residences",
    copy: "Only 84 apartments for a more private and exclusive community.",
  },
  {
    title: "Modern Family Living",
    copy: "Well-planned layouts shaped around comfort, functionality and everyday needs.",
  },
  {
    title: "Renewable Energy",
    copy: "Wind turbines and solar panels planned to support cleaner electricity generation.",
  },
  {
    title: "Innovative Ventilation",
    copy: "A purpose-built wind catcher distributes captured air through the building corridors.",
  },
];

const SAVINGS_NOTE =
  "The stated savings are projected targets and may vary according to wind conditions, solar output, occupancy, appliance usage, tariff changes and final system specifications.";

export default function ProjectGlance() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 });

  /* ---- STAGE 1 (0 -> 0.55): the approach — a dolly, not a zoom -------- */
  // Non-linear scale: speed builds as the gate nears. Origin on the door.
  const scale = useTransform(p, [0, 0.3, 0.55, 1], [1.06, 1.22, 1.58, 2.05]);
  const imgY = useTransform(p, [0, 0.55, 1], ["0%", "3.2%", "4.5%"]);
  // The walkway look-down settles flat on arrival — the perspective shift.
  const rotateX = useTransform(p, [0, 0.2, 0.55], [1.8, 1.1, 0]);
  // Atmosphere clears through the approach, deepens again at the threshold.
  const overlay = useTransform(p, [0, 0.42, 0.55, 0.7], [0.56, 0.3, 0.42, 0.52]);

  /* ---- THE THRESHOLD (0.55 -> 0.92): the window contracts ------------- */
  // The frame itself tightens into a portal while the image inside keeps
  // pushing deeper — window and content move against each other.
  // Two phases, both quicker than before: a fast contraction to the
  // portal, then the portal seals completely — the photograph vanishes
  // into the elevation drawing.
  const clip = useTransform(p, (v) => {
    const a = Math.min(Math.max((v - 0.55) / 0.17, 0), 1);
    const ea = 1 - Math.pow(1 - a, 3);
    const b = Math.min(Math.max((v - 0.74) / 0.16, 0), 1);
    const eb = b * b * (3 - 2 * b);
    const top = ea * 27 + eb * 23;
    const right = ea * 31 + eb * 19;
    const bottom = ea * 23 + eb * 27;
    const left = ea * 31 + eb * 19;
    const r = ea * 14 * (1 - b);
    return `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${bottom.toFixed(2)}% ${left.toFixed(2)}% round ${r.toFixed(1)}px)`;
  });

  /* ---- text: reveals on approach, dissolves at the crossing ----------- */
  const textOpacity = useTransform(p, [0.05, 0.4, 0.52, 0.6], [0.35, 1, 1, 0]);
  const textBlur = useTransform(p, [0.05, 0.4], ["blur(5px)", "blur(0px)"]);
  const textY = useTransform(p, [0.05, 0.45], [16, 0]);
  /* stage 2: restrained caption on the stone, beneath the portal */
  const innerOpacity = useTransform(p, [0.7, 0.84], [0, 1]);
  const innerY = useTransform(p, [0.7, 0.84], [14, 0]);

  if (reduced) return <StaticFrame />;

  return (
    <section
      id="glance"
      ref={sectionRef}
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative"
    >
      <div ref={pinRef} className="relative h-[230svh] lg:h-[290svh]">
      {/* Stage ground is the page's stone — when the window contracts, the
          portal sits on the same surface the next section begins from, so
          the two stages and the following section read as one passage. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* THE FRAME — full-bleed scene that tightens into a portal */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          {/* perspective wrapper: the dolly happens inside real depth */}
          <div className="absolute inset-0" style={{ perspective: "1100px" }}>
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ scale, y: imgY, rotateX, transformOrigin: "50% 74%" }}
            >
              <Image
                src="/building-approach.jpg"
                alt=""
                fill
                priority={false}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "50% 60%" }}
              />
            </motion.div>
          </div>

          {/* atmosphere inside the frame */}
          <motion.div aria-hidden="true" className="absolute inset-0 bg-[#14100d]" style={{ opacity: overlay }} />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 42%, transparent 48%, rgb(20 16 13 / 0.55) 100%)",
            }}
          />
          <div className="grain absolute inset-0" aria-hidden="true" />
        </motion.div>

        {/* STAGE 1 message — brightens on approach, dissolves at the door */}
        <motion.div
          className="absolute inset-x-0 top-[30%] mx-auto max-w-3xl px-6 text-center lg:top-[26%]"
          style={{ opacity: textOpacity, y: textY, filter: textBlur }}
        >
          <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
            {COPY.eyebrow}
          </p>
          <h2
            id="glance-heading"
            className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
          >
            {COPY.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[0.85rem] leading-relaxed font-light text-[#F3E7D8]/85 md:text-[0.95rem]">
            {COPY.body}
          </p>
        </motion.div>

        {/* STAGE 2 — beyond the threshold: quiet caption on the stone */}
        <motion.div
          className="absolute inset-x-0 bottom-[7%] mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center"
          style={{ opacity: innerOpacity, y: innerY }}
        >
          <p className="text-[0.62rem] tracking-[0.3em] text-[#9C6247] uppercase">
            Beyond the gate
          </p>
          <p className="font-display text-xl font-medium text-[#1D1714] md:text-2xl">
            {COPY.caption}
          </p>
          <a
            href="#residences"
            className="mt-1 rounded-lg border border-[#9C6247]/45 px-6 py-3 text-sm font-medium text-[#1D1714] transition-colors hover:bg-[#9C6247] hover:text-[#F7F0E8]"
          >
            Explore the Residences
          </a>
        </motion.div>
      </div>
      </div>

      {/* ------- the project introduction — extends the chapter ------- */}
      <ProjectIntroduction />
    </section>
  );
}

/** The approved project introduction: body copy, highlights, closing. */
function ProjectIntroduction() {
  return (
    <div className="relative mx-auto max-w-(--container-page) px-(--spacing-gutter) pt-4 pb-24 lg:pb-28">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* editorial body copy */}
        <div>
          <p className="max-w-[62ch] text-[1.05rem] leading-[1.75] text-[#211A17]/85">
            The Wind Corridor Residences is an exclusive 12-storey development in DHA View
            City, Karachi, featuring Umer Block and Abdullah Block. With only 84 carefully
            planned apartments, the project offers privacy, spacious living and a modern
            architectural identity.
          </p>
          <p className="mt-5 max-w-[62ch] text-[1.05rem] leading-[1.75] text-[#211A17]/78">
            The project has been designed to utilise natural resources for better everyday
            living. Its renewable-energy strategy combines wind turbines and solar panels to
            support electricity generation, while the building&rsquo;s dedicated wind-catcher
            system captures high-velocity air and directs it into the internal corridor
            network.
          </p>
          <p className="mt-5 max-w-[62ch] text-[1.05rem] leading-[1.75] text-[#211A17]/78">
            This innovative approach is intended to improve natural ventilation, reduce heat
            buildup and lower dependence on conventional cooling and grid electricity. Based
            on final engineering performance, residents may benefit from electricity-bill
            savings of up to 60%.
          </p>
          <p className="mt-3 max-w-[62ch] border-l-2 border-[#E5AD42]/60 pl-3.5 text-[0.72rem] leading-[1.6] text-[#211A17]/55">
            {SAVINGS_NOTE}
          </p>
        </div>

        {/* four project highlights */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((h, i) => (
              <motion.article
                key={h.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[16px] border border-[#D8B36A]/45 bg-[#FFF8EF]/92 p-5 shadow-[0_18px_38px_-24px_rgba(148,63,45,0.35)]"
              >
                <p className="font-display text-[1.08rem] leading-snug font-medium text-[#943F2D]">
                  {h.title}
                </p>
                <p className="mt-2 text-[0.85rem] leading-[1.65] text-[#211A17]/72">{h.copy}</p>
              </motion.article>
            ))}
          </div>
          <p className="mt-8 text-[0.72rem] font-semibold tracking-[0.28em] text-[#943F2D] uppercase">
            The future of responsible urban living starts here.
          </p>
          <a
            href="#residences"
            className="mt-5 inline-block rounded-lg border border-[#943F2D]/50 px-6 py-3 text-sm font-medium text-[#211A17] transition-colors hover:bg-[#943F2D] hover:text-[#FFF8EF]"
          >
            Explore the Residences
          </a>
        </div>
      </div>
    </div>
  );
}

/** Reduced motion: the settled end-frame, fully readable, no pin. */
function StaticFrame() {
  return (
    <section
      id="glance"
      data-section="glance"
      aria-labelledby="glance-heading"
      className="relative flex min-h-svh items-center overflow-hidden bg-[#1D1714]"
    >
      <Image
        src="/building-approach.jpg"
        alt=""
        fill
        sizes="100vw"
        className="scale-125 object-cover"
        style={{ objectPosition: "50% 66%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#14100d]/40" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[0.65rem] font-medium tracking-[0.32em] text-[#C6A46B] uppercase">
          {COPY.eyebrow}
        </p>
        <h2
          id="glance-heading"
          className="font-display mt-5 text-[clamp(2.1rem,4.6vw,4.1rem)] leading-[1.06] font-medium text-[#F7F0E8] text-balance"
        >
          {COPY.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[0.9rem] leading-relaxed font-light text-[#F3E7D8]/85">
          {COPY.body}
        </p>
        <p className="mt-8 text-[0.65rem] tracking-[0.26em] text-[#F7F0E8]/75 uppercase">
          {COPY.caption}
        </p>
      </div>
      <div className="relative bg-[#F6EBDD]">
        <ProjectIntroduction />
      </div>
    </section>
  );
}

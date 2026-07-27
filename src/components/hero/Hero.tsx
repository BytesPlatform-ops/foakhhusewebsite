import BuildingExperience from "@/components/intro/BuildingExperience";
import FactsRail from "./FactsRail";
import { FLAGS } from "@/lib/flags";

/**
 * Hero — the settled Shot E of the intro.
 *
 * Depth stack (bottom to top):
 *   atmosphere + site lines  ->  BACK type (WHERE NATURE POWERS)  ->
 *   canvas (building occludes with its true silhouette)  ->
 *   FRONT type (MODERN LIVING)  ->  facts, CTAs.
 *
 * The camera settles with the building right-of-frame at ~50–58% width, so
 * POWERS runs into Umer Block and is genuinely occluded, while MODERN
 * LIVING passes in front of the base. No clip-path, no traced silhouette —
 * the mask is the real render.
 */

const BACK_LINES = ["WHERE", "NATURE", "POWERS"];
const FRONT_LINES = ["MODERN LIVING"];

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-svh items-center overflow-hidden">
      {/* ------- Atmosphere: environmental light, not a flat cream ------- */}
      <div className="mineral-ivory grain absolute inset-0" aria-hidden="true">
        {/* terracotta cloud near the building base (right of frame) */}
        <div
          className="absolute right-[-6%] bottom-[-12%] h-[55%] w-[70%] rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(174 102 73 / 0.55), transparent 70%)",
          }}
        />
        {/* muted wind-blue light behind the upper floors */}
        <div
          className="absolute top-[-8%] right-[4%] h-[52%] w-[52%] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(96 152 170 / 0.5), transparent 70%)",
          }}
        />
        {/* champagne edge light from the key-light side */}
        <div
          className="absolute top-[16%] left-[-8%] h-[46%] w-[42%] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(212 179 111 / 0.5), transparent 72%)",
          }}
        />
        {/* faint architectural site lines */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[30%] w-full opacity-[0.16]"
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
        >
          <path d="M0 210 L1440 150" stroke="#87543e" strokeWidth="1" fill="none" />
          <path d="M0 258 L1440 226" stroke="#87543e" strokeWidth="1" fill="none" />
          <path d="M880 300 L1030 0" stroke="#87543e" strokeWidth="0.8" fill="none" />
          <path d="M1130 300 L1240 40" stroke="#87543e" strokeWidth="0.8" fill="none" />
        </svg>
      </div>

      {/* ------- BACK typography — building passes in front (desktop) ---- */}
      <TypeLayer lines={BACK_LINES} z="var(--z-hero-text-back)" className="hidden pt-[9vh] lg:block" />

      <BuildingExperience />

      {/* ------- FRONT typography — crosses the building's mid-zone ------ */}
      <TypeLayer
        lines={FRONT_LINES}
        z="var(--z-hero-text-front)"
        className="hidden pt-[9vh] lg:block"
        offsetClass="mt-[calc(3.06*0.92*var(--text-d1))] ml-[2vw]"
      />

      {/* Accessible headline: styled and in-flow on mobile (the canvas sits
          above the content there), invisible-but-announced on desktop where
          the decorative layers carry the composition. */}
      <div
        className="relative mx-auto w-full max-w-(--container-page) px-(--spacing-gutter)"
        style={{ zIndex: "var(--z-content)" }}
      >
        <div className="flex min-h-svh flex-col justify-end pt-[54svh] pb-10 lg:pt-32">
          <div className="max-w-[32rem]">
            <h1 className="font-display text-charcoal text-d2 mb-5 font-semibold lg:sr-only">
              Where nature powers modern living
            </h1>
            <p className="text-bronze mb-3 text-[0.6875rem] tracking-[0.22em] uppercase">
              DHA View City · Karachi
            </p>
            <p className="text-ink-soft text-lead text-balance">
              A future-focused residential development shaped around natural airflow,
              renewable-energy planning and refined family living.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#residences"
                className="bg-charcoal text-ivory hover:bg-deep-earth rounded-full px-6 py-3 text-sm font-medium transition-colors duration-[var(--duration-ui)]"
              >
                Explore the residences
              </a>
              <a href="#route" className="glass-light rounded-full px-6 py-3 text-sm font-medium">
                See how it works
              </a>
            </div>
          </div>

          <FactsRail />

          {FLAGS.kitePower && (
            <p className="text-ink-soft mt-4 text-xs">
              Rooftop kite generator shown as a concept — awaiting technical approval.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function TypeLayer({
  lines,
  z,
  className = "",
  offsetClass = "",
}: {
  lines: readonly string[];
  z: string;
  className?: string;
  offsetClass?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ zIndex: z }}
      aria-hidden="true"
    >
      <div className="mx-auto h-full max-w-(--container-page) px-(--spacing-gutter)">
        <p
          className={`font-display text-charcoal/95 text-d1 font-semibold ${offsetClass}`}
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

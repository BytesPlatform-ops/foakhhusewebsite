import BuildingExperience from "@/components/intro/BuildingExperience";
import { FLAGS } from "@/lib/flags";

/**
 * The headline is declared once and rendered twice — once behind the canvas,
 * once in front. Each layer shows only its own lines and renders the rest as
 * invisible spacers, so the two layers are geometrically identical and cannot
 * fall out of register at any viewport size.
 *
 * "LIVING" is indented so it crosses the building's left edge, which is what
 * produces the depth read: two lines occluded, one passing in front.
 */
const HEADLINE = [
  { text: "WHERE", front: false, indent: "" },
  { text: "NATURE", front: false, indent: "" },
  { text: "POWERS", front: false, indent: "" },
  { text: "LIVING", front: true, indent: "ml-[18vw]" },
] as const;

function HeadlineLayer({ layer, z }: { layer: "back" | "front"; z: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: z }} aria-hidden="true">
      <div className="mx-auto flex h-full max-w-(--container-page) items-start px-(--spacing-gutter) pt-[14vh]">
        <p className="font-display text-charcoal text-d1 leading-[0.9] font-semibold tracking-[-0.03em]">
          {HEADLINE.map((line) => {
            const mine = layer === "front" ? line.front : !line.front;
            return (
              <span
                key={line.text}
                className={`block ${line.indent} ${mine ? "" : "invisible"}`}
              >
                {line.text}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

const FACTS = [
  { value: "12", label: "Luxury storeys" },
  { value: "02", label: "Umer & Abdullah blocks" },
  { value: "84", label: "Exclusive apartments" },
  { value: "DHA", label: "View City, Karachi" },
];

/**
 * Hero. Server-rendered apart from the canvas.
 *
 * The text-behind-building mask is achieved by layering, not clipping: the
 * headline's first two lines sit at z=1, the canvas at z=2, and the word
 * "LIVING" at z=3. The building therefore occludes real text with its true
 * silhouette — no traced path to drift out of register.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="mineral-ivory grain relative flex min-h-svh items-center overflow-hidden"
    >
      <HeadlineLayer layer="back" z="var(--z-hero-text-back)" />

      <BuildingExperience />

      <HeadlineLayer layer="front" z="var(--z-hero-text-front)" />

      {/* The accessible headline. The decorative layers above are hidden from
          assistive tech; this is the one a screen reader announces. */}
      <h1 className="sr-only">Where nature powers modern living</h1>

      <div
        className="relative mx-auto w-full max-w-(--container-page) px-(--spacing-gutter)"
        style={{ zIndex: "var(--z-content)" }}
      >
        <div className="flex min-h-svh flex-col justify-end pt-32 pb-12">
          {/* Constrained so the copy column stays clear of the building,
              which the camera places to the right of frame. */}
          <div className="max-w-[34rem]">
            <p className="text-bronze mb-4 text-[0.6875rem] tracking-[0.22em] uppercase">
              DHA View City · Karachi
            </p>
            <p className="text-ink-soft text-lead text-balance">
              A future-focused residential development shaped around natural airflow,
              renewable-energy planning and refined family living.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/residences"
                className="bg-charcoal text-ivory hover:bg-deep-earth rounded-full px-6 py-3 text-sm font-medium transition-colors duration-[var(--duration-ui)]"
              >
                Explore the residences
              </a>
              <a
                href="/technology"
                className="glass-light rounded-full px-6 py-3 text-sm font-medium"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Project facts */}
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl md:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label} className="glass-light px-5 py-4">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="font-display block text-3xl leading-none font-semibold">
                    {fact.value}
                  </span>
                  <span className="text-ink-soft mt-1.5 block text-xs tracking-[0.1em] uppercase">
                    {fact.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {FLAGS.kitePower && (
            <p className="text-ink-soft mt-5 text-xs">
              Rooftop kite generator shown as a concept — awaiting technical approval.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

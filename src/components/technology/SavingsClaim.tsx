/**
 * COMPLIANCE PRIMITIVE — do not split.
 *
 * The "up to 60%" figure may never appear without its approved performance
 * qualification. The qualification is rendered as a sibling element inside
 * this component rather than passed in as a prop, so there is no way to
 * render the headline number without it. Anywhere the figure is needed,
 * use this component.
 */
export const SAVINGS_QUALIFICATION =
  "Projected savings may vary according to wind conditions, solar output, occupancy, appliance usage, tariff changes and final system specifications.";

export function SavingsClaim({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const muted = tone === "dark" ? "text-ivory/70" : "text-ink-soft";
  const strong = tone === "dark" ? "text-ivory" : "text-charcoal";

  return (
    <div>
      <p className={`font-display text-d3 font-semibold ${strong}`}>
        Potential electricity-bill savings of up to 60%
        <span aria-hidden="true">*</span>
      </p>
      <p className={`mt-3 max-w-prose text-sm leading-relaxed ${muted}`}>
        <span aria-hidden="true">*</span>
        {SAVINGS_QUALIFICATION}
      </p>
    </div>
  );
}

/**
 * COMPLIANCE PRIMITIVE — do not split.
 *
 * The "up to 75%" figure may never appear without its approved performance
 * qualification. The qualification is rendered as a sibling element inside
 * this component rather than passed in as a prop, so there is no way to
 * render the headline number without it. Anywhere the figure is needed,
 * use this component.
 */
export const SAVINGS_QUALIFICATION =
  "Actual performance may vary depending on environmental conditions, occupancy patterns, appliance usage, tariff structures and final implemented system specifications.";

/** The claim itself, led by the intent rather than by the caveat. */
export const SAVINGS_LEAD =
  "The project has been envisioned to support meaningful long-term energy efficiency. Under favourable operating conditions and according to engineering performance, residents will benefit from substantial electricity-cost reduction potential.";

export function SavingsClaim({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const muted = tone === "dark" ? "text-ivory/70" : "text-ink-soft";
  const faint = tone === "dark" ? "text-ivory/55" : "text-ink-soft/80";
  const strong = tone === "dark" ? "text-ivory" : "text-charcoal";

  return (
    <div>
      <p className={`font-display text-d3 font-semibold ${strong}`}>
        Electricity-cost reduction potential of up to 75%
        <span aria-hidden="true">*</span>
      </p>
      <p className={`mt-3 max-w-prose text-sm leading-relaxed ${muted}`}>{SAVINGS_LEAD}</p>
      <p className={`mt-2.5 max-w-prose text-xs leading-relaxed ${faint}`}>
        <span aria-hidden="true">*</span>
        {SAVINGS_QUALIFICATION}
      </p>
    </div>
  );
}

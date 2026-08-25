import Link from "next/link";

export const PENTHOUSE_TOUR_ROUTE = "/virtual-tour/penthouse";

/**
 * Entry point into the real-time penthouse walkthrough.
 *
 * Deliberately self-contained: the 3D experience is a separate route and a
 * separate bundle, and this is the only thing the marketing pages need to know
 * about it.
 */
export default function ExploreIn3DButton({
  tone = "dark",
  className = "",
}: {
  /** `dark` sits on the espresso penthouse card, `light` on cream surfaces. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Link
      href={PENTHOUSE_TOUR_ROUTE}
      className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[0.55rem] font-semibold tracking-[0.26em] uppercase transition-colors sm:text-[0.6rem] ${className}`}
      style={{
        borderColor: dark ? "rgba(201,144,90,0.55)" : "rgba(148,63,45,0.30)",
        color: dark ? "#E8CFA4" : "var(--foakh-terracotta-deep)",
        background: dark ? "rgba(201,144,90,0.10)" : "rgba(182,84,56,0.06)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125"
        style={{ background: dark ? "#C9905A" : "var(--foakh-terracotta)" }}
      />
      Explore in 3D
    </Link>
  );
}

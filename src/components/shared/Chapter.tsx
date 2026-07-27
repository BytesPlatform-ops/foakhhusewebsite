/**
 * Shared chapter primitives — Dragonfly-style numbered eyebrows and the
 * editorial heading scale, so every section speaks one typographic language.
 */

export function Eyebrow({
  num,
  children,
  tone = "dark",
}: {
  num?: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={`mb-4 text-[0.6875rem] tracking-[0.22em] uppercase ${
        tone === "light" ? "text-ivory/70" : "text-bronze"
      }`}
    >
      {num && <span className="mr-3 tabular-nums">{num}</span>}
      {children}
    </p>
  );
}

export function ChapterHeading({
  id,
  children,
  tone = "dark",
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`font-display text-d2 max-w-[16ch] font-semibold text-balance ${
        tone === "light" ? "text-ivory" : "text-charcoal"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({
  children,
  tone = "dark",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={`text-lead mt-6 max-w-(--container-prose) text-pretty ${
        tone === "light" ? "text-ivory/75" : "text-ink-soft"
      } ${className}`}
    >
      {children}
    </p>
  );
}

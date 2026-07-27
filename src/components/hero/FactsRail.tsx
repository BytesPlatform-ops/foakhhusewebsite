"use client";

import { useSyncExternalStore } from "react";
import { hasIntroPlayed, prefersReducedMotion } from "@/lib/env-capability";

/**
 * Editorial project-facts rail — one continuous warm-glass band with thin
 * architectural dividers, varied number scale and offset baselines. Not
 * four identical cards. It enters only after the intro camera settles
 * (the `wcr:intro-done` event), with a safety timeout so it can never be
 * lost if the event is missed.
 */

const FACTS = [
  { value: "12", label: "Luxury storeys", size: "text-5xl", offset: "" },
  { value: "02", label: "Umer & Abdullah blocks", size: "text-4xl", offset: "sm:mt-3" },
  { value: "84", label: "Exclusive apartments", size: "text-6xl", offset: "sm:-mt-1" },
  { value: "DHA", label: "View City · Karachi", size: "text-3xl", offset: "sm:mt-4" },
];

// Readiness modelled as an external store: the intro-done event (with a
// safety timeout) is the external system, so no effect ever calls setState
// synchronously and SSR renders the hidden state.
let railReady = false;
function subscribeReady(onChange: () => void) {
  if (railReady) return () => {};
  if (hasIntroPlayed() || prefersReducedMotion()) {
    railReady = true;
    queueMicrotask(onChange);
    return () => {};
  }
  const show = () => {
    railReady = true;
    onChange();
  };
  window.addEventListener("wcr:intro-done", show, { once: true });
  const safety = window.setTimeout(show, 7000);
  return () => {
    window.removeEventListener("wcr:intro-done", show);
    window.clearTimeout(safety);
  };
}

export default function FactsRail() {
  const ready = useSyncExternalStore(
    subscribeReady,
    () => railReady,
    () => false,
  );

  return (
    <dl
      className="glass-light mt-12 flex flex-wrap items-start rounded-lg px-2 py-5 transition-all duration-700 ease-[var(--ease-out-quint)] sm:flex-nowrap"
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(18px)",
      }}
    >
      {FACTS.map((fact, i) => (
        <div
          key={fact.label}
          className={`min-w-0 flex-1 basis-1/2 px-5 py-1 sm:basis-auto ${fact.offset} ${
            i > 0 ? "sm:border-l sm:border-charcoal/12" : ""
          }`}
        >
          <dt className="sr-only">{fact.label}</dt>
          <dd>
            <span className={`font-display text-charcoal block leading-none font-semibold ${fact.size}`}>
              {fact.value}
            </span>
            <span className="text-ink-soft mt-2 block text-[0.65rem] tracking-[0.14em] uppercase">
              {fact.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

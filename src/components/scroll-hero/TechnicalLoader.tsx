"use client";

import { useEffect, useState } from "react";

/**
 * Minimal technical loader — a 300–500ms transition while fonts settle,
 * nothing more. Small two-block mark inside a wind ring; no percentage,
 * no story, no blocking once essentials are ready. Unmounts completely
 * after its fade so it costs nothing afterwards.
 */
export default function TechnicalLoader() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    let cancelled = false;
    const MIN = 300;
    const MAX = 500;
    const start = performance.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("fading");
        window.setTimeout(() => !cancelled && setPhase("gone"), 260);
      }, Math.max(0, MIN - elapsed));
    };

    // Unblock when fonts are ready, capped hard at MAX.
    const cap = window.setTimeout(finish, MAX);
    document.fonts?.ready.then(finish).catch(finish);

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-(--z-intro) grid place-items-center bg-[#efe7dd] transition-opacity duration-250"
      style={{ opacity: phase === "fading" ? 0 : 1 }}
    >
      <svg viewBox="0 0 96 96" className="h-16 w-16">
        {/* wind ring */}
        <circle
          cx="48" cy="48" r="42" fill="none" stroke="#26d4de" strokeWidth="3"
          strokeDasharray="66 200" strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform" type="rotate"
            from="0 48 48" to="360 48 48" dur="1.1s" repeatCount="indefinite"
          />
        </circle>
        {/* two-block mark */}
        <rect x="30" y="34" width="14" height="30" fill="#a75e42" />
        <rect x="52" y="40" width="14" height="24" fill="#a75e42" />
      </svg>
    </div>
  );
}

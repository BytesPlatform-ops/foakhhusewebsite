"use client";

import { useEffect, useState } from "react";

/**
 * True below the `lg` breakpoint — the same line the layout already splits
 * on, so a component's mobile branch and its mobile motion agree.
 *
 * Starts false so the server render and the first client render match; the
 * effect corrects it before paint-relevant work in practice. Components that
 * would flash the wrong branch should key their *layout* off Tailwind's
 * `lg:` classes and use this only for motion and behaviour.
 */
export default function useIsMobile(query = "(max-width: 1023px)") {
  const [is, setIs] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setIs(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return is;
}

/**
 * One motion vocabulary for the mobile pass, so a section never animates in
 * 300ms while the next takes two seconds.
 */
export const M = {
  /** micro UI — taps, capsules, indicators */
  ui: 0.3,
  /** text — headings, body, labels */
  text: 0.48,
  /** images and media reveals */
  media: 0.62,
  /** whole-section handovers */
  section: 0.75,
  /** the shared easing (a power3.out equivalent) */
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

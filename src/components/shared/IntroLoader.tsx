"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CLAY_BG } from "./BuildIn";

/**
 * First-visit loading screen — the site's own brick/clay construction
 * language standing in for a generic spinner. A stepped progress bar
 * (14 discrete courses, like BuildIn's construction reveal) fills with
 * the same raw clay texture used across the site, tracking real page
 * load rather than a fake timer: it eases toward 90% on its own, then
 * completes only once the window actually finishes loading.
 *
 * Shown once per browser session (sessionStorage) — a refresh mid-visit
 * won't retrigger it. Reduced-motion visitors skip straight past it.
 *
 * A short chime marks completion, synthesised with the Web Audio API
 * (no audio file to ship or license). Browsers gate audio-without-a-
 * gesture, so on a genuinely first, untouched load some may silently
 * block it — the attempt is best-effort and never blocks the reveal.
 */

const SESSION_KEY = "foakh-intro-seen";
const COURSES = 14;

/** three soft ascending sine notes, quick attack/decay — no file needed */
function playChime() {
  try {
    type LegacyWindow = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [660, 880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    // audio blocked or unsupported — the loading screen still completes fine
  }
}

export default function IntroLoader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(3);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(true);
    } catch {
      // sessionStorage unavailable (private mode edge cases) — skip quietly
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      setReady(true);
      return;
    }

    document.body.style.overflow = "hidden";

    let raf = 0;
    const tick = () => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.045));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      cancelAnimationFrame(raf);
      setProgress(100);
      setTimeout(() => setReady(true), 550);
    };

    let settle: ReturnType<typeof setTimeout>;
    if (document.readyState === "complete") {
      settle = setTimeout(finish, 700);
    } else {
      window.addEventListener("load", finish);
    }
    // hard cap so a slow asset can never trap a visitor here
    const cap = setTimeout(finish, 6000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", finish);
      clearTimeout(settle);
      clearTimeout(cap);
    };
  }, [visible, reduced]);

  useEffect(() => {
    if (ready) document.body.style.overflow = "";
  }, [ready]);

  if (!visible) return null;

  const stepped = Math.ceil((progress / 100) * COURSES) * (100 / COURSES);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Loading Foakh Wind Corridor Enclave"
          className="fixed inset-0 z-(--z-intro) flex flex-col items-center justify-center bg-[#F5EDE3]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center gap-8 px-6">
            <div className="text-center">
              <p className="text-[0.62rem] font-medium tracking-[0.4em] text-[#B65438] uppercase">
                Foakh
              </p>
              <p className="font-display mt-2 text-[1.3rem] font-medium text-[#2B211D]">
                Wind Corridor Enclave
              </p>
            </div>

            <div className="relative h-3 w-[min(72vw,280px)] overflow-hidden rounded-full border border-[#2B211D]/15 bg-[#2B211D]/[0.04]">
              <div
                className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, stepped)}%` }}
              >
                <span className="absolute inset-0" style={{ background: CLAY_BG }} />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-[4px]"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,214,164,0.95))" }}
                />
              </div>
            </div>

            <p className="font-mono text-[0.66rem] tracking-[0.2em] text-[#2B211D]/45 tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

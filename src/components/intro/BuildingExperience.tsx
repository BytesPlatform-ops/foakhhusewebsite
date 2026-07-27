"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { BuildingScene } from "./scene/building-scene";
import {
  detectDeviceTier,
  getRenderCapability,
  hasIntroPlayed,
  markIntroPlayed,
  serverCapability,
  subscribeToCapability,
} from "@/lib/env-capability";
import { FLAGS } from "@/lib/flags";

type Mode = "pending" | "intro" | "hero";

const DESKTOP_MS = 4200;
const MOBILE_MS = 2600;
const SKIP_AFTER_MS = 900;

/**
 * Owns the site's single WebGL canvas.
 *
 * Boots into one of three states:
 *   - intro    : full assembly, once per session
 *   - hero     : straight to the finished building (intro already seen)
 *   - fallback : no WebGL, or the visitor prefers reduced motion
 *
 * The canvas is never torn down between intro and hero — the same scene
 * continues, so there is no hard cut and no second context allocation.
 */
export default function BuildingExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BuildingScene | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // Derived, not stored: no effect writes this, so there is no cascading
  // render and no server/client hydration disagreement.
  const capability = useSyncExternalStore(
    subscribeToCapability,
    getRenderCapability,
    serverCapability,
  );
  const isStatic = capability === "static";

  const [mode, setMode] = useState<Mode>("pending");
  const [showSkip, setShowSkip] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const showStatic = isStatic || loadFailed;

  /** Jump the scene to its finished state and hand off to ambient live mode. */
  const finishIntro = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const scene = sceneRef.current;
    if (scene) {
      scene.applyProgress(1);
      scene.setPhase("live");
      scene.start();
    }
    markIntroPlayed();
    setIntroDone(true);
    setShowSkip(false);
    // The hero UI (facts rail, CTAs) listens for this — it appears only
    // once the camera has settled, never during the close-up shots.
    window.dispatchEvent(new Event("wcr:intro-done"));
  }, []);

  /* ------------------------------------------------------------- boot up */

  useEffect(() => {
    // Reduced motion and absent WebGL both resolve to the static composition,
    // and three.js is never fetched at all. The UI shows immediately.
    if (isStatic) {
      window.dispatchEvent(new Event("wcr:intro-done"));
      return;
    }

    let cancelled = false;
    const skipIntro = hasIntroPlayed();
    const tier = detectDeviceTier();

    // The 3D module is imported only after we know it will be used, keeping
    // three.js out of the initial bundle and off the server entirely.
    import("./scene/building-scene")
      .then(({ BuildingScene: Scene }) => {
        if (cancelled || !canvasRef.current) return;

        const scene = new Scene(canvasRef.current, {
          tier,
          showKite: FLAGS.kitePower,
        });
        sceneRef.current = scene;
        scene.resize();

        if (skipIntro) {
          setMode("hero");
          finishIntro();
          return;
        }

        setMode("intro");
        const duration = tier === "low" || window.innerWidth < 768 ? MOBILE_MS : DESKTOP_MS;
        const startedAt = performance.now();

        const step = () => {
          const elapsed = performance.now() - startedAt;
          const p = Math.min(elapsed / duration, 1);
          scene.setProgress(p);
          if (p >= 1) {
            finishIntro();
            return;
          }
          rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);

        window.setTimeout(() => !cancelled && setShowSkip(true), SKIP_AFTER_MS);
      })
      .catch(() => {
        // Chunk failed to load — fall through to the static composition
        // rather than leaving an empty hero.
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [finishIntro, isStatic]);

  /* ------------------------------------------------------------- resize */

  useEffect(() => {
    if (showStatic || mode === "pending") return;
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => sceneRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, showStatic]);

  /* --------------------------------------------- pause when not visible */

  useEffect(() => {
    if (!introDone || showStatic) return;
    const el = shellRef.current;
    if (!el) return;

    let onScreen = true;
    const sync = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      // Both conditions must hold. Anything else stops the loop outright,
      // so a parked tab or a scrolled-past hero costs zero GPU time.
      if (onScreen && document.visibilityState === "visible") scene.start();
      else scene.stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    // Settled pointer response (max ~1.5 degrees, handled in the scene).
    // Fine pointers only — touch devices get a perfectly still hero.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (e: PointerEvent) => {
      if (!onScreen) return;
      sceneRef.current?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (fine) window.removeEventListener("pointermove", onPointer);
      sceneRef.current?.stop();
    };
  }, [introDone, showStatic]);

  const introPlaying = !showStatic && mode === "intro" && !introDone;

  return (
    <>
      {/* Intro veil — the ivory ground the building assembles against.
          Sits BELOW the canvas so it backs the scene rather than hiding it,
          then dissolves to reveal the page instead of cutting. */}
      <div
        className="mineral-ivory grain fixed inset-0 transition-opacity duration-700 ease-[var(--ease-out-quint)]"
        style={{
          zIndex: "var(--z-intro)",
          opacity: introPlaying || mode === "pending" ? 1 : 0,
          pointerEvents: "none",
          visibility: mode === "pending" || introPlaying ? "visible" : "hidden",
        }}
      />

      {/* The canvas shell. During the intro it is fixed and full-viewport,
          above the veil; afterwards it drops into the hero as a normal layer.
          The element is never recreated, so the WebGL context survives the
          handoff. aria-hidden: decorative — every fact it depicts is also
          stated in the hero text beside it. */}
      <div
        ref={shellRef}
        aria-hidden="true"
        className={`pointer-events-none ${
          introPlaying
            ? "fixed inset-0"
            : "absolute inset-x-0 top-0 h-[52svh] lg:h-svh"
        }`}
        style={{ zIndex: introPlaying ? 91 : "var(--z-canvas)" }}
      >
        {showStatic ? <StaticBuilding /> : <canvas ref={canvasRef} className="h-full w-full" />}
      </div>

      {/* Intro chrome sits above both. */}
      {introPlaying && (
        <div
          className="fixed inset-x-0 bottom-10 flex flex-col items-center gap-5"
          style={{ zIndex: 92 }}
        >
          <p className="text-ink-soft text-[0.6875rem] tracking-[0.22em] uppercase">
            The Wind Corridor Residences
          </p>
          {showSkip && (
            <button
              type="button"
              onClick={finishIntro}
              className="border-charcoal/25 hover:bg-charcoal hover:text-ivory rounded-full border px-5 py-2 text-xs tracking-[0.14em] uppercase transition-colors duration-[var(--duration-ui)]"
            >
              Skip intro
            </button>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Static composition for reduced-motion and no-WebGL visitors.
 * Pure CSS massing — no image dependency, no layout shift, and it reads as
 * the same two-block schematic the 3D scene resolves to.
 */
function StaticBuilding() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[12%]">
      <div className="flex items-end gap-[6%]" style={{ width: "min(62%, 40rem)" }}>
        {["Umer", "Abdullah"].map((block, i) => (
          <div key={block} className="relative flex-1" style={{ height: i === 0 ? "18rem" : "16rem" }}>
            <div className="absolute inset-0 rounded-[3px] bg-gradient-to-b from-copper to-bronze" />
            <div className="absolute inset-0 flex flex-col justify-end gap-[6px] p-2">
              {Array.from({ length: 12 }).map((_, f) => (
                <div key={f} className="h-[3px] rounded-full bg-ivory/25" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

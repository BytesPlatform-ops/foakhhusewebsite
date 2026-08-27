"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PenthouseTour, TourState } from "@/lib/tour/PenthouseTour";
import TouchJoystick from "./TouchJoystick";

const ROOM_SHORTCUTS = [
  { id: "lounge", label: "Living Room" },
  { id: "kitchen", label: "Kitchen" },
  { id: "master", label: "Master Bedroom" },
  { id: "master_bath", label: "Master Bath" },
  { id: "terrace", label: "Terrace" },
  { id: "pool", label: "Pool" },
];

const INITIAL: TourState = {
  phase: "loading",
  progress: 0,
  mode: "firstPerson",
  locked: false,
  room: null,
  doorPrompt: null,
  isTouch: false,
  pointerLockBlocked: false,
  error: null,
  fps: 0,
};

export default function PenthouseWalkthrough() {
  const mountRef = useRef<HTMLDivElement>(null);
  const tourRef = useRef<PenthouseTour | null>(null);
  const [state, setState] = useState<TourState>(INITIAL);
  const [started, setStarted] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  useEffect(() => {
    if (!started || !mountRef.current) return;
    let disposed = false;
    let instance: PenthouseTour | null = null;

    // Loaded on demand so three.js never lands in the initial page bundle and
    // never executes during server rendering.
    (async () => {
      const { PenthouseTour: Tour } = await import("@/lib/tour/PenthouseTour");
      if (disposed || !mountRef.current) return;
      instance = new Tour(mountRef.current);
      instance.onState = (s) => setState({ ...s });
      tourRef.current = instance;
      // Handle for the Playwright suite in tests/tour.spec.ts.
      (window as unknown as Record<string, unknown>).__penthouseTour = instance;
      await instance.init();
    })();

    return () => {
      disposed = true;
      instance?.dispose();
      tourRef.current = null;
    };
  }, [started]);

  const enter = useCallback(() => tourRef.current?.enter(), []);
  const reset = useCallback(() => tourRef.current?.resetPosition(), []);
  const setMode = useCallback((m: "firstPerson" | "dollhouse") => {
    tourRef.current?.setMode(m);
  }, []);
  const joystick = useCallback((x: number, y: number, active: boolean) => {
    tourRef.current?.setJoystick(x, y, active);
  }, []);

  const ready = state.phase === "ready";
  const pct = Math.round(state.progress * 100);
  // Pointer Lock is the norm, but where the browser refuses it the tour runs on
  // mouse-drag look — which means "entered", so the overlay must clear.
  const walking = state.locked || state.pointerLockBlocked;

  // ---------------------------------------------------------------- preview

  if (!started) {
    return (
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#161210]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/duplex-pool.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.42em] text-[var(--foakh-gold-light)]">
            Foakh — Penthouse Type A-1
          </p>
          <h1
            className="mt-5 text-4xl leading-tight text-[#f7f1e8] sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Duplex Penthouse
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/70">
            Walk the residence exactly as it is drawn — two floors, the entrance hall,
            the living room, both bedroom wings, the duplex stair, the roof terrace and
            the pool. Move freely; nothing is on rails.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-9 rounded-full border border-[var(--foakh-gold)] bg-[var(--foakh-terracotta)] px-9 py-4 text-[0.7rem] uppercase tracking-[0.3em] text-[#fdf8f2] transition hover:bg-[var(--foakh-terracotta-deep)]"
          >
            Explore in 3D
          </button>
          <p className="mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-white/40">
            ~2 MB · WASD &amp; mouse on desktop · touch controls on mobile
          </p>
        </div>
      </section>
    );
  }

  // ------------------------------------------------------------------ viewer

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#0f0d0c]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Loading -------------------------------------------------------- */}
      {state.phase === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#161210]">
          <p
            className="text-3xl tracking-[0.36em] text-[#f7f1e8]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FOAKH
          </p>
          <p className="mt-4 text-[0.66rem] uppercase tracking-[0.32em] text-white/55">
            Loading Your Residence…
          </p>
          <div className="mt-7 h-px w-64 overflow-hidden bg-white/15">
            <div
              className="h-full bg-[var(--foakh-gold)] transition-[width] duration-200"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
          <p className="mt-4 text-sm tabular-nums tracking-[0.2em] text-[var(--foakh-gold-light)]">
            {pct}%
          </p>
        </div>
      )}

      {/* Error ---------------------------------------------------------- */}
      {state.phase === "error" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#161210] px-6 text-center">
          <p className="text-[0.66rem] uppercase tracking-[0.3em] text-[var(--foakh-terracotta-soft)]">
            The walkthrough could not start
          </p>
          <p className="max-w-md text-sm text-white/60">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-white/30 px-6 py-3 text-[0.64rem] uppercase tracking-[0.26em] text-white/80 hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      )}

      {/* Click to enter -------------------------------------------------- */}
      {ready && state.mode === "firstPerson" && !walking && !state.isTouch && (
        <button
          onClick={enter}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px]"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.4em] text-[var(--foakh-gold-light)]">
            Click to enter
          </span>
          <span
            className="mt-3 text-2xl uppercase tracking-[0.28em] text-[#f7f1e8] sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Enter Residence
          </span>
          <span className="mt-6 text-[0.6rem] uppercase tracking-[0.24em] text-white/45">
            W A S D — Move · Mouse — Look · Shift — Faster · Esc — Exit
          </span>
        </button>
      )}

      {/* HUD ------------------------------------------------------------- */}
      {ready && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* room label */}
          {state.room && state.mode === "firstPerson" && (
            <div className="absolute left-1/2 top-8 -translate-x-1/2">
              <span className="rounded-full border border-white/15 bg-black/35 px-5 py-2 text-[0.6rem] uppercase tracking-[0.32em] text-white/85 backdrop-blur-sm">
                {state.room}
              </span>
            </div>
          )}

          {/* door prompt */}
          {state.doorPrompt && state.mode === "firstPerson" && walking && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-10">
              <span className="rounded-md border border-[var(--foakh-gold)]/60 bg-black/50 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--foakh-gold-light)] backdrop-blur-sm">
                E — {state.doorPrompt.open ? "Close" : "Open"}
              </span>
            </div>
          )}

          {/* crosshair */}
          {state.mode === "firstPerson" && walking && (
            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55" />
          )}

          {/* control legend */}
          {state.mode === "firstPerson" && !state.isTouch && walking && (
            <div className="absolute bottom-6 left-6 space-y-1 text-[0.58rem] uppercase tracking-[0.2em] text-white/45">
              <p>W A S D — Move</p>
              <p>{state.pointerLockBlocked ? "Drag — Look" : "Mouse — Look"}</p>
              <p>Shift — Faster</p>
              <p>E — Doors · R — Reset</p>
              {!state.pointerLockBlocked && <p>Esc — Exit Controls</p>}
            </div>
          )}

          {/* mode + actions */}
          <div className="pointer-events-auto absolute right-5 top-5 flex flex-col items-end gap-2">
            <div className="flex overflow-hidden rounded-full border border-white/20 bg-black/35 backdrop-blur-sm">
              <button
                onClick={() => setMode("firstPerson")}
                className={`px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em] transition ${
                  state.mode === "firstPerson"
                    ? "bg-[var(--foakh-terracotta)] text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {state.mode === "firstPerson" ? "First Person" : "Enter Apartment"}
              </button>
              <button
                onClick={() => setMode("dollhouse")}
                className={`px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em] transition ${
                  state.mode === "dollhouse"
                    ? "bg-[var(--foakh-terracotta)] text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Dollhouse View
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRooms((v) => !v)}
                className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm hover:text-white"
              >
                Explore
              </button>
              <button
                onClick={reset}
                className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm hover:text-white"
              >
                Reset Position
              </button>
            </div>

            {showRooms && (
              <div className="w-48 overflow-hidden rounded-xl border border-white/15 bg-black/55 backdrop-blur-md">
                {ROOM_SHORTCUTS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      tourRef.current?.gotoRoom(r.id);
                      setShowRooms(false);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* dollhouse hint */}
          {state.mode === "dollhouse" && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.58rem] uppercase tracking-[0.24em] text-white/45">
              Drag to orbit · Scroll to zoom
            </div>
          )}

          {/* mobile */}
          {state.isTouch && state.mode === "firstPerson" && (
            <>
              <TouchJoystick onChange={joystick} />
              <div className="absolute bottom-8 right-6 text-right text-[0.55rem] uppercase tracking-[0.2em] text-white/40">
                <p>Stick — Move</p>
                <p>Drag right — Look</p>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

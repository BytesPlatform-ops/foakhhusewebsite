"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  /** x = strafe, y = forward. Both -1..1. */
  onChange: (x: number, y: number, active: boolean) => void;
}

const RADIUS = 56;

/**
 * Left-hand virtual stick for touch devices. The right side of the screen is
 * handled by the engine's own pointer handler for looking around.
 */
export default function TouchJoystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS;
        dy = (dy / len) * RADIUS;
      }
      setKnob({ x: dx, y: dy });
      // Screen down is +y, but forward should be up.
      onChange(dx / RADIUS, -dy / RADIUS, true);
    },
    [onChange],
  );

  const end = useCallback(() => {
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0, false);
  }, [onChange]);

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto absolute bottom-24 left-6 h-[124px] w-[124px] touch-none rounded-full border border-white/25 bg-black/25 backdrop-blur-sm"
      onPointerDown={(e) => {
        pointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.pointerId !== pointerId.current) return;
        update(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Movement joystick"
      role="application"
    >
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border border-white/50 bg-white/25 shadow-lg transition-transform duration-75"
        style={{ transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}

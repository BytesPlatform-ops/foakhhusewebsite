"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  FLOW_LABELS,
  GIANT_WORDS,
  HERO_STATES,
  type HeroState,
} from "@/lib/scroll-hero-states";

/**
 * The hero's typography system.
 *
 * GIANT WORDS — a MONOLOG-style stack riding BEHIND the silhouette at
 * ~0.4x scroll speed; only the state-active word holds full opacity,
 * the rest stay at 10-14%.
 *
 * STATE BLOCKS — one headline + support per storyboard state, alternating
 * sides at <=26rem so the centred building stays readable. The final CTA
 * state renders front-centre (its actions live in HeroActions).
 *
 * FLOW LABELS — Capture/Channel/Circulate/Cool pills attached along the
 * airflow route during the wind state, never a card row.
 */

export function GiantWords({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], ["6%", "-64%"]);
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 top-1/2 flex flex-col gap-[1.2em]"
      style={{ y }}
    >
      {GIANT_WORDS.map((w) => (
        <GiantWord key={w.word} word={w.word} activeIn={w.activeIn} progress={progress} />
      ))}
    </motion.div>
  );
}

function GiantWord({
  word,
  activeIn,
  progress,
}: {
  word: string;
  activeIn: readonly [number, number];
  progress: MotionValue<number>;
}) {
  const [a, b] = activeIn;
  const f = Math.min(0.04, (b - a) / 3);
  // Active words carry presence, not dominance — the state headline leads.
  const opacity = useTransform(progress, [a - f, a, b, b + f], [0.08, 0.5, 0.5, 0.08]);
  return (
    <motion.span
      className="font-display block text-center text-[clamp(3rem,11vw,9.5rem)] leading-[0.9] font-bold tracking-[-0.03em] whitespace-nowrap text-[#653528]"
      style={{ opacity }}
    >
      {word}
    </motion.span>
  );
}

/* ------------------------------------------------------------ state copy */

export function StateBlocks({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {HERO_STATES.map((state) => (
        <StateBlock key={state.id} state={state} progress={progress} />
      ))}
    </>
  );
}

const SIDE_CLASS: Record<HeroState["side"], string> = {
  left: "left-[4%] bottom-[16%] items-start text-left",
  right: "right-[4%] bottom-[16%] items-end text-right",
  center: "inset-x-0 bottom-[13%] items-center text-center",
};

function StateBlock({ state, progress }: { state: HeroState; progress: MotionValue<number> }) {
  const [a, b] = state.range;
  const fade = Math.min(0.035, (b - a) / 4);
  const opacity = useTransform(progress, [a, a + fade, b - fade, b], [0, 1, 1, state.id === "cta" ? 1 : 0]);
  const y = useTransform(progress, [a, a + fade], [26, 0]);
  const isArrival = state.id === "arrival";
  const isCta = state.id === "cta";

  return (
    <motion.div
      className={`pointer-events-none absolute flex max-w-[26rem] flex-col gap-4 ${
        state.posClass ?? SIDE_CLASS[state.side]
      } ${isCta ? "mx-auto max-w-2xl" : ""}`}
      style={{ opacity, y }}
    >
      {isArrival && (
        <p className="text-[0.6875rem] tracking-[0.24em] text-[#653528] uppercase">
          DHA View City · Karachi
        </p>
      )}
      <p
        className={`font-display leading-[0.95] font-bold tracking-[-0.02em] text-[#171816] ${
          isArrival
            ? "text-2xl md:text-3xl"
            : isCta
              ? "rounded-2xl bg-[#efe7dd]/78 px-6 pt-5 pb-2 text-[clamp(1.9rem,3.6vw,3.3rem)] backdrop-blur-sm"
              : "text-[clamp(1.9rem,4.2vw,3.6rem)]"
        }`}
      >
        {state.headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      {state.copy && (
        <p
          className={`max-w-sm text-sm leading-relaxed text-[#4a453f] md:text-base ${
            isCta ? "max-w-xl rounded-xl bg-[#efe7dd]/78 px-5 py-2 backdrop-blur-sm" : ""
          }`}
        >
          {state.copy}
        </p>
      )}
      {state.note && (
        <p className="text-[0.65rem] tracking-[0.2em] text-[#653528] uppercase">
          {state.note}
        </p>
      )}
      {isArrival && <ScrollIndicator />}
    </motion.div>
  );
}

function ScrollIndicator() {
  return (
    <span className="mt-2 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-[#653528] uppercase">
      Scroll
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        ↓
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------ flow pills */

export function FlowPills({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {FLOW_LABELS.map((l, i) => (
        <FlowPill key={l.word} label={l} index={i} progress={progress} />
      ))}
    </>
  );
}

function FlowPill({
  label,
  index,
  progress,
}: {
  label: (typeof FLOW_LABELS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [label.at, label.at + 0.02, 0.4, 0.44], [0, 1, 1, 0]);
  const y = useTransform(progress, [label.at, label.at + 0.02], [8, 0]);
  return (
    <motion.span
      className="glass-dark absolute rounded-full px-3.5 py-1.5 text-[0.65rem] font-medium tracking-[0.16em] uppercase"
      style={{ left: label.x, top: label.y, opacity, y }}
    >
      <span className="mr-1.5 text-[#26d4de] tabular-nums">0{index + 1}</span>
      {label.word}
    </motion.span>
  );
}

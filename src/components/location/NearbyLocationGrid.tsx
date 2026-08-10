"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The 2×3 nearby-connections grid for the Location panel.
 * Labels only — no travel times are published until verified.
 */

const ITEMS: { icon: keyof typeof ICONS; label: string; sub: string }[] = [
  {
    icon: "cross",
    label: "Healthcare",
    sub: "Shaukat Khanum Hospital — important healthcare access close to home",
  },
  {
    icon: "bag",
    label: "Shopping",
    sub: "Convenient access to shopping and everyday essentials",
  },
  {
    icon: "cap",
    label: "Education",
    sub: "Connectivity to schools and educational facilities for families",
  },
  {
    icon: "road",
    label: "Major Roads",
    sub: "Access to surrounding communities and key transport routes",
  },
  {
    icon: "route",
    label: "Commercial Areas",
    sub: "Everyday services and commercial destinations within the wider location",
  },
];

const ICONS = {
  arch: (
    <path d="M4 19h16M6 19v-8a6 6 0 0 1 12 0v8M9 19v-6a3 3 0 0 1 6 0v6" />
  ),
  cross: (
    <path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6l7-3ZM12 8v6M9 11h6" />
  ),
  road: (
    <path d="M6 20 10 4M18 20 14 4M12 5v2.6M12 11v2.6M12 17v2.6" />
  ),
  cap: (
    <path d="M12 4 2 9l10 5 10-5-10-5ZM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
  ),
  bag: (
    <path d="M5 8h14l-1.2 12H6.2L5 8ZM9 8V6a3 3 0 0 1 6 0v2" />
  ),
  route: (
    <path d="M6 19a3 3 0 1 0 0-6c3 0 4-2 4-4a3 3 0 1 1 6 0c0 4-3 5-6 7M18 6.5v.01" />
  ),
};

export default function NearbyLocationGrid({ onPanel = false }: { onPanel?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div>
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ITEMS.map((item, i) => (
        <motion.li
          key={item.label}
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3.5 rounded-[14px] border border-[#D8AE62]/35 bg-[#FFF4E5] p-3.5 shadow-[0_14px_28px_-18px_rgba(60,26,14,0.5)]"
        >
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#B84E2F] text-[#FFF4E5]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[item.icon]}
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-[0.82rem] leading-snug font-semibold text-[#291A16]">
              {item.label}
            </span>
            <span className="mt-0.5 block border-t border-[#D8AE62]/30 pt-0.5 text-[0.68rem] leading-snug text-[#291A16]/65">
              {item.sub}
            </span>
          </span>
        </motion.li>
      ))}
    </ul>
    <p
      className="mt-6 text-[0.68rem] font-semibold tracking-[0.28em] uppercase"
      style={{ color: onPanel ? "rgba(255,244,229,0.85)" : "#943F2D" }}
    >
      Everything you need, within reach.
    </p>
    </div>
  );
}

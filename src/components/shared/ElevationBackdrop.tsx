"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * One TRULY FIXED architectural backdrop shared by the Project Glance,
 * Project Vision and Natural Systems chapters: the approved elevation
 * drawing stays pinned to the viewport (never scrolling with the page)
 * while each section's foreground moves over it. The wrapped sections
 * keep transparent stages so the shared canvas + drawing show through.
 *
 * The layer only exists while this group owns the viewport — faded out
 * before the hero and after the group, and painted over anyway by the
 * opaque sections that follow.
 */
export default function ElevationBackdrop({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
  const opacity = useTransform(p, [0, 0.012, 0.985, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative bg-[#F5EDE3]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center lg:left-[200px]"
        style={{ opacity }}
      >
        <div className="relative h-[92svh] w-full max-w-none opacity-40">
          <Image
            src="/building-outline-lines.png"
            alt=""
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </motion.div>
      <div className="relative">{children}</div>
    </div>
  );
}

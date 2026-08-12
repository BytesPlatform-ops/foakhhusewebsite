"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryItem } from "./GallerySection";

/**
 * Premium full-screen lightbox: warm-dark backdrop, centred image,
 * crossfade navigation with a slight directional drift, keyboard and
 * touch support, locked body scroll, focus returned to the opening
 * tile on close. Reduced motion: opacity-only.
 */
export default function GalleryLightbox({
  items,
  index,
  direction,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  direction: 1 | -1;
  onClose: () => void;
  onNavigate: (next: number, dir: 1 | -1) => void;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const item = index !== null ? items[index] : null;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onNavigate((index + dir + items.length) % items.length, dir);
    },
    [index, items.length, onNavigate]
  );

  /* keyboard + scroll lock + initial focus */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        /* single-control focus trap — the dialog's focusable controls */
        const focusables = document.querySelectorAll<HTMLElement>("[data-lightbox-focus]");
        if (focusables.length === 0) return;
        const list = Array.from(focusables);
        const current = document.activeElement as HTMLElement;
        let i = list.indexOf(current);
        i = e.shiftKey ? (i - 1 + list.length) % list.length : (i + 1) % list.length;
        list[i].focus();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery image ${index! + 1} of ${items.length}: ${item.title}`}
          className="fixed inset-0 z-[90] flex items-center justify-center"
          style={{ background: "rgba(26, 19, 15, 0.93)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {/* image stage */}
          <motion.figure
            key={item.src}
            className="relative h-[min(72svh,820px)] w-[min(90vw,1240px)] lg:w-[min(80vw,1240px)]"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, x: 34 * direction }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </motion.figure>

          {/* caption — bottom left */}
          <div
            className="pointer-events-none absolute left-5 max-w-[62vw] lg:left-10"
            style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-[0.6rem] font-semibold tracking-[0.28em] text-[#C99355] uppercase">
              {item.category}
            </p>
            <p className="font-display mt-1.5 text-[1.15rem] text-[#FAF6F0]">{item.title}</p>
          </div>

          {/* count — bottom right */}
          <p
            className="pointer-events-none absolute right-5 text-[0.78rem] font-semibold tracking-[0.2em] text-[#FAF6F0]/80 tabular-nums lg:right-10"
            style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>

          {/* Close — top right. Solid ink fill rather than a transparent
              ring: the stage is object-contain, so a light image (the solar
              array, a pale sky) can sit directly behind this corner and a
              hairline white ring would disappear into it. Offset by the
              safe-area inset so it clears the notch / Dynamic Island. */}
          <button
            ref={closeRef}
            data-lightbox-focus
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#FAF6F0]/25 bg-[#1A130F]/85 text-[#FAF6F0] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-colors hover:bg-[#1A130F] lg:right-10"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {/* prev / next */}
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              data-lightbox-focus
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(dir);
              }}
              aria-label={dir === 1 ? "Next image" : "Previous image"}
              className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#FAF6F0]/30 text-[#FAF6F0] transition-colors hover:bg-[#FAF6F0]/10 sm:flex ${
                dir === 1 ? "right-4 lg:right-8" : "left-4 lg:left-8"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ transform: dir === -1 ? "rotate(180deg)" : undefined }}>
                <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

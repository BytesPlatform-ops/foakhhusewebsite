"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterHeading, Eyebrow, Lead } from "@/components/shared/Chapter";
import GalleryLightbox from "./GalleryLightbox";

/**
 * 05 — Gallery: an image-led editorial masonry of the project's real
 * approved imagery. CSS-columns masonry (1 / 2 / 3 columns) with an
 * intentional rhythm of aspect ratios, soft staggered reveals, quiet
 * hover states, and a full-screen lightbox. Warm ivory canvas —
 * consistent with the global colour system.
 */

export interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  title: string;
  /** aspect class — sets the masonry rhythm */
  aspect: string;
}

const ITEMS: GalleryItem[] = [
  {
    src: "/buildingfront.jpg",
    alt: "Frontal view of the two residential blocks above the landscaped courtyard at dusk",
    category: "Architecture",
    title: "The two blocks at dusk",
    aspect: "aspect-[4/4.4]",
  },
  {
    src: "/buildingtop.jpg",
    alt: "The rooftop crown with wind catcher, kite system, turbines and solar panels",
    category: "Rooftop systems",
    title: "The working crown",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/drawingroomfoakh.jpg",
    alt: "The warm living and dining space opening to the balcony",
    category: "Residences",
    title: "The drawing room",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/aislefoakh.jpg",
    alt: "The ventilated corridor beside the elevators",
    category: "Details",
    title: "The breathing corridor",
    aspect: "aspect-[3/3.6]",
  },
  {
    src: "/balconyfoakh.jpg",
    alt: "A private penthouse terrace overlooking the green landscape at sunset",
    category: "Penthouses",
    title: "Exclusive duplex living",
    aspect: "aspect-[16/10]",
  },
  {
    src: "/kitchen.jpg",
    alt: "The functional family kitchen in terracotta and stone",
    category: "Residences",
    title: "The family kitchen",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/foakhshaukat.jpg",
    alt: "The development beneath the evening sky, Shaukat Khanum Hospital and wind turbines nearby",
    category: "Site context",
    title: "Within the wind corridor",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/bed.jpg",
    alt: "A refined family bedroom in the golden evening light",
    category: "Residences",
    title: "A quiet bedroom",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/lounge.jpg",
    alt: "The grand elevator lobby in warm stone",
    category: "Amenities",
    title: "The arrival lobby",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/foakhgym.jpg",
    alt: "The residents' fitness suite in warm timber and stone",
    category: "Amenities",
    title: "The fitness suite",
    aspect: "aspect-[16/10]",
  },
  {
    src: "/family.jpg",
    alt: "A family sharing a meal in the open kitchen and dining space",
    category: "Residences",
    title: "Everyday life",
    aspect: "aspect-[16/10]",
  },
  {
    src: "/foakhsecurity.jpg",
    alt: "The staffed security gate welcoming a family through controlled access",
    category: "Amenities",
    title: "The guarded entrance",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/hero-poster.jpg",
    alt: "Evening elevation of Foakh Wind Corridor Enclave",
    category: "Architecture",
    title: "Evening elevation",
    aspect: "aspect-[4/3]",
  },
];

export default function GallerySection() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const openerRef = useRef<HTMLElement | null>(null);

  const close = () => {
    setOpen(null);
    openerRef.current?.focus();
  };

  return (
    <section
      id="gallery"
      data-section="gallery"
      aria-labelledby="gallery-heading"
      className="relative bg-[#F6EBDD] py-(--spacing-section)"
    >
      <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
        <Eyebrow num="05">Gallery</Eyebrow>
        <ChapterHeading id="gallery-heading">
          The project,
          <br />
          from every angle.
        </ChapterHeading>
        <Lead>
          Explore the architecture, residences, rooftop systems and defining details of The
          Wind Corridor Enclave.
        </Lead>

        {/* -------------------------- masonry -------------------------- */}
        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.src}
              className="mb-5 break-inside-avoid"
              initial={
                reduced ? undefined : { opacity: 0, y: 24, rotate: i % 3 === 0 ? 0.7 : 0 }
              }
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.09 + (i % 2) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setDirection(1);
                  setOpen(i);
                }}
                aria-label={`Open image: ${item.title} — ${item.category}`}
                className={`group relative block w-full cursor-pointer overflow-hidden rounded-[18px] border border-[#D8B36A]/35 shadow-[0_20px_44px_-26px_rgba(90,45,22,0.4)] ${item.aspect}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 46vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                />
                {/* readable scrim for the category label */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#211A17]/55 to-transparent transition-opacity duration-500 group-hover:from-[#211A17]/70"
                />
                {/* category — always present, subtle */}
                <span className="absolute bottom-3.5 left-4 text-left">
                  <span className="block text-[0.58rem] font-semibold tracking-[0.26em] text-[#FFF8EF]/85 uppercase">
                    {item.category}
                  </span>
                  {/* title — arrives on hover / focus */}
                  <span className="font-display mt-1 block translate-y-1.5 text-[1rem] text-[#FFF8EF] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {item.title}
                  </span>
                </span>
                {/* view arrow */}
                <span
                  aria-hidden="true"
                  className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF8EF]/90 text-[#943F2D] opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <GalleryLightbox
        items={ITEMS}
        index={open}
        direction={direction}
        onClose={close}
        onNavigate={(next, dir) => {
          setDirection(dir);
          setOpen(next);
        }}
      />
    </section>
  );
}

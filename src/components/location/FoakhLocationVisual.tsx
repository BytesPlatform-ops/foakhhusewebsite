import Image from "next/image";

/**
 * Lower-right card: the approved architectural line drawing of the
 * tower on a warm ivory ground, with the restrained caption and an
 * optional explore action. No generated or substitute buildings.
 */
export default function FoakhLocationVisual() {
  return (
    <figure className="relative overflow-hidden rounded-[28px] border border-[#D8AE62]/45 bg-gradient-to-br from-[#FFF4E5] to-[#F3E2C8] shadow-[0_30px_60px_-30px_rgba(90,45,22,0.35)]">
      <div className="grid items-center gap-2 p-7 sm:grid-cols-[minmax(0,0.9fr)_1.1fr] sm:p-8">
        <figcaption>
          <p className="text-[0.72rem] font-semibold tracking-[0.3em] text-[#291A16] uppercase">
            Foakh Wind Corridor Enclave
          </p>
          <p className="mt-1.5 text-[0.68rem] tracking-[0.22em] text-[#291A16]/60 uppercase">
            DHA City · Karachi
          </p>
          <span className="mt-4 block h-px w-10 bg-[#D8AE62]" />
          <p className="font-display mt-4 text-[1.05rem] leading-snug text-[#7E2F22] italic">
            A refreshing address. A better everyday.
          </p>
          <a
            href="#glance"
            className="mt-5 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] text-[#B84E2F] uppercase transition-colors hover:text-[#7E2F22]"
          >
            Explore the project
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </a>
        </figcaption>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/building-outline-lines.png"
            alt="Architectural line drawing of the two residential blocks"
            fill
            sizes="(min-width:1024px) 24vw, 60vw"
            className="object-contain"
          />
        </div>
      </div>
    </figure>
  );
}

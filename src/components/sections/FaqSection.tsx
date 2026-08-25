"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq";

/**
 * Frequently Asked Questions.
 *
 * Sits between "06 Limited by Design" and the Register Interest form, as the
 * SEO brief specifies. The five questions and answers are approved copy and
 * are held here as immutable constants — the same strings feed the visible
 * accordion and the FAQPage JSON-LD, so the two can never drift apart and
 * there is no second, hidden copy of the text for crawlers to find.
 */

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-heading" className="mt-20 lg:mt-24">
      <h2
        id="faq-heading"
        className="font-display text-ivory max-w-[18ch] leading-[1.08] font-semibold"
        style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}
      >
        Frequently Asked Questions
      </h2>

      <dl className="mt-8 max-w-3xl">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="border-t"
              style={{ borderColor: "rgba(245,237,227,0.16)" }}
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  className="flex min-h-14 w-full items-center justify-between gap-6 py-4 text-left"
                >
                  <span className="text-ivory text-[0.95rem] leading-snug font-medium sm:text-[1.02rem]">
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-champagne shrink-0 text-lg transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
              </dt>
              <dd
                id={`faq-a-${i}`}
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="text-ivory/70 max-w-[62ch] pb-5 text-[0.88rem] leading-[1.7]">
                    {item.a}
                  </p>
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

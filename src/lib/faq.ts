/**
 * Approved FAQ copy — the single source for both the visible accordion and
 * the FAQPage JSON-LD, so the two can never drift apart.
 *
 * Deliberately a plain module rather than living in the client component:
 * a server component importing a value out of a "use client" file receives a
 * client reference, not the array, which broke the prerender.
 *
 * These strings are immutable. Do not rewrite, shorten or re-punctuate them.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What sizes of flats are available?",
    a: "Four layouts: 464 sq ft (1 bed), 682 sq ft (2 bed), 860 sq ft (2 bed) and 1,102 sq ft (3 bed), plus 3,200 sq ft duplex penthouses on the 11th and 12th floors.",
  },
  {
    q: "Is there a payment plan for apartments in DHA City?",
    a: "Contact our sales team for current booking and payment options. Our advisors will walk you through the process for both local and overseas buyers.",
  },
  {
    q: "Can overseas Pakistanis buy an apartment at Foakh?",
    a: "Yes. Overseas buyers can complete the entire purchase remotely. Our US toll-free line, WhatsApp support and the Sonder serviced category are designed specifically for owners living abroad.",
  },
  {
    q: "Where exactly is the project located?",
    a: "At 2FQ3+W4X in DHA City, Karachi, inside the city's natural wind corridor and adjacent to Shaukat Khanum Hospital.",
  },
  {
    q: "What makes Foakh different from other projects in DHA City?",
    a: "It's the only project in DHA City combining renewable energy (wind, solar and kite power), wind-catcher ventilation, resilient water systems, serviced apartments and duplex penthouses with private pools in one limited community of 160 apartments.",
  },
];

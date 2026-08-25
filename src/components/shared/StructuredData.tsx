import { FOAKH_PROJECT } from "@/lib/project";
import { FAQ_ITEMS } from "@/lib/faq";

/**
 * JSON-LD for the page.
 *
 * Every value here is either verified project data from `FOAKH_PROJECT` or
 * approved copy from the SEO brief. Nothing is invented: no ratings, no
 * reviews, no prices, no phone numbers, no opening hours — those are absent
 * from the source, so they are absent here too.
 *
 * The FAQ entries are imported from the section that renders them, so the
 * markup and the visible text cannot drift apart.
 */
export default function StructuredData() {
  const { projectName, plusCode, area, city, country, coordinates } = FOAKH_PROJECT;

  const address = {
    "@type": "PostalAddress",
    streetAddress: plusCode,
    addressLocality: area,
    addressRegion: city,
    addressCountry: country,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: projectName,
    address,
  };

  const apartmentComplex = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: projectName,
    description:
      "Luxury flats & apartments for sale in DHA City Karachi. 1 to 3 bed residences, serviced apartments & duplex penthouses with private pools.",
    address,
    geo: {
      "@type": "GeoCoordinates",
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    },
    numberOfAccommodationUnits: {
      "@type": "QuantitativeValue",
      value: 160,
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      {[organization, apartmentComplex, faq].map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}

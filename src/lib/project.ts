/**
 * The project master record — the single source of truth for Foakh Wind
 * Corridor Enclave's identity and confirmed location.
 *
 * Every screen, link, map and outgoing email reads its address from here.
 * Nothing else in the codebase should spell the address out again: a project
 * that moves once will move again, and a hard-coded line in a footer or an
 * email template is exactly the one that gets missed.
 *
 * The confirmed location is the Open Location Code (plus code) 2FQ3+W4X in
 * DHA City, Karachi. The plus code — not a latitude/longitude pair — is the
 * authority: it is what the client confirmed, and Google resolves it exactly.
 * `coordinates` below is DERIVED from it by decoding the full code
 * 7JQ92FQ3+W4X (the centre of its ~14 m cell), and exists only because the
 * Maps JS API cannot centre or drop a marker on a text query. It is not an
 * independently surveyed fix, so treat the plus code as canonical whenever
 * the two could disagree.
 */

const PLUS_CODE = "2FQ3+W4X";
const AREA = "DHA City";
const CITY = "Karachi";
const COUNTRY = "Pakistan";

/** The single-line form, used wherever one string has to carry the address. */
const DISPLAY_ADDRESS = `${PLUS_CODE}, ${AREA}, ${CITY}, ${COUNTRY}`;

/** What Google is asked to resolve — the confirmed location, not a guess. */
const MAPS_QUERY = encodeURIComponent(DISPLAY_ADDRESS);

export const FOAKH_PROJECT = {
  projectName: "Foakh Wind Corridor Enclave",

  plusCode: PLUS_CODE,
  area: AREA,
  city: CITY,
  country: COUNTRY,
  displayAddress: DISPLAY_ADDRESS,

  /** Stacked form for postal blocks (footer, contact panels). */
  addressLines: [
    "Foakh Wind Corridor Enclave",
    PLUS_CODE,
    AREA,
    `${CITY}, ${COUNTRY}`,
  ] as const,

  /** The compact locality label that rides above headings and on cards. */
  localityLabel: `${AREA} · ${CITY}`,

  /** Decoded from the plus code — see the note at the top of this file. */
  coordinates: { lat: 25.039825, lng: 67.452875 },

  /** "View on Google Maps" — opens the confirmed location. */
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,

  /** "Get directions" — routes to the confirmed location from wherever you are. */
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`,

  /** Keyless embed source for the map card, queried by plus code. */
  embedUrl: `https://maps.google.com/maps?q=${MAPS_QUERY}&z=13&hl=en&output=embed`,
} as const;

/** Convenience aliases for the two values the map component needs most. */
export const FOAKH_TOWER_LOCATION = FOAKH_PROJECT.coordinates;
export const FOAKH_MAPS_URL = FOAKH_PROJECT.mapsUrl;

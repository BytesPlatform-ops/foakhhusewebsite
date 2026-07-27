/**
 * The scroll hero's storyboard as data — one source of truth for state
 * ranges, copy and layout, consumed by every scroll-hero component.
 * Ranges are fractions of the hero section's scroll progress.
 */

export const POSTER = {
  cream: "#efe7dd",
  terracotta: "#a75e42",
  facadeShadow: "#653528",
  highlight: "#d1815c",
  blue: "#1557e8",
  cyan: "#26d4de",
  yellow: "#ffbf00",
  coral: "#ff5838",
  green: "#12b85a",
  orchid: "#c43b91",
  ink: "#171816",
} as const;

export interface HeroState {
  id: string;
  /** [start, end] scroll fractions */
  range: [number, number];
  headline: string[];
  copy?: string;
  note?: string;
  /** which side the copy block sits on (desktop) */
  side: "left" | "right" | "center";
  /** optional positioning override (e.g. to clear the facts rail) */
  posClass?: string;
}

export const HERO_STATES: HeroState[] = [
  {
    id: "arrival",
    range: [0, 0.08],
    headline: ["A NEW RHYTHM", "OF URBAN LIVING"],
    side: "left",
  },
  {
    id: "nature",
    range: [0.08, 0.23],
    headline: ["WHERE", "NATURE"],
    copy: "A future-focused residential development shaped around natural airflow, renewable-energy planning and refined family living.",
    side: "left",
  },
  {
    id: "wind",
    range: [0.23, 0.4],
    headline: ["WIND", "CAPTURED."],
    copy: "A dedicated wind catcher is designed to intercept high-velocity natural air and guide it toward the building's shared corridor network.",
    side: "right",
  },
  {
    id: "kite",
    range: [0.4, 0.54],
    headline: ["POWER", "SHAPED BY", "MOVEMENT."],
    note: "Conceptual wind-energy visual",
    side: "left",
  },
  {
    id: "solar",
    range: [0.54, 0.69],
    headline: ["SUNLIGHT", "WORKING", "TOGETHER."],
    copy: "Wind turbines and solar panels are planned to support cleaner electricity generation and reduce reliance on conventional energy.",
    side: "right",
  },
  {
    id: "air",
    range: [0.69, 0.82],
    headline: ["AIR", "BECOMES", "COMFORT."],
    copy: "Captured air is intended to move through corridors, elevator lobbies and shared circulation areas for a fresher internal environment.",
    side: "left",
  },
  {
    id: "homes",
    range: [0.82, 0.93],
    headline: ["84 HOMES.", "ONE CONSIDERED", "COMMUNITY."],
    side: "right",
    posClass: "right-[4%] bottom-[30%] items-end text-right",
  },
  {
    id: "cta",
    range: [0.93, 1],
    headline: ["WHERE NATURE", "POWERS", "MODERN LIVING."],
    copy: "Discover a future-focused residential development shaped around natural airflow, renewable-energy planning and refined family living.",
    side: "center",
  },
];

/** MONOLOG-style giant background words riding behind the silhouette. */
export const GIANT_WORDS = [
  { word: "NATURE", activeIn: [0.08, 0.23] as const },
  { word: "AIRFLOW", activeIn: [0.23, 0.4] as const },
  { word: "WIND POWER", activeIn: [0.4, 0.54] as const },
  { word: "SOLAR SUPPORT", activeIn: [0.54, 0.69] as const },
  { word: "FAMILY LIVING", activeIn: [0.82, 0.93] as const },
];

/** Airflow-stage pills attached to the route during the wind state. */
export const FLOW_LABELS = [
  { word: "Capture", at: 0.26, x: "13%", y: "34%" },
  { word: "Channel", at: 0.3, x: "30%", y: "16%" },
  { word: "Circulate", at: 0.34, x: "63%", y: "36%" },
  { word: "Cool", at: 0.375, x: "68%", y: "58%" },
];

export const HERO_FACTS = [
  { value: "12", label: "Luxury storeys" },
  { value: "02", label: "Umer & Abdullah blocks" },
  { value: "84", label: "Exclusive apartments" },
  { value: "DHA", label: "View City · Karachi" },
];

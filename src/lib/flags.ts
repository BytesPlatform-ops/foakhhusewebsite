/**
 * Feature flags for concepts that appear in the client's reference material
 * but are NOT verified project features in the approved brochure.
 *
 * Default OFF. Turning one on is a content-approval decision, not a code one.
 * See docs/IMPLEMENTATION-PLAN.md §3.
 */

const on = (v: string | undefined) => v === "true" || v === "1";

export const FLAGS = {
  /**
   * Rooftop kite generator. Appears in the client's cinematic video, but the
   * brief lists kite power as awaiting technical approval. When enabled the
   * scene renders it AND the UI must label it "Concept — awaiting technical
   * approval". The two are wired together in ConceptBadge.
   */
  kitePower: on(process.env.NEXT_PUBLIC_FF_KITE_POWER),

  /** Atmospheric water generation. Approved copy is treatment + desalination. */
  atmosphericWater: on(process.env.NEXT_PUBLIC_FF_ATMOSPHERIC_WATER),
} as const;

/**
 * Runtime capability detection for the 3D experience.
 * Every check is SSR-safe and returns the conservative answer on the server.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Release immediately — we only wanted the answer.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Coarse device tier used to pick DPR caps and geometry detail. */
export type DeviceTier = "low" | "mid" | "high";

export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "low";

  const cores = navigator.hardwareConcurrency ?? 2;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  if (cores <= 4 || memory <= 4) return "low";
  if (coarse || narrow) return "mid";
  if (cores >= 8 && memory >= 8) return "high";
  return "mid";
}

/** DPR ceilings — the single biggest fill-rate lever. */
export function dprCeiling(tier: DeviceTier): number {
  switch (tier) {
    case "high":
      return 1.5;
    case "mid":
      return 1.25;
    default:
      return 1;
  }
}

export type RenderCapability = "static" | "webgl";

let capabilityCache: RenderCapability | null = null;

/**
 * Whether this visitor gets the 3D experience at all.
 *
 * Cached because `supportsWebGL` allocates a context to answer, and
 * `useSyncExternalStore` calls its snapshot on every render. Returns the
 * conservative answer during SSR so the server and first client render agree.
 */
export function getRenderCapability(): RenderCapability {
  if (typeof window === "undefined") return "static";
  if (capabilityCache) return capabilityCache;
  capabilityCache = prefersReducedMotion() || !supportsWebGL() ? "static" : "webgl";
  return capabilityCache;
}

/** Capability is fixed for the page's lifetime — nothing to subscribe to. */
export function subscribeToCapability(): () => void {
  return () => {};
}

export const serverCapability = (): RenderCapability => "static";

const INTRO_KEY = "wcr:intro-played";

/** The full intro plays once per browsing session, not per route change. */
export function hasIntroPlayed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* private mode — intro simply replays, which is acceptable */
  }
}

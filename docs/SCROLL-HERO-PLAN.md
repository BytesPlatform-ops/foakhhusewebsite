# Scroll-Controlled Hero — Plan (v3)

_Replaces the auto-playing 3D intro. The visitor owns the pace. 2026-07-28._

Reference study: the Playwright audit of Hubtown / Units / MONOLOG / 21hrs /
Dragonfly (10 captures, desktop + mobile) from the v2 cycle remains current
and informs this plan; the supplied video frames drive the shrouded turbine,
winch/cable and kite motifs.

## 1. What changes

| Was | Becomes |
|---|---|
| 4.2s auto-playing Three.js film behind a veil | 300–500ms technical loader (small two-block mark + wind ring, no percentage) |
| Story finished before the first scroll | 8 scroll states across a 520svh section (340svh mobile), sticky 100svh stage, native scrolling |
| Heavy WebGL building | Layered terracotta SVG silhouette — animated architectural poster art |
| Building right-of-frame | Building pinned centre (±5%), text moves behind/around it |
| Full UI hidden until settle | Persistent micro-bar: project name · location · Skip visual story; Register Interest stays in rail/header |

Three.js leaves the project entirely (`three` + `@types/three` uninstalled).
The detailed chapters below the hero (glance → tunnel → solar → … → CTA) are
unchanged; hero states link into them.

## 2. Scroll storyboard (desktop ranges)

| State | Range | Building | Backdrop | Typography | Copy/UI |
|---|---|---|---|---|---|
| 00 Arrival | 0–8% | Outline draws, blocks separate slightly, scale 0.92→1 | Warm cream only, soft shadow | Eyebrow DHA VIEW CITY · KARACHI + small "A NEW RHYTHM OF URBAN LIVING" | Scroll indicator |
| 01 Nature | 8–23% | Terracotta fill fades in, rear block parallaxes back, balcony lines reveal, yellow edge light passes | Electric-blue plane pops behind upper building; solar disc expands behind roof; halftone corner | Giant WHERE (quiet) → NATURE (active) moving behind the building | Support: "A future-focused residential development…" (left) |
| 02 Wind capture | 23–40% | Turbine shrouds appear, rotors turn with scroll, wind-catcher activates | Cyan route enters left → roof; coral arc; blue shifts; disc drifts toward turbine | WIND / CAPTURED. | CAPTURE·CHANNEL·CIRCULATE·COOL pills attached along the route (right copy) |
| 03 Kite | 40–54% | Kite enters upper-right on a curved path, thin cable to roof anchor, rotor keeps turning | Cobalt+cyan dominate, coral speed marks near kite, halftone shifts toward path | POWER / SHAPED BY / MOVEMENT. | Label: CONCEPTUAL WIND-ENERGY VISUAL (left) |
| 04 Solar | 54–69% | Solar layer activates, diagonal scan across roof panels, first window groups warm | Yellow becomes dominant plane; blue panel geometry; coral node travels route; one green node; single orchid accent at exit | SUNLIGHT / WORKING / TOGETHER. | Support (right); links to solar chapter below; 60% claim NOT here |
| 05 Air | 69–82% | Facade dips translucent, internal corridor route draws through gap and branches, 12 flow lines | Yellow exits; cyan+cream; rectangular corridor frame behind building | AIR / BECOMES / COMFORT. | Support (left) |
| 06 Residences | 82–93% | More windows illuminate, balconies prominent, kite exits, rotors stop, shadow softens | Coral+cream warm; aqua sliver one side; green landscape base; energy calms | 84 HOMES. / ONE CONSIDERED / COMMUNITY. | Compact editorial facts rail (12 · 02 · 84 · DHA), right |
| 07 CTA | 93–100% | Settled, warm edge glow only | All planes settle into one poster; halftone fades | WHERE NATURE / POWERS / MODERN LIVING. (front) | Register Interest · Explore the Residences · brochure (marked coming-soon); unpins into Project at a Glance |

Mobile: same states compressed into 340svh; copy stacks bottom; giant words
clamp smaller; kite path shortened; reduced-motion renders the final poster
statically with all copy/CTAs and no pinning.

## 3. Colour progression

Cream `#EFE7DD` ground throughout. Building stays terracotta always:
base `#A75E42`, shadow `#653528`, highlight `#D1815C`. Energy appears
around it: blue `#1557E8` (technology/wind) → cyan `#26D4DE` (airflow) →
yellow `#FFBF00` (sun) → coral `#FF5838` (life/energy) → green `#12B85A`
(nature) → one orchid accent in the 04→05 transition only. Glow outline
stroke interpolates cyan→blue→yellow→coral across states.

## 4. SVG layer plan (BuildingSilhouette)

Ordered bottom→top: site-line · building-shadow (rear blurred duplicate) ·
chromatic-offset duplicates (coral/cyan strokes, transition windows only) ·
facade-main (2 blocks, gradients) · facade-highlight edge · balcony-lines
(12/block) · window-groups (4 groups) · rooftop-systems (parapets) ·
solar-panels + scan · wind-catcher (louvred head in the gap) ·
turbine-shrouds (ring + 4-blade rotor ×2) · internal airflow-route ·
glow-outline · kite-and-cable (overlay, extends past viewBox). Depth: rear
block translates 10px slower than front; glow drifts 3px independently;
whole group scale 0.92→1, rotate ≤1.5°; CSS perspective wrapper 1200px.

## 5. Typography plan

Fraunces display / Inter support (existing). Giant background word stack —
NATURE · AIRFLOW · WIND POWER · SOLAR SUPPORT · FAMILY LIVING — moves at
~0.4× scroll speed behind the silhouette; active word 100% opacity, others
10–14%. Per-state headline blocks alternate left/right at ≤26rem width so
the centred building stays readable; state 07 headline sits front-centre.
All copy is real text; decorative layers aria-hidden with one sr heading.

## 6. Files

New `src/components/scroll-hero/`: ScrollBuildingHero · BuildingSilhouette ·
GraphicBackdrop · ScrollCopy · KitePath · HeroFacts · HeroActions ·
TechnicalLoader; `src/lib/scroll-hero-states.ts`.
Deleted: `components/intro/*`, `components/hero/*`, `lib/env-capability.ts`;
`three`/`@types/three` uninstalled. `page.tsx` swaps Hero → ScrollBuildingHero.

## 7. Performance & accessibility

Transform/opacity only; one spring-wrapped progress value shared by props
(JS-driven — avoids the native ScrollTimeline stale-range bug found in v2);
halftone is a static SVG pattern; the only filter is a slight blur on the
rear silhouette duplicate; no canvas, no WebGL, no scroll hijack; loader
unblocks at `document.fonts.ready` capped at 500ms; `Skip visual story`
anchors below the pinned section; reduced-motion = static poster.

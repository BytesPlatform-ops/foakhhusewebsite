# The Wind Corridor Residences — Audit & Implementation Plan

_Status: pre-build. No code written yet. Prepared 2026-07-27._

---

## 1. Phase 1 Audit — what actually exists

| Item | Finding |
|---|---|
| Working directory | `/Users/bytes/Documents/GitHub/foakhhusewebsite` |
| Repository contents | **Empty.** Zero tracked files, zero commits, no branches. |
| Remote | `github.com/BytesPlatform-ops/foakhhusewebsite` — `git ls-remote` returns nothing. Remote is empty too. |
| Framework / routing / styling | **None.** Greenfield. |
| CMS | None. |
| Form implementation | None. Nothing to preserve or avoid breaking. |
| Animation / 3D dependencies | None installed. |
| Existing pages | None. |
| Build status | N/A — no `package.json`. |
| Toolchain available | Node v24.13.0, npm 11.6.2 |

**Consequences.** §37 (codebase-selection rules), §44 (do not change form logic until inspected) and the "preserve existing approved content" clause of §1 have nothing to apply to. There is no prior art to protect and no shared component to check usages of. Every architectural decision in this plan is a fresh choice, not a modification.

### 1a. Repository name mismatch

The repo is named `foakhhusewebsite` while §46 forbids referencing Foakh House. Treating this as a container-name artifact and proceeding. If Foakh House is the developing entity and should appear as the developer credit, that is a client-approval question — flagged in §9 below, not assumed either way.

### 1b. Sibling-project conventions (informational)

`~/Documents/GitHub/bytes-website` establishes a house stack: Next 16 App Router, React 19, Tailwind v4 via `@tailwindcss/postcss`, Framer Motion 12, `three` 0.177, `src/{app,components,sections,lib,hooks,data,types}`. This plan follows those conventions so the project is familiar to the same team, with deliberate exceptions noted in §4.

---

## 2. Supplied-asset register — the critical gap

**None of the supplied material exists as files.** The brochure PDF, the cinematic video, the model photographs and the reference images were pasted into the conversation as images. They were reviewed, but they cannot be read from disk, optimised, cut out, or committed. A filesystem sweep of `~/Downloads`, `~/Desktop` and `~/Documents` found no `.glb/.gltf/.fbx/.obj/.blend/.usdz`, no CAD export, and no file matching `wind|corridor|umer|abdullah|dha`.

Classification of what was reviewed, per §45 Phase 3:

| # | Asset | Classification | Action |
|---|---|---|---|
| 1 | Units website screenshot | Motion/design reference | Inspiration only. Never published. |
| 2 | Cream loader frame with blue house mark | Motion reference (Units loader) | Informs our own loader mark; do not reproduce. |
| 3 | MONOLOG website screenshot | Motion/design reference | Inspiration only. |
| 4 | Airborne-wind / kite energy article screenshot | **Third-party copyrighted** | Research reference only. Not publishable. |
| 5 | Watergen Instagram screenshot | **Third-party copyrighted + unverified technology** | Research reference only. See §3. |
| 6–11 | Six photographs of the physical architectural scale model | **Building reference — highest-value supplied material** | Needs source files, then cut-out + retouch. See §2a. |
| 12 | TBK Metal canopy (Google result) | **Third-party copyrighted** | Reference only. |
| 13 | Shrouded micro-turbine (Windpower Engineering) | **Third-party copyrighted** | Reference only. |
| 14 | Wind tower (Shutterstock, watermarked) | **Watermarked stock — explicitly forbidden by §41** | Reference only. Original wind-catcher illustration to be drawn. |
| 15 | Vertical-axis turbine (Wuxi Rexco, Google result) | **Third-party copyrighted** | Reference only. |
| 16 | Video frame — rooftop: solar array, turbines, mast, **kite aloft** | Project CGI render, source video needed | See §3 — contains an unverified system. |
| 17 | Video frame — solar panels, low angle | Project CGI render, source video needed | Strong candidate for the Solar Rhythm section. |
| 18 | Video frame — dining table / orange | Motion & tone reference | Informs §36 match-cut language. |

### 2a. What the model photographs actually show

Two rectangular residential blocks in terracotta/copper, deep balcony bands with a repeating window module, roof parapet frames, a dark road plane with light kerb strips, green landscape strips, and a small central shared square. Storey count in the tower photo reads consistent with 12. This is enough to derive **massing and silhouette** for a schematic intro, and enough to serve as photographic hero subject after retouch. It is **not** enough to reconstruct an accurate façade in 3D.

Backgrounds are workshop: tiled floor, plastic chairs, paint tins, a visible "Gasar Putty" carton, a person's legs. Per §26 these undermine presentation and must be cut out, not merely cropped.

---

## 3. Content baseline and compliance rules

Source-of-truth resolution: repository content (absent) and the brochure PDF (absent) both fall through, so **the project facts in the brief's §2 are the working content baseline**, to be reconciled against the brochure the moment it is supplied.

Locked facts: 12 storeys · 2 blocks (Umer, Abdullah) · 84 apartments · DHA View City, Karachi.

Rules wired into the build, not left to reviewer discipline:

- **Savings qualification.** The `up to 60%*` figure and its qualification ship as one indivisible component (`SavingsClaim`). The qualifier is rendered adjacent and always visible — not a tooltip, not footer-only. It cannot be rendered without the note because the note is not a prop.
- **Development status.** All natural-technology copy uses `planned` / `intended` / `designed to` phrasing. A `status` prop on technology components renders a visible label; there is no "operational" value available until the client supplies evidence.
- **"First-of-its-kind in Pakistan"** — not used anywhere. Requires legal approval + certification per §2.
- **Kite power** — behind `NEXT_PUBLIC_FF_KITE_POWER`, default `false`. **Open conflict:** the client's own cinematic video (asset 16) appears to depict a kite generator on the roof, while §3 of the brief says it is unverified. This needs an explicit client answer; it is not resolved by assumption in either direction.
- **Atmospheric water generation** — not used. Approved copy is water treatment and desalination *planning*, behind `NEXT_PUBLIC_FF_ATMOSPHERIC_WATER`, default `false`.
- Excluded content domains (care homes, dementia, student housing, fibre, TEAS, crypto, Angels of Cascades, Foakh House) — enforced by a `scripts/check-forbidden-terms.mjs` grep run in CI.
- No invented prices, sizes, bedroom counts, floor plans, travel times, distances, certifications or energy outputs. Any such slot renders as an explicit "Awaiting approved data" placeholder rather than plausible filler.

---

## 4. Stack decision

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript strict | House standard; keeps §37's "static content server-rendered" achievable. |
| Styling | Tailwind v4 + CSS custom-property token layer | Tokens in `@theme` so §6's palette, spacing, type scale, easings and z-index live in one place. |
| Motion | Framer Motion 12 | Required by §15/§18/§22. |
| 3D | **Raw `three` ~0.177 — not React Three Fiber** | §39 warns against stacking R3F + Drei + GSAP. There is exactly one canvas with one short scripted sequence and no scene graph churn; R3F+Drei would add ~150 KB gz to serve a scene that needs none of it. |
| GSAP | **Not installed** | Framer Motion covers every scroll/path need here. |
| Lenis / smooth scroll | **Not installed** | §35 and §46 forbid scroll hijacking; Lenis replaces native scrolling. |
| Particles | **Not installed** | §46 forbids random particle fields. Wind lines are 10–20 SVG strokes per §16. |
| CMS | None at launch | Content is a small, legally-sensitive, slow-changing set. Typed modules under `src/content/` give type safety and make the compliance grep trivial. Sanity can be layered later without restructuring. |
| Forms | Next route handler + Resend, honeypot + timing check + IP rate limit, Zod validation | No existing logic to preserve. **Recipient address and any CRM target are unknown — blocker §9.** |

---

## 5. Information architecture

```
/                    Home            /gallery        Gallery
/project             The Project     /enquire        Register Interest
/technology          Natural Technology
/residences          Residences      /privacy  /terms  /disclaimer
/amenities           Amenities
/location            Location
```

Rail: `01 Project · 02 Technology · 03 Residences · 04 Lifestyle · 05 Location · 06 Enquire`, plus a persistent **Register Interest** CTA. Mobile swaps the rail for a compact header + full-screen menu; no viewport is surrendered to a permanent rail below `lg`.

Homepage follows the §12 order and previews only — depth lives on the inner pages.

---

## 6. The 3D problem, and the honest answer

**Report, as §8 requires it be stated plainly:**

> An exact production 3D model is required to reproduce the supplied building accurately from every viewing angle. No `.glb`, `.gltf`, `.fbx`, `.obj`, `.blend`, `.usdz` or CAD export exists in this repository or on this machine.

This is **Option C**. The plan takes the fallback that stays truthful rather than the one that looks most like §9's six phases:

**Intro (0–4s) — declared schematic.** A procedural two-block massing built from the model photographs' proportions, rendered as an *architectural diagram*: drawn footprint → structural grid → instanced floor slabs → balcony bands → massing solidifies in bronze/terracotta → wind-catcher, turbine and solar markers → a 15–25° settle. It reads as a blueprint assembling, because it is one. It never asserts façade accuracy, so it cannot misrepresent the building.

**Hero (from ~4s) — photographic.** The camera settles and the schematic cross-fades to a **retouched, cut-out photograph of the physical scale model** as hero protagonist. The building the visitor studies is a photograph of a real object, not a generated approximation.

**Text-behind-building mask.** A transparent-PNG cut-out gives pixel-exact layering for free: background text layer → building PNG → foreground keyword layer. This is *more* accurate than a Three.js stencil or a hand-traced `clip-path`, and it satisfies §10's prohibition on a rough polygon that visibly cuts through the building.

If a production GLB arrives later, the intro's massing module is swapped for the real model and the hero gains an optional 3D mode — the surrounding architecture does not change.

**Not built without approved assets:** a photoreal final building, a 360° block configurator, or any "as-built" photography claim. Model photography will be labelled as such.

---

## 7. Component architecture

Adapted from §38 to the house `src/` layout:

```
src/
  app/                 route segments per §5, each page.tsx server-rendered
  components/
    intro/             BuildingIntro · BuildingScene · IntroFallback · IntroProgress
    navigation/        ChapterRail · MobileNavigation · ActiveSectionIndicator
    hero/              BuildingHero · MaskedHeroText · ProjectFacts
    technology/        NaturalSystemsRoute · WindCatcherDiagram · RenewableEnergyScene
                       SolarRhythm · WaterPlanningDiagram · SavingsClaim
    location/          RoadJourney · LocationMilestone · ApprovedMap
    gallery/           FannedGallery · GalleryCard · GalleryControls · GalleryLightbox
    shared/            GlassPanel · MineralBackground · SectionHeading · ProjectCTA
                       StatusBadge
    motion/            Reveal · MotionSection · Stagger · AnimatedPath · ParallaxLayer
  content/             typed content modules (single source for copy + compliance grep)
  lib/                 motion.ts · intro-session.ts · reduced-motion.ts
                       webgl-support.ts · media-query.ts · flags.ts
```

Client boundaries stay at the leaf: pages and section shells are server components; only the canvas, rail, gallery, route animations and form are `"use client"`.

---

## 8. Build sequence

Each stage ends green on `build` + `typecheck` + `lint` and is independently reviewable.

| Stage | Delivers | Gate |
|---|---|---|
| **A. Foundation** | Next+TS+Tailwind scaffold, token layer (§6 palette, spacing, type scale, easings, z-index), mineral background + grain system, glass variants, typography pairing, forbidden-term CI check | Builds clean; tokens documented |
| **B. Static structure** | All 11 routes, full approved copy, heading hierarchy, CTAs, image slots with intrinsic dimensions, chapter rail + mobile nav, enquiry form with real validation & delivery. **No complex motion.** | Keyboard-navigable, WCAG-clean, zero layout shift |
| **C. Intro + hero** | Three.js schematic intro, session-once gating, skip control ≥0.8s, hero handoff without canvas teardown, masked hero text, reduced-motion crossfade, no-WebGL static fallback | Perf + fallback verified before anything else animates |
| **D. Motion system** | Reusable variants, snake route, wind-catcher diagram, renewable preview, solar rhythm, road journey, fanned gallery | No scroll hijack; no back-to-back pinning |
| **E. Inner-page depth** | Technology / Residences / Amenities / Location / Gallery detail; homepage animations *not* repeated | Each page has its own rhythm |
| **F. Performance & QA** | Chunk analysis, image pipeline, LCP/CLS, canvas pause + dispose, §45 Phase 9 device matrix | Budgets in §9 met or deviations explained |

Motion budgets: UI 0.2–0.4s · reveals 0.5–0.8s · section visuals 0.8–1.1s · intro ≤4.5s desktop, ≤3s mobile, 500ms reduced-motion. Easing `[0.22,1,0.36,1]` / `[0.16,1,0.3,1]`.

Performance targets: one canvas, on-demand rendering after intro, paused when hidden or off-screen, DPR capped 1.5/1.25/1.0, intro payload <3–4 MB, no 4K video, no permanent RAF loop.

Reduced motion and no-WebGL are built in stage C as first-class paths, not retrofitted in stage F.

---

## 9. Blockers and decisions required

**Hard blockers — stage B cannot complete without these:**

1. **The actual files.** Brochure PDF, cinematic video, and the six model photographs at full resolution, dropped into the repo (suggest `assets-source/`). Everything reviewed so far exists only as chat images.
2. **Enquiry destination.** Recipient email address, and whether a CRM (HubSpot, Zoho, sheet, webhook) should receive submissions. The form cannot ship with a fabricated destination.
3. **Brand assets.** Logo (vector), and any official brand colours or typefaces. Until supplied, the §6 palette is used as the working system — §6 permits this but says official brand assets take precedence.

**Decisions needed — affect what gets built, not just how:**

4. **Kite power.** The client's own video shows a rooftop kite; the brief says it is unverified. Approved, or reference-only? Default is the flag stays off.
5. **Model photography treatment.** Cut-out onto neutral backgrounds (recommended, and required for the hero mask) versus approved CGI renders if any exist beyond the video.
6. **Location map.** Is there an approved map? Without one the road journey ships labelled *"Conceptual location journey — not to scale"* and no distances or travel times appear anywhere.
7. **Block-level differences.** Any verified feature differences between Umer and Abdullah? If none, both render identical content and the toggle is presentational only.
8. **Repo/developer naming.** Confirm the `foakhhusewebsite` repo name is incidental and no developer credit is required on the site.

**Work that proceeds regardless:** stage A in full, plus stage B structure, routes, navigation, form UI and validation — everything except the three items above that depend on client-supplied data.

---

## 10. Explicitly not doing

Photoreal invented building · fake plans, prices, sizes, distances, certifications or energy figures · guaranteed savings or returns · published watermarked or search-result imagery · 4K background video · scroll hijacking · pinned mobile sections · particle fields · site-wide 3D · glass on everything · kite power or atmospheric water as confirmed features.

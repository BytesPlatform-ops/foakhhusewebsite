import * as THREE from "three";
import { dprCeiling, type DeviceTier } from "@/lib/env-capability";

/**
 * THE WIND CORRIDOR RESIDENCES — building + rooftop energy scene.
 *
 * ONE canvas for the whole site. Two modes:
 *
 *   INTRO  — scripted assembly driven by an external progress value (0..1):
 *            energy point -> blueprint footprint -> structure -> facade ->
 *            rooftop systems -> settle. Renders every frame while scrubbing.
 *
 *   LIVE   — the rooftop energy system actually running: kite flying a
 *            crosswind figure-of-eight against its tether, turbines turning,
 *            a light scan crossing the solar cells. Renders ONLY while the
 *            hero is on screen and the tab is visible; otherwise the RAF loop
 *            is fully stopped, not throttled.
 *
 * Deliberately framework-agnostic so React only mounts and disposes it.
 *
 * IMPORTANT — this geometry is a SCHEMATIC massing derived from the physical
 * scale-model photographs. It is not a survey-accurate facade and must not be
 * presented as one. See docs/IMPLEMENTATION-PLAN.md.
 */

export type ScenePhase = "intro" | "live";

interface SceneOptions {
  tier: DeviceTier;
  /** Kite generator is a concept awaiting technical approval — off by default. */
  showKite: boolean;
}

/* ---------------------------------------------------------------- constants */

const FLOORS = 12;
const FLOOR_H = 0.62;
const BLOCK_W = 3.2; // along X
const BLOCK_D = 2.2; // along Z
const BLOCK_GAP = 4.6;
const BLOCK_X = [-(BLOCK_GAP / 2), BLOCK_GAP / 2];
const BUILDING_H = FLOORS * FLOOR_H;

const WIN_PER_LONG = 6;
const WIN_PER_SHORT = 4;

const PALETTE = {
  terracotta: 0xae6649,
  copper: 0xc17b58,
  bronze: 0x87543e,
  deepEarth: 0x2d211d,
  ivory: 0xefe7dd,
  mineral: 0xaaa096,
  solarDark: 0x141d29,
  cyan: 0x22a8aa,
  magenta: 0xc43b91,
  champagne: 0xd4b36f,
  orange: 0xef8a17,
  garden: 0x4c7056,
  steel: 0xb9bec2,
} as const;

/* ------------------------------------------------------------------ helpers */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalised progress of `p` across the window [a,b]. */
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Cubic ease-out — the settle curve used across the whole assembly. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Symmetric ease for camera moves. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ================================================================== scene == */

export class BuildingScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  private tier: DeviceTier;
  private showKite: boolean;

  private phase: ScenePhase = "intro";
  private progress = 0;
  private running = false;
  private rafId = 0;
  private disposed = false;

  /** Everything that must be explicitly released on dispose. */
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  // assembly groups
  private energyPoint = new THREE.Group();
  private blueprint!: THREE.LineSegments;
  private slabs!: THREE.InstancedMesh;
  private windows!: THREE.InstancedMesh;
  private balconies!: THREE.InstancedMesh;
  private cores: THREE.Mesh[] = [];
  private roofGroup = new THREE.Group();

  // rooftop systems
  private solar!: THREE.InstancedMesh;
  private solarBaseColor = new THREE.Color(PALETTE.solarDark);
  private solarScanColor = new THREE.Color(PALETTE.cyan);
  private solarCellX: number[] = [];
  private turbines: THREE.Group[] = [];
  private windCatcher!: THREE.Mesh;
  private kiteGroup = new THREE.Group();
  private kiteMesh!: THREE.Mesh;
  private tether!: THREE.Line;
  private tetherPositions!: Float32Array;

  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();
  private camTarget = new THREE.Vector3();

  private slabCount = 0;
  private windowCount = 0;
  private balconyCount = 0;

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.tier = opts.tier;
    this.showKite = opts.showKite;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.tier !== "low",
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, dprCeiling(this.tier)),
    );
    this.renderer.setClearAlpha(0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 120);

    this.buildLights();
    this.buildGround();
    this.buildEnergyPoint();
    this.buildBlueprint();
    this.buildStructure();
    this.buildFacade();
    this.buildRooftop();

    this.scene.add(this.roofGroup);

    this.resize();
    this.applyProgress(0);
  }

  /* ------------------------------------------------------------- lighting */

  private buildLights() {
    // Golden-hour key. One directional light, no shadow maps — face shading
    // plus a painted contact shadow reads well and costs almost nothing.
    const key = new THREE.DirectionalLight(0xffd9a8, 2.5);
    key.position.set(6.5, 9, 5.5);
    this.scene.add(key);

    // Warm sky over cool ground bounce keeps the mineral palette honest.
    const hemi = new THREE.HemisphereLight(0xbfe0f0, 0x6b4433, 1.35);
    this.scene.add(hemi);

    // Cool rim from the opposite side separates the blocks from the backdrop.
    const rim = new THREE.DirectionalLight(0x8fd0e0, 0.75);
    rim.position.set(-7, 4, -6);
    this.scene.add(rim);
  }

  private track<T extends THREE.BufferGeometry>(g: T): T {
    this.geometries.push(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.materials.push(m);
    return m;
  }

  /* --------------------------------------------------------------- ground */

  private buildGround() {
    // Radial contact shadow painted into a small canvas texture — cheaper and
    // steadier than a real shadow map, and it never shimmers under the camera.
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(45,33,29,0.55)");
    grad.addColorStop(0.55, "rgba(45,33,29,0.22)");
    grad.addColorStop(1, "rgba(45,33,29,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    const mat = this.trackMat(
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    const geo = this.track(new THREE.PlaneGeometry(18, 12));
    const shadow = new THREE.Mesh(geo, mat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.scene.add(shadow);
    // Texture is owned by the material; dispose handled in dispose().
    mat.userData.ownedTexture = tex;
  }

  /* --------------------------------------------------------- energy point */

  /**
   * The opening macro subject: a tensioned cable reel, mirroring the winch
   * the client's film opens and closes on. Without a physical object here the
   * first second of the intro is an empty frame — the camera has to be
   * looking AT something before the site plan exists.
   */
  private buildEnergyPoint() {
    const reelGeo = this.track(new THREE.TorusGeometry(0.17, 0.055, 10, 28));
    const reelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: PALETTE.steel,
        roughness: 0.3,
        metalness: 0.85,
        transparent: true,
      }),
    );
    const reel = new THREE.Mesh(reelGeo, reelMat);
    reel.rotation.y = Math.PI / 2.4;

    const coreGeo = this.track(new THREE.SphereGeometry(0.055, 12, 10));
    const coreMat = this.trackMat(
      new THREE.MeshBasicMaterial({ color: PALETTE.orange, transparent: true }),
    );
    const core = new THREE.Mesh(coreGeo, coreMat);

    // The cable leaving the reel — becomes the first blueprint line.
    const cableGeo = this.track(new THREE.BufferGeometry());
    cableGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0, -1.5, 0.42, -0.9], 3),
    );
    const cableMat = this.trackMat(
      new THREE.LineBasicMaterial({ color: PALETTE.deepEarth, transparent: true }),
    );
    const cable = new THREE.Line(cableGeo, cableMat);

    this.energyPoint.add(reel, core, cable);
    this.energyPoint.position.set(0.4, 0.42, 2.3);
    this.scene.add(this.energyPoint);
  }

  /* ------------------------------------------------------------ blueprint */

  /** Footprint + road + shared square, drawn on progressively via drawRange. */
  private buildBlueprint() {
    const pts: number[] = [];
    const rect = (cx: number, cz: number, w: number, d: number, y = 0.02) => {
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      const z0 = cz - d / 2;
      const z1 = cz + d / 2;
      pts.push(x0, y, z0, x1, y, z0);
      pts.push(x1, y, z0, x1, y, z1);
      pts.push(x1, y, z1, x0, y, z1);
      pts.push(x0, y, z1, x0, y, z0);
    };

    // Two block footprints, then the road, then the central shared square —
    // ordered so the reveal reads as a site plan being set out.
    for (const x of BLOCK_X) rect(x, 0, BLOCK_W, BLOCK_D);
    rect(0, 2.9, 12, 1.5);
    rect(0, 0, 1.5, 1.2);

    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));

    const mat = this.trackMat(
      new THREE.LineBasicMaterial({
        color: PALETTE.cyan,
        transparent: true,
        opacity: 0.9,
      }),
    );
    this.blueprint = new THREE.LineSegments(geo, mat);
    this.scene.add(this.blueprint);
  }

  /* ------------------------------------------------------------ structure */

  private buildStructure() {
    // Floor slabs — one InstancedMesh for both blocks, 24 instances.
    this.slabCount = FLOORS * BLOCK_X.length;
    // Slight overhang only — a full-width bright slab reads as a stacked tray
    // rather than a floor plate.
    const slabGeo = this.track(new THREE.BoxGeometry(BLOCK_W + 0.03, 0.04, BLOCK_D + 0.03));
    const slabMat = this.trackMat(new THREE.MeshLambertMaterial({ color: 0xb0785a }));
    this.slabs = new THREE.InstancedMesh(slabGeo, slabMat, this.slabCount);
    this.slabs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.slabs);

    // Solid cores — the massing behind the facade.
    const coreGeo = this.track(
      new THREE.BoxGeometry(BLOCK_W - 0.22, BUILDING_H, BLOCK_D - 0.22),
    );
    const coreMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.terracotta }));
    for (const x of BLOCK_X) {
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(x, BUILDING_H / 2, 0);
      core.scale.y = 0.001;
      this.scene.add(core);
      this.cores.push(core);
    }
  }

  /* --------------------------------------------------------------- facade */

  private buildFacade() {
    // Window modules — instanced across all four faces of both blocks.
    const perFloor = WIN_PER_LONG * 2 + WIN_PER_SHORT * 2;
    this.windowCount = perFloor * FLOORS * BLOCK_X.length;

    const winGeo = this.track(new THREE.BoxGeometry(0.26, 0.2, 0.04));
    const winMat = this.trackMat(
      new THREE.MeshLambertMaterial({
        color: 0x1c2833,
        emissive: 0xffcf8a,
        emissiveIntensity: 0,
      }),
    );
    this.windows = new THREE.InstancedMesh(winGeo, winMat, this.windowCount);
    this.windows.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.windows);

    // Balcony bands — the strongest read in the model photographs.
    this.balconyCount = 2 * FLOORS * BLOCK_X.length;
    const balGeo = this.track(new THREE.BoxGeometry(BLOCK_W + 0.06, 0.11, 0.05));
    const balMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.bronze }));
    this.balconies = new THREE.InstancedMesh(balGeo, balMat, this.balconyCount);
    this.balconies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.balconies);
  }

  /* -------------------------------------------------------------- rooftop */

  private buildRooftop() {
    const roofY = BUILDING_H;

    /* --- Solar array: instanced cells that a light scan crosses --------- */
    const cols = 7;
    const rows = 4;
    const cellW = 0.3;
    const cellD = 0.26;
    const count = cols * rows * BLOCK_X.length;

    const cellGeo = this.track(new THREE.BoxGeometry(cellW * 0.92, 0.03, cellD * 0.92));
    const cellMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff, // white base so instance colours read accurately
        roughness: 0.24,
        metalness: 0.55,
      }),
    );
    this.solar = new THREE.InstancedMesh(cellGeo, cellMat, count);

    let i = 0;
    for (const bx of BLOCK_X) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = bx + (c - (cols - 1) / 2) * cellW;
          const z = (r - (rows - 1) / 2) * cellD;
          this.dummy.position.set(x, roofY + 0.12, z);
          this.dummy.rotation.set(-0.22, 0, 0); // tilted to the sun
          this.dummy.scale.setScalar(1);
          this.dummy.updateMatrix();
          this.solar.setMatrixAt(i, this.dummy.matrix);
          this.solar.setColorAt(i, this.solarBaseColor);
          this.solarCellX.push(x);
          i++;
        }
      }
    }
    this.solar.instanceMatrix.needsUpdate = true;
    if (this.solar.instanceColor) this.solar.instanceColor.needsUpdate = true;
    this.roofGroup.add(this.solar);

    /* --- Turbines: hub + three blades, rotating as a group -------------- */
    const bladeGeo = this.track(new THREE.BoxGeometry(0.045, 0.62, 0.012));
    const hubGeo = this.track(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10));
    const mastGeo = this.track(new THREE.CylinderGeometry(0.028, 0.038, 0.62, 8));
    const steelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: PALETTE.steel,
        roughness: 0.35,
        metalness: 0.7,
      }),
    );

    for (const bx of BLOCK_X) {
      const mast = new THREE.Mesh(mastGeo, steelMat);
      mast.position.set(bx + BLOCK_W / 2 - 0.35, roofY + 0.31, -BLOCK_D / 2 + 0.3);

      const rotor = new THREE.Group();
      rotor.position.set(mast.position.x, roofY + 0.66, mast.position.z);
      const hub = new THREE.Mesh(hubGeo, steelMat);
      hub.rotation.x = Math.PI / 2;
      rotor.add(hub);
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(bladeGeo, steelMat);
        blade.position.y = 0.31;
        const pivot = new THREE.Group();
        pivot.rotation.z = (b / 3) * Math.PI * 2;
        pivot.add(blade);
        rotor.add(pivot);
      }

      const group = new THREE.Group();
      group.add(mast, rotor);
      group.userData.rotor = rotor;
      group.scale.setScalar(0.001);
      this.roofGroup.add(group);
      this.turbines.push(group);
    }

    /* --- Wind catcher: the defining architectural element ---------------- */
    const wcGeo = this.track(new THREE.BoxGeometry(0.52, 0.95, 0.52));
    const wcMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.bronze }));
    this.windCatcher = new THREE.Mesh(wcGeo, wcMat);
    this.windCatcher.position.set(0, roofY - BUILDING_H * 0.5 + 0.47, 0);
    this.windCatcher.scale.setScalar(0.001);
    this.roofGroup.add(this.windCatcher);

    /* --- Kite generator: concept, flag-gated ---------------------------- */
    if (this.showKite) {
      // A cambered canopy approximated by an open cylinder segment — reads as
      // a ram-air kite from every angle the camera actually reaches.
      const kiteGeo = this.track(
        new THREE.CylinderGeometry(0.55, 0.55, 0.95, 14, 1, true, 0, Math.PI * 0.62),
      );
      const kiteMat = this.trackMat(
        new THREE.MeshLambertMaterial({
          color: 0xf2f0ec,
          emissive: PALETTE.orange,
          emissiveIntensity: 0.14,
          side: THREE.DoubleSide,
        }),
      );
      this.kiteMesh = new THREE.Mesh(kiteGeo, kiteMat);
      this.kiteMesh.rotation.z = Math.PI / 2;
      this.kiteGroup.add(this.kiteMesh);

      // Tether — two points, rewritten each frame from winch to kite.
      this.tetherPositions = new Float32Array(6);
      const tGeo = this.track(new THREE.BufferGeometry());
      tGeo.setAttribute("position", new THREE.BufferAttribute(this.tetherPositions, 3));
      const tMat = this.trackMat(
        new THREE.LineBasicMaterial({ color: PALETTE.deepEarth, transparent: true, opacity: 0.75 }),
      );
      this.tether = new THREE.Line(tGeo, tMat);

      this.kiteGroup.scale.setScalar(0.001);
      this.roofGroup.add(this.kiteGroup, this.tether);
    }
  }

  /* ------------------------------------------------------- intro progress */

  /**
   * Single source of truth for the assembly. Every element derives its state
   * from `p`, so scrubbing backwards is exact and the intro is fully
   * reproducible — no accumulated state, no drift.
   */
  applyProgress(p: number) {
    this.progress = clamp01(p);
    const t = this.progress;

    /* Phase 0 — the energy point holds the frame, then hands off */
    const epFade = 1 - span(t, 0.1, 0.24);
    this.energyPoint.visible = epFade > 0.01;
    for (const child of this.energyPoint.children) {
      const mat = (child as THREE.Mesh).material as THREE.Material;
      mat.opacity = epFade;
    }

    /* Phase 1 — blueprint footprint draws on */
    const bp = span(t, 0.02, 0.22);
    const segCount = this.blueprint.geometry.getAttribute("position").count;
    this.blueprint.geometry.setDrawRange(0, Math.ceil(segCount * bp));
    const bpMat = this.blueprint.material as THREE.LineBasicMaterial;
    // Lines linger through structure, then fade as real mass takes over.
    bpMat.opacity = 0.9 * (1 - span(t, 0.42, 0.6));
    this.blueprint.visible = bp > 0 && bpMat.opacity > 0.01;

    /* Phase 2 — slabs stack, cores rise */
    const struct = span(t, 0.16, 0.46);
    let si = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        // Each floor has its own slice of the window so they land in sequence.
        const local = easeOut(clamp01(struct * FLOORS - f * 0.82));
        const y = FLOOR_H * (f + 1) * local;
        this.dummy.position.set(bx, y, 0);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.scale.set(local > 0 ? 1 : 0.0001, 1, local > 0 ? 1 : 0.0001);
        this.dummy.updateMatrix();
        this.slabs.setMatrixAt(si++, this.dummy.matrix);
      }
    }
    this.slabs.instanceMatrix.needsUpdate = true;

    const coreRise = easeOut(span(t, 0.3, 0.58));
    for (const core of this.cores) {
      core.scale.y = Math.max(coreRise, 0.001);
      core.position.y = (BUILDING_H * core.scale.y) / 2;
    }

    /* Phase 3 — facade: balcony bands then window modules */
    const facade = span(t, 0.44, 0.68);
    let bi = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        const local = easeOut(clamp01(facade * FLOORS - f * 0.72));
        for (const zSign of [-1, 1]) {
          this.dummy.position.set(bx, FLOOR_H * (f + 1) - 0.1, (zSign * (BLOCK_D + 0.05)) / 2);
          this.dummy.rotation.set(0, 0, 0);
          this.dummy.scale.set(local, local > 0 ? 1 : 0.0001, 1);
          this.dummy.updateMatrix();
          this.balconies.setMatrixAt(bi++, this.dummy.matrix);
        }
      }
    }
    this.balconies.instanceMatrix.needsUpdate = true;

    let wi = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        const local = easeOut(clamp01(facade * FLOORS - f * 0.72));
        const y = FLOOR_H * (f + 1) - 0.3;

        // Long faces (+Z / -Z)
        for (const zSign of [-1, 1]) {
          for (let c = 0; c < WIN_PER_LONG; c++) {
            const x = bx + (c - (WIN_PER_LONG - 1) / 2) * (BLOCK_W / WIN_PER_LONG);
            this.dummy.position.set(x, y, (zSign * BLOCK_D) / 2 + zSign * 0.02);
            this.dummy.rotation.set(0, 0, 0);
            this.dummy.scale.setScalar(local);
            this.dummy.updateMatrix();
            this.windows.setMatrixAt(wi++, this.dummy.matrix);
          }
        }
        // Short faces (+X / -X)
        for (const xSign of [-1, 1]) {
          for (let c = 0; c < WIN_PER_SHORT; c++) {
            const z = (c - (WIN_PER_SHORT - 1) / 2) * (BLOCK_D / WIN_PER_SHORT);
            this.dummy.position.set(bx + (xSign * BLOCK_W) / 2 + xSign * 0.02, y, z);
            this.dummy.rotation.set(0, Math.PI / 2, 0);
            this.dummy.scale.setScalar(local);
            this.dummy.updateMatrix();
            this.windows.setMatrixAt(wi++, this.dummy.matrix);
          }
        }
      }
    }
    this.windows.instanceMatrix.needsUpdate = true;

    // Restrained window illumination as the building completes.
    const winMat = this.windows.material as THREE.MeshLambertMaterial;
    winMat.emissiveIntensity = 0.16 * easeOut(span(t, 0.72, 0.95));

    /* Phase 4 — natural technology appears */
    const tech = easeOut(span(t, 0.62, 0.84));
    this.windCatcher.scale.setScalar(Math.max(tech, 0.001));
    this.windCatcher.position.y = BUILDING_H + 0.47 * tech - (1 - tech) * 0.3;
    for (const turbine of this.turbines) {
      turbine.scale.setScalar(Math.max(easeOut(span(t, 0.68, 0.9)), 0.001));
    }
    if (this.showKite) {
      this.kiteGroup.scale.setScalar(Math.max(easeOut(span(t, 0.76, 0.96)), 0.001));
    }

    // Solar cells fade up from the roof plane.
    const solarIn = easeOut(span(t, 0.64, 0.86));
    (this.solar.material as THREE.MeshStandardMaterial).opacity = solarIn;
    this.solar.visible = solarIn > 0.01;

    /* Phase 5/6 — camera pulls from macro detail to the hero composition */
    this.updateCamera(t);
  }

  /**
   * Micro-to-macro camera: opens tight on the rooftop energy point, pulls
   * back through the assembly, then settles into the hero three-quarter view
   * with roughly 20 degrees of rotation — no continuous product spin.
   */
  private updateCamera(t: number) {
    const keys: Array<{ at: number; pos: [number, number, number]; look: [number, number, number] }> = [
      // Macro on the reel, then a continuous pull back to the hero framing.
      // The final target sits left of the blocks so the building lands in the
      // right of frame, leaving the left column clear for the hero copy.
      { at: 0.0, pos: [0.86, 0.66, 3.15], look: [0.4, 0.42, 2.3] },
      { at: 0.2, pos: [3.4, 3.1, 6.6], look: [0, 1.1, 0.5] },
      { at: 0.52, pos: [8.6, 5.4, 11.6], look: [-1.0, 3.1, 0] },
      { at: 0.84, pos: [12.2, 6.9, 13.6], look: [-2.2, 3.6, 0] },
      { at: 1.0, pos: [11.5, 6.0, 15.5], look: [-2.6, 3.5, 0] },
    ];

    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i].at && t <= keys[i + 1].at) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const local = a.at === b.at ? 1 : easeInOut(clamp01((t - a.at) / (b.at - a.at)));

    this.camera.position.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], local),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], local),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], local),
    );
    this.camTarget.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], local),
      THREE.MathUtils.lerp(a.look[1], b.look[1], local),
      THREE.MathUtils.lerp(a.look[2], b.look[2], local),
    );
    this.camera.lookAt(this.camTarget);
  }

  /* ----------------------------------------------------------- live frame */

  /**
   * The rooftop system actually running. Kite flies a crosswind
   * figure-of-eight — the flight path real airborne-wind kites use to build
   * tether tension — turbines turn, and one light scan crosses the array.
   */
  private updateLive(elapsed: number) {
    // Turbines: slow enough to read as physically plausible.
    for (const turbine of this.turbines) {
      const rotor = turbine.userData.rotor as THREE.Group;
      rotor.rotation.z = elapsed * 1.15;
    }

    // Solar scan — a single narrow band of light travelling across the cells.
    // Hue cycles slowly so the accent stays an event rather than a base colour.
    const scanSpan = BLOCK_GAP + BLOCK_W + 2;
    const head = ((elapsed * 0.42) % 1.6) * scanSpan - scanSpan / 2 - 1;
    const hue = (elapsed * 0.05) % 1;
    this.solarScanColor.setHSL(0.45 + hue * 0.35, 0.62, 0.55);

    for (let i = 0; i < this.solarCellX.length; i++) {
      const d = Math.abs(this.solarCellX[i] - head);
      const intensity = Math.max(0, 1 - d / 0.75);
      this.tmpColor
        .copy(this.solarBaseColor)
        .lerp(this.solarScanColor, intensity * intensity);
      this.solar.setColorAt(i, this.tmpColor);
    }
    if (this.solar.instanceColor) this.solar.instanceColor.needsUpdate = true;

    // Kite: lemniscate of Gerono, anchored at the winch on the roof.
    if (this.showKite && this.kiteGroup.visible) {
      const phi = elapsed * 0.52;
      const radius = 2.6;
      const kx = Math.sin(phi) * radius * 1.15 - 1.6;
      const ky = BUILDING_H + 2.9 + Math.sin(phi * 2) * 0.85;
      const kz = Math.cos(phi * 0.5) * 0.9 + 1.4;

      this.kiteGroup.position.set(kx, ky, kz);
      // Bank into the turn — the canopy always faces its direction of travel.
      this.kiteGroup.rotation.z = Math.cos(phi) * 0.5;
      this.kiteGroup.rotation.y = Math.sin(phi * 2) * 0.3;

      const winchX = 0.3;
      const winchY = BUILDING_H + 0.2;
      const winchZ = 0.6;
      this.tetherPositions[0] = winchX;
      this.tetherPositions[1] = winchY;
      this.tetherPositions[2] = winchZ;
      this.tetherPositions[3] = kx;
      this.tetherPositions[4] = ky;
      this.tetherPositions[5] = kz;
      this.tether.geometry.getAttribute("position").needsUpdate = true;
    }
  }

  /* ------------------------------------------------------------ lifecycle */

  setPhase(phase: ScenePhase) {
    this.phase = phase;
  }

  /** Scrub the intro. Renders exactly one frame — no loop needed. */
  setProgress(p: number) {
    if (this.disposed) return;
    this.applyProgress(p);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.start();
    const tick = () => {
      if (!this.running || this.disposed) return;
      if (this.phase === "live") this.updateLive(this.clock.getElapsedTime());
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  /** Fully stops the loop — not a throttle. Zero GPU work while parked. */
  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.clock.stop();
  }

  resize() {
    if (this.disposed) return;
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || 1;
    const h = parent.clientHeight || 1;
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, dprCeiling(this.tier)),
    );
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.disposed = true;
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) {
      const owned = m.userData?.ownedTexture as THREE.Texture | undefined;
      owned?.dispose();
      m.dispose();
    }
    this.geometries = [];
    this.materials = [];
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

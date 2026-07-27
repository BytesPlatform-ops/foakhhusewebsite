import * as THREE from "three";
import { dprCeiling, type DeviceTier } from "@/lib/env-capability";

/**
 * THE WIND CORRIDOR RESIDENCES — building + rooftop energy scene.
 *
 * ONE canvas for the whole site. Two modes:
 *
 *   INTRO — a CAMERA move over a building that is already complete:
 *           rooftop macro (winch detail) -> pull back over the rooftop
 *           systems -> full two-block reveal -> ~22 degree orbit with an
 *           end-of-orbit dip that reveals the site road -> hero settle.
 *           There is NO construction sequence: the film reveals the
 *           project, it does not assemble it.
 *
 *   LIVE  — the rooftop energy system running: turbines turning, a light
 *           scan crossing the solar cells, the (flag-gated) kite flying a
 *           crosswind figure-of-eight. Renders ONLY while the hero is on
 *           screen and the tab visible; otherwise the RAF loop is fully
 *           stopped, not throttled. After settling, the camera answers the
 *           pointer by at most ~1.5 degrees.
 *
 * Deliberately framework-agnostic so React only mounts and disposes it.
 *
 * IMPORTANT — this geometry is a SCHEMATIC massing derived from the
 * physical scale-model photographs. It is not a survey-accurate facade and
 * must not be presented as one. See docs/VISUAL-PLAN.md.
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
  solarDark: 0x141d29,
  cyan: 0x22a8aa,
  orange: 0xef8a17,
  garden: 0x4c7056,
  steel: 0xb9bec2,
  asphalt: 0x3b3a37,
  kerb: 0xc9baa6,
} as const;

/* ------------------------------------------------------------------ helpers */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface CamKey {
  at: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

/**
 * The intro camera script — Shots A to E from docs/VISUAL-PLAN.md.
 * FOV animates with position: 18 degrees reads as a ~90 mm macro lens,
 * 40 degrees as the ~35 mm architectural hero framing.
 */
const CAMERA_SCRIPT: CamKey[] = [
  // A — macro on the rooftop winch, ~12 degrees above the roof plane.
  { at: 0.0, pos: [-3.9, BUILDING_H + 0.62, 1.9], look: [-2.95, BUILDING_H + 0.34, 0.55], fov: 18 },
  // B — pull back and up: solar, turbine and wind-catcher head appear.
  { at: 0.22, pos: [-5.4, BUILDING_H + 2.1, 5.4], look: [-2.0, BUILDING_H - 0.4, 0], fov: 30 },
  // C — out to the full three-quarter reveal, both blocks in frame.
  { at: 0.5, pos: [-9.5, 6.4, 11.5], look: [0, 3.4, 0], fov: 44 },
  // D — orbit: swing ~22 degrees across the front, slight up-tilt...
  { at: 0.72, pos: [-3.5, 6.0, 14.2], look: [0, 3.9, 0], fov: 42 },
  // ...ending with a gentle dip that brings the site road into view.
  { at: 0.9, pos: [4.0, 5.6, 15.2], look: [-0.8, 3.2, 0.4], fov: 40 },
  // E — hero settle: near-frontal so the gap between the blocks reads,
  // building right of frame, left column clear for copy.
  { at: 1.0, pos: [4.8, 6.2, 17.6], look: [-3.0, 3.6, 0], fov: 38 },
];

/* ================================================================== scene == */

export class BuildingScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  private tier: DeviceTier;
  private showKite: boolean;

  private phase: ScenePhase = "intro";
  private running = false;
  private rafId = 0;
  private disposed = false;

  /** Everything that must be explicitly released on dispose. */
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  // rooftop systems
  private solar!: THREE.InstancedMesh;
  private solarBaseColor = new THREE.Color(PALETTE.solarDark);
  private solarScanColor = new THREE.Color(PALETTE.cyan);
  private solarCellX: number[] = [];
  private turbines: THREE.Group[] = [];
  private kiteGroup = new THREE.Group();
  private tether!: THREE.Line;
  private tetherPositions!: Float32Array;

  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();
  private camTarget = new THREE.Vector3();

  /** Narrow (portrait) viewports centre the building instead of framing it right. */
  private narrow = false;

  // settled pose + pointer response
  private settled = false;
  private pointerTargetX = 0;
  private pointerTargetY = 0;
  private pointerX = 0;
  private pointerY = 0;

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
    // Gentle haze between and behind the blocks. The fog colour matches the
    // hero's ivory ground so the falloff dissolves into the page, not grey.
    this.scene.fog = new THREE.Fog(0xece2d4, 24, 64);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.3, 120);

    this.buildLights();
    this.buildSite();
    this.buildBlocks();
    this.buildRooftop();

    this.resize();
    this.applyProgress(0);
  }

  /* ------------------------------------------------------------- lighting */

  private buildLights() {
    // Golden-hour key from front-left. One directional light, no shadow
    // maps — face shading plus the painted contact shadow reads well and
    // costs almost nothing.
    const key = new THREE.DirectionalLight(0xffd9a8, 2.4);
    key.position.set(-6.5, 9, 7.5);
    this.scene.add(key);

    // Warm sky over cool ground bounce keeps the mineral palette honest.
    const hemi = new THREE.HemisphereLight(0xcfe4ef, 0x6b4433, 1.3);
    this.scene.add(hemi);

    // Cool muted fill from the opposite side separates the blocks.
    const rim = new THREE.DirectionalLight(0x8fd0e0, 0.7);
    rim.position.set(8, 4, -6);
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

  /* ----------------------------------------------------------------- site */

  /**
   * The ground the orbit dip reveals: contact shadow, road with kerb
   * strips, green landscape bands and the central shared square — the
   * geometry the physical model photographs establish.
   */
  private buildSite() {
    // Painted radial contact shadow — cheaper and steadier than shadow maps.
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(45,33,29,0.5)");
    grad.addColorStop(0.55, "rgba(45,33,29,0.2)");
    grad.addColorStop(1, "rgba(45,33,29,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = this.trackMat(
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    shadowMat.userData.ownedTexture = tex;
    const shadow = new THREE.Mesh(this.track(new THREE.PlaneGeometry(20, 13)), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.008;
    this.scene.add(shadow);

    const plate = (w: number, d: number, x: number, z: number, color: number, y = 0.012) => {
      const mat = this.trackMat(new THREE.MeshLambertMaterial({ color }));
      const m = new THREE.Mesh(this.track(new THREE.PlaneGeometry(w, d)), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y, z);
      this.scene.add(m);
    };

    // Road running along the front of both blocks, kerb strips inside it.
    plate(17, 2.2, 0, 3.3, PALETTE.asphalt);
    plate(15.5, 0.12, 0, 2.55, PALETTE.kerb, 0.016);
    plate(15.5, 0.12, 0, 4.05, PALETTE.kerb, 0.016);
    // Green landscape bands and the central shared square.
    plate(17, 1.1, 0, 5.1, PALETTE.garden);
    plate(1.9, 1.6, 0, 0, PALETTE.kerb, 0.01);
    plate(1.5, 1.2, 0, 0, PALETTE.garden, 0.014);
  }

  /* --------------------------------------------------------------- blocks */

  /** Both blocks, complete. No assembly state — this is the finished form. */
  private buildBlocks() {
    // Cores.
    const coreGeo = this.track(
      new THREE.BoxGeometry(BLOCK_W - 0.22, BUILDING_H, BLOCK_D - 0.22),
    );
    const coreMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.terracotta }));
    for (const x of BLOCK_X) {
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(x, BUILDING_H / 2, 0);
      this.scene.add(core);
    }

    // Floor slabs — slight overhang only.
    const slabCount = FLOORS * BLOCK_X.length;
    const slabGeo = this.track(new THREE.BoxGeometry(BLOCK_W + 0.03, 0.04, BLOCK_D + 0.03));
    const slabMat = this.trackMat(new THREE.MeshLambertMaterial({ color: 0xb0785a }));
    const slabs = new THREE.InstancedMesh(slabGeo, slabMat, slabCount);
    let si = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        this.dummy.position.set(bx, FLOOR_H * (f + 1), 0);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.scale.setScalar(1);
        this.dummy.updateMatrix();
        slabs.setMatrixAt(si++, this.dummy.matrix);
      }
    }
    this.scene.add(slabs);

    // Balcony bands.
    const balCount = 2 * FLOORS * BLOCK_X.length;
    const balGeo = this.track(new THREE.BoxGeometry(BLOCK_W + 0.06, 0.11, 0.05));
    const balMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.bronze }));
    const balconies = new THREE.InstancedMesh(balGeo, balMat, balCount);
    let bi = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        for (const zSign of [-1, 1]) {
          this.dummy.position.set(bx, FLOOR_H * (f + 1) - 0.1, (zSign * (BLOCK_D + 0.05)) / 2);
          this.dummy.rotation.set(0, 0, 0);
          this.dummy.scale.setScalar(1);
          this.dummy.updateMatrix();
          balconies.setMatrixAt(bi++, this.dummy.matrix);
        }
      }
    }
    this.scene.add(balconies);

    // Window modules — restrained warm illumination, always on.
    const perFloor = WIN_PER_LONG * 2 + WIN_PER_SHORT * 2;
    const winCount = perFloor * FLOORS * BLOCK_X.length;
    const winGeo = this.track(new THREE.BoxGeometry(0.26, 0.2, 0.04));
    const winMat = this.trackMat(
      new THREE.MeshLambertMaterial({
        color: 0x1c2833,
        emissive: 0xffcf8a,
        emissiveIntensity: 0.16,
      }),
    );
    const windows = new THREE.InstancedMesh(winGeo, winMat, winCount);
    let wi = 0;
    for (const bx of BLOCK_X) {
      for (let f = 0; f < FLOORS; f++) {
        const y = FLOOR_H * (f + 1) - 0.3;
        for (const zSign of [-1, 1]) {
          for (let cc = 0; cc < WIN_PER_LONG; cc++) {
            const x = bx + (cc - (WIN_PER_LONG - 1) / 2) * (BLOCK_W / WIN_PER_LONG);
            this.dummy.position.set(x, y, (zSign * BLOCK_D) / 2 + zSign * 0.02);
            this.dummy.rotation.set(0, 0, 0);
            this.dummy.scale.setScalar(1);
            this.dummy.updateMatrix();
            windows.setMatrixAt(wi++, this.dummy.matrix);
          }
        }
        for (const xSign of [-1, 1]) {
          for (let cc = 0; cc < WIN_PER_SHORT; cc++) {
            const z = (cc - (WIN_PER_SHORT - 1) / 2) * (BLOCK_D / WIN_PER_SHORT);
            this.dummy.position.set(bx + (xSign * BLOCK_W) / 2 + xSign * 0.02, y, z);
            this.dummy.rotation.set(0, Math.PI / 2, 0);
            this.dummy.scale.setScalar(1);
            this.dummy.updateMatrix();
            windows.setMatrixAt(wi++, this.dummy.matrix);
          }
        }
      }
    }
    this.scene.add(windows);

    // Roof parapet frames — the open rooftop structure in the model photos.
    const parapetMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.copper }));
    const railGeo = this.track(new THREE.BoxGeometry(BLOCK_W + 0.05, 0.34, 0.05));
    const railGeoS = this.track(new THREE.BoxGeometry(0.05, 0.34, BLOCK_D + 0.05));
    for (const bx of BLOCK_X) {
      for (const zSign of [-1, 1]) {
        const rail = new THREE.Mesh(railGeo, parapetMat);
        rail.position.set(bx, BUILDING_H + 0.17, (zSign * BLOCK_D) / 2);
        this.scene.add(rail);
      }
      for (const xSign of [-1, 1]) {
        const rail = new THREE.Mesh(railGeoS, parapetMat);
        rail.position.set(bx + (xSign * BLOCK_W) / 2, BUILDING_H + 0.17, 0);
        this.scene.add(rail);
      }
    }
  }

  /* -------------------------------------------------------------- rooftop */

  private buildRooftop() {
    const roofY = BUILDING_H;

    /* --- Winch/cable reel: the intro's opening macro subject ------------ */
    const steelMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: PALETTE.steel, roughness: 0.32, metalness: 0.8 }),
    );
    const reel = new THREE.Mesh(this.track(new THREE.TorusGeometry(0.16, 0.05, 10, 26)), steelMat);
    reel.rotation.y = Math.PI / 2.3;
    reel.position.set(-2.95, roofY + 0.34, 0.55);
    this.scene.add(reel);
    const hubGlow = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(0.045, 10, 8)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: PALETTE.orange })),
    );
    hubGlow.position.copy(reel.position);
    this.scene.add(hubGlow);

    /* --- Solar array ----------------------------------------------------- */
    const cols = 7;
    const rows = 4;
    const cellW = 0.3;
    const cellD = 0.26;
    const count = cols * rows * BLOCK_X.length;
    const cellGeo = this.track(new THREE.BoxGeometry(cellW * 0.92, 0.03, cellD * 0.92));
    const cellMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.24, metalness: 0.55 }),
    );
    this.solar = new THREE.InstancedMesh(cellGeo, cellMat, count);
    let i = 0;
    for (const bx of BLOCK_X) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = bx + (c - (cols - 1) / 2) * cellW;
          const z = (r - (rows - 1) / 2) * cellD;
          this.dummy.position.set(x, roofY + 0.12, z);
          this.dummy.rotation.set(-0.22, 0, 0);
          this.dummy.scale.setScalar(1);
          this.dummy.updateMatrix();
          this.solar.setMatrixAt(i, this.dummy.matrix);
          this.solar.setColorAt(i, this.solarBaseColor);
          this.solarCellX.push(x);
          i++;
        }
      }
    }
    if (this.solar.instanceColor) this.solar.instanceColor.needsUpdate = true;
    this.scene.add(this.solar);

    /* --- Turbines -------------------------------------------------------- */
    const bladeGeo = this.track(new THREE.BoxGeometry(0.045, 0.62, 0.012));
    const hubGeo = this.track(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10));
    const mastGeo = this.track(new THREE.CylinderGeometry(0.028, 0.038, 0.62, 8));
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
      this.scene.add(group);
      this.turbines.push(group);
    }

    /* --- Wind catcher ---------------------------------------------------- */
    const wcMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.bronze }));
    const wc = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.52, 0.95, 0.52)), wcMat);
    wc.position.set(0, roofY + 0.47, 0);
    this.scene.add(wc);
    // Louvre slots on the catcher head.
    const slotMat = this.trackMat(new THREE.MeshLambertMaterial({ color: PALETTE.deepEarth }));
    const slotGeo = this.track(new THREE.BoxGeometry(0.54, 0.07, 0.4));
    for (let s = 0; s < 3; s++) {
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(0, roofY + 0.28 + s * 0.24, 0);
      this.scene.add(slot);
    }

    /* --- Kite generator: concept, flag-gated ----------------------------- */
    if (this.showKite) {
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
      const kite = new THREE.Mesh(kiteGeo, kiteMat);
      kite.rotation.z = Math.PI / 2;
      this.kiteGroup.add(kite);
      this.tetherPositions = new Float32Array(6);
      const tGeo = this.track(new THREE.BufferGeometry());
      tGeo.setAttribute("position", new THREE.BufferAttribute(this.tetherPositions, 3));
      const tMat = this.trackMat(
        new THREE.LineBasicMaterial({ color: PALETTE.deepEarth, transparent: true, opacity: 0.75 }),
      );
      this.tether = new THREE.Line(tGeo, tMat);
      this.scene.add(this.kiteGroup, this.tether);
    }
  }

  /* --------------------------------------------------------------- camera */

  /**
   * Pure function of progress: position, look target AND field of view all
   * derive from the camera script, so scrubbing backwards is exact.
   */
  applyProgress(p: number) {
    const t = clamp01(p);
    const keys = CAMERA_SCRIPT;
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
    this.camera.fov = THREE.MathUtils.lerp(a.fov, b.fov, local);

    // Portrait viewports: as the camera approaches the hero pose, blend the
    // composition toward centre — the desktop right-of-frame framing would
    // push the building off a narrow screen entirely.
    if (this.narrow) {
      const blend = clamp01((t - 0.8) / 0.2);
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 1.2, blend);
      this.camera.position.z += blend * 3.5;
      this.camTarget.x = THREE.MathUtils.lerp(this.camTarget.x, 0, blend);
    }

    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.camTarget);
    this.settled = t >= 1;
  }

  /** Pointer response after settle: at most ~1.5 degrees, smoothed. */
  setPointer(nx: number, ny: number) {
    this.pointerTargetX = THREE.MathUtils.clamp(nx, -1, 1);
    this.pointerTargetY = THREE.MathUtils.clamp(ny, -1, 1);
  }

  /* ----------------------------------------------------------- live frame */

  private updateLive(elapsed: number, dt: number) {
    // Turbines: slow enough to read as physically plausible.
    for (const turbine of this.turbines) {
      const rotor = turbine.userData.rotor as THREE.Group;
      rotor.rotation.z = elapsed * 1.15;
    }

    // Solar scan — one narrow light band travelling across the cells.
    const scanSpan = BLOCK_GAP + BLOCK_W + 2;
    const head = ((elapsed * 0.42) % 1.6) * scanSpan - scanSpan / 2 - 1;
    const hue = (elapsed * 0.05) % 1;
    this.solarScanColor.setHSL(0.45 + hue * 0.35, 0.62, 0.55);
    for (let i = 0; i < this.solarCellX.length; i++) {
      const d = Math.abs(this.solarCellX[i] - head);
      const intensity = Math.max(0, 1 - d / 0.75);
      this.tmpColor.copy(this.solarBaseColor).lerp(this.solarScanColor, intensity * intensity);
      this.solar.setColorAt(i, this.tmpColor);
    }
    if (this.solar.instanceColor) this.solar.instanceColor.needsUpdate = true;

    // Kite: lemniscate figure-of-eight against the tether (flag-gated).
    if (this.showKite) {
      const phi = elapsed * 0.52;
      const kx = Math.sin(phi) * 3.0 - 1.6;
      const ky = BUILDING_H + 2.9 + Math.sin(phi * 2) * 0.85;
      const kz = Math.cos(phi * 0.5) * 0.9 + 1.4;
      this.kiteGroup.position.set(kx, ky, kz);
      this.kiteGroup.rotation.z = Math.cos(phi) * 0.5;
      this.kiteGroup.rotation.y = Math.sin(phi * 2) * 0.3;
      this.tetherPositions.set([-2.95, BUILDING_H + 0.34, 0.55, kx, ky, kz]);
      this.tether.geometry.getAttribute("position").needsUpdate = true;
    }

    // Settled pointer parallax — tiny tangential offset, smoothed.
    // Re-derives the settle pose through applyProgress so the portrait
    // centring stays applied, then adds the pointer offset on top.
    if (this.settled) {
      const ease = Math.min(dt * 4, 1);
      this.pointerX += (this.pointerTargetX - this.pointerX) * ease;
      this.pointerY += (this.pointerTargetY - this.pointerY) * ease;
      this.applyProgress(1);
      this.camera.position.x += this.pointerX * 0.35;
      this.camera.position.y -= this.pointerY * 0.22;
      this.camera.lookAt(this.camTarget);
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
    let last = 0;
    const tick = () => {
      if (!this.running || this.disposed) return;
      const now = this.clock.getElapsedTime();
      if (this.phase === "live") this.updateLive(now, now - last);
      last = now;
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
    this.narrow = this.camera.aspect < 1;
    this.camera.updateProjectionMatrix();
    if (this.settled) this.applyProgress(1);
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

import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Euler,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Sphere,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  PMREMGenerator,
  Ray,
  DoubleSide,
  EquirectangularReflectionMapping,
  MathUtils,
  Material,
  Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";

import {
  blenderToThree,
  pointInRoom,
  roomBoundsThree,
  type TourDoor,
  type TourManifest,
  type TourRoom,
} from "./manifest";

// ------------------------------------------------------------------ constants

/** Eye height above the floor, metres. Brief asked for 1.65-1.75. */
const EYE_HEIGHT = 1.7;
/**
 * Capsule radius. This is the single most important collision number: the duplex
 * stair has 178 mm risers on 271 mm treads, and a capsule only climbs a step when
 * its radius comfortably exceeds the riser. 0.35 m rides the nosings like a ramp.
 */
const PLAYER_RADIUS = 0.35;
const WALK_SPEED = 2.1; // m/s, brief asked for 1.8-2.5
const RUN_MULTIPLIER = 1.9;
const GRAVITY = 22;
const AIR_CONTROL = 0.28;
/** How quickly ground velocity converges on the requested velocity. */
const GROUND_ACCEL = 16;
/** Constant downward press while grounded: keeps contact going down stairs. */
const STICK_SPEED = 1.0;
/**
 * Maximum riser the player will step over. The duplex stair is 178 mm; 0.30 m
 * clears it with margin while still refusing to climb furniture or balustrades
 * (kitchen counters are 900 mm, glass balustrades 1040 mm).
 */
const STEP_HEIGHT = 0.3;
/** How far the step probes are raised off the floor to ignore the ground contact. */
const FOOT_CLEARANCE = 0.05;
/** How far ahead the step probes look; wider than one substep of travel. */
const STEP_LOOKAHEAD = 0.18;
/** Incremental lift per physics substep while a step is being climbed. */
const STEP_RISE_PER_SUBSTEP = 0.05;

const DOOR_REACH = 1.7;
const DOOR_SPEED = 2.6; // radians/sec

const MAX_SUBSTEPS = 5;

export type TourMode = "firstPerson" | "dollhouse";
export type TourPhase = "loading" | "ready" | "error";

export interface TourState {
  phase: TourPhase;
  progress: number;
  mode: TourMode;
  locked: boolean;
  /** Label of the room the player is standing in, or null. */
  room: string | null;
  /** Door the player can operate right now. */
  doorPrompt: { id: string; open: boolean } | null;
  isTouch: boolean;
  /**
   * True when the browser refused Pointer Lock (an embedded/iframed view, a
   * permissions policy, Safari's user-gesture rules). The tour keeps working —
   * it falls back to drag-to-look — but the UI has to say so instead of leaving
   * "Click to enter" up forever.
   */
  pointerLockBlocked: boolean;
  error: string | null;
  fps: number;
}

interface DoorRuntime {
  def: TourDoor;
  pivot: Group;
  /** World-space hinge in three coordinates. */
  hinge: Vector3;
  anchor: Vector3;
  open: boolean;
  angle: number;
  target: number;
  /** Half-extents used for the closed-door blocking test. */
  halfWidth: number;
}

const clamp = MathUtils.clamp;

// ------------------------------------------------------------------- the tour

export class PenthouseTour {
  readonly container: HTMLElement;
  private manifest!: TourManifest;

  private renderer!: WebGLRenderer;
  private scene = new Scene();
  private camera!: PerspectiveCamera;
  private dollhouseCamera!: PerspectiveCamera;

  private pointerLock!: PointerLockControls;
  private orbit!: OrbitControls;

  private octree = new Octree();
  private collider = new Capsule(
    new Vector3(0, PLAYER_RADIUS, 0),
    new Vector3(0, EYE_HEIGHT, 0),
    PLAYER_RADIUS,
  );
  private velocity = new Vector3();
  private onFloor = false;
  private lastSafe = new Vector3();
  private lastSafeAge = 0;

  private doors: DoorRuntime[] = [];
  private waterMaterials: MeshPhysicalMaterial[] = [];
  private foliageMaterials: Material[] = [];
  private modelRoot: Group | null = null;
  private modelBounds = new Box3();

  private keys = new Set<string>();
  private touchMove = { x: 0, y: 0, active: false };
  private touchLook = { dx: 0, dy: 0 };
  /** Set once the player has entered but Pointer Lock is unavailable. */
  private dragLook = false;
  private euler = new Euler(0, 0, 0, "YXZ");

  private mode: TourMode = "firstPerson";
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;

  private disposers: Array<() => void> = [];
  private lowPower = false;

  state: TourState = {
    phase: "loading",
    progress: 0,
    mode: "firstPerson",
    locked: false,
    room: null,
    doorPrompt: null,
    isTouch: false,
    pointerLockBlocked: false,
    error: null,
    fps: 0,
  };

  onState: (s: TourState) => void = () => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.state.isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
    this.lowPower =
      this.state.isTouch ||
      (typeof navigator !== "undefined" &&
        typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 4);
  }

  // ------------------------------------------------------------------ startup

  async init(manifestUrl = "/models/foakh-penthouse.tour.json") {
    try {
      this.setupRenderer();
      this.setupCameras();
      this.setupLighting();

      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      this.manifest = (await res.json()) as TourManifest;

      await this.loadModel();

      this.setupControls();
      this.setupDoors();
      this.resetPosition();
      this.bindEvents();

      this.patch({ phase: "ready", progress: 1 });
      this.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.patch({ phase: "error", error: message });
      // Surfacing this matters: a silent failure looks like a blank black page.
      console.error("[PenthouseTour] init failed", err);
    }
  }

  private setupRenderer() {
    this.renderer = new WebGLRenderer({
      antialias: !this.lowPower,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1.5 : 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    // Tuned so warm-white plaster reads bright without clipping to pure white.
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = !this.lowPower;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    this.container.appendChild(this.renderer.domElement);

    this.scene.background = this.makeSkyTexture();
  }

  /**
   * A vertical sky gradient, built on a canvas so it costs nothing to ship.
   * A flat background colour makes the glazing and the pool read as dead grey;
   * a horizon gradient gives them something to reflect.
   */
  private makeSkyTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new Color(0x8fa9c4) as unknown as Texture;

    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, "#3f6da6"); // zenith
    g.addColorStop(0.42, "#8fb4d6");
    g.addColorStop(0.52, "#d8e2e8"); // horizon haze
    g.addColorStop(0.62, "#b9b2a6"); // hazy city below the horizon
    g.addColorStop(1.0, "#7d766c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 256);

    const tex = new CanvasTexture(canvas);
    tex.mapping = EquirectangularReflectionMapping;
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
    this.disposers.push(() => tex.dispose());
    return tex;
  }

  private setupCameras() {
    const aspect = this.container.clientWidth / Math.max(1, this.container.clientHeight);
    // ~28 mm equivalent: wide enough to read a room, no fisheye.
    this.camera = new PerspectiveCamera(62, aspect, 0.1, 400);
    this.dollhouseCamera = new PerspectiveCamera(40, aspect, 0.5, 800);
  }

  private setupLighting() {
    const pmrem = new PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = env.texture;
    this.scene.environmentIntensity = 0.85;
    this.disposers.push(() => {
      env.texture.dispose();
      pmrem.dispose();
    });

    // Matches SUN_Key in the Blender file: a warm, low-ish key from the south-west.
    const sun = new DirectionalLight(0xfff0dc, 2.6);
    sun.position.set(-14, 22, 16);
    sun.castShadow = !this.lowPower;
    sun.shadow.mapSize.set(2048, 2048);
    const s = sun.shadow.camera;
    s.left = -22;
    s.right = 26;
    s.top = 26;
    s.bottom = -22;
    s.near = 1;
    s.far = 90;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    this.scene.add(sun.target);
    sun.target.position.set(7, 1.5, -9);

    // Sky/ground bounce keeps ceilings and undersides from going muddy.
    this.scene.add(new HemisphereLight(0xbcd4ee, 0x6b6157, 0.55));
    this.scene.add(new AmbientLight(0xfff3e4, 0.18));
  }

  // ----------------------------------------------------------------- the model

  private loadModel() {
    return new Promise<void>((resolve, reject) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      loader.load(
        this.manifest.model,
        (gltf) => {
          try {
            this.modelRoot = gltf.scene as Group;
            this.processModel(this.modelRoot);
            this.scene.add(this.modelRoot);
            this.buildCollision(this.modelRoot);
            this.modelBounds.setFromObject(this.modelRoot);
            draco.dispose();
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        (evt) => {
          if (evt.total > 0) {
            // Cap at 0.98 — the last slice is Draco decode + octree build.
            this.patch({ progress: Math.min(0.98, evt.loaded / evt.total) });
          }
        },
        (err) => reject(err instanceof Error ? err : new Error("model failed to load")),
      );
    });
  }

  private processModel(root: Group) {
    const tags = this.manifest.collision;

    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      const mesh = obj as Mesh;
      const tag = tags[mesh.name] ?? "none";
      mesh.userData.collisionTag = tag;

      if (tag === "proxy") {
        // Collision proxies must never be drawn, but they still need world matrices.
        mesh.visible = false;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        return;
      }

      mesh.castShadow = !this.lowPower;
      mesh.receiveShadow = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => this.tuneMaterial(m as Material, mesh));
    });
  }

  /** Bring exported PBR materials up to arch-viz quality in the browser. */
  private tuneMaterial(mat: Material, mesh: Mesh) {
    const name = mat.name || "";
    const std = mat as MeshStandardMaterial;

    if (std.isMeshStandardMaterial) {
      std.envMapIntensity = 1.0;
      // Colour maps come out of Blender already sRGB-tagged by GLTFLoader; only
      // guard the case where a map slipped through as linear.
      const map = std.map as Texture | null;
      if (map && map.colorSpace !== SRGBColorSpace) map.colorSpace = SRGBColorSpace;
    }

    if (name === "MAT_Glass_Clear" || name === "MAT_Glass_Balustrade") {
      // Keep glass readable: transparent, reflective, never opaque and never invisible.
      std.transparent = true;
      std.opacity = name === "MAT_Glass_Balustrade" ? 0.16 : 0.12;
      std.roughness = 0.03;
      std.metalness = 0.0;
      std.envMapIntensity = 2.4;
      std.depthWrite = false;
      std.side = DoubleSide;
      mesh.castShadow = false;
      mesh.renderOrder = 2;
    }

    if (name === "MAT_Pool_Water") {
      const water = this.makeWaterMaterial(std);
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => ((m as Material).name === name ? water : m));
      } else {
        mesh.material = water;
      }
      mesh.castShadow = false;
      mesh.renderOrder = 1;
      return;
    }

    if (name === "MAT_Foliage" || name === "MAT_Foliage_Deep" || name === "MAT_Hedge") {
      std.side = DoubleSide;
      std.roughness = 0.75;
      if (!this.lowPower) this.addFoliageSway(std);
    }

    if (name === "MAT_Curtain") {
      std.side = DoubleSide;
      std.transparent = true;
      std.opacity = 0.86;
      mesh.castShadow = false;
    }

    // Emissive fixtures carry the 2700-3200 K architectural lighting design.
    if (
      name === "MAT_Cove_Light" ||
      name === "MAT_Downlight" ||
      name === "MAT_PoolLight" ||
      name === "MAT_LandscapeLight" ||
      name === "MAT_Accent_Warm"
    ) {
      std.toneMapped = true;
      mesh.castShadow = false;
    }
  }

  private makeWaterMaterial(source: MeshStandardMaterial) {
    const water = new MeshPhysicalMaterial({
      color: new Color(0x1d6b78),
      roughness: 0.06,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      envMapIntensity: 1.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    water.name = "MAT_Pool_Water_Web";
    // Two crossing wave trains perturb the shading normal. No texture, no extra VRAM.
    water.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\n  vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uTime;\nvarying vec3 vWorldPos;",
        )
        .replace(
          "#include <normal_fragment_begin>",
          `#include <normal_fragment_begin>
  float w1 = sin(vWorldPos.x * 3.1 + uTime * 0.9) * cos(vWorldPos.z * 2.3 - uTime * 0.6);
  float w2 = sin(vWorldPos.z * 4.7 - uTime * 1.3) * 0.5;
  normal = normalize(normal + vec3(w1 * 0.045, 0.0, w2 * 0.045));`,
        );
      water.userData.shader = shader;
    };
    // The source material may be shared by several meshes, so it is left alone;
    // one web water material is reused for all of them.
    void source;
    this.waterMaterials.push(water);
    return water;
  }

  private addFoliageSway(mat: MeshStandardMaterial) {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
  // Sway only the upper canopy, and only along the horizontal plane, so the
  // planter and stem stay planted instead of sliding sideways.
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  float sway = sin(uTime * 0.8 + wp.x * 0.7 + wp.z * 0.5) * 0.012
             + sin(uTime * 1.7 + wp.z * 1.1) * 0.005;
  float h = clamp((position.y - 0.15) * 1.4, 0.0, 1.0);
  transformed.x += sway * h;
  transformed.z += sway * 0.6 * h;`,
        );
      mat.userData.shader = shader;
    };
    this.foliageMaterials.push(mat);
  }

  // -------------------------------------------------------------- collision

  /**
   * Build the octree from a throwaway graph of the collidable surfaces only.
   *
   * Walls, slabs, stairs and glass contribute their real geometry — their boolean
   * door and window openings are baked in, so box proxies would wall the player in.
   * Furniture contributes the cheap boxes generated in Blender. Interactive door
   * leaves are deliberately absent; they are tested separately so an open door
   * actually lets you through.
   */
  private buildCollision(root: Group) {
    root.updateMatrixWorld(true);
    const collisionRoot = new Group();

    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      const tag = obj.userData.collisionTag;
      if (tag !== "static" && tag !== "proxy") return;
      const geom = obj.geometry as BufferGeometry;
      if (!geom || !geom.attributes.position) return;

      // Share the geometry; only the transform is duplicated.
      const stand = new Mesh(geom);
      stand.matrixAutoUpdate = false;
      stand.matrix.copy(obj.matrixWorld);
      collisionRoot.add(stand);
    });

    collisionRoot.updateMatrixWorld(true);
    this.octree.fromGraphNode(collisionRoot);
  }

  private collide() {
    const hit = this.octree.capsuleIntersect(this.collider);
    this.onFloor = false;
    if (hit) {
      // A mostly-upward contact normal means we are standing on something.
      this.onFloor = hit.normal.y > 0.35;
      if (!this.onFloor) {
        // Cancel only the into-surface component so the player slides along walls.
        this.velocity.addScaledVector(hit.normal, -hit.normal.dot(this.velocity));
      }
      if (hit.depth >= 1e-10) {
        this.collider.translate(hit.normal.multiplyScalar(hit.depth));
      }
    }
    this.collideClosedDoors();
  }

  /** Closed interactive doors block; open ones do not. */
  private collideClosedDoors() {
    for (const d of this.doors) {
      if (d.open || Math.abs(d.angle) > 0.25) continue;
      const c = this.collider;
      const cx = (c.start.x + c.end.x) / 2;
      const cz = (c.start.z + c.end.z) / 2;
      const a = d.anchor;
      const dx = cx - a.x;
      const dz = cz - a.z;
      // Leaf runs along X in Blender -> along X or Z in three depending on axis.
      const alongX = d.def.axis === "x";
      const along = alongX ? dx : dz;
      const across = alongX ? dz : dx;
      const reach = d.halfWidth + PLAYER_RADIUS;
      if (Math.abs(along) > reach) continue;
      const thickness = 0.06 + PLAYER_RADIUS;
      if (Math.abs(across) > thickness) continue;
      const push = (thickness - Math.abs(across)) * Math.sign(across || 1);
      const v = new Vector3(alongX ? 0 : push, 0, alongX ? push : 0);
      this.collider.translate(v);
      if (alongX) this.velocity.z = 0;
      else this.velocity.x = 0;
    }
  }

  // ---------------------------------------------------------------- controls

  private setupControls() {
    this.pointerLock = new PointerLockControls(this.camera, this.renderer.domElement);
    this.pointerLock.maxPolarAngle = Math.PI - 0.12;
    this.pointerLock.minPolarAngle = 0.12;
    this.pointerLock.addEventListener("lock", () =>
      this.patch({ locked: true, pointerLockBlocked: false }),
    );
    this.pointerLock.addEventListener("unlock", () => this.patch({ locked: false }));

    // Chrome reports a refused lock through this event as well as a rejected
    // promise; either one drops us into drag-to-look rather than a dead end.
    const onLockError = () => this.failPointerLock();
    document.addEventListener("pointerlockerror", onLockError);
    this.disposers.push(() => document.removeEventListener("pointerlockerror", onLockError));

    this.orbit = new OrbitControls(this.dollhouseCamera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.minDistance = 12;
    this.orbit.maxDistance = 110;
    // Stop the orbit camera from dropping under the building.
    this.orbit.maxPolarAngle = Math.PI * 0.48;
    this.orbit.enabled = false;
  }

  private bindEvents() {
    const onKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.code);
      if (e.code === "KeyR") this.resetPosition();
      if (e.code === "KeyE") this.tryToggleDoor();
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        if (this.pointerLock.isLocked || this.dragLook) e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    const onBlur = () => this.keys.clear();
    const onResize = () => this.resize();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.container);

    this.disposers.push(() => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    });

    this.bindTouchLook();
  }

  /** Right-hand side drag looks around. The joystick lives in React. */
  private bindTouchLook() {
    const el = this.renderer.domElement;
    let id: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      if (this.mode !== "firstPerson") return;
      // A mouse only drives this path when Pointer Lock was refused; otherwise
      // the lock owns the mouse and this would double up on the look.
      if (e.pointerType !== "touch" && !this.dragLook) return;
      // Left third of the screen belongs to the movement joystick — touch only.
      if (e.pointerType === "touch" && e.clientX < this.container.clientWidth * 0.36) return;
      id = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      this.touchLook.dx += e.clientX - lastX;
      this.touchLook.dy += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId === id) id = null;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    this.disposers.push(() => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    });
  }

  /** Called by the React joystick. x/y in -1..1, y positive = forward. */
  setJoystick(x: number, y: number, active: boolean) {
    this.touchMove.x = clamp(x, -1, 1);
    this.touchMove.y = clamp(y, -1, 1);
    this.touchMove.active = active;
  }

  enter() {
    if (this.mode !== "firstPerson") this.setMode("firstPerson");
    if (this.state.isTouch) return;
    if (this.dragLook) return;
    // `PointerLockControls.lock()` forwards `requestPointerLock()`, which throws
    // synchronously in some engines and rejects a promise in Chrome. Unhandled,
    // the second one surfaced as an uncaught WrongDocumentError and the overlay
    // sat there forever.
    try {
      const pending = this.renderer.domElement.requestPointerLock() as unknown;
      if (pending instanceof Promise) pending.catch(() => this.failPointerLock());
    } catch {
      this.failPointerLock();
    }
  }

  /** Pointer Lock is not available here — look with a mouse drag instead. */
  private failPointerLock() {
    if (this.dragLook) return;
    this.dragLook = true;
    this.patch({ locked: false, pointerLockBlocked: true });
  }

  exit() {
    if (this.pointerLock.isLocked) this.pointerLock.unlock();
  }

  // -------------------------------------------------------------------- doors

  private setupDoors() {
    if (!this.modelRoot) return;
    for (const def of this.manifest.doors) {
      const leaf = this.modelRoot.getObjectByName(def.leaf) as Mesh | undefined;
      if (!leaf) {
        console.warn(`[PenthouseTour] door leaf missing: ${def.leaf}`);
        continue;
      }
      const parts: Object3D[] = [leaf];
      if (def.hardware) {
        const hw = this.modelRoot.getObjectByName(def.hardware);
        if (hw) parts.push(hw);
      }

      const hinge = blenderToThree(def.hinge[0], def.hinge[1], def.hinge[2]);
      const pivot = new Group();
      pivot.name = `PIVOT_${def.id}`;
      pivot.position.copy(hinge);
      // Parent the pivot to the scene, not to the leaf's node, so the maths below
      // is independent of however deeply the GLB nests that leaf.
      this.scene.add(pivot);
      pivot.updateMatrixWorld(true);
      const pivotInverse = pivot.matrixWorld.clone().invert();

      for (const p of parts) {
        p.updateMatrixWorld(true);
        const world = p.matrixWorld.clone();
        pivot.add(p);
        // Re-express the child in the pivot's space so it does not visibly move.
        p.matrix.copy(pivotInverse.clone().multiply(world));
        p.matrix.decompose(p.position, p.quaternion, p.scale);
      }

      this.doors.push({
        def,
        pivot,
        hinge,
        anchor: blenderToThree(def.center[0], def.center[1], def.center[2]),
        open: false,
        angle: 0,
        target: 0,
        halfWidth: def.width / 2,
      });
    }
  }

  private nearestDoor(): DoorRuntime | null {
    const p = this.camera.position;
    let best: DoorRuntime | null = null;
    let bestDist = DOOR_REACH;
    for (const d of this.doors) {
      const dist = Math.hypot(p.x - d.anchor.x, p.z - d.anchor.z);
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    return best;
  }

  private tryToggleDoor() {
    if (this.mode !== "firstPerson") return;
    const d = this.nearestDoor();
    if (!d) return;
    d.open = !d.open;
    // The Blender->glTF Y-up conversion is a -90 deg rotation about X, under which
    // a yaw about Blender +Z maps to the same-signed yaw about three +Y.
    d.target = d.open ? d.def.openAngle : 0;
  }

  private updateDoors(dt: number) {
    for (const d of this.doors) {
      if (Math.abs(d.angle - d.target) < 1e-4) continue;
      const step = DOOR_SPEED * dt;
      const delta = clamp(d.target - d.angle, -step, step);
      d.angle += delta;
      d.pivot.rotation.y = d.angle;
    }
  }

  // -------------------------------------------------------------- navigation

  resetPosition() {
    const s = this.manifest.spawn;
    const p = blenderToThree(s.position[0], s.position[1], s.position[2]);
    this.teleport(p, s.yaw, s.pitch);
  }

  teleport(footPos: Vector3, yaw?: number, pitch = 0) {
    this.collider.start.set(footPos.x, footPos.y + PLAYER_RADIUS, footPos.z);
    this.collider.end.set(footPos.x, footPos.y + EYE_HEIGHT, footPos.z);
    this.collider.radius = PLAYER_RADIUS;
    this.velocity.set(0, 0, 0);
    this.lastSafe.copy(this.collider.start);
    if (yaw !== undefined) {
      this.euler.set(pitch, yaw, 0, "YXZ");
      this.camera.quaternion.setFromEuler(this.euler);
    }
    this.camera.position.copy(this.collider.end);
  }

  /** Jump straight to a room — used by the room menu. */
  gotoRoom(id: string) {
    const room = this.manifest.rooms.find((r) => r.id === id);
    if (!room) return false;
    const e = room.entry;
    const p = blenderToThree(e[0], e[1], e[2]);
    // Face the middle of the room, level. Arriving still pointed wherever the
    // previous view happened to look usually means staring at a wall.
    const [xmin, ymin, xmax, ymax] = room.aabb;
    const centre = blenderToThree((xmin + xmax) / 2, (ymin + ymax) / 2, e[2]);
    let dx = centre.x - p.x;
    let dz = centre.z - p.z;
    if (dx * dx + dz * dz <= 0.04) {
      // The exporter usually lands the entry point on the room centre, so this
      // branch is the common case, not the corner case — keeping the previous
      // yaw here is what leaves you nose-to-wall. Face down the long axis
      // instead, toward whichever end has more room in front of it.
      const b = roomBoundsThree(room);
      if (b.xmax - b.xmin >= b.zmax - b.zmin) {
        dx = b.xmax - p.x >= p.x - b.xmin ? 1 : -1;
        dz = 0;
      } else {
        dx = 0;
        dz = b.zmax - p.z >= p.z - b.zmin ? 1 : -1;
      }
    }
    // Camera forward is -Z at yaw 0, so yaw = atan2(dx, -dz).
    const yaw = Math.atan2(dx, -dz);
    this.setMode("firstPerson");
    this.teleport(p, yaw, 0);
    return true;
  }

  private currentRoom(): TourRoom | null {
    const p = this.camera.position;
    // Feet, not eyes — the storey test keys off the walking surface.
    const feetY = p.y - EYE_HEIGHT;
    let best: TourRoom | null = null;
    let bestFloorGap = Infinity;
    for (const r of this.manifest.rooms) {
      if (!pointInRoom(r, p.x, feetY, p.z, 0)) continue;
      const gap = Math.abs(feetY - r.floor);
      if (gap < bestFloorGap) {
        bestFloorGap = gap;
        best = r;
      }
    }
    return best;
  }

  // --------------------------------------------------------------- the loop

  /** Horizontal unit vector the player is asking to move along. */
  private wishDirection(target = new Vector3()) {
    const forward = new Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    forward.normalize();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();

    let fwd = 0;
    let strafe = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) fwd += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) fwd -= 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) strafe -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) strafe += 1;

    if (this.touchMove.active) {
      fwd += this.touchMove.y;
      strafe += this.touchMove.x;
    }

    target.set(0, 0, 0).addScaledVector(forward, fwd).addScaledVector(right, strafe);
    if (target.lengthSq() > 1) target.normalize();
    return target;
  }

  private currentSpeed() {
    const fast = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    return WALK_SPEED * (fast ? RUN_MULTIPLIER : 1);
  }

  /**
   * Lift the capsule over a low obstruction so stair risers are climbed reliably.
   *
   * The naive test — "does the capsule collide when moved forward?" — does not
   * work, because the floor the player is standing on is always in contact and
   * dominates the returned contact normal. So both probes are raised clear of the
   * floor first: a low probe that a stair riser still blocks, and a high probe
   * that only a real wall blocks. Low blocked + high clear means "this is a step".
   *
   * The lift is applied in small increments and re-evaluated each substep, so the
   * player rises exactly as far as the tread requires instead of popping up by a
   * fixed amount and dropping back.
   */
  private tryStepUp(delta: Vector3): boolean {
    if (!this.onFloor) return false;

    const horizontal = new Vector3(delta.x, 0, delta.z);
    if (horizontal.lengthSq() < 1e-8) return false;
    horizontal.normalize().multiplyScalar(STEP_LOOKAHEAD);

    const blockedAt = (lift: number) => {
      const c = this.collider.clone();
      c.start.y += lift;
      c.end.y += lift;
      c.translate(horizontal);
      const hit = this.octree.capsuleIntersect(c);
      return !!hit && hit.depth > 0.01;
    };

    // Clear of the ground, but still low enough to feel a 178 mm riser.
    if (!blockedAt(FOOT_CLEARANCE)) return false;
    // Above the tallest thing we are willing to step onto — a wall, a counter or
    // a balustrade all register here and correctly refuse the step.
    if (blockedAt(STEP_HEIGHT + FOOT_CLEARANCE)) return false;

    this.collider.start.y += STEP_RISE_PER_SUBSTEP;
    this.collider.end.y += STEP_RISE_PER_SUBSTEP;
    return true;
  }

  private updatePlayer(dt: number) {
    // Touch look feeds the same euler PointerLockControls drives.
    if (this.touchLook.dx || this.touchLook.dy) {
      this.euler.setFromQuaternion(this.camera.quaternion, "YXZ");
      this.euler.y -= this.touchLook.dx * 0.0032;
      this.euler.x -= this.touchLook.dy * 0.0032;
      this.euler.x = clamp(this.euler.x, -Math.PI / 2 + 0.12, Math.PI / 2 - 0.12);
      this.camera.quaternion.setFromEuler(this.euler);
      this.touchLook.dx = 0;
      this.touchLook.dy = 0;
    }

    const wish = this.wishDirection();
    const speed = this.currentSpeed();

    if (this.onFloor) {
      // Kinematic ground control. A force-based model at a realistic 2.1 m/s does
      // not have the authority to climb a 33-degree stair against gravity, so on
      // the ground the horizontal velocity is driven straight at the target.
      const k = 1 - Math.exp(-GROUND_ACCEL * dt);
      this.velocity.x += (wish.x * speed - this.velocity.x) * k;
      this.velocity.z += (wish.z * speed - this.velocity.z) * k;
      // Press into the floor so descending a stair keeps contact instead of
      // launching the player off each nosing.
      this.velocity.y = -STICK_SPEED;
    } else {
      this.velocity.y -= GRAVITY * dt;
      this.velocity.x += wish.x * speed * AIR_CONTROL * dt * GROUND_ACCEL;
      this.velocity.z += wish.z * speed * AIR_CONTROL * dt * GROUND_ACCEL;
    }

    const delta = this.velocity.clone().multiplyScalar(dt);
    this.tryStepUp(delta);
    this.collider.translate(delta);
    this.collide();

    this.camera.position.copy(this.collider.end);

    // Fall recovery. Without this a single collision gap drops the player into the
    // void with no way back, which the brief explicitly rules out.
    const belowModel = this.collider.start.y < this.modelBounds.min.y - 1.5;
    if (belowModel) {
      this.teleport(
        new Vector3(this.lastSafe.x, this.lastSafe.y - PLAYER_RADIUS + 0.05, this.lastSafe.z),
      );
      return;
    }
    if (this.onFloor) {
      this.lastSafeAge += dt;
      if (this.lastSafeAge > 0.25) {
        this.lastSafe.copy(this.collider.start);
        this.lastSafeAge = 0;
      }
    }
  }

  private tick = (now: number) => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const raw = (now - this.lastTime) / 1000;
    this.lastTime = now;
    // Clamp so an alt-tab pause cannot tunnel the player through a wall.
    const dt = Math.min(raw || 0, 0.1);

    if (this.mode === "firstPerson") {
      const sub = dt / MAX_SUBSTEPS;
      for (let i = 0; i < MAX_SUBSTEPS; i++) this.updatePlayer(sub);
    } else {
      this.orbit.update();
    }

    this.updateDoors(dt);
    this.updateShaders(now / 1000);
    this.updateHud(dt);

    const cam = this.mode === "firstPerson" ? this.camera : this.dollhouseCamera;
    this.renderer.render(this.scene, cam);
  };

  private updateShaders(t: number) {
    for (const m of this.waterMaterials) {
      const sh = m.userData.shader;
      if (sh?.uniforms?.uTime) sh.uniforms.uTime.value = t;
    }
    for (const m of this.foliageMaterials) {
      const sh = (m as Material).userData.shader;
      if (sh?.uniforms?.uTime) sh.uniforms.uTime.value = t;
    }
  }

  private updateHud(dt: number) {
    this.fpsAccum += dt;
    this.fpsFrames++;
    const next: Partial<TourState> = {};

    if (this.fpsAccum >= 0.5) {
      next.fps = Math.round(this.fpsFrames / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }

    if (this.mode === "firstPerson") {
      const room = this.currentRoom();
      const label = room?.label ?? null;
      if (label !== this.state.room) next.room = label;

      const d = this.nearestDoor();
      const prompt = d ? { id: d.def.id, open: d.open } : null;
      const changed =
        (prompt?.id ?? null) !== (this.state.doorPrompt?.id ?? null) ||
        (prompt?.open ?? null) !== (this.state.doorPrompt?.open ?? null);
      if (changed) next.doorPrompt = prompt;
    } else if (this.state.room || this.state.doorPrompt) {
      next.room = null;
      next.doorPrompt = null;
    }

    if (Object.keys(next).length) this.patch(next);
  }

  // --------------------------------------------------------------- modes/api

  setMode(mode: TourMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode === "dollhouse") {
      this.exit();
      const c = new Vector3();
      const sphere = new Sphere();
      this.modelBounds.getCenter(c);
      this.modelBounds.getBoundingSphere(sphere);
      this.orbit.target.copy(c);
      // Frame the whole building: back off far enough that the bounding sphere
      // fits the vertical field of view, with a little breathing room.
      const fov = (this.dollhouseCamera.fov * Math.PI) / 180;
      const dist = (sphere.radius / Math.sin(fov / 2)) * 1.15;
      const dir = new Vector3(0.62, 0.55, 0.62).normalize();
      this.dollhouseCamera.position.copy(c).addScaledVector(dir, dist);
      this.orbit.enabled = true;
      this.orbit.update();
    } else {
      this.orbit.enabled = false;
    }
    this.patch({ mode });
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dollhouseCamera.aspect = w / h;
    this.dollhouseCamera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.disposers.forEach((d) => d());
    this.disposers = [];
    this.orbit?.dispose();
    this.pointerLock?.dispose();
    this.scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => (m as Material)?.dispose?.());
      }
    });
    this.renderer?.dispose();
    if (this.renderer?.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  private patch(next: Partial<TourState>) {
    this.state = { ...this.state, ...next };
    this.onState(this.state);
  }

  // ------------------------------------------------------------ test surface

  /** Exposed for the Playwright suite; not used by the UI. */
  get debug() {
    return {
      position: () => this.camera.position.clone(),
      feet: () => this.collider.start.clone().setY(this.collider.start.y - PLAYER_RADIUS),
      onFloor: () => this.onFloor,
      room: () => this.currentRoom()?.id ?? null,
      mode: () => this.mode,
      doors: () => this.doors.map((d) => ({ id: d.def.id, open: d.open, angle: d.angle })),
      teleport: (x: number, y: number, z: number) => this.teleport(new Vector3(x, y, z)),
      /** Drive the controller for N seconds of simulated walking. */
      walk: (dirX: number, dirZ: number, seconds: number, yaw?: number) => {
        if (yaw !== undefined) {
          this.euler.set(0, yaw, 0, "YXZ");
          this.camera.quaternion.setFromEuler(this.euler);
        }
        this.touchMove.x = dirX;
        this.touchMove.y = dirZ;
        this.touchMove.active = true;
        const step = 1 / 120;
        for (let t = 0; t < seconds; t += step) this.updatePlayer(step);
        this.touchMove.active = false;
        this.touchMove.x = 0;
        this.touchMove.y = 0;
      },
      octreeTriangles: () => this.countOctree(this.octree),
      toggleDoor: () => this.tryToggleDoor(),
      /** Contact the player capsule would register at a given standing position. */
      contactAt: (x: number, y: number, z: number) => {
        this.teleport(new Vector3(x, y, z));
        const hit = this.octree.capsuleIntersect(this.collider);
        return hit
          ? {
              normal: [+hit.normal.x.toFixed(3), +hit.normal.y.toFixed(3), +hit.normal.z.toFixed(3)],
              depth: +hit.depth.toFixed(3),
            }
          : null;
      },
      /** First collision surface along a ray, in three.js coordinates. */
      ray: (o: number[], d: number[]) => {
        const ray = new Ray(
          new Vector3(o[0], o[1], o[2]),
          new Vector3(d[0], d[1], d[2]).normalize(),
        );
        const hit = this.octree.rayIntersect(ray);
        return hit
          ? {
              distance: +hit.distance.toFixed(3),
              point: [
                +hit.position.x.toFixed(2),
                +hit.position.y.toFixed(2),
                +hit.position.z.toFixed(2),
              ],
            }
          : null;
      },
      /**
       * Render and read the framebuffer back in the same task. Reading a WebGL
       * canvas from outside the drawing call returns black unless the drawing
       * buffer is preserved, so the test cannot use drawImage/toDataURL.
       */
      sampleFrame: () => {
        const cam = this.mode === "firstPerson" ? this.camera : this.dollhouseCamera;
        this.renderer.render(this.scene, cam);
        const gl = this.renderer.getContext();
        const w = this.renderer.domElement.width;
        const h = this.renderer.domElement.height;
        const px = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
        let sum = 0;
        let count = 0;
        const buckets = new Set<string>();
        // Subsample; a full-resolution scan is needlessly slow under SwiftShader.
        for (let y = 0; y < h; y += 4) {
          for (let x = 0; x < w; x += 4) {
            const i = (y * w + x) * 4;
            sum += (px[i] + px[i + 1] + px[i + 2]) / 3;
            count++;
            buckets.add(`${px[i] >> 4},${px[i + 1] >> 4},${px[i + 2] >> 4}`);
          }
        }
        return { mean: sum / Math.max(1, count), distinct: buckets.size, w, h };
      },
    };
  }

  private countOctree(node: Octree): number {
    let n = node.triangles.length;
    for (const s of node.subTrees) n += this.countOctree(s);
    return n;
  }
}

import { Vector3 } from "three";

/**
 * The tour manifest is emitted by `tools/blender/export_web.py`. Every coordinate in
 * it is in the source Blender space: Z-up, metres, matching the architect's model.
 *
 * The GLB itself is exported Y-up (glTF convention), so anything read out of the
 * manifest has to pass through `blenderToThree` before it touches the scene graph.
 */

export type CollisionTag = "static" | "proxy" | "door" | "none";

export interface TourRoom {
  id: string;
  label: string;
  level: 11 | 12;
  /** Walking surface height, Blender Z. */
  floor: number;
  /** [xmin, ymin, xmax, ymax] in Blender XY. */
  aabb: [number, number, number, number];
  /**
   * A standing spot inside the room that is clear of furniture, Blender XYZ.
   * Computed by the exporter — room centres are frequently inside an island,
   * a bed or the pool, and dropping the player into a collision proxy ejects
   * them through the slab.
   */
  entry: [number, number, number];
}

export interface TourDoor {
  id: string;
  leaf: string;
  hardware: string | null;
  /** Hinge point, Blender XYZ. */
  hinge: [number, number, number];
  axis: "x" | "y";
  width: number;
  height: number;
  /** Signed swing, radians about Blender +Z. */
  openAngle: number;
  /** Prompt anchor, Blender XYZ. */
  center: [number, number, number];
}

export interface TourManifest {
  model: string;
  spawn: {
    position: [number, number, number];
    /** Radians about +Y, already in three.js convention. */
    yaw: number;
    pitch: number;
  };
  floorLevels: number[];
  rooms: TourRoom[];
  doors: TourDoor[];
  collision: Record<string, CollisionTag>;
  proxies: string[];
  stats: {
    total_tris: number;
    visual_tris: number;
    collision_tris: number;
    texture_count: number;
    texture_vram_mb: number;
    glb_mb: number;
  };
}

/**
 * Blender Z-up -> three.js Y-up, matching the glTF exporter's `export_yup=True`.
 * Blender (x, y, z) becomes three (x, z, -y).
 */
export function blenderToThree(x: number, y: number, z: number, target = new Vector3()): Vector3 {
  return target.set(x, z, -y);
}

/** Room bounds projected onto the three.js ground plane. */
export function roomBoundsThree(room: TourRoom) {
  const [xmin, ymin, xmax, ymax] = room.aabb;
  return {
    xmin,
    xmax,
    // Blender +Y maps to three -Z, so the range flips.
    zmin: -ymax,
    zmax: -ymin,
    floorY: room.floor,
  };
}

/** Cheap point-in-room test. `pad` widens the box so labels appear a little early. */
export function pointInRoom(room: TourRoom, x: number, y: number, z: number, pad = 0): boolean {
  const b = roomBoundsThree(room);
  return (
    x >= b.xmin - pad &&
    x <= b.xmax + pad &&
    z >= b.zmin - pad &&
    z <= b.zmax + pad &&
    // Match the storey: the two floors overlap in plan.
    y >= b.floorY - 1.2 &&
    y <= b.floorY + 2.6
  );
}

"""
Export the FOAKH Penthouse A-1 duplex to a web-optimised GLB + tour manifest.

Run headless — this NEVER saves the source .blend:

    /Applications/Blender.app/Contents/MacOS/Blender -b \
        /Users/bytes/PenthouseA1_Blender/PenthouseA1_Duplex.blend \
        -P tools/blender/export_web.py

Outputs:
    public/models/foakh-penthouse.glb        Draco-compressed scene + collision proxies
    public/models/foakh-penthouse.tour.json  spawn, rooms, doors, collision tags

Design notes
------------
* Walls / slabs / stairs / glass keep their REAL geometry for collision. They are
  already cheap (~13k tris total) and, critically, their boolean-cut door and window
  openings are baked into that geometry — box proxies would seal the openings shut.
* Furniture gets cheap axis-aligned box proxies (COL_FURN_*) so the player never
  snags on a cushion or a chair spindle.
* Extra invisible guards (COL_GUARD_*) fence the pool and the entrance threshold.
* Blender's 15 area lights are NOT exported. 15 real-time lights would sink frame
  rate; the viewer reproduces the lighting design with an environment probe, one sun
  matched to SUN_Key, and the emissive materials that ship inside the GLB.
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

# ---------------------------------------------------------------- configuration

REPO = "/Users/bytes/Documents/GitHub/foakhhusewebsite"
OUT_GLB = os.path.join(REPO, "public/models/foakh-penthouse.glb")
OUT_MANIFEST = os.path.join(REPO, "public/models/foakh-penthouse.tour.json")

# Collections whose real geometry is the collision surface.
STATIC_COLLISION_COLLECTIONS = {
    "11F_WALLS", "12F_WALLS",
    "11F_STRUCTURE", "12F_STRUCTURE",
    "SERVICE_CORE", "STAIRS",
    "12F_TERRACE_POOL",
    "11F_DOORS_WINDOWS", "12F_DOORS_WINDOWS",
}

# Collections that get cheap box proxies instead.
PROXY_COLLECTIONS = {"11F_FURNITURE", "12F_FURNITURE", "LIGHTING"}

# Dropped entirely from the export.
DROP_COLLECTIONS = {"_CUTTERS", "REFERENCES"}

# Ceiling-zone trim that must NOT collide. The cove reveals and downlight strips
# run across the duplex stairwell about 2.8 m up: left collidable they clip the top
# of the player capsule and stall the climb halfway up the flight. Ceilings are
# dropped for the same reason — nothing walkable ever touches them.
NO_COLLISION_PREFIXES = ("COVE_", "DL_", "CEIL_")

FLOOR_LEVELS = (0.0, 3.2, 3.86)          # 11F, 12F, pool deck
PROXY_MAX_HEIGHT = 1.45                  # cap proxy boxes — capsule is 1.75 tall
PROXY_MIN_HEIGHT = 0.18                  # below this it is a rug or a threshold strip
PROXY_MIN_FOOTPRINT = 0.10               # m^2
PROXY_MAX_ABOVE_FLOOR = 1.05           # above this it is wall-mounted or a pendant
PROXY_SHRINK = 0.02                      # keep proxies clear of the walls they touch

# Never collide with these — you walk over/through them.
PROXY_NAME_SKIP = (
    "RUG", "CARPET", "MAT_", "ART", "PAINT", "MIRROR", "PENDANT", "CHANDELIER",
    "DOWNLIGHT", "COVE", "SCONCE", "CURTAIN", "SHEER", "TV", "SCREEN", "BOOK",
    "VASE", "BOWL", "TRAY", "SCULPT", "OBJET", "CUSHION", "THROW", "PILLOW",
    "TOWEL", "PLATE", "GLASS_", "LAMPSHADE", "FOLIAGE",
    "DECOR", "OBJET", "CANDLE", "LANTERN", "BOOKS", "HANDLE",
)

# Doors that may be opened with E. The entrance is deliberately excluded: the
# common lobby beyond it is outside the modelled slab, so opening it would expose
# a hole in the world.
INTERACTIVE_DOORS = [
    "D11_BedL", "D11_BedR", "D11_Bath1", "D11_Bath2", "D11_Powder",
    "D12_Bath", "D12_Dress", "D12_Changing", "D12_BedLobby",
]

# Rooms, derived from the wall grid mapped out of the source file.
# floor = walking surface height, aabb = [xmin, ymin, xmax, ymax]
ROOMS = [
    # ---- 11F -----------------------------------------------------------------
    {"id": "entrance",    "label": "Entrance Hall",   "level": 11, "floor": 0.0,  "aabb": [7.80, 14.30, 14.70, 17.30]},
    {"id": "lounge",      "label": "Living Room",     "level": 11, "floor": 0.0,  "aabb": [4.10,  3.80, 14.70,  9.60]},
    {"id": "kitchen",     "label": "Kitchen",         "level": 11, "floor": 0.0,  "aabb": [0.25,  4.60,  3.85,  8.40]},
    {"id": "bed_l_11",    "label": "Bedroom II",      "level": 11, "floor": 0.0,  "aabb": [0.25,  0.25,  4.90,  3.55]},
    {"id": "bed_r_11",    "label": "Bedroom III",     "level": 11, "floor": 0.0,  "aabb": [9.90,  0.25, 14.65,  3.55]},
    {"id": "bath_11",     "label": "Guest Bathroom",  "level": 11, "floor": 0.0,  "aabb": [5.10,  0.25,  7.25,  3.55]},
    {"id": "powder_11",   "label": "Powder Room",     "level": 11, "floor": 0.0,  "aabb": [10.35, 9.85, 14.65, 11.55]},
    {"id": "lobby_11",    "label": "Lift Lobby",      "level": 11, "floor": 0.0,  "aabb": [7.80,  9.85, 12.20, 14.05]},
    {"id": "balcony_11",  "label": "Balcony",         "level": 11, "floor": -0.05, "aabb": [14.95, 0.10, 16.25, 8.10]},
    {"id": "stair",       "label": "Duplex Stair",    "level": 11, "floor": 0.0,  "aabb": [8.60, 17.40, 13.20, 18.80]},
    # ---- 12F -----------------------------------------------------------------
    {"id": "master",      "label": "Master Bedroom",  "level": 12, "floor": 3.20, "aabb": [0.25,  0.25,  4.50,  6.75]},
    {"id": "dressing",    "label": "Dressing Room",   "level": 12, "floor": 3.20, "aabb": [0.25,  7.08,  2.28,  8.50]},
    {"id": "changing",    "label": "Changing Room",   "level": 12, "floor": 3.20, "aabb": [2.47,  7.08,  4.75,  8.50]},
    {"id": "master_bath", "label": "Master Bathroom", "level": 12, "floor": 3.20, "aabb": [0.25,  8.72,  3.40, 11.35]},
    {"id": "terrace",     "label": "Roof Terrace",    "level": 12, "floor": 3.24, "aabb": [9.60,  5.35, 14.85, 11.35]},
    {"id": "pool",        "label": "Pool Deck",       "level": 12, "floor": 3.86, "aabb": [4.90,  0.10, 14.85,  3.90]},
    {"id": "upper_lounge","label": "Upper Lounge",    "level": 12, "floor": 3.20, "aabb": [9.15, 11.65, 12.20, 14.25]},
    # Runs all the way north so the stair landing is labelled rather than falling
    # into the gap between rooms.
    {"id": "upper_hall",  "label": "Upper Landing",   "level": 12, "floor": 3.20, "aabb": [7.85, 14.35, 14.65, 18.90]},
]

# Player start: just inside D11_Entrance (x 7.5-7.8, y 15.0-16.2), facing into the hall
# (+X in Blender, which is a yaw of -PI/2 once the scene is converted to glTF Y-up).
# `position` stays in Blender Z-up metres; the viewer converts it with blenderToThree().
SPAWN = {"position": [8.55, 15.60, 0.0], "yaw": -math.pi / 2, "pitch": -0.03,
         "yawConvention": "three.js Y-up, radians about +Y"}

# Invisible guards. name -> [xmin, ymin, zmin, xmax, ymax, zmax]
GUARDS = {
    # Fence the pool opening so nobody walks onto or falls into the water.
    "COL_GUARD_Pool":      [5.35, 1.40, 3.86, 14.55, 3.70, 4.95],
    # Seal the entrance threshold — beyond it is unmodelled common lobby.
    "COL_GUARD_EntryVoid": [7.28, 14.85, 0.00, 7.56, 16.35, 2.70],
    # West edge of the 12F terrace where the bedroom wall stops short.
    "COL_GUARD_TerrW":     [4.72, 8.60, 3.20, 4.88, 14.30, 4.30],
    # 12F slab edge north of the duct core (small modelling gap at x 3.65-3.90).
    "COL_GUARD_TerrN":     [3.60, 14.05, 3.20, 3.95, 14.32, 4.30],
    # Stair void on the 12F north-block slab, open side toward the landing.
    "COL_GUARD_StairVoidW": [9.35, 17.30, 3.20, 9.50, 18.85, 4.30],
    # LIFT2 shaft is open through the 12F slab and the upper-lounge room box
    # runs straight over it. Without this the player walks off the floor.
    "COL_GUARD_Lift2Void": [12.20, 11.55, 3.20, 12.36, 13.85, 4.30],
}

# ------------------------------------------------------------------- utilities

def log(msg):
    print(f"[export_web] {msg}", flush=True)


def world_aabb(obj):
    mw = obj.matrix_world
    pts = [mw @ Vector(c) for c in obj.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def nearest_floor(z):
    return max((f for f in FLOOR_LEVELS if f <= z + 0.35), default=0.0)


def loose_part_aabbs(obj):
    """World AABBs of each connected component of a mesh.

    One box per object is wrong for wrap-around joinery: a U-shaped counter run,
    a splashback or a walk-in wardrobe has a bounding box that fills the entire
    room, which would seal the room off. Splitting into loose parts first gives a
    box per straight leg, which hugs the walls the way the real joinery does.
    """
    mesh = obj.data
    n = len(mesh.vertices)
    if n == 0:
        return []

    parent = list(range(n))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for edge in mesh.edges:
        union(edge.vertices[0], edge.vertices[1])
    # Faces catch any component held together without explicit edges.
    for poly in mesh.polygons:
        vs = poly.vertices
        for i in range(1, len(vs)):
            union(vs[0], vs[i])

    mw = obj.matrix_world
    groups = {}
    for i, v in enumerate(mesh.vertices):
        root = find(i)
        w = mw @ v.co
        g = groups.get(root)
        if g is None:
            groups[root] = [list(w), list(w)]
        else:
            for k in range(3):
                if w[k] < g[0][k]:
                    g[0][k] = w[k]
                if w[k] > g[1][k]:
                    g[1][k] = w[k]
    return list(groups.values())


def make_box(name, lo, hi, material):
    """Axis-aligned box mesh at world coordinates, added to the COLLISION collection."""
    mesh = bpy.data.meshes.new(name)
    cx, cy, cz = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2
    sx, sy, sz = (hi[0] - lo[0]) / 2, (hi[1] - lo[1]) / 2, (hi[2] - lo[2]) / 2
    verts = [
        (cx - sx, cy - sy, cz - sz), (cx + sx, cy - sy, cz - sz),
        (cx + sx, cy + sy, cz - sz), (cx - sx, cy + sy, cz - sz),
        (cx - sx, cy - sy, cz + sz), (cx + sx, cy - sy, cz + sz),
        (cx + sx, cy + sy, cz + sz), (cx - sx, cy + sy, cz + sz),
    ]
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
             (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    return obj


# --------------------------------------------------------------- export stages

def stage_validate():
    """Verify the model assumptions the walkthrough depends on."""
    scene = bpy.context.scene
    problems = []

    if scene.unit_settings.system != "METRIC":
        problems.append(f"unit system is {scene.unit_settings.system}, expected METRIC")
    if abs(scene.unit_settings.scale_length - 1.0) > 1e-6:
        problems.append(f"scale_length is {scene.unit_settings.scale_length}, expected 1.0 (1 unit = 1 m)")

    bad_scale, bad_norm, missing_tex = [], [], []
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        s = obj.scale
        if max(abs(s.x - 1), abs(s.y - 1), abs(s.z - 1)) > 1e-4:
            bad_scale.append(obj.name)
        # Negative determinant means the object is mirrored: normals point inward.
        if obj.matrix_world.determinant() < 0:
            bad_norm.append(obj.name)

    for img in bpy.data.images:
        if img.source == "FILE" and not os.path.exists(bpy.path.abspath(img.filepath)):
            missing_tex.append(img.name)

    report = {
        "unit_system": scene.unit_settings.system,
        "scale_length": scene.unit_settings.scale_length,
        "unapplied_scale": bad_scale,
        "mirrored_transforms": bad_norm,
        "missing_textures": missing_tex,
        "problems": problems,
    }
    log(f"validate: unapplied_scale={len(bad_scale)} mirrored={len(bad_norm)} "
        f"missing_textures={len(missing_tex)} problems={len(problems)}")
    for p in problems:
        log(f"  PROBLEM: {p}")
    return report


def stage_fix_door_clashes():
    """Trim wall-finish panels where they run across a door opening.

    The source model has the walnut slat feature walls and the TV feature wall
    starting mid-doorway — e.g. SLAT_11F_BedL_Backing begins at x=2.05 while the
    Bedroom II opening runs x=1.64..2.46, so it covers 0.41 m of a 0.82 m door.
    Left alone the panels both look wrong and make the doorway too narrow for a
    person to pass, which breaks the walkthrough.

    Only decorative finish panels are trimmed, and only against door cutters. Door
    linings, structure, service risers and rails are never touched: their bounding
    boxes overlap an opening because they correctly wrap around it.

    This edits the in-memory scene for the export only. The source .blend is never
    saved, so nothing here changes the architect's file.
    """
    PANEL_PREFIXES = ("SLAT_", "FEATURE_", "PANEL_")

    cutters = []
    coll = bpy.data.collections.get("_CUTTERS")
    if coll:
        cutters = [o for o in coll.objects
                   if o.type == "MESH" and o.name.startswith("CUT_D")]

    cut_coll = bpy.data.collections.get("_CUTTERS")
    mat = bpy.data.materials.get("MAT_Concrete") or bpy.data.materials.new("MAT_ClashCut")

    # A door cutter is sized to the wall it punches, but the finish panels sit
    # proud of the wall face, so the raw cutter only removes part of a panel's
    # thickness and leaves a millimetre-thin sliver across the opening. Each
    # cutter therefore gets a deepened twin, extended along the wall normal.
    deepened = {}

    def deep_cutter(cut):
        if cut.name in deepened:
            return deepened[cut.name]
        clo, chi = world_aabb(cut)
        size = chi - clo
        # The wall normal is the shortest horizontal axis of the opening.
        axis = 0 if size.x < size.y else 1
        lo = [clo.x, clo.y, clo.z]
        hi = [chi.x, chi.y, chi.z]
        lo[axis] -= 0.35
        hi[axis] += 0.35
        obj = make_box(f"CUTDEEP_{cut.name}", lo, hi, mat)
        (cut_coll or bpy.context.scene.collection).objects.link(obj)
        obj.hide_render = True
        deepened[cut.name] = obj
        return obj

    fixed = []
    for panel in bpy.data.objects:
        if panel.type != "MESH" or not panel.name.startswith(PANEL_PREFIXES):
            continue
        plo, phi = world_aabb(panel)
        for cut in cutters:
            clo, chi = world_aabb(cut)
            ox = min(chi.x, phi.x) - max(clo.x, plo.x)
            oy = min(chi.y, phi.y) - max(clo.y, plo.y)
            oz = min(chi.z, phi.z) - max(clo.z, plo.z)
            # A real intrusion: meaningful width and full-height, any thickness.
            if ox <= 0.05 or oz <= 0.5 or oy <= 0.0:
                continue
            mod = panel.modifiers.new(name=f"CLASH_{cut.name}", type="BOOLEAN")
            mod.operation = "DIFFERENCE"
            mod.object = deep_cutter(cut)
            mod.solver = "EXACT"
            fixed.append((panel.name, cut.name, round(ox, 3)))

    for name, cut, ox in fixed:
        log(f"  trimmed {name} out of {cut} ({ox:.2f} m of the opening)")
    log(f"fix_door_clashes: trimmed {len(fixed)} panel/opening clashes")
    return [{"panel": n, "opening": c, "width": w} for n, c, w in fixed]


def stage_apply_modifiers():
    """Bake BOOLEAN/BEVEL modifiers so door and window openings survive the export
    and so the cutter objects can be deleted."""
    bpy.ops.object.select_all(action="DESELECT")
    targets = [o for o in bpy.data.objects if o.type == "MESH" and o.modifiers]
    view = bpy.context.view_layer
    applied = 0
    for obj in targets:
        # A hidden object cannot be made active, and cutters are hidden.
        obj.hide_viewport = False
        obj.hide_set(False)
        try:
            view.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.convert(target="MESH")
            applied += 1
        except Exception as exc:                                  # noqa: BLE001
            log(f"  WARN could not apply modifiers on {obj.name}: {exc}")
        obj.select_set(False)
    log(f"apply_modifiers: baked {applied}/{len(targets)} objects")
    return applied


def stage_drop_unwanted():
    """Delete cutters, reference planes, cameras and lights."""
    doomed = []
    for coll_name in DROP_COLLECTIONS:
        coll = bpy.data.collections.get(coll_name)
        if coll:
            doomed.extend(list(coll.objects))
    doomed.extend([o for o in bpy.data.objects if o.type in {"CAMERA", "LIGHT"}])

    seen = set()
    for obj in doomed:
        if obj.name in seen:
            continue
        seen.add(obj.name)
        bpy.data.objects.remove(obj, do_unlink=True)
    log(f"drop_unwanted: removed {len(seen)} objects "
        f"(cutters, reference planes, {len(DROP_COLLECTIONS)} collections, cameras, lights)")
    return len(seen)


def stage_build_collision():
    """Create the COLLISION collection: furniture box proxies + invisible guards."""
    coll = bpy.data.collections.new("COLLISION")
    bpy.context.scene.collection.children.link(coll)

    mat = bpy.data.materials.new("MAT_Collision")
    mat.diffuse_color = (0.0, 1.0, 0.4, 1.0)
    mat.use_nodes = True

    proxies, skipped, boxes = [], [], {}
    for obj in list(bpy.data.objects):
        if obj.type != "MESH":
            continue
        cols = {c.name for c in obj.users_collection}
        if not (cols & PROXY_COLLECTIONS):
            continue

        upper = obj.name.upper()
        if any(k in upper for k in PROXY_NAME_SKIP):
            skipped.append((obj.name, "name filter"))
            continue

        parts = loose_part_aabbs(obj)
        if not parts:
            skipped.append((obj.name, "no geometry"))
            continue

        kept_any = False
        for idx, (plo, phi) in enumerate(parts):
            height = phi[2] - plo[2]
            footprint = (phi[0] - plo[0]) * (phi[1] - plo[1])
            floor = nearest_floor(plo[2])

            if height < PROXY_MIN_HEIGHT:
                continue
            if footprint < PROXY_MIN_FOOTPRINT:
                continue
            if plo[2] - floor > PROXY_MAX_ABOVE_FLOOR:
                continue

            s = PROXY_SHRINK
            blo = (plo[0] + s, plo[1] + s, plo[2])
            bhi = (phi[0] - s, phi[1] - s, min(phi[2], plo[2] + PROXY_MAX_HEIGHT))
            if bhi[0] <= blo[0] or bhi[1] <= blo[1]:
                continue

            suffix = "" if len(parts) == 1 else f"_p{idx}"
            box = make_box(f"COL_FURN_{obj.name}{suffix}", blo, bhi, mat)
            coll.objects.link(box)
            proxies.append(box.name)
            boxes[box.name] = (blo, bhi)
            kept_any = True

        if not kept_any:
            reason = "all parts flat/small/overhead"
            lo, hi = world_aabb(obj)
            floor = nearest_floor(lo.z)
            if lo.z - floor > PROXY_MAX_ABOVE_FLOOR:
                reason = f"overhead (+{lo.z - floor:.2f} m)"
            elif hi.z - lo.z < PROXY_MIN_HEIGHT:
                reason = f"flat ({hi.z - lo.z:.2f} m)"
            elif (hi.x - lo.x) * (hi.y - lo.y) < PROXY_MIN_FOOTPRINT:
                reason = f"small ({(hi.x - lo.x) * (hi.y - lo.y):.2f} m2)"
            skipped.append((obj.name, reason))

    for name, box in GUARDS.items():
        guard = make_box(name, box[0:3], box[3:6], mat)
        coll.objects.link(guard)
        proxies.append(guard.name)
        boxes[name] = (tuple(box[0:3]), tuple(box[3:6]))

    log(f"build_collision: {len(proxies)} proxies "
        f"({len(proxies) - len(GUARDS)} furniture + {len(GUARDS)} guards), "
        f"{len(skipped)} objects skipped")
    return proxies, skipped, boxes


def stage_room_entries(proxy_boxes):
    """Pick a standing spot inside each room that is clear of furniture.

    The geometric centre of a room is often occupied — the kitchen centre is inside
    the island, the pool room centre is inside the water — and teleporting into a
    collision proxy ejects the player through the slab. So each room gets an entry
    point chosen by sampling its floor for the spot nearest the centre that keeps a
    body's clearance from every proxy box.
    """
    # Tried in order; small rooms such as the walk-in dressing room only satisfy
    # the looser passes. (clearance from furniture, inset from the room's walls)
    RELAXATIONS = ((0.45, 0.55), (0.40, 0.45), (0.34, 0.38), (0.30, 0.30))
    STEP = 0.20

    entries = {}
    for room in ROOMS:
        xmin, ymin, xmax, ymax = room["aabb"]
        floor = room["floor"]
        cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2

        # Proxies that share this storey and could be stood inside.
        obstacles = []
        for name, (blo, bhi) in proxy_boxes.items():
            if bhi[2] < floor + 0.05 or blo[2] > floor + 2.0:
                continue
            obstacles.append((blo[0], blo[1], bhi[0], bhi[1]))

        def clearance(px, py):
            best = 99.0
            for ox0, oy0, ox1, oy1 in obstacles:
                dx = max(ox0 - px, 0.0, px - ox1)
                dy = max(oy0 - py, 0.0, py - oy1)
                best = min(best, math.hypot(dx, dy))
            return best

        best_pt, used = None, None
        for want_clear, inset in RELAXATIONS:
            lo_x, hi_x = xmin + inset, xmax - inset
            lo_y, hi_y = ymin + inset, ymax - inset
            if hi_x < lo_x or hi_y < lo_y:
                continue
            nx = max(1, int((hi_x - lo_x) / STEP) + 1)
            ny = max(1, int((hi_y - lo_y) / STEP) + 1)
            best_score = -1e9
            for i in range(nx):
                px = lo_x + i * STEP if nx > 1 else (lo_x + hi_x) / 2
                for j in range(ny):
                    py = lo_y + j * STEP if ny > 1 else (lo_y + hi_y) / 2
                    if clearance(px, py) < want_clear:
                        continue
                    # Prefer clear, then close to the middle of the room.
                    score = -math.hypot(px - cx, py - cy)
                    if score > best_score:
                        best_score, best_pt = score, (px, py)
            if best_pt is not None:
                used = want_clear
                break

        if best_pt is None:
            log(f"  WARN no clear entry found in {room['id']}, using centre")
            best_pt = (cx, cy)
        elif used is not None and used < RELAXATIONS[0][0]:
            log(f"  note: {room['id']} entry needed relaxed clearance {used:.2f} m")

        entry = [round(best_pt[0], 3), round(best_pt[1], 3), round(floor + 0.05, 3)]
        room["entry"] = entry
        entries[room["id"]] = entry

    log(f"room_entries: resolved {len(entries)} entry points")
    return entries


def stage_collect_doors():
    """Work out each interactive door's hinge, so the viewer can swing it.

    The leaf is a thin slab; the handle sits at the free edge, so the hinge is the
    end of the leaf furthest from the hardware.
    """
    doors = []
    for base in INTERACTIVE_DOORS:
        leaf = bpy.data.objects.get(f"{base}_Leaf")
        if leaf is None:
            log(f"  WARN no leaf for {base}")
            continue
        lo, hi = world_aabb(leaf)
        size = hi - lo
        # The leaf runs along whichever horizontal axis is wider.
        axis = 0 if size.x >= size.y else 1
        span_lo, span_hi = (lo.x, hi.x) if axis == 0 else (lo.y, hi.y)

        hardware = bpy.data.objects.get(f"{base}_Hardware")
        if hardware is not None:
            hlo, hhi = world_aabb(hardware)
            handle = ((hlo.x + hhi.x) / 2) if axis == 0 else ((hlo.y + hhi.y) / 2)
            hinge_at_low = abs(handle - span_hi) < abs(handle - span_lo)
        else:
            hinge_at_low = True

        hinge = [0.0, 0.0, lo.z]
        if axis == 0:
            hinge[0] = span_lo if hinge_at_low else span_hi
            hinge[1] = (lo.y + hi.y) / 2
        else:
            hinge[1] = span_lo if hinge_at_low else span_hi
            hinge[0] = (lo.x + hi.x) / 2

        width = span_hi - span_lo
        # Swing away from the hinge so the leaf sweeps into the room.
        sign = 1.0 if hinge_at_low else -1.0
        if axis == 1:
            sign = -sign

        doors.append({
            "id": base,
            "leaf": f"{base}_Leaf",
            "hardware": f"{base}_Hardware" if hardware else None,
            "hinge": [round(v, 4) for v in hinge],
            "axis": "x" if axis == 0 else "y",
            "width": round(width, 4),
            "height": round(hi.z - lo.z, 4),
            "openAngle": round(sign * math.radians(85.0), 4),
            "center": [round((lo.x + hi.x) / 2, 3),
                       round((lo.y + hi.y) / 2, 3),
                       round(lo.z + 1.0, 3)],
        })
    log(f"collect_doors: {len(doors)} interactive doors")
    return doors


def stage_tag_meshes():
    """Classify every surviving mesh so the viewer knows what to collide with."""
    tags = {}
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        cols = {c.name for c in obj.users_collection}
        if obj.name.startswith("COL_"):
            tags[obj.name] = "proxy"
        elif obj.name.startswith(NO_COLLISION_PREFIXES):
            tags[obj.name] = "none"
        elif cols & STATIC_COLLISION_COLLECTIONS:
            tags[obj.name] = "static"
        else:
            tags[obj.name] = "none"

    # Interactive door leaves are excluded from the static octree — the viewer
    # tests them separately so an open door genuinely lets you through.
    for base in INTERACTIVE_DOORS:
        for suffix in ("_Leaf", "_Hardware"):
            if f"{base}{suffix}" in tags:
                tags[f"{base}{suffix}"] = "door"

    counts = {}
    for v in tags.values():
        counts[v] = counts.get(v, 0) + 1
    log(f"tag_meshes: {counts}")
    return tags


def stage_stats():
    dg = bpy.context.evaluated_depsgraph_get()
    tris = verts = 0
    visual_tris = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        ev = obj.evaluated_get(dg)
        try:
            me = ev.to_mesh()
        except Exception:                                          # noqa: BLE001
            continue
        if me is None:
            continue
        me.calc_loop_triangles()
        n = len(me.loop_triangles)
        tris += n
        verts += len(me.vertices)
        if not obj.name.startswith("COL_"):
            visual_tris += n
        ev.to_mesh_clear()

    tex_bytes = 0
    tex_list = []
    for img in bpy.data.images:
        if img.source != "FILE" or not img.has_data and not img.size[0]:
            continue
        w, h = img.size
        if w and h:
            # Uploaded to the GPU as RGBA8 plus a full mip chain (~1.333x).
            tex_bytes += int(w * h * 4 * 1.3333)
            tex_list.append([img.name, w, h])
    return {
        "total_tris": tris,
        "visual_tris": visual_tris,
        "collision_tris": tris - visual_tris,
        "total_verts": verts,
        "texture_count": len(tex_list),
        "texture_vram_bytes": tex_bytes,
        "texture_vram_mb": round(tex_bytes / (1024 * 1024), 2),
        "textures": tex_list,
        "materials": len(bpy.data.materials),
        "mesh_objects": len([o for o in bpy.data.objects if o.type == "MESH"]),
    }


def stage_export_glb():
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        export_apply=True,              # evaluate any remaining modifiers
        use_selection=False,
        use_visible=False,
        use_renderable=False,
        export_yup=True,                # glTF is Y-up; Blender is Z-up
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )
    size = os.path.getsize(OUT_GLB)
    log(f"export_glb: {OUT_GLB} = {size / 1024 / 1024:.2f} MB")
    return size


# ------------------------------------------------------------------------ main

def main():
    log("=" * 68)
    log(f"source: {bpy.data.filepath}")

    validation = stage_validate()
    clashes = stage_fix_door_clashes()
    stage_apply_modifiers()
    stage_drop_unwanted()
    proxies, skipped, proxy_boxes = stage_build_collision()
    stage_room_entries(proxy_boxes)
    doors = stage_collect_doors()
    tags = stage_tag_meshes()
    stats = stage_stats()
    glb_bytes = stage_export_glb()

    manifest = {
        "generatedFrom": bpy.data.filepath,
        "model": "/models/foakh-penthouse.glb",
        "units": "meters",
        "upAxis": "Y",
        "spawn": SPAWN,
        "floorLevels": list(FLOOR_LEVELS),
        "rooms": ROOMS,
        "doors": doors,
        "collision": tags,
        "proxies": proxies,
        "stats": dict(stats, glb_bytes=glb_bytes,
                      glb_mb=round(glb_bytes / 1024 / 1024, 2)),
        "validation": validation,
        "doorClashesTrimmed": clashes,
        "skippedProxies": [{"object": n, "reason": r} for n, r in skipped],
    }
    os.makedirs(os.path.dirname(OUT_MANIFEST), exist_ok=True)
    with open(OUT_MANIFEST, "w") as fh:
        json.dump(manifest, fh, indent=1)
    log(f"manifest: {OUT_MANIFEST}")
    log(f"stats: {stats['visual_tris']} visual tris + {stats['collision_tris']} collision tris, "
        f"{stats['texture_count']} textures ~{stats['texture_vram_mb']} MB VRAM")
    log("done")
    log("=" * 68)


if __name__ == "__main__":
    main()

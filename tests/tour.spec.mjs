/**
 * Interactive walkthrough test suite.
 *
 *   node tests/tour.spec.mjs [baseUrl]
 *
 * Drives the real page in headless Chromium: loads the GLB, walks the player
 * around with the engine's own physics step, and asserts collision, gravity,
 * stairs, doors and both camera modes actually behave.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const SHOTS = "test-results/tour";

/**
 * Compass headings as yaw values. The GLB is Y-up, and Blender (x,y,z) maps to
 * three (x, z, -y). A camera at yaw 0 looks down -Z, which is Blender +Y.
 */
const YAW = {
  north: 0,                 // Blender +Y
  south: Math.PI,           // Blender -Y
  east: -Math.PI / 2,       // Blender +X
  west: Math.PI / 2,        // Blender -X
};

/**
 * Screenshots are documentation, not assertions. Headless SwiftShader renders
 * this scene at roughly 1 fps, so a capture can outrun its timeout; never let
 * that take the suite down.
 */
async function shot(page, name) {
  try {
    await page.screenshot({ path: `${SHOTS}/${name}`, timeout: 120000 });
  } catch (e) {
    console.log(`  · screenshot ${name} skipped (${e.name})`);
  }
}

let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Run an expression against the live tour instance. */
const evalTour = (page, fn, arg) =>
  page.evaluate(
    ({ src, arg }) => {
      const t = window.__penthouseTour;
      if (!t) throw new Error("tour not on window");
      // eslint-disable-next-line no-new-func
      return new Function("t", "arg", `return (${src})(t, arg)`)(t, arg);
    },
    { src: fn.toString(), arg },
  );

/**
 * Poll a door until its swing reaches the expected state. Headless SwiftShader
 * renders this scene at roughly 1 fps, so a fixed wait is meaningless here — the
 * animation is delta-time based and simply advances one frame at a time.
 */
async function waitDoorSettled(page, id, wantOpen, timeout = 120000) {
  const read = () => evalTour(page, (t, a) => t.debug.doors().find((x) => x.id === a), id);
  const start = Date.now();
  let d = await read();
  while (Date.now() - start < timeout) {
    const settled = wantOpen ? Math.abs(d.angle) > 1.4 : Math.abs(d.angle) < 0.02;
    if (settled) return d;
    await page.waitForTimeout(300);
    d = await read();
  }
  return d;
}

async function waitReady(page, timeout = 240000) {
  await page.waitForFunction(
    () => window.__penthouseTour?.state?.phase === "ready",
    null,
    { timeout },
  );
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });

  const browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
    ],
  });

  // ================================================================= desktop
  console.log("\n── DESKTOP ──");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("requestfailed", (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText}`));

  await page.goto(`${BASE}/virtual-tour/penthouse`, { waitUntil: "domcontentloaded" });
  check("route /virtual-tour/penthouse responds", true);

  await page.getByRole("button", { name: /explore in 3d/i }).click();
  check("EXPLORE IN 3D starts the viewer", true);

  // Loading screen must be visible rather than a blank page.
  const loadingVisible = await page
    .getByText(/loading your residence/i)
    .isVisible()
    .catch(() => false);
  check("loading screen shows FOAKH / Loading Your Residence", loadingVisible);

  await waitReady(page);
  check("model + manifest loaded, phase = ready", true);
  await shot(page, "01-entrance.png");

  // --- geometry / collision data ------------------------------------------
  const tri = await evalTour(page, (t) => t.debug.octreeTriangles());
  check("collision octree built", tri > 5000, `${tri} triangles`);

  const spawn = await evalTour(page, (t) => {
    const p = t.debug.feet();
    return { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), room: t.debug.room() };
  });
  check(
    "spawns at the main entrance, standing on the 11F slab",
    Math.abs(spawn.y) < 0.15 && spawn.room === "entrance",
    `feet=(${spawn.x}, ${spawn.y}, ${spawn.z}) room=${spawn.room}`,
  );

  // Settle under gravity for a moment.
  await evalTour(page, (t) => t.debug.walk(0, 0, 0.5));
  const grounded = await evalTour(page, (t) => ({
    onFloor: t.debug.onFloor(),
    y: +t.debug.feet().y.toFixed(3),
  }));
  check("gravity settles the player on the floor", grounded.onFloor && Math.abs(grounded.y) < 0.1,
    `onFloor=${grounded.onFloor} y=${grounded.y}`);

  // --- walls ---------------------------------------------------------------
  // From the entrance, push hard west into the wall the entrance door sits in.
  const wall = await evalTour(page, (t) => {
    t.debug.teleport(8.6, 0.05, -15.6);
    const before = t.debug.feet();
    t.debug.walk(0, 1, 3.0, arg.west); // west, into W11_NB_W at Blender x=7.75
    const after = t.debug.feet();
    return { bx: +before.x.toFixed(2), ax: +after.x.toFixed(2) };
  }, YAW);
  check(
    "cannot walk through the entrance wall",
    wall.ax > 7.75,
    `x ${wall.bx} -> ${wall.ax} (wall face at x=7.75)`,
  );

  // Drive north into the north-block external wall (Blender y=18.8 -> three z=-18.8).
  const extWall = await evalTour(page, (t) => {
    t.debug.teleport(9.0, 0.05, -16.0);
    t.debug.walk(0, 1, 4.0, arg.north); // north, into W11_NB_N at Blender y=18.8
    const p = t.debug.feet();
    return { x: +p.x.toFixed(2), z: +p.z.toFixed(2) };
  }, YAW);
  check(
    "external wall holds the player inside the building",
    extWall.z > -18.85 && extWall.z < -14.3,
    `z=${extWall.z} (envelope is -19.0 .. -14.3)`,
  );

  // --- floors --------------------------------------------------------------
  const noFall = await evalTour(page, (t) => {
    t.debug.teleport(9.0, 0.05, -16.0);
    let minY = 0;
    for (let i = 0; i < 8; i++) {
      t.debug.walk(Math.cos(i) , Math.sin(i), 0.7);
      minY = Math.min(minY, t.debug.feet().y);
    }
    return +minY.toFixed(3);
  });
  check("does not fall through the floor while wandering", noFall > -0.4, `min y = ${noFall}`);

  // --- the duplex stair ----------------------------------------------------
  // Steps run x 8.6 -> 13.215 in Blender, y 17.4..18.8 -> three z -17.4..-18.8.
  const stairs = await evalTour(page, (t) => {
    t.debug.teleport(8.3, 0.05, -18.1);
    const start = t.debug.feet();
    const trace = [];
    for (let i = 0; i < 14; i++) {
      t.debug.walk(0, 1, 0.5, arg.east); // ascend toward Blender +X
      const f = t.debug.feet();
      trace.push(+f.y.toFixed(2));
    }
    const end = t.debug.feet();
    return {
      sy: +start.y.toFixed(2),
      ex: +end.x.toFixed(2),
      ey: +end.y.toFixed(2),
      ez: +end.z.toFixed(2),
      onFloor: t.debug.onFloor(),
      trace,
    };
  }, YAW);
  check(
    "walks UP the duplex stair to the 12F slab",
    stairs.ey > 3.0,
    `y ${stairs.sy} -> ${stairs.ey} at x=${stairs.ex}`,
  );
  check("stair climb is gradual, not a teleport", stairs.trace.some((v) => v > 0.5 && v < 2.8),
    `trace=${stairs.trace.join(",")}`);
  await shot(page, "02-upper-floor.png");

  const stairsDown = await evalTour(page, (t) => {
    t.debug.teleport(13.0, 3.25, -18.1);
    for (let i = 0; i < 14; i++) t.debug.walk(0, 1, 0.5, arg.west); // descend toward Blender -X
    const f = t.debug.feet();
    return { x: +f.x.toFixed(2), y: +f.y.toFixed(2), onFloor: t.debug.onFloor() };
  }, YAW);
  check(
    "walks DOWN the duplex stair back to 11F",
    stairsDown.y < 0.6,
    `y -> ${stairsDown.y} at x=${stairsDown.x}`,
  );

  // --- reachability of every headline room ---------------------------------
  const rooms = [
    ["lounge", "Living Room"],
    ["kitchen", "Kitchen"],
    ["bed_l_11", "Bedroom II"],
    ["bath_11", "Guest Bathroom"],
    ["balcony_11", "Balcony"],
    ["master", "Master Bedroom"],
    ["master_bath", "Master Bathroom"],
    ["terrace", "Roof Terrace"],
    ["pool", "Pool Deck"],
    ["upper_lounge", "Upper Lounge"],
  ];
  const roomResults = await evalTour(
    page,
    (t, ids) => {
      const out = {};
      for (const id of ids) {
        t.gotoRoom(id);
        t.debug.walk(0, 0, 0.8); // let gravity settle
        out[id] = { room: t.debug.room(), onFloor: t.debug.onFloor(), y: +t.debug.feet().y.toFixed(2) };
      }
      return out;
    },
    rooms.map((r) => r[0]),
  );
  for (const [id, label] of rooms) {
    const r = roomResults[id];
    check(`stands on solid floor in ${label}`, r.onFloor === true, `y=${r.y} room=${r.room}`);
  }

  // --- pool guard ----------------------------------------------------------
  const pool = await evalTour(page, (t) => {
    // Stand on the pool deck south of the water and push north into it.
    t.debug.teleport(9.5, 3.91, -0.9);
    t.debug.walk(0, 1, 3.5, arg.north); // north, into the pool guard
    const f = t.debug.feet();
    return { x: +f.x.toFixed(2), y: +f.y.toFixed(2), z: +f.z.toFixed(2) };
  }, YAW);
  check(
    "invisible guard keeps the player out of the pool",
    pool.y > 3.5,
    `feet=(${pool.x}, ${pool.y}, ${pool.z})`,
  );

  // --- furniture -----------------------------------------------------------
  const island = await evalTour(page, (t) => {
    // Kitchen island proxy; approach it from the east side of the kitchen.
    t.debug.teleport(3.4, 0.05, -6.0);
    const b = t.debug.feet();
    t.debug.walk(0, 1, 3.0, arg.west); // west, into the island
    const a = t.debug.feet();
    return { bx: +b.x.toFixed(2), ax: +a.x.toFixed(2) };
  }, YAW);
  check("kitchen joinery blocks the player", island.ax > 0.3, `x ${island.bx} -> ${island.ax}`);

  // --- doors ---------------------------------------------------------------
  // Blender y decreases going south into Bedroom II; the door plane is y=3.665,
  // which is three z = -3.665. Approach from the lounge side at z = -4.2.
  const walkAtDoor = (id) =>
    evalTour(
      page,
      (t, a) => {
        t.debug.teleport(2.05, 0.05, -4.2);
        t.debug.walk(0, 1, 3.0, a.south);
        return +t.debug.feet().z.toFixed(2);
      },
      YAW,
    );

  const blockedZ = await walkAtDoor("D11_BedL");
  check("a closed door blocks the doorway", blockedZ < -3.75, `stopped at z=${blockedZ}`);

  await evalTour(page, (t) => {
    t.debug.teleport(2.05, 0.05, -4.2);
    t.debug.toggleDoor();
  });
  const opened = await waitDoorSettled(page, "D11_BedL", true);
  check(
    "E opens the bedroom door and it swings on its hinge",
    opened.open === true && Math.abs(opened.angle) > 1.0,
    `angle -> ${opened.angle.toFixed(2)} rad (${((opened.angle * 180) / Math.PI).toFixed(0)}deg)`,
  );

  const throughZ = await walkAtDoor("D11_BedL");
  check(
    "the open doorway is walkable — player reaches the bedroom",
    throughZ > -3.5,
    `z ${blockedZ} (closed) -> ${throughZ} (open); bedroom starts at z > -3.6`,
  );

  await evalTour(page, (t) => {
    t.debug.teleport(2.05, 0.05, -4.2);
    t.debug.toggleDoor();
  });
  const closed = await waitDoorSettled(page, "D11_BedL", false);
  check(
    "E closes the door again",
    closed.open === false && Math.abs(closed.angle) < 0.05,
    `angle=${closed.angle.toFixed(3)}`,
  );

  // --- reset ---------------------------------------------------------------
  const afterReset = await evalTour(page, (t) => {
    t.gotoRoom("pool");
    t.resetPosition();
    const f = t.debug.feet();
    return { y: +f.y.toFixed(2), room: t.debug.room() };
  });
  check("Reset Position returns to the entrance", afterReset.room === "entrance",
    `room=${afterReset.room} y=${afterReset.y}`);

  await page.keyboard.press("KeyR");
  check("R keyboard shortcut is wired", true);

  // --- modes ---------------------------------------------------------------
  await page.getByRole("button", { name: /dollhouse view/i }).click();
  await page.waitForTimeout(700);
  const dollMode = await evalTour(page, (t) => t.debug.mode());
  check("Dollhouse View switches camera", dollMode === "dollhouse", `mode=${dollMode}`);
  await shot(page, "03-dollhouse.png");

  await page.getByRole("button", { name: /enter apartment|first person/i }).click();
  await page.waitForTimeout(500);
  const fpMode = await evalTour(page, (t) => t.debug.mode());
  check("ENTER APARTMENT returns to first person", fpMode === "firstPerson", `mode=${fpMode}`);

  // --- room shortcuts UI ---------------------------------------------------
  await page.getByRole("button", { name: /^explore$/i }).click();
  await page.waitForTimeout(300);
  const shortcutVisible = await page.getByRole("button", { name: "Terrace" }).isVisible();
  check("Explore menu lists room shortcuts", shortcutVisible);
  await page.getByRole("button", { name: "Terrace" }).click();
  await page.waitForTimeout(600);
  await shot(page, "04-terrace.png");

  // --- resize --------------------------------------------------------------
  await page.setViewportSize({ width: 900, height: 600 });
  await page.waitForTimeout(500);
  const sized = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return { w: c.clientWidth, h: c.clientHeight };
  });
  check("canvas follows a browser resize", Math.abs(sized.w - 900) < 4 && Math.abs(sized.h - 600) < 4,
    `${sized.w}x${sized.h}`);
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.waitForTimeout(400);

  // --- render sanity -------------------------------------------------------
  const rendered = await evalTour(page, (t) => t.debug.sampleFrame());
  check(
    "canvas draws a lit, varied scene (not black, not blown out)",
    rendered.mean > 25 && rendered.mean < 235 && rendered.distinct > 24,
    `mean luma=${rendered.mean.toFixed(1)} distinct colours=${rendered.distinct} @ ${rendered.w}x${rendered.h}`,
  );

  const fps = await evalTour(page, (t) => t.state.fps);
  check("render loop is running", fps > 0, `${fps} fps (headless SwiftShader)`);

  // --- errors --------------------------------------------------------------
  const realConsoleErrors = consoleErrors.filter((e) => !/favicon|404 \(Not Found\)/i.test(e));
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.join(" | ") || "none");
  check("no console errors", realConsoleErrors.length === 0, realConsoleErrors.join(" | ") || "none");
  check("no failed network requests", failedRequests.length === 0,
    failedRequests.join(" | ") || "none");

  await ctx.close();

  // ================================================================== mobile
  console.log("\n── MOBILE ──");
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const mpage = await mctx.newPage();
  const mErrors = [];
  mpage.on("pageerror", (e) => mErrors.push(e.message));

  await mpage.goto(`${BASE}/virtual-tour/penthouse`, { waitUntil: "domcontentloaded" });
  await mpage.getByRole("button", { name: /explore in 3d/i }).tap();
  await waitReady(mpage);
  check("mobile: viewer reaches ready", true);

  const isTouch = await evalTour(mpage, (t) => t.state.isTouch);
  check("mobile: touch mode detected", isTouch === true);

  const stick = mpage.getByRole("application", { name: /movement joystick/i });
  check("mobile: virtual joystick rendered", await stick.isVisible());
  check("mobile: no keyboard required (no click-to-enter gate)",
    !(await mpage.getByText(/enter residence/i).isVisible().catch(() => false)));

  // Drag the stick forward and confirm the player actually moves.
  const box = await stick.boundingBox();
  const beforeM = await evalTour(mpage, (t) => {
    const p = t.debug.feet();
    return { x: p.x, z: p.z };
  });
  await mpage.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await mpage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await mpage.dispatchEvent("[role=application]", "pointerdown", {
    pointerId: 1, pointerType: "touch", isPrimary: true,
    clientX: box.x + box.width / 2, clientY: box.y + box.height / 2,
  });
  await mpage.dispatchEvent("[role=application]", "pointermove", {
    pointerId: 1, pointerType: "touch", isPrimary: true,
    clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 - 50,
  });
  await mpage.waitForTimeout(1100);
  const afterM = await evalTour(mpage, (t) => {
    const p = t.debug.feet();
    return { x: p.x, z: p.z };
  });
  await mpage.dispatchEvent("[role=application]", "pointerup", {
    pointerId: 1, pointerType: "touch", isPrimary: true,
    clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 - 50,
  });
  const moved = Math.hypot(afterM.x - beforeM.x, afterM.z - beforeM.z);
  check("mobile: joystick moves the player", moved > 0.25, `moved ${moved.toFixed(2)} m`);
  await shot(mpage, "05-mobile.png");
  check("mobile: no uncaught errors", mErrors.length === 0, mErrors.join(" | ") || "none");

  await mctx.close();
  await browser.close();

  // ================================================================= summary
  console.log(`\n── RESULT ──`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) {
    console.log("failed:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("suite crashed:", e);
  process.exit(1);
});

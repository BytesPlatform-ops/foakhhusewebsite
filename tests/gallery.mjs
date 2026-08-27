/**
 * Visual check: park the camera in every space and capture a clean frame.
 *
 *   node tests/gallery.mjs [baseUrl]
 *
 * Writes test-results/gallery/*.png with the UI hidden. This is how the look of
 * the walkthrough gets reviewed — the physics suite in tour.spec.mjs proves it
 * behaves, this proves it reads as the penthouse.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = "test-results/gallery";

// [name, room id, extra yaw applied after gotoRoom's automatic heading]
const VIEWS = [
  ["01-entrance", null, 0],
  ["02-lounge", "lounge", 0],
  ["03-kitchen", "kitchen", 0],
  ["04-bedroom-ii", "bed_l_11", 0],
  ["05-guest-bath", "bath_11", 0],
  ["06-lift-lobby", "lobby_11", 0],
  ["07-balcony", "balcony_11", -Math.PI / 2],
  ["08-stair-foot", "stair", 0],
  ["09-upper-landing", "upper_hall", 0],
  ["10-upper-lounge", "upper_lounge", 0],
  ["11-master-bedroom", "master", 0],
  ["12-master-bath", "master_bath", 0],
  ["13-terrace", "terrace", 0],
  ["14-pool-deck", "pool", Math.PI],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await page.goto(`${BASE}/virtual-tour/penthouse`, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: /explore in 3d/i }).click();
await page.waitForFunction(() => window.__penthouseTour?.state?.phase === "ready", null, {
  timeout: 240000,
});

// Hide every overlay so the frames show the render, not the HUD.
await page.addStyleTag({ content: "section > *:not(div:first-child) { display: none !important; }" });

for (const [name, room, yawOffset] of VIEWS) {
  await page.evaluate(
    ({ room, yawOffset }) => {
      const t = window.__penthouseTour;
      if (room) t.gotoRoom(room);
      else t.resetPosition();
      if (yawOffset) {
        const cam = t.debug.position();
        void cam;
        t.debug.walk(0, 0, 0.01); // settle on the floor
      }
      t.debug.walk(0, 0, 0.6);
    },
    { room, yawOffset },
  );
  if (yawOffset) {
    await page.evaluate((y) => {
      const t = window.__penthouseTour;
      t.debug.walk(0, 0, 0.01, y);
    }, yawOffset);
  }
  // Let the render loop produce a fresh frame before capturing.
  await page.waitForTimeout(1200);
  try {
    await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 180000 });
    const s = await page.evaluate(() => window.__penthouseTour.debug.sampleFrame());
    console.log(
      `${name.padEnd(20)} luma=${s.mean.toFixed(0).padStart(3)}  colours=${String(s.distinct).padStart(3)}`,
    );
  } catch (e) {
    console.log(`${name}: capture failed (${e.name})`);
  }
}

// Dollhouse last.
await page.evaluate(() => window.__penthouseTour.setMode("dollhouse"));
await page.waitForTimeout(1500);
try {
  await page.screenshot({ path: `${OUT}/15-dollhouse.png`, timeout: 180000 });
  console.log("15-dollhouse         captured");
} catch (e) {
  console.log(`dollhouse: capture failed (${e.name})`);
}

await browser.close();
